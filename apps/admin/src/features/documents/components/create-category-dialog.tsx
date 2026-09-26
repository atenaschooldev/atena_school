"use client";

import React, { useState, useEffect } from "react";
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
import { Switch } from "@/components/ui/switch";
import {
  DocumentCategoryType,
  DOCUMENT_CATEGORY_DICTIONARY,
  type DocumentCategoryRecord,
  type CreateDocumentCategoryDto,
  type UpdateDocumentCategoryDto,
} from "../types";
import { FolderTree, Sparkles } from "lucide-react";

interface CategoryDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  category?: DocumentCategoryRecord | null;
  onSubmit: (dto: any) => Promise<any>;
  isLoading?: boolean;
}

const AVAILABLE_ICONS = [
  { value: "file-text", label: "File Text (Contratti / Moduli)" },
  { value: "briefcase", label: "Briefcase (Docenti / Lavoro)" },
  { value: "receipt", label: "Receipt (Ricevute / Fisco)" },
  { value: "shield-check", label: "Shield (Privacy / GDPR)" },
  { value: "award", label: "Award (Attestati / Certificati)" },
  { value: "landmark", label: "Landmark (Amministrazione)" },
];

export function CreateCategoryDialog({
  open,
  onOpenChange,
  category,
  onSubmit,
  isLoading = false,
}: CategoryDialogProps) {
  const isEditing = !!category;

  const [categoryType, setCategoryType] = useState<DocumentCategoryType>(
    category?.category_type || DocumentCategoryType.STUDENT_CONTRACTS
  );
  const [nameIt, setNameIt] = useState(category?.name_it || "");
  const [nameEn, setNameEn] = useState(category?.name_en || "");
  const [nameRu, setNameRu] = useState(category?.name_ru || "");
  const [description, setDescription] = useState(category?.description || "");
  const [icon, setIcon] = useState(category?.icon || "file-text");
  const [isActive, setIsActive] = useState(category?.is_active ?? true);

  useEffect(() => {
    if (category) {
      setCategoryType(category.category_type);
      setNameIt(category.name_it);
      setNameEn(category.name_en);
      setNameRu(category.name_ru || "");
      setDescription(category.description || "");
      setIcon(category.icon || "file-text");
      setIsActive(category.is_active);
    } else {
      setCategoryType(DocumentCategoryType.STUDENT_CONTRACTS);
      setNameIt("");
      setNameEn("");
      setNameRu("");
      setDescription("");
      setIcon("file-text");
      setIsActive(true);
    }
  }, [category, open]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!nameIt.trim()) return;

    if (isEditing) {
      await onSubmit({
        name_it: nameIt.trim(),
        name_en: nameEn.trim() || nameIt.trim(),
        name_ru: nameRu.trim() || nameIt.trim(),
        description: description.trim() || undefined,
        icon,
        is_active: isActive,
      });
    } else {
      await onSubmit({
        category_type: categoryType,
        name_it: nameIt.trim(),
        name_en: nameEn.trim() || nameIt.trim(),
        name_ru: nameRu.trim() || nameIt.trim(),
        description: description.trim() || undefined,
        icon,
        is_active: isActive,
      });
    }

    onOpenChange(false);
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-md p-0 overflow-hidden bg-background">
        <DialogHeader className="p-5 border-b bg-muted/40">
          <DialogTitle className="text-base font-bold flex items-center gap-2">
            <FolderTree className="h-5 w-5 text-primary" />
            {isEditing ? "Modifica Categoria Documentale" : "Crea Nuova Categoria"}
          </DialogTitle>
          <DialogDescription className="text-xs">
            {isEditing
              ? `Aggiorna i dettagli e la classificazione per la categoria ID ${category?.id}.`
              : "Aggiungi una nuova categoria documentale per organizzare contratti, attestati e ricevute."}
          </DialogDescription>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="p-5 space-y-4 text-xs">
          {!isEditing && (
            <div className="space-y-1.5">
              <Label className="text-xs font-semibold">Tipo Categoria di Dominio (Enum ID)</Label>
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
                      {dict.label_it} (ID: {id})
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          )}

          <div className="grid grid-cols-2 gap-3">
            <div className="space-y-1.5">
              <Label className="text-xs font-semibold">Nome (Italiano) *</Label>
              <Input
                placeholder="es. Contratti Stage"
                value={nameIt}
                onChange={(e) => setNameIt(e.target.value)}
                required
                className="text-xs h-9"
              />
            </div>
            <div className="space-y-1.5">
              <Label className="text-xs font-semibold">Nome (English)</Label>
              <Input
                placeholder="es. Internship Contracts"
                value={nameEn}
                onChange={(e) => setNameEn(e.target.value)}
                className="text-xs h-9"
              />
            </div>
          </div>

          <div className="space-y-1.5">
            <Label className="text-xs font-semibold">Icona Categoria</Label>
            <Select value={icon} onValueChange={setIcon}>
              <SelectTrigger className="h-9 text-xs">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                {AVAILABLE_ICONS.map((ico) => (
                  <SelectItem key={ico.value} value={ico.value} className="text-xs">
                    {ico.label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <div className="space-y-1.5">
            <Label className="text-xs font-semibold">Descrizione</Label>
            <Textarea
              placeholder="Descrivi i documenti contenuti in questa categoria..."
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              rows={2}
              className="text-xs resize-none"
            />
          </div>

          <div className="flex items-center justify-between py-2 border-t text-xs">
            <Label className="text-xs font-semibold">Stato Attivo</Label>
            <Switch
              checked={isActive}
              onCheckedChange={setIsActive}
              className="data-[state=checked]:bg-emerald-600 cursor-pointer"
            />
          </div>

          <div className="flex items-center justify-end gap-2 pt-3 border-t">
            <Button
              type="button"
              variant="outline"
              size="sm"
              onClick={() => onOpenChange(false)}
              className="text-xs h-8"
            >
              Annulla
            </Button>
            <Button
              type="submit"
              size="sm"
              disabled={isLoading || !nameIt.trim()}
              className="text-xs h-8 bg-primary hover:bg-primary/90 text-primary-foreground font-semibold"
            >
              <Sparkles className="h-3.5 w-3.5 mr-1.5" />
              {isLoading ? "Salvataggio..." : isEditing ? "Salva Modifiche" : "Crea Categoria"}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
}
