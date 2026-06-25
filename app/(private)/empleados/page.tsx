import Link from "next/link";

const employeeOptions = [
  {
    href: "/empleados/alta",
    eyebrow: "Alta",
    title: "Registrar empleado",
    description: "Carga un nuevo legajo con sus datos personales, categoria y estado inicial.",
  },
  {
    href: "/empleados/consulta",
    eyebrow: "Consulta",
    title: "Consultar empleados",
    description: "Busca por legajo, apellido, nombre o DNI y revisa el listado completo.",
  },
  {
    href: "/empleados/consulta?all=1",
    eyebrow: "Listado",
    title: "Ver todos los empleados",
    description: "Muestra el padron completo de empleados cargados con acceso directo a editar o dar de baja.",
  },
  {
    href: "/empleados/consulta",
    eyebrow: "ABM",
    title: "Modificar o dar de baja",
    description: "Desde la consulta podes editar un registro existente o marcarlo como baja.",
  },
] as const;

export default function EmployeesHomePage() {
  return (
    <section className="stack-lg">
      <div className="split-heading">
        <div>
          <p className="eyebrow section-eyebrow">Recursos Humanos</p>
          <h2>ABM de empleados</h2>
          <p className="muted">
            Separamos altas, consultas y modificaciones para que cada tarea tenga su propia
            pantalla.
          </p>
        </div>
      </div>

      <div className="operations-grid">
        {employeeOptions.map((option) => (
          <Link key={option.title} href={option.href} className="panel operation-card">
            <p className="eyebrow section-eyebrow">{option.eyebrow}</p>
            <h3>{option.title}</h3>
            <p>{option.description}</p>
            <span className="button ghost">Abrir</span>
          </Link>
        ))}
      </div>
    </section>
  );
}
