"use client";

import { useActionState } from "react";
import { importHaberesExcelAction } from "@/app/actions/haberes";
import { initialHaberesImportFormState } from "@/lib/haberes-import-form";

const suggestedColumns = [
  "fecha",
  "legajo",
  "empleado",
  "concepto",
  "periodo",
  "importe",
] as const;

export function ExcelImportForm() {
  const [state, formAction, pending] = useActionState(
    importHaberesExcelAction,
    initialHaberesImportFormState,
  );

  return (
    <form action={formAction} className="panel import-panel" encType="multipart/form-data">
      <div className="form-header">
        <p className="eyebrow">Importacion</p>
        <h2>Importar archivo Excel</h2>
        <p className="muted">
          Sube un archivo Excel y el sistema intentara reconocer las columnas para cargar haberes y
          movimientos del personal.
        </p>
      </div>

      <label className={state.fieldErrors.file ? "field field-error field-full" : "field field-full"}>
        <span>Archivo Excel</span>
        <input name="file" type="file" accept=".xlsx,.xls" required />
        {state.fieldErrors.file ? <small className="field-error-text">{state.fieldErrors.file}</small> : null}
      </label>

      <div className="field field-full import-help">
        <span>Columnas esperadas</span>
        <div className="chips-row">
          {suggestedColumns.map((column) => (
            <span key={column} className="soft-chip">
              {column}
            </span>
          ))}
        </div>
        <p className="muted">
          Formato recomendado: `fecha`, `legajo`, `empleado`, `concepto`, `periodo` e `importe`.
          Si `periodo` viene como texto, por ejemplo `junio 2026`, el sistema intentara separar
          mes y anio automaticamente.
        </p>
      </div>

      {state.message ? (
        <p className={state.status === "success" ? "form-success field-full" : "form-error field-full"}>
          {state.message}
        </p>
      ) : null}

      <button className="button primary field-full import-submit-button" type="submit" disabled={pending}>
        {pending ? "Importando archivo..." : "Procesar archivo Excel"}
      </button>
    </form>
  );
}
