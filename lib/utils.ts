export function cn(...values: Array<string | false | null | undefined>) {
  return values.filter(Boolean).join(" ");
}

export const movementCategoryOptions = [
  { value: "ADVANCE", label: "Anticipo de haberes", type: "DEBIT" },
  { value: "VALE", label: "Vale", type: "DEBIT" },
  { value: "SALARY", label: "Sueldo", type: "CREDIT" },
  { value: "SAC", label: "SAC", type: "CREDIT" },
  { value: "SETTLEMENT", label: "Cancelacion de haberes", type: "CREDIT" },
  { value: "LIQUIDACION_FINAL", label: "Liquidacion final", type: "CREDIT" },
  { value: "VARIOUS", label: "Varios", type: "DEBIT" },
  { value: "ADJUSTMENT_DEBIT", label: "Ajuste negativo", type: "DEBIT" },
  { value: "ADJUSTMENT_CREDIT", label: "Ajuste positivo", type: "CREDIT" },
] as const;

export type MovementCategory = (typeof movementCategoryOptions)[number]["value"];

export function formatCurrencyFromCents(amountCents: number) {
  return new Intl.NumberFormat("es-AR", {
    style: "currency",
    currency: "ARS",
    minimumFractionDigits: 2,
  }).format(amountCents / 100);
}

export function toCents(amount: string) {
  const normalized = amount.replace(/\./g, "").replace(",", ".").trim();
  const value = Number(normalized);

  if (Number.isNaN(value)) {
    throw new Error("Importe invalido.");
  }

  return Math.round(value * 100);
}

export function centsToInputValue(amountCents: number) {
  return (amountCents / 100).toFixed(2).replace(".", ",");
}

export function formatDateInput(date: Date) {
  const year = date.getFullYear();
  const month = `${date.getMonth() + 1}`.padStart(2, "0");
  const day = `${date.getDate()}`.padStart(2, "0");
  return `${year}-${month}-${day}`;
}

export function getMonthName(month: number) {
  return [
    "Enero",
    "Febrero",
    "Marzo",
    "Abril",
    "Mayo",
    "Junio",
    "Julio",
    "Agosto",
    "Septiembre",
    "Octubre",
    "Noviembre",
    "Diciembre",
  ][month - 1];
}

export function getMovementCategoryLabel(category: string) {
  return movementCategoryOptions.find((option) => option.value === category)?.label ?? category;
}

export function inferMovementType(category: string) {
  return movementCategoryOptions.find((option) => option.value === category)?.type ?? "DEBIT";
}

export function getSignedAmountCents(movement: { type: string; amountCents: number }) {
  return movement.type === "CREDIT" ? movement.amountCents : -movement.amountCents;
}

export function formatSignedCurrencyFromCents(amountCents: number) {
  const absolute = formatCurrencyFromCents(Math.abs(amountCents));

  if (amountCents > 0) {
    return `+\u00A0${absolute}`;
  }

  if (amountCents < 0) {
    return `-\u00A0${absolute}`;
  }

  return formatCurrencyFromCents(0);
}

export function getBalanceLabel(balanceCents: number) {
  if (balanceCents > 0) {
    return "A cobrar";
  }

  if (balanceCents < 0) {
    return "Pendiente";
  }

  return "Sin saldo";
}
