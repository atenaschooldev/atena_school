import { getTranslations } from "next-intl/server";
import Link from "next/link";
import { getBlogPosts } from "@/lib/data";
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
      images: [{ url: `${siteUrl}/og-default.jpg`, width: 1200, height: 630, alt: 'Atena School Blog' }],
    },
    twitter: { card: 'summary_large_image', title, description },
  };
}

export default async function BlogPage() {
  const t = await getTranslations("nav");
  const blogPosts = await getBlogPosts();

  return (
    <main className="min-h-screen flex flex-col bg-background pt-24 relative overflow-hidden">
      <div className="flex-grow max-w-7xl mx-auto px-4 w-full pb-28">
        <header className="mb-16">
          <h1 className="text-4xl md:text-6xl font-black uppercase tracking-tight text-foreground mb-4">
            {t("blog")}
          </h1>
          <div className="h-2 w-24 bg-primary" />
        </header>

        {blogPosts.length > 0 ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-12">
            {blogPosts.map((post: any) => (
              <Link 
                key={post.slug} 
                href={`/blog/${post.slug}`}
                className="group cursor-pointer flex flex-col"
              >
                <article>
                  <div className="relative aspect-video overflow-hidden mb-6 bg-muted rounded-2xl">
                    {post.main_image && (
                      <img
                        src={post.main_image}
                        alt={post.title_it || post.title}
                        className="object-cover w-full h-full transition-transform duration-500 group-hover:scale-105"
                      />
                    )}
                  </div>
                  <div className="space-y-4">
                    <div className="text-xs font-bold uppercase tracking-widest text-primary">
                      {post.published_at ? new Date(post.published_at).toLocaleDateString('it') : ""}
                    </div>
                    <h2 className="text-2xl font-bold leading-tight group-hover:text-primary transition-colors">
                      {post.title_it || post.title}
                    </h2>
                    <p className="text-muted-foreground line-clamp-3">
                      {post.excerpt_it || post.excerpt}
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
