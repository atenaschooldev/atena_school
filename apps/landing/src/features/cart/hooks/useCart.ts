import { useEffect, useState } from "react";
import { useRouter } from "@/i18n/routing";
import { getSessionId } from "@/lib/utils";
import { toast } from "sonner";
import {
  deleteBookingServerAction,
  checkoutCartServerAction,
  fetchCartItemsAction,
} from "@/app/actions/booking";

export function useCart() {
  const router = useRouter();

  const [bookings, setBookings] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [processing, setProcessing] = useState(false);

  useEffect(() => {
    async function fetchCart() {
      try {
        const sid = getSessionId();
        const res = await fetchCartItemsAction(sid);
        if (res.success) {
          setBookings(res.bookings || []);
        } else {
          console.error("Fetch cart error:", res.error);
        }
      } catch (error) {
        console.error("Cart page fetching error:", error);
      } finally {
        setLoading(false);
      }
    }
    fetchCart();
  }, []);

  const removeItem = async (id: string) => {
    const sid = getSessionId();
    const res = await deleteBookingServerAction(id, sid);
    if (res.success) {
      setBookings(prev => prev.filter(b => b.id !== id));
      window.dispatchEvent(new Event("cartUpdated"));
      toast.success("Rimosso dal carrello");
    } else {
      toast.error(res.error || "Errore durante la rimozione");
    }
  };

  const handleCheckout = async () => {
    setProcessing(true);
    const sid = getSessionId();

    await new Promise(resolve => setTimeout(resolve, 2000));
    const res = await checkoutCartServerAction(sid);

    if (res.success) {
      window.dispatchEvent(new Event("cartUpdated"));
      toast.success("Pagamento completato!");
      setBookings([]);
      router.push("/dashboard");
    } else {
      toast.error(res.error || "Errore durante il pagamento");
    }
    setProcessing(false);
  };

  return {
    bookings,
    loading,
    processing,
    removeItem,
    handleCheckout,
  };
}
