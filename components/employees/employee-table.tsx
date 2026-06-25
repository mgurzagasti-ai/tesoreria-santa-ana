import Link from "next/link";
import { toggleEmployeeStatusAction } from "@/app/actions/employees";
import { formatDateInput } from "@/lib/utils";

type EmployeeRow = {
  id: string;
  legajo: string;
  dni: string;
  apellido: string;
  nombre: string;
  categoria: string;
  fechaIngreso: Date;
  status: string;
};

export function EmployeeTable({ employees }: { employees: EmployeeRow[] }) {
  return (
    <div className="table-wrap">
      <table>
        <thead>
          <tr>
            <th>Legajo</th>
            <th>Apellido</th>
            <th>Nombre</th>
            <th>Categoria</th>
            <th>DNI</th>
            <th>Ingreso</th>
            <th>Estado</th>
            <th>Acciones</th>
          </tr>
        </thead>
        <tbody>
          {employees.length === 0 ? (
            <tr>
              <td colSpan={8} className="empty-row">
                No se encontraron empleados.
              </td>
            </tr>
          ) : (
            employees.map((employee) => (
              <tr key={employee.id}>
                <td>{employee.legajo}</td>
                <td>{employee.apellido}</td>
                <td>{employee.nombre}</td>
                <td>{employee.categoria}</td>
                <td>{employee.dni}</td>
                <td>{formatDateInput(employee.fechaIngreso)}</td>
                <td>{employee.status === "ACTIVE" ? "Activo" : "Baja"}</td>
                <td>
                  <div className="actions-inline">
                    <Link className="button tiny ghost" href={`/empleados/${employee.id}/editar`}>
                      Modificar
                    </Link>
                    <form action={toggleEmployeeStatusAction.bind(null, employee.id)}>
                      <button className="button tiny" type="submit">
                        {employee.status === "ACTIVE" ? "Dar de baja" : "Reactivar"}
                      </button>
                    </form>
                  </div>
                </td>
              </tr>
            ))
          )}
        </tbody>
      </table>
    </div>
  );
}
