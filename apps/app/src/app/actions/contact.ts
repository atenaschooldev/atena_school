"use server";

import { submitContactWorkflow } from "@atena/core";
import { getSupabaseAdmin } from "@/lib/supabase/admin";

export async function submitContactForm(formData: {
  nome: string;
  cognome: string;
  email: string;
  telefono?: string;
  interesse?: string;
  messaggio: string;
}) {
  try {
    const backendUrl = process.env.NEXT_PUBLIC_BACKEND_URL || process.env.BACKEND_URL;
    if (backendUrl && backendUrl !== "http://localhost:4000") {
      const res = await fetch(`${backendUrl}/app/contact`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(formData),
      });
      if (res.ok) return res.json();
    }

    const supabaseAdmin = getSupabaseAdmin();
    return await submitContactWorkflow(supabaseAdmin, formData);
  } catch (err: any) {
    console.error("submitContactForm error:", err);
    return { success: false, error: err.message || "Errore di connessione" };
  }
}
