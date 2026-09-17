import { MetadataRoute } from 'next';
import { unstable_cache } from 'next/cache';
import { createClient } from '@/lib/supabase/server';
import { env } from '@/config/env';
import { CACHE_TAGS, CACHE_TTL } from '@/lib/constants';
import { CourseStatus } from '@atena/api-types';

interface CourseSitemapRow {
  id: string;
  slug: string | null;
}

const getSitemapCourses = unstable_cache(
  async () => {
    const supabase = createClient();
    const { data: courses } = await supabase
      .from('courses')
      .select('id, slug')
      .eq('status', CourseStatus.ACTIVE)
      .returns<CourseSitemapRow[]>();
    return courses || [];
  },
  ['sitemap-courses-list'],
  { tags: [CACHE_TAGS.COURSES, 'sitemap'], revalidate: CACHE_TTL }
);

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const baseUrl = env.NEXT_PUBLIC_SITE_URL.replace(/\/$/, '');

  const entries: MetadataRoute.Sitemap = [
    { url: `${baseUrl}`, lastModified: new Date(), changeFrequency: 'weekly', priority: 1 },
    { url: `${baseUrl}/corsi`, lastModified: new Date(), changeFrequency: 'weekly', priority: 0.9 },
    { url: `${baseUrl}/test-inglese`, lastModified: new Date(), changeFrequency: 'monthly', priority: 0.7 },
  ];

  // Dynamic course pages cached
  const courses = await getSitemapCourses();

  courses.forEach((course) => {
    entries.push({
      url: `${baseUrl}/corsi/${course.slug || course.id}`,
      lastModified: new Date(),
      changeFrequency: 'weekly',
      priority: 0.8,
    });
  });

  return entries;
}

