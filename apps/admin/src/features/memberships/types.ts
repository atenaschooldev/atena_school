import { MembershipStatus } from '@atena/api-types';

export interface Membership {
  id: string;
  membershipNumber?: string | null;
  taxCode: string | null;
  email: string | null;
  phone: string | null;
  academicYear: string;
  status: MembershipStatus | number;
  amount?: number | string | null;
  paymentMethod?: number | null;
  paymentId?: string | null;
  studentId: string | null;
  userId: string | null;
  bookingId: string | null;
  paidAt?: string | null;
  expiresAt?: string | null;
  createdAt?: string | null;
  created_at?: string | null;
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
