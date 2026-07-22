import { useEffect, useState, useRef } from "react";
import { useRouter } from "@/i18n/routing";
import { useSearchParams } from "next/navigation";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { toast } from "sonner";
import { getSessionId } from "@/lib/utils";

export interface CheckoutFormValues {
  firstName: string;
  lastName: string;
  email: string;
  phone: string;
  isForChild?: boolean;
  studentFirstName?: string;
  studentLastName?: string;
  studentBirthDate?: string;
  taxCode?: string;
  includeRegistrationFee?: boolean;
  notes?: string;
}

export interface BookingItem {
  id: string;
  name?: string;
  title_it?: string;
  price: string | number;
  description_it?: string;
  image_url?: string;
}
import {
  fetchCheckoutItemAction,
  createOrUpdateReservationServerAction,
  initiateStripePaymentAction,
  getCurrentUserAction,
  updateUserPhoneAction,
  checkRegistrationFeeStatusAction,
} from "@/app/actions/booking";

export const checkoutSchema = z.object({
  firstName: z.string().min(2, "Il nome deve avere almeno 2 caratteri"),
  lastName: z.string().min(2, "Il cognome deve avere almeno 2 caratteri"),
  email: z.string().email("Inserisci un indirizzo email valido"),
  phone: z.string().min(6, "Inserisci un numero di telefono valido"),
  isForChild: z.boolean().optional(),
  studentFirstName: z.string().optional(),
  studentLastName: z.string().optional(),
  studentBirthDate: z.string().optional(),
  taxCode: z.string().optional(),
  includeRegistrationFee: z.boolean().optional(),
  notes: z.string().optional(),
});

export type SubmitAction = "book" | "pay";

export function useCheckout(type: string, id: string) {
  const router = useRouter();
  const searchParams = useSearchParams();

  const dateParam = searchParams.get("date");
  const timeParam = searchParams.get("time");
  const slotIdParam = searchParams.get("slotId");

  const [hasPaidAnnualFee, setHasPaidAnnualFee] = useState(false);
  const [item, setItem] = useState<BookingItem | null>(null);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState<false | "book" | "pay">(false);
  const [user, setUser] = useState<any>(null);
  const actionRef = useRef<SubmitAction>("book");

  const formMethods = useForm<CheckoutFormValues>({
    resolver: zodResolver(checkoutSchema),
    defaultValues: {
      firstName: "",
      lastName: "",
      email: "",
      phone: "",
      isForChild: false,
      studentFirstName: "",
      studentLastName: "",
      studentBirthDate: "",
      taxCode: "",
      includeRegistrationFee: true,
      notes: "",
    },
  });

  const { reset } = formMethods;

  useEffect(() => {
    async function initCheckout() {
      try {
        const itemRes = await fetchCheckoutItemAction(type, id);
        if (itemRes.success && itemRes.item) {
          setItem(itemRes.item);
        }

        const userRes = await getCurrentUserAction();
        if (userRes.success && userRes.user) {
          const currentUser = userRes.user;
          setUser(currentUser);
          const fullName = currentUser.user_metadata?.full_name || "";
          const parts = fullName.split(" ");
          const phone = currentUser.user_metadata?.phone || currentUser.phone || "";

          const hasPaidFee = userRes.annualFeePaid ?? false;
          setHasPaidAnnualFee(hasPaidFee);

          // reset() pre-populates all fields atomically, even after first render
          reset({
            email: currentUser.email || "",
            phone: phone,
            firstName: parts[0] || "",
            lastName: parts.slice(1).join(" ") || "",
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

  useEffect(() => {
    if (!watchedEmail && !watchedPhone && !watchedTaxCode) return;

    const timer = setTimeout(async () => {
      const res = await checkRegistrationFeeStatusAction(watchedEmail, watchedPhone, watchedTaxCode);
      if (res.success && res.annualFeePaid) {
        setHasPaidAnnualFee(true);
        formMethods.setValue("includeRegistrationFee", false);
      } else if (res.success && !res.annualFeePaid && !user) {
        setHasPaidAnnualFee(false);
      }
    }, 600);

    return () => clearTimeout(timer);
  }, [watchedEmail, watchedPhone, watchedTaxCode, formMethods, user]);

  const effectiveDate = dateParam || "da_concordare";
  const effectiveTime = timeParam || "da_concordare";

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
        dateParam: effectiveDate,
        timeParam: effectiveTime,
        values,
        sessionId: sid,
        origin: typeof window !== "undefined" ? window.location.origin : undefined,
      });

      if (!res.success) {
        toast.error(res.error || "Errore durante la prenotazione");
        return;
      }

      toast.success("Prenotazione completata con successo!");
      router.push(`/checkout/success?booking_id=${res.bookingId}&email=${encodeURIComponent(values.email)}`);
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
        dateParam: effectiveDate,
        timeParam: effectiveTime,
        values,
        sessionId: sid,
        origin: typeof window !== "undefined" ? window.location.origin : undefined,
      });

      if (!res.success || !res.url) {
        toast.error(res.error || "Errore nell'avvio del pagamento");
        return;
      }

      window.location.href = res.url;
    } catch (err: any) {
      toast.error(err.message || "Errore imprevisto");
    } finally {
      setSubmitting(false);
    }
  };

  const onSubmit = (values: CheckoutFormValues) => {
    if (actionRef.current === "book") {
      handleBook(values);
    } else {
      handlePay(values);
    }
  };

  return {
    item,
    loading,
    submitting,
    user,
    dateParam,
    timeParam,
    slotIdParam,
    hasPaidAnnualFee,
    actionRef,
    formMethods,
    onSubmit,
  };
}
