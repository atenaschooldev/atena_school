import { MetadataRoute } from 'next';
import { createClient } from '@/lib/supabase/server';

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const baseUrl = process.env.NEXT_PUBLIC_SITE_URL || 'http://localhost:3000';
  const supabase = createClient();
  const locales = ['it', 'en'];

  // Static routes
  const staticRoutes = ['', '/courses', '/shop', '/blog'];
  
  const entries: MetadataRoute.Sitemap = [];

  // Add static routes for each locale
  locales.forEach(locale => {
    staticRoutes.forEach(route => {
      entries.push({
        url: `${baseUrl}/${locale}${route}`,
        lastModified: new Date(),
        changeFrequency: 'weekly',
        priority: route === '' ? 1 : 0.8,
      });
    });
  });



  // Fetch dynamic blog posts
  const { data: posts } = await supabase
    .from('blog_posts')
    .select('slug, published_at')
    .eq('is_active', true);

  if (posts) {
    locales.forEach(locale => {
      (posts as any[]).forEach(post => {
        entries.push({
          url: `${baseUrl}/${locale}/blog/${post.slug}`,
          lastModified: new Date(post.published_at || new Date()),
          changeFrequency: 'monthly',
          priority: 0.6,
        });
      });
    });
  }

  return entries;
}
