export const CACHE_TAGS = {
  HERO: 'hero',
  ABOUT: 'about',
  TESTIMONIALS: 'testimonials',
  CONTACT: 'contact',
  TEACHERS: 'teachers',
  COURSES: 'courses',
} as const;

export type CacheTag = typeof CACHE_TAGS[keyof typeof CACHE_TAGS];

export const CACHE_TTL = 3600;

export const TABLE_MAP = {
  hero: 'hero',
  about: 'about',
  testimonials: 'testimonials',
  site_contact: 'site_contact',
  profiles: 'profiles',
  courses: 'courses',
  reviews: 'testimonials',
} as const;

