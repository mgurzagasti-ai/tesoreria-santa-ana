"use server";

import { revalidatePath } from "next/cache";
import { requireUser } from "@/lib/auth";
import {
  type HaberesImportFormState,
  initialHaberesImportFormState,
} from "@/lib/haberes-import-form";
import { parseBalanceWorkbook, parseHaberesWorkbook } from "@/lib/excel-import";
import { prisma } from "@/lib/prisma";

const MANUAL_CONCEPT_VALUE = "__MANUAL__";

const importKindLabels = {
  HABERES: "haberes",
  DESCUENTOS: "descuentos",
} as const;

function buildMovementKey(row: {
  employeeId: string;
  category: string;
  code?: string | null;
  concept: string;
  movementDate: Date;
  periodMonth: number;
  periodYear: number;
  amountCents: number;
  voucherNumber: string | null;
}) {
  return [
    row.employeeId,
    row.category,
    row.code?.trim() || row.concept,
    row.movementDate.toISOString().slice(0, 10),
    row.periodMonth,
    row.periodYear,
    row.amountCents,
    row.voucherNumber ?? "",
  ].join("|");
}

export async function importHaberesExcelAction(
  _: HaberesImportFormState,
  formData: FormData,
): Promise<HaberesImportFormState> {
  await requireUser();

  const rawImportKind = String(formData.get("importKind") ?? "HABERES").toUpperCase();
  const importKind =
    rawImportKind === "HABERES" || rawImportKind === "DESCUENTOS"
      ? rawImportKind
      : null;

  if (!importKind) {
    return {
      status: "error",
      message: "Selecciona si el archivo corresponde a haberes o descuentos.",
      fieldErrors: {
        importKind: "Selecciona una pestana valida.",
      },
    };
  }

  const conceptId = String(formData.get("conceptId") ?? "").trim();
  const conceptDescription = String(formData.get("conceptDescription") ?? "").trim();
  if (!conceptId) {
    return {
      status: "error",
      message: "Selecciona el concepto que corresponde a la carga.",
      fieldErrors: {
        conceptId: "Selecciona un concepto.",
      },
    };
  }

  if (!conceptDescription) {
    return {
      status: "error",
      message: "Escribe la descripcion que quieres usar en la carga.",
      fieldErrors: {
        conceptDescription: "Escribe una descripcion.",
      },
    };
  }

  const file = formData.get("file");
  if (!(file instanceof File) || file.size === 0) {
    return {
      status: "error",
      message: "Selecciona un archivo Excel valido.",
      fieldErrors: {
        file: "Selecciona un archivo Excel valido.",
      },
    };
  }

  const extension = file.name.split(".").pop()?.toLowerCase();
  if (!extension || !["xlsx", "xls"].includes(extension)) {
    return {
      status: "error",
      message: "El archivo debe ser Excel (.xlsx o .xls).",
      fieldErrors: {
        file: "El archivo debe ser Excel (.xlsx o .xls).",
      },
    };
  }

  const employees = await prisma.employee.findMany({
    select: { id: true, legajo: true, apellido: true, nombre: true },
  });
  const expectedImpact = importKind === "HABERES" ? "CREDIT" : "DEBIT";
  const selectedConcept =
    conceptId === MANUAL_CONCEPT_VALUE
      ? null
      : await prisma.concept.findFirst({
          where: { id: conceptId, status: "ACTIVE" },
          select: { id: true, code: true, description: true, impact: true },
        });

  if (conceptId !== MANUAL_CONCEPT_VALUE && !selectedConcept) {
    return {
      status: "error",
      message: "El concepto elegido no esta disponible.",
      fieldErrors: {
        conceptId: "Selecciona un concepto activo.",
      },
    };
  }

  if (selectedConcept && selectedConcept.impact !== expectedImpact) {
    return {
      status: "error",
      message:
        importKind === "HABERES"
          ? "La carga de haberes solo acepta conceptos que suman."
          : "La carga de descuentos solo acepta conceptos que restan.",
      fieldErrors: {
        conceptId:
          importKind === "HABERES"
            ? "Selecciona un concepto de haberes."
            : "Selecciona un concepto de descuentos.",
      },
    };
  }

  const resolvedConcept = {
    id: selectedConcept?.id ?? null,
    code: selectedConcept?.code ?? null,
    category: selectedConcept?.description ?? "MANUAL",
    impact: selectedConcept?.impact ?? expectedImpact,
    description: conceptDescription.toUpperCase(),
  };

  const fileBuffer = await file.arrayBuffer();
  const balanceImport = await parseBalanceWorkbook(fileBuffer, employees);

  if (balanceImport.detectedAsBalanceWorkbook) {
    if (balanceImport.parsedRows.length === 0) {
      return {
        status: "error",
        message: balanceImport.issues[0]?.message ?? "No se pudieron leer saldos validos del Excel.",
        fieldErrors: {
          file: "La planilla no contiene saldos importables.",
        },
      };
    }

    await prisma.$transaction([
      prisma.movement.deleteMany({
        where: {
          importedFrom: file.name,
        },
      }),
      ...balanceImport.parsedRows.map((row) =>
        prisma.employee.update({
          where: { id: row.employeeId },
          data: { openingBalanceCents: row.balanceCents },
        }),
      ),
    ]);

    revalidatePath("/haberes");
    revalidatePath("/movimientos");
    revalidatePath("/saldos");
    revalidatePath("/dashboard");

    const issuePreview = balanceImport.issues
      .slice(0, 3)
      .map((issue) => `Fila ${issue.rowNumber}: ${issue.message}`);

    const parts = [
      `Importacion de saldos finalizada. Empleados actualizados: ${balanceImport.parsedRows.length}.`,
      balanceImport.issues.length > 0
        ? `Observaciones: ${balanceImport.issues.length}. ${issuePreview.join(" | ")}`
        : null,
    ].filter(Boolean);

    return {
      status: "success",
      message: parts.join(" "),
      fieldErrors: {},
    };
  }

  const { parsedRows, issues } = await parseHaberesWorkbook(
    fileBuffer,
    file.name,
    employees,
    resolvedConcept,
  );

  if (parsedRows.length === 0) {
    return {
      status: "error",
      message: issues[0]?.message ?? "No se pudieron leer filas validas del Excel.",
      fieldErrors: {
        file: "La planilla no contiene filas importables.",
      },
    };
  }

  const employeeIds = [...new Set(parsedRows.map((row) => row.employeeId))];
  const existingMovements = await prisma.movement.findMany({
    where: {
      employeeId: { in: employeeIds },
    },
    select: {
      employeeId: true,
      category: true,
      code: true,
      concept: true,
      movementDate: true,
      periodMonth: true,
      periodYear: true,
      amountCents: true,
      voucherNumber: true,
    },
  });

  const existingKeys = new Set(existingMovements.map(buildMovementKey));
  const rowsToInsert = parsedRows.filter((row) => !existingKeys.has(buildMovementKey(row)));
  const movementData = rowsToInsert.map(({ employeeLabel: _employeeLabel, ...row }) => row);

  if (movementData.length > 0) {
    await prisma.movement.createMany({
      data: movementData,
    });
  }

  revalidatePath("/haberes");
  revalidatePath("/movimientos");
  revalidatePath("/saldos");
  revalidatePath("/dashboard");

  const importedCount = movementData.length;
  const duplicatedCount = parsedRows.length - importedCount;
  const issuePreview = issues.slice(0, 3).map((issue) => `Fila ${issue.rowNumber}: ${issue.message}`);

  const parts = [
    `Importacion de ${importKindLabels[importKind]} finalizada para ${resolvedConcept.description}. Nuevos registros: ${importedCount}.`,
    duplicatedCount > 0 ? `Omitidos por duplicado: ${duplicatedCount}.` : null,
    issues.length > 0 ? `Observaciones: ${issues.length}. ${issuePreview.join(" | ")}` : null,
  ].filter(Boolean);

  return {
    status: "success",
    message: parts.join(" "),
    fieldErrors: {},
  };
}
