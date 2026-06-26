import Link from "next/link";
import { notFound } from "next/navigation";
import { ConceptForm } from "@/components/concepts/concept-form";
import { ensureDefaultConcepts } from "@/lib/concepts";
import { prisma } from "@/lib/prisma";

type Params = Promise<{ id: string }>;

export const dynamic = "force-dynamic";

export default async function ConceptEditPage({
  params,
}: {
  params: Params;
}) {
  await ensureDefaultConcepts();
  const { id } = await params;
  const concept = await prisma.concept.findUnique({
    where: { id },
  });

  if (!concept) {
    notFound();
  }

  return (
    <section className="stack-lg">
      <div className="split-heading">
        <div>
          <p className="eyebrow section-eyebrow">Modificacion</p>
          <h2>Editar concepto</h2>
          <p className="muted">
            Ajusta el codigo, la descripcion o si el concepto suma o resta en la liquidacion.
          </p>
        </div>
        <Link href={{ pathname: "/conceptos", query: { all: "1" } }} className="button ghost">
          Volver al listado
        </Link>
      </div>

      <div className="employees-summary">
        <div className="panel summary-card">
          <p className="summary-label">Codigo</p>
          <strong className="summary-value">{concept.code}</strong>
        </div>
        <div className="panel summary-card">
          <p className="summary-label">Impacto actual</p>
          <strong className="summary-value">{concept.impact === "CREDIT" ? "Suma" : "Resta"}</strong>
        </div>
        <div className="panel summary-card">
          <p className="summary-label">Estado</p>
          <strong className="summary-value">{concept.status === "ACTIVE" ? "Activo" : "Baja"}</strong>
        </div>
      </div>

      <div className="single-panel-wrap">
        <ConceptForm
          title="Modificacion de concepto"
          initialValues={{
            id: concept.id,
            code: concept.code,
            description: concept.description,
            impact: concept.impact as "CREDIT" | "DEBIT",
            status: concept.status as "ACTIVE" | "INACTIVE",
          }}
        />
      </div>
    </section>
  );
}
