/**
 * ============================================================================
 * ATENA SCHOOL — DOCUMENT COMPILER SERVICE
 * ============================================================================
 * @module @atena/core/documents/document-compiler.service
 * @description
 * Pure template compilation engine. Compiles structured JSONB blocks config and
 * immutable data snapshots into print-ready Italian A4 / Landscape documents with
 * zero hardcoded text strings.
 * ============================================================================
 */

import {
  DocumentBlock,
  DocumentBlocksConfig,
  DocumentPaperFormat,
  SchoolProfile,
} from '@atena/api-types';
import { DEFAULT_SCHOOL_PROFILE } from '../system/school-profile.service';

export interface CompileDocumentOptions {
  blocksConfig: DocumentBlocksConfig;
  data: Record<string, any>;
  schoolProfile?: Partial<SchoolProfile>;
  documentNumber?: string;
  documentTitle?: string;
}

/**
 * Replaces placeholders like {{student.full_name}} with actual data values
 */
export function interpolateVariables(template: string, data: Record<string, any>): string {
  if (!template) return '';
  return template.replace(/\{\{\s*([a-zA-Z0-9_.]+)\s*\}\}/g, (match, path) => {
    const keys = path.split('.');
    let val: any = data;
    for (const key of keys) {
      if (val === undefined || val === null) break;
      val = val[key];
    }
    return val !== undefined && val !== null ? String(val) : '';
  });
}

/**
 * Compiles a DocumentBlock into HTML based on its type and props
 */
