import { z } from "zod";

// ---------------------------------------------------------------------------
// Italian-specific regex patterns
// ---------------------------------------------------------------------------

/**
 * Codice Fiscale — два формата:
 *  - Физлицо (16 символов): RSSMRA80A01H501T
 *  - Юрлицо / Partita IVA (11 цифр): 12345678901
 */
export const CODICE_FISCALE_RE =
  /^([A-Z]{6}[0-9LMNPQRSTUV]{2}[ABCDEHLMPRST]{1}[0-9LMNPQRSTUV]{2}[A-Z]{1}[0-9LMNPQRSTUV]{3}[A-Z]{1}|[0-9]{11})$/i;

/**
 * Итальянский телефон.
 * Принимает: +39 333 1234567 | 0331 1234567 | 3331234567 | 06 12345678
 * Пробелы и дефисы допустимы.
 */
export const PHONE_IT_RE =
  /^(\+?39[\s\-]?)?(0\d{1,4}[\s\-]?\d{4,8}|3\d{2}[\s\-]?\d{6,7})$/;

/**
 * Codice SDI — ровно 7 буквенно-цифровых символов (fatturazione elettronica).
 */
export const SDI_CODE_RE = /^[A-Z0-9]{7}$/i;

// ---------------------------------------------------------------------------
// Legacy aliases (обратная совместимость)
// ---------------------------------------------------------------------------

/** @deprecated Используй CODICE_FISCALE_RE */
export const codiceFiscaleRegex = CODICE_FISCALE_RE;

/** @deprecated Используй CODICE_FISCALE_RE */
export const partitaIvaRegex = /^\d{11}$/;

// ---------------------------------------------------------------------------
// Helper functions
// ---------------------------------------------------------------------------

export function isValidCodiceFiscale(cf?: string | null): boolean {
  if (!cf) return false;
  return CODICE_FISCALE_RE.test(cf.trim());
}

export function isValidPartitaIva(piva?: string | null): boolean {
  if (!piva) return false;
  return partitaIvaRegex.test(piva.trim());
}

export function isValidPhoneIT(phone?: string | null): boolean {
  if (!phone || phone.trim() === "") return false;
  const digits = phone.replace(/[\s\-\(\)]/g, "").replace(/^\+?39/, "");
  if (digits.length < 9 || digits.length > 11) return false;
  return PHONE_IT_RE.test(phone.trim());
}

export function isValidSdiCode(sdi?: string | null): boolean {
  if (!sdi) return false;
  return SDI_CODE_RE.test(sdi.trim());
}

/**
 * Проверяет, что дата рождения в прошлом и не старше 100 лет.
 * Возвращает true если строка пустая (поле необязательное).
 */
export function isValidBirthDate(dateStr?: string | null): boolean {
  if (!dateStr || dateStr.trim() === "") return true;
  const d = new Date(dateStr);
  if (isNaN(d.getTime())) return false;
  const now = new Date();
  const hundredYearsAgo = new Date(now.getFullYear() - 100, 0, 1);
  return d < now && d >= hundredYearsAgo;
}

// ---------------------------------------------------------------------------
// Zod field builders (переиспользуемые)
// ---------------------------------------------------------------------------

const codiceFiscaleField = (message = "Codice Fiscale non valido (es. RSSMRA80A01H501T)") =>
  z.string().refine((v) => CODICE_FISCALE_RE.test(v.trim()), { message });

const optionalCodiceFiscale = (message = "Codice Fiscale non valido") =>
  z
    .string()
    .optional()
    .refine((v) => !v || v.trim() === "" || CODICE_FISCALE_RE.test(v.trim()), { message });

const phoneField = (message = "Numero di telefono non valido (es. +39 333 1234567)") =>
  z
    .string()
    .min(6, message)
    .refine((v) => isValidPhoneIT(v), { message });

const optionalPhone = (message = "Numero di telefono non valido") =>
  z
    .string()
    .optional()
    .refine((v) => !v || v.trim() === "" || isValidPhoneIT(v), { message });

// ---------------------------------------------------------------------------
// CheckFee schema
// ---------------------------------------------------------------------------

export const checkFeeSchema = z.object({
  taxCode: z
    .string()
    .min(11, "Il Codice Fiscale è obbligatorio")
    .refine(
      (v) => CODICE_FISCALE_RE.test(v.trim()),
      "Codice Fiscale non valido (es. RSSMRA80A01H501T)"
    ),
});

export type CheckFeeInput = z.infer<typeof checkFeeSchema>;

// ---------------------------------------------------------------------------
// CreateReservation schema — полная схема брони для API
// ---------------------------------------------------------------------------

