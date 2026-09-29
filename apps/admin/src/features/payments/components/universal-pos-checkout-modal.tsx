"use client";

import { useState, useEffect } from "react";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Checkbox } from "@/components/ui/checkbox";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import {
  Search,
  Banknote,
  CreditCard,
  Building2,
  CheckCircle2,
  User,
  Receipt,
  RotateCcw,
  Loader2,
  GraduationCap,
  ShieldCheck,
  Wallet,
  Sparkles,
} from "lucide-react";
import { toast } from "sonner";
import { useQueryClient } from "@tanstack/react-query";
import { api } from "@/lib/api";
import { formatCurrency } from "@atena/utils";
import {
  PaymentMethod,
  PaymentType,
} from "@atena/api-types";
import { useTranslation } from "@/i18n/context";
import { useSchoolProfile } from "@/hooks/use-school-profile";
import { cn } from "@/lib/utils";

interface UniversalPosCheckoutModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  defaultFeeOnly?: boolean;
  preselectedBooking?: {
    id: string;
    purchaserName: string;
    purchaserEmail: string;
    purchaserTaxCode?: string;
    courseName?: string;
    outstandingEstimate?: number;
  } | null;
  onSuccess?: () => void;
}

export function UniversalPosCheckoutModal({
  open,
  onOpenChange,
  defaultFeeOnly = false,
  preselectedBooking,
  onSuccess,
}: UniversalPosCheckoutModalProps) {
  const { t } = useTranslation();
  const queryClient = useQueryClient();

  const [searchQuery, setSearchQuery] = useState("");
  const [searching, setSearching] = useState(false);
  const [selectedClient, setSelectedClient] = useState<{
    bookingId?: string;
    studentId?: string;
    name: string;
    email: string;
    taxCode?: string;
    studentTaxCode?: string;
    purchaserTaxCode?: string;
    phone?: string;
    courseName?: string;
    outstandingEstimate?: number;
  } | null>(null);

  // Payment items states
  const [payCourse, setPayCourse] = useState(!defaultFeeOnly);
  const [courseAmount, setCourseAmount] = useState<number>(0);

  const [payRegistrationFee, setPayRegistrationFee] = useState(defaultFeeOnly);
  const { profile } = useSchoolProfile();
  const registrationFeeAmount = profile?.registration_fee_eur != null ? Number(profile.registration_fee_eur) : 30;

  const [paymentMethod, setPaymentMethod] = useState<PaymentMethod>(PaymentMethod.CASH);
  const [notes, setNotes] = useState("");
  const [submitting, setSubmitting] = useState(false);

  // Sync state on open / preselectedBooking change
  useEffect(() => {
    if (open) {
      if (preselectedBooking) {
        setSelectedClient({
          bookingId: preselectedBooking.id,
          name: preselectedBooking.purchaserName,
          email: preselectedBooking.purchaserEmail,
          taxCode: preselectedBooking.purchaserTaxCode,
          courseName: preselectedBooking.courseName,
          outstandingEstimate: preselectedBooking.outstandingEstimate,
        });
        const outstanding = preselectedBooking.outstandingEstimate ?? 0;
        setCourseAmount(outstanding);
        setPayCourse(!defaultFeeOnly && outstanding > 0);
        setPayRegistrationFee(defaultFeeOnly);
      } else {
        setPayCourse(!defaultFeeOnly);
        setPayRegistrationFee(defaultFeeOnly);
      }
    } else {
      if (!preselectedBooking) {
        setSelectedClient(null);
        setSearchQuery("");
        setNotes("");
        setCourseAmount(0);
        setPayCourse(true);
        setPayRegistrationFee(false);
      }
    }
  }, [open, preselectedBooking, defaultFeeOnly]);

  const handleSearchClient = async () => {
    if (!searchQuery.trim()) return;
    setSearching(true);
    try {
      const res = await api.get<any>(
        `/admin/bookings/lookup-client?q=${encodeURIComponent(searchQuery.trim())}`
      );
      if (res.found) {
        const outstanding = Number(res.outstandingEstimate ?? res.totalPrice ?? 0);
        setSelectedClient({
          bookingId: res.bookingId || res.id,
          studentId: res.studentId || res.student_id,
          name: res.studentName || res.purchaserName || "Cliente",
          email: res.studentEmail || res.purchaserEmail || "",
          taxCode: res.studentTaxCode || res.purchaserTaxCode || "",
          studentTaxCode: res.studentTaxCode,
          purchaserTaxCode: res.purchaserTaxCode,
          phone: res.studentPhone || res.purchaserPhone || "",
          courseName: res.courseName || res.course_name,
          outstandingEstimate: outstanding,
        });
        if (outstanding > 0) {
          setCourseAmount(outstanding);
          setPayCourse(true);
        }
        toast.success(t("payments.clientFound"));
      } else {
        toast.error(t("payments.clientNotFound"));
      }
    } catch (e: any) {
      toast.error(e.message || "Error");
    } finally {
      setSearching(false);
    }
  };

  const totalPayable =
    (payCourse ? (Number.isNaN(courseAmount) ? 0 : courseAmount) : 0) +
    (payRegistrationFee ? registrationFeeAmount : 0);

  const handleSubmitCheckout = async () => {
    if (!selectedClient && !searchQuery.trim()) {
      toast.error(t("payments.lookupClient"));
      return;
    }
    if (totalPayable <= 0) {
      toast.error(t("payments.amountEuro") || "Inserisci un importo valido");
      return;
    }

    setSubmitting(true);
    try {
      const items = [];
      if (payCourse && courseAmount > 0) {
        items.push({
          type: PaymentType.COURSE_PAYMENT,
          amount: courseAmount,
          description: selectedClient?.courseName
            ? `${t("payments.typeTuition")}: ${selectedClient.courseName}`
            : t("payments.typeTuition"),
        });
      }
      if (payRegistrationFee) {
        items.push({
          type: PaymentType.REGISTRATION_FEE,
          amount: registrationFeeAmount,
          description: t("payments.typeMembership"),
        });
      }

      await api.post("/admin/payments/pos-checkout", {
        bookingId: selectedClient?.bookingId,
        studentId: selectedClient?.studentId,
        purchaserName: selectedClient?.name || searchQuery,
        purchaserEmail: selectedClient?.email,
        purchaserTaxCode: selectedClient?.purchaserTaxCode || selectedClient?.taxCode,
        studentTaxCode: selectedClient?.studentTaxCode || selectedClient?.taxCode,
        paymentMethod: Number(paymentMethod),
        items,
        notes,
      });

      toast.success(t("payments.recordPaymentSuccess"));
      queryClient.invalidateQueries({ queryKey: ["payments"] });
      queryClient.invalidateQueries({ queryKey: ["payments-summary"] });
      queryClient.invalidateQueries({ queryKey: ["bookings"] });
      queryClient.invalidateQueries({ queryKey: ["memberships"] });

      if (onSuccess) {
        onSuccess();
      }

      onOpenChange(false);
      setSelectedClient(null);
      setSearchQuery("");
      setNotes("");
    } catch (e: any) {
      toast.error(e.message || "Error");
    } finally {
      setSubmitting(false);
    }
  };

  // Helper for initials
  const getInitials = (name?: string) => {
    if (!name) return "CL";
    const parts = name.trim().split(" ");
    if (parts.length >= 2) {
      return `${parts[0][0]}${parts[1][0]}`.toUpperCase();
    }
    return name.slice(0, 2).toUpperCase();
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[560px] p-0 overflow-hidden rounded-2xl border-border/80 shadow-2xl">
        {/* MODAL HEADER */}
        <DialogHeader className="p-5 pb-4 bg-muted/20 border-b border-border/60">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-primary/10 flex items-center justify-center border border-primary/20 text-primary shrink-0 shadow-2xs">
              <Banknote className="w-5 h-5" />
            </div>
            <div className="space-y-0.5">
              <DialogTitle className="text-base font-bold text-foreground">
                {t("payments.posCheckout")}
              </DialogTitle>
              <DialogDescription className="text-xs text-muted-foreground">
                {t("payments.recordManualPaymentDesc")}
              </DialogDescription>
            </div>
          </div>
        </DialogHeader>

        {/* MODAL BODY */}
        <div className="p-5 space-y-5 max-h-[75vh] overflow-y-auto text-xs">
          {/* STEP 1: CLIENT LOOKUP */}
          <div className="space-y-2">
            <div className="flex items-center justify-between">
              <Label className="text-xs font-bold uppercase tracking-wider text-muted-foreground flex items-center gap-1.5">
                <User className="w-3.5 h-3.5 text-primary" />
                <span>1. {t("payments.studentOrPurchaser")}</span>
              </Label>
              {selectedClient && (
                <Button
                  type="button"
                  variant="ghost"
                  size="sm"
                  className="h-6 px-2 text-[11px] font-medium text-muted-foreground hover:text-foreground cursor-pointer gap-1"
                  onClick={() => setSelectedClient(null)}
                >
                  <RotateCcw className="w-3 h-3" />
                  {t("payments.changeClient")}
                </Button>
              )}
            </div>

            {selectedClient ? (
              <div className="p-3.5 bg-card rounded-xl border border-border/80 shadow-2xs flex items-center gap-3">
                <div className="w-10 h-10 rounded-full bg-primary/10 border border-primary/20 text-primary font-bold flex items-center justify-center text-xs shrink-0">
                  {getInitials(selectedClient.name)}
                </div>
                <div className="flex-1 min-w-0 space-y-1">
                  <div className="flex items-center gap-2 flex-wrap">
                    <span className="font-bold text-sm text-foreground truncate">
                      {selectedClient.name}
                    </span>
                    {selectedClient.outstandingEstimate != null && selectedClient.outstandingEstimate > 0 && (
                      <Badge variant="outline" className="text-[10px] font-medium px-1.5 py-0 bg-amber-500/10 text-amber-600 dark:text-amber-400 border-amber-500/20">
                        {t("payments.pendingAmount")}: {formatCurrency(selectedClient.outstandingEstimate)}
                      </Badge>
                    )}
                  </div>
                  <div className="text-xs text-muted-foreground flex items-center gap-2 flex-wrap">
                    {selectedClient.email && <span>{selectedClient.email}</span>}
                    {selectedClient.taxCode && (
                      <span className="font-mono text-[11px] bg-muted/60 px-1.5 py-0.5 rounded border border-border/40">
                        {selectedClient.taxCode}
                      </span>
                    )}
                  </div>
                  {selectedClient.courseName && (
                    <div className="flex items-center gap-1.5 pt-0.5">
                      <Badge variant="secondary" className="text-[11px] font-normal gap-1 bg-primary/5 text-primary border-primary/15">
                        <GraduationCap className="w-3 h-3" />
                        {selectedClient.courseName}
                      </Badge>
                    </div>
                  )}
                </div>
              </div>
            ) : (
              <div className="space-y-1.5">
                <div className="flex gap-2">
                  <div className="relative flex-1">
                    <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground pointer-events-none" />
                    <Input
                      placeholder={t("payments.searchClientPlaceholder")}
                      value={searchQuery}
                      onChange={(e) => setSearchQuery(e.target.value)}
                      onKeyDown={(e) => {
                        if (e.key === "Enter") {
                          e.preventDefault();
                          handleSearchClient();
                        }
                      }}
                      className="pl-9 h-9 text-xs bg-background rounded-lg border-border/80 focus-visible:ring-1"
                    />
                  </div>
                  <Button
                    type="button"
                    variant="secondary"
                    size="sm"
                    disabled={searching || !searchQuery.trim()}
                    onClick={handleSearchClient}
                    className="h-9 px-3.5 text-xs font-semibold cursor-pointer rounded-lg shrink-0 gap-1.5"
                  >
                    {searching ? (
                      <Loader2 className="w-3.5 h-3.5 animate-spin" />
                    ) : (
                      <Search className="w-3.5 h-3.5" />
                    )}
                    <span>{t("common.search")}</span>
                  </Button>
                </div>
                <p className="text-[11px] text-muted-foreground px-0.5">
                  {t("payments.clientSearchHint")}
                </p>
              </div>
            )}
          </div>

          {/* STEP 2: ITEMS SELECTOR */}
          <div className="space-y-2.5">
            <Label className="text-xs font-bold uppercase tracking-wider text-muted-foreground flex items-center gap-1.5">
              <Receipt className="w-3.5 h-3.5 text-primary" />
              <span>2. {t("payments.paymentItems")}</span>
            </Label>

            <div className="grid grid-cols-1 gap-2.5">
              {/* Option A: Course Tuition */}
              <div
                onClick={() => setPayCourse(!payCourse)}
                className={cn(
                  "p-3.5 rounded-xl border transition-all cursor-pointer select-none bg-card",
                  payCourse
                    ? "border-primary/50 bg-primary/[0.03] ring-1 ring-primary/20 shadow-2xs"
                    : "border-border/70 hover:border-border hover:bg-muted/30 opacity-75"
                )}
              >
                <div className="flex items-center justify-between gap-3">
                  <div className="flex items-start gap-3 min-w-0">
                    <Checkbox
                      id="item-course"
                      checked={payCourse}
                      onCheckedChange={(v) => setPayCourse(Boolean(v))}
                      onClick={(e) => e.stopPropagation()}
                      className="mt-0.5 rounded-md data-[state=checked]:bg-primary"
                    />
                    <div className="space-y-0.5 min-w-0">
                      <label
                        htmlFor="item-course"
                        className="text-xs font-bold text-foreground cursor-pointer block truncate"
                      >
                        {selectedClient?.courseName
                          ? `${t("payments.typeTuition")}: ${selectedClient.courseName}`
                          : t("payments.typeTuition")}
                      </label>
                      <p className="text-[11px] text-muted-foreground">
                        {t("payments.courseTuitionDesc")}
                      </p>
                    </div>
                  </div>

                  {payCourse && (
                    <div
                      className="relative flex items-center w-28 shrink-0"
                      onClick={(e) => e.stopPropagation()}
                    >
                      <span className="absolute left-2.5 text-xs font-bold text-muted-foreground pointer-events-none">
                        €
                      </span>
                      <Input
                        type="number"
                        min="0"
                        step="any"
                        value={courseAmount === 0 ? "" : courseAmount}
                        placeholder="0.00"
                        onChange={(e) =>
                          setCourseAmount(e.target.value === "" ? 0 : Number(e.target.value))
                        }
                        className="pl-6 pr-2 h-8 text-xs font-mono font-bold text-right bg-background border-border rounded-lg"
                      />
                    </div>
                  )}
                </div>
              </div>

              {/* Option B: Registration Fee */}
              <div
                onClick={() => setPayRegistrationFee(!payRegistrationFee)}
                className={cn(
                  "p-3.5 rounded-xl border transition-all cursor-pointer select-none bg-card",
                  payRegistrationFee
                    ? "border-primary/50 bg-primary/[0.03] ring-1 ring-primary/20 shadow-2xs"
                    : "border-border/70 hover:border-border hover:bg-muted/30 opacity-75"
                )}
              >
                <div className="flex items-center justify-between gap-3">
                  <div className="flex items-start gap-3 min-w-0">
                    <Checkbox
                      id="item-fee"
                      checked={payRegistrationFee}
                      onCheckedChange={(v) => setPayRegistrationFee(Boolean(v))}
                      onClick={(e) => e.stopPropagation()}
                      className="mt-0.5 rounded-md data-[state=checked]:bg-primary"
                    />
                    <div className="space-y-0.5 min-w-0">
                      <label
                        htmlFor="item-fee"
                        className="text-xs font-bold text-foreground cursor-pointer flex items-center gap-1.5"
                      >
                        <span>{t("payments.typeMembership")}</span>
                        <ShieldCheck className="w-3.5 h-3.5 text-emerald-500" />
                      </label>
                      <p className="text-[11px] text-muted-foreground">
                        {t("payments.registrationFeeDesc")}
                      </p>
                    </div>
                  </div>

                  <span className="font-bold font-mono text-xs px-2.5 py-1 rounded-lg bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border border-emerald-500/20 shrink-0">
                    + €{registrationFeeAmount.toFixed(2)}
                  </span>
                </div>
              </div>
            </div>
          </div>

          {/* STEP 3: PAYMENT METHOD */}
          <div className="space-y-2">
            <Label className="text-xs font-bold uppercase tracking-wider text-muted-foreground flex items-center gap-1.5">
              <Wallet className="w-3.5 h-3.5 text-primary" />
              <span>3. {t("payments.paymentMethod")}</span>
            </Label>
            <div className="grid grid-cols-3 gap-2.5">
              {/* Cash */}
              <button
                type="button"
                onClick={() => setPaymentMethod(PaymentMethod.CASH)}
                className={cn(
                  "p-3 rounded-xl border flex flex-col items-center justify-center text-center gap-1.5 transition-all cursor-pointer",
                  paymentMethod === PaymentMethod.CASH
                    ? "border-primary bg-primary/10 text-primary shadow-xs ring-1 ring-primary/30"
                    : "border-border/70 hover:border-border hover:bg-muted/40 text-muted-foreground hover:text-foreground"
                )}
              >
                <Banknote className="w-4 h-4" />
                <span className="text-xs font-bold leading-none">{t("common.cash")}</span>
                <span className="text-[10px] text-muted-foreground leading-none">
                  {t("payments.cashDesk")}
                </span>
              </button>

              {/* POS */}
              <button
                type="button"
                onClick={() => setPaymentMethod(PaymentMethod.POS)}
                className={cn(
                  "p-3 rounded-xl border flex flex-col items-center justify-center text-center gap-1.5 transition-all cursor-pointer",
                  paymentMethod === PaymentMethod.POS
                    ? "border-primary bg-primary/10 text-primary shadow-xs ring-1 ring-primary/30"
                    : "border-border/70 hover:border-border hover:bg-muted/40 text-muted-foreground hover:text-foreground"
                )}
              >
                <CreditCard className="w-4 h-4" />
                <span className="text-xs font-bold leading-none">{t("common.card")}</span>
                <span className="text-[10px] text-muted-foreground leading-none">
                  {t("payments.posPhysical")}
                </span>
              </button>

              {/* Bank Transfer */}
              <button
                type="button"
                onClick={() => setPaymentMethod(PaymentMethod.BANK_TRANSFER)}
                className={cn(
                  "p-3 rounded-xl border flex flex-col items-center justify-center text-center gap-1.5 transition-all cursor-pointer",
                  paymentMethod === PaymentMethod.BANK_TRANSFER
                    ? "border-primary bg-primary/10 text-primary shadow-xs ring-1 ring-primary/30"
                    : "border-border/70 hover:border-border hover:bg-muted/40 text-muted-foreground hover:text-foreground"
                )}
              >
                <Building2 className="w-4 h-4" />
                <span className="text-xs font-bold leading-none">{t("common.transfer")}</span>
                <span className="text-[10px] text-muted-foreground leading-none">
                  {t("payments.bankTransferSub")}
                </span>
              </button>
            </div>
          </div>

          {/* TOTAL TO COLLECT SUMMARY BOX */}
          <div className="p-4 rounded-xl border border-primary/20 bg-gradient-to-br from-primary/10 via-primary/[0.04] to-muted/20 flex items-center justify-between shadow-2xs">
            <div className="space-y-0.5">
              <span className="text-xs font-bold uppercase tracking-wider text-muted-foreground flex items-center gap-1">
                <Sparkles className="w-3.5 h-3.5 text-primary" />
                {t("payments.totalToCollect")}
              </span>
              <p className="text-[11px] text-muted-foreground">
                {payCourse && payRegistrationFee
                  ? `${t("payments.typeTuition")} (${formatCurrency(courseAmount)}) + ${t("payments.typeMembership")} (${formatCurrency(registrationFeeAmount)})`
                  : payCourse
                  ? `${t("payments.typeTuition")}: ${formatCurrency(courseAmount)}`
                  : payRegistrationFee
                  ? `${t("payments.typeMembership")}: ${formatCurrency(registrationFeeAmount)}`
                  : "Nessuna voce selezionata"}
              </p>
            </div>
            <div className="text-right">
              <span className="text-2xl font-black font-mono tracking-tight text-foreground">
                {formatCurrency(totalPayable)}
              </span>
            </div>
          </div>

          {/* OPTIONAL NOTES */}
          <div className="space-y-1.5">
            <Label className="text-xs font-medium text-muted-foreground">
              {t("payments.optionalNotes")}
            </Label>
            <Textarea
              placeholder={t("payments.notesPlaceholder")}
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              className="h-16 text-xs bg-background rounded-lg border-border/80 resize-none"
            />
          </div>
        </div>

        {/* MODAL FOOTER */}
        <DialogFooter className="p-4 bg-muted/20 border-t border-border/60 flex items-center justify-between sm:justify-between">
          <Button
            type="button"
            variant="ghost"
            className="text-xs font-semibold cursor-pointer h-9 px-4 text-muted-foreground hover:text-foreground"
            onClick={() => onOpenChange(false)}
          >
            {t("common.cancel")}
          </Button>

          <Button
            type="button"
            disabled={submitting || totalPayable <= 0}
            onClick={handleSubmitCheckout}
            className="text-xs font-bold bg-primary text-primary-foreground h-9 px-5 rounded-lg shadow-xs cursor-pointer gap-1.5"
          >
            {submitting ? (
              <Loader2 className="w-4 h-4 animate-spin" />
            ) : (
              <CheckCircle2 className="w-4 h-4" />
            )}
            <span>
              {submitting
                ? t("common.loading")
                : `${t("payments.confirmAndPrint")} (${formatCurrency(totalPayable)})`}
            </span>
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
