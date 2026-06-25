export type MovementFormValues = {
  employeeId?: string;
  category?: string;
  type?: "CREDIT" | "DEBIT";
  concept?: string;
  voucherNumber?: string;
  movementDate?: string;
  periodMonth?: string;
  periodYear?: string;
  amount?: string;
  installments?: string;
  installmentNo?: string;
  importedFrom?: string;
};

export type MovementFieldName = keyof MovementFormValues;

export type MovementFormState = {
  status: "idle" | "success" | "error";
  message: string | null;
  fieldErrors: Partial<Record<MovementFieldName, string>>;
  values: MovementFormValues;
};

export const initialMovementFormState: MovementFormState = {
  status: "idle",
  message: null,
  fieldErrors: {},
  values: {
    category: "ADVANCE",
    type: "DEBIT",
  },
};
