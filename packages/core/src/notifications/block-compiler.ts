import {
  NotificationChannel,
  NotificationType,
  TemplateBlock,
  TemplateBlocksConfig,
  SchoolProfile,
} from '@atena/api-types';
import { DEFAULT_SCHOOL_PROFILE } from '../system/school-profile.service';

import { getFieldValue } from './trigger-matcher';

export function escapeHtml(str: string): string {
  if (!str) return '';
  return String(str)
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#039;');
}

/**
 * Replaces {{variable_name}} with corresponding values (including dot-notation paths)
 * Escapes HTML characters by default to prevent XSS in email bodies.
 */
export function compileTemplateVariables(
  text: string,
  variables: Record<string, any>,
  escape: boolean = true
): string {
  if (!text) return '';
  return text.replace(/\{\{\s*([a-zA-Z0-9_.]+)\s*\}\}/g, (_match, key) => {
    const val = getFieldValue(variables, key);
    if (val === undefined || val === null) {
      return '';
    }
    if (typeof val === 'object') {
      return '';
    }
    const strVal = String(val);
    return escape ? escapeHtml(strVal) : strVal;
  });
}

/**
 * Generates rich, authentic default visual blocks for any notification template
 */
export function getDefaultBlocksForTemplate(
  code: string,
  channel: NotificationChannel = NotificationChannel.EMAIL
): TemplateBlocksConfig {
  const isEmail = channel === NotificationChannel.EMAIL;

  if (!isEmail) {
    // ------------------------------------------------------------------------
    // TELEGRAM TEMPLATE DEFAULTS
    // ------------------------------------------------------------------------
    if (code === 'telegram_lead_alert' || code.includes('lead')) {
      return {
        version: 1,
        channel: NotificationChannel.TELEGRAM,
        blocks: [
          {
            id: 'tg-header-1',
            type: 'tg_header',
            title: 'Intestazione Alert Lead',
            is_enabled: true,
            order: 0,
            props: {
              title_text: '📩 *NUOVO MESSAGGIO DAL SITO*',
              divider: true,
            },
          },
          {
            id: 'tg-lead-info-2',
            type: 'tg_student_info',
            title: 'Dati Contatto Cliente',
            is_enabled: true,
            order: 1,
            props: {
              show_name: true,
              show_phone: true,
              show_email: true,
              show_interest: true,
            },
          },
          {
            id: 'tg-msg-3',
            type: 'tg_custom_text',
            title: 'Testo del Messaggio',
            is_enabled: true,
            order: 2,
            props: {
              content: '💬 *Messaggio:*\n_{{message_body}}_',
            },
          },
        ],
      };
    }

    if (code === 'telegram_payment_alert' || code.includes('payment')) {
      return {
        version: 1,
        channel: NotificationChannel.TELEGRAM,
        blocks: [
          {
            id: 'tg-header-1',
            type: 'tg_header',
            title: 'Intestazione Pagamento Stripe',
            is_enabled: true,
            order: 0,
            props: {
              title_text: '💳 *PAGAMENTO INCASSATO (STRIPE)*',
              divider: true,
            },
          },
          {
            id: 'tg-student-2',
            type: 'tg_student_info',
            title: 'Anagrafica Allievo / Pagatore',
            is_enabled: true,
            order: 1,
            props: {
              show_name: true,
              show_phone: true,
              show_email: true,
              show_purchaser: true,
            },
          },
          {
            id: 'tg-course-3',
            type: 'tg_course_info',
            title: 'Dettagli Corso',
            is_enabled: true,
            order: 2,
            props: {
              show_course: true,
              show_start_date: true,
              show_schedule: true,
            },
          },
          {
            id: 'tg-payment-4',
            type: 'tg_payment_info',
            title: 'Dettaglio Incasso',
            is_enabled: true,
            order: 3,
            props: {
              show_status: true,
              show_amount: true,
            },
          },
        ],
      };
    }

    // Default Telegram Booking Alert
    return {
      version: 1,
      channel: NotificationChannel.TELEGRAM,
      blocks: [
        {
          id: 'tg-header-1',
          type: 'tg_header',
          title: 'Intestazione Prenotazione',
          is_enabled: true,
          order: 0,
          props: {
            title_text: '🎓 *NUOVA PRENOTAZIONE CORSO*',
            divider: true,
          },
        },
        {
          id: 'tg-student-2',
          type: 'tg_student_info',
          title: 'Anagrafica Allievo & Referente',
          is_enabled: true,
          order: 1,
          props: {
            show_name: true,
            show_phone: true,
            show_email: true,
            show_purchaser: true,
          },
        },
        {
          id: 'tg-course-3',
          type: 'tg_course_info',
          title: 'Dettagli Corso & Orari',
          is_enabled: true,
          order: 2,
          props: {
            show_course: true,
            show_start_date: true,
            show_schedule: true,
          },
        },
        {
          id: 'tg-payment-4',
          type: 'tg_payment_info',
          title: 'Stato Contabile & Importo',
          is_enabled: true,
          order: 3,
          props: {
            show_status: true,
            show_amount: true,
          },
        },
      ],
    };
  }

  // ------------------------------------------------------------------------
  // EMAIL TEMPLATE DEFAULTS (Exact Authentic Atena School Layout)
  // ------------------------------------------------------------------------
  const isPaymentReceipt = code.includes('payment') || code.includes('receipt');
  const isAdminAlert = code.includes('admin') || code.includes('lead');

  if (isAdminAlert && (code.includes('contact') || code.includes('lead'))) {
    return {
      version: 1,
      channel: NotificationChannel.EMAIL,
      theme: {
        primary_color: '#043569',
        accent_color: '#F8861D',
        background_pattern: true,
        header_style: 'navy_grid',
      },
      blocks: [
        {
          id: 'block-header-1',
          type: 'header',
          title: 'Шапка бренда Atena School',
          is_enabled: true,
          order: 0,
          props: {
            show_rating: true,
            rating_text: '★ 4.9/5 • civitatis ornamento',
            title_text: 'ATENA SCHOOL',
            subtitle_text: 'Modulo di Contatto Online',
            status_text: '✉️ Nuova Richiesta Informazioni',
            status_bg: '#0284c7',
          },
        },
        {
          id: 'block-greeting-2',
          type: 'greeting',
          title: 'Заголовок и Вводный текст',
          is_enabled: true,
          order: 1,
          props: {
            heading: 'Nuovo Messaggio dal Sito',
            body_text: 'Un utente ha inviato una richiesta di informazioni tramite il form contatti del sito.',
          },
        },
        {
          id: 'block-table-3',
          type: 'contact_summary_table',
          title: 'Dati del Mittente',
          is_enabled: true,
          order: 2,
          props: {
            table_title: 'Dettagli Mittente',
            show_name: true,
            show_email: true,
            show_phone: true,
            show_interest: true,
          },
        },
        {
          id: 'block-custom-4',
          type: 'custom_text',
          title: 'Блок текста сообщения',
          is_enabled: true,
          order: 3,
          props: {
            box_title: '💬 Messaggio inviato:',
            content: '{{message_body}}',
            style: 'highlight',
          },
        },
        {
          id: 'block-cta-5',
          type: 'cta_button',
          title: 'Кнопка быстрого ответа',
          is_enabled: true,
          order: 4,
          props: {
            button_text: '✉️ Rispondi via Email ({{sender_email}})',
            button_url: 'mailto:{{sender_email}}',
          },
        },
        {
          id: 'block-footer-6',
          type: 'footer',
          title: 'Подвал школы',
          is_enabled: true,
          order: 5,
          props: {
            show_legal: true,
            show_contacts: true,
            show_copyright: true,
          },
        },
      ],
    };
  }

  // Booking Confirmation (Client / Admin)
  return {
    version: 1,
    channel: NotificationChannel.EMAIL,
    theme: {
      primary_color: '#043569',
      accent_color: '#F8861D',
      background_pattern: true,
      header_style: 'navy_grid',
    },
    blocks: [
      {
        id: 'block-header-1',
        type: 'header',
        title: 'Шапка бренда Atena School',
        is_enabled: true,
        order: 0,
        props: {
          show_rating: true,
          rating_text: '★ 4.9/5 • civitatis ornamento',
          title_text: 'ATENA SCHOOL',
          subtitle_text: 'CITTANOVA • CIVITATIS ORNAMENTO',
          status_text: isPaymentReceipt
            ? '✓ Pagamento Confermato (Stripe)'
            : '⏳ Prenotazione Confermata • Saldo in Sede',
          status_bg: isPaymentReceipt ? '#10b981' : '#f59e0b',
        },
      },
      {
        id: 'block-greeting-2',
        type: 'greeting',
        title: 'Приветствие и Вводный текст',
        is_enabled: true,
        order: 1,
        props: {
          heading: isPaymentReceipt
            ? 'Grazie per il tuo pagamento, {{purchaser_name}}!'
            : 'Grazie per la tua iscrizione, {{purchaser_name}}!',
          body_text: isPaymentReceipt
            ? 'La tua iscrizione al corso <strong>{{course_name}}</strong> è confermata e il pagamento di <strong>€{{total_amount}}</strong> è andato a buon fine. Qui sotto trovi tutti i dettagli del tuo percorso formativo.'
            : 'La tua prenotazione per il corso <strong>{{course_name}}</strong> è stata registrata con successo. Il saldo potrà essere effettuato comodamente in sede prima dell\'inizio delle lezioni.',
        },
      },
      {
        id: 'block-summary-table-3',
        type: 'summary_table',
        title: 'Таблица деталей курса (Riepilogo)',
        is_enabled: true,
        order: 2,
        props: {
          table_title: 'Riepilogo Iscrizione',
          show_course: true,
          show_purchaser: true,
          show_student: true,
          show_birth_date: true,
          show_birth_place: true,
          show_start_date: true,
          show_schedule: true,
          show_reg_fee: true,
          show_total: true,
        },
      },
      {
        id: 'block-cta-4',
        type: 'cta_button',
        title: 'Кнопка Личного кабинета',
        is_enabled: true,
        order: 3,
        props: {
          button_text: 'Accedi al Portale Studente →',
          button_url: '{{dashboard_url}}',
        },
      },
      {
        id: 'block-bank-5',
        type: 'bank_details',
        title: 'Инструкции и реквизиты IBAN',
        is_enabled: !isPaymentReceipt,
        order: 4,
        props: {
          box_title: '🏦 Coordinate per Saldo tramite Bonifico Bancario:',
          show_iban: true,
          show_bank_name: true,
          show_account_holder: true,
          show_causale: true,
          notes_text: 'Se preferisci saldare con bonifico prima dell\'inizio delle lezioni:',
        },
      },
      {
        id: 'block-location-6',
        type: 'school_location',
        title: 'Адрес филиала и WhatsApp',
        is_enabled: true,
        order: 5,
        props: {
          box_title: '📍 Sede delle lezioni & Segreteria:',
          show_address: true,
          show_whatsapp: true,
          custom_notice: 'Per qualsiasi variazione di orario o richiesta di materiale didattico, puoi contattarci direttamente su WhatsApp.',
        },
      },
      {
        id: 'block-footer-7',
        type: 'footer',
        title: 'Подвал и юридические данные',
        is_enabled: true,
        order: 6,
        props: {
          show_legal: true,
          show_contacts: true,
          show_copyright: true,
        },
      },
    ],
  };
}

