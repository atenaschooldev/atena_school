"use client";

import { useState } from "react";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Banknote, CreditCard, Building2, CheckCircle2, Clock, X } from "lucide-react";
import type { LessonAttendanceItem } from "../types";

interface QuickLessonPaymentDialogProps {
  item: LessonAttendanceItem | null;
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onPay: (lessonId: string, paymentMethod: string, amount: number) => Promise<any>;
}

export function QuickLessonPaymentDialog({
  item,
  open,
  onOpenChange,
  onPay,
}: QuickLessonPaymentDialogProps) {
  const [submitting, setSubmitting] = useState(false);

  if (!item) return null;

  const price = item.price_per_lesson || 25;
  const startTime = new Date(item.starts_at).toLocaleTimeString("it-IT", {
    hour: "2-digit",
    minute: "2-digit",
  });

  const handlePayment = async (method: string) => {
    setSubmitting(true);
    try {
      await onPay(item.id, method, price);
      onOpenChange(false);
    } catch (err) {
      console.error(err);
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[460px]">
        <DialogHeader>
          <div className="flex items-center gap-2 text-emerald-600 dark:text-emerald-400">
            <CheckCircle2 className="w-5 h-5" />
            <DialogTitle>Presenza Registrata — Incasso Lezione</DialogTitle>
          </div>
          <DialogDescription>
            Lo studente <span className="font-bold text-foreground">{item.student_name}</span> è stato segnato come <span className="font-semibold text-emerald-600">Presente</span> ({startTime}).
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-4 py-2">
          {/* Amount Due Box */}
          <div className="bg-emerald-50/60 dark:bg-emerald-950/30 border border-emerald-500/30 rounded-xl p-4 flex items-center justify-between">
            <div>
              <p className="text-xs text-muted-foreground font-medium">Importo Lezione Singola</p>
              <p className="text-xs text-muted-foreground mt-0.5">{item.course_name}</p>
            </div>
            <div className="text-right">
              <span className="text-2xl font-bold text-emerald-600 dark:text-emerald-400">€{price}</span>
            </div>
          </div>

          <p className="text-xs font-semibold text-muted-foreground">
            Seleziona il metodo di pagamento per chiudere l'incasso:
          </p>

          {/* Quick Payment Action Buttons */}
          <div className="grid grid-cols-1 gap-2.5">
            <Button
              variant="outline"
              onClick={() => handlePayment("cash")}
              disabled={submitting}
              className="h-12 justify-between border-emerald-500/30 hover:bg-emerald-50 dark:hover:bg-emerald-950/40 text-emerald-700 dark:text-emerald-300 font-semibold cursor-pointer"
            >
              <div className="flex items-center gap-2.5">
                <div className="p-2 rounded-md bg-emerald-500/10">
                  <Banknote className="w-4 h-4 text-emerald-600" />
                </div>
                <span>Contanti (In Cassa)</span>
              </div>
              <span className="font-bold text-sm">€{price}</span>
            </Button>

            <Button
              variant="outline"
              onClick={() => handlePayment("pos")}
              disabled={submitting}
              className="h-12 justify-between border-blue-500/30 hover:bg-blue-50 dark:hover:bg-blue-950/40 text-blue-700 dark:text-blue-300 font-semibold cursor-pointer"
            >
              <div className="flex items-center gap-2.5">
                <div className="p-2 rounded-md bg-blue-500/10">
                  <CreditCard className="w-4 h-4 text-blue-600" />
                </div>
                <span>Carta / POS Terminal</span>
              </div>
              <span className="font-bold text-sm">€{price}</span>
            </Button>

            <Button
              variant="outline"
              onClick={() => handlePayment("transfer")}
              disabled={submitting}
              className="h-12 justify-between border-amber-500/30 hover:bg-amber-50 dark:hover:bg-amber-950/40 text-amber-700 dark:text-amber-300 font-semibold cursor-pointer"
            >
              <div className="flex items-center gap-2.5">
                <div className="p-2 rounded-md bg-amber-500/10">
                  <Building2 className="w-4 h-4 text-amber-600" />
                </div>
                <span>Bonifico Bancario</span>
              </div>
              <span className="font-bold text-sm">€{price}</span>
            </Button>
          </div>

          <div className="pt-2 border-t flex justify-end">
            <Button
              variant="ghost"
              size="sm"
              onClick={() => onOpenChange(false)}
              disabled={submitting}
              className="text-xs text-muted-foreground hover:text-foreground"
            >
              <Clock className="w-3.5 h-3.5 mr-1" />
              Ometti (Pagamento in sospeso)
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}
