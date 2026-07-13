import { getBlogPosts, getSingleBlogPost } from "@/lib/data";
import { unstable_setRequestLocale } from "next-intl/server";
import { Link } from "@/i18n/routing";
import { ChevronLeft, Calendar, Share2 } from "lucide-react";
import { notFound } from "next/navigation";

export async function generateStaticParams() {
  const posts = await getBlogPosts();
  
  const locales = ['it', 'en'];
  const params: any[] = [];

  locales.forEach((locale) => {
    posts?.forEach((post: any) => {
      params.push({ slug: post.slug, locale });
    });
  });

  return params;
}

export async function generateMetadata({ params: { locale, slug } }: { params: { locale: string; slug: string } }) {
  const siteUrl = process.env.NEXT_PUBLIC_SITE_URL || 'https://atenaschool.it';
  const post = await getSingleBlogPost(slug);

  const isIt = locale === 'it';
  const title = post?.[`title_${locale}` as 'title_it' | 'title_en'] || (isIt ? 'Articolo' : 'Article');
  const description = post?.[`excerpt_${locale}` as 'excerpt_it' | 'excerpt_en'] || (isIt ? 'Leggi questo articolo sul blog di Atena School.' : 'Read this article on the Atena School blog.');
  const image = post?.main_image || `${siteUrl}/og-default.jpg`;
  const url = `${siteUrl}/${locale}/blog/${slug}`;

  return {
    title,
    description,
    alternates: {
      canonical: url,
      languages: {
        'it': `${siteUrl}/it/blog/${slug}`,
        'en': `${siteUrl}/en/blog/${slug}`,
        'x-default': `${siteUrl}/it/blog/${slug}`,
      },
    },
    openGraph: {
      type: 'article',
      locale: isIt ? 'it_IT' : 'en_US',
      url,
      siteName: 'Atena School',
      title,
      description,
      images: [{ url: image, width: 1200, height: 630, alt: title }],
    },
    twitter: { card: 'summary_large_image', title, description, images: [image] },
  };
}

export default async function PostPage({ params: { locale, slug } }: { params: { locale: string; slug: string } }) {
  unstable_setRequestLocale(locale);
  const post = await getSingleBlogPost(slug);

  if (!post) {
    notFound();
  }

  const title = post[`title_${locale}`] || post.title;
  const content = post[`content_${locale}`] || post.content;
  const publishedAt = post.published_at ? new Date(post.published_at).toLocaleDateString(locale, {
    day: 'numeric',
    month: 'long',
    year: 'numeric'
  }) : "";

  return (
    <main className="min-h-screen bg-background pt-24 pb-20">
      <article className="max-w-4xl mx-auto px-4">
        {/* Navigation */}
        <div className="mb-12">
          <Link 
            href="/blog" 
            className="inline-flex items-center gap-2 text-sm font-bold uppercase tracking-widest text-muted-foreground hover:text-primary transition-colors group"
          >
            <ChevronLeft className="w-4 h-4 transition-transform group-hover:-translate-x-1" />
            {locale === "it" ? "Torna al Blog" : "Back to Blog"}
          </Link>
        </div>

        {/* Header */}
        <header className="mb-12">
          <div className="flex items-center gap-4 text-xs font-bold uppercase tracking-widest text-primary mb-6">
            <div className="flex items-center gap-1.5">
              <Calendar className="w-3.5 h-3.5" />
              {publishedAt}
            </div>
            <div className="w-1 h-1 rounded-full bg-primary/30" />
            <div className="flex items-center gap-1.5 opacity-60">
              #AtenaBlog
            </div>
          </div>
          
          <h1 className="text-4xl md:text-6xl font-black uppercase tracking-tight text-foreground leading-[1.1] mb-8">
            {title}
          </h1>
        </header>

        {/* Featured Image */}
        {post.main_image && (
          <div className="relative aspect-[21/9] rounded-3xl overflow-hidden mb-16 shadow-2xl">
            <img
              src={post.main_image}
              alt={title}
              className="object-cover w-full h-full"
            />
          </div>
        )}

        {/* Content Area */}
        <div className="prose prose-lg dark:prose-invert max-w-none">
          <div className="text-xl md:text-2xl leading-relaxed text-muted-foreground font-light mb-12 whitespace-pre-wrap">
            {post[`excerpt_${locale}`] || post.excerpt}
          </div>
          
          <div className="h-px w-full bg-border mb-12" />
          
          <div className="text-lg md:text-xl leading-relaxed text-foreground/90 whitespace-pre-wrap mb-16">
            {content}
          </div>
        </div>

        {/* Footer actions */}
        <footer className="border-t border-border pt-12 flex flex-col items-center gap-8">
          <p className="text-muted-foreground font-medium">
            {locale === "it" ? "Ti è piaciuto l'articolo?" : "Did you like the article?"}
          </p>
          <div className="flex gap-4">
            <button className="flex items-center gap-2 px-6 py-3 bg-foreground text-background rounded-full font-bold hover:bg-primary transition-colors">
              <Share2 className="w-4 h-4" />
              {locale === "it" ? "Condividi" : "Share"}
            </button>
          </div>
        </footer>
      </article>
    </main>
  );
}
