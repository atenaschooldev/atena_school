export interface BookingEmailTemplateData {
  courseName: string;
  purchaserName: string;
  studentName: string;
  purchaserEmail: string;
  purchaserPhone?: string;
  purchaserTaxCode?: string;
  isForChild?: boolean;
  studentEmail?: string;
  studentPhone?: string;
  studentTaxCode?: string;
  studentBirthDate?: string;
  date?: string;
  time?: string;
  lessonSchedule?: string;
  totalEur: string;
  courseFeeEur?: string;
  regFeeEur: string;
  isPaidOnline: boolean;
  paymentStatusText: string;
  paymentMethodText?: string;
  bookingId: string;
  notes?: string;
  appUrl: string;
  // Invoicing fields
  pecEmail?: string;
  sdiCode?: string;
  needsCompanyInvoice?: boolean;
  // Stripe details
  stripeSessionId?: string;
  stripePaymentIntentId?: string;
  stripeDashboardUrl?: string;
  createdAtFormatted?: string;
}

export interface ContactEmailTemplateData {
  firstName: string;
  lastName: string;
  email: string;
  phone?: string;
  interest?: string;
  message: string;
  createdAt?: string;
}

/**
 * 1. Client Booking Confirmation Email Template (Landing Page Grid Aesthetics)
 */
