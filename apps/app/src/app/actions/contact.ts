"use server";

import { createClient } from "@/lib/supabase/server";

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
    if (backendUrl) {
      try {
        const res = await fetch(`${backendUrl}/api/v1/checkout/contact`, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(formData),
        });

        if (res.ok) return res.json();
      } catch (bErr) {
        console.warn("Backend submitContactForm fallback:", bErr);
      }
    }

    // Fallback: direct Supabase insert
    const supabase = createClient() as any;
    const { error } = await supabase
      .from("contact_messages")
      .insert({
        first_name: formData.nome,
        last_name: formData.cognome,
        email: formData.email,
        phone: formData.telefono || null,
        interest: formData.interesse || null,
        message: formData.messaggio
      });

    if (error) {
      return { success: false, error: error.message };
    }

    return { success: true };
  } catch (err: any) {
    console.error("submitContactForm error:", err);
    return { success: false, error: err.message || "Errore di connessione" };
  }
}
