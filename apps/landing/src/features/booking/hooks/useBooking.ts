import { useState, useEffect } from "react";
import { useSearchParams } from "next/navigation";
import { useRouter } from "@/i18n/routing";
import { format } from "date-fns";
import { formatCourseDurationText, buildCheckoutUrl } from "@atena/utils";

export function useBooking(
  typeOrId: string,
  idOrItem: any,
  itemOrUser?: any,
  userOrUndefined?: any
) {
  const router = useRouter();
  const searchParams = useSearchParams();

  const isLegacy = typeof idOrItem === "string";
  const id = isLegacy ? idOrItem : typeOrId;
  const initialItem = isLegacy ? itemOrUser : idOrItem;
  const initialUser = isLegacy ? userOrUndefined : itemOrUser;

  const dateParam = searchParams.get("date");
  const timeParam = searchParams.get("time");

  const [item] = useState<any>(initialItem);
  const [user] = useState<any>(initialUser);

  const isFlexibleSchedule = item?.schedule_type === "flexible" || (!item?.schedule_days || item.schedule_days.length === 0);
  const isFixedSchedule = !isFlexibleSchedule;

  const allowedDays: number[] = (item?.schedule_days && Array.isArray(item.schedule_days) && item.schedule_days.length > 0)
    ? item.schedule_days
    : [1, 2, 3, 4, 5];

  const formattedTimeRange = (item?.start_time && item?.end_time)
    ? `${item.start_time}-${item.end_time}`
    : item?.start_time || "";

  const [selectedDate, setSelectedDate] = useState<Date | undefined>(
    dateParam && dateParam !== "da_concordare" ? new Date(dateParam) : undefined
  );
  const [selectedTime, setSelectedTime] = useState<string | null>(timeParam || null);

  useEffect(() => {
    if (user && dateParam && timeParam) {
      router.push(`/checkout/${id}?date=${dateParam}&time=${timeParam}`);
    }
  }, [user, id, dateParam, timeParam, router]);

  useEffect(() => {
    if (isFixedSchedule && selectedDate && !selectedTime) {
      setSelectedTime(formattedTimeRange);
    }
  }, [isFixedSchedule, selectedDate, selectedTime, formattedTimeRange]);

  const title = item?.title_it || item?.name || "Lezione / Corso Atena";
  const courseDuration = formatCourseDurationText(item?.lesson_duration_minutes, item?.total_hours, item?.total_lessons);

  const handleContinue = () => {
    if (isFlexibleSchedule) {
      router.push(`/checkout/${id}`);
      return;
    }
    if (!selectedDate || !selectedTime) return;
    const dateStr = format(selectedDate, "yyyy-MM-dd");
    const targetUrl = buildCheckoutUrl(id, dateStr, selectedTime);
    router.push(targetUrl as any);
  };

  return {
    item,
    user,
    isFixedSchedule,
    isFlexibleSchedule,
    allowedDays,
    selectedDate,
    setSelectedDate,
    selectedTime,
    setSelectedTime,
    title,
    courseDuration,
    handleContinue
  };
}
