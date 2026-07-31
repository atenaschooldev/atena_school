export interface Membership {
  id: string;
  taxCode: string | null;
  email: string | null;
  phone: string | null;
  academicYear: string;
  status: 'active' | 'revoked' | 'expired' | string;
  studentId: string | null;
  userId: string | null;
  bookingId: string | null;
  paidAt: string;
  expiresAt: string;
  createdAt: string;
}
