import { getSignedAmountCents } from "@/lib/utils";

type MovementForBalance = {
  id: string;
  type: string;
  category: string;
  code: string | null;
  concept: string;
  voucherNumber: string | null;
  movementDate: Date;
  periodMonth: number;
  periodYear: number;
  amountCents: number;
};

export type BalanceRow = MovementForBalance & {
  signedAmountCents: number;
  runningBalanceCents: number;
};

export function buildBalanceRows(movements: MovementForBalance[], openingBalanceCents = 0) {
  let runningBalanceCents = openingBalanceCents;

  return movements.map<BalanceRow>((movement) => {
    const signedAmountCents = getSignedAmountCents(movement);
    runningBalanceCents += signedAmountCents;

    return {
      ...movement,
      signedAmountCents,
      runningBalanceCents,
    };
  });
}

export function buildBalanceRowsForDateRange(
  movements: MovementForBalance[],
  openingBalanceCents = 0,
  from = "",
) {
  const rows = buildBalanceRows(movements, openingBalanceCents);
  const fromDate = from ? new Date(from) : null;
  const displayRows = fromDate
    ? rows.filter((row) => row.movementDate >= fromDate)
    : rows;
  const rangeOpeningBalanceCents = displayRows[0]
    ? displayRows[0].runningBalanceCents - displayRows[0].signedAmountCents
    : rows.at(-1)?.runningBalanceCents ?? openingBalanceCents;
  const finalBalanceCents = rows.at(-1)?.runningBalanceCents ?? rangeOpeningBalanceCents;

  return {
    rows: displayRows,
    openingBalanceCents: rangeOpeningBalanceCents,
    finalBalanceCents,
  };
}
