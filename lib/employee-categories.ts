import { prisma } from "@/lib/prisma";

export async function getEmployeeCategories() {
  const rows = await prisma.employee.findMany({
    distinct: ["categoria"],
    select: { categoria: true },
    orderBy: { categoria: "asc" },
  });

  return rows
    .map((row) => row.categoria.trim())
    .filter((categoria, index, categories) => categoria.length > 0 && categories.indexOf(categoria) === index);
}
