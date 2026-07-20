import { SupabaseClient } from "@supabase/supabase-js";
import { toast } from "sonner";

export async function fetchBookingDetails(
  bookingId: string,
  supabase: SupabaseClient
): Promise<any | null> {
  const { data: booking } = await supabase
    .from("bookings")
    .select("*")
    .eq("id", bookingId)
    .maybeSingle();

  if (!booking) return null;

  // Enrich with item data
  let itemData: any = null;
  if (booking.item_type === "course") {
    const { data } = await supabase
      .from("courses")
      .select("name, price, photo_url, teacher_name")
      .eq("id", booking.item_id)
      .maybeSingle();
    itemData = data;
  } else if (booking.item_type === "shop") {
    const { data } = await supabase
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
}

export async function dispatchMagicLink(
  emailToSend: string,
  supabase: SupabaseClient
): Promise<boolean> {
  if (!emailToSend) {
    toast.error("Email non trovata per l'invio del link");
    return false;
  }

  try {
    const { error } = await supabase.auth.signInWithOtp({
      email: emailToSend,
      options: {
        emailRedirectTo: `${window.location.origin}/auth/callback?next=/dashboard`,
      },
    });

    if (error) {
      if (error.message.includes("rate") || error.status === 429) {
        toast.error("Limite invii email raggiunto. Riprova tra qualche minuto o usa la password.");
      } else {
        toast.error(error.message);
      }
      return false;
    }

    toast.success(`Magic Link inviato a ${emailToSend}! Controlla la tua posta.`);
    return true;
  } catch (err: any) {
    toast.error(err.message || "Errore durante l'invio della email");
    return false;
  }
}
