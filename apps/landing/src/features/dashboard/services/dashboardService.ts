import { SupabaseClient } from "@supabase/supabase-js";
import { isFuture, parseISO } from "date-fns";

export interface EnrichedBooking {
  id: string;
  item_id: string;
  item_type: string;
  item_title: string;
  price: number;
  teacher_name: string;
  location: string;
  booking_date: string;
  booking_time: string;
  status: string;
  slot_starts_at?: string;
  is_future: boolean;
}

export async function autoLinkGuestBookings(
  email: string,
  userId: string,
  supabase: SupabaseClient
): Promise<void> {
  if (!email || !userId) return;

  // Link any bookings matching this email to the user_id if they aren't linked yet.
  // The status is never modified here (must only be set to paid via Stripe Webhook/Edge Function).
  await supabase
    .from("bookings")
    .update({ user_id: userId })
    .ilike("student_email", email)
    .is("user_id", null);

  // Sync phone & name from guest booking to user metadata
  const { data: latestBooking } = await supabase
    .from("bookings")
    .select("student_phone, student_name")
    .ilike("student_email", email)
    .not("student_phone", "is", null)
    .order("created_at", { ascending: false })
    .limit(1)
    .maybeSingle();

  if (latestBooking?.student_phone) {
    try {
      await supabase.auth.updateUser({
        data: {
          phone: latestBooking.student_phone,
          ...(latestBooking.student_name ? { custom_full_name: latestBooking.student_name } : {})
        }
      });
    } catch {
      // ignore
    }
  }
}

export async function fetchUserBookingsEnriched(
  user: any,
  supabase: SupabaseClient
): Promise<EnrichedBooking[]> {
  if (!user) return [];

  // Auto link first
  if (user.email) {
    await autoLinkGuestBookings(user.email, user.id, supabase);
  }

  // Fetch raw bookings
  const { data } = await supabase
    .from("bookings")
    .select("*")
    .or(`user_id.eq.${user.id},student_email.ilike.${user.email}`)
    .in("status", ["paid", "completed", "reserved", "pending_payment"])
    .order("created_at", { ascending: false });

  const rawBookings: any[] = data || [];

  // Deduplicate by item_type + item_id (favoring 'paid'/'completed' over pending/reserved)
  const deduplicatedMap = new Map<string, any>();
  for (const b of rawBookings) {
    const key = `${b.item_type}_${b.item_id}_${b.slot_id || b.booking_date}`;
    const existing = deduplicatedMap.get(key);
    if (!existing) {
      deduplicatedMap.set(key, b);
    } else if (
      (b.status === "paid" || b.status === "completed") &&
      existing.status !== "paid" &&
      existing.status !== "completed"
    ) {
      deduplicatedMap.set(key, b);
    }
  }
  const userBookings = Array.from(deduplicatedMap.values());

  const courseIds = Array.from(
    new Set(userBookings.filter((b) => b.item_type === "course").map((b) => b.item_id))
  ) as string[];
  const shopItemIds = Array.from(
    new Set(userBookings.filter((b) => b.item_type === "shop").map((b) => b.item_id))
  ) as string[];
  const slotIds = Array.from(
    new Set(userBookings.filter((b) => b.slot_id).map((b) => b.slot_id))
  ) as string[];

  const promises: Promise<any>[] = [];

  if (courseIds.length > 0) {
    promises.push(
      supabase
        .from("courses")
        .select("id, name, price, teacher_name")
        .in("id", courseIds)
    );
  } else {
    promises.push(Promise.resolve({ data: [] }));
  }

  if (shopItemIds.length > 0) {
    promises.push(
      supabase.from("shop_items").select("id, title_it, price").in("id", shopItemIds)
    );
  } else {
    promises.push(Promise.resolve({ data: [] }));
  }

  if (slotIds.length > 0) {
    promises.push(
      supabase
        .from("schedule_slots")
        .select("id, starts_at, ends_at")
        .in("id", slotIds)
    );
  } else {
    promises.push(Promise.resolve({ data: [] }));
  }

  const [cRes, sRes, slRes] = await Promise.all(promises);
  const coursesData: any[] = cRes.data || [];
  const shopItemsData: any[] = sRes.data || [];
  const slotsData: any[] = slRes.data || [];

  const coursesMap = new Map(coursesData.map((c) => [c.id, c]));
  const shopMap = new Map(shopItemsData.map((s) => [s.id, s]));
  const slotsMap = new Map(slotsData.map((sl) => [sl.id, sl]));

  const enrichedList: EnrichedBooking[] = userBookings.map((b) => {
    let title = "Lezione / Corso";
    let price = 0;
    let teacherName = "Atena School";
    const location = "Atena School, Via Matteotti 11";

    if (b.item_type === "course") {
      const c = coursesMap.get(b.item_id);
      if (c) {
        title = c.name || title;
        price = parseFloat(String(c.price).replace(/[^0-9.,]/g, "").replace(",", ".") || "0");
        if (c.teacher_name) teacherName = c.teacher_name;
      }
    } else {
      const s = shopMap.get(b.item_id);
      if (s) {
        title = s.title_it || title;
        price = parseFloat(String(s.price).replace(/[^0-9.,]/g, "").replace(",", ".") || "0");
      }
    }

    // Get slot start time (schedule_slots has only id, starts_at, ends_at)
    let slotStartsAt: string | undefined = undefined;
    if (b.slot_id) {
      const sl = slotsMap.get(b.slot_id);
      if (sl) {
        slotStartsAt = sl.starts_at;
      }
    }

    let isUpcoming = true;
    if (slotStartsAt) {
      isUpcoming = isFuture(parseISO(slotStartsAt));
    } else if (b.booking_date) {
      try {
        isUpcoming = isFuture(parseISO(b.booking_date));
      } catch {
        isUpcoming = true;
      }
    }

    return {
      id: b.id,
      item_id: b.item_id,
      item_type: b.item_type,
      item_title: title,
      price,
      teacher_name: teacherName,
      location,
      booking_date: b.booking_date,
      booking_time: b.booking_time,
      status: b.status,
      slot_starts_at: slotStartsAt,
      is_future: isUpcoming,
    };
  });

  return enrichedList;
}

export async function updateUserProfile(
  user: any,
  params: { profileName: string; profilePhone: string },
  supabase: SupabaseClient
): Promise<void> {
  if (!user) return;
  await supabase.auth.updateUser({
    data: {
      full_name: params.profileName,
      phone: params.profilePhone,
    },
  });
}
