"use client";

import { useActionState, useEffect, useState } from "react";
import { createMovementAction } from "@/app/actions/movements";
import {
  type MovementFieldName,
  initialMovementFormState,
} from "@/lib/movement-form";
import { movementCategoryOptions } from "@/lib/utils";

type EmployeeOption = {
  id: string;
  legajo: string;
  apellido: string;
  nombre: string;
};

const conceptSuggestionsByCategory = {
  ADVANCE: ["ANTICIPOS DE HABERES", "ANTICIPOS DE AGUINALDO", "ADELANTO ESPECIAL"],
  VALE: ["VALE", "VALE DE CAJA", "VALE EXTRAORDINARIO"],
  SALARY: ["SUELDOS", "SUELDO", "HABERES DEL MES"],
  SAC: ["SAC", "AGUINALDO", "SAC PRIMERA CUOTA", "SAC SEGUNDA CUOTA"],
  SETTLEMENT: ["CANCELACION HABERES", "LIQUIDACION FINAL", "CANCELACION DE HABERES"],
  LIQUIDACION_FINAL: ["LIQUIDACION FINAL", "LIQUIDACION FINAL POR BAJA", "PAGO FINAL"],
  VARIOUS: [],
  ADJUSTMENT_DEBIT: ["AJUSTE NEGATIVO", "DESCUENTO EXTRAORDINARIO"],
  ADJUSTMENT_CREDIT: ["AJUSTE POSITIVO", "REINTEGRO", "DIFERENCIA A FAVOR"],
} as const;

export function MovementForm({ employees }: { employees: EmployeeOption[] }) {
  const [state, formAction, pending] = useActionState(createMovementAction, initialMovementFormState);
  const values = state.values;
  const [legajoQuery, setLegajoQuery] = useState("");
  const [selectedEmployeeId, setSelectedEmployeeId] = useState(values.employeeId ?? "");
  const [selectedCategory, setSelectedCategory] = useState(values.category ?? "ADVANCE");
  const [selectedType, setSelectedType] = useState(values.type ?? "DEBIT");
  const [conceptValue, setConceptValue] = useState(values.concept ?? "");

  useEffect(() => {
    if (state.status === "success") {
      const form = document.getElementById("movement-form") as HTMLFormElement | null;
      form?.reset();
      setLegajoQuery("");
      setSelectedEmployeeId("");
      setSelectedCategory("ADVANCE");
      setSelectedType("DEBIT");
      setConceptValue("");
    }
  }, [state.status]);

  useEffect(() => {
    if (state.status === "error") {
      setSelectedEmployeeId(values.employeeId ?? "");
      setSelectedCategory(values.category ?? "ADVANCE");
      setSelectedType(values.type ?? "DEBIT");
      setConceptValue(values.concept ?? "");
    }
  }, [state.status, values.category, values.concept, values.employeeId, values.type]);

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
  const conceptSuggestions = conceptSuggestionsByCategory[
    selectedCategory as keyof typeof conceptSuggestionsByCategory
  ] ?? [];
  const isVariousCategory = selectedCategory === "VARIOUS";

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

      <label className={fieldClassName("category")}>
        <span>Categoria</span>
        <select
          name="category"
          value={selectedCategory}
          onChange={(event) => {
            const nextCategory = event.target.value;
            setSelectedCategory(nextCategory);
            if (nextCategory !== "VARIOUS") {
              setSelectedType("DEBIT");
            }
          }}
        >
          {movementCategoryOptions.map((option) => (
            <option key={option.value} value={option.value}>
              {option.label}
            </option>
          ))}
        </select>
        {fieldError("category") ? <small className="field-error-text">{fieldError("category")}</small> : null}
      </label>

      {isVariousCategory ? (
        <label className={fieldClassName("type")}>
          <span>Impacto</span>
          <select name="type" value={selectedType} onChange={(event) => setSelectedType(event.target.value as "CREDIT" | "DEBIT")}>
            <option value="DEBIT">Descuento</option>
            <option value="CREDIT">A favor</option>
          </select>
          {fieldError("type") ? <small className="field-error-text">{fieldError("type")}</small> : null}
        </label>
      ) : (
        <input type="hidden" name="type" value="" />
      )}

      {!isVariousCategory ? (
        <label className={fieldClassName("concept")}>
          <span>Concepto sugerido</span>
          <select
            value={conceptSuggestions.some((concept) => concept === conceptValue) ? conceptValue : ""}
            onChange={(event) => setConceptValue(event.target.value)}
          >
            <option value="">Elegir sugerencia</option>
            {conceptSuggestions.map((concept) => (
              <option key={concept} value={concept}>
                {concept}
              </option>
            ))}
          </select>
        </label>
      ) : null}

      <label className={fieldClassName("concept")}>
        <span>{isVariousCategory ? "Descripcion breve" : "Concepto"}</span>
        <input
          name="concept"
          placeholder={
            isVariousCategory
              ? "Ej: reintegro menor, diferencia, gasto varios..."
              : "Anticipo de haberes, sueldo, SAC..."
          }
          required
          value={conceptValue}
          onChange={(event) => setConceptValue(event.target.value)}
        />
        {fieldError("concept") ? <small className="field-error-text">{fieldError("concept")}</small> : null}
      </label>

      <label className={fieldClassName("movementDate")}>
        <span>Fecha</span>
        <input name="movementDate" type="date" required defaultValue={values.movementDate} />
        {fieldError("movementDate") ? (
          <small className="field-error-text">{fieldError("movementDate")}</small>
        ) : null}
      </label>

      <label className={fieldClassName("voucherNumber")}>
        <span>Nro. vale / comprobante</span>
        <input name="voucherNumber" placeholder="Opcional" defaultValue={values.voucherNumber} />
        {fieldError("voucherNumber") ? (
          <small className="field-error-text">{fieldError("voucherNumber")}</small>
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

      <input type="hidden" name="importedFrom" value={values.importedFrom ?? ""} />

      {state.status === "error" && state.message ? <p className="form-error field-full">{state.message}</p> : null}
      {state.status === "success" ? <p className="form-success field-full">Movimiento registrado.</p> : null}

      <button className="button primary field-full" type="submit" disabled={pending}>
        {pending ? "Guardando..." : "Guardar haber o movimiento"}
      </button>
    </form>
  );
}
