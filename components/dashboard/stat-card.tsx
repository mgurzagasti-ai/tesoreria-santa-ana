import { ReactNode } from "react";

export function StatCard({
  label,
  value,
  detail,
}: {
  label: string;
  value: string;
  detail: ReactNode;
}) {
  return (
    <article className="panel stat-card">
      <p className="stat-label">{label}</p>
      <strong className="stat-value">{value}</strong>
      <div className="stat-detail">{detail}</div>
    </article>
  );
}
