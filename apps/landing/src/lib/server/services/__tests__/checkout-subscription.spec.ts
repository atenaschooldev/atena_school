import { describe, it, expect } from 'vitest';
import { calculateLessonDates } from '@atena/utils';
import {
  BillingScheme,
  CourseBillingType,
  CourseScheduleType,
  PaymentMethod,
  BookingPaymentStatus,
} from '@atena/api-types';
import {
  createReservationSchema,
  customerPortalSchema,
  checkFeeSchema,
} from '@atena/validators';

describe('Checkout & Subscription Booking Logic', () => {
  describe('calculateLessonDates Engine Verification', () => {
    it('generates correct sequential lesson schedule for fixed weekly course', () => {
      const startDate = '2026-10-05T10:00:00.000Z'; // Monday
      const scheduleDays = [1, 3]; // Mon, Wed
      const lessons = calculateLessonDates(
        startDate,
        '10:00',
        'Inglese',
        scheduleDays,
        60,
        '10:00',
        '11:00',
        CourseScheduleType.FIXED
      );

      expect(lessons).toBeDefined();
      expect(Array.isArray(lessons)).toBe(true);
      expect(lessons.length).toBeGreaterThan(0);
      expect(lessons[0]).toHaveProperty('startsAt');
      expect(lessons[0]).toHaveProperty('endsAt');
    });

    it('handles recurring monthly subscription batch scheduling', () => {
      const currentPeriodStart = '2026-11-01T09:00:00.000Z';
      const lessons = calculateLessonDates(
        currentPeriodStart,
        '15:00',
        'Spagnolo',
        [2, 4], // Tue, Thu
        90,
        '15:00',
        '16:30',
        CourseScheduleType.FIXED
      );

      expect(lessons.length).toBeGreaterThan(0);
      expect(lessons[0].startsAt).toBeDefined();
      expect(lessons[0].endsAt).toBeDefined();
    });
  });

  describe('Validation Schemas (Validators Package)', () => {
    it('validates single student booking reservation payload', () => {
      const payload = {
        itemId: '550e8400-e29b-41d4-a716-446655440000',
        itemType: 'course',
        date: '2026-10-01',
        time: '10:00',
        firstName: 'Mario',
        lastName: 'Rossi',
        email: 'mario.rossi@example.com',
        phone: '+39 340 1234567',
        purchaserTaxCode: 'RSSMRA80A01H501T',
        billingScheme: BillingScheme.FULL,
        paymentMethod: PaymentMethod.STRIPE,
      };

      const result = createReservationSchema.safeParse(payload);
      expect(result.success).toBe(true);
    });

    it('validates multi-student sibling reservation payload', () => {
      const payload = {
        itemId: '550e8400-e29b-41d4-a716-446655440000',
        itemType: 'course',
        date: '2026-10-01',
        time: '10:00',
        firstName: 'Mario',
        lastName: 'Rossi',
        email: 'mario.rossi@example.com',
        phone: '+39 340 1234567',
        purchaserTaxCode: 'RSSMRA80A01H501T',
        isForChild: true,
        billingScheme: BillingScheme.SUBSCRIPTION,
        paymentMethod: PaymentMethod.STRIPE,
        students: [
          {
            firstName: 'Luca',
            lastName: 'Rossi',
            taxCode: 'RSSLCU10A01H501Z',
            birthDate: '2015-05-12',
          },
          {
            firstName: 'Giulia',
            lastName: 'Rossi',
            taxCode: 'RSSGLI12B41H501X',
            birthDate: '2017-08-20',
          },
        ],
      };


      const result = createReservationSchema.safeParse(payload);
      expect(result.success).toBe(true);
    });


    it('rejects invalid Codice Fiscale format in check-fee', () => {
      const result = checkFeeSchema.safeParse({ taxCode: 'INVALID_CF' });
      expect(result.success).toBe(false);
    });

    it('validates customer portal request with email, customerId, or bookingId', () => {
      expect(customerPortalSchema.safeParse({ email: 'mario.rossi@gmail.com' }).success).toBe(true);
      expect(customerPortalSchema.safeParse({ customerId: 'cus_12345678' }).success).toBe(true);
      expect(customerPortalSchema.safeParse({ bookingId: '550e8400-e29b-41d4-a716-446655440000' }).success).toBe(true);
      expect(customerPortalSchema.safeParse({}).success).toBe(false);
    });
  });
});
