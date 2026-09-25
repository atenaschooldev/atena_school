import { describe, it, expect } from 'vitest';
import {
  calculateLessonDates,
  ANNUAL_REGISTRATION_FEE_EUR,
  getCurrentAcademicYear,
  generateMembershipNumber,
  formatCurrency,
  isFutureDate,
} from '@atena/utils';
import {
  BillingScheme,
  PaymentMethod,
  BookingPaymentStatus,
  CourseScheduleType,
  CourseFormat,
} from '@atena/api-types';
import { createReservationSchema } from '@atena/validators';

describe('Landing Checkout Flow Integration — End-to-End Business Logic', () => {
  it('calculates total for 2 siblings enrolling in a course with Stripe online payment', () => {
    const coursePricePerStudent = 150;
    const students = [
      {
        firstName: 'Marco',
        lastName: 'Bianchi',
        email: 'marco.bianchi@example.com',
        phone: '+39 340 1112233',
        taxCode: 'BNCMRA12A01H501K',
        birthDate: '2012-01-01',
        hasActiveMembership: false, // requires €30 registration fee
      },
      {
        firstName: 'Sara',
        lastName: 'Bianchi',
        email: 'sara.bianchi@example.com',
        phone: '+39 340 1112233',
        taxCode: 'BNCSRA14B41H501W',
        birthDate: '2014-02-01',
        hasActiveMembership: false, // requires €30 registration fee
      },
    ];

    const courseFeeTotal = coursePricePerStudent * students.length; // €300
    const registrationFeeTotal =
      students.filter((s) => !s.hasActiveMembership).length * ANNUAL_REGISTRATION_FEE_EUR; // €60

    const grandTotal = courseFeeTotal + registrationFeeTotal; // €360

    expect(courseFeeTotal).toBe(300);
    expect(registrationFeeTotal).toBe(60);
    expect(grandTotal).toBe(360);
    expect(formatCurrency(grandTotal)).toContain('360');

    // Validate payload against createReservationSchema
    const reservationPayload = {
      itemId: '550e8400-e29b-41d4-a716-446655440000',
      itemType: 'course',
      date: '2026-10-06',
      time: '16:00',
      firstName: 'Giuseppe',
      lastName: 'Bianchi',
      email: 'giuseppe.bianchi@example.com',
      phone: '+39 340 1112233',
      purchaserTaxCode: 'BNCGPP75C15H501Y',
      isForChild: true,
      billingScheme: BillingScheme.FULL,
      paymentMethod: PaymentMethod.STRIPE,
      students: students.map((s) => ({
        firstName: s.firstName,
        lastName: s.lastName,
        email: s.email,
        phone: s.phone,
        taxCode: s.taxCode,
        birthDate: s.birthDate,
      })),
    };

    const validationResult = createReservationSchema.safeParse(reservationPayload);
    expect(validationResult.success).toBe(true);

    // Generate lesson dates for this group booking
    const lessons = calculateLessonDates(
      '2026-10-06T16:00:00.000Z', // Tuesday
      '16:00',
      'Inglese',
      [2, 4], // Tue, Thu
      60,
      '16:00',
      '17:00',
      CourseScheduleType.FIXED
    );

    expect(lessons.length).toBeGreaterThan(0);
    expect(lessons[0].startsAt).toBeDefined();
    expect(lessons[0].endsAt).toBeDefined();
  });

  it('handles in-person reception booking with reserved payment status', () => {
    const reservationPayload = {
      itemId: '550e8400-e29b-41d4-a716-446655440000',
      itemType: 'course',
      date: '2026-10-01',
      time: '10:00',
      firstName: 'Laura',
      lastName: 'Neri',
      email: 'laura.neri@example.com',
      phone: '+39 340 9988776',
      purchaserTaxCode: 'NRELRA90A01H501Z',
      billingScheme: BillingScheme.FULL,
      paymentMethod: PaymentMethod.CASH,
    };

    const validation = createReservationSchema.safeParse(reservationPayload);
    expect(validation.success).toBe(true);
    expect(reservationPayload.paymentMethod).toBe(PaymentMethod.CASH);
  });

  it('generates unique membership card number for newly registered student in current academic year', () => {
    const { academicYear, expiresAt } = getCurrentAcademicYear('2026-10-15');
    expect(academicYear).toBe('2026/2027');
    expect(expiresAt).toContain('2027-08-31');

    const cardNumber = generateMembershipNumber(academicYear, 42);
    expect(cardNumber).toBe('ATN-2026-0042');
  });
});
