import Link from "next/link";
import { prisma } from "@/lib/prisma";

export const dynamic = "force-dynamic";

export default async function MovementsPage() {
  const employeeCount = await prisma.employee.count({
    where: { status: "ACTIVE" },
  });

  return (
    <section className="stack-lg">
      <div className="split-heading">
        <div>
          <p className="eyebrow section-eyebrow">Movimientos</p>
          <h2>Libro general del personal</h2>
          <p className="muted">
            Consulta unificada de haberes, descuentos, vales, anticipos y ajustes registrados.
          </p>
        </div>
      </div>

      <div className="employees-summary">
        <div className="panel summary-card">
          <p className="summary-label">Empleados habilitados</p>
          <strong className="summary-value">{employeeCount}</strong>
        </div>
        <div className="panel summary-card">
          <p className="summary-label">Ingresos / egresos</p>
          <strong className="summary-value">Carga manual y por Excel</strong>
        </div>
      </div>

      <div className="operations-grid">
        <Link href="/haberes" className="panel operation-card">
          <p className="eyebrow section-eyebrow">Importacion</p>
          <h3>Haberes</h3>
          <p>Carga haberes y movimientos desde archivo Excel en una pantalla dedicada.</p>
          <span className="button ghost">Abrir tarjeta</span>
        </Link>

        <Link href="/movimientos/carga" className="panel operation-card">
          <p className="eyebrow section-eyebrow">Carga manual</p>
          <h3>Carga de haberes y descuentos</h3>
          <p>Ingresa movimientos por legajo, concepto, codigo e importe en una pantalla dedicada.</p>
          <span className="button ghost">Abrir tarjeta</span>
        </Link>

        <Link href={{ pathname: "/conceptos", query: { all: "1" } }} className="panel operation-card">
          <p className="eyebrow section-eyebrow">Maestro</p>
          <h3>ABM de Conceptos</h3>
          <p>Da de alta, modifica o da de baja los conceptos que luego se usan en la carga manual.</p>
          <span className="button ghost">Abrir tarjeta</span>
        </Link>
      </div>
    </section>
  );
}
