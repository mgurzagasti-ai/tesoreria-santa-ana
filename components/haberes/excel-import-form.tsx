"use client";

import { useActionState, useEffect, useMemo, useState } from "react";
import { importHaberesExcelAction } from "@/app/actions/haberes";
import type { HaberesImportPreviewRow } from "@/lib/haberes-import-form";
import { initialHaberesImportFormState } from "@/lib/haberes-import-form";
import { cn, formatCurrencyFromCents, getMonthName } from "@/lib/utils";

type ImportConcept = {
  id: string;
  code: string;
  description: string;
  impact: string;
};

const importTabs = [
  {
    id: "HABERES",
    label: "CARGA SUELDO /SAC",
    title: "Importar haberes desde Excel",
    description:
      "Usa esta pestana para subir archivos con importes que suman a la liquidacion de haberes.",
    impact: "CREDIT",
    suggestedConcepts: ["sueldo", "SAC", "gratificacion", "ajuste positivo"],
  },
  {
    id: "DESCUENTOS",
    label: "CARGAR ACREDI.",
    title: "Importar descuentos desde Excel",
    description:
      "Usa esta pestana para subir archivos con importes que descuentan en la liquidacion de haberes.",
    impact: "DEBIT",
    suggestedConcepts: ["anticipo", "vale", "descuento", "ajuste negativo"],
  },
] as const;

type ExcelImportFormProps = {
  concepts: ImportConcept[];
  employees: {
    id: string;
    legajo: string;
    apellido: string;
    nombre: string;
  }[];
};

const MANUAL_CONCEPT_VALUE = "__MANUAL__";

function getTodayInputValue() {
  const date = new Date();
  const year = date.getFullYear();
  const month = `${date.getMonth() + 1}`.padStart(2, "0");
  const day = `${date.getDate()}`.padStart(2, "0");

  return `${year}-${month}-${day}`;
}

