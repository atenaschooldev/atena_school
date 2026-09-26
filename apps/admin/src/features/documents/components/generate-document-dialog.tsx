import React, { useState, useEffect } from 'react';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import {
  FileText,
  Printer,
  Sparkles,
  Download,
  CheckCircle2,
  RefreshCw,
} from 'lucide-react';
import {
  DocumentCategoryType,
  DocumentPaperFormat,
  DocumentTemplateType,
  DocumentType,
  type DocumentTemplateRecord,
  type GenerateDocumentDto,
} from '../types';
import { useDocumentTemplates } from '../hooks/use-document-templates';
import { useDocuments } from '../hooks/use-documents';
import { DocumentLivePreview } from './builder/document-live-preview';
import { apiFetch } from '@/lib/api';
import { toast } from 'sonner';

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
  const { templates } = useDocumentTemplates();
  const { generateDocument, isGenerating } = useDocuments();

  const [selectedTemplateId, setSelectedTemplateId] = useState<number | null>(null);
  const [bookingId, setBookingId] = useState<string>(defaultBookingId || '');
  const [studentId, setStudentId] = useState<string>(defaultStudentId || '');
  const [isAutofilling, setIsAutofilling] = useState(false);

  // Live Editable Form Data
  const [formData, setFormData] = useState<Record<string, any>>({
    title: 'Modulo di Iscrizione',
    student: {
      full_name: 'Mario Rossi',
      tax_code: 'RSSMRA08D12H501Z',
      email: 'mario.rossi@example.com',
      phone: '+39 340 1234567',
      school_grade: 'Liceo Scientifico 3B',
      address: 'Via Roma 10, Milano',
    },
    parent: {
      full_name: 'Luigi Rossi',
      tax_code: 'RSSLGU75C10H501K',
      phone: '+39 349 9876543',
    },
    course: {
      title: 'Inglese B1 Ragazzi',
      level: 'B1',
      schedule_text: 'Martedì e Giovedì 16:30 - 18:00',
      start_date: '06/10/2026',
    },
    payment: {
      amount_total: 160,
      amount_course: 130,
      registration_fee: 30,
      payment_method_label: 'Stripe / Carta di Credito',
      is_paid: true,
    },
    delegates: {
      delegate_1_name: 'Luigi Rossi (Padre)',
      delegate_1_relation: 'Padre',
      delegate_1_phone: '+39 349 9876543',
      self_exit_authorized: true,
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

  // Autofill from DB if bookingId / studentId provided
  const handleAutofill = async () => {
    if (!bookingId && !studentId) {
      toast.info('Inserisci un ID di prenotazione o allievo per caricare i dati da DB');
      return;
    }

    setIsAutofilling(true);
    try {
      const q = new URLSearchParams();
      if (bookingId) q.set('bookingId', bookingId);
      if (studentId) q.set('studentId', studentId);

      const data = await apiFetch<Record<string, any>>(`/admin/documents/autofill?${q.toString()}`);
      if (data) {
        setFormData(data);
        toast.success('Dati caricati con successo dal database!');
      }
    } catch (err: any) {
      toast.error(`Errore nel caricamento dati: ${err?.message || 'Verifica gli ID'}`);
    } finally {
      setIsAutofilling(false);
    }
  };

  const selectedTemplate = templates.find((t) => t.id === selectedTemplateId) || templates[0];

  const handleGenerate = async () => {
    if (!selectedTemplate) return;

    try {
      const result = await generateDocument({
        template_id: selectedTemplate.id,
        template_type: selectedTemplate.template_type,
        document_type: selectedTemplate.document_type,
        category_type: selectedTemplate.category_type,
        booking_id: bookingId || undefined,
        student_id: studentId || undefined,
        title: formData.title || selectedTemplate.name,
        recipient_name: formData.student?.full_name || formData.parent?.full_name,
        recipient_email: formData.student?.email || formData.parent?.email,
        recipient_tax_code: formData.student?.tax_code || formData.parent?.tax_code,
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
      <DialogContent className="max-w-[95vw] w-[1400px] h-[90vh] p-0 flex flex-col gap-0 overflow-hidden bg-background">
        {/* Header */}
        <DialogHeader className="px-6 py-3.5 border-b flex-row items-center justify-between space-y-0 bg-card">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-blue-500/10 text-blue-600 rounded-lg">
              <FileText className="h-5 w-5" />
            </div>
            <div>
              <DialogTitle className="text-base font-bold text-foreground">
                Genera Documento Ufficiale
              </DialogTitle>
              <p className="text-xs text-muted-foreground">
                Compilazione automatica da database con anteprima in tempo reale e salvataggio
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <Button
              onClick={handleGenerate}
              disabled={isGenerating || !selectedTemplate}
              className="bg-blue-600 hover:bg-blue-500 text-white font-semibold shadow-md h-8 text-xs"
            >
              <CheckCircle2 className="h-4 w-4 mr-1.5" />
              {isGenerating ? 'Generazione in corso...' : 'Salva & Emetti Documento'}
            </Button>
          </div>
        </DialogHeader>

        {/* Modal Body: Split 2 Columns */}
        <div className="grid grid-cols-12 flex-1 overflow-hidden">
          {/* Left Form Panel (5 cols) */}
          <div className="col-span-5 border-r bg-muted/20 flex flex-col h-full overflow-y-auto p-5 space-y-5 custom-scrollbar">
            {/* 1. Template Selector */}
            <div className="p-4 bg-card rounded-xl border space-y-3">
              <label className="text-xs font-bold uppercase tracking-wider text-muted-foreground flex items-center gap-1.5">
                <Sparkles className="h-3.5 w-3.5 text-blue-500" />
                1. Seleziona Modello Documento
              </label>
              <select
                value={selectedTemplateId || ''}
                onChange={(e) => setSelectedTemplateId(Number(e.target.value))}
                className="w-full h-9 text-xs rounded-md border border-input bg-background px-3 font-semibold"
              >
                {templates.map((t) => (
                  <option key={t.id} value={t.id}>
                    {t.name}
                  </option>
                ))}
              </select>
            </div>

            {/* 2. DB Autofill Source */}
            <div className="p-4 bg-card rounded-xl border space-y-3">
              <label className="text-xs font-bold uppercase tracking-wider text-muted-foreground flex items-center gap-1.5">
                <RefreshCw className="h-3.5 w-3.5 text-blue-500" />
                2. Carica Dati da Database
              </label>
              <div className="grid grid-cols-2 gap-2">
                <div>
                  <span className="text-[11px] text-muted-foreground">ID Prenotazione (UUID):</span>
                  <Input
                    value={bookingId}
                    onChange={(e) => setBookingId(e.target.value)}
                    placeholder="es. 83a04c10-..."
                    className="h-8 text-xs font-mono"
                  />
                </div>
                <div>
                  <span className="text-[11px] text-muted-foreground">ID Allievo (UUID):</span>
                  <Input
                    value={studentId}
                    onChange={(e) => setStudentId(e.target.value)}
                    placeholder="es. a1b2c3d4-..."
                    className="h-8 text-xs font-mono"
                  />
                </div>
              </div>
              <Button
                variant="outline"
                size="sm"
                onClick={handleAutofill}
                disabled={isAutofilling}
                className="w-full text-xs font-semibold h-8"
              >
                {isAutofilling ? 'Caricamento in corso...' : '⚡ Compila Automaticamente da DB'}
              </Button>
            </div>

            {/* 3. Live Form Fields (Realtime reactive) */}
            <div className="p-4 bg-card rounded-xl border space-y-4">
              <label className="text-xs font-bold uppercase tracking-wider text-muted-foreground block">
                3. Campi Personalizzati (Live WYSIWYG)
              </label>

              {/* Student Fields */}
              <div className="space-y-2">
                <span className="text-[11px] font-bold text-foreground">Dati Allievo:</span>
                <div className="grid grid-cols-2 gap-2">
                  <Input
                    placeholder="Nome e Cognome"
                    value={formData.student?.full_name || ''}
                    onChange={(e) =>
                      setFormData({
                        ...formData,
                        student: { ...formData.student, full_name: e.target.value },
                      })
                    }
                    className="h-8 text-xs"
                  />
                  <Input
                    placeholder="Codice Fiscale"
                    value={formData.student?.tax_code || ''}
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
                    placeholder="Scuola e Classe (es. Liceo 3B)"
                    value={formData.student?.school_grade || ''}
                    onChange={(e) =>
                      setFormData({
                        ...formData,
                        student: { ...formData.student, school_grade: e.target.value },
                      })
                    }
                    className="h-8 text-xs"
                  />
                  <Input
                    placeholder="Email"
                    value={formData.student?.email || ''}
                    onChange={(e) =>
                      setFormData({
                        ...formData,
                        student: { ...formData.student, email: e.target.value },
                      })
                    }
                    className="h-8 text-xs"
                  />
                </div>
              </div>

              {/* Parent Fields */}
              <div className="space-y-2 pt-2 border-t">
                <span className="text-[11px] font-bold text-foreground">Dati Genitore (se minore):</span>
                <div className="grid grid-cols-2 gap-2">
                  <Input
                    placeholder="Nome Genitore"
                    value={formData.parent?.full_name || ''}
                    onChange={(e) =>
                      setFormData({
                        ...formData,
                        parent: { ...formData.parent, full_name: e.target.value },
                      })
                    }
                    className="h-8 text-xs"
                  />
                  <Input
                    placeholder="Telefono Genitore"
                    value={formData.parent?.phone || ''}
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

              {/* Course & Payment */}
              <div className="space-y-2 pt-2 border-t">
                <span className="text-[11px] font-bold text-foreground">Dati Corso e Importo:</span>
                <Input
                  placeholder="Titolo del Corso"
                  value={formData.course?.title || ''}
                  onChange={(e) =>
                    setFormData({
                      ...formData,
                      course: { ...formData.course, title: e.target.value },
                    })
                  }
                  className="h-8 text-xs"
                />
                <div className="grid grid-cols-2 gap-2">
                  <Input
                    placeholder="Orario (es. Lun-Mer 16:30)"
                    value={formData.course?.schedule_text || ''}
                    onChange={(e) =>
                      setFormData({
                        ...formData,
                        course: { ...formData.course, schedule_text: e.target.value },
                      })
                    }
                    className="h-8 text-xs"
                  />
                  <Input
                    type="number"
                    placeholder="Totale € (IVA inc.)"
                    value={formData.payment?.amount_total || ''}
                    onChange={(e) =>
                      setFormData({
                        ...formData,
                        payment: { ...formData.payment, amount_total: Number(e.target.value) },
                      })
                    }
                    className="h-8 text-xs font-mono"
                  />
                </div>
              </div>
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
