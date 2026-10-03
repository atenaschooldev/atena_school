"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Badge } from "@/components/ui/badge";
import { CreditCard, Banknote, Building2, ShieldCheck, CheckCircle2, Loader2, Sparkles } from "lucide-react";
import { cn } from "@/lib/utils";
import { useTranslation } from "@/i18n/context";
import type { Membership } from "../types";

interface PayMembershipDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  membership: Membership | null;
  onConfirm: (paymentMethod: string, amount: number) => Promise<void>;
}

export function PayMembershipDialog({
  open,
  onOpenChange,
  membership,
  onConfirm,
}: PayMembershipDialogProps) {
  const { t } = useTranslation();
  const [selectedMethod, setSelectedMethod] = useState<string>("cash");
  const [submitting, setSubmitting] = useState(false);

  if (!membership) return null;

  const studentName =
    membership.studentName ||
    membership.student_name ||
    (membership as any).student?.full_name ||
    "Studente";

  const taxCode =
    membership.studentTaxCode ||
    membership.student_tax_code ||
    membership.taxCode ||
    (membership as any).tax_code ||
    "";

  const amount = membership.amount != null ? Number(membership.amount) : 30.0;
  const academicYear = membership.academicYear || (membership as any).academic_year || "2026/2027";

  const handleSubmit = async () => {
    try {
      setSubmitting(true);
      await onConfirm(selectedMethod, amount);
      onOpenChange(false);
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[480px] p-0 overflow-hidden rounded-2xl border-border/80 shadow-2xl">
        <DialogHeader className="p-5 pb-4 bg-muted/20 border-b border-border/60">
          <div className="flex items-center justify-between gap-3">
            <div className="flex items-center gap-3 min-w-0">
              <div className="w-10 h-10 rounded-xl bg-emerald-500/10 flex items-center justify-center border border-emerald-500/20 text-emerald-600 dark:text-emerald-400 shrink-0 shadow-2xs">
                <ShieldCheck className="w-5 h-5" />
              </div>
              <div className="space-y-0.5 min-w-0">
                <DialogTitle className="text-base font-bold text-foreground">
                  Registra Incasso Quota
                </DialogTitle>
                <DialogDescription className="text-xs text-muted-foreground">
                  Conferma il pagamento della quota associativa per attivare la tessera.
                </DialogDescription>
              </div>
            </div>

            <Badge
              variant="outline"
              className="font-mono font-bold text-xs bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border-emerald-500/20 px-2.5 py-1 rounded-lg shrink-0"
            >
              €{amount.toFixed(2)}
            </Badge>
          </div>
        </DialogHeader>

        <div className="p-5 space-y-4 text-xs">
          {/* Student details card */}
          <div className="p-3.5 bg-muted/20 rounded-xl border border-border/70 space-y-2">
            <div className="flex items-center justify-between">
              <span className="text-muted-foreground font-medium">Socio / Studente:</span>
              <span className="font-bold text-foreground text-sm">{studentName}</span>
            </div>
            {taxCode && (
              <div className="flex items-center justify-between">
                <span className="text-muted-foreground font-medium">Codice Fiscale:</span>
                <span className="font-mono font-semibold text-foreground uppercase">{taxCode}</span>
              </div>
            )}
            <div className="flex items-center justify-between">
              <span className="text-muted-foreground font-medium">Anno Accademico:</span>
              <Badge variant="outline" className="font-mono text-xs border-border/60">
                {academicYear}
              </Badge>
            </div>
          </div>

          {/* Payment Method Selector */}
          <div className="space-y-2">
            <label className="text-xs font-bold uppercase tracking-wider text-muted-foreground flex items-center gap-1.5">
              <CreditCard className="w-3.5 h-3.5 text-primary" />
              <span>Metodo di Pagamento Ricevuto</span>
            </label>

            <div className="grid grid-cols-3 gap-2">
              <button
                type="button"
                onClick={() => setSelectedMethod("cash")}
                className={cn(
                  "p-3 rounded-xl border flex flex-col items-center justify-center text-center gap-1.5 transition-all cursor-pointer",
                  selectedMethod === "cash"
                    ? "border-emerald-500/60 bg-emerald-500/10 text-emerald-700 dark:text-emerald-300 shadow-xs ring-1 ring-emerald-500/30 font-bold"
                    : "border-border/70 hover:border-border hover:bg-muted/40 text-muted-foreground"
                )}
              >
                <Banknote className="w-4 h-4 text-emerald-600" />
                <span className="text-xs">Contanti</span>
              </button>

              <button
                type="button"
                onClick={() => setSelectedMethod("card")}
                className={cn(
                  "p-3 rounded-xl border flex flex-col items-center justify-center text-center gap-1.5 transition-all cursor-pointer",
                  selectedMethod === "card"
                    ? "border-primary bg-primary/10 text-primary shadow-xs ring-1 ring-primary/30 font-bold"
                    : "border-border/70 hover:border-border hover:bg-muted/40 text-muted-foreground"
                )}
              >
                <CreditCard className="w-4 h-4 text-primary" />
                <span className="text-xs">Carta / POS</span>
              </button>

              <button
                type="button"
                onClick={() => setSelectedMethod("transfer")}
                className={cn(
                  "p-3 rounded-xl border flex flex-col items-center justify-center text-center gap-1.5 transition-all cursor-pointer",
                  selectedMethod === "transfer"
                    ? "border-blue-500/60 bg-blue-500/10 text-blue-700 dark:text-blue-300 shadow-xs ring-1 ring-blue-500/30 font-bold"
                    : "border-border/70 hover:border-border hover:bg-muted/40 text-muted-foreground"
                )}
              >
                <Building2 className="w-4 h-4 text-blue-600" />
                <span className="text-xs">Bonifico</span>
              </button>
            </div>
          </div>

          {/* Info note */}
          <div className="p-3 rounded-xl border border-emerald-500/20 bg-emerald-500/5 text-emerald-700 dark:text-emerald-300 flex items-start gap-2">
            <Sparkles className="w-4 h-4 text-emerald-500 shrink-0 mt-0.5" />
            <p className="text-[11px] leading-relaxed">
              La tessera verrà attivata immediatamente con assegnazione del numero progressivo e la transazione finanziaria verrà registrata in contabilità.
            </p>
          </div>
        </div>

        <DialogFooter className="p-4 bg-muted/20 border-t border-border/60 flex items-center justify-between sm:justify-between">
          <Button
            type="button"
            variant="ghost"
            className="text-xs font-semibold cursor-pointer h-9 px-4 text-muted-foreground hover:text-foreground"
            onClick={() => onOpenChange(false)}
          >
            {t("common.cancel") || "Annulla"}
          </Button>

          <Button
            type="button"
            disabled={submitting}
            onClick={handleSubmit}
            className="text-xs font-bold bg-emerald-600 hover:bg-emerald-700 text-white h-9 px-5 rounded-lg shadow-xs cursor-pointer gap-1.5"
          >
            {submitting ? (
              <Loader2 className="w-4 h-4 animate-spin" />
            ) : (
              <CheckCircle2 className="w-4 h-4" />
            )}
            <span>
              {submitting ? "Registrazione..." : `Conferma Incasso (€${amount.toFixed(2)})`}
            </span>
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
