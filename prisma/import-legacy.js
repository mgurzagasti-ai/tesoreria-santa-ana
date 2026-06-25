const fs = require("fs");
const path = require("path");
const mysql = require("mysql2/promise");
const { PrismaClient } = require("@prisma/client");

loadEnvFile(path.resolve(__dirname, "..", ".env"));

const prisma = new PrismaClient();

const monthLookup = new Map([
  ["enero", 1],
  ["febrero", 2],
  ["marzo", 3],
  ["abril", 4],
  ["mayo", 5],
  ["junio", 6],
  ["julio", 7],
  ["agosto", 8],
  ["septiembre", 9],
  ["setiembre", 9],
  ["octubre", 10],
  ["noviembre", 11],
  ["diciembre", 12],
]);

function normalizeText(value) {
  return String(value ?? "")
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .toLowerCase()
    .replace(/[^\w\s./-]/g, " ")
    .replace(/\s+/g, " ")
    .trim();
}

function cleanString(value) {
  return String(value ?? "").trim();
}

function loadEnvFile(filePath) {
  if (!fs.existsSync(filePath)) {
    return;
  }

  const lines = fs.readFileSync(filePath, "utf8").split(/\r?\n/);

  for (const line of lines) {
    const trimmed = line.trim();
    if (!trimmed || trimmed.startsWith("#")) {
      continue;
    }

    const separatorIndex = trimmed.indexOf("=");
    if (separatorIndex <= 0) {
      continue;
    }

    const key = trimmed.slice(0, separatorIndex).trim();
    let value = trimmed.slice(separatorIndex + 1).trim();

    if (
      (value.startsWith('"') && value.endsWith('"')) ||
      (value.startsWith("'") && value.endsWith("'"))
    ) {
      value = value.slice(1, -1);
    }

    if (!(key in process.env)) {
      process.env[key] = value;
    }
  }
}

function padLegajo(value) {
  const digits = cleanString(value).replace(/\D/g, "");
  return digits.padStart(3, "0");
}

function parseLegacyAmount(value) {
  const raw = cleanString(value);
  if (!raw || raw === "-") {
    return 0;
  }

  const normalized = raw.includes(",") && raw.includes(".")
    ? raw.replace(/\./g, "").replace(",", ".")
    : raw.replace(",", ".");
  const parsed = Number(normalized);
  return Number.isFinite(parsed) ? parsed : 0;
}

function toCents(amount) {
  return Math.round(Math.abs(amount) * 100);
}

function parseLegacyDate(value) {
  const raw = cleanString(value);
  if (!raw) {
    return null;
  }

  if (/^\d{4}-\d{2}-\d{2}$/.test(raw)) {
    return new Date(`${raw}T00:00:00`);
  }

  if (/^\d{2}\/\d{2}\/\d{4}$/.test(raw)) {
    const [day, month, year] = raw.split("/");
    return new Date(`${year}-${month}-${day}T00:00:00`);
  }

  const parsed = new Date(raw);
  return Number.isNaN(parsed.getTime()) ? null : parsed;
}

function resolvePeriodMonth(rawMonth, movementDate) {
  const value = cleanString(rawMonth);
  if (!value) {
    return movementDate.getMonth() + 1;
  }

  const numeric = Number(value);
  if (Number.isInteger(numeric) && numeric >= 1 && numeric <= 12) {
    return numeric;
  }

  return monthLookup.get(normalizeText(value)) ?? movementDate.getMonth() + 1;
}

function resolvePeriodYear(rawYear, movementDate) {
  const value = cleanString(rawYear);
  const numeric = Number(value);

  if (Number.isInteger(numeric) && numeric >= 2000 && numeric <= 2100) {
    return numeric;
  }

  return movementDate.getFullYear();
}

function normalizeVoucher(value) {
  const voucher = cleanString(value);
  if (!voucher || voucher === "-" || voucher === "0") {
    return null;
  }
  return voucher.toUpperCase();
}

