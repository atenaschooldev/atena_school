"use client";

import { useState, useEffect, useMemo } from "react";
import { Button } from "@/components/ui/button";
import {
  Sheet,
  SheetContent,
  SheetTrigger,
} from "@/components/ui/sheet";
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
  GraduationCap,
  Calendar as CalendarIcon,
  CheckCircle2,
  Search,
  ArrowRight,
  ChevronLeft,
  Loader2,
  BookOpen,
  Clock,
  AlertCircle,
  CheckCheck,
  UserCheck,
  Baby,
} from "lucide-react";
import { useForm } from "react-hook-form";
import { z } from "zod";
import { zodResolver } from "@hookform/resolvers/zod";
import { useCourses } from "@/features/courses/hooks/use-courses";
import { api } from "@/lib/api";
import type { Course } from "@/features/courses/types";
import { calculateLessonDates, formatCourseScheduleText } from "@atena/utils";

function parseDayToNumber(val: any): number | null {
  if (val === null || val === undefined) return null;
  if (typeof val === "number" && !isNaN(val)) {
    return val === 7 ? 0 : val;
  }
  const str = String(val).trim().toLowerCase();
  if (!isNaN(Number(str))) {
    const num = Number(str);
    return num === 7 ? 0 : num;
  }
  if (str.includes("lun")) return 1;
  if (str.includes("mar")) return 2;
  if (str.includes("mer")) return 3;
  if (str.includes("gio")) return 4;
  if (str.includes("ven")) return 5;
  if (str.includes("sab")) return 6;
  if (str.includes("dom")) return 0;
  if (str.includes("mon")) return 1;
  if (str.includes("tue")) return 2;
  if (str.includes("wed")) return 3;
  if (str.includes("thu")) return 4;
  if (str.includes("fri")) return 5;
  if (str.includes("sat")) return 6;
  if (str.includes("sun")) return 0;
  return null;
}

function normalizeScheduleDays(scheduleDays: any): number[] {
  if (!scheduleDays) return [];
  let rawList: any[] = [];
  if (Array.isArray(scheduleDays)) {
    rawList = scheduleDays;
  } else if (typeof scheduleDays === "string") {
    try {
      const parsed = JSON.parse(scheduleDays);
      if (Array.isArray(parsed)) {
        rawList = parsed;
      } else {
        rawList = scheduleDays.split(",");
      }
    } catch {
      rawList = scheduleDays.split(",");
    }
  }
  const mapped = rawList.map(parseDayToNumber).filter((n): n is number => n !== null);
  return Array.from(new Set(mapped));
}

function getFirstAvailableAllowedDate(allowedDays: number[]): Date {
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  for (let i = 0; i < 30; i++) {
    const check = new Date(today);
    check.setDate(today.getDate() + i);
    if (allowedDays.includes(check.getDay())) {
      return check;
    }
  }
  return today;
}

