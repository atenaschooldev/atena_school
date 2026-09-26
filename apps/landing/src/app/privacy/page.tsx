import { getTranslations } from "next-intl/server";
import { env } from "@/config/env";
import { getSchoolProfile } from "@atena/core";
import { getSupabaseAdmin } from "@/lib/server/supabase-admin";

const siteUrl = env.NEXT_PUBLIC_SITE_URL;

export async function generateMetadata() {
  const supabase = getSupabaseAdmin();
  const school = await getSchoolProfile(supabase);
  const title = 'Informativa sulla Privacy';
  const description = `Informativa sulla privacy e sul trattamento dei dati personali di ${school.name}, ai sensi del GDPR.`;
  const url = `${siteUrl}/privacy`;

  return {
    title,
    description,
    robots: { index: true, follow: true },
    alternates: {
      canonical: url,
    },
    openGraph: {
      type: 'website',
      locale: 'it_IT',
      url,
      siteName: school.name,
      title,
      description,
    },
  };
}

export default async function PrivacyPolicy() {
  const t = await getTranslations("privacy");
  const supabase = getSupabaseAdmin();
  const school = await getSchoolProfile(supabase);
  const contactEmail = school.secretariat_email || school.email || "";

  // Get sections manually as next-intl handles arrays differently in v3+
  // Assuming 4 sections based on it.json/en.json
  const sections = [0, 1, 2, 3];

  return (
    <div className="min-h-screen bg-background pt-24 pb-16">
      <div className="container mx-auto px-4 max-w-4xl">
        <div className="mb-12 border-b pb-8">
          <h1 className="text-4xl md:text-5xl font-bold mb-4 font-serif text-primary">
            {t("title")}
          </h1>
          <p className="text-muted-foreground">{t("lastUpdated")}</p>
        </div>

        <div className="space-y-12">
          <section>
            <p className="text-lg leading-relaxed text-foreground/80">
              {t("content.intro")}
            </p>
          </section>

          <div className="grid gap-10">
            {sections.map((index) => (
              <section key={index} className="space-y-3">
                <h2 className="text-2xl font-semibold text-primary/90">
                  {t(`content.sections.${index}.title`)}
                </h2>
                <div className="text-muted-foreground leading-relaxed whitespace-pre-line">
                  {t(`content.sections.${index}.text`)}
                </div>
              </section>
            ))}
          </div>

          <section className="mt-16 p-8 rounded-2xl bg-muted/50 border border-primary/10">
            <h2 className="text-xl font-bold mb-4">Contatti</h2>
            <p className="text-sm text-muted-foreground">
              Per qualsiasi domanda relativa alla presente informativa sulla privacy o al trattamento dei vostri dati,
              potete contattarci all'indirizzo <a href={`mailto:${contactEmail}`} className="text-primary hover:underline">{contactEmail}</a>.
            </p>
          </section>
        </div>
      </div>
    </div>
  );
}
