import * as XLSX from "xlsx";
import { movementCategoryOptions, toCents } from "@/lib/utils";

type EmployeeLookup = {
  id: string;
  legajo: string;
  apellido: string;
  nombre: string;
};

type ConceptLookup = {
  id: string;
  code: string;
  description: string;
  impact: string;
};

type ParsedMovementRow = {
  employeeId: string;
  employeeLabel: string;
  conceptId: string | null;
  category: string;
  code: string | null;
  type: string;
  concept: string;
  voucherNumber: string | null;
  movementDate: Date;
  periodMonth: number;
  periodYear: number;
  amountCents: number;
  importedFrom: string;
};

type ImportIssue = {
  rowNumber: number;
  message: string;
};

type ImportResult = {
  issues: ImportIssue[];
  parsedRows: ParsedMovementRow[];
};

type ParsedBalanceRow = {
  employeeId: string;
  employeeLabel: string;
  balanceCents: number;
};

type BalanceImportResult = {
  issues: ImportIssue[];
  parsedRows: ParsedBalanceRow[];
  detectedAsBalanceWorkbook: boolean;
};

type ColumnKey =
  | "legajo"
  | "fecha"
  | "concepto"
  | "categoria"
  | "voucherNumber"
  | "periodMonth"
  | "periodYear"
  | "amount";

type DetectedColumns = Partial<Record<ColumnKey, number>>;

const legajoAliases = ["legajo", "n legajo", "nro legajo", "nro. legajo", "codigo", "cod legajo", "leg"] as const;
const balanceAliases = ["saldo", "saldo actual", "saldo al", "saldo mayo", "saldo junio"] as const;

const categorySynonyms: Array<{ keywords: string[]; value: string }> = [
  { keywords: ["anticipo", "anticipos"], value: "ADVANCE" },
  { keywords: ["vale", "vales"], value: "VALE" },
  { keywords: ["sueldo", "sueldos", "haber", "haberes"], value: "SALARY" },
  { keywords: ["sac", "aguinaldo"], value: "SAC" },
  { keywords: ["cancelacion", "cancelación", "liquidacion", "liquidación"], value: "SETTLEMENT" },
  { keywords: ["ajuste positivo"], value: "ADJUSTMENT_CREDIT" },
  { keywords: ["ajuste negativo"], value: "ADJUSTMENT_DEBIT" },
] as const;

const headerAliases: Record<ColumnKey, string[]> = {
  legajo: ["legajo", "n legajo", "nro legajo", "nro. legajo", "codigo", "cod legajo", "leg"],
  fecha: ["fecha", "fecha movimiento", "fec", "fecha comprobante"],
  concepto: ["concepto", "detalle", "descripcion", "descripción", "movimiento", "item", "concept"],
  categoria: ["categoria", "categoría", "tipo", "tipo movimiento", "clase"],
  voucherNumber: ["n vale", "nro vale", "nro. vale", "vale", "n comprobante", "nro comprobante", "comprobante"],
  periodMonth: ["mes", "periodo mes", "periodo", "per mes"],
  periodYear: ["anio", "año", "periodo anio", "periodo año", "per anio", "per año"],
  amount: ["importe", "monto", "valor", "haber", "haberes", "descuento", "neto", "total"],
};

const salaryCategory = movementCategoryOptions.find((option) => option.value === "SALARY")!;
const sacCategory = movementCategoryOptions.find((option) => option.value === "SAC")!;
const adjustmentDebitCategory =
  movementCategoryOptions.find((option) => option.value === "ADJUSTMENT_DEBIT")!;

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

function isEmptyCell(value: unknown) {
  return cleanString(value) === "";
}

function padLegajo(value: unknown) {
  const digits = cleanString(value).replace(/\D/g, "");
  return digits ? digits.padStart(3, "0") : "";
}

function parseLooseAmount(value: unknown) {
  const stringValue = cleanString(value);
  if (!stringValue) {
    return null;
  }

  const normalized = stringValue
    .replace(/\s/g, "")
    .replace(/\$/g, "")
    .replace(/\.(?=.*[,])/g, "")
    .replace(",", ".");
  const numeric = Number(normalized);

  return Number.isFinite(numeric) ? numeric : null;
}

function isPlausibleWorkbookDate(date: Date) {
  const year = date.getFullYear();
  return year >= 2000 && year <= 2100;
}

