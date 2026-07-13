import ShopClient from "./ShopClient";

export async function generateStaticParams() {
  return [{ locale: "it" }, { locale: "en" }];
}

export async function generateMetadata({ params }: { params: Promise<{ locale: string }> }) {
  const { locale } = await params;
  const siteUrl = process.env.NEXT_PUBLIC_SITE_URL || 'https://atenaschool.it';
  const isIt = locale === 'it';
  const title = isIt ? 'Shop & Prezzi' : 'Shop & Pricing';
  const description = isIt
    ? 'Scegli il pacchetto di lezioni più adatto a te. Corsi individuali, di gruppo e pacchetti flessibili con Atena School.'
    : 'Choose the lesson package that suits you best. Individual, group courses and flexible packages with Atena School.';
  const url = `${siteUrl}/${locale}/shop`;

  return {
    title,
    description,
    alternates: {
      canonical: url,
      languages: {
        'it': `${siteUrl}/it/shop`,
        'en': `${siteUrl}/en/shop`,
        'x-default': `${siteUrl}/it/shop`,
      },
    },
    openGraph: {
      type: 'website',
      locale: isIt ? 'it_IT' : 'en_US',
      url,
      siteName: 'Atena School',
      title,
      description,
      images: [{ url: `${siteUrl}/og-default.jpg`, width: 1200, height: 630, alt: title }],
    },
    twitter: { card: 'summary_large_image', title, description },
  };
}

export default function ShopPage() {
  return <ShopClient />;
}
