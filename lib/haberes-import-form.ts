export type HaberesImportPreviewRow = {
  rowNumber: number;
  employeeId: string;
  employeeLabel: string;
  conceptId: string | null;
  category: string;
  code: string | null;
  type: string;
  concept: string;
  voucherNumber: string | null;
  movementDate: string;
  periodMonth: number;
  periodYear: number;
  amountCents: number;
  amountInput: string;
  importedFrom: string;
  duplicate: boolean;
};

export type HaberesImportIssue = {
  rowNumber: number;
  message: string;
};

export type HaberesImportFormState = {
  status: "idle" | "success" | "error";
  message: string | null;
  fieldErrors: {
    file?: string;
    importKind?: string;
    conceptId?: string;
    conceptDescription?: string;
    paymentDate?: string;
    periodMonth?: string;
    periodYear?: string;
    reviewedRows?: string;
  };
  previewRows: HaberesImportPreviewRow[];
  previewIssues: HaberesImportIssue[];
};

export const initialHaberesImportFormState: HaberesImportFormState = {
  status: "idle",
  message: null,
  fieldErrors: {},
  previewRows: [],
  previewIssues: [],
};