export function renderBlockHtml(
  block: DocumentBlock,
  data: Record<string, any>,
  school: SchoolProfile,
  docNumber: string,
  paperFormat: DocumentPaperFormat
): string {
  if (!block.is_enabled) return '';

  const props = block.props || {};

  switch (block.type) {
    case 'doc_header': {
      const title = interpolateVariables(props.title || data.title || 'DOCUMENTO UFFICIALE', data);
      const showLogo = props.show_logo !== false;
      return `
        <div class="doc-header ${props.header_style || 'classic'}">
          <div class="school-info">
            ${showLogo && school.logo_url ? `<img src="${school.logo_url}" alt="${school.name}" class="school-logo" />` : ''}
            <h1 class="school-name">${school.name}</h1>
            <div class="school-details">
              ${school.address ? `${school.address}, ` : ''}${school.cap ? `${school.cap} ` : ''}${school.city || ''}<br/>
              ${school.vat_code ? `P.IVA / C.F.: <strong>${school.vat_code}</strong><br/>` : ''}
              ${school.email ? `Email: ${school.email} ` : ''}${school.phone ? `• Tel: ${school.phone}` : ''}
            </div>
          </div>
          <div class="doc-badge">
            <div class="doc-title">${title}</div>
            <div class="doc-number">N. <strong>${docNumber || data.document_number || '---'}</strong></div>
            <div class="doc-date">Data: <strong>${data.issue_date || data.created_at_formatted || new Date().toLocaleDateString('it-IT')}</strong></div>
          </div>
        </div>
      `;
    }

    case 'parties_block': {
      const studentName = data.student?.full_name || data.student_name || '---';
      const studentTaxCode = data.student?.tax_code || data.student_tax_code || '---';
      const studentBirth = data.student?.birth_date ? `${data.student.birth_date}${data.student.birth_place ? ` a ${data.student.birth_place}` : ''}` : null;
      const studentAddress = data.student?.address || null;
      const studentSchool = data.student?.school_grade || data.student_school_grade || null;

      const parentName = data.parent?.full_name || data.parent_name || null;
      const parentTaxCode = data.parent?.tax_code || data.parent_tax_code || null;
      const parentPhone = data.parent?.phone || data.parent_phone || null;

      const teacherName = data.teacher?.full_name || data.teacher_name || null;
      const teacherTaxCode = data.teacher?.tax_code || data.teacher_tax_code || null;

      if (teacherName) {
        return `
          <div class="section-box">
            <div class="section-title">DATI DEL DOCENTE / COLLABORATORE</div>
            <div class="grid-2">
              <div><strong>Nominativo:</strong> ${teacherName}</div>
              <div><strong>Codice Fiscale:</strong> ${teacherTaxCode || '---'}</div>
              <div><strong>Email:</strong> ${data.teacher?.email || '---'}</div>
              <div><strong>Telefono:</strong> ${data.teacher?.phone || '---'}</div>
            </div>
          </div>
        `;
      }

      return `
        <div class="section-box">
          <div class="section-title">DATI ANAGRAFICI DELL'ALLIEVO</div>
          <div class="grid-2">
            <div><strong>Allievo:</strong> ${studentName}</div>
            <div><strong>Codice Fiscale:</strong> ${studentTaxCode}</div>
            ${studentBirth ? `<div><strong>Nato/a il:</strong> ${studentBirth}</div>` : ''}
            ${studentAddress ? `<div><strong>Residenza:</strong> ${studentAddress}</div>` : ''}
            ${studentSchool ? `<div><strong>Scuola e Classe:</strong> ${studentSchool}</div>` : ''}
            <div><strong>Email:</strong> ${data.student?.email || data.student_email || '---'}</div>
            <div><strong>Telefono:</strong> ${data.student?.phone || data.student_phone || '---'}</div>
          </div>
          ${parentName ? `
            <div class="sub-divider"></div>
            <div class="section-subtitle">DATI DEL GENITORE / ESERCENTE LA RESPONSABILITÀ GENITORIALE</div>
            <div class="grid-2">
              <div><strong>Genitore:</strong> ${parentName}</div>
              <div><strong>Codice Fiscale:</strong> ${parentTaxCode || '---'}</div>
              ${parentPhone ? `<div><strong>Recapito Telefonico:</strong> ${parentPhone}</div>` : ''}
            </div>
          ` : ''}
        </div>
      `;
    }

    case 'course_table': {
      const courseTitle = data.course?.title || data.course_title || 'Corso di Lingua';
      const courseLevel = data.course?.level || data.course_level || null;
      const scheduleText = data.course?.schedule_text || data.schedule_text || 'Da concordare con la segreteria';
      const startDate = data.course?.start_date || data.start_date || '---';
      const totalLessons = data.course?.total_lessons || data.total_lessons || null;
      const classroom = data.course?.classroom || data.classroom || null;

      return `
        <div class="section-box">
          <div class="section-title">DETTAGLI DEL CORSO ASSEGNATO</div>
          <table class="data-table">
            <thead>
              <tr>
                <th>Corso</th>
                <th>Livello</th>
                <th>Orario e Frequenza</th>
                <th>Data Inizio</th>
                ${classroom ? `<th>Aula</th>` : ''}
              </tr>
            </thead>
            <tbody>
              <tr>
                <td><strong>${courseTitle}</strong></td>
                <td>${courseLevel || 'Standard'}</td>
                <td>${scheduleText}</td>
                <td>${startDate}</td>
                ${classroom ? `<td>${classroom}</td>` : ''}
              </tr>
            </tbody>
          </table>
          ${totalLessons ? `<div class="table-note">Totale lezioni programmate: <strong>${totalLessons}</strong></div>` : ''}
        </div>
      `;
    }

    case 'payment_breakdown': {
      const total = Number(data.payment?.amount_total || data.total_amount || 0);
      const courseFee = Number(data.payment?.amount_course || data.course_fee || total);
      const regFee = Number(data.payment?.registration_fee || data.registration_fee || 0);
      const method = data.payment?.payment_method_label || data.payment_method || 'Pagamento Confermato';
      const isPaid = data.payment?.is_paid !== false;

      // VAT 22% breakdown
      const netVatRate = 0.22;
      const netAmount = total / (1 + netVatRate);
      const vatAmount = total - netAmount;

      return `
        <div class="section-box">
          <div class="section-title">RIEPILOGO QUOTE E CONDIZIONI ECONOMICHE</div>
          <table class="data-table">
            <thead>
              <tr>
                <th>Descrizione Voce</th>
                <th class="text-right">Importo (IVA Inclusa 22%)</th>
              </tr>
            </thead>
            <tbody>
              <tr>
                <td>Quota Frequenza Corso / Percorso Formativo</td>
                <td class="text-right font-mono">€${courseFee.toFixed(2)}</td>
              </tr>
              ${regFee > 0 ? `
              <tr>
                <td>Quota Iscrizione Annuale / Quota Associativa</td>
                <td class="text-right font-mono">€${regFee.toFixed(2)}</td>
              </tr>` : ''}
              <tr class="total-row">
                <td><strong>TOTALE COMPLESSIVO (IVA INCLUSA)</strong></td>
                <td class="text-right font-mono font-bold">€${total.toFixed(2)}</td>
              </tr>
            </tbody>
          </table>
          <div class="payment-meta">
            <div>Modalità di pagamento: <strong>${method}</strong></div>
            <div>Stato contabile: <span class="badge ${isPaid ? 'badge-success' : 'badge-warning'}">${isPaid ? 'SALDATO' : 'IN ATTESA DI SALDO'}</span></div>
          </div>
          <div class="vat-disclaimer">
            * I prezzi indicati sono da intendersi comprensivi di IVA al 22% (Imponibile: €${netAmount.toFixed(2)}, IVA 22%: €${vatAmount.toFixed(2)}).
          </div>
        </div>
      `;
    }

    case 'contract_clauses': {
      return `
        <div class="section-box legal-clauses">
          <div class="section-title">ESTRATTO REGOLAMENTO INTERNO E CALENDARIO FESTIVITÀ 2026/2027</div>
          <ol class="clauses-list">
            <li><strong>Frequenza e puntualità:</strong> L'allievo è tenuto a rispettare gli orari concordati. Le lezioni perse per cause non imputabili alla scuola non sono rimborsabili.</li>
            <li><strong>Festività e chiusure:</strong> Le lezioni seguiranno il calendario scolastico delle festività 2026/2027 (Ponte dei Defunti 02/11/2026, Immacolata 07-08/12/2026, Vacanze di Natale 23/12/2026-06/01/2027, Pasqua 25-30/03/2027, Festa della Repubblica 02/06/2027). I giorni festivi non sono soggetti a recupero se già esclusi dal piano didattico.</li>
            <li><strong>Disdetta lezioni individuali:</strong> Eventuali disdette per corsi individuali devono pervenire alla segreteria con almeno 24 ore di anticipo. In caso contrario la lezione verrà considerata regolarmente svolta.</li>
            <li><strong>Diritti didattici:</strong> I materiali forniti dalla scuola sono riservati all'uso personale dell'allievo per soli scopi formativi.</li>
          </ol>
        </div>
      `;
    }

    case 'minor_delegation': {
      const del1Name = data.delegates?.delegate_1_name || data.pickup_delegate_1_name || '---';
      const del1Rel = data.delegates?.delegate_1_relation || data.pickup_delegate_1_relation || '---';
      const del1Phone = data.delegates?.delegate_1_phone || data.pickup_delegate_1_phone || '---';

      const del2Name = data.delegates?.delegate_2_name || data.pickup_delegate_2_name || null;
      const del2Rel = data.delegates?.delegate_2_relation || data.pickup_delegate_2_relation || null;
      const del2Phone = data.delegates?.delegate_2_phone || data.pickup_delegate_2_phone || null;

      const selfExit = data.delegates?.self_exit_authorized || data.self_exit_authorized_11plus || false;

      return `
        <div class="section-box">
          <div class="section-title">ALLEGATO 2 — DELEGA RITIRO MINORI E AUTORIZZAZIONE USCITA</div>
          <p class="small-text">Il sottoscritto genitore / tutore legale delega le seguenti persone maggiorenni al ritiro dell'allievo al termine delle lezioni:</p>
          <div class="delegates-grid">
            <div class="delegate-card">
              <strong>Delegato 1:</strong> ${del1Name}<br/>
              <strong>Grado di parentela / Ruolo:</strong> ${del1Rel}<br/>
              <strong>Recapito Telefonico:</strong> ${del1Phone}
            </div>
            ${del2Name ? `
            <div class="delegate-card">
              <strong>Delegato 2:</strong> ${del2Name}<br/>
              <strong>Grado di parentela / Ruolo:</strong> ${del2Rel || '---'}<br/>
              <strong>Recapito Telefonico:</strong> ${del2Phone || '---'}
            </div>` : ''}
          </div>
          <div class="self-exit-box">
            <input type="checkbox" ${selfExit ? 'checked' : ''} disabled />
            <span><strong>Autorizzazione all'uscita autonoma (Allievi di età non inferiore a 11 anni - L. 172/2017):</strong> Il genitore autorizza l'allievo ad allontanarsi autonomamente dai locali della scuola al termine dell'attività formativa.</span>
          </div>
        </div>
      `;
    }

    case 'gdpr_privacy': {
      return `
        <div class="section-box">
          <div class="section-title">INFORMATIVA PRIVACY E CONSENSO AL TRATTAMENTO DEI DATI (REG. UE 2016/679)</div>
          <p class="small-text">I dati personali raccolti sono trattati da ${school.name} in qualità di Titolare del trattamento, esclusivamente per l'esecuzione del contratto formativo, la gestione amministrativa e le comunicazioni istituzionali.</p>
          <div class="consent-items">
            <div class="consent-row">
              <span class="check-box">[X]</span>
              <span><strong>Trattamento Dati Personali e Didattici:</strong> Obbligatorio per l'erogazione del servizio educativo e fatturazione.</span>
            </div>
            <div class="consent-row">
              <span class="check-box">[X]</span>
              <span><strong>Liberatoria Foto e Video Didattici:</strong> Consenso alla pubblicazione di riprese durante attività scolastiche senza finalità lesive della dignità.</span>
            </div>
          </div>
        </div>
      `;
    }

    case 'signatures': {
      const parties = props.signature_parties || ['scuola', 'cliente'];
      const city = school.city || 'La Direzione';
      const dateStr = data.issue_date || new Date().toLocaleDateString('it-IT');

      return `
        <div class="signatures-section">
          <div class="signatures-meta">
            Luogo e Data: <strong>${city}, ${dateStr}</strong>
          </div>
          <div class="signatures-grid">
            <div class="signature-box">
              <div class="signature-line"></div>
              <div class="signature-label">Firma per ${school.name}</div>
            </div>
            <div class="signature-box">
              <div class="signature-line"></div>
              <div class="signature-label">Firma dell'Allievo / Genitore Esercente</div>
            </div>
          </div>
        </div>
      `;
    }

    case 'custom_text': {
      const text = interpolateVariables(props.text || '', data);
      return `
        <div class="section-box custom-text-block">
          ${props.title ? `<div class="section-title">${props.title}</div>` : ''}
          <div class="custom-content">${text}</div>
        </div>
      `;
    }

    case 'doc_footer': {
      return `
        <div class="doc-footer">
          <div>${school.name} • C.F./P.IVA: ${school.vat_code || '---'} • ${school.address || ''}, ${school.city || ''}</div>
          <div class="footer-note">Documento generato tramite la piattaforma gestionale Atena School. Copia conforme all'originale informatico.</div>
        </div>
      `;
    }

    default:
      return '';
  }
}

