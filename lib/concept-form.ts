export type ConceptFormValues = {
  id?: string;
  code?: string;
  description?: string;
  impact?: "CREDIT" | "DEBIT";
  status?: "ACTIVE" | "INACTIVE";
};

export type ConceptFieldName = keyof ConceptFormValues;

export type ConceptFormState = {
  status: "idle" | "success" | "error";
  message: string | null;
  fieldErrors: Partial<Record<ConceptFieldName, string>>;
  values: ConceptFormValues;
};

export const initialConceptFormState: ConceptFormState = {
  status: "idle",
  message: null,
  fieldErrors: {},
  values: {
    impact: "CREDIT",
    status: "ACTIVE",
  },
};