function resolveMovementCategory({ concept, debitAmount, creditAmount, voucherNumber }) {
  const normalized = normalizeText(concept);
  const isDebit = debitAmount < 0 || (debitAmount !== 0 && creditAmount === 0);

  if (isDebit) {
    if (normalized.includes("anticipo")) {
      return "ADVANCE";
    }

    if (
      voucherNumber ||
      normalized.includes("vale") ||
      normalized.includes("carnet sanitario") ||
      normalized.includes("faltante de caja") ||
      normalized.includes("optica") ||
      normalized.includes("liquidacion final")
    ) {
      return "VALE";
    }

    return "ADJUSTMENT_DEBIT";
  }

  if (normalized.includes("aguinaldo") || normalized.includes("sac")) {
    return "SAC";
  }

  if (normalized.includes("sueldo") || normalized.includes("haberes")) {
    return "SALARY";
  }

  if (
    normalized.includes("cancelacion") ||
    normalized.includes("liquidacion") ||
    normalized.includes("pago") ||
    normalized.includes("acta") ||
    normalized.includes("acuerdo") ||
    normalized.includes("dif.")
  ) {
    return "SETTLEMENT";
  }

  return "ADJUSTMENT_CREDIT";
}

function inferTypeFromCategory(category) {
  return ["SALARY", "SAC", "SETTLEMENT", "ADJUSTMENT_CREDIT"].includes(category)
    ? "CREDIT"
    : "DEBIT";
}

function buildMovementKey(row) {
  return [
    row.employeeId,
    row.category,
    row.concept,
    row.movementDate.toISOString().slice(0, 10),
    row.periodMonth,
    row.periodYear,
    row.amountCents,
    row.voucherNumber ?? "",
  ].join("|");
}

function readJsonFile(filePath, expectedLabel) {
  if (!filePath) {
    throw new Error(`Falta definir ${expectedLabel}.`);
  }

  const resolvedPath = path.resolve(filePath);
  const content = fs.readFileSync(resolvedPath, "utf8");
  const parsed = JSON.parse(content);

  if (!Array.isArray(parsed)) {
    throw new Error(`${expectedLabel} debe contener un arreglo JSON.`);
  }

  return parsed;
}

async function loadLegacyFromMySql(connectionUrl) {
  const connection = await mysql.createConnection(connectionUrl);

  try {
    const [employees] = await connection.query(
      "SELECT Cod, Leg, Dni, Apellido, Nombre, Categoria, Cuil, FechaIngreso, Activo FROM empleados ORDER BY Leg ASC",
    );
    const [movements] = await connection.query(
      "SELECT Cod, Leg, Fecha, Concepto, NVale, Mes, Anio, ImporteN, ImporteP FROM saldos ORDER BY Fecha ASC, Cod ASC",
    );

    return {
      employees,
      movements,
      sourceLabel: "legacy:mysql",
    };
  } finally {
    await connection.end();
  }
}

function loadLegacyFromJson() {
  return {
    employees: readJsonFile(process.env.LEGACY_EMPLOYEES_JSON, "LEGACY_EMPLOYEES_JSON"),
    movements: readJsonFile(process.env.LEGACY_SALDOS_JSON, "LEGACY_SALDOS_JSON"),
    sourceLabel: "legacy:json",
  };
}

async function loadLegacySource() {
  if (process.env.LEGACY_MYSQL_URL) {
    return loadLegacyFromMySql(process.env.LEGACY_MYSQL_URL);
  }

  if (process.env.LEGACY_EMPLOYEES_JSON && process.env.LEGACY_SALDOS_JSON) {
    return loadLegacyFromJson();
  }

  throw new Error(
    "Define LEGACY_MYSQL_URL o bien LEGACY_EMPLOYEES_JSON y LEGACY_SALDOS_JSON para importar la base legacy.",
  );
}

async function upsertEmployees(legacyEmployees) {
  const employeeIdsByLegajo = new Map();
  let created = 0;
  let updated = 0;
  let skipped = 0;

  for (const row of legacyEmployees) {
    const legajo = padLegajo(row.Leg ?? row.leg ?? row.legajo);
    const dni = cleanString(row.Dni ?? row.dni);
    const cuil = cleanString(row.Cuil ?? row.cuil);
    const apellido = cleanString(row.Apellido ?? row.apellido).toUpperCase();
    const nombre = cleanString(row.Nombre ?? row.nombre).toUpperCase();
    const categoria = cleanString(row.Categoria ?? row.categoria).toUpperCase();
    const fechaIngreso = parseLegacyDate(row.FechaIngreso ?? row.fechaIngreso);
    const statusRaw = cleanString(row.Activo ?? row.activo).toUpperCase();

    if (!legajo || !dni || !cuil || !apellido || !nombre || !categoria || !fechaIngreso) {
      skipped += 1;
      continue;
    }

    const existing = await prisma.employee.findFirst({
      where: {
        OR: [{ legajo }, { dni }, { cuil }],
      },
      select: { id: true, legajo: true, openingBalanceCents: true, notes: true },
    });

    const data = {
      legajo,
      dni,
      apellido,
      nombre,
      categoria,
      cuil,
      fechaIngreso,
      status: statusRaw === "N" ? "INACTIVE" : "ACTIVE",
      openingBalanceCents: existing?.openingBalanceCents ?? 0,
      notes: existing?.notes ?? null,
    };

    const saved = existing
      ? await prisma.employee.update({
          where: { id: existing.id },
          data,
          select: { id: true },
        })
      : await prisma.employee.create({
          data,
          select: { id: true },
        });

    if (existing) {
      updated += 1;
    } else {
      created += 1;
    }

    employeeIdsByLegajo.set(legajo, saved.id);
  }

  return { employeeIdsByLegajo, created, updated, skipped };
}

