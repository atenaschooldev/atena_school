import { EnglishTest } from "@/features/test-inglese";
import { env } from "@/config/env";
import { getSchoolProfile } from "@atena/core";
import { getSupabaseAdmin } from "@/lib/server/supabase-admin";

export async function generateMetadata() {
  const supabase = getSupabaseAdmin();
  const school = await getSchoolProfile(supabase);
  const siteUrl = env.NEXT_PUBLIC_SITE_URL;
  const title = `Test di Inglese Online Gratis — ${school.name}`;
  const description =
    "Metti alla prova le tue competenze in soli 2 minuti. Rispondi a 6 domande rapide e scopri subito il tuo livello CEFR stimato (da A1 a C2).";

  return {
    title,
    description,
    alternates: {
      canonical: `${siteUrl}/test-inglese`,
      languages: {
        it: `${siteUrl}/test-inglese`,
        "x-default": `${siteUrl}/test-inglese`,
      },
    },
    robots: {
      index: true,
      follow: true,
    },
    openGraph: {
      type: "website",
      locale: "it_IT",
      url: `${siteUrl}/test-inglese`,
      siteName: school.name,
      title,
      description,
      images: [
        {
          url: `${siteUrl}/og-default.webp`,
          width: 1200,
          height: 630,
          alt: `${school.name} English Test`,
        },
      ],
    },
    twitter: {
      card: "summary_large_image",
      title,
      description,
    },
  };
}

export default function TestPage() {
  return (
    <main className="h-dvh w-full pt-16 sm:pt-20 pb-4 bg-gray-50 px-4 flex flex-col justify-center items-center overflow-hidden relative">
      <EnglishTest />
    </main>
  );
}
