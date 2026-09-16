import { useEffect, useState, useRef } from "react";
import { useRouter } from "@/i18n/routing";
import { useSearchParams } from "next/navigation";
import { useForm, useWatch } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { toast } from "sonner";
import { decodeScheduleSlot, verifySlotSignature } from "@atena/utils";
import { checkoutFormSchema, isValidCodiceFiscale } from "@atena/validators";
import type { CheckoutFormValues, StudentItemInput } from "@atena/validators";
import { getSessionId } from "@/lib/utils";

import type { User } from "@supabase/supabase-js";
import type { CourseItem, UserProfile } from "@atena/api-types";

export type { CheckoutFormValues, StudentItemInput } from "@atena/validators";
export type BookingItem = CourseItem;

import { createClient } from "@/lib/supabase/client";

export { checkoutFormSchema as checkoutSchema } from "@atena/validators";

export type SubmitAction = "book" | "pay";
export type FeeCheckStatus = "initial" | "checking" | "paid" | "not_paid";

export function useCheckout(typeOrId: string, optionalId?: string) {
  const router = useRouter();
  const searchParams = useSearchParams();

  const type = optionalId ? typeOrId : "course";
  const id = optionalId ? optionalId : typeOrId;

  const dateParam = searchParams.get("date");
  const daysParam = searchParams.get("days");
  const rawTimeParam = searchParams.get("time");
  const sigParam = searchParams.get("sig");

  const isSigValid = sigParam ? verifySlotSignature(id, dateParam, daysParam, rawTimeParam, sigParam) : true;
  const timeParam = isSigValid
    ? decodeScheduleSlot(daysParam, rawTimeParam, rawTimeParam)
    : decodeScheduleSlot(null, null, null);

  const [hasPaidAnnualFee, setHasPaidAnnualFee] = useState(false);
  const [feeCheckStatus, setFeeCheckStatus] = useState<FeeCheckStatus>("initial");
  const [studentFeeStatuses, setStudentFeeStatuses] = useState<Record<number, FeeCheckStatus>>({
    0: "initial",
  });
  const [item, setItem] = useState<BookingItem | null>(null);
  const [loading, setLoading] = useState(true);
  const [stripeEnabled, setStripeEnabled] = useState(false);
  const [submitting, setSubmitting] = useState<false | "book" | "pay">(false);
  const [user, setUser] = useState<User | UserProfile | null>(null);
  const actionRef = useRef<SubmitAction>("book");

  const formMethods = useForm<CheckoutFormValues>({
    resolver: zodResolver(checkoutFormSchema as never),
    defaultValues: {
      firstName: "",
      lastName: "",
      email: "",
      phone: "",
      purchaserTaxCode: "",
      isForChild: false,
      students: [
        { firstName: "", lastName: "", email: "", phone: "", taxCode: "", birthDate: "" },
      ],
      studentFirstName: "",
      studentLastName: "",
      studentEmail: "",
      studentPhone: "",
      studentBirthDate: "",
      taxCode: "",
      needsCompanyInvoice: false,
      sdiCode: "",
      pecEmail: "",
      includeRegistrationFee: true,
      notes: "",
    },
  });

  const { reset } = formMethods;
  const initFetchedRef = useRef<string | null>(null);
  const DRAFT_STORAGE_KEY = `atena_checkout_draft_${id}`;

  const clearDraft = () => {
    if (typeof window !== "undefined") {
      try {
        sessionStorage.removeItem(DRAFT_STORAGE_KEY);
      } catch {
        // Safe failover
      }
    }
  };

  useEffect(() => {
    if (initFetchedRef.current === id) return;
    initFetchedRef.current = id;

    async function initCheckout() {
      try {
        const [itemRes, settingsRes] = await Promise.all([
          fetch(`/api/landing/courses/${id}`).then((r) => r.json()).catch(() => ({ success: false })),
          fetch('/api/landing/settings/payment-gateway').then((r) => r.json()).catch(() => ({ success: false })),
        ]);

        if (itemRes.success && (itemRes.item || itemRes.course)) {
          setItem((itemRes.item || itemRes.course) as unknown as BookingItem);
        }

        if (settingsRes?.success && settingsRes.settings) {
          setStripeEnabled(Boolean(settingsRes.settings.stripeEnabled));
        }

        let draftValues: Partial<CheckoutFormValues> | null = null;
        if (typeof window !== "undefined") {
          try {
            const raw = sessionStorage.getItem(DRAFT_STORAGE_KEY);
            if (raw) {
              draftValues = JSON.parse(raw);
            }
          } catch {
            draftValues = null;
          }
        }

        const supabase = createClient();
        const { data: { user: currentUser } } = await supabase.auth.getUser();
        if (currentUser) {
          setUser(currentUser);
          const meta = currentUser.user_metadata || {};
          const fullName = meta.custom_full_name || meta.full_name || `${meta.first_name || ""} ${meta.last_name || ""}`.trim();
          const parts = fullName.split(" ");
          const firstName = draftValues?.firstName || meta.first_name || parts[0] || "";
          const lastName = draftValues?.lastName || meta.last_name || parts.slice(1).join(" ") || "";
          const phone = draftValues?.phone || meta.phone || currentUser.phone || "";
          const taxCode = draftValues?.taxCode || meta.tax_code || "";

          let hasPaidFee = false;
          if (taxCode && isValidCodiceFiscale(taxCode)) {
            try {
              const feeRes = await fetch("/api/landing/checkout/check-fee", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ taxCode }),
              }).then((r) => r.json());
              hasPaidFee = Boolean(feeRes.annualFeePaid);
            } catch {
              hasPaidFee = false;
            }
          }

          setHasPaidAnnualFee(hasPaidFee);
          setFeeCheckStatus(hasPaidFee ? "paid" : "not_paid");

          reset({
            firstName,
            lastName,
            email: draftValues?.email || currentUser.email || "",
            phone,
            taxCode,
            purchaserTaxCode: draftValues?.purchaserTaxCode || taxCode,
            isForChild: draftValues?.isForChild ?? false,
            studentFirstName: draftValues?.studentFirstName || "",
            studentLastName: draftValues?.studentLastName || "",
            studentEmail: draftValues?.studentEmail || "",
            studentPhone: draftValues?.studentPhone || "",
            studentBirthDate: draftValues?.studentBirthDate || "",
            includeRegistrationFee: draftValues?.includeRegistrationFee ?? !hasPaidFee,
            students: draftValues?.students && draftValues.students.length > 0
              ? draftValues.students
              : [{ firstName: "", lastName: "", email: "", phone: "", taxCode: "", birthDate: "" }],
            needsCompanyInvoice: draftValues?.needsCompanyInvoice ?? false,
            sdiCode: draftValues?.sdiCode || "",
            pecEmail: draftValues?.pecEmail || "",
            notes: draftValues?.notes || "",
          });
        } else if (draftValues) {
          const targetTax = draftValues.isForChild
            ? draftValues.purchaserTaxCode
            : (draftValues.taxCode || draftValues.purchaserTaxCode);

          let hasPaidFee = false;
          if (targetTax && isValidCodiceFiscale(targetTax)) {
            try {
              const feeRes = await fetch("/api/landing/checkout/check-fee", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ taxCode: targetTax }),
              }).then((r) => r.json());
              hasPaidFee = Boolean(feeRes.annualFeePaid);
            } catch {
              hasPaidFee = false;
            }
          }

          setHasPaidAnnualFee(hasPaidFee);
          setFeeCheckStatus(hasPaidFee ? "paid" : "not_paid");

          reset({
            ...formMethods.getValues(),
            ...draftValues,
            includeRegistrationFee: draftValues.includeRegistrationFee ?? !hasPaidFee,
          });
        }
      } catch (err: unknown) {
        console.error("initCheckout error:", err);
      } finally {
        setLoading(false);
      }
    }

    initCheckout();
  }, [id, DRAFT_STORAGE_KEY, formMethods]);

  // BigTech pattern: debounced auto-save form draft to sessionStorage
  useEffect(() => {
    if (typeof window === "undefined" || !id) return;

    let timer: NodeJS.Timeout;

    const subscription = formMethods.watch((values) => {
      clearTimeout(timer);
      timer = setTimeout(() => {
        const hasData = Boolean(
          values.firstName ||
          values.lastName ||
          values.email ||
          values.phone ||
          values.taxCode ||
          values.purchaserTaxCode ||
          (values.students && values.students.some((s) => s?.firstName || s?.lastName || s?.taxCode || s?.email))
        );

        try {
          if (hasData) {
            sessionStorage.setItem(DRAFT_STORAGE_KEY, JSON.stringify(values));
          }
        } catch {
          // Safe failover
        }
      }, 300);
    });

    return () => {
      clearTimeout(timer);
      subscription.unsubscribe();
    };
  }, [formMethods, id, DRAFT_STORAGE_KEY]);

  const watchedTaxCode = useWatch({ control: formMethods.control, name: "taxCode" });
  const watchedPurchaserTaxCode = useWatch({ control: formMethods.control, name: "purchaserTaxCode" });
  const watchedIsForChild = useWatch({ control: formMethods.control, name: "isForChild" });
  const watchedStudents = useWatch({ control: formMethods.control, name: "students" });
  const studentsList = watchedStudents || [];

  // Sync taxCode when toggling isForChild
  useEffect(() => {
    if (!watchedIsForChild && watchedPurchaserTaxCode && !watchedTaxCode) {
      formMethods.setValue("taxCode", watchedPurchaserTaxCode, { shouldValidate: true });
    }
  }, [watchedIsForChild, watchedPurchaserTaxCode, watchedTaxCode, formMethods]);

  const addStudent = () => {
    const current = formMethods.getValues("students") || [];
    formMethods.setValue("students", [
      ...current,
      { firstName: "", lastName: "", taxCode: "", email: "", phone: "", birthDate: "" },
    ]);
  };

  const removeStudent = (index: number) => {
    const current = formMethods.getValues("students") || [];
    formMethods.setValue(
      "students",
      current.filter((_, i) => i !== index)
    );
  };

  const updateStudent = (index: number, field: keyof StudentItemInput, value: string) => {
    const current = formMethods.getValues("students") || [];
    const updated = [...current];
    if (updated[index]) {
      updated[index] = { ...updated[index], [field]: value };
      formMethods.setValue("students", updated, { shouldValidate: true });
      if (index === 0) {
        if (field === "firstName") formMethods.setValue("studentFirstName", value, { shouldValidate: true });
        if (field === "lastName") formMethods.setValue("studentLastName", value, { shouldValidate: true });
        if (field === "birthDate") formMethods.setValue("studentBirthDate", value, { shouldValidate: true });
        if (field === "taxCode") formMethods.setValue("taxCode", value, { shouldValidate: true });
      }
    }
  };

  const feeCacheRef = useRef<Map<string, boolean>>(new Map());

  const studentTaxCodesKey = (studentsList || [])
    .map((s) => (s.taxCode || "").trim().toUpperCase())
    .join(",");

  // Check fee status for each student in studentsList (when isForChild is true)
  useEffect(() => {
    if (!watchedIsForChild) return;

    const timers: NodeJS.Timeout[] = [];

    studentsList.forEach((s, idx) => {
      const tax = (s.taxCode || "").trim().toUpperCase();

      // Only check when fully valid Codice Fiscale (16 chars or 11 digits)
      if (!isValidCodiceFiscale(tax)) {
        setStudentFeeStatuses((prev) => (prev[idx] === "initial" ? prev : { ...prev, [idx]: "initial" }));
        return;
      }

      // Check cache first to avoid duplicate network calls
      if (feeCacheRef.current.has(tax)) {
        const isPaid = Boolean(feeCacheRef.current.get(tax));
        setStudentFeeStatuses((prev) => ({ ...prev, [idx]: isPaid ? "paid" : "not_paid" }));
        return;
      }

      setStudentFeeStatuses((prev) => (prev[idx] === "checking" ? prev : { ...prev, [idx]: "checking" }));

      const timer = setTimeout(async () => {
        try {
          const res = await fetch("/api/landing/checkout/check-fee", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ taxCode: tax }),
          }).then((r) => r.json());

          const isPaid = Boolean(res.success && res.annualFeePaid);
          feeCacheRef.current.set(tax, isPaid);
          setStudentFeeStatuses((prev) => ({ ...prev, [idx]: isPaid ? "paid" : "not_paid" }));
        } catch {
          setStudentFeeStatuses((prev) => ({ ...prev, [idx]: "not_paid" }));
        }
      }, 400);

      timers.push(timer);
    });

    return () => {
      timers.forEach((t) => clearTimeout(t));
    };
  }, [studentTaxCodesKey, watchedIsForChild]);

  // Single purchaser fee check (when isForChild is false)
  useEffect(() => {
    if (watchedIsForChild) return;

    const targetTaxCode = (watchedTaxCode || watchedPurchaserTaxCode || "").trim().toUpperCase();

    // Only check when fully valid Codice Fiscale (16 chars or 11 digits)
    if (!isValidCodiceFiscale(targetTaxCode)) {
      setFeeCheckStatus("initial");
      return;
    }

    // Check cache first to avoid duplicate network calls
    if (feeCacheRef.current.has(targetTaxCode)) {
      const isPaid = Boolean(feeCacheRef.current.get(targetTaxCode));
      setHasPaidAnnualFee(isPaid);
      setFeeCheckStatus(isPaid ? "paid" : "not_paid");
      formMethods.setValue("includeRegistrationFee", !isPaid);
      return;
    }

    setFeeCheckStatus("checking");

    const timer = setTimeout(async () => {
      try {
        const res = await fetch("/api/landing/checkout/check-fee", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ taxCode: targetTaxCode }),
        }).then((r) => r.json());

        const isPaid = Boolean(res.success && res.annualFeePaid);
        feeCacheRef.current.set(targetTaxCode, isPaid);
        setHasPaidAnnualFee(isPaid);
        setFeeCheckStatus(isPaid ? "paid" : "not_paid");
        formMethods.setValue("includeRegistrationFee", !isPaid);
      } catch {
        setFeeCheckStatus("not_paid");
      }
    }, 400);

    return () => clearTimeout(timer);
  }, [watchedTaxCode, watchedPurchaserTaxCode, watchedIsForChild, formMethods]);

  const isAnyFeeChecking = watchedIsForChild
    ? Object.values(studentFeeStatuses).some((status) => status === "checking")
    : feeCheckStatus === "checking";

  const effectiveDate = (dateParam && dateParam !== "da_concordare") ? dateParam : undefined;
  const effectiveTime = (timeParam && timeParam !== "da_concordare") ? timeParam : undefined;

  const buildReservationPayload = (values: CheckoutFormValues) => {
    const isForChild = Boolean(values.isForChild);
    const purchaserTaxCode = (values.purchaserTaxCode || values.taxCode || "").trim().toUpperCase();
    const studentTaxCode = isForChild 
      ? (values.taxCode || "").trim().toUpperCase() 
      : purchaserTaxCode;

    return {
      itemId: id,
      itemType: type,
      date: effectiveDate,
      time: effectiveTime,
      firstName: (values.firstName || "").trim(),
      lastName: (values.lastName || "").trim(),
      email: (values.email || "").trim().toLowerCase(),
      phone: (values.phone || "").trim(),
      purchaserTaxCode: purchaserTaxCode,
      isForChild: isForChild,
      studentFirstName: isForChild ? (values.studentFirstName || "").trim() : undefined,
      studentLastName: isForChild ? (values.studentLastName || "").trim() : undefined,
      studentEmail: isForChild ? (values.studentEmail || "").trim().toLowerCase() : undefined,
      studentPhone: isForChild ? (values.studentPhone || "").trim() : undefined,
      studentTaxCode: studentTaxCode,
      studentBirthDate: isForChild ? values.studentBirthDate : undefined,
      students: isForChild && studentsList.length > 0 ? studentsList : undefined,
      includeRegistrationFee: Boolean(values.includeRegistrationFee),
      notes: values.notes || undefined,
      needsCompanyInvoice: Boolean(values.needsCompanyInvoice),
      sdiCode: values.sdiCode || undefined,
      pecEmail: values.pecEmail || undefined,
    };
  };

  const handleBook = async (values: CheckoutFormValues) => {
    if (!item) {
      toast.error("Servizio non trovato");
      return;
    }

    setSubmitting("book");
    try {
      const payload = buildReservationPayload(values);
      const response = await fetch("/api/landing/checkout/reserve", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });

      const res = await response.json();

      if (!response.ok || !res.success) {
        if (res.details && typeof res.details === "object") {
          Object.entries(res.details).forEach(([field, msgs]) => {
            if (Array.isArray(msgs) && msgs.length > 0) {
              formMethods.setError(field as keyof CheckoutFormValues, {
                type: "server",
                message: msgs[0],
              });
            }
          });
        }
        toast.error(res.error || "Errore durante la prenotazione");
        return;
      }

      const bookingId = res.bookingId || res.booking?.id || (res.bookingIds && res.bookingIds[0]) || "";
      clearDraft();
      toast.success("Prenotazione completata con successo!");
      router.push(`/checkout/success/${bookingId}`);
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : "Errore imprevisto";
      toast.error(msg);
    } finally {
      setSubmitting(false);
    }
  };

  const handlePay = async (values: CheckoutFormValues) => {
    if (!item) {
      toast.error("Servizio non trovato");
      return;
    }

    setSubmitting("pay");
    try {
      const payload = buildReservationPayload(values);
      const response = await fetch("/api/landing/checkout/stripe-session", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });

      const res = await response.json();

      if (!response.ok || !res.success || !res.url) {
        if (res.details && typeof res.details === "object") {
          Object.entries(res.details).forEach(([field, msgs]) => {
            if (Array.isArray(msgs) && msgs.length > 0) {
              formMethods.setError(field as keyof CheckoutFormValues, {
                type: "server",
                message: msgs[0],
              });
            }
          });
        }
        toast.error(res.error || "Impossibile avviare il pagamento con Stripe");
        return;
      }

      clearDraft();
      window.location.href = res.url;
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : "Errore imprevisto";
      toast.error(msg);
    } finally {
      setSubmitting(false);
    }
  };

  const onSubmit = (values: CheckoutFormValues) => {
    if (feeCheckStatus === "checking" || isAnyFeeChecking) {
      toast.info("Verifica della quota associativa in corso, attendere un istante...");
      return;
    }
    if (actionRef.current === "pay") {
      handlePay(values);
    } else {
      handleBook(values);
    }
  };

  return {
    formMethods,
    item,
    loading,
    stripeEnabled,
    submitting,
    hasPaidAnnualFee,
    feeCheckStatus,
    isAnyFeeChecking,
    studentsList,
    studentFeeStatuses,
    addStudent,
    removeStudent,
    updateStudent,
    user,
    dateParam,
    timeParam,
    actionRef,
    onSubmit,
  };
}
