import React from 'react';
import { describe, it, expect, vi } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';
import DashboardPage from '@/app/dashboard/page';
import { BookingPaymentStatus } from '@atena/api-types';

const mockUseDashboard = vi.fn();

vi.mock('@/features/dashboard/hooks/useDashboard', () => ({
  useDashboard: () => mockUseDashboard(),
}));

vi.mock('@/i18n/routing', () => ({
  Link: ({ children, href, ...props }: any) => (
    <a href={href} {...props}>
      {children}
    </a>
  ),
}));

vi.mock('@/app/actions/auth', () => ({
  signOutAction: vi.fn(async () => ({ success: true })),
}));

describe('Personal Cabinet (apps/app) — DashboardPage Component Strict Tests', () => {
  it('renders loading spinner when loading=true', () => {
    mockUseDashboard.mockReturnValue({
      loading: true,
      user: null,
    });

    const { container } = render(<DashboardPage />);
    expect(container.querySelector('.animate-spin')).toBeTruthy();
  });

  it('renders "Accesso richiesto" and login link when user is null and not loading', () => {
    mockUseDashboard.mockReturnValue({
      loading: false,
      user: null,
    });

    render(<DashboardPage />);
    expect(screen.getByText('Accesso richiesto')).toBeTruthy();
    const loginLink = screen.getByRole('link', { name: /accedi ora/i });
    expect(loginLink.getAttribute('href')).toBe('/autenticazione/accedi?redirect=/dashboard');
  });

  it('renders parent panel when userRole is "parent" with upcoming bookings', () => {
    const handleSaveProfile = vi.fn((e) => e.preventDefault());
    const setActiveTab = vi.fn();

    mockUseDashboard.mockReturnValue({
      loading: false,
      user: {
        id: 'usr-p-1',
        email: 'parent@example.com',
        userRole: 'parent',
        dbProfile: { full_name: 'Mario Rossi', phone: '+39 340 1234567' },
      },
      activeTab: 'upcoming',
      setActiveTab,
      upcomingBookings: [
        {
          id: 'bk-child-1',
          item_type: 'course',
          course_name: 'Inglese per Bambini',
          teacher_name: 'Prof. John Doe',
          price: 180,
          payment_status: BookingPaymentStatus.PAID,
          is_future: true,
        },
      ],
      pastBookings: [],
      profileName: 'Mario Rossi',
      setProfileName: vi.fn(),
      profilePhone: '+39 340 1234567',
      setProfilePhone: vi.fn(),
      savingProfile: false,
      handleSaveProfile,
      siteUrl: 'https://atenaschool.com',
    });

    render(<DashboardPage />);

    expect(screen.getByText(/area genitore \/ acquirente/i)).toBeTruthy();
    expect(screen.getByText(/pannello genitore/i)).toBeTruthy();
    expect(screen.getByText('Inglese per Bambini')).toBeTruthy();
    expect(screen.getByText(/docente: prof. john doe/i)).toBeTruthy();
    expect(screen.getByText('€180.00')).toBeTruthy();
    expect(screen.getByText(/✓ pagato/i)).toBeTruthy();

    // Click on past tab
    const pastTabBtn = screen.getByRole('button', { name: /passati/i });
    fireEvent.click(pastTabBtn);
    expect(setActiveTab).toHaveBeenCalledWith('past');
  });

  it('renders empty state message when active tab has no bookings', () => {
    mockUseDashboard.mockReturnValue({
      loading: false,
      user: {
        id: 'usr-s-1',
        email: 'student@example.com',
        userRole: 'student',
        dbProfile: { full_name: 'Giulia Bianchi' },
      },
      activeTab: 'past',
      setActiveTab: vi.fn(),
      upcomingBookings: [],
      pastBookings: [],
      profileName: 'Giulia Bianchi',
      setProfileName: vi.fn(),
      profilePhone: '',
      setProfilePhone: vi.fn(),
      savingProfile: false,
      handleSaveProfile: vi.fn(),
      siteUrl: 'https://atenaschool.com',
    });

    render(<DashboardPage />);

    expect(screen.getByText(/pannello studente/i)).toBeTruthy();
    expect(screen.getByText(/nessuna lezione o corso trovato in questa sezione/i)).toBeTruthy();
  });
});
