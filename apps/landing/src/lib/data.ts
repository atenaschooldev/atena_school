import { unstable_cache } from 'next/cache';
import { createClient } from './supabase/server';
import { CACHE_TAGS, CACHE_TTL } from './constants';
import { slugify } from './utils';
import type { SupabaseCourseRow } from './server/checkout-service';
import type { CourseItem } from '@atena/api-types';
import { getSchoolProfile } from '@atena/core';

interface HeroRow {
  title_it?: string | null;
  title_en?: string | null;
  subtitle_it?: string | null;
  subtitle_en?: string | null;
  image_url?: string | null;
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
  author?: string | null;
  role_it?: string | null;
  role_en?: string | null;
  content_it?: string | null;
  content_en?: string | null;
  quote_it?: string | null;
  quote_en?: string | null;
  avatar_url?: string | null;
  rating?: number | null;
  is_active?: boolean;
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
      image_url: data?.image_url || null,
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
    const school = await getSchoolProfile(supabase);
    const rawAddress = school.address || '';
    const city = school.city || '';
    const province = school.province || '';
    const cap = school.cap || '';

    const formattedAddress = rawAddress.toLowerCase().includes(city.toLowerCase())
      ? rawAddress
      : [rawAddress, [city, province ? `(${province})` : ''].filter(Boolean).join(' '), cap].filter(Boolean).join(', ');

    return {
      address: formattedAddress,
      phone: school.phone || '',
      landline: school.landline || '',
      email: school.secretariat_email || school.email || '',
      vat: school.vat_code || '',
      whatsapp: school.whatsapp || '',
      maps_url: school.maps_url || '',
      id: 1,
    };
  },
  ['contact-data'],
  { tags: [CACHE_TAGS.CONTACT], revalidate: CACHE_TTL }
);

export const getTeachers = unstable_cache(
  async () => {
    const supabase = createClient();
    const { data } = await supabase.from('teachers').select('*').order('full_name');
    return (data || []).map((t) => ({
      ...t,
      full_name: t.full_name || '',
      bio_it: t.experience || '',
      bio_en: t.experience || '',
      avatar_url: t.photo_url || '',
    }));
  },
  ['teachers-data'],
  { tags: [CACHE_TAGS.TEACHERS], revalidate: CACHE_TTL }
);

import { getPublicCourses, getCourse } from './server/checkout-service';

export const getCourses = unstable_cache(
  async () => {
    const res = await getPublicCourses();
    if (!res.success || !res.courses || res.courses.length === 0) {
      throw new Error('No courses returned from Supabase database');
    }
    return res.courses.map((c: SupabaseCourseRow) => ({
      ...c,
      slug: (c.slug as string) || slugify(c.name || ''),
      title_it: c.name || '',
      title_en: c.name || '',
      description_it: c.description || '',
      description_en: c.description || '',
      price: Number(c.price) || 0,
      price_eur: Number(c.price) || 0,
    }));
  },
  ['courses-data'],
  { tags: [CACHE_TAGS.COURSES], revalidate: CACHE_TTL }
);

export const getSingleCourse = (id: string) => unstable_cache(
  async () => {
    const res = await getCourse(id);
    if (!res.success || !res.item) {
      throw new Error(`Course with id ${id} not found`);
    }
    const c = res.item;
    return {
      ...c,
      slug: c.slug || slugify(c.name || ''),
      title_it: c.name || '',
      title_en: c.name || '',
      description_it: c.description || '',
      description_en: c.description || '',
      price: Number(c.price) || 0,
      price_eur: Number(c.price) || 0,
    };
  },
  [`course-${id}`],
  { tags: [CACHE_TAGS.COURSES, `course-${id}`], revalidate: CACHE_TTL }
)();



