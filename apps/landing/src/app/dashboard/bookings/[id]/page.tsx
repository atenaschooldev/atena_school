"use client";

import { useEffect, useState, use } from "react";
import {
  Calendar as CalendarIcon,
  Clock,
  MapPin,
  ArrowLeft,
  CaretLeft,
  CaretRight,
  CheckCircle,
  User,
  Info,
  Plus,
  X
} from "@phosphor-icons/react";
import { format, isFuture, parseISO, startOfDay, isBefore } from "date-fns";
import { it } from "date-fns/locale";
import { Link } from "@/i18n/routing";
import { getBookingLessonsAction, scheduleNextLessonAction } from "@/app/actions/dashboard";
import { toast } from "sonner";
import { getDynamicMaxLessons } from "@/lib/utils/bookingScheduler";

interface Lesson {
  id: string;
  booking_id: string;
  starts_at: string;
  ends_at: string;
  status: string;
  created_at: string;
}

const TIME_SLOTS = [
  "08:00", "08:30", "09:00", "09:30", "10:00", "10:30", "11:00", "11:30",
  "12:00", "12:30", "13:00", "13:30", "14:00", "14:30", "15:00", "15:30",
  "16:00", "16:30", "17:00", "17:30", "18:00", "18:30", "19:00", "19:30", "20:00"
];

