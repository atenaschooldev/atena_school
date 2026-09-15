import { MembershipStatus } from '@atena/api-types';

export interface Membership {
  id: string;
  taxCode: string | null;
  email: string | null;
  phone: string | null;
  academicYear: string;
  status: MembershipStatus | number;
  studentId: string | null;
  userId: string | null;
  bookingId: string | null;
  paidAt: string;
  expiresAt: string;
  student?: {
    id: string;
    full_name?: string;
    first_name?: string;
    last_name?: string;
    email?: string;
    tax_code?: string;
  } | null;
  booking?: {
    id: string;
    studentName?: string;
    purchaserName?: string;
    studentEmail?: string;
    purchaserEmail?: string;
    studentTaxCode?: string;
    purchaserTaxCode?: string;
  } | null;
}
