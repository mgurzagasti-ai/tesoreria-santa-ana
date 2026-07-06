"use server";

import { revalidatePath } from "next/cache";
import { requireUser } from "@/lib/auth";
import {
  type HaberesImportIssue,
  type HaberesImportFormState,
  type HaberesImportPreviewRow,
  initialHaberesImportFormState,
} from "@/lib/haberes-import-form";
import { parseBalanceWorkbook, parseHaberesWorkbook, type ParsedMovementRow } from "@/lib/excel-import";
import { prisma } from "@/lib/prisma";
import { centsToInputValue, toCents } from "@/lib/utils";

const MANUAL_CONCEPT_VALUE = "__MANUAL__";

const importKindLabels = {
  HABERES: "haberes",
  DESCUENTOS: "descuentos",
} as const;

function parseDateInput(value: string) {
  if (!/^\d{4}-\d{2}-\d{2}$/.test(value)) {
    return null;
  }

  const date = new Date(`${value}T00:00:00`);
  return Number.isNaN(date.getTime()) ? null : date;
}

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

function serializePreviewRows(
  parsedRows: ParsedMovementRow[],
  existingKeys: Set<string>,
): HaberesImportPreviewRow[] {
  const seenKeys = new Set(existingKeys);

  return parsedRows.map((row) => {
    const key = buildMovementKey(row);
    const duplicate = seenKeys.has(key);

    if (!duplicate) {
      seenKeys.add(key);
    }

    return {
      rowNumber: row.rowNumber,
      employeeId: row.employeeId,
      employeeLabel: row.employeeLabel,
      conceptId: row.conceptId,
      category: row.category,
      code: row.code,
      type: row.type,
      concept: row.concept,
      voucherNumber: row.voucherNumber,
      movementDate: row.movementDate.toISOString().slice(0, 10),
      periodMonth: row.periodMonth,
      periodYear: row.periodYear,
      amountCents: row.amountCents,
      amountInput: centsToInputValue(row.amountCents),
      importedFrom: row.importedFrom,
      duplicate,
    };
  });
}

function buildPreviewMessage(
  importKind: keyof typeof importKindLabels,
  resolvedConceptDescription: string,
  previewRows: HaberesImportPreviewRow[],
  issues: HaberesImportIssue[],
) {
  const duplicateCount = previewRows.filter((row) => row.duplicate).length;
  const parts = [
    `Revisamos ${previewRows.length} filas de ${importKindLabels[importKind]} para ${resolvedConceptDescription}.`,
    duplicateCount > 0 ? `Duplicados detectados: ${duplicateCount}.` : null,
    issues.length > 0 ? `Observaciones: ${issues.length}.` : null,
    "Puedes corregir empleado o importe antes de confirmar.",
  ].filter(Boolean);

  return parts.join(" ");
}

function parseReviewedRows(rawValue: FormDataEntryValue | null): HaberesImportPreviewRow[] | null {
  if (typeof rawValue !== "string" || !rawValue.trim()) {
    return null;
  }

  try {
    const parsed = JSON.parse(rawValue);
    if (!Array.isArray(parsed)) {
      return null;
    }

    return parsed.filter((item) => item && typeof item === "object") as HaberesImportPreviewRow[];
  } catch {
    return null;
  }
}

