import { createClient } from "@/lib/supabase/server";
import { notFound } from "next/navigation";
import BookingPageClient from "./BookingPageClient";

interface PageProps {
  params: Promise<{ type: string; id: string }>;
}

export default async function BookingPage({ params }: PageProps) {
  const { type, id } = await params;
  const supabase = createClient();
  
  const table = type === "course" ? "courses" : "shop_items";
  
  // Fetch item details on the server for instant page load
  const { data: item } = await supabase
    .from(table)
    .select("*")
    .eq("id", id)
    .single();

  if (!item) {
    notFound();
  }

  // Fetch current user on the server
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
