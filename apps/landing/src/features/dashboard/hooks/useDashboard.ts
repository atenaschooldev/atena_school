import { useEffect, useState } from "react";
import { createClient } from "@/lib/supabase/client";
import { toast } from "sonner";
import {
  fetchUserBookingsEnriched,
  updateUserProfile,
  EnrichedBooking,
} from "../services/dashboardService";

export function useDashboard() {
  const supabase = createClient();

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
        const { data: { user } } = await supabase.auth.getUser();
        if (!user) {
          setLoading(false);
          return;
        }
        setUser(user);
        setProfileName(user.user_metadata?.full_name || "");
        setProfilePhone(user.user_metadata?.phone || user.phone || "");

        const enrichedList = await fetchUserBookingsEnriched(user, supabase);
        setBookings(enrichedList);
      } catch (err) {
        console.error("Error loading dashboard:", err);
      } finally {
        setLoading(false);
      }
    }

    initDashboard();
  }, [supabase]);

  const handleSaveProfile = async (e: React.FormEvent) => {
    e.preventDefault();
    setSavingProfile(true);
    try {
      await updateUserProfile(user, { profileName, profilePhone }, supabase);
      toast.success("Profilo aggiornato con successo");
      setUser((prev: any) => ({
        ...prev,
        user_metadata: {
          ...prev?.user_metadata,
          full_name: profileName,
          phone: profilePhone,
        },
      }));
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