export async function importHaberesExcelAction(
  _: HaberesImportFormState,
  formData: FormData,
): Promise<HaberesImportFormState> {
  await requireUser();

  const rawImportKind = String(formData.get("importKind") ?? "HABERES").toUpperCase();
  const actionIntent = String(formData.get("actionIntent") ?? "preview").toLowerCase();
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
      previewRows: [],
      previewIssues: [],
    };
  }

  if (actionIntent === "confirm") {
    const reviewedRows = parseReviewedRows(formData.get("reviewedRows"));

    if (!reviewedRows || reviewedRows.length === 0) {
      return {
        status: "error",
        message: "Primero revisa el archivo antes de confirmar la importacion.",
        fieldErrors: {
          reviewedRows: "No hay filas revisadas para importar.",
        },
        previewRows: [],
        previewIssues: [],
      };
    }

    const employees = await prisma.employee.findMany({
      where: { status: "ACTIVE" },
      select: { id: true, legajo: true, apellido: true, nombre: true },
    });
    const employeeById = new Map(employees.map((employee) => [employee.id, employee]));
    const parsedRows: ParsedMovementRow[] = [];

    for (const row of reviewedRows) {
      const employee = employeeById.get(String(row.employeeId ?? "").trim());
      if (!employee) {
        return {
          status: "error",
          message: `La fila ${row.rowNumber} tiene un empleado invalido.`,
          fieldErrors: {
            reviewedRows: "Corrige el empleado antes de confirmar.",
          },
          previewRows: reviewedRows,
          previewIssues: [],
        };
      }

      let amountCents = 0;
      try {
        amountCents = toCents(String(row.amountInput ?? "").trim());
      } catch {
        return {
          status: "error",
          message: `La fila ${row.rowNumber} tiene un importe invalido.`,
          fieldErrors: {
            reviewedRows: "Corrige los importes antes de confirmar.",
          },
          previewRows: reviewedRows,
          previewIssues: [],
        };
      }

      if (amountCents === 0) {
        return {
          status: "error",
          message: `La fila ${row.rowNumber} no puede tener importe cero.`,
          fieldErrors: {
            reviewedRows: "Corrige los importes antes de confirmar.",
          },
          previewRows: reviewedRows,
          previewIssues: [],
        };
      }

      const movementDate = new Date(`${row.movementDate}T00:00:00`);
      if (Number.isNaN(movementDate.getTime())) {
        return {
          status: "error",
          message: `La fila ${row.rowNumber} tiene una fecha invalida.`,
          fieldErrors: {
            reviewedRows: "La revision contiene fechas invalidas.",
          },
          previewRows: reviewedRows,
          previewIssues: [],
        };
      }

      parsedRows.push({
        rowNumber: row.rowNumber,
        employeeId: employee.id,
        employeeLabel: `${employee.legajo} - ${employee.apellido}, ${employee.nombre}`,
        conceptId: row.conceptId,
        category: row.category,
        code: row.code,
        type: row.type,
        concept: row.concept,
        voucherNumber: row.voucherNumber,
        movementDate,
        periodMonth: Number(row.periodMonth),
        periodYear: Number(row.periodYear),
        amountCents: Math.abs(amountCents),
        importedFrom: row.importedFrom,
      });
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
    const rowsToInsert = parsedRows.filter((row) => {
      const key = buildMovementKey(row);

      if (existingKeys.has(key)) {
        return false;
      }

      existingKeys.add(key);
      return true;
    });
    const movementData = rowsToInsert.map(({ rowNumber: _rowNumber, employeeLabel: _employeeLabel, ...row }) => row);

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
    const parts = [
      `Importacion de ${importKindLabels[importKind]} confirmada. Nuevos registros: ${importedCount}.`,
      duplicatedCount > 0 ? `Omitidos por duplicado: ${duplicatedCount}.` : null,
    ].filter(Boolean);

    return {
      status: "success",
      message: parts.join(" "),
      fieldErrors: {},
      previewRows: [],
      previewIssues: [],
    };
  }

  const conceptId = String(formData.get("conceptId") ?? "").trim();
  const conceptDescription = String(formData.get("conceptDescription") ?? "").trim();
  const rawPaymentDate = String(formData.get("paymentDate") ?? "").trim();
  const rawPeriodMonth = String(formData.get("periodMonth") ?? "").trim();
  const rawPeriodYear = String(formData.get("periodYear") ?? "").trim();

  const paymentDate = parseDateInput(rawPaymentDate);
  const periodMonth = Number(rawPeriodMonth);
  const periodYear = Number(rawPeriodYear);

  if (!paymentDate) {
    return {
      status: "error",
      message: "Indica una fecha valida para esta carga.",
      fieldErrors: {
        paymentDate: "Selecciona una fecha.",
      },
      previewRows: [],
      previewIssues: [],
    };
  }

  if (!Number.isInteger(periodMonth) || periodMonth < 1 || periodMonth > 12) {
    return {
      status: "error",
      message: "Indica un mes valido para el periodo.",
      fieldErrors: {
        periodMonth: "Selecciona un mes.",
      },
      previewRows: [],
      previewIssues: [],
    };
  }

  if (!Number.isInteger(periodYear) || periodYear < 2020 || periodYear > 2100) {
    return {
      status: "error",
      message: "Indica un anio valido para el periodo.",
      fieldErrors: {
        periodYear: "Escribe un anio valido.",
      },
      previewRows: [],
      previewIssues: [],
    };
  }

  if (!conceptId) {
    return {
      status: "error",
      message: "Selecciona el concepto que corresponde a la carga.",
      fieldErrors: {
        conceptId: "Selecciona un concepto.",
      },
      previewRows: [],
      previewIssues: [],
    };
  }

  if (!conceptDescription) {
    return {
      status: "error",
      message: "Escribe la descripcion que quieres usar en la carga.",
      fieldErrors: {
        conceptDescription: "Escribe una descripcion.",
      },
      previewRows: [],
      previewIssues: [],
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
      previewRows: [],
      previewIssues: [],
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
      previewRows: [],
      previewIssues: [],
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
      previewRows: [],
      previewIssues: [],
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
      previewRows: [],
      previewIssues: [],
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
        previewRows: [],
        previewIssues: [],
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
      previewRows: [],
      previewIssues: [],
    };
  }

  const { parsedRows, issues } = await parseHaberesWorkbook(
    fileBuffer,
    file.name,
    employees,
    resolvedConcept,
    {
      movementDate: paymentDate,
      periodMonth,
      periodYear,
    },
  );

  if (parsedRows.length === 0) {
    return {
      status: "error",
      message: issues[0]?.message ?? "No se pudieron leer filas validas del Excel.",
      fieldErrors: {
        file: "La planilla no contiene filas importables.",
      },
      previewRows: [],
      previewIssues: [],
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
  const previewRows = serializePreviewRows(parsedRows, existingKeys);
  return {
    status: "success",
    message: buildPreviewMessage(importKind, resolvedConcept.description, previewRows, issues),
    fieldErrors: {},
    previewRows,
    previewIssues: issues,
  };
}
