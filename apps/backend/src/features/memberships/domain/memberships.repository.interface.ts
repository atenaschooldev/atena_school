export interface MembershipEntity {
  id: string;
  taxCode: string | null;
  email: string | null;
  phone: string | null;
  academicYear: string;
  status: string;
  studentId: string | null;
  userId: string | null;
  bookingId: string | null;
  paidAt: Date;
  expiresAt: Date;
  createdAt: Date;
}

export abstract class MembershipsRepository {
  abstract findAll(filters?: { status?: string; academicYear?: string }): Promise<MembershipEntity[]>;
  abstract findById(id: string): Promise<MembershipEntity | null>;
  abstract updateStatus(id: string, status: string): Promise<MembershipEntity>;
}
