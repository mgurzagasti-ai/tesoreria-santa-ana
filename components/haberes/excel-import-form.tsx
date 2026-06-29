"use client";

import { useActionState, useEffect, useMemo, useState } from "react";
import { importHaberesExcelAction } from "@/app/actions/haberes";
import { initialHaberesImportFormState } from "@/lib/haberes-import-form";
import { cn } from "@/lib/utils";

type ImportConcept = {
  id: string;
  code: string;
  description: string;
  impact: string;
};

const importTabs = [
  {
    id: "HABERES",
    label: "Carga de haberes",
    title: "Importar haberes desde Excel",
    description:
      "Usa esta pestana para subir archivos con importes que suman a la liquidacion de haberes.",
    impact: "CREDIT",
    suggestedConcepts: ["sueldo", "SAC", "gratificacion", "ajuste positivo"],
  },
  {
    id: "DESCUENTOS",
    label: "Carga de descuentos",
    title: "Importar descuentos desde Excel",
    description:
      "Usa esta pestana para subir archivos con importes que descuentan en la liquidacion de haberes.",
    impact: "DEBIT",
    suggestedConcepts: ["anticipo", "vale", "descuento", "ajuste negativo"],
  },
] as const;

const suggestedColumns = ["legajo", "apellido y nombre", "monto"] as const;

type ExcelImportFormProps = {
  concepts: ImportConcept[];
};

const MANUAL_CONCEPT_VALUE = "__MANUAL__";

export function ExcelImportForm({ concepts }: ExcelImportFormProps) {
  const [selectedTab, setSelectedTab] = useState<(typeof importTabs)[number]["id"]>("HABERES");
  const [state, formAction, pending] = useActionState(
    importHaberesExcelAction,
    initialHaberesImportFormState,
  );

  const activeTab = importTabs.find((tab) => tab.id === selectedTab) ?? importTabs[0];
  const conceptsByTab = useMemo(
    () =>
      importTabs.reduce<Record<string, ImportConcept[]>>((accumulator, tab) => {
        accumulator[tab.id] = concepts.filter((concept) => concept.impact === tab.impact);
        return accumulator;
      }, {}),
    [concepts],
  );
  const activeConcepts = conceptsByTab[selectedTab] ?? [];
  const defaultConceptId = activeConcepts[0]?.id ?? MANUAL_CONCEPT_VALUE;
  const [selectedConceptId, setSelectedConceptId] = useState(defaultConceptId);
  const [conceptDescription, setConceptDescription] = useState(activeConcepts[0]?.description ?? "");

  useEffect(() => {
    const nextConceptId = activeConcepts[0]?.id ?? MANUAL_CONCEPT_VALUE;
    setSelectedConceptId(nextConceptId);
    setConceptDescription(activeConcepts[0]?.description ?? "");
  }, [selectedTab, defaultConceptId]);

  const isManualConcept = selectedConceptId === MANUAL_CONCEPT_VALUE;

  return (
    <form action={formAction} className="panel import-panel" encType="multipart/form-data">
      <div className="form-header">
        <p className="eyebrow">Importacion</p>
        <h2>{activeTab.title}</h2>
        <p className="muted">{activeTab.description}</p>
      </div>

      <div className="import-tabs" role="tablist" aria-label="Tipo de importacion">
        {importTabs.map((tab) => (
          <button
            key={tab.id}
            type="button"
            role="tab"
            aria-selected={selectedTab === tab.id}
            className={cn("button", selectedTab === tab.id ? "primary import-tab-active" : "ghost")}
            onClick={() => setSelectedTab(tab.id)}
          >
            {tab.label}
          </button>
        ))}
      </div>

      <input type="hidden" name="importKind" value={selectedTab} />

      <label
        className={state.fieldErrors.conceptId ? "field field-error field-full" : "field field-full"}
      >
        <span>Concepto de esta carga</span>
        <select
          name="conceptId"
          value={selectedConceptId}
          onChange={(event) => {
            const nextValue = event.target.value;
            setSelectedConceptId(nextValue);

            if (nextValue === MANUAL_CONCEPT_VALUE) {
              setConceptDescription("");
              return;
            }

            const concept = activeConcepts.find((item) => item.id === nextValue);
            setConceptDescription(concept?.description ?? "");
          }}
          required
        >
          {activeConcepts.length === 0 ? <option value={MANUAL_CONCEPT_VALUE}>Concepto manual</option> : null}
          {activeConcepts.map((concept) => (
            <option key={concept.id} value={concept.id}>
              {concept.code} - {concept.description}
            </option>
          ))}
          <option value={MANUAL_CONCEPT_VALUE}>Concepto manual</option>
        </select>
        {state.fieldErrors.conceptId ? (
          <small className="field-error-text">{state.fieldErrors.conceptId}</small>
        ) : null}
      </label>

      <label
        className={
          state.fieldErrors.conceptDescription ? "field field-error field-full" : "field field-full"
        }
      >
        <span>{isManualConcept ? "Descripcion manual" : "Descripcion a aplicar"}</span>
        <input
          name="conceptDescription"
          type="text"
          value={conceptDescription}
          onChange={(event) => setConceptDescription(event.target.value)}
          placeholder={
            isManualConcept
              ? "Escribe el concepto para toda la carga"
              : "Puedes ajustar la descripcion si hace falta"
          }
          required={isManualConcept}
        />
        {state.fieldErrors.conceptDescription ? (
          <small className="field-error-text">{state.fieldErrors.conceptDescription}</small>
        ) : null}
      </label>

      <label className={state.fieldErrors.file ? "field field-error field-full" : "field field-full"}>
        <span>Archivo Excel</span>
        <input name="file" type="file" accept=".xlsx,.xls" required />
        {state.fieldErrors.file ? <small className="field-error-text">{state.fieldErrors.file}</small> : null}
      </label>

      <div className="field field-full import-help">
        <span>Conceptos esperados en esta pestana</span>
        <div className="chips-row">
          {activeTab.suggestedConcepts.map((concept) => (
            <span key={concept} className="soft-chip">
              {concept}
            </span>
          ))}
        </div>
      </div>

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
          Formato recomendado: `legajo`, `apellido y nombre` y `monto`. El sistema toma el concepto
          desde esta pantalla y busca cada fila por legajo. Puedes usar un concepto del maestro o
          escribir uno manual. Si el archivo no trae fecha o periodo,
          usa la referencia detectada en el nombre del archivo o la fecha actual.
        </p>
      </div>

      {state.fieldErrors.importKind ? (
        <p className="form-error field-full">{state.fieldErrors.importKind}</p>
      ) : null}

      {state.message ? (
        <p className={state.status === "success" ? "form-success field-full" : "form-error field-full"}>
          {state.message}
        </p>
      ) : null}

      <button className="button primary field-full import-submit-button" type="submit" disabled={pending}>
        {pending ? "Importando archivo..." : `Procesar ${activeTab.label.toLowerCase()}`}
      </button>
    </form>
  );
}
