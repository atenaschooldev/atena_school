import { useState } from "react";
import { useRouter } from "@/i18n/routing";

export function useCart() {
  const router = useRouter();
  const [bookings, setBookings] = useState<any[]>([]);
  const [loading] = useState(false);
  const [processing, setProcessing] = useState(false);

  const removeItem = async (id: string) => {
    setBookings((prev) => prev.filter((b) => b.id !== id));
  };

  const handleCheckout = async () => {
    setProcessing(true);
    router.push("/corsi");
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
