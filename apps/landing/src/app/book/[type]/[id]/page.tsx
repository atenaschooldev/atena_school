import { createClient } from "@/lib/supabase/server";
import { notFound } from "next/navigation";
import BookingPageClient from "./BookingPageClient";
import { fetchCheckoutItemAction } from "@/app/actions/booking";

interface PageProps {
  params: Promise<{ type: string; id: string }>;
}

export default async function BookingPage({ params }: PageProps) {
  const { type, id } = await params;
  
  // Fetch enriched item details (including teacher_name from DB)
  const itemRes = await fetchCheckoutItemAction(type, id);
  const item = itemRes?.item;

  if (!item) {
    notFound();
  }

  const supabase = createClient();
  const { data: { user } } = await supabase.auth.getUser();

  return (
    <BookingPageClient
      type={type}
      id={id}
      initialItem={item}
      initialUser={user}
    />
  );
}
