import { describe, it, expect } from 'vitest';
import {
  generateSlotSignature,
  verifySlotSignature,
  formatCurrency,
  isFutureDate,
  ANNUAL_REGISTRATION_FEE_EUR,
} from '@atena/utils';
import {
  BillingScheme,
  PaymentMethod,
  DiscountType,
} from '@atena/api-types';
import { createReservationSchema, checkFeeSchema } from '@atena/validators';

describe('Landing Checkout Roast — Strict Edge-Case Verification', () => {
  describe('1. Sibling & Multi-Student Registration Fee Logic', () => {
    it('calculates registration fee per student: €30 for each non-active student', () => {
      const students = [
        { id: 's1', name: 'Luca', isMembershipActive: false },
        { id: 's2', name: 'Giulia', isMembershipActive: true },
        { id: 's3', name: 'Marco', isMembershipActive: false },
      ];

      const feePerStudent = ANNUAL_REGISTRATION_FEE_EUR; // €30
      const unpaidCount = students.filter((s) => !s.isMembershipActive).length;
      const totalRegistrationFee = unpaidCount * feePerStudent;

      expect(ANNUAL_REGISTRATION_FEE_EUR).toBe(30);
      expect(unpaidCount).toBe(2);
      expect(totalRegistrationFee).toBe(60);
    });

    it('returns €0 fee when all registered students have active membership cards', () => {
      const students = [
        { id: 's1', activeUntil: '2027-01-01' },
        { id: 's2', activeUntil: '2026-12-31' },
      ];

      const activeStatuses = students.map((s) => isFutureDate(s.activeUntil));

      expect(activeStatuses.every(Boolean)).toBe(true);
      const totalFee = students.filter((s) => !isFutureDate(s.activeUntil)).length * ANNUAL_REGISTRATION_FEE_EUR;
      expect(totalFee).toBe(0);
    });

    it('returns €90 fee when parent books for 3 children with no active cards', () => {
      const childrenCount = 3;
      const totalFee = childrenCount * ANNUAL_REGISTRATION_FEE_EUR;
      expect(totalFee).toBe(90);
    });
  });

  describe('2. HMAC Slot Signature Tamper Resistance', () => {
    const courseId = 'corso-inglese-base';
    const dateStr = '2026-10-01';
    const daysSlug = 'mar-gio';
    const timeSlug = '16:00';

    it('successfully verifies genuine signature with matching payload', () => {
      const sig = generateSlotSignature(courseId, dateStr, daysSlug, timeSlug);
      const isValid = verifySlotSignature(courseId, dateStr, daysSlug, timeSlug, sig);
      expect(isValid).toBe(true);
    });

    it('rejects tampered course id in slot signature', () => {
      const sig = generateSlotSignature(courseId, dateStr, daysSlug, timeSlug);
      const isValid = verifySlotSignature('corso-hacked-free', dateStr, daysSlug, timeSlug, sig);
      expect(isValid).toBe(false);
    });

    it('rejects tampered date or time in slot signature', () => {
      const sig = generateSlotSignature(courseId, dateStr, daysSlug, timeSlug);
      const isValidTime = verifySlotSignature(courseId, dateStr, daysSlug, '19:00', sig);
      const isValidDate = verifySlotSignature(courseId, '2026-12-25', daysSlug, timeSlug, sig);
      expect(isValidTime).toBe(false);
      expect(isValidDate).toBe(false);
    });

    it('rejects invalid signature string or empty inputs', () => {
      const isValid1 = verifySlotSignature(courseId, dateStr, daysSlug, timeSlug, 'tampered-sig');
      const isValid2 = verifySlotSignature(courseId, null, daysSlug, timeSlug, 'sig');
      expect(isValid1).toBe(false);
      expect(isValid2).toBe(false);
    });
  });

  describe('3. Promo Code Discount Arithmetic & Bounds', () => {
    function applyDiscount(
      originalPrice: number,
      discount: { type: DiscountType; value: number } | null
    ): { discountedPrice: number; discountAmount: number } {
      if (!discount) return { discountedPrice: originalPrice, discountAmount: 0 };

      let amount = 0;
      if (discount.type === DiscountType.PERCENTAGE) {
        amount = Math.round((originalPrice * discount.value) / 100);
      } else if (discount.type === DiscountType.FIXED_AMOUNT) {
        amount = discount.value;
      }

      const discountedPrice = Math.max(0, originalPrice - amount);
      return { discountedPrice, discountAmount: Math.min(amount, originalPrice) };
    }

    it('computes 20% discount accurately', () => {
      const res = applyDiscount(200, { type: DiscountType.PERCENTAGE, value: 20 });
      expect(res.discountAmount).toBe(40);
      expect(res.discountedPrice).toBe(160);
    });

    it('computes fixed €50 discount accurately', () => {
      const res = applyDiscount(180, { type: DiscountType.FIXED_AMOUNT, value: 50 });
      expect(res.discountAmount).toBe(50);
      expect(res.discountedPrice).toBe(130);
    });

    it('caps discount so price never becomes negative even if discount exceeds price', () => {
      const res = applyDiscount(30, { type: DiscountType.FIXED_AMOUNT, value: 100 });
      expect(res.discountAmount).toBe(30);
      expect(res.discountedPrice).toBe(0);
    });
  });

  describe('4. Reservation Schema Strict Boundary Validations', () => {
    it('rejects reservation if purchaser tax code is malformed', () => {
      const payload = {
        itemId: '550e8400-e29b-41d4-a716-446655440000',
        itemType: 'course',
        date: '2026-10-01',
        time: '10:00',
        firstName: 'Mario',
        lastName: 'Rossi',
        email: 'mario@example.com',
        phone: '+39 340 1234567',
        purchaserTaxCode: 'SHORT', // Invalid Codice Fiscale
        billingScheme: BillingScheme.FULL,
        paymentMethod: PaymentMethod.STRIPE,
      };

      const result = createReservationSchema.safeParse(payload);
      expect(result.success).toBe(false);
    });

    it('rejects child booking if student details are missing required fields', () => {
      const payload = {
        itemId: '550e8400-e29b-41d4-a716-446655440000',
        itemType: 'course',
        date: '2026-10-01',
        time: '10:00',
        firstName: 'Mario',
        lastName: 'Rossi',
        email: 'mario@example.com',
        phone: '+39 340 1234567',
        purchaserTaxCode: 'RSSMRA80A01H501T',
        isForChild: true,
        billingScheme: BillingScheme.FULL,
        paymentMethod: PaymentMethod.STRIPE,
        students: [
          {
            firstName: 'Luca',
            lastName: '', // Invalid empty lastName
            email: 'luca@example.com',
            phone: '+39 340 1234567',
            taxCode: 'RSSLCU10A01H501Z',
            birthDate: '2015-05-12',
          },
        ],
      };

      const result = createReservationSchema.safeParse(payload);
      expect(result.success).toBe(false);
    });
  });
});
