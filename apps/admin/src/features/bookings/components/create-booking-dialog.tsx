"use client";

import { useState, useEffect, useMemo } from "react";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogTrigger,
} from "@/components/ui/dialog";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
  FormDescription,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import { Checkbox } from "@/components/ui/checkbox";
import { Badge } from "@/components/ui/badge";
import { Calendar } from "@/components/ui/calendar";
import { format, addMonths } from "date-fns";
import { it as dateLocale } from "date-fns/locale";
import {
  Plus,
  User,
  CreditCard,
  Receipt,
  GraduationCap,
  ShieldCheck,
  Calendar as CalendarIcon,
  CheckCircle2,
  Search,
  Sparkles,
  ArrowRight,
  ChevronLeft,
  Loader2,
  BookOpen,
  Clock,
  Euro,
  AlertCircle,
  CheckCheck,
} from "lucide-react";
import { useForm } from "react-hook-form";
import { z } from "zod";
import { zodResolver } from "@hookform/resolvers/zod";
import { useCourses } from "@/features/courses/hooks/use-courses";
import { api } from "@/lib/api";
import type { Course } from "@/features/courses/types";
import { calculateLessonDates, formatCourseScheduleText } from "@atena/utils";

function normalizeScheduleDays(rawDays?: any): number[] {
  if (!rawDays || !Array.isArray(rawDays) || rawDays.length === 0) return [];
  const dayNameMap: Record<string, number> = {
    lun: 1, lunedi: 1, "lunedì": 1, monday: 1, mon: 1,
    mar: 2, martedi: 2, "martedì": 2, tuesday: 2, tue: 2,
    mer: 3, mercoledi: 3, "mercoledì": 3, wednesday: 3, wed: 3,
    gio: 4, giovedi: 4, "giovedì": 4, thursday: 4, thu: 4,
    ven: 5, venerdi: 5, "venerdì": 5, friday: 5, fri: 5,
    sab: 6, sabato: 6, saturday: 6, sat: 6,
    dom: 0, domenica: 0, sunday: 0, sun: 0,
  };
  const result: number[] = [];
  for (const item of rawDays) {
    if (typeof item === "number" && item >= 0 && item <= 6) {
      result.push(item);
    } else if (typeof item === "string") {
      const parsedNum = parseInt(item, 10);
      if (!isNaN(parsedNum) && parsedNum >= 0 && parsedNum <= 6) {
        result.push(parsedNum);
      } else {
        const lower = item.trim().toLowerCase();
        if (dayNameMap[lower] !== undefined) result.push(dayNameMap[lower]);
      }
    }
  }
  return result;
}

const createBookingSchema = z.object({
  courseId: z.string().optional(),
  courseName: z.string().min(2, { message: "Inserisci il nome del corso." }),
  startDate: z.string().optional(),
  purchaserName: z.string().min(2, { message: "Inserisci il nome del cliente / genitore." }),
  purchaserEmail: z.string().email({ message: "Email non valida." }),
  purchaserPhone: z.string().optional(),
  purchaserTaxCode: z.string().optional(),
  isForChild: z.boolean().default(false),
  studentFirstName: z.string().optional(),
  studentLastName: z.string().optional(),
  studentEmail: z.string().optional(),
  studentPhone: z.string().optional(),
  studentBirthDate: z.string().optional(),
  studentTaxCode: z.string().optional(),
  needsCompanyInvoice: z.boolean().default(false),
  sdiCode: z.string().max(7, { message: "Codice SDI max 7 caratteri" }).optional(),
  pecEmail: z.string().optional(),
  amountPaid: z.coerce.number().min(0),
  registrationFee: z.coerce.number().min(0).default(0),
  billingScheme: z.string().default("full"),
  paymentStatus: z.string().min(1),
  paymentMethod: z.string().min(1),
  notes: z.string().optional(),
});

type CreateBookingValues = z.infer<typeof createBookingSchema>;

interface CreateBookingDialogProps {
  onCreateBooking: (values: Record<string, any>) => Promise<unknown>;
}

const STEPS = [
  { id: 1, label: "Cliente", sublabel: "Anagrafica", icon: User },
  { id: 2, label: "Corso", sublabel: "Calendario", icon: CalendarIcon },
  { id: 3, label: "Pagamento", sublabel: "Riepilogo", icon: CreditCard },
];

