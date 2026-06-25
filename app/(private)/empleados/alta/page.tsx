import Link from "next/link";
import { EmployeeForm } from "@/components/employees/employee-form";
import { getEmployeeCategories } from "@/lib/employee-categories";

export const dynamic = "force-dynamic";

export default async function EmployeeCreatePage() {
  const categories = await getEmployeeCategories();

  return (
    <section className="stack-lg">
      <div className="split-heading">
        <div>
          <p className="eyebrow section-eyebrow">Alta</p>
          <h2>Nuevo empleado</h2>
          <p className="muted">Carga completa del legajo y los datos principales del agente.</p>
        </div>
        <Link href="/empleados/consulta" className="button ghost">
          Ir a consulta
        </Link>
      </div>

      <div className="single-panel-wrap">
        <EmployeeForm title="Alta de empleado" categories={categories} />
      </div>
    </section>
  );
}
