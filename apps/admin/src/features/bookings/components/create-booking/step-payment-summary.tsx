"use client";

import type { UseFormReturn } from "react-hook-form";
import { Input } from "@/components/ui/input";
import { Checkbox } from "@/components/ui/checkbox";
import { Textarea } from "@/components/ui/textarea";
import {
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import {
  Banknote,
  CreditCard,
  Building2,
  Zap,
  CheckCircle2,
  Clock,
  FileText,
} from "lucide-react";
import { cn } from "@/lib/utils";
import type { CreateBookingValues } from "./types";

interface StepPaymentSummaryProps {
  form: UseFormReturn<CreateBookingValues>;
  amountPaid: number;
  registrationFee: number;
  totalAmount: number;
}

export function StepPaymentSummary({
  form,
  amountPaid,
  registrationFee,
  totalAmount,
}: StepPaymentSummaryProps) {
  const needsCompanyInvoice = form.watch("needsCompanyInvoice");
  const selectedPaymentMethod = form.watch("paymentMethod");
  const selectedPaymentStatus = form.watch("paymentStatus");

  const paymentMethods = [
    {
      id: "cash",
      title: "Contanti",
      description: "Pagamento in sede con rilascio ricevuta",
      icon: Banknote,
    },
    {
      id: "card",
      title: "Carta POS",
      description: "Bancomat / Carta di Credito in reception",
      icon: CreditCard,
    },
    {
      id: "bank_transfer",
      title: "Bonifico",
      description: "Bonifico Bancario anticipato",
      icon: Building2,
    },
    {
      id: "stripe",
      title: "Stripe / Online",
      description: "Link di pagamento istantaneo",
      icon: Zap,
    },
  ];

  const paymentStatuses = [
    {
      id: "completed",
      title: "Saldato Subito",
      description: "Importo interamente incassato ora",
      badge: "Saldato",
      icon: CheckCircle2,
      activeColor: "border-emerald-500 bg-emerald-500/10 text-emerald-600",
    },
    {
      id: "reserved",
      title: "Acconto / Prenotato",
      description: "Posto bloccato, saldo al primo giorno",
      badge: "Acconto",
      icon: Clock,
      activeColor: "border-amber-500 bg-amber-500/10 text-amber-600",
    },
  ];

  return (
    <div className="space-y-5">
      {/* 1. Payment Method Selection Cards */}
      <div className="space-y-2.5">
        <label className="text-xs font-bold uppercase tracking-wider text-muted-foreground block">
          1. Seleziona Metodo di Incasso *
        </label>
        <div className="grid grid-cols-2 gap-2.5">
          {paymentMethods.map((pm) => {
            const isSelected = selectedPaymentMethod === pm.id;
            const Icon = pm.icon;
            return (
              <button
                key={pm.id}
                type="button"
                onClick={() => form.setValue("paymentMethod", pm.id as any)}
                className={cn(
                  "flex items-start gap-3 p-3 rounded-xl border text-left transition-all cursor-pointer",
                  isSelected
                    ? "border-primary bg-primary/10 shadow-xs ring-1 ring-primary/30"
                    : "border-border/70 bg-card hover:bg-muted/40"
                )}
              >
                <div
                  className={cn(
                    "flex h-8 w-8 shrink-0 items-center justify-center rounded-lg mt-0.5",
                    isSelected
                      ? "bg-primary text-primary-foreground"
                      : "bg-muted text-muted-foreground"
                  )}
                >
                  <Icon className="h-4 w-4" />
                </div>
                <div className="min-w-0">
                  <div className="text-xs font-bold text-foreground truncate">{pm.title}</div>
                  <div className="text-[11px] text-muted-foreground line-clamp-1 leading-snug mt-0.5">
                    {pm.description}
                  </div>
                </div>
              </button>
            );
          })}
        </div>
      </div>

      {/* 2. Payment Status Selection */}
      <div className="space-y-2.5">
        <label className="text-xs font-bold uppercase tracking-wider text-muted-foreground block">
          2. Stato Transazione Cassa *
        </label>
        <div className="grid grid-cols-2 gap-2.5">
          {paymentStatuses.map((ps) => {
            const isSelected = selectedPaymentStatus === ps.id;
            const Icon = ps.icon;
            return (
              <button
                key={ps.id}
                type="button"
                onClick={() => form.setValue("paymentStatus", ps.id as any)}
                className={cn(
                  "flex items-start gap-3 p-3 rounded-xl border text-left transition-all cursor-pointer",
                  isSelected
                    ? `${ps.activeColor} shadow-xs ring-1 ring-primary/30`
                    : "border-border/70 bg-card hover:bg-muted/40"
                )}
              >
                <div
                  className={cn(
                    "flex h-8 w-8 shrink-0 items-center justify-center rounded-lg mt-0.5",
                    isSelected ? "bg-primary text-primary-foreground" : "bg-muted text-muted-foreground"
                  )}
                >
                  <Icon className="h-4 w-4" />
                </div>
                <div className="min-w-0">
                  <div className="text-xs font-bold text-foreground truncate">{ps.title}</div>
                  <div className="text-[11px] text-muted-foreground line-clamp-1 leading-snug mt-0.5">
                    {ps.description}
                  </div>
                </div>
              </button>
            );
          })}
        </div>
      </div>

      {/* 3. Electronic Invoicing (Fattura Elettronica) */}
      <div className="p-4 bg-muted/20 rounded-xl border border-border/60 space-y-3">
        <FormField
          control={form.control}
          name="needsCompanyInvoice"
          render={({ field }) => (
            <FormItem className="flex items-center space-x-2.5 space-y-0 cursor-pointer">
              <FormControl>
                <Checkbox
                  checked={field.value}
                  onCheckedChange={field.onChange}
                  className="w-4 h-4 cursor-pointer"
                />
              </FormControl>
              <FormLabel className="text-xs font-bold cursor-pointer flex items-center gap-1.5">
                <FileText className="w-3.5 h-3.5 text-primary" />
                Richiede Fattura Elettronica Aziendale (SDI / PEC)
              </FormLabel>
            </FormItem>
          )}
        />

        {needsCompanyInvoice && (
          <div className="grid grid-cols-2 gap-3 pt-2">
            <FormField
              control={form.control}
              name="sdiCode"
              render={({ field }) => (
                <FormItem>
                  <FormLabel className="text-xs font-semibold">Codice SDI (7 caratteri)</FormLabel>
                  <FormControl>
                    <Input
                      placeholder="SUBM70N"
                      maxLength={7}
                      className="h-9 text-xs bg-background uppercase font-mono"
                      {...field}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name="pecEmail"
              render={({ field }) => (
                <FormItem>
                  <FormLabel className="text-xs font-semibold">Indirizzo PEC Aziendale</FormLabel>
                  <FormControl>
                    <Input
                      type="email"
                      placeholder="amministrazione@pec.it"
                      className="h-9 text-xs bg-background"
                      {...field}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
          </div>
        )}
      </div>

      {/* 4. Internal Notes */}
      <FormField
        control={form.control}
        name="notes"
        render={({ field }) => (
          <FormItem>
            <FormLabel className="text-xs font-bold uppercase tracking-wider text-muted-foreground">
              Note Interne Reception (Opzionale)
            </FormLabel>
            <FormControl>
              <Textarea
                placeholder="Es. Sconto accordato dalla direzione, preferenze orario, note per il docente..."
                className="bg-background min-h-[70px] text-xs resize-none"
                {...field}
              />
            </FormControl>
          </FormItem>
        )}
      />
    </div>
  );
}
