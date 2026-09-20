"use client";

import React, { useMemo } from "react";
import { NotificationChannel } from "../types";
import type { NotificationTemplateRecord } from "../types";
import {
  renderClientBookingConfirmationEmail,
  renderAdminBookingNotificationEmail,
  renderContactFormAdminEmail,
  DEFAULT_SCHOOL_PROFILE,
  BookingEmailTemplateData,
  ContactEmailTemplateData,
} from "@atena/core";
import { Mail, MessageSquare, CheckCheck } from "lucide-react";

export const SAMPLE_PREVIEW_DATA: Record<string, string> = {
  student_name: "Viktoria Petukhova",
  purchaser_name: "Petukhov Andrii",
  course_name: "Kids (6-7 anni)",
  amount_paid: "103.20",
  total_amount: "103.20",
  course_price: "73.20",
  registration_fee: "30.00",
  date: "2026-10-06",
  start_date: "2026-10-06",
  time: "Martedì e Giovedì 17:00-18:00",
  lesson_schedule: "Martedì e Giovedì 17:00-18:00",
  schedule_text: "Martedì e Giovedì 17:00-18:00",
  student_birth_date: "2005-12-02",
  birth_place: "Cittanova RC",
  student_birth_place: "Cittanova RC",
  student_tax_code: "PTKNDR05T02Z138X",
  purchaser_tax_code: "PTKNDR05T02Z138X",
  purchaser_email: "andrii.petukhov@gmail.com",
  purchaser_phone: "+39 333 1234567",
  email: "andrii.petukhov@gmail.com",
  phone: "+39 333 1234567",
  app_url: "https://app.atenaschool.com",
  dashboard_url: "https://app.atenaschool.com",
  admin_url: "https://admin.atenaschool.com",
  booking_id: "10bde731-f620-4e16-a240-63bb08b86d70",
  sender_name: "Andrii Petukhov",
  sender_email: "andrii.petukhov@gmail.com",
  sender_phone: "+39 333 1234567",
  interest: "Kids (6-7 anni)",
  topic: "Iscrizione Corso",
  message: "Vorrei confermare l'orario delle lezioni per il corso Kids.",
  message_body: "Vorrei confermare l'orario delle lezioni per il corso Kids.",
  payment_method: "Contanti / Saldo in Sede",
  payment_method_label: "Saldo in Sede",
  payment_status: "In attesa di saldo",
  payment_status_label: "⏳ Saldo in Sede",
};

