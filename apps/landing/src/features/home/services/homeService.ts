import { getHeroData, getAboutData, getTestimonials, getContactData } from "@/lib/data";

export interface HeroData {
  title: string;
  tagline: string;
  imageUrl: string | null;
}

export interface AboutData {
  content: string;
  imageUrl: string | null;
}

export interface Testimonial {
  id: string;
  quote: string;
  author: string;
  role: string;
  avatarUrl: string | null;
}

export interface ContactData {
  address: string;
  phone: string;
  landline: string;
  email: string;
  vat: string;
  whatsapp: string;
}

export interface HomePageData {
  hero: HeroData;
  about: AboutData;
  testimonials: Testimonial[];
  contact: ContactData;
}

export async function getHomePageData(): Promise<HomePageData> {
  const [rawHero, rawAbout, rawTestimonials, rawContact] = await Promise.all([
    getHeroData(),
    getAboutData(),
    getTestimonials(),
    getContactData(),
  ]);

  const hero: HeroData = {
    title: rawHero?.title_it || "",
    tagline: rawHero?.subtitle_it || "",
    imageUrl: (rawHero as any)?.image_url || null,
  };

  const about: AboutData = {
    content: rawAbout?.content_it || rawAbout?.content_en || "",
    imageUrl: rawAbout?.image_url || null,
  };

  const testimonials: Testimonial[] = (rawTestimonials || []).map((t: any) => ({
    id: t.id || String(Math.random()),
    quote: t.quote_it || t.content_it || t.quote_en || t.content_en || "",
    author: t.author_name || t.author || "Anonimo",
    role: t.role_it || t.role_en || "",
    avatarUrl: t.avatar_url || null,
  }));

  const contact: ContactData = {
    address: rawContact?.address || "",
    phone: rawContact?.phone || "",
    landline: rawContact?.landline || "",
    email: rawContact?.email || "",
    vat: rawContact?.vat || "",
    whatsapp: rawContact?.whatsapp || "",
  };

  return { hero, about, testimonials, contact };
}
