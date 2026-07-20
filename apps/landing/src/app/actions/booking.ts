"use server";

import { createClient } from "@supabase/supabase-js";

export async function getBookingDetailsServer(bookingId: string) {
  if (!bookingId) return null;

  try {
    const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
    const serviceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

    if (!supabaseUrl || !serviceRoleKey) {
      console.error("Missing Supabase URL or Service Role Key in environment variables.");
      return null;
    }

    // Bypass RLS on server-side safely
    const supabaseAdmin = createClient(supabaseUrl, serviceRoleKey);

    const { data: booking, error: bookingError } = await supabaseAdmin
      .from("bookings")
      .select("*")
      .eq("id", bookingId)
      .maybeSingle();

    if (bookingError || !booking) {
      console.error("Error fetching booking details by admin client:", bookingError);
      return null;
    }

    // Fetch the linked course/shop item info
    let itemData: any = null;
    if (booking.item_type === "course") {
      const { data } = await supabaseAdmin
        .from("courses")
        .select("name, price, photo_url, teacher_name")
        .eq("id", booking.item_id)
        .maybeSingle();
      itemData = data;
    } else if (booking.item_type === "shop") {
      const { data } = await supabaseAdmin
        .from("shop_items")
        .select("title_it, price, photo_url")
        .eq("id", booking.item_id)
        .maybeSingle();
      itemData = data ? { name: data.title_it, price: data.price, photo_url: data.photo_url } : null;
    }

    return {
      ...booking,
      item_name: itemData?.name || null,
      item_price: itemData?.price || null,
      item_photo: itemData?.photo_url || null,
      item_teacher: itemData?.teacher_name || null,
    };
  } catch (err) {
    console.error("Failed to run getBookingDetailsServer server action:", err);
    return null;
  }
}
