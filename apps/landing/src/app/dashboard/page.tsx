import { redirect } from 'next/navigation';

export default function LandingDashboardRedirectPage() {
  const appUrl = process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3002';
  redirect(`${appUrl}/dashboard`);
}
