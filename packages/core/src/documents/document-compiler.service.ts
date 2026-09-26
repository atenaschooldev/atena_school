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
  resolveI18n,
} from '@atena/api-types';
import { getCurrentAcademicYear } from '@atena/utils';
import { DEFAULT_SCHOOL_PROFILE } from '../system/school-profile.service';

export interface CompileDocumentOptions {
  blocksConfig: DocumentBlocksConfig;
  data: Record<string, any>;
  schoolProfile?: Partial<SchoolProfile>;
  documentNumber?: string;
  documentTitle?: string;
  locale?: string;
}

/**
 * Basic HTML escaping for variable interpolation to prevent XSS
 */
function escapeHtml(str: string): string {
  return str
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#039;');
}

/**
 * Replaces placeholders like {{student.full_name}} with actual data values safely
 */
export function interpolateVariables(template: any, data: Record<string, any>): string {
  if (template === null || template === undefined) return '';
  if (typeof template !== 'string') return String(template);
  return template.replace(/\{\{\s*([a-zA-Z0-9_.]+)\s*\}\}/g, (match, path) => {
    const keys = path.split('.');
    let val: any = data;
    for (const key of keys) {
      if (val === undefined || val === null) break;
      val = val[key];
    }
    if (val === undefined || val === null) return '';
    if (typeof val === 'object') return '';
    return escapeHtml(String(val));
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
  paperFormat: DocumentPaperFormat,
  locale: string = 'it'
): string {
  if (!block.is_enabled) return '';

  const props = block.props || {};

  switch (block.type) {
    case 'doc_header': {
      const rawTitle = resolveI18n(props.title, locale) || data.title || (locale === 'en' ? 'OFFICIAL DOCUMENT' : 'DOCUMENTO UFFICIALE');
      const title = interpolateVariables(rawTitle, data);
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
            <div class="doc-date">${locale === 'en' ? 'Date' : locale === 'ru' ? 'Дата' : 'Data'}: <strong>${data.issue_date || data.created_at_formatted || new Date().toLocaleDateString(locale === 'en' ? 'en-US' : locale === 'ru' ? 'ru-RU' : 'it-IT')}</strong></div>
          </div>
        </div>
      `;
    }

    case 'parties_block': {
      const defaultTitle = locale === 'en' ? 'STUDENT PERSONAL INFORMATION' : "DATI ANAGRAFICI DELL'ALLIEVO";
      const blockTitle = interpolateVariables(resolveI18n(props.title, locale) || defaultTitle, data);
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
            <div class="section-title">${interpolateVariables(resolveI18n(props.title, locale) || (locale === 'en' ? 'TEACHER / INSTRUCTOR DATA' : 'DATI DEL DOCENTE / COLLABORATORE'), data)}</div>
            <div class="grid-2">
              <div><strong>${locale === 'en' ? 'Full Name' : 'Nominativo'}:</strong> ${teacherName}</div>
              <div><strong>${locale === 'en' ? 'Tax Code' : 'Codice Fiscale'}:</strong> ${teacherTaxCode || '---'}</div>
              <div><strong>Email:</strong> ${data.teacher?.email || '---'}</div>
              <div><strong>${locale === 'en' ? 'Phone' : 'Telefono'}:</strong> ${data.teacher?.phone || '---'}</div>
            </div>
          </div>
        `;
      }

      const showParent = props.show_parent !== false && Boolean(parentName);
      const showBirth = props.show_birth !== false && Boolean(studentBirth);
      const showAddress = props.show_address !== false && Boolean(studentAddress);
      const showSchool = props.show_school !== false && Boolean(studentSchool);

      return `
        <div class="section-box">
          <div class="section-title">${blockTitle}</div>
          <div class="grid-2">
            <div><strong>${locale === 'en' ? 'Student' : 'Allievo'}:</strong> ${studentName}</div>
            <div><strong>${locale === 'en' ? 'Tax Code' : 'Codice Fiscale'}:</strong> ${studentTaxCode}</div>
            ${showBirth ? `<div><strong>${locale === 'en' ? 'Born on' : 'Nato/a il'}:</strong> ${studentBirth}</div>` : ''}
            ${showAddress ? `<div><strong>${locale === 'en' ? 'Address' : 'Residenza'}:</strong> ${studentAddress}</div>` : ''}
            ${showSchool ? `<div><strong>${locale === 'en' ? 'School & Grade' : 'Scuola e Classe'}:</strong> ${studentSchool}</div>` : ''}
            <div><strong>Email:</strong> ${data.student?.email || data.student_email || '---'}</div>
            <div><strong>${locale === 'en' ? 'Phone' : 'Telefono'}:</strong> ${data.student?.phone || data.student_phone || '---'}</div>
          </div>
          ${showParent ? `
            <div class="sub-divider"></div>
            <div class="section-subtitle">${locale === 'en' ? 'PARENT / LEGAL GUARDIAN INFORMATION' : 'DATI DEL GENITORE / ESERCENTE LA RESPONSABILITÀ GENITORIALE'}</div>
            <div class="grid-2">
              <div><strong>${locale === 'en' ? 'Parent' : 'Genitore'}:</strong> ${parentName}</div>
              <div><strong>${locale === 'en' ? 'Tax Code' : 'Codice Fiscale'}:</strong> ${parentTaxCode || '---'}</div>
              ${parentPhone ? `<div><strong>${locale === 'en' ? 'Phone' : 'Recapito Telefonico'}:</strong> ${parentPhone}</div>` : ''}
              ${data.parent?.email ? `<div><strong>Email:</strong> ${data.parent.email}</div>` : ''}
            </div>
          ` : ''}
        </div>
      `;
    }

    case 'course_table': {
      const defaultTitle = locale === 'en' ? 'ASSIGNED COURSE DETAILS' : 'DETTAGLI DEL CORSO ASSEGNATO';
      const blockTitle = interpolateVariables(resolveI18n(props.title, locale) || defaultTitle, data);
      const courseTitle = data.course?.title || data.course_title || (locale === 'en' ? 'Language Course' : 'Corso di Lingua');
      const courseLevel = data.course?.level || data.course_level || null;
      const scheduleText = data.course?.schedule_text || data.schedule_text || (locale === 'en' ? 'To be agreed' : 'Da concordare con la segreteria');
      const startDate = data.course?.start_date || data.start_date || '---';
      const totalLessons = data.course?.total_lessons || data.total_lessons || null;
      const classroom = data.course?.classroom || data.classroom || null;
      const showClassroom = props.show_classroom !== false && Boolean(classroom);
      const customNote = props.table_note ? interpolateVariables(resolveI18n(props.table_note, locale), data) : null;

      return `
        <div class="section-box">
          <div class="section-title">${blockTitle}</div>
          <table class="data-table">
            <thead>
              <tr>
                <th>${locale === 'en' ? 'Course' : 'Corso'}</th>
                <th>${locale === 'en' ? 'Level' : 'Livello'}</th>
                <th>${locale === 'en' ? 'Schedule' : 'Orario e Frequenza'}</th>
                <th>${locale === 'en' ? 'Start Date' : 'Data Inizio'}</th>
                ${showClassroom ? `<th>${locale === 'en' ? 'Classroom' : 'Aula'}</th>` : ''}
              </tr>
            </thead>
            <tbody>
              <tr>
                <td><strong>${courseTitle}</strong></td>
                <td>${courseLevel || 'Standard'}</td>
                <td>${scheduleText}</td>
                <td>${startDate}</td>
                ${showClassroom ? `<td>${classroom}</td>` : ''}
              </tr>
            </tbody>
          </table>
          ${customNote ? `<div class="table-note">${customNote}</div>` : totalLessons ? `<div class="table-note">${locale === 'en' ? 'Total planned lessons' : 'Totale lezioni programmate'}: <strong>${totalLessons}</strong></div>` : ''}
        </div>
      `;
    }

    case 'payment_breakdown': {
      const defaultTitle = locale === 'en' ? 'FEE SUMMARY & FINANCIAL CONDITIONS' : 'RIEPILOGO QUOTE E CONDIZIONI ECONOMICHE';
      const blockTitle = interpolateVariables(resolveI18n(props.title, locale) || defaultTitle, data);
      const total = Number(data.payment?.amount_total || data.total_amount || 0);
      const courseFee = Number(data.payment?.amount_course || data.course_fee || total);
      const regFee = Number(data.payment?.registration_fee || data.registration_fee || 0);
      const method = data.payment?.payment_method_label || data.payment_method || (locale === 'en' ? 'Confirmed Payment' : 'Pagamento Confermato');
      const isPaid = data.payment?.is_paid !== false;

      // VAT Rate from props or default 22%
      const vatRateNum = Number(props.vat_rate !== undefined ? props.vat_rate : 22);
      const netVatRate = vatRateNum > 0 ? vatRateNum / 100 : 0;
      const netAmount = netVatRate > 0 ? total / (1 + netVatRate) : total;
      const vatAmount = total - netAmount;

      return `
        <div class="section-box">
          <div class="section-title">${blockTitle}</div>
          <table class="data-table">
            <thead>
              <tr>
                <th>${locale === 'en' ? 'Description' : 'Descrizione Voce'}</th>
                <th class="text-right">${locale === 'en' ? `Amount (VAT Included ${vatRateNum}%)` : `Importo (IVA Inclusa ${vatRateNum}%)`}</th>
              </tr>
            </thead>
            <tbody>
              <tr>
                <td>${locale === 'en' ? 'Course Tuition Fee / Training Program' : 'Quota Frequenza Corso / Percorso Formativo'}</td>
                <td class="text-right font-mono">€${courseFee.toFixed(2)}</td>
              </tr>
              ${regFee > 0 ? `
              <tr>
                <td>${locale === 'en' ? 'Annual Registration / Membership Fee' : 'Quota Iscrizione Annuale / Quota Associativa'}</td>
                <td class="text-right font-mono">€${regFee.toFixed(2)}</td>
              </tr>` : ''}
              <tr class="total-row">
                <td><strong>${locale === 'en' ? 'TOTAL (VAT INCLUDED)' : 'TOTALE COMPLESSIVO (IVA INCLUSA)'}</strong></td>
                <td class="text-right font-mono font-bold">€${total.toFixed(2)}</td>
              </tr>
            </tbody>
          </table>
          <div class="payment-meta">
            <div>${locale === 'en' ? 'Payment method' : 'Modalità di pagamento'}: <strong>${method}</strong></div>
            <div>${locale === 'en' ? 'Accounting status' : 'Stato contabile'}: <span class="badge ${isPaid ? 'badge-success' : 'badge-warning'}">${isPaid ? (locale === 'en' ? 'PAID' : 'SALDATO') : (locale === 'en' ? 'PENDING' : 'IN ATTESA DI SALDO')}</span></div>
          </div>
          ${props.show_vat_breakdown !== false ? `
          <div class="vat-disclaimer">
            * ${locale === 'en' ? `All prices include ${vatRateNum}% VAT (Net: €${netAmount.toFixed(2)}, VAT ${vatRateNum}%: €${vatAmount.toFixed(2)}).` : `I prezzi indicati sono da intendersi comprensivi di IVA al ${vatRateNum}% (Imponibile: €${netAmount.toFixed(2)}, IVA ${vatRateNum}%: €${vatAmount.toFixed(2)}).`}
          </div>` : ''}
        </div>
      `;
    }

    case 'contract_clauses': {
      const year = data?.academic_year || getCurrentAcademicYear().academicYear;
      const defaultTitle = locale === 'en' ? `SCHOOL REGULATIONS & CALENDAR ${year}` : `ESTRATTO REGOLAMENTO INTERNO E CALENDARIO FESTIVITÀ ${year}`;
      const blockTitle = interpolateVariables(resolveI18n(props.title, locale) || defaultTitle, data);
      const rawClauses = resolveI18n(props.custom_clauses, locale);
      if (rawClauses && String(rawClauses).trim()) {
        const clausesHtml = interpolateVariables(String(rawClauses), data)
          .split('\n')
          .filter((l) => l.trim().length > 0)
          .map((line) => `<li>${line.replace(/^[0-9]+[.)]\s*/, '')}</li>`)
          .join('\n');
        return `
          <div class="section-box legal-clauses">
            <div class="section-title">${blockTitle}</div>
            <ol class="clauses-list">
              ${clausesHtml}
            </ol>
          </div>
        `;
      }

      return `
        <div class="section-box legal-clauses">
          <div class="section-title">${blockTitle}</div>
          <ol class="clauses-list">
            <li><strong>${locale === 'en' ? 'Attendance & Punctuality:' : 'Frequenza e puntualità:'}</strong> ${locale === 'en' ? 'The student is required to follow agreed times. Missed lessons not attributable to school are non-refundable.' : "L'allievo è tenuto a rispettare gli orari concordati. Le lezioni perse per cause non imputabili alla scuola non sono rimborsabili."}</li>
            <li><strong>${locale === 'en' ? 'Holidays & Closures:' : 'Festività e chiusure:'}</strong> ${locale === 'en' ? `Lessons follow the school academic calendar ${year}.` : `Le lezioni seguiranno il calendario scolastico delle festività ${year}.`}</li>
            <li><strong>${locale === 'en' ? 'Cancellations:' : 'Disdetta lezioni individuali:'}</strong> ${locale === 'en' ? 'Individual lesson cancellations must be received at least 24 hours in advance.' : 'Eventuali disdette per corsi individuali devono pervenire alla segreteria con almeno 24 ore di anticipo.'}</li>
            <li><strong>${locale === 'en' ? 'Teaching Materials:' : 'Diritti didattici:'}</strong> ${locale === 'en' ? 'All educational materials provided are for personal learning use only.' : 'I materiali forniti dalla scuola sono riservati all\'uso personale dell\'allievo per soli scopi formativi.'}</li>
          </ol>
        </div>
      `;
    }

    case 'minor_delegation': {
      const defaultTitle = locale === 'en' ? 'ATTACHMENT 2 — MINOR PICKUP DELEGATION & SELF-EXIT' : 'ALLEGATO 2 — DELEGA RITIRO MINORI E AUTORIZZAZIONE USCITA';
      const blockTitle = interpolateVariables(resolveI18n(props.title, locale) || defaultTitle, data);
      const del1Name = data.delegates?.delegate_1_name || data.pickup_delegate_1_name || '---';
      const del1Rel = data.delegates?.delegate_1_relation || data.pickup_delegate_1_relation || '---';
      const del1Phone = data.delegates?.delegate_1_phone || data.pickup_delegate_1_phone || '---';

      const del2Name = data.delegates?.delegate_2_name || data.pickup_delegate_2_name || null;
      const del2Rel = data.delegates?.delegate_2_relation || data.pickup_delegate_2_relation || null;
      const del2Phone = data.delegates?.delegate_2_phone || data.pickup_delegate_2_phone || null;

      const selfExit = data.delegates?.self_exit_authorized || data.self_exit_authorized_11plus || false;
      const showSelfExit = props.show_self_exit !== false;

      const defaultDisclaimer = locale === 'en'
        ? "The undersigned parent / legal guardian authorizes the following adults to pick up the student after class:"
        : "Il sottoscritto genitore / tutore legale delega le seguenti persone maggiorenni al ritiro dell'allievo al termine delle lezioni:";
      const disclaimer = resolveI18n(props.disclaimer_text, locale) || defaultDisclaimer;

      return `
        <div class="section-box">
          <div class="section-title">${blockTitle}</div>
          <p class="small-text">${disclaimer}</p>
          <div class="delegates-grid">
            <div class="delegate-card">
              <strong>${locale === 'en' ? 'Delegate 1' : 'Delegato 1'}:</strong> ${del1Name}<br/>
              <strong>${locale === 'en' ? 'Relation / Role' : 'Grado di parentela / Ruolo'}:</strong> ${del1Rel}<br/>
              <strong>${locale === 'en' ? 'Phone' : 'Recapito Telefonico'}:</strong> ${del1Phone}
            </div>
            ${del2Name ? `
            <div class="delegate-card">
              <strong>${locale === 'en' ? 'Delegate 2' : 'Delegato 2'}:</strong> ${del2Name}<br/>
              <strong>${locale === 'en' ? 'Relation / Role' : 'Grado di parentela / Ruolo'}:</strong> ${del2Rel || '---'}<br/>
              <strong>${locale === 'en' ? 'Phone' : 'Recapito Telefonico'}:</strong> ${del2Phone || '---'}
            </div>` : ''}
          </div>
          ${showSelfExit ? `
          <div class="self-exit-box">
            <input type="checkbox" ${selfExit ? 'checked' : ''} disabled />
            <span><strong>${locale === 'en' ? 'Self-exit Authorization (Students aged 11+ - Italian Law 172/2017):' : "Autorizzazione all'uscita autonoma (Allievi di età non inferiore a 11 anni - L. 172/2017):"}</strong> ${locale === 'en' ? 'The parent authorizes the student to leave school premises independently at the end of class.' : "Il genitore autorizza l'allievo ad allontanarsi autonomamente dai locali della scuola al termine dell'attività formativa."}</span>
          </div>` : ''}
        </div>
      `;
    }

    case 'gdpr_privacy': {
      const defaultTitle = locale === 'en' ? 'DATA PRIVACY POLICY & GDPR CONSENT (REG. EU 2016/679)' : 'INFORMATIVA PRIVACY E CONSENSO AL TRATTAMENTO DEI DATI (REG. UE 2016/679)';
      const blockTitle = interpolateVariables(resolveI18n(props.title, locale) || defaultTitle, data);
      const defaultPrivacy = locale === 'en'
        ? `Personal data collected is processed by ${school.name} as Data Controller, exclusively for educational service execution and administrative management.`
        : `I dati personali raccolti sono trattati da ${school.name} in qualità di Titolare del trattamento, esclusivamente per l'esecuzione del contratto formativo, la gestione amministrativa e le comunicazioni istituzionali.`;
      const privacyText = resolveI18n(props.privacy_text, locale) || defaultPrivacy;
      const showPhoto = props.show_photo_consent !== false;

      return `
        <div class="section-box">
          <div class="section-title">${blockTitle}</div>
          <p class="small-text">${privacyText}</p>
          <div class="consent-items">
            <div class="consent-row">
              <span class="check-box">[X]</span>
              <span><strong>${locale === 'en' ? 'Personal & Educational Data Processing:' : 'Trattamento Dati Personali e Didattici:'}</strong> ${locale === 'en' ? 'Mandatory for educational delivery and billing.' : "Obbligatorio per l'erogazione del servizio educativo e fatturazione."}</span>
            </div>
            ${showPhoto ? `
            <div class="consent-row">
              <span class="check-box">[X]</span>
              <span><strong>${locale === 'en' ? 'Educational Photos & Videos:' : 'Liberatoria Foto e Video Didattici:'}</strong> ${locale === 'en' ? 'Consent to photo and video captures during school activities.' : 'Consenso alla pubblicazione di riprese durante attività scolastiche senza finalità lesive della dignità.'}</span>
            </div>` : ''}
          </div>
        </div>
      `;
    }

    case 'signatures': {
      const city = resolveI18n(props.city_override, locale) || school.city || (locale === 'en' ? 'School Administration' : locale === 'ru' ? 'Администрация' : 'La Direzione');
      const dateLocaleStr = locale === 'en' ? 'en-US' : locale === 'ru' ? 'ru-RU' : 'it-IT';
      const dateStr = data.issue_date || new Date().toLocaleDateString(dateLocaleStr);
      const schoolLabel = resolveI18n(props.school_label, locale) || (locale === 'en' ? `Signature for ${school.name}` : locale === 'ru' ? `Подпись за ${school.name}` : `Firma per ${school.name}`);
      const studentLabel = resolveI18n(props.student_label, locale) || (locale === 'en' ? "Student / Parent Signature" : locale === 'ru' ? "Подпись студента / родителя" : "Firma dell'Allievo / Genitore Esercente");

      return `
        <div class="signatures-section">
          <div class="signatures-meta">
            ${locale === 'en' ? 'Place and Date' : locale === 'ru' ? 'Место и дата' : 'Luogo e Data'}: <strong>${city}, ${dateStr}</strong>
          </div>
          <div class="signatures-grid">
            <div class="signature-box">
              <div class="signature-line"></div>
              <div class="signature-label">${schoolLabel}</div>
            </div>
            <div class="signature-box">
              <div class="signature-line"></div>
              <div class="signature-label">${studentLabel}</div>
            </div>
          </div>
        </div>
      `;
    }

    case 'custom_text': {
      const rawText = resolveI18n(props.content_html || props.text || '', locale);
      const text = interpolateVariables(rawText, data);
      const rawTitle = resolveI18n(props.title, locale);
      return `
        <div class="section-box custom-text-block">
          ${rawTitle ? `<div class="section-title">${rawTitle}</div>` : ''}
          <div class="custom-content">${text}</div>
        </div>
      `;
    }

    case 'doc_footer': {
      const defaultFooter = locale === 'en'
        ? 'Official document generated via Atena School Management System. Certified digital copy.'
        : 'Documento generato tramite la piattaforma gestionale Atena School. Copia conforme all\'originale informatico.';
      const footerNote = resolveI18n(props.footer_note, locale) || defaultFooter;
      return `
        <div class="doc-footer">
          <div>${school.name} • C.F./P.IVA: ${school.vat_code || '---'} • ${school.address || ''}, ${school.city || ''}</div>
          <div class="footer-note">${footerNote}</div>
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
  const { blocksConfig, data, schoolProfile, documentNumber, documentTitle, locale = 'it' } = options;

  const school: SchoolProfile = {
    ...DEFAULT_SCHOOL_PROFILE,
    ...(schoolProfile || {}),
  };

  const paperFormat = blocksConfig.paper_format || DocumentPaperFormat.A4_PORTRAIT;
  const isLandscape = paperFormat === DocumentPaperFormat.A4_LANDSCAPE;
  const isCompact = paperFormat === DocumentPaperFormat.RECEIPT_COMPACT;

  const sortedBlocks = [...(blocksConfig.blocks || [])].sort((a, b) => (a.order || 0) - (b.order || 0));

  const renderedBlocksHtml = sortedBlocks
    .map((b) => renderBlockHtml(b, data, school, documentNumber || data.document_number, paperFormat, locale))
    .filter(Boolean)
    .join('\n');

  return `<!DOCTYPE html>
<html lang="${locale}">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>${documentTitle || data.title || (locale === 'en' ? 'Atena School Document' : 'Documento Atena School')}</title>
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
