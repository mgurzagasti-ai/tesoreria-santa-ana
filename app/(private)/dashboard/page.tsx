import { prisma } from "@/lib/prisma";
import { formatCurrencyFromCents, getSignedAmountCents } from "@/lib/utils";
import { StatCard } from "@/components/dashboard/stat-card";

export const dynamic = "force-dynamic";

export default async function DashboardPage() {
  const [movementCount, movements] = await Promise.all([
    prisma.movement.count(),
    prisma.movement.findMany({
      orderBy: { movementDate: "desc" },
      take: 8,
    }),
  ]);

  const totalBalanceCents = movements.reduce<number>((acc, movement) => {
    return acc + getSignedAmountCents(movement);
  }, 0);
  const incomeCents = movements
    .filter((movement) => movement.type === "CREDIT")
    .reduce((acc, movement) => acc + movement.amountCents, 0);
  const expenseCents = movements
    .filter((movement) => movement.type === "DEBIT")
    .reduce((acc, movement) => acc + movement.amountCents, 0);

  return (
    <section className="stack-lg">
      <div className="split-heading">
        <div>
          <p className="eyebrow section-eyebrow">Resumen general</p>
          <h2>Panel de tesoreria</h2>
          <p className="muted">
            Vista rapida de los movimientos y del balance operativo reciente.
          </p>
        </div>
      </div>

      <div className="grid-3">
        <StatCard
          label="Movimientos"
          value={String(movementCount)}
          detail={<span>Ingresos, egresos, vales y cancelaciones</span>}
        />
        <StatCard
          label="Ingresos recientes"
          value={formatCurrencyFromCents(incomeCents)}
          detail={<span>Total acreditado en los ultimos movimientos</span>}
        />
        <StatCard
          label="Balance reciente"
          value={formatCurrencyFromCents(totalBalanceCents)}
          detail={<span>Calculado sobre los ultimos movimientos cargados</span>}
        />
      </div>

      <div className="employees-summary">
        <div className="panel summary-card">
          <p className="summary-label">Ingresos recientes</p>
          <strong className="summary-value">{formatCurrencyFromCents(incomeCents)}</strong>
        </div>
        <div className="panel summary-card">
          <p className="summary-label">Egresos recientes</p>
          <strong className="summary-value">{formatCurrencyFromCents(expenseCents)}</strong>
        </div>
        <div className="panel summary-card">
          <p className="summary-label">Ultimos registros</p>
          <strong className="summary-value">{movements.length}</strong>
        </div>
      </div>
    </section>
  );
}