export function buildCompleteEmailHtml(
  template: NotificationTemplateRecord,
  variables: Record<string, string> = SAMPLE_PREVIEW_DATA
): { subject: string; html: string } {
  const code = (template.code || "").toLowerCase();
  const isPaidOnline =
    code.includes("payment") ||
    code.includes("paid") ||
    code === "payment_receipt_customer" ||
    code === "telegram_payment_alert" ||
    String(variables.payment_status || "").toLowerCase().includes("pagato");

  // Helper to extract clean numeric value
  const parseNum = (val: any, defaultVal = 0) => {
    if (!val) return defaultVal;
    const num = parseFloat(String(val).replace(/[^0-9.]/g, ""));
    return isNaN(num) ? defaultVal : num;
  };

  const totalNum = parseNum(variables.total_amount || variables.amount_paid, 103.2);
  const regFeeNum = parseNum(variables.registration_fee, 30.0);
  const courseFeeNum = totalNum >= regFeeNum ? totalNum - regFeeNum : totalNum;

  // 1. Client Booking Confirmation & Payment Receipt (Exact Authentic Atena School Layout)
  if (
    code === "booking_confirmation_customer" ||
    code === "payment_receipt_customer" ||
    code.includes("customer")
  ) {
    const data: BookingEmailTemplateData = {
      courseName: variables.course_name || "Kids (6-7 anni)",
      purchaserName: variables.purchaser_name || "Petukhov Andrii",
      studentName: variables.student_name || "Viktoria Petukhova",
      purchaserEmail: variables.purchaser_email || variables.email || "andrii.petukhov@gmail.com",
      purchaserPhone: variables.purchaser_phone || variables.phone || "+39 333 1234567",
      purchaserTaxCode: variables.purchaser_tax_code || "PTKNDR05T02Z138X",
      birthPlace: variables.birth_place || "Cittanova RC",
      isForChild: true,
      studentBirthDate: variables.student_birth_date || "2005-12-02",
      studentBirthPlace: variables.student_birth_place || "Cittanova RC",
      date: variables.date || variables.start_date || "2026-10-06",
      time: variables.time || variables.lesson_schedule || variables.schedule_text || "Martedì e Giovedì 17:00-18:00",
      lessonSchedule: variables.lesson_schedule || variables.schedule_text || variables.time || "Martedì e Giovedì 17:00-18:00",
      totalEur: totalNum.toFixed(2),
      courseFeeEur: courseFeeNum.toFixed(2),
      regFeeEur: regFeeNum.toFixed(2),
      isPaidOnline: isPaidOnline,
      paymentStatusText: isPaidOnline ? "Pagato Online con Carta (Stripe)" : "Prenotato con Saldo in Sede",
      bookingId: variables.booking_id || "10bde731-f620-4e16-a240-63bb08b86d70",
      appUrl: variables.app_url || variables.dashboard_url || "https://app.atenaschool.com",
      schoolProfile: DEFAULT_SCHOOL_PROFILE,
    };
    return renderClientBookingConfirmationEmail(data);
  }

  // 2. Admin Booking Notification
  if (code === "booking_alert_admin" || code.includes("booking_alert")) {
    const data: BookingEmailTemplateData = {
      courseName: variables.course_name || "Kids (6-7 anni)",
      purchaserName: variables.purchaser_name || "Petukhov Andrii",
      studentName: variables.student_name || "Viktoria Petukhova",
      purchaserEmail: variables.purchaser_email || variables.email || "andrii.petukhov@gmail.com",
      purchaserPhone: variables.purchaser_phone || variables.phone || "+39 333 1234567",
      purchaserTaxCode: variables.purchaser_tax_code || "PTKNDR05T02Z138X",
      birthPlace: variables.birth_place || "Cittanova RC",
      isForChild: true,
      studentBirthDate: variables.student_birth_date || "2005-12-02",
      studentBirthPlace: variables.student_birth_place || "Cittanova RC",
      date: variables.date || variables.start_date || "2026-10-06",
      time: variables.time || variables.lesson_schedule || variables.schedule_text || "Martedì e Giovedì 17:00-18:00",
      lessonSchedule: variables.lesson_schedule || variables.schedule_text || variables.time || "Martedì e Giovedì 17:00-18:00",
      totalEur: totalNum.toFixed(2),
      courseFeeEur: courseFeeNum.toFixed(2),
      regFeeEur: regFeeNum.toFixed(2),
      isPaidOnline: isPaidOnline,
      paymentStatusText: isPaidOnline ? "Pagato Online con Carta (Stripe)" : "Prenotato con Saldo in Sede",
      bookingId: variables.booking_id || "10bde731-f620-4e16-a240-63bb08b86d70",
      appUrl: variables.app_url || variables.dashboard_url || "https://app.atenaschool.com",
      schoolProfile: DEFAULT_SCHOOL_PROFILE,
    };
    return renderAdminBookingNotificationEmail(data);
  }

  // 3. Contact Form Submission
  if (code === "contact_lead_admin" || code.includes("contact") || code.includes("lead")) {
    const data: ContactEmailTemplateData = {
      firstName: (variables.sender_name || "Andrii Petukhov").split(" ")[0] || "Andrii",
      lastName: (variables.sender_name || "Andrii Petukhov").split(" ").slice(1).join(" ") || "Petukhov",
      email: variables.sender_email || variables.email || "andrii.petukhov@gmail.com",
      phone: variables.sender_phone || variables.phone || "+39 333 1234567",
      interest: variables.interest || variables.topic || "Kids (6-7 anni)",
      message:
        variables.message ||
        variables.message_body ||
        "Buongiorno, vorrei informazioni sulle iscrizioni e gli orari per il corso Kids.",
      schoolProfile: DEFAULT_SCHOOL_PROFILE,
    };
    return renderContactFormAdminEmail(data);
  }

  // 4. Generic / Custom Email Template compilation
  const subject = (template.subject_template || "").replace(
    /\{\{\s*([a-zA-Z0-9_]+)\s*\}\}/g,
    (_, key) => variables[key] || `[${key}]`
  );

  const compiledBody = (template.body_template || "").replace(
    /\{\{\s*([a-zA-Z0-9_]+)\s*\}\}/g,
    (_, key) => variables[key] || `[${key}]`
  );

  if (compiledBody.includes("<html") || compiledBody.includes("<!DOCTYPE")) {
    return { subject, html: compiledBody };
  }

  // Wrap partial HTML in standard Atena School envelope
  const html = `<!DOCTYPE html>
<html lang="it">
<head>
  <meta charset="utf-8">
  <title>${subject}</title>
</head>
<body style="margin: 0; padding: 0; background-color: #f8fafc; font-family: -apple-system, BlinkMacSystemFont, 'Nunito', 'Segoe UI', Roboto, sans-serif; color: #1e293b;">
  <table role="presentation" width="100%" border="0" cellspacing="0" cellpadding="0" style="background-color: #f8fafc; padding: 30px 16px;">
    <tr>
      <td align="center">
        <table role="presentation" width="100%" border="0" cellspacing="0" cellpadding="0" style="max-width: 600px; background-color: #ffffff; border-radius: 24px; overflow: hidden; box-shadow: 0 10px 30px rgba(4, 53, 105, 0.08); border: 1px solid #e2e8f0;">
          <tr>
            <td style="background-color: #043569; padding: 32px 28px; text-align: center; color: #ffffff;">
              <div style="font-size: 24px; font-weight: 900; letter-spacing: 2px; text-transform: uppercase;">ATENA SCHOOL</div>
              <div style="font-size: 11px; font-weight: 600; color: #94a3b8; letter-spacing: 1.5px; text-transform: uppercase; margin-top: 4px;">Scuola di Lingue & Formazione</div>
            </td>
          </tr>
          <tr>
            <td style="padding: 32px 28px; font-size: 14px; line-height: 1.6; color: #334155;">
              ${compiledBody}
            </td>
          </tr>
          <tr>
            <td style="background-color: #f8fafc; border-top: 1px solid #e2e8f0; padding: 24px; text-align: center; font-size: 11px; color: #94a3b8;">
              © ${new Date().getFullYear()} Atena School. Tutti i diritti riservati.
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

interface TemplatePreviewFrameProps {
  template: NotificationTemplateRecord;
  customVariables?: Record<string, string>;
  isMini?: boolean;
}

export function TemplatePreviewFrame({
  template,
  customVariables,
  isMini = false,
}: TemplatePreviewFrameProps) {
  const isEmail = template.channel === NotificationChannel.EMAIL;
  const mergedVars = useMemo(
    () => ({ ...SAMPLE_PREVIEW_DATA, ...(customVariables || {}) }),
    [customVariables]
  );

  const rendered = useMemo(() => {
    if (isEmail) {
      return buildCompleteEmailHtml(template, mergedVars);
    }
    const compiled = (template.body_template || "").replace(
      /\{\{\s*([a-zA-Z0-9_]+)\s*\}\}/g,
      (_, key) => mergedVars[key] || `[${key}]`
    );
    return { subject: "", html: compiled };
  }, [template, mergedVars, isEmail]);

  if (isEmail) {
    return (
      <div
        className={`w-full rounded-2xl overflow-hidden border border-border/80 bg-white text-slate-900 flex flex-col shadow-sm ${
          isMini ? "h-[220px]" : "h-full min-h-[520px]"
        }`}
      >
        {/* Email Header Bar */}
        <div className="bg-[#043569] text-white px-3 py-2 flex items-center justify-between text-xs shrink-0 select-none">
          <div className="flex items-center gap-2 truncate">
            <div className="h-2.5 w-2.5 rounded-full bg-rose-400" />
            <div className="h-2.5 w-2.5 rounded-full bg-amber-400" />
            <div className="h-2.5 w-2.5 rounded-full bg-emerald-400" />
            <span className="font-bold text-[11px] text-white ml-1 truncate">
              {rendered.subject || "Atena School — Conferma Iscrizione"}
            </span>
          </div>

          <div className="flex items-center gap-1.5 text-[10px] text-sky-200 bg-white/10 px-2 py-0.5 rounded-full font-mono shrink-0">
            <Mail className="h-3 w-3 text-[#F8861D]" />
            <span>Resend HTML</span>
          </div>
        </div>

        {/* Sender Metadata Bar */}
        <div className="bg-slate-50 border-b border-slate-200 px-3 py-1.5 text-[11px] flex items-center justify-between text-slate-600 shrink-0">
          <div className="truncate">
            <span className="font-bold text-slate-800">Da:</span> Atena School &lt;info@atenaschool.com&gt;
          </div>
          <div className="text-[10px] text-slate-500 font-mono">HTML 5 • Formattato</div>
        </div>

        {/* Isolated Iframe for Authentic Gmail/Apple Mail Rendering */}
        <div className="flex-1 w-full h-full bg-[#f8fafc] overflow-hidden relative">
          <iframe
            srcDoc={rendered.html}
            title={template.name}
            className="w-full h-full border-0 absolute inset-0"
            sandbox="allow-same-origin"
          />
        </div>
      </div>
    );
  }

  // Telegram Preview Frame
  return (
    <div
      className={`w-full rounded-2xl overflow-hidden border border-[#2b394a] bg-gradient-to-b from-[#17212b] to-[#0e1621] text-slate-100 flex flex-col shadow-md ${
        isMini ? "h-[220px]" : "h-full min-h-[520px]"
      }`}
    >
      {/* Telegram Chat Header */}
      <div className="bg-[#242f3d] px-3.5 py-2.5 flex items-center justify-between border-b border-[#1f2936] text-xs shrink-0 select-none">
        <div className="flex items-center gap-2.5">
          <div className="h-7 w-7 rounded-full bg-gradient-to-br from-sky-400 to-blue-600 flex items-center justify-center font-bold text-xs text-white shadow-sm">
            AS
          </div>
          <div>
            <div className="font-bold text-xs flex items-center gap-1 text-white">
              Atena School Bot
              <span className="text-[9px] bg-sky-500/20 text-sky-400 px-1 py-0.2 rounded font-mono">bot</span>
            </div>
            <div className="text-[10px] text-slate-400">Canale Segreteria Atena</div>
          </div>
        </div>

        <div className="flex items-center gap-1 text-xs text-sky-400 font-semibold">
          <MessageSquare className="h-4 w-4" />
          <span>Telegram</span>
        </div>
      </div>

      {/* Telegram Chat Area */}
      <div className="p-4 overflow-y-auto flex-1 flex flex-col justify-end space-y-2">
        <div className="self-start max-w-[95%] bg-[#182533] border border-[#2b394a]/80 rounded-2xl rounded-tl-xs p-4 shadow-lg">
          <div
            className="text-xs leading-relaxed text-slate-100 whitespace-pre-wrap font-sans space-y-1"
            dangerouslySetInnerHTML={{ __html: rendered.html }}
          />

          <div className="flex items-center justify-end gap-1 mt-2 text-[10px] text-slate-400">
            <span>Oggi 18:30</span>
            <CheckCheck className="h-3.5 w-3.5 text-sky-400" />
          </div>
        </div>
      </div>
    </div>
  );
}
