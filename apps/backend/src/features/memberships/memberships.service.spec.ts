import { Test, TestingModule } from '@nestjs/testing';
import { MembershipsService } from './memberships.service';
import { MembershipsRepository } from './domain/memberships.repository.interface';
import { PrismaService } from '../../core/prisma/prisma.service';

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
      status: 'pending',
      taxCode: 'RSSMRA80A01H501Z',
    } as any);

    repository.updateStatus.mockResolvedValue({
      id: memId,
      studentId: 'student-99',
      status: 'active',
      taxCode: 'RSSMRA80A01H501Z',
    } as any);

    const result = await service.updateStatus(memId, 'active');

    expect(result.status).toBe('active');
    expect(prisma.$executeRawUnsafe).toHaveBeenCalledWith(
      expect.stringContaining("UPDATE students SET annual_fee_paid = true"),
    );
    expect(prisma.$executeRawUnsafe).toHaveBeenCalledWith(
      expect.stringContaining(`UPDATE payments SET status = 'succeeded'`),
    );
  });

  it('should set student annual_fee_paid=false and sync linked payment to pending when membership is set to pending', async () => {
    const memId = 'mem-123';
    repository.findById.mockResolvedValue({
      id: memId,
      studentId: 'student-99',
      status: 'active',
      taxCode: 'RSSMRA80A01H501Z',
    } as any);

    repository.updateStatus.mockResolvedValue({
      id: memId,
      studentId: 'student-99',
      status: 'pending',
      taxCode: 'RSSMRA80A01H501Z',
    } as any);

    const result = await service.updateStatus(memId, 'pending');

    expect(result.status).toBe('pending');
    expect(prisma.$executeRawUnsafe).toHaveBeenCalledWith(
      expect.stringContaining("UPDATE students SET annual_fee_paid = false"),
    );
    expect(prisma.$executeRawUnsafe).toHaveBeenCalledWith(
      expect.stringContaining(`UPDATE payments SET status = 'pending'`),
    );
  });

  it('should set student annual_fee_paid=false when membership is revoked', async () => {
    const memId = 'mem-123';
    repository.findById.mockResolvedValue({
      id: memId,
      studentId: 'student-99',
      status: 'active',
      taxCode: 'RSSMRA80A01H501Z',
    } as any);

    repository.updateStatus.mockResolvedValue({
      id: memId,
      studentId: 'student-99',
      status: 'revoked',
      taxCode: 'RSSMRA80A01H501Z',
    } as any);

    const result = await service.updateStatus(memId, 'revoked');

    expect(result.status).toBe('revoked');
    expect(prisma.$executeRawUnsafe).toHaveBeenCalledWith(
      expect.stringContaining("UPDATE students SET annual_fee_paid = false"),
    );
  });
});
