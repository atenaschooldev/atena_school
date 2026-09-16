"use server";

export async function submitContactForm(formData: {
  nome: string;
  cognome: string;
  email: string;
  telefono?: string;
  interesse?: string;
  messaggio: string;
}) {
  try {
    const backendUrl = process.env.NEXT_PUBLIC_BACKEND_URL || process.env.BACKEND_URL || "http://localhost:4000";
    const res = await fetch(`${backendUrl}/api/v1/contact`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(formData),
    });

    if (res.ok) return res.json();
    const errData = await res.json().catch(() => ({}));
    return { success: false, error: errData.message || "Errore di connessione" };
  } catch (err: any) {
    console.error("submitContactForm error:", err);
    return { success: false, error: err.message || "Errore di connessione" };
  }
}
