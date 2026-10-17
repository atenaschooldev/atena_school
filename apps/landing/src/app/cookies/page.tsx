import { getTranslations } from "next-intl/server";
import { env } from "@/config/env";
import { getSchoolProfile } from "@atena/core";
import { getSupabaseAdmin } from "@/lib/server/supabase-admin";

const siteUrl = env.NEXT_PUBLIC_SITE_URL;

export async function generateMetadata() {
  const supabase = getSupabaseAdmin();
  const school = await getSchoolProfile(supabase);
  const title = 'Cookie Policy';
  const description = `Informativa sull'utilizzo dei cookie su ${school.name}. Scopri quali cookie utilizziamo e come gestirli.`;
  const url = `${siteUrl}/cookies`;

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

export default async function CookiePolicy() {
  const t = await getTranslations("cookies");
  const supabase = getSupabaseAdmin();
  const school = await getSchoolProfile(supabase);
  const locale = 'it';
  const sections = [0, 1, 2];

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
              {t("description").replace(/Atena School/g, school.name)}
            </p>
          </section>

          <div className="grid gap-10">
            {sections.map((index) => (
              <section key={index} className="space-y-3">
                <h2 className="text-2xl font-semibold text-primary/90">
                  {t(`sections.${index}.title`)}
                </h2>
                <div className="text-muted-foreground leading-relaxed">
                  {t(`sections.${index}.text`)}
                </div>
              </section>
            ))}
          </div>

          <section className="mt-16 p-8 rounded-2xl border bg-accent/10 transition-all hover:bg-accent/20">
            <h2 className="text-xl font-bold mb-4">Cookie tecnici</h2>
            <p className="text-sm text-muted-foreground mb-4">
              Questi cookie sono necessari per il funzionamento del sito e non possono essere disattivati. 
              Includono, ad esempio, i cookie che consentono di accedere ad aree protette del sito o che ricordano 
              le vostre preferenze in materia di privacy (come l'accettazione o il rifiuto di altri cookie).
            </p>
            
            <h2 className="text-xl font-bold mb-4">Servizi di terze parti</h2>
            <p className="text-sm text-muted-foreground">
              Utilizziamo Google Analytics per analizzare il traffico del sito. Questi cookie sono attivati solo se 
              fornite esplicitamente il vostro consenso tramite il banner che appare al primo accesso.
            </p>
          </section>
        </div>
      </div>
    </div>
  );
}
