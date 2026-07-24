import { redirect } from 'next/navigation';
import { env } from '@/config/env';

export default function LandingAccediRedirectPage() {
  redirect(`${env.NEXT_PUBLIC_APP_URL}/autenticazione/accedi`);
}
