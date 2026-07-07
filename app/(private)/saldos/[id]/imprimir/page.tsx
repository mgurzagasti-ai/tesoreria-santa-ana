import Link from "next/link";
import { notFound } from "next/navigation";
import { PrintButton } from "@/components/saldos/print-button";
import { buildBalanceRows } from "@/lib/balances";
import { prisma } from "@/lib/prisma";
import {
  formatSignedCurrencyFromCents,
  getMovementDisplayLabel,
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
  const finalBalanceCents = rows.at(-1)?.runningBalanceCents ?? openingBalanceCents;

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
            <h1 className="report-title">Detalle de movimientos y saldos</h1>
            <p className="report-subtitle">
              {employee.legajo} - {employee.apellido}, {employee.nombre}
            </p>
          </div>
        </header>

        <table className="report-table">
          <thead>
            <tr>
              <th>Fecha</th>
              <th>Concepto</th>
              <th>Nro. vale</th>
              <th>Mes</th>
              <th>Año</th>
              <th>Importe</th>
              <th>Saldo</th>
            </tr>
          </thead>
          <tbody>
            {rows.map((row) => (
              <tr key={row.id}>
                <td>{row.movementDate.toISOString().slice(0, 10)}</td>
                <td>
                  {getMovementDisplayLabel(row.category, row.concept)}
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
