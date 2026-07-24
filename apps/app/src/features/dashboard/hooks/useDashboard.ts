import { useEffect, useState } from "react";
import { toast } from "sonner";
import { EnrichedBooking } from "@repo/api";
import { getDashboardDataAction, updateUserProfileAction } from "@/app/actions/dashboard";

export function useDashboard() {
  const [user, setUser] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [bookings, setBookings] = useState<EnrichedBooking[]>([]);
  const [activeTab, setActiveTab] = useState<"upcoming" | "past">("upcoming");

  const [profileName, setProfileName] = useState("");
  const [profilePhone, setProfilePhone] = useState("");
  const [savingProfile, setSavingProfile] = useState(false);

  useEffect(() => {
    async function initDashboard() {
      try {
        const res = await getDashboardDataAction();
        if (res.success && res.user) {
          setUser(res.user);
          setProfileName(res.user.user_metadata?.full_name || "");
          setProfilePhone(res.user.user_metadata?.phone || res.user.phone || "");
          setBookings(res.bookings || []);
        }
      } catch (err) {
        console.error("Error loading dashboard:", err);
      } finally {
        setLoading(false);
      }
    }

    initDashboard();
  }, []);

  const handleSaveProfile = async (e: React.FormEvent) => {
    e.preventDefault();
    setSavingProfile(true);
    try {
      const res = await updateUserProfileAction({ profileName, profilePhone });
      if (res.success) {
        toast.success("Profilo aggiornato con successo");
        setUser((prev: any) => ({
          ...prev,
          user_metadata: {
            ...prev?.user_metadata,
            full_name: profileName,
            phone: profilePhone,
          },
        }));
      } else {
        throw new Error(res.error || "Errore durante l'aggiornamento del profilo");
      }
    } catch (err: any) {
      toast.error(err.message || "Errore durante l'aggiornamento del profilo");
    } finally {
      setSavingProfile(false);
    }
  };

  const upcomingBookings = bookings.filter((b) => b.is_future);
  const pastBookings = bookings.filter((b) => !b.is_future);

  return {
    user,
    loading,
    bookings,
    activeTab,
    setActiveTab,
    upcomingBookings,
    pastBookings,
    profileName,
    setProfileName,
    profilePhone,
    setProfilePhone,
    savingProfile,
    handleSaveProfile,
  };
}