export function renderClientBookingConfirmationEmail(data: BookingEmailTemplateData): { subject: string; html: string } {
  const subject = data.isPaidOnline
    ? `Conferma Iscrizione e Pagamento: ${data.courseName} • Atena School`
    : `Conferma Prenotazione: ${data.courseName} • Atena School`;

  const isChild = Boolean(data.isForChild);
  const portalUrl = `${data.appUrl || 'https://app.atenaschool.com'}`;

  const html = `<!DOCTYPE html>
<html lang="it">
<head>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>${subject}</title>
  <!--[if mso]>
  <style type="text/css">
    body, table, td, a { font-family: 'Segoe UI', Arial, sans-serif !important; }
  </style>
  <![endif]-->
</head>
<body style="margin: 0; padding: 0; background-color: #f8fafc; font-family: -apple-system, BlinkMacSystemFont, 'Nunito', 'Segoe UI', Roboto, Helvetica, Arial, sans-serif; -webkit-font-smoothing: antialiased; color: #1e293b;">
  
  <!-- Outer Wrapper with Landing Page Grid Pattern -->
  <table role="presentation" width="100%" border="0" cellspacing="0" cellpadding="0" style="background-color: #f8fafc; background-image: linear-gradient(to right, rgba(4, 53, 105, 0.06) 1px, transparent 1px), linear-gradient(to bottom, rgba(4, 53, 105, 0.06) 1px, transparent 1px); background-size: 28px 28px; padding: 40px 16px;">
    <tr>
      <td align="center">
        
        <!-- Main Email Container -->
        <table role="presentation" width="100%" border="0" cellspacing="0" cellpadding="0" style="max-width: 600px; background-color: #ffffff; border-radius: 28px; overflow: hidden; box-shadow: 0 20px 40px -15px rgba(4, 53, 105, 0.08), 0 0 0 1px rgba(226, 232, 240, 0.9);">
          
          <!-- Top Brand Header with Grid Texture & Rating Pill -->
          <tr>
            <td style="background-color: #043569; background-image: linear-gradient(to right, rgba(255, 255, 255, 0.08) 1px, transparent 1px), linear-gradient(to bottom, rgba(255, 255, 255, 0.08) 1px, transparent 1px); background-size: 20px 20px; padding: 40px 32px 32px 32px; text-align: center; color: #ffffff;">
              <table role="presentation" width="100%" border="0" cellspacing="0" cellpadding="0">
                
                <!-- Trust Pill Badge -->
                <tr>
                  <td align="center" style="padding-bottom: 16px;">
                    <div style="display: inline-block; padding: 5px 14px; border-radius: 9999px; background: rgba(255, 255, 255, 0.12); border: 1px solid rgba(255, 255, 255, 0.25); font-size: 11px; font-weight: 800; letter-spacing: 0.5px; color: #ffffff;">
                      <span style="color: #F8861D;">★ 4.9/5</span> • Cambridge, Trinity & EIPASS
                    </div>
                  </td>
                </tr>

                <!-- Logo Lockup -->
                <tr>
                  <td align="center">
                    <div style="font-size: 26px; font-weight: 900; letter-spacing: 2px; color: #ffffff; text-transform: uppercase;">
                      ATENA <span style="color: #F8861D;">SCHOOL</span>
                    </div>
                    <div style="font-size: 11px; font-weight: 600; color: #94a3b8; letter-spacing: 2px; text-transform: uppercase; margin-top: 4px;">
                      Cittanova • Scuola di Lingue & Formazione
                    </div>
                  </td>
                </tr>

                <!-- Status Pill -->
                <tr>
                  <td align="center" style="padding-top: 22px;">
                    <div style="display: inline-block; padding: 7px 18px; border-radius: 9999px; background-color: ${data.isPaidOnline ? '#10b981' : '#f59e0b'}; color: #ffffff; font-size: 12px; font-weight: 800; letter-spacing: 0.5px; text-transform: uppercase; box-shadow: 0 4px 12px rgba(0, 0, 0, 0.15);">
                      ${data.isPaidOnline ? '✓ Pagamento Confermato (Stripe)' : '⏳ Prenotazione Confermata • Saldo in Sede'}
                    </div>
                  </td>
                </tr>

              </table>
            </td>
          </tr>

          <!-- Main Body Section -->
          <tr>
            <td style="padding: 36px 32px 28px 32px;">
              
              <!-- Greeting & Main Message -->
              <h1 style="margin: 0 0 10px 0; font-size: 22px; font-weight: 900; color: #043569; letter-spacing: -0.5px; line-height: 1.3;">
                Grazie per la tua iscrizione, ${data.purchaserName}!
              </h1>
              
              <p style="margin: 0 0 26px 0; font-size: 14px; line-height: 1.6; color: #475569;">
                ${data.isPaidOnline 
                  ? `La tua iscrizione al corso <strong>${data.courseName}</strong> è confermata e il pagamento è andato a buon fine. Qui sotto trovi tutti i dettagli del tuo percorso formativo.`
                  : `La tua prenotazione per il corso <strong>${data.courseName}</strong> è stata registrata con successo. Il saldo potrà essere effettuato comodamente in sede prima dell'inizio delle lezioni.`}
              </p>

              <!-- Course Summary Card with Subtle Grid Inside -->
              <table role="presentation" width="100%" border="0" cellspacing="0" cellpadding="0" style="background-color: #f8fafc; background-image: linear-gradient(to right, rgba(4, 53, 105, 0.04) 1px, transparent 1px), linear-gradient(to bottom, rgba(4, 53, 105, 0.04) 1px, transparent 1px); background-size: 20px 20px; border-radius: 20px; border: 1px solid #e2e8f0; margin-bottom: 28px; overflow: hidden;">
                
                <!-- Card Header -->
                <tr>
                  <td style="padding: 16px 20px; background-color: #ffffff; border-bottom: 1px solid #e2e8f0;">
                    <table role="presentation" width="100%" border="0" cellspacing="0" cellpadding="0">
                      <tr>
                        <td>
                          <span style="display: inline-block; width: 8px; height: 8px; border-radius: 50%; background-color: #F8861D; margin-right: 8px; vertical-align: middle;"></span>
                          <span style="font-size: 12px; font-weight: 900; text-transform: uppercase; letter-spacing: 1px; color: #043569; vertical-align: middle;">
                            Riepilogo Iscrizione
                          </span>
                        </td>
                        <td align="right">
                          <span style="font-size: 11px; font-weight: 700; color: #64748b; background: #f1f5f9; padding: 3px 8px; border-radius: 6px;">
                            ${data.bookingId}
                          </span>
                        </td>
                      </tr>
                    </table>
                  </td>
                </tr>

                <!-- Card Content Rows -->
                <tr>
                  <td style="padding: 20px;">
                    <table role="presentation" width="100%" border="0" cellspacing="0" cellpadding="0">
                      
                      <!-- Course -->
                      <tr>
                        <td style="padding: 7px 0; font-size: 13px; color: #64748b; font-weight: 600;">Corso:</td>
                        <td align="right" style="padding: 7px 0; font-size: 13px; font-weight: 800; color: #043569;">${data.courseName}</td>
                      </tr>

                      <!-- Purchaser -->
                      <tr>
                        <td style="padding: 7px 0; font-size: 13px; color: #64748b; font-weight: 600;">Acquirente / Referente:</td>
                        <td align="right" style="padding: 7px 0; font-size: 13px; font-weight: 700; color: #1e293b;">${data.purchaserName}</td>
                      </tr>

                      <!-- Student (if child) -->
                      ${isChild ? `
                      <tr>
                        <td style="padding: 7px 0; font-size: 13px; color: #64748b; font-weight: 600;">Studente (Allievo):</td>
                        <td align="right" style="padding: 7px 0; font-size: 13px; font-weight: 800; color: #043569;">${data.studentName}</td>
                      </tr>
                      ${data.studentBirthDate ? `
                      <tr>
                        <td style="padding: 7px 0; font-size: 13px; color: #64748b; font-weight: 600;">Data di nascita studente:</td>
                        <td align="right" style="padding: 7px 0; font-size: 13px; font-weight: 700; color: #1e293b;">${data.studentBirthDate}</td>
                      </tr>
                      ` : ''}
                      ` : ''}

                      <!-- Date & Schedule -->
                      <tr>
                        <td style="padding: 7px 0; font-size: 13px; color: #64748b; font-weight: 600;">Data inizio corso:</td>
                        <td align="right" style="padding: 7px 0; font-size: 13px; font-weight: 700; color: #1e293b;">${data.date || 'Da concordare con la segreteria'}</td>
                      </tr>

                      ${data.lessonSchedule || data.time ? `
                      <tr>
                        <td style="padding: 7px 0; font-size: 13px; color: #64748b; font-weight: 600;">Orario e Frequenza:</td>
                        <td align="right" style="padding: 7px 0; font-size: 13px; font-weight: 700; color: #1e293b;">${data.lessonSchedule || data.time}</td>
                      </tr>
                      ` : ''}

                      <!-- Registration Fee -->
                      ${Number(data.regFeeEur) > 0 ? `
                      <tr>
                        <td style="padding: 7px 0; font-size: 13px; color: #64748b; font-weight: 600;">Quota associativa annuale:</td>
                        <td align="right" style="padding: 7px 0; font-size: 13px; font-weight: 700; color: #1e293b;">€${data.regFeeEur}</td>
                      </tr>
                      ` : ''}

                      <!-- Dashed Divider -->
                      <tr>
                        <td colspan="2" style="padding-top: 12px; border-top: 1px dashed #cbd5e1;"></td>
                      </tr>

                      <!-- Total Highlight -->
                      <tr>
                        <td style="padding: 6px 0; font-size: 14px; font-weight: 900; color: #043569;">
                          Totale ${data.isPaidOnline ? 'Versato' : 'Da Saldare'}:
                        </td>
                        <td align="right" style="padding: 6px 0; font-size: 20px; font-weight: 900; color: #F8861D;">
                          €${data.totalEur}
                        </td>
                      </tr>

                    </table>
                  </td>
                </tr>
              </table>

              <!-- Primary CTA Button (Atena Style) -->
              <table role="presentation" width="100%" border="0" cellspacing="0" cellpadding="0" style="margin-bottom: 26px;">
                <tr>
                  <td align="center">
                    <a href="${portalUrl}" target="_blank" style="display: block; width: 100%; box-sizing: border-box; background: linear-gradient(135deg, #043569 0%, #032448 100%); color: #ffffff; font-size: 15px; font-weight: 800; text-align: center; text-decoration: none; padding: 18px 28px; border-radius: 14px; box-shadow: 0 10px 20px -5px rgba(4, 53, 105, 0.35); border: 1px solid rgba(255, 255, 255, 0.15);">
                      Accedi al Portale Studente <span style="color: #F8861D; margin-left: 6px;">→</span>
                    </a>
                  </td>
                </tr>
              </table>

              <!-- Next Steps Notice Box -->
              <table role="presentation" width="100%" border="0" cellspacing="0" cellpadding="0" style="background-color: #fffaf5; border: 1px solid #fed7aa; border-radius: 16px; padding: 16px 18px; margin-bottom: 24px;">
                <tr>
                  <td>
                    <div style="font-size: 13px; font-weight: 800; color: #c2410c; margin-bottom: 4px;">
                      📍 Sede delle lezioni & Segreteria:
                    </div>
                    <div style="font-size: 12px; line-height: 1.55; color: #9a3412;">
                      Le lezioni si tengono presso la nostra sede in <strong>Via Matteotti 11, Cittanova (RC)</strong>. Per qualsiasi variazione di orario o richiesta di materiale didattico, puoi contattarci direttamente su WhatsApp al <strong>+39 375 605 2362</strong>.
                    </div>
                  </td>
                </tr>
              </table>

              <!-- Booking Reference Text -->
              <div style="text-align: center; font-size: 11px; color: #94a3b8;">
                Prenotazione verificata • ID Univoco: <code style="font-family: monospace; background: #f1f5f9; padding: 3px 8px; border-radius: 6px; color: #475569; font-weight: 700;">${data.bookingId}</code>
              </div>

            </td>
          </tr>

          <!-- Footer with Clean Atena Branding -->
          <tr>
            <td style="background-color: #f8fafc; border-top: 1px solid #e2e8f0; padding: 32px; text-align: center;">
              
              <div style="font-size: 14px; font-weight: 900; color: #043569; letter-spacing: 0.5px; margin-bottom: 6px;">
                Atena School S.r.l.s.
              </div>
              
              <div style="font-size: 12px; color: #64748b; line-height: 1.6; margin-bottom: 16px;">
                Via Matteotti 11, 89022 Cittanova (RC), Italia<br>
                Tel: +39 375 605 2362 • Fisso: 0966 447052 • Email: <a href="mailto:atenaschool20@gmail.com" style="color: #043569; font-weight: 700; text-decoration: underline;">atenaschool20@gmail.com</a>
              </div>

              <div style="font-size: 11px; color: #94a3b8; font-weight: 600;">
                © 2026 Atena School. Tutti i diritti riservati. Centro Autorizzato Cambridge & EIPASS.
              </div>

            </td>
          </tr>

        </table>

      </td>
    </tr>
  </table>
</body>
</html>`;

  return { subject, html };
}

/**
 * 2. Admin Booking Notification Email Template (Complete CRM & Stripe Report)
 */
export function renderAdminBookingNotificationEmail(data: BookingEmailTemplateData): { subject: string; html: string } {
  const subject = `🚨 [Nuova Iscrizione] ${data.courseName} • ${data.studentName} (€${data.totalEur} - ${data.paymentStatusText})`;

  const cleanPhone = (data.purchaserPhone || '').replace(/[^0-9+]/g, '');
  const waNumber = cleanPhone.startsWith('+') ? cleanPhone.slice(1) : (cleanPhone.startsWith('39') ? cleanPhone : `39${cleanPhone}`);
  const whatsappUrl = cleanPhone ? `https://wa.me/${waNumber}` : null;
  const stripeDashboardUrl = data.stripeDashboardUrl || (data.stripePaymentIntentId ? `https://dashboard.stripe.com/payments/${data.stripePaymentIntentId}` : null);

  const html = `<!DOCTYPE html>
<html lang="it">
<head>
  <meta charset="utf-8">
  <title>${subject}</title>
</head>
<body style="margin: 0; padding: 0; background-color: #f8fafc; font-family: -apple-system, BlinkMacSystemFont, 'Nunito', 'Segoe UI', Roboto, sans-serif; color: #0f172a;">
  
  <table role="presentation" width="100%" border="0" cellspacing="0" cellpadding="0" style="background-color: #f8fafc; background-image: linear-gradient(to right, rgba(4, 53, 105, 0.06) 1px, transparent 1px), linear-gradient(to bottom, rgba(4, 53, 105, 0.06) 1px, transparent 1px); background-size: 28px 28px; padding: 40px 16px;">
    <tr>
      <td align="center">
        
        <table role="presentation" width="100%" border="0" cellspacing="0" cellpadding="0" style="max-width: 620px; background-color: #ffffff; border-radius: 28px; overflow: hidden; box-shadow: 0 20px 40px -15px rgba(4, 53, 105, 0.08); border: 1px solid #e2e8f0;">
          
          <!-- Admin Header -->
          <tr>
            <td style="background: linear-gradient(135deg, #043569 0%, #022040 100%); padding: 30px 32px; color: #ffffff;">
              <table role="presentation" width="100%" border="0" cellspacing="0" cellpadding="0">
                <tr>
                  <td>
                    <div style="font-size: 11px; font-weight: 800; color: #F8861D; text-transform: uppercase; letter-spacing: 1px; margin-bottom: 4px;">
                      Notifica Segreteria Atena CRM
                    </div>
                    <div style="font-size: 20px; font-weight: 900; color: #ffffff; letter-spacing: -0.3px;">
                      📋 Nuova Iscrizione Corso Ricevuta
                    </div>
                  </td>
                  <td align="right" valign="middle">
                    <span style="display: inline-block; font-size: 11px; font-weight: 800; padding: 6px 14px; border-radius: 9999px; background: ${data.isPaidOnline ? '#10b981' : '#f59e0b'}; color: #ffffff; text-transform: uppercase; letter-spacing: 0.5px;">
                      ${data.isPaidOnline ? '✓ Pagato Online' : '⏳ Saldo in Sede'}
                    </span>
                  </td>
                </tr>
              </table>
            </td>
          </tr>

          <!-- Admin Main Content -->
          <tr>
            <td style="padding: 32px;">

              <!-- SECTION 1: Corso & Orari -->
              <div style="font-size: 12px; font-weight: 900; text-transform: uppercase; letter-spacing: 1px; color: #043569; margin-bottom: 8px; border-bottom: 2px solid #043569; padding-bottom: 4px;">
                📚 1. Dettagli del Corso & Calendario
              </div>

              <table width="100%" cellpadding="8" cellspacing="0" style="font-size: 13px; line-height: 1.5; border-collapse: collapse; margin-bottom: 20px;">
                <tr style="background: #f8fafc;">
                  <td style="font-weight: 700; width: 38%; color: #64748b;">Corso Richiesto:</td>
                  <td style="font-weight: 900; color: #043569; font-size: 14px;">${data.courseName}</td>
                </tr>
                <tr>
                  <td style="font-weight: 700; color: #64748b;">Data Primo Incontro:</td>
                  <td><strong>${data.date || 'Da concordare con la segreteria'}</strong></td>
                </tr>
                <tr style="background: #f8fafc;">
                  <td style="font-weight: 700; color: #64748b;">Orario & Frequenza:</td>
                  <td><strong>${data.lessonSchedule || data.time || 'Non specificato'}</strong></td>
                </tr>
                <tr>
                  <td style="font-weight: 700; color: #64748b;">Sede / Modalità:</td>
                  <td><span style="font-weight: 700; color: #043569;">In Presenza (Sede Cittanova, Via Matteotti 11)</span></td>
                </tr>
              </table>

              <!-- SECTION 2: Dati Acquirente / Referente -->
              <div style="font-size: 12px; font-weight: 900; text-transform: uppercase; letter-spacing: 1px; color: #043569; margin-bottom: 8px; border-bottom: 2px solid #043569; padding-bottom: 4px;">
                👤 2. Anagrafica Acquirente (Contatti & Fiscale)
              </div>

              <table width="100%" cellpadding="8" cellspacing="0" style="font-size: 13px; line-height: 1.5; border-collapse: collapse; margin-bottom: 20px;">
                <tr style="background: #f8fafc;">
                  <td style="font-weight: 700; width: 38%; color: #64748b;">Nome e Cognome:</td>
                  <td style="font-weight: 800; color: #1e293b;">${data.purchaserName}</td>
                </tr>
                <tr>
                  <td style="font-weight: 700; color: #64748b;">Email di Contatto:</td>
                  <td><a href="mailto:${data.purchaserEmail}" style="color: #0284c7; font-weight: 700; text-decoration: underline;">${data.purchaserEmail}</a></td>
                </tr>
                <tr style="background: #f8fafc;">
                  <td style="font-weight: 700; color: #64748b;">Telefono / Cellulare:</td>
                  <td>
                    <a href="tel:${cleanPhone}" style="color: #0284c7; font-weight: 800;">${data.purchaserPhone || 'Non indicato'}</a>
                    ${whatsappUrl ? `&nbsp;•&nbsp;<a href="${whatsappUrl}" target="_blank" style="color: #16a34a; font-weight: 800; text-decoration: none;">💬 Apri WhatsApp</a>` : ''}
                  </td>
                </tr>
                <tr>
                  <td style="font-weight: 700; color: #64748b;">Codice Fiscale Acquirente:</td>
                  <td><code style="font-family: monospace; font-weight: 800; background: #f1f5f9; padding: 2px 6px; border-radius: 4px; color: #334155;">${data.purchaserTaxCode || 'N/D'}</code></td>
                </tr>
                ${data.needsCompanyInvoice ? `
                <tr style="background: #fefce8;">
                  <td style="font-weight: 700; color: #854d0e;">Fattura Aziendale Richiesta:</td>
                  <td style="color: #854d0e; font-weight: 700;">PEC: <code>${data.pecEmail || 'N/D'}</code> • Codice SDI: <code>${data.sdiCode || 'N/D'}</code></td>
                </tr>
                ` : ''}
              </table>

              <!-- SECTION 3: Studente (se per minore / terzi) -->
              ${data.isForChild ? `
              <div style="font-size: 12px; font-weight: 900; text-transform: uppercase; letter-spacing: 1px; color: #1e40af; margin-bottom: 8px; border-bottom: 2px solid #3b82f6; padding-bottom: 4px;">
                👶 3. Dati Studente (Minore / Allievo)
              </div>

              <table width="100%" cellpadding="8" cellspacing="0" style="font-size: 13px; line-height: 1.5; border-collapse: collapse; margin-bottom: 20px; background: #f0f7ff; border-radius: 12px; overflow: hidden; border: 1px solid #bfdbfe;">
                <tr>
                  <td style="font-weight: 700; width: 38%; color: #1e40af;">Nome Studente:</td>
                  <td style="font-weight: 900; color: #1e40af; font-size: 14px;">${data.studentName}</td>
                </tr>
                <tr style="background: #e0f2fe;">
                  <td style="font-weight: 700; color: #1e40af;">Codice Fiscale Studente:</td>
                  <td><code style="font-family: monospace; font-weight: 800; color: #0369a1;">${data.studentTaxCode || 'N/D'}</code></td>
                </tr>
                <tr>
                  <td style="font-weight: 700; color: #1e40af;">Data di Nascita Allievo:</td>
                  <td><strong>${data.studentBirthDate || 'N/D'}</strong></td>
                </tr>
              </table>
              ` : ''}

              <!-- SECTION 4: Riepilogo Economico -->
              <div style="font-size: 12px; font-weight: 900; text-transform: uppercase; letter-spacing: 1px; color: #043569; margin-bottom: 8px; border-bottom: 2px solid #043569; padding-bottom: 4px;">
                💰 4. Riepilogo Economico & Pagamento
              </div>

              <table width="100%" cellpadding="8" cellspacing="0" style="font-size: 13px; line-height: 1.5; border-collapse: collapse; margin-bottom: 20px;">
                <tr style="background: #f8fafc;">
                  <td style="font-weight: 700; width: 38%; color: #64748b;">Quota Corso:</td>
                  <td>€${data.courseFeeEur || (Number(data.totalEur) - Number(data.regFeeEur)).toFixed(2)}</td>
                </tr>
                <tr>
                  <td style="font-weight: 700; color: #64748b;">Quota Iscrizione Annuale (€30):</td>
                  <td>€${data.regFeeEur}</td>
                </tr>
                <tr style="background: #f8fafc;">
                  <td style="font-weight: 800; color: #043569; font-size: 14px;">Totale ${data.isPaidOnline ? 'Incassato' : 'Da Incassare'}:</td>
                  <td style="font-size: 18px; font-weight: 900; color: #F8861D;">€${data.totalEur}</td>
                </tr>
                <tr>
                  <td style="font-weight: 700; color: #64748b;">Stato & Metodo di Pagamento:</td>
                  <td><strong>${data.paymentStatusText}</strong> ${data.paymentMethodText ? `(${data.paymentMethodText})` : ''}</td>
                </tr>
              </table>

              <!-- SECTION 5: Stripe & Dati Tecnici CRM -->
              ${data.isPaidOnline ? `
              <div style="font-size: 12px; font-weight: 900; text-transform: uppercase; letter-spacing: 1px; color: #6366f1; margin-bottom: 8px; border-bottom: 2px solid #6366f1; padding-bottom: 4px;">
                💳 5. Dati Transazione Stripe & Webhook
              </div>

              <table width="100%" cellpadding="8" cellspacing="0" style="font-size: 12px; line-height: 1.5; border-collapse: collapse; margin-bottom: 20px; background: #faf5ff; border: 1px solid #e9d5ff; border-radius: 12px;">
                <tr>
                  <td style="font-weight: 700; width: 38%; color: #6b21a8;">Payment Intent ID:</td>
                  <td><code style="font-family: monospace; font-size: 11px;">${data.stripePaymentIntentId || 'pi_auto_generated'}</code></td>
                </tr>
                ${data.stripeSessionId ? `
                <tr style="background: #f3e8ff;">
                  <td style="font-weight: 700; color: #6b21a8;">Checkout Session ID:</td>
                  <td><code style="font-family: monospace; font-size: 11px;">${data.stripeSessionId}</code></td>
                </tr>
                ` : ''}
                <tr>
                  <td style="font-weight: 700; color: #6b21a8;">Dashboard Stripe:</td>
                  <td>
                    ${stripeDashboardUrl ? `
                    <a href="${stripeDashboardUrl}" target="_blank" style="color: #6366f1; font-weight: 800; text-decoration: underline;">
                      ↗ Apri Pagamento su Stripe Dashboard
                    </a>
                    ` : '<span style="color: #94a3b8;">N/D</span>'}
                  </td>
                </tr>
              </table>
              ` : ''}

              <!-- SECTION 6: Note & Richieste del Cliente -->
              ${data.notes ? `
              <div style="background-color: #fef2f2; border: 1px solid #fecaca; border-radius: 14px; padding: 16px; margin-bottom: 24px;">
                <div style="font-size: 11px; font-weight: 900; text-transform: uppercase; color: #991b1b; letter-spacing: 0.5px; margin-bottom: 4px;">
                  📝 Note & Richieste Speciali del Cliente:
                </div>
                <div style="font-size: 13px; line-height: 1.5; color: #7f1d1d; font-style: italic;">
                  "${data.notes}"
                </div>
              </div>
              ` : ''}

              <!-- Quick Action Buttons for Admin -->
              <table role="presentation" width="100%" border="0" cellspacing="0" cellpadding="0" style="margin-bottom: 16px;">
                <tr>
                  <td align="center" style="padding-bottom: 8px;">
                    ${whatsappUrl ? `
                    <a href="${whatsappUrl}" target="_blank" style="display: block; width: 100%; box-sizing: border-box; background: #16a34a; color: #ffffff; font-size: 13px; font-weight: 800; text-align: center; text-decoration: none; padding: 14px 20px; border-radius: 12px; margin-bottom: 8px;">
                      💬 Contatta Subito su WhatsApp (+${waNumber}) →
                    </a>
                    ` : ''}
                    <a href="mailto:${data.purchaserEmail}?subject=Conferma%20Iscrizione%20Corso%20${encodeURIComponent(data.courseName)}%20-%20Atena%20School" style="display: block; width: 100%; box-sizing: border-box; background: #043569; color: #ffffff; font-size: 13px; font-weight: 800; text-align: center; text-decoration: none; padding: 14px 20px; border-radius: 12px;">
                      ✉️ Invia Email al Cliente (${data.purchaserEmail}) →
                    </a>
                  </td>
                </tr>
              </table>

              <!-- Footer CRM ID -->
              <div style="background: #f8fafc; border: 1px solid #e2e8f0; border-radius: 12px; padding: 12px; text-align: center; font-size: 11px; color: #64748b;">
                ID Prenotazione CRM: <code style="font-weight: 800; color: #043569;">${data.bookingId}</code> • Registrato in Atena School Database
              </div>

            </td>
          </tr>

        </table>

      </td>
    </tr>
  </table>
</body>
</html>`;

  return { subject, html };
}

