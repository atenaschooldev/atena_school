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

export function renderClientBookingConfirmationEmail(data: BookingEmailTemplateData): { subject: string; html: string } {
  const subject = data.isPaidOnline
    ? `Conferma Pagamento e Iscrizione: ${data.courseName} - Atena School`
    : `Conferma Prenotazione: ${data.courseName} - Atena School`;

  const html = `
    <!DOCTYPE html>
    <html>
      <head>
        <meta charset="utf-8">
        <style>
          body { font-family: 'Helvetica Neue', Arial, sans-serif; background-color: #f8fafc; color: #1e293b; margin: 0; padding: 24px; }
          .card { max-width: 580px; margin: 0 auto; background: #ffffff; border-radius: 16px; border: 1px solid #e2e8f0; padding: 32px; box-shadow: 0 4px 12px rgba(0,0,0,0.05); }
          .header { text-align: center; border-bottom: 2px solid #f1f5f9; padding-bottom: 20px; margin-bottom: 24px; }
          .logo { font-size: 22px; font-weight: 900; color: #043569; letter-spacing: 1px; }
          .badge { display: inline-block; padding: 6px 14px; border-radius: 99px; font-size: 11px; font-weight: 800; text-transform: uppercase; background: ${data.isPaidOnline ? '#ecfdf5; color: #047857;' : '#fffbeb; color: #b45309;'}; margin-top: 10px; }
          .row { display: flex; justify-content: space-between; padding: 8px 0; border-bottom: 1px solid #f8fafc; font-size: 14px; }
          .label { color: #64748b; font-weight: 500; }
          .val { font-weight: 700; color: #0f172a; }
          .total-box { background: #f8fafc; border-radius: 12px; padding: 16px; margin: 20px 0; }
          .btn { display: block; text-align: center; background: #043569; color: #ffffff !important; font-weight: 700; text-decoration: none; padding: 14px 24px; border-radius: 12px; margin-top: 24px; font-size: 14px; }
          .footer { font-size: 12px; color: #94a3b8; text-align: center; margin-top: 24px; }
        </style>
      </head>
      <body>
        <div class="card">
          <div class="header">
            <div class="logo">ATENA SCHOOL</div>
            <div class="badge">${data.paymentStatusText}</div>
          </div>
          <h2 style="color: #043569; font-size: 18px; margin-bottom: 8px;">Grazie per la tua prenotazione, ${data.purchaserName}!</h2>
          <p style="font-size: 14px; color: #475569; line-height: 1.5;">La tua richiesta per il corso <strong>${data.courseName}</strong> è stata registrata con successo.</p>
          
          <div class="total-box">
            <div class="row"><span class="label">Studente:</span><span class="val">${data.studentName}</span></div>
            <div class="row"><span class="label">Data inizio:</span><span class="val">${data.date || 'Da concordare'}</span></div>
            <div class="row"><span class="label">Orario:</span><span class="val">${data.time || '16:00'}</span></div>
            ${Number(data.regFeeEur) > 0 ? `<div class="row"><span class="label">Quota iscrizione annuale:</span><span class="val">€${data.regFeeEur}</span></div>` : ''}
            <div class="row" style="border: none; font-size: 16px; margin-top: 8px;"><span class="label" style="font-weight: 800; color: #043569;">Totale:</span><span class="val" style="font-size: 18px; color: #f8861d;">€${data.totalEur}</span></div>
          </div>

          <a href="${data.appUrl}" class="btn">Accedi al tuo Portale Studente</a>
          
          <div class="footer">
            Atena School — Via Matteotti 11, 89022 Cittanova (RC)<br>
            Per qualsiasi informazione o supporto: info@atenaschool.com
          </div>
        </div>
      </body>
    </html>
  `;

  return { subject, html };
}

export function renderAdminBookingNotificationEmail(data: BookingEmailTemplateData): { subject: string; html: string } {
  const subject = `[Nuova Prenotazione] ${data.courseName} - ${data.studentName} (${data.paymentStatusText})`;

  const html = `
    <div style="font-family: sans-serif; padding: 20px;">
      <h2 style="color: #043569;">Nuova prenotazione ricevuta dal sito web</h2>
      <p><strong>Corso:</strong> ${data.courseName}</p>
      <p><strong>Acquirente:</strong> ${data.purchaserName} (<a href="mailto:${data.purchaserEmail}">${data.purchaserEmail}</a>, tel: ${data.purchaserPhone || 'N/D'})</p>
      <p><strong>Codice Fiscale Acquirente:</strong> ${data.purchaserTaxCode || 'N/D'}</p>
      ${data.isForChild ? `<p><strong>Studente (Figlio):</strong> ${data.studentName} (CF: ${data.studentTaxCode || 'N/D'}, Nascita: ${data.studentBirthDate || 'N/D'})</p>` : ''}
      <p><strong>Importo:</strong> €${data.totalEur} (Quota annuale: €${data.regFeeEur})</p>
      <p><strong>Modalità di pagamento:</strong> ${data.paymentStatusText}</p>
      <p><strong>Data/Orario richiesto:</strong> ${data.date || 'Da concordare'} ore ${data.time || 'N/D'}</p>
      ${data.notes ? `<p><strong>Note cliente:</strong> ${data.notes}</p>` : ''}
      <p><strong>ID Prenotazione:</strong> ${data.bookingId}</p>
    </div>
  `;

  return { subject, html };
}
