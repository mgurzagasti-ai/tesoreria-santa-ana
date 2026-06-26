"use client";

import { useActionState, useEffect, useMemo, useState } from "react";
import { createMovementAction } from "@/app/actions/movements";
import {
  type MovementFieldName,
  initialMovementFormState,
} from "@/lib/movement-form";

type EmployeeOption = {
  id: string;
  legajo: string;
  apellido: string;
  nombre: string;
};

type ConceptOption = {
  id: string;
  code: string;
  description: string;
  impact: string;
};

export function MovementForm({
  employees,
  concepts,
}: {
  employees: EmployeeOption[];
  concepts: ConceptOption[];
}) {
  const [state, formAction, pending] = useActionState(createMovementAction, initialMovementFormState);
  const values = state.values;
  const [legajoQuery, setLegajoQuery] = useState("");
  const [selectedEmployeeId, setSelectedEmployeeId] = useState(values.employeeId ?? "");
  const [selectedConceptId, setSelectedConceptId] = useState(values.conceptId ?? concepts[0]?.id ?? "");
  const [conceptValue, setConceptValue] = useState(values.concept ?? concepts[0]?.description ?? "");

  const selectedConcept = useMemo(
    () => concepts.find((concept) => concept.id === selectedConceptId) ?? concepts[0] ?? null,
    [concepts, selectedConceptId],
  );

  useEffect(() => {
    if (state.status === "success") {
      const form = document.getElementById("movement-form") as HTMLFormElement | null;
      form?.reset();
      setLegajoQuery("");
      setSelectedEmployeeId("");
      setSelectedConceptId(concepts[0]?.id ?? "");
      setConceptValue(concepts[0]?.description ?? "");
    }
  }, [concepts, state.status]);

  useEffect(() => {
    if (state.status === "error") {
      const nextConceptId = values.conceptId ?? concepts[0]?.id ?? "";
      setSelectedEmployeeId(values.employeeId ?? "");
      setSelectedConceptId(nextConceptId);
      setConceptValue(values.concept ?? concepts.find((concept) => concept.id === nextConceptId)?.description ?? "");
    }
  }, [concepts, state.status, values.concept, values.conceptId, values.employeeId]);

  useEffect(() => {
    const normalizedLegajo = legajoQuery.trim();

    if (!normalizedLegajo) {
      return;
    }

    const exactMatch = employees.find((employee) => employee.legajo === normalizedLegajo);

    if (exactMatch) {
      setSelectedEmployeeId(exactMatch.id);
    }
  }, [employees, legajoQuery]);

  const fieldClassName = (field: MovementFieldName) =>
    state.fieldErrors[field] ? "field field-error" : "field";
  const fieldError = (field: MovementFieldName) => state.fieldErrors[field];
  const filteredEmployees = employees.filter((employee) =>
    employee.legajo.includes(legajoQuery.trim()),
  );

  return (
    <form id="movement-form" action={formAction} className="panel form-grid">
      <div className="form-header">
        <p className="eyebrow">Haberes</p>
        <h2>Carga de haberes y descuentos</h2>
      </div>

      <label className={fieldClassName("employeeId")}>
        <span>Buscar legajo</span>
        <input
          placeholder="Ingresar legajo"
          value={legajoQuery}
          onChange={(event) => setLegajoQuery(event.target.value)}
        />
      </label>

      <label className={`${fieldClassName("employeeId")} field-full`}>
        <span>Empleado</span>
        <select
          name="employeeId"
          required
          value={selectedEmployeeId}
          onChange={(event) => setSelectedEmployeeId(event.target.value)}
        >
          <option value="" disabled>
            {filteredEmployees.length === 0 ? "No hay empleados para ese legajo" : "Selecciona un empleado activo"}
          </option>
          {filteredEmployees.map((employee) => (
            <option key={employee.id} value={employee.id}>
              {employee.legajo} - {employee.apellido}, {employee.nombre}
            </option>
          ))}
        </select>
        {fieldError("employeeId") ? <small className="field-error-text">{fieldError("employeeId")}</small> : null}
      </label>

      <label className={fieldClassName("conceptId")}>
        <span>Concepto</span>
        <select
          name="conceptId"
          value={selectedConceptId}
          onChange={(event) => {
            const nextConceptId = event.target.value;
            const nextConcept = concepts.find((concept) => concept.id === nextConceptId);

            setSelectedConceptId(nextConceptId);
            setConceptValue(nextConcept?.description ?? "");
          }}
        >
          <option value="" disabled>
            Seleccionar concepto
          </option>
          {concepts.map((concept) => (
            <option key={concept.id} value={concept.id}>
              {concept.code} - {concept.description}
            </option>
          ))}
        </select>
        {fieldError("conceptId") ? <small className="field-error-text">{fieldError("conceptId")}</small> : null}
      </label>

      <label className={fieldClassName("code")}>
        <span>Codigo</span>
        <input name="code" value={selectedConcept?.code ?? ""} readOnly />
      </label>

      <label className={fieldClassName("concept")}>
        <span>Descripcion del movimiento</span>
        <input
          name="concept"
          placeholder="Descripcion que quedara registrada"
          required
          value={conceptValue}
          onChange={(event) => setConceptValue(event.target.value)}
        />
        {fieldError("concept") ? <small className="field-error-text">{fieldError("concept")}</small> : null}
      </label>

      <label className={fieldClassName("voucherNumber")}>
        <span>Nro. vale / comprobante</span>
        <input name="voucherNumber" placeholder="Opcional" defaultValue={values.voucherNumber} />
        {fieldError("voucherNumber") ? (
          <small className="field-error-text">{fieldError("voucherNumber")}</small>
        ) : null}
      </label>

      <label className={fieldClassName("movementDate")}>
        <span>Fecha</span>
        <input name="movementDate" type="date" required defaultValue={values.movementDate} />
        {fieldError("movementDate") ? (
          <small className="field-error-text">{fieldError("movementDate")}</small>
        ) : null}
      </label>

      <label className={fieldClassName("periodMonth")}>
        <span>Periodo mes</span>
        <input
          name="periodMonth"
          type="number"
          min="1"
          max="12"
          required
          defaultValue={values.periodMonth}
        />
        {fieldError("periodMonth") ? (
          <small className="field-error-text">{fieldError("periodMonth")}</small>
        ) : null}
      </label>

      <label className={fieldClassName("periodYear")}>
        <span>Periodo anio</span>
        <input
          name="periodYear"
          type="number"
          min="2020"
          max="2100"
          required
          defaultValue={values.periodYear}
        />
        {fieldError("periodYear") ? (
          <small className="field-error-text">{fieldError("periodYear")}</small>
        ) : null}
      </label>

      <label className={fieldClassName("amount")}>
        <span>Importe</span>
        <input name="amount" placeholder="150000,50" required defaultValue={values.amount} />
        {fieldError("amount") ? <small className="field-error-text">{fieldError("amount")}</small> : null}
      </label>

      <label className={fieldClassName("installments")}>
        <span>Cuotas</span>
        <input name="installments" type="number" min="1" max="60" defaultValue={values.installments} />
        {fieldError("installments") ? (
          <small className="field-error-text">{fieldError("installments")}</small>
        ) : null}
      </label>

      <label className={fieldClassName("installmentNo")}>
        <span>Cuota nro.</span>
        <input name="installmentNo" type="number" min="1" max="60" defaultValue={values.installmentNo} />
        {fieldError("installmentNo") ? (
          <small className="field-error-text">{fieldError("installmentNo")}</small>
        ) : null}
      </label>

      <label className={fieldClassName("code")}>
        <span>Impacto en liquidacion</span>
        <input value={selectedConcept?.impact === "CREDIT" ? "Suma" : "Resta"} readOnly />
      </label>

      <input type="hidden" name="importedFrom" value={values.importedFrom ?? ""} />

      {state.status === "error" && state.message ? <p className="form-error field-full">{state.message}</p> : null}
      {state.status === "success" ? <p className="form-success field-full">Movimiento registrado.</p> : null}

      <button className="button primary field-full" type="submit" disabled={pending}>
        {pending ? "Guardando..." : "Guardar haber o movimiento"}
      </button>
    </form>
  );
}
