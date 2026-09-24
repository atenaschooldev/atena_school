"use client";

import * as React from "react";
import { format } from "date-fns";
import { it as dateLocale } from "date-fns/locale";
import {
  GraduationCap,
  Calendar,
  Clock,
  User,
  Baby,
  CreditCard,
  Sparkles,
  Receipt,
  CheckCircle2,
  ShieldCheck,
  AlertCircle,
} from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { cn } from "@/lib/utils";
import type { Course } from "@/features/courses/types";

interface LiveReceiptCardProps {
  currentStep: 1 | 2 | 3;
  selectedCourse: Course | null;
  selectedDateState?: Date;
  previewLessons: Array<{ date: string; startsAt?: string; endsAt?: string }>;
  formattedScheduleText: string;
  isForChild: boolean;
  purchaserName?: string;
  studentName?: string;
  studentsList?: Array<{ firstName: string; lastName: string; taxCode?: string }>;
  studentFeeStatuses?: Record<number, { checked: boolean; paid: boolean }>;
  amountPaid: number;
  registrationFee: number;
  totalAmount: number;
  paymentStatus: string;
  paymentMethod: string;
  membershipFeeStatus?: { checked: boolean; paid: boolean };
}

export function LiveReceiptCard({
  currentStep,
  selectedCourse,
  selectedDateState,
  previewLessons,
  formattedScheduleText,
  isForChild,
  purchaserName,
  studentName,
  studentsList = [],
  studentFeeStatuses = {},
  amountPaid,
  registrationFee,
  totalAmount,
  paymentStatus,
  paymentMethod,
  membershipFeeStatus = { checked: false, paid: false },
}: LiveReceiptCardProps) {
  const firstLesson = previewLessons[0];
  const lastLesson = previewLessons[previewLessons.length - 1];
  const count = isForChild ? Math.max(1, studentsList.length) : 1;

  return (
    <div className="flex flex-col h-full bg-card/60 dark:bg-card/40 border border-border/70 rounded-2xl p-5 shadow-xs backdrop-blur-sm justify-between space-y-4">
      <div className="space-y-4">
        {/* Header of the receipt */}
        <div className="flex items-center justify-between pb-3 border-b border-border/60">
          <div className="flex items-center gap-2">
            <div className="flex h-8 w-8 items-center justify-center rounded-xl bg-primary/10 text-primary">
              <Receipt className="h-4 w-4" />
            </div>
            <div>
              <h4 className="text-xs font-bold uppercase tracking-wider text-foreground">
                Riepilogo Iscrizione
              </h4>
              <p className="text-[11px] text-muted-foreground">
                Calcolo quote e calendario in tempo reale
              </p>
            </div>
          </div>
          <Badge
            variant="outline"
            className={cn(
              "text-[10px] font-semibold uppercase tracking-wider px-2 py-0.5",
              paymentStatus === "completed"
                ? "bg-emerald-500/10 text-emerald-600 border-emerald-500/20"
                : "bg-amber-500/10 text-amber-600 border-amber-500/20"
            )}
          >
            {paymentStatus === "completed" ? "Saldato" : "Acconto / Prenotato"}
          </Badge>
        </div>

        {/* 1. Student / Purchaser Box */}
        <div className="rounded-xl bg-background/80 border border-border/50 p-3 space-y-2 text-xs">
          <div className="flex items-center justify-between text-muted-foreground font-medium">
            <span className="flex items-center gap-1.5 text-[11px] uppercase tracking-wider">
              {isForChild ? (
                <>
                  <Baby className="h-3.5 w-3.5 text-primary" />
                  {count > 1 ? `${count} Studenti (Minorenni)` : "Studente (Minorenne)"}
                </>
              ) : (
                <>
                  <User className="h-3.5 w-3.5 text-primary" />
                  Cliente / Studente
                </>
              )}
            </span>
          </div>

          {isForChild && studentsList.length > 0 ? (
            <div className="space-y-1.5">
              {studentsList.map((st, sIdx) => {
                const sFee = studentFeeStatuses[sIdx];
                const sFullName = `${st.firstName} ${st.lastName}`.trim() || `Studente #${sIdx + 1}`;
                return (
                  <div key={sIdx} className="flex items-center justify-between text-xs py-0.5">
                    <span className="font-semibold text-foreground truncate max-w-[170px]">
                      {sIdx + 1}. {sFullName}
                    </span>
                    {sFee?.checked && (
                      <span
                        className={cn(
                          "text-[10px] flex items-center gap-1 font-semibold",
                          sFee.paid ? "text-emerald-600" : "text-amber-600"
                        )}
                      >
                        {sFee.paid ? (
                          <>
                            <CheckCircle2 className="h-3 w-3" /> Quota 0€
                          </>
                        ) : (
                          <>
                            <AlertCircle className="h-3 w-3" /> Quota +30€
                          </>
                        )}
                      </span>
                    )}
                  </div>
                );
              })}
            </div>
          ) : (
            <div className="font-semibold text-foreground text-sm truncate">
              {studentName || "In attesa di dati..."}
            </div>
          )}

          {isForChild && purchaserName && (
            <div className="text-[11px] text-muted-foreground pt-1.5 border-t border-border/40 flex justify-between">
              <span>Genitore / Acquirente:</span>
              <span className="font-medium text-foreground truncate max-w-[150px]">
                {purchaserName}
              </span>
            </div>
          )}
        </div>

        {/* 2. Course & Schedule Box */}
        <div className="rounded-xl bg-background/80 border border-border/50 p-3 space-y-2.5 text-xs">
          <div className="flex items-center justify-between text-muted-foreground">
            <span className="flex items-center gap-1.5 text-[11px] uppercase tracking-wider font-medium">
              <GraduationCap className="h-3.5 w-3.5 text-primary" />
              Corso Selezionato
            </span>
            {selectedCourse?.categoria && (
              <span className="text-[10px] px-1.5 py-0.5 rounded-md bg-muted text-muted-foreground font-medium">
                {selectedCourse.categoria}
              </span>
            )}
          </div>

          <div className="font-semibold text-foreground text-sm leading-snug">
            {selectedCourse?.nome || (
              <span className="text-muted-foreground font-normal italic">
                Nessun corso ancora selezionato
              </span>
            )}
          </div>

          {selectedCourse && (
            <div className="space-y-1.5 pt-1.5 border-t border-border/40 text-[11px]">
              {formattedScheduleText && (
                <div className="flex items-center gap-1.5 text-muted-foreground">
                  <Clock className="h-3 w-3 shrink-0 text-primary/70" />
                  <span className="truncate">{formattedScheduleText}</span>
                </div>
              )}

              {previewLessons.length > 0 && firstLesson && lastLesson && (
                <div className="flex items-center justify-between bg-muted/40 p-2 rounded-lg text-[11px] font-medium">
                  <div>
                    <span className="text-muted-foreground block text-[10px]">Inizio:</span>
                    <span className="text-foreground">
                      {format(new Date(firstLesson.date), "d MMM yyyy", { locale: dateLocale })}
                    </span>
                  </div>
                  <div className="text-center px-2">
                    <span className="text-[10px] font-bold text-primary block">
                      {previewLessons.length} lezioni
                    </span>
                    <span className="text-[9px] text-muted-foreground">totali</span>
                  </div>
                  <div className="text-right">
                    <span className="text-muted-foreground block text-[10px]">Fine:</span>
                    <span className="text-foreground">
                      {format(new Date(lastLesson.date), "d MMM yyyy", { locale: dateLocale })}
                    </span>
                  </div>
                </div>
              )}
            </div>
          )}
        </div>
      </div>

      {/* 3. Price & Summary Breakdown at Bottom */}
      <div className="rounded-xl bg-muted/30 border border-border/60 p-3.5 space-y-2.5">
        <div className="space-y-1.5 text-xs">
          <div className="flex justify-between text-muted-foreground">
            <span>Quota Corso:</span>
            <span className="font-mono font-medium text-foreground">
              €{Number(amountPaid || 0).toFixed(2)}
            </span>
          </div>
          <div className="flex justify-between text-muted-foreground">
            <span className="flex items-center gap-1">
              Quota Associativa (Annuale):
              {registrationFee === 0 && membershipFeeStatus.paid && (
                <span className="text-[10px] text-emerald-600 font-semibold">(Attiva)</span>
              )}
            </span>
            <span
              className={cn(
                "font-mono font-medium",
                registrationFee > 0 ? "text-amber-600 dark:text-amber-400" : "text-emerald-600"
              )}
            >
              €{Number(registrationFee || 0).toFixed(2)}
            </span>
          </div>
        </div>

        <div className="pt-2 border-t border-border/60 flex items-baseline justify-between">
          <div>
            <span className="text-xs font-bold uppercase tracking-wider text-foreground block">
              Totale da Versare
            </span>
            <span className="text-[10px] text-muted-foreground capitalize">
              Metodo: {paymentMethod || "Contanti"}
            </span>
          </div>
          <span className="text-xl font-extrabold font-mono text-primary tracking-tight">
            €{Number(totalAmount || 0).toFixed(2)}
          </span>
        </div>
      </div>
    </div>
  );
}
