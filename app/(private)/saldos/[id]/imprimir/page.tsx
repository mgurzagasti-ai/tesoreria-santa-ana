import Link from "next/link";
import { notFound } from "next/navigation";
import { PrintButton } from "@/components/saldos/print-button";
import { buildBalanceRows } from "@/lib/balances";
import { prisma } from "@/lib/prisma";
import {
  formatCurrencyFromCents,
  formatSignedCurrencyFromCents,
  getBalanceLabel,
  getMovementCategoryLabel,
  getMonthName,
} from "@/lib/utils";

type Params = Promise<{ id: string }>;
type SearchParams = Promise<{ month?: string; year?: string; from?: string; to?: string }>;

export const dynamic = "force-dynamic";

export default async function PrintableBalancePage({
  params,
  searchParams,
}: {
  params: Params;
  searchParams: SearchParams;
}) {
  const { id } = await params;
  const query = await searchParams;
  const month = query.month ?? "";
  const year = query.year ?? "";
  const from = query.from ?? "";
  const to = query.to ?? "";

  const employee = await prisma.employee.findUnique({
    where: { id },
    select: { id: true, legajo: true, apellido: true, nombre: true, openingBalanceCents: true },
  });

  if (!employee) {
    notFound();
  }

  const movements = await prisma.movement.findMany({
    where: {
      employeeId: id,
      movementDate: {
        gte: from ? new Date(from) : undefined,
        lte: to ? new Date(`${to}T23:59:59.999`) : undefined,
      },
    },
    orderBy: [{ movementDate: "asc" }, { createdAt: "asc" }],
  });

  const rows = buildBalanceRows(movements, employee.openingBalanceCents);
  const openingBalanceCents = employee.openingBalanceCents;
  const incomeCents = rows.reduce(
    (total, row) => total + (row.signedAmountCents > 0 ? row.signedAmountCents : 0),
    0,
  );
  const deductionCents = rows.reduce(
    (total, row) => total + (row.signedAmountCents < 0 ? Math.abs(row.signedAmountCents) : 0),
    0,
  );
  const netPeriodCents = incomeCents - deductionCents;
  const finalBalanceCents = rows.at(-1)?.runningBalanceCents ?? openingBalanceCents;
  const printablePeriod =
    month && year ? `${getMonthName(Number(month))} ${year}` : `${from || "-"} al ${to || "-"}`;

  return (
    <section className="print-shell">
      <div className="print-toolbar no-print">
        <Link
          href={`/saldos?employeeId=${id}&month=${month}&year=${year}&from=${from}&to=${to}`}
          className="button ghost"
        >
          Volver a saldos
        </Link>
        <PrintButton />
      </div>

      <article className="print-report">
        <header className="report-header">
          <div className="report-brand">SANTA ANA S.R.L.</div>
          <div>
            <h1>Detalle de movimientos y saldos</h1>
            <p className="report-subtitle">
              {employee.legajo} - {employee.apellido}, {employee.nombre}
            </p>
            <p className="report-subtitle">Periodo: {printablePeriod}</p>
          </div>
          <div className="report-range">
            <span>Desde: {from || "-"}</span>
            <span>Hasta: {to || "-"}</span>
            <span>{getBalanceLabel(finalBalanceCents)}: {formatSignedCurrencyFromCents(finalBalanceCents)}</span>
          </div>
        </header>

        <section className="print-summary">
          <div className="print-summary-card">
            <span>Saldo de arranque</span>
            <strong>{formatSignedCurrencyFromCents(openingBalanceCents)}</strong>
          </div>
          <div className="print-summary-card">
            <span>Haberes que suman</span>
            <strong>{formatCurrencyFromCents(incomeCents)}</strong>
          </div>
          <div className="print-summary-card">
            <span>Descuentos que restan</span>
            <strong>{formatCurrencyFromCents(deductionCents)}</strong>
          </div>
          <div className="print-summary-card">
            <span>Neto del periodo</span>
            <strong>{formatSignedCurrencyFromCents(netPeriodCents)}</strong>
          </div>
        </section>

        <table className="report-table">
          <thead>
            <tr>
              <th>Fecha</th>
              <th>Codigo</th>
              <th>Concepto</th>
              <th>Nro. vale</th>
              <th>Mes</th>
              <th>Anio</th>
              <th>Importe</th>
              <th>Saldo</th>
            </tr>
          </thead>
          <tbody>
            <tr>
              <td>-</td>
              <td>-</td>
              <td>Saldo de arranque</td>
              <td>-</td>
              <td>-</td>
              <td>-</td>
              <td>{formatSignedCurrencyFromCents(openingBalanceCents)}</td>
              <td>{formatSignedCurrencyFromCents(openingBalanceCents)}</td>
            </tr>
            {rows.map((row) => (
              <tr key={row.id}>
                <td>{row.movementDate.toISOString().slice(0, 10)}</td>
                <td>{row.code ?? "-"}</td>
                <td>
                  {getMovementCategoryLabel(row.category)} {row.concept}
                </td>
                <td>{row.voucherNumber ?? "-"}</td>
                <td>{getMonthName(row.periodMonth)}</td>
                <td>{row.periodYear}</td>
                <td>{formatSignedCurrencyFromCents(row.signedAmountCents)}</td>
                <td>{formatSignedCurrencyFromCents(row.runningBalanceCents)}</td>
              </tr>
            ))}
          </tbody>
        </table>

        <footer className="report-footer">
          <span>Saldo final: {formatSignedCurrencyFromCents(finalBalanceCents)}</span>
          <span className="page-number">Pagina </span>
        </footer>
      </article>
    </section>
  );
}
