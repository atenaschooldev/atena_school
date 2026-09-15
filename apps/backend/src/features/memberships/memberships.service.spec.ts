import { Test, TestingModule } from '@nestjs/testing';
import { MembershipsService } from './memberships.admin.service';
import { MembershipsRepository } from './domain/memberships.repository.interface';
import { PrismaService } from '../../core/prisma/prisma.service';
import { MembershipStatus, PaymentRecordStatus } from '@atena/api-types';

describe('MembershipsService — Business Logic Tests', () => {
  let service: MembershipsService;
  let repository: jest.Mocked<MembershipsRepository>;
  let prisma: {
    $executeRawUnsafe: jest.Mock;
  };

  beforeEach(async () => {
    repository = {
      findAll: jest.fn(),
      findById: jest.fn(),
      updateStatus: jest.fn(),
    } as any;

    prisma = {
      $executeRawUnsafe: jest.fn().mockResolvedValue(1),
    };

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        MembershipsService,
        { provide: MembershipsRepository, useValue: repository },
        { provide: PrismaService, useValue: prisma },
      ],
    }).compile();

    service = module.get<MembershipsService>(MembershipsService);
  });

  it('should set student annual_fee_paid=true and sync linked payment to succeeded when membership is set to active', async () => {
    const memId = 'mem-123';
    repository.findById.mockResolvedValue({
      id: memId,
      studentId: 'student-99',
      status: MembershipStatus.PENDING,
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
    expect(prisma.$executeRawUnsafe).toHaveBeenCalledWith(
      expect.stringContaining(`UPDATE payments SET status = ${PaymentRecordStatus.SUCCEEDED}`),
    );
  });

  it('should set student annual_fee_paid=false and sync linked payment to pending when membership is set to pending', async () => {
    const memId = 'mem-123';
    repository.findById.mockResolvedValue({
      id: memId,
      studentId: 'student-99',
      status: MembershipStatus.ACTIVE,
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
    repository.findById.mockResolvedValue({
      id: memId,
      studentId: 'student-99',
      status: MembershipStatus.ACTIVE,
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

