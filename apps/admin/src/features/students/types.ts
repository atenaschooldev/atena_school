import { StudentStatus, LanguageLevel } from "@atena/api-types";

export interface Student {
  id: string;
  first_name: string | null;
  last_name: string | null;
  full_name: string;
  email: string | null;
  phone: string | null;
  tax_code: string | null;
  birth_date: string | null;
  birth_place?: string | null;
  language_level: LanguageLevel | number;
  registration_date: string | null;
  annual_fee_paid: boolean;
  annual_fee_paid_at: string | null;
  status: StudentStatus | number | string;
  notes?: string | null;
  parent_id?: string | null;
  student_user_id?: string | null;
  bookings?: any[];
  memberships?: any[];
}

export interface CreateStudentFormValues {
  fullName: string;
  firstName?: string;
  lastName?: string;
  email?: string;
  phone?: string;
  taxCode?: string;
  birthDate?: string;
  birthPlace?: string;
  languageLevel?: number;
  status?: number;
  annualFeePaid?: boolean;
  notes?: string;
}

export interface UpdateStudentFormValues {
  fullName?: string;
  firstName?: string;
  lastName?: string;
  email?: string;
  phone?: string;
  taxCode?: string;
  birthDate?: string;
  birthPlace?: string;
  languageLevel?: number;
  status?: number;
  annualFeePaid?: boolean;
  notes?: string;
}
