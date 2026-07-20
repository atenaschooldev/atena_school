import { useEffect, useState, useRef } from "react";
import { useRouter } from "@/i18n/routing";
import { useSearchParams } from "next/navigation";
import confetti from "canvas-confetti";
import { createClient } from "@/lib/supabase/client";
import { dispatchMagicLink } from "../services/successService";
import { getBookingDetailsServer } from "@/app/actions/booking";

export function useCheckoutSuccess() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const sessionId = searchParams.get("session_id");
  const bookingId = searchParams.get("booking_id");
  const emailParam = searchParams.get("email");
  const supabase = createClient();

  const [verifying, setVerifying] = useState(!!sessionId);
  const [user, setUser] = useState<any>(null);
  const [bookingData, setBookingData] = useState<any>(null);
  const [sendingMagicLink, setSendingMagicLink] = useState(false);
  const [magicLinkSent, setMagicLinkSent] = useState(false);
  const sentRef = useRef(false);

  useEffect(() => {
    async function loadBooking() {
      if (!bookingId) return;
      const data = await getBookingDetailsServer(bookingId);
      if (data) setBookingData(data);
    }
    loadBooking();
  }, [bookingId]);

  useEffect(() => {
    async function fetchUser() {
      const { data: { user } } = await supabase.auth.getUser();
      setUser(user);
    }
    fetchUser();
  }, [supabase]);

  useEffect(() => {
    async function verifyStripePayment() {
      if (!sessionId || !bookingId) {
        setVerifying(false);
        return;
      }

      try {
        await fetch(
          `${process.env.NEXT_PUBLIC_SUPABASE_URL}/functions/v1/verify-payment`,
          {
            method: "POST",
            headers: {
              "Content-Type": "application/json",
              Authorization: `Bearer ${process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY}`,
            },
            body: JSON.stringify({ session_id: sessionId, booking_id: bookingId }),
          }
        );
      } catch {
        // Non-critical — webhook will handle it
      } finally {
        setVerifying(false);
      }
    }

    verifyStripePayment();
  }, [sessionId, bookingId]);

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
  const isPaid = !!sessionId;

  // Auto-send magic link on mount for non-Gmail guests in Stripe payment flow
  useEffect(() => {
    if (verifying) return;
    if (user) return; // already logged in
    if (!emailDisplay) return;
    if (isGmail) return; // Gmail users use Google OAuth

    if (!isPaid) {
      // Booking flow (offline) already sent the OTP in createOrUpdateReservation
      setMagicLinkSent(true);
      return;
    }

    if (sentRef.current) return;
    sentRef.current = true;

    setSendingMagicLink(true);
    dispatchMagicLink(emailDisplay, supabase).then((success) => {
      setSendingMagicLink(false);
      if (success) {
        setMagicLinkSent(true);
      }
    });
  }, [verifying, user, emailDisplay, isGmail, isPaid, supabase]);

  const handleSendMagicLink = async () => {
    const emailToSend = bookingData?.student_email || emailParam || user?.email;
    setSendingMagicLink(true);
    const success = await dispatchMagicLink(emailToSend, supabase);
    setSendingMagicLink(false);
    if (success) {
      setMagicLinkSent(true);
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
