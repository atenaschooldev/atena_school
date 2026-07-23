import { redirect } from "next/navigation";

interface PageProps {
  params: Promise<{ type: string; id: string }>;
}

export default async function BookingPage({ params }: PageProps) {
  const { id } = await params;
  redirect(`/courses/${id}`);
}
