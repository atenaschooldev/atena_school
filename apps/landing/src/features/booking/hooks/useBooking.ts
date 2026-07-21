import { useState, useEffect } from "react";
import { useSearchParams } from "next/navigation";
import { useRouter } from "@/i18n/routing";
import { format } from "date-fns";
import { fetchScheduleSlotsAction } from "@/app/actions/booking";

interface ScheduleSlot {
  id: string;
  starts_at: string;
  ends_at: string;
}

export function useBooking(type: string, id: string, initialItem: any, initialUser: any) {
  const router = useRouter();
  const searchParams = useSearchParams();

  const dateParam = searchParams.get("date");
  const timeParam = searchParams.get("time");
  const slotIdParam = searchParams.get("slot_id");

  const [item] = useState<any>(initialItem);
  const [user] = useState<any>(initialUser);

  const isFixedSchedule = type === "course" && 
    item.category === "languages" && 
    item.standard_schedule && 
    !item.standard_schedule.toLowerCase().includes("flessibile") &&
    !item.standard_schedule.toLowerCase().includes("concordare");

  const getScheduledDaysOfWeek = (schedule?: string): number[] => {
    if (!schedule) return [1, 2, 3, 4, 5];
    const lower = schedule.toLowerCase();
    if (lower.includes("flessibile")) return [1, 2, 3, 4, 5];
    const days: number[] = [];
    if (lower.includes("luned")) days.push(1);
    if (lower.includes("marted")) days.push(2);
    if (lower.includes("mercoled")) days.push(3);
    if (lower.includes("gioved")) days.push(4);
    if (lower.includes("venerd")) days.push(5);
    if (lower.includes("sabat")) days.push(6);
    if (lower.includes("domenic")) days.push(0);
    return days.length === 0 ? [1, 2, 3, 4, 5] : days;
  };

  const allowedDays = getScheduledDaysOfWeek(item.standard_schedule);

  const [selectedDate, setSelectedDate] = useState<Date | undefined>(
    dateParam ? new Date(dateParam) : undefined
  );
  const [selectedTime, setSelectedTime] = useState<string | null>(timeParam || null);
  const [selectedSlotId, setSelectedSlotId] = useState<string | null>(slotIdParam || null);
  const [availableSlots, setAvailableSlots] = useState<ScheduleSlot[]>([]);

  useEffect(() => {
    if (user && dateParam && timeParam && slotIdParam) {
      router.push(`/checkout/${type}/${id}?date=${dateParam}&time=${timeParam}&slot_id=${slotIdParam}`);
    }
  }, [user, type, id, dateParam, timeParam, slotIdParam, router]);

  useEffect(() => {
    if (!selectedDate || isFixedSchedule) {
      setAvailableSlots([]);
      return;
    }

    async function fetchSlots() {
      try {
        const dateStr = format(selectedDate!, "yyyy-MM-dd");
        const res = await fetchScheduleSlotsAction(dateStr);
        if (res.success) {
          setAvailableSlots(res.slots || []);
        }
      } catch (err) {
        console.error("Error fetching slots:", err);
      }
    }

    fetchSlots();
  }, [selectedDate, isFixedSchedule]);

  useEffect(() => {
    if (isFixedSchedule && selectedDate && !selectedTime) {
      setSelectedTime(item.standard_schedule);
    }
  }, [isFixedSchedule, selectedDate, selectedTime, item.standard_schedule]);

  const title = item.title_it || item.name || "Lezione / Corso Atena";
  const courseDuration = item.duration_it || item.duration || (item.hours ? `${item.hours} ore` : item.duration_minutes ? `${item.duration_minutes} min` : "60 minuti");

  const handleContinue = () => {
    if (!selectedDate || !selectedTime || (!isFixedSchedule && !selectedSlotId)) return;
    const dateStr = format(selectedDate, "yyyy-MM-dd");
    const slotParam = selectedSlotId ? `&slot_id=${selectedSlotId}` : "";
    router.push(`/checkout/${type}/${id}?date=${dateStr}&time=${selectedTime}${slotParam}`);
  };

  return {
    item,
    user,
    isFixedSchedule,
    allowedDays,
    selectedDate,
    setSelectedDate,
    selectedTime,
    setSelectedTime,
    selectedSlotId,
    setSelectedSlotId,
    availableSlots,
    title,
    courseDuration,
    handleContinue
  };
}
