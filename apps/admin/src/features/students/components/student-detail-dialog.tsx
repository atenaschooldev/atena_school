"use client";

import { useState } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Checkbox } from "@/components/ui/checkbox";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import {
  User,
  Award,
  Calendar,
  Phone,
  Mail,
  FileText,
  Clock,
  BookOpen,
  Edit2,
} from "lucide-react";
import { CellFormattedDate } from "@/components/shared/cell-formatted-date";
import { StudentStatus, LanguageLevel, parseLanguageLevel, parseStudentStatus } from "@atena/api-types";
import { useTranslation } from "@/i18n/context";
import type { Student, UpdateStudentFormValues } from "../types";
import { toast } from "sonner";

interface StudentDetailDialogProps {
  student: Student | null;
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onUpdate: (id: string, values: UpdateStudentFormValues) => Promise<any>;
}

const LEVEL_LABELS: Record<number, string> = {
  1: "A1 — Principiante",
  2: "A2 — Elementare",
  3: "B1 — Intermedio",
  4: "B2 — Intermedio Superiore",
  5: "C1 — Avanzato",
  6: "C2 — Madrelingua / Padronanza",
};

export function StudentDetailDialog({
  student,
  open,
  onOpenChange,
  onUpdate,
}: StudentDetailDialogProps) {
  const { t } = useTranslation();
  const [isEditing, setIsEditing] = useState(false);
  const [isSaving, setIsSaving] = useState(false);

  // Edit fields
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

  if (!student) return null;

  const handleStartEdit = () => {
    setFirstName(student.first_name || "");
    setLastName(student.last_name || "");
    setEmail(student.email || "");
    setPhone(student.phone || "");
    setTaxCode(student.tax_code || "");
    setBirthDate(
      student.birth_date
        ? new Date(student.birth_date).toISOString().split("T")[0]
        : ""
    );
    setBirthPlace(student.birth_place || "");
    setLanguageLevel(parseLanguageLevel(student.language_level));
    setStatus(parseStudentStatus(student.status));
    setAnnualFeePaid(student.annual_fee_paid);
    setNotes(student.notes || "");
    setIsEditing(true);
  };

  const handleSaveEdit = async () => {
    const full = `${firstName.trim()} ${lastName.trim()}`.trim();
    if (!full) {
      toast.error(t("students.enterName"));
      return;
    }

    try {
      setIsSaving(true);
      await onUpdate(student.id, {
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
      toast.success(t("students.updatedSuccess"));
      setIsEditing(false);
    } catch {
      // Handled in mutation
    } finally {
      setIsSaving(false);
    }
  };

  const currentLevel = parseLanguageLevel(student.language_level);

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-2xl max-h-[85vh] overflow-y-auto">
        <DialogHeader>
          <div className="flex items-center justify-between gap-4">
            <div>
              <DialogTitle className="text-xl font-bold flex items-center gap-2">
                <User className="w-5 h-5 text-primary" />
                {student.full_name}
              </DialogTitle>
              <p className="text-xs text-muted-foreground mt-0.5 font-mono uppercase">
                {student.tax_code || t("students.noTaxCode")}
              </p>
            </div>
            <div className="flex items-center gap-2">
              {student.annual_fee_paid ? (
                <Badge variant="outline" className="border-emerald-500/30 bg-emerald-500/10 text-emerald-600 gap-1 text-xs">
                  <Award className="w-3.5 h-3.5" />
                  {t("students.feePaidBadge")}
                </Badge>
              ) : (
                <Badge variant="outline" className="border-amber-500/30 bg-amber-500/10 text-amber-600 gap-1 text-xs">
                  {t("students.feePendingBadge")}
                </Badge>
              )}
              {!isEditing && (
                <Button
                  variant="outline"
                  size="sm"
                  onClick={handleStartEdit}
                  className="h-8 gap-1 text-xs cursor-pointer rounded-lg"
                >
                  <Edit2 className="w-3.5 h-3.5" />
                  {t("common.edit")}
                </Button>
              )}
            </div>
          </div>
        </DialogHeader>

        {isEditing ? (
          /* Edit Form */
          <div className="space-y-4 py-2">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div className="space-y-1">
                <Label className="text-xs font-semibold">{t("students.firstName")}</Label>
                <Input value={firstName} onChange={(e) => setFirstName(e.target.value)} />
              </div>
              <div className="space-y-1">
                <Label className="text-xs font-semibold">{t("students.lastName")}</Label>
                <Input value={lastName} onChange={(e) => setLastName(e.target.value)} />
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div className="space-y-1">
                <Label className="text-xs font-semibold">{t("common.email")}</Label>
                <Input value={email} onChange={(e) => setEmail(e.target.value)} />
              </div>
              <div className="space-y-1">
                <Label className="text-xs font-semibold">{t("common.phone")}</Label>
                <Input value={phone} onChange={(e) => setPhone(e.target.value)} />
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div className="space-y-1">
                <Label className="text-xs font-semibold">{t("common.taxCode")}</Label>
                <Input
                  value={taxCode}
                  onChange={(e) => setTaxCode(e.target.value)}
                  className="font-mono uppercase"
                />
              </div>
              <div className="space-y-1">
                <Label className="text-xs font-semibold">{t("students.birthDate")}</Label>
                <Input
                  type="date"
                  value={birthDate}
                  onChange={(e) => setBirthDate(e.target.value)}
                />
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div className="space-y-1">
                <Label className="text-xs font-semibold">{t("students.level")}</Label>
                <Select
                  value={String(languageLevel)}
                  onValueChange={(val) => setLanguageLevel(Number(val))}
                >
                  <SelectTrigger className="cursor-pointer text-xs">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="1">A1 — Principiante</SelectItem>
                    <SelectItem value="2">A2 — Elementare</SelectItem>
                    <SelectItem value="3">B1 — Intermedio</SelectItem>
                    <SelectItem value="4">B2 — Intermedio Superiore</SelectItem>
                    <SelectItem value="5">C1 — Avanzato</SelectItem>
                    <SelectItem value="6">C2 — Madrelingua</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-1">
                <Label className="text-xs font-semibold">{t("common.status")}</Label>
                <Select
                  value={String(status)}
                  onValueChange={(val) => setStatus(Number(val))}
                >
                  <SelectTrigger className="cursor-pointer text-xs">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="1">{t("common.active")}</SelectItem>
                    <SelectItem value="2">{t("common.inactive")}</SelectItem>
                    <SelectItem value="3">{t("common.pending")}</SelectItem>
                    <SelectItem value="4">{t("common.completed")}</SelectItem>
                    <SelectItem value="5">{t("common.archived")}</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>

            <div className="flex items-center space-x-2 pt-2 border-t">
              <Checkbox
                id="editAnnualFee"
                checked={annualFeePaid}
                onCheckedChange={(checked) => setAnnualFeePaid(!!checked)}
              />
              <Label htmlFor="editAnnualFee" className="text-xs font-medium cursor-pointer">
                {t("students.annualFeePaidCheckbox")} (€30)
              </Label>
            </div>

            <div className="space-y-1">
              <Label className="text-xs font-semibold">{t("common.notes")}</Label>
              <Textarea
                value={notes}
                onChange={(e) => setNotes(e.target.value)}
                rows={2}
              />
            </div>

            <DialogFooter className="pt-2">
              <Button
                variant="outline"
                size="sm"
                onClick={() => setIsEditing(false)}
                disabled={isSaving}
                className="cursor-pointer"
              >
                {t("common.cancel")}
              </Button>
              <Button
                size="sm"
                onClick={handleSaveEdit}
                disabled={isSaving}
                className="cursor-pointer"
              >
                {isSaving ? t("common.saving") : t("common.save")}
              </Button>
            </DialogFooter>
          </div>
        ) : (
          /* View Details */
          <div className="space-y-4 pt-2">
            {/* Info Grid */}
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 p-3 bg-muted/30 rounded-xl border border-border/50 text-xs">
              <div className="space-y-0.5">
                <span className="text-muted-foreground flex items-center gap-1">
                  <Mail className="w-3.5 h-3.5" /> {t("common.email")}
                </span>
                <p className="font-semibold text-foreground truncate">{student.email || "-"}</p>
              </div>

              <div className="space-y-0.5">
                <span className="text-muted-foreground flex items-center gap-1">
                  <Phone className="w-3.5 h-3.5" /> {t("common.phone")}
                </span>
                <p className="font-semibold text-foreground truncate">{student.phone || "-"}</p>
              </div>

              <div className="space-y-0.5">
                <span className="text-muted-foreground flex items-center gap-1">
                  <Calendar className="w-3.5 h-3.5" /> {t("students.birthDate")}
                </span>
                <p className="font-semibold text-foreground">
                  {student.birth_date ? (
                    <CellFormattedDate dateValue={student.birth_date} showTime={false} />
                  ) : (
                    "-"
                  )}
                </p>
              </div>

              <div className="space-y-0.5">
                <span className="text-muted-foreground flex items-center gap-1">
                  <Award className="w-3.5 h-3.5" /> {t("students.level")}
                </span>
                <p className="font-semibold text-foreground font-mono">
                  {LEVEL_LABELS[currentLevel] || "A1"}
                </p>
              </div>
            </div>

            {/* Tabs for Bookings, Groups and Memberships */}
            <Tabs defaultValue="courses" className="pt-2">
              <TabsList className="grid grid-cols-3 w-full">
                <TabsTrigger value="courses" className="text-xs">
                  <BookOpen className="w-3.5 h-3.5 mr-1.5" />
                  {t("students.enrolledCourses")} ({student.bookings?.length || 0})
                </TabsTrigger>
                <TabsTrigger value="groups" className="text-xs">
                  <User className="w-3.5 h-3.5 mr-1.5" />
                  {t("groups.title")} ({(student as any).groupMembers?.length || 0})
                </TabsTrigger>
                <TabsTrigger value="memberships" className="text-xs">
                  <Award className="w-3.5 h-3.5 mr-1.5" />
                  {t("students.membershipsList")} ({student.memberships?.length || 0})
                </TabsTrigger>
              </TabsList>

              <TabsContent value="courses" className="space-y-2 pt-3">
                {student.bookings && student.bookings.length > 0 ? (
                  <div className="space-y-2 max-h-56 overflow-y-auto pr-1">
                    {student.bookings.map((b: any) => (
                      <div
                        key={b.id}
                        className="p-3 bg-card border border-border/60 rounded-xl flex items-center justify-between text-xs"
                      >
                        <div>
                          <p className="font-semibold text-foreground">{b.courseName || "Corso"}</p>
                          <p className="text-muted-foreground text-[11px]">
                            {b.startDate ? new Date(b.startDate).toLocaleDateString("it-IT") : "-"}
                          </p>
                        </div>
                        <Badge variant="outline" className="text-[10px]">
                          €{Number(b.amountPaid || 0).toFixed(2)}
                        </Badge>
                      </div>
                    ))}
                  </div>
                ) : (
                  <div className="py-6 text-center text-muted-foreground text-xs">
                    {t("students.noCoursesFound")}
                  </div>
                )}
              </TabsContent>

              <TabsContent value="groups" className="space-y-2 pt-3">
                {(student as any).groupMembers && (student as any).groupMembers.length > 0 ? (
                  <div className="space-y-2 max-h-56 overflow-y-auto pr-1">
                    {(student as any).groupMembers.map((gm: any) => (
                      <div
                        key={gm.id}
                        className="p-3 bg-card border border-border/60 rounded-xl flex items-center justify-between text-xs"
                      >
                        <div>
                          <p className="font-semibold text-foreground">{gm.group?.name || "Gruppo"}</p>
                          <p className="text-muted-foreground text-[11px]">
                            {gm.group?.course?.name || ""} {gm.group?.teacher?.fullName ? `• Docente: ${gm.group.teacher.fullName}` : ""}
                          </p>
                        </div>
                        <Badge variant="outline" className="border-primary/30 text-primary bg-primary/10 text-[10px]">
                          {gm.group?.room || "Aula"}
                        </Badge>
                      </div>
                    ))}
                  </div>
                ) : (
                  <div className="py-6 text-center text-muted-foreground text-xs">
                    {t("groups.noGroupsFound")}
                  </div>
                )}
              </TabsContent>

              <TabsContent value="memberships" className="space-y-2 pt-3">
                {student.memberships && student.memberships.length > 0 ? (
                  <div className="space-y-2 max-h-56 overflow-y-auto pr-1">
                    {student.memberships.map((m: any) => (
                      <div
                        key={m.id}
                        className="p-3 bg-card border border-border/60 rounded-xl flex items-center justify-between text-xs"
                      >
                        <div>
                          <p className="font-semibold text-foreground font-mono">
                            {m.membership_number || "A.A. " + m.academic_year}
                          </p>
                          <p className="text-muted-foreground text-[11px]">
                            {m.paid_at ? new Date(m.paid_at).toLocaleDateString("it-IT") : "-"}
                          </p>
                        </div>
                        <Badge variant="outline" className="border-emerald-500/30 text-emerald-600 bg-emerald-500/10 text-[10px]">
                          {m.status === 1 ? "Attiva" : "In attesa"}
                        </Badge>
                      </div>
                    ))}
                  </div>
                ) : (
                  <div className="py-6 text-center text-muted-foreground text-xs">
                    {t("students.noMembershipsFound")}
                  </div>
                )}
              </TabsContent>
            </Tabs>
          </div>
        )}
      </DialogContent>
    </Dialog>
  );
}
