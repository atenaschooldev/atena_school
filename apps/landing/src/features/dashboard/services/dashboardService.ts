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
  supabase: SupabaseClient
): Promise<void> {
  if (!email || !userId) return;

  await supabase
    .from("bookings")
    .update({ user_id: userId })
    .ilike("student_email", email)
    .is("user_id", null);

  const { data: latestBooking } = await supabase
    .from("bookings")
    .select("student_phone, student_name")
    .ilike("student_email", email)
    .order("created_at", { ascending: false })
    .limit(1)
    .maybeSingle();

  if (latestBooking?.student_phone || latestBooking?.student_name) {
    const rawName = (latestBooking.student_name || "").trim();
    const parts = rawName.split(" ");
    const firstName = parts[0] || "";
    const lastName = parts.slice(1).join(" ") || "";

    try {
      await supabase.auth.updateUser({
        data: {
          phone: latestBooking.student_phone || undefined,
          ...(rawName ? { custom_full_name: rawName } : {})
        }
      });
    } catch {
      // ignore
    }

    try {
      const updateData: Record<string, any> = {
        updated_at: new Date().toISOString()
      };
      if (latestBooking.student_phone) updateData.phone = latestBooking.student_phone;
      if (firstName) updateData.first_name = firstName;
      if (lastName) updateData.last_name = lastName;
      if (rawName) updateData.full_name = rawName;

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

  if (user.email) {
    await autoLinkGuestBookings(user.email, user.id, supabase);
  }

  // Fetch raw bookings
  const { data } = await supabase
    .from("bookings")
    .select("*")
    .or(`user_id.eq.${user.id},student_email.ilike.${user.email}`)
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
  if (courseIds.length > 0) {
    const { data } = await supabase
      .from("courses")
      .select("id, name, price, teachers(teacher_id, full_name)")
      .in("id", courseIds);
    coursesData = data || [];
  }

  const coursesMap = new Map(coursesData.map((c) => [c.id, c]));

  const enrichedList: EnrichedBooking[] = userBookings.map((b) => {
    let title = "Lezione / Corso";
    let price = 0;
    let teacherName = "Atena School";
    const location = "Atena School, Via Matteotti 11";
    const cid = b.course_id || b.item_id;
    const bdate = b.start_date || b.booking_date || "";
    const pstatus = b.payment_status || b.status || "pending";
    const bstatus = b.booking_status || "active";

    const c = coursesMap.get(cid);
    if (c) {
      title = c.name || title;
      price = parseFloat(String(c.price).replace(/[^0-9.,]/g, "").replace(",", ".") || "0");
      if (c.teachers?.full_name) teacherName = c.teachers.full_name;
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
