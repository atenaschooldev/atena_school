import { useState, useEffect } from "react";
import { useSearchParams } from "next/navigation";
import { useRouter } from "@/i18n/routing";
import { format } from "date-fns";
import { formatCourseDurationText, buildCheckoutUrl } from "@atena/utils";
import { CourseScheduleType, type CourseItem } from "@atena/api-types";
import type { User } from "@supabase/supabase-js";

export function useBooking(
  typeOrId: string,
  idOrItem?: string | CourseItem | null,
  itemOrUser?: CourseItem | User | null,
  userOrUndefined?: User | null
) {
  const router = useRouter();
  const searchParams = useSearchParams();

  const isLegacy = typeof idOrItem === "string";
  const id = isLegacy ? (idOrItem as string) : typeOrId;
  const initialItem = (isLegacy ? itemOrUser : idOrItem) as CourseItem | null;
  const initialUser = (isLegacy ? userOrUndefined : itemOrUser) as User | null;

  const dateParam = searchParams.get("date");
  const timeParam = searchParams.get("time");

  const [item] = useState<CourseItem | null>(initialItem);
  const [user] = useState<User | null>(initialUser);

  const isFlexibleSchedule = Number(item?.schedule_type) === CourseScheduleType.FLEXIBLE || (!item?.schedule_days || item.schedule_days.length === 0);
  const isFixedSchedule = !isFlexibleSchedule;

  const rawDays = item?.schedule_days;
  const allowedDays: number[] = Array.isArray(rawDays) && rawDays.length > 0
    ? rawDays.map(Number).filter((n) => !isNaN(n))
    : [1, 2, 3, 4, 5];

  const formattedTimeRange = (item?.start_time && item?.end_time)
    ? `${item.start_time}-${item.end_time}`
    : item?.start_time || "";

  const isValidDateParam = Boolean(dateParam && !isNaN(Date.parse(dateParam)));
  const [selectedDate, setSelectedDate] = useState<Date | undefined>(
    isValidDateParam && dateParam ? new Date(dateParam) : undefined
  );
  const [selectedTime, setSelectedTime] = useState<string | null>(timeParam || null);

  const effectiveSelectedTime = selectedTime || (isFixedSchedule && selectedDate ? formattedTimeRange : null);

  useEffect(() => {
    if (user && dateParam && timeParam) {
      router.push(`/checkout/${id}?date=${dateParam}&time=${timeParam}`);
    }
  }, [user, id, dateParam, timeParam, router]);

  const title = item?.title_it || item?.name || "Lezione / Corso Atena";
  const courseDuration = formatCourseDurationText(item?.lesson_duration_minutes, item?.total_hours, item?.total_lessons);

  const handleContinue = () => {
    if (isFlexibleSchedule) {
      router.push(`/checkout/${id}`);
      return;
    }
    if (!selectedDate || !effectiveSelectedTime) return;
    const dateStr = format(selectedDate, "yyyy-MM-dd");
    const targetUrl = buildCheckoutUrl(id, dateStr, effectiveSelectedTime);
    router.push(targetUrl);
  };

  return {
    item,
    user,
    isFixedSchedule,
    isFlexibleSchedule,
    allowedDays,
    selectedDate,
    setSelectedDate,
    selectedTime: effectiveSelectedTime,
    setSelectedTime,
    title,
    courseDuration,
    handleContinue
  };
}
