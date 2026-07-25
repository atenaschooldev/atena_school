export const CACHE_TAGS = {
  HERO: 'hero',
  ABOUT: 'about',
  TESTIMONIALS: 'testimonials',
  CONTACT: 'contact',
  TEACHERS: 'teachers',
  COURSES: 'courses',
  BLOG: 'blog',
  SHOP_ITEMS: 'shop_items',
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
  blog_posts: 'blog_posts',
  reviews: 'testimonials', // Compatibility for existing code
  shop_items: 'shop_items',
} as const;
