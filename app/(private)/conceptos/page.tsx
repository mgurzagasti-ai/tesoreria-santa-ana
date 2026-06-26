import Link from "next/link";
import { ConceptForm } from "@/components/concepts/concept-form";
import { ConceptTable } from "@/components/concepts/concept-table";
import { getAllConcepts } from "@/lib/concepts";

type SearchParams = Promise<{ q?: string; all?: string }>;

export const dynamic = "force-dynamic";

export default async function ConceptsPage({
  searchParams,
}: {
  searchParams: SearchParams;
}) {
  const params = await searchParams;
  const query = params.q?.trim() ?? "";
  const showAll = params.all === "1";
  const shouldSearch = query.length > 0 || showAll;
  const concepts = shouldSearch ? await getAllConcepts(query) : [];

  return (
    <section className="stack-lg">
      <div className="split-heading">
        <div>
          <p className="eyebrow section-eyebrow">ABM</p>
          <h2>ABM de Conceptos</h2>
          <p className="muted">
            Administra el maestro de conceptos con codigo, descripcion e impacto en la liquidacion.
          </p>
        </div>
        <form className="search-form">
          <input
            type="search"
            name="q"
            defaultValue={query}
            placeholder="Buscar por codigo o descripcion"
          />
          <button className="button ghost" type="submit">
            Buscar
          </button>
          <a className="button ghost" href="/conceptos?all=1">
            Ver todos
          </a>
        </form>
      </div>

      <div className="single-panel-wrap">
        <ConceptForm title="Alta de concepto" />
      </div>

      {shouldSearch ? (
        <>
          <div className="employees-summary">
            <div className="panel summary-card">
              <p className="summary-label">Total encontrados</p>
              <strong className="summary-value">{concepts.length}</strong>
            </div>
            <div className="panel summary-card">
              <p className="summary-label">Activos</p>
              <strong className="summary-value">
                {concepts.filter((concept) => concept.status === "ACTIVE").length}
              </strong>
            </div>
            <div className="panel summary-card">
              <p className="summary-label">Bajas</p>
              <strong className="summary-value">
                {concepts.filter((concept) => concept.status === "INACTIVE").length}
              </strong>
            </div>
          </div>

          <section className="panel data-panel">
            <div className="panel-head">
              <div>
                <p className="eyebrow section-eyebrow">Listado</p>
                <h3>{showAll && !query ? "Todos los conceptos" : "Conceptos encontrados"}</h3>
              </div>
              <Link href="/movimientos/carga" className="button ghost">
                Ir a carga manual
              </Link>
            </div>

            <ConceptTable concepts={concepts} />
          </section>
        </>
      ) : (
        <section className="panel data-panel">
          <div className="panel-head">
            <div>
              <p className="eyebrow section-eyebrow">Consulta</p>
              <h3>Busca o lista conceptos</h3>
            </div>
          </div>
          <p className="muted">
            Usa el buscador o el boton "Ver todos" para revisar los conceptos cargados y modificarlos.
          </p>
        </section>
      )}
    </section>
  );
}
