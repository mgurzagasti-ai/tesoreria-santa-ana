import * as XLSX from "xlsx";
import { NextResponse } from "next/server";
import { requireUser } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { getMovementExportGroup } from "@/lib/movement-export";

function normalizeMonth(value: string | null) {
  const numeric = Number(value);
  return Number.isInteger(numeric) && numeric >= 1 && numeric <= 12 ? numeric : null;
}

function normalizeYear(value: string | null) {
  const numeric = Number(value);
  return Number.isInteger(numeric) && numeric >= 2020 && numeric <= 2100 ? numeric : null;
}

function formatAmount(amountCents: number) {
  return Number((amountCents / 100).toFixed(2));
}

function buildFileName(groupLabel: string, month: number, year: number) {
  return `${groupLabel.toLowerCase().replace(/\s+/g, "-")}-${year}-${String(month).padStart(2, "0")}.xlsx`;
}

export async function GET(request: Request) {
  await requireUser();

  const { searchParams } = new URL(request.url);
  const groupId = searchParams.get("group") ?? "";
  const month = normalizeMonth(searchParams.get("month"));
  const year = normalizeYear(searchParams.get("year"));
  const group = getMovementExportGroup(groupId);

  if (!group || month === null || year === null) {
    return NextResponse.json(
      {
        message: "Parametros invalidos para exportar el archivo.",
      },
      { status: 400 },
    );
  }

  const movements = await prisma.movement.findMany({
    where: {
      periodMonth: month,
      periodYear: year,
      OR: [
        { conceptMaster: { impact: group.impact } },
        { conceptId: null, type: group.impact },
      ],
    },
    orderBy: [
      { employee: { legajo: "asc" } },
      { movementDate: "asc" },
      { createdAt: "asc" },
    ],
    select: {
      amountCents: true,
      employee: {
        select: {
          legajo: true,
          apellido: true,
          nombre: true,
        },
      },
    },
  });

  const totalsByEmployee = new Map<
    string,
    { legajo: string; apellidoNombre: string; montoCents: number }
  >();

  movements.forEach((movement) => {
    const key = movement.employee.legajo;
    const current = totalsByEmployee.get(key);
    const nextAmount = (current?.montoCents ?? 0) + movement.amountCents;

    totalsByEmployee.set(key, {
      legajo: movement.employee.legajo,
      apellidoNombre: `${movement.employee.apellido}, ${movement.employee.nombre}`,
      montoCents: nextAmount,
    });
  });

  const rows = [...totalsByEmployee.values()]
    .sort((a, b) => a.legajo.localeCompare(b.legajo, "es", { numeric: true }))
    .map((item) => ({
      Legajo: item.legajo,
      "Apellido y nombre": item.apellidoNombre,
      Monto: formatAmount(item.montoCents),
    }));

  const worksheet = XLSX.utils.json_to_sheet(rows.length > 0 ? rows : [{ Legajo: "", "Apellido y nombre": "", Monto: "" }]);
  worksheet["!cols"] = [{ wch: 12 }, { wch: 36 }, { wch: 16 }];

  const workbook = XLSX.utils.book_new();
  XLSX.utils.book_append_sheet(workbook, worksheet, group.shortTitle);

  const buffer = XLSX.write(workbook, { type: "buffer", bookType: "xlsx" });

  return new NextResponse(buffer, {
    status: 200,
    headers: {
      "Content-Type": "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
      "Content-Disposition": `attachment; filename=\"${buildFileName(group.title, month, year)}\"`,
    },
  });
}
