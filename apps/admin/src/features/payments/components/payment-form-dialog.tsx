"use client";

import { useState, useEffect } from "react";
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
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import { Search, UserCheck, X, Loader2, Edit3, Banknote } from "lucide-react";
import { useForm } from "react-hook-form";
import { z } from "zod";
import { zodResolver } from "@hookform/resolvers/zod";
import { api } from "@/lib/api";
import {
  PaymentMethod,
  PaymentType,
  PaymentRecordStatus,
} from "@atena/api-types";
import { useTranslation } from "@/i18n/context";
import type { Payment, CreatePaymentFormValues } from "../types";

const paymentFormSchema = z.object({
  bookingId: z.string().optional(),
  studentId: z.string().optional(),
  amount: z.coerce.number().positive({ message: "Inserisci un importo valido." }),
  paymentMethod: z.coerce.number().min(1, { message: "Seleziona un metodo di pagamento." }),
  type: z.coerce.number().min(1),
  status: z.coerce.number().optional(),
  paidAt: z.string().optional(),
  notes: z.string().optional(),
});

interface PaymentFormDialogProps {
  open?: boolean;
  onOpenChange?: (open: boolean) => void;
  initialData?: Payment | null;
  onSubmit?: (values: any) => Promise<void>;
  onCreatePayment?: (values: CreatePaymentFormValues) => Promise<unknown>;
}

