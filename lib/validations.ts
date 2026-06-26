import { z } from "zod";
const legajoSchema = z
  .string()
  .trim()
  .regex(/^\d+$/, "El legajo debe contener solo numeros.")
  .min(1, "El legajo es obligatorio.");

export const loginSchema = z.object({
  email: z.email("Ingresa un email valido."),
  password: z.string().min(8, "La contrasena debe tener al menos 8 caracteres."),
});

export const employeeSchema = z.object({
  id: z.string().optional(),
  legajo: legajoSchema,
  dni: z
    .string()
    .trim()
    .regex(/^\d{7,8}$/, "El DNI debe tener 7 u 8 digitos."),
  apellido: z.string().trim().min(2, "Apellido requerido."),
  nombre: z.string().trim().min(2, "Nombre requerido."),
  categoria: z.string().trim().min(2, "Categoria requerida."),
  cuil: z
    .string()
    .trim()
    .regex(/^\d{11}$/, "El CUIL debe tener 11 digitos."),
  fechaIngreso: z.string().date("Fecha de ingreso invalida."),
  status: z.enum(["ACTIVE", "INACTIVE"]),
  openingBalance: z.string().trim().optional().or(z.literal("")),
  notes: z.string().trim().max(500).optional().or(z.literal("")),
});

export const movementSchema = z.object({
  employeeId: z.string().min(1, "Empleado requerido."),
  conceptId: z.string().trim().min(1, "Selecciona un concepto."),
  concept: z.string().trim().min(3, "Concepto requerido."),
  voucherNumber: z.string().trim().max(50).optional().or(z.literal("")),
  movementDate: z.string().date("Fecha invalida."),
  periodMonth: z.coerce.number().int().min(1).max(12),
  periodYear: z.coerce.number().int().min(2020).max(2100),
  amount: z.string().trim().min(1, "Importe requerido."),
  installments: z.coerce.number().int().min(1).max(60).optional(),
  installmentNo: z.coerce.number().int().min(1).max(60).optional(),
  importedFrom: z.string().trim().max(120).optional().or(z.literal("")),
});

export const conceptSchema = z.object({
  id: z.string().optional(),
  code: z
    .string()
    .trim()
    .regex(/^\d+$/, "El codigo debe contener solo numeros.")
    .min(1, "Codigo requerido.")
    .max(30),
  description: z.string().trim().min(3, "Descripcion requerida.").max(120),
  impact: z.enum(["CREDIT", "DEBIT"]),
  status: z.enum(["ACTIVE", "INACTIVE"]),
});
