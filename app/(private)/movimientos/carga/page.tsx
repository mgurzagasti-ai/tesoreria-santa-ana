import { MovementForm } from "@/components/movements/movement-form";
import { prisma } from "@/lib/prisma";

export const dynamic = "force-dynamic";

export default async function MovementLoadPage() {
  const employees = await prisma.employee.findMany({
    where: { status: "ACTIVE" },
    orderBy: [{ apellido: "asc" }, { nombre: "asc" }],
    select: { id: true, legajo: true, apellido: true, nombre: true },
  });

  return (
    <section className="stack-lg">
      <div className="split-heading">
        <div>
          <p className="eyebrow section-eyebrow">Carga manual</p>
          <h2>Carga de haberes y descuentos</h2>
          <p className="muted">
            Registra haberes, anticipos, vales, SAC y otros movimientos manualmente por legajo.
          </p>
        </div>
      </div>

      <div className="single-panel-wrap">
        <MovementForm employees={employees} />
      </div>
    </section>
  );
}
