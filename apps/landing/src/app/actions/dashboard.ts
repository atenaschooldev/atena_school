"use server";

import { createClient as createServerClient } from "@/lib/supabase/server";
import { fetchUserBookingsEnriched, updateUserProfile } from "@/features/dashboard/services/dashboardService";

export async function getDashboardDataAction() {
  try {
    const supabase = createServerClient();
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) {
      return { success: false, user: null, bookings: [] };
    }

    const bookings = await fetchUserBookingsEnriched(user, supabase);
    return {
      success: true,
      user,
      bookings
    };
  } catch (err: any) {
    console.error("Failed to run getDashboardDataAction:", err);
    return { success: false, user: null, bookings: [], error: err.message || "Failed to load dashboard data" };
  }
}

export async function updateUserProfileAction(params: { profileName: string; profilePhone: string }) {
  try {
    const supabase = createServerClient();
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) {
      return { success: false, error: "Unauthorized" };
    }

    await updateUserProfile(user, params, supabase);
    return { success: true };
  } catch (err: any) {
    console.error("Failed to run updateUserProfileAction:", err);
    return { success: false, error: err.message || "Failed to update profile" };
  }
}
