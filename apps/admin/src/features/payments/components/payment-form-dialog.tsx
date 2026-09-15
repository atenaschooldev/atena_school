"use client"

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
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import { Search, UserCheck, X, Loader2 } from "lucide-react";
import { useForm } from "react-hook-form";
import { z } from "zod";
import { zodResolver } from "@hookform/resolvers/zod";
import { api } from "@/lib/api";
import {
  PaymentMethod,
  PaymentType,
} from "@atena/api-types";
import type { CreatePaymentFormValues } from "../types";

const paymentFormSchema = z.object({
  bookingId: z.string().optional(),
  studentId: z.string().optional(),
  amount: z.coerce.number().positive({ message: "Inserisci un importo valido." }),
  paymentMethod: z.coerce.number().min(1, { message: "Seleziona un metodo di pagamento." }),
  type: z.coerce.number().min(1),
  paidAt: z.string().optional(),
  notes: z.string().optional(),
});

interface PaymentFormDialogProps {
  onCreatePayment: (values: CreatePaymentFormValues) => Promise<unknown>;
}

export function PaymentFormDialog({ onCreatePayment }: PaymentFormDialogProps) {
  const [open, setOpen] = useState(false);
  const [clientSearch, setClientSearch] = useState("");
  const [searching, setSearching] = useState(false);
  const [searchResults, setSearchResults] = useState<any[]>([]);
  const [selectedMatch, setSelectedMatch] = useState<{
    name: string;
    bookingId?: string;
    studentId?: string;
    courseName?: string;
  } | null>(null);

  const form = useForm<z.infer<typeof paymentFormSchema>>({
    resolver: zodResolver(paymentFormSchema),
    defaultValues: {
      bookingId: "",
      studentId: "",
      amount: 0,
      paymentMethod: PaymentMethod.CASH,
      type: PaymentType.COURSE_PAYMENT,
      paidAt: "",
      notes: "",
    },
  });

  const handleSearch = async () => {
    if (!clientSearch.trim()) return;
    setSearching(true);
    try {
      const res = await api.get<any>(
        `/admin/bookings?q=${encodeURIComponent(clientSearch.trim())}`
      );
      const bookingsList = Array.isArray(res) ? res : res?.data || [];
      setSearchResults(bookingsList.slice(0, 5));
    } catch {
      setSearchResults([]);
    } finally {
      setSearching(false);
    }
  };

  const selectBookingMatch = (item: any) => {
    const name = item.studentName || item.purchaserName || item.student_name || "Cliente";
    const course = item.courseName || item.course_name || "";
    setSelectedMatch({
      name,
      bookingId: item.id,
      studentId: item.studentId || item.student_id,
      courseName: course,
    });

    form.setValue("bookingId", item.id || "");
    if (item.studentId || item.student_id) {
      form.setValue("studentId", item.studentId || item.student_id);
    }

    const outstanding = Number(item.totalPrice || item.total_amount || 150) - Number(item.amountPaid || item.amount_paid || 0);
    if (outstanding > 0) {
      form.setValue("amount", outstanding);
    }

    if (course) {
      form.setValue("notes", `Pagamento per corso: ${course}`);
    }

    setSearchResults([]);
  };

  const clearMatch = () => {
    setSelectedMatch(null);
    form.setValue("bookingId", "");
    form.setValue("studentId", "");
  };

  const [submitting, setSubmitting] = useState(false);

  async function onSubmit(data: z.infer<typeof paymentFormSchema>) {
    setSubmitting(true);
    try {
      await onCreatePayment({
        bookingId: data.bookingId || undefined,
        studentId: data.studentId || undefined,
        amount: data.amount,
        paymentMethod: Number(data.paymentMethod),
        type: Number(data.type),
        paidAt: data.paidAt ? new Date(data.paidAt).toISOString() : undefined,
        notes: data.notes || undefined,
      });
      form.reset();
      setSelectedMatch(null);
      setClientSearch("");
      setOpen(false);
    } catch {
      // Error handled in hook
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogContent className="sm:max-w-lg">
        <DialogHeader>
          <DialogTitle>Registra Transazione / Pagamento</DialogTitle>
          <DialogDescription>
            Aggiungi una transazione effettuata in sede (contanti, POS, bonifico o Stripe).
          </DialogDescription>
        </DialogHeader>

        {/* Smart Client Autocomplete Search */}
        <div className="space-y-2 border-b pb-4">
          <label className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">
            1. Ricerca Cliente / Ordine (Smart Lookup)
          </label>

          {selectedMatch ? (
            <div className="flex items-center justify-between p-2.5 rounded-md bg-emerald-500/10 border border-emerald-500/30 text-xs text-emerald-800 dark:text-emerald-300">
              <div className="flex items-center gap-2">
                <UserCheck className="w-4 h-4 text-emerald-500 shrink-0" />
                <div>
                  <span className="font-bold">{selectedMatch.name}</span>
                  {selectedMatch.courseName && (
                    <span className="ml-1.5 opacity-80">({selectedMatch.courseName})</span>
                  )}
                  <span className="ml-2 font-mono text-[10px] opacity-70">
                    ID: #{selectedMatch.bookingId?.slice(0, 8)}
                  </span>
                </div>
              </div>
              <Button
                variant="ghost"
                size="icon"
                className="h-6 w-6 cursor-pointer text-muted-foreground hover:text-rose-500"
                onClick={clearMatch}
                title="Rimuovi associazione"
              >
                <X className="w-3.5 h-3.5" />
              </Button>
            </div>
          ) : (
            <div className="flex items-center gap-2">
              <div className="relative flex-1">
                <Search className="absolute left-2.5 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-muted-foreground" />
                <Input
                  placeholder="Nome cliente, email o corso..."
                  value={clientSearch}
                  onChange={(e) => setClientSearch(e.target.value)}
                  onKeyDown={(e) => e.key === "Enter" && (e.preventDefault(), handleSearch())}
                  className="pl-8 text-xs h-9"
                />
              </div>
              <Button
                type="button"
                variant="secondary"
                size="sm"
                onClick={handleSearch}
                disabled={searching}
                className="h-9 cursor-pointer text-xs"
              >
                {searching ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : "Cerca"}
              </Button>
            </div>
          )}

          {searchResults.length > 0 && !selectedMatch && (
            <div className="rounded-md border bg-popover p-1 shadow-md space-y-1 max-h-40 overflow-y-auto text-xs">
              {searchResults.map((b) => (
                <div
                  key={b.id}
                  onClick={() => selectBookingMatch(b)}
                  className="p-2 hover:bg-muted rounded cursor-pointer flex items-center justify-between transition-colors"
                >
                  <div>
                    <span className="font-medium">{b.studentName || b.purchaserName || "Cliente"}</span>
                    <span className="text-muted-foreground ml-1.5">• {b.courseName || "Corso"}</span>
                  </div>
                  <Badge variant="outline" className="font-mono text-[10px]">
                    Rimanente: €{Number(b.totalPrice || 150) - Number(b.amountPaid || 0)}
                  </Badge>
                </div>
              ))}
            </div>
          )}
        </div>

        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4 pt-1">
            <div className="grid grid-cols-2 gap-4">
              <FormField
                control={form.control}
                name="amount"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Importo (€)</FormLabel>
                    <FormControl>
                      <Input type="number" step="0.01" placeholder="Es. 150.00" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="paymentMethod"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Metodo di Pagamento</FormLabel>
                    <Select onValueChange={(val) => field.onChange(Number(val))} defaultValue={String(field.value)}>
                      <FormControl>
                        <SelectTrigger className="cursor-pointer w-full">
                          <SelectValue placeholder="Seleziona" />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        <SelectItem value={String(PaymentMethod.CASH)}>Contanti</SelectItem>
                        <SelectItem value={String(PaymentMethod.POS)}>POS / Carta</SelectItem>
                        <SelectItem value={String(PaymentMethod.BANK_TRANSFER)}>Bonifico</SelectItem>
                        <SelectItem value={String(PaymentMethod.STRIPE)}>Stripe Online</SelectItem>
                      </SelectContent>
                    </Select>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>

            <FormField
              control={form.control}
              name="type"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Tipo Transazione</FormLabel>
                  <Select onValueChange={(val) => field.onChange(Number(val))} defaultValue={String(field.value)}>
                    <FormControl>
                      <SelectTrigger className="cursor-pointer w-full">
                        <SelectValue placeholder="Seleziona tipo" />
                      </SelectTrigger>
                    </FormControl>
                    <SelectContent>
                      <SelectItem value={String(PaymentType.COURSE_PAYMENT)}>Pagamento Corso</SelectItem>
                      <SelectItem value={String(PaymentType.REGISTRATION_FEE)}>Quota Iscrizione (€30)</SelectItem>
                      <SelectItem value={String(PaymentType.EXAM_FEE)}>Esame Cambridge / CELI</SelectItem>
                      <SelectItem value={String(PaymentType.CERTIFICATE_FEE)}>Rilascio Certificato</SelectItem>
                      <SelectItem value={String(PaymentType.MATERIAL_TEXTBOOK)}>Libro / Materiale Didattico</SelectItem>
                      <SelectItem value={String(PaymentType.SINGLE_LESSON)}>Lezione Singola</SelectItem>
                      <SelectItem value={String(PaymentType.OTHER)}>Altro</SelectItem>
                    </SelectContent>
                  </Select>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="paidAt"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Data Pagamento (opzionale - default oggi)</FormLabel>
                  <FormControl>
                    <Input type="date" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="notes"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Note / Riferimento (opzionale)</FormLabel>
                  <FormControl>
                    <Input placeholder="Es. Ricevuta n. 142 / Libro Elementary" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <DialogFooter>
              <Button type="submit" disabled={submitting || form.formState.isSubmitting} className="cursor-pointer gap-2 disabled:opacity-50">
                {submitting || form.formState.isSubmitting ? (
                  <>
                    <Loader2 className="w-4 h-4 animate-spin shrink-0" />
                    <span>Salvataggio in corso...</span>
                  </>
                ) : (
                  <span>Salva Transazione</span>
                )}
              </Button>
            </DialogFooter>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  );
}