/**
 * Compiles entire document into full standalone HTML with embedded print styles
 */
export function compileDocumentHtml(options: CompileDocumentOptions): string {
  const { blocksConfig, data, schoolProfile, documentNumber, documentTitle } = options;

  const school: SchoolProfile = {
    ...DEFAULT_SCHOOL_PROFILE,
    ...(schoolProfile || {}),
  };

  const paperFormat = blocksConfig.paper_format || DocumentPaperFormat.A4_PORTRAIT;
  const isLandscape = paperFormat === DocumentPaperFormat.A4_LANDSCAPE;
  const isCompact = paperFormat === DocumentPaperFormat.RECEIPT_COMPACT;

  const sortedBlocks = [...(blocksConfig.blocks || [])].sort((a, b) => (a.order || 0) - (b.order || 0));

  const renderedBlocksHtml = sortedBlocks
    .map((b) => renderBlockHtml(b, data, school, documentNumber || data.document_number, paperFormat))
    .filter(Boolean)
    .join('\n');

  return `<!DOCTYPE html>
<html lang="it">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>${documentTitle || data.title || 'Documento Atena School'}</title>
  <style>
    @page {
      size: ${isLandscape ? 'A4 landscape' : isCompact ? '80mm auto' : 'A4 portrait'};
      margin: ${isCompact ? '5mm' : '12mm 15mm'};
    }
    *, *:before, *:after { box-sizing: border-box; }
    body {
      font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif;
      color: #0f172a;
      background: #f8fafc;
      margin: 0;
      padding: 24px;
      font-size: 13px;
      line-height: 1.5;
    }
    .document-page {
      max-width: ${isLandscape ? '1050px' : isCompact ? '380px' : '820px'};
      margin: 0 auto;
      background: #ffffff;
      padding: ${isCompact ? '16px' : '36px 40px'};
      border: 1px solid #e2e8f0;
      border-radius: 8px;
      box-shadow: 0 4px 6px -1px rgba(0, 0, 0, 0.05);
    }
    
    /* Header */
    .doc-header {
      display: flex;
      justify-content: space-between;
      align-items: flex-start;
      border-bottom: 2px solid #0f172a;
      padding-bottom: 16px;
      margin-bottom: 20px;
    }
    .school-name {
      font-size: 20px;
      font-weight: 800;
      color: #0f172a;
      margin: 0 0 4px 0;
      letter-spacing: -0.5px;
    }
    .school-details {
      font-size: 11px;
      color: #64748b;
      line-height: 1.4;
    }
    .school-logo {
      max-height: 48px;
      margin-bottom: 8px;
    }
    .doc-badge {
      text-align: right;
    }
    .doc-title {
      font-size: 15px;
      font-weight: 800;
      color: #2563eb;
      text-transform: uppercase;
      letter-spacing: 0.5px;
      margin-bottom: 4px;
    }
    .doc-number {
      font-size: 12px;
      color: #334155;
    }
    .doc-date {
      font-size: 11px;
      color: #64748b;
      margin-top: 2px;
    }

    /* Section Boxes */
    .section-box {
      border: 1px solid #e2e8f0;
      border-radius: 6px;
      padding: 14px 16px;
      margin-bottom: 16px;
      background: #ffffff;
    }
    .section-title {
      font-size: 11px;
      font-weight: 800;
      text-transform: uppercase;
      letter-spacing: 0.5px;
      color: #475569;
      margin-bottom: 10px;
      border-bottom: 1px solid #f1f5f9;
      padding-bottom: 4px;
    }
    .section-subtitle {
      font-size: 10px;
      font-weight: 700;
      text-transform: uppercase;
      color: #64748b;
      margin: 10px 0 6px 0;
    }
    .grid-2 {
      display: grid;
      grid-template-columns: 1fr 1fr;
      gap: 8px 16px;
      font-size: 12px;
    }
    .sub-divider {
      border-top: 1px dashed #e2e8f0;
      margin: 12px 0 8px 0;
    }

    /* Tables */
    .data-table {
      width: 100%;
      border-collapse: collapse;
      font-size: 12px;
      margin-bottom: 8px;
    }
    .data-table th {
      background: #f8fafc;
      color: #475569;
      font-weight: 700;
      font-size: 11px;
      text-transform: uppercase;
      text-align: left;
      padding: 8px 10px;
      border-bottom: 1px solid #cbd5e1;
    }
    .data-table td {
      padding: 9px 10px;
      border-bottom: 1px solid #f1f5f9;
    }
    .total-row td {
      border-top: 2px solid #0f172a;
      border-bottom: none;
      font-size: 13px;
      padding-top: 10px;
    }
    .text-right { text-align: right; }
    .font-mono { font-family: ui-monospace, SFMono-Regular, Menlo, Monaco, Consolas, monospace; }
    .font-bold { font-weight: 700; }
    .table-note { font-size: 11px; color: #64748b; margin-top: 4px; }

    /* Payment & Legal */
    .payment-meta {
      display: flex;
      justify-content: space-between;
      margin-top: 10px;
      font-size: 12px;
      padding-top: 8px;
      border-top: 1px dashed #e2e8f0;
    }
    .badge {
      display: inline-block;
      padding: 2px 8px;
      border-radius: 4px;
      font-size: 10px;
      font-weight: 700;
      text-transform: uppercase;
    }
    .badge-success { background: #dcfce7; color: #166534; }
    .badge-warning { background: #fef9c3; color: #854d0e; }
    .vat-disclaimer {
      font-size: 10px;
      color: #94a3b8;
      margin-top: 8px;
      font-style: italic;
    }
    .legal-clauses ol {
      margin: 0;
      padding-left: 18px;
      font-size: 11px;
      color: #334155;
      line-height: 1.5;
    }
    .legal-clauses li { margin-bottom: 6px; }

    /* Delegates & GDPR */
    .delegates-grid {
      display: grid;
      grid-template-columns: 1fr 1fr;
      gap: 12px;
      margin: 10px 0;
    }
    .delegate-card {
      background: #f8fafc;
      border: 1px solid #e2e8f0;
      border-radius: 4px;
      padding: 8px 12px;
      font-size: 11px;
      line-height: 1.4;
    }
    .self-exit-box {
      display: flex;
      gap: 8px;
      align-items: flex-start;
      margin-top: 10px;
      padding: 8px 12px;
      background: #f1f5f9;
      border-radius: 4px;
      font-size: 11px;
    }
    .consent-items {
      display: flex;
      flex-direction: column;
      gap: 6px;
      margin-top: 8px;
    }
    .consent-row {
      display: flex;
      gap: 8px;
      font-size: 11px;
      color: #334155;
    }
    .check-box { font-weight: 700; color: #2563eb; }
    .small-text { font-size: 11px; color: #475569; margin: 0 0 8px 0; }

    /* Signatures */
    .signatures-section {
      margin-top: 24px;
      padding-top: 12px;
      page-break-inside: avoid;
    }
    .signatures-meta {
      font-size: 12px;
      color: #475569;
      margin-bottom: 24px;
    }
    .signatures-grid {
      display: flex;
      justify-content: space-between;
      gap: 40px;
    }
    .signature-box {
      flex: 1;
      text-align: center;
    }
    .signature-line {
      border-bottom: 1px solid #94a3b8;
      height: 40px;
      margin-bottom: 6px;
    }
    .signature-label {
      font-size: 11px;
      font-weight: 600;
      color: #64748b;
    }

    /* Footer */
    .doc-footer {
      border-top: 1px solid #e2e8f0;
      padding-top: 12px;
      margin-top: 24px;
      font-size: 10px;
      color: #94a3b8;
      display: flex;
      justify-content: space-between;
      align-items: center;
    }

    /* Print Overrides */
    @media print {
      body {
        background: #ffffff;
        padding: 0;
      }
      .document-page {
        border: none;
        box-shadow: none;
        padding: 0;
        max-width: 100%;
      }
      .no-print { display: none !important; }
    }
  </style>
</head>
<body>
  <div class="document-page">
    ${renderedBlocksHtml}
  </div>
</body>
</html>`;
}
