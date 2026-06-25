import { EmployeeTable } from "@/components/employees/employee-table";
import { prisma } from "@/lib/prisma";

type SearchParams = Promise<{ q?: string; all?: string }>;

export const dynamic = "force-dynamic";

export default async function EmployeeQueryPage({
  searchParams,
}: {
  searchParams: SearchParams;
}) {
  const params = await searchParams;
  const query = params.q?.trim() ?? "";
  const showAll = params.all === "1";
  const hasQuery = query.length > 0;
  const shouldSearch = hasQuery || showAll;

  const employees = shouldSearch
    ? await prisma.employee.findMany({
        where: hasQuery
          ? {
              OR: [
                { legajo: { contains: query } },
                { apellido: { contains: query } },
                { nombre: { contains: query } },
                { dni: { contains: query } },
              ],
            }
          : undefined,
        orderBy:
          showAll && !hasQuery
            ? [{ legajo: "asc" }]
            : [{ status: "asc" }, { apellido: "asc" }, { nombre: "asc" }],
      })
    : [];

  return (
    <section className="stack-lg">
      <div className="split-heading">
        <div>
          <p className="eyebrow section-eyebrow">Consulta</p>
          <h2>Listado de empleados</h2>
          <p className="muted">
            Pantalla exclusiva de consulta con acceso directo a modificacion y baja.
          </p>
        </div>
        <form className="search-form">
          <input
            type="search"
            name="q"
            defaultValue={query}
            placeholder="Buscar por legajo, apellido, nombre o DNI"
          />
          <button className="button ghost" type="submit">
            Buscar
          </button>
          <a className="button ghost" href="/empleados/consulta?all=1">
            Ver todos
          </a>
        </form>
      </div>

      {shouldSearch ? (
        <>
          <div className="employees-summary">
            <div className="panel summary-card">
              <p className="summary-label">Total encontrados</p>
              <strong className="summary-value">{employees.length}</strong>
            </div>
            <div className="panel summary-card">
              <p className="summary-label">Activos</p>
              <strong className="summary-value">
                {employees.filter((employee) => employee.status === "ACTIVE").length}
              </strong>
            </div>
            <div className="panel summary-card">
              <p className="summary-label">Bajas</p>
              <strong className="summary-value">
                {employees.filter((employee) => employee.status === "INACTIVE").length}
              </strong>
            </div>
          </div>

          <section className="panel data-panel">
            <div className="panel-head">
              <div>
                <p className="eyebrow section-eyebrow">Consulta</p>
                <h3>{showAll && !hasQuery ? "Padron completo de empleados" : "Empleados cargados"}</h3>
              </div>
            </div>

            <EmployeeTable employees={employees} />
          </section>
        </>
      ) : (
        <section className="panel data-panel">
          <div className="panel-head">
            <div>
              <p className="eyebrow section-eyebrow">Consulta</p>
              <h3>Consulta de empleados</h3>
            </div>
          </div>

          <p className="muted">
            Ingrese un legajo, apellido, nombre o DNI para buscar, o use "Ver todos" para listar
            el padron completo.
          </p>
        </section>
      )}
    </section>
  );
}
