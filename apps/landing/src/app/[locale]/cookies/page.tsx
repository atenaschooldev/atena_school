import { getTranslations, unstable_setRequestLocale } from "next-intl/server";

const siteUrl = process.env.NEXT_PUBLIC_SITE_URL || 'https://atenaschool.it';

export async function generateStaticParams() {
  return [{ locale: 'it' }, { locale: 'en' }];
}

export async function generateMetadata({ params: { locale } }: { params: { locale: string } }) {
  const isIt = locale === 'it';
  const title = isIt ? 'Cookie Policy' : 'Cookie Policy';
  const description = isIt
    ? 'Informativa sull\'utilizzo dei cookie su Atena School. Scopri quali cookie utilizziamo e come gestirli.'
    : 'Cookie usage information for Atena School. Learn which cookies we use and how to manage them.';
  const url = `${siteUrl}/${locale}/cookies`;

  return {
    title,
    description,
    robots: { index: true, follow: true },
    alternates: {
      canonical: url,
      languages: {
        'it': `${siteUrl}/it/cookies`,
        'en': `${siteUrl}/en/cookies`,
        'x-default': `${siteUrl}/it/cookies`,
      },
    },
    openGraph: {
      type: 'website',
      locale: isIt ? 'it_IT' : 'en_US',
      url,
      siteName: 'Atena School',
      title,
      description,
    },
  };
}

export default async function CookiePolicy({ params: { locale } }: { params: { locale: string } }) {
  unstable_setRequestLocale(locale);
  const t = await getTranslations("cookies");
  
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
              {t("description")}
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
