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
  DialogTrigger,
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
import { Plus } from "lucide-react";
import { useForm } from "react-hook-form";
import { z } from "zod";
import { zodResolver } from "@hookform/resolvers/zod";
import type { CreatePaymentFormValues } from "../types";

const paymentFormSchema = z.object({
  bookingId: z.string().optional(),
  amount: z.coerce.number().positive({ message: "Inserisci un importo valido." }),
  paymentMethod: z.string().min(1, { message: "Seleziona un metodo di pagamento." }),
  type: z.string().min(1),
  notes: z.string().optional(),
});

interface PaymentFormDialogProps {
  onCreatePayment: (values: CreatePaymentFormValues) => Promise<unknown>;
}

export function PaymentFormDialog({ onCreatePayment }: PaymentFormDialogProps) {
  const [open, setOpen] = useState(false);

  const form = useForm<z.infer<typeof paymentFormSchema>>({
    resolver: zodResolver(paymentFormSchema),
    defaultValues: {
      bookingId: "",
      amount: 0,
      paymentMethod: "cash",
      type: "payment",
      notes: "",
    },
  });

  async function onSubmit(data: z.infer<typeof paymentFormSchema>) {
    try {
      await onCreatePayment({
        bookingId: data.bookingId || "",
        amount: data.amount,
        paymentMethod: data.paymentMethod,
        type: data.type,
        notes: data.notes || undefined,
      });
      form.reset();
      setOpen(false);
    } catch {
      // Error handled in hook
    }
  }

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button className="cursor-pointer">
          <Plus className="mr-2 h-4 w-4" />
          Nuovo Pagamento
        </Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>Registra Pagamento Manuale</DialogTitle>
          <DialogDescription>
            Aggiungi una transazione effettuata in sede (contanti, POS o bonifico).
          </DialogDescription>
        </DialogHeader>
        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
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

            <div className="grid grid-cols-2 gap-4">
              <FormField
                control={form.control}
                name="paymentMethod"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Metodo di Pagamento</FormLabel>
                    <Select onValueChange={field.onChange} defaultValue={field.value}>
                      <FormControl>
                        <SelectTrigger className="cursor-pointer w-full">
                          <SelectValue placeholder="Seleziona" />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        <SelectItem value="cash">Contanti</SelectItem>
                        <SelectItem value="pos">POS / Carta</SelectItem>
                        <SelectItem value="transfer">Bonifico</SelectItem>
                      </SelectContent>
                    </Select>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="type"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Tipo Transazione</FormLabel>
                    <Select onValueChange={field.onChange} defaultValue={field.value}>
                      <FormControl>
                        <SelectTrigger className="cursor-pointer w-full">
                          <SelectValue placeholder="Seleziona" />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        <SelectItem value="payment">Pagamento Corso</SelectItem>
                        <SelectItem value="registration_fee">Quota Iscrizione</SelectItem>
                      </SelectContent>
                    </Select>
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
                  <FormLabel>Note / Riferimento (opzionale)</FormLabel>
                  <FormControl>
                    <Input placeholder="Es. Ricevuta n. 142 / Saldo in segreteria" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <DialogFooter>
              <Button type="submit" className="cursor-pointer">
                Salva Transazione
              </Button>
            </DialogFooter>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  );
}
