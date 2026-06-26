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
