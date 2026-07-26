import { useEffect, useState } from "react";
import { format, isFuture, parseISO, startOfDay, isBefore } from "date-fns";
import { getBookingLessonsAction, scheduleNextLessonAction } from "@/app/actions/dashboard";
import { toast } from "sonner";

export interface Lesson {
  id: string;
  booking_id: string;
  starts_at: string;
  ends_at: string;
  status: string;
  created_at: string;
}

export const TIME_SLOTS = [
  "08:00", "08:30", "09:00", "09:30", "10:00", "10:30", "11:00", "11:30",
  "12:00", "12:30", "13:00", "13:30", "14:00", "14:30", "15:00", "15:30",
  "16:00", "16:30", "17:00", "17:30", "18:00", "18:30", "19:00", "19:30", "20:00"
];

export function useBookingDetail(bookingId: string) {
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [booking, setBooking] = useState<any>(null);
  const [course, setCourse] = useState<any>(null);
  const [lessons, setLessons] = useState<Lesson[]>([]);
  const [maxLessons, setMaxLessons] = useState<number | null>(null);
  const [refreshTrigger, setRefreshTrigger] = useState(0);

  const [activeTab, setActiveTab] = useState<"calendar" | "list">("calendar");
  const [currentMonth, setCurrentMonth] = useState(new Date());

  // Modal State
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [modalDate, setModalDate] = useState("");
  const [modalTime, setModalTime] = useState("10:00");
  const [scheduling, setScheduling] = useState(false);

  useEffect(() => {
    async function loadData() {
      try {
        const res = await getBookingLessonsAction(bookingId);
        if (res.success) {
          setBooking(res.booking);
          setCourse(res.course);
          setLessons(res.lessons || []);
          setMaxLessons(res.max_lessons ?? null);
        } else {
          setError(res.error || "Impossibile caricare i dati della prenotazione");
        }
      } catch (err: any) {
        setError(err.message || "Errore durante il caricamento");
      } finally {
        setLoading(false);
      }
    }
    loadData();
  }, [bookingId, refreshTrigger]);

  const courseTitle = course?.name || course?.title_it || "Corso di Lingua";
  const teacherName = course?.teacher_name || "Staff Atena";
  const rawCoursePrice = course?.price
    ? parseFloat(String(course.price).replace(/[^0-9.,]/g, "").replace(",", "."))
    : 0;
  const regFee = Number(booking?.registration_fee || 0);
  const totalAmount = Number(booking?.amount_paid || 0);
  const coursePrice = rawCoursePrice > 0 ? rawCoursePrice : Math.max(0, totalAmount - regFee);

  const isFixedSchedule = course?.schedule_type === "fixed";
  const effectiveMaxLessons = isFixedSchedule ? lessons.length : (maxLessons ?? Infinity);

  const completedLessons = lessons.filter(l => !isFuture(parseISO(l.starts_at))).length;
  const totalLessons = lessons.length;
  const progressPercent = isFinite(effectiveMaxLessons) && effectiveMaxLessons > 0
    ? Math.round((completedLessons / effectiveMaxLessons) * 100)
    : 0;
  const canScheduleMore = maxLessons === null || totalLessons < effectiveMaxLessons;

  // Calendar calculations
  const year = currentMonth.getFullYear();
  const month = currentMonth.getMonth();
  const firstDay = new Date(year, month, 1);
  const lastDay = new Date(year, month + 1, 0);

  const startDayOfWeek = firstDay.getDay();
  const blanks = startDayOfWeek === 0 ? 6 : startDayOfWeek - 1;
  const daysInMonth = lastDay.getDate();

  const days: { day: number | null; date: Date | null }[] = [];
  for (let i = 0; i < blanks; i++) {
    days.push({ day: null, date: null });
  }
  for (let d = 1; d <= daysInMonth; d++) {
    const date = new Date(year, month, d);
    days.push({ day: d, date });
  }

  const getLessonsForDate = (date: Date | null) => {
    if (!date) return [];
    return lessons.filter((l) => {
      const lDate = new Date(l.starts_at);
      return (
        lDate.getFullYear() === date.getFullYear() &&
        lDate.getMonth() === date.getMonth() &&
        lDate.getDate() === date.getDate()
      );
    });
  };

  const handlePrevMonth = () => {
    setCurrentMonth(new Date(year, month - 1, 1));
  };

  const handleNextMonth = () => {
    setCurrentMonth(new Date(year, month + 1, 1));
  };

  const handleOpenScheduleModal = (dateObj?: Date) => {
    // For hours-based courses (EIPASS) maxLessons is null — always allow scheduling
    if (maxLessons !== null && !canScheduleMore) {
      toast.error(`Hai già programmato tutte le lezioni disponibili per questo pacchetto (${maxLessons}/${maxLessons}).`);
      return;
    }

    if (dateObj) {
      const today = startOfDay(new Date());
      if (isBefore(startOfDay(dateObj), today)) {
        toast.error("Non puoi programmare una lezione nel passato.");
        return;
      }
      setModalDate(format(dateObj, "yyyy-MM-dd"));
    } else {
      const tomorrow = new Date();
      tomorrow.setDate(tomorrow.getDate() + 1);
      setModalDate(format(tomorrow, "yyyy-MM-dd"));
    }
    setModalTime("10:00");
    setIsModalOpen(true);
  };

  const handleConfirmSchedule = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!modalDate || !modalTime) {
      toast.error("Seleziona data e orario");
      return;
    }

    setScheduling(true);
    try {
      const res = await scheduleNextLessonAction(bookingId, modalDate, modalTime);

      if (res.success) {
        toast.success("Lezione programmata con successo!");
        setIsModalOpen(false);
        setRefreshTrigger((prev) => prev + 1);
      } else {
        toast.error(res.error || "Errore nella programmazione della lezione");
      }
    } catch (err: any) {
      toast.error(err.message || "Errore di connessione");
    } finally {
      setScheduling(false);
    }
  };

  return {
    loading,
    error,
    booking,
    course,
    lessons,
    courseTitle,
    teacherName,
    coursePrice,
    regFee,
    totalAmount,
    maxLessons,
    completedLessons,
    totalLessons,
    progressPercent,
    canScheduleMore,
    activeTab,
    setActiveTab,
    currentMonth,
    days,
    getLessonsForDate,
    handlePrevMonth,
    handleNextMonth,
    isModalOpen,
    setIsModalOpen,
    modalDate,
    setModalDate,
    modalTime,
    setModalTime,
    scheduling,
    handleOpenScheduleModal,
    handleConfirmSchedule,
  };
}