export function ExcelImportForm({ concepts, employees }: ExcelImportFormProps) {
  const currentDate = new Date();
  const [selectedTab, setSelectedTab] = useState<(typeof importTabs)[number]["id"]>("HABERES");
  const [state, formAction, pending] = useActionState(
    importHaberesExcelAction,
    initialHaberesImportFormState,
  );
  const [reviewRows, setReviewRows] = useState<HaberesImportPreviewRow[]>([]);
  const [selectedReviewRow, setSelectedReviewRow] = useState(0);
  const [actionIntent, setActionIntent] = useState<"preview" | "confirm">("preview");
  const [paymentDate, setPaymentDate] = useState(getTodayInputValue);
  const [periodMonth, setPeriodMonth] = useState(String(currentDate.getMonth() + 1));
  const [periodYear, setPeriodYear] = useState(String(currentDate.getFullYear()));

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

  useEffect(() => {
    setReviewRows(state.previewRows);
    setSelectedReviewRow(0);
    setActionIntent("preview");
  }, [state.previewRows]);

  const isManualConcept = selectedConceptId === MANUAL_CONCEPT_VALUE;
  const selectedReview = reviewRows[selectedReviewRow] ?? null;
  const duplicateCount = reviewRows.filter((row) => row.duplicate).length;
  const hasReview = reviewRows.length > 0;
  const reviewRowsJson = JSON.stringify(reviewRows);
  const employeeOptions = useMemo(
    () =>
      employees.map((employee) => ({
        id: employee.id,
        label: `${employee.legajo} - ${employee.apellido}, ${employee.nombre}`,
      })),
    [employees],
  );

  function updateReviewRow(index: number, updater: (row: HaberesImportPreviewRow) => HaberesImportPreviewRow) {
    setReviewRows((current) => current.map((row, rowIndex) => (rowIndex === index ? updater(row) : row)));
  }

  const confirmMessage = hasReview
    ? "Se importaran las filas revisadas. Deseas confirmar la carga?"
    : selectedTab === "HABERES"
      ? "Se revisara el archivo de sueldo / SAC antes de importar. Deseas continuar?"
      : "Se revisara el archivo de descuentos antes de importar. Deseas continuar?";

  return (
    <form
      action={formAction}
      className={cn("panel import-panel", hasReview && "import-panel-reviewing")}
      encType="multipart/form-data"
      onSubmit={(event) => {
        if (!window.confirm(confirmMessage)) {
          event.preventDefault();
        }
      }}
    >
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
            disabled={hasReview}
          >
            {tab.label}
          </button>
        ))}
      </div>

      <input type="hidden" name="importKind" value={selectedTab} />
      <input type="hidden" name="actionIntent" value={actionIntent} />
      <input type="hidden" name="reviewedRows" value={reviewRowsJson} />

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
          disabled={hasReview}
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
          disabled={hasReview}
        />
        {state.fieldErrors.conceptDescription ? (
          <small className="field-error-text">{state.fieldErrors.conceptDescription}</small>
        ) : null}
      </label>

      <label className={state.fieldErrors.periodMonth ? "field field-error" : "field"}>
        <span>Periodo mes</span>
        <select
          name="periodMonth"
          value={periodMonth}
          onChange={(event) => setPeriodMonth(event.target.value)}
          required
          disabled={hasReview}
        >
          {Array.from({ length: 12 }, (_, index) => (
            <option key={index + 1} value={index + 1}>
              {getMonthName(index + 1)}
            </option>
          ))}
        </select>
        {state.fieldErrors.periodMonth ? (
          <small className="field-error-text">{state.fieldErrors.periodMonth}</small>
        ) : null}
      </label>

      <label className={state.fieldErrors.periodYear ? "field field-error" : "field"}>
        <span>Periodo año</span>
        <input
          name="periodYear"
          type="number"
          min="2020"
          max="2100"
          value={periodYear}
          onChange={(event) => setPeriodYear(event.target.value)}
          required
          disabled={hasReview}
        />
        {state.fieldErrors.periodYear ? (
          <small className="field-error-text">{state.fieldErrors.periodYear}</small>
        ) : null}
      </label>

      <label className={state.fieldErrors.paymentDate ? "field field-error" : "field"}>
        <span>Fecha de acreditacion</span>
        <input
          name="paymentDate"
          type="date"
          value={paymentDate}
          onChange={(event) => setPaymentDate(event.target.value)}
          required
          disabled={hasReview}
        />
        {state.fieldErrors.paymentDate ? (
          <small className="field-error-text">{state.fieldErrors.paymentDate}</small>
        ) : null}
      </label>

      <label className={state.fieldErrors.file ? "field field-error field-full" : "field field-full"}>
        <span>Archivo Excel</span>
        <input name="file" type="file" accept=".xlsx,.xls" required={!hasReview} disabled={hasReview} />
        {state.fieldErrors.file ? <small className="field-error-text">{state.fieldErrors.file}</small> : null}
      </label>

      {hasReview ? (
        <section className="import-review field-full">
          <div className="import-review-head">
            <div>
              <p className="eyebrow section-eyebrow">Revision previa</p>
              <h3>Filas listas para importar</h3>
              <p className="muted">
                Selecciona una fila, corrige el empleado o el importe y luego confirma la carga.
              </p>
            </div>
            <div className="import-review-stats">
              <span>{reviewRows.length} filas</span>
              <span>{duplicateCount} duplicadas</span>
            </div>
          </div>

          <div className="import-review-grid">
            <div className="import-review-table-wrap">
              <table className="import-review-table">
                <thead>
                  <tr>
                    <th>Fila</th>
                    <th>Empleado</th>
                    <th>Fecha</th>
                    <th>Periodo</th>
                    <th>Importe</th>
                    <th>Estado</th>
                  </tr>
                </thead>
                <tbody>
                  {reviewRows.map((row, index) => (
                    <tr
                      key={`${row.rowNumber}-${row.employeeId}-${index}`}
                      className={cn(
                        selectedReviewRow === index && "import-review-row-active",
                        row.duplicate && "import-review-row-duplicate",
                      )}
                      onClick={() => setSelectedReviewRow(index)}
                    >
                      <td>{row.rowNumber}</td>
                      <td>{row.employeeLabel}</td>
                      <td>{row.movementDate}</td>
                      <td>
                        {getMonthName(row.periodMonth)} {row.periodYear}
                      </td>
                      <td>{formatCurrencyFromCents(row.amountCents)}</td>
                      <td>{row.duplicate ? "Duplicado" : "Listo"}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            <div className="import-review-editor">
              {selectedReview ? (
                <>
                  <div>
                    <p className="eyebrow section-eyebrow">Fila {selectedReview.rowNumber}</p>
                    <h4>{selectedReview.concept}</h4>
                    <p className="muted">
                      Ajusta manualmente los datos si encontraste una fila mal cargada.
                    </p>
                  </div>

                  <label className="field">
                    <span>Empleado</span>
                    <select
                      value={selectedReview.employeeId}
                      onChange={(event) => {
                        const nextEmployee = employees.find((employee) => employee.id === event.target.value);
                        if (!nextEmployee) {
                          return;
                        }

                        updateReviewRow(selectedReviewRow, (row) => ({
                          ...row,
                          employeeId: nextEmployee.id,
                          employeeLabel: `${nextEmployee.legajo} - ${nextEmployee.apellido}, ${nextEmployee.nombre}`,
                          duplicate: false,
                        }));
                      }}
                    >
                      {employeeOptions.map((employee) => (
                        <option key={employee.id} value={employee.id}>
                          {employee.label}
                        </option>
                      ))}
                    </select>
                  </label>

                  <label className="field">
                    <span>Importe</span>
                    <input
                      type="text"
                      inputMode="decimal"
                      value={selectedReview.amountInput}
                      onChange={(event) => {
                        const nextValue = event.target.value;
                        updateReviewRow(selectedReviewRow, (row) => {
                          const normalized = nextValue.replace(/\./g, "").replace(",", ".");
                          const parsed = Number(normalized);

                          return {
                            ...row,
                            amountInput: nextValue,
                            amountCents: Number.isFinite(parsed) ? Math.round(Math.abs(parsed) * 100) : row.amountCents,
                            duplicate: false,
                          };
                        });
                      }}
                    />
                  </label>

                  <div className="import-review-meta">
                    <span>Fecha: {selectedReview.movementDate}</span>
                    <span>
                      Vista previa: {formatCurrencyFromCents(selectedReview.amountCents)}
                    </span>
                  </div>
                </>
              ) : null}
            </div>
          </div>

          {state.previewIssues.length > 0 ? (
            <div className="import-review-issues">
              <strong>Observaciones del archivo</strong>
              <ul>
                {state.previewIssues.slice(0, 5).map((issue) => (
                  <li key={`${issue.rowNumber}-${issue.message}`}>
                    Fila {issue.rowNumber}: {issue.message}
                  </li>
                ))}
              </ul>
            </div>
          ) : null}
        </section>
      ) : null}

      {state.fieldErrors.importKind ? (
        <p className="form-error field-full">{state.fieldErrors.importKind}</p>
      ) : null}
      {state.fieldErrors.reviewedRows ? (
        <p className="form-error field-full">{state.fieldErrors.reviewedRows}</p>
      ) : null}

      {state.message ? (
        <p className={state.status === "success" ? "form-success field-full" : "form-error field-full"}>
          {state.message}
        </p>
      ) : null}

      <p className="muted field-full">
        {hasReview
          ? "Cuando confirmas, solo se guardan las filas revisadas."
          : "Primero se revisa el archivo y luego confirmas la importacion final."}
      </p>

      <div className="import-actions field-full">
        {hasReview ? (
          <button
            className="button ghost"
            type="button"
            onClick={() => {
              setReviewRows([]);
              setSelectedReviewRow(0);
              setActionIntent("preview");
            }}
          >
            DESCARTAR REVISION
          </button>
        ) : null}

        <button
          className="button primary import-submit-button"
          type="submit"
          disabled={pending}
          onClick={() => setActionIntent(hasReview ? "confirm" : "preview")}
        >
          {pending ? "PROCESANDO..." : hasReview ? "CONFIRMAR IMPORTACION" : "REVISAR ARCHIVO"}
        </button>
      </div>
    </form>
  );
}
