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

          // reset() pre-populates all fields atomically, even after first render
          reset({
            email: currentUser.email || "",
            phone: phone,
            firstName: parts[0] || "",
            lastName: parts.slice(1).join(" ") || "",
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

      if (user && values.phone) {
        const existingPhone = user.user_metadata?.phone || user.phone || "";
        if (existingPhone !== values.phone) {
          await updateUserPhoneAction(values.phone);
        }
      }

      const res = await createOrUpdateReservationServerAction({
        type,
        id,
        dateParam: effectiveDate,
        timeParam: effectiveTime,
        values,
        sessionId: sid,
        origin: window.location.origin,
      });

      if (!res.success || !res.booking) {
        throw new Error(res.error || "Errore durante la prenotazione");
      }

      router.push(`/checkout/success?type=booking&booking_id=${res.booking.id}&email=${encodeURIComponent(values.email)}`);
    } catch (err: any) {
      toast.error(err.message || "Errore durante la prenotazione");
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
      if (user && values.phone) {
        const existingPhone = user.user_metadata?.phone || user.phone || "";
        if (existingPhone !== values.phone) {
          await updateUserPhoneAction(values.phone);
        }
      }

      const sid = getSessionId();

      const res = await initiateStripePaymentAction({
        type,
        id,
        dateParam: effectiveDate,
        timeParam: effectiveTime,
        values,
        sessionId: sid,
      });

      if (res.success && res.url) {
        window.location.href = res.url;
      } else {
        throw new Error(res.error || "Qualcosa è andato storto");
      }
    } catch (err: any) {
      toast.error(err.message || "Qualcosa è andato storto");
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
    actionRef,
    formMethods,
    onSubmit,
  };
}
