import { ExcelImportForm } from "@/components/haberes/excel-import-form";
import { prisma } from "@/lib/prisma";

export const dynamic = "force-dynamic";

export default async function HaberesPage() {
  const [employees, concepts, salaryCount, discountCount] = await Promise.all([
    prisma.employee.findMany({
      where: { status: "ACTIVE" },
      orderBy: [{ apellido: "asc" }, { nombre: "asc" }],
      select: { id: true, legajo: true, apellido: true, nombre: true },
    }),
    prisma.concept.findMany({
      where: { status: "ACTIVE" },
      orderBy: [{ impact: "asc" }, { code: "asc" }],
      select: { id: true, code: true, description: true, impact: true },
    }),
    prisma.movement.count({
      where: {
        category: { in: ["SALARY", "SAC"] },
      },
    }),
    prisma.movement.count({
      where: {
        category: { in: ["ADVANCE", "VALE", "ADJUSTMENT_DEBIT"] },
      },
    }),
  ]);

  return (
    <section className="stack-lg">
      <div className="split-heading">
        <div>
          <p className="eyebrow section-eyebrow">Haberes</p>
          <h2>Carga de haberes del personal</h2>
          <p className="muted">
            Importa el Excel desde la pestana correcta. En cada carga eliges el concepto y el archivo
            solo necesita legajo, apellido y nombre, y monto.
          </p>
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

      <div className="haberes-import-shell">
        <ExcelImportForm concepts={concepts} employees={employees} />
      </div>
    </section>
  );
}
