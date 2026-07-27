import type { EmployeeImportIssue } from "@/lib/employee-excel-import";

export type EmployeeImportFormState = {
  status: "idle" | "success" | "error";
  message: string | null;
  fieldErrors: {
    file?: string;
  };
  issues: EmployeeImportIssue[];
};

export const initialEmployeeImportFormState: EmployeeImportFormState = {
  status: "idle",
  message: null,
  fieldErrors: {},
  issues: [],
};
