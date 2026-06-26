import Link from "next/link";
import { PrintButton } from "@/components/saldos/print-button";
import { buildBalanceRows } from "@/lib/balances";
import { prisma } from "@/lib/prisma";
import {
  formatSignedCurrencyFromCents,
  getBalanceLabel,
  getMovementDisplayLabel,
  getMonthName,
} from "@/lib/utils";

type SearchParams = Promise<{
  status?: string;
  month?: string;
  year?: string;
  from?: string;
  to?: string;
  printLegajos?: string;
  printFromLegajo?: string;
  printToLegajo?: string;
}>;

type EmployeeWithMovements = {
  id: string;
  legajo: string;
  apellido: string;
  nombre: string;
  openingBalanceCents: number;
  movements: Array<{
    id: string;
    type: string;
    category: string;
    code: string | null;
    concept: string;
    voucherNumber: string | null;
    movementDate: Date;
    periodMonth: number;
    periodYear: number;
    amountCents: number;
  }>;
};

function normalizeLegajo(value: string) {
  const digits = value.replace(/\D/g, "");
  return digits ? digits.padStart(3, "0") : "";
}

function parseLegajoSelection(listText: string, fromText: string, toText: string) {
  const parsedList = listText
    .split(/[,\s;]+/)
    .map((item) => normalizeLegajo(item))
    .filter(Boolean);

  const from = normalizeLegajo(fromText);
  const to = normalizeLegajo(toText);
  const selected = new Set(parsedList);

  return {
    selected,
    from,
    to,
    hasSelection: parsedList.length > 0 || Boolean(from) || Boolean(to),
  };
}

function chunkEmployees<T>(items: T[], size: number) {
  const chunks: T[][] = [];

  for (let index = 0; index < items.length; index += size) {
    chunks.push(items.slice(index, index + size));
  }

  return chunks;
}

function buildEmployeeSummary(employee: EmployeeWithMovements) {
  const rows = buildBalanceRows(employee.movements, employee.openingBalanceCents);
  const finalBalanceCents = rows.at(-1)?.runningBalanceCents ?? employee.openingBalanceCents;

  return {
    rows,
    finalBalanceCents,
    movementCount: employee.movements.length,
  };
}

export const dynamic = "force-dynamic";

export default async function PrintableMultipleBalancesPage({
  searchParams,
}: {
  searchParams: SearchParams;
}) {
  const query = await searchParams;
  const month = query.month ?? "";
  const year = query.year ?? "";
  const from = query.from ?? "";
  const to = query.to ?? "";
  const status =
    query.status === "ALL"
      ? "ALL"
      : query.status === "ACTIVE" || query.status === "INACTIVE"
        ? query.status
        : "ACTIVE";
  const printLegajos = query.printLegajos?.trim() ?? "";
  const printFromLegajo = query.printFromLegajo?.trim() ?? "";
  const printToLegajo = query.printToLegajo?.trim() ?? "";
  const derivedFrom =
    month && year ? `${year}-${month.padStart(2, "0")}-01` : from;
  const derivedTo =
    month && year ? new Date(Number(year), Number(month), 0).toISOString().slice(0, 10) : to;
  const printablePeriod =
    month && year ? `${getMonthName(Number(month))} ${year}` : `${derivedFrom || "-"} al ${derivedTo || "-"}`;

  const selection = parseLegajoSelection(printLegajos, printFromLegajo, printToLegajo);
  let employees: EmployeeWithMovements[] = [];

  if (selection.hasSelection) {
    employees = await prisma.employee.findMany({
      where: {
        ...(status !== "ALL" ? { status } : {}),
        OR: [
          ...(selection.selected.size > 0
            ? [
                {
                  legajo: {
                    in: [...selection.selected],
                  },
                },
              ]
            : []),
          ...(selection.from || selection.to
            ? [
                {
                  legajo: {
                    gte: selection.from || undefined,
                    lte: selection.to || undefined,
                  },
                },
              ]
            : []),
        ],
      },
      orderBy: [{ legajo: "asc" }],
      include: {
        movements: {
          where: {
            movementDate: {
              gte: derivedFrom ? new Date(derivedFrom) : undefined,
              lte: derivedTo ? new Date(`${derivedTo}T23:59:59.999`) : undefined,
            },
          },
          orderBy: [{ movementDate: "asc" }, { createdAt: "asc" }],
        },
      },
    });
  }

  const sheets = chunkEmployees(employees, 2);

  return (
    <section className="print-shell multi-print-shell">
      <div className="print-toolbar no-print">
        <Link
          href={`/saldos?status=${status}&month=${month}&year=${year}&from=${from}&to=${to}&printLegajos=${encodeURIComponent(printLegajos)}&printFromLegajo=${printFromLegajo}&printToLegajo=${printToLegajo}`}
          className="button ghost"
        >
          Volver a saldos
        </Link>
        <PrintButton />
      </div>

      {employees.length === 0 ? (
        <article className="print-report">
          <header className="report-header">
            <div className="report-brand">SANTA ANA S.R.L.</div>
            <div>
              <h1>Impresion multiple de saldos</h1>
              <p className="report-subtitle">No se encontraron legajos para imprimir.</p>
            </div>
            <div className="report-range">
              <span>Periodo: {printablePeriod}</span>
            </div>
          </header>

          <p className="muted">
            Ingresa una lista de legajos como `009, 021, 118` o completa un rango desde/hasta.
          </p>
        </article>
      ) : (
        sheets.map((sheet, index) => (
          <article key={index} className="print-sheet multi-print-sheet">
            {sheet.map((employee) => {
              const summary = buildEmployeeSummary(employee);

              return (
                <section key={employee.id} className="print-detail-card">
                  <header className="print-detail-header">
                    <div>
                      <p className="compact-report-eyebrow">Detalle</p>
                      <h2>
                        {employee.legajo} - {employee.apellido}, {employee.nombre}
                      </h2>
                    </div>
                    <div className="compact-report-meta">
                      <span>Periodo: {printablePeriod}</span>
                      <span>Movimientos en rango: {summary.movementCount}</span>
                    </div>
                  </header>

                  <table className="print-detail-table">
                    <thead>
                      <tr>
                        <th>Fecha</th>
                        <th>Codigo</th>
                        <th>Concepto</th>
                        <th>Mes</th>
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
                        <td>{formatSignedCurrencyFromCents(employee.openingBalanceCents)}</td>
                        <td>{formatSignedCurrencyFromCents(employee.openingBalanceCents)}</td>
                      </tr>
                      {summary.rows.map((row) => (
                        <tr key={row.id}>
                          <td>{row.movementDate.toISOString().slice(0, 10)}</td>
                          <td>{row.code ?? "-"}</td>
                          <td>
                            {getMovementDisplayLabel(row.category, row.concept)}
                          </td>
                          <td>
                            {getMonthName(row.periodMonth)} {row.periodYear}
                          </td>
                          <td>{formatSignedCurrencyFromCents(row.signedAmountCents)}</td>
                          <td>{formatSignedCurrencyFromCents(row.runningBalanceCents)}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>

                  <footer className="compact-report-footer">
                    {getBalanceLabel(summary.finalBalanceCents)}:
                    {" "}
                    {formatSignedCurrencyFromCents(summary.finalBalanceCents)}
                  </footer>
                </section>
              );
            })}
          </article>
        ))
      )}
    </section>
  );
}
