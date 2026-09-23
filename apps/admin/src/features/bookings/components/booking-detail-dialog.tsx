import { useState } from "react";
import { useQueryClient } from "@tanstack/react-query";
import type { Booking } from "../types/booking";
import {
  BookingPaymentStatus,
  PaymentMethod,
  PaymentType,
  PaymentRecordStatus,
  PaymentProvider,
  PAYMENT_METHOD_DICTIONARY,
  PAYMENT_TYPE_DICTIONARY,
  PAYMENT_RECORD_STATUS_DICTIONARY,
  parsePaymentMethod,
  parsePaymentType,
} from "@atena/api-types";
import { usePayments } from "@/features/payments/hooks/use-payments";
import { useTranslation } from "@/i18n/context";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from "@/components/ui/dialog";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { toast } from "sonner";
import {
  User,
  Mail,
  Phone,
  CreditCard,
  Calendar,
  Clock,
  CheckCircle2,
  FileText,
  GraduationCap,
  Sparkles,
  Trash2,
  ExternalLink,
  Receipt,
  Copy,
  Check,
  Printer,
  MapPin,
  Tag,
} from "lucide-react";
import { format } from "date-fns";
import { it as dateLocaleIt, enUS as dateLocaleEn } from "date-fns/locale";

function formatScheduleText(
  days?: number[] | null,
  startTime?: string | null,
  endTime?: string | null,
  t?: (k: string) => string
) {
  if (!days || days.length === 0 || !startTime) {
    return t ? t("bookings.flexibleAgreed") : "Flexible / To be agreed";
  }
  const dayKeys: Record<number, string> = {
    1: "mon",
    2: "tue",
    3: "wed",
    4: "thu",
    5: "fri",
    6: "sat",
    7: "sun",
  };
  const dayNames = days
    .map((d) => (t && dayKeys[d] ? t(`weekdays.${dayKeys[d]}`) : `Day ${d}`))
    .join(", ");
  if (endTime) {
    return `${dayNames} ${startTime}-${endTime}`;
  }
  return `${dayNames} ${startTime}`;
}

interface BookingDetailDialogProps {
  booking: Booking | null;
  isOpen: boolean;
  onClose: () => void;
  onUpdateStatus?: (id: string, paymentStatus: number | string, scheduleStatus?: number | string) => void;
  onDelete?: (id: string) => Promise<boolean>;
}

