import { unstable_cache } from 'next/cache';
import { createClient } from './supabase/server';
import { CACHE_TAGS, CACHE_TTL } from './constants';
import { slugify } from './utils';

interface HeroRow {
  title_it?: string | null;
  title_en?: string | null;
  subtitle_it?: string | null;
  subtitle_en?: string | null;
  updated_at?: string | null;
}

interface AboutRow {
  title_it?: string | null;
  title_en?: string | null;
  content_it?: string | null;
  content_en?: string | null;
  image_url?: string | null;
  updated_at?: string | null;
}

interface TestimonialRow {
  id: string;
  author_name?: string | null;
  content_it?: string | null;
  content_en?: string | null;
  rating?: number | null;
  is_active?: boolean;
  [key: string]: unknown;
}

interface ContactRow {
  id?: number | null;
  address?: string | null;
  phone?: string | null;
  landline?: string | null;
  email?: string | null;
  vat?: string | null;
  whatsapp?: string | null;
}

interface TeacherProfileRow {
  id: string;
  full_name?: string | null;
  bio_it?: string | null;
  bio_en?: string | null;
  avatar_url?: string | null;
  [key: string]: unknown;
}

interface CourseRow {
  id: string;
  slug?: string | null;
  name: string;
  category: string;
  price: number;
  status: string;
  photo_url?: string | null;
  description?: string | null;
  teacher_id?: string | null;
  teachers?: {
    teacher_id: string;
    full_name: string | null;
  } | null;
  [key: string]: unknown;
}

interface BlogPostRow {
  id: string;
  title_it?: string | null;
  title_en?: string | null;
  excerpt_it?: string | null;
  excerpt_en?: string | null;
  content_it?: string | null;
  content_en?: string | null;
  image_placeholder?: string | null;
  is_active?: boolean;
  slug?: string;
  [key: string]: unknown;
}

/**
 * CLEANUP MAPPERS
 * Converts database rows with nulls into clean objects for the frontend
 */

export const getHeroData = unstable_cache(
  async () => {
    const supabase = createClient();
    const { data } = await supabase.from('hero').select('*').single<HeroRow>();
    return {
      title_it: data?.title_it || '',
      title_en: data?.title_en || '',
      subtitle_it: data?.subtitle_it || '',
      subtitle_en: data?.subtitle_en || '',
      updated_at: data?.updated_at || new Date().toISOString(),
    };
  },
  ['hero-data'],
  { tags: [CACHE_TAGS.HERO], revalidate: CACHE_TTL }
);

export const getAboutData = unstable_cache(
  async () => {
    const supabase = createClient();
    const { data } = await supabase.from('about').select('*').single<AboutRow>();
    return {
      title_it: data?.title_it || '',
      title_en: data?.title_en || '',
      content_it: data?.content_it || '',
      content_en: data?.content_en || '',
      image_url: data?.image_url || '',
      updated_at: data?.updated_at || new Date().toISOString(),
    };
  },
  ['about-data'],
  { tags: [CACHE_TAGS.ABOUT], revalidate: CACHE_TTL }
);

export const getTestimonials = unstable_cache(
  async () => {
    const supabase = createClient();
    const { data } = await supabase.from('testimonials').select('*').eq('is_active', true).returns<TestimonialRow[]>();
    return (data || []).map((t) => ({
      ...t,
      content_it: t.content_it || '',
      content_en: t.content_en || '',
      author_name: t.author_name || 'Anonimo',
    }));
  },
  ['testimonials-data'],
  { tags: [CACHE_TAGS.TESTIMONIALS], revalidate: CACHE_TTL }
);

export const getContactData = unstable_cache(
  async () => {
    const supabase = createClient();
    const { data } = await supabase.from('site_contact').select('*').single<ContactRow>();
    return {
      address: data?.address || '',
      phone: data?.phone || '',
      landline: data?.landline || '',
      email: data?.email || '',
      vat: data?.vat || '',
      whatsapp: data?.whatsapp || '',
      id: data?.id || 1,
    };
  },
  ['contact-data'],
  { tags: [CACHE_TAGS.CONTACT], revalidate: CACHE_TTL }
);

export const getTeachers = unstable_cache(
  async () => {
    const supabase = createClient();
    const { data } = await supabase.from('profiles').select('*').eq('role', 'teacher').order('full_name').returns<TeacherProfileRow[]>();
    return (data || []).map((t) => ({
      ...t,
      full_name: t.full_name || '',
      bio_it: t.bio_it || '',
      bio_en: t.bio_en || '',
      avatar_url: t.avatar_url || '',
    }));
  },
  ['teachers-data'],
  { tags: [CACHE_TAGS.TEACHERS], revalidate: CACHE_TTL }
);

export async function getCourses() {
  const backendUrl = process.env.NEXT_PUBLIC_BACKEND_URL || process.env.BACKEND_URL || "http://localhost:4000";
  try {
    const res = await fetch(`${backendUrl}/api/v1/checkout/courses`, { cache: 'no-store' });
    if (res.ok) {
      const bData = await res.json();
      if (bData.success && bData.courses) {
        return bData.courses.map((c: any) => ({
          ...c,
          slug: (c.slug as string) || slugify(c.name || ''),
          title_it: c.name || '',
          title_en: c.name || '',
          description_it: c.description || '',
          description_en: c.description || '',
          price: Number(c.price) || 0,
          price_eur: Number(c.price) || 0,
        }));
      }
    }
  } catch (bErr) {
    console.error("Backend getCourses error:", bErr);
  }
  return [];
}

export const getBlogPosts = unstable_cache(
  async () => {
    return [];
  },
  ['blog-posts-data'],
  { tags: [CACHE_TAGS.BLOG], revalidate: CACHE_TTL }
);

export async function getSingleCourse(id: string) {
  const backendUrl = process.env.NEXT_PUBLIC_BACKEND_URL || process.env.BACKEND_URL || "http://localhost:4000";
  try {
    const res = await fetch(`${backendUrl}/api/v1/checkout/item/${id}`, { cache: 'no-store' });
    if (res.ok) {
      const bData = await res.json();
      const c = bData.item || bData.course;
      if (c) {
        return {
          ...c,
          slug: (c.slug as string) || slugify(c.name || ''),
          title_it: c.name || '',
          title_en: c.name || '',
          description_it: c.description || '',
          description_en: c.description || '',
          price: Number(c.price) || 0,
          price_eur: Number(c.price) || 0,
        };
      }
    }
  } catch (bErr) {
    console.error("Backend getSingleCourse error:", bErr);
  }
  return null;
}

export const getSingleBlogPost = (slug: string) => unstable_cache(
  async () => {
    const supabase = createClient();
    const { data } = await supabase.from('blog_posts').select('*').eq('slug', slug).single<BlogPostRow>();
    return data ? {
      ...data,
      title_it: data.title_it || '',
      title_en: data.title_en || '',
      content_it: data.content_it || '',
      content_en: data.content_en || '',
    } : null;
  },
  [`blog-post-${slug}`],
  { tags: [CACHE_TAGS.BLOG, `blog-${slug}`], revalidate: CACHE_TTL }
)();

