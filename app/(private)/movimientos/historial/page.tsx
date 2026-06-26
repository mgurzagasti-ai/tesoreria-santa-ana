import Link from "next/link";
import { getAllConcepts } from "@/lib/concepts";
import { prisma } from "@/lib/prisma";
import {
  formatSignedCurrencyFromCents,
  getMonthName,
  getMovementCategoryLabel,
  getSignedAmountCents,
} from "@/lib/utils";

type SearchParams = Promise<{
  page?: string;
  q?: string;
  code?: string;
  impact?: string;
}>;

const PAGE_SIZE = 100;

export const dynamic = "force-dynamic";

export default async function MovementHistoryPage({
  searchParams,
}: {
  searchParams: SearchParams;
}) {
  const params = await searchParams;
  const currentPage = Math.max(1, Number.parseInt(params.page ?? "1", 10) || 1);
  const query = params.q?.trim() ?? "";
  const codeFilter = params.code?.trim() ?? "";
  const impactFilter = params.impact?.trim() ?? "";
  const today = new Date();
  const concepts = await getAllConcepts();
  const where = {
    movementDate: {
      lte: today,
    },
    ...(query
      ? {
          OR: [
            {
              employee: {
                legajo: {
                  contains: query,
                },
              },
            },
            {
              employee: {
                apellido: {
                  contains: query,
                },
              },
            },
            {
              employee: {
                nombre: {
                  contains: query,
                },
              },
            },
            {
              concept: {
                contains: query,
              },
            },
            {
              code: {
                contains: query,
              },
            },
          ],
        }
      : {}),
    ...(codeFilter
      ? {
          code: codeFilter,
        }
      : {}),
    ...(impactFilter
      ? {
          type: impactFilter,
        }
      : {}),
  } as const;

  const [totalMovements, movements] = await Promise.all([
    prisma.movement.count({ where }),
    prisma.movement.findMany({
      where,
      orderBy: [{ movementDate: "desc" }, { createdAt: "desc" }],
      skip: (currentPage - 1) * PAGE_SIZE,
      take: PAGE_SIZE,
      include: {
        employee: {
          select: { legajo: true, apellido: true, nombre: true },
        },
      },
    }),
  ]);

  const totalPages = Math.max(1, Math.ceil(totalMovements / PAGE_SIZE));
  const safePage = Math.min(currentPage, totalPages);
  const hasPreviousPage = safePage > 1;
  const hasNextPage = safePage < totalPages;

  return (
    <section className="stack-lg">
      <div className="split-heading">
        <div>
          <p className="eyebrow section-eyebrow">Historial</p>
          <h2>Historial completo de movimientos</h2>
          <p className="muted">
            Consulta todos los movimientos registrados para todos los empleados, de las fechas mas
            nuevas a las mas antiguas.
          </p>
        </div>
        <form className="search-form">
          <input
            type="search"
            name="q"
            defaultValue={query}
            placeholder="Buscar por legajo, empleado o concepto"
          />
          <select name="code" defaultValue={codeFilter}>
            <option value="">Todos los codigos</option>
            {concepts.map((concept) => (
              <option key={concept.id} value={concept.code}>
                {concept.code} - {concept.description}
              </option>
            ))}
          </select>
          <select name="impact" defaultValue={impactFilter}>
            <option value="">Todos los impactos</option>
            <option value="CREDIT">A favor</option>
            <option value="DEBIT">Descuento</option>
          </select>
          <button className="button ghost" type="submit">
            Buscar
          </button>
        </form>
      </div>

      <div className="employees-summary">
        <div className="panel summary-card">
          <p className="summary-label">Registros visibles</p>
          <strong className="summary-value">{movements.length}</strong>
        </div>
        <div className="panel summary-card">
          <p className="summary-label">Total historial</p>
          <strong className="summary-value">{totalMovements}</strong>
        </div>
        <div className="panel summary-card">
          <p className="summary-label">Pagina</p>
          <strong className="summary-value">
            {safePage} / {totalPages}
          </strong>
        </div>
      </div>

      <section className="panel data-panel">
        <div className="panel-head">
          <div>
            <p className="eyebrow section-eyebrow">Libro</p>
            <h3>Todos los empleados</h3>
          </div>

          <div className="actions-inline">
            {hasPreviousPage ? (
              <Link
                className="button ghost"
                href={{
                  pathname: "/movimientos/historial",
                  query: {
                    page: safePage - 1,
                    ...(query ? { q: query } : {}),
                    ...(codeFilter ? { code: codeFilter } : {}),
                    ...(impactFilter ? { impact: impactFilter } : {}),
                  },
                }}
              >
                Anterior
              </Link>
            ) : null}
            {hasNextPage ? (
              <Link
                className="button ghost"
                href={{
                  pathname: "/movimientos/historial",
                  query: {
                    page: safePage + 1,
                    ...(query ? { q: query } : {}),
                    ...(codeFilter ? { code: codeFilter } : {}),
                    ...(impactFilter ? { impact: impactFilter } : {}),
                  },
                }}
              >
                Siguiente
              </Link>
            ) : null}
          </div>
        </div>

        <div className="table-wrap">
          <table>
            <thead>
              <tr>
                <th>Fecha</th>
                <th>Legajo</th>
                <th>Empleado</th>
                <th>Categoria</th>
                <th>Codigo</th>
                <th>Concepto</th>
                <th>Periodo</th>
                <th>Impacto</th>
                <th>Importe</th>
              </tr>
            </thead>
            <tbody>
              {movements.length === 0 ? (
                <tr>
                  <td colSpan={9} className="empty-row">
                    No hay movimientos registrados.
                  </td>
                </tr>
              ) : (
                movements.map((movement) => (
                  <tr key={movement.id}>
                    <td>{movement.movementDate.toISOString().slice(0, 10)}</td>
                    <td>{movement.employee.legajo}</td>
                    <td>
                      {movement.employee.apellido}, {movement.employee.nombre}
                    </td>
                    <td>{getMovementCategoryLabel(movement.category)}</td>
                    <td>{movement.code ?? "-"}</td>
                    <td className={movement.type === "DEBIT" ? "negative-text" : undefined}>
                      {movement.concept}
                    </td>
                    <td>
                      {getMonthName(movement.periodMonth)} {movement.periodYear}
                    </td>
                    <td>{movement.type === "CREDIT" ? "A favor" : "Descuento"}</td>
                    <td>{formatSignedCurrencyFromCents(getSignedAmountCents(movement))}</td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </section>
    </section>
  );
}
