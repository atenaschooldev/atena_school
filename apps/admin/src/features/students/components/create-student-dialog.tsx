"use client";

import { useState } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Checkbox } from "@/components/ui/checkbox";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { StudentStatus, LanguageLevel } from "@atena/api-types";
import { useTranslation } from "@/i18n/context";
import type { CreateStudentFormValues } from "../types";
import { toast } from "sonner";

interface CreateStudentDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onSubmit: (values: CreateStudentFormValues) => Promise<any>;
}

export function CreateStudentDialog({
  open,
  onOpenChange,
  onSubmit,
}: CreateStudentDialogProps) {
  const { t } = useTranslation();

  const [firstName, setFirstName] = useState("");
  const [lastName, setLastName] = useState("");
  const [email, setEmail] = useState("");
  const [phone, setPhone] = useState("");
  const [taxCode, setTaxCode] = useState("");
  const [birthDate, setBirthDate] = useState("");
  const [birthPlace, setBirthPlace] = useState("");
  const [languageLevel, setLanguageLevel] = useState<number>(LanguageLevel.A1);
  const [status, setStatus] = useState<number>(StudentStatus.ACTIVE);
  const [annualFeePaid, setAnnualFeePaid] = useState(false);
  const [notes, setNotes] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const full = `${firstName.trim()} ${lastName.trim()}`.trim();
    if (!full) {
      toast.error(t("students.enterName"));
      return;
    }

    try {
      setIsSubmitting(true);
      await onSubmit({
        fullName: full,
        firstName: firstName.trim() || undefined,
        lastName: lastName.trim() || undefined,
        email: email.trim() || undefined,
        phone: phone.trim() || undefined,
        taxCode: taxCode.trim().toUpperCase() || undefined,
        birthDate: birthDate || undefined,
        birthPlace: birthPlace.trim() || undefined,
        languageLevel: Number(languageLevel),
        status: Number(status),
        annualFeePaid,
        notes: notes.trim() || undefined,
      });
      toast.success(t("students.createdSuccess"));
      onOpenChange(false);
      // Reset
      setFirstName("");
      setLastName("");
      setEmail("");
      setPhone("");
      setTaxCode("");
      setBirthDate("");
      setBirthPlace("");
      setNotes("");
      setAnnualFeePaid(false);
    } catch {
      // Error handled in mutation
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="text-xl font-bold">{t("students.newStudent")}</DialogTitle>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-4 py-2">
          {/* Nome & Cognome */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div className="space-y-1.5">
              <Label htmlFor="firstName" className="text-sm font-semibold">
                {t("students.firstName")} *
              </Label>
              <Input
                id="firstName"
                placeholder="es. Mario"
                value={firstName}
                onChange={(e) => setFirstName(e.target.value)}
                required
              />
            </div>

            <div className="space-y-1.5">
              <Label htmlFor="lastName" className="text-sm font-semibold">
                {t("students.lastName")} *
              </Label>
              <Input
                id="lastName"
                placeholder="es. Rossi"
                value={lastName}
                onChange={(e) => setLastName(e.target.value)}
                required
              />
            </div>
          </div>

          {/* Email & Telefono */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div className="space-y-1.5">
              <Label htmlFor="email" className="text-sm font-semibold">
                {t("common.email")}
              </Label>
              <Input
                id="email"
                type="email"
                placeholder="mario.rossi@example.com"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
              />
            </div>

            <div className="space-y-1.5">
              <Label htmlFor="phone" className="text-sm font-semibold">
                {t("common.phone")}
              </Label>
              <Input
                id="phone"
                placeholder="+39 333 1234567"
                value={phone}
                onChange={(e) => setPhone(e.target.value)}
              />
            </div>
          </div>

          {/* Codice Fiscale & Data di nascita */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div className="space-y-1.5">
              <Label htmlFor="taxCode" className="text-sm font-semibold">
                {t("common.taxCode")}
              </Label>
              <Input
                id="taxCode"
                placeholder="RSSMRA85M01H501Z"
                className="font-mono uppercase"
                value={taxCode}
                onChange={(e) => setTaxCode(e.target.value)}
              />
            </div>

            <div className="space-y-1.5">
              <Label htmlFor="birthDate" className="text-sm font-semibold">
                {t("students.birthDate")}
              </Label>
              <Input
                id="birthDate"
                type="date"
                value={birthDate}
                onChange={(e) => setBirthDate(e.target.value)}
              />
            </div>
          </div>

          {/* Luogo di nascita & Livello lingua */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div className="space-y-1.5">
              <Label htmlFor="birthPlace" className="text-sm font-semibold">
                {t("students.birthPlace")}
              </Label>
              <Input
                id="birthPlace"
                placeholder="es. Roma (RM)"
                value={birthPlace}
                onChange={(e) => setBirthPlace(e.target.value)}
              />
            </div>

            <div className="space-y-1.5">
              <Label htmlFor="languageLevel" className="text-sm font-semibold">
                {t("students.level")}
              </Label>
              <Select
                value={String(languageLevel)}
                onValueChange={(val) => setLanguageLevel(Number(val))}
              >
                <SelectTrigger id="languageLevel" className="cursor-pointer">
                  <SelectValue placeholder={t("students.selectLevel")} />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="1">A1 — Principiante</SelectItem>
                  <SelectItem value="2">A2 — Elementare</SelectItem>
                  <SelectItem value="3">B1 — Intermedio</SelectItem>
                  <SelectItem value="4">B2 — Intermedio Superiore</SelectItem>
                  <SelectItem value="5">C1 — Avanzato</SelectItem>
                  <SelectItem value="6">C2 — Madrelingua / Padronanza</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>

          {/* Quota d'iscrizione annuale checkbox */}
          <div className="flex items-center space-x-2 pt-2 border-t">
            <Checkbox
              id="annualFeePaid"
              checked={annualFeePaid}
              onCheckedChange={(checked) => setAnnualFeePaid(!!checked)}
            />
            <Label htmlFor="annualFeePaid" className="text-xs text-foreground font-medium cursor-pointer">
              {t("students.annualFeePaidCheckbox")} (€30)
            </Label>
          </div>

          {/* Note */}
          <div className="space-y-1.5">
            <Label htmlFor="notes" className="text-sm font-semibold">
              {t("common.notes")}
            </Label>
            <Textarea
              id="notes"
              placeholder="..."
              rows={2}
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
            />
          </div>

          <DialogFooter className="pt-3">
            <Button
              type="button"
              variant="outline"
              onClick={() => onOpenChange(false)}
              disabled={isSubmitting}
              className="cursor-pointer"
            >
              {t("common.cancel")}
            </Button>
            <Button type="submit" disabled={isSubmitting} className="cursor-pointer">
              {isSubmitting ? t("common.saving") : t("common.create")}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
