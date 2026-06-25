export type EmployeeFormValues = {
  id?: string;
  legajo?: string;
  dni?: string;
  apellido?: string;
  nombre?: string;
  categoria?: string;
  cuil?: string;
  fechaIngreso?: string;
  status?: "ACTIVE" | "INACTIVE";
  openingBalance?: string;
  notes?: string | null;
};

export type EmployeeFieldName = keyof EmployeeFormValues;

export type EmployeeFormState = {
  status: "idle" | "success" | "error";
  message: string | null;
  fieldErrors: Partial<Record<EmployeeFieldName, string>>;
  values: EmployeeFormValues;
};

export const initialEmployeeFormState: EmployeeFormState = {
  status: "idle",
  message: null,
  fieldErrors: {},
  values: {
    status: "ACTIVE",
    openingBalance: "0,00",
  },
};
