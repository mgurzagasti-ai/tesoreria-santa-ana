import * as XLSX from "xlsx";
import { employeeSchema } from "@/lib/validations";

export type EmployeeImportIssue = {
  rowNumber: number;
  message: string;
};

export type ParsedEmployeeImportRow = {
  rowNumber: number;
  legajo: string;
  dni: string;
  apellido: string;
  nombre: string;
  categoria: string;
  cuil: string;
  fechaIngreso: Date;
  status: "ACTIVE" | "INACTIVE";
  openingBalanceCents: number;
  notes: string | null;
};

type ExistingEmployeeKey = {
  legajo: string;
  dni: string;
  cuil: string;
};

type ColumnKey =
  | "legajo"
  | "dni"
  | "apellido"
  | "nombre"
  | "categoria"
  | "cuil"
  | "fechaIngreso"
  | "status"
  | "openingBalance"
  | "notes";

type DetectedColumns = Partial<Record<ColumnKey, number>>;

const headerAliases: Record<ColumnKey, string[]> = {
  legajo: ["legajo", "n legajo", "nro legajo", "nro. legajo", "codigo", "cod", "cod legajo", "leg"],
  dni: ["dni", "documento", "n documento", "nro documento", "nro. documento"],
  apellido: ["apellido", "apellidos"],
  nombre: ["nombre", "nombres"],
  categoria: ["categoria", "categoría", "cargo", "puesto"],
  cuil: ["cuil", "cuil/cuit", "cuit"],
  fechaIngreso: ["fecha ingreso", "fecha de ingreso", "fechaingreso", "ingreso", "fec ingreso"],
  status: ["activo", "estado", "status", "situacion", "situación"],
  openingBalance: ["saldo inicial", "saldo", "saldo apertura"],
  notes: ["notas", "nota", "observaciones", "observacion", "observación"],
};

function normalizeText(value: unknown) {
  return String(value ?? "")
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .toLowerCase()
    .replace(/[^\w\s./-]/g, " ")
    .replace(/\s+/g, " ")
    .trim();
}

function cleanString(value: unknown) {
  return String(value ?? "").trim();
}

function getCell(row: unknown[], index: number | undefined) {
  return index === undefined ? "" : row[index];
}

function normalizeDigits(value: unknown) {
  return cleanString(value).replace(/\D/g, "");
}

function normalizeLegajo(value: unknown) {
  const digits = normalizeDigits(value);

  if (!digits) {
    return "";
  }

  return digits.length < 4 ? digits.padStart(3, "0") : digits;
}

function formatDateInput(date: Date) {
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, "0");
  const day = String(date.getDate()).padStart(2, "0");

  return `${year}-${month}-${day}`;
}

function parseDateCell(value: unknown) {
  if (value instanceof Date && !Number.isNaN(value.getTime())) {
    return formatDateInput(value);
  }

  if (typeof value === "number") {
    const parsed = XLSX.SSF.parse_date_code(value);
    if (!parsed) {
      return "";
    }

    return formatDateInput(new Date(parsed.y, parsed.m - 1, parsed.d));
  }

  const stringValue = cleanString(value);
  if (!stringValue) {
    return "";
  }

  if (/^\d{2}\/\d{2}\/\d{4}$/.test(stringValue)) {
    const [day, month, year] = stringValue.split("/");
    return `${year}-${month}-${day}`;
  }

  if (/^\d{4}-\d{2}-\d{2}$/.test(stringValue)) {
    return stringValue;
  }

  const date = new Date(stringValue);
  return Number.isNaN(date.getTime()) ? "" : formatDateInput(date);
}

function parseStatus(value: unknown): "ACTIVE" | "INACTIVE" {
  const normalized = normalizeText(value);

  if (["baja", "inactivo", "inactiva", "inactive", "no", "0"].includes(normalized)) {
    return "INACTIVE";
  }

  return "ACTIVE";
}

function parseMoneyInput(value: unknown) {
  const stringValue = cleanString(value);

  if (!stringValue) {
    return "0,00";
  }

  const normalized = stringValue
    .replace(/\s/g, "")
    .replace(/\$/g, "")
    .replace(/\.(?=.*[,])/g, "")
    .replace(",", ".");
  const parsed = Number(normalized);

  if (!Number.isFinite(parsed)) {
    return stringValue;
  }

  return parsed.toFixed(2).replace(".", ",");
}

function toCentsFromInput(value: string) {
  const normalized = value.replace(/\./g, "").replace(",", ".");
  const parsed = Number(normalized);

  return Number.isFinite(parsed) ? Math.round(parsed * 100) : 0;
}

function findHeaderRow(matrix: unknown[][]) {
  let bestIndex = -1;
  let bestScore = 0;

  matrix.slice(0, 12).forEach((row, index) => {
    const normalizedRow = row.map(normalizeText);
    const score = (Object.keys(headerAliases) as ColumnKey[]).reduce((total, key) => {
      const matched = normalizedRow.some((cell) =>
        headerAliases[key].some((alias) => normalizeText(alias) === cell),
      );

      return total + (matched ? 1 : 0);
    }, 0);

    if (score > bestScore) {
      bestScore = score;
      bestIndex = index;
    }
  });

  return bestScore >= 4 ? bestIndex : -1;
}