function excelDateToIso(value: unknown) {
  if (value instanceof Date) {
    return isPlausibleWorkbookDate(value) ? value : null;
  }

  if (typeof value === "number") {
    const parsed = XLSX.SSF.parse_date_code(value);
    if (!parsed) {
      return null;
    }

    const date = new Date(parsed.y, parsed.m - 1, parsed.d);
    return isPlausibleWorkbookDate(date) ? date : null;
  }

  const stringValue = cleanString(value);
  if (!stringValue) {
    return null;
  }

  if (/^\d{2}\/\d{2}\/\d{4}$/.test(stringValue)) {
    const [day, month, year] = stringValue.split("/");
    const date = new Date(`${year}-${month}-${day}T00:00:00`);
    if (Number.isNaN(date.getTime())) {
      return null;
    }

    return isPlausibleWorkbookDate(date) ? date : null;
  }

  const date = new Date(stringValue);
  if (Number.isNaN(date.getTime())) {
    return null;
  }

  return isPlausibleWorkbookDate(date) ? date : null;
}

function parseMonth(value: unknown, fallbackDate: Date | null) {
  const parsedDate = excelDateToIso(value);
  if (parsedDate) {
    return parsedDate.getMonth() + 1;
  }

  const stringValue = cleanString(value);
  if (!stringValue) {
    return fallbackDate ? fallbackDate.getMonth() + 1 : null;
  }

  const numeric = Number(stringValue);
  if (!Number.isNaN(numeric) && numeric >= 1 && numeric <= 12) {
    return Math.trunc(numeric);
  }

  const normalized = normalizeText(stringValue);
  const months = [
    "enero",
    "febrero",
    "marzo",
    "abril",
    "mayo",
    "junio",
    "julio",
    "agosto",
    "septiembre",
    "octubre",
    "noviembre",
    "diciembre",
  ];
  const monthIndex = months.findIndex((month) => normalized === month || normalized.includes(month));

  return monthIndex >= 0 ? monthIndex + 1 : null;
}

function parseYear(value: unknown, fallbackDate: Date | null) {
  const parsedDate = excelDateToIso(value);
  if (parsedDate) {
    return parsedDate.getFullYear();
  }

  const stringValue = cleanString(value);
  if (!stringValue) {
    return fallbackDate ? fallbackDate.getFullYear() : null;
  }

  const numeric = Number(stringValue);
  if (!Number.isNaN(numeric) && numeric >= 2000 && numeric <= 2100) {
    return Math.trunc(numeric);
  }

  const normalized = normalizeText(stringValue);
  const yearMatch = normalized.match(/\b(20\d{2})\b/);
  if (yearMatch) {
    return Number(yearMatch[1]);
  }

  return null;
}

function resolveCategory(rawCategory: unknown, rawConcept: unknown) {
  const categoryValue = normalizeText(rawCategory);
  const conceptValue = normalizeText(rawConcept);
  const joined = `${categoryValue} ${conceptValue}`.trim();

  const explicit = movementCategoryOptions.find(
    (option) => normalizeText(option.label) === categoryValue || normalizeText(option.value) === categoryValue,
  );

  if (explicit) {
    return explicit;
  }

  const synonymMatch = categorySynonyms.find((entry) =>
    entry.keywords.some((keyword) => joined.includes(normalizeText(keyword))),
  );

  if (!synonymMatch) {
    return null;
  }

  return movementCategoryOptions.find((option) => option.value === synonymMatch.value) ?? null;
}

