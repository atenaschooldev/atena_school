"use server";

export async function submitContactForm(formData: {
  nome: string;
  cognome: string;
  email: string;
  telefono?: string;
  interesse?: string;
  messaggio: string;
  honeypot?: string;
  utm?: Record<string, any> | null;
}) {
  if (formData.honeypot) {
    // Bot submission caught by honeypot
    return { success: true };
  }
  try {
    const siteUrl = process.env.NEXT_PUBLIC_SITE_URL || (process.env.VERCEL_URL ? `https://${process.env.VERCEL_URL}` : "http://localhost:3000");
    const backendUrl = process.env.NEXT_PUBLIC_BACKEND_URL || process.env.BACKEND_URL || siteUrl;
    const res = await fetch(`${backendUrl}/api/v1/contact`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(formData),
    });

    if (res.ok) {
      const bData = await res.json();
      return bData;
    }

    const errData = await res.json();
    return { success: false, error: errData.message || "Impossibile inviare il messaggio" };
  } catch (err: any) {
    console.error("submitContactForm error:", err);
    return { success: false, error: err.message || "Errore di connessione" };
  }
}