async function importMovements(legacyMovements, employeeIdsByLegajo, sourceLabel) {
  const employeeIds = [...new Set(employeeIdsByLegajo.values())];
  const existingMovements = await prisma.movement.findMany({
    where: {
      employeeId: { in: employeeIds },
    },
    select: {
      employeeId: true,
      category: true,
      concept: true,
      movementDate: true,
      periodMonth: true,
      periodYear: true,
      amountCents: true,
      voucherNumber: true,
    },
  });

  const existingKeys = new Set(existingMovements.map(buildMovementKey));
  const rowsToInsert = [];
  let skippedMissingEmployee = 0;
  let skippedInvalid = 0;
  let duplicated = 0;

  for (const row of legacyMovements) {
    const legajo = padLegajo(row.Leg ?? row.leg ?? row.legajo);
    const employeeId = employeeIdsByLegajo.get(legajo);

    if (!employeeId) {
      skippedMissingEmployee += 1;
      continue;
    }

    const movementDate = parseLegacyDate(row.Fecha ?? row.fecha);
    const concept = cleanString(row.Concepto ?? row.concepto).toUpperCase();
    const debitAmount = parseLegacyAmount(row.ImporteN ?? row.importeN);
    const creditAmount = parseLegacyAmount(row.ImporteP ?? row.importeP);
    const voucherNumber = normalizeVoucher(row.NVale ?? row.nVale ?? row.voucherNumber);

    if (!movementDate || !concept || (debitAmount === 0 && creditAmount === 0)) {
      skippedInvalid += 1;
      continue;
    }

    const category = resolveMovementCategory({
      concept,
      debitAmount,
      creditAmount,
      voucherNumber,
    });
    const amount = creditAmount !== 0 ? creditAmount : debitAmount;
    const amountCents = toCents(amount);

    if (amountCents === 0) {
      skippedInvalid += 1;
      continue;
    }

    const movement = {
      employeeId,
      type: inferTypeFromCategory(category),
      category,
      concept,
      voucherNumber,
      movementDate,
      periodMonth: resolvePeriodMonth(row.Mes ?? row.mes, movementDate),
      periodYear: resolvePeriodYear(row.Anio ?? row.anio, movementDate),
      amountCents,
      installments: null,
      installmentNo: null,
      importedFrom: sourceLabel,
    };

    const key = buildMovementKey(movement);
    if (existingKeys.has(key)) {
      duplicated += 1;
      continue;
    }

    existingKeys.add(key);
    rowsToInsert.push(movement);
  }

  if (rowsToInsert.length > 0) {
    await prisma.movement.createMany({
      data: rowsToInsert,
    });
  }

  return {
    inserted: rowsToInsert.length,
    duplicated,
    skippedMissingEmployee,
    skippedInvalid,
  };
}

async function main() {
  const legacy = await loadLegacySource();
  const employeeSummary = await upsertEmployees(legacy.employees);
  const movementSummary = await importMovements(
    legacy.movements,
    employeeSummary.employeeIdsByLegajo,
    legacy.sourceLabel,
  );

  console.log("Importacion legacy finalizada.");
  console.log(
    JSON.stringify(
      {
        employees: {
          created: employeeSummary.created,
          updated: employeeSummary.updated,
          skipped: employeeSummary.skipped,
        },
        movements: movementSummary,
      },
      null,
      2,
    ),
  );
}

main()
  .catch((error) => {
    console.error(error);
    process.exitCode = 1;
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
