import { z } from "zod";

/**
 * Validates Italian Codice Fiscale (CF) pattern (16 alphanumeric chars)
 */
export const codiceFiscaleRegex = /^[A-Z]{6}\d{2}[A-Z]\d{2}[A-Z]\d{3}[A-Z]$/i;

export function isValidCodiceFiscale(cf?: string): boolean {
  if (!cf) return false;
  return codiceFiscaleRegex.test(cf.trim());
}

/**
 * Validates Italian VAT number (Partita IVA) (11 digits)
 */
export const partitaIvaRegex = /^\d{11}$/;

export function isValidPartitaIva(piva?: string): boolean {
  if (!piva) return false;
  return partitaIvaRegex.test(piva.trim());
}

/**
 * Shared Checkout Form Zod Schema
 */
export const checkoutFormSchema = z.object({
  firstName: z.string().min(2, "Il nome deve avere almeno 2 caratteri"),
  lastName: z.string().min(2, "Il cognome deve avere almeno 2 caratteri"),
  email: z.string().email("Email non valida"),
  phone: z.string().min(6, "Numero di telefono non valido"),
  purchaserTaxCode: z.string().refine((val) => isValidCodiceFiscale(val), {
    message: "Codice Fiscale non valido",
  }),
  isForChild: z.boolean().default(false),
  studentFirstName: z.string().optional(),
  studentLastName: z.string().optional(),
  studentEmail: z.string().email("Email ученика не валидна").optional().or(z.literal("")),
  studentPhone: z.string().optional(),
  studentTaxCode: z.string().optional(),
  studentBirthDate: z.string().optional(),
  paymentMethod: z.enum(["stripe", "cash"]).default("stripe"),
  notes: z.string().optional(),
});

export type CheckoutFormValues = z.infer<typeof checkoutFormSchema>;
