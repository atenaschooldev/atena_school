import { useEffect, useState, useRef } from "react";
import { useRouter } from "@/i18n/routing";
import { useSearchParams } from "next/navigation";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { toast } from "sonner";
import { decodeScheduleSlot, verifySlotSignature } from "@atena/utils";
import { getSessionId } from "@/lib/utils";

export interface CheckoutFormValues {
  firstName: string;
  lastName: string;
  email: string;
  phone: string;
  purchaserTaxCode?: string;
  isForChild?: boolean;
  studentFirstName?: string;
  studentLastName?: string;
  studentEmail?: string;
  studentPhone?: string;
  studentBirthDate?: string;
  taxCode: string;
  needsCompanyInvoice?: boolean;
  sdiCode?: string;
  pecEmail?: string;
  includeRegistrationFee?: boolean;
  notes?: string;
}

export interface BookingItem {
  id: string;
  slug?: string;
  name?: string;
  title_it?: string;
  price: string | number;
  description_it?: string;
  image_url?: string;
  photo_url?: string;
  category?: string;
  teacher_name?: string;
}
import {
  fetchCheckoutItemAction,
  createOrUpdateReservationServerAction,
  initiateStripePaymentAction,
  getCurrentUserAction,
  checkRegistrationFeeStatusAction,
  fetchSystemSettingsAction,
} from "@/app/actions/booking";