function findHeaderRow(matrix: unknown[][]) {
  let bestIndex = -1;
  let bestScore = 0;

  matrix.slice(0, 10).forEach((row, index) => {
    const normalizedRow = row.map(normalizeText);
    const score = (Object.keys(headerAliases) as ColumnKey[]).reduce((acc, key) => {
      const matched = normalizedRow.some((cell) => headerAliases[key].some((alias) => normalizeText(alias) === cell));
      return acc + (matched ? 1 : 0);
    }, 0);

    if (score > bestScore) {
      bestScore = score;
      bestIndex = index;
    }
  });

  return bestScore >= 2 ? bestIndex : -1;
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

function detectBalanceColumnsFromHeader(row: unknown[]) {
  const normalizedRow = row.map(normalizeText);

  const legajoColumn = normalizedRow.findIndex((cell) =>
    legajoAliases.some((alias) => cell === normalizeText(alias)),
  );
  const balanceColumn = normalizedRow.findIndex((cell) =>
    balanceAliases.some((alias) => cell.includes(normalizeText(alias))),
  );

  return {
    legajo: legajoColumn >= 0 ? legajoColumn : undefined,
    balance: balanceColumn >= 0 ? balanceColumn : undefined,
  };
}

function detectColumnsFromData(matrix: unknown[][], employees: EmployeeLookup[]) {
  const detected: DetectedColumns = {};
  const employeeLegajos = new Set(employees.map((employee) => employee.legajo));
  const maxColumns = matrix.reduce((max, row) => Math.max(max, row.length), 0);
  const sampleRows = matrix.slice(0, 25).filter((row) => row.some((cell) => !isEmptyCell(cell)));

  let bestLegajoScore = -1;
  let bestLegajoIndex = -1;
  let bestAmountScore = -1;
  let bestAmountIndex = -1;
  let bestDateScore = -1;
  let bestDateIndex = -1;

  for (let columnIndex = 0; columnIndex < maxColumns; columnIndex += 1) {
    let legajoScore = 0;
    let amountScore = 0;
    let dateScore = 0;

    for (const row of sampleRows) {
      const value = row[columnIndex];
      const legajo = padLegajo(value);
      if (legajo && employeeLegajos.has(legajo)) {
        legajoScore += 2;
      } else if (/^\d{1,6}$/.test(cleanString(value))) {
        legajoScore += 1;
      }

      const amount = parseLooseAmount(value);
      if (amount !== null && Math.abs(amount) > 0) {
        amountScore += 1;
      }

      if (excelDateToIso(value)) {
        dateScore += 1;
      }
    }

    if (legajoScore > bestLegajoScore) {
      bestLegajoScore = legajoScore;
      bestLegajoIndex = columnIndex;
    }

    if (amountScore > bestAmountScore) {
      bestAmountScore = amountScore;
      bestAmountIndex = columnIndex;
    }

    if (dateScore > bestDateScore) {
      bestDateScore = dateScore;
      bestDateIndex = columnIndex;
    }
  }

  if (bestLegajoScore > 0) {
    detected.legajo = bestLegajoIndex;
  }

  if (bestAmountScore > 0) {
    detected.amount = bestAmountIndex;
  }

  if (bestDateScore > 1) {
    detected.fecha = bestDateIndex;
  }

  return detected;
}

function derivePeriodFromText(text: string) {
  const normalized = normalizeText(text);
  const month = parseMonth(normalized, null);
  const yearMatch = normalized.match(/\b(20\d{2})\b/);

  return {
    month,
    year: yearMatch ? Number(yearMatch[1]) : null,
  };
}

function deriveFallbackMetadata(fileName: string, sheetName: string) {
  const combined = `${fileName} ${sheetName}`;
  const period = derivePeriodFromText(combined);
  const now = new Date();

  return {
    month: period.month ?? now.getMonth() + 1,
    year: period.year ?? now.getFullYear(),
    concept:
      period.month || period.year
        ? `HABERES ${period.month ? `${String(period.month).padStart(2, "0")}/` : ""}${period.year ?? ""}`.trim()
        : "HABERES",
    movementDate: new Date(period.year ?? now.getFullYear(), (period.month ?? now.getMonth() + 1) - 1, 1),
    category: salaryCategory,
  };
}

function getCell(row: unknown[], index: number | undefined) {
  return index === undefined ? "" : row[index];
}

function normalizeCode(value: unknown) {
  return cleanString(value).replace(/\s+/g, "").toUpperCase();
}

function findConceptMatch(rawConcept: unknown, rawCategory: unknown, concepts: ConceptLookup[]) {
  const conceptCodeMap = new Map(concepts.map((concept) => [normalizeCode(concept.code), concept]));
  const candidateValues = [rawConcept, rawCategory]
    .map((value) => cleanString(value))
    .filter(Boolean);

  for (const candidate of candidateValues) {
    const exactMatch = conceptCodeMap.get(normalizeCode(candidate));
    if (exactMatch) {
      return exactMatch;
    }

    const codeTokens = candidate.match(/\b[0-9A-Za-z]+\b/g) ?? [];
    for (const token of codeTokens) {
      const tokenMatch = conceptCodeMap.get(normalizeCode(token));
      if (tokenMatch) {
        return tokenMatch;
      }
    }
  }

  const normalizedDescriptionMap = new Map(
    concepts.map((concept) => [normalizeText(concept.description), concept]),
  );

  for (const candidate of candidateValues) {
    const descriptionMatch = normalizedDescriptionMap.get(normalizeText(candidate));
    if (descriptionMatch) {
      return descriptionMatch;
    }
  }

  return null;
}

function resolveDefaultCategoryFromConcept(concept: string) {
  const normalized = normalizeText(concept);

  if (
    normalized.includes("sac") ||
    normalized.includes("aguinaldo")
  ) {
    return sacCategory;
  }

  if (
    normalized.includes("sueldo") ||
    normalized.includes("sueldos") ||
    normalized.includes("haber") ||
    normalized.includes("haberes")
  ) {
    return salaryCategory;
  }

  return adjustmentDebitCategory;
}

export async function parseBalanceWorkbook(
  fileBuffer: ArrayBuffer,
  employees: EmployeeLookup[],
) {
  const workbook = XLSX.read(fileBuffer, { type: "array", cellDates: true });
  const firstSheetName = workbook.SheetNames[0];

  if (!firstSheetName) {
    return {
      issues: [{ rowNumber: 0, message: "El archivo no contiene hojas." }],
      parsedRows: [],
      detectedAsBalanceWorkbook: false,
    } satisfies BalanceImportResult;
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
      detectedAsBalanceWorkbook: false,
    } satisfies BalanceImportResult;
  }

  const headerRowIndex = matrix.findIndex((row) => {
    const normalized = row.map(normalizeText);
    return (
      normalized.some((cell) => legajoAliases.some((alias) => cell === normalizeText(alias))) &&
      normalized.some((cell) => balanceAliases.some((alias) => cell.includes(normalizeText(alias))))
    );
  });

  if (headerRowIndex < 0) {
    return {
      issues: [],
      parsedRows: [],
      detectedAsBalanceWorkbook: false,
    } satisfies BalanceImportResult;
  }

  const columns = detectBalanceColumnsFromHeader(matrix[headerRowIndex] ?? []);
  if (columns.legajo === undefined || columns.balance === undefined) {
    return {
      issues: [
        {
          rowNumber: headerRowIndex + 1,
          message: "No se pudieron identificar las columnas de legajo y saldo.",
        },
      ],
      parsedRows: [],
      detectedAsBalanceWorkbook: true,
    } satisfies BalanceImportResult;
  }

  const employeeByLegajo = new Map(employees.map((employee) => [employee.legajo, employee]));
  const parsedRows: ParsedBalanceRow[] = [];
  const issues: ImportIssue[] = [];
  const dataRows = matrix.slice(headerRowIndex + 1);

  dataRows.forEach((row, index) => {
    const rowNumber = headerRowIndex + index + 2;

    if (!row.some((cell) => !isEmptyCell(cell))) {
      return;
    }

    const legajo = padLegajo(getCell(row, columns.legajo));
    const employee = employeeByLegajo.get(legajo);

    if (!legajo) {
      issues.push({ rowNumber, message: "Fila sin legajo." });
      return;
    }

    if (!employee) {
      issues.push({ rowNumber, message: `No existe empleado con legajo ${legajo}.` });
      return;
    }

    const rawBalance = parseLooseAmount(getCell(row, columns.balance));
    if (rawBalance === null) {
      issues.push({ rowNumber, message: `Saldo invalido o vacio para legajo ${legajo}.` });
      return;
    }

    parsedRows.push({
      employeeId: employee.id,
      employeeLabel: `${employee.legajo} - ${employee.apellido}, ${employee.nombre}`,
      balanceCents: Math.round(rawBalance * 100),
    });
  });

  return {
    issues,
    parsedRows,
    detectedAsBalanceWorkbook: true,
  } satisfies BalanceImportResult;
}

