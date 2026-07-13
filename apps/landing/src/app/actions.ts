'use server';

import { revalidateTag } from 'next/cache';
import { createClient } from '@/lib/supabase/server';
import { env } from '@/config/env';
import { ADMIN_SCHEMAS } from '@/lib/schemas';
import { Database } from '@/types/database.types';
import { CACHE_TAGS, CACHE_TTL } from '@/lib/constants';

/**
 * Validates if the current user is an admin based on email or role.
 */
async function isAdmin() {
  const supabase = createClient();
  const { data: { user } } = await supabase.auth.getUser();
  
  if (!user || !user.email) return false;
  return env.ADMIN_EMAILS.includes(user.email);
}

/**
 * Saves a record (Create or Update) via Server Action.
 */
export async function saveAdminRecord(
  type: keyof typeof ADMIN_SCHEMAS,
  id: string | "new",
  formData: any
) {
  if (!(await isAdmin())) {
    return { success: false, error: 'Unauthorized' };
  }

  // 1. Validate with Zod
  const schema = ADMIN_SCHEMAS[type];
  if (!schema) return { success: false, error: 'Invalid type' };

  const parsed = schema.safeParse(formData);
  if (!parsed.success) {
    return { success: false, error: 'Validation failed', details: parsed.error.flatten().fieldErrors };
  }

  const supabase = createClient();
  const tableMap: Record<keyof typeof ADMIN_SCHEMAS, string> = {
    course: 'courses',
    blog: 'blog_posts',
    shop_item: 'shop_items',
    review: 'course_reviews',
    teacher: 'profiles',
  };
  const tagMap: Record<keyof typeof ADMIN_SCHEMAS, string> = {
    course: CACHE_TAGS.COURSES,
    blog: CACHE_TAGS.BLOG,
    shop_item: CACHE_TAGS.COURSES, 
    review: CACHE_TAGS.TESTIMONIALS,
    teacher: CACHE_TAGS.TEACHERS,
  };

  const table = tableMap[type];
  if (!table) return { success: false, error: 'Table not found' };

  try {
    if (id === "new") {
      const { error } = await (supabase.from(table as any) as any).insert([parsed.data as any]);
      if (error) throw error;
    } else {
      const { error } = await (supabase.from(table as any) as any).update(parsed.data as any).eq('id', id);
      if (error) throw error;
    }

    // 2. Revalidate cache
    revalidateTag(tagMap[type]);

    return { success: true };
  } catch (error: any) {
    console.error(`Error saving ${type}:`, error);
    return { success: false, error: error.message };
  }
}

/**
 * Revalidates a specific cache tag.
 */
export async function revalidateCache(tag: string) {
  try {
    revalidateTag(tag);
    return { success: true };
  } catch (error) {
    console.error(`Failed to revalidate tag: ${tag}`, error);
    return { success: false, error };
  }
}
