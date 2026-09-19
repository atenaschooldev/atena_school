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
import { useTranslation } from "@/i18n/context";
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
  const { t } = useTranslation();
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
          <DialogTitle>{initialValues ? t("teachers.editTeacher") : t("teachers.newTeacher")}</DialogTitle>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-4 text-xs">
          <div className="space-y-1.5">
            <Label className="text-xs font-semibold">{t("teachers.teacherName")}</Label>
            <Input
              placeholder="es. Mario Rossi"
              value={fullName}
              onChange={(e) => setFullName(e.target.value)}
              className="h-9 text-xs"
              required
            />
          </div>

          <div className="space-y-1.5">
            <Label className="text-xs font-semibold">{t("common.status")}</Label>
            <Select value={status} onValueChange={setStatus}>
              <SelectTrigger className="h-9 text-xs cursor-pointer">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="active" className="cursor-pointer">{t("common.active")}</SelectItem>
                <SelectItem value="inactive" className="cursor-pointer">{t("common.inactive")}</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <div className="space-y-1.5">
            <Label className="text-xs font-semibold">{t("teachers.photoUrl")} ({t("common.details")})</Label>
            <Input
              placeholder="https://..."
              value={photoUrl}
              onChange={(e) => setPhotoUrl(e.target.value)}
              className="h-9 text-xs"
            />
          </div>

          <div className="space-y-1.5">
            <Label className="text-xs font-semibold">{t("teachers.experience")}</Label>
            <Textarea
              placeholder="..."
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
              {t("common.cancel")}
            </Button>
            <Button
              type="submit"
              disabled={submitting || !fullName.trim()}
              className="text-xs font-bold bg-primary text-primary-foreground cursor-pointer"
            >
              {submitting ? t("common.saving") : initialValues ? t("common.save") : t("common.create")}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