export function CreateBookingDialog({ onCreateBooking }: CreateBookingDialogProps) {
  const [open, setOpen] = useState(false);
  const [currentStep, setCurrentStep] = useState<1 | 2 | 3>(1);
  const [selectedCourse, setSelectedCourse] = useState<Course | null>(null);
  const [selectedDateState, setSelectedDateState] = useState<Date | undefined>(undefined);
  const [membershipFeeStatus, setMembershipFeeStatus] = useState<{ checked: boolean; paid: boolean }>({ checked: false, paid: false });
  const [searchQuery, setSearchQuery] = useState("");
  const [isSearchingClient, setIsSearchingClient] = useState(false);
  const [clientFound, setClientFound] = useState<boolean | null>(null);

  const { coursesList } = useCourses();

  const form = useForm<CreateBookingValues>({
    resolver: zodResolver(createBookingSchema),
    defaultValues: {
      courseId: "",
      courseName: "",
      startDate: "",
      purchaserName: "",
      purchaserEmail: "",
      purchaserPhone: "",
      purchaserTaxCode: "",
      isForChild: false,
      studentFirstName: "",
      studentLastName: "",
      studentEmail: "",
      studentPhone: "",
      studentBirthDate: "",
      studentTaxCode: "",
      needsCompanyInvoice: false,
      sdiCode: "",
      pecEmail: "",
      amountPaid: 0,
      registrationFee: 0,
      paymentStatus: "reserved",
      paymentMethod: "cash",
      notes: "",
    },
  });

  const isForChild = form.watch("isForChild");
  const needsCompanyInvoice = form.watch("needsCompanyInvoice");
  const amountPaid = form.watch("amountPaid") || 0;
  const registrationFee = form.watch("registrationFee") || 0;
  const purchaserEmail = form.watch("purchaserEmail");
  const purchaserName = form.watch("purchaserName");
  const purchaserTaxCode = form.watch("purchaserTaxCode");
  const studentEmail = form.watch("studentEmail");
  const studentTaxCode = form.watch("studentTaxCode");
  const paymentMethod = form.watch("paymentMethod");
  const paymentStatus = form.watch("paymentStatus");
  const totalAmount = Number(amountPaid) + Number(registrationFee);

  const allowedDays = useMemo(() => {
    const parsed = normalizeScheduleDays(selectedCourse?.scheduleDays);
    return parsed.length > 0 ? parsed : [1, 2, 3, 4, 5];
  }, [selectedCourse]);

  const isFlexibleSchedule = selectedCourse?.scheduleType === "flexible";
  const isFixedSchedule = !isFlexibleSchedule;

  const previewLessons = useMemo(() => {
    if (!selectedDateState || isFlexibleSchedule) return [];
    const dateStr = format(selectedDateState, "yyyy-MM-dd");
    const timeStr = selectedCourse?.startTime || "16:00";
    const customMax = selectedCourse?.totalLessons || (
      selectedCourse?.totalHours && selectedCourse?.lessonDurationMinutes
        ? Math.round((selectedCourse.totalHours * 60) / selectedCourse.lessonDurationMinutes)
        : null
    );
    return calculateLessonDates(
      dateStr,
      timeStr,
      selectedCourse?.nome || selectedCourse?.categoria || "",
      allowedDays,
      selectedCourse?.lessonDurationMinutes || 60,
      selectedCourse?.startTime,
      selectedCourse?.endTime,
      selectedCourse?.scheduleType,
      customMax
    );
  }, [selectedDateState, selectedCourse, allowedDays, isFlexibleSchedule]);

  const endDatePreview = selectedDateState ? addMonths(selectedDateState, 1) : null;

  const formattedScheduleText = useMemo(() => {
    return formatCourseScheduleText(allowedDays, selectedCourse?.startTime, selectedCourse?.endTime);
  }, [allowedDays, selectedCourse]);

  useEffect(() => {
    // When isForChild is true, fee check MUST depend strictly on student's identifiers.
    // Do NOT check parent's email/CF for the child's annual membership fee!
    const taxToUse = isForChild ? (studentTaxCode?.trim() || null) : (purchaserTaxCode?.trim() || null);
    const emailToUse = isForChild ? (studentEmail?.trim() || null) : (purchaserEmail?.trim() || null);

    if (!emailToUse && !taxToUse) {
      setMembershipFeeStatus({ checked: false, paid: false });
      form.setValue("registrationFee", 0);
      return;
    }

    const timer = setTimeout(async () => {
      try {
        const query = new URLSearchParams();
        if (taxToUse) query.set("taxCode", taxToUse);
        if (emailToUse) query.set("email", emailToUse);
        const res = await api.get<{ annualFeePaid?: boolean }>(`/admin/bookings/check-membership?${query.toString()}`);
        if (res?.annualFeePaid) {
          setMembershipFeeStatus({ checked: true, paid: true });
          form.setValue("registrationFee", 0);
        } else {
          setMembershipFeeStatus({ checked: true, paid: false });
          form.setValue("registrationFee", 30);
        }
      } catch (err) {
        console.error("Failed to check membership status:", err);
      }
    }, 400);
    return () => clearTimeout(timer);
  }, [purchaserEmail, purchaserTaxCode, studentEmail, studentTaxCode, isForChild, form]);

  const handleCourseChange = (courseId: string) => {
    const found = coursesList.find((c) => c.id === courseId);
    if (found) {
      setSelectedCourse(found);
      setSelectedDateState(undefined);
      form.setValue("startDate", "");
      form.setValue("courseId", found.id);
      form.setValue("courseName", found.nome);
      if (found.prezzo) form.setValue("amountPaid", Number(found.prezzo));
    }
  };

  const handleDateSelect = (date: Date | undefined) => {
    setSelectedDateState(date);
    form.setValue("startDate", date ? format(date, "yyyy-MM-dd") : "");
  };

  const handleClose = () => {
    setOpen(false);
    setTimeout(() => {
      form.reset();
      setSelectedCourse(null);
      setSelectedDateState(undefined);
      setCurrentStep(1);
      setSearchQuery("");
      setClientFound(null);
      setMembershipFeeStatus({ checked: false, paid: false });
    }, 200);
  };

  async function onSubmit(data: CreateBookingValues) {
    if (currentStep !== 3) {
      return;
    }
    try {
      let finalStudentName = data.purchaserName;
      if (data.isForChild && (data.studentFirstName || data.studentLastName)) {
        finalStudentName = `${data.studentFirstName || ""} ${data.studentLastName || ""}`.trim();
      }
      const payload = {
        courseId: data.courseId || undefined,
        courseName: data.courseName,
        startDate: data.startDate || undefined,
        purchaserName: data.purchaserName,
        purchaserEmail: data.purchaserEmail,
        purchaserPhone: data.purchaserPhone || undefined,
        purchaserTaxCode: data.purchaserTaxCode || undefined,
        isForChild: data.isForChild,
        studentName: finalStudentName,
        studentEmail: data.studentEmail || data.purchaserEmail,
        studentPhone: data.studentPhone || data.purchaserPhone || undefined,
        studentTaxCode: data.studentTaxCode || data.purchaserTaxCode || undefined,
        studentBirthDate: data.studentBirthDate || undefined,
        amountPaid: Number(data.amountPaid),
        registrationFee: Number(data.registrationFee),
        billingScheme: data.billingScheme || "full",
        paymentStatus: data.paymentStatus,
        paymentMethod: data.paymentMethod,
        sdiCode: data.needsCompanyInvoice ? data.sdiCode : undefined,
        pecEmail: data.needsCompanyInvoice ? data.pecEmail : undefined,
        notes: data.notes || undefined,
      };
      await onCreateBooking(payload);
      handleClose();
    } catch {
      // Handled in parent
    }
  }

  const paymentMethodLabel: Record<string, string> = {
    cash: "Contanti",
    pos: "POS / Carta",
    transfer: "Bonifico",
    stripe: "Stripe",
  };

  return (
    <Dialog open={open} onOpenChange={(v) => { if (!v) handleClose(); else setOpen(true); }}>
      <DialogTrigger asChild>
        <Button className="cursor-pointer font-medium">
          <Plus className="mr-2 h-4 w-4" />
          Nuova Prenotazione
        </Button>
      </DialogTrigger>

      <DialogContent
        className="p-0 gap-0 border-border/60 flex flex-col"
        style={{ maxWidth: 920, width: "95vw", height: "min(680px, 95vh)", overflow: "hidden" }}
      >
        <Form {...form}>
          <form
            onSubmit={form.handleSubmit(onSubmit)}
            onKeyDown={(e) => {
              if (e.key === "Enter" && (e.target as HTMLElement).tagName === "INPUT") {
                e.preventDefault();
              }
            }}
            className="flex flex-col min-h-0 flex-1"
          >

            {/* ── TOP HEADER ─────────────────────────────────────────── */}
            <div className="flex items-center justify-between pl-6 pr-14 py-3 border-b border-border/60 bg-muted/30 shrink-0">
              <div className="flex items-center gap-3">
                <div className="w-8 h-8 rounded-lg bg-primary/10 flex items-center justify-center border border-primary/20 shrink-0">
                  <GraduationCap className="h-4 w-4 text-primary" />
                </div>
                <div>
                  <p className="text-sm font-bold leading-tight">Nuova Prenotazione in Sede</p>
                  <p className="text-[11px] text-muted-foreground leading-tight">Reception Wizard · Atena School</p>
                </div>
              </div>

              {/* Step tabs */}
              <div className="flex items-center gap-1">
                {STEPS.map((s, idx) => {
                  const Icon = s.icon;
                  const isActive = currentStep === s.id;
                  const isDone = currentStep > s.id;
                  return (
                    <div key={s.id} className="flex items-center gap-1">
                      <button
                        type="button"
                        onClick={() => setCurrentStep(s.id as any)}
                        className={`flex items-center gap-1.5 px-2.5 py-1 rounded-md text-[11px] font-semibold transition-all cursor-pointer ${
                          isActive
                            ? "bg-primary text-primary-foreground shadow-xs"
                            : isDone
                            ? "bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 hover:bg-emerald-500/15"
                            : "text-muted-foreground hover:text-foreground hover:bg-muted/60"
                        }`}
                      >
                        {isDone ? <CheckCheck className="w-3.5 h-3.5" /> : <Icon className="w-3.5 h-3.5" />}
                        <span>{s.label}</span>
                      </button>
                      {idx < STEPS.length - 1 && (
                        <div className={`w-3 h-px ${currentStep > s.id ? "bg-emerald-400" : "bg-border"}`} />
                      )}
                    </div>
                  );
                })}
              </div>
            </div>

            {/* ── BODY ───────────────────────────────────────────────── */}
            <div className="flex flex-1 min-h-0 overflow-hidden">

              {/* LEFT SIDEBAR */}
              <aside className="w-[210px] shrink-0 border-r border-border/60 bg-muted/20 flex flex-col p-4 gap-3 overflow-y-auto">
                <p className="text-[10px] font-bold uppercase tracking-widest text-muted-foreground">Riepilogo Ordine</p>

                <div className="space-y-1">
                  <p className="text-[10px] uppercase tracking-wider text-muted-foreground/60 font-semibold">Cliente</p>
                  {purchaserName ? (
                    <p className="text-xs font-semibold truncate">{purchaserName}</p>
                  ) : (
                    <p className="text-xs text-muted-foreground/60 italic">Non specificato</p>
                  )}
                  {purchaserEmail && (
                    <p className="text-[11px] text-muted-foreground truncate">{purchaserEmail}</p>
                  )}
                  {isForChild && (
                    <Badge variant="secondary" className="text-[10px] mt-0.5">👶 Minorenne</Badge>
                  )}
                </div>

                <div className="h-px bg-border/60" />

                <div className="space-y-1">
                  <p className="text-[10px] uppercase tracking-wider text-muted-foreground/60 font-semibold">Corso</p>
                  {selectedCourse ? (
                    <>
                      <p className="text-xs font-semibold leading-tight">{selectedCourse.nome}</p>
                      <p className="text-[11px] text-muted-foreground leading-tight">{formattedScheduleText || "—"}</p>
                    </>
                  ) : (
                    <p className="text-xs text-muted-foreground/60 italic">Non selezionato</p>
                  )}
                </div>

                {selectedDateState && (
                  <>
                    <div className="h-px bg-border/60" />
                    <div className="space-y-1">
                      <p className="text-[10px] uppercase tracking-wider text-muted-foreground/60 font-semibold">Inizio</p>
                      <p className="text-xs font-semibold">
                        {format(selectedDateState, "d MMM yyyy", { locale: dateLocale })}
                      </p>
                      {previewLessons.length > 0 && (
                        <p className="text-[11px] text-muted-foreground">{previewLessons.length} lezioni</p>
                      )}
                    </div>
                  </>
                )}

                <div className="h-px bg-border/60" />

                <div className="space-y-2">
                  <p className="text-[10px] uppercase tracking-wider text-muted-foreground/60 font-semibold">Incasso</p>
                  <div className="space-y-1">
                    <div className="flex justify-between text-[11px]">
                      <span className="text-muted-foreground">Corso</span>
                      <span className="font-mono font-medium">€{Number(amountPaid).toFixed(2)}</span>
                    </div>
                    <div className="flex justify-between text-[11px]">
                      <span className="text-muted-foreground">Iscrizione</span>
                      <span className="font-mono font-medium">€{Number(registrationFee).toFixed(2)}</span>
                    </div>
                    <div className="h-px bg-border/60 my-1" />
                    <div className="flex justify-between">
                      <span className="text-xs font-bold">Totale</span>
                      <span className="text-sm font-black font-mono text-primary">€{totalAmount.toFixed(2)}</span>
                    </div>
                  </div>
                  {membershipFeeStatus.checked && (
                    <div className={`flex items-center gap-1.5 text-[10px] font-semibold px-2 py-1 rounded-md ${
                      membershipFeeStatus.paid
                        ? "bg-emerald-500/10 text-emerald-600 dark:text-emerald-400"
                        : "bg-amber-500/10 text-amber-600 dark:text-amber-400"
                    }`}>
                      {membershipFeeStatus.paid
                        ? <CheckCircle2 className="w-3 h-3" />
                        : <AlertCircle className="w-3 h-3" />
                      }
                      {membershipFeeStatus.paid ? "Quota saldata" : "Quota da pagare"}
                    </div>
                  )}
                </div>

                <div className="flex-1" />

                {/* Mini step tracker */}
                <div className="space-y-1.5">
                  {STEPS.map((s) => (
                    <div key={s.id} className={`flex items-center gap-2 text-[10px] ${
                      currentStep > s.id ? "text-emerald-500" : currentStep === s.id ? "text-primary font-semibold" : "text-muted-foreground/40"
                    }`}>
                      <div className={`w-1.5 h-1.5 rounded-full shrink-0 ${
                        currentStep > s.id ? "bg-emerald-500" : currentStep === s.id ? "bg-primary" : "bg-border"
                      }`} />
                      {s.label} · {s.sublabel}
                    </div>
                  ))}
                </div>
              </aside>

              {/* RIGHT CONTENT — scrollable */}
              <div className="flex-1 min-h-0 overflow-y-auto">

                {/* ── STEP 1 ─────────────────────────────────────────── */}
                {currentStep === 1 && (
                  <div className="p-6 space-y-5">
                    {/* Client search */}
                    <div className="p-4 bg-muted/30 rounded-xl border border-border/60 space-y-3">
                      <div className="flex items-center gap-2">
                        <Search className="w-3.5 h-3.5 text-primary" />
                        <p className="text-xs font-bold uppercase tracking-wider text-muted-foreground">Cerca Cliente Esistente</p>
                      </div>
                      <div className="flex gap-2">
                        <Input
                          placeholder="Email, Codice Fiscale, Telefono o Nome..."
                          value={searchQuery}
                          onChange={(e) => setSearchQuery(e.target.value)}
                          onKeyDown={(e) => {
                            if (e.key === "Enter") {
                              e.preventDefault();
                              (e.currentTarget.nextElementSibling as HTMLButtonElement)?.click();
                            }
                          }}
                          className="text-xs bg-background h-9"
                        />
                        <Button
                          type="button"
                          variant="secondary"
                          size="sm"
                          disabled={isSearchingClient || !searchQuery.trim()}
                          onClick={async () => {
                            if (!searchQuery.trim()) return;
                            setIsSearchingClient(true);
                            setClientFound(null);
                            try {
                              const res = await api.get<{
                                found: boolean;
                                purchaserName?: string;
                                purchaserEmail?: string;
                                purchaserPhone?: string;
                                purchaserTaxCode?: string;
                                studentName?: string;
                                studentTaxCode?: string;
                                studentPhone?: string;
                                studentEmail?: string;
                                studentBirthDate?: string;
                                isForChild?: boolean;
                              }>(`/admin/bookings/lookup-client?q=${encodeURIComponent(searchQuery.trim())}`);

                              setClientFound(res.found);
                              if (res.found) {
                                if (res.purchaserName) form.setValue("purchaserName", res.purchaserName);
                                if (res.purchaserEmail) form.setValue("purchaserEmail", res.purchaserEmail);
                                if (res.purchaserPhone) form.setValue("purchaserPhone", res.purchaserPhone);
                                if (res.purchaserTaxCode) form.setValue("purchaserTaxCode", res.purchaserTaxCode);
                                if (res.isForChild) {
                                  form.setValue("isForChild", true);
                                  if (res.studentName) {
                                    const parts = res.studentName.split(" ");
                                    form.setValue("studentFirstName", parts[0] || "");
                                    form.setValue("studentLastName", parts.slice(1).join(" ") || "");
                                  }
                                  if (res.studentEmail) form.setValue("studentEmail", res.studentEmail);
                                  if (res.studentPhone) form.setValue("studentPhone", res.studentPhone);
                                  if (res.studentTaxCode) form.setValue("studentTaxCode", res.studentTaxCode);
                                  if (res.studentBirthDate) form.setValue("studentBirthDate", res.studentBirthDate);
                                }
                              } else {
                                if (searchQuery.includes("@")) form.setValue("purchaserEmail", searchQuery);
                                else form.setValue("purchaserTaxCode", searchQuery);
                              }
                            } catch (err) {
                              console.error("Lookup error:", err);
                            } finally {
                              setIsSearchingClient(false);
                            }
                          }}
                          className="cursor-pointer text-xs shrink-0 h-9"
                        >
                          {isSearchingClient
                            ? <><Loader2 className="w-3.5 h-3.5 mr-1.5 animate-spin" />Ricerca...</>
                            : <><Search className="w-3.5 h-3.5 mr-1.5" />Cerca</>
                          }
                        </Button>
                      </div>
                      {clientFound === true && (
                        <div className="flex items-center gap-2 text-xs text-emerald-600 dark:text-emerald-400 font-medium">
                          <CheckCircle2 className="w-3.5 h-3.5" />
                          Cliente trovato e dati compilati automaticamente.
                        </div>
                      )}
                      {clientFound === false && (
                        <div className="flex items-center gap-2 text-xs text-amber-600 dark:text-amber-400 font-medium">
                          <AlertCircle className="w-3.5 h-3.5" />
                          Nessun cliente trovato. Compila i dati manualmente.
                        </div>
                      )}
                    </div>

                    {/* isForChild toggle */}
                    <div className="p-3.5 bg-primary/5 rounded-xl border border-primary/15">
                      <FormField
                        control={form.control}
                        name="isForChild"
                        render={({ field }) => (
                          <FormItem className="flex flex-row items-start space-x-3 space-y-0">
                            <FormControl>
                              <Checkbox checked={field.value} onCheckedChange={field.onChange} className="cursor-pointer mt-0.5" />
                            </FormControl>
                            <div className="space-y-0.5">
                              <FormLabel className="text-sm font-semibold cursor-pointer">
                                Sto iscrivendo un figlio / minorenne
                              </FormLabel>
                              <FormDescription className="text-xs text-muted-foreground">
                                Abilita i campi separati per i dati dello studente e del genitore acquirente.
                              </FormDescription>
                            </div>
                          </FormItem>
                        )}
                      />
                    </div>

                    {/* Purchaser */}
                    <div className="space-y-3">
                      <div className="flex items-center gap-2">
                        <div className="h-px flex-1 bg-border/50" />
                        <p className="text-[10px] font-bold uppercase tracking-widest text-muted-foreground px-2">
                          {isForChild ? "Genitore / Acquirente" : "Dati Personali"}
                        </p>
                        <div className="h-px flex-1 bg-border/50" />
                      </div>
                      <div className="grid grid-cols-2 gap-3">
                        <FormField control={form.control} name="purchaserName" render={({ field }) => (
                          <FormItem>
                            <FormLabel className="text-xs">{isForChild ? "Nome e Cognome Genitore *" : "Nome e Cognome *"}</FormLabel>
                            <FormControl><Input placeholder="Mario Rossi" className="h-9 text-sm" {...field} /></FormControl>
                            <FormMessage />
                          </FormItem>
                        )} />
                        <FormField control={form.control} name="purchaserTaxCode" render={({ field }) => (
                          <FormItem>
                            <FormLabel className="text-xs">Codice Fiscale {isForChild ? "Genitore" : ""}</FormLabel>
                            <FormControl><Input placeholder="RSSMRA80A01H501Z" className="uppercase font-mono h-9 text-sm" {...field} /></FormControl>
                            <FormMessage />
                          </FormItem>
                        )} />
                        <FormField control={form.control} name="purchaserEmail" render={({ field }) => (
                          <FormItem>
                            <FormLabel className="text-xs">Email *</FormLabel>
                            <FormControl><Input type="email" placeholder="mario.rossi@email.com" className="h-9 text-sm" {...field} /></FormControl>
                            <FormMessage />
                          </FormItem>
                        )} />
                        <FormField control={form.control} name="purchaserPhone" render={({ field }) => (
                          <FormItem>
                            <FormLabel className="text-xs">Telefono</FormLabel>
                            <FormControl><Input placeholder="+39 340 1234567" className="h-9 text-sm" {...field} /></FormControl>
                            <FormMessage />
                          </FormItem>
                        )} />
                      </div>
                    </div>

                    {/* Student */}
                    {isForChild && (
                      <div className="space-y-3">
                        <div className="flex items-center gap-2">
                          <div className="h-px flex-1 bg-border/50" />
                          <p className="text-[10px] font-bold uppercase tracking-widest text-primary px-2">Dati dello Studente</p>
                          <div className="h-px flex-1 bg-border/50" />
                        </div>
                        <div className="grid grid-cols-2 gap-3">
                          <FormField control={form.control} name="studentFirstName" render={({ field }) => (
                            <FormItem>
                              <FormLabel className="text-xs">Nome *</FormLabel>
                              <FormControl><Input placeholder="Luca" className="h-9 text-sm" {...field} /></FormControl>
                              <FormMessage />
                            </FormItem>
                          )} />
                          <FormField control={form.control} name="studentLastName" render={({ field }) => (
                            <FormItem>
                              <FormLabel className="text-xs">Cognome *</FormLabel>
                              <FormControl><Input placeholder="Rossi" className="h-9 text-sm" {...field} /></FormControl>
                              <FormMessage />
                            </FormItem>
                          )} />
                          <FormField control={form.control} name="studentTaxCode" render={({ field }) => (
                            <FormItem>
                              <FormLabel className="text-xs">Codice Fiscale Studente</FormLabel>
                              <FormControl><Input placeholder="RSSLCU10A01H501Z" className="uppercase font-mono h-9 text-sm" {...field} /></FormControl>
                              <FormMessage />
                            </FormItem>
                          )} />
                          <FormField control={form.control} name="studentBirthDate" render={({ field }) => (
                            <FormItem>
                              <FormLabel className="text-xs">Data di Nascita</FormLabel>
                              <FormControl><Input type="date" className="h-9 text-sm" {...field} /></FormControl>
                              <FormMessage />
                            </FormItem>
                          )} />
                          <FormField control={form.control} name="studentEmail" render={({ field }) => (
                            <FormItem>
                              <FormLabel className="text-xs">Email Studente (opzionale)</FormLabel>
                              <FormControl><Input type="email" placeholder="luca.rossi@email.com" className="h-9 text-sm" {...field} /></FormControl>
                              <FormMessage />
                            </FormItem>
                          )} />
                          <FormField control={form.control} name="studentPhone" render={({ field }) => (
                            <FormItem>
                              <FormLabel className="text-xs">Telefono Studente (opzionale)</FormLabel>
                              <FormControl><Input placeholder="+39 340 9876543" className="h-9 text-sm" {...field} /></FormControl>
                              <FormMessage />
                            </FormItem>
                          )} />
                        </div>
                      </div>
                    )}
                  </div>
                )}

                {/* ── STEP 2 ─────────────────────────────────────────── */}
                {currentStep === 2 && (
                  <div className="p-6 space-y-5">
                    <div className="grid grid-cols-2 gap-3">
                      <FormField control={form.control} name="courseId" render={({ field }) => (
                        <FormItem>
                          <FormLabel className="text-xs font-semibold">Corso dal Catalogo *</FormLabel>
                          <Select onValueChange={(val) => { field.onChange(val); handleCourseChange(val); }} value={field.value}>
                            <FormControl>
                              <SelectTrigger className="cursor-pointer h-9 text-sm">
                                <SelectValue placeholder="Seleziona corso..." />
                              </SelectTrigger>
                            </FormControl>
                            <SelectContent>
                              {coursesList.map((c) => (
                                <SelectItem key={c.id} value={c.id}>{c.nome} (€{c.prezzo})</SelectItem>
                              ))}
                            </SelectContent>
                          </Select>
                          <FormMessage />
                        </FormItem>
                      )} />
                      <FormField control={form.control} name="courseName" render={({ field }) => (
                        <FormItem>
                          <FormLabel className="text-xs font-semibold">Nome Servizio / Corso *</FormLabel>
                          <FormControl><Input placeholder="Es. Inglese B1 Individuale" className="h-9 text-sm" {...field} /></FormControl>
                          <FormMessage />
                        </FormItem>
                      )} />
                    </div>

                    <div className="grid grid-cols-2 gap-5 items-start">
                      {/* Left: course card + lesson preview */}
                      <div>
                        {selectedCourse ? (
                          <div className="p-4 bg-muted/30 rounded-xl border space-y-3">
                            <div className="flex items-start justify-between">
                              <div>
                                <p className="text-sm font-bold text-primary">{selectedCourse.nome}</p>
                                <p className="text-xs text-muted-foreground mt-0.5">{selectedCourse.teacherName || "Staff Atena"}</p>
                              </div>
                              <span className="text-lg font-black font-mono">€{selectedCourse.prezzo}</span>
                            </div>
                            <div className="space-y-1.5 text-xs text-muted-foreground">
                              <div className="flex items-center gap-2">
                                <Clock className="w-3.5 h-3.5 text-primary/60" />
                                <span>{selectedCourse.totalHours || 20}h · {selectedCourse.lessonDurationMinutes || 60} min/lez.</span>
                              </div>
                              <div className="flex items-center gap-2">
                                <CalendarIcon className="w-3.5 h-3.5 text-primary/60" />
                                <span>{formattedScheduleText || "Orario flessibile"}</span>
                              </div>
                            </div>

                            {selectedDateState && isFixedSchedule && previewLessons.length > 0 && (
                              <div className="pt-3 border-t border-border/60 space-y-2">
                                <div className="flex justify-between text-xs text-muted-foreground">
                                  <span>Inizio:</span>
                                  <span className="font-bold font-mono text-foreground">
                                    {format(selectedDateState, "d MMM yyyy", { locale: dateLocale })}
                                  </span>
                                </div>
                                {endDatePreview && (
                                  <div className="flex justify-between text-xs text-muted-foreground">
                                    <span>Fine prevista:</span>
                                    <span className="font-bold font-mono text-foreground">
                                      {format(endDatePreview, "d MMM yyyy", { locale: dateLocale })}
                                    </span>
                                  </div>
                                )}
                                <div>
                                  <p className="text-[10px] font-bold uppercase tracking-wider text-muted-foreground mb-1.5">
                                    Lezioni ({previewLessons.length}):
                                  </p>
                                  <div className="flex flex-wrap gap-1 max-h-24 overflow-y-auto">
                                    {previewLessons.map((l, i) => (
                                      <Badge key={i} variant="secondary" className="text-[10px] font-mono px-1.5 py-0.5 bg-primary/8 border border-primary/15 text-primary">
                                        {format(new Date(l.startsAt), "d MMM", { locale: dateLocale })}
                                      </Badge>
                                    ))}
                                  </div>
                                </div>
                              </div>
                            )}
                          </div>
                        ) : (
                          <div className="h-44 flex flex-col items-center justify-center gap-2 bg-muted/20 border border-dashed rounded-xl text-center px-6">
                            <BookOpen className="w-8 h-8 text-muted-foreground/25" />
                            <p className="text-xs text-muted-foreground">Seleziona un corso per vedere i dettagli e abilitare il calendario.</p>
                          </div>
                        )}
                      </div>

                      {/* Right: calendar */}
                      <div className="space-y-2">
                        <p className="text-xs font-semibold flex items-center gap-1.5">
                          <CalendarIcon className="w-3.5 h-3.5 text-primary" />
                          {isFixedSchedule ? "Data di Inizio *" : "Orario Flessibile"}
                        </p>

                        {!selectedCourse ? (
                          <div className="h-[270px] flex items-center justify-center bg-muted/10 border border-dashed rounded-xl">
                            <p className="text-xs text-muted-foreground text-center px-6">Seleziona prima un corso per abilitare il calendario.</p>
                          </div>
                        ) : isFlexibleSchedule ? (
                          <div className="p-5 bg-amber-500/8 border border-amber-500/20 rounded-xl space-y-2">
                            <div className="flex items-center gap-2 font-semibold text-sm text-amber-700 dark:text-amber-300">
                              <Sparkles className="w-4 h-4 text-amber-500" />
                              Orario Flessibile
                            </div>
                            <p className="text-xs text-muted-foreground">
                              Questo corso non ha giorni fissi. Gli orari verranno concordati direttamente con la scuola dopo la prenotazione.
                            </p>
                          </div>
                        ) : (
                          <div className="border rounded-xl bg-card flex justify-center p-2 shadow-xs">
                            <Calendar
                              mode="single"
                              selected={selectedDateState}
                              onSelect={handleDateSelect}
                              locale={dateLocale}
                              disabled={(date) => {
                                const today = new Date();
                                today.setHours(0, 0, 0, 0);
                                if (date < today) return true;
                                if (isFixedSchedule) return !allowedDays.includes(date.getDay());
                                return date.getDay() === 0 || date.getDay() === 6;
                              }}
                              modifiers={{
                                free: (date) => {
                                  const today = new Date();
                                  today.setHours(0, 0, 0, 0);
                                  if (date < today) return false;
                                  if (isFixedSchedule) return allowedDays.includes(date.getDay());
                                  return date.getDay() !== 0 && date.getDay() !== 6;
                                },
                              }}
                              modifiersClassNames={{
                                free: "bg-primary/10 text-primary font-bold border border-primary/30 rounded-md",
                              }}
                              fixedWeeks
                              className="w-full border-none p-0 bg-transparent"
                            />
                          </div>
                        )}
                      </div>
                    </div>
                  </div>
                )}

                {/* ── STEP 3 ─────────────────────────────────────────── */}
                {currentStep === 3 && (
                  <div className="p-6 space-y-4">
                    {/* Membership Status Informational Card (Automated, no redundant select) */}
                    <div className={`p-4 rounded-xl border flex items-center justify-between ${
                      membershipFeeStatus.paid
                        ? "bg-emerald-500/8 border-emerald-500/20 text-emerald-700 dark:text-emerald-400"
                        : "bg-amber-500/8 border-amber-500/20 text-amber-700 dark:text-amber-400"
                    }`}>
                      <div className="flex items-center gap-2.5">
                        <ShieldCheck className="h-5 w-5 shrink-0" />
                        <div>
                          <p className="text-xs font-bold leading-tight">
                            Quota d'Iscrizione A.A. 2026/2027
                          </p>
                          <p className="text-[11px] opacity-80 mt-0.5">
                            {membershipFeeStatus.paid
                              ? "Quota annuale già saldata per questo studente."
                              : "Quota annuale obbligatoria per nuovi iscritti (€30,00 inclusi nel totale)."}
                          </p>
                        </div>
                      </div>
                      <Badge className={`text-xs font-mono font-bold px-2.5 py-1 shrink-0 ${
                        membershipFeeStatus.paid
                          ? "bg-emerald-500/15 text-emerald-700 dark:text-emerald-300 border-emerald-500/30"
                          : "bg-amber-500/15 text-amber-700 dark:text-amber-300 border-amber-500/30"
                      }`}>
                        {membershipFeeStatus.paid ? "GIÀ SALDATA (€0.00)" : "+€30.00 INCLUSA"}
                      </Badge>
                    </div>

                    {/* Total highlight */}
                    <div className="flex items-center justify-between px-5 py-4 bg-primary/8 border border-primary/20 rounded-xl">
                      <div>
                        <p className="text-xs font-bold uppercase tracking-widest text-primary">Totale Incasso</p>
                        <p className="text-xs text-muted-foreground mt-0.5">
                          €{Number(amountPaid).toFixed(2)} corso + €{Number(registrationFee).toFixed(2)} iscrizione
                        </p>
                      </div>
                      <span className="text-3xl font-black font-mono text-primary">€{totalAmount.toFixed(2)}</span>
                    </div>

                    {/* Payment method, status & scheme */}
                    <div className="grid grid-cols-3 gap-3">
                      <FormField control={form.control} name="billingScheme" render={({ field }) => (
                        <FormItem>
                          <FormLabel className="text-xs font-semibold">Modalità Pagamento</FormLabel>
                          <Select onValueChange={field.onChange} defaultValue={field.value || "full"}>
                            <FormControl>
                              <SelectTrigger className="cursor-pointer h-9"><SelectValue /></SelectTrigger>
                            </FormControl>
                            <SelectContent>
                              <SelectItem value="full">💳 Unica Soluzione</SelectItem>
                              <SelectItem value="per_lesson">⏰ A Lezione (Post-Lezione)</SelectItem>
                            </SelectContent>
                          </Select>
                          <FormMessage />
                        </FormItem>
                      )} />
                      <FormField control={form.control} name="paymentStatus" render={({ field }) => (
                        <FormItem>
                          <FormLabel className="text-xs font-semibold">Stato Pagamento</FormLabel>
                          <Select onValueChange={field.onChange} defaultValue={field.value}>
                            <FormControl>
                              <SelectTrigger className="cursor-pointer h-9"><SelectValue /></SelectTrigger>
                            </FormControl>
                            <SelectContent>
                              <SelectItem value="reserved">Da Saldare (Acconto / Riservato)</SelectItem>
                              <SelectItem value="paid">Pagato (Saldo completo)</SelectItem>
                            </SelectContent>
                          </Select>
                          <FormMessage />
                        </FormItem>
                      )} />
                      <FormField control={form.control} name="paymentMethod" render={({ field }) => (
                        <FormItem>
                          <FormLabel className="text-xs font-semibold">Metodo di Pagamento</FormLabel>
                          <Select onValueChange={field.onChange} defaultValue={field.value}>
                            <FormControl>
                              <SelectTrigger className="cursor-pointer h-9"><SelectValue /></SelectTrigger>
                            </FormControl>
                            <SelectContent>
                              <SelectItem value="cash">💵 Contanti (In sede)</SelectItem>
                              <SelectItem value="pos">💳 POS / Carta (In sede)</SelectItem>
                              <SelectItem value="transfer">🏦 Bonifico Bancario</SelectItem>
                              <SelectItem value="stripe">🔗 Stripe (Online)</SelectItem>
                            </SelectContent>
                          </Select>
                          <FormMessage />
                        </FormItem>
                      )} />
                    </div>

                    {/* B2B Invoice */}
                    <div className="p-4 bg-muted/20 rounded-xl border space-y-3">
                      <FormField control={form.control} name="needsCompanyInvoice" render={({ field }) => (
                        <FormItem className="flex flex-row items-start space-x-3 space-y-0">
                          <FormControl>
                            <Checkbox checked={field.value} onCheckedChange={field.onChange} className="cursor-pointer mt-0.5" />
                          </FormControl>
                          <FormLabel className="text-sm font-semibold cursor-pointer flex items-center gap-1.5">
                            <Receipt className="h-3.5 w-3.5 text-primary" />
                            Fatturazione elettronica aziendale (SDI / PEC)
                          </FormLabel>
                        </FormItem>
                      )} />
                      {needsCompanyInvoice && (
                        <div className="grid grid-cols-2 gap-3 pt-2 border-t border-border/60">
                          <FormField control={form.control} name="sdiCode" render={({ field }) => (
                            <FormItem>
                              <FormLabel className="text-xs">Codice SDI (7 char)</FormLabel>
                              <FormControl><Input placeholder="SUBM70N" maxLength={7} className="uppercase font-mono h-9 text-sm" {...field} /></FormControl>
                              <FormMessage />
                            </FormItem>
                          )} />
                          <FormField control={form.control} name="pecEmail" render={({ field }) => (
                            <FormItem>
                              <FormLabel className="text-xs">Email PEC Aziendale</FormLabel>
                              <FormControl><Input type="email" placeholder="azienda@pec.it" className="h-9 text-sm" {...field} /></FormControl>
                              <FormMessage />
                            </FormItem>
                          )} />
                        </div>
                      )}
                    </div>

                    {/* Notes */}
                    <FormField control={form.control} name="notes" render={({ field }) => (
                      <FormItem>
                        <FormLabel className="text-xs font-semibold">Note per la Segreteria (opzionale)</FormLabel>
                        <FormControl>
                          <Textarea placeholder="Note su accordi, rate, orari particolari..." className="resize-none h-16 text-xs" {...field} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )} />

                    {/* Confirm summary */}
                    <div className="p-3.5 bg-muted/30 rounded-xl border text-xs space-y-2">
                      <p className="font-bold uppercase tracking-wider text-[10px] text-muted-foreground">Riepilogo Ordine</p>
                      <div className="grid grid-cols-2 gap-y-1 gap-x-4 text-muted-foreground">
                        <span>Cliente:</span>
                        <span className="font-semibold text-foreground truncate">{purchaserName || "—"}</span>
                        <span>Corso:</span>
                        <span className="font-semibold text-foreground truncate">{selectedCourse?.nome || "—"}</span>
                        {selectedDateState && (
                          <>
                            <span>Inizio:</span>
                            <span className="font-semibold text-foreground">
                              {format(selectedDateState, "d MMM yyyy", { locale: dateLocale })}
                            </span>
                          </>
                        )}
                        <span>Metodo:</span>
                        <span className="font-semibold text-foreground">{paymentMethodLabel[paymentMethod] || "—"}</span>
                        <span>Stato:</span>
                        <span className={`font-semibold ${paymentStatus === "completed" ? "text-emerald-500" : "text-amber-500"}`}>
                          {paymentStatus === "completed" ? "✓ Saldato" : "⏳ Da saldare"}
                        </span>
                      </div>
                    </div>
                  </div>
                )}

              </div>
            </div>

            {/* ── BOTTOM FOOTER ──────────────────────────────────────── */}
            <div className="flex items-center justify-between px-6 py-3 border-t border-border/60 bg-muted/20 shrink-0">
              <div>
                {currentStep > 1 ? (
                  <Button
                    type="button"
                    variant="ghost"
                    size="sm"
                    onClick={() => setCurrentStep((currentStep - 1) as any)}
                    className="cursor-pointer gap-1.5 text-muted-foreground hover:text-foreground"
                  >
                    <ChevronLeft className="w-4 h-4" />
                    Indietro
                  </Button>
                ) : (
                  <Button type="button" variant="ghost" size="sm" onClick={handleClose} className="cursor-pointer text-muted-foreground">
                    Annulla
                  </Button>
                )}
              </div>

              <div className="flex items-center gap-3">
                {/* Step dots indicator */}
                <div className="flex items-center gap-1.5">
                  {STEPS.map((s) => (
                    <div key={s.id} className={`rounded-full transition-all duration-200 ${
                      currentStep === s.id ? "w-5 h-1.5 bg-primary" : currentStep > s.id ? "w-1.5 h-1.5 bg-emerald-500" : "w-1.5 h-1.5 bg-border"
                    }`} />
                  ))}
                </div>

                {currentStep < 3 ? (
                  <Button
                    type="button"
                    onClick={() => setCurrentStep((currentStep + 1) as any)}
                    className="cursor-pointer gap-1.5 font-medium"
                    size="sm"
                  >
                    {currentStep === 1 ? "Corso & Calendario" : "Pagamento & Recap"}
                    <ArrowRight className="w-4 h-4" />
                  </Button>
                ) : (
                  <Button
                    type="button"
                    onClick={() => form.handleSubmit(onSubmit)()}
                    className="cursor-pointer font-bold gap-1.5"
                    size="sm"
                  >
                    <CheckCheck className="w-4 h-4" />
                    Conferma e Registra (€{totalAmount.toFixed(2)})
                  </Button>
                )}
              </div>
            </div>

          </form>
        </Form>
      </DialogContent>
    </Dialog>
  );
}
