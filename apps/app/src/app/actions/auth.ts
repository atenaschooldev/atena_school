"use server";

import { createClient } from "@/lib/supabase/server";

export async function loginWithEmailAction(params: { email: string; password: string }) {
  try {
    const supabase = await createClient();
    const { data, error } = await supabase.auth.signInWithPassword({
      email: params.email,
      password: params.password,
    });
    if (error) throw error;
    return { success: true, user: data.user };
  } catch (err: any) {
    console.error("Failed to run loginWithEmailAction:", err);
    return { success: false, error: err.message || "Failed to log in" };
  }
}

export async function signUpWithEmailAction(params: {
  email: string;
  password: string;
  metadata?: any;
}) {
  try {
    const supabase = await createClient();
    const { data, error } = await supabase.auth.signUp({
      email: params.email,
      password: params.password,
      options: {
        data: params.metadata,
      },
    });
    if (error) throw error;
    return { success: true, user: data.user };
  } catch (err: any) {
    console.error("Failed to run signUpWithEmailAction:", err);
    return { success: false, error: err.message || "Failed to register" };
  }
}

export async function getOAuthUrlAction(params: {
  provider: "google" | "apple";
  redirectTo: string;
}) {
  try {
    const supabase = await createClient();
    const { data, error } = await supabase.auth.signInWithOAuth({
      provider: params.provider,
      options: {
        redirectTo: params.redirectTo,
        skipBrowserRedirect: true, // Only generate the URL on the server
      },
    });
    if (error) throw error;
    return { success: true, url: data.url };
  } catch (err: any) {
    console.error("Failed to run getOAuthUrlAction:", err);
    return { success: false, error: err.message || "Failed to initiate OAuth redirect" };
  }
}

export async function signOutAction() {
  try {
    const supabase = await createClient();
    const { error } = await supabase.auth.signOut();
    if (error) throw error;
    return { success: true };
  } catch (err: any) {
    console.error("Failed to run signOutAction:", err);
    return { success: false, error: err.message || "Failed to sign out" };
  }
}

import { getDomainsCredentials } from "@atena/core";
import { getSupabaseAdmin } from "@/lib/supabase/admin";

export async function forgotPasswordAction(email: string) {
  try {
    const supabase = await createClient();
    let appUrl = process.env.NEXT_PUBLIC_APP_URL || "http://localhost:3002";
    try {
      const supabaseAdmin = getSupabaseAdmin();
      const domains = await getDomainsCredentials(supabaseAdmin);
      if (domains?.appUrl) appUrl = domains.appUrl;
    } catch {}

    const { error } = await supabase.auth.resetPasswordForEmail(email, {
      redirectTo: `${appUrl}/autenticazione/callback?next=/autenticazione/reimposta-password`,
    });
    if (error) throw error;
    return { success: true };
  } catch (err: any) {
    console.error("Failed to run forgotPasswordAction:", err);
    return { success: false, error: err.message || "Failed to send reset link" };
  }
}

export async function resetPasswordAction(password: string) {
  try {
    const supabase = await createClient();
    const { error } = await supabase.auth.updateUser({ password });
    if (error) throw error;
    return { success: true };
  } catch (err: any) {
    console.error("Failed to run resetPasswordAction:", err);
    return { success: false, error: err.message || "Failed to reset password" };
  }
}
