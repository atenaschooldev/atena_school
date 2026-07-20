import { getBlogPosts, getSingleBlogPost } from "@/lib/data";

export interface BlogPostSummary {
  slug: string;
  title: string;
  excerpt: string;
  mainImage: string | null;
  publishedAt: string;
}

export interface BlogPostFull {
  slug: string;
  title: string;
  content: string;
  excerpt: string;
  mainImage: string | null;
  publishedAt: string;
  metaTitle: string;
  metaDescription: string;
  metaImage: string;
}

export async function getBlogPostList(): Promise<BlogPostSummary[]> {
  const posts = await getBlogPosts();
  return (posts || []).map((post: any) => ({
    slug: post.slug,
    title: post.title_it || post.title || "",
    excerpt: post.excerpt_it || post.excerpt || "",
    mainImage: post.main_image || null,
    publishedAt: post.published_at
      ? new Date(post.published_at).toLocaleDateString("it")
      : "",
  }));
}

export async function getBlogPostDetail(slug: string): Promise<BlogPostFull | null> {
  const post = await getSingleBlogPost(slug);
  if (!post) return null;

  return {
    slug: post.slug,
    title: post.title_it || post.title || "",
    content: post.content_it || post.content || "",
    excerpt: post.excerpt_it || post.excerpt || "",
    mainImage: post.main_image || null,
    publishedAt: post.published_at
      ? new Date(post.published_at).toLocaleDateString("it", {
          day: "numeric",
          month: "long",
          year: "numeric",
        })
      : "",
    metaTitle: post.title_it || post.title || "Articolo",
    metaDescription: post.excerpt_it || post.excerpt || "Leggi questo articolo sul blog di Atena School.",
    metaImage: post.main_image || "",
  };
}

export async function getBlogStaticParams(): Promise<{ slug: string }[]> {
  const posts = await getBlogPosts();
  return (posts || []).map((post: any) => ({ slug: post.slug }));
}
