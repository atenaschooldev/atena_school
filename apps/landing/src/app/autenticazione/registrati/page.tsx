import { redirect } from 'next/navigation';

export default async function LandingRegistratiRedirectPage({
  searchParams,
}: {
  searchParams: Promise<{ [key: string]: string | string[] | undefined }>;
}) {
  const params = await searchParams;
  const redirectTarget = typeof params.redirect === 'string' ? params.redirect : '/dashboard';
  const appUrl = process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3002';
  redirect(`${appUrl}/autenticazione/registrati?redirect=${encodeURIComponent(redirectTarget)}`);
}
