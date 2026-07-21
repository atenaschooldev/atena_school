import { unstable_cache } from 'next/cache';
import { createClient } from './supabase/server';
import { Database } from '@/types/database.types';
import { CACHE_TAGS, CACHE_TTL } from './constants';

type Tables = Database['public']['Tables'];

/**
 * CLEANUP MAPPERS
 * Converts database rows with nulls into clean objects for the frontend
 */

export const getHeroData = unstable_cache(
  async () => {
    const supabase = createClient();
    const { data } = await (supabase.from('hero').select('*').single() as any);
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
    const { data } = await (supabase.from('about').select('*').single() as any);
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
    const { data } = await (supabase.from('testimonials').select('*').eq('is_active', true) as any);
    return (data || []).map((t: any) => ({
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
    const { data } = await (supabase.from('site_contact').select('*').single() as any);
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
    const { data } = await (supabase.from('profiles').select('*').eq('role', 'teacher').order('full_name') as any);
    return (data || []).map((t: any) => ({
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
  const supabase = createClient();
  const { data } = await (supabase.from('courses').select('*').in('status', ['active', 'published']) as any);
  return (data || []).map((c: any) => ({
    ...c,
    title_it: c.name || '',
    title_en: c.name || '',
    description_it: c.description || '',
    description_en: c.description || '',
    price: Number(c.price) || 0,
    price_eur: Number(c.price) || 0,
  }));
}

export const getBlogPosts = unstable_cache(
  async () => {
    const supabase = createClient();
    const { data } = await (supabase.from('blog_posts').select('*').eq('is_active', true).order('created_at', { ascending: false }) as any);
    return (data || []).map((p: any) => ({
      ...p,
      title_it: p.title_it || '',
      title_en: p.title_en || '',
      excerpt_it: p.excerpt_it || '',
      excerpt_en: p.excerpt_en || '',
      image_placeholder: p.image_placeholder || '',
    }));
  },
  ['blog-posts-data'],
  { tags: [CACHE_TAGS.BLOG], revalidate: CACHE_TTL }
);

export async function getSingleCourse(id: string) {
  const supabase = createClient();
  const { data } = await (supabase.from('courses').select('*').eq('id', id).single() as any);
  return data ? {
    ...data,
    title_it: data.name || '',
    title_en: data.name || '',
    description_it: data.description || '',
    description_en: data.description || '',
    price: Number(data.price) || 0,
    price_eur: Number(data.price) || 0,
  } : null;
}

export const getSingleBlogPost = (slug: string) => unstable_cache(
  async () => {
    const supabase = createClient();
    const { data } = await (supabase.from('blog_posts').select('*').eq('slug', slug).single() as any);
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

export async function getShopItems() {
  const supabase = createClient();
  const { data } = await (supabase.from('shop_items').select('*').eq('is_active', true) as any);
  return (data || []).map((item: any) => ({
    ...item,
    title_it: item.title_it || '',
    title_en: item.title_en || '',
    duration_it: item.duration_it || '',
    duration_en: item.duration_en || '',
    price: Number(item.price) || 0,
    price_eur: Number(item.price) || 0,
  }));
}
