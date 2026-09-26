"use client";

import React, { useState, useEffect } from "react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Checkbox } from "@/components/ui/checkbox";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  FileText,
  Sparkles,
  CheckCircle2,
  RefreshCw,
  UserCheck,
  Briefcase,
  BookOpen,
  Receipt,
  Users,
  ShieldCheck,
} from "lucide-react";
import {
  DocumentCategoryType,
  type DocumentTemplateType,
} from "../types";
import { useDocumentTemplates } from "../hooks/use-document-templates";
import { useDocuments } from "../hooks/use-documents";
import { useBookings } from "@/features/bookings/hooks/use-bookings";
import { DocumentLivePreview } from "./builder/document-live-preview";
import { apiFetch } from "@/lib/api";
import { useTranslation } from "@/i18n/context";
import { toast } from "sonner";

interface GenerateDocumentDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  defaultBookingId?: string;
  defaultStudentId?: string;
  defaultTemplateType?: DocumentTemplateType;
}

export function GenerateDocumentDialog({
  open,
  onOpenChange,
  defaultBookingId,
  defaultStudentId,
  defaultTemplateType,
}: GenerateDocumentDialogProps) {
  const { t, locale } = useTranslation();
  const tr = (key: string, fallback: string) => {
    const val = t(key);
    return val && val !== key ? val : fallback;
  };

  const { templates } = useDocumentTemplates();
  const { generateDocument, isGenerating } = useDocuments();
  const { bookings } = useBookings();

  const [selectedTemplateId, setSelectedTemplateId] = useState<number | null>(null);
  const [selectedBookingId, setSelectedBookingId] = useState<string>(defaultBookingId || "");
  const [bookingIdInput, setBookingIdInput] = useState<string>(defaultBookingId || "");
  const [studentIdInput, setStudentIdInput] = useState<string>(defaultStudentId || "");
  const [isAutofilling, setIsAutofilling] = useState(false);

  // Live Reactive Form Data (pure database-first structure)
  const [formData, setFormData] = useState<Record<string, any>>({
    title: "",
    student: {
      full_name: "",
      tax_code: "",
      email: "",
      phone: "",
      birth_date: "",
      birth_place: "",
      address: "",
      school_grade: "",
    },
    parent: {
      full_name: "",
      tax_code: "",
      email: "",
      phone: "",
    },
    teacher: {
      full_name: "",
      tax_code: "",
      email: "",
      phone: "",
      hourly_rate: 25,
    },
    course: {
      title: "",
      level: "",
      schedule_text: "",
      start_date: "",
      total_lessons: 0,
      classroom: "",
    },
    payment: {
      amount_total: 0,
      amount_course: 0,
      registration_fee: 0,
      payment_method_label: "",
      is_paid: false,
    },
    delegates: {
      delegate_1_name: "",
      delegate_1_relation: "",
      delegate_1_phone: "",
      self_exit_authorized: false,
    },
  });

  // Select initial template
  useEffect(() => {
    if (templates.length > 0 && !selectedTemplateId) {
      if (defaultTemplateType) {
        const found = templates.find((t) => t.template_type === defaultTemplateType);
        setSelectedTemplateId(found ? found.id : templates[0].id);
      } else {
        setSelectedTemplateId(templates[0].id);
      }
    }
  }, [templates, defaultTemplateType, selectedTemplateId]);

  // Autofill function from DB
  const executeAutofill = async (bId?: string, sId?: string) => {
    const b = bId || bookingIdInput;
    const s = sId || studentIdInput;
    if (!b && !s) {
      toast.info(tr("documents.generator.selectBookingLabel", "Inserisci o seleziona una prenotazione dal database"));
      return;
    }

    setIsAutofilling(true);
    try {
      const q = new URLSearchParams();
      if (b) q.set("bookingId", b);
      if (s) q.set("studentId", s);

      const data = await apiFetch<Record<string, any>>(`/admin/documents/autofill?${q.toString()}`);
      if (data) {
        setFormData((prev) => ({
          ...prev,
          ...data,
          student: { ...prev.student, ...(data.student || {}) },
          parent: { ...prev.parent, ...(data.parent || {}) },
          teacher: { ...prev.teacher, ...(data.teacher || {}) },
          course: { ...prev.course, ...(data.course || {}) },
          payment: { ...prev.payment, ...(data.payment || {}) },
          delegates: { ...prev.delegates, ...(data.delegates || {}) },
        }));
        toast.success(tr("documents.generator.autofillSuccess", "Dati caricati istantaneamente dal database!"));
      }
    } catch (err: any) {
      toast.error(`${tr("documents.generator.autofillError", "Errore nel caricamento dati da DB")}: ${err?.message || ""}`);
    } finally {
      setIsAutofilling(false);
    }
  };

  // When picking a booking from the dropdown
  const handleSelectBooking = async (bId: string) => {
    setSelectedBookingId(bId);
    setBookingIdInput(bId);
    if (bId && bId !== "manual") {
      await executeAutofill(bId, undefined);
    }
  };

  const selectedTemplate = templates.find((t) => t.id === selectedTemplateId) || templates[0];
  const isTeacherDoc = selectedTemplate?.category_type === DocumentCategoryType.TEACHER_CONTRACTS;

  const handleGenerate = async () => {
    if (!selectedTemplate) return;

    try {
      await generateDocument({
        template_id: selectedTemplate.id,
        template_type: selectedTemplate.template_type,
        document_type: selectedTemplate.document_type,
        category_type: selectedTemplate.category_type,
        booking_id: bookingIdInput || undefined,
        student_id: studentIdInput || undefined,
        title: formData.title || selectedTemplate.name,
        recipient_name: isTeacherDoc
          ? formData.teacher?.full_name
          : formData.student?.full_name || formData.parent?.full_name,
        recipient_email: isTeacherDoc
          ? formData.teacher?.email
          : formData.student?.email || formData.parent?.email,
        recipient_tax_code: isTeacherDoc
          ? formData.teacher?.tax_code
          : formData.student?.tax_code || formData.parent?.tax_code,
        custom_data: formData,
        blocks_config: selectedTemplate.blocks_config,
      });

      onOpenChange(false);
    } catch (err) {
      // Handled by hook toast
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="w-[96vw] max-w-[1500px] sm:max-w-[96vw] h-[92vh] max-h-[95vh] p-0 flex flex-col gap-0 overflow-hidden bg-background">
        {/* Header */}
        <DialogHeader className="px-6 py-3.5 border-b flex-row items-center justify-between space-y-0 bg-card shrink-0">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-primary/10 text-primary rounded-lg">
              <FileText className="h-5 w-5" />
            </div>
            <div>
              <DialogTitle className="text-base font-bold text-foreground">
                {tr("documents.generator.dialogTitle", "Genera Documento Ufficiale")}
              </DialogTitle>
              <p className="text-xs text-muted-foreground">
                {tr("documents.generator.dialogSubtitle", "Compilazione automatica da database Postgres con anteprima live e snapshot immutabile")}
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2 pr-6">
            <Button
              onClick={handleGenerate}
              disabled={isGenerating || !selectedTemplate}
              className="bg-primary hover:bg-primary/90 text-primary-foreground font-semibold shadow-xs h-8 text-xs cursor-pointer"
            >
              <CheckCircle2 className="h-4 w-4 mr-1.5" />
              {isGenerating
                ? tr("documents.generator.generating", "Generazione in corso...")
                : tr("documents.generator.generateButton", "Salva & Emetti Documento")}
            </Button>
          </div>
        </DialogHeader>

        {/* Modal Body: Split 2 Columns */}
        <div className="grid grid-cols-12 flex-1 overflow-hidden">
          {/* Left Form Panel (5 cols) */}
          <div className="col-span-5 border-r bg-muted/20 flex flex-col h-full overflow-y-auto p-5 space-y-5 custom-scrollbar">
            {/* 1. Template Selector */}
            <div className="p-4 bg-card rounded-xl border border-border/70 shadow-xs space-y-3">
              <Label className="text-xs font-bold uppercase tracking-wider text-muted-foreground flex items-center gap-1.5">
                <Sparkles className="h-3.5 w-3.5 text-primary" />
                {tr("documents.generator.step1", "1. Seleziona Modello Documento")}
              </Label>
              <Select
                value={String(selectedTemplateId || "")}
                onValueChange={(val) => setSelectedTemplateId(Number(val))}
              >
                <SelectTrigger className="w-full h-9 text-xs bg-background">
                  <SelectValue placeholder={locale === "en" ? "Choose template..." : "Scegli modello..."} />
                </SelectTrigger>
                <SelectContent>
                  {templates.map((t) => (
                    <SelectItem key={t.id} value={String(t.id)} className="text-xs">
                      {t.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            {/* 2. DB Autofill Source */}
            <div className="p-4 bg-card rounded-xl border border-border/70 shadow-xs space-y-3">
              <Label className="text-xs font-bold uppercase tracking-wider text-muted-foreground flex items-center gap-1.5">
                <RefreshCw className="h-3.5 w-3.5 text-primary" />
                {tr("documents.generator.step2", "2. Carica Dati da Database")}
              </Label>

              <div className="space-y-2">
                <span className="text-[11px] text-muted-foreground font-medium block">
                  {tr("documents.generator.selectBookingLabel", "Seleziona Prenotazione Esistente da DB:")}
                </span>
                <Select value={selectedBookingId} onValueChange={handleSelectBooking}>
                  <SelectTrigger className="w-full h-9 text-xs bg-background font-medium">
                    <SelectValue placeholder={locale === "en" ? "Choose client / booking..." : "Scegli cliente/prenotazione..."} />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="manual" className="text-xs italic text-muted-foreground">
                      {tr("documents.generator.manualOption", "-- Inserimento Manuale Libero --")}
                    </SelectItem>
                    {bookings.slice(0, 30).map((b) => (
                      <SelectItem key={b.id} value={b.id} className="text-xs">
                        {b.student_name || b.purchaser_name || (locale === "en" ? "Client" : "Cliente")} ({b.purchaser_email || b.id.slice(0, 8)})
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <div className="grid grid-cols-2 gap-2 pt-1">
                <div>
                  <span className="text-[10px] text-muted-foreground font-mono">
                    {tr("documents.generator.bookingIdLabel", "ID Prenotazione:")}
                  </span>
                  <Input
                    value={bookingIdInput}
                    onChange={(e) => setBookingIdInput(e.target.value)}
                    placeholder="UUID"
                    className="h-8 text-xs font-mono"
                  />
                </div>
                <div>
                  <span className="text-[10px] text-muted-foreground font-mono">
                    {tr("documents.generator.studentIdLabel", "ID Allievo:")}
                  </span>
                  <Input
                    value={studentIdInput}
                    onChange={(e) => setStudentIdInput(e.target.value)}
                    placeholder="UUID"
                    className="h-8 text-xs font-mono"
                  />
                </div>
              </div>

              <Button
                variant="outline"
                size="sm"
                onClick={() => executeAutofill()}
                disabled={isAutofilling}
                className="w-full text-xs font-semibold h-8 cursor-pointer border-border/70 hover:bg-muted"
              >
                {isAutofilling
                  ? tr("documents.generator.reloading", "Caricamento in corso...")
                  : tr("documents.generator.reloadDb", "⚡ Ricarica Dati da DB")}
              </Button>
            </div>

            {/* 3. Live Form Fields */}
            <div className="p-4 bg-card rounded-xl border border-border/70 shadow-xs space-y-4">
              <Label className="text-xs font-bold uppercase tracking-wider text-muted-foreground block">
                {tr("documents.generator.step3", "3. Campi del Documento (Modificabili in Tempo Reale)")}
              </Label>

              {/* A. Student Fields */}
              {!isTeacherDoc && (
                <div className="space-y-2">
                  <span className="text-[11px] font-bold text-foreground flex items-center gap-1.5">
                    <UserCheck className="h-3.5 w-3.5 text-primary" />
                    {tr("documents.generator.studentSection", "Dati Allievo / Intestatario:")}
                  </span>
                  <div className="grid grid-cols-2 gap-2">
                    <Input
                      placeholder={tr("documents.generator.studentName", "Nome e Cognome Allievo")}
                      value={formData.student?.full_name || ""}
                      onChange={(e) =>
                        setFormData({
                          ...formData,
                          student: { ...formData.student, full_name: e.target.value },
                        })
                      }
                      className="h-8 text-xs"
                    />
                    <Input
                      placeholder={tr("documents.generator.studentTaxCode", "Codice Fiscale Allievo")}
                      value={formData.student?.tax_code || ""}
                      onChange={(e) =>
                        setFormData({
                          ...formData,
                          student: { ...formData.student, tax_code: e.target.value },
                        })
                      }
                      className="h-8 text-xs font-mono"
                    />
                  </div>
                  <div className="grid grid-cols-2 gap-2">
                    <Input
                      placeholder={tr("documents.generator.studentEmail", "Email Allievo")}
                      value={formData.student?.email || ""}
                      onChange={(e) =>
                        setFormData({
                          ...formData,
                          student: { ...formData.student, email: e.target.value },
                        })
                      }
                      className="h-8 text-xs"
                    />
                    <Input
                      placeholder={tr("documents.generator.studentPhone", "Telefono Allievo")}
                      value={formData.student?.phone || ""}
                      onChange={(e) =>
                        setFormData({
                          ...formData,
                          student: { ...formData.student, phone: e.target.value },
                        })
                      }
                      className="h-8 text-xs"
                    />
                  </div>
                  <div className="grid grid-cols-2 gap-2">
                    <Input
                      placeholder={tr("documents.generator.studentBirthDate", "Data Nascita (12/04/2008)")}
                      value={formData.student?.birth_date || ""}
                      onChange={(e) =>
                        setFormData({
                          ...formData,
                          student: { ...formData.student, birth_date: e.target.value },
                        })
                      }
                      className="h-8 text-xs"
                    />
                    <Input
                      placeholder={tr("documents.generator.studentBirthPlace", "Luogo Nascita (Milano)")}
                      value={formData.student?.birth_place || ""}
                      onChange={(e) =>
                        setFormData({
                          ...formData,
                          student: { ...formData.student, birth_place: e.target.value },
                        })
                      }
                      className="h-8 text-xs"
                    />
                  </div>
                  <div className="grid grid-cols-2 gap-2">
                    <Input
                      placeholder={tr("documents.generator.studentAddress", "Indirizzo Residenza")}
                      value={formData.student?.address || ""}
                      onChange={(e) =>
                        setFormData({
                          ...formData,
                          student: { ...formData.student, address: e.target.value },
                        })
                      }
                      className="h-8 text-xs"
                    />
                    <Input
                      placeholder={tr("documents.generator.studentSchoolGrade", "Scuola e Classe")}
                      value={formData.student?.school_grade || ""}
                      onChange={(e) =>
                        setFormData({
                          ...formData,
                          student: { ...formData.student, school_grade: e.target.value },
                        })
                      }
                      className="h-8 text-xs"
                    />
                  </div>
                </div>
              )}

              {/* B. Parent Fields */}
              {!isTeacherDoc && (
                <div className="space-y-2 pt-2 border-t border-border/40">
                  <span className="text-[11px] font-bold text-foreground flex items-center gap-1.5">
                    <ShieldCheck className="h-3.5 w-3.5 text-amber-500" />
                    {tr("documents.generator.parentSection", "Dati Genitore / Tutore (se minore):")}
                  </span>
                  <div className="grid grid-cols-2 gap-2">
                    <Input
                      placeholder={tr("documents.generator.parentName", "Nome e Cognome Genitore")}
                      value={formData.parent?.full_name || ""}
                      onChange={(e) =>
                        setFormData({
                          ...formData,
                          parent: { ...formData.parent, full_name: e.target.value },
                        })
                      }
                      className="h-8 text-xs"
                    />
                    <Input
                      placeholder={tr("documents.generator.parentTaxCode", "Codice Fiscale Genitore")}
                      value={formData.parent?.tax_code || ""}
                      onChange={(e) =>
                        setFormData({
                          ...formData,
                          parent: { ...formData.parent, tax_code: e.target.value },
                        })
                      }
                      className="h-8 text-xs font-mono"
                    />
                  </div>
                  <div className="grid grid-cols-2 gap-2">
                    <Input
                      placeholder={tr("documents.generator.parentEmail", "Email Genitore")}
                      value={formData.parent?.email || ""}
                      onChange={(e) =>
                        setFormData({
                          ...formData,
                          parent: { ...formData.parent, email: e.target.value },
                        })
                      }
                      className="h-8 text-xs"
                    />
                    <Input
                      placeholder={tr("documents.generator.parentPhone", "Telefono Genitore")}
                      value={formData.parent?.phone || ""}
                      onChange={(e) =>
                        setFormData({
                          ...formData,
                          parent: { ...formData.parent, phone: e.target.value },
                        })
                      }
                      className="h-8 text-xs"
                    />
                  </div>
                </div>
              )}

              {/* C. Teacher Fields */}
              {isTeacherDoc && (
                <div className="space-y-2 pt-2 border-t border-border/40">
                  <span className="text-[11px] font-bold text-foreground flex items-center gap-1.5">
                    <Briefcase className="h-3.5 w-3.5 text-purple-500" />
                    {tr("documents.generator.teacherSection", "Dati Docente / Collaboratore:")}
                  </span>
                  <div className="grid grid-cols-2 gap-2">
                    <Input
                      placeholder={tr("documents.generator.teacherName", "Nome e Cognome Docente")}
                      value={formData.teacher?.full_name || ""}
                      onChange={(e) =>
                        setFormData({
                          ...formData,
                          teacher: { ...formData.teacher, full_name: e.target.value },
                        })
                      }
                      className="h-8 text-xs"
                    />
                    <Input
                      placeholder={tr("documents.generator.teacherTaxCode", "Codice Fiscale Docente")}
                      value={formData.teacher?.tax_code || ""}
                      onChange={(e) =>
                        setFormData({
                          ...formData,
                          teacher: { ...formData.teacher, tax_code: e.target.value },
                        })
                      }
                      className="h-8 text-xs font-mono"
                    />
                  </div>
                  <div className="grid grid-cols-3 gap-2">
                    <Input
                      placeholder={tr("documents.generator.teacherEmail", "Email Docente")}
                      value={formData.teacher?.email || ""}
                      onChange={(e) =>
                        setFormData({
                          ...formData,
                          teacher: { ...formData.teacher, email: e.target.value },
                        })
                      }
                      className="h-8 text-xs"
                    />
                    <Input
                      placeholder={tr("documents.generator.teacherPhone", "Telefono Docente")}
                      value={formData.teacher?.phone || ""}
                      onChange={(e) =>
                        setFormData({
                          ...formData,
                          teacher: { ...formData.teacher, phone: e.target.value },
                        })
                      }
                      className="h-8 text-xs"
                    />
                    <Input
                      type="number"
                      placeholder={tr("documents.generator.teacherHourlyRate", "Compenso €/h")}
                      value={formData.teacher?.hourly_rate || ""}
                      onChange={(e) =>
                        setFormData({
                          ...formData,
                          teacher: { ...formData.teacher, hourly_rate: Number(e.target.value) },
                        })
                      }
                      className="h-8 text-xs font-mono"
                    />
                  </div>
                </div>
              )}

              {/* D. Course & Didactics */}
              <div className="space-y-2 pt-2 border-t border-border/40">
                <span className="text-[11px] font-bold text-foreground flex items-center gap-1.5">
                  <BookOpen className="h-3.5 w-3.5 text-blue-500" />
                  {tr("documents.generator.courseSection", "Dati Corso e Didattica:")}
                </span>
                <div className="grid grid-cols-2 gap-2">
                  <Input
                    placeholder={tr("documents.generator.courseTitle", "Titolo del Corso")}
                    value={formData.course?.title || ""}
                    onChange={(e) =>
                      setFormData({
                        ...formData,
                        course: { ...formData.course, title: e.target.value },
                      })
                    }
                    className="h-8 text-xs"
                  />
                  <Input
                    placeholder={tr("documents.generator.courseLevel", "Livello (es. B1, Principiante)")}
                    value={formData.course?.level || ""}
                    onChange={(e) =>
                      setFormData({
                        ...formData,
                        course: { ...formData.course, level: e.target.value },
                      })
                    }
                    className="h-8 text-xs"
                  />
                </div>
                <div className="grid grid-cols-3 gap-2">
                  <Input
                    placeholder={tr("documents.generator.courseSchedule", "Orario (es. Lun-Mer 16:30)")}
                    value={formData.course?.schedule_text || ""}
                    onChange={(e) =>
                      setFormData({
                        ...formData,
                        course: { ...formData.course, schedule_text: e.target.value },
                      })
                    }
                    className="h-8 text-xs"
                  />
                  <Input
                    placeholder={tr("documents.generator.courseStartDate", "Data Inizio (06/10/2026)")}
                    value={formData.course?.start_date || ""}
                    onChange={(e) =>
                      setFormData({
                        ...formData,
                        course: { ...formData.course, start_date: e.target.value },
                      })
                    }
                    className="h-8 text-xs"
                  />
                  <Input
                    placeholder={tr("documents.generator.courseClassroom", "Aula / Sede")}
                    value={formData.course?.classroom || ""}
                    onChange={(e) =>
                      setFormData({
                        ...formData,
                        course: { ...formData.course, classroom: e.target.value },
                      })
                    }
                    className="h-8 text-xs"
                  />
                </div>
              </div>

              {/* E. Payment & Fees */}
              <div className="space-y-2 pt-2 border-t border-border/40">
                <span className="text-[11px] font-bold text-foreground flex items-center gap-1.5">
                  <Receipt className="h-3.5 w-3.5 text-emerald-500" />
                  {tr("documents.generator.paymentSection", "Riepilogo Economico & Pagamenti:")}
                </span>
                <div className="grid grid-cols-3 gap-2">
                  <Input
                    type="number"
                    placeholder={tr("documents.generator.totalAmount", "Totale € (IVA inc.)")}
                    value={formData.payment?.amount_total || ""}
                    onChange={(e) => {
                      const tot = Number(e.target.value);
                      const reg = formData.payment?.registration_fee || 0;
                      setFormData({
                        ...formData,
                        payment: {
                          ...formData.payment,
                          amount_total: tot,
                          amount_course: tot > reg ? tot - reg : tot,
                        },
                      });
                    }}
                    className="h-8 text-xs font-mono font-bold"
                  />
                  <Input
                    type="number"
                    placeholder={tr("documents.generator.courseAmount", "Quota Corso €")}
                    value={formData.payment?.amount_course || ""}
                    onChange={(e) =>
                      setFormData({
                        ...formData,
                        payment: { ...formData.payment, amount_course: Number(e.target.value) },
                      })
                    }
                    className="h-8 text-xs font-mono"
                  />
                  <Input
                    type="number"
                    placeholder={tr("documents.generator.regFeeAmount", "Quota Iscrizione €")}
                    value={formData.payment?.registration_fee || ""}
                    onChange={(e) =>
                      setFormData({
                        ...formData,
                        payment: { ...formData.payment, registration_fee: Number(e.target.value) },
                      })
                    }
                    className="h-8 text-xs font-mono"
                  />
                </div>
                <Input
                  placeholder={tr("documents.generator.paymentMethod", "Metodo Pagamento (Stripe, Bonifico, ecc.)")}
                  value={formData.payment?.payment_method_label || ""}
                  onChange={(e) =>
                    setFormData({
                      ...formData,
                      payment: { ...formData.payment, payment_method_label: e.target.value },
                    })
                  }
                  className="h-8 text-xs"
                />
              </div>

              {/* F. Minor Delegates & Self-Exit */}
              {!isTeacherDoc && (
                <div className="space-y-2 pt-2 border-t border-border/40">
                  <span className="text-[11px] font-bold text-foreground flex items-center gap-1.5">
                    <Users className="h-3.5 w-3.5 text-indigo-500" />
                    {tr("documents.generator.delegatesSection", "Allegato 2 — Deleghe Ritiro & Uscita Autonoma:")}
                  </span>
                  <div className="grid grid-cols-3 gap-2">
                    <Input
                      placeholder={tr("documents.generator.delegate1Name", "Delegato 1 - Nome")}
                      value={formData.delegates?.delegate_1_name || ""}
                      onChange={(e) =>
                        setFormData({
                          ...formData,
                          delegates: { ...formData.delegates, delegate_1_name: e.target.value },
                        })
                      }
                      className="h-8 text-xs"
                    />
                    <Input
                      placeholder={tr("documents.generator.delegate1Relation", "Grado parentela (es. Nonno)")}
                      value={formData.delegates?.delegate_1_relation || ""}
                      onChange={(e) =>
                        setFormData({
                          ...formData,
                          delegates: { ...formData.delegates, delegate_1_relation: e.target.value },
                        })
                      }
                      className="h-8 text-xs"
                    />
                    <Input
                      placeholder={tr("documents.generator.delegate1Phone", "Telefono Delegato")}
                      value={formData.delegates?.delegate_1_phone || ""}
                      onChange={(e) =>
                        setFormData({
                          ...formData,
                          delegates: { ...formData.delegates, delegate_1_phone: e.target.value },
                        })
                      }
                      className="h-8 text-xs"
                    />
                  </div>
                  <div className="flex items-center space-x-2 pt-1">
                    <Checkbox
                      id="self_exit"
                      checked={formData.delegates?.self_exit_authorized || false}
                      onCheckedChange={(checked) =>
                        setFormData({
                          ...formData,
                          delegates: { ...formData.delegates, self_exit_authorized: Boolean(checked) },
                        })
                      }
                    />
                    <label
                      htmlFor="self_exit"
                      className="text-xs font-medium leading-none cursor-pointer text-muted-foreground hover:text-foreground"
                    >
                      {tr("documents.generator.selfExitLabel", "Autorizzazione all'uscita autonoma (minori 11+ anni)")}
                    </label>
                  </div>
                </div>
              )}
            </div>
          </div>

          {/* Right Live Preview (7 cols) */}
          <div className="col-span-7 h-full p-5 bg-muted/10 overflow-hidden">
            {selectedTemplate && (
              <DocumentLivePreview
                blocksConfig={selectedTemplate.blocks_config}
                data={formData}
                documentTitle={selectedTemplate.name}
                documentNumber="DOC-ANTEPRIMA"
              />
            )}
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}