/**
 * Compiles a visual blocks configuration into email client-safe HTML
 */
export function renderEmailFromBlocks(
  config: TemplateBlocksConfig,
  variables: Record<string, any>,
  schoolProfile: SchoolProfile = DEFAULT_SCHOOL_PROFILE
): { subject: string; html: string } {
  const v = variables || {};
  const school = schoolProfile || DEFAULT_SCHOOL_PROFILE;

  const sortedBlocks = [...(config.blocks || [])]
    .filter((b) => b.is_enabled)
    .sort((a, b) => (a.order ?? 0) - (b.order ?? 0));

  let renderedSubject = 'Notifica Atena School';
  let renderedBlocksHtml = '';

  for (const block of sortedBlocks) {
    const p = block.props || {};

    switch (block.type) {
      // 1. BRAND HEADER
      case 'header': {
        const rating = p.show_rating
          ? `<div style="display: inline-block; padding: 5px 14px; border-radius: 9999px; background: rgba(255, 255, 255, 0.12); border: 1px solid rgba(255, 255, 255, 0.25); font-size: 11px; font-weight: 800; letter-spacing: 0.5px; color: #ffffff; margin-bottom: 16px;"><span style="color: #F8861D;">★ 4.9/5</span> • ${compileTemplateVariables(p.rating_text || school.tagline || 'civitatis ornamento', v)}</div>`
          : '';

        const statusPill = p.status_text
          ? `<div style="padding-top: 18px;"><div style="display: inline-block; padding: 7px 18px; border-radius: 9999px; background-color: ${p.status_bg || '#f59e0b'}; color: #ffffff; font-size: 12px; font-weight: 800; letter-spacing: 0.5px; text-transform: uppercase; box-shadow: 0 4px 12px rgba(0, 0, 0, 0.15);">${compileTemplateVariables(p.status_text, v)}</div></div>`
          : '';

        renderedBlocksHtml += `
          <tr>
            <td style="background-color: #043569; background-image: linear-gradient(to right, rgba(255, 255, 255, 0.08) 1px, transparent 1px), linear-gradient(to bottom, rgba(255, 255, 255, 0.08) 1px, transparent 1px); background-size: 20px 20px; padding: 36px 32px 30px 32px; text-align: center; color: #ffffff;">
              <table role="presentation" width="100%" border="0" cellspacing="0" cellpadding="0">
                <tr><td align="center">${rating}</td></tr>
                <tr>
                  <td align="center">
                    <div style="font-size: 26px; font-weight: 900; letter-spacing: 2px; color: #ffffff; text-transform: uppercase;">${compileTemplateVariables(p.title_text || school.name, v)}</div>
                    <div style="font-size: 11px; font-weight: 600; color: #94a3b8; letter-spacing: 2px; text-transform: uppercase; margin-top: 4px;">${compileTemplateVariables(p.subtitle_text || `${school.city} • ${school.tagline}`, v)}</div>
                  </td>
                </tr>
                <tr><td align="center">${statusPill}</td></tr>
              </table>
            </td>
          </tr>`;
        break;
      }

      // 2. GREETING & INTRO
      case 'greeting': {
        const heading = compileTemplateVariables(p.heading || 'Gentile Allievo,', v);
        const body = compileTemplateVariables(p.body_text || '', v);
        renderedBlocksHtml += `
          <tr>
            <td style="padding: 32px 32px 16px 32px;">
              <h1 style="margin: 0 0 10px 0; font-size: 22px; font-weight: 900; color: #043569; letter-spacing: -0.5px; line-height: 1.3;">
                ${heading}
              </h1>
              <p style="margin: 0 0 20px 0; font-size: 14px; line-height: 1.6; color: #475569;">
                ${body}
              </p>
            </td>
          </tr>`;
        break;
      }

      // 3. SUMMARY TABLE
      case 'summary_table': {
        const courseName = compileTemplateVariables(v.course_name || 'Kids (6-7 anni)', v);
        const purchaser = compileTemplateVariables(v.purchaser_name || 'Petukhov Andrii', v);
        const student = compileTemplateVariables(v.student_name || 'Viktoria Petukhova', v);
        const birthDate = compileTemplateVariables(v.student_birth_date || '2005-12-02', v);
        const birthPlace = compileTemplateVariables(v.student_birth_place || v.birth_place || 'Cittanova RC', v);
        const startDate = compileTemplateVariables(v.date || v.start_date || '2026-10-06', v);
        const schedule = compileTemplateVariables(v.lesson_schedule || v.schedule_text || v.time || 'Martedì e Giovedì 17:00-18:00', v);
        const regFee = Number(String(v.registration_fee || '30').replace(/[^0-9.]/g, '') || 30).toFixed(2);
        const total = Number(String(v.total_amount || v.amount_paid || '103.2').replace(/[^0-9.]/g, '') || 103.2).toFixed(2);
        const bookingId = compileTemplateVariables(v.booking_id || '10bde731-f620-4e16-a240-63bb08b86d70', v);

        renderedBlocksHtml += `
          <tr>
            <td style="padding: 0 32px 24px 32px;">
              <table role="presentation" width="100%" border="0" cellspacing="0" cellpadding="0" style="background-color: #f8fafc; background-image: linear-gradient(to right, rgba(4, 53, 105, 0.04) 1px, transparent 1px), linear-gradient(to bottom, rgba(4, 53, 105, 0.04) 1px, transparent 1px); background-size: 20px 20px; border-radius: 20px; border: 1px solid #e2e8f0; overflow: hidden;">
                <tr>
                  <td style="padding: 16px 20px; background-color: #ffffff; border-bottom: 1px solid #e2e8f0;">
                    <table role="presentation" width="100%" border="0" cellspacing="0" cellpadding="0">
                      <tr>
                        <td>
                          <span style="display: inline-block; width: 8px; height: 8px; border-radius: 50%; background-color: #F8861D; margin-right: 8px; vertical-align: middle;"></span>
                          <span style="font-size: 12px; font-weight: 900; text-transform: uppercase; letter-spacing: 1px; color: #043569; vertical-align: middle;">
                            ${compileTemplateVariables(p.table_title || 'Riepilogo Iscrizione', v)}
                          </span>
                        </td>
                        <td align="right">
                          <span style="font-size: 11px; font-weight: 700; color: #64748b; background: #f1f5f9; padding: 3px 8px; border-radius: 6px;">
                            ${bookingId}
                          </span>
                        </td>
                      </tr>
                    </table>
                  </td>
                </tr>
                <tr>
                  <td style="padding: 18px 20px;">
                    <table role="presentation" width="100%" border="0" cellspacing="0" cellpadding="0">
                      ${p.show_course !== false ? `<tr><td style="padding: 6px 0; font-size: 13px; color: #64748b; font-weight: 600;">Corso:</td><td align="right" style="padding: 6px 0; font-size: 13px; font-weight: 800; color: #043569;">${courseName}</td></tr>` : ''}
                      ${p.show_purchaser !== false ? `<tr><td style="padding: 6px 0; font-size: 13px; color: #64748b; font-weight: 600;">Acquirente / Referente:</td><td align="right" style="padding: 6px 0; font-size: 13px; font-weight: 700; color: #1e293b;">${purchaser}</td></tr>` : ''}
                      ${p.show_student !== false ? `<tr><td style="padding: 6px 0; font-size: 13px; color: #64748b; font-weight: 600;">Studente (Allievo):</td><td align="right" style="padding: 6px 0; font-size: 13px; font-weight: 800; color: #043569;">${student}</td></tr>` : ''}
                      ${p.show_birth_date !== false ? `<tr><td style="padding: 6px 0; font-size: 13px; color: #64748b; font-weight: 600;">Data di nascita studente:</td><td align="right" style="padding: 6px 0; font-size: 13px; font-weight: 700; color: #1e293b;">${birthDate}</td></tr>` : ''}
                      ${p.show_birth_place !== false ? `<tr><td style="padding: 6px 0; font-size: 13px; color: #64748b; font-weight: 600;">Luogo di nascita:</td><td align="right" style="padding: 6px 0; font-size: 13px; font-weight: 700; color: #1e293b;">${birthPlace}</td></tr>` : ''}
                      ${p.show_start_date !== false ? `<tr><td style="padding: 6px 0; font-size: 13px; color: #64748b; font-weight: 600;">Data inizio corso:</td><td align="right" style="padding: 6px 0; font-size: 13px; font-weight: 700; color: #1e293b;">${startDate}</td></tr>` : ''}
                      ${p.show_schedule !== false ? `<tr><td style="padding: 6px 0; font-size: 13px; color: #64748b; font-weight: 600;">Orario e Frequenza:</td><td align="right" style="padding: 6px 0; font-size: 13px; font-weight: 700; color: #1e293b;">${schedule}</td></tr>` : ''}
                      ${p.show_reg_fee !== false && Number(regFee) > 0 ? `<tr><td style="padding: 6px 0; font-size: 13px; color: #64748b; font-weight: 600;">Quota associativa annuale:</td><td align="right" style="padding: 6px 0; font-size: 13px; font-weight: 700; color: #1e293b;">€${regFee}</td></tr>` : ''}
                      ${p.show_total !== false ? `<tr><td colspan="2" style="padding-top: 10px; border-top: 1px dashed #cbd5e1;"></td></tr><tr><td style="padding: 6px 0; font-size: 14px; font-weight: 900; color: #043569;">Totale Importo:</td><td align="right" style="padding: 6px 0; font-size: 20px; font-weight: 900; color: #F8861D;">€${total}</td></tr>` : ''}
                    </table>
                  </td>
                </tr>
              </table>
            </td>
          </tr>`;
        break;
      }

      // 3b. CONTACT SUMMARY TABLE (for lead/contact form templates)
      case 'contact_summary_table': {
        const senderName = compileTemplateVariables(v.sender_name || v.purchaser_name || 'Mario Rossi', v);
        const senderEmail = compileTemplateVariables(v.sender_email || v.email || 'mario.rossi@example.com', v);
        const senderPhone = compileTemplateVariables(v.sender_phone || v.phone || '+39 333 1234567', v);
        const interest = compileTemplateVariables(v.interest || v.topic || 'Informazioni Generali', v);

        renderedBlocksHtml += `
          <tr>
            <td style="padding: 0 32px 24px 32px;">
              <table role="presentation" width="100%" border="0" cellspacing="0" cellpadding="0" style="background-color: #f8fafc; background-image: linear-gradient(to right, rgba(4, 53, 105, 0.04) 1px, transparent 1px), linear-gradient(to bottom, rgba(4, 53, 105, 0.04) 1px, transparent 1px); background-size: 20px 20px; border-radius: 20px; border: 1px solid #e2e8f0; overflow: hidden;">
                <tr>
                  <td style="padding: 16px 20px; background-color: #ffffff; border-bottom: 1px solid #e2e8f0;">
                    <span style="display: inline-block; width: 8px; height: 8px; border-radius: 50%; background-color: #0284c7; margin-right: 8px; vertical-align: middle;"></span>
                    <span style="font-size: 12px; font-weight: 900; text-transform: uppercase; letter-spacing: 1px; color: #043569; vertical-align: middle;">
                      ${compileTemplateVariables(p.table_title || 'Dettagli Mittente', v)}
                    </span>
                  </td>
                </tr>
                <tr>
                  <td style="padding: 18px 20px;">
                    <table role="presentation" width="100%" border="0" cellspacing="0" cellpadding="0">
                      ${p.show_name !== false ? `<tr><td style="padding: 6px 0; font-size: 13px; color: #64748b; font-weight: 600;">Nome Mittente:</td><td align="right" style="padding: 6px 0; font-size: 13px; font-weight: 800; color: #043569;">${senderName}</td></tr>` : ''}
                      ${p.show_email !== false ? `<tr><td style="padding: 6px 0; font-size: 13px; color: #64748b; font-weight: 600;">Email:</td><td align="right" style="padding: 6px 0; font-size: 13px; font-weight: 700; color: #1e293b;"><a href="mailto:${senderEmail}" style="color: #043569; text-decoration: underline;">${senderEmail}</a></td></tr>` : ''}
                      ${p.show_phone !== false && senderPhone ? `<tr><td style="padding: 6px 0; font-size: 13px; color: #64748b; font-weight: 600;">Telefono:</td><td align="right" style="padding: 6px 0; font-size: 13px; font-weight: 700; color: #1e293b;">${senderPhone}</td></tr>` : ''}
                      ${p.show_interest !== false && interest ? `<tr><td style="padding: 6px 0; font-size: 13px; color: #64748b; font-weight: 600;">Interesse / Argomento:</td><td align="right" style="padding: 6px 0; font-size: 13px; font-weight: 700; color: #1e293b;">${interest}</td></tr>` : ''}
                    </table>
                  </td>
                </tr>
              </table>
            </td>
          </tr>`;
        break;
      }

      // 4. CTA BUTTON
      case 'cta_button': {
        const btnText = compileTemplateVariables(p.button_text || 'Accedi al Portale Studente →', v);
        const btnUrl = compileTemplateVariables(p.button_url || v.dashboard_url || 'https://app.atenaschool.com', v);
        renderedBlocksHtml += `
          <tr>
            <td style="padding: 0 32px 24px 32px;" align="center">
              <a href="${btnUrl}" target="_blank" style="display: block; width: 100%; box-sizing: border-box; background: linear-gradient(135deg, #043569 0%, #032448 100%); color: #ffffff; font-size: 15px; font-weight: 800; text-align: center; text-decoration: none; padding: 18px 28px; border-radius: 14px; box-shadow: 0 10px 20px -5px rgba(4, 53, 105, 0.35); border: 1px solid rgba(255, 255, 255, 0.15);">
                ${btnText}
              </a>
            </td>
          </tr>`;
        break;
      }

      // 5. BANK DETAILS (IBAN)
      case 'bank_details': {
        const title = compileTemplateVariables(p.box_title || '🏦 Coordinate per Saldo tramite Bonifico Bancario:', v);
        const notes = compileTemplateVariables(p.notes_text || 'Se preferisci saldare con bonifico prima dell\'inizio delle lezioni:', v);
        const iban = school.iban || 'IT60X0542811101000000123456';
        const courseName = compileTemplateVariables(v.course_name || 'Kids (6-7 anni)', v);
        const purchaser = compileTemplateVariables(v.purchaser_name || 'Petukhov Andrii', v);
        const bookingId = compileTemplateVariables(v.booking_id || '10bde731-f620-4e16-a240-63bb08b86d70', v);

        renderedBlocksHtml += `
          <tr>
            <td style="padding: 0 32px 20px 32px;">
              <table role="presentation" width="100%" border="0" cellspacing="0" cellpadding="0" style="background-color: #f0fdf4; border: 1px solid #bbf7d0; border-radius: 16px; padding: 16px 18px;">
                <tr>
                  <td>
                    <div style="font-size: 13px; font-weight: 800; color: #166534; margin-bottom: 6px;">${title}</div>
                    <div style="font-size: 12px; line-height: 1.6; color: #14532d;">
                      ${notes}<br>
                      ${p.show_iban !== false ? `• <strong>IBAN:</strong> <code style="background: #ffffff; padding: 2px 6px; border-radius: 4px; font-weight: 800; font-family: monospace; border: 1px solid #bbf7d0;">${iban}</code><br>` : ''}
                      ${p.show_bank_name !== false && school.bank_name ? `• <strong>Banca:</strong> ${school.bank_name}<br>` : ''}
                      ${p.show_account_holder !== false && school.account_holder ? `• <strong>Intestatario:</strong> ${school.account_holder}<br>` : ''}
                      ${p.show_causale !== false ? `• <strong>Causale:</strong> Saldo Corso ${courseName} - ${purchaser} (ID: ${bookingId})` : ''}
                    </div>
                  </td>
                </tr>
              </table>
            </td>
          </tr>`;
        break;
      }

      // 6. SCHOOL LOCATION & WHATSAPP
      case 'school_location': {
        const title = compileTemplateVariables(p.box_title || '📍 Sede delle lezioni & Segreteria:', v);
        const custom = compileTemplateVariables(p.custom_notice || '', v);
        renderedBlocksHtml += `
          <tr>
            <td style="padding: 0 32px 24px 32px;">
              <table role="presentation" width="100%" border="0" cellspacing="0" cellpadding="0" style="background-color: #fffaf5; border: 1px solid #fed7aa; border-radius: 16px; padding: 16px 18px;">
                <tr>
                  <td>
                    <div style="font-size: 13px; font-weight: 800; color: #c2410c; margin-bottom: 4px;">${title}</div>
                    <div style="font-size: 12px; line-height: 1.55; color: #9a3412;">
                      ${p.show_address !== false ? `Le lezioni si tengono presso la nostra sede in <strong>${school.address}, ${school.city} (${school.province})</strong>.` : ''}
                      ${custom ? ` ${custom}` : ''}
                      ${p.show_whatsapp !== false ? ` Contattaci su WhatsApp al <strong>${school.whatsapp || school.phone}</strong>.` : ''}
                    </div>
                  </td>
                </tr>
              </table>
            </td>
          </tr>`;
        break;
      }

      // 7. CUSTOM TEXT / HIGHLIGHT BOX
      case 'custom_text': {
        const boxTitle = compileTemplateVariables(p.box_title || '', v);
        const content = compileTemplateVariables(p.content || '', v);
        renderedBlocksHtml += `
          <tr>
            <td style="padding: 0 32px 20px 32px;">
              <div style="background-color: #f8fafc; border: 1px solid #e2e8f0; border-radius: 16px; padding: 18px;">
                ${boxTitle ? `<div style="font-size: 12px; font-weight: 800; color: #043569; text-transform: uppercase; margin-bottom: 6px;">${boxTitle}</div>` : ''}
                <div style="font-size: 13px; line-height: 1.6; color: #334155; white-space: pre-wrap;">${content}</div>
              </div>
            </td>
          </tr>`;
        break;
      }

      // 8. FOOTER
      case 'footer': {
        renderedBlocksHtml += `
          <tr>
            <td style="background-color: #f8fafc; border-top: 1px solid #e2e8f0; padding: 32px; text-align: center;">
              ${p.show_legal !== false ? `<div style="font-size: 14px; font-weight: 900; color: #043569; letter-spacing: 0.5px; margin-bottom: 6px;">${school.legal_name || school.name}</div>` : ''}
              ${p.show_contacts !== false ? `
                <div style="font-size: 12px; color: #64748b; line-height: 1.6; margin-bottom: 16px;">
                  ${school.address}, ${school.cap} ${school.city} (${school.province}), ${school.country}<br>
                  Tel: ${school.phone}${school.landline ? ` • Fisso: ${school.landline}` : ''} • Email: <a href="mailto:${school.secretariat_email || school.email}" style="color: #043569; font-weight: 700; text-decoration: underline;">${school.secretariat_email || school.email}</a>
                </div>
              ` : ''}
              ${p.show_copyright !== false ? `<div style="font-size: 11px; color: #94a3b8; font-weight: 600;">© ${new Date().getFullYear()} ${school.name}. Tutti i diritti riservati.</div>` : ''}
            </td>
          </tr>`;
        break;
      }

      default:
        break;
    }
  }

  const isLead = Boolean(v.sender_name || config.blocks?.some((b) => b.type === 'contact_summary_table'));
  const isPayment = Boolean(v.is_paid_online || (typeof v.payment_status === 'string' && (v.payment_status.includes('Stripe') || v.payment_status.includes('Pagato'))));

  let defaultSubject = `Conferma Iscrizione: ${v.course_name || 'Corso'} • ${school.name}`;
  if (isLead) {
    const sender = v.sender_name || 'Cliente';
    defaultSubject = `📩 Nuovo Messaggio dal Sito: ${sender} • ${school.name}`;
  } else if (isPayment) {
    defaultSubject = `Ricevuta di Pagamento: ${v.course_name || 'Corso'} • ${school.name}`;
  }

  renderedSubject = compileTemplateVariables(v.subject || defaultSubject, v);

  const html = `<!DOCTYPE html>
<html lang="it">
<head>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>${renderedSubject}</title>
</head>
<body style="margin: 0; padding: 0; background-color: #f8fafc; font-family: -apple-system, BlinkMacSystemFont, 'Nunito', 'Segoe UI', Roboto, Helvetica, Arial, sans-serif; -webkit-font-smoothing: antialiased; color: #1e293b;">
  <table role="presentation" width="100%" border="0" cellspacing="0" cellpadding="0" style="background-color: #f8fafc; background-image: linear-gradient(to right, rgba(4, 53, 105, 0.06) 1px, transparent 1px), linear-gradient(to bottom, rgba(4, 53, 105, 0.06) 1px, transparent 1px); background-size: 28px 28px; padding: 40px 16px;">
    <tr>
      <td align="center">
        <table role="presentation" width="100%" border="0" cellspacing="0" cellpadding="0" style="max-width: 600px; background-color: #ffffff; border-radius: 28px; overflow: hidden; box-shadow: 0 20px 40px -15px rgba(4, 53, 105, 0.08), 0 0 0 1px rgba(226, 232, 240, 0.9);">
          ${renderedBlocksHtml}
        </table>
      </td>
    </tr>
  </table>
</body>
</html>`;

  return { subject: renderedSubject, html };
}

