import ShopClient from "./ShopClient";

export async function generateMetadata() {
  const siteUrl = process.env.NEXT_PUBLIC_SITE_URL || 'https://atenaschool.it';
  const title = 'Shop & Prezzi';
  const description = 'Scegli il pacchetto di lezioni più adatto a te. Corsi individuali, di gruppo e pacchetti flessibili con Atena School.';
  const url = `${siteUrl}/shop`;

  return {
    title,
    description,
    alternates: {
      canonical: url,
    },
    openGraph: {
      type: 'website',
      locale: 'it_IT',
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
