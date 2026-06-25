export type LoginFormValues = {
  email?: string;
  password?: string;
};

export type LoginFieldName = keyof LoginFormValues;

export type LoginFormState = {
  status: "idle" | "error";
  message: string | null;
  fieldErrors: Partial<Record<LoginFieldName, string>>;
  values: LoginFormValues;
};

export const initialLoginFormState: LoginFormState = {
  status: "idle",
  message: null,
  fieldErrors: {},
  values: {
    email: "",
    password: "",
  },
};
