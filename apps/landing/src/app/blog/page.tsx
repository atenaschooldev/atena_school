import { getTranslations } from "next-intl/server";
import Link from "next/link";
import { getBlogPostList } from "@/features/blog/services/blogService";
import { env } from "@/config/env";

export async function generateMetadata() {
  const siteUrl = env.NEXT_PUBLIC_SITE_URL;
  const title = 'Blog';
  const description = 'Articoli, consigli e aggiornamenti dal team di Atena School.';
  const url = `${siteUrl}/blog`;

  return {
    title,
    description,
    alternates: {
      canonical: url,
    },
    openGraph: {
      type: 'website',
      locale: 'it_IT',
      url,
      siteName: 'Atena School',
      title,
      description,
      images: [{ url: `${siteUrl}/og-default.webp`, width: 1200, height: 630, alt: 'Atena School Blog' }],
    },
    twitter: { card: 'summary_large_image', title, description },
  };
}

export default async function BlogPage() {
  const t = await getTranslations("nav");
  const blogPosts = await getBlogPostList();

  return (
    <main className="min-h-screen flex flex-col bg-background pt-24 relative overflow-hidden">
      <div className="flex-grow max-w-7xl mx-auto px-4 w-full pb-28">
        <header className="mb-16" data-gsap="fade-in">
          <h1 className="text-4xl md:text-6xl font-black uppercase tracking-tight text-foreground mb-4">
            {t("blog")}
          </h1>
          <div className="h-2 w-24 bg-primary" />
        </header>

        {blogPosts.length > 0 ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-12">
            {blogPosts.map((post, idx) => (
              <Link
                key={post.slug}
                href={`/blog/${post.slug}`}
                className="group cursor-pointer flex flex-col"
                data-gsap="fade-up"
                data-gsap-delay={(idx % 3) * 100}
              >
                <article>
                  <div className="relative aspect-video overflow-hidden mb-6 bg-muted rounded-2xl">
                    {post.mainImage && (
                      <img
                        src={post.mainImage}
                        alt={post.title}
                        className="object-cover w-full h-full transition-transform duration-500 group-hover:scale-105"
                      />
                    )}
                  </div>
                  <div className="space-y-4">
                    <div className="text-xs font-bold uppercase tracking-widest text-primary">
                      {post.publishedAt}
                    </div>
                    <h2 className="text-2xl font-bold leading-tight group-hover:text-primary transition-colors">
                      {post.title}
                    </h2>
                    <p className="text-muted-foreground line-clamp-3">
                      {post.excerpt}
                    </p>
                  </div>
                </article>
              </Link>
            ))}
          </div>
        ) : (
          <div className="py-24">
            <p className="text-muted-foreground text-xl font-light italic opacity-50">
              In arrivo presto...
            </p>
          </div>
        )}
      </div>
    </main>
  );
}
