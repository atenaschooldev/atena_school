import { redirect } from 'next/navigation';
import { env } from '@/config/env';

export default function LandingAuthErrorRedirectPage() {
  redirect(`${env.NEXT_PUBLIC_APP_URL}/autenticazione/errore`);
}
