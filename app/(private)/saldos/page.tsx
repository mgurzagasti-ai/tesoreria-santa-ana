import Link from "next/link";
import { buildBalanceRows } from "@/lib/balances";
import { prisma } from "@/lib/prisma";
import {
  formatCurrencyFromCents,
  formatSignedCurrencyFromCents,
  getBalanceLabel,
  getMonthName,
  getMovementCategoryLabel,
  getSignedAmountCents,
} from "@/lib/utils";

type SearchParams = Promise<{
  employeeId?: string;
  legajo?: string;
  status?: string;
  month?: string;
  year?: string;
  from?: string;
  to?: string;
  all?: string;
  printLegajos?: string;
  printFromLegajo?: string;
  printToLegajo?: string;
}>;

export const dynamic = "force-dynamic";

export default async function BalancesPage({
  searchParams,
}: {
  searchParams: SearchParams;
}) {
  const params = await searchParams;
  const selectedEmployeeId = params.employeeId ?? "";
  const legajoQuery = params.legajo?.trim() ?? "";
  const selectedStatus =
    params.status === "ALL"
      ? "ALL"
      : params.status === "ACTIVE" || params.status === "INACTIVE"
        ? params.status
        : "ACTIVE";
  const selectedMonth = params.month ?? "";
  const selectedYear = params.year ?? "";
  const from = params.from ?? "";
  const to = params.to ?? "";
  const showAll = params.all === "1";
  const printLegajos = params.printLegajos?.trim() ?? "";
  const printFromLegajo = params.printFromLegajo?.trim() ?? "";
  const printToLegajo = params.printToLegajo?.trim() ?? "";
  const employees = await prisma.employee.findMany({
    where: {
      ...(legajoQuery
        ? {
            legajo: {
              contains: legajoQuery,
            },
          }
        : {}),
      ...(selectedStatus !== "ALL" ? { status: selectedStatus } : {}),
    },
    orderBy: [{ legajo: "asc" }],
    select: {
      id: true,
      legajo: true,
      apellido: true,
      nombre: true,
      status: true,
      openingBalanceCents: true,
    },
  });
  const derivedFrom =
    selectedMonth && selectedYear
      ? `${selectedYear}-${selectedMonth.padStart(2, "0")}-01`
      : from;
  const derivedTo =
    selectedMonth && selectedYear
      ? new Date(Number(selectedYear), Number(selectedMonth), 0).toISOString().slice(0, 10)
      : to;
  const employeeIds = employees.map((employee) => employee.id);

  const selectedEmployee = selectedEmployeeId
    ? await prisma.employee.findUnique({
        where: { id: selectedEmployeeId },
        select: {
          id: true,
          legajo: true,
          apellido: true,
          nombre: true,
          status: true,
          openingBalanceCents: true,
        },
      })
    : null;
  const visibleSelectedEmployee =
    selectedEmployee && (selectedStatus === "ALL" || selectedEmployee.status === selectedStatus)
      ? selectedEmployee
      : null;

  const movements =
    selectedEmployeeId && visibleSelectedEmployee
      ? await prisma.movement.findMany({
        where: {
          employeeId: selectedEmployeeId,
          movementDate: {
            gte: derivedFrom ? new Date(derivedFrom) : undefined,
            lte: derivedTo ? new Date(`${derivedTo}T23:59:59.999`) : undefined,
          },
        },
        orderBy: [{ movementDate: "asc" }, { createdAt: "asc" }],
      })
      : [];
  const allEmployeeMovements =
    showAll && employeeIds.length > 0
      ? await prisma.movement.findMany({
          where: {
            employeeId: {
              in: employeeIds,
            },
            movementDate: {
              gte: derivedFrom ? new Date(derivedFrom) : undefined,
              lte: derivedTo ? new Date(`${derivedTo}T23:59:59.999`) : undefined,
            },
          },
          select: {
            employeeId: true,
            type: true,
            amountCents: true,
          },
        })
      : [];

  const rows = buildBalanceRows(movements, visibleSelectedEmployee?.openingBalanceCents ?? 0);
  const displayRows = [...rows].reverse();
  const openingBalanceCents = visibleSelectedEmployee?.openingBalanceCents ?? 0;
  const incomeCents = rows.reduce(
    (total, row) => total + (row.signedAmountCents > 0 ? row.signedAmountCents : 0),
    0,
  );
  const deductionCents = rows.reduce(
    (total, row) => total + (row.signedAmountCents < 0 ? Math.abs(row.signedAmountCents) : 0),
    0,
  );
  const netPeriodCents = incomeCents - deductionCents;
  const finalBalanceCents =
    rows.at(-1)?.runningBalanceCents ?? openingBalanceCents;
  const balanceByEmployee = new Map<string, number>();

  for (const employee of employees) {
    balanceByEmployee.set(employee.id, employee.openingBalanceCents);
  }

  for (const movement of allEmployeeMovements) {
    balanceByEmployee.set(
      movement.employeeId,
      (balanceByEmployee.get(movement.employeeId) ?? 0) + getSignedAmountCents(movement),
    );
  }

  const employeeBalanceRows = showAll
    ? employees
        .map((employee) => ({
          ...employee,
          balanceCents: balanceByEmployee.get(employee.id) ?? 0,
        }))
        .sort((a, b) => a.legajo.localeCompare(b.legajo, "es", { numeric: true }))
    : [];

  return (
    <section className="stack-lg">
      <div className="split-heading">
        <div>
          <p className="eyebrow section-eyebrow">Saldos</p>
          <h2>Consulta de saldos del personal</h2>
          <p className="muted">
            Visualiza el detalle de haberes y descuentos por empleado, con saldo corrido e impresion
            de resumen.
          </p>
        </div>
      </div>

      <form className="panel filters-panel">
        <div className="filters-grid">
          <label className="field">
            <span>Legajo</span>
            <input name="legajo" defaultValue={legajoQuery} placeholder="Ingresar legajo" />
          </label>

          <label className="field">
            <span>Empleado</span>
            <select name="employeeId" defaultValue={selectedEmployeeId}>
              <option value="">Selecciona un empleado</option>
              {employees.map((employee) => (
                <option key={employee.id} value={employee.id}>
                  {employee.legajo} - {employee.apellido}, {employee.nombre}
                </option>
              ))}
            </select>
          </label>

          <label className="field">
            <span>Estado</span>
            <select name="status" defaultValue={selectedStatus}>
              <option value="ALL">Todos</option>
              <option value="ACTIVE">Activos</option>
              <option value="INACTIVE">Dados de baja</option>
            </select>
          </label>

          <label className="field">
            <span>Mes</span>
            <select name="month" defaultValue={selectedMonth}>
              <option value="">Todos</option>
              {Array.from({ length: 12 }, (_, index) => {
                const value = String(index + 1).padStart(2, "0");

                return (
                  <option key={value} value={value}>
                    {getMonthName(index + 1)}
                  </option>
                );
              })}
            </select>
          </label>

          <label className="field">
            <span>Anio</span>
            <input type="number" name="year" min="2020" max="2100" defaultValue={selectedYear} />
          </label>

          <label className="field">
            <span>Desde</span>
            <input type="date" name="from" defaultValue={from} />
          </label>

          <label className="field">
            <span>Hasta</span>
            <input type="date" name="to" defaultValue={to} />
          </label>

          <div className="filters-actions">
            <button className="button primary" type="submit">
              Consultar
            </button>
            <Link
              className="button primary"
              href={{
                pathname: "/saldos",
                query: {
                  all: "1",
                  ...(legajoQuery ? { legajo: legajoQuery } : {}),
                  ...(selectedStatus !== "ACTIVE" ? { status: selectedStatus } : {}),
                  ...(selectedMonth ? { month: selectedMonth } : {}),
                  ...(selectedYear ? { year: selectedYear } : {}),
                  ...(from ? { from } : {}),
                  ...(to ? { to } : {}),
                },
              }}
            >
              Ver todos
            </Link>
          </div>
        </div>

        <div className="print-selection-grid">
          <label className="field">
            <span>Legajos para imprimir</span>
            <input
              name="printLegajos"
              defaultValue={printLegajos}
              placeholder="Ej: 009, 021, 118"
            />
          </label>

          <label className="field">
            <span>Rango desde</span>
            <input
              name="printFromLegajo"
              defaultValue={printFromLegajo}
              placeholder="Legajo inicial"
            />
          </label>

          <label className="field">
            <span>Rango hasta</span>
            <input
              name="printToLegajo"
              defaultValue={printToLegajo}
              placeholder="Legajo final"
            />
          </label>

          <div className="filters-actions">
            <button
              className="button ghost"
              type="submit"
              formAction="/saldos/imprimir-multiple"
              formMethod="get"
            >
              Imprimir seleccion
            </button>
          </div>
        </div>
      </form>

      {visibleSelectedEmployee ? (
        <>
          <div className="employees-summary">
            <div className="panel summary-card">
              <p className="summary-label">Empleado</p>
              <strong className="summary-value">{visibleSelectedEmployee.legajo}</strong>
            </div>
            <div className="panel summary-card">
              <p className="summary-label">Saldo de arranque</p>
              <strong className="summary-value">{formatSignedCurrencyFromCents(openingBalanceCents)}</strong>
            </div>
            <div className="panel summary-card">
              <p className="summary-label">Haberes que suman</p>
              <strong className="summary-value positive-text">{formatCurrencyFromCents(incomeCents)}</strong>
            </div>
            <div className="panel summary-card">
              <p className="summary-label">Descuentos que restan</p>
              <strong className="summary-value negative-text">{formatCurrencyFromCents(deductionCents)}</strong>
            </div>
            <div className="panel summary-card">
              <p className="summary-label">Neto del periodo</p>
              <strong className={`summary-value ${netPeriodCents < 0 ? "negative-text" : "positive-text"}`}>
                {formatSignedCurrencyFromCents(netPeriodCents)}
              </strong>
            </div>
            <div className="panel summary-card">
              <p className="summary-label">{getBalanceLabel(finalBalanceCents)}</p>
              <strong className={`summary-value ${finalBalanceCents < 0 ? "negative-text" : "positive-text"}`}>
                {formatSignedCurrencyFromCents(finalBalanceCents)}
              </strong>
            </div>
          </div>

          <section className="panel data-panel">
            <div className="panel-head">
              <div>
                <p className="eyebrow section-eyebrow">Detalle</p>
                <h3>
                  {visibleSelectedEmployee.apellido}, {visibleSelectedEmployee.nombre}
                </h3>
              </div>
              <Link
                className="button ghost"
                href={`/saldos/${visibleSelectedEmployee.id}/imprimir?month=${selectedMonth}&year=${selectedYear}&from=${derivedFrom}&to=${derivedTo}`}
              >
                Exportar / imprimir PDF
              </Link>
            </div>

            <div className="table-wrap">
              <table>
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
                  {displayRows.length === 0 ? (
                    <tr>
                      <td colSpan={8} className="empty-row">
                        No hay movimientos en el rango seleccionado.
                      </td>
                    </tr>
                  ) : (
                    displayRows.map((row) => (
                      <tr key={row.id}>
                        <td>{row.movementDate.toISOString().slice(0, 10)}</td>
                        <td>{row.code ?? "-"}</td>
                        <td className={row.signedAmountCents < 0 ? "negative-text" : undefined}>
                          {getMovementCategoryLabel(row.category)} - {row.concept}
                        </td>
                        <td>{row.voucherNumber ?? "-"}</td>
                        <td>{row.periodMonth}</td>
                        <td>{row.periodYear}</td>
                        <td>{formatSignedCurrencyFromCents(row.signedAmountCents)}</td>
                        <td>{formatSignedCurrencyFromCents(row.runningBalanceCents)}</td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            </div>
          </section>
        </>
      ) : showAll ? (
        <>
          <div className="employees-summary">
            <div className="panel summary-card">
              <p className="summary-label">Empleados visibles</p>
              <strong className="summary-value">{employeeBalanceRows.length}</strong>
            </div>
            <div className="panel summary-card">
              <p className="summary-label">Con saldo</p>
              <strong className="summary-value">
                {employeeBalanceRows.filter((employee) => employee.balanceCents !== 0).length}
              </strong>
            </div>
            <div className="panel summary-card">
              <p className="summary-label">Sin saldo</p>
              <strong className="summary-value">
                {employeeBalanceRows.filter((employee) => employee.balanceCents === 0).length}
              </strong>
            </div>
          </div>

          <section className="panel data-panel">
            <div className="panel-head">
              <div>
                <p className="eyebrow section-eyebrow">Listado</p>
                <h3>Todos los empleados y sus saldos</h3>
              </div>
            </div>

            <div className="table-wrap">
              <table className="balances-list-table">
                <thead>
                  <tr>
                    <th className="col-legajo">Legajo</th>
                    <th className="col-empleado">Empleado</th>
                    <th className="col-saldo">Saldo</th>
                    <th className="col-situacion">Situacion</th>
                    <th className="col-accion">Accion</th>
                  </tr>
                </thead>
                <tbody>
                  {employeeBalanceRows.length === 0 ? (
                    <tr>
                      <td colSpan={5} className="empty-row">
                        No se encontraron empleados para el filtro seleccionado.
                      </td>
                    </tr>
                  ) : (
                    employeeBalanceRows.map((employee) => (
                      <tr key={employee.id}>
                        <td className="col-legajo">{employee.legajo}</td>
                        <td className="col-empleado">
                          {employee.apellido}, {employee.nombre}
                        </td>
                        <td
                          className={`col-saldo ${employee.balanceCents < 0 ? "negative-text" : ""}`.trim()}
                        >
                          {formatSignedCurrencyFromCents(employee.balanceCents)}
                        </td>
                        <td
                          className={`col-situacion ${employee.balanceCents < 0 ? "negative-text" : ""}`.trim()}
                        >
                          {getBalanceLabel(employee.balanceCents)}
                        </td>
                        <td className="col-accion">
                          <Link
                            className="button tiny ghost"
                            href={{
                              pathname: "/saldos",
                              query: {
                                employeeId: employee.id,
                                ...(legajoQuery ? { legajo: legajoQuery } : {}),
                                ...(selectedStatus !== "ACTIVE" ? { status: selectedStatus } : {}),
                                ...(selectedMonth ? { month: selectedMonth } : {}),
                                ...(selectedYear ? { year: selectedYear } : {}),
                                ...(from ? { from } : {}),
                                ...(to ? { to } : {}),
                              },
                            }}
                          >
                            Ver detalle
                          </Link>
                        </td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            </div>
          </section>
        </>
      ) : (
        <section className="panel empty-state-panel">
          <h3>Selecciona un empleado para consultar saldos</h3>
          <p className="muted">
            Desde esta seccion podras controlar haberes, anticipos, vales y el importe neto a cobrar.
            Tambien podes usar "Ver todos" para listar el padron completo con sus saldos.
          </p>
        </section>
      )}
    </section>
  );
}
