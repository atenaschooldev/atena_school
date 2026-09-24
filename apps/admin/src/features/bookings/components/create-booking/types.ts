import { z } from "zod";
import { User, Calendar as CalendarIcon, CreditCard } from "lucide-react";
import type { Course } from "@/features/courses/types";

export function parseDayToNumber(val: any): number | null {
  if (val === null || val === undefined) return null;
  if (typeof val === "number" && !isNaN(val)) {
    return val === 7 ? 0 : val;
  }
  const str = String(val).trim().toLowerCase();
  if (!isNaN(Number(str))) {
    const num = Number(str);
    return num === 7 ? 0 : num;
  }
  if (str.includes("lun")) return 1;
  if (str.includes("mar")) return 2;
  if (str.includes("mer")) return 3;
  if (str.includes("gio")) return 4;
  if (str.includes("ven")) return 5;
  if (str.includes("sab")) return 6;
  if (str.includes("dom")) return 0;
  if (str.includes("mon")) return 1;
  if (str.includes("tue")) return 2;
  if (str.includes("wed")) return 3;
  if (str.includes("thu")) return 4;
  if (str.includes("fri")) return 5;
  if (str.includes("sat")) return 6;
  if (str.includes("sun")) return 0;
  return null;
}

export function normalizeScheduleDays(scheduleDays: any): number[] {
  if (!scheduleDays) return [];
  let rawList: any[] = [];
  if (Array.isArray(scheduleDays)) {
    rawList = scheduleDays;
  } else if (typeof scheduleDays === "string") {
    try {
      const parsed = JSON.parse(scheduleDays);
      if (Array.isArray(parsed)) {
        rawList = parsed;
      } else {
        rawList = scheduleDays.split(",");
      }
    } catch {
      rawList = scheduleDays.split(",");
    }
  }
  const mapped = rawList.map(parseDayToNumber).filter((n): n is number => n !== null);
  return Array.from(new Set(mapped));
}

export function getFirstAvailableAllowedDate(allowedDays: number[]): Date {
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  for (let i = 0; i < 30; i++) {
    const check = new Date(today);
    check.setDate(today.getDate() + i);
    if (allowedDays.includes(check.getDay())) {
      return check;
    }
  }
  return today;
}

export interface StudentItem {
  firstName: string;
  lastName: string;
  email?: string;
  phone?: string;
  taxCode: string;
  birthDate?: string;
  birthPlace?: string;
}

export interface SavedStudentItem {
  firstName: string;
  lastName: string;
  email?: string;
  phone?: string;
  taxCode?: string;
  birthDate?: string;
  birthPlace?: string;
}

export const studentItemSchema = z.object({
  firstName: z.string().min(2, "Nome obbligatorio (min 2 car.)"),
  lastName: z.string().min(2, "Cognome obbligatorio (min 2 car.)"),
  email: z.string().email("Email non valida").optional().or(z.literal("")),
  phone: z.string().optional(),
  taxCode: z.string().min(16, "Codice Fiscale deve avere 16 caratteri").max(16),
  birthDate: z.string().optional(),
  birthPlace: z.string().optional(),
});

export const createBookingSchema = z.object({
  courseId: z.string().optional(),
  courseName: z.string().min(2, { message: "Inserisci il nome del corso." }),
  startDate: z.string().optional(),
  purchaserFirstName: z.string().min(2, { message: "Il nome deve avere almeno 2 caratteri" }),
  purchaserLastName: z.string().min(2, { message: "Il cognome deve avere almeno 2 caratteri" }),
  purchaserName: z.string().optional(),
  purchaserEmail: z.string().email({ message: "Email non valida." }),
  purchaserPhone: z.string().min(6, { message: "Numero di telefono non valido" }),
  purchaserTaxCode: z.string().min(16, { message: "Codice Fiscale deve avere 16 caratteri" }).max(16),
  isForChild: z.boolean().default(false),
  students: z.array(studentItemSchema).min(1, { message: "Almeno uno studente è richiesto" }),
  studentFirstName: z.string().optional(),
  studentLastName: z.string().optional(),
  studentEmail: z.string().optional(),
  studentPhone: z.string().optional(),
  studentBirthDate: z.string().optional(),
  studentTaxCode: z.string().optional(),
  needsCompanyInvoice: z.boolean().default(false),
  sdiCode: z.string().max(7, { message: "Codice SDI max 7 caratteri" }).optional(),
  pecEmail: z.string().optional(),
  amountPaid: z.coerce.number().min(0),
  registrationFee: z.coerce.number().min(0).default(0),
  promoCode: z.string().optional(),
  billingScheme: z.string().default("full"),
  paymentStatus: z.string().min(1),
  paymentMethod: z.string().min(1),
  notes: z.string().optional(),
});

export type CreateBookingValues = z.infer<typeof createBookingSchema>;

export interface AppliedPromo {
  id: string;
  code: string;
  description?: string | null;
  discountType: number; // 1=PERCENTAGE, 2=FIXED_AMOUNT
  discountValue: number;
  waiveRegistrationFee: boolean;
  discountAmount: number;
}

export interface ClientItem {
  id: string;
  label: string;
  name?: string;
  taxCode?: string;
  email?: string;
  phone?: string;
  birthDate?: string;
  purchaserName?: string;
  purchaserEmail?: string;
  purchaserPhone?: string;
  purchaserTaxCode?: string;
  studentName?: string;
  studentEmail?: string;
  studentPhone?: string;
  studentTaxCode?: string;
  studentBirthDate?: string;
  isForChild?: boolean;
  savedStudents?: SavedStudentItem[];
  [key: string]: any;
}

export interface CreateBookingDialogProps {
  onCreateBooking: (values: Record<string, any>) => Promise<unknown>;
}

export const STEPS = [
  { id: 1, label: "Cliente", sublabel: "Anagrafica", icon: User },
  { id: 2, label: "Corso", sublabel: "Calendario", icon: CalendarIcon },
  { id: 3, label: "Pagamento", sublabel: "Riepilogo", icon: CreditCard },
];

