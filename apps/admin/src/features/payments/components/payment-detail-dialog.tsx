"use client";

import type { Payment } from "../types";
import {
  PaymentMethod,
  PaymentType,
  PaymentRecordStatus,
  PaymentProvider,
  PAYMENT_METHOD_DICTIONARY,
  PAYMENT_TYPE_DICTIONARY,
  PAYMENT_RECORD_STATUS_DICTIONARY,
  PAYMENT_PROVIDER_DICTIONARY,
} from "@atena/api-types";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from "@/components/ui/dialog";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { useNavigate } from "react-router-dom";
import {
  Receipt,
  Calendar,
  ExternalLink,
  FileText,
  ShoppingBag,
  ArrowRight,
} from "lucide-react";
import { format } from "date-fns";
import { it as dateLocaleIt, enUS as dateLocaleEn } from "date-fns/locale";
import { useTranslation } from "@/i18n/context";

interface PaymentDetailDialogProps {
  payment: Payment | null;
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export function PaymentDetailDialog({
  payment,
  open,
  onOpenChange,
}: PaymentDetailDialogProps) {
  const navigate = useNavigate();
  const { t, locale } = useTranslation();

  if (!payment) return null;

  const isSucceeded = Number(payment.status) === PaymentRecordStatus.SUCCEEDED;
  const dateVal = payment.createdAt || payment.created_at;
  const pMethod = payment.paymentMethod ?? payment.payment_method;
  const pTxId = payment.providerTransactionId || payment.provider_transaction_id;
  const bId = payment.bookingId || payment.booking_id;

  const activeDateLocale = locale === "it" ? dateLocaleIt : dateLocaleEn;
  const formattedDate = dateVal
    ? format(new Date(dateVal), "d MMMM yyyy HH:mm", { locale: activeDateLocale })
    : t("common.noData");

  const pTypeNum = Number(payment.type) as PaymentType;
  const typeLabel =
    pTypeNum === PaymentType.REGISTRATION_FEE
      ? t("payments.typeMembership")
      : pTypeNum === PaymentType.SINGLE_LESSON
        ? t("courses.individual")
        : pTypeNum === PaymentType.DEPOSIT
          ? t("payments.typeDeposit")
          : pTypeNum === PaymentType.INSTALLMENT
            ? t("payments.typeInstallment")
            : pTypeNum === PaymentType.REFUND
              ? t("payments.typeRefund")
              : t("payments.typeTuition");

  const methodLabel =
    locale === "it"
      ? PAYMENT_METHOD_DICTIONARY[Number(pMethod) as PaymentMethod]?.label_it || "Contanti"
      : PAYMENT_METHOD_DICTIONARY[Number(pMethod) as PaymentMethod]?.label_en || "Cash";

  const providerLabel =
    locale === "it"
      ? PAYMENT_PROVIDER_DICTIONARY[Number(payment.provider) as PaymentProvider]?.label_it || "Manuale"
      : PAYMENT_PROVIDER_DICTIONARY[Number(payment.provider) as PaymentProvider]?.label_en || "Manual";

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-md p-0 gap-0 overflow-hidden">
        <div className="p-6 pb-4 border-b bg-muted/20 space-y-3">
          <div className="flex items-center justify-between gap-2">
            <Badge variant="outline" className="font-mono text-xs text-muted-foreground bg-background">
              #{payment.id.slice(0, 8)}
            </Badge>

            <Badge
              variant="secondary"
              className={
                isSucceeded
                  ? "text-emerald-600 bg-emerald-50 dark:text-emerald-400 dark:bg-emerald-900/20 font-medium"
                  : "text-amber-600 bg-amber-50 dark:text-amber-400 dark:bg-amber-900/20 font-medium"
              }
            >
              {isSucceeded
                ? t("common.paid")
                : t("common.pending")}
            </Badge>
          </div>

          <div>
            <DialogTitle className="text-xl font-bold tracking-tight text-foreground flex items-center gap-2">
              <Receipt className="w-5 h-5 text-primary shrink-0" />
              <span>{typeLabel}</span>
            </DialogTitle>
            <DialogDescription className="text-xs text-muted-foreground flex items-center gap-1.5 mt-1">
              <Calendar className="w-3.5 h-3.5" />
              <span>{t("payments.registeredOn", { date: formattedDate })}</span>
            </DialogDescription>
          </div>
        </div>

        <div className="p-6 space-y-4 text-xs">
          <div className="rounded-lg border p-4 bg-card space-y-3">
            <div className="flex justify-between items-center border-b pb-2">
              <span className="text-muted-foreground">{t("payments.transactionAmount")}</span>
              <span className="font-bold text-lg text-primary font-mono">
                €{Number(payment.amount).toFixed(2)}
              </span>
            </div>

            <div className="space-y-1.5 pt-1">
              <div className="flex justify-between items-center">
                <span className="text-muted-foreground">{t("payments.paymentMethod")}:</span>
                <span className="font-semibold text-foreground capitalize">
                  {methodLabel}
                </span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-muted-foreground">Provider:</span>
                <span className="font-semibold text-foreground capitalize">
                  {providerLabel}
                </span>
              </div>
              {pTxId && (
                <div className="flex justify-between items-center font-mono">
                  <span className="text-muted-foreground">Transaction ID:</span>
                  <span className="font-bold text-foreground text-[11px]">
                    {pTxId}
                  </span>
                </div>
              )}
            </div>
          </div>

          {bId && (
            <div className="rounded-lg border p-3.5 bg-primary/5 border-primary/20 space-y-2">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-1.5 font-medium text-foreground">
                  <ShoppingBag className="w-4 h-4 text-primary shrink-0" />
                  <span>{t("payments.referenceOrder")}</span>
                </div>
                <span className="font-mono text-xs font-bold text-primary">#{bId.slice(0, 8)}</span>
              </div>
              <Button
                variant="default"
                size="sm"
                className="w-full text-xs h-8 cursor-pointer gap-1.5 mt-1"
                onClick={() => {
                  onOpenChange(false);
                  navigate(`/prenotazioni?id=${bId}`);
                }}
              >
                {t("payments.viewOrderDetails")} <ArrowRight className="w-3.5 h-3.5" />
              </Button>
            </div>
          )}

          {payment.notes && (
            <div className="rounded-lg border bg-muted/40 p-3 space-y-1">
              <span className="font-semibold text-foreground flex items-center gap-1.5">
                <FileText className="w-3.5 h-3.5 text-primary" />
                {t("payments.optionalNotes")}:
              </span>
              <p className="text-muted-foreground leading-relaxed">{payment.notes}</p>
            </div>
          )}
        </div>

        <div className="p-4 bg-muted/20 border-t flex items-center justify-between">
          {pTxId ? (
            <a
              href={`https://dashboard.stripe.com/payments/${pTxId}`}
              target="_blank"
              rel="noreferrer"
              className="inline-flex items-center"
            >
              <Button size="sm" variant="outline" className="font-medium text-xs cursor-pointer gap-1.5">
                Stripe Dashboard <ExternalLink className="w-3.5 h-3.5 text-muted-foreground" />
              </Button>
            </a>
          ) : (
            <div />
          )}

          <Button variant="outline" size="sm" onClick={() => onOpenChange(false)} className="font-medium text-xs cursor-pointer">
            {t("common.close")}
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
}
