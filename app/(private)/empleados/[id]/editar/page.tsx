import Link from "next/link";
import { notFound } from "next/navigation";
import { EmployeeForm } from "@/components/employees/employee-form";
import { getEmployeeCategories } from "@/lib/employee-categories";
import { prisma } from "@/lib/prisma";
import { centsToInputValue, formatDateInput } from "@/lib/utils";

type Params = Promise<{ id: string }>;

export const dynamic = "force-dynamic";

export default async function EmployeeEditPage({
  params,
}: {
  params: Params;
}) {
  const { id } = await params;
  const employee = await prisma.employee.findUnique({
    where: { id },
  });
  const categories = await getEmployeeCategories();

  if (!employee) {
    notFound();
  }

  const categoryOptions = categories.includes(employee.categoria)
    ? categories
    : [...categories, employee.categoria].sort((a, b) => a.localeCompare(b));

  return (
    <section className="stack-lg">
      <div className="split-heading">
        <div>
          <p className="eyebrow section-eyebrow">Modificacion</p>
          <h2>Editar empleado</h2>
          <p className="muted">
            Actualiza los datos del legajo o modifica su estado administrativo.
          </p>
        </div>
        <Link href="/empleados/consulta" className="button ghost">
          Volver al listado
        </Link>
      </div>

      <div className="employees-summary">
        <div className="panel summary-card">
          <p className="summary-label">Legajo</p>
          <strong className="summary-value">{employee.legajo}</strong>
        </div>
        <div className="panel summary-card">
          <p className="summary-label">Estado actual</p>
          <strong className="summary-value">
            {employee.status === "ACTIVE" ? "Activo" : "Baja"}
          </strong>
        </div>
        <div className="panel summary-card">
          <p className="summary-label">Ingreso</p>
          <strong className="summary-value">{formatDateInput(employee.fechaIngreso)}</strong>
        </div>
        <div className="panel summary-card">
          <p className="summary-label">Saldo inicial</p>
          <strong className="summary-value">{centsToInputValue(employee.openingBalanceCents)}</strong>
        </div>
      </div>

      <div className="single-panel-wrap">
        <EmployeeForm
          categories={categoryOptions}
          title="Modificacion de empleado"
          initialValues={{
            id: employee.id,
            legajo: employee.legajo,
            dni: employee.dni,
            apellido: employee.apellido,
            nombre: employee.nombre,
            categoria: employee.categoria,
            cuil: employee.cuil,
            fechaIngreso: formatDateInput(employee.fechaIngreso),
            status: employee.status as "ACTIVE" | "INACTIVE",
            openingBalance: centsToInputValue(employee.openingBalanceCents),
            notes: employee.notes,
          }}
        />
      </div>
    </section>
  );
}
