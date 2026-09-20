import { NextIntlClientProvider } from 'next-intl';
import messages from '../../messages/it.json';
import '@/index.css';
import { Nunito } from 'next/font/google';
import { Toaster } from 'sonner';

const nunito = Nunito({
  subsets: ['latin', 'latin-ext', 'cyrillic'],
  display: 'swap',
  variable: '--font-nunito',
});

export const dynamic = 'force-dynamic';
export const revalidate = 0;

import { DEFAULT_SCHOOL_PROFILE, getSchoolProfile } from '@atena/core';
import { getSupabaseAdmin } from '@/lib/supabase/admin';

export async function generateMetadata() {
  let schoolName = DEFAULT_SCHOOL_PROFILE.name;
  try {
    const supabase = getSupabaseAdmin();
    const school = await getSchoolProfile(supabase);
    if (school?.name) schoolName = school.name;
  } catch {
    // fallback to default
  }

  return {
    title: `Pannello Studente — ${schoolName}`,
    description: `Area riservata e portale studenti di ${schoolName}`,
    robots: {
      index: false,
      follow: false,
      googleBot: {
        index: false,
        follow: false,
      },
    },
    other: {
      google: 'notranslate',
    },
  };
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="it" translate="no" suppressHydrationWarning className={`notranslate ${nunito.variable}`}>
      <body className="antialiased bg-[#f8f9fa] min-h-screen flex flex-col" suppressHydrationWarning>
        <NextIntlClientProvider locale="it" messages={messages as any}>
          <div className="flex flex-col min-h-screen">
            <main className="flex-grow">{children}</main>
          </div>
          <Toaster position="top-right" richColors />
        </NextIntlClientProvider>
      </body>
    </html>
  );
}
