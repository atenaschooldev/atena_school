import { notFound } from "next/navigation";
import CourseDetailClient from "./CourseDetailClient";
import { getItem } from "@/lib/server/checkout-service";
import { createClient } from "@/lib/supabase/server";
import CourseSchema from "@/features/courses/components/CourseSchema";
import BreadcrumbSchema from "@/components/seo/BreadcrumbSchema";
import { env } from "@/config/env";

interface PageProps {
  params: Promise<{ id: string }>;
}

export async function generateMetadata({ params }: PageProps) {
  const { id } = await params;
  const res = await getItem(id);

  if (!res.success || !res.item) {
    return {
      title: "Corso non trovato | Atena School",
    };
  }

  const course = res.item;
  const siteUrl = env.NEXT_PUBLIC_SITE_URL;
  const courseSlug = course.slug || id;
  const title = `${course.title_it || course.name} | Atena School`;
  const description = course.description || `Scopri il corso di ${course.title_it || course.name} presso Atena School a Cittanova.`;
  const imageUrl = course.photo_url || `${siteUrl}/icon.png`;

  return {
    title,
    description,
    alternates: {
      canonical: `${siteUrl}/corsi/${courseSlug}`,
    },
    openGraph: {
      type: "website",
      locale: "it_IT",
      url: `${siteUrl}/corsi/${courseSlug}`,
      siteName: "Atena School",
      title,
      description,
      images: [
        {
          url: imageUrl,
          width: 1200,
          height: 630,
          alt: course.title_it || course.name,
        },
      ],
    },
    twitter: {
      card: "summary_large_image",
      title,
      description,
      images: [imageUrl],
    },
  };
}

export default async function CourseDetailPage({ params }: PageProps) {
  const { id } = await params;
  
  const res = await getItem(id);

  if (!res.success || !res.item) {
    notFound();
  }

  const course = res.item;

  const supabase = createClient();
  const { data: { user } } = await supabase.auth.getUser();

  const title = course.title_it || course.name || "Corso Atena School";
  const description = course.description || "";
  const price = course.price ? `${Number(course.price).toFixed(2)}€` : undefined;

  return (
    <>
      <BreadcrumbSchema
        items={[
          { name: "Home", url: "/" },
          { name: "Corsi", url: "/corsi" },
          { name: title, url: `/corsi/${course.slug || id}` },
        ]}
      />
      <CourseSchema
        name={title}
        description={description}
        image={course.photo_url || undefined}
        price={price}
      />
      <CourseDetailClient
        id={id}
        initialCourse={course}
        initialUser={user}
      />
    </>
  );
}
