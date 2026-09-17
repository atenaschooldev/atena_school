import { useState, useEffect, useRef } from "react";
import { useRouter } from "@/i18n/routing";
import { useSearchParams } from "next/navigation";
import { toast } from "sonner";
import confetti from "canvas-confetti";
import { createClient } from "@/lib/supabase/client";
import { api } from "@/lib/api";
import { trackEvent } from "@/lib/analytics";
import { BookingPaymentStatus } from "@atena/api-types";
import type { User } from "@supabase/supabase-js";
import type { BookingRecord } from "@atena/api-types";

export function useCheckoutSuccess(overrideBookingId?: string) {
  const router = useRouter();
  const searchParams = useSearchParams();
  const sessionId = searchParams.get("session_id");
  const queryBookingId = searchParams.get("booking_id");
  const emailParam = searchParams.get("email");
  const bookingId = overrideBookingId || queryBookingId || "";

  const [bookingData, setBookingData] = useState<Partial<BookingRecord> | null>(null);
  const [verifying, setVerifying] = useState(true);
  const [sendingMagicLink, setSendingMagicLink] = useState(false);
  const [magicLinkSent, setMagicLinkSent] = useState(false);
  const [user, setUser] = useState<User | null>(null);

  const sentRef = useRef(false);

  useEffect(() => {
    async function fetchUser() {
      try {
        const supabase = createClient();
        const { data: { user: authUser } } = await supabase.auth.getUser();
        if (authUser) {
          setUser(authUser);
        }
      } catch (err) {
        console.warn("Could not fetch current auth user:", err);
      }
    }
    fetchUser();
  }, []);

  const fetchedRef = useRef(false);

  useEffect(() => {
    async function initReceipt() {
      if (!bookingId) {
        setVerifying(false);
        return;
      }
      if (fetchedRef.current) return;
      fetchedRef.current = true;

      if (typeof window !== "undefined") {
        try {
          Object.keys(sessionStorage).forEach((key) => {
            if (key.startsWith("atena_checkout_draft_")) {
              sessionStorage.removeItem(key);
            }
          });
        } catch {
          // Ignore
        }
      }

      if (sessionId) {
        // Stripe payment confirmation
        try {
          const verifyData = await api.checkout.verifyPayment({ bookingId, sessionId }).catch(() => null);
          const enriched = await api.bookings.getById(bookingId).catch(() => null);

          setBookingData(
            enriched?.booking ||
            verifyData?.booking ||
            { id: bookingId, payment_status: BookingPaymentStatus.PAID }
          );
        } catch (err) {
          console.error("Error confirming payment:", err);
          try {
            const fallback = await api.bookings.getById(bookingId);
            setBookingData(
              fallback?.booking ||
              { id: bookingId, payment_status: BookingPaymentStatus.PAID }
            );
          } catch {
            setBookingData({ id: bookingId, payment_status: BookingPaymentStatus.PAID });
          }
        } finally {
          setVerifying(false);
          if (typeof window !== "undefined" && window.history && window.location.search) {
            window.history.replaceState(null, "", window.location.pathname);
          }
        }
      } else {
        try {
          const data = await api.bookings.getById(bookingId);
          setBookingData(data?.booking || { id: bookingId });
        } catch (err) {
          console.error("Error fetching booking details:", err);
          setBookingData({ id: bookingId });
        } finally {
          setVerifying(false);
        }
      }
    }

    initReceipt();
  }, [bookingId, sessionId]);

  const emailDisplay = bookingData?.purchaser_email || emailParam || bookingData?.student_email || user?.email || "";
  const isGmail = emailDisplay.toLowerCase().endsWith("@gmail.com");
  const isPaid = !!sessionId || Number(bookingData?.payment_status) === BookingPaymentStatus.PAID;

  const purchaseTrackedRef = useRef(false);

  useEffect(() => {
    if (verifying) return;

    confetti({
      particleCount: 150,
      spread: 70,
      origin: { y: 0.6 },
      colors: ["#F8861D", "#043569", "#FFFFFF"],
    });

    if (isPaid && bookingId && !purchaseTrackedRef.current) {
      purchaseTrackedRef.current = true;
      const bookingAmount = Number(bookingData?.amount_paid || bookingData?.course_price || 0);
      trackEvent("purchase", {
        transaction_id: bookingId,
        value: bookingAmount,
        currency: "EUR",
        items: [
          {
            item_id: bookingData?.course_id || bookingId,
            item_name: bookingData?.course_name || "Corso Atena School",
            price: bookingAmount,
            quantity: 1,
          },
        ],
      });
    }
  }, [verifying, isPaid, bookingId, bookingData]);

  // Auto-send magic link for non-Gmail guests
  useEffect(() => {
    if (verifying || user || !emailDisplay || isGmail || !isPaid) return;

    if (sentRef.current) return;
    sentRef.current = true;

    setSendingMagicLink(true);
    api.auth.sendMagicLink(emailDisplay).then((res) => {
      setSendingMagicLink(false);
      if (res.success) {
        toast.success(`Magic Link inviato a ${emailDisplay}! Controlla la tua posta.`);
        setMagicLinkSent(true);
      } else {
        toast.error(res.error || "Errore durante l'invio del link");
      }
    });
  }, [verifying, user, emailDisplay, isGmail, isPaid]);

  const handleSendMagicLink = async () => {
    const emailToSend = bookingData?.purchaser_email || emailParam || bookingData?.student_email || user?.email;
    if (!emailToSend) {
      toast.error("Email non trovata per l'invio del link");
      return;
    }

    setSendingMagicLink(true);
    const res = await api.auth.sendMagicLink(emailToSend);
    setSendingMagicLink(false);

    if (res.success) {
      toast.success(`Magic Link inviato a ${emailToSend}! Controlla la tua posta.`);
      setMagicLinkSent(true);
    } else {
      toast.error(res.error || "Errore durante l'invio del link");
    }
  };

  return {
    router,
    verifying,
    user,
    bookingData,
    sendingMagicLink,
    emailDisplay,
    isGmail,
    isPaid,
    magicLinkSent,
    handleSendMagicLink,
  };
}
