import { redirect } from 'next/navigation';
import { env } from '@/config/env';

export default async function LandingBookingDetailRedirectPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  redirect(`${env.NEXT_PUBLIC_APP_URL}/dashboard/bookings/${id}`);
}