function detectColumnsFromHeader(row: unknown[]) {
  const detected: DetectedColumns = {};
  const normalizedRow = row.map(normalizeText);

  for (const key of Object.keys(headerAliases) as ColumnKey[]) {
    const columnIndex = normalizedRow.findIndex((cell) =>
      headerAliases[key].some((alias) => normalizeText(alias) === cell),
    );

    if (columnIndex >= 0) {
      detected[key] = columnIndex;
    }
  }

  return detected;
}

export async function parseEmployeesWorkbook(
  fileBuffer: ArrayBuffer,
  existingEmployees: ExistingEmployeeKey[],
) {
  const workbook = XLSX.read(fileBuffer, { type: "array", cellDates: true });
  const firstSheetName = workbook.SheetNames[0];

  if (!firstSheetName) {
    return {
      issues: [{ rowNumber: 0, message: "El archivo no contiene hojas." }],
      parsedRows: [],
    };
  }

  const worksheet = workbook.Sheets[firstSheetName];
  const matrix = XLSX.utils.sheet_to_json<unknown[]>(worksheet, {
    header: 1,
    defval: "",
    raw: true,
    blankrows: false,
  });

  if (matrix.length === 0) {
    return {
      issues: [{ rowNumber: 0, message: "La hoja seleccionada no tiene filas con datos." }],
      parsedRows: [],
    };
  }

  const headerRowIndex = findHeaderRow(matrix);
  if (headerRowIndex < 0) {
    return {
      issues: [
        {
          rowNumber: 0,
          message: "No se encontro una fila de encabezados con los datos basicos del empleado.",
        },
      ],
      parsedRows: [],
    };
  }

  const columns = detectColumnsFromHeader(matrix[headerRowIndex] ?? []);
  const missingColumns = [
    columns.legajo === undefined && "Legajo",
    columns.dni === undefined && "DNI",
    columns.apellido === undefined && "Apellido",
    columns.nombre === undefined && "Nombre",
    columns.categoria === undefined && "Categoria",
    columns.cuil === undefined && "CUIL",
    columns.fechaIngreso === undefined && "Fecha de ingreso",
  ].filter(Boolean);

  if (missingColumns.length > 0) {
    return {
      issues: [
        {
          rowNumber: headerRowIndex + 1,
          message: `Faltan columnas requeridas: ${missingColumns.join(", ")}.`,
        },
      ],
      parsedRows: [],
    };
  }

  const existingLegajos = new Set(existingEmployees.map((employee) => employee.legajo));
  const existingDnis = new Set(existingEmployees.map((employee) => employee.dni));
  const existingCuils = new Set(existingEmployees.map((employee) => employee.cuil));
  const seenLegajos = new Set<string>();
  const seenDnis = new Set<string>();
  const seenCuils = new Set<string>();
  const issues: EmployeeImportIssue[] = [];
  const parsedRows: ParsedEmployeeImportRow[] = [];

  matrix.slice(headerRowIndex + 1).forEach((row, index) => {
    const rowNumber = headerRowIndex + index + 2;

    if (!row.some((cell) => cleanString(cell) !== "")) {
      return;
    }

    const submittedValues = {
      legajo: normalizeLegajo(getCell(row, columns.legajo)),
      dni: normalizeDigits(getCell(row, columns.dni)),
      apellido: cleanString(getCell(row, columns.apellido)),
      nombre: cleanString(getCell(row, columns.nombre)),
      categoria: cleanString(getCell(row, columns.categoria)),
      cuil: normalizeDigits(getCell(row, columns.cuil)),
      fechaIngreso: parseDateCell(getCell(row, columns.fechaIngreso)),
      status: parseStatus(getCell(row, columns.status)),
      openingBalance: parseMoneyInput(getCell(row, columns.openingBalance)),
      notes: cleanString(getCell(row, columns.notes)),
    };

    const parsed = employeeSchema.safeParse(submittedValues);
    if (!parsed.success) {
      issues.push({
        rowNumber,
        message: parsed.error.issues[0]?.message ?? "Fila invalida.",
      });
      return;
    }

    if (existingLegajos.has(parsed.data.legajo) || seenLegajos.has(parsed.data.legajo)) {
      issues.push({ rowNumber, message: `Legajo duplicado u omitido: ${parsed.data.legajo}.` });
      return;
    }

    if (existingDnis.has(parsed.data.dni) || seenDnis.has(parsed.data.dni)) {
      issues.push({ rowNumber, message: `DNI duplicado u omitido: ${parsed.data.dni}.` });
      return;
    }

    if (existingCuils.has(parsed.data.cuil) || seenCuils.has(parsed.data.cuil)) {
      issues.push({ rowNumber, message: `CUIL duplicado u omitido: ${parsed.data.cuil}.` });
      return;
    }

    seenLegajos.add(parsed.data.legajo);
    seenDnis.add(parsed.data.dni);
    seenCuils.add(parsed.data.cuil);

    parsedRows.push({
      rowNumber,
      legajo: parsed.data.legajo,
      dni: parsed.data.dni,
      apellido: parsed.data.apellido.toUpperCase(),
      nombre: parsed.data.nombre.toUpperCase(),
      categoria: parsed.data.categoria.toUpperCase(),
      cuil: parsed.data.cuil,
      fechaIngreso: new Date(`${parsed.data.fechaIngreso}T00:00:00`),
      status: parsed.data.status,
      openingBalanceCents: toCentsFromInput(parsed.data.openingBalance || "0,00"),
      notes: parsed.data.notes || null,
    });
  });

  return { issues, parsedRows };
}
