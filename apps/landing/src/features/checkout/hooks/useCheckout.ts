import { useEffect, useState, useRef } from "react";
import { useRouter } from "@/i18n/routing";
import { useSearchParams } from "next/navigation";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { toast } from "sonner";
import { createClient } from "@/lib/supabase/client";
import { getSessionId } from "@/lib/utils";
import {
  fetchCheckoutItem,
  createOrUpdateReservation,
  initiateStripePayment,
  BookingItem,
  CheckoutFormValues,
} from "../services/checkoutService";

export const checkoutSchema = z.object({
  firstName: z.string().min(2, "Il nome deve avere almeno 2 caratteri"),
  lastName: z.string().min(2, "Il cognome deve avere almeno 2 caratteri"),
  email: z.string().email("Inserisci un indirizzo email valido"),
  phone: z.string().min(6, "Inserisci un numero di telefono valido"),
  notes: z.string().optional(),
});

export type SubmitAction = "book" | "pay";

export function useCheckout(type: string, id: string) {
  const router = useRouter();
  const searchParams = useSearchParams();
  const supabase = createClient();

  const dateParam = searchParams.get("date");
  const timeParam = searchParams.get("time");
  const slotIdParam = searchParams.get("slot_id");

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
      notes: "",
    },
  });

  const { reset } = formMethods;

  useEffect(() => {
    async function initCheckout() {
      try {
        const itemData = await fetchCheckoutItem(type, id, supabase);
        if (itemData) {
          setItem(itemData);
        }

        const { data: { user } } = await supabase.auth.getUser();
        if (user) {
          setUser(user);
          const fullName = user.user_metadata?.full_name || "";
          const parts = fullName.split(" ");
          const phone = user.user_metadata?.phone || user.phone || "";

          // reset() pre-populates all fields atomically, even after first render
          reset({
            email: user.email || "",
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
  }, [id, type, reset, supabase]);

  const handleBook = async (values: CheckoutFormValues) => {
    if (!dateParam || !timeParam || !item) {
      toast.error("Informazioni di prenotazione mancanti");
      return;
    }

    setSubmitting("book");
    try {
      const sid = getSessionId();

      if (user && values.phone) {
        const existingPhone = user.user_metadata?.phone || user.phone || "";
        if (existingPhone !== values.phone) {
          await supabase.auth.updateUser({
            data: { phone: values.phone },
          });
        }
      }

      const { booking } = await createOrUpdateReservation(
        {
          type,
          id,
          dateParam,
          timeParam,
          slotIdParam,
          values,
          user,
          sessionId: sid,
        },
        supabase
      );

      router.push(`/checkout/success?type=booking&booking_id=${booking.id}&email=${encodeURIComponent(values.email)}`);
    } catch (err: any) {
      toast.error(err.message || "Qualcosa è andato storto");
    } finally {
      setSubmitting(false);
    }
  };

  const handlePay = async (values: CheckoutFormValues) => {
    if (!dateParam || !timeParam || !item) {
      toast.error("Informazioni di prenotazione mancanti");
      return;
    }

    setSubmitting("pay");
    try {
      if (user && values.phone) {
        const existingPhone = user.user_metadata?.phone || user.phone || "";
        if (existingPhone !== values.phone) {
          await supabase.auth.updateUser({
            data: { phone: values.phone },
          });
        }
      }

      const { url } = await initiateStripePayment(
        {
          type,
          id,
          dateParam,
          timeParam,
          slotIdParam,
          values,
        },
        supabase
      );

      window.location.href = url;
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