export const checkoutSchema = z.object({
  firstName: z.string().min(2, "Il nome deve avere almeno 2 caratteri"),
  lastName: z.string().min(2, "Il cognome deve avere almeno 2 caratteri"),
  email: z.string().email("Inserisci un indirizzo email valido"),
  phone: z.string().min(6, "Inserisci un numero di telefono valido"),
  purchaserTaxCode: z.string().optional(),
  isForChild: z.boolean().optional(),
  studentFirstName: z.string().optional(),
  studentLastName: z.string().optional(),
  studentEmail: z.string().email("Inserisci un indirizzo email valido per lo studente").optional().or(z.literal("")),
  studentPhone: z.string().optional(),
  studentBirthDate: z.string().optional(),
  taxCode: z.string().min(11, "Il Codice Fiscale dello studente è obbligatorio (almeno 11 caratteri)"),
  needsCompanyInvoice: z.boolean().optional(),
  sdiCode: z.string().optional(),
  pecEmail: z.string().email("Inserisci un indirizzo email PEC valido").optional().or(z.literal("")),
  includeRegistrationFee: z.boolean().optional(),
  notes: z.string().optional(),
}).superRefine((data, ctx) => {
  if (data.isForChild) {
    if (!data.studentFirstName || data.studentFirstName.trim().length < 2) {
      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        path: ["studentFirstName"],
        message: "Il nome dello studente è obbligatorio",
      });
    }
    if (!data.studentLastName || data.studentLastName.trim().length < 2) {
      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        path: ["studentLastName"],
        message: "Il cognome dello studente è obbligatorio",
      });
    }
    if (!data.purchaserTaxCode || data.purchaserTaxCode.trim().length < 11) {
      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        path: ["purchaserTaxCode"],
        message: "Il Codice Fiscale del genitore/acquirente è obbligatorio per la fattura",
      });
    }
  }
  if (data.needsCompanyInvoice) {
    if (!data.sdiCode && !data.pecEmail) {
      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        path: ["sdiCode"],
        message: "Inserisci il Codice SDI (7 caratteri) o l'email PEC per la fatturazione elettronica",
      });
    }
  }
});

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
  const [item, setItem] = useState<BookingItem | null>(null);
  const [loading, setLoading] = useState(true);
  const [stripeEnabled, setStripeEnabled] = useState(false);
  const [submitting, setSubmitting] = useState<false | "book" | "pay">(false);
  const [user, setUser] = useState<any>(null);
  const actionRef = useRef<SubmitAction>("book");

  const formMethods = useForm<CheckoutFormValues>({
    resolver: zodResolver(checkoutSchema as any),
    defaultValues: {
      firstName: "",
      lastName: "",
      email: "",
      phone: "",
      purchaserTaxCode: "",
      isForChild: false,
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
          setItem(itemRes.item);
        }

        if (settingsRes?.success) {
          setStripeEnabled(Boolean(settingsRes.stripeEnabled));
        }

        const userRes = await getCurrentUserAction();
        if (userRes.success && (userRes as any).user) {
          const currentUser = (userRes as any).user;
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

  const watchedEmail = formMethods.watch("email");
  const watchedPhone = formMethods.watch("phone");
  const watchedTaxCode = formMethods.watch("taxCode");
  const watchedPurchaserTaxCode = formMethods.watch("purchaserTaxCode");
  const watchedStudentEmail = formMethods.watch("studentEmail");
  const watchedStudentPhone = formMethods.watch("studentPhone");
  const watchedIsForChild = formMethods.watch("isForChild");

  // Sync taxCode when toggling isForChild
  useEffect(() => {
    if (!watchedIsForChild && watchedPurchaserTaxCode && !watchedTaxCode) {
      formMethods.setValue("taxCode", watchedPurchaserTaxCode, { shouldValidate: true });
    }
  }, [watchedIsForChild, watchedPurchaserTaxCode, watchedTaxCode, formMethods]);

  useEffect(() => {
    const targetTaxCode = watchedIsForChild ? (watchedTaxCode || "") : (watchedTaxCode || watchedPurchaserTaxCode || "");
    const targetEmail = watchedIsForChild ? (watchedStudentEmail || watchedEmail || "") : watchedEmail;
    const targetPhone = watchedIsForChild ? (watchedStudentPhone || watchedPhone || "") : watchedPhone;

    const hasValidInput = (targetTaxCode && targetTaxCode.trim().length >= 11) ||
                          (targetEmail && targetEmail.includes("@")) ||
                          (targetPhone && targetPhone.trim().length >= 8);

    if (!hasValidInput) {
      setFeeCheckStatus("initial");
      return;
    }

    setFeeCheckStatus("checking");

    const timer = setTimeout(async () => {
      const res = await checkRegistrationFeeStatusAction({ email: targetEmail, phone: targetPhone, taxCode: targetTaxCode });
      if (res.success && res.annualFeePaid) {
        setHasPaidAnnualFee(true);
        setFeeCheckStatus("paid");
        formMethods.setValue("includeRegistrationFee", false);
      } else {
        setHasPaidAnnualFee(false);
        setFeeCheckStatus("not_paid");
        formMethods.setValue("includeRegistrationFee", stripeEnabled);
      }
    }, 500);

    return () => clearTimeout(timer);
  }, [watchedEmail, watchedPhone, watchedTaxCode, watchedPurchaserTaxCode, watchedStudentEmail, watchedStudentPhone, watchedIsForChild, stripeEnabled, formMethods]);

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
      const res: any = await createOrUpdateReservationServerAction({
        type,
        id,
        dateParam: effectiveDate || "",
        timeParam: effectiveTime || "",
        values,
        sessionId: sid,
        origin: typeof window !== "undefined" ? window.location.origin : undefined,
      });

      if (!res.success) {
        toast.error(res.error || "Errore durante la prenotazione");
        return;
      }

      const bookingId = res.bookingId || res.booking?.id || "";
      toast.success("Prenotazione completata con successo!");
      router.push(`/checkout/success/${bookingId}`);
    } catch (err: any) {
      toast.error(err.message || "Errore imprevisto");
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
        toast.error(res.error || "Impossibile avviare il pagamento con Stripe");
        return;
      }

      window.location.href = res.url;
    } catch (err: any) {
      toast.error(err.message || "Errore durante l'avvio del pagamento");
    } finally {
      setSubmitting(false);
    }
  };

  const onSubmit = (values: CheckoutFormValues) => {
    if (feeCheckStatus === "checking") {
      toast.info("Verifica quota in corso, attendere un istante...");
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
    user,
    dateParam,
    timeParam,
    actionRef,
    onSubmit,
  };
}
