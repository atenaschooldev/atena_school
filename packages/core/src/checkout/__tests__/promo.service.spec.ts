import { describe, it, expect, vi } from 'vitest';
import { validatePromoCode } from '../promo.service';
import { DiscountType } from '@atena/api-types';

describe('PromoService - validatePromoCode', () => {
  const createMockSupabase = (promoData: any, bookingsCount: number = 0, userBookingsCount: number = 0) => {
    return {
      from: vi.fn().mockImplementation((table: string) => {
        if (table === 'promo_codes') {
          return {
            select: vi.fn().mockReturnThis(),
            ilike: vi.fn().mockReturnThis(),
            eq: vi.fn().mockReturnThis(),
            maybeSingle: vi.fn().mockResolvedValue({ data: promoData, error: null }),
          };
        }
        if (table === 'bookings') {
          return {
            select: vi.fn().mockReturnThis(),
            ilike: vi.fn().mockReturnThis(),
            neq: vi.fn().mockReturnThis(),
            eq: vi.fn().mockReturnThis(),
            or: vi.fn().mockReturnThis(),
            then: (resolve: any) => resolve({ count: userBookingsCount || bookingsCount, error: null }),
          };
        }
        return {};
      }),
    } as any;
  };

  it('validates a valid percentage promo code globally', async () => {
    const promo = {
      id: 'p1',
      code: 'SUMMER10',
      discount_type: DiscountType.PERCENTAGE,
      discount_value: 10,
      waive_registration_fee: false,
      is_active: true,
      applicable_course_ids: [],
    };
    const mockSupabase = createMockSupabase(promo);

    const result = await validatePromoCode(mockSupabase, {
      code: 'SUMMER10',
      coursePrice: 200,
    });

    expect(result.valid).toBe(true);
    expect(result.promo?.discountAmount).toBe(20);
    expect(result.promo?.waiveRegistrationFee).toBe(false);
  });

  it('validates a course-specific promo code successfully when course matches', async () => {
    const promo = {
      id: 'p2',
      code: 'KIDS20',
      discount_type: DiscountType.FIXED_AMOUNT,
      discount_value: 50,
      waive_registration_fee: true,
      is_active: true,
      applicable_course_ids: ['course-kids-123', 'course-kids-456'],
    };
    const mockSupabase = createMockSupabase(promo);

    const result = await validatePromoCode(mockSupabase, {
      code: 'KIDS20',
      coursePrice: 300,
      courseId: 'course-kids-123',
    });

    expect(result.valid).toBe(true);
    expect(result.promo?.discountAmount).toBe(50);
    expect(result.promo?.waiveRegistrationFee).toBe(true);
  });

  it('rejects course-specific promo code when course does not match', async () => {
    const promo = {
      id: 'p2',
      code: 'KIDS20',
      discount_type: DiscountType.FIXED_AMOUNT,
      discount_value: 50,
      is_active: true,
      applicable_course_ids: ['course-kids-123'],
    };
    const mockSupabase = createMockSupabase(promo);

    const result = await validatePromoCode(mockSupabase, {
      code: 'KIDS20',
      coursePrice: 300,
      courseId: 'course-adults-999',
    });

    expect(result.valid).toBe(false);
    expect(result.error).toContain('non è valido per il corso selezionato');
  });

  it('rejects promo code when user has already reached max_uses_per_user limit', async () => {
    const promo = {
      id: 'p3',
      code: 'ONCEONLY',
      discount_type: DiscountType.PERCENTAGE,
      discount_value: 20,
      is_active: true,
      max_uses_per_user: 1,
    };
    // user already used it 1 time
    const mockSupabase = createMockSupabase(promo, 5, 1);

    const result = await validatePromoCode(mockSupabase, {
      code: 'ONCEONLY',
      coursePrice: 150,
      purchaserEmail: 'student@example.com',
    });

    expect(result.valid).toBe(false);
    expect(result.error).toContain('limite di utilizzi');
  });
});
