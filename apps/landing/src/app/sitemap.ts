import { MetadataRoute } from 'next';
import { createClient } from '@/lib/supabase/server';
import { env } from '@/config/env';

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const baseUrl = env.NEXT_PUBLIC_SITE_URL;
  const supabase = createClient();

  // Static routes
  const staticRoutes = ['', '/courses', '/blog'];

  const entries: MetadataRoute.Sitemap = [];

  // Add static routes
  staticRoutes.forEach(route => {
    entries.push({
      url: `${baseUrl}${route}`,
      lastModified: new Date(),
      changeFrequency: 'weekly',
      priority: route === '' ? 1 : 0.8,
    });
  });

  // Fetch dynamic blog posts
  const { data: posts } = await supabase
    .from('blog_posts')
    .select('slug, published_at')
    .eq('is_active', true);

  if (posts) {
    (posts as any[]).forEach(post => {
      entries.push({
        url: `${baseUrl}/blog/${post.slug}`,
        lastModified: new Date(post.published_at || new Date()),
        changeFrequency: 'monthly',
        priority: 0.6,
      });
    });
  }

  return entries;
}