const createBookingSchema = z.object({
  courseId: z.string().optional(),
  courseName: z.string().min(2, { message: "Inserisci il nome del corso." }),
  startDate: z.string().optional(),
  purchaserFirstName: z.string().optional(),
  purchaserLastName: z.string().optional(),
  purchaserName: z.string().optional(),
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
      purchaserFirstName: "",
      purchaserLastName: "",
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
  const purchaserFirstName = form.watch("purchaserFirstName");
  const purchaserLastName = form.watch("purchaserLastName");
  const purchaserTaxCode = form.watch("purchaserTaxCode");
  const studentEmail = form.watch("studentEmail");
  const studentFirstName = form.watch("studentFirstName");
  const studentLastName = form.watch("studentLastName");
  const studentTaxCode = form.watch("studentTaxCode");

  const computedPurchaserName = `${purchaserFirstName || ""} ${purchaserLastName || ""}`.trim() || form.watch("purchaserName") || "";
  const computedStudentName = isForChild
    ? (`${studentFirstName || ""} ${studentLastName || ""}`.trim() || "Figlio non specificato")
    : (computedPurchaserName || "Cliente non specificato");

  const totalAmount = Number(amountPaid) + Number(registrationFee);

  const allowedDays = useMemo(() => {
    const parsed = normalizeScheduleDays(selectedCourse?.scheduleDays);
    return parsed.length > 0 ? parsed : [1, 2, 3, 4, 5];
  }, [selectedCourse]);

  const isFlexibleSchedule = selectedCourse?.scheduleType === "flexible";
  const isFixedSchedule = !isFlexibleSchedule;

  const customMaxLessons = useMemo(() => {
    if (!selectedCourse) return null;
    if (selectedCourse.totalLessons) return selectedCourse.totalLessons;
    if (selectedCourse.lessonsPerWeek && selectedCourse.lessonsPerWeek > 0) {
      return selectedCourse.lessonsPerWeek * 4;
    }
    if (selectedCourse.totalHours && selectedCourse.lessonDurationMinutes) {
      return Math.round((selectedCourse.totalHours * 60) / selectedCourse.lessonDurationMinutes);
    }
    return null;
  }, [selectedCourse]);

  const previewLessons = useMemo(() => {
    if (!selectedDateState || isFlexibleSchedule || allowedDays.length === 0) return [];
    const dateStr = format(selectedDateState, "yyyy-MM-dd");
    const timeStr = selectedCourse?.startTime || "16:00";
    return calculateLessonDates(
      dateStr,
      timeStr,
      selectedCourse?.nome || selectedCourse?.categoria || "",
      allowedDays,
      selectedCourse?.lessonDurationMinutes || 60,
      selectedCourse?.startTime,
      selectedCourse?.endTime,
      selectedCourse?.scheduleType,
      customMaxLessons
    );
  }, [selectedDateState, selectedCourse, allowedDays, isFlexibleSchedule, customMaxLessons]);

  const endDatePreview = selectedDateState ? addMonths(selectedDateState, 1) : null;

  const formattedScheduleText = useMemo(() => {
    return formatCourseScheduleText(allowedDays, selectedCourse?.startTime, selectedCourse?.endTime);
  }, [allowedDays, selectedCourse]);

  useEffect(() => {
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
      form.setValue("courseId", found.id);
      form.setValue("courseName", found.nome);
      if (found.prezzo) form.setValue("amountPaid", Number(found.prezzo));

      const courseAllowedDays = normalizeScheduleDays(found.scheduleDays);
      const validDays = courseAllowedDays.length > 0 ? courseAllowedDays : [1, 2, 3, 4, 5];
      const isFlex = found.scheduleType === "flexible";

      if (!isFlex) {
        const firstDate = getFirstAvailableAllowedDate(validDays);
        setSelectedDateState(firstDate);
        form.setValue("startDate", format(firstDate, "yyyy-MM-dd"));
      } else {
        setSelectedDateState(undefined);
        form.setValue("startDate", "");
      }
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
      setIsFinalSubmitRequested(false);
    }, 200);
  };

  const [isFinalSubmitRequested, setIsFinalSubmitRequested] = useState(false);

  async function onSubmit(data: CreateBookingValues) {
    if (currentStep !== 3 || !isFinalSubmitRequested) {
      return;
    }
    setIsFinalSubmitRequested(false);
    try {
      const fullPurchaserName = `${data.purchaserFirstName || ""} ${data.purchaserLastName || ""}`.trim() || data.purchaserName || "Cliente";
      let finalStudentName = fullPurchaserName;
      if (data.isForChild && (data.studentFirstName || data.studentLastName)) {
        finalStudentName = `${data.studentFirstName || ""} ${data.studentLastName || ""}`.trim();
      }
      const payload = {
        courseId: data.courseId || undefined,
        courseName: data.courseName,
        startDate: data.startDate || undefined,
        purchaserName: fullPurchaserName,
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

  return (
    <Sheet open={open} onOpenChange={(v) => { if (!v) handleClose(); else setOpen(true); }}>
      <SheetTrigger asChild>
        <Button className="cursor-pointer font-medium shadow-sm">
          <Plus className="mr-2 h-4 w-4" />
          Nuova Prenotazione
        </Button>
      </SheetTrigger>

      <SheetContent
        side="right"
        className="w-full sm:max-w-[740px] p-0 flex flex-col h-full border-l border-border/60 bg-background shadow-2xl overflow-hidden"
      >
        <Form {...form}>
          <form
            onSubmit={(e) => {
              e.preventDefault();
              if (isFinalSubmitRequested) {
                form.handleSubmit(onSubmit)(e);
              }
            }}
            onKeyDown={(e) => {
              if (e.key === "Enter") {
                e.preventDefault();
              }
            }}
            className="flex flex-col h-full"
          >
            {/* ── TOP DRAWER HEADER ───────────────────────────────────── */}
            <div className="px-6 pt-5 pb-4 border-b border-border/60 bg-muted/20 shrink-0 space-y-4 pr-14">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-xl bg-primary/10 flex items-center justify-center border border-primary/20 shrink-0">
                  <GraduationCap className="h-5 w-5 text-primary" />
                </div>
                <div>
                  <h2 className="text-base font-bold leading-tight">Nuova Prenotazione in Sede</h2>
                  <p className="text-xs text-muted-foreground">Reception Wizard · Atena School</p>
                </div>
              </div>

              {/* Full-Width Stepper Navigation Tabs */}
              <div className="grid grid-cols-3 gap-2 bg-background p-1.5 rounded-xl border border-border/60 shadow-xs">
                {STEPS.map((s) => {
                  const Icon = s.icon;
                  const isActive = currentStep === s.id;
                  return (
                    <button
                      key={s.id}
                      type="button"
                      onClick={async () => {
                        if (s.id === currentStep) return;
                        if (s.id > 1 && currentStep === 1) {
                          const pName = form.getValues("purchaserFirstName") || form.getValues("purchaserName");
                          const pEmail = form.getValues("purchaserEmail");
                          if (!pName || !pEmail) {
                            form.trigger(["purchaserFirstName", "purchaserLastName", "purchaserEmail"]);
                            return;
                          }
                        }
                        if (s.id > 2 && currentStep === 2) {
                          const courseId = form.getValues("courseId");
                          if (!courseId) {
                            form.trigger("courseName");
                            return;
                          }
                        }
                        setCurrentStep(s.id as 1 | 2 | 3);
                      }}
                      className={`flex items-center justify-center gap-2 py-2 px-3 rounded-lg text-xs font-semibold transition-all cursor-pointer ${
                        isActive
                          ? "bg-primary text-primary-foreground shadow-sm font-bold"
                          : "text-foreground hover:bg-muted font-medium"
                      }`}
                    >
                      <Icon className="w-3.5 h-3.5" />
                      <span>{s.id}. {s.label}</span>
                    </button>
                  );
                })}
              </div>
            </div>

            {/* ── LIVE SUMMARY BAR ────────────────────────────────────── */}
            <div className="px-6 py-3 bg-muted/40 border-b border-border/50 flex items-center justify-between shrink-0">
              <div className="flex items-center gap-4 text-xs">
                <div className="flex items-center gap-1.5">
                  <User className="w-3.5 h-3.5 text-muted-foreground" />
                  <span className="text-muted-foreground font-medium">Cliente: </span>
                  <span className="font-bold text-foreground">
                    {computedPurchaserName || "Non specificato"}
                    {isForChild && <span className="text-primary font-normal"> (Genitore)</span>}
                  </span>
                </div>
                {isForChild && (
                  <div className="border-l pl-4 border-border/60 flex items-center gap-1.5">
                    <Baby className="w-3.5 h-3.5 text-primary" />
                    <span className="text-muted-foreground font-medium">Studente: </span>
                    <span className="font-bold text-foreground">{computedStudentName}</span>
                  </div>
                )}
                {selectedCourse && (
                  <div className="border-l pl-4 border-border/60 flex items-center gap-1.5">
                    <BookOpen className="w-3.5 h-3.5 text-primary" />
                    <span className="text-muted-foreground font-medium">Corso: </span>
                    <span className="font-bold text-foreground">{selectedCourse.nome}</span>
                  </div>
                )}
              </div>

              <div className="flex items-center gap-2">
                <span className="text-xs text-muted-foreground font-medium">Totale:</span>
                <Badge variant="secondary" className="font-mono font-bold text-sm bg-primary/10 text-primary border-primary/20 px-3 py-0.5">
                  €{totalAmount.toFixed(2)}
                </Badge>
              </div>
            </div>

            {/* ── SCROLLABLE DRAWER CONTENT ───────────────────────────── */}
            <div className="flex-1 overflow-y-auto p-6 space-y-6">
              {/* ── STEP 1: CLIENTE & FIGLIO ────────────────────────────── */}
              {currentStep === 1 && (
                <div className="space-y-6">
                  {/* Top Control Bar: Search & Toggle in One Clean Box */}
                  <div className="p-4 bg-muted/20 rounded-2xl border border-border/60 space-y-4">
                    {/* Toggle row */}
                    <FormField
                      control={form.control}
                      name="isForChild"
                      render={({ field }) => (
                        <FormItem className="flex flex-row items-center justify-between p-3.5 bg-background rounded-xl border border-border/50 cursor-pointer">
                          <div className="space-y-0.5">
                            <FormLabel className="text-sm font-bold cursor-pointer flex items-center gap-2">
                              <Baby className="w-4 h-4 text-primary" />
                              Genitore acquista per figlio minorenne
                            </FormLabel>
                            <FormDescription className="text-xs text-muted-foreground">
                              {field.value
                                ? "Abilita la compilazione di Genitore (pagante) + Figlio (studente)."
                                : "L'acquirente coincide con lo studente (cliente adulto)."}
                            </FormDescription>
                          </div>
                          <FormControl>
                            <Checkbox
                              checked={field.value}
                              onCheckedChange={(v) => {
                                const isEnabling = Boolean(v);
                                field.onChange(isEnabling);

                                if (isEnabling) {
                                  // Transfer data from Purchaser -> Student
                                  const pFirst = form.getValues("purchaserFirstName");
                                  const pLast = form.getValues("purchaserLastName");
                                  const pEmail = form.getValues("purchaserEmail");
                                  const pPhone = form.getValues("purchaserPhone");
                                  const pTax = form.getValues("purchaserTaxCode");

                                  if (pFirst || pLast || pEmail || pPhone || pTax) {
                                    if (!form.getValues("studentFirstName")) form.setValue("studentFirstName", pFirst || "");
                                    if (!form.getValues("studentLastName")) form.setValue("studentLastName", pLast || "");
                                    if (!form.getValues("studentEmail")) form.setValue("studentEmail", pEmail || "");
                                    if (!form.getValues("studentPhone")) form.setValue("studentPhone", pPhone || "");
                                    if (!form.getValues("studentTaxCode")) form.setValue("studentTaxCode", pTax || "");

                                    // Clear purchaser fields for parent input
                                    form.setValue("purchaserFirstName", "");
                                    form.setValue("purchaserLastName", "");
                                    form.setValue("purchaserEmail", "");
                                    form.setValue("purchaserPhone", "");
                                    form.setValue("purchaserTaxCode", "");
                                  }
                                } else {
                                  // Transfer data from Student -> Purchaser
                                  const sFirst = form.getValues("studentFirstName");
                                  const sLast = form.getValues("studentLastName");
                                  const sEmail = form.getValues("studentEmail");
                                  const sPhone = form.getValues("studentPhone");
                                  const sTax = form.getValues("studentTaxCode");

                                  if (sFirst || sLast || sEmail || sPhone || sTax) {
                                    if (!form.getValues("purchaserFirstName")) form.setValue("purchaserFirstName", sFirst || "");
                                    if (!form.getValues("purchaserLastName")) form.setValue("purchaserLastName", sLast || "");
                                    if (!form.getValues("purchaserEmail")) form.setValue("purchaserEmail", sEmail || "");
                                    if (!form.getValues("purchaserPhone")) form.setValue("purchaserPhone", sPhone || "");
                                    if (!form.getValues("purchaserTaxCode")) form.setValue("purchaserTaxCode", sTax || "");

                                    // Clear student fields
                                    form.setValue("studentFirstName", "");
                                    form.setValue("studentLastName", "");
                                    form.setValue("studentEmail", "");
                                    form.setValue("studentPhone", "");
                                    form.setValue("studentTaxCode", "");
                                    form.setValue("studentBirthDate", "");
                                  }
                                }

                                setSearchQuery("");
                                setClientFound(null);
                              }}
                              className="w-5 h-5 cursor-pointer"
                            />
                          </FormControl>
                        </FormItem>
                      )}
                    />

                    {/* Search row */}
                    <div className="space-y-2">
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-1.5 text-xs font-bold uppercase tracking-wider text-muted-foreground">
                          <Search className="w-3.5 h-3.5 text-primary" />
                          Cerca {isForChild ? "Figlio / Studente" : "Cliente"} in Anagrafica
                        </div>
                        {clientFound === true && (
                          <span className="text-xs text-emerald-600 dark:text-emerald-400 font-semibold flex items-center gap-1">
                            <CheckCircle2 className="w-3.5 h-3.5" /> Anagrafica trovata
                          </span>
                        )}
                        {clientFound === false && (
                          <span className="text-xs text-amber-600 dark:text-amber-400 font-semibold flex items-center gap-1">
                            <AlertCircle className="w-3.5 h-3.5" /> Nessun risultato
                          </span>
                        )}
                      </div>

                      <div className="flex gap-2">
                        <Input
                          placeholder={
                            isForChild
                              ? "Codice Fiscale, Email o Nome del figlio..."
                              : "Codice Fiscale, Email, Telefono o Nome..."
                          }
                          value={searchQuery}
                          onChange={(e) => setSearchQuery(e.target.value)}
                          onKeyDown={(e) => {
                            if (e.key === "Enter") {
                              e.preventDefault();
                              (e.currentTarget.nextElementSibling as HTMLButtonElement)?.click();
                            }
                          }}
                          className="h-10 text-sm bg-background"
                        />
                        <Button
                          type="button"
                          variant="secondary"
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
                                const currentlyIsForChild = form.getValues("isForChild");
                                if (currentlyIsForChild) {
                                  const sName = res.studentName || res.purchaserName || "";
                                  if (sName) {
                                    const parts = sName.split(" ");
                                    form.setValue("studentFirstName", parts[0] || "");
                                    form.setValue("studentLastName", parts.slice(1).join(" ") || "");
                                  }
                                  if (res.studentEmail || res.purchaserEmail) {
                                    form.setValue("studentEmail", res.studentEmail || res.purchaserEmail || "");
                                  }
                                  if (res.studentPhone || res.purchaserPhone) {
                                    form.setValue("studentPhone", res.studentPhone || res.purchaserPhone || "");
                                  }
                                  if (res.studentTaxCode || res.purchaserTaxCode) {
                                    form.setValue("studentTaxCode", res.studentTaxCode || res.purchaserTaxCode || "");
                                  }
                                  if (res.studentBirthDate) {
                                    form.setValue("studentBirthDate", res.studentBirthDate);
                                  }
                                } else {
                                  if (res.purchaserName) {
                                    const pParts = res.purchaserName.split(" ");
                                    form.setValue("purchaserFirstName", pParts[0] || "");
                                    form.setValue("purchaserLastName", pParts.slice(1).join(" ") || "");
                                    form.setValue("purchaserName", res.purchaserName);
                                  }
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
                                }
                              } else {
                                const currentlyIsForChild = form.getValues("isForChild");
                                if (currentlyIsForChild) {
                                  if (searchQuery.includes("@")) form.setValue("studentEmail", searchQuery);
                                  else form.setValue("studentTaxCode", searchQuery);
                                } else {
                                  if (searchQuery.includes("@")) form.setValue("purchaserEmail", searchQuery);
                                  else form.setValue("purchaserTaxCode", searchQuery);
                                }
                              }
                            } catch (err) {
                              console.error("Lookup error:", err);
                            } finally {
                              setIsSearchingClient(false);
                            }
                          }}
                          className="h-10 px-4 text-xs font-semibold cursor-pointer shrink-0"
                        >
                          {isSearchingClient ? <Loader2 className="w-4 h-4 animate-spin" /> : "Cerca"}
                        </Button>
                      </div>
                    </div>
                  </div>

                  {/* Membership Fee Banner */}
                  {membershipFeeStatus.checked && (
                    <div
                      className={`p-4 rounded-xl border flex items-center justify-between text-xs ${
                        membershipFeeStatus.paid
                          ? "bg-emerald-500/10 border-emerald-500/30 text-emerald-900 dark:text-emerald-300"
                          : "bg-amber-500/10 border-amber-500/30 text-amber-900 dark:text-amber-300"
                      }`}
                    >
                      <div className="flex items-center gap-2.5">
                        {membershipFeeStatus.paid ? (
                          <CheckCircle2 className="w-5 h-5 text-emerald-600 shrink-0" />
                        ) : (
                          <AlertCircle className="w-5 h-5 text-amber-600 shrink-0" />
                        )}
                        <div>
                          <p className="font-bold text-sm">
                            {membershipFeeStatus.paid
                              ? "Quota Associativa A.A. 2026/2027 già saldata"
                              : "Quota Associativa A.A. 2026/2027 da saldare"}
                          </p>
                          <p className="text-xs opacity-90">
                            {membershipFeeStatus.paid
                              ? `L'iscrizione annuale di €30 risulta già pagata per ${isForChild ? "lo studente" : "il cliente"}.`
                              : `Il cliente deve pagare la quota associativa di iscrizione (€30).`}
                          </p>
                        </div>
                      </div>
                      <Badge
                        variant="secondary"
                        className={`font-mono font-bold text-xs px-3 py-1 ${
                          membershipFeeStatus.paid ? "bg-emerald-600 text-white" : "bg-amber-600 text-white"
                        }`}
                      >
                        {membershipFeeStatus.paid ? "€0.00" : "+ €30.00"}
                      </Badge>
                    </div>
                  )}

                  {/* Form Section */}
                  <div className="space-y-5">
                    {/* Genitore / Acquirente Card */}
                    <div className="p-5 bg-muted/20 rounded-2xl border border-border/60 space-y-4">
                      <div className="flex items-center gap-2">
                        <UserCheck className="w-4.5 h-4.5 text-primary" />
                        <h3 className="text-sm font-bold uppercase tracking-wider text-foreground">
                          {isForChild ? "Genitore / Acquirente (Intestatario Pagamenti)" : "Dati Anagrafici Cliente"}
                        </h3>
                      </div>

                      <div className="grid grid-cols-2 gap-3.5">
                        <FormField control={form.control} name="purchaserFirstName" render={({ field }) => (
                          <FormItem>
                            <FormLabel className="text-xs font-semibold">{isForChild ? "Nome Genitore *" : "Nome *"}</FormLabel>
                            <FormControl><Input placeholder="Mario" className="h-10 text-sm bg-background" {...field} /></FormControl>
                            <FormMessage />
                          </FormItem>
                        )} />
                        <FormField control={form.control} name="purchaserLastName" render={({ field }) => (
                          <FormItem>
                            <FormLabel className="text-xs font-semibold">{isForChild ? "Cognome Genitore *" : "Cognome *"}</FormLabel>
                            <FormControl><Input placeholder="Rossi" className="h-10 text-sm bg-background" {...field} /></FormControl>
                            <FormMessage />
                          </FormItem>
                        )} />
                        <FormField control={form.control} name="purchaserEmail" render={({ field }) => (
                          <FormItem>
                            <FormLabel className="text-xs font-semibold">{isForChild ? "Email Genitore *" : "Email *"}</FormLabel>
                            <FormControl><Input type="email" placeholder="mario.rossi@email.com" className="h-10 text-sm bg-background" {...field} /></FormControl>
                            <FormMessage />
                          </FormItem>
                        )} />
                        <FormField control={form.control} name="purchaserPhone" render={({ field }) => (
                          <FormItem>
                            <FormLabel className="text-xs font-semibold">{isForChild ? "Telefono Genitore" : "Telefono"}</FormLabel>
                            <FormControl><Input placeholder="+39 340 1234567" className="h-10 text-sm bg-background" {...field} /></FormControl>
                            <FormMessage />
                          </FormItem>
                        )} />
                        <FormField control={form.control} name="purchaserTaxCode" render={({ field }) => (
                          <FormItem className="col-span-2">
                            <FormLabel className="text-xs font-semibold">Codice Fiscale {isForChild ? "Genitore" : "Cliente"}</FormLabel>
                            <FormControl><Input placeholder="RSSMRA80A01H501Z" className="uppercase font-mono h-10 text-sm bg-background" {...field} /></FormControl>
                            <FormMessage />
                          </FormItem>
                        )} />
                      </div>
                    </div>

                    {/* Studente (Figlio) Card - Only shown when isForChild is true */}
                    {isForChild && (
                      <div className="p-5 bg-primary/5 rounded-2xl border border-primary/20 space-y-4">
                        <div className="flex items-center gap-2">
                          <Baby className="w-4.5 h-4.5 text-primary" />
                          <h3 className="text-sm font-bold uppercase tracking-wider text-primary">
                            Dati dello Studente Minorenne (Figlio)
                          </h3>
                        </div>

                        <div className="grid grid-cols-2 gap-3.5">
                          <FormField control={form.control} name="studentFirstName" render={({ field }) => (
                            <FormItem>
                              <FormLabel className="text-xs font-semibold">Nome Figlio *</FormLabel>
                              <FormControl><Input placeholder="Luca" className="h-10 text-sm bg-background" {...field} /></FormControl>
                              <FormMessage />
                            </FormItem>
                          )} />
                          <FormField control={form.control} name="studentLastName" render={({ field }) => (
                            <FormItem>
                              <FormLabel className="text-xs font-semibold">Cognome Figlio *</FormLabel>
                              <FormControl><Input placeholder="Rossi" className="h-10 text-sm bg-background" {...field} /></FormControl>
                              <FormMessage />
                            </FormItem>
                          )} />
                          <FormField control={form.control} name="studentEmail" render={({ field }) => (
                            <FormItem>
                              <FormLabel className="text-xs font-semibold">Email Figlio (opzionale)</FormLabel>
                              <FormControl><Input type="email" placeholder="luca@email.com" className="h-10 text-sm bg-background" {...field} /></FormControl>
                              <FormMessage />
                            </FormItem>
                          )} />
                          <FormField control={form.control} name="studentPhone" render={({ field }) => (
                            <FormItem>
                              <FormLabel className="text-xs font-semibold">Tel. Figlio (opzionale)</FormLabel>
                              <FormControl><Input placeholder="+39 340 9876543" className="h-10 text-sm bg-background" {...field} /></FormControl>
                              <FormMessage />
                            </FormItem>
                          )} />
                          <FormField control={form.control} name="studentTaxCode" render={({ field }) => (
                            <FormItem>
                              <FormLabel className="text-xs font-semibold">Codice Fiscale Figlio</FormLabel>
                              <FormControl><Input placeholder="RSSLCU10A01H501Z" className="uppercase font-mono h-10 text-sm bg-background" {...field} /></FormControl>
                              <FormMessage />
                            </FormItem>
                          )} />
                          <FormField control={form.control} name="studentBirthDate" render={({ field }) => (
                            <FormItem>
                              <FormLabel className="text-xs font-semibold">Data Nascita Figlio</FormLabel>
                              <FormControl><Input type="date" className="h-10 text-sm bg-background" {...field} /></FormControl>
                              <FormMessage />
                            </FormItem>
                          )} />
                        </div>
                      </div>
                    )}
                  </div>
                </div>
              )}

              {/* ── STEP 2: CORSO & CALENDARIO ─────────────────────────── */}
              {currentStep === 2 && (
                <div className="space-y-5">
                  {/* Select Course Dropdown */}
                  <FormField control={form.control} name="courseId" render={({ field }) => (
                    <FormItem>
                      <FormLabel className="text-xs font-bold uppercase tracking-wider text-muted-foreground">
                        Seleziona Corso dal Catalogo *
                      </FormLabel>
                      <Select onValueChange={(val) => { field.onChange(val); handleCourseChange(val); }} value={field.value}>
                        <FormControl>
                          <SelectTrigger className="cursor-pointer h-11 text-sm bg-background border-border/70 shadow-2xs">
                            <SelectValue placeholder="Scegli un corso dal catalogo..." />
                          </SelectTrigger>
                        </FormControl>
                        <SelectContent>
                          {coursesList.map((c) => (
                            <SelectItem key={c.id} value={c.id} className="cursor-pointer text-sm font-medium">
                              {c.nome} {c.prezzo ? `(€${Number(c.prezzo).toFixed(2)})` : ""}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                      <FormMessage />
                    </FormItem>
                  )} />

                  {/* 1. TOP PANEL: CALENDAR PICKER */}
                  <div className="space-y-2">
                    <FormLabel className="text-xs font-bold uppercase tracking-wider text-muted-foreground block">
                      {isFixedSchedule ? "1. Seleziona Data di Inizio *" : "Orario Flessibile"}
                    </FormLabel>

                    {!selectedCourse ? (
                      <div className="h-44 flex flex-col items-center justify-center bg-muted/10 border border-dashed rounded-2xl p-6 text-center">
                        <BookOpen className="w-8 h-8 text-muted-foreground/30 mb-2" />
                        <p className="text-xs font-semibold text-foreground">Nessun corso selezionato</p>
                        <p className="text-[11px] text-muted-foreground mt-1">Seleziona prima un corso dal catalogo per abilitare il calendario.</p>
                      </div>
                    ) : isFlexibleSchedule ? (
                      <div className="p-5 bg-amber-500/10 border border-amber-500/30 rounded-2xl space-y-2">
                        <div className="flex items-center gap-2 font-bold text-sm text-amber-600 dark:text-amber-300">
                          <Sparkles className="w-4 h-4 text-amber-500" />
                          Orario Flessibile
                        </div>
                        <p className="text-xs text-muted-foreground leading-relaxed">
                          Questo corso non ha giorni fissi. Gli orari verranno concordati direttamente con la scuola dopo la prenotazione.
                        </p>
                      </div>
                    ) : (
                      <div className="p-3 bg-background rounded-2xl border border-border/70 shadow-2xs flex justify-center items-center">
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
                            free: "font-bold text-primary bg-primary/15 border border-primary/25 rounded-lg hover:bg-primary/25",
                          }}
                          fixedWeeks
                          className="rounded-md border-0 p-1"
                        />
                      </div>
                    )}
                  </div>

                  {/* 2. BOTTOM PANEL: COURSE DETAILS & LESSONS BREAKDOWN */}
                  {selectedCourse && (
                    <div className="p-5 bg-gradient-to-br from-card via-card/95 to-muted/20 rounded-2xl border border-border/80 shadow-md space-y-4">
                      {/* Title, Category & Price Header */}
                      <div className="flex items-start justify-between">
                        <div className="space-y-1">
                          <div className="flex items-center gap-2">
                            <Badge variant="outline" className="text-[10px] uppercase tracking-widest font-extrabold bg-primary/10 text-primary border-primary/20 px-2.5 py-0.5 rounded-md">
                              {selectedCourse.categoria || "Corso"}
                            </Badge>
                            <span className="text-xs text-muted-foreground font-semibold flex items-center gap-1">
                              <User className="w-3.5 h-3.5 text-muted-foreground" />
                              {selectedCourse.teacherName || "Staff Atena School"}
                            </span>
                          </div>
                          <h3 className="text-lg font-extrabold text-foreground tracking-tight leading-snug">{selectedCourse.nome}</h3>
                        </div>
                        <Badge className="text-base font-black font-mono bg-primary text-primary-foreground px-3.5 py-1 rounded-xl shadow-xs border-0">
                          €{Number(selectedCourse.prezzo || 0).toFixed(2)}
                        </Badge>
                      </div>

                      {/* Hours & Schedule Info Cards */}
                      <div className="grid grid-cols-2 gap-3 text-xs">
                        <div className="flex items-center gap-2.5 p-3 rounded-xl bg-muted/40 border border-border/50">
                          <Clock className="w-4 h-4 text-primary shrink-0" />
                          <div>
                            <p className="text-[10px] font-bold uppercase tracking-wider text-muted-foreground">Durata e Frequenza</p>
                            <p className="font-semibold text-foreground mt-0.5">
                              {selectedCourse.totalHours ? `${selectedCourse.totalHours} ore totali` : "Corso modulare"} · {selectedCourse.lessonDurationMinutes || 60} min/lez.
                            </p>
                          </div>
                        </div>
                        <div className="flex items-center gap-2.5 p-3 rounded-xl bg-muted/40 border border-border/50">
                          <CalendarIcon className="w-4 h-4 text-primary shrink-0" />
                          <div>
                            <p className="text-[10px] font-bold uppercase tracking-wider text-muted-foreground">Orari & Giorni</p>
                            <p className="font-semibold text-foreground mt-0.5">
                              {formattedScheduleText || "Orario flessibile"}
                            </p>
                          </div>
                        </div>
                      </div>

                      {/* Start Date & Lessons Breakdown */}
                      {selectedDateState && isFixedSchedule && (
                        <div className="space-y-3.5 text-xs pt-1">
                          <div className="flex justify-between items-center bg-primary/10 p-3 rounded-xl border border-primary/25">
                            <span className="text-primary font-bold flex items-center gap-2">
                              <CalendarIcon className="w-4 h-4 text-primary" />
                              Data Inizio Corso:
                            </span>
                            <span className="font-extrabold text-primary font-mono text-sm">
                              {format(selectedDateState, "dd MMMM yyyy", { locale: dateLocale })}
                            </span>
                          </div>

                          {previewLessons.length > 0 && (
                            <div className="space-y-2">
                              <div className="flex items-center justify-between text-[11px] text-muted-foreground font-bold uppercase tracking-wider">
                                <span>Calendario Lezioni Generato</span>
                                <Badge variant="outline" className="text-[10px] font-mono font-bold bg-background text-foreground px-2 py-0.5">
                                  {previewLessons.length} lezioni
                                </Badge>
                              </div>
                              <div className="flex flex-wrap gap-2">
                                {previewLessons.map((l, i) => (
                                  <Badge
                                    key={i}
                                    variant="secondary"
                                    className="text-xs font-mono px-2.5 py-1 bg-muted/40 hover:bg-primary/10 border border-border/60 text-foreground transition-all flex items-center gap-1.5 rounded-lg"
                                  >
                                    <span className="text-[10px] font-bold text-primary bg-primary/15 px-1.5 py-0.2 rounded font-mono">
                                      #{i + 1}
                                    </span>
                                    <span className="font-semibold">
                                      {l.startsAt ? format(new Date(l.startsAt), "EEE d MMM", { locale: dateLocale }) : l.date}
                                    </span>
                                  </Badge>
                                ))}
                              </div>
                            </div>
                          )}
                        </div>
                      )}
                    </div>
                  )}
                </div>
              )}

              {/* ── STEP 3: PAGAMENTO & RIEPILOGO ──────────────────────── */}
              {currentStep === 3 && (
                <div className="space-y-6">
                  {/* Riepilogo Totale Box */}
                  <div className="p-5 bg-gradient-to-br from-primary/10 via-muted/30 to-muted/20 rounded-2xl border border-primary/20 space-y-3">
                    <h3 className="text-xs font-bold uppercase tracking-wider text-primary">Riepilogo Importi</h3>
                    <div className="space-y-2 text-sm">
                      <div className="flex justify-between text-muted-foreground">
                        <span>Quota Corso:</span>
                        <span className="font-mono font-medium text-foreground">€{amountPaid.toFixed(2)}</span>
                      </div>
                      <div className="flex justify-between text-muted-foreground">
                        <span>Quota Iscrizione (Annual Fee):</span>
                        <span className="font-mono font-medium text-foreground">€{registrationFee.toFixed(2)}</span>
                      </div>
                      <div className="flex justify-between items-center pt-2 border-t border-border/60 text-base font-bold">
                        <span className="text-foreground">Totale Incasso:</span>
                        <span className="font-mono text-primary text-lg">€{totalAmount.toFixed(2)}</span>
                      </div>
                    </div>
                  </div>

                  {/* Payment Options */}
                  <div className="grid grid-cols-2 gap-4">
                    <FormField control={form.control} name="paymentStatus" render={({ field }) => (
                      <FormItem>
                        <FormLabel className="text-xs font-bold uppercase tracking-wider text-muted-foreground">
                          Stato Pagamento *
                        </FormLabel>
                        <Select onValueChange={field.onChange} value={field.value}>
                          <FormControl>
                            <SelectTrigger className="cursor-pointer h-10 text-sm bg-background">
                              <SelectValue placeholder="Seleziona stato..." />
                            </SelectTrigger>
                          </FormControl>
                          <SelectContent>
                            <SelectItem value="completed">Saldato Integrale</SelectItem>
                            <SelectItem value="reserved">Acconto / Prenotato</SelectItem>
                            <SelectItem value="pending">In Attesa di Saldare</SelectItem>
                          </SelectContent>
                        </Select>
                        <FormMessage />
                      </FormItem>
                    )} />

                    <FormField control={form.control} name="paymentMethod" render={({ field }) => (
                      <FormItem>
                        <FormLabel className="text-xs font-bold uppercase tracking-wider text-muted-foreground">
                          Metodo di Pagamento *
                        </FormLabel>
                        <Select onValueChange={field.onChange} value={field.value}>
                          <FormControl>
                            <SelectTrigger className="cursor-pointer h-10 text-sm bg-background">
                              <SelectValue placeholder="Seleziona metodo..." />
                            </SelectTrigger>
                          </FormControl>
                          <SelectContent>
                            <SelectItem value="cash">Contanti in Sede</SelectItem>
                            <SelectItem value="card">Carta / POS in Sede</SelectItem>
                            <SelectItem value="bank_transfer">Bonifico Bancario</SelectItem>
                          </SelectContent>
                        </Select>
                        <FormMessage />
                      </FormItem>
                    )} />
                  </div>

                  {/* Billing Scheme Option */}
                  <FormField control={form.control} name="billingScheme" render={({ field }) => (
                    <FormItem>
                      <FormLabel className="text-xs font-bold uppercase tracking-wider text-muted-foreground">
                        Piano Oneri / Rateizzazione
                      </FormLabel>
                      <Select onValueChange={field.onChange} value={field.value}>
                        <FormControl>
                          <SelectTrigger className="cursor-pointer h-10 text-sm bg-background">
                            <SelectValue placeholder="Seleziona piano..." />
                          </SelectTrigger>
                        </FormControl>
                        <SelectContent>
                          <SelectItem value="full">Soluzione Unica</SelectItem>
                          <SelectItem value="installments_2">2 Rate (50% + 50%)</SelectItem>
                          <SelectItem value="monthly">Abbonamento Mensile</SelectItem>
                        </SelectContent>
                      </Select>
                    </FormItem>
                  )} />

                  {/* Company Invoice SDI/PEC Option */}
                  <div className="p-4 bg-muted/20 rounded-xl border border-border/60 space-y-3">
                    <FormField control={form.control} name="needsCompanyInvoice" render={({ field }) => (
                      <FormItem className="flex items-center space-x-2 space-y-0 cursor-pointer">
                        <FormControl>
                          <Checkbox checked={field.value} onCheckedChange={field.onChange} className="w-4 h-4 cursor-pointer" />
                        </FormControl>
                        <FormLabel className="text-xs font-bold cursor-pointer">Richiede Fattura Elettronica Aziendale (SDI/PEC)</FormLabel>
                      </FormItem>
                    )} />

                    {needsCompanyInvoice && (
                      <div className="grid grid-cols-2 gap-3 pt-2">
                        <FormField control={form.control} name="sdiCode" render={({ field }) => (
                          <FormItem>
                            <FormLabel className="text-xs">Codice SDI (7 car.)</FormLabel>
                            <FormControl><Input placeholder="SUBM70N" className="h-9 text-xs bg-background uppercase font-mono" {...field} /></FormControl>
                            <FormMessage />
                          </FormItem>
                        )} />
                        <FormField control={form.control} name="pecEmail" render={({ field }) => (
                          <FormItem>
                            <FormLabel className="text-xs">Email PEC Aziendale</FormLabel>
                            <FormControl><Input type="email" placeholder="azienda@pec.it" className="h-9 text-xs bg-background" {...field} /></FormControl>
                            <FormMessage />
                          </FormItem>
                        )} />
                      </div>
                    )}
                  </div>

                  {/* Notes Field */}
                  <FormField control={form.control} name="notes" render={({ field }) => (
                    <FormItem>
                      <FormLabel className="text-xs font-bold uppercase tracking-wider text-muted-foreground">
                        Note Interne Reception (Opzionale)
                      </FormLabel>
                      <FormControl>
                        <Textarea placeholder="Eventuali note su sconto concordato, orari particolari..." className="bg-background min-h-[80px] text-sm" {...field} />
                      </FormControl>
                    </FormItem>
                  )} />
                </div>
              )}
            </div>

            {/* ── STICKY FOOTER ACTIONS ───────────────────────────────── */}
            <div className="px-6 py-4 border-t border-border/60 bg-muted/30 flex items-center justify-between shrink-0">
              <Button
                type="button"
                variant="ghost"
                onClick={() => {
                  if (currentStep > 1) setCurrentStep((prev) => (prev - 1) as 1 | 2);
                  else handleClose();
                }}
                className="cursor-pointer text-xs font-semibold"
              >
                {currentStep > 1 ? <ChevronLeft className="mr-1 h-4 w-4" /> : null}
                {currentStep > 1 ? "Indietro" : "Annulla"}
              </Button>

              {currentStep < 3 ? (
                <Button
                  type="button"
                  onClick={() => {
                    if (currentStep === 1) {
                      const pName = form.getValues("purchaserFirstName") || form.getValues("purchaserName");
                      const pEmail = form.getValues("purchaserEmail");
                      if (!pName || !pEmail) {
                        form.trigger(["purchaserFirstName", "purchaserLastName", "purchaserEmail"]);
                        return;
                      }
                      setCurrentStep(2);
                    } else if (currentStep === 2) {
                      const courseId = form.getValues("courseId");
                      if (!courseId) {
                        form.trigger("courseName");
                        return;
                      }
                      setCurrentStep(3);
                    }
                  }}
                  className="cursor-pointer text-xs font-bold px-5"
                >
                  {currentStep === 1 ? "Corso & Calendario" : "Procedi al Pagamento"}
                  <ArrowRight className="ml-1.5 h-4 w-4" />
                </Button>
              ) : (
                <Button
                  type="button"
                  onClick={() => {
                    setIsFinalSubmitRequested(true);
                    form.handleSubmit(onSubmit)();
                  }}
                  className="cursor-pointer text-xs font-bold bg-primary text-primary-foreground px-6"
                >
                  Conferma e Salva Prenotazione
                  <CheckCheck className="ml-1.5 h-4 w-4" />
                </Button>
              )}
            </div>
          </form>
        </Form>
      </SheetContent>
    </Sheet>
  );
}