export default function BookingDetailPage({ params }: { params: Promise<{ id: string }> }) {
  const resolvedParams = use(params);
  const bookingId = resolvedParams.id;

  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [booking, setBooking] = useState<any>(null);
  const [course, setCourse] = useState<any>(null);
  const [lessons, setLessons] = useState<Lesson[]>([]);
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
          setLessons(res.lessons);
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

  if (loading) {
    return (
      <div className="flex justify-center items-center min-h-[60vh]">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary" />
      </div>
    );
  }

  if (error || !booking) {
    return (
      <main className="min-h-screen pt-24 pb-16 px-4 bg-[#f8f9fa] flex items-center justify-center">
        <div className="max-w-md w-full text-center space-y-6 p-8 bg-white rounded-3xl border border-border shadow-xl">
          <div className="w-16 h-16 bg-red-500/10 rounded-2xl flex items-center justify-center mx-auto text-red-500">
            <Info className="w-8 h-8" />
          </div>
          <div className="space-y-2">
            <h1 className="text-2xl font-bold text-foreground">Si è verificato un errore</h1>
            <p className="text-sm text-foreground/60">{error || "Prenotazione non trovata."}</p>
          </div>
          <Link
            href="/dashboard"
            className="w-full py-4 bg-[#043569] text-white rounded-2xl font-black uppercase tracking-widest text-xs hover:bg-[#F8861D] transition-all flex items-center justify-center gap-2 shadow-lg"
          >
            Torna al pannello
          </Link>
        </div>
      </main>
    );
  }

  const courseTitle = course?.name || course?.title_it || "Corso di Lingua";
  const teacherName = course?.teacher_name || "Staff Atena";
  const coursePrice = course?.price || 0;

  // Determine limits
  const isFixedSchedule = course?.schedule_type === "fixed";

  const bdate = booking.start_date || booking.booking_date;
  const maxLessons = isFixedSchedule
    ? lessons.length
    : getDynamicMaxLessons(course?.name || "", bdate, course?.category || "", course?.lessons_per_week);

  // Calculate progress
  const completedLessons = lessons.filter(l => !isFuture(parseISO(l.starts_at))).length;
  const totalLessons = lessons.length;
  const progressPercent = maxLessons > 0 ? Math.round((completedLessons / maxLessons) * 100) : 0;
  const canScheduleMore = totalLessons < maxLessons;

  // Calendar builder
  const year = currentMonth.getFullYear();
  const month = currentMonth.getMonth();
  const firstDay = new Date(year, month, 1);
  const lastDay = new Date(year, month + 1, 0);

  // Weekdays alignment: 0 = Sun, 1 = Mon ...
  const startDayOfWeek = firstDay.getDay();
  const blanks = startDayOfWeek === 0 ? 6 : startDayOfWeek - 1; // Align to Monday as 1st day
  const daysInMonth = lastDay.getDate();

  const days = [];
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

  // Open modal handler
  const handleOpenScheduleModal = (dateObj?: Date) => {
    if (!canScheduleMore) {
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
      // Prefill with tomorrow
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
        setRefreshTrigger(prev => prev + 1);
      } else {
        toast.error(res.error || "Errore durante la pianificazione");
      }
    } catch (err: any) {
      toast.error(err.message || "Errore durante la pianificazione");
    } finally {
      setScheduling(false);
    }
  };

  return (
    <main className="min-h-screen pt-8 md:pt-16 pb-16 px-4 bg-[#f8f9fa]">
      <div className="max-w-5xl mx-auto space-y-6">
        {/* Back Link */}
        <div>
          <Link
            href="/dashboard"
            className="inline-flex items-center gap-2 text-xs font-bold uppercase tracking-wider text-foreground/60 hover:text-primary transition-colors"
          >
            <ArrowLeft className="w-4 h-4" />
            Torna al Pannello
          </Link>
        </div>

        <div className="grid md:grid-cols-3 gap-8">
          {/* Sidebar Info & Progress */}
          <div className="space-y-6">
            <div className="bg-white p-6 rounded-3xl border border-border shadow-sm space-y-6">
              <div className="space-y-2 pb-4 border-b border-border">
                <div className="flex items-center justify-between gap-2">
                  <span className="text-[10px] font-black uppercase tracking-widest px-2.5 py-1 rounded-lg bg-primary/10 text-primary">
                    Corso
                  </span>
                  <span
                    className={`inline-block text-[10px] font-bold uppercase tracking-wider px-2.5 py-0.5 rounded-full ${
                      (booking.payment_status || booking.status) === "paid" || (booking.payment_status || booking.status) === "completed"
                        ? "bg-green-500/10 text-green-700 border border-green-500/20"
                        : (booking.payment_status || booking.status) === "reserved"
                          ? "bg-amber-500/10 text-amber-700 border border-amber-500/20"
                          : "bg-muted text-muted-foreground border border-border"
                      }`}
                  >
                    {(booking.payment_status || booking.status) === "paid" || (booking.payment_status || booking.status) === "completed"
                      ? "✓ Pagato"
                      : (booking.payment_status || booking.status) === "reserved"
                        ? "Prenotato"
                        : "In attesa"}
                  </span>
                </div>
                <h2 className="font-black text-foreground text-xl leading-tight">
                  {courseTitle}
                </h2>
              </div>

              <div className="space-y-4">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 bg-primary/5 rounded-xl flex items-center justify-center text-primary shrink-0">
                    <User className="w-5 h-5" />
                  </div>
                  <div>
                    <p className="text-[10px] font-bold uppercase tracking-wider text-foreground/40">Studente</p>
                    <p className="text-sm font-bold text-foreground">{booking.student_name || "—"}</p>
                    {booking.student_birth_date && (
                      <p className="text-[11px] text-foreground/50">Nato/a il: {format(new Date(booking.student_birth_date), "dd/MM/yyyy")}</p>
                    )}
                  </div>
                </div>

                {booking.purchaser_name && booking.purchaser_name !== booking.student_name && (
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 bg-primary/5 rounded-xl flex items-center justify-center text-primary shrink-0">
                      <User className="w-5 h-5" />
                    </div>
                    <div>
                      <p className="text-[10px] font-bold uppercase tracking-wider text-foreground/40">Acquirente / Genitore</p>
                      <p className="text-sm font-bold text-foreground">{booking.purchaser_name}</p>
                    </div>
                  </div>
                )}

                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 bg-primary/5 rounded-xl flex items-center justify-center text-primary shrink-0">
                    <User className="w-5 h-5" />
                  </div>
                  <div>
                    <p className="text-[10px] font-bold uppercase tracking-wider text-foreground/40">Insegnante</p>
                    <p className="text-sm font-bold text-foreground">{teacherName}</p>
                  </div>
                </div>

                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 bg-primary/5 rounded-xl flex items-center justify-center text-primary shrink-0">
                    <CalendarIcon className="w-5 h-5" />
                  </div>
                  <div>
                    <p className="text-[10px] font-bold uppercase tracking-wider text-foreground/40">Orario Standard</p>
                    <p className="text-sm font-bold text-foreground">{booking.booking_time || "Vedi calendario"}</p>
                  </div>
                </div>

                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 bg-primary/5 rounded-xl flex items-center justify-center text-primary shrink-0">
                    <MapPin className="w-5 h-5" />
                  </div>
                  <div>
                    <p className="text-[10px] font-bold uppercase tracking-wider text-foreground/40">Sede Lezioni</p>
                    <p className="text-sm font-bold text-foreground">Atena School, Via Matteotti 11</p>
                  </div>
                </div>

                {booking.tax_code && (
                  <div className="pt-2 border-t border-border/60 text-xs flex justify-between">
                    <span className="text-foreground/50">Codice Fiscale:</span>
                    <span className="font-mono font-bold text-foreground">{booking.tax_code}</span>
                  </div>
                )}
              </div>

              <div className="pt-4 border-t border-border space-y-1.5">
                <div className="flex items-center justify-between text-xs text-foreground/60">
                  <span>Prezzo corso</span>
                  <span>€{Number(coursePrice).toFixed(2)}</span>
                </div>
                {Number(booking.registration_fee || 0) > 0 && (
                  <div className="flex items-center justify-between text-xs text-foreground/60">
                    <span>Quota iscrizione annuale</span>
                    <span>€{Number(booking.registration_fee).toFixed(2)}</span>
                  </div>
                )}
                <div className="pt-2 border-t border-border flex items-center justify-between">
                  <span className="text-sm font-bold text-foreground/75">Importo totale</span>
                  <span className="text-xl font-black text-primary">€{Number(booking.amount_paid || coursePrice).toFixed(2)}</span>
                </div>
              </div>
            </div>

            {/* Progress Card */}
            <div className="bg-white p-6 rounded-3xl border border-border shadow-sm space-y-4">
              <h3 className="font-bold text-foreground text-md">Progresso Lezioni</h3>
              <div className="flex justify-between items-baseline">
                <span className="text-2xl font-black text-primary">{completedLessons} / {maxLessons}</span>
                <span className="text-xs font-bold text-foreground/60">Lezioni svolte</span>
              </div>
              <div className="w-full bg-secondary/20 rounded-full h-3.5 overflow-hidden">
                <div
                  className="bg-[#F8861D] h-3.5 rounded-full transition-all duration-500"
                  style={{ width: `${progressPercent}%` }}
                />
              </div>

              <div className="pt-2">
                {canScheduleMore ? (
                  <button
                    onClick={() => handleOpenScheduleModal()}
                    className="w-full py-3 bg-[#043569] hover:bg-[#032850] text-white rounded-2xl font-bold text-xs uppercase tracking-wider transition-all flex items-center justify-center gap-2 shadow-md cursor-pointer"
                  >
                    <Plus className="w-4 h-4" weight="bold" />
                    <span>Pianifica Lezione ({totalLessons}/{maxLessons})</span>
                  </button>
                ) : (
                  <div className="w-full py-3 bg-emerald-500/10 border border-emerald-500/20 text-emerald-700 rounded-2xl font-bold text-xs uppercase tracking-wider flex items-center justify-center gap-2">
                    <CheckCircle className="w-4 h-4" weight="fill" />
                    <span>Tutti gli incontri pianificati</span>
                  </div>
                )}
              </div>
            </div>
          </div>

          {/* Main Calendar View / List */}
          <div className="md:col-span-2 space-y-6">
            {/* View Selectors */}
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2 p-1.5 bg-white rounded-2xl border border-border shadow-sm w-fit">
                <button
                  onClick={() => setActiveTab("calendar")}
                  className={`px-5 py-2.5 rounded-xl font-bold text-xs uppercase tracking-wider transition-all ${activeTab === "calendar"
                      ? "bg-[#043569] text-white shadow-md"
                      : "text-foreground/60 hover:text-foreground hover:bg-muted/50"
                    }`}
                >
                  Vista Calendario
                </button>
                <button
                  onClick={() => setActiveTab("list")}
                  className={`px-5 py-2.5 rounded-xl font-bold text-xs uppercase tracking-wider transition-all ${activeTab === "list"
                      ? "bg-[#043569] text-white shadow-md"
                      : "text-foreground/60 hover:text-foreground hover:bg-muted/50"
                    }`}
                >
                  Lista Lezioni ({totalLessons})
                </button>
              </div>
            </div>

            {/* TAB: CALENDAR */}
            {activeTab === "calendar" && (
              <div className="bg-white p-6 rounded-3xl border border-border shadow-sm space-y-6">
                {/* Month Navigator */}
                <div className="flex items-center justify-between">
                  <h3 className="text-lg font-black text-foreground capitalize">
                    {format(currentMonth, "MMMM yyyy", { locale: it })}
                  </h3>
                  <div className="flex items-center gap-2">
                    <button
                      onClick={handlePrevMonth}
                      className="p-2 border border-border hover:bg-muted rounded-xl transition-all"
                    >
                      <CaretLeft className="w-5 h-5 text-foreground" />
                    </button>
                    <button
                      onClick={handleNextMonth}
                      className="p-2 border border-border hover:bg-muted rounded-xl transition-all"
                    >
                      <CaretRight className="w-5 h-5 text-foreground" />
                    </button>
                  </div>
                </div>

                {/* Calendar Grid */}
                <div className="grid grid-cols-7 gap-2 text-center">
                  {/* Day Headers */}
                  {["Lu", "Ma", "Me", "Gi", "Ve", "Sa", "Do"].map((day) => (
                    <div key={day} className="py-2 text-xs font-black uppercase tracking-wider text-foreground/40">
                      {day}
                    </div>
                  ))}

                  {/* Day Cells */}
                  {days.map((item, idx) => {
                    const lessonsForDay = getLessonsForDate(item.date);
                    const hasLesson = lessonsForDay.length > 0;

                    const today = startOfDay(new Date());
                    const isPast = item.date ? isBefore(startOfDay(item.date), today) : false;
                    const canScheduleThisDay = item.date && !isPast && !hasLesson && canScheduleMore;

                    return (
                      <div
                        key={idx}
                        onClick={() => canScheduleThisDay && handleOpenScheduleModal(item.date!)}
                        className={`min-h-[50px] sm:min-h-[60px] p-1.5 flex flex-col justify-between border border-border/40 rounded-xl relative transition-all ${!item.day
                            ? "bg-muted/30 border-none pointer-events-none"
                            : canScheduleThisDay
                              ? "bg-white hover:bg-primary/5 hover:border-primary/40 cursor-pointer"
                              : "bg-white"
                          }`}
                      >
                        {item.day && (
                          <>
                            <span className="text-xs font-bold text-foreground/50 self-start">{item.day}</span>
                            {hasLesson && (
                              <div className="mt-1">
                                {lessonsForDay.map((lesson, lIdx) => (
                                  <div
                                    key={lIdx}
                                    className="bg-[#F8861D]/10 hover:bg-[#F8861D]/20 text-[#d46a0c] border border-[#F8861D]/20 py-0.5 px-1 rounded-lg text-[8px] sm:text-[9px] font-black tracking-tighter text-center cursor-pointer transition-all"
                                    title={`Lezione: ${format(new Date(lesson.starts_at), "HH:mm")} - ${format(new Date(lesson.ends_at), "HH:mm")}`}
                                  >
                                    {format(new Date(lesson.starts_at), "HH:mm")}-{format(new Date(lesson.ends_at), "HH:mm")}
                                  </div>
                                ))}
                              </div>
                            )}
                          </>
                        )}
                      </div>
                    );
                  })}
                </div>

                {/* Legenda */}
                <div className="pt-4 border-t border-border text-xs text-foreground/60 flex flex-wrap items-center gap-6">
                  <div className="flex items-center gap-1.5">
                    <div className="w-3.5 h-3.5 bg-[#F8861D]/10 border border-[#F8861D]/20 rounded-md" />
                    <span>Lezione programmata</span>
                  </div>
                  {canScheduleMore && (
                    <div className="flex items-center gap-1.5">
                      <div className="w-3.5 h-3.5 border border-dashed border-primary/40 bg-primary/5 rounded-md" />
                      <span>Clicca un giorno per pianificare</span>
                    </div>
                  )}
                </div>
              </div>
            )}

            {/* TAB: LIST */}
            {activeTab === "list" && (
              <div className="bg-white p-6 rounded-3xl border border-border shadow-sm">
                {lessons.length === 0 ? (
                  <div className="py-12 text-center text-foreground/50 text-sm">
                    Nessuna lezione trovata nel database per questa prenotazione.
                  </div>
                ) : (
                  <div className="relative border-l border-border pl-6 ml-2 space-y-8 py-2">
                    {lessons.map((lesson, idx) => {
                      const starts = new Date(lesson.starts_at);
                      const ends = new Date(lesson.ends_at);
                      const lessonPast = !isFuture(starts);

                      return (
                        <div key={lesson.id} className="relative">
                          {/* Circle indicator on timeline */}
                          <div className={`absolute -left-[31px] top-1 w-4 h-4 rounded-full border-2 bg-white flex items-center justify-center transition-all ${lessonPast
                              ? "border-[#F8861D]"
                              : "border-primary"
                            }`}>
                            {lessonPast && <div className="w-1.5 h-1.5 rounded-full bg-[#F8861D]" />}
                          </div>

                          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 bg-muted/20 hover:bg-muted/40 p-4 rounded-2xl border border-border/30 transition-all">
                            <div className="space-y-1">
                              <span className="text-[10px] font-black uppercase tracking-widest text-[#F8861D]">
                                Lezione {idx + 1}
                              </span>
                              <h4 className="font-bold text-foreground text-sm capitalize">
                                {format(starts, "EEEE d MMMM yyyy", { locale: it })}
                              </h4>
                              <div className="flex items-center gap-1.5 text-xs text-foreground/60 font-medium">
                                <Clock className="w-3.5 h-3.5 text-primary" />
                                <span>{format(starts, "HH:mm")} - {format(ends, "HH:mm")}</span>
                              </div>
                            </div>
                            <div>
                              <span className={`inline-block text-[10px] font-bold uppercase tracking-wider px-2.5 py-1 rounded-full ${lessonPast
                                  ? "bg-green-500/10 text-green-700 border border-green-500/20"
                                  : "bg-primary/10 text-primary border border-primary/20"
                                }`}>
                                {lessonPast ? "✓ Svolta" : "Programmata"}
                              </span>
                            </div>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                )}
              </div>
            )}
          </div>
        </div>
      </div>

      {/* SCHEDULE LESSON MODAL */}
      {isModalOpen && (
        <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-sm flex items-center justify-center z-50 p-4 select-none">
          <div className="bg-white rounded-3xl max-w-md w-full border border-border p-6 shadow-2xl space-y-6 relative animate-in fade-in zoom-in-95 duration-200">
            {/* Modal Header */}
            <div className="flex items-center justify-between pb-3 border-b border-border">
              <h3 className="font-black text-foreground text-lg">Pianifica Lezione</h3>
              <button
                onClick={() => setIsModalOpen(false)}
                className="p-1 text-foreground/40 hover:text-foreground hover:bg-muted rounded-lg transition-all"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Modal Form */}
            <form onSubmit={handleConfirmSchedule} className="space-y-4">
              <div className="space-y-1.5">
                <label className="text-[10px] font-bold uppercase tracking-wider text-foreground/50">Data Selezionata</label>
                <input
                  type="date"
                  value={modalDate}
                  onChange={(e) => setModalDate(e.target.value)}
                  min={format(new Date(), "yyyy-MM-dd")}
                  className="w-full px-4 py-3 rounded-xl border border-border text-sm font-semibold focus:outline-none focus:border-primary transition-colors bg-[#f8f9fa]"
                  required
                />
              </div>

              <div className="space-y-1.5">
                <label className="text-[10px] font-bold uppercase tracking-wider text-foreground/50">Orario Incontro</label>
                <select
                  value={modalTime}
                  onChange={(e) => setModalTime(e.target.value)}
                  className="w-full px-4 py-3 rounded-xl border border-border text-sm font-semibold focus:outline-none focus:border-primary transition-colors bg-[#f8f9fa] appearance-none"
                  required
                >
                  {TIME_SLOTS.map((slot) => (
                    <option key={slot} value={slot}>{slot}</option>
                  ))}
                </select>
              </div>

              <div className="pt-4 flex gap-3">
                <button
                  type="button"
                  onClick={() => setIsModalOpen(false)}
                  className="flex-1 py-3 border border-border hover:bg-muted text-foreground rounded-2xl font-bold text-xs uppercase tracking-wider transition-all"
                >
                  Annulla
                </button>
                <button
                  type="submit"
                  disabled={scheduling}
                  className="flex-1 py-3 bg-[#043569] hover:bg-[#032850] text-white rounded-2xl font-bold text-xs uppercase tracking-wider transition-all flex items-center justify-center gap-2 shadow-md disabled:opacity-60 cursor-pointer"
                >
                  {scheduling ? (
                    <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                  ) : (
                    <span>Conferma</span>
                  )}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </main>
  );
}
