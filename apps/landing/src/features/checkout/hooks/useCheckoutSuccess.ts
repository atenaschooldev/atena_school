import { useEffect, useState, useRef } from "react";
import { useRouter } from "@/i18n/routing";
import { useSearchParams } from "next/navigation";
import confetti from "canvas-confetti";
import { toast } from "sonner";
import {
  getBookingDetailsServer,
  getCurrentUserAction,
  dispatchMagicLinkAction,
  confirmPaymentAction,
} from "@/app/actions/booking";
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
      const res = await getCurrentUserAction();
      if (res.success) {
        setUser(res.user);
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
          const res = await confirmPaymentAction(bookingId, sessionId);
          const enriched = await getBookingDetailsServer(bookingId);
          setBookingData(enriched?.booking || enriched || res?.booking || { id: bookingId, payment_status: BookingPaymentStatus.PAID });
        } catch (err) {
          console.error("Error confirming payment:", err);
          const fallback = await getBookingDetailsServer(bookingId);
          setBookingData(fallback?.booking || fallback || { id: bookingId, payment_status: BookingPaymentStatus.PAID });
        } finally {
          setVerifying(false);
          if (typeof window !== "undefined" && window.history && window.location.search) {
            window.history.replaceState(null, "", window.location.pathname);
          }
        }
      } else {
        const data = await getBookingDetailsServer(bookingId);
        setBookingData(data?.booking || data || { id: bookingId });
        setVerifying(false);
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
    dispatchMagicLinkAction(emailDisplay).then((res) => {
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
    const res = await dispatchMagicLinkAction(emailToSend);
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
