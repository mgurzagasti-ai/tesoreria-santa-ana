export type HaberesImportFormState = {
  status: "idle" | "success" | "error";
  message: string | null;
  fieldErrors: {
    file?: string;
    importKind?: string;
    conceptId?: string;
    conceptDescription?: string;
  };
};

export const initialHaberesImportFormState: HaberesImportFormState = {
  status: "idle",
  message: null,
  fieldErrors: {},
};
