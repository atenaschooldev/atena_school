"use client";

import React, { useMemo } from "react";
import { NotificationChannel, NotificationTemplateRecord } from "../types";
import { Mail, MessageSquare, CheckCheck, Sparkles, ExternalLink } from "lucide-react";

export const SAMPLE_PREVIEW_DATA: Record<string, string> = {
  student_name: "Mario Rossi",
  course_name: "Corso di Inglese Individuale B2",
  amount_paid: "€180.00",
  registration_fee: "€30.00",
  total_amount: "€210.00",
  lesson_schedule: "Lunedì e Mercoledì 18:00 - 19:30",
  start_date: "01/10/2026",
  app_url: "https://app.atenaschool.com",
  booking_id: "BK-2026-098",
  sender_name: "Giulia Bianchi",
  sender_email: "giulia.bianchi@example.com",
  sender_phone: "+39 333 1234567",
  topic: "Informazioni Corsi & Certificazioni",
  message: "Buongiorno, vorrei richiedere maggiori dettagli sulle certificazioni Cambridge e orari.",
  payment_method: "Carta di Credito (Stripe)",
  payment_status: "Pagato Online con Carta",
  purchaser_name: "Mario Rossi",
  purchaser_email: "mario.rossi@example.com",
  purchaser_phone: "+39 333 9876543",
};

export function compilePreviewText(
  templateText: string = "",
  variables: Record<string, string> = SAMPLE_PREVIEW_DATA
): string {
  if (!templateText) return "";
  return templateText.replace(/\{\{\s*([a-zA-Z0-9_]+)\s*\}\}/g, (_, key) => {
    return variables[key] !== undefined ? variables[key] : `[${key}]`;
  });
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

  const compiledSubject = useMemo(
    () => compilePreviewText(template.subject_template || "", mergedVars),
    [template.subject_template, mergedVars]
  );

  const compiledBody = useMemo(
    () => compilePreviewText(template.body_template || "", mergedVars),
    [template.body_template, mergedVars]
  );

  if (isEmail) {
    return (
      <div
        className={`w-full rounded-xl overflow-hidden border border-border/60 bg-slate-50 dark:bg-slate-950 flex flex-col shadow-inner ${
          isMini ? "h-[190px]" : "min-h-[360px]"
        }`}
      >
        {/* Email Header Bar */}
        <div className="bg-slate-900 text-slate-100 px-3 py-2 flex items-center justify-between border-b border-slate-800 text-xs shrink-0 select-none">
          <div className="flex items-center gap-2 truncate">
            <div className="h-2.5 w-2.5 rounded-full bg-rose-500/80 shrink-0" />
            <div className="h-2.5 w-2.5 rounded-full bg-amber-500/80 shrink-0" />
            <div className="h-2.5 w-2.5 rounded-full bg-emerald-500/80 shrink-0" />
            <span className="font-semibold text-[11px] text-slate-300 ml-1 truncate">
              {compiledSubject || "Atena School — Notifica"}
            </span>
          </div>

          <div className="flex items-center gap-1.5 text-[10px] text-slate-400 bg-slate-800/80 px-2 py-0.5 rounded-full shrink-0">
            <Mail className="h-3 w-3 text-emerald-400" />
            <span>Resend</span>
          </div>
        </div>

        {/* Email Subject / Metadata bar */}
        <div className="bg-white dark:bg-slate-900 px-3 py-1.5 border-b border-border/40 text-[11px] flex items-center justify-between text-muted-foreground shrink-0">
          <div className="truncate flex items-center gap-1">
            <span className="font-semibold text-foreground">Da:</span> Atena School &lt;info@atenaschool.com&gt;
          </div>
          <div className="text-[10px] opacity-75">Oggi, 18:30</div>
        </div>

        {/* Email Body Content */}
        <div className={`p-3.5 overflow-y-auto flex-1 bg-white dark:bg-slate-950 ${isMini ? "text-xs scale-[0.92] origin-top" : "text-sm"}`}>
          <div
            className="prose dark:prose-invert max-w-none text-xs leading-relaxed"
            dangerouslySetInnerHTML={{ __html: compiledBody }}
          />
        </div>
      </div>
    );
  }

  // Telegram Preview Frame
  return (
    <div
      className={`w-full rounded-xl overflow-hidden border border-border/60 bg-gradient-to-b from-[#17212b] to-[#0e1621] text-slate-100 flex flex-col shadow-inner ${
        isMini ? "h-[190px]" : "min-h-[360px]"
      }`}
    >
      {/* Telegram Chat Header */}
      <div className="bg-[#242f3d] px-3 py-2 flex items-center justify-between border-b border-[#1f2936] text-xs shrink-0 select-none">
        <div className="flex items-center gap-2">
          <div className="h-6 w-6 rounded-full bg-gradient-to-br from-sky-400 to-blue-600 flex items-center justify-center font-bold text-[10px] text-white shadow-sm">
            AS
          </div>
          <div>
            <div className="font-bold text-[11px] flex items-center gap-1 text-white">
              Atena School Bot
              <span className="text-[9px] bg-sky-500/20 text-sky-400 px-1 py-0.2 rounded font-mono">bot</span>
            </div>
            <div className="text-[9px] text-slate-400">Canale Segreteria Atena</div>
          </div>
        </div>

        <div className="flex items-center gap-1 text-[10px] text-sky-400">
          <MessageSquare className="h-3.5 w-3.5" />
          <span>Telegram</span>
        </div>
      </div>

      {/* Telegram Message Bubble */}
      <div className="p-3 overflow-y-auto flex-1 flex flex-col justify-end space-y-2">
        <div className="self-start max-w-[95%] bg-[#182533] border border-[#2b394a]/60 rounded-2xl rounded-tl-sm p-3 shadow-md">
          <div
            className="text-xs leading-relaxed text-slate-100 whitespace-pre-wrap font-sans"
            dangerouslySetInnerHTML={{ __html: compiledBody }}
          />

          <div className="flex items-center justify-end gap-1 mt-1 text-[9px] text-slate-400">
            <span>18:30</span>
            <CheckCheck className="h-3 w-3 text-sky-400" />
          </div>
        </div>
      </div>
    </div>
  );
}
