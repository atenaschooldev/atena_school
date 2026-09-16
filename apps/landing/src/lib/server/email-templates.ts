export interface BookingEmailTemplateData {
  courseName: string;
  purchaserName: string;
  studentName: string;
  purchaserEmail: string;
  purchaserPhone?: string;
  purchaserTaxCode?: string;
  isForChild?: boolean;
  studentTaxCode?: string;
  studentBirthDate?: string;
  date?: string;
  time?: string;
  totalEur: string;
  regFeeEur: string;
  isPaidOnline: boolean;
  paymentStatusText: string;
  bookingId: string;
  notes?: string;
  appUrl: string;
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
 * 1. Client Booking Confirmation Email Template
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
    body, table, td, a { font-family: Arial, sans-serif !important; }
  </style>
  <![endif]-->
</head>
<body style="margin: 0; padding: 0; background-color: #f1f5f9; font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif; -webkit-font-smoothing: antialiased; color: #1e293b;">
  <table role="presentation" width="100%" border="0" cellspacing="0" cellpadding="0" style="background-color: #f1f5f9; padding: 32px 12px;">
    <tr>
      <td align="center">
        <!-- Main Email Container -->
        <table role="presentation" width="100%" border="0" cellspacing="0" cellpadding="0" style="max-width: 600px; background-color: #ffffff; border-radius: 24px; overflow: hidden; box-shadow: 0 10px 25px -5px rgba(0, 0, 0, 0.05), 0 8px 10px -6px rgba(0, 0, 0, 0.01); border: 1px solid #e2e8f0;">
          
          <!-- Header Banner -->
          <tr>
            <td style="background: linear-gradient(135deg, #043569 0%, #03254c 100%); padding: 36px 32px; text-align: center; color: #ffffff;">
              <table role="presentation" width="100%" border="0" cellspacing="0" cellpadding="0">
                <tr>
                  <td align="center">
                    <div style="font-size: 24px; font-weight: 900; letter-spacing: 2px; color: #ffffff; text-transform: uppercase;">
                      ATENA <span style="color: #F8861D;">SCHOOL</span>
                    </div>
                    <div style="font-size: 11px; font-weight: 600; color: #94a3b8; letter-spacing: 1.5px; text-transform: uppercase; margin-top: 4px;">
                      Cittanova • Scuola di Lingue & Formazione
                    </div>
                  </td>
                </tr>
                <tr>
                  <td align="center" style="padding-top: 20px;">
                    <div style="display: inline-block; padding: 6px 16px; border-radius: 9999px; background-color: ${data.isPaidOnline ? '#10b981' : '#f59e0b'}; color: #ffffff; font-size: 12px; font-weight: 800; letter-spacing: 0.5px; text-transform: uppercase;">
                      ${data.isPaidOnline ? '✓ Pagamento Confermato' : '⏳ Prenotazione Confermata (Saldo in Sede)'}
                    </div>
                  </td>
                </tr>
              </table>
            </td>
          </tr>

          <!-- Body Content -->
          <tr>
            <td style="padding: 36px 32px 24px 32px;">
              <h1 style="margin: 0 0 12px 0; font-size: 20px; font-weight: 800; color: #043569; line-height: 1.3;">
                Grazie per la tua iscrizione, ${data.purchaserName}!
              </h1>
              <p style="margin: 0 0 24px 0; font-size: 14px; line-height: 1.6; color: #475569;">
                ${data.isPaidOnline 
                  ? `Abbiamo ricevuto con successo il tuo pagamento per il corso <strong>${data.courseName}</strong>. Di seguito trovi il riepilogo dettagliato del percorso.`
                  : `La tua prenotazione per il corso <strong>${data.courseName}</strong> è stata confermata. Potrai completare il saldo direttamente presso la nostra segreteria prima dell'inizio delle lezioni.`}
              </p>

              <!-- Booking Details Box -->
              <table role="presentation" width="100%" border="0" cellspacing="0" cellpadding="0" style="background-color: #f8fafc; border-radius: 16px; border: 1px solid #e2e8f0; margin-bottom: 28px; overflow: hidden;">
                <tr>
                  <td style="padding: 16px 20px; background-color: #f1f5f9; border-bottom: 1px solid #e2e8f0;">
                    <span style="font-size: 12px; font-weight: 800; text-transform: uppercase; letter-spacing: 1px; color: #043569;">
                      Riepilogo del Corso & Iscrizione
                    </span>
                  </td>
                </tr>
                <tr>
                  <td style="padding: 16px 20px;">
                    <table role="presentation" width="100%" border="0" cellspacing="0" cellpadding="0">
                      
                      <!-- Course Name -->
                      <tr>
                        <td style="padding: 6px 0; font-size: 13px; color: #64748b; font-weight: 600;">Corso:</td>
                        <td align="right" style="padding: 6px 0; font-size: 13px; font-weight: 700; color: #043569;">${data.courseName}</td>
                      </tr>

                      <!-- Purchaser -->
                      <tr>
                        <td style="padding: 6px 0; font-size: 13px; color: #64748b; font-weight: 600;">Acquirente:</td>
                        <td align="right" style="padding: 6px 0; font-size: 13px; font-weight: 700; color: #1e293b;">${data.purchaserName}</td>
                      </tr>

                      <!-- Student (if child or different) -->
                      ${isChild ? `
                      <tr>
                        <td style="padding: 6px 0; font-size: 13px; color: #64748b; font-weight: 600;">Studente (Allievo):</td>
                        <td align="right" style="padding: 6px 0; font-size: 13px; font-weight: 700; color: #043569;">${data.studentName}</td>
                      </tr>
                      ` : ''}

                      <!-- Date & Schedule -->
                      <tr>
                        <td style="padding: 6px 0; font-size: 13px; color: #64748b; font-weight: 600;">Data inizio / Primo incontro:</td>
                        <td align="right" style="padding: 6px 0; font-size: 13px; font-weight: 700; color: #1e293b;">${data.date || 'Da concordare con la segreteria'}</td>
                      </tr>

                      ${data.time ? `
                      <tr>
                        <td style="padding: 6px 0; font-size: 13px; color: #64748b; font-weight: 600;">Orario lezioni:</td>
                        <td align="right" style="padding: 6px 0; font-size: 13px; font-weight: 700; color: #1e293b;">${data.time}</td>
                      </tr>
                      ` : ''}

                      <!-- Registration Fee if any -->
                      ${Number(data.regFeeEur) > 0 ? `
                      <tr>
                        <td style="padding: 6px 0; font-size: 13px; color: #64748b; font-weight: 600;">Quota associativa annuale:</td>
                        <td align="right" style="padding: 6px 0; font-size: 13px; font-weight: 700; color: #1e293b;">€${data.regFeeEur}</td>
                      </tr>
                      ` : ''}

                      <!-- Total Divider -->
                      <tr>
                        <td colspan="2" style="padding-top: 10px; border-top: 1px dashed #cbd5e1;"></td>
                      </tr>

                      <!-- Total -->
                      <tr>
                        <td style="padding: 6px 0; font-size: 14px; font-weight: 800; color: #043569;">Totale ${data.isPaidOnline ? 'Versato' : 'Da Saldare'}:</td>
                        <td align="right" style="padding: 6px 0; font-size: 18px; font-weight: 900; color: #F8861D;">€${data.totalEur}</td>
                      </tr>

                    </table>
                  </td>
                </tr>
              </table>

              <!-- Action Callout / Portal Button -->
              <table role="presentation" width="100%" border="0" cellspacing="0" cellpadding="0" style="margin-bottom: 28px;">
                <tr>
                  <td align="center">
                    <a href="${portalUrl}" target="_blank" style="display: inline-block; width: 100%; box-sizing: border-box; background-color: #043569; color: #ffffff; font-size: 14px; font-weight: 800; text-align: center; text-decoration: none; padding: 16px 28px; border-radius: 12px; box-shadow: 0 4px 12px rgba(4, 53, 105, 0.2);">
                      Accedi al Tuo Portale Studente →
                    </a>
                  </td>
                </tr>
              </table>

              <!-- Next Steps Info Box -->
              <table role="presentation" width="100%" border="0" cellspacing="0" cellpadding="0" style="background-color: #fff7ed; border-left: 4px solid #F8861D; border-radius: 8px; padding: 16px; margin-bottom: 24px;">
                <tr>
                  <td>
                    <div style="font-size: 13px; font-weight: 700; color: #9a3412; margin-bottom: 4px;">
                      💡 Prossimi passi:
                    </div>
                    <div style="font-size: 12px; line-height: 1.5; color: #7c2d12;">
                      Un nostro tutor ti contatterà telefonicamente o via WhatsApp per confermare il calendario delle lezioni e darti il benvenuto nella nostra sede di Cittanova.
                    </div>
                  </td>
                </tr>
              </table>

              <!-- Booking Reference ID -->
              <p style="margin: 0; font-size: 11px; color: #94a3b8; text-align: center;">
                Codice identificativo prenotazione: <code style="font-family: monospace; background: #e2e8f0; padding: 2px 6px; border-radius: 4px; color: #334155;">${data.bookingId}</code>
              </p>
            </td>
          </tr>

          <!-- Footer -->
          <tr>
            <td style="background-color: #f8fafc; border-top: 1px solid #e2e8f0; padding: 28px 32px; text-align: center;">
              <div style="font-size: 13px; font-weight: 800; color: #043569; margin-bottom: 4px;">
                Atena School S.r.l.s.
              </div>
              <div style="font-size: 12px; color: #64748b; line-height: 1.5; margin-bottom: 12px;">
                Via Matteotti 11, 89022 Cittanova (RC), Italia<br>
                Tel: +39 375 605 2362 • Fisso: 0966 447052 • Email: <a href="mailto:info@atenaschool.com" style="color: #043569; text-decoration: underline;">info@atenaschool.com</a>
              </div>
              <div style="font-size: 11px; color: #94a3b8;">
                © 2026 Atena School. Tutti i diritti riservati. Cambridge, Trinity & EIPASS Exam Centre.
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
 * 2. Admin Booking Notification Email Template
 */
export function renderAdminBookingNotificationEmail(data: BookingEmailTemplateData): { subject: string; html: string } {
  const subject = `🚨 Nuova Prenotazione: ${data.courseName} • ${data.studentName} [€${data.totalEur} - ${data.paymentStatusText}]`;

  const html = `<!DOCTYPE html>
<html lang="it">
<head>
  <meta charset="utf-8">
  <title>${subject}</title>
</head>
<body style="margin: 0; padding: 20px; background-color: #f8fafc; font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif; color: #0f172a;">
  <div style="max-width: 600px; margin: 0 auto; background: #ffffff; border-radius: 16px; border: 1px solid #e2e8f0; padding: 28px; box-shadow: 0 4px 12px rgba(0,0,0,0.04);">
    
    <div style="border-bottom: 2px solid #043569; padding-bottom: 14px; margin-bottom: 20px; display: flex; justify-content: space-between; align-items: center;">
      <h2 style="margin: 0; color: #043569; font-size: 18px;">📋 Nuova Iscrizione Ricevuta</h2>
      <span style="font-size: 12px; font-weight: 800; padding: 4px 10px; border-radius: 6px; background: ${data.isPaidOnline ? '#ecfdf5; color: #059669;' : '#fef3c7; color: #d97706;'}">
        ${data.paymentStatusText}
      </span>
    </div>

    <table width="100%" cellpadding="6" cellspacing="0" style="font-size: 13px; line-height: 1.5; border-collapse: collapse;">
      <tr style="background: #f1f5f9;">
        <td style="font-weight: 700; width: 40%; color: #334155;">Corso Selezionato:</td>
        <td style="font-weight: 800; color: #043569;">${data.courseName}</td>
      </tr>
      <tr>
        <td style="font-weight: 700; color: #334155;">Acquirente / Referente:</td>
        <td><strong>${data.purchaserName}</strong></td>
      </tr>
      <tr style="background: #f8fafc;">
        <td style="font-weight: 700; color: #334155;">Email Acquirente:</td>
        <td><a href="mailto:${data.purchaserEmail}" style="color: #0284c7;">${data.purchaserEmail}</a></td>
      </tr>
      <tr>
        <td style="font-weight: 700; color: #334155;">Telefono / WhatsApp:</td>
        <td><a href="tel:${data.purchaserPhone || ''}" style="color: #0284c7; font-weight: 700;">${data.purchaserPhone || 'Non specificato'}</a></td>
      </tr>
      <tr style="background: #f8fafc;">
        <td style="font-weight: 700; color: #334155;">Codice Fiscale Acquirente:</td>
        <td><code style="font-family: monospace;">${data.purchaserTaxCode || 'N/D'}</code></td>
      </tr>

      ${data.isForChild ? `
      <tr>
        <td colspan="2" style="padding-top: 12px; font-size: 11px; font-weight: 800; color: #64748b; text-transform: uppercase;">
          Dati Studente (Minore)
        </td>
      </tr>
      <tr style="background: #eff6ff;">
        <td style="font-weight: 700; color: #1e40af;">Nome Studente:</td>
        <td style="font-weight: 800; color: #1e40af;">${data.studentName}</td>
      </tr>
      <tr style="background: #eff6ff;">
        <td style="font-weight: 700; color: #1e40af;">Codice Fiscale Studente:</td>
        <td><code style="font-family: monospace;">${data.studentTaxCode || 'N/D'}</code></td>
      </tr>
      <tr style="background: #eff6ff;">
        <td style="font-weight: 700; color: #1e40af;">Data di Nascita Studente:</td>
        <td>${data.studentBirthDate || 'N/D'}</td>
      </tr>
      ` : ''}

      <tr>
        <td colspan="2" style="padding-top: 12px; font-size: 11px; font-weight: 800; color: #64748b; text-transform: uppercase;">
          Dettagli Economici & Orari
        </td>
      </tr>
      <tr style="background: #f8fafc;">
        <td style="font-weight: 700; color: #334155;">Importo Totale:</td>
        <td style="font-size: 16px; font-weight: 900; color: #F8861D;">€${data.totalEur}</td>
      </tr>
      <tr>
        <td style="font-weight: 700; color: #334155;">Quota Iscrizione Inclusa:</td>
        <td>€${data.regFeeEur}</td>
      </tr>
      <tr style="background: #f8fafc;">
        <td style="font-weight: 700; color: #334155;">Data & Orario Richiesti:</td>
        <td><strong>${data.date || 'Da concordare'}</strong> ore <strong>${data.time || 'N/D'}</strong></td>
      </tr>
      ${data.notes ? `
      <tr>
        <td style="font-weight: 700; color: #334155;">Note / Richieste del cliente:</td>
        <td style="color: #b91c1c; font-style: italic;">"${data.notes}"</td>
      </tr>
      ` : ''}
    </table>

    <div style="margin-top: 24px; padding: 12px; background: #f1f5f9; border-radius: 8px; font-size: 11px; color: #64748b; text-align: center;">
      ID Prenotazione: <code>${data.bookingId}</code> • Sistema Atena CRM
    </div>
  </div>
</body>
</html>`;

  return { subject, html };
}

/**
 * 3. Contact Form Submission Notification Email
 */
export function renderContactFormAdminEmail(data: ContactEmailTemplateData): { subject: string; html: string } {
  const subject = `💬 Nuovo Messaggio dal Sito: ${data.firstName} ${data.lastName} [${data.interest || 'Informazioni'}]`;

  const html = `<!DOCTYPE html>
<html lang="it">
<head>
  <meta charset="utf-8">
  <title>${subject}</title>
</head>
<body style="margin: 0; padding: 20px; background-color: #f8fafc; font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif; color: #0f172a;">
  <div style="max-width: 600px; margin: 0 auto; background: #ffffff; border-radius: 16px; border: 1px solid #e2e8f0; padding: 28px; box-shadow: 0 4px 12px rgba(0,0,0,0.04);">
    
    <div style="border-bottom: 2px solid #F8861D; padding-bottom: 14px; margin-bottom: 20px;">
      <h2 style="margin: 0; color: #043569; font-size: 18px;">✉️ Nuovo Contatto dal Modulo Online</h2>
      <div style="font-size: 12px; color: #64748b; margin-top: 4px;">Ricevuto da: ${data.firstName} ${data.lastName}</div>
    </div>

    <table width="100%" cellpadding="8" cellspacing="0" style="font-size: 13px; line-height: 1.5; border-collapse: collapse; margin-bottom: 20px;">
      <tr style="background: #f8fafc;">
        <td style="font-weight: 700; width: 35%; color: #475569;">Nome e Cognome:</td>
        <td style="font-weight: 800; color: #043569;">${data.firstName} ${data.lastName}</td>
      </tr>
      <tr>
        <td style="font-weight: 700; color: #475569;">Email:</td>
        <td><a href="mailto:${data.email}" style="color: #0284c7; font-weight: 700;">${data.email}</a></td>
      </tr>
      <tr style="background: #f8fafc;">
        <td style="font-weight: 700; color: #475569;">Telefono:</td>
        <td>${data.phone ? `<a href="tel:${data.phone}" style="color: #0284c7; font-weight: 700;">${data.phone}</a>` : '<span style="color: #94a3b8;">Non indicato</span>'}</td>
      </tr>
      <tr>
        <td style="font-weight: 700; color: #475569;">Interesse:</td>
        <td><span style="display: inline-block; padding: 2px 8px; border-radius: 6px; background: #fef3c7; color: #92400e; font-weight: 700; font-size: 12px;">${data.interest || 'Generale'}</span></td>
      </tr>
    </table>

    <div style="background: #f8fafc; border: 1px solid #e2e8f0; border-radius: 12px; padding: 16px; margin-bottom: 24px;">
      <div style="font-size: 11px; font-weight: 800; text-transform: uppercase; color: #64748b; margin-bottom: 8px;">Messaggio del cliente:</div>
      <div style="font-size: 14px; line-height: 1.6; color: #1e293b; white-space: pre-wrap;">${data.message || '(Nessun messaggio scritto)'}</div>
    </div>

    <div style="text-align: center;">
      <a href="mailto:${data.email}?subject=Re:%20Richiesta%20informazioni%20Atena%20School" style="display: inline-block; background: #043569; color: #ffffff; padding: 12px 24px; border-radius: 10px; font-size: 13px; font-weight: 700; text-decoration: none;">
        Rispondi Subito via Email →
      </a>
    </div>

  </div>
</body>
</html>`;

  return { subject, html };
}
