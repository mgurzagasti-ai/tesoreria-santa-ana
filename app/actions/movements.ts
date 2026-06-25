"use server";

import { revalidatePath } from "next/cache";
import { requireUser } from "@/lib/auth";
import {
  type MovementFieldName,
  type MovementFormState,
  type MovementFormValues,
  initialMovementFormState,
} from "@/lib/movement-form";
import { prisma } from "@/lib/prisma";
import { inferMovementType, toCents } from "@/lib/utils";
import { movementSchema } from "@/lib/validations";

function getSubmittedValues(formData: FormData) {
  return {
    employeeId: String(formData.get("employeeId") ?? ""),
    category: String(formData.get("category") ?? "ADVANCE"),
    type: String(formData.get("type") ?? ""),
    concept: String(formData.get("concept") ?? ""),
    voucherNumber: String(formData.get("voucherNumber") ?? ""),
    movementDate: String(formData.get("movementDate") ?? ""),
    periodMonth: String(formData.get("periodMonth") ?? ""),
    periodYear: String(formData.get("periodYear") ?? ""),
    amount: String(formData.get("amount") ?? ""),
    installments: String(formData.get("installments") ?? ""),
    installmentNo: String(formData.get("installmentNo") ?? ""),
    importedFrom: String(formData.get("importedFrom") ?? ""),
  };
}

function toMovementFormValues(
  values: ReturnType<typeof getSubmittedValues>,
): MovementFormValues {
  return {
    ...values,
    type: values.type === "CREDIT" || values.type === "DEBIT" ? values.type : undefined,
  };
}

export async function createMovementAction(
  _: MovementFormState,
  formData: FormData,
): Promise<MovementFormState> {
  await requireUser();
  const submittedValues = getSubmittedValues(formData);

  const parsed = movementSchema.safeParse({
    employeeId: submittedValues.employeeId,
    category: submittedValues.category,
    type: submittedValues.type || undefined,
    concept: submittedValues.concept,
    voucherNumber: submittedValues.voucherNumber,
    movementDate: submittedValues.movementDate,
    periodMonth: submittedValues.periodMonth,
    periodYear: submittedValues.periodYear,
    amount: submittedValues.amount,
    installments: submittedValues.installments || undefined,
    installmentNo: submittedValues.installmentNo || undefined,
    importedFrom: submittedValues.importedFrom,
  });

  if (!parsed.success) {
    const fieldErrors: Partial<Record<MovementFieldName, string>> = {};

    for (const issue of parsed.error.issues) {
      const path = issue.path[0];
      if (typeof path === "string" && !(path in fieldErrors)) {
        fieldErrors[path as MovementFieldName] = issue.message;
      }
    }

    return {
      status: "error",
      message: parsed.error.issues[0]?.message ?? "No se pudo guardar el movimiento.",
      fieldErrors,
      values: toMovementFormValues(submittedValues),
    };
  }

  try {
    await prisma.movement.create({
      data: {
        employeeId: parsed.data.employeeId,
        type: parsed.data.category === "VARIOUS"
          ? (parsed.data.type ?? "DEBIT")
          : inferMovementType(parsed.data.category),
        category: parsed.data.category,
        concept: parsed.data.concept.toUpperCase(),
        voucherNumber: parsed.data.voucherNumber || null,
        movementDate: new Date(parsed.data.movementDate),
        periodMonth: parsed.data.periodMonth,
        periodYear: parsed.data.periodYear,
        amountCents: toCents(parsed.data.amount),
        installments: parsed.data.installments ?? null,
        installmentNo: parsed.data.installmentNo ?? null,
        importedFrom: parsed.data.importedFrom || null,
      },
    });
  } catch (error) {
    console.error(error);
    return {
      status: "error",
      message: "No se pudo crear el movimiento.",
      fieldErrors: {},
      values: toMovementFormValues(submittedValues),
    };
  }

  revalidatePath("/haberes");
  revalidatePath("/movimientos");
  revalidatePath("/saldos");
  revalidatePath("/dashboard");
  return {
    status: "success",
    message: "Movimiento registrado.",
    fieldErrors: {},
    values: initialMovementFormState.values,
  };
}
