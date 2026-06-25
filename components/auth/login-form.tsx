"use client";

import { useActionState } from "react";
import { loginAction } from "@/app/actions/auth";
import { initialLoginFormState } from "@/lib/login-form";

export function LoginForm() {
  const [state, formAction, pending] = useActionState(loginAction, initialLoginFormState);

  return (
    <form action={formAction} className="panel form-panel">
      <div className="form-header">
        <p className="eyebrow">Acceso Seguro</p>
        <h1>Ingreso a Tesoreria</h1>
        <p className="muted">
          Protegimos la informacion sensible con autenticacion y sesiones seguras.
        </p>
      </div>

      <label className={state.fieldErrors.email ? "field field-error" : "field"}>
        <span>Email</span>
        <input
          name="email"
          type="email"
          placeholder="admin@tesoreria.local"
          required
          defaultValue={state.values.email}
        />
        {state.fieldErrors.email ? <small className="field-error-text">{state.fieldErrors.email}</small> : null}
      </label>

      <label className={state.fieldErrors.password ? "field field-error" : "field"}>
        <span>Contrasena</span>
        <input name="password" type="password" placeholder="Ingresa tu contrasena" required />
        {state.fieldErrors.password ? (
          <small className="field-error-text">{state.fieldErrors.password}</small>
        ) : null}
      </label>

      {state.status === "error" && state.message ? <p className="form-error">{state.message}</p> : null}

      <button className="button primary" type="submit" disabled={pending}>
        {pending ? "Ingresando..." : "Entrar"}
      </button>
    </form>
  );
}