/**
 * 3. Contact Form Submission Notification Email (Landing Page Grid Aesthetics)
 */
export function renderContactFormAdminEmail(data: ContactEmailTemplateData): { subject: string; html: string } {
  const subject = `💬 Nuovo Messaggio dal Sito: ${data.firstName} ${data.lastName} [${data.interest || 'Informazioni'}]`;
  const cleanPhone = (data.phone || '').replace(/[^0-9+]/g, '');
  const waNumber = cleanPhone.startsWith('+') ? cleanPhone.slice(1) : (cleanPhone.startsWith('39') ? cleanPhone : `39${cleanPhone}`);
  const whatsappUrl = cleanPhone ? `https://wa.me/${waNumber}` : null;

  const html = `<!DOCTYPE html>
<html lang="it">
<head>
  <meta charset="utf-8">
  <title>${subject}</title>
</head>
<body style="margin: 0; padding: 0; background-color: #f8fafc; font-family: -apple-system, BlinkMacSystemFont, 'Nunito', 'Segoe UI', Roboto, sans-serif; color: #0f172a;">
  
  <table role="presentation" width="100%" border="0" cellspacing="0" cellpadding="0" style="background-color: #f8fafc; background-image: linear-gradient(to right, rgba(4, 53, 105, 0.06) 1px, transparent 1px), linear-gradient(to bottom, rgba(4, 53, 105, 0.06) 1px, transparent 1px); background-size: 28px 28px; padding: 40px 16px;">
    <tr>
      <td align="center">
        
        <table role="presentation" width="100%" border="0" cellspacing="0" cellpadding="0" style="max-width: 600px; background-color: #ffffff; border-radius: 24px; overflow: hidden; box-shadow: 0 20px 40px -15px rgba(4, 53, 105, 0.08); border: 1px solid #e2e8f0;">
          
          <!-- Header -->
          <tr>
            <td style="background-color: #043569; padding: 28px 32px; color: #ffffff;">
              <table role="presentation" width="100%" border="0" cellspacing="0" cellpadding="0">
                <tr>
                  <td>
                    <div style="font-size: 11px; font-weight: 800; color: #F8861D; text-transform: uppercase; letter-spacing: 1px; margin-bottom: 4px;">
                      Modulo di Contatto Online
                    </div>
                    <div style="font-size: 20px; font-weight: 900; color: #ffffff;">
                      ✉️ Nuova Richiesta Informazioni
                    </div>
                  </td>
                </tr>
              </table>
            </td>
          </tr>

          <!-- Body -->
          <tr>
            <td style="padding: 28px 32px;">
              
              <table width="100%" cellpadding="8" cellspacing="0" style="font-size: 13px; line-height: 1.5; border-collapse: collapse; margin-bottom: 20px;">
                <tr style="background: #f8fafc;">
                  <td style="font-weight: 700; width: 35%; color: #64748b;">Nome e Cognome:</td>
                  <td style="font-weight: 900; color: #043569;">${data.firstName} ${data.lastName}</td>
                </tr>
                <tr>
                  <td style="font-weight: 700; color: #64748b;">Email Cliente:</td>
                  <td><a href="mailto:${data.email}" style="color: #0284c7; font-weight: 700; text-decoration: underline;">${data.email}</a></td>
                </tr>
                <tr style="background: #f8fafc;">
                  <td style="font-weight: 700; color: #64748b;">Telefono / WhatsApp:</td>
                  <td>
                    ${data.phone ? `
                    <a href="tel:${cleanPhone}" style="color: #0284c7; font-weight: 800;">${data.phone}</a>
                    ${whatsappUrl ? `&nbsp;•&nbsp;<a href="${whatsappUrl}" target="_blank" style="color: #16a34a; font-weight: 800; text-decoration: none;">💬 WhatsApp</a>` : ''}
                    ` : '<span style="color: #94a3b8;">Non indicato</span>'}
                  </td>
                </tr>
                <tr>
                  <td style="font-weight: 700; color: #64748b;">Corso di Interesse:</td>
                  <td><span style="display: inline-block; padding: 3px 10px; border-radius: 9999px; background: #fff5eb; color: #c2410c; font-weight: 800; font-size: 12px; border: 1px solid #fed7aa;">${data.interest || 'Informazioni Generali'}</span></td>
                </tr>
              </table>

              <!-- Message Block -->
              <div style="background-color: #f8fafc; background-image: linear-gradient(to right, rgba(4, 53, 105, 0.04) 1px, transparent 1px), linear-gradient(to bottom, rgba(4, 53, 105, 0.04) 1px, transparent 1px); background-size: 20px 20px; border: 1px solid #e2e8f0; border-radius: 16px; padding: 20px; margin-bottom: 24px;">
                <div style="font-size: 11px; font-weight: 900; text-transform: uppercase; color: #043569; letter-spacing: 0.5px; margin-bottom: 8px;">
                  💬 Messaggio inviato:
                </div>
                <div style="font-size: 14px; line-height: 1.6; color: #1e293b; white-space: pre-wrap;">
                  ${data.message || '(Nessun messaggio specificato)'}
                </div>
              </div>

              <!-- Action Buttons -->
              <table role="presentation" width="100%" border="0" cellspacing="0" cellpadding="0">
                <tr>
                  <td>
                    ${whatsappUrl ? `
                    <a href="${whatsappUrl}" target="_blank" style="display: block; box-sizing: border-box; background: #16a34a; color: #ffffff; padding: 14px 20px; border-radius: 12px; font-size: 13px; font-weight: 800; text-align: center; text-decoration: none; margin-bottom: 8px;">
                      💬 Rispondi su WhatsApp (+${waNumber}) →
                    </a>
                    ` : ''}
                    <a href="mailto:${data.email}?subject=Re:%20Richiesta%20informazioni%20Atena%20School" style="display: block; box-sizing: border-box; background: #043569; color: #ffffff; padding: 14px 20px; border-radius: 12px; font-size: 13px; font-weight: 800; text-align: center; text-decoration: none;">
                      ✉️ Rispondi via Email (${data.email}) →
                    </a>
                  </td>
                </tr>
              </table>

            </td>
          </tr>

        </table>

      </td>
    </tr>
  </table>
</body>
</html>`;

  return { subject, html };
}