export function escapeTgHtml(text?: string | null): string {
  if (!text) return '';
  return String(text)
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;');
}

export function compileTgTemplateVariables(
  text: string,
  variables: Record<string, any>
): string {
  if (!text) return '';
  return text.replace(/\{\{\s*([a-zA-Z0-9_.]+)\s*\}\}/g, (_match, key) => {
    const val = getFieldValue(variables, key);
    if (val === undefined || val === null) {
      return '';
    }
    return escapeTgHtml(String(val));
  });
}

/**
 * Compiles visual blocks configuration into Telegram HTML format
 */
export function renderTelegramFromBlocks(
  config: TemplateBlocksConfig,
  variables: Record<string, any>
): { text: string; inlineKeyboard?: any[] } {
  const v = variables || {};
  const sortedBlocks = [...(config.blocks || [])]
    .filter((b) => b.is_enabled)
    .sort((a, b) => (a.order ?? 0) - (b.order ?? 0));

  const lines: string[] = [];

  const formatTgHtml = (str: string) => {
    if (!str) return '';
    return str
      .replace(/\*\*(.*?)\*\*/g, '<b>$1</b>')
      .replace(/\*(.*?)\*/g, '<b>$1</b>')
      .replace(/_(.*?)_/g, '<i>$1</i>');
  };

  for (const block of sortedBlocks) {
    const p = block.props || {};

    switch (block.type) {
      case 'tg_header': {
        const rawTitle = compileTgTemplateVariables(p.title_text || '🎓 <b>NUOVA NOTIFICA ATENA SCHOOL</b>', v);
        lines.push(formatTgHtml(rawTitle));
        if (p.divider !== false) lines.push('━━━━━━━━━━━━━━━━━━━━');
        break;
      }

      case 'tg_student_info': {
        const isLead = Boolean(v.sender_name && !v.student_name);
        if (isLead) {
          const senderName = escapeTgHtml(v.sender_name || 'Andrii Petukhov');
          const phone = escapeTgHtml(v.sender_phone || v.phone || '');
          const email = escapeTgHtml(v.sender_email || v.email || '');
          const interest = escapeTgHtml(v.interest || v.topic || '');

          if (p.show_name !== false) lines.push(`👤 <b>Mittente:</b> ${senderName}`);
          if (p.show_phone !== false && phone) lines.push(`📞 <b>Telefono:</b> <code>${phone}</code>`);
          if (p.show_email !== false && email) lines.push(`✉️ <b>Email:</b> <a href="mailto:${email}">${email}</a>`);
          if (p.show_interest !== false && interest) lines.push(`🎯 <b>Interesse:</b> ${interest}`);
        } else {
          const student = escapeTgHtml(v.student_name || 'Luca Rossi');
          const phone = escapeTgHtml(v.phone || v.purchaser_phone || '+39 333 1234567');
          const email = escapeTgHtml(v.email || v.purchaser_email || 'mario.rossi@example.com');
          const purchaser = escapeTgHtml(v.purchaser_name || 'Mario Rossi');

          if (p.show_name !== false) lines.push(`👤 <b>Studente:</b> ${student}`);
          if (p.show_phone !== false) lines.push(`📞 <b>Telefono:</b> <code>${phone}</code>`);
          if (p.show_email !== false && email) lines.push(`✉️ <b>Email:</b> <a href="mailto:${email}">${email}</a>`);
          if (p.show_purchaser !== false && purchaser !== student) lines.push(`👥 <b>Referente:</b> ${purchaser}`);
          if (p.show_interest !== false && v.interest) lines.push(`🎯 <b>Interesse:</b> ${escapeTgHtml(v.interest)}`);
        }
        break;
      }

      case 'tg_course_info': {
        const course = escapeTgHtml(v.course_name || 'Kids (6-7 anni)');
        const startDate = escapeTgHtml(v.start_date || v.date || '2026-10-06');
        const schedule = escapeTgHtml(v.schedule_text || v.lesson_schedule || 'Martedì e Giovedì 17:00-18:00');

        lines.push('');
        if (p.show_course !== false) lines.push(`📚 <b>Corso:</b> ${course}`);
        if (p.show_start_date !== false) lines.push(`📅 <b>Inizio:</b> <code>${startDate}</code>`);
        if (p.show_schedule !== false) lines.push(`⏰ <b>Orario:</b> ${schedule}`);
        break;
      }

      case 'tg_payment_info': {
        const status = escapeTgHtml(v.payment_status_label || '⏳ Saldo in Sede');
        const amount = escapeTgHtml(v.amount_paid || v.total_amount || '103.20');

        lines.push('');
        if (p.show_status !== false) lines.push(`💳 <b>Stato:</b> <b>${status}</b>`);
        if (p.show_amount !== false) lines.push(`💰 <b>Totale:</b> <b>€${amount}</b>`);
        break;
      }

      case 'tg_custom_text': {
        const content = compileTgTemplateVariables(p.content || '', v);
        if (content) lines.push(`\n${formatTgHtml(content)}`);
        break;
      }

      default:
        break;
    }
  }

  lines.push('━━━━━━━━━━━━━━━━━━━━');

  return { text: lines.join('\n') };
}
