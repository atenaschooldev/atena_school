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

export function useCheckoutSuccess() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const sessionId = searchParams.get("session_id");
  const bookingId = searchParams.get("booking_id");
  const emailParam = searchParams.get("email");

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

  useEffect(() => {
    async function initReceipt() {
      if (!bookingId) {
        setVerifying(false);
        return;
      }

      if (sessionId) {
        // Stripe payment confirmation
        try {
          const res = await confirmPaymentAction(bookingId, sessionId);
          if (res?.success) {
            const enriched = await getBookingDetailsServer(bookingId);
            if (enriched) {
              setBookingData(enriched);
            } else {
              setBookingData(res.booking);
            }
          } else {
            const fallback = await getBookingDetailsServer(bookingId);
            if (fallback) setBookingData(fallback);
          }
        } catch (err) {
          console.error("Error confirming payment:", err);
          const fallback = await getBookingDetailsServer(bookingId);
          if (fallback) setBookingData(fallback);
        } finally {
          setVerifying(false);
        }
      } else {
        // Offline Paga in Sede reservation
        const data = await getBookingDetailsServer(bookingId);
        if (data) setBookingData(data);
        setVerifying(false);
      }
    }

    initReceipt();
  }, [bookingId, sessionId]);

  useEffect(() => {
    if (verifying) return;

    confetti({
      particleCount: 150,
      spread: 70,
      origin: { y: 0.6 },
      colors: ["#F8861D", "#043569", "#FFFFFF"],
    });
  }, [verifying]);

  const emailDisplay = bookingData?.student_email || emailParam || user?.email || "";
  const isGmail = emailDisplay.toLowerCase().endsWith("@gmail.com");
  const isPaid = !!sessionId || bookingData?.status === "paid";

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
    const emailToSend = bookingData?.student_email || emailParam || user?.email;
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
