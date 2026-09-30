import { useState, useEffect, useMemo } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { format } from "date-fns";
import { calculateLessonDates, formatCourseScheduleText, sanitizeTaxCode, parseTaxCode, getCurrentAcademicYear } from "@atena/utils";
import { useCourses } from "@/features/courses/hooks/use-courses";
import { useSchoolProfile } from "@/hooks/use-school-profile";
import type { Course } from "@/features/courses/types";
import { api } from "@/lib/api";
import { toast } from "sonner";
import type {
  CreateBookingValues,
  ClientItem,
  StudentItem,
  SavedStudentItem,
  AppliedPromo,
} from "./types";
import {
  createBookingSchema,
  normalizeScheduleDays,
  getFirstAvailableAllowedDate,
} from "./types";

export interface UseCreateBookingFormProps {
  open: boolean;
  setOpen: (open: boolean) => void;
  onCreateBooking: (values: Record<string, any>) => Promise<unknown>;
}

export function useCreateBookingForm({ open, setOpen, onCreateBooking }: UseCreateBookingFormProps) {
  const [currentStep, setCurrentStep] = useState<1 | 2 | 3>(1);
  const [selectedCourse, setSelectedCourse] = useState<Course | null>(null);
  const [selectedDateState, setSelectedDateState] = useState<Date | undefined>(undefined);

  // Multi-student state
  const [studentsList, setStudentsList] = useState<StudentItem[]>([
    { firstName: "", lastName: "", email: "", phone: "", taxCode: "", birthDate: "", birthPlace: "" },
  ]);
  const [availableSavedStudents, setAvailableSavedStudents] = useState<SavedStudentItem[]>([]);
  const [studentFeeStatuses, setStudentFeeStatuses] = useState<Record<number, { checked: boolean; paid: boolean }>>({
    0: { checked: false, paid: false },
  });

  // Promo code state
  const [promoCodeInput, setPromoCodeInput] = useState("");
  const [appliedPromo, setAppliedPromo] = useState<AppliedPromo | null>(null);
  const [isApplyingPromo, setIsApplyingPromo] = useState(false);
  const [hasActivePromos, setHasActivePromos] = useState(false);

  const [searchQuery, setSearchQuery] = useState("");
  const [isSearchingClient, setIsSearchingClient] = useState(false);
  const [clientFound, setClientFound] = useState<boolean | null>(null);
  const [clientsList, setClientsList] = useState<ClientItem[]>([]);
  const [isLoadingClients, setIsLoadingClients] = useState(false);
  const [isSearchOpen, setIsSearchOpen] = useState(false);

  const [isFinalSubmitRequested, setIsFinalSubmitRequested] = useState(false);
  const [submitting, setSubmitting] = useState(false);

  const { coursesList } = useCourses();

  useEffect(() => {
    if (open) {
      setIsLoadingClients(true);
      api
        .get<Array<any>>("/admin/bookings/clients-list")
        .then((res) => {
          if (Array.isArray(res)) setClientsList(res);
        })
        .catch((err) => console.error("Failed to load clients list:", err))
        .finally(() => setIsLoadingClients(false));

      api
        .get<Array<any>>("/admin/promo-codes")
        .then((res) => {
          if (Array.isArray(res)) {
            setHasActivePromos(res.some((p) => p.is_active));
          }
        })
        .catch((err) => console.error("Failed to check active promo codes:", err));
    }
  }, [open]);

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
      students: [
        { firstName: "", lastName: "", email: "", phone: "", taxCode: "", birthDate: "", birthPlace: "" },
      ],
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
      groupId: "",
      notes: "",
    },
  });

  const isForChild = form.watch("isForChild");
  const purchaserEmail = form.watch("purchaserEmail");
  const purchaserFirstName = form.watch("purchaserFirstName");
  const purchaserLastName = form.watch("purchaserLastName");
  const purchaserPhone = form.watch("purchaserPhone");
  const purchaserTaxCode = form.watch("purchaserTaxCode");

  // Keep single adult student synchronized with purchaser
  useEffect(() => {
    if (!isForChild) {
      const s0: StudentItem = {
        firstName: purchaserFirstName || "",
        lastName: purchaserLastName || "",
        email: purchaserEmail || "",
        phone: purchaserPhone || "",
        taxCode: purchaserTaxCode || "",
        birthDate: form.getValues("studentBirthDate") || "",
        birthPlace: "",
      };
      setStudentsList([s0]);
      form.setValue("students", [s0]);
      form.setValue("studentFirstName", s0.firstName);
      form.setValue("studentLastName", s0.lastName);
      form.setValue("studentEmail", s0.email);
      form.setValue("studentPhone", s0.phone);
      form.setValue("studentTaxCode", s0.taxCode);
    }
  }, [isForChild, purchaserFirstName, purchaserLastName, purchaserEmail, purchaserPhone, purchaserTaxCode, form]);

  // Auto-extract birthDate when adult purchaser taxCode reaches 16 characters
  useEffect(() => {
    if (isForChild) return;
    const parsed = parseTaxCode(purchaserTaxCode);
    if (parsed.birthDate && !form.getValues("studentBirthDate")) {
      form.setValue("studentBirthDate", parsed.birthDate, { shouldValidate: true, shouldDirty: true });
    }
  }, [purchaserTaxCode, isForChild, form]);

  // Manage students array
  const addStudent = () => {
    if (studentsList.length >= 10) return;
    const newStudent: StudentItem = {
      firstName: "",
      lastName: "",
      email: "",
      phone: "",
      taxCode: "",
      birthDate: "",
      birthPlace: "",
    };
    const next = [...studentsList, newStudent];
    setStudentsList(next);
    form.setValue("students", next);
  };

  const removeStudent = (index: number) => {
    if (studentsList.length <= 1) return;
    const next = studentsList.filter((_, i) => i !== index);
    setStudentsList(next);
    form.setValue("students", next);
  };

  const updateStudent = (index: number, field: keyof StudentItem, value: string) => {
    const next = [...studentsList];
    const sanitizedVal = field === "taxCode" ? sanitizeTaxCode(value).slice(0, 16) : value;
    next[index] = { ...next[index], [field]: sanitizedVal };

    // Auto-extract birthDate from Codice Fiscale via parseTaxCode
    if (field === "taxCode") {
      const parsed = parseTaxCode(sanitizedVal);
      if (parsed.birthDate) {
        next[index].birthDate = parsed.birthDate;
        if (index === 0) {
          form.setValue("studentBirthDate", parsed.birthDate, { shouldValidate: true, shouldDirty: true });
        }
      }
    }

    setStudentsList(next);
    form.setValue("students", next);

    if (index === 0) {
      if (field === "firstName") form.setValue("studentFirstName", sanitizedVal);
      if (field === "lastName") form.setValue("studentLastName", sanitizedVal);
      if (field === "email") form.setValue("studentEmail", sanitizedVal);
      if (field === "phone") form.setValue("studentPhone", sanitizedVal);
      if (field === "taxCode") form.setValue("studentTaxCode", sanitizedVal);
      if (field === "birthDate") form.setValue("studentBirthDate", sanitizedVal);
    }
  };

  const onSelectSavedStudent = (saved: SavedStudentItem, targetIndex = 0) => {
    const next = [...studentsList];
    const idx = targetIndex < next.length ? targetIndex : next.length;
    const filledItem: StudentItem = {
      firstName: saved.firstName || next[idx]?.firstName || "",
      lastName: saved.lastName || next[idx]?.lastName || "",
      email: saved.email || next[idx]?.email || "",
      phone: saved.phone || next[idx]?.phone || "",
      taxCode: saved.taxCode || next[idx]?.taxCode || "",
      birthDate: saved.birthDate || next[idx]?.birthDate || "",
      birthPlace: saved.birthPlace || next[idx]?.birthPlace || "",
    };

    if (idx < next.length) {
      next[idx] = filledItem;
    } else {
      next.push(filledItem);
    }

    setStudentsList(next);
    form.setValue("students", next);

    if (idx === 0) {
      form.setValue("studentFirstName", filledItem.firstName);
      form.setValue("studentLastName", filledItem.lastName);
      form.setValue("studentEmail", filledItem.email);
      form.setValue("studentPhone", filledItem.phone);
      form.setValue("studentTaxCode", filledItem.taxCode);
      form.setValue("studentBirthDate", filledItem.birthDate);
    }
  };

  // Check membership fees for each student
  useEffect(() => {
    const activeList = isForChild ? studentsList : [{ taxCode: purchaserTaxCode, email: purchaserEmail }];
    const timers: NodeJS.Timeout[] = [];

    activeList.forEach((st, idx) => {
      const taxToUse = st.taxCode?.trim();
      const emailToUse = st.email?.trim();

      if (!taxToUse || taxToUse.length < 16) {
        setStudentFeeStatuses((prev) => ({
          ...prev,
          [idx]: { checked: false, paid: false },
        }));
        return;
      }

      const t = setTimeout(async () => {
        try {
          const query = new URLSearchParams();
          query.set("taxCode", taxToUse);
          if (emailToUse) query.set("email", emailToUse);
          const res = await api.get<{ annualFeePaid?: boolean }>(
            `/admin/bookings/check-membership?${query.toString()}`
          );
          setStudentFeeStatuses((prev) => ({
            ...prev,
            [idx]: { checked: true, paid: Boolean(res?.annualFeePaid) },
          }));
        } catch (err) {
          console.error(`Failed to check fee for student #${idx}:`, err);
        }
      }, 400);

      timers.push(t);
    });

    return () => {
      timers.forEach((t) => clearTimeout(t));
    };
  }, [studentsList, isForChild, purchaserTaxCode, purchaserEmail]);

  const { profile } = useSchoolProfile();
  const isFeeEnabled = profile?.registration_fee_enabled !== false;
  const feePerStudent = isFeeEnabled
    ? (profile?.registration_fee_eur != null ? Number(profile.registration_fee_eur) : 30)
    : 0;
  const academicYear = profile?.academic_year || getCurrentAcademicYear().academicYear;

  const applyPromoCode = async (overrideCode?: string) => {
    const raw = typeof overrideCode === "string" ? overrideCode : promoCodeInput;
    const code = (raw || "").trim().toUpperCase();
    if (!code) {
      toast.error("Inserisci un codice promozionale valido");
      return;
    }
    setIsApplyingPromo(true);
    try {
      const res = await api.post<{ valid?: boolean; success?: boolean; promo?: any; error?: string }>(
        "/admin/promo-codes/validate",
        {
          code,
          courseId: selectedCourse?.id || undefined,
          coursePrice: (selectedCourse?.prezzo != null ? Number(selectedCourse.prezzo) : 0) * (isForChild ? Math.max(1, studentsList.length) : 1),
          registrationFee: feePerStudent,
          purchaserEmail: purchaserEmail || undefined,
          purchaserTaxCode: purchaserTaxCode || undefined,
        }
      );

      const isValid = Boolean(res?.valid || res?.success);
      if (!isValid || !res?.promo) {
        toast.error(res?.error || "Codice promozionale non valido o scaduto");
        return;
      }

      setAppliedPromo(res.promo);
      form.setValue("promoCode", res.promo.code);
      toast.success(`Promozione "${res.promo.code}" applicata con successo!`);
    } catch (err: any) {
      toast.error(err?.message || "Errore durante la verifica del codice promo");
    } finally {
      setIsApplyingPromo(false);
    }
  };

  const removePromoCode = () => {
    setAppliedPromo(null);
    setPromoCodeInput("");
    form.setValue("promoCode", "");
    toast.info("Codice promozionale rimosso");
  };

  // Recalculate amountPaid and registrationFee with promo discounts
  const courseUnitPrice = selectedCourse?.prezzo != null ? Number(selectedCourse.prezzo) : 0;
  const studentsCount = isForChild ? Math.max(1, studentsList.length) : 1;
  const rawBaseCourseAmount = courseUnitPrice * studentsCount;
  const discountAmount = appliedPromo ? Number(appliedPromo.discountAmount || 0) : 0;
  const computedCourseAmount = Math.max(0, rawBaseCourseAmount - discountAmount);

  const isFeeWaived = Boolean(appliedPromo?.waiveRegistrationFee);
  const computedRegFee = isFeeWaived
    ? 0
    : (isForChild ? studentsList : [studentsList[0]]).reduce((sum, _, idx) => {
        const fee = studentFeeStatuses[idx];
        const isPaid = fee?.checked && fee?.paid;
        return sum + (isPaid ? 0 : feePerStudent);
      }, 0);

  useEffect(() => {
    if (computedCourseAmount > 0) {
      form.setValue("amountPaid", computedCourseAmount);
    }
    form.setValue("registrationFee", computedRegFee);
  }, [computedCourseAmount, computedRegFee, form]);

  const computedPurchaserName =
    `${purchaserFirstName || ""} ${purchaserLastName || ""}`.trim() || form.watch("purchaserName") || "";
  const computedStudentName = isForChild
    ? studentsList.map((s) => `${s.firstName} ${s.lastName}`.trim()).filter(Boolean).join(", ") || "Figli non specificati"
    : computedPurchaserName || "Cliente non specificato";

  const totalAmount = computedCourseAmount + computedRegFee;

  const filteredClients = useMemo(() => {
    if (!searchQuery.trim()) return clientsList.slice(0, 10);
    const q = searchQuery.trim().toLowerCase();
    return clientsList
      .filter((c) => {
        const matchLabel = c.label?.toLowerCase().includes(q);
        const matchName = c.name?.toLowerCase().includes(q);
        const matchTax = c.taxCode?.toLowerCase().includes(q);
        const matchEmail = c.email?.toLowerCase().includes(q);
        const matchPurchaser = c.purchaserName?.toLowerCase().includes(q);
        const matchStudent = c.studentName?.toLowerCase().includes(q);
        return matchLabel || matchName || matchTax || matchEmail || matchPurchaser || matchStudent;
      })
      .slice(0, 15);
  }, [clientsList, searchQuery]);

  const allowedDays = useMemo(() => {
    const parsed = normalizeScheduleDays(selectedCourse?.scheduleDays);
    return parsed.length > 0 ? parsed : [1, 2, 3, 4, 5];
  }, [selectedCourse]);

  const isFlexibleSchedule = selectedCourse?.scheduleType === "flexible";
  const isFixedSchedule = !isFlexibleSchedule;

  const customMaxLessons = useMemo(() => {
    return selectedCourse?.totalLessons ?? null;
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

  const formattedScheduleText = useMemo(() => {
    return formatCourseScheduleText(allowedDays, selectedCourse?.startTime, selectedCourse?.endTime);
  }, [allowedDays, selectedCourse]);

  const handleCourseChange = (courseId: string) => {
    const found = coursesList.find((c) => c.id === courseId);
    if (found) {
      setSelectedCourse(found);
      form.setValue("courseId", found.id);
      form.setValue("courseName", found.nome);
      if (found.prezzo) {
        form.setValue("amountPaid", Number(found.prezzo) * (isForChild ? studentsList.length : 1));
      }

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

  const applyClientData = (found: any) => {
    if (!found) return;
    setClientFound(true);

    if (found.savedStudents && Array.isArray(found.savedStudents) && found.savedStudents.length > 0) {
      setAvailableSavedStudents(found.savedStudents);
    } else {
      setAvailableSavedStudents([]);
    }

    const hasParentAndChild = Boolean(
      found.isForChild ||
        (found.studentName &&
          found.purchaserName &&
          found.studentName.trim().toLowerCase() !== found.purchaserName.trim().toLowerCase())
    );

    if (hasParentAndChild) {
      form.setValue("isForChild", true);
      const pName = found.purchaserName || found.name || "";
      if (pName) {
        const [pFirst = "", ...pRest] = pName.trim().split(" ");
        form.setValue("purchaserFirstName", pFirst);
        form.setValue("purchaserLastName", pRest.join(" ") || pFirst);
        form.setValue("purchaserName", pName);
      }
      if (found.purchaserEmail || found.email) {
        form.setValue("purchaserEmail", found.purchaserEmail || found.email || "");
      }
      if (found.purchaserPhone || found.phone) {
        form.setValue("purchaserPhone", found.purchaserPhone || found.phone || "");
      }
      if (found.purchaserTaxCode || found.taxCode) {
        form.setValue("purchaserTaxCode", found.purchaserTaxCode || found.taxCode || "");
      }

      const sName = found.studentName || "";
      const [sFirst = "", ...sRest] = sName.trim().split(" ");
      const firstChild: StudentItem = {
        firstName: sFirst,
        lastName: sRest.join(" ") || sFirst,
        email: found.studentEmail || "",
        phone: found.studentPhone || "",
        taxCode: found.studentTaxCode || "",
        birthDate: found.studentBirthDate || found.birthDate || "",
        birthPlace: "",
      };

      setStudentsList([firstChild]);
      form.setValue("students", [firstChild]);
      form.setValue("studentFirstName", firstChild.firstName);
      form.setValue("studentLastName", firstChild.lastName);
      form.setValue("studentEmail", firstChild.email);
      form.setValue("studentPhone", firstChild.phone);
      form.setValue("studentTaxCode", firstChild.taxCode);
      form.setValue("studentBirthDate", firstChild.birthDate);
    } else {
      const currentlyIsForChild = form.getValues("isForChild");
      const fullName = found.name || found.purchaserName || found.studentName || "";
      const [first = "", ...rest] = fullName.trim().split(" ");
      const lastName = rest.join(" ");

      if (currentlyIsForChild) {
        const firstChild: StudentItem = {
          firstName: first,
          lastName,
          email: found.email || found.studentEmail || found.purchaserEmail || "",
          phone: found.phone || found.studentPhone || found.purchaserPhone || "",
          taxCode: found.taxCode || found.studentTaxCode || found.purchaserTaxCode || "",
          birthDate: found.birthDate || found.studentBirthDate || "",
          birthPlace: "",
        };
        setStudentsList([firstChild]);
        form.setValue("students", [firstChild]);
        form.setValue("studentFirstName", first);
        form.setValue("studentLastName", lastName);
        form.setValue("studentEmail", firstChild.email);
        form.setValue("studentPhone", firstChild.phone);
        form.setValue("studentTaxCode", firstChild.taxCode);
        form.setValue("studentBirthDate", firstChild.birthDate);
      } else {
        if (fullName) {
          form.setValue("purchaserFirstName", first);
          form.setValue("purchaserLastName", lastName);
          form.setValue("purchaserName", fullName);
        }
        if (found.email || found.purchaserEmail || found.studentEmail) {
          form.setValue("purchaserEmail", found.email || found.purchaserEmail || found.studentEmail || "");
        }
        if (found.phone || found.purchaserPhone || found.studentPhone) {
          form.setValue("purchaserPhone", found.phone || found.purchaserPhone || found.studentPhone || "");
        }
        if (found.taxCode || found.purchaserTaxCode || found.studentTaxCode) {
          form.setValue("purchaserTaxCode", found.taxCode || found.purchaserTaxCode || found.studentTaxCode || "");
        }
      }
    }
  };

  const handleManualLookup = async () => {
    if (!searchQuery.trim()) return;
    setIsSearchingClient(true);
    setClientFound(null);
    setIsSearchOpen(false);
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
        savedStudents?: SavedStudentItem[];
      }>(`/admin/bookings/lookup-client?q=${encodeURIComponent(searchQuery.trim())}`);

      setClientFound(res.found);
      if (res.found) {
        applyClientData(res);
      } else {
        const currentlyIsForChild = form.getValues("isForChild");
        if (currentlyIsForChild) {
          if (searchQuery.includes("@")) updateStudent(0, "email", searchQuery);
          else updateStudent(0, "taxCode", searchQuery);
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
      setStudentsList([
        { firstName: "", lastName: "", email: "", phone: "", taxCode: "", birthDate: "", birthPlace: "" },
      ]);
      setAvailableSavedStudents([]);
      setStudentFeeStatuses({ 0: { checked: false, paid: false } });
      setAppliedPromo(null);
      setPromoCodeInput("");
      setIsFinalSubmitRequested(false);
    }, 200);
  };

  async function onSubmit(data: CreateBookingValues) {
    if (currentStep !== 3 || !isFinalSubmitRequested || submitting) {
      return;
    }
    setIsFinalSubmitRequested(false);
    setSubmitting(true);
    try {
      const fullPurchaserName =
        `${data.purchaserFirstName || ""} ${data.purchaserLastName || ""}`.trim() ||
        data.purchaserName ||
        "Cliente";
      
      const payload = {
        courseId: data.courseId || undefined,
        courseName: data.courseName,
        startDate: data.startDate || undefined,
        purchaserName: fullPurchaserName,
        purchaserEmail: data.purchaserEmail,
        purchaserPhone: data.purchaserPhone || undefined,
        purchaserTaxCode: data.purchaserTaxCode || undefined,
        isForChild: data.isForChild,
        students: data.students && data.students.length > 0 ? data.students : undefined,
        studentName: data.isForChild
          ? data.students?.map((s) => `${s.firstName} ${s.lastName}`).join(", ")
          : fullPurchaserName,
        studentEmail: data.students?.[0]?.email || data.purchaserEmail,
        studentPhone: data.students?.[0]?.phone || data.purchaserPhone || undefined,
        studentTaxCode: data.students?.[0]?.taxCode || data.purchaserTaxCode || undefined,
        studentBirthDate: data.students?.[0]?.birthDate || undefined,
        amountPaid: Number(computedCourseAmount ?? data.amountPaid ?? 0),
        registrationFee: Number(computedRegFee ?? data.registrationFee ?? 0),
        promoCode: appliedPromo?.code || data.promoCode || undefined,
        billingScheme: data.billingScheme || "full",
        paymentStatus: data.paymentStatus,
        paymentMethod: data.paymentMethod,
        groupId: data.groupId || undefined,
        sdiCode: data.needsCompanyInvoice ? data.sdiCode : undefined,
        pecEmail: data.needsCompanyInvoice ? data.pecEmail : undefined,
        notes: data.notes || undefined,
      };
      await onCreateBooking(payload);
      handleClose();
    } catch {
      // Handled in parent
    } finally {
      setSubmitting(false);
    }
  }

  return {
    form,
    currentStep,
    setCurrentStep,
    selectedCourse,
    selectedDateState,
    studentsList,
    availableSavedStudents,
    studentFeeStatuses,
    addStudent,
    removeStudent,
    updateStudent,
    onSelectSavedStudent,
    searchQuery,
    setSearchQuery,
    isSearchingClient,
    clientFound,
    setClientFound,
    clientsList,
    isLoadingClients,
    isSearchOpen,
    setIsSearchOpen,
    submitting,
    isFinalSubmitRequested,
    setIsFinalSubmitRequested,
    coursesList,
    computedPurchaserName,
    computedStudentName,
    amountPaid: computedCourseAmount,
    registrationFee: computedRegFee,
    feePerStudent,
    academicYear,
    isFeeEnabled,
    promoCodeInput,
    setPromoCodeInput,
    appliedPromo,
    isApplyingPromo,
    hasActivePromos,
    applyPromoCode,
    removePromoCode,
    discountAmount,
    totalAmount,
    filteredClients,
    allowedDays,
    isFlexibleSchedule,
    isFixedSchedule,
    previewLessons,
    formattedScheduleText,
    handleCourseChange,
    handleDateSelect,
    applyClientData,
    handleManualLookup,
    handleClose,
    onSubmit,
  };
}

