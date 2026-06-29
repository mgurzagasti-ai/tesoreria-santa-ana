import { prisma } from "@/lib/prisma";

export const movementExportGroups = [
  {
    id: "credit",
    impact: "CREDIT",
    title: "Items que suman",
    shortTitle: "Suman",
    description: "Incluye conceptos que acreditan en la liquidacion, como sueldo, SAC y otros haberes.",
  },
  {
    id: "debit",
    impact: "DEBIT",
    title: "Items que restan",
    shortTitle: "Restan",
    description: "Incluye descuentos, anticipos, vales y el resto de los conceptos que descuentan.",
  },
] as const;

export type MovementExportGroupId = (typeof movementExportGroups)[number]["id"];
export type MovementExportImpact = (typeof movementExportGroups)[number]["impact"];

export function getMovementExportGroup(groupId: string) {
  return movementExportGroups.find((group) => group.id === groupId) ?? null;
}

export async function getMovementExportConceptSummary() {
  const concepts = await prisma.concept.findMany({
    where: { status: "ACTIVE" },
    orderBy: [{ impact: "asc" }, { code: "asc" }],
    select: { code: true, description: true, impact: true },
  });

  return movementExportGroups.map((group) => ({
    ...group,
    concepts: concepts.filter((concept) => concept.impact === group.impact),
  }));
}