export function BookingDetailDialog({
  booking,
  isOpen,
  onClose,
  onUpdateStatus,
  onDelete,
}: BookingDetailDialogProps) {
  const { t, locale } = useTranslation();
  const [confirmOpen, setConfirmOpen] = useState(false);
  const [copiedField, setCopiedField] = useState<string | null>(null);

  const handleCopy = (text: string, label: string) => {
    if (!text) return;
    navigator.clipboard.writeText(text);
    setCopiedField(text);
    toast.success(`${label} ${t("common.saved")}`);
    setTimeout(() => setCopiedField(null), 2000);
  };
  const [deleting, setDeleting] = useState(false);
  const [addPaymentOpen, setAddPaymentOpen] = useState(false);

  // New Payment Form State
  const [newPaymentAmount, setNewPaymentAmount] = useState("");
  const [newPaymentMethod, setNewPaymentMethod] = useState(String(PaymentMethod.CASH));
  const [newPaymentType, setNewPaymentType] = useState(String(PaymentType.COURSE_PAYMENT));
  const [newPaymentNotes, setNewPaymentNotes] = useState("");

  const queryClient = useQueryClient();

  const { payments, loading: paymentsLoading, createPayment, refresh: refreshPayments } = usePayments(
    booking?.id,
  );

  if (!booking) return null;

  const isDifferentStudent = booking.student_name && booking.purchaser_name !== booking.student_name;

  const formattedSchedule = formatScheduleText(
    booking.schedule_days,
    booking.start_time,
    booking.end_time,
    t
  );

  const activeDateLocale = locale === "it" ? dateLocaleIt : dateLocaleEn;
  const formattedDate = booking.created_at
    ? format(new Date(booking.created_at), "d MMMM yyyy HH:mm", { locale: activeDateLocale })
    : t("common.noData");

  const handleAddPayment = async () => {
    if (!newPaymentAmount || Number(newPaymentAmount) <= 0) return;
    await createPayment({
      bookingId: booking.id,
      amount: Number(newPaymentAmount),
      paymentMethod: Number(newPaymentMethod),
      type: Number(newPaymentType),
      notes: newPaymentNotes || undefined,
    });
    setNewPaymentAmount("");
    setNewPaymentNotes("");
    setAddPaymentOpen(false);
    refreshPayments();
    if (onUpdateStatus) {
      onUpdateStatus(booking.id, BookingPaymentStatus.PAID);
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={(open) => !open && onClose()}>
      <DialogContent className="sm:max-w-3xl max-w-3xl p-0 gap-0 overflow-hidden">
        {/* Header Bar */}
        <div className="p-6 pb-4 border-b bg-muted/20 space-y-3">
          <div className="flex items-center gap-2">
            <Badge variant="outline" className="font-mono text-xs text-muted-foreground bg-background">
              #{booking.id.slice(0, 8)}
            </Badge>
            {isDifferentStudent && (
              <Badge variant="secondary" className="bg-amber-50 text-amber-700 dark:bg-amber-950/30 dark:text-amber-400 font-medium">
                {t("bookings.forChildOrThirdParty")}
              </Badge>
            )}
          </div>

          <div>
            <DialogTitle className="text-xl font-bold tracking-tight text-foreground">
              {booking.course_name}
            </DialogTitle>
            <DialogDescription className="text-xs text-muted-foreground flex items-center gap-1.5 mt-1">
              <Calendar className="w-3.5 h-3.5" />
              <span>{t("bookings.orderedOn", { date: formattedDate })}</span>
            </DialogDescription>
          </div>
        </div>

        {/* Content Body */}
        <div className="p-6 space-y-6 max-h-[70vh] overflow-y-auto text-sm">
          {/* Section 1: Customer & Student Details */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {/* Acquirente */}
            <div className="rounded-lg border p-4 bg-card space-y-3">
              <div className="flex items-center gap-2 text-xs font-semibold text-muted-foreground uppercase tracking-wider">
                <User className="w-4 h-4 text-primary" />
                <span>{t("bookings.purchaserParent")}</span>
              </div>
              <div className="space-y-2 text-xs">
                <div>
                  <span className="text-[11px] text-muted-foreground block">{t("users.fullName")}</span>
                  <p className="font-semibold text-sm text-foreground">{booking.purchaser_name || t("common.noData")}</p>
                </div>
                <div className="grid grid-cols-1 gap-1.5 pt-1 border-t">
                  {booking.purchaser_email && (
                    <button
                      type="button"
                      onClick={() => handleCopy(booking.purchaser_email!, "Email")}
                      className="text-muted-foreground hover:text-primary flex items-center gap-2 transition-colors cursor-pointer text-left w-fit"
                      title={t("common.copy")}
                    >
                      <Mail className="w-3.5 h-3.5 text-primary shrink-0" />
                      <span className="font-medium text-foreground underline decoration-dashed underline-offset-2">
                        {booking.purchaser_email}
                      </span>
                      {copiedField === booking.purchaser_email ? (
                        <Check className="w-3 h-3 text-emerald-500 shrink-0" />
                      ) : (
                        <Copy className="w-3 h-3 opacity-40 shrink-0" />
                      )}
                    </button>
                  )}
                  {booking.purchaser_phone && (
                    <div className="flex items-center gap-2">
                      <button
                        type="button"
                        onClick={() => handleCopy(booking.purchaser_phone!, "Phone")}
                        className="text-muted-foreground hover:text-primary flex items-center gap-2 transition-colors cursor-pointer text-left w-fit"
                        title={t("common.copy")}
                      >
                        <Phone className="w-3.5 h-3.5 text-primary shrink-0" />
                        <span className="font-medium text-foreground underline decoration-dashed underline-offset-2">
                          {booking.purchaser_phone}
                        </span>
                        {copiedField === booking.purchaser_phone ? (
                          <Check className="w-3 h-3 text-emerald-500 shrink-0" />
                        ) : (
                          <Copy className="w-3 h-3 opacity-40 shrink-0" />
                        )}
                      </button>
                      <a
                        href={`https://wa.me/${booking.purchaser_phone.replace(/[^\d]/g, "")}`}
                        target="_blank"
                        rel="noreferrer"
                        className="inline-flex items-center text-[10px] text-emerald-600 dark:text-emerald-400 hover:underline font-semibold bg-emerald-500/10 px-1.5 py-0.5 rounded border border-emerald-500/20 gap-0.5 shrink-0"
                        title="WhatsApp"
                        onClick={(e) => e.stopPropagation()}
                      >
                        <span>WA</span>
                        <ExternalLink className="w-2.5 h-2.5 opacity-70" />
                      </a>
                    </div>
                  )}
                  {booking.purchaser_tax_code && (
                    <button
                      type="button"
                      onClick={() => handleCopy(booking.purchaser_tax_code!, "CF")}
                      className="text-muted-foreground hover:text-primary flex items-center gap-2 font-mono transition-colors cursor-pointer text-left w-fit"
                      title={t("common.copy")}
                    >
                      <FileText className="w-3.5 h-3.5 text-primary shrink-0" />
                      <span>
                        {t("bookings.taxCode")}: <strong className="text-foreground underline decoration-dashed underline-offset-2">{booking.purchaser_tax_code}</strong>
                      </span>
                      {copiedField === booking.purchaser_tax_code ? (
                        <Check className="w-3 h-3 text-emerald-500 shrink-0" />
                      ) : (
                        <Copy className="w-3 h-3 opacity-40 shrink-0" />
                      )}
                    </button>
                  )}
                </div>
              </div>
            </div>

            {/* Studente */}
            <div className="rounded-lg border p-4 bg-card space-y-3">
              <div className="flex items-center gap-2 text-xs font-semibold text-muted-foreground uppercase tracking-wider">
                <GraduationCap className="w-4 h-4 text-primary" />
                <span>{t("bookings.studentChild")}</span>
              </div>
              <div className="space-y-2 text-xs">
                <div>
                  <span className="text-[11px] text-muted-foreground block">{t("users.fullName")}</span>
                  <p className="font-semibold text-sm text-foreground">
                    {booking.student_name || booking.purchaser_name || t("common.noData")}
                  </p>
                </div>
                <div className="grid grid-cols-1 gap-1.5 pt-1 border-t">
                  {(booking.student_email || booking.purchaser_email) && (
                    <button
                      type="button"
                      onClick={() => handleCopy((booking.student_email || booking.purchaser_email)!, "Email")}
                      className="text-muted-foreground hover:text-primary flex items-center gap-2 transition-colors cursor-pointer text-left w-fit"
                      title={t("common.copy")}
                    >
                      <Mail className="w-3.5 h-3.5 text-primary shrink-0" />
                      <span className="font-medium text-foreground underline decoration-dashed underline-offset-2">
                        {booking.student_email || booking.purchaser_email}
                      </span>
                      {copiedField === (booking.student_email || booking.purchaser_email) ? (
                        <Check className="w-3 h-3 text-emerald-500 shrink-0" />
                      ) : (
                        <Copy className="w-3 h-3 opacity-40 shrink-0" />
                      )}
                    </button>
                  )}
                  {booking.student_phone && (
                    <div className="flex items-center gap-2">
                      <button
                        type="button"
                        onClick={() => handleCopy(booking.student_phone!, "Phone")}
                        className="text-muted-foreground hover:text-primary flex items-center gap-2 transition-colors cursor-pointer text-left w-fit"
                        title={t("common.copy")}
                      >
                        <Phone className="w-3.5 h-3.5 text-primary shrink-0" />
                        <span className="font-medium text-foreground underline decoration-dashed underline-offset-2">
                          {booking.student_phone}
                        </span>
                        {copiedField === booking.student_phone ? (
                          <Check className="w-3 h-3 text-emerald-500 shrink-0" />
                        ) : (
                          <Copy className="w-3 h-3 opacity-40 shrink-0" />
                        )}
                      </button>
                      <a
                        href={`https://wa.me/${booking.student_phone.replace(/[^\d]/g, "")}`}
                        target="_blank"
                        rel="noreferrer"
                        className="inline-flex items-center text-[10px] text-emerald-600 dark:text-emerald-400 hover:underline font-semibold bg-emerald-500/10 px-1.5 py-0.5 rounded border border-emerald-500/20 gap-0.5 shrink-0"
                        title="WhatsApp"
                        onClick={(e) => e.stopPropagation()}
                      >
                        <span>WA</span>
                        <ExternalLink className="w-2.5 h-2.5 opacity-70" />
                      </a>
                    </div>
                  )}
                  {booking.student_birth_date && (
                    <p className="text-muted-foreground flex items-center gap-2">
                      <Calendar className="w-3.5 h-3.5 text-primary shrink-0" />
                      <span>{t("bookings.birthDate")}: <strong className="text-foreground">{
                        new Date(booking.student_birth_date).toLocaleDateString(locale === "it" ? "it-IT" : "en-US", {
                          day: "2-digit",
                          month: "2-digit",
                          year: "numeric",
                        })
                      }</strong></span>
                    </p>
                  )}
                  {(booking.student_birth_place || booking.birth_place) && (
                    <p className="text-muted-foreground flex items-center gap-2">
                      <MapPin className="w-3.5 h-3.5 text-primary shrink-0" />
                      <span>{t("bookings.birthPlace")}: <strong className="text-foreground">{booking.student_birth_place || booking.birth_place}</strong></span>
                    </p>
                  )}
                  {booking.student_tax_code && (
                    <button
                      type="button"
                      onClick={() => handleCopy(booking.student_tax_code!, "CF")}
                      className="text-muted-foreground hover:text-primary flex items-center gap-2 font-mono transition-colors cursor-pointer text-left w-fit"
                      title={t("common.copy")}
                    >
                      <FileText className="w-3.5 h-3.5 text-primary shrink-0" />
                      <span>
                        {t("bookings.taxCode")}: <strong className="text-foreground underline decoration-dashed underline-offset-2">{booking.student_tax_code}</strong>
                      </span>
                      {copiedField === booking.student_tax_code ? (
                        <Check className="w-3 h-3 text-emerald-500 shrink-0" />
                      ) : (
                        <Copy className="w-3 h-3 opacity-40 shrink-0" />
                      )}
                    </button>
                  )}
                </div>
              </div>
            </div>
          </div>

          {/* Section 2: Financial Balance Summary */}
          {(() => {
            const fs = (booking as any).financial_summary;
            const paidSum = fs?.paid_sum ?? payments
              .filter((p) => p.status === PaymentRecordStatus.SUCCEEDED || p.status === "succeeded" || String(p.status) === "2")
              .reduce((sum, p) => sum + Number(p.amount || 0), 0);
            const totalTarget = fs?.total_target ?? Number(booking.amount_paid || booking.registration_fee || 30);
            const remaining = fs?.remaining ?? Math.max(0, totalTarget - paidSum);
            const registrationFeePaid = fs?.registration_fee_paid ??
              payments.some((p) => (parsePaymentType(p.type) === PaymentType.REGISTRATION_FEE || Number(p.amount) === 30) && (p.status === PaymentRecordStatus.SUCCEEDED || p.status === "succeeded" || String(p.status) === "2"));

            return (
              <div className="rounded-lg border p-4 bg-card space-y-3">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2 text-xs font-semibold text-muted-foreground uppercase tracking-wider">
                    <CreditCard className="w-4 h-4 text-primary" />
                    <span>{t("bookings.financialBalance")}</span>
                  </div>
                  {remaining > 0 ? (
                    <Badge variant="secondary" className="bg-rose-50 text-rose-700 dark:bg-rose-900/30 dark:text-rose-400 font-medium">
                      {t("common.overdue")}: €{remaining.toFixed(2)}
                    </Badge>
                  ) : (
                    <Badge variant="secondary" className="bg-emerald-50 text-emerald-700 dark:bg-emerald-900/30 dark:text-emerald-400 font-medium">
                      {t("bookings.fullSettled")}
                    </Badge>
                  )}
                </div>

                <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 pt-1 text-xs">
                  <div className="p-2.5 rounded-lg bg-muted/40 border space-y-1">
                    <span className="text-[10px] text-muted-foreground block font-medium uppercase">{t("bookings.totalAmount")}</span>
                    <p className="font-bold text-sm font-mono text-foreground">€{totalTarget.toFixed(2)}</p>
                  </div>
                  <div className="p-2.5 rounded-lg bg-emerald-500/10 border border-emerald-500/20 space-y-1">
                    <span className="text-[10px] text-emerald-700 dark:text-emerald-400 block font-medium uppercase">{t("bookings.paidSum")}</span>
                    <p className="font-bold text-sm font-mono text-emerald-600 dark:text-emerald-400">€{paidSum.toFixed(2)}</p>
                  </div>
                  <div className={`p-2.5 rounded-lg border space-y-1 ${remaining > 0 ? "bg-rose-500/10 border-rose-500/20 text-rose-600 dark:text-rose-400" : "bg-muted/40 text-muted-foreground"}`}>
                    <span className="text-[10px] block font-medium uppercase">{t("bookings.remainingToPay")}</span>
                    <p className="font-bold text-sm font-mono">€{remaining.toFixed(2)}</p>
                  </div>
                  <div className="p-2.5 rounded-lg bg-amber-500/10 border border-amber-500/20 space-y-1">
                    <span className="text-[10px] text-amber-700 dark:text-amber-400 block font-medium uppercase truncate">{t("courses.registrationFee")}</span>
                    <p className="font-bold text-xs font-mono text-amber-600 dark:text-amber-400 truncate">
                      {registrationFeePaid ? t("bookings.feePaid") : t("bookings.feePending")}
                    </p>
                  </div>
                </div>

                {booking.promo_code && (
                  <div className="flex items-center gap-2 text-xs text-emerald-700 dark:text-emerald-400 bg-emerald-50 dark:bg-emerald-950/40 p-2.5 rounded-lg border border-emerald-200 dark:border-emerald-800">
                    <Tag className="w-4 h-4 shrink-0" />
                    <span>{t("bookings.promoApplied")} <strong className="font-mono font-bold">{booking.promo_code}</strong> {Number(booking.discount_amount) > 0 ? `(${t("bookings.discount")}: -€${Number(booking.discount_amount).toFixed(2)})` : ''}</span>
                  </div>
                )}

                {remaining > 0 && (
                  <div className="pt-2 flex justify-end border-t border-border/50">
                    <Button
                      size="sm"
                      className="bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs gap-1.5 cursor-pointer shadow-2xs"
                      onClick={() => {
                        setNewPaymentAmount(remaining.toFixed(2));
                        setAddPaymentOpen(true);
                      }}
                    >
                      <CreditCard className="w-4 h-4" />
                      <span>{t("bookings.recordPaymentAmount", { amount: remaining.toFixed(2) })}</span>
                    </Button>
                  </div>
                )}
              </div>
            );
          })()}

          {/* Section 3: Schedule */}
          <div className="rounded-lg border p-4 bg-card space-y-3">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2 text-xs font-semibold text-muted-foreground uppercase tracking-wider">
                <Clock className="w-4 h-4 text-primary" />
                <span>{t("bookings.scheduleAndCalendar")}</span>
              </div>
              <Button
                variant="outline"
                size="sm"
                className="h-7 text-xs gap-1.5 cursor-pointer font-medium hover:bg-primary/10 hover:text-primary transition-colors border-primary/20"
                onClick={() => {
                  onClose();
                  window.location.href = `/presenze?booking_id=${booking.id}`;
                }}
              >
                <Calendar className="w-3.5 h-3.5 text-primary shrink-0" />
                <span>{t("bookings.viewLessonsAndAttendance")}</span>
              </Button>
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs">
              <div className="space-y-0.5">
                <span className="text-muted-foreground">{t("bookings.schedulingStatus")}</span>
                <p className="font-semibold text-foreground">
                  {booking.scheduling_status === "confirmed" || booking.scheduling_status === "scheduled"
                    ? t("common.confirmed")
                    : t("bookings.flexibleAgreed")}
                </p>
              </div>
              <div className="space-y-0.5">
                <span className="text-muted-foreground">{t("bookings.timeFrequency")}</span>
                <p className="font-semibold text-foreground">{formattedSchedule}</p>
              </div>
            </div>
          </div>

          {/* Section 4: Payments Table & History (Supabase `payments`) */}
          <div className="rounded-lg border p-4 bg-card space-y-3">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2 text-xs font-semibold text-muted-foreground uppercase tracking-wider">
                <Receipt className="w-4 h-4 text-primary" />
                <span>{t("bookings.transactionHistory")}</span>
              </div>

              <Button
                size="sm"
                variant="ghost"
                className="h-7 text-xs font-semibold text-primary hover:underline cursor-pointer gap-1"
                onClick={() => {
                  onClose();
                  window.location.href = "/pagamenti";
                }}
              >
                {t("bookings.manageInPayments")} ↗
              </Button>
            </div>

            {paymentsLoading ? (
              <div className="py-4 text-center text-xs text-muted-foreground">
                {t("bookings.loadingTransactions")}
              </div>
            ) : payments.length > 0 ? (
              <div className="space-y-2 border-t pt-3">
                {payments.map((p) => {
                  const pMethod = p.paymentMethod ?? p.payment_method;
                  const parsedMethod = parsePaymentMethod(pMethod);
                  const pMethodLabel =
                    locale === "it"
                      ? PAYMENT_METHOD_DICTIONARY[parsedMethod]?.label_it || "Contanti"
                      : PAYMENT_METHOD_DICTIONARY[parsedMethod]?.label_en || "Cash";

                  const parsedType = parsePaymentType(p.type);
                  const pTypeLabel =
                    parsedType === PaymentType.REGISTRATION_FEE
                      ? t("payments.typeMembership")
                      : parsedType === PaymentType.SINGLE_LESSON
                        ? t("courses.individual")
                        : parsedType === PaymentType.DEPOSIT
                          ? t("payments.typeDeposit")
                          : parsedType === PaymentType.INSTALLMENT
                            ? t("payments.typeInstallment")
                            : parsedType === PaymentType.REFUND
                              ? t("payments.typeRefund")
                              : t("payments.typeTuition");

                  const isSucceeded =
                    p.status === PaymentRecordStatus.SUCCEEDED ||
                    p.status === "succeeded" ||
                    String(p.status) === "2";
                  const isPending =
                    p.status === PaymentRecordStatus.PENDING ||
                    p.status === "pending" ||
                    String(p.status) === "1";
                  const statusLabel = isSucceeded
                    ? `✓ ${t("common.completed")}`
                    : isPending
                      ? `⏳ ${t("common.pending")}`
                      : t("common.failed");

                  const dateVal = p.createdAt || p.created_at;
                  const txId = p.providerTransactionId || p.provider_transaction_id;
                  return (
                    <div
                      key={p.id}
                      className="flex flex-col sm:flex-row sm:items-center justify-between p-3 rounded-md bg-muted/40 border text-xs gap-2"
                    >
                      <div className="space-y-0.5">
                        <div className="flex items-center gap-2">
                          <span className="font-semibold text-foreground">
                            {pTypeLabel}
                          </span>
                          <Badge
                            variant="secondary"
                            className={
                              isSucceeded
                                ? "bg-emerald-500/15 text-emerald-600 dark:text-emerald-400 border-emerald-500/30 text-[10px] font-semibold"
                                : "bg-amber-500/15 text-amber-600 dark:text-amber-400 border-amber-500/30 text-[10px] font-semibold"
                            }
                          >
                            {statusLabel}
                          </Badge>
                        </div>
                        <div className="text-[11px] text-muted-foreground flex items-center gap-2">
                          <span className="capitalize">{pMethodLabel}</span>
                          <span>•</span>
                          <span>
                            {dateVal
                              ? new Date(dateVal).toLocaleDateString(locale === "it" ? "it-IT" : "en-US", {
                                day: "2-digit",
                                month: "short",
                                year: "numeric",
                                hour: "2-digit",
                                minute: "2-digit",
                              })
                              : t("common.noData")}
                          </span>
                          {p.notes && (
                            <>
                              <span>•</span>
                              <span className="italic">{p.notes}</span>
                            </>
                          )}
                        </div>
                      </div>

                      <div className="flex items-center gap-3 justify-between sm:justify-end">
                        {txId && (
                          <a
                            href={`https://dashboard.stripe.com/payments/${txId}`}
                            target="_blank"
                            rel="noreferrer"
                            className="inline-flex items-center gap-1 text-[11px] text-primary hover:underline font-mono"
                          >
                            <span>{txId.slice(0, 14)}...</span>
                            <ExternalLink className="w-3 h-3" />
                          </a>
                        )}
                        <span className="font-bold text-sm text-foreground font-mono">
                          €{Number(p.amount).toFixed(2)}
                        </span>
                      </div>
                    </div>
                  );
                })}
              </div>
            ) : (
              <div className="py-4 text-center text-xs text-muted-foreground border-t pt-3">
                {t("bookings.noTransactionsFound")}
              </div>
            )}
          </div>

          {/* Section 5: Notes */}
          {booking.notes && (
            <div className="rounded-lg border bg-amber-50/50 dark:bg-amber-950/10 border-amber-200 dark:border-amber-900/30 p-3.5 text-xs space-y-1">
              <p className="font-semibold text-amber-800 dark:text-amber-400 flex items-center gap-1.5">
                <Sparkles className="w-3.5 h-3.5" />
                <span>{t("bookings.attachedNotes")}</span>
              </p>
              <p className="text-amber-900 dark:text-amber-300 leading-relaxed">{booking.notes}</p>
            </div>
          )}

          {/* Section 6: Dynamic Custom Form Answers */}
          {booking.custom_fields &&
            typeof booking.custom_fields === "object" &&
            Object.keys(booking.custom_fields).length > 0 && (
              <div className="rounded-lg border bg-blue-50/50 dark:bg-blue-950/10 border-blue-200 dark:border-blue-900/30 p-3.5 text-xs space-y-2">
                <p className="font-semibold text-blue-900 dark:text-blue-300 flex items-center gap-1.5">
                  <FileText className="w-3.5 h-3.5 text-blue-600 dark:text-blue-400" />
                  <span>{locale === "en" ? "Custom Form Answers" : "Risposte Modulo Personalizzato"}</span>
                </p>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 pt-1 border-t border-blue-200/60 dark:border-blue-900/40">
                  {Object.entries(booking.custom_fields).map(([key, val]) => {
                    if (val === null || val === undefined || val === "") return null;
                    const displayVal = typeof val === "object" ? JSON.stringify(val) : String(val);
                    const formattedKey = key.replace(/_/g, " ").replace(/\b\w/g, (l) => l.toUpperCase());
                    return (
                      <div key={key} className="bg-white/80 dark:bg-card/80 p-2 rounded-md border border-blue-100 dark:border-blue-900/20">
                        <span className="text-[10px] font-semibold text-muted-foreground uppercase tracking-wider block">
                          {formattedKey}
                        </span>
                        <span className="font-medium text-foreground text-xs break-words">
                          {displayVal}
                        </span>
                      </div>
                    );
                  })}
                </div>
              </div>
            )}
        </div>

        {/* Single Row Footer Bar */}
        <div className="p-4 bg-muted/20 border-t flex flex-col-reverse sm:flex-row sm:items-center sm:justify-between gap-3">
          <div className="flex items-center gap-2 flex-wrap">
            {payments.some((p) => {
              const m = p.paymentMethod ?? p.payment_method;
              const prov = p.provider;
              return (
                m === PaymentMethod.STRIPE ||
                m === "stripe" ||
                String(m) === "1" ||
                prov === PaymentProvider.STRIPE ||
                prov === "stripe" ||
                String(prov) === "1" ||
                !!(p.providerTransactionId || p.provider_transaction_id)
              );
            }) ? (
              <a
                href="https://dashboard.stripe.com/payments"
                target="_blank"
                rel="noreferrer"
                className="inline-flex items-center"
              >
                <Button size="sm" variant="outline" className="font-medium text-xs cursor-pointer h-9 gap-1.5">
                  Stripe Dashboard <ExternalLink className="w-3.5 h-3.5 text-muted-foreground" />
                </Button>
              </a>
            ) : (
              <Button
                size="sm"
                variant="outline"
                className="font-medium text-xs cursor-pointer h-9 gap-1.5 border-border"
                onClick={() => {
                  window.print();
                }}
              >
                <Printer className="w-3.5 h-3.5 text-muted-foreground" />
                <span>{t("bookings.printReceipt")}</span>
              </Button>
            )}
          </div>

          <div className="flex items-center gap-2 justify-end">
            {onDelete && (
              <Button
                size="sm"
                variant="ghost"
                className="font-medium text-xs cursor-pointer h-9 text-destructive hover:bg-destructive/10 hover:text-destructive"
                onClick={() => setConfirmOpen(true)}
              >
                <Trash2 className="w-4 h-4 mr-1.5" />
                {t("common.delete")}
              </Button>
            )}
            <Button variant="outline" size="sm" onClick={onClose} className="font-medium text-xs cursor-pointer h-9">
              {t("common.close")}
            </Button>
          </div>
        </div>
      </DialogContent>

      {/* Manual Payment Modal */}
      <Dialog open={addPaymentOpen} onOpenChange={setAddPaymentOpen}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>{t("payments.recordManualPayment")}</DialogTitle>
            <DialogDescription>
              {t("payments.recordManualPaymentDesc")}
            </DialogDescription>
          </DialogHeader>

          <div className="space-y-4 py-2">
            <div className="space-y-2">
              <Label className="text-xs font-medium">{t("payments.amountEuro")}</Label>
              <Input
                type="number"
                step="0.01"
                placeholder="150.00"
                value={newPaymentAmount}
                onChange={(e) => setNewPaymentAmount(e.target.value)}
              />
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label className="text-xs font-medium">{t("payments.paymentMethod")}</Label>
                <Select value={newPaymentMethod} onValueChange={setNewPaymentMethod}>
                  <SelectTrigger className="cursor-pointer">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value={String(PaymentMethod.CASH)}>{t("common.cash")}</SelectItem>
                    <SelectItem value={String(PaymentMethod.POS)}>{t("common.card")}</SelectItem>
                    <SelectItem value={String(PaymentMethod.BANK_TRANSFER)}>{t("common.transfer")}</SelectItem>
                    <SelectItem value={String(PaymentMethod.STRIPE)}>Stripe Online</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-2">
                <Label className="text-xs font-medium">{t("payments.paymentType")}</Label>
                <Select value={newPaymentType} onValueChange={setNewPaymentType}>
                  <SelectTrigger className="cursor-pointer">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value={String(PaymentType.COURSE_PAYMENT)}>{t("payments.typeTuition")}</SelectItem>
                    <SelectItem value={String(PaymentType.REGISTRATION_FEE)}>{t("payments.typeMembership")}</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>

            <div className="space-y-2">
              <Label className="text-xs font-medium">{t("payments.optionalNotes")}</Label>
              <Input
                placeholder="..."
                value={newPaymentNotes}
                onChange={(e) => setNewPaymentNotes(e.target.value)}
              />
            </div>
          </div>

          <DialogFooter>
            <Button variant="outline" size="sm" onClick={() => setAddPaymentOpen(false)}>
              {t("common.cancel")}
            </Button>
            <Button size="sm" onClick={handleAddPayment} className="cursor-pointer">
              {t("payments.savePayment")}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Delete Confirmation Alert */}
      <AlertDialog open={confirmOpen} onOpenChange={setConfirmOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>{t("bookings.deleteBookingTitle")}</AlertDialogTitle>
            <AlertDialogDescription>
              {t("bookings.deleteBookingDesc")}
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel disabled={deleting}>{t("common.cancel")}</AlertDialogCancel>
            <AlertDialogAction
              disabled={deleting}
              className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
              onClick={async (e) => {
                e.preventDefault();
                if (!onDelete) return;
                setDeleting(true);
                const ok = await onDelete(booking.id);
                setDeleting(false);
                if (ok) setConfirmOpen(false);
              }}
            >
              {deleting ? t("common.loading") : t("common.delete")}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </Dialog>
  );
}