// Базовый объект схемы (ZodObject без superRefine — нужен для .omit()/.extend())
const reservationBaseObject = z.object({
  itemId: z.string().min(1, "itemId è obbligatorio"),
  itemType: z.string().optional(),
  date: z.string().optional(),
  time: z.string().optional(),

  // Покупатель / Genitore
  firstName: z
    .string()
    .min(2, "Il nome deve avere almeno 2 caratteri")
    .max(50, "Il nome è troppo lungo"),
  lastName: z
    .string()
    .min(2, "Il cognome deve avere almeno 2 caratteri")
    .max(50, "Il cognome è troppo lungo"),
  email: z.string().email("Inserisci un indirizzo email valido"),
  phone: phoneField(),
  purchaserTaxCode: optionalCodiceFiscale(
    "Codice Fiscale del genitore/acquirente non valido"
  ),

  // Студент
  isForChild: z.boolean().optional(),
  studentFirstName: z.string().max(50).optional(),
  studentLastName: z.string().max(50).optional(),
  studentEmail: z
    .string()
    .email("Email dello studente non valida")
    .optional()
    .or(z.literal("")),
  studentPhone: optionalPhone("Numero di telefono dello studente non valido"),
  studentBirthDate: z
    .string()
    .optional()
    .refine(isValidBirthDate, {
      message: "Data di nascita non valida (deve essere nel passato, max 100 anni)",
    }),
  studentTaxCode: optionalCodiceFiscale("Codice Fiscale dello studente non valido"),

  // Fattura aziendale
  needsCompanyInvoice: z.boolean().optional(),
  sdiCode: z
    .string()
    .optional()
    .refine(
      (v) => !v || v.trim() === "" || SDI_CODE_RE.test(v.trim()),
      "Il Codice SDI deve avere esattamente 7 caratteri alfanumerici (es. ABCDE12)"
    ),
  pecEmail: z
    .string()
    .email("Inserisci un indirizzo email PEC valido")
    .optional()
    .or(z.literal("")),

  // Прочее
  includeRegistrationFee: z.boolean().optional(),
  notes: z
    .string()
    .max(500, "Le note non possono superare i 500 caratteri")
    .optional(),
  paymentStatus: z.string().optional(),
  paymentMethod: z.string().optional(),
});

/**
 * Переиспользуемые cross-field проверки (isForChild, needsCompanyInvoice).
 * Применяется к createReservationSchema и checkoutFormSchema одинаково.
 */
function applyReservationRefinements<T extends {
  isForChild?: boolean;
  studentFirstName?: string;
  studentLastName?: string;
  purchaserTaxCode?: string;
  needsCompanyInvoice?: boolean;
  sdiCode?: string;
  pecEmail?: string;
}>(data: T, ctx: z.RefinementCtx) {
  if (data.isForChild) {
    if (!data.studentFirstName || data.studentFirstName.trim().length < 2) {
      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        path: ["studentFirstName"],
        message: "Il nome dello studente è obbligatorio (min. 2 caratteri)",
      });
    }
    if (!data.studentLastName || data.studentLastName.trim().length < 2) {
      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        path: ["studentLastName"],
        message: "Il cognome dello studente è obbligatorio (min. 2 caratteri)",
      });
    }
    if (
      !data.purchaserTaxCode ||
      !CODICE_FISCALE_RE.test(data.purchaserTaxCode.trim())
    ) {
      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        path: ["purchaserTaxCode"],
        message:
          "Il Codice Fiscale del genitore/acquirente è obbligatorio per la fattura",
      });
    }
  }

  if (data.needsCompanyInvoice) {
    const hasSdi = data.sdiCode && SDI_CODE_RE.test(data.sdiCode.trim());
    const hasPec = data.pecEmail && data.pecEmail.includes("@");
    if (!hasSdi && !hasPec) {
      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        path: ["sdiCode"],
        message:
          "Per la fattura aziendale inserisci il Codice SDI (7 caratteri) oppure l'email PEC",
      });
    }
  }
}

export const createReservationSchema = reservationBaseObject.superRefine(
  applyReservationRefinements
);

export type CreateReservationInput = z.infer<typeof createReservationSchema>;

// ---------------------------------------------------------------------------
// Frontend checkout form schema
// Поле taxCode на форме соответствует studentTaxCode в API.
// ---------------------------------------------------------------------------

export const checkoutFormSchema = reservationBaseObject
  .omit({ studentTaxCode: true })
  .extend({
    // На форме поле называется taxCode (CF студента)
    taxCode: z
      .string()
      .min(11, "Il Codice Fiscale è obbligatorio (almeno 11 caratteri)")
      .refine(
        (v) => CODICE_FISCALE_RE.test(v.trim()),
        "Codice Fiscale non valido (es. RSSMRA80A01H501T)"
      ),
  })
  .superRefine(applyReservationRefinements);

export type CheckoutFormValues = z.infer<typeof checkoutFormSchema>;

// ---------------------------------------------------------------------------
// VerifyPayment schema
// ---------------------------------------------------------------------------

export const verifyPaymentSchema = z.object({
  sessionId: z.string().min(1, "sessionId è obbligatorio"),
  bookingId: z.string().min(1, "bookingId è obbligatorio"),
});

export type VerifyPaymentInput = z.infer<typeof verifyPaymentSchema>;

// ---------------------------------------------------------------------------
// ContactForm schema
// ---------------------------------------------------------------------------

export const contactFormSchema = z.object({
  nome: z
    .string({ required_error: "Il nome è obbligatorio" })
    .trim()
    .min(2, "Il nome deve contenere almeno 2 caratteri")
    .max(50, "Il nome non può superare i 50 caratteri"),
  cognome: z
    .string({ required_error: "Il cognome è obbligatorio" })
    .trim()
    .min(2, "Il cognome deve contenere almeno 2 caratteri")
    .max(50, "Il cognome non può superare i 50 caratteri"),
  email: z
    .string({ required_error: "L'email è obbligatoria" })
    .trim()
    .email("Inserisci un indirizzo email valido")
    .max(100, "L'email non può superare i 100 caratteri"),
  telefono: z
    .string()
    .optional()
    .refine((v) => !v || v.trim() === "" || isValidPhoneIT(v), {
      message: "Numero di telefono non valido (es. +39 340 1234567 o 340 1234567)",
    }),
  interesse: z
    .string()
    .max(100, "L'interesse non può superare i 100 caratteri")
    .optional()
    .nullable(),
  messaggio: z
    .string({ required_error: "Il messaggio è obbligatorio" })
    .trim()
    .min(10, "Il messaggio deve contenere almeno 10 caratteri")
    .max(2000, "Il messaggio non può superare i 2000 caratteri"),
  privacy: z.boolean().optional(),
});

export type ContactFormInput = z.infer<typeof contactFormSchema>;
