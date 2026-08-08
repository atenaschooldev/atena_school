import { useState, useEffect, useMemo } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { format } from "date-fns";
import { calculateLessonDates, formatCourseScheduleText } from "@atena/utils";
import { useCourses } from "@/features/courses/hooks/use-courses";
import type { Course } from "@/features/courses/types";
import { api } from "@/lib/api";
import type {
  CreateBookingValues,
  ClientItem,
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
  const [membershipFeeStatus, setMembershipFeeStatus] = useState<{ checked: boolean; paid: boolean }>({
    checked: false,
    paid: false,
  });

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

  const computedPurchaserName =
    `${purchaserFirstName || ""} ${purchaserLastName || ""}`.trim() || form.watch("purchaserName") || "";
  const computedStudentName = isForChild
    ? `${studentFirstName || ""} ${studentLastName || ""}`.trim() || "Figlio non specificato"
    : computedPurchaserName || "Cliente non specificato";

  const totalAmount = Number(amountPaid) + Number(registrationFee);

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

  const formattedScheduleText = useMemo(() => {
    return formatCourseScheduleText(allowedDays, selectedCourse?.startTime, selectedCourse?.endTime);
  }, [allowedDays, selectedCourse]);

  useEffect(() => {
    const taxToUse = isForChild ? studentTaxCode?.trim() || null : purchaserTaxCode?.trim() || null;
    const emailToUse = isForChild ? studentEmail?.trim() || null : purchaserEmail?.trim() || null;

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
        const res = await api.get<{ annualFeePaid?: boolean }>(
          `/admin/bookings/check-membership?${query.toString()}`
        );
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

  const applyClientData = (found: any) => {
    if (!found) return;
    setClientFound(true);

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
      if (sName) {
        const [sFirst = "", ...sRest] = sName.trim().split(" ");
        form.setValue("studentFirstName", sFirst);
        form.setValue("studentLastName", sRest.join(" ") || sFirst);
      }
      if (found.studentEmail) {
        form.setValue("studentEmail", found.studentEmail);
      }
      if (found.studentPhone) {
        form.setValue("studentPhone", found.studentPhone);
      }
      if (found.studentTaxCode) {
        form.setValue("studentTaxCode", found.studentTaxCode);
      }
      if (found.studentBirthDate || found.birthDate) {
        form.setValue("studentBirthDate", found.studentBirthDate || found.birthDate || "");
      }
    } else {
      const currentlyIsForChild = form.getValues("isForChild");
      const fullName = found.name || found.purchaserName || found.studentName || "";
      const [first = "", ...rest] = fullName.trim().split(" ");
      const lastName = rest.join(" ");

      if (currentlyIsForChild) {
        if (fullName) {
          form.setValue("studentFirstName", first);
          form.setValue("studentLastName", lastName);
        }
        if (found.email || found.studentEmail || found.purchaserEmail) {
          form.setValue("studentEmail", found.email || found.studentEmail || found.purchaserEmail || "");
        }
        if (found.phone || found.studentPhone || found.purchaserPhone) {
          form.setValue("studentPhone", found.phone || found.studentPhone || found.purchaserPhone || "");
        }
        if (found.taxCode || found.studentTaxCode || found.purchaserTaxCode) {
          form.setValue("studentTaxCode", found.taxCode || found.studentTaxCode || found.purchaserTaxCode || "");
        }
        if (found.birthDate || found.studentBirthDate) {
          form.setValue("studentBirthDate", found.birthDate || found.studentBirthDate || "");
        }
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
      }>(`/admin/bookings/lookup-client?q=${encodeURIComponent(searchQuery.trim())}`);

      setClientFound(res.found);
      if (res.found) {
        applyClientData(res);
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
    membershipFeeStatus,
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
    amountPaid,
    registrationFee,
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
