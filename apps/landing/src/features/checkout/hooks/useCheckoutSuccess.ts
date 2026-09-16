import { useEffect, useState, useRef } from "react";
import { useRouter } from "@/i18n/routing";
import { useSearchParams } from "next/navigation";
import confetti from "canvas-confetti";
import { toast } from "sonner";
import { createClient } from "@/lib/supabase/client";
import { BookingPaymentStatus } from "@atena/api-types";
import { trackEvent } from "@/lib/analytics";

export function useCheckoutSuccess(overrideBookingId?: string) {
  const router = useRouter();
  const searchParams = useSearchParams();
  const sessionId = searchParams.get("session_id");
  const queryBookingId = searchParams.get("booking_id");
  const emailParam = searchParams.get("email");
  const bookingId = overrideBookingId || queryBookingId;

  const [verifying, setVerifying] = useState(true);
  const [user, setUser] = useState<any>(null);
  const [bookingData, setBookingData] = useState<any>(null);
  const [sendingMagicLink, setSendingMagicLink] = useState(false);
  const [magicLinkSent, setMagicLinkSent] = useState(false);
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

      if (sessionId) {
        // Stripe payment confirmation
        try {
          const verifyRes = await fetch("/api/landing/checkout/verify-payment", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ bookingId, sessionId }),
          });
          const verifyData = await verifyRes.json();

          const bookingRes = await fetch(`/api/landing/bookings/${bookingId}`);
          const enriched = await bookingRes.json();

          setBookingData(
            enriched?.booking ||
            enriched?.data ||
            verifyData?.booking ||
            { id: bookingId, payment_status: BookingPaymentStatus.PAID }
          );
        } catch (err) {
          console.error("Error confirming payment:", err);
          try {
            const fallbackRes = await fetch(`/api/landing/bookings/${bookingId}`);
            const fallback = await fallbackRes.json();
            setBookingData(
              fallback?.booking ||
              fallback?.data ||
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
          const res = await fetch(`/api/landing/bookings/${bookingId}`);
          const data = await res.json();
          setBookingData(data?.booking || data?.data || { id: bookingId });
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
  const isPaid = !!sessionId || Number(bookingData?.payment_status) === BookingPaymentStatus.PAID || bookingData?.payment_status === "paid" || bookingData?.status === "paid";

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
      trackEvent("purchase", {
        transaction_id: bookingId,
        value: bookingData?.total_amount || bookingData?.amount || 0,
        currency: "EUR",
        items: [
          {
            item_id: bookingData?.course_id || bookingId,
            item_name: bookingData?.course_name || "Corso Atena School",
            price: bookingData?.total_amount || bookingData?.amount || 0,
            quantity: 1,
          },
        ],
      });
    }
  }, [verifying, isPaid, bookingId, bookingData]);

  const sendMagicLink = async (emailToSend: string) => {
    try {
      const res = await fetch("/api/landing/auth/magic-link", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email: emailToSend }),
      });
      return await res.json();
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : "Network error";
      return { success: false, error: msg };
    }
  };

  // Auto-send magic link for non-Gmail guests
  useEffect(() => {
    if (verifying) return;
    if (user) return;
    if (!emailDisplay) return;
    if (isGmail) return;

    if (!isPaid) {
      setMagicLinkSent(true);
      return;
    }

    if (sentRef.current) return;
    sentRef.current = true;

    setSendingMagicLink(true);
    sendMagicLink(emailDisplay).then((res) => {
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
    const res = await sendMagicLink(emailToSend);
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
