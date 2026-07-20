import { SupabaseClient } from "@supabase/supabase-js";

export interface CheckoutFormValues {
  firstName: string;
  lastName: string;
  email: string;
  phone: string;
  notes?: string;
}

export interface BookingItem {
  id: string;
  name?: string;
  title_it?: string;
  price: string | number;
  duration?: string;
  description_it?: string;
  image_url?: string;
}

export async function fetchCheckoutItem(
  type: string,
  id: string,
  supabase: SupabaseClient
): Promise<BookingItem | null> {
  const table = type === "course" ? "courses" : "shop_items";
  let { data: itemData } = await supabase
    .from(table)
    .select("*")
    .eq("id", id)
    .maybeSingle();

  if (!itemData && table === "courses") {
    const { data: itemBySlug } = await supabase
      .from("courses")
      .select("*")
      .ilike("name", `%${id}%`)
      .maybeSingle();
    itemData = itemBySlug;
  }

  return itemData || null;
}

import { createOrUpdateReservationServerAction } from "@/app/actions/booking";

export async function createOrUpdateReservation(
  params: {
    type: string;
    id: string;
    dateParam: string;
    timeParam: string;
    slotIdParam?: string | null;
    values: CheckoutFormValues;
    user?: any;
    sessionId?: string | null;
    origin?: string;
  },
  supabase?: any
): Promise<{ booking: any }> {
  const res = await createOrUpdateReservationServerAction({
    type: params.type,
    id: params.id,
    dateParam: params.dateParam,
    timeParam: params.timeParam,
    slotIdParam: params.slotIdParam,
    values: params.values,
    sessionId: params.sessionId,
    origin: params.origin
  });

  if (!res.success || !res.booking) {
    throw new Error(res.error || "Errore durante la prenotazione");
  }

  return { booking: res.booking };
}

export async function initiateStripePayment(
  params: {
    type: string;
    id: string;
    dateParam: string;
    timeParam: string;
    slotIdParam?: string | null;
    values: CheckoutFormValues;
  },
  supabase: SupabaseClient
): Promise<{ url: string }> {
  const { type, id, dateParam, timeParam, slotIdParam, values } = params;

  const { data: { session } } = await supabase.auth.getSession();
  const authHeader = session?.access_token
    ? `Bearer ${session.access_token}`
    : `Bearer ${process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY}`;

  const res = await fetch(
    `${process.env.NEXT_PUBLIC_SUPABASE_URL}/functions/v1/create-checkout-session`,
    {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: authHeader,
      },
      body: JSON.stringify({
        itemId: id,
        itemType: type,
        customerEmail: values.email,
        firstName: values.firstName,
        lastName: values.lastName,
        phone: values.phone,
        date: dateParam,
        time: timeParam,
        slotId: slotIdParam || null,
        locale: "it",
      }),
    }
  );

  const data = await res.json();
  if (!res.ok) throw new Error(data.error || "Errore durante il pagamento");

  return { url: data.url };
}
