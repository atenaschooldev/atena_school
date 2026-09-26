"use client";

import React, { useState } from "react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  DocumentCategoryType,
  DocumentPaperFormat,
  DocumentRecipientType,
  DocumentTemplateType,
  DocumentType,
  DOCUMENT_CATEGORY_DICTIONARY,
  DOCUMENT_FORMAT_DICTIONARY,
  DOCUMENT_RECIPIENT_DICTIONARY,
  DOCUMENT_TYPE_DICTIONARY,
  type CreateDocumentTemplateDto,
} from "../types";
import { Sparkles, Layers } from "lucide-react";
import { useTranslation } from "@/i18n/context";

interface CreateTemplateDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onSubmit: (dto: CreateDocumentTemplateDto) => Promise<any>;
  isLoading?: boolean;
}

export function CreateTemplateDialog({
  open,
  onOpenChange,
  onSubmit,
  isLoading = false,
}: CreateTemplateDialogProps) {
  const { t, locale } = useTranslation();
  const tr = (key: string, fallback: string) => t(key) || fallback;

  const [name, setName] = useState("");
  const [description, setDescription] = useState("");
  const [categoryType, setCategoryType] = useState<DocumentCategoryType>(DocumentCategoryType.STUDENT_CONTRACTS);
  const [documentType, setDocumentType] = useState<DocumentType>(DocumentType.CUSTOM_DOCUMENT);
  const [recipientType, setRecipientType] = useState<DocumentRecipientType>(DocumentRecipientType.STUDENT);
  const [paperFormat, setPaperFormat] = useState<DocumentPaperFormat>(DocumentPaperFormat.A4_PORTRAIT);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim()) return;

    await onSubmit({
      category_type: categoryType,
      document_type: documentType,
      recipient_type: recipientType,
      paper_format: paperFormat,
      name: name.trim(),
      description: description.trim() || undefined,
      blocks_config: {
        paper_format: paperFormat,
        blocks: [
          {
            id: 'b_header',
            type: 'doc_header',
            title: locale === 'en' ? 'Document Header' : 'Intestazione Documento',
            is_enabled: true,
            order: 1,
            props: {
              title: name.trim(),
              show_logo: true,
            },
          },
          {
            id: 'b_parties',
            type: 'parties_block',
            title: locale === 'en' ? 'Personal Information' : 'Dati Anagrafici',
            is_enabled: true,
            order: 2,
            props: {},
          },
          {
            id: 'b_custom',
            type: 'custom_text',
            title: locale === 'en' ? 'Document Body Text' : 'Testo Documento',
            is_enabled: true,
            order: 3,
            props: {
              content_html: `<p>${locale === 'en' ? 'This document certifies the enrollment and terms for student {{student.full_name}}.' : "Il presente documento certifica l'iscrizione / accordo per l'allievo {{student.full_name}}."}</p>`,
            },
          },
          {
            id: 'b_signatures',
            type: 'signatures',
            title: locale === 'en' ? 'Signatures Section' : 'Sezione Firme',
            is_enabled: true,
            order: 4,
            props: {
              signature_parties: ['amministrazione', 'allievo'],
            },
          },
        ],
      },
      is_active: true,
    });

    setName("");
    setDescription("");
    onOpenChange(false);
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-md p-0 overflow-hidden bg-background">
        <DialogHeader className="p-5 border-b bg-muted/40">
          <DialogTitle className="text-base font-bold flex items-center gap-2">
            <Layers className="h-5 w-5 text-primary" />
            {tr("documents.createTemplate.title", "Crea Nuovo Modello Documento")}
          </DialogTitle>
          <DialogDescription className="text-xs">
            {tr("documents.createTemplate.description", "Definisci la categoria, il tipo e il formato per il nuovo template. Potrai poi comporre i blocchi nel Visual Builder.")}
          </DialogDescription>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="p-5 space-y-4 text-xs">
          <div className="space-y-1.5">
            <Label className="text-xs font-semibold">
              {tr("documents.createTemplate.nameLabel", "Nome del Modello *")}
            </Label>
            <Input
              placeholder={tr("documents.createTemplate.namePlaceholder", "es. Contratto Stage Estivo 2026")}
              value={name}
              onChange={(e) => setName(e.target.value)}
              required
              className="text-xs h-9"
            />
          </div>

          <div className="space-y-1.5">
            <Label className="text-xs font-semibold">
              {tr("documents.createTemplate.descLabel", "Descrizione")}
            </Label>
            <Textarea
              placeholder={tr("documents.createTemplate.descPlaceholder", "Breve descrizione dell'utilizzo di questo modello...")}
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              rows={2}
              className="text-xs resize-none"
            />
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div className="space-y-1.5">
              <Label className="text-xs font-semibold">
                {tr("documents.createTemplate.categoryLabel", "Categoria Documentale")}
              </Label>
              <Select
                value={String(categoryType)}
                onValueChange={(val) => setCategoryType(Number(val) as DocumentCategoryType)}
              >
                <SelectTrigger className="h-9 text-xs">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {Object.entries(DOCUMENT_CATEGORY_DICTIONARY).map(([id, dict]) => (
                    <SelectItem key={id} value={id} className="text-xs">
                      {locale === "en" ? dict.label_en : dict.label_it}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-1.5">
              <Label className="text-xs font-semibold">
                {tr("documents.createTemplate.typeLabel", "Tipo Documento")}
              </Label>
              <Select
                value={String(documentType)}
                onValueChange={(val) => setDocumentType(Number(val) as DocumentType)}
              >
                <SelectTrigger className="h-9 text-xs">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {Object.entries(DOCUMENT_TYPE_DICTIONARY).map(([id, dict]) => (
                    <SelectItem key={id} value={id} className="text-xs">
                      {locale === "en" ? dict.label_en : dict.label_it}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div className="space-y-1.5">
              <Label className="text-xs font-semibold">
                {tr("documents.createTemplate.recipientLabel", "Destinatario Primario")}
              </Label>
              <Select
                value={String(recipientType)}
                onValueChange={(val) => setRecipientType(Number(val) as DocumentRecipientType)}
              >
                <SelectTrigger className="h-9 text-xs">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {Object.entries(DOCUMENT_RECIPIENT_DICTIONARY).map(([id, dict]) => (
                    <SelectItem key={id} value={id} className="text-xs">
                      {locale === "en" ? dict.label_en : dict.label_it}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-1.5">
              <Label className="text-xs font-semibold">
                {tr("documents.createTemplate.formatLabel", "Formato Foglio")}
              </Label>
              <Select
                value={String(paperFormat)}
                onValueChange={(val) => setPaperFormat(Number(val) as DocumentPaperFormat)}
              >
                <SelectTrigger className="h-9 text-xs">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {Object.entries(DOCUMENT_FORMAT_DICTIONARY).map(([id, dict]) => (
                    <SelectItem key={id} value={id} className="text-xs">
                      {locale === "en" ? dict.label_en : dict.label_it}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>

          <div className="flex items-center justify-end gap-2 pt-3 border-t">
            <Button
              type="button"
              variant="outline"
              size="sm"
              onClick={() => onOpenChange(false)}
              className="text-xs h-8"
            >
              {tr("documents.createTemplate.cancel", "Annulla")}
            </Button>
            <Button
              type="submit"
              size="sm"
              disabled={isLoading || !name.trim()}
              className="text-xs h-8 bg-primary hover:bg-primary/90 text-primary-foreground font-semibold"
            >
              <Sparkles className="h-3.5 w-3.5 mr-1.5" />
              {isLoading
                ? tr("documents.createTemplate.submitting", "Creazione in corso...")
                : tr("documents.createTemplate.submit", "Crea & Apri Builder")}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
}
