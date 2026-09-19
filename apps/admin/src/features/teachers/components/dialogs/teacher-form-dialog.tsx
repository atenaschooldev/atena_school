"use client";

import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import type { Teacher } from "../../types";

export interface TeacherFormDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  initialValues?: Teacher | null;
  onSubmit: (values: { fullName: string; status?: string; experience?: string; photoUrl?: string }) => Promise<void>;
}

export function TeacherFormDialog({
  open,
  onOpenChange,
  initialValues,
  onSubmit,
}: TeacherFormDialogProps) {
  const [fullName, setFullName] = useState("");
  const [status, setStatus] = useState("active");
  const [photoUrl, setPhotoUrl] = useState("");
  const [experience, setExperience] = useState("");
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    if (initialValues) {
      setFullName(initialValues.fullName || `${initialValues.nome || ""} ${initialValues.cognome || ""}`.trim());
      setStatus(initialValues.status || "active");
      setPhotoUrl(initialValues.photoUrl || "");
      setExperience(initialValues.experience || "");
    } else {
      setFullName("");
      setStatus("active");
      setPhotoUrl("");
      setExperience("");
    }
  }, [initialValues, open]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!fullName.trim()) return;

    setSubmitting(true);
    try {
      await onSubmit({
        fullName: fullName.trim(),
        status,
        photoUrl: photoUrl.trim() || undefined,
        experience: experience.trim() || undefined,
      });
      onOpenChange(false);
    } catch {
      // Handled in caller
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[480px]">
        <DialogHeader>
          <DialogTitle>{initialValues ? "Modifica Docente" : "Nuovo Docente"}</DialogTitle>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-4 text-xs">
          <div className="space-y-1.5">
            <Label className="text-xs font-semibold">Nome e Cognome</Label>
            <Input
              placeholder="es. Mario Rossi"
              value={fullName}
              onChange={(e) => setFullName(e.target.value)}
              className="h-9 text-xs"
              required
            />
          </div>

          <div className="space-y-1.5">
            <Label className="text-xs font-semibold">Stato</Label>
            <Select value={status} onValueChange={setStatus}>
              <SelectTrigger className="h-9 text-xs cursor-pointer">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="active">Attivo</SelectItem>
                <SelectItem value="inactive">Inattivo</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <div className="space-y-1.5">
            <Label className="text-xs font-semibold">URL Foto Profilo (opzionale)</Label>
            <Input
              placeholder="https://..."
              value={photoUrl}
              onChange={(e) => setPhotoUrl(e.target.value)}
              className="h-9 text-xs"
            />
          </div>

          <div className="space-y-1.5">
            <Label className="text-xs font-semibold">Esperienza / Bio (opzionale)</Label>
            <Textarea
              placeholder="es. Madrelingua inglese, 10 anni di esperienza..."
              value={experience}
              onChange={(e) => setExperience(e.target.value)}
              className="h-20 text-xs"
            />
          </div>

          <DialogFooter className="pt-2">
            <Button
              type="button"
              variant="ghost"
              onClick={() => onOpenChange(false)}
              className="text-xs cursor-pointer"
            >
              Annulla
            </Button>
            <Button
              type="submit"
              disabled={submitting || !fullName.trim()}
              className="text-xs font-bold bg-primary text-primary-foreground cursor-pointer"
            >
              {submitting ? "Salvataggio..." : initialValues ? "Salva Modifiche" : "Crea Docente"}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
