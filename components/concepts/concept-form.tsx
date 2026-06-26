"use client";

import { useActionState, useEffect } from "react";
import { saveConceptAction } from "@/app/actions/concepts";
import {
  type ConceptFieldName,
  type ConceptFormState,
  type ConceptFormValues,
  initialConceptFormState,
} from "@/lib/concept-form";

function fieldClassName(hasError: boolean) {
  return hasError ? "field field-error" : "field";
}

export function ConceptForm({
  initialValues,
  title,
}: {
  initialValues?: ConceptFormValues;
  title: string;
}) {
  const [state, formAction, pending] = useActionState<ConceptFormState, FormData>(
    saveConceptAction,
    initialConceptFormState,
  );

  useEffect(() => {
    if (state.status === "success") {
      const form = document.getElementById(`concept-form-${title}`) as HTMLFormElement | null;
      if (form && !initialValues?.id) {
        form.reset();
      }
    }
  }, [initialValues?.id, state.status, title]);

  const values = { ...initialValues, ...state.values };

  function getFieldError(field: ConceptFieldName) {
    return state.fieldErrors[field];
  }

  return (
    <form id={`concept-form-${title}`} action={formAction} className="panel form-grid">
      <div className="form-header">
        <p className="eyebrow">Conceptos</p>
        <h2>{title}</h2>
      </div>

      {values.id ? <input type="hidden" name="id" defaultValue={values.id} /> : null}

      <label className={fieldClassName(Boolean(getFieldError("code")))}>
        <span>Codigo</span>
        <input
          name="code"
          defaultValue={values.code}
          required
          inputMode="numeric"
          pattern="\d*"
          aria-invalid={Boolean(getFieldError("code"))}
        />
        {getFieldError("code") ? <small className="field-error-text">{getFieldError("code")}</small> : null}
      </label>

      <label className={fieldClassName(Boolean(getFieldError("description")))}>
        <span>Descripcion</span>
        <input
          name="description"
          defaultValue={values.description}
          required
          aria-invalid={Boolean(getFieldError("description"))}
        />
        {getFieldError("description") ? (
          <small className="field-error-text">{getFieldError("description")}</small>
        ) : null}
      </label>

      <label className={fieldClassName(Boolean(getFieldError("impact")))}>
        <span>Impacto en liquidacion</span>
        <select
          name="impact"
          defaultValue={values.impact ?? "CREDIT"}
          aria-invalid={Boolean(getFieldError("impact"))}
        >
          <option value="CREDIT">Suma</option>
          <option value="DEBIT">Resta</option>
        </select>
        {getFieldError("impact") ? <small className="field-error-text">{getFieldError("impact")}</small> : null}
      </label>

      <label className={fieldClassName(Boolean(getFieldError("status")))}>
        <span>Estado</span>
        <select
          name="status"
          defaultValue={values.status ?? "ACTIVE"}
          aria-invalid={Boolean(getFieldError("status"))}
        >
          <option value="ACTIVE">Activo</option>
          <option value="INACTIVE">Baja</option>
        </select>
        {getFieldError("status") ? <small className="field-error-text">{getFieldError("status")}</small> : null}
      </label>

      {state.status === "error" && state.message ? <p className="form-error field-full">{state.message}</p> : null}
      {state.status === "success" ? <p className="form-success field-full">Guardado correctamente.</p> : null}

      <button className="button primary field-full" type="submit" disabled={pending}>
        {pending ? "Guardando..." : values.id ? "Guardar cambios" : "Guardar concepto"}
      </button>
    </form>
  );
}
