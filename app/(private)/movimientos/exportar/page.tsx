import Link from "next/link";
import { getMonthName } from "@/lib/utils";
import { getMovementExportConceptSummary } from "@/lib/movement-export";

type SearchParams = Promise<{ month?: string; year?: string }>;

function normalizeMonth(value?: string) {
  const numeric = Number(value);
  return Number.isInteger(numeric) && numeric >= 1 && numeric <= 12 ? numeric : new Date().getMonth() + 1;
}

function normalizeYear(value?: string) {
  const numeric = Number(value);
  return Number.isInteger(numeric) && numeric >= 2020 && numeric <= 2100 ? numeric : new Date().getFullYear();
}

export default async function MovementExportPage({
  searchParams,
}: {
  searchParams: SearchParams;
}) {
  const params = await searchParams;
  const month = normalizeMonth(params.month);
  const year = normalizeYear(params.year);
  const groups = await getMovementExportConceptSummary();

  return (
    <section className="stack-lg">
      <div className="split-heading">
        <div>
          <p className="eyebrow section-eyebrow">Exportacion</p>
          <h2>Excel por items que suman o restan</h2>
          <p className="muted">
            Elige el periodo y descarga un archivo simple con tres columnas: legajo, apellido y nombre, e importe.
          </p>
        </div>
        <form className="search-form">
          <input
            type="number"
            name="month"
            min="1"
            max="12"
            defaultValue={month}
            aria-label="Mes"
            placeholder="Mes"
          />
          <input
            type="number"
            name="year"
            min="2020"
            max="2100"
            defaultValue={year}
            aria-label="Anio"
            placeholder="Anio"
          />
          <button className="button ghost" type="submit">
            Actualizar
          </button>
        </form>
      </div>

      <div className="employees-summary">
        <div className="panel summary-card">
          <p className="summary-label">Periodo</p>
          <strong className="summary-value">
            {getMonthName(month)} {year}
          </strong>
        </div>
        <div className="panel summary-card">
          <p className="summary-label">Formato</p>
          <strong className="summary-value">Legajo, empleado e importe</strong>
        </div>
      </div>

      <div className="operations-grid">
        {groups.map((group) => (
          <section key={group.id} className="panel operation-card export-card">
            <p className="eyebrow section-eyebrow">{group.shortTitle}</p>
            <h3>{group.title}</h3>
            <p>{group.description}</p>

            <div className="export-card-chipbox">
              {group.concepts.length > 0 ? (
                group.concepts.map((concept) => (
                  <span key={`${group.id}-${concept.code}`} className="soft-chip">
                    {concept.description}
                  </span>
                ))
              ) : (
                <span className="soft-chip">No hay conceptos activos en este grupo.</span>
              )}
            </div>

            <a
              className="button ghost"
              href={`/movimientos/exportar/archivo?group=${group.id}&month=${month}&year=${year}`}
            >
              Descargar Excel
            </a>
          </section>
        ))}
      </div>

      <section className="panel data-panel">
        <div className="panel-head">
          <div>
            <p className="eyebrow section-eyebrow">Ayuda</p>
            <h3>Como se arma el archivo</h3>
          </div>
          <Link href="/movimientos" className="button ghost">
            Volver a movimientos
          </Link>
        </div>
        <div className="export-help">
          <p className="muted">
            El archivo se genera por periodo mes/anio y agrupa todos los movimientos del empleado dentro del grupo
            elegido.
          </p>
          <p className="muted">
            Si un concepto esta marcado como <strong>Suma</strong> en el maestro, sale en "Items que suman". Si esta
            marcado como <strong>Resta</strong>, sale en "Items que restan".
          </p>
        </div>
      </section>
    </section>
  );
}
