"use client";

import { UseFormReturn } from "react-hook-form";
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
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
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

  return (
    <div className="space-y-6">
      {/* Riepilogo Totale Box */}
      <div className="p-5 bg-gradient-to-br from-primary/10 via-muted/30 to-muted/20 rounded-2xl border border-primary/20 space-y-3">
        <h3 className="text-xs font-bold uppercase tracking-wider text-primary">Riepilogo Importi</h3>
        <div className="space-y-2 text-sm">
          <div className="flex justify-between text-muted-foreground">
            <span>Quota Corso:</span>
            <span className="font-mono font-medium text-foreground">€{amountPaid.toFixed(2)}</span>
          </div>
          <div className="flex justify-between text-muted-foreground">
            <span>Quota Iscrizione (Annual Fee):</span>
            <span className="font-mono font-medium text-foreground">€{registrationFee.toFixed(2)}</span>
          </div>
          <div className="flex justify-between items-center pt-2 border-t border-border/60 text-base font-bold">
            <span className="text-foreground">Totale Incasso:</span>
            <span className="font-mono text-primary text-lg">€{totalAmount.toFixed(2)}</span>
          </div>
        </div>
      </div>

      {/* Payment Options */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 min-w-0">
        <FormField
          control={form.control}
          name="paymentStatus"
          render={({ field }) => (
            <FormItem className="min-w-0">
              <FormLabel className="text-xs font-bold uppercase tracking-wider text-muted-foreground">
                Stato Pagamento *
              </FormLabel>
              <Select onValueChange={field.onChange} value={field.value}>
                <FormControl>
                  <SelectTrigger className="cursor-pointer h-10 text-sm bg-background w-full min-w-0">
                    <SelectValue placeholder="Seleziona stato..." />
                  </SelectTrigger>
                </FormControl>
                <SelectContent>
                  <SelectItem value="completed">Saldato Integrale</SelectItem>
                  <SelectItem value="reserved">Acconto (Prenotato)</SelectItem>
                  <SelectItem value="pending">In Attesa di Saldare</SelectItem>
                </SelectContent>
              </Select>
              <FormMessage />
            </FormItem>
          )}
        />

        <FormField
          control={form.control}
          name="paymentMethod"
          render={({ field }) => (
            <FormItem className="min-w-0">
              <FormLabel className="text-xs font-bold uppercase tracking-wider text-muted-foreground">
                Metodo di Pagamento *
              </FormLabel>
              <Select onValueChange={field.onChange} value={field.value}>
                <FormControl>
                  <SelectTrigger className="cursor-pointer h-10 text-sm bg-background w-full min-w-0">
                    <SelectValue placeholder="Seleziona metodo..." />
                  </SelectTrigger>
                </FormControl>
                <SelectContent>
                  <SelectItem value="cash">Contanti (In Sede)</SelectItem>
                  <SelectItem value="card">Carta POS (In Sede)</SelectItem>
                  <SelectItem value="bank_transfer">Bonifico Bancario</SelectItem>
                </SelectContent>
              </Select>
              <FormMessage />
            </FormItem>
          )}
        />
      </div>

      {/* Company Invoice SDI/PEC Option */}
      <div className="p-4 bg-muted/20 rounded-xl border border-border/60 space-y-3">
        <FormField
          control={form.control}
          name="needsCompanyInvoice"
          render={({ field }) => (
            <FormItem className="flex items-center space-x-2 space-y-0 cursor-pointer">
              <FormControl>
                <Checkbox checked={field.value} onCheckedChange={field.onChange} className="w-4 h-4 cursor-pointer" />
              </FormControl>
              <FormLabel className="text-xs font-bold cursor-pointer">Richiede Fattura Elettronica Aziendale (SDI/PEC)</FormLabel>
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
                  <FormLabel className="text-xs">Codice SDI (7 car.)</FormLabel>
                  <FormControl><Input placeholder="SUBM70N" className="h-9 text-xs bg-background uppercase font-mono" {...field} /></FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name="pecEmail"
              render={({ field }) => (
                <FormItem>
                  <FormLabel className="text-xs">Email PEC Aziendale</FormLabel>
                  <FormControl><Input type="email" placeholder="azienda@pec.it" className="h-9 text-xs bg-background" {...field} /></FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
          </div>
        )}
      </div>

      {/* Notes Field */}
      <FormField
        control={form.control}
        name="notes"
        render={({ field }) => (
          <FormItem>
            <FormLabel className="text-xs font-bold uppercase tracking-wider text-muted-foreground">
              Note Interne Reception (Opzionale)
            </FormLabel>
            <FormControl>
              <Textarea placeholder="Eventuali note su sconto concordato, orari particolari..." className="bg-background min-h-[80px] text-sm" {...field} />
            </FormControl>
          </FormItem>
        )}
      />
    </div>
  );
}
