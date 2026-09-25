import { Test, TestingModule } from '@nestjs/testing';
import { MembershipsService } from './memberships.admin.service';
import { MembershipsRepository } from './domain/memberships.repository.interface';
import { PrismaService } from '../../core/prisma/prisma.service';
import { MembershipStatus, PaymentRecordStatus } from '@atena/api-types';
import { vi } from 'vitest';

const jest = vi;

describe('MembershipsService — Business Logic Tests', () => {
  let service: MembershipsService;
  let repository: any;
  let prisma: any;

  beforeEach(async () => {
    repository = {
      findAll: jest.fn(),
      findById: jest.fn(),
      updateStatus: jest.fn(),
    } as any;

    prisma = {
      annualMembership: {
        count: jest.fn().mockResolvedValue(5),
        update: jest.fn().mockResolvedValue({}),
      },
      payment: {
        findFirst: jest.fn().mockResolvedValue({ id: 'pay-1' }),
        update: jest.fn().mockResolvedValue({}),
      },
      $executeRawUnsafe: jest.fn().mockResolvedValue(1),
    } as any;

    service = new MembershipsService(repository, prisma as any);
  });

  it('should set student annual_fee_paid=true and sync linked payment to succeeded when membership is set to active', async () => {
    const memId = 'mem-123';
    repository.findById
      .mockResolvedValueOnce({
        id: memId,
        studentId: 'student-99',
        status: MembershipStatus.PENDING,
        taxCode: 'RSSMRA80A01H501Z',
      } as any)
      .mockResolvedValueOnce({
        id: memId,
        studentId: 'student-99',
        status: MembershipStatus.ACTIVE,
        taxCode: 'RSSMRA80A01H501Z',
      } as any);

    repository.updateStatus.mockResolvedValue({
      id: memId,
      studentId: 'student-99',
      status: MembershipStatus.ACTIVE,
      taxCode: 'RSSMRA80A01H501Z',
    } as any);

    const result = await service.updateStatus(memId, MembershipStatus.ACTIVE);

    expect(result.status).toBe(MembershipStatus.ACTIVE);
    expect(prisma.$executeRawUnsafe).toHaveBeenCalledWith(
      expect.stringContaining("UPDATE students SET annual_fee_paid = true"),
    );
    expect(prisma.payment.update).toHaveBeenCalledWith(
      expect.objectContaining({
        data: expect.objectContaining({ status: PaymentRecordStatus.SUCCEEDED }),
      })
    );
  });

  it('should set student annual_fee_paid=false and sync linked payment to pending when membership is set to pending', async () => {
    const memId = 'mem-123';
    repository.findById
      .mockResolvedValueOnce({
        id: memId,
        studentId: 'student-99',
        status: MembershipStatus.ACTIVE,
        taxCode: 'RSSMRA80A01H501Z',
      } as any)
      .mockResolvedValueOnce({
        id: memId,
        studentId: 'student-99',
        status: MembershipStatus.PENDING,
        taxCode: 'RSSMRA80A01H501Z',
      } as any);

    repository.updateStatus.mockResolvedValue({
      id: memId,
      studentId: 'student-99',
      status: MembershipStatus.PENDING,
      taxCode: 'RSSMRA80A01H501Z',
    } as any);

    const result = await service.updateStatus(memId, MembershipStatus.PENDING);

    expect(result.status).toBe(MembershipStatus.PENDING);
    expect(prisma.$executeRawUnsafe).toHaveBeenCalledWith(
      expect.stringContaining("UPDATE students SET annual_fee_paid = false"),
    );
    expect(prisma.$executeRawUnsafe).toHaveBeenCalledWith(
      expect.stringContaining(`UPDATE payments SET status = ${PaymentRecordStatus.PENDING}`),
    );
  });

  it('should set student annual_fee_paid=false when membership is revoked', async () => {
    const memId = 'mem-123';
    repository.findById
      .mockResolvedValueOnce({
        id: memId,
        studentId: 'student-99',
        status: MembershipStatus.ACTIVE,
        taxCode: 'RSSMRA80A01H501Z',
      } as any)
      .mockResolvedValueOnce({
        id: memId,
        studentId: 'student-99',
        status: MembershipStatus.REVOKED,
        taxCode: 'RSSMRA80A01H501Z',
      } as any);

    repository.updateStatus.mockResolvedValue({
      id: memId,
      studentId: 'student-99',
      status: MembershipStatus.REVOKED,
      taxCode: 'RSSMRA80A01H501Z',
    } as any);

    const result = await service.updateStatus(memId, MembershipStatus.REVOKED);

    expect(result.status).toBe(MembershipStatus.REVOKED);
    expect(prisma.$executeRawUnsafe).toHaveBeenCalledWith(
      expect.stringContaining("UPDATE students SET annual_fee_paid = false"),
    );
  });
});

