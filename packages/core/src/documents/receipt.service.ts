import type { SchoolProfile } from '@atena/api-types';
import { DEFAULT_SCHOOL_PROFILE } from '../system/school-profile.service';

export interface ReceiptData {
  receiptNumber: string;
  issueDate: string;
  school: Partial<SchoolProfile>;
  purchaserName: string;
  purchaserTaxCode?: string | null;
  purchaserAddress?: string | null;
  studentName?: string | null;
  studentTaxCode?: string | null;
  courseTitle: string;
  courseFee: number;
  registrationFee: number;
  totalAmount: number;
  paymentMethod: string;
  transactionId?: string | null;
}

/**
 * Generates an official Italian receipt (Ricevuta per Quota Associativa e Corso)
 * compliant with Italian regulations (Art. 4 D.P.R. 633/72).
 * Formatted with print CSS for clean A4 printing or PDF export.
 */
export function generateReceiptHtml(data: ReceiptData): string {
  const schoolProfile: SchoolProfile = {
    ...DEFAULT_SCHOOL_PROFILE,
    ...(data.school || {}),
  };

  const schoolName = schoolProfile.name;
  const schoolAddress = schoolProfile.address;
  const schoolCity = [schoolProfile.cap, schoolProfile.city].filter(Boolean).join(' ');
  const schoolVat = schoolProfile.vat_code || schoolProfile.legal_name || '';
  const schoolEmail = schoolProfile.email || schoolProfile.secretariat_email || '';
  const schoolPhone = schoolProfile.phone || schoolProfile.landline || '';

  const regFeeFormatted = Number(data.registrationFee || 0).toFixed(2);
  const courseFeeFormatted = Number(data.courseFee || 0).toFixed(2);
  const totalFormatted = Number(data.totalAmount || 0).toFixed(2);

  const isMinor = data.studentName && data.studentName !== data.purchaserName;
  const logoSrc = schoolProfile.logo_url?.startsWith('/') && !schoolProfile.logo_url.startsWith('//')
    ? `${schoolProfile.site_url || 'https://atenaschool.com'}${schoolProfile.logo_url}`
    : (schoolProfile.logo_url || '');

  return `<!DOCTYPE html>
<html lang="it">
<head>
  <meta charset="UTF-8">
  <title>Ricevuta N. ${data.receiptNumber} - ${schoolName}</title>
  <style>
    @page { size: A4 portrait; margin: 15mm; }
    body {
      font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif;
      color: #1f2937;
      background: #ffffff;
      margin: 0;
      padding: 20px;
      font-size: 13px;
      line-height: 1.5;
    }
    .container { max-width: 750px; margin: 0 auto; }
    .header { display: flex; justify-content: space-between; border-bottom: 2px solid #e5e7eb; padding-bottom: 20px; margin-bottom: 24px; }
    .school-title { font-size: 20px; font-weight: 800; color: #111827; margin: 0 0 4px 0; }
    .school-meta { font-size: 11px; color: #6b7280; line-height: 1.4; }
    .receipt-badge { text-align: right; }
    .receipt-title { font-size: 18px; font-weight: 700; color: #2563eb; margin: 0 0 4px 0; text-transform: uppercase; letter-spacing: 0.5px; }
    .receipt-number { font-size: 13px; font-weight: 600; color: #374151; }
    .receipt-date { font-size: 12px; color: #6b7280; margin-top: 2px; }
    .grid { display: grid; grid-template-columns: 1fr 1fr; gap: 20px; margin-bottom: 24px; }
    .box { background: #f9fafb; border: 1px solid #e5e7eb; border-radius: 8px; padding: 14px; }
    .box-title { font-size: 11px; font-weight: 700; text-transform: uppercase; color: #9ca3af; letter-spacing: 0.5px; margin-bottom: 6px; }
    .box-name { font-size: 14px; font-weight: 700; color: #111827; }
    .box-info { font-size: 12px; color: #4b5563; margin-top: 2px; }
    .table { width: 100%; border-collapse: collapse; margin-bottom: 24px; }
    .table th { background: #f3f4f6; color: #374151; font-weight: 700; font-size: 11px; text-transform: uppercase; text-align: left; padding: 10px 14px; border-bottom: 1px solid #e5e7eb; }
    .table td { padding: 12px 14px; border-bottom: 1px solid #f3f4f6; font-size: 13px; }
    .table td.num, .table th.num { text-align: right; }
    .total-box { margin-left: auto; width: 280px; margin-bottom: 30px; border-top: 2px solid #111827; padding-top: 10px; }
    .total-row { display: flex; justify-content: space-between; font-size: 16px; font-weight: 800; color: #111827; }
    .notes { background: #fefce8; border: 1px solid #fef08a; border-radius: 8px; padding: 12px 16px; font-size: 11px; color: #854d0e; line-height: 1.4; margin-bottom: 30px; }
    .footer { display: flex; justify-content: space-between; border-top: 1px solid #e5e7eb; padding-top: 20px; font-size: 11px; color: #9ca3af; }
    .signature { text-align: right; width: 200px; border-top: 1px solid #d1d5db; margin-top: 40px; padding-top: 6px; font-size: 11px; color: #6b7280; }
    @media print {
      body { padding: 0; }
      .no-print { display: none !important; }
    }
  </style>
</head>
<body>
  <div class="container">
    <div class="header">
      <div>
        ${logoSrc ? `<img src="${logoSrc}" alt="${schoolName}" onerror="this.style.display='none'" style="max-height: 44px; max-width: 160px; object-fit: contain; margin-bottom: 8px; display: block;" />` : ''}
        <h1 class="school-title">${schoolName}</h1>
        <div class="school-meta">
          ${schoolAddress}, ${schoolCity}<br>
          C.F. / P.IVA: ${schoolVat}<br>
          Email: ${schoolEmail} ${schoolPhone ? `• Tel: ${schoolPhone}` : ''}
        </div>
      </div>
      <div class="receipt-badge">
        <div class="receipt-title">Ricevuta</div>
        <div class="receipt-number">N. ${data.receiptNumber}</div>
        <div class="receipt-date">Data: ${data.issueDate}</div>
      </div>
    </div>

    <div class="grid">
      <div class="box">
        <div class="box-title">Intestata a (Acquirente)</div>
        <div class="box-name">${data.purchaserName}</div>
        ${data.purchaserTaxCode ? `<div class="box-info">C.F.: <strong>${data.purchaserTaxCode}</strong></div>` : ''}
        ${data.purchaserAddress ? `<div class="box-info">${data.purchaserAddress}</div>` : ''}
      </div>

      <div class="box">
        <div class="box-title">Alunno / Beneficiario</div>
        <div class="box-name">${isMinor ? data.studentName : data.purchaserName}</div>
        ${data.studentTaxCode ? `<div class="box-info">C.F.: <strong>${data.studentTaxCode}</strong></div>` : ''}
        <div class="box-info">Metodo: <strong>${data.paymentMethod}</strong></div>
        ${data.transactionId ? `<div class="box-info" style="font-family: monospace; font-size: 10px;">ID: ${data.transactionId}</div>` : ''}
      </div>
    </div>

    <table class="table">
      <thead>
        <tr>
          <th>Descrizione</th>
          <th style="width: 140px;">Regime Fiscale</th>
          <th class="num" style="width: 110px;">Importo</th>
        </tr>
      </thead>
      <tbody>
        ${Number(data.registrationFee) > 0 ? `
        <tr>
          <td>
            <strong>Quota Associativa Annuale</strong>
            <div style="font-size: 11px; color: #6b7280;">Tesseramento e iscrizione anno accademico in corso</div>
          </td>
          <td style="font-size: 11px; color: #4b5563;">Esente IVA (Art. 4 D.P.R. 633/72)</td>
          <td class="num">€ ${regFeeFormatted}</td>
        </tr>
        ` : ''}
        ${Number(data.courseFee) > 0 ? `
        <tr>
          <td>
            <strong>${data.courseTitle}</strong>
            <div style="font-size: 11px; color: #6b7280;">Frequenza corso di lingua e attività istituzionale</div>
          </td>
          <td style="font-size: 11px; color: #4b5563;">Attività Istituzionale</td>
          <td class="num">€ ${courseFeeFormatted}</td>
        </tr>
        ` : ''}
      </tbody>
    </table>

    <div class="total-box">
      <div class="total-row">
        <span>Totale Pagato:</span>
        <span>€ ${totalFormatted}</span>
      </div>
    </div>

    <div class="notes">
      <strong>Nota di conformità fiscale:</strong> Operazione effettuata in attuazione degli scopi istituzionali.
      Le quote associative e le quote di frequenza ai corsi non costituiscono corrispettivo imponibile ai fini IVA ai sensi dell'art. 4 del D.P.R. 633/1972 e s.m.i.
    </div>

    <div class="footer">
      <div>Documento generato telematicamente da ${schoolName}</div>
      <div class="signature">Firma del Presidente / Segreteria</div>
    </div>
  </div>
</body>
</html>`;
}
