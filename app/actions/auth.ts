"use server";

import bcrypt from "bcryptjs";
import { redirect } from "next/navigation";
import { prisma } from "@/lib/prisma";
import { createSession, destroySession } from "@/lib/auth";
import { type LoginFieldName, type LoginFormState } from "@/lib/login-form";
import { loginSchema } from "@/lib/validations";

export async function loginAction(_: LoginFormState, formData: FormData): Promise<LoginFormState> {
  const submittedValues = {
    email: String(formData.get("email") ?? ""),
    password: String(formData.get("password") ?? ""),
  };

  const parsed = loginSchema.safeParse({
    email: submittedValues.email,
    password: submittedValues.password,
  });

  if (!parsed.success) {
    const fieldErrors: Partial<Record<LoginFieldName, string>> = {};

    for (const issue of parsed.error.issues) {
      const path = issue.path[0];
      if (typeof path === "string" && !(path in fieldErrors)) {
        fieldErrors[path as LoginFieldName] = issue.message;
      }
    }

    return {
      status: "error",
      message: parsed.error.issues[0]?.message ?? "No se pudo iniciar sesion.",
      fieldErrors,
      values: {
        email: submittedValues.email,
        password: "",
      },
    };
  }

  let user;

  try {
    user = await prisma.user.findUnique({
      where: { email: parsed.data.email },
    });
  } catch (error) {
    console.error(error);
    return {
      status: "error",
      message: "No se pudo conectar con la base de datos.",
      fieldErrors: {},
      values: {
        email: submittedValues.email,
        password: "",
      },
    };
  }

  if (!user) {
    return {
      status: "error",
      message: "Credenciales invalidas.",
      fieldErrors: {
        email: "Revisa email o contrasena.",
        password: "Revisa email o contrasena.",
      },
      values: {
        email: submittedValues.email,
        password: "",
      },
    };
  }

  const matches = await bcrypt.compare(parsed.data.password, user.passwordHash);

  if (!matches) {
    return {
      status: "error",
      message: "Credenciales invalidas.",
      fieldErrors: {
        email: "Revisa email o contrasena.",
        password: "Revisa email o contrasena.",
      },
      values: {
        email: submittedValues.email,
        password: "",
      },
    };
  }

  await createSession(user.id);
  redirect("/dashboard");
}

export async function logoutAction() {
  await destroySession();
  redirect("/login");
}
