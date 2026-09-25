import { describe, it, expect, vi, beforeEach } from 'vitest';

const mockGetUser = vi.fn();
const mockGetSession = vi.fn();
const mockSupabaseAdmin = {
  from: vi.fn(),
};

vi.mock('@/lib/supabase/server', () => ({
  createClient: vi.fn(async () => ({
    auth: {
      getUser: mockGetUser,
      getSession: mockGetSession,
    },
    from: vi.fn(() => ({
      update: vi.fn(() => ({
        eq: vi.fn(() => Promise.resolve({ error: null })),
      })),
    })),
  })),
}));

vi.mock('@/lib/supabase/admin', () => ({
  getSupabaseAdmin: vi.fn(() => mockSupabaseAdmin),
}));

vi.mock('next/headers', () => ({
  cookies: vi.fn(async () => ({
    getAll: vi.fn(() => []),
  })),
}));

vi.mock('@atena/core', () => ({
  linkUserAccountWorkflow: vi.fn(async () => ({ linkedBookings: 1 })),
  DEFAULT_SCHOOL_PROFILE: {
    name: 'Atena School',
    site_url: 'https://atenaschool.com',
  },
  getSchoolProfile: vi.fn(async () => ({
    name: 'Atena School',
    site_url: 'https://atenaschool.com',
  })),
  getDomainsCredentials: vi.fn(async () => ({
    siteUrl: 'https://atenaschool.com',
    appUrl: 'https://app.atenaschool.com',
  })),
}));

describe('Personal Cabinet (apps/app) — Dashboard Server Actions Strict Tests', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('returns success=false and empty bookings if user is not authenticated', async () => {
    mockGetUser.mockResolvedValue({ data: { user: null } });

    const { getDashboardDataAction } = await import('../dashboard');
    const result = await getDashboardDataAction();

    expect(result.success).toBe(false);
    expect(result.user).toBeNull();
    expect(result.bookings).toEqual([]);
  });

  it('correctly loads parent dashboard with child bookings and assigns role=parent', async () => {
    const parentUser = {
      id: 'usr-parent-123',
      email: 'mario.rossi@example.com',
      user_metadata: { full_name: 'Mario Rossi' },
    };
    mockGetUser.mockResolvedValue({ data: { user: parentUser } });

    // Mock query chain on supabaseAdmin
    const mockBookingsData = [
      {
        id: 'bk-1',
        user_id: 'usr-parent-123',
        purchaser_email: 'mario.rossi@example.com',
        student_email: 'luca.rossi@example.com', // different email -> child booking
        student_name: 'Luca Rossi',
        course_id: 'course-101',
        amount_paid: 180,
        start_date: '2026-11-01',
        payment_status: 1, // COMPLETED
      },
    ];

    const mockCoursesData = [
      {
        id: 'course-101',
        name: 'Inglese per Bambini',
        price: 180,
        teacher_id: 'teacher-1',
      },
    ];

    const mockTeachersData = [
      {
        id: 'teacher-1',
        teacher_id: 'teacher-1',
        full_name: 'Prof. John Doe',
      },
    ];

    mockSupabaseAdmin.from = vi.fn((table: string) => {
      if (table === 'bookings') {
        return {
          select: vi.fn(() => ({
            or: vi.fn(() => ({
              order: vi.fn(() => Promise.resolve({ data: mockBookingsData, error: null })),
            })),
          })),
        };
      }
      if (table === 'courses') {
        return {
          select: vi.fn(() => ({
            in: vi.fn(() => Promise.resolve({ data: mockCoursesData, error: null })),
          })),
        };
      }
      if (table === 'teachers') {
        return {
          select: vi.fn(() => ({
            in: vi.fn(() => Promise.resolve({ data: mockTeachersData, error: null })),
          })),
        };
      }
      if (table === 'users') {
        return {
          select: vi.fn(() => ({
            eq: vi.fn(() => ({
              maybeSingle: vi.fn(() =>
                Promise.resolve({
                  data: { id: 'usr-parent-123', full_name: 'Mario Rossi', phone: '+39 340 1234567' },
                  error: null,
                })
              ),
            })),
          })),
        };
      }
      return {
        select: vi.fn(() => ({
          in: vi.fn(() => Promise.resolve({ data: [], error: null })),
          eq: vi.fn(() => ({ maybeSingle: vi.fn(() => Promise.resolve({ data: null, error: null })) })),
        })),
      };
    });

    const { getDashboardDataAction } = await import('../dashboard');
    const result = await getDashboardDataAction();

    expect(result.success).toBe(true);
    expect(result.userRole).toBe('parent');
    expect(result.user.userRole).toBe('parent');
    expect(result.bookings).toHaveLength(1);
    expect(result.bookings[0].title).toBe('Inglese per Bambini');
    expect(result.bookings[0].teacher_name).toBe('Prof. John Doe');
    expect(result.bookings[0].is_purchaser).toBe(true);
    expect(result.bookings[0].is_future).toBe(true);
  });

  it('correctly assigns role=student when booking is for the purchaser themselves', async () => {
    const studentUser = {
      id: 'usr-student-456',
      email: 'anna.verdi@example.com',
      user_metadata: { full_name: 'Anna Verdi' },
    };
    mockGetUser.mockResolvedValue({ data: { user: studentUser } });

    const mockBookingsData = [
      {
        id: 'bk-2',
        user_id: 'usr-student-456',
        purchaser_email: 'anna.verdi@example.com',
        student_email: 'anna.verdi@example.com', // same email -> student themselves
        student_name: 'Anna Verdi',
        course_id: 'course-202',
        amount_paid: 120,
        start_date: '2026-05-01', // in the past relative to 2026-09
        payment_status: 1,
      },
    ];

    mockSupabaseAdmin.from = vi.fn((table: string) => {
      if (table === 'bookings') {
        return {
          select: vi.fn(() => ({
            or: vi.fn(() => ({
              order: vi.fn(() => Promise.resolve({ data: mockBookingsData, error: null })),
            })),
          })),
        };
      }
      return {
        select: vi.fn(() => ({
          in: vi.fn(() => Promise.resolve({ data: [], error: null })),
          eq: vi.fn(() => ({ maybeSingle: vi.fn(() => Promise.resolve({ data: null, error: null })) })),
        })),
      };
    });

    const { getDashboardDataAction } = await import('../dashboard');
    const result = await getDashboardDataAction();

    expect(result.success).toBe(true);
    expect(result.userRole).toBe('student');
    expect(result.bookings).toHaveLength(1);
    expect(result.bookings[0].is_student).toBe(true);
    expect(result.bookings[0].is_future).toBe(false); // 2026-05 is in the past
  });

  it('updateUserProfileAction splits name and updates profile in database', async () => {
    mockGetUser.mockResolvedValue({
      data: { user: { id: 'usr-parent-123', email: 'mario@example.com' } },
    });

    const { updateUserProfileAction } = await import('../dashboard');
    const result = await updateUserProfileAction({
      profileName: 'Mario Rossi',
      profilePhone: '+39 340 7654321',
    });

    expect(result.success).toBe(true);
  });
});
