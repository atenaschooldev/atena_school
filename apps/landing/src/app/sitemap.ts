import { MetadataRoute } from 'next';
import { createClient } from '@/lib/supabase/server';
import { env } from '@/config/env';

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const baseUrl = env.NEXT_PUBLIC_SITE_URL;
  const supabase = createClient();

  const entries: MetadataRoute.Sitemap = [
    { url: `${baseUrl}`, lastModified: new Date(), changeFrequency: 'weekly', priority: 1 },
    { url: `${baseUrl}/corsi`, lastModified: new Date(), changeFrequency: 'weekly', priority: 0.8 },
  ];

  // Dynamic course pages
  const { data: courses } = await supabase
    .from('courses')
    .select('id, slug')
    .in('status', ['active', 'published']);

  if (courses) {
    (courses as any[]).forEach(course => {
      entries.push({
        url: `${baseUrl}/corsi/${course.slug || course.id}`,
        lastModified: new Date(),
        changeFrequency: 'weekly',
        priority: 0.8,
      });
    });
  }

  return entries;
}
