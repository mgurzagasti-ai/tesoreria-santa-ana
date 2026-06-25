export type HaberesImportFormState = {
  status: "idle" | "success" | "error";
  message: string | null;
  fieldErrors: {
    file?: string;
  };
};

export const initialHaberesImportFormState: HaberesImportFormState = {
  status: "idle",
  message: null,
  fieldErrors: {},
};
