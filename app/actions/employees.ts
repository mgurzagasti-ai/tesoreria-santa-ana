"use server";

import { Prisma } from "@prisma/client";
import { revalidatePath } from "next/cache";
import { prisma } from "@/lib/prisma";
import { requireUser } from "@/lib/auth";
import { parseEmployeesWorkbook } from "@/lib/employee-excel-import";
import {
  type EmployeeFieldName,
  type EmployeeFormState,
  initialEmployeeFormState,
} from "@/lib/employee-form";
import { type EmployeeImportFormState, initialEmployeeImportFormState } from "@/lib/employee-import-form";
import { toCents } from "@/lib/utils";
import { employeeSchema } from "@/lib/validations";

function getSubmittedValues(formData: FormData) {
  return {
    id: String(formData.get("id") ?? "") || undefined,
    legajo: String(formData.get("legajo") ?? ""),
    dni: String(formData.get("dni") ?? ""),
    apellido: String(formData.get("apellido") ?? ""),
    nombre: String(formData.get("nombre") ?? ""),
    categoria: String(formData.get("categoria") ?? ""),
    cuil: String(formData.get("cuil") ?? ""),
    fechaIngreso: String(formData.get("fechaIngreso") ?? ""),
    status: (String(formData.get("status") ?? "ACTIVE") as "ACTIVE" | "INACTIVE") ?? "ACTIVE",
    openingBalance: String(formData.get("openingBalance") ?? "0,00"),
    notes: String(formData.get("notes") ?? ""),
  };
}

export async function saveEmployeeAction(
  _: EmployeeFormState,
  formData: FormData,
): Promise<EmployeeFormState> {
  await requireUser();
  const submittedValues = getSubmittedValues(formData);

  const parsed = employeeSchema.safeParse({
    id: submittedValues.id,
    legajo: submittedValues.legajo,
    dni: submittedValues.dni,
    apellido: submittedValues.apellido,
    nombre: submittedValues.nombre,
    categoria: submittedValues.categoria,
    cuil: submittedValues.cuil,
    fechaIngreso: submittedValues.fechaIngreso,
    status: submittedValues.status,
    openingBalance: submittedValues.openingBalance,
    notes: submittedValues.notes,
  });

  if (!parsed.success) {
    const fieldErrors: Partial<Record<EmployeeFieldName, string>> = {};

    for (const issue of parsed.error.issues) {
      const path = issue.path[0];
      if (typeof path === "string" && !(path in fieldErrors)) {
        fieldErrors[path as EmployeeFieldName] = issue.message;
      }
    }

    return {
      status: "error" as const,
      message: parsed.error.issues[0]?.message ?? "No se pudo guardar el empleado.",
      fieldErrors,
      values: submittedValues,
    };
  }

  try {
    const data = {
      legajo: parsed.data.legajo,
      dni: parsed.data.dni,
      apellido: parsed.data.apellido.toUpperCase(),
      nombre: parsed.data.nombre.toUpperCase(),
      categoria: parsed.data.categoria.toUpperCase(),
      cuil: parsed.data.cuil,
      fechaIngreso: new Date(parsed.data.fechaIngreso),
      status: parsed.data.status,
      openingBalanceCents: parsed.data.openingBalance ? toCents(parsed.data.openingBalance) : 0,
      notes: parsed.data.notes || null,
    };

    if (parsed.data.id) {
      await prisma.employee.update({
        where: { id: parsed.data.id },
        data,
      });
    } else {
      await prisma.employee.create({ data });
    }
  } catch (error) {
    console.error(error);

    if (error instanceof Prisma.PrismaClientKnownRequestError && error.code === "P2002") {
      const targets = Array.isArray(error.meta?.target)
        ? error.meta?.target
        : typeof error.meta?.target === "string"
          ? [error.meta.target]
          : [];
      const fieldErrors: Partial<Record<EmployeeFieldName, string>> = {};

      for (const target of targets) {
        if (target === "legajo" || target === "dni" || target === "cuil") {
          const fieldName = target as EmployeeFieldName;
          fieldErrors[fieldName] = `Ya existe otro empleado con ese ${target.toUpperCase()}.`;
        }
      }

      return {
        status: "error" as const,
        message: "No se pudo guardar. Hay datos duplicados.",
        fieldErrors,
        values: submittedValues,
      };
    }

    return {
      status: "error" as const,
      message: "No se pudo guardar el empleado.",
      fieldErrors: {},
      values: submittedValues,
    };
  }

  revalidatePath("/empleados");
  revalidatePath("/saldos");
  revalidatePath("/dashboard");
  return {
    status: "success" as const,
    message: "Guardado correctamente.",
    fieldErrors: {},
    values: initialEmployeeFormState.values,
  };
}

export async function toggleEmployeeStatusAction(employeeId: string) {
  await requireUser();

  const employee = await prisma.employee.findUnique({
    where: { id: employeeId },
    select: { status: true },
  });

  if (!employee) {
    return;
  }

  await prisma.employee.update({
    where: { id: employeeId },
    data: {
      status: employee.status === "ACTIVE" ? "INACTIVE" : "ACTIVE",
    },
  });

  revalidatePath("/empleados");
  revalidatePath("/saldos");
  revalidatePath("/dashboard");
}

export async function importEmployeesExcelAction(
  _: EmployeeImportFormState,
  formData: FormData,
): Promise<EmployeeImportFormState> {
  await requireUser();

  const file = formData.get("file");
  if (!(file instanceof File) || file.size === 0) {
    return {
      ...initialEmployeeImportFormState,
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
      ...initialEmployeeImportFormState,
      status: "error",
      message: "El archivo debe ser Excel (.xlsx o .xls).",
      fieldErrors: {
        file: "El archivo debe ser Excel (.xlsx o .xls).",
      },
    };
  }

  const existingEmployees = await prisma.employee.findMany({
    select: {
      legajo: true,
      dni: true,
      cuil: true,
    },
  });
  const { parsedRows, issues } = await parseEmployeesWorkbook(await file.arrayBuffer(), existingEmployees);

  if (parsedRows.length === 0) {
    return {
      status: "error",
      message: issues[0]?.message ?? "No se encontraron empleados validos para importar.",
      fieldErrors: {
        file: "La planilla no contiene empleados importables.",
      },
      issues,
    };
  }

  await prisma.employee.createMany({
    data: parsedRows.map(({ rowNumber: _rowNumber, ...row }) => row),
  });

  revalidatePath("/empleados");
  revalidatePath("/empleados/alta");
  revalidatePath("/empleados/consulta");
  revalidatePath("/saldos");
  revalidatePath("/dashboard");

  const issuePreview = issues
    .slice(0, 3)
    .map((issue) => `Fila ${issue.rowNumber}: ${issue.message}`)
    .join(" | ");
  const messageParts = [
    `Importacion finalizada. Empleados creados: ${parsedRows.length}.`,
    issues.length > 0 ? `Observaciones: ${issues.length}. ${issuePreview}` : null,
  ].filter(Boolean);

  return {
    status: "success",
    message: messageParts.join(" "),
    fieldErrors: {},
    issues,
  };
}
