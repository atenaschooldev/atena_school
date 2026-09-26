"use client";

import { useState } from "react";
import { getCurrentAcademicYear } from "@atena/utils";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
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
import { User, CreditCard, Shield, CheckCircle2, Loader2 } from "lucide-react";
import { useForm } from "react-hook-form";
import { z } from "zod";
import { zodResolver } from "@hookform/resolvers/zod";
import { api } from "@/lib/api";
import { toast } from "sonner";
import { useSchoolProfile } from "@/hooks/use-school-profile";
import { useTranslation } from "@/i18n/context";

const schema = z.object({
  firstName: z.string().min(1, "Campo obbligatorio"),
  lastName: z.string().min(1, "Campo obbligatorio"),
  email: z.string().email("Email non valida").optional().or(z.literal("")),
  phone: z.string().optional().or(z.literal("")),
  taxCode: z.string().optional().or(z.literal("")),
  birthDate: z.string().optional().or(z.literal("")),
  status: z.enum(["pending", "succeeded"]),
  paymentMethod: z.string(),
});

type FormValues = z.infer<typeof schema>;

export interface CreateMembershipDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onSuccess?: () => void;
}

export function CreateMembershipDialog({
  open,
  onOpenChange,
  onSuccess,
}: CreateMembershipDialogProps) {
  const { t } = useTranslation();
  const [submitting, setSubmitting] = useState(false);
  const { profile } = useSchoolProfile();
  const feeAmount = profile?.registration_fee_eur != null ? Number(profile.registration_fee_eur) : 30;
  const academicYear = profile?.academic_year || getCurrentAcademicYear().academicYear;

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
        academicYear,
        amount: feeAmount,
      });

      toast.success(t("memberships.dialog.success") || `Quota Iscrizione (€${feeAmount}) registrata per ${fullName}`);

      form.reset();
      onOpenChange(false);
      onSuccess?.();
    } catch (err: any) {
      console.error("Failed to create membership:", err);
      toast.error(err?.message || t("memberships.dialog.error") || "Errore nella registrazione della quota");
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[560px] p-6">
        <DialogHeader className="pb-2 border-b border-border/50">
          <DialogTitle className="text-xl font-bold flex items-center gap-2 text-foreground">
            <Shield className="w-5 h-5 text-primary" />
            <span>
              {t("memberships.dialog.title") || "Nuova Iscrizione Annuale"} (€{feeAmount.toFixed(2)})
            </span>
          </DialogTitle>
          <p className="text-xs text-muted-foreground">
            {t("memberships.dialog.subtitle")?.replace("{year}", academicYear) ||
              `Compila i dati anagrafici per registrare la quota associativa (A.A. ${academicYear}).`}
          </p>
        </DialogHeader>

        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-5 pt-3">
            {/* 1. Dati Anagrafici */}
            <div className="p-4 bg-muted/20 rounded-2xl border border-border/60 space-y-4">
              <div className="flex items-center gap-2 text-xs font-bold uppercase tracking-wider text-foreground">
                <User className="w-4 h-4 text-primary" />
                <span>{t("memberships.dialog.step1") || "1. Dati Anagrafici Studente"}</span>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5">
                <FormField
                  control={form.control}
                  name="firstName"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel className="text-xs font-semibold">
                        {t("memberships.dialog.firstName") || "Nome"} *
                      </FormLabel>
                      <FormControl>
                        <Input placeholder="Mario" className="h-10 text-xs bg-background" {...field} />
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
                      <FormLabel className="text-xs font-semibold">
                        {t("memberships.dialog.lastName") || "Cognome"} *
                      </FormLabel>
                      <FormControl>
                        <Input placeholder="Rossi" className="h-10 text-xs bg-background" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5">
                <FormField
                  control={form.control}
                  name="email"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel className="text-xs font-semibold">
                        {t("memberships.dialog.email") || "Email Studente"}
                      </FormLabel>
                      <FormControl>
                        <Input type="email" placeholder="mario.rossi@email.com" className="h-10 text-xs bg-background" {...field} />
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
                      <FormLabel className="text-xs font-semibold">
                        {t("memberships.dialog.phone") || "Telefono"}
                      </FormLabel>
                      <FormControl>
                        <Input placeholder="+39 333 1234567" className="h-10 text-xs bg-background" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5">
                <FormField
                  control={form.control}
                  name="taxCode"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel className="text-xs font-semibold">
                        {t("memberships.dialog.taxCode") || "Codice Fiscale"}
                      </FormLabel>
                      <FormControl>
                        <Input
                          placeholder={t("memberships.dialog.taxCodePlaceholder") || "RSSMRA85M01H501Z"}
                          className="h-10 text-xs font-mono uppercase bg-background"
                          {...field}
                          onChange={(e) => field.onChange(e.target.value.toUpperCase())}
                        />
                      </FormControl>
                      <FormDescription className="text-[10px]">Per ricevuta e tesseramento</FormDescription>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="birthDate"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel className="text-xs font-semibold">Data di Nascita</FormLabel>
                      <FormControl>
                        <Input type="date" className="h-10 text-xs bg-background" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>
            </div>

            {/* 2. Stato e Metodo Pagamento */}
            <div className="p-4 bg-primary/5 border border-primary/20 rounded-2xl space-y-3">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2 text-xs font-bold uppercase tracking-wider text-primary">
                  <CreditCard className="w-4 h-4 text-primary" />
                  <span>{t("memberships.dialog.step2") || "2. Metodo e Stato Quota"}</span>
                </div>
                <Badge variant="outline" className="font-mono font-bold text-xs bg-primary/10 text-primary border-primary/30 px-3 py-1">
                  €{feeAmount.toFixed(2)}
                </Badge>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 items-start">
                <FormField
                  control={form.control}
                  name="status"
                  render={({ field }) => (
                    <FormItem className="space-y-1.5">
                      <FormLabel className="text-xs font-semibold">
                        {t("memberships.dialog.status") || "Stato Iniziale"} *
                      </FormLabel>
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
                      <FormLabel className="text-xs font-semibold">
                        {t("memberships.dialog.paymentMethod") || "Metodo di Pagamento"}
                      </FormLabel>
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
                          <SelectItem value="stripe" className="cursor-pointer text-xs">Stripe Online</SelectItem>
                        </SelectContent>
                      </Select>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>
            </div>

            <div className="flex items-center justify-end gap-2.5 pt-2 border-t border-border/50">
              <Button
                type="button"
                variant="outline"
                onClick={() => onOpenChange(false)}
                className="cursor-pointer text-xs font-semibold h-10 px-4"
              >
                {t("memberships.dialog.cancel") || "Annulla"}
              </Button>
              <Button
                type="submit"
                disabled={submitting}
                className="cursor-pointer text-xs font-bold bg-primary hover:bg-primary/90 text-primary-foreground h-10 px-5 gap-1.5 shadow-xs"
              >
                {submitting ? (
                  <Loader2 className="w-4 h-4 animate-spin" />
                ) : (
                  <>
                    <CheckCircle2 className="w-4 h-4" />
                    <span>{t("memberships.dialog.submit") || "Registra Quota"} (€{feeAmount.toFixed(2)})</span>
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
