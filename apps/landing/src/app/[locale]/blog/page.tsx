import { getTranslations, unstable_setRequestLocale } from "next-intl/server";
import { Link } from "@/i18n/routing";
import { getBlogPosts } from "@/lib/data";

export async function generateStaticParams() {
  return [{ locale: "it" }, { locale: "en" }];
}

export async function generateMetadata({ params }: { params: Promise<{ locale: string }> }) {
  const { locale } = await params;
  const siteUrl = process.env.NEXT_PUBLIC_SITE_URL || 'https://atenaschool.it';
  const isIt = locale === 'it';
  const title = isIt ? 'Blog' : 'Blog';
  const description = isIt
    ? 'Articoli, consigli e aggiornamenti dal team di Atena School.'
    : 'Articles, tips and updates from the Atena School team.';
  const url = `${siteUrl}/${locale}/blog`;

  return {
    title,
    description,
    alternates: {
      canonical: url,
      languages: {
        'it': `${siteUrl}/it/blog`,
        'en': `${siteUrl}/en/blog`,
        'x-default': `${siteUrl}/it/blog`,
      },
    },
    openGraph: {
      type: 'website',
      locale: isIt ? 'it_IT' : 'en_US',
      url,
      siteName: 'Atena School',
      title,
      description,
      images: [{ url: `${siteUrl}/og-default.jpg`, width: 1200, height: 630, alt: 'Atena School Blog' }],
    },
    twitter: { card: 'summary_large_image', title, description },
  };
}

export default async function BlogPage({ params }: { params: Promise<{ locale: string }> }) {
  const { locale } = await params;
  unstable_setRequestLocale(locale);
  const t = await getTranslations("nav");

  const blogPosts = await getBlogPosts();

  return (
    <main className="min-h-screen flex flex-col bg-background pt-24">
      <div className="flex-grow max-w-7xl mx-auto px-4 w-full pb-20">
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
                        alt={post[`title_${locale}`] || post.title}
                        className="object-cover w-full h-full transition-transform duration-500 group-hover:scale-105"
                      />
                    )}
                  </div>
                  <div className="space-y-4">
                    <div className="text-xs font-bold uppercase tracking-widest text-primary">
                      {post.published_at ? new Date(post.published_at).toLocaleDateString(locale) : ""}
                    </div>
                    <h2 className="text-2xl font-bold leading-tight group-hover:text-primary transition-colors">
                      {post[`title_${locale}`] || post.title}
                    </h2>
                    <p className="text-muted-foreground line-clamp-3">
                      {post[`excerpt_${locale}`] || post.excerpt}
                    </p>
                  </div>
                </article>
              </Link>
            ))}
          </div>
        ) : (
          <div className="py-24">
            <p className="text-muted-foreground text-xl font-light italic opacity-50">
              {locale === "it" ? "In arrivo presto..." : "Coming soon..."}
            </p>
          </div>
        )}
      </div>
    </main>
  );
}
