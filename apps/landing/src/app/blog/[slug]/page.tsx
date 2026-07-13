import { getBlogPosts, getSingleBlogPost } from "@/lib/data";
import Link from "next/link";
import { ChevronLeft, Calendar, Share2 } from "lucide-react";
import { notFound } from "next/navigation";

export async function generateStaticParams() {
  const posts = await getBlogPosts();
  return (posts || []).map((post: any) => ({ slug: post.slug }));
}

export async function generateMetadata({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  const siteUrl = process.env.NEXT_PUBLIC_SITE_URL || 'https://atenaschool.it';
  const post = await getSingleBlogPost(slug);

  const title = post?.title_it || 'Articolo';
  const description = post?.excerpt_it || 'Leggi questo articolo sul blog di Atena School.';
  const image = post?.main_image || `${siteUrl}/og-default.jpg`;
  const url = `${siteUrl}/blog/${slug}`;

  return {
    title,
    description,
    alternates: {
      canonical: url,
    },
    openGraph: {
      type: 'article',
      locale: 'it_IT',
      url,
      siteName: 'Atena School',
      title,
      description,
      images: [{ url: image, width: 1200, height: 630, alt: title }],
    },
    twitter: { card: 'summary_large_image', title, description, images: [image] },
  };
}

export default async function PostPage({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  const post = await getSingleBlogPost(slug);

  if (!post) {
    notFound();
  }

  const title = post.title_it || post.title;
  const content = post.content_it || post.content;
  const publishedAt = post.published_at ? new Date(post.published_at).toLocaleDateString('it', {
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
            Torna al Blog
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
            {post.excerpt_it || post.excerpt}
          </div>
          
          <div className="h-px w-full bg-border mb-12" />
          
          <div className="text-lg md:text-xl leading-relaxed text-foreground/90 whitespace-pre-wrap mb-16">
            {content}
          </div>
        </div>

        {/* Footer actions */}
        <footer className="border-t border-border pt-12 flex flex-col items-center gap-8">
          <p className="text-muted-foreground font-medium">
            Ti è piaciuto l'articolo?
          </p>
          <div className="flex gap-4">
            <button className="flex items-center gap-2 px-6 py-3 bg-foreground text-background rounded-full font-bold hover:bg-primary transition-colors">
              <Share2 className="w-4 h-4" />
              Condividi
            </button>
          </div>
        </footer>
      </article>
    </main>
  );
}