export function PaymentFormDialog({
  open: controlledOpen,
  onOpenChange: controlledOnOpenChange,
  initialData,
  onSubmit: controlledOnSubmit,
  onCreatePayment,
}: PaymentFormDialogProps) {
  const { t } = useTranslation();
  const [internalOpen, setInternalOpen] = useState(false);
  const isControlled = controlledOpen !== undefined;
  const open = isControlled ? controlledOpen : internalOpen;
  const setOpen = isControlled ? controlledOnOpenChange! : setInternalOpen;

  const isEdit = Boolean(initialData);

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
      status: PaymentRecordStatus.SUCCEEDED,
      paidAt: "",
      notes: "",
    },
  });

  useEffect(() => {
    if (initialData) {
      form.reset({
        bookingId: initialData.booking_id || (initialData as any).bookingId || "",
        studentId: (initialData as any).student_id || (initialData as any).studentId || "",
        amount: Number(initialData.amount || 0),
        paymentMethod: Number(initialData.payment_method ?? initialData.paymentMethod ?? PaymentMethod.CASH),
        type: Number(initialData.type ?? PaymentType.COURSE_PAYMENT),
        status: Number(initialData.status ?? PaymentRecordStatus.SUCCEEDED),
        paidAt: initialData.paid_at
          ? new Date(initialData.paid_at).toISOString().slice(0, 16)
          : initialData.created_at
          ? new Date(initialData.created_at).toISOString().slice(0, 16)
          : "",
        notes: initialData.notes || "",
      });
      setSelectedMatch({
        name: initialData.purchaser_name || (initialData as any).purchaserName || "Cliente",
        bookingId: initialData.booking_id || (initialData as any).bookingId,
      });
    } else if (open) {
      form.reset({
        bookingId: "",
        studentId: "",
        amount: 0,
        paymentMethod: PaymentMethod.CASH,
        type: PaymentType.COURSE_PAYMENT,
        status: PaymentRecordStatus.SUCCEEDED,
        paidAt: "",
        notes: "",
      });
      setSelectedMatch(null);
      setClientSearch("");
    }
  }, [initialData, open, form]);

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
      const payload: any = {
        bookingId: data.bookingId || undefined,
        studentId: data.studentId || undefined,
        amount: data.amount,
        paymentMethod: Number(data.paymentMethod),
        type: Number(data.type),
        status: data.status != null ? Number(data.status) : undefined,
        paidAt: data.paidAt ? new Date(data.paidAt).toISOString() : undefined,
        notes: data.notes || undefined,
      };

      if (controlledOnSubmit) {
        await controlledOnSubmit(payload);
      } else if (onCreatePayment) {
        await onCreatePayment(payload);
      }
      form.reset();
      setSelectedMatch(null);
      setClientSearch("");
      setOpen(false);
    } catch {
      // Handled in caller
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogContent className="sm:max-w-lg p-0 overflow-hidden rounded-2xl border-border/80 shadow-2xl">
        <DialogHeader className="p-5 bg-muted/20 border-b border-border/60">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-primary/10 flex items-center justify-center border border-primary/20 text-primary shrink-0">
              {isEdit ? <Edit3 className="w-5 h-5" /> : <Banknote className="w-5 h-5" />}
            </div>
            <div>
              <DialogTitle className="text-base font-bold text-foreground">
                {isEdit ? "Modifica Pagamento" : "Registra Transazione / Pagamento"}
              </DialogTitle>
              <DialogDescription className="text-xs text-muted-foreground">
                {isEdit
                  ? "Aggiorna importo, metodo o note di questa transazione."
                  : "Aggiungi una transazione effettuata in sede (contanti, POS, bonifico)."}
              </DialogDescription>
            </div>
          </div>
        </DialogHeader>

        <div className="p-5 space-y-4 max-h-[75vh] overflow-y-auto text-xs">
          {/* Smart Client Search (only for new payment) */}
          {!isEdit && (
            <div className="space-y-2 border-b pb-4">
              <label className="text-xs font-bold text-muted-foreground uppercase tracking-wider">
                1. Ricerca Cliente / Ordine
              </label>

              {selectedMatch ? (
                <div className="flex items-center justify-between p-2.5 rounded-xl bg-primary/5 border border-primary/20 text-xs">
                  <div className="flex items-center gap-2">
                    <UserCheck className="w-4 h-4 text-primary shrink-0" />
                    <div>
                      <span className="font-bold text-foreground">{selectedMatch.name}</span>
                      {selectedMatch.courseName && (
                        <span className="ml-1.5 text-muted-foreground">({selectedMatch.courseName})</span>
                      )}
                      <span className="ml-2 font-mono text-[10px] text-muted-foreground">
                        ID: #{selectedMatch.bookingId?.slice(0, 8)}
                      </span>
                    </div>
                  </div>
                  <Button
                    variant="ghost"
                    size="icon"
                    className="h-6 w-6 cursor-pointer text-muted-foreground hover:text-destructive"
                    onClick={clearMatch}
                  >
                    <X className="w-3.5 h-3.5" />
                  </Button>
                </div>
              ) : (
                <div className="flex items-center gap-2">
                  <div className="relative flex-1">
                    <Search className="absolute left-2.5 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-muted-foreground pointer-events-none" />
                    <Input
                      placeholder="Nome cliente, email o corso..."
                      value={clientSearch}
                      onChange={(e) => setClientSearch(e.target.value)}
                      onKeyDown={(e) => e.key === "Enter" && (e.preventDefault(), handleSearch())}
                      className="pl-8 text-xs h-9 bg-background"
                    />
                  </div>
                  <Button
                    type="button"
                    variant="secondary"
                    size="sm"
                    onClick={handleSearch}
                    disabled={searching}
                    className="h-9 cursor-pointer text-xs shrink-0"
                  >
                    {searching ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : "Cerca"}
                  </Button>
                </div>
              )}

              {searchResults.length > 0 && !selectedMatch && (
                <div className="rounded-xl border bg-popover p-1 shadow-md space-y-1 max-h-40 overflow-y-auto text-xs">
                  {searchResults.map((b) => (
                    <div
                      key={b.id}
                      onClick={() => selectBookingMatch(b)}
                      className="p-2 hover:bg-muted rounded-lg cursor-pointer flex items-center justify-between transition-colors"
                    >
                      <div>
                        <span className="font-semibold text-foreground">
                          {b.studentName || b.purchaserName || "Cliente"}
                        </span>
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
          )}

          {/* Form Fields */}
          <Form {...form}>
            <form id="payment-edit-form" onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
              <div className="grid grid-cols-2 gap-3.5">
                <FormField
                  control={form.control}
                  name="amount"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel className="text-xs font-semibold">Importo (€) *</FormLabel>
                      <FormControl>
                        <Input
                          type="number"
                          step="any"
                          placeholder="150.00"
                          className="h-9 text-xs font-mono font-bold bg-background"
                          {...field}
                        />
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
                      <FormLabel className="text-xs font-semibold">Metodo Pagamento *</FormLabel>
                      <Select
                        value={String(field.value)}
                        onValueChange={(val) => field.onChange(Number(val))}
                      >
                        <FormControl>
                          <SelectTrigger className="h-9 text-xs bg-background">
                            <SelectValue placeholder="Seleziona metodo" />
                          </SelectTrigger>
                        </FormControl>
                        <SelectContent>
                          <SelectItem value={String(PaymentMethod.CASH)}>Contanti (Cassa)</SelectItem>
                          <SelectItem value={String(PaymentMethod.POS)}>Carta / POS Fisico</SelectItem>
                          <SelectItem value={String(PaymentMethod.BANK_TRANSFER)}>Bonifico Bancario</SelectItem>
                          <SelectItem value={String(PaymentMethod.STRIPE)}>Stripe Online</SelectItem>
                        </SelectContent>
                      </Select>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>

              <div className="grid grid-cols-2 gap-3.5">
                <FormField
                  control={form.control}
                  name="type"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel className="text-xs font-semibold">Tipologia *</FormLabel>
                      <Select
                        value={String(field.value)}
                        onValueChange={(val) => field.onChange(Number(val))}
                      >
                        <FormControl>
                          <SelectTrigger className="h-9 text-xs bg-background">
                            <SelectValue placeholder="Seleziona tipo" />
                          </SelectTrigger>
                        </FormControl>
                        <SelectContent>
                          <SelectItem value={String(PaymentType.COURSE_PAYMENT)}>Quota Corso</SelectItem>
                          <SelectItem value={String(PaymentType.REGISTRATION_FEE)}>Quota Iscrizione (€30)</SelectItem>
                          <SelectItem value={String(PaymentType.DEPOSIT)}>Acconto / Deposito</SelectItem>
                          <SelectItem value={String(PaymentType.INSTALLMENT)}>Rata Mensile</SelectItem>
                          <SelectItem value={String(PaymentType.SINGLE_LESSON)}>Lezione Singola</SelectItem>
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
                      <FormLabel className="text-xs font-semibold">Data e Ora Transazione</FormLabel>
                      <FormControl>
                        <Input type="datetime-local" className="h-9 text-xs bg-background" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>

              <FormField
                control={form.control}
                name="notes"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel className="text-xs font-semibold">Note / Riferimento Ricevuta</FormLabel>
                    <FormControl>
                      <Textarea
                        placeholder="Es. Ricevuta cartacea #123, pagato al desk..."
                        className="h-16 text-xs bg-background resize-none"
                        {...field}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </form>
          </Form>
        </div>

        <DialogFooter className="p-4 bg-muted/20 border-t border-border/60 flex items-center justify-between sm:justify-between">
          <Button
            type="button"
            variant="ghost"
            className="text-xs font-semibold cursor-pointer h-9 px-4 text-muted-foreground hover:text-foreground"
            onClick={() => setOpen(false)}
          >
            {t("common.cancel")}
          </Button>

          <Button
            type="submit"
            form="payment-edit-form"
            disabled={submitting}
            className="text-xs font-bold bg-primary text-primary-foreground h-9 px-5 rounded-lg shadow-xs cursor-pointer gap-1.5"
          >
            {submitting ? (
              <Loader2 className="w-4 h-4 animate-spin" />
            ) : (
              <Banknote className="w-4 h-4" />
            )}
            <span>{isEdit ? "Salva Modifiche" : t("payments.savePayment")}</span>
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
