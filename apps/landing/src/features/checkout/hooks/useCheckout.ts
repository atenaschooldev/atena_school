import { useEffect, useState, useRef } from "react";
import { useRouter } from "@/i18n/routing";
import { useSearchParams } from "next/navigation";
import { useForm, useWatch } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { toast } from "sonner";
import { decodeScheduleSlot, verifySlotSignature } from "@atena/utils";
import { checkoutFormSchema } from "@atena/validators";
import type { CheckoutFormValues, StudentItemInput } from "@atena/validators";
import { getSessionId } from "@/lib/utils";

import type { User } from "@supabase/supabase-js";
import type { CourseItem, UserProfile } from "@atena/api-types";

export type { CheckoutFormValues, StudentItemInput } from "@atena/validators";

export type BookingItem = CourseItem;
import {
  fetchCheckoutItemAction,
  createOrUpdateReservationServerAction,
  initiateStripePaymentAction,
  getCurrentUserAction,
  checkRegistrationFeeStatusAction,
  fetchSystemSettingsAction,
} from "@/app/actions/booking";

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
  const [studentsList, setStudentsList] = useState<Array<{
    firstName: string;
    lastName: string;
    email?: string;
    phone?: string;
    taxCode: string;
    birthDate?: string;
  }>>([
    { firstName: "", lastName: "", email: "", phone: "", taxCode: "", birthDate: "" },
  ]);
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

  useEffect(() => {
    async function initCheckout() {
      try {
        const [itemRes, settingsRes] = await Promise.all([
          fetchCheckoutItemAction(id),
          fetchSystemSettingsAction(),
        ]);

        if (itemRes.success && itemRes.item) {
          setItem(itemRes.item as unknown as BookingItem);
        }

        if (settingsRes?.success) {
          setStripeEnabled(Boolean(settingsRes.stripeEnabled));
        }

        const userRes = await getCurrentUserAction();
        if (userRes.success && userRes.user) {
          const currentUser = userRes.user;
          setUser(currentUser);
          const meta = currentUser.user_metadata || {};
          const fullName = meta.custom_full_name || meta.full_name || `${meta.first_name || ""} ${meta.last_name || ""}`.trim();
          const parts = fullName.split(" ");
          const firstName = meta.first_name || parts[0] || "";
          const lastName = meta.last_name || parts.slice(1).join(" ") || "";
          const phone = meta.phone || currentUser.phone || "";
          const taxCode = meta.tax_code || "";

          const hasPaidFee = userRes.annualFeePaid ?? false;
          setHasPaidAnnualFee(hasPaidFee);
          setFeeCheckStatus(hasPaidFee ? "paid" : "not_paid");

          reset({
            email: currentUser.email || "",
            phone: phone,
            firstName: firstName,
            lastName: lastName,
            taxCode: taxCode,
            purchaserTaxCode: taxCode,
            includeRegistrationFee: !hasPaidFee,
            notes: "",
          });
        }
      } catch (err) {
        console.error("Error initializing checkout:", err);
      } finally {
        setLoading(false);
      }
    }

    initCheckout();
  }, [id, type, reset]);

  const watchedTaxCode = useWatch({ control: formMethods.control, name: "taxCode" });
  const watchedPurchaserTaxCode = useWatch({ control: formMethods.control, name: "purchaserTaxCode" });
  const watchedIsForChild = useWatch({ control: formMethods.control, name: "isForChild" });

  // Sync taxCode when toggling isForChild
  useEffect(() => {
    if (!watchedIsForChild && watchedPurchaserTaxCode && !watchedTaxCode) {
      formMethods.setValue("taxCode", watchedPurchaserTaxCode, { shouldValidate: true });
    }
  }, [watchedIsForChild, watchedPurchaserTaxCode, watchedTaxCode, formMethods]);

  // Keep form's `students` field in sync with studentsList
  useEffect(() => {
    if (watchedIsForChild) {
      formMethods.setValue("students", studentsList as any, { shouldValidate: false });
      if (studentsList.length > 0) {
        formMethods.setValue("studentFirstName", studentsList[0].firstName);
        formMethods.setValue("studentLastName", studentsList[0].lastName);
        formMethods.setValue("taxCode", studentsList[0].taxCode);
        formMethods.setValue("studentEmail", studentsList[0].email);
        formMethods.setValue("studentPhone", studentsList[0].phone);
        formMethods.setValue("studentBirthDate", studentsList[0].birthDate);
      }
    }
  }, [studentsList, watchedIsForChild, formMethods]);

  const addStudent = () => {
    setStudentsList((prev) => [
      ...prev,
      { firstName: "", lastName: "", email: "", phone: "", taxCode: "", birthDate: "" },
    ]);
  };

  const removeStudent = (index: number) => {
    if (studentsList.length <= 1) return;
    setStudentsList((prev) => prev.filter((_, i) => i !== index));
    setStudentFeeStatuses((prev) => {
      const next = { ...prev };
      delete next[index];
      return next;
    });
  };

  const updateStudent = (index: number, field: keyof StudentItemInput, value: string) => {
    setStudentsList((prev) => {
      const next = [...prev];
      next[index] = { ...next[index], [field]: value };
      return next;
    });
  };

  // Check fee status for each student in studentsList
  useEffect(() => {
    if (!watchedIsForChild) return;

    studentsList.forEach((s, idx) => {
      const tax = (s.taxCode || "").trim().toUpperCase();
      if (tax.length < 11) {
        setStudentFeeStatuses((prev) => ({ ...prev, [idx]: "initial" }));
        return;
      }

      setStudentFeeStatuses((prev) => ({ ...prev, [idx]: "checking" }));

      const timer = setTimeout(async () => {
        const res = await checkRegistrationFeeStatusAction({ taxCode: tax });
        if (res.success && res.annualFeePaid) {
          setStudentFeeStatuses((prev) => ({ ...prev, [idx]: "paid" }));
        } else {
          setStudentFeeStatuses((prev) => ({ ...prev, [idx]: "not_paid" }));
        }
      }, 500);

      return () => clearTimeout(timer);
    });
  }, [studentsList, watchedIsForChild]);

  // Single purchaser fee check (when isForChild is false)
  useEffect(() => {
    if (watchedIsForChild) return;

    const targetTaxCode = (watchedTaxCode || watchedPurchaserTaxCode || "").trim();

    if (!targetTaxCode || targetTaxCode.length < 11) {
      setFeeCheckStatus("initial");
      return;
    }

    setFeeCheckStatus("checking");

    const timer = setTimeout(async () => {
      const res = await checkRegistrationFeeStatusAction({ taxCode: targetTaxCode });
      if (res.success && res.annualFeePaid) {
        setHasPaidAnnualFee(true);
        setFeeCheckStatus("paid");
        formMethods.setValue("includeRegistrationFee", false);
      } else {
        setHasPaidAnnualFee(false);
        setFeeCheckStatus("not_paid");
        formMethods.setValue("includeRegistrationFee", true);
      }
    }, 500);

    return () => clearTimeout(timer);
  }, [watchedTaxCode, watchedPurchaserTaxCode, watchedIsForChild, formMethods]);

  const isAnyFeeChecking = watchedIsForChild
    ? Object.values(studentFeeStatuses).some((status) => status === "checking")
    : feeCheckStatus === "checking";

  const effectiveDate = (dateParam && dateParam !== "da_concordare") ? dateParam : undefined;
  const effectiveTime = (timeParam && timeParam !== "da_concordare") ? timeParam : undefined;

  const handleBook = async (values: CheckoutFormValues) => {
    if (!item) {
      toast.error("Servizio non trovato");
      return;
    }

    setSubmitting("book");
    try {
      const sid = getSessionId();
      const res = await createOrUpdateReservationServerAction({
        type,
        id,
        dateParam: effectiveDate || "",
        timeParam: effectiveTime || "",
        values,
        sessionId: sid,
        origin: typeof window !== "undefined" ? window.location.origin : undefined,
      });

      if (!res.success) {
        if ("details" in res && res.details && typeof res.details === "object") {
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

      const bookingId = ("bookingId" in res && res.bookingId) || ("booking" in res && (res.booking as { id?: string })?.id) || "";
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
      const sid = getSessionId();
      const res = await initiateStripePaymentAction({
        type,
        id,
        dateParam: effectiveDate || "",
        timeParam: effectiveTime || "",
        values,
        sessionId: sid,
        origin: typeof window !== "undefined" ? window.location.origin : undefined,
      });

      if (!res.success || !res.url) {
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

      window.location.href = res.url;
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : "Errore durante l'avvio del pagamento";
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
