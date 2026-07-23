import { createClient } from "@/lib/supabase/server";
import { notFound } from "next/navigation";
import CourseDetailClient from "./CourseDetailClient";
import { fetchCourseAction } from "@/app/actions/booking";
import CourseSchema from "@/features/courses/components/CourseSchema";
import { env } from "@/config/env";

interface PageProps {
  params: Promise<{ id: string }>;
}

export async function generateMetadata({ params }: PageProps) {
  const { id } = await params;
  const res = await fetchCourseAction(id);
  const course = res?.course;

  if (!course) {
    return {
      title: "Corso non trovato | Atena School",
    };
  }

  const siteUrl = env.NEXT_PUBLIC_SITE_URL;
  const title = `${course.title_it || course.name} | Atena School`;
  const description = course.description_it || course.description || `Scopri il corso di ${course.title_it || course.name} presso Atena School a Cittanova.`;
  const imageUrl = course.photo_url || `${siteUrl}/icon.png`;

  return {
    title,
    description,
    alternates: {
      canonical: `${siteUrl}/courses/${id}`,
    },
    openGraph: {
      type: "website",
      locale: "it_IT",
      url: `${siteUrl}/courses/${id}`,
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
  
  const res = await fetchCourseAction(id);
  const course = res?.course;

  if (!course) {
    notFound();
  }

  const supabase = createClient();
  const { data: { user } } = await supabase.auth.getUser();

  const title = course.title_it || course.name;
  const description = course.description_it || course.description || "";
  const price = course.price ? `${Number(course.price).toFixed(2)}€` : undefined;

  return (
    <>
      <CourseSchema
        name={title}
        description={description}
        image={course.photo_url}
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
