"use client";

import { useEffect, useState, useRef, useMemo } from "react";
import { useRouter } from "@/i18n/routing";
import { useSearchParams } from "next/navigation";
import { useForm, useWatch, type FieldPath } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { toast } from "sonner";
import { decodeScheduleSlot, verifySlotSignature, sanitizeTaxCode, extractBirthDateFromTaxCode } from "@atena/utils";
import { checkoutFormSchema, isValidCodiceFiscale } from "@atena/validators";
import type { CheckoutFormValues, StudentItemInput } from "@atena/validators";
import { getSessionId } from "@/lib/utils";

import type { User } from "@supabase/supabase-js";
import { BillingScheme, CourseBillingType, type CourseItem, type UserProfile } from "@atena/api-types";

export type { CheckoutFormValues, StudentItemInput } from "@atena/validators";
export type BookingItem = CourseItem;

import { createClient } from "@/lib/supabase/client";
import { api } from "@/lib/api";

export { checkoutFormSchema as checkoutSchema } from "@atena/validators";
import { FeeCheckStatus, SubmitAction } from "@/constants";
export { FeeCheckStatus, SubmitAction };

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
  const [feeCheckStatus, setFeeCheckStatus] = useState<FeeCheckStatus>(FeeCheckStatus.INITIAL);
  const [studentFeeStatuses, setStudentFeeStatuses] = useState<Record<number, FeeCheckStatus>>({
    0: FeeCheckStatus.INITIAL,
  });
  const [item, setItem] = useState<BookingItem | null>(null);
  const [loading, setLoading] = useState(true);
  const [stripeEnabled, setStripeEnabled] = useState(false);
  const [subscriptionsEnabled, setSubscriptionsEnabled] = useState(false);
  const [billingScheme, setBillingScheme] = useState<BillingScheme>(BillingScheme.FULL);
  const [submitting, setSubmitting] = useState<false | SubmitAction>(false);
  const [user, setUser] = useState<User | UserProfile | null>(null);
  const actionRef = useRef<SubmitAction>(SubmitAction.BOOK);
  const idempotencyKeyRef = useRef<string>(
    typeof crypto !== "undefined" && typeof crypto.randomUUID === "function"
      ? crypto.randomUUID()
      : `req_${Date.now()}_${Math.random().toString(36).substring(2, 9)}`
  );

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
          api.courses.getById(id).catch(() => ({ success: false, item: undefined })),
          api.settings.getPaymentGateway().catch(() => ({ success: false, settings: { stripeEnabled: false, subscriptionsEnabled: false } })),
        ]);

        let fetchedItem: BookingItem | null = null;
        if (itemRes.success && itemRes.item) {
          fetchedItem = itemRes.item as unknown as BookingItem;
          setItem(fetchedItem);
        }

        if (settingsRes?.success && settingsRes.settings) {
          setStripeEnabled(Boolean(settingsRes.settings.stripeEnabled));
          const subsEnabled = Boolean(settingsRes.settings.subscriptionsEnabled);
          setSubscriptionsEnabled(subsEnabled);

          // If course is strictly subscription-only and subscriptions are enabled, default to subscription
          if (subsEnabled && fetchedItem && Number(fetchedItem.billing_type) === CourseBillingType.SUBSCRIPTION_ONLY) {
            setBillingScheme(BillingScheme.SUBSCRIPTION);
          }
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
            includeRegistrationFee: true,
            students: draftValues?.students && draftValues.students.length > 0
              ? draftValues.students
              : [{ firstName: "", lastName: "", email: "", phone: "", taxCode: "", birthDate: "" }],
            needsCompanyInvoice: draftValues?.needsCompanyInvoice ?? false,
            sdiCode: draftValues?.sdiCode || "",
            pecEmail: draftValues?.pecEmail || "",
            notes: draftValues?.notes || "",
          });
        } else if (draftValues) {
          reset({
            ...formMethods.getValues(),
            ...draftValues,
            includeRegistrationFee: true,
          });
        }
      } catch (err: unknown) {
        console.error("initCheckout error:", err);
      } finally {
        setLoading(false);
      }
    }

    initCheckout();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [id, DRAFT_STORAGE_KEY]);

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
  const studentsList: StudentItemInput[] = useMemo(() => (watchedStudents as StudentItemInput[]) || [], [watchedStudents]);

  // Sync taxCode when toggling isForChild
  useEffect(() => {
    if (!watchedIsForChild && watchedPurchaserTaxCode && !watchedTaxCode) {
      formMethods.setValue("taxCode", watchedPurchaserTaxCode, { shouldValidate: false });
    }
  }, [watchedIsForChild, watchedPurchaserTaxCode, watchedTaxCode, formMethods]);

  const addStudent = () => {
    const current = formMethods.getValues("students") || [];
    formMethods.setValue(
      "students",
      [
        ...current,
        { firstName: "", lastName: "", taxCode: "", email: "", phone: "", birthDate: "" },
      ],
      { shouldValidate: false, shouldDirty: true }
    );
  };

  const removeStudent = (index: number) => {
    const current = formMethods.getValues("students") || [];
    formMethods.setValue(
      "students",
      current.filter((_, i) => i !== index),
      { shouldValidate: false, shouldDirty: true }
    );
  };

  const updateStudent = (index: number, field: keyof StudentItemInput, value: string) => {
    const current = formMethods.getValues("students") || [];
    const updated = [...current];
    if (updated[index]) {
      let finalVal = value;
      if (field === "taxCode") {
        finalVal = sanitizeTaxCode(value).slice(0, 16);
      }
      updated[index] = { ...updated[index], [field]: finalVal };

      // Auto-extract birthDate from CF if not already filled
      if (field === "taxCode" && finalVal.length === 16 && !updated[index].birthDate) {
        const extractedBirth = extractBirthDateFromTaxCode(finalVal);
        if (extractedBirth) {
          updated[index].birthDate = extractedBirth;
          formMethods.clearErrors(`students.${index}.birthDate` as FieldPath<CheckoutFormValues>);
          if (index === 0) {
            formMethods.setValue("studentBirthDate", extractedBirth, { shouldValidate: false, shouldDirty: true });
            formMethods.clearErrors("studentBirthDate");
          }
        }
      }

      formMethods.setValue("students", updated, { shouldValidate: false, shouldDirty: true });

      // Clear errors on the field currently being typed into
      formMethods.clearErrors(`students.${index}.${field}` as FieldPath<CheckoutFormValues>);

      if (index === 0) {
        if (field === "firstName") {
          formMethods.setValue("studentFirstName", finalVal, { shouldValidate: false, shouldDirty: true });
          formMethods.clearErrors("studentFirstName");
        }
        if (field === "lastName") {
          formMethods.setValue("studentLastName", finalVal, { shouldValidate: false, shouldDirty: true });
          formMethods.clearErrors("studentLastName");
        }
        if (field === "birthDate") {
          formMethods.setValue("studentBirthDate", finalVal, { shouldValidate: false, shouldDirty: true });
          formMethods.clearErrors("studentBirthDate");
        }
        if (field === "taxCode") {
          formMethods.setValue("taxCode", finalVal, { shouldValidate: false, shouldDirty: true });
          formMethods.clearErrors("taxCode");
        }
        if (field === "email") {
          formMethods.setValue("studentEmail", finalVal, { shouldValidate: false, shouldDirty: true });
          formMethods.clearErrors("studentEmail");
        }
        if (field === "phone") {
          formMethods.setValue("studentPhone", finalVal, { shouldValidate: false, shouldDirty: true });
          formMethods.clearErrors("studentPhone");
        }
      }
    }
  };

  const feeCacheRef = useRef<Map<string, boolean>>(new Map());
  const singleReqSeqRef = useRef<number>(0);
  const studentReqSeqRef = useRef<Record<number, number>>({});

  const studentTaxCodesKey = (studentsList || [])
    .map((s) => sanitizeTaxCode(s.taxCode))
    .join(",");

  // Check fee status for each student in studentsList (when isForChild is true)
  useEffect(() => {
    if (!watchedIsForChild) return;

    const timers: NodeJS.Timeout[] = [];

    studentsList.forEach((s, idx) => {
      const tax = sanitizeTaxCode(s.taxCode);

      // Only check when fully valid Codice Fiscale (16 chars or 11 digits)
      if (!isValidCodiceFiscale(tax)) {
        setStudentFeeStatuses((prev) => (prev[idx] === FeeCheckStatus.INITIAL ? prev : { ...prev, [idx]: FeeCheckStatus.INITIAL }));
        return;
      }

      // Check cache first to avoid duplicate network calls
      if (feeCacheRef.current.has(tax)) {
        const isPaid = Boolean(feeCacheRef.current.get(tax));
        setStudentFeeStatuses((prev) => ({ ...prev, [idx]: isPaid ? FeeCheckStatus.PAID : FeeCheckStatus.NOT_PAID }));
        return;
      }

      setStudentFeeStatuses((prev) => (prev[idx] === FeeCheckStatus.CHECKING ? prev : { ...prev, [idx]: FeeCheckStatus.CHECKING }));

      const currentSeq = (studentReqSeqRef.current[idx] || 0) + 1;
      studentReqSeqRef.current[idx] = currentSeq;

      const timer = setTimeout(async () => {
        try {
          const res = await api.checkout.checkFee(tax);
          if (studentReqSeqRef.current[idx] !== currentSeq) return; // Ignore stale responses

          const isPaid = Boolean(res.success && res.annualFeePaid);
          feeCacheRef.current.set(tax, isPaid);
          setStudentFeeStatuses((prev) => ({ ...prev, [idx]: isPaid ? FeeCheckStatus.PAID : FeeCheckStatus.NOT_PAID }));
        } catch {
          if (studentReqSeqRef.current[idx] !== currentSeq) return;
          setStudentFeeStatuses((prev) => ({ ...prev, [idx]: FeeCheckStatus.NOT_PAID }));
        }
      }, 300);

      timers.push(timer);
    });

    return () => {
      timers.forEach((t) => clearTimeout(t));
    };
  }, [studentTaxCodesKey, watchedIsForChild, studentsList]);

  // Single purchaser fee check (when isForChild is false)
  useEffect(() => {
    if (watchedIsForChild) return;

    const targetTaxCode = sanitizeTaxCode(watchedTaxCode || watchedPurchaserTaxCode);

    // Auto-extract birthDate for purchaser when taxCode reaches 16 characters and birthDate is empty
    if (targetTaxCode.length === 16 && !formMethods.getValues("studentBirthDate")) {
      const extractedBirth = extractBirthDateFromTaxCode(targetTaxCode);
      if (extractedBirth) {
        formMethods.setValue("studentBirthDate", extractedBirth, { shouldValidate: true, shouldDirty: true });
        formMethods.clearErrors("studentBirthDate");
      }
    }

    // Only check when fully valid Codice Fiscale (16 chars or 11 digits)
    if (!isValidCodiceFiscale(targetTaxCode)) {
      setFeeCheckStatus(FeeCheckStatus.INITIAL);
      return;
    }

    // Check cache first to avoid duplicate network calls
    if (feeCacheRef.current.has(targetTaxCode)) {
      const isPaid = Boolean(feeCacheRef.current.get(targetTaxCode));
      setHasPaidAnnualFee(isPaid);
      setFeeCheckStatus(isPaid ? FeeCheckStatus.PAID : FeeCheckStatus.NOT_PAID);
      formMethods.setValue("includeRegistrationFee", !isPaid);
      return;
    }

    setFeeCheckStatus(FeeCheckStatus.CHECKING);
    const currentSeq = ++singleReqSeqRef.current;

    const timer = setTimeout(async () => {
      try {
        const res = await api.checkout.checkFee(targetTaxCode);
        if (singleReqSeqRef.current !== currentSeq) return; // Ignore stale response

        const isPaid = Boolean(res.success && res.annualFeePaid);
        feeCacheRef.current.set(targetTaxCode, isPaid);
        setHasPaidAnnualFee(isPaid);
        setFeeCheckStatus(isPaid ? FeeCheckStatus.PAID : FeeCheckStatus.NOT_PAID);
        formMethods.setValue("includeRegistrationFee", !isPaid);
      } catch {
        if (singleReqSeqRef.current !== currentSeq) return;
        setFeeCheckStatus(FeeCheckStatus.NOT_PAID);
      }
    }, 300);

    return () => clearTimeout(timer);
  }, [watchedTaxCode, watchedPurchaserTaxCode, watchedIsForChild, formMethods]);

  const isAnyFeeChecking = watchedIsForChild
    ? Object.values(studentFeeStatuses).some((status) => status === FeeCheckStatus.CHECKING)
    : feeCheckStatus === FeeCheckStatus.CHECKING;

  const effectiveDate = (dateParam && !isNaN(Date.parse(dateParam))) ? dateParam : undefined;
  const effectiveTime = (timeParam && /^\d{1,2}:\d{2}/.test(timeParam)) ? timeParam : undefined;

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
      billingScheme: subscriptionsEnabled ? billingScheme : BillingScheme.FULL,
      idempotencyKey: idempotencyKeyRef.current,
    };
  };

  const handleBook = async (values: CheckoutFormValues) => {
    if (!item) {
      toast.error("Service not found");
      return;
    }

    setSubmitting(SubmitAction.BOOK);
    try {
      const payload = buildReservationPayload(values);
      const res = await api.checkout.reserve(payload as unknown as Record<string, unknown>);

      if (!res.success) {
        toast.error(res.error || "Reservation failed");
        return;
      }

      const bookingId = res.bookingId || res.booking?.id || "";
      clearDraft();
      toast.success("Reservation completed successfully!");
      router.push(`/checkout/success?booking_id=${bookingId}&email=${encodeURIComponent(values.email)}`);

    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : "Unexpected error occurred";
      toast.error(msg);
    } finally {
      setSubmitting(false);
    }
  };

  const handlePay = async (values: CheckoutFormValues) => {
    if (!item) {
      toast.error("Service not found");
      return;
    }

    setSubmitting(SubmitAction.PAY);
    try {
      const payload = buildReservationPayload(values);
      const res = await api.checkout.createStripeSession(payload as unknown as Record<string, unknown>);

      if (!res.success || !res.url) {
        toast.error(res.error || "Failed to initialize Stripe checkout session");
        return;
      }

      clearDraft();
      window.location.href = res.url;
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : "Unexpected error occurred";
      toast.error(msg);
    } finally {
      setSubmitting(false);
    }
  };

  const onSubmit = (values: CheckoutFormValues) => {
    if (feeCheckStatus === FeeCheckStatus.CHECKING || isAnyFeeChecking) {
      toast.info("Checking membership fee status, please wait a moment...");
      return;
    }
    if (actionRef.current === SubmitAction.PAY) {
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
    subscriptionsEnabled,
    billingScheme,
    setBillingScheme,
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
