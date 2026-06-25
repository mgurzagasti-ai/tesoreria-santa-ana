import { ExcelImportForm } from "@/components/haberes/excel-import-form";
import { prisma } from "@/lib/prisma";
import { formatCurrencyFromCents, getMonthName } from "@/lib/utils";

export const dynamic = "force-dynamic";

export default async function HaberesPage() {
  const today = new Date();
  const [employees, movements] = await Promise.all([
    prisma.employee.findMany({
      where: { status: "ACTIVE" },
      orderBy: [{ apellido: "asc" }, { nombre: "asc" }],
      select: { id: true, legajo: true, apellido: true, nombre: true },
    }),
    prisma.movement.findMany({
      where: {
        movementDate: {
          lte: today,
        },
      },
      orderBy: [{ movementDate: "desc" }, { createdAt: "desc" }],
      take: 12,
      include: {
        employee: {
          select: { legajo: true, apellido: true, nombre: true },
        },
      },
    }),
  ]);

  const salaryCount = movements.filter(
    (movement) => movement.category === "SALARY" || movement.category === "SAC",
  ).length;
  const discountCount = movements.filter(
    (movement) => movement.category === "ADVANCE" || movement.category === "VALE",
  ).length;

  return (
    <section className="stack-lg">
      <div className="split-heading">
        <div>
          <p className="eyebrow section-eyebrow">Haberes</p>
          <h2>Carga de haberes del personal</h2>
        </div>
      </div>

      <div className="employees-summary">
        <div className="panel summary-card">
          <p className="summary-label">Empleados activos</p>
          <strong className="summary-value">{employees.length}</strong>
        </div>
        <div className="panel summary-card">
          <p className="summary-label">Haberes / descuentos</p>
          <strong className="summary-value">
            {salaryCount} / {discountCount}
          </strong>
        </div>
      </div>

      <div className="content-grid">
        <section className="panel data-panel">
          <div className="panel-head">
            <div>
              <p className="eyebrow section-eyebrow">Recientes</p>
              <h3>Ultimas cargas de haberes</h3>
            </div>
          </div>

          <div className="table-wrap">
            <table>
              <thead>
                <tr>
                  <th>Fecha</th>
                  <th>Legajo</th>
                  <th>Empleado</th>
                  <th>Concepto</th>
                  <th>Periodo</th>
                  <th>Importe</th>
                </tr>
              </thead>
              <tbody>
                {movements.length === 0 ? (
                  <tr>
                    <td colSpan={6} className="empty-row">
                      No hay haberes cargados todavia.
                    </td>
                  </tr>
                ) : (
                  movements.map((movement) => (
                    <tr key={movement.id}>
                      <td>{movement.movementDate.toISOString().slice(0, 10)}</td>
                      <td>{movement.employee.legajo}</td>
                      <td>
                        {movement.employee.apellido}, {movement.employee.nombre}
                      </td>
                      <td className={movement.type === "DEBIT" ? "negative-text" : undefined}>
                        {movement.concept}
                      </td>
                      <td>
                        {getMonthName(movement.periodMonth)} {movement.periodYear}
                      </td>
                      <td>{formatCurrencyFromCents(movement.amountCents)}</td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </section>

        <ExcelImportForm />
      </div>
    </section>
  );
}
