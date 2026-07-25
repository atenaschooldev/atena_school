"use server"

import { createClient } from "@/lib/supabase/server";
import { env } from "@/config/env";

export async function submitContactForm(formData: {
  nome: string;
  cognome: string;
  email: string;
  telefono?: string;
  interesse?: string;
  messaggio: string;
}) {
  try {
    const supabase = createClient() as any;
    
    // 1. Insert message into public.contact_messages
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
      console.error("DB Insert Error:", error);
      return { success: false, error: error.message };
    }

    // 2. Send email via Resend
    const resendApiKey = process.env.RESEND_API_KEY;
    const resendFromEmail = process.env.RESEND_FROM_EMAIL || "Atena School <info@atena.school>";
    const schoolEmail = process.env.SCHOOL_EMAIL || "info@atena.school";

    if (resendApiKey) {
      const siteUrl = env.NEXT_PUBLIC_SITE_URL;

      const response = await fetch("https://api.resend.com/emails", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "Authorization": `Bearer ${resendApiKey}`
        },
        body: JSON.stringify({
          from: resendFromEmail,
          to: [schoolEmail],
          subject: `Nuovo messaggio da ${formData.nome} ${formData.cognome} - Atena School`,
          html: `
            <div style="font-family: 'Segoe UI', Roboto, Helvetica, Arial, sans-serif; background-color: #f4f6f9; padding: 40px 20px; min-height: 100%;">
              <div style="max-width: 600px; margin: 0 auto; background-color: #ffffff; border-radius: 24px; overflow: hidden; box-shadow: 0 4px 20px rgba(11, 27, 43, 0.05); border: 1px solid #e2e8f0;">
                <!-- Header Band -->
                <div style="background-color: #0B1B2B; padding: 32px 20px; text-align: center; border-bottom: 4px solid #F8861D;">
                  <img src="${siteUrl}/athena-logo.webp" alt="Atena School Logo" style="height: 50px; max-width: 100%; object-fit: contain; display: block; margin: 0 auto 16px auto;" />
                  <h2 style="color: #ffffff; margin: 0; font-size: 20px; font-weight: 800; letter-spacing: 0.5px; font-family: 'Playfair Display', Georgia, serif;">Nuovo Messaggio Ricevuto</h2>
                </div>
                
                <!-- Body Content -->
                <div style="padding: 40px 32px; color: #1e293b;">
                  <p style="font-size: 14px; line-height: 1.6; color: #64748b; margin-top: 0;">Un utente ha compilato il modulo di contatto sul sito web. Ecco i dettagli della richiesta:</p>
                  
                  <!-- Info Table -->
                  <div style="background-color: #f8fafc; border-radius: 16px; padding: 24px; margin: 24px 0; border: 1px solid #f1f5f9;">
                    <table style="width: 100%; border-collapse: collapse; font-size: 13px;">
                      <tr>
                        <td style="padding: 8px 0; color: #64748b; width: 100px;"><strong>Nome:</strong></td>
                        <td style="padding: 8px 0; color: #0B1B2B; font-weight: 600;">${formData.nome} ${formData.cognome}</td>
                      </tr>
                      <tr>
                        <td style="padding: 8px 0; color: #64748b;"><strong>Email:</strong></td>
                        <td style="padding: 8px 0; color: #F8861D; font-weight: 600;"><a href="mailto:${formData.email}" style="color: #F8861D; text-decoration: none;">${formData.email}</a></td>
                      </tr>
                      <tr>
                        <td style="padding: 8px 0; color: #64748b;"><strong>Telefono:</strong></td>
                        <td style="padding: 8px 0; color: #0B1B2B; font-weight: 600;">${formData.telefono || 'Non specificato'}</td>
                      </tr>
                      <tr>
                        <td style="padding: 8px 0; color: #64748b;"><strong>Interesse:</strong></td>
                        <td style="padding: 8px 0; color: #0B1B2B; font-weight: 600;">
                          <span style="background-color: #F8861D; color: #ffffff; padding: 3px 10px; border-radius: 12px; font-size: 11px; font-weight: bold; text-transform: uppercase;">
                            ${formData.interesse || 'Generale'}
                          </span>
                        </td>
                      </tr>
                    </table>
                  </div>
                  
                  <!-- Message Box -->
                  <div style="margin-top: 32px;">
                    <h4 style="margin: 0 0 12px 0; color: #0B1B2B; font-size: 14px; font-weight: 800; text-transform: uppercase; letter-spacing: 0.5px;">Messaggio dell'utente:</h4>
                    <div style="background-color: #f8fafc; border-left: 4px solid #F8861D; padding: 18px 24px; border-radius: 0 16px 16px 0; font-size: 13px; line-height: 1.6; color: #334155; font-style: italic; white-space: pre-wrap;">
                      "${formData.messaggio}"
                    </div>
                  </div>
                </div>
                
                <!-- Footer -->
                <div style="background-color: #f8fafc; padding: 24px; text-align: center; border-top: 1px solid #f1f5f9; font-size: 11px; color: #94a3b8;">
                  Questo messaggio è stato generato automaticamente dalla piattaforma web di <a href="${siteUrl}" style="color: #0B1B2B; font-weight: 600; text-decoration: none;">Atena School</a>.
                </div>
              </div>
            </div>
          `
        })
      });

      if (!response.ok) {
        const errorData = await response.json();
        console.error("Resend API Error:", errorData);
      }
    } else {
      console.warn("RESEND_API_KEY is not configured in Server Action. Skipping email notification.");
    }

    return { success: true };
  } catch (error: any) {
    console.error("Server Action submitContactForm error:", error);
    return { success: false, error: error.message || "Unknown error" };
  }
}