export async function parseHaberesWorkbook(
  fileBuffer: ArrayBuffer,
  fileName: string,
  employees: EmployeeLookup[],
  concepts: ConceptLookup[],
) {
  const workbook = XLSX.read(fileBuffer, { type: "array", cellDates: true });
  const firstSheetName = workbook.SheetNames[0];

  if (!firstSheetName) {
    return {
      issues: [{ rowNumber: 0, message: "El archivo no contiene hojas." }],
      parsedRows: [],
    } satisfies ImportResult;
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
    } satisfies ImportResult;
  }

  const fallback = deriveFallbackMetadata(fileName, firstSheetName);
  const headerRowIndex = findHeaderRow(matrix);
  const headerColumns = headerRowIndex >= 0 ? detectColumnsFromHeader(matrix[headerRowIndex] ?? []) : {};
  const dataRows = headerRowIndex >= 0 ? matrix.slice(headerRowIndex + 1) : matrix;
  const inferredColumns = detectColumnsFromData(dataRows, employees);
  const columns = { ...inferredColumns, ...headerColumns };

  const requiredLabels = [
    columns.legajo === undefined && "legajo",
    columns.amount === undefined && "importe",
  ].filter(Boolean);

  if (requiredLabels.length > 0) {
    return {
      issues: [
        {
          rowNumber: 0,
          message: `No se pudieron identificar columnas clave en Excel: ${requiredLabels.join(", ")}.`,
        },
      ],
      parsedRows: [],
    } satisfies ImportResult;
  }

  const employeeByLegajo = new Map(employees.map((employee) => [employee.legajo, employee]));
  const parsedRows: ParsedMovementRow[] = [];
  const issues: ImportIssue[] = [];

  dataRows.forEach((row, index) => {
    const rowNumber = headerRowIndex >= 0 ? headerRowIndex + index + 2 : index + 1;

    if (!row.some((cell) => !isEmptyCell(cell))) {
      return;
    }

    const legajo = padLegajo(getCell(row, columns.legajo));
    const employee = employeeByLegajo.get(legajo);

    if (!legajo) {
      issues.push({ rowNumber, message: "Fila sin legajo." });
      return;
    }

    if (!employee) {
      issues.push({ rowNumber, message: `No existe empleado con legajo ${legajo}.` });
      return;
    }

    const movementDate =
      excelDateToIso(getCell(row, columns.fecha)) ??
      new Date(fallback.movementDate.getTime());

    const rawConcept = cleanString(getCell(row, columns.concepto));
    const matchedConcept = findConceptMatch(rawConcept, getCell(row, columns.categoria), concepts);
    const concept = (matchedConcept?.description || rawConcept || fallback.concept).toUpperCase();
    const rawPeriodValue = getCell(row, columns.periodMonth);
    const rawPeriodYearValue = getCell(row, columns.periodYear);
    const derivedPeriodFromPeriodCell = derivePeriodFromText(cleanString(rawPeriodValue));
    const derivedPeriodFromConcept = derivePeriodFromText(rawConcept);

    const category =
      (matchedConcept
        ? {
            value: matchedConcept.description,
            label: matchedConcept.description,
            type: matchedConcept.impact,
          }
        : null) ??
      resolveCategory(getCell(row, columns.categoria), concept) ??
      resolveDefaultCategoryFromConcept(concept || fallback.concept) ??
      fallback.category;

    const month =
      parseMonth(rawPeriodValue, null) ??
      parseMonth(rawPeriodYearValue, null) ??
      derivedPeriodFromPeriodCell.month ??
      derivedPeriodFromConcept.month ??
      movementDate.getMonth() + 1;
    const year =
      parseYear(rawPeriodYearValue, null) ??
      derivedPeriodFromPeriodCell.year ??
      derivedPeriodFromConcept.year ??
      movementDate.getFullYear();

    const amountRaw = getCell(row, columns.amount);
    const looseAmount = parseLooseAmount(amountRaw);
    if (looseAmount === null || looseAmount === 0) {
      issues.push({ rowNumber, message: `Importe invalido o vacio para legajo ${legajo}.` });
      return;
    }

    let amountCents = 0;
    try {
      amountCents = toCents(String(Math.abs(looseAmount)).replace(".", ","));
    } catch {
      issues.push({ rowNumber, message: `Importe invalido para legajo ${legajo}.` });
      return;
    }

    parsedRows.push({
      employeeId: employee.id,
      employeeLabel: `${employee.legajo} - ${employee.apellido}, ${employee.nombre}`,
      conceptId: matchedConcept?.id ?? null,
      category: category.value,
      code: matchedConcept?.code ?? null,
      type: category.type,
      concept,
      voucherNumber: cleanString(getCell(row, columns.voucherNumber)) || null,
      movementDate,
      periodMonth: month,
      periodYear: year,
      amountCents,
      importedFrom: fileName,
    });
  });

  return { issues, parsedRows } satisfies ImportResult;
}
