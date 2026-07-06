import Link from "next/link";
import { notFound } from "next/navigation";
import { MovementForm } from "@/components/movements/movement-form";
import { getActiveConcepts } from "@/lib/concepts";
import { prisma } from "@/lib/prisma";
import { centsToInputValue, formatDateInput } from "@/lib/utils";

export const dynamic = "force-dynamic";

export default async function EditMovementPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const [employees, concepts, movement] = await Promise.all([
    prisma.employee.findMany({
      where: { status: "ACTIVE" },
      orderBy: [{ apellido: "asc" }, { nombre: "asc" }],
      select: { id: true, legajo: true, apellido: true, nombre: true },
    }),
    getActiveConcepts(),
    prisma.movement.findUnique({
      where: { id },
      select: {
        id: true,
        employeeId: true,
        conceptId: true,
        code: true,
        concept: true,
        voucherNumber: true,
        movementDate: true,
        periodMonth: true,
        periodYear: true,
        amountCents: true,
        installments: true,
        installmentNo: true,
        importedFrom: true,
      },
    }),
  ]);

  if (!movement) {
    notFound();
  }

  return (
    <section className="stack-lg">
      <div className="split-heading">
        <div>
          <p className="eyebrow section-eyebrow">Historial</p>
          <h2>Editar movimiento</h2>
          <p className="muted">
            Esta pantalla te deja corregir un movimiento ya guardado sin volver a importar el Excel.
          </p>
        </div>
        <Link className="button ghost" href="/movimientos/historial">
          Volver al historial
        </Link>
      </div>

      <div className="single-panel-wrap">
        <MovementForm
          employees={employees}
          concepts={concepts}
          mode="edit"
          initialValues={{
            id: movement.id,
            employeeId: movement.employeeId,
            conceptId: movement.conceptId ?? "",
            code: movement.code ?? "",
            concept: movement.concept,
            voucherNumber: movement.voucherNumber ?? "",
            movementDate: formatDateInput(movement.movementDate),
            periodMonth: String(movement.periodMonth),
            periodYear: String(movement.periodYear),
            amount: centsToInputValue(movement.amountCents),
            installments: movement.installments ? String(movement.installments) : "",
            installmentNo: movement.installmentNo ? String(movement.installmentNo) : "",
            importedFrom: movement.importedFrom ?? "",
          }}
        />
      </div>
    </section>
  );
}
