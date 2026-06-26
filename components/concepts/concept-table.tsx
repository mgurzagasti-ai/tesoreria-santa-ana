import { toggleConceptStatusAction } from "@/app/actions/concepts";

type ConceptRow = {
  id: string;
  code: string;
  description: string;
  impact: string;
  status: string;
};

export function ConceptTable({ concepts }: { concepts: ConceptRow[] }) {
  return (
    <div className="table-wrap">
      <table>
        <thead>
          <tr>
            <th>Codigo</th>
            <th>Descripcion</th>
            <th>Impacto</th>
            <th>Estado</th>
            <th>Acciones</th>
          </tr>
        </thead>
        <tbody>
          {concepts.length === 0 ? (
            <tr>
              <td colSpan={5} className="empty-row">
                No se encontraron conceptos.
              </td>
            </tr>
          ) : (
            concepts.map((concept) => (
              <tr key={concept.id}>
                <td>{concept.code}</td>
                <td>{concept.description}</td>
                <td>{concept.impact === "CREDIT" ? "Suma" : "Resta"}</td>
                <td>{concept.status === "ACTIVE" ? "Activo" : "Baja"}</td>
                <td>
                  <div className="actions-inline">
                    <a className="button tiny ghost" href={`/conceptos/${concept.id}/editar`}>
                      Modificar
                    </a>
                    <form action={toggleConceptStatusAction.bind(null, concept.id)}>
                      <button className="button tiny" type="submit">
                        {concept.status === "ACTIVE" ? "Dar de baja" : "Reactivar"}
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
