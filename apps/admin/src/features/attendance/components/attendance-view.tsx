"use client";

import { useState, useMemo } from "react";
import { useAttendance } from "../hooks/use-attendance";
import { QuickLessonPaymentDialog } from "./quick-lesson-payment-dialog";
import { BookingDetailDialog } from "@/features/bookings/components/booking-detail-dialog";
import { api } from "@/lib/api";
import {
  CheckCircle2,
  XCircle,
  Clock,
  Calendar as CalendarIcon,
  Search,
  ChevronLeft,
  ChevronRight,
  Banknote,
  GraduationCap,
  MapPin,
  Video,
  UserCheck,
  Eye,
  FileX,
  AlertTriangle,
  Users,
  LayoutGrid,
  ListFilter,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { formatCurrency, formatDateItalian } from "@atena/utils";
import type { LessonAttendanceItem } from "../types";
import type { Booking } from "@/features/bookings/types";

interface ClassSessionGroup {
  sessionKey: string;
  courseName: string;
  startsAt: string;
  endsAt?: string;
  teacherName: string;
  locationType: string;
  students: LessonAttendanceItem[];
}

export function AttendanceView() {
  const [selectedDate, setSelectedDate] = useState<string>(
    new Date().toISOString().split("T")[0]
  );
  const [courseFilter, setCourseFilter] = useState<string>("all");
  const [viewMode, setViewMode] = useState<"grouped" | "flat">("grouped");
  const [selectedBookingForDetail, setSelectedBookingForDetail] = useState<Booking | null>(null);
  const [detailDialogOpen, setDetailDialogOpen] = useState(false);
  const [quickPayItem, setQuickPayItem] = useState<LessonAttendanceItem | null>(null);

  const {
    lessons,
    loading,
    searchQuery,
    setSearchQuery,
    markAttendance,
    payLesson,
  } = useAttendance(selectedDate);

  const handleDateChange = (offsetDays: number) => {
    const d = new Date(selectedDate);
    d.setDate(d.getDate() + offsetDays);
    setSelectedDate(d.toISOString().split("T")[0]);
  };

  const handleMarkAttendance = async (item: LessonAttendanceItem, status: string) => {
    await markAttendance(item.id, status);
    if (
      (status === "present" || status === "late") &&
      (item.payment_status !== "paid" || item.billing_scheme === "per_lesson")
    ) {
      setQuickPayItem(item);
    }
  };

  // Filter lessons
  const filteredLessons = useMemo(() => {
    return lessons.filter((item) => {
      const matchSearch =
        searchQuery === "" ||
        item.student_name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        item.course_name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        item.teacher_name.toLowerCase().includes(searchQuery.toLowerCase());

      const matchCourse =
        courseFilter === "all" || item.course_name === courseFilter;

      return matchSearch && matchCourse;
    });
  }, [lessons, searchQuery, courseFilter]);

  // Group lessons by Class Session (Course Name + Start Time)
  const classSessionGroups = useMemo<ClassSessionGroup[]>(() => {
    const map = new Map<string, ClassSessionGroup>();

    filteredLessons.forEach((item) => {
      const startTime = new Date(item.starts_at).toLocaleTimeString("it-IT", {
        hour: "2-digit",
        minute: "2-digit",
      });
      const key = `${item.course_name}___${startTime}`;

      if (!map.has(key)) {
        map.set(key, {
          sessionKey: key,
          courseName: item.course_name,
          startsAt: item.starts_at,
          endsAt: item.ends_at,
          teacherName: item.teacher_name,
          locationType: item.location_type,
          students: [],
        });
      }

      map.get(key)!.students.push(item);
    });

    return Array.from(map.values());
  }, [filteredLessons]);

  // Unique course list for dropdown filter
  const courseOptions = useMemo(() => {
    const set = new Set<string>();
    lessons.forEach((l) => {
      if (l.course_name) set.add(l.course_name);
    });
    return Array.from(set);
  }, [lessons]);

  // General Stats
  const totalStudentsCount = filteredLessons.length;
  const presentCount = filteredLessons.filter(
    (l) => l.attendance_record?.status === "present"
  ).length;
  const absentCount = filteredLessons.filter(
    (l) => l.attendance_record?.status === "absent"
  ).length;
  const pendingPaymentCount = filteredLessons.filter(
    (l) => l.payment_status !== "paid" && l.booking_payment_status !== "completed"
  ).length;

  const openStudentDetail = async (bookingId?: string) => {
    if (!bookingId) return;
    try {
      const data = await api.get<Booking>(`/admin/bookings/${bookingId}`);
      setSelectedBookingForDetail(data);
      setDetailDialogOpen(true);
    } catch {
      // Non-blocking
    }
  };

  return (
    <div className="space-y-6 px-4 lg:px-6 py-4">
      {/* ── TOP CONTROL BAR: DATE & QUICK STATS ────────────────────── */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 p-4 rounded-2xl border bg-card/60 backdrop-blur-xs shadow-2xs">
        <div className="flex items-center gap-3">
          <div className="flex items-center gap-1 bg-background border rounded-xl p-1">
            <Button
              variant="ghost"
              size="icon"
              className="h-8 w-8 cursor-pointer"
              onClick={() => handleDateChange(-1)}
              title="Giorno precedente"
            >
              <ChevronLeft className="h-4 w-4" />
            </Button>
            <div className="px-3 py-1 text-xs font-bold font-mono min-w-[140px] text-center flex items-center justify-center gap-1.5">
              <CalendarIcon className="w-3.5 h-3.5 text-primary" />
              <span>{formatDateItalian(selectedDate)}</span>
            </div>
            <Button
              variant="ghost"
              size="icon"
              className="h-8 w-8 cursor-pointer"
              onClick={() => handleDateChange(1)}
              title="Giorno successivo"
            >
              <ChevronRight className="h-4 w-4" />
            </Button>
          </div>

          <Button
            variant="outline"
            size="sm"
            className="text-xs cursor-pointer font-semibold"
            onClick={() => setSelectedDate(new Date().toISOString().split("T")[0])}
          >
            Oggi
          </Button>
        </div>

        {/* Live Daily Stats */}
        <div className="flex items-center gap-2 flex-wrap text-xs">
          <Badge variant="outline" className="px-2.5 py-1 bg-background">
            Classi / Уроков: <span className="font-bold ml-1">{classSessionGroups.length}</span>
          </Badge>
          <Badge variant="outline" className="px-2.5 py-1 bg-background">
            Студентов в ведомости: <span className="font-bold ml-1">{totalStudentsCount}</span>
          </Badge>
          <Badge variant="secondary" className="px-2.5 py-1 bg-emerald-500/10 text-emerald-600 dark:text-emerald-400">
            <UserCheck className="w-3.5 h-3.5 mr-1" />
            Presenti: <span className="font-bold ml-1">{presentCount}</span>
          </Badge>
          <Badge variant="secondary" className="px-2.5 py-1 bg-rose-500/10 text-rose-600 dark:text-rose-400">
            <XCircle className="w-3.5 h-3.5 mr-1" />
            Assenti: <span className="font-bold ml-1">{absentCount}</span>
          </Badge>
          {pendingPaymentCount > 0 && (
            <Badge variant="secondary" className="px-2.5 py-1 bg-amber-500/10 text-amber-600 dark:text-amber-400">
              <AlertTriangle className="w-3.5 h-3.5 mr-1" />
              Da Incassare: <span className="font-bold ml-1">{pendingPaymentCount}</span>
            </Badge>
          )}
        </div>
      </div>

      {/* ── SEARCH & FILTER CONTROLS ───────────────────────────────── */}
      <div className="flex flex-col sm:flex-row items-center justify-between gap-3">
        <div className="relative w-full sm:w-80">
          <Search className="absolute left-3 top-2.5 h-4 w-4 text-muted-foreground" />
          <Input
            placeholder="Cerca studente, corso o docente..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="pl-9 text-xs h-9 bg-card"
          />
        </div>

        <div className="flex items-center gap-2 w-full sm:w-auto">
          <Select value={courseFilter} onValueChange={setCourseFilter}>
            <SelectTrigger className="h-9 text-xs w-full sm:w-[220px] bg-card">
              <SelectValue placeholder="Tutti i corsi" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">Tutti i corsi</SelectItem>
              {courseOptions.map((c) => (
                <SelectItem key={c} value={c}>{c}</SelectItem>
              ))}
            </SelectContent>
          </Select>

          {/* Mode Switcher */}
          <div className="flex items-center border rounded-lg bg-card p-0.5 shrink-0">
            <Button
              variant={viewMode === "grouped" ? "secondary" : "ghost"}
              size="sm"
              className="h-8 text-xs px-2.5 cursor-pointer"
              onClick={() => setViewMode("grouped")}
              title="Групповой вид по классам"
            >
              <LayoutGrid className="w-3.5 h-3.5 mr-1" />
              По классам
            </Button>
            <Button
              variant={viewMode === "flat" ? "secondary" : "ghost"}
              size="sm"
              className="h-8 text-xs px-2.5 cursor-pointer"
              onClick={() => setViewMode("flat")}
              title="Плоский список ведомости"
            >
              <ListFilter className="w-3.5 h-3.5 mr-1" />
              Плоский список
            </Button>
          </div>
        </div>
      </div>

      {/* ── MAIN CONTENT: CLASS REGISTERS ──────────────────────────── */}
      {loading ? (
        <Card className="p-12 text-center text-sm text-muted-foreground">
          Caricamento registro presenze in corso...
        </Card>
      ) : classSessionGroups.length === 0 ? (
        <Card className="p-12 border-dashed text-center space-y-3 bg-card/40">
          <FileX className="w-10 h-10 text-muted-foreground/40 mx-auto" />
          <div className="space-y-1">
            <h3 className="font-bold text-base">Nessuna lezione in programma</h3>
            <p className="text-xs text-muted-foreground max-w-md mx-auto">
              Per la data <span className="font-semibold">{formatDateItalian(selectedDate)}</span> non ci sono lezioni сгенерированные в расписании.
            </p>
          </div>
        </Card>
      ) : (
        <div className="space-y-6">
          {classSessionGroups.map((group) => {
            const startTime = new Date(group.startsAt).toLocaleTimeString("it-IT", {
              hour: "2-digit",
              minute: "2-digit",
            });
            const endTime = group.endsAt
              ? new Date(group.endsAt).toLocaleTimeString("it-IT", { hour: "2-digit", minute: "2-digit" })
              : "";

            const groupPresentCount = group.students.filter(
              (s) => s.attendance_record?.status === "present"
            ).length;
            const groupAbsentCount = group.students.filter(
              (s) => s.attendance_record?.status === "absent"
            ).length;

            return (
              <Card key={group.sessionKey} className="overflow-hidden border bg-card shadow-sm hover:border-primary/30 transition-all">
                {/* Class Session Header Bar */}
                <CardHeader className="p-4 bg-muted/20 border-b flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                  <div className="space-y-1">
                    <div className="flex items-center gap-2 flex-wrap">
                      <div className="px-3 py-1 rounded-lg bg-primary/10 text-primary font-mono font-extrabold text-xs flex items-center gap-1.5 border border-primary/20">
                        <Clock className="w-4 h-4 text-primary" />
                        {startTime} {endTime ? `- ${endTime}` : ""}
                      </div>
                      <h3 className="font-extrabold text-base tracking-tight text-foreground">{group.courseName}</h3>
                    </div>

                    <div className="flex items-center gap-3 text-xs text-muted-foreground pt-0.5">
                      <span className="flex items-center gap-1 font-medium text-foreground">
                        <GraduationCap className="w-3.5 h-3.5 text-primary" />
                        {group.teacherName}
                      </span>
                      <span>•</span>
                      <span className="flex items-center gap-1 font-medium">
                        {group.locationType === "online" ? (
                          <><Video className="w-3.5 h-3.5 text-blue-500" /> Online</>
                        ) : (
                          <><MapPin className="w-3.5 h-3.5 text-emerald-500" /> In Sede</>
                        )}
                      </span>
                    </div>
                  </div>

                  {/* Group Roster Summary Badge */}
                  <div className="flex items-center gap-2 flex-wrap self-start sm:self-center">
                    <Badge variant="outline" className="text-xs px-2.5 py-1 bg-background font-semibold">
                      <Users className="w-3.5 h-3.5 mr-1 text-primary" />
                      {group.students.length} Studenti in gruppo
                    </Badge>
                    <Badge variant="secondary" className="text-xs px-2.5 py-1 bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 font-semibold">
                      🟢 {groupPresentCount}
                    </Badge>
                    <Badge variant="secondary" className="text-xs px-2.5 py-1 bg-rose-500/10 text-rose-600 dark:text-rose-400 font-semibold">
                      🔴 {groupAbsentCount}
                    </Badge>
                  </div>
                </CardHeader>

                {/* Class Student Roster Table */}
                <CardContent className="p-0">
                  <Table>
                    <TableHeader className="bg-muted/10">
                      <TableRow className="text-[11px] uppercase tracking-wider font-bold">
                        <TableHead className="w-[280px]">Studente / Alunno</TableHead>
                        <TableHead>Stato Pagamento / Quota</TableHead>
                        <TableHead className="text-center">Presenza (1-Click)</TableHead>
                        <TableHead className="text-right pr-4">Cassa & Azioni</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {group.students.map((item) => {
                        const status = item.attendance_record?.status;
                        const isPaid = item.payment_status === "paid" || item.booking_payment_status === "completed";

                        return (
                          <TableRow key={item.id} className="hover:bg-muted/20 transition-colors">
                            {/* Student Info */}
                            <TableCell className="font-medium py-3">
                              <div className="space-y-0.5">
                                <p className="font-bold text-sm text-foreground">{item.student_name}</p>
                                <p className="text-xs text-muted-foreground">
                                  {item.student_email} {item.student_phone ? `• ${item.student_phone}` : ""}
                                </p>
                              </div>
                            </TableCell>

                            {/* Payment Status */}
                            <TableCell className="py-3">
                              {isPaid ? (
                                <Badge variant="secondary" className="text-[11px] bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border-emerald-500/20 font-semibold">
                                  ✓ Saldo Pagato
                                </Badge>
                              ) : (
                                <Badge variant="secondary" className="text-[11px] bg-rose-500/10 text-rose-600 dark:text-rose-400 border-rose-500/20 font-semibold">
                                  ⚠️ Da Saldare ({formatCurrency(item.price_per_lesson || 20)})
                                </Badge>
                              )}
                            </TableCell>

                            {/* 1-Click Attendance Toggle Buttons */}
                            <TableCell className="text-center py-3">
                              <div className="inline-flex items-center rounded-xl border bg-muted/20 p-1 gap-1">
                                <Button
                                  type="button"
                                  size="sm"
                                  variant={status === "present" ? "default" : "ghost"}
                                  className={`h-7 text-xs cursor-pointer px-2.5 font-bold ${
                                    status === "present"
                                      ? "bg-emerald-600 hover:bg-emerald-700 text-white"
                                      : "hover:bg-emerald-500/10 text-emerald-600"
                                  }`}
                                  onClick={() => handleMarkAttendance(item, "present")}
                                >
                                  <CheckCircle2 className="w-3.5 h-3.5 mr-1" />
                                  Presente
                                </Button>

                                <Button
                                  type="button"
                                  size="sm"
                                  variant={status === "absent" ? "default" : "ghost"}
                                  className={`h-7 text-xs cursor-pointer px-2.5 font-bold ${
                                    status === "absent"
                                      ? "bg-rose-600 hover:bg-rose-700 text-white"
                                      : "hover:bg-rose-500/10 text-rose-600"
                                  }`}
                                  onClick={() => handleMarkAttendance(item, "absent")}
                                >
                                  <XCircle className="w-3.5 h-3.5 mr-1" />
                                  Assente
                                </Button>

                                <Button
                                  type="button"
                                  size="sm"
                                  variant={status === "excused" ? "default" : "ghost"}
                                  className={`h-7 text-xs cursor-pointer px-2.5 font-bold ${
                                    status === "excused"
                                      ? "bg-amber-600 hover:bg-amber-700 text-white"
                                      : "hover:bg-amber-500/10 text-amber-600"
                                  }`}
                                  onClick={() => handleMarkAttendance(item, "excused")}
                                >
                                  <Clock className="w-3.5 h-3.5 mr-1" />
                                  Giustificato
                                </Button>
                              </div>
                            </TableCell>

                            {/* Actions (Quick Cashier & Student Profile) */}
                            <TableCell className="text-right py-3 pr-4">
                              <div className="flex items-center justify-end gap-2">
                                {!isPaid && (
                                  <Button
                                    type="button"
                                    size="sm"
                                    variant="outline"
                                    className="h-8 text-xs border-emerald-500/40 text-emerald-600 hover:bg-emerald-50 dark:hover:bg-emerald-950/30 font-bold cursor-pointer"
                                    onClick={() => setQuickPayItem(item)}
                                  >
                                    <Banknote className="w-3.5 h-3.5 mr-1 text-emerald-500" />
                                    Incassa {formatCurrency(item.price_per_lesson || 20)}
                                  </Button>
                                )}

                                {item.booking_id && (
                                  <Button
                                    type="button"
                                    size="sm"
                                    variant="ghost"
                                    className="h-8 text-xs cursor-pointer text-muted-foreground hover:text-foreground"
                                    onClick={() => openStudentDetail(item.booking_id)}
                                    title="Vedi scheda studente"
                                  >
                                    <Eye className="w-3.5 h-3.5 mr-1" />
                                    Scheda
                                  </Button>
                                )}
                              </div>
                            </TableCell>
                          </TableRow>
                        );
                      })}
                    </TableBody>
                  </Table>
                </CardContent>
              </Card>
            );
          })}
        </div>
      )}

      {/* Quick Cashier Modal */}
      <QuickLessonPaymentDialog
        item={quickPayItem}
        open={Boolean(quickPayItem)}
        onOpenChange={(v) => { if (!v) setQuickPayItem(null); }}
        onPay={async (lessonId, paymentMethod, amount) => {
          await payLesson(lessonId, paymentMethod, amount);
          setQuickPayItem(null);
        }}
      />

      {/* Student Booking Detail Modal */}
      <BookingDetailDialog
        booking={selectedBookingForDetail}
        isOpen={detailDialogOpen}
        onClose={() => {
          setDetailDialogOpen(false);
          setSelectedBookingForDetail(null);
        }}
      />
    </div>
  );
}
