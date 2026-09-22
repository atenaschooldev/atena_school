import React, { useState, useEffect } from "react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Switch } from "@/components/ui/switch";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Sparkles, Tag, Percent, Euro, BookOpen, User } from "lucide-react";
import type { PromoCodeItem, CreatePromoCodeInput } from "../types";
import { useCourses } from "@/features/courses/hooks/use-courses";
import { useTranslation } from "@/i18n/context";

interface CreatePromoDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onSubmit: (data: CreatePromoCodeInput) => Promise<any>;
  initialData?: PromoCodeItem | null;
}

export function CreatePromoDialog({
  open,
  onOpenChange,
  onSubmit,
  initialData,
}: CreatePromoDialogProps) {
  const { t } = useTranslation();
  const { coursesList } = useCourses();
  const [code, setCode] = useState("");
  const [description, setDescription] = useState("");
  const [discountType, setDiscountType] = useState<number>(1); // 1 = PERCENTAGE, 2 = FIXED_AMOUNT
  const [discountValue, setDiscountValue] = useState<number>(10);
  const [waiveRegistrationFee, setWaiveRegistrationFee] = useState(false);
  const [hasMaxUses, setHasMaxUses] = useState(false);
  const [maxUses, setMaxUses] = useState<number>(100);
  const [hasMaxUsesPerUser, setHasMaxUsesPerUser] = useState(false);
  const [maxUsesPerUser, setMaxUsesPerUser] = useState<number>(1);
  const [hasCourseScope, setHasCourseScope] = useState(false);
  const [selectedCourseIds, setSelectedCourseIds] = useState<string[]>([]);
  const [hasValidDates, setHasValidDates] = useState(false);
  const [validFrom, setValidFrom] = useState("");
  const [validUntil, setValidUntil] = useState("");
  const [isActive, setIsActive] = useState(true);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (initialData) {
      setCode(initialData.code);
      setDescription(initialData.description || "");
      setDiscountType(Number(initialData.discount_type) || 1);
      setDiscountValue(Number(initialData.discount_value) || 0);
      setWaiveRegistrationFee(Boolean(initialData.waive_registration_fee));
      setHasMaxUses(initialData.max_uses != null);
      setMaxUses(initialData.max_uses != null ? Number(initialData.max_uses) : 100);
      setHasMaxUsesPerUser(initialData.max_uses_per_user != null);
      setMaxUsesPerUser(initialData.max_uses_per_user != null ? Number(initialData.max_uses_per_user) : 1);
      const courses = Array.isArray(initialData.applicable_course_ids) ? initialData.applicable_course_ids : [];
      setHasCourseScope(courses.length > 0);
      setSelectedCourseIds(courses);
      setHasValidDates(Boolean(initialData.valid_from || initialData.valid_until));
      setValidFrom(initialData.valid_from ? initialData.valid_from.substring(0, 10) : "");
      setValidUntil(initialData.valid_until ? initialData.valid_until.substring(0, 10) : "");
      setIsActive(initialData.is_active);
    } else {
      setCode("");
      setDescription("");
      setDiscountType(1);
      setDiscountValue(10);
      setWaiveRegistrationFee(false);
      setHasMaxUses(false);
      setMaxUses(100);
      setHasMaxUsesPerUser(false);
      setMaxUsesPerUser(1);
      setHasCourseScope(false);
      setSelectedCourseIds([]);
      setHasValidDates(false);
      setValidFrom("");
      setValidUntil("");
      setIsActive(true);
    }
  }, [initialData, open]);

  const generateRandomCode = () => {
    const prefixes = ["ATENA", "PROMO", "DISCOUNT", "SUMMER", "WINTER", "STUDENT"];
    const prefix = prefixes[Math.floor(Math.random() * prefixes.length)];
    const num = Math.floor(1000 + Math.random() * 9000);
    setCode(`${prefix}${num}`);
  };

  const toggleCourseSelection = (courseId: string) => {
    setSelectedCourseIds((prev) =>
      prev.includes(courseId) ? prev.filter((id) => id !== courseId) : [...prev, courseId]
    );
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!code.trim()) return;

    setLoading(true);
    try {
      await onSubmit({
        code: code.trim().toUpperCase(),
        description: description.trim() || undefined,
        discount_type: discountType,
        discount_value: Number(discountValue),
        waive_registration_fee: waiveRegistrationFee,
        max_uses: hasMaxUses ? Number(maxUses) : null,
        max_uses_per_user: hasMaxUsesPerUser ? Number(maxUsesPerUser) : null,
        applicable_course_ids: hasCourseScope ? selectedCourseIds : [],
        valid_from: hasValidDates && validFrom ? new Date(validFrom).toISOString() : null,
        valid_until: hasValidDates && validUntil ? new Date(`${validUntil}T23:59:59Z`).toISOString() : null,
        is_active: isActive,
      });
      onOpenChange(false);
    } catch {
      // Error handled in mutation
    } finally {
      setLoading(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[540px] max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-lg bg-primary/10 text-primary flex items-center justify-center">
              <Tag className="w-4 h-4" />
            </div>
            <div>
              <DialogTitle>
                {initialData ? t("promotions.editPromo") : t("promotions.newPromo")}
              </DialogTitle>
            </div>
          </div>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-4 pt-2">
          {/* Promo Code string */}
          <div className="space-y-1.5">
            <Label htmlFor="code" className="text-xs font-bold uppercase tracking-wider">
              {t("promotions.promoCode")} *
            </Label>
            <div className="flex gap-2">
              <Input
                id="code"
                value={code}
                onChange={(e) => setCode(e.target.value.toUpperCase())}
                placeholder="es. ESTATE2026"
                required
                className="font-mono font-bold uppercase text-sm tracking-wider"
              />
              <Button
                type="button"
                variant="outline"
                size="icon"
                onClick={generateRandomCode}
                title={t("promotions.newPromo")}
              >
                <Sparkles className="w-4 h-4 text-amber-500" />
              </Button>
            </div>
          </div>

          {/* Description */}
          <div className="space-y-1.5">
            <Label htmlFor="description" className="text-xs font-bold uppercase tracking-wider">
              {t("promotions.description")}
            </Label>
            <Textarea
              id="description"
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder="es. Sconto di benvenuto 15% per le iscrizioni estive"
              rows={2}
              className="text-xs resize-none"
            />
          </div>

          {/* Discount Type and Value */}
          <div className="grid grid-cols-2 gap-3">
            <div className="space-y-1.5">
              <Label className="text-xs font-bold uppercase tracking-wider">
                {t("promotions.discountType")}
              </Label>
              <Select
                value={String(discountType)}
                onValueChange={(val) => setDiscountType(Number(val))}
              >
                <SelectTrigger className="text-xs font-medium cursor-pointer">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="1" className="cursor-pointer">
                    <div className="flex items-center gap-1.5">
                      <Percent className="w-3.5 h-3.5 text-blue-600" />
                      <span>{t("promotions.percentage")}</span>
                    </div>
                  </SelectItem>
                  <SelectItem value="2" className="cursor-pointer">
                    <div className="flex items-center gap-1.5">
                      <Euro className="w-3.5 h-3.5 text-emerald-600" />
                      <span>{t("promotions.fixedAmount")}</span>
                    </div>
                  </SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-1.5">
              <Label htmlFor="discountValue" className="text-xs font-bold uppercase tracking-wider">
                {t("promotions.discountValue")} {discountType === 1 ? "(%)" : "(€)"} *
              </Label>
              <Input
                id="discountValue"
                type="number"
                min="0"
                step={discountType === 1 ? "1" : "0.5"}
                max={discountType === 1 ? "100" : "10000"}
                value={discountValue}
                onChange={(e) => setDiscountValue(Number(e.target.value))}
                required
                className="text-xs font-bold font-mono"
              />
            </div>
          </div>

          {/* Waive Registration Fee switch */}
          <div className="flex items-center justify-between rounded-lg border border-amber-500/30 bg-amber-50/50 dark:bg-amber-950/20 p-3">
            <div className="space-y-0.5">
              <Label className="text-xs font-bold text-amber-900 dark:text-amber-300 cursor-pointer">
                {t("promotions.waiveRegistrationFee")}
              </Label>
              <p className="text-[11px] text-amber-700 dark:text-amber-400">
                {t("promotions.waiveRegistrationFeeDesc")}
              </p>
            </div>
            <Switch
              checked={waiveRegistrationFee}
              onCheckedChange={setWaiveRegistrationFee}
            />
          </div>

          {/* Max Uses Limit */}
          <div className="space-y-2 rounded-lg border bg-muted/30 p-3">
            <div className="flex items-center justify-between">
              <div className="space-y-0.5">
                <Label className="text-xs font-bold text-foreground">
                  {t("promotions.maxUsesLimit")}
                </Label>
                <p className="text-[11px] text-muted-foreground">
                  {t("promotions.maxUsesLimitDesc")}
                </p>
              </div>
              <Switch
                checked={hasMaxUses}
                onCheckedChange={setHasMaxUses}
              />
            </div>
            {hasMaxUses && (
              <div className="pt-2">
                <Input
                  type="number"
                  min="1"
                  value={maxUses}
                  onChange={(e) => setMaxUses(Number(e.target.value))}
                  placeholder="es. 50"
                  className="text-xs font-mono font-bold"
                />
              </div>
            )}
          </div>

          {/* Course Scope Selection */}
          <div className="space-y-2 rounded-lg border bg-muted/30 p-3">
            <div className="flex items-center justify-between">
              <div className="space-y-0.5">
                <Label className="text-xs font-bold text-foreground">
                  Ambito di applicazione
                </Label>
                <p className="text-[11px] text-muted-foreground">
                  {hasCourseScope ? "Applicabile solo ai corsi selezionati" : "Valido per tutti i corsi della scuola"}
                </p>
              </div>
              <Switch
                checked={hasCourseScope}
                onCheckedChange={setHasCourseScope}
              />
            </div>
            {hasCourseScope && (
              <div className="pt-2 space-y-1.5 max-h-40 overflow-y-auto border rounded-md p-2 bg-background">
                {coursesList.map((course: any) => {
                  const isSelected = selectedCourseIds.includes(course.id);
                  return (
                    <div
                      key={course.id}
                      onClick={() => toggleCourseSelection(course.id)}
                      className={`flex items-center justify-between p-1.5 rounded cursor-pointer text-xs transition-colors ${
                        isSelected
                          ? "bg-primary/10 text-primary font-medium"
                          : "hover:bg-muted text-muted-foreground"
                      }`}
                    >
                      <span className="truncate">{course.nome || course.title || course.name}</span>
                      <span className="text-[10px] font-mono">{isSelected ? "✓ Selezionato" : "+ Aggiungi"}</span>
                    </div>
                  );
                })}
              </div>
            )}
          </div>

          {/* Max Uses Per User Limit */}
          <div className="space-y-2 rounded-lg border bg-muted/30 p-3">
            <div className="flex items-center justify-between">
              <div className="space-y-0.5">
                <Label className="text-xs font-bold text-foreground">
                  Limite per singolo cliente
                </Label>
                <p className="text-[11px] text-muted-foreground">
                  {hasMaxUsesPerUser ? "Numero massimo di utilizzi per ogni cliente" : "Nessun limite per utente"}
                </p>
              </div>
              <Switch
                checked={hasMaxUsesPerUser}
                onCheckedChange={setHasMaxUsesPerUser}
              />
            </div>
            {hasMaxUsesPerUser && (
              <div className="pt-2">
                <Input
                  type="number"
                  min="1"
                  value={maxUsesPerUser}
                  onChange={(e) => setMaxUsesPerUser(Number(e.target.value))}
                  placeholder="es. 1"
                  className="text-xs font-mono font-bold"
                />
              </div>
            )}
          </div>

          {/* Validity Period */}
          <div className="space-y-2 rounded-lg border bg-muted/30 p-3">
            <div className="flex items-center justify-between">
              <div className="space-y-0.5">
                <Label className="text-xs font-bold text-foreground">
                  {t("promotions.validityPeriod")}
                </Label>
                <p className="text-[11px] text-muted-foreground">
                  {t("promotions.validityPeriodDesc")}
                </p>
              </div>
              <Switch
                checked={hasValidDates}
                onCheckedChange={setHasValidDates}
              />
            </div>
            {hasValidDates && (
              <div className="grid grid-cols-2 gap-2 pt-2">
                <div className="space-y-1">
                  <Label className="text-[10px] font-bold uppercase text-muted-foreground">
                    {t("promotions.validFrom")}
                  </Label>
                  <Input
                    type="date"
                    value={validFrom}
                    onChange={(e) => setValidFrom(e.target.value)}
                    className="text-xs"
                  />
                </div>
                <div className="space-y-1">
                  <Label className="text-[10px] font-bold uppercase text-muted-foreground">
                    {t("promotions.validUntil")}
                  </Label>
                  <Input
                    type="date"
                    value={validUntil}
                    onChange={(e) => setValidUntil(e.target.value)}
                    className="text-xs"
                  />
                </div>
              </div>
            )}
          </div>

          {/* Active status */}
          <div className="flex items-center justify-between rounded-lg border bg-muted/30 p-3">
            <div className="space-y-0.5">
              <Label className="text-xs font-bold text-foreground">
                {t("promotions.activeStatus")}
              </Label>
              <p className="text-[11px] text-muted-foreground">
                {t("promotions.activeStatusDesc")}
              </p>
            </div>
            <Switch
              checked={isActive}
              onCheckedChange={setIsActive}
            />
          </div>

          <DialogFooter className="pt-2">
            <Button
              type="button"
              variant="outline"
              onClick={() => onOpenChange(false)}
              disabled={loading}
            >
              {t("common.cancel")}
            </Button>
            <Button type="submit" disabled={loading}>
              {loading ? t("common.saving") : initialData ? t("common.save") : t("common.create")}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
