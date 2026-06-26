import { prisma } from "@/lib/prisma";

export const defaultConcepts = [
  { code: "101", description: "ANTICIPO DE HABERES", impact: "DEBIT" },
  { code: "102", description: "VALE", impact: "DEBIT" },
  { code: "201", description: "SUELDO", impact: "CREDIT" },
  { code: "202", description: "SAC", impact: "CREDIT" },
  { code: "203", description: "CANCELACION DE HABERES", impact: "CREDIT" },
  { code: "204", description: "LIQUIDACION FINAL", impact: "CREDIT" },
  { code: "208", description: "GRATIFICACION EXTRAORDINARIA CUOTA 8", impact: "CREDIT" },
  { code: "901", description: "VARIOS", impact: "DEBIT" },
  { code: "902", description: "AJUSTE NEGATIVO", impact: "DEBIT" },
  { code: "903", description: "AJUSTE POSITIVO", impact: "CREDIT" },
] as const;

export async function ensureDefaultConcepts() {
  const count = await prisma.concept.count();

  if (count > 0) {
    return;
  }

  await prisma.concept.createMany({
    data: defaultConcepts.map((concept) => ({
      ...concept,
      status: "ACTIVE",
    })),
  });
}

export async function getActiveConcepts() {
  await ensureDefaultConcepts();

  return prisma.concept.findMany({
    where: { status: "ACTIVE" },
    orderBy: [{ code: "asc" }],
  });
}

export async function getAllConcepts(query?: string) {
  await ensureDefaultConcepts();

  return prisma.concept.findMany({
    where: query
      ? {
          OR: [
            { code: { contains: query } },
            { description: { contains: query } },
          ],
        }
      : undefined,
    orderBy: [{ status: "asc" }, { code: "asc" }],
  });
}
