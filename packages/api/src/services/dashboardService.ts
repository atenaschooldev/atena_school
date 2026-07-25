import { SupabaseClient } from "@supabase/supabase-js";
import { isFuture, parseISO } from "date-fns";

export interface EnrichedBooking {
  id: string;
  course_id: string;
  item_id: string;
  item_type: string;
  item_title: string;
  price: number;
  teacher_name: string;
  location: string;
  booking_date: string;
  start_date: string;
  booking_time: string;
  status: string;
  payment_status: string;
  booking_status: string;
  slot_starts_at?: string;
  is_future: boolean;
}

export async function autoLinkGuestBookings(
  email: string,
  userId: string,
  supabase: any
): Promise<void> {
  if (!email || !userId) return;

  const cleanEmail = email.trim().toLowerCase();

  // Link unlinked guest bookings where email matches
  await supabase
    .from("bookings")
    .update({ user_id: userId })
    .or(`student_email.ilike.${cleanEmail},purchaser_email.ilike.${cleanEmail}`)
    .is("user_id", null);

  // Link student card (parent_id or student_user_id) in public.students
  try {
    // 1. If student email matches, link student_user_id
    await supabase
      .from("students")
      .update({ student_user_id: userId })
      .ilike("email", cleanEmail);

    // 2. If purchaser email matches, link parent_id for associated student cards
    const { data: purchaserBookings } = await supabase
      .from("bookings")
      .select("student_id, student_email")
      .ilike("purchaser_email", cleanEmail);

    if (purchaserBookings && purchaserBookings.length > 0) {
      const studentIds = purchaserBookings.map((b: any) => b.student_id).filter(Boolean);
      if (studentIds.length > 0) {
        await supabase
          .from("students")
          .update({ parent_id: userId })
          .in("id", studentIds);
      }
    }
  } catch {
    // ignore
  }

  const { data: latestBooking } = await supabase
    .from("bookings")
    .select("student_phone, student_name, student_email, purchaser_name, purchaser_email, purchaser_phone")
    .or(`student_email.ilike.${cleanEmail},purchaser_email.ilike.${cleanEmail}`)
    .order("created_at", { ascending: false })
    .limit(1)
    .maybeSingle();

  if (latestBooking) {
    const isPurchaser = latestBooking.purchaser_email?.toLowerCase() === cleanEmail;
    const rawName = isPurchaser
      ? (latestBooking.purchaser_name || latestBooking.student_name || "").trim()
      : (latestBooking.student_name || "").trim();

    const phone = isPurchaser
      ? (latestBooking.purchaser_phone || latestBooking.student_phone || "")
      : (latestBooking.student_phone || "");

    const parts = rawName.split(" ");
    const firstName = parts[0] || "";
    const lastName = parts.slice(1).join(" ") || "";

    const updateData: Record<string, any> = {
      updated_at: new Date().toISOString()
    };
    if (phone) updateData.phone = phone;
    if (firstName) updateData.first_name = firstName;
    if (lastName) updateData.last_name = lastName;
    if (rawName) updateData.full_name = rawName;
    if (isPurchaser) updateData.role = "parent";

    try {
      await supabase
        .from("users")
        .update(updateData)
        .eq("id", userId);
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

  const cleanEmail = user.email ? user.email.trim().toLowerCase() : "";

  if (cleanEmail) {
    await autoLinkGuestBookings(cleanEmail, user.id, supabase);
  }

  // Fetch raw bookings via user authenticated client (enforced strictly by Postgres RLS)
  const { data } = await supabase
    .from("bookings")
    .select("*")
    .or(`user_id.eq.${user.id},student_email.ilike.${cleanEmail},purchaser_email.ilike.${cleanEmail}`)
    .in("payment_status", ["paid", "completed", "reserved", "pending_payment", "pending"])
    .order("created_at", { ascending: false });

  const rawBookings: any[] = data || [];

  // Deduplicate by course_id (favoring 'paid'/'completed' over pending/reserved)
  const deduplicatedMap = new Map<string, any>();
  for (const b of rawBookings) {
    const cid = b.course_id || b.item_id;
    const bdate = b.start_date || b.booking_date;
    const pstatus = b.payment_status || b.status;
    const key = `course_${cid}_${bdate}`;
    const existing = deduplicatedMap.get(key);
    if (!existing) {
      deduplicatedMap.set(key, b);
    } else if (
      (pstatus === "paid" || pstatus === "completed") &&
      existing.payment_status !== "paid" &&
      existing.payment_status !== "completed"
    ) {
      deduplicatedMap.set(key, b);
    }
  }
  const userBookings = Array.from(deduplicatedMap.values());

  const courseIds = Array.from(
    new Set(userBookings.map((b) => b.course_id || b.item_id))
  ).filter(Boolean) as string[];

  let coursesData: any[] = [];
  let teachersMap = new Map<string, string>();

  if (courseIds.length > 0) {
    const { data } = await supabase
      .from("courses")
      .select("id, name, price, teacher_id")
      .in("id", courseIds);
    coursesData = data || [];

    const teacherIds = Array.from(new Set(coursesData.map((c) => c.teacher_id).filter(Boolean)));
    if (teacherIds.length > 0) {
      const { data: tData } = await supabase
        .from("teachers")
        .select("teacher_id, full_name")
        .in("teacher_id", teacherIds);
      if (tData) {
        teachersMap = new Map(tData.map((t) => [t.teacher_id, t.full_name]));
      }
    }
  }

  const coursesMap = new Map(coursesData.map((c) => [c.id, c]));

  const enrichedList: EnrichedBooking[] = userBookings.map((b) => {
    let title = "Lezione / Corso";
    let price = b.amount_paid ? parseFloat(String(b.amount_paid)) : 0;
    let teacherName = "Atena School";
    const location = "Atena School, Via Matteotti 11";
    const cid = b.course_id || b.item_id;
    const bdate = b.start_date || b.booking_date || "";
    const pstatus = b.payment_status || b.status || "pending";
    const bstatus = b.booking_status || "active";

    const c = coursesMap.get(cid);
    if (c) {
      title = c.name || title;
      const coursePrice = parseFloat(String(c.price || 0).replace(/[^0-9.,]/g, "").replace(",", ".") || "0");
      if (coursePrice > 0) price = coursePrice;
      if (c.teacher_id && teachersMap.has(c.teacher_id)) {
        teacherName = teachersMap.get(c.teacher_id)!;
      }
    }

    let isUpcoming = true;
    if (bdate) {
      try {
        isUpcoming = isFuture(parseISO(bdate));
      } catch {
        isUpcoming = true;
      }
    }

    return {
      id: b.id,
      course_id: cid,
      item_id: cid,
      item_type: "course",
      item_title: title,
      price,
      teacher_name: teacherName,
      location,
      booking_date: bdate,
      start_date: bdate,
      booking_time: b.booking_time || "",
      status: pstatus,
      payment_status: pstatus,
      booking_status: bstatus,
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
