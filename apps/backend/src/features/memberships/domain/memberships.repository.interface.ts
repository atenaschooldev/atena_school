import { MembershipStatus } from '@atena/api-types';

export interface MembershipEntity {
  id: string;
  taxCode: string | null;
  email: string | null;
  phone: string | null;
  academicYear: string;
  status: MembershipStatus | number;
  studentId: string | null;
  userId: string | null;
  bookingId: string | null;
  paidAt: Date;
  expiresAt: Date;
  createdAt: Date;
}

export abstract class MembershipsRepository {
  abstract findAll(filters?: { status?: number | string; academicYear?: string; search?: string }): Promise<MembershipEntity[]>;
  abstract findById(id: string): Promise<MembershipEntity | null>;
  abstract updateStatus(id: string, status: number | string): Promise<MembershipEntity>;
}
