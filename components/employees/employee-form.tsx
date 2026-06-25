"use client";

import { useActionState, useEffect } from "react";
import { saveEmployeeAction } from "@/app/actions/employees";
import {
  type EmployeeFieldName,
  type EmployeeFormState,
  type EmployeeFormValues,
  initialEmployeeFormState,
} from "@/lib/employee-form";

function fieldClassName(hasError: boolean) {
  return hasError ? "field field-error" : "field";
}

export function EmployeeForm({
  categories,
  initialValues,
  title,
}: {
  categories: string[];
  initialValues?: EmployeeFormValues;
  title: string;
}) {
  const [state, formAction, pending] = useActionState<EmployeeFormState, FormData>(
    saveEmployeeAction,
    initialEmployeeFormState,
  );

  useEffect(() => {
    if (state.status === "success") {
      const form = document.getElementById(`employee-form-${title}`) as HTMLFormElement | null;
      if (form && !initialValues?.id) {
        form.reset();
      }
    }
  }, [state.status, initialValues?.id, title]);

  const values = { ...initialValues, ...state.values };

  function getFieldError(field: EmployeeFieldName) {
    return state.fieldErrors[field];
  }

  return (
    <form id={`employee-form-${title}`} action={formAction} className="panel form-grid">
      <div className="form-header">
        <p className="eyebrow">Padron</p>
        <h2>{title}</h2>
      </div>

      {values.id ? <input type="hidden" name="id" defaultValue={values.id} /> : null}

      <label className={fieldClassName(Boolean(getFieldError("legajo")))}>
        <span>Legajo</span>
        <input
          name="legajo"
          defaultValue={values.legajo}
          required
          minLength={1}
          aria-invalid={Boolean(getFieldError("legajo"))}
        />
        {getFieldError("legajo") ? (
          <small className="field-error-text">{getFieldError("legajo")}</small>
        ) : null}
      </label>

      <label className={fieldClassName(Boolean(getFieldError("dni")))}>
        <span>DNI</span>
        <input name="dni" defaultValue={values.dni} required aria-invalid={Boolean(getFieldError("dni"))} />
        {getFieldError("dni") ? <small className="field-error-text">{getFieldError("dni")}</small> : null}
      </label>

      <label className={fieldClassName(Boolean(getFieldError("apellido")))}>
        <span>Apellido</span>
        <input
          name="apellido"
          defaultValue={values.apellido}
          required
          aria-invalid={Boolean(getFieldError("apellido"))}
        />
        {getFieldError("apellido") ? (
          <small className="field-error-text">{getFieldError("apellido")}</small>
        ) : null}
      </label>

      <label className={fieldClassName(Boolean(getFieldError("nombre")))}>
        <span>Nombre</span>
        <input
          name="nombre"
          defaultValue={values.nombre}
          required
          aria-invalid={Boolean(getFieldError("nombre"))}
        />
        {getFieldError("nombre") ? <small className="field-error-text">{getFieldError("nombre")}</small> : null}
      </label>

      <label className={fieldClassName(Boolean(getFieldError("categoria")))}>
        <span>Categoria</span>
        <select
          name="categoria"
          defaultValue={values.categoria}
          required
          aria-invalid={Boolean(getFieldError("categoria"))}
        >
          <option value="">Seleccionar categoria</option>
          {categories.map((category) => (
            <option key={category} value={category}>
              {category}
            </option>
          ))}
        </select>
        {getFieldError("categoria") ? (
          <small className="field-error-text">{getFieldError("categoria")}</small>
        ) : null}
      </label>

      <label className={fieldClassName(Boolean(getFieldError("cuil")))}>
        <span>CUIL</span>
        <input name="cuil" defaultValue={values.cuil} required aria-invalid={Boolean(getFieldError("cuil"))} />
        {getFieldError("cuil") ? <small className="field-error-text">{getFieldError("cuil")}</small> : null}
      </label>

      <label className={fieldClassName(Boolean(getFieldError("fechaIngreso")))}>
        <span>Fecha de ingreso</span>
        <input
          name="fechaIngreso"
          type="date"
          defaultValue={values.fechaIngreso}
          required
          aria-invalid={Boolean(getFieldError("fechaIngreso"))}
        />
        {getFieldError("fechaIngreso") ? (
          <small className="field-error-text">{getFieldError("fechaIngreso")}</small>
        ) : null}
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

      <input type="hidden" name="openingBalance" value={values.openingBalance ?? "0,00"} />

      <label className={`${fieldClassName(Boolean(getFieldError("notes")))} field-full`}>
        <span>Notas</span>
        <textarea
          name="notes"
          rows={4}
          defaultValue={values.notes ?? ""}
          aria-invalid={Boolean(getFieldError("notes"))}
        />
        {getFieldError("notes") ? <small className="field-error-text">{getFieldError("notes")}</small> : null}
      </label>

      {state.status === "error" && state.message ? <p className="form-error field-full">{state.message}</p> : null}
      {state.status === "success" ? <p className="form-success field-full">Guardado correctamente.</p> : null}

      <button className="button primary field-full" type="submit" disabled={pending}>
        {pending ? "Guardando..." : values.id ? "Guardar cambios" : "Guardar empleado"}
      </button>
    </form>
  );
}
