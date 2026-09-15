import { Test, TestingModule } from '@nestjs/testing';
import { PaymentsService } from './payments.admin.service';
import { PaymentsRepository } from './domain/payments.repository.interface';
import { PrismaService } from '../../core/prisma/prisma.service';
import {
  BookingPaymentStatus,
  PaymentRecordStatus,
  PaymentType,
} from '@atena/api-types';

describe('PaymentsService — Business Logic Tests', () => {
  let service: PaymentsService;
  let repository: jest.Mocked<PaymentsRepository>;
  let prisma: {
    booking: {
      findUnique: jest.Mock;
      update: jest.Mock;
    };
    payment: {
      create: jest.Mock;
    };
    $executeRawUnsafe: jest.Mock;
  };

  beforeEach(async () => {
    repository = {
      findAll: jest.fn(),
      findById: jest.fn(),
      create: jest.fn(),
      update: jest.fn(),
      delete: jest.fn(),
    } as any;

    prisma = {
      booking: {
        findUnique: jest.fn(),
        update: jest.fn().mockResolvedValue({}),
      },
      payment: {
        create: jest.fn(),
      },
      $executeRawUnsafe: jest.fn().mockResolvedValue(1),
    };

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        PaymentsService,
        { provide: PaymentsRepository, useValue: repository },
        { provide: PrismaService, useValue: prisma },
      ],
    }).compile();

    service = module.get<PaymentsService>(PaymentsService);
  });

  describe('Booking Payment Status Calculation', () => {
    it('should transition booking paymentStatus to "paid" when total succeeded payments meet total target', async () => {
      const mockExisting = { id: 'pay-1', bookingId: 'booking-1', amount: 300, status: PaymentRecordStatus.PENDING, type: PaymentType.COURSE_PAYMENT };
      const mockUpdated = { id: 'pay-1', bookingId: 'booking-1', amount: 300, status: PaymentRecordStatus.SUCCEEDED, type: PaymentType.COURSE_PAYMENT };

      repository.findById.mockResolvedValue(mockExisting as any);
      repository.update.mockResolvedValue(mockUpdated as any);
      repository.findAll.mockResolvedValue([
        { id: 'pay-1', amount: 300, status: PaymentRecordStatus.SUCCEEDED, type: PaymentType.COURSE_PAYMENT } as any,
      ]);
      prisma.booking.findUnique.mockResolvedValue({
        id: 'booking-1',
        amountPaid: 300,
        registrationFee: 30,
        userId: 'student-1',
      });

      await service.update('pay-1', { status: PaymentRecordStatus.SUCCEEDED });

      expect(prisma.booking.update).toHaveBeenCalledWith({
        where: { id: 'booking-1' },
        data: {
          amountPaid: 300,
          paymentStatus: BookingPaymentStatus.PAID,
        },
      });
    });

    it('should transition booking paymentStatus to "partially_paid" when total succeeded payments are less than target', async () => {
      const mockExisting = { id: 'pay-1', bookingId: 'booking-1', amount: 150, status: PaymentRecordStatus.PENDING, type: PaymentType.COURSE_PAYMENT };
      const mockUpdated = { id: 'pay-1', bookingId: 'booking-1', amount: 150, status: PaymentRecordStatus.SUCCEEDED, type: PaymentType.COURSE_PAYMENT };

      repository.findById.mockResolvedValue(mockExisting as any);
      repository.update.mockResolvedValue(mockUpdated as any);
      repository.findAll.mockResolvedValue([
        { id: 'pay-1', amount: 150, status: PaymentRecordStatus.SUCCEEDED, type: PaymentType.COURSE_PAYMENT } as any,
      ]);
      prisma.booking.findUnique.mockResolvedValue({
        id: 'booking-1',
        amountPaid: 300,
        registrationFee: 30,
        userId: 'student-1',
      });

      await service.update('pay-1', { status: PaymentRecordStatus.SUCCEEDED });

      expect(prisma.booking.update).toHaveBeenCalledWith({
        where: { id: 'booking-1' },
        data: {
          amountPaid: 150,
          paymentStatus: BookingPaymentStatus.PARTIALLY_REFUNDED,
        },
      });
    });
  });

  describe('Annual Membership Activation Invariants', () => {
    it('should activate annual_memberships and set annual_fee_paid=true when registration_fee payment becomes succeeded', async () => {
      const mockExisting = {
        id: 'pay-fee-1',
        bookingId: 'booking-1',
        studentId: 'student-100',
        amount: 30,
        status: PaymentRecordStatus.PENDING,
        type: PaymentType.REGISTRATION_FEE,
      };
      const mockUpdated = { ...mockExisting, status: PaymentRecordStatus.SUCCEEDED };

      repository.findById.mockResolvedValue(mockExisting as any);
      repository.update.mockResolvedValue(mockUpdated as any);
      repository.findAll.mockResolvedValue([mockUpdated as any]);
      prisma.booking.findUnique.mockResolvedValue({
        id: 'booking-1',
        amountPaid: 30,
        registrationFee: 30,
        userId: 'student-100',
      });

      await service.update('pay-fee-1', { status: PaymentRecordStatus.SUCCEEDED });

      expect(prisma.$executeRawUnsafe).toHaveBeenCalledWith(
        expect.stringContaining("UPDATE students SET annual_fee_paid = true"),
      );

      expect(prisma.$executeRawUnsafe).toHaveBeenCalledWith(
        expect.stringContaining("status = 1"),
      );
    });

    it('should set annual_memberships status to pending and annual_fee_paid=false when registration_fee payment status becomes pending', async () => {
      const mockExisting = {
        id: 'pay-fee-1',
        bookingId: 'booking-1',
        studentId: 'student-100',
        amount: 30,
        status: PaymentRecordStatus.SUCCEEDED,
        type: PaymentType.REGISTRATION_FEE,
      };
      const mockUpdated = { ...mockExisting, status: PaymentRecordStatus.PENDING };

      repository.findById.mockResolvedValue(mockExisting as any);
      repository.update.mockResolvedValue(mockUpdated as any);
      repository.findAll.mockResolvedValue([]);
      prisma.booking.findUnique.mockResolvedValue({
        id: 'booking-1',
        amountPaid: 0,
        registrationFee: 30,
        userId: 'student-100',
      });

      await service.update('pay-fee-1', { status: PaymentRecordStatus.PENDING });

      expect(prisma.$executeRawUnsafe).toHaveBeenCalledWith(
        expect.stringContaining("UPDATE students SET annual_fee_paid = false"),
      );

      expect(prisma.$executeRawUnsafe).toHaveBeenCalledWith(
        expect.stringContaining("UPDATE annual_memberships SET status = 2"),
      );
    });

    it('should activate standalone membership fee (without bookingId) when payment becomes succeeded', async () => {
      const memId = '11111111-2222-3333-4444-555555555555';
      const mockExisting = {
        id: 'pay-standalone-1',
        bookingId: null,
        studentId: 'student-200',
        amount: 30,
        status: PaymentRecordStatus.PENDING,
        type: PaymentType.REGISTRATION_FEE,
        notes: `Quota d'iscrizione annuale [membership_id:${memId}]`,
      };
      const mockUpdated = { ...mockExisting, status: PaymentRecordStatus.SUCCEEDED };

      repository.findById.mockResolvedValue(mockExisting as any);
      repository.update.mockResolvedValue(mockUpdated as any);

      await service.update('pay-standalone-1', { status: PaymentRecordStatus.SUCCEEDED });

      expect(prisma.$executeRawUnsafe).toHaveBeenCalledWith(
        expect.stringContaining(`UPDATE annual_memberships SET status = 1`),
      );
      expect(prisma.$executeRawUnsafe).toHaveBeenCalledWith(
        expect.stringContaining(`UPDATE students SET annual_fee_paid = true`),
      );
    });
  });
});
