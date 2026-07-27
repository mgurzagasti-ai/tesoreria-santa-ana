"use client";

import { useActionState } from "react";
import { importEmployeesExcelAction } from "@/app/actions/employees";
import { initialEmployeeImportFormState } from "@/lib/employee-import-form";

export function EmployeeExcelImportForm() {
  const [state, formAction, pending] = useActionState(
    importEmployeesExcelAction,
    initialEmployeeImportFormState,
  );

  return (
    <form action={formAction} className="panel import-panel employee-import-panel" encType="multipart/form-data">
      <div className="form-header">
        <p className="eyebrow">Importacion</p>
        <h2>Carga masiva de empleados</h2>
        <p className="muted">
          Sube un Excel con Legajo, DNI, Apellido, Nombre, Categoria, CUIL y Fecha de ingreso.
        </p>
      </div>

      <label className={state.fieldErrors.file ? "field field-error field-full" : "field field-full"}>
        <span>Archivo Excel</span>
        <input name="file" type="file" accept=".xlsx,.xls" required />
        {state.fieldErrors.file ? <small className="field-error-text">{state.fieldErrors.file}</small> : null}
      </label>

      {state.message ? (
        <p className={state.status === "success" ? "form-success field-full" : "form-error field-full"}>
          {state.message}
        </p>
      ) : null}

      {state.issues.length > 0 ? (
        <div className="import-review-issues field-full">
          <strong>Observaciones</strong>
          <ul>
            {state.issues.slice(0, 8).map((issue) => (
              <li key={`${issue.rowNumber}-${issue.message}`}>
                Fila {issue.rowNumber}: {issue.message}
              </li>
            ))}
          </ul>
        </div>
      ) : null}

      <button className="button primary import-submit-button field-full" type="submit" disabled={pending}>
        {pending ? "IMPORTANDO..." : "IMPORTAR EMPLEADOS"}
      </button>
    </form>
  );
}
