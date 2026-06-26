"use server";

import { Prisma } from "@prisma/client";
import { revalidatePath } from "next/cache";
import { requireUser } from "@/lib/auth";
import {
  type ConceptFieldName,
  type ConceptFormState,
  initialConceptFormState,
} from "@/lib/concept-form";
import { prisma } from "@/lib/prisma";
import { conceptSchema } from "@/lib/validations";

function getSubmittedValues(formData: FormData) {
  return {
    id: String(formData.get("id") ?? "") || undefined,
    code: String(formData.get("code") ?? ""),
    description: String(formData.get("description") ?? ""),
    impact: String(formData.get("impact") ?? "CREDIT") as "CREDIT" | "DEBIT",
    status: String(formData.get("status") ?? "ACTIVE") as "ACTIVE" | "INACTIVE",
  };
}

export async function saveConceptAction(
  _: ConceptFormState,
  formData: FormData,
): Promise<ConceptFormState> {
  await requireUser();
  const submittedValues = getSubmittedValues(formData);

  const parsed = conceptSchema.safeParse(submittedValues);

  if (!parsed.success) {
    const fieldErrors: Partial<Record<ConceptFieldName, string>> = {};

    for (const issue of parsed.error.issues) {
      const path = issue.path[0];
      if (typeof path === "string" && !(path in fieldErrors)) {
        fieldErrors[path as ConceptFieldName] = issue.message;
      }
    }

    return {
      status: "error",
      message: parsed.error.issues[0]?.message ?? "No se pudo guardar el concepto.",
      fieldErrors,
      values: submittedValues,
    };
  }

  try {
    const data = {
      code: parsed.data.code,
      description: parsed.data.description.trim().toUpperCase(),
      impact: parsed.data.impact,
      status: parsed.data.status,
    };

    if (parsed.data.id) {
      await prisma.concept.update({
        where: { id: parsed.data.id },
        data,
      });
    } else {
      await prisma.concept.create({ data });
    }
  } catch (error) {
    console.error(error);

    if (error instanceof Prisma.PrismaClientKnownRequestError && error.code === "P2002") {
      return {
        status: "error",
        message: "Ya existe un concepto con ese codigo.",
        fieldErrors: {
          code: "Ese codigo ya esta en uso.",
        },
        values: submittedValues,
      };
    }

    return {
      status: "error",
      message: "No se pudo guardar el concepto.",
      fieldErrors: {},
      values: submittedValues,
    };
  }

  revalidatePath("/conceptos");
  revalidatePath("/movimientos/carga");
  return {
    status: "success",
    message: "Guardado correctamente.",
    fieldErrors: {},
    values: initialConceptFormState.values,
  };
}

export async function toggleConceptStatusAction(conceptId: string) {
  await requireUser();

  const concept = await prisma.concept.findUnique({
    where: { id: conceptId },
    select: { status: true },
  });

  if (!concept) {
    return;
  }

  await prisma.concept.update({
    where: { id: conceptId },
    data: {
      status: concept.status === "ACTIVE" ? "INACTIVE" : "ACTIVE",
    },
  });

  revalidatePath("/conceptos");
  revalidatePath("/movimientos/carga");
}
