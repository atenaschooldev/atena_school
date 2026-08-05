"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
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
  FormDescription,
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
import { Plus, User, CreditCard, Shield, CheckCircle2, Loader2 } from "lucide-react";
import { useForm } from "react-hook-form";
import { z } from "zod";
import { zodResolver } from "@hookform/resolvers/zod";
import { api } from "@/lib/api";
import { toast } from "sonner";

const schema = z.object({
  firstName: z.string().min(1, "Il nome è obbligatorio"),
  lastName: z.string().min(1, "Il cognome è obbligatorio"),
  email: z.string().email("Email non valida").optional().or(z.literal("")),
  phone: z.string().optional().or(z.literal("")),
  taxCode: z.string().optional().or(z.literal("")),
  birthDate: z.string().optional().or(z.literal("")),
  status: z.enum(["pending", "succeeded"]),
  paymentMethod: z.string(),
});

type FormValues = z.infer<typeof schema>;

interface CreateMembershipDialogProps {
  onSuccess?: () => void;
}

export function CreateMembershipDialog({ onSuccess }: CreateMembershipDialogProps) {
  const [open, setOpen] = useState(false);
  const [submitting, setSubmitting] = useState(false);

  const form = useForm<FormValues>({
    resolver: zodResolver(schema),
    defaultValues: {
      firstName: "",
      lastName: "",
      email: "",
      phone: "",
      taxCode: "",
      birthDate: "",
      status: "pending",
      paymentMethod: "cash",
    },
  });

  const onSubmit = async (values: FormValues) => {
    setSubmitting(true);
    try {
      const fullName = `${values.firstName} ${values.lastName}`.trim();

      await api.post("/admin/memberships", {
        fullName,
        firstName: values.firstName,
        lastName: values.lastName,
        email: values.email || undefined,
        phone: values.phone || undefined,
        taxCode: values.taxCode?.toUpperCase() || undefined,
        birthDate: values.birthDate || undefined,
        status: values.status,
        paymentMethod: values.paymentMethod,
      });

      if (values.status === "succeeded") {
        toast.success(`Quota Iscrizione (€30) saldata per ${fullName}`);
      } else {
        toast.success(`Quota Iscrizione registrata in attesa di pagamento per ${fullName}`);
      }

      form.reset();
      setOpen(false);
      onSuccess?.();
    } catch (err: any) {
      console.error("Failed to create membership:", err);
      toast.error(err?.message || "Errore nella registrazione della quota");
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button className="cursor-pointer font-bold text-xs bg-amber-600 hover:bg-amber-700 text-white shadow-2xs gap-1.5">
          <Plus className="h-4 w-4" />
          <span>+ Nuova Iscrizione (€30)</span>
        </Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-[560px] p-6">
        <DialogHeader className="pb-2 border-b border-border/50">
          <DialogTitle className="text-xl font-bold flex items-center gap-2">
            <Shield className="w-5 h-5 text-amber-500" />
            <span>Nuova Iscrizione Annuale (€30.00)</span>
          </DialogTitle>
          <p className="text-xs text-muted-foreground">
            Compila i dati anagrafici per registrare la quota associativa (A.A. 2026/2027).
          </p>
        </DialogHeader>

        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-5 pt-3">
            {/* 1. Dati Anagrafici */}
            <div className="p-4 bg-muted/20 rounded-2xl border border-border/60 space-y-4">
              <div className="flex items-center gap-2 text-xs font-bold uppercase tracking-wider text-foreground">
                <User className="w-4 h-4 text-primary" />
                <span>1. Dati Anagrafici Cliente / Studente</span>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5">
                <FormField
                  control={form.control}
                  name="firstName"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel className="text-xs font-semibold">Nome *</FormLabel>
                      <FormControl>
                        <Input placeholder="Mario" className="h-10 text-sm bg-background" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="lastName"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel className="text-xs font-semibold">Cognome *</FormLabel>
                      <FormControl>
                        <Input placeholder="Rossi" className="h-10 text-sm bg-background" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="email"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel className="text-xs font-semibold">Email</FormLabel>
                      <FormControl>
                        <Input type="email" placeholder="mario.rossi@email.com" className="h-10 text-sm bg-background" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="phone"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel className="text-xs font-semibold">Telefono</FormLabel>
                      <FormControl>
                        <Input placeholder="+39 340 1234567" className="h-10 text-sm bg-background" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="taxCode"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel className="text-xs font-semibold">Codice Fiscale</FormLabel>
                      <FormControl>
                        <Input placeholder="RSSMRA80A01H501Z" className="uppercase font-mono h-10 text-sm bg-background" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="birthDate"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel className="text-xs font-semibold">Data Nascita / Età</FormLabel>
                      <FormControl>
                        <Input type="date" className="h-10 text-sm bg-background" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>
            </div>

            {/* 2. Stato e Metodo Pagamento */}
            <div className="p-4 bg-amber-500/10 border border-amber-500/25 rounded-2xl space-y-3">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2 text-xs font-bold uppercase tracking-wider text-amber-700 dark:text-amber-300">
                  <CreditCard className="w-4 h-4 text-amber-500" />
                  <span>2. Stato e Modalità di Pagamento</span>
                </div>
                <Badge variant="outline" className="font-mono font-bold text-xs bg-amber-500/20 text-amber-900 dark:text-amber-200 border-amber-500/30 px-3 py-1">
                  €30.00
                </Badge>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 items-start">
                <FormField
                  control={form.control}
                  name="status"
                  render={({ field }) => (
                    <FormItem className="space-y-1.5">
                      <FormLabel className="text-xs font-semibold">Stato Iniziale *</FormLabel>
                      <Select onValueChange={field.onChange} value={field.value}>
                        <FormControl>
                          <SelectTrigger className="h-10 text-xs bg-background cursor-pointer w-full">
                            <SelectValue placeholder="Seleziona stato" />
                          </SelectTrigger>
                        </FormControl>
                        <SelectContent>
                          <SelectItem value="pending" className="cursor-pointer text-xs font-medium">
                            🟡 In attesa (Pending)
                          </SelectItem>
                          <SelectItem value="succeeded" className="cursor-pointer text-xs font-medium">
                            🟢 Pagato subito (Saldato)
                          </SelectItem>
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
                    <FormItem className="space-y-1.5">
                      <FormLabel className="text-xs font-semibold">Metodo di Pagamento</FormLabel>
                      <Select onValueChange={field.onChange} value={field.value}>
                        <FormControl>
                          <SelectTrigger className="h-10 text-xs bg-background cursor-pointer w-full">
                            <SelectValue placeholder="Seleziona metodo" />
                          </SelectTrigger>
                        </FormControl>
                        <SelectContent>
                          <SelectItem value="cash" className="cursor-pointer text-xs">Contanti in Sede</SelectItem>
                          <SelectItem value="card" className="cursor-pointer text-xs">Carta / POS in Sede</SelectItem>
                          <SelectItem value="transfer" className="cursor-pointer text-xs">Bonifico Bancario</SelectItem>
                        </SelectContent>
                      </Select>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>

              <p className="text-[11px] text-muted-foreground/90 leading-tight pt-1 border-t border-amber-500/20 mt-1">
                💡 Se in attesa, la tessera annuale si attiverà automaticamente al momento del saldo in cassa.
              </p>
            </div>

            <div className="flex items-center justify-end gap-2.5 pt-2 border-t border-border/50">
              <Button
                type="button"
                variant="outline"
                onClick={() => setOpen(false)}
                className="cursor-pointer text-xs font-semibold h-10 px-4"
              >
                Annulla
              </Button>
              <Button
                type="submit"
                disabled={submitting}
                className="cursor-pointer text-xs font-bold bg-amber-600 hover:bg-amber-700 text-white h-10 px-5 gap-1.5 shadow-xs"
              >
                {submitting ? (
                  <Loader2 className="w-4 h-4 animate-spin" />
                ) : (
                  <>
                    <CheckCircle2 className="w-4 h-4" />
                    <span>Registra Quota (€30.00)</span>
                  </>
                )}
              </Button>
            </div>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  );
}
