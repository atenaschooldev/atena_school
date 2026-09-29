"use client";

import { useState, useEffect } from "react";
import { getCurrentAcademicYear } from "@atena/utils";
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
import { Badge } from "@/components/ui/badge";
import {
  User,
  CreditCard,
  Banknote,
  Building2,
  ShieldCheck,
  CheckCircle2,
  Clock,
  Search,
  RotateCcw,
  Loader2,
  Sparkles,
} from "lucide-react";
import { useForm } from "react-hook-form";
import { z } from "zod";
import { zodResolver } from "@hookform/resolvers/zod";
import { api } from "@/lib/api";
import { toast } from "sonner";
import { useSchoolProfile } from "@/hooks/use-school-profile";
import { useTranslation } from "@/i18n/context";
import { useQueryClient } from "@tanstack/react-query";
import { cn } from "@/lib/utils";

const schema = z.object({
  studentId: z.string().optional(),
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
  const queryClient = useQueryClient();
  const [submitting, setSubmitting] = useState(false);
  const { profile } = useSchoolProfile();
  const feeAmount = profile?.registration_fee_eur != null ? Number(profile.registration_fee_eur) : 30;
  const academicYear = profile?.academic_year || getCurrentAcademicYear().academicYear;

  // Search existing student state
  const [searchQuery, setSearchQuery] = useState("");
  const [searching, setSearching] = useState(false);
  const [selectedStudent, setSelectedStudent] = useState<{
    id?: string;
    fullName: string;
    email?: string;
    taxCode?: string;
    phone?: string;
    birthDate?: string;
  } | null>(null);

  const form = useForm<FormValues>({
    resolver: zodResolver(schema),
    defaultValues: {
      studentId: "",
      firstName: "",
      lastName: "",
      email: "",
      phone: "",
      taxCode: "",
      birthDate: "",
      status: "succeeded",
      paymentMethod: "cash",
    },
  });

  useEffect(() => {
    if (open) {
      form.reset({
        studentId: "",
        firstName: "",
        lastName: "",
        email: "",
        phone: "",
        taxCode: "",
        birthDate: "",
        status: "succeeded",
        paymentMethod: "cash",
      });
      setSelectedStudent(null);
      setSearchQuery("");
    }
  }, [open, form]);

  const handleSearchStudent = async () => {
    if (!searchQuery.trim()) return;
    setSearching(true);
    try {
      const res = await api.get<any>(
        `/admin/bookings/lookup-client?q=${encodeURIComponent(searchQuery.trim())}`
      );
      if (res.found) {
        const studentName = res.studentName || res.purchaserName || "";
        const parts = studentName.trim().split(" ");
        const fName = parts[0] || "";
        const lName = parts.slice(1).join(" ") || "";
        const taxCode = (res.studentTaxCode || res.purchaserTaxCode || "").toUpperCase();
        const email = res.studentEmail || res.purchaserEmail || "";
        const phone = res.studentPhone || res.purchaserPhone || "";
        const birthDate = res.studentBirthDate || "";

        setSelectedStudent({
          id: res.studentId,
          fullName: studentName,
          email,
          taxCode,
          phone,
          birthDate,
        });

        form.setValue("studentId", res.studentId || "");
        form.setValue("firstName", fName);
        form.setValue("lastName", lName);
        form.setValue("email", email);
        form.setValue("phone", phone);
        form.setValue("taxCode", taxCode);
        if (birthDate) form.setValue("birthDate", birthDate);

        toast.success(t("payments.clientFound") || "Anagrafica trovata!");
      } else {
        toast.error(t("payments.clientNotFound") || "Nessuno studente trovato.");
      }
    } catch {
      toast.error("Errore durante la ricerca.");
    } finally {
      setSearching(false);
    }
  };

  const handleClearSelectedStudent = () => {
    setSelectedStudent(null);
    form.reset({
      studentId: "",
      firstName: "",
      lastName: "",
      email: "",
      phone: "",
      taxCode: "",
      birthDate: "",
      status: form.getValues("status"),
      paymentMethod: form.getValues("paymentMethod"),
    });
  };

  const onSubmit = async (values: FormValues) => {
    setSubmitting(true);
    try {
      const fullName = `${values.firstName} ${values.lastName}`.trim();

      await api.post("/admin/memberships", {
        studentId: values.studentId || undefined,
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

      toast.success(
        t("memberships.dialog.success") ||
          `Quota Iscrizione (€${feeAmount.toFixed(2)}) registrata per ${fullName}`
      );

      queryClient.invalidateQueries({ queryKey: ["memberships"] });
      queryClient.invalidateQueries({ queryKey: ["memberships-metrics"] });
      queryClient.invalidateQueries({ queryKey: ["payments"] });
      queryClient.invalidateQueries({ queryKey: ["payments-summary"] });
      queryClient.invalidateQueries({ queryKey: ["students"] });

      form.reset();
      onOpenChange(false);
      onSuccess?.();
    } catch (err: any) {
      console.error("Failed to create membership:", err);
      toast.error(
        err?.message ||
          t("memberships.dialog.error") ||
          "Errore nella registrazione della quota"
      );
    } finally {
      setSubmitting(false);
    }
  };

  const currentStatus = form.watch("status");
  const currentMethod = form.watch("paymentMethod");

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[560px] p-0 overflow-hidden rounded-2xl border-border/80 shadow-2xl">
        {/* MODAL HEADER */}
        <DialogHeader className="p-5 pb-4 bg-muted/20 border-b border-border/60">
          <div className="flex items-center justify-between gap-3">
            <div className="flex items-center gap-3 min-w-0">
              <div className="w-10 h-10 rounded-xl bg-primary/10 flex items-center justify-center border border-primary/20 text-primary shrink-0 shadow-2xs">
                <ShieldCheck className="w-5 h-5" />
              </div>
              <div className="space-y-0.5 min-w-0">
                <DialogTitle className="text-base font-bold text-foreground">
                  {t("memberships.dialog.title") || "Nuova Iscrizione Annuale"}
                </DialogTitle>
                <DialogDescription className="text-xs text-muted-foreground">
                  {t("memberships.dialog.subtitle")?.replace("{year}", academicYear) ||
                    `Registra la quota associativa per l'A.A. ${academicYear}.`}
                </DialogDescription>
              </div>
            </div>

            <Badge
              variant="outline"
              className="font-mono font-bold text-xs bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border-emerald-500/20 px-2.5 py-1 rounded-lg shrink-0"
            >
              €{feeAmount.toFixed(2)}
            </Badge>
          </div>
        </DialogHeader>

        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
            <div className="p-5 space-y-4 max-h-[75vh] overflow-y-auto text-xs">
              {/* STEP 1: DATI ANAGRAFICI */}
              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-bold uppercase tracking-wider text-muted-foreground flex items-center gap-1.5">
                    <User className="w-3.5 h-3.5 text-primary" />
                    <span>{t("memberships.dialog.step1") || "1. Dati Anagrafici Studente"}</span>
                  </span>

                  {selectedStudent && (
                    <Button
                      type="button"
                      variant="ghost"
                      size="sm"
                      className="h-6 px-2 text-[11px] font-medium text-muted-foreground hover:text-foreground cursor-pointer gap-1"
                      onClick={handleClearSelectedStudent}
                    >
                      <RotateCcw className="w-3 h-3" />
                      {t("payments.changeClient") || "Cambia"}
                    </Button>
                  )}
                </div>

                {/* Quick search input */}
                {!selectedStudent && (
                  <div className="flex gap-2">
                    <div className="relative flex-1">
                      <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground pointer-events-none" />
                      <Input
                        placeholder="Cerca studente esistente per nome, email o CF..."
                        value={searchQuery}
                        onChange={(e) => setSearchQuery(e.target.value)}
                        onKeyDown={(e) => {
                          if (e.key === "Enter") {
                            e.preventDefault();
                            handleSearchStudent();
                          }
                        }}
                        className="pl-9 h-9 text-xs bg-background rounded-lg border-border/80"
                      />
                    </div>
                    <Button
                      type="button"
                      variant="secondary"
                      size="sm"
                      disabled={searching || !searchQuery.trim()}
                      onClick={handleSearchStudent}
                      className="h-9 px-3 text-xs font-semibold cursor-pointer rounded-lg shrink-0 gap-1.5"
                    >
                      {searching ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : <Search className="w-3.5 h-3.5" />}
                      <span>{t("common.search") || "Cerca"}</span>
                    </Button>
                  </div>
                )}

                {/* Form fields grid */}
                <div className="p-3.5 bg-muted/15 rounded-xl border border-border/70 space-y-3">
                  <div className="grid grid-cols-2 gap-3">
                    <FormField
                      control={form.control}
                      name="firstName"
                      render={({ field }) => (
                        <FormItem className="space-y-1">
                          <FormLabel className="text-xs font-semibold">
                            {t("memberships.dialog.firstName") || "Nome"} *
                          </FormLabel>
                          <FormControl>
                            <Input placeholder="Mario" className="h-8.5 text-xs bg-background" {...field} />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />

                    <FormField
                      control={form.control}
                      name="lastName"
                      render={({ field }) => (
                        <FormItem className="space-y-1">
                          <FormLabel className="text-xs font-semibold">
                            {t("memberships.dialog.lastName") || "Cognome"} *
                          </FormLabel>
                          <FormControl>
                            <Input placeholder="Rossi" className="h-8.5 text-xs bg-background" {...field} />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                  </div>

                  <div className="grid grid-cols-2 gap-3">
                    <FormField
                      control={form.control}
                      name="email"
                      render={({ field }) => (
                        <FormItem className="space-y-1">
                          <FormLabel className="text-xs font-semibold">
                            {t("memberships.dialog.email") || "Email"}
                          </FormLabel>
                          <FormControl>
                            <Input
                              type="email"
                              placeholder="mario.rossi@email.com"
                              className="h-8.5 text-xs bg-background"
                              {...field}
                            />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />

                    <FormField
                      control={form.control}
                      name="phone"
                      render={({ field }) => (
                        <FormItem className="space-y-1">
                          <FormLabel className="text-xs font-semibold">
                            {t("memberships.dialog.phone") || "Telefono"}
                          </FormLabel>
                          <FormControl>
                            <Input
                              placeholder="+39 333 1234567"
                              className="h-8.5 text-xs bg-background"
                              {...field}
                            />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                  </div>

                  <div className="grid grid-cols-2 gap-3">
                    <FormField
                      control={form.control}
                      name="taxCode"
                      render={({ field }) => (
                        <FormItem className="space-y-1">
                          <FormLabel className="text-xs font-semibold">
                            {t("memberships.dialog.taxCode") || "Codice Fiscale"}
                          </FormLabel>
                          <FormControl>
                            <Input
                              placeholder="RSSMRA85M01H501Z"
                              className="h-8.5 text-xs font-mono uppercase bg-background"
                              {...field}
                              onChange={(e) => field.onChange(e.target.value.toUpperCase())}
                            />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />

                    <FormField
                      control={form.control}
                      name="birthDate"
                      render={({ field }) => (
                        <FormItem className="space-y-1">
                          <FormLabel className="text-xs font-semibold">Data di Nascita</FormLabel>
                          <FormControl>
                            <Input type="date" className="h-8.5 text-xs bg-background" {...field} />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                  </div>
                </div>
              </div>

              {/* STEP 2: METODO E STATO QUOTA */}
              <div className="space-y-3">
                <span className="text-xs font-bold uppercase tracking-wider text-muted-foreground flex items-center gap-1.5">
                  <CreditCard className="w-3.5 h-3.5 text-primary" />
                  <span>{t("memberships.dialog.step2") || "2. Stato Quota e Pagamento"}</span>
                </span>

                {/* Status Toggle Cards */}
                <div className="grid grid-cols-2 gap-2.5">
                  <button
                    type="button"
                    onClick={() => form.setValue("status", "succeeded")}
                    className={cn(
                      "p-3 rounded-xl border flex items-center gap-2.5 text-left transition-all cursor-pointer",
                      currentStatus === "succeeded"
                        ? "border-emerald-500/50 bg-emerald-500/10 text-emerald-700 dark:text-emerald-300 ring-1 ring-emerald-500/30 shadow-2xs"
                        : "border-border/70 hover:border-border hover:bg-muted/40 text-muted-foreground"
                    )}
                  >
                    <CheckCircle2 className="w-4 h-4 text-emerald-500 shrink-0" />
                    <div>
                      <p className="font-bold text-xs leading-tight">Pagato subito</p>
                      <p className="text-[10px] opacity-75">Tessera attiva immediatamente</p>
                    </div>
                  </button>

                  <button
                    type="button"
                    onClick={() => form.setValue("status", "pending")}
                    className={cn(
                      "p-3 rounded-xl border flex items-center gap-2.5 text-left transition-all cursor-pointer",
                      currentStatus === "pending"
                        ? "border-amber-500/50 bg-amber-500/10 text-amber-700 dark:text-amber-300 ring-1 ring-amber-500/30 shadow-2xs"
                        : "border-border/70 hover:border-border hover:bg-muted/40 text-muted-foreground"
                    )}
                  >
                    <Clock className="w-4 h-4 text-amber-500 shrink-0" />
                    <div>
                      <p className="font-bold text-xs leading-tight">In attesa (Pending)</p>
                      <p className="text-[10px] opacity-75">Da saldare al desk</p>
                    </div>
                  </button>
                </div>

                {/* Payment Method Selector (active if succeeded) */}
                {currentStatus === "succeeded" && (
                  <div className="space-y-1.5 pt-1">
                    <label className="text-[11px] font-semibold text-muted-foreground">
                      {t("memberships.dialog.paymentMethod") || "Metodo di Pagamento"}
                    </label>
                    <div className="grid grid-cols-3 gap-2">
                      <button
                        type="button"
                        onClick={() => form.setValue("paymentMethod", "cash")}
                        className={cn(
                          "p-2.5 rounded-lg border flex flex-col items-center justify-center text-center gap-1 transition-all cursor-pointer",
                          currentMethod === "cash"
                            ? "border-primary bg-primary/10 text-primary shadow-xs ring-1 ring-primary/30"
                            : "border-border/70 hover:border-border hover:bg-muted/40 text-muted-foreground"
                        )}
                      >
                        <Banknote className="w-3.5 h-3.5" />
                        <span className="text-[11px] font-bold">Contanti</span>
                      </button>

                      <button
                        type="button"
                        onClick={() => form.setValue("paymentMethod", "card")}
                        className={cn(
                          "p-2.5 rounded-lg border flex flex-col items-center justify-center text-center gap-1 transition-all cursor-pointer",
                          currentMethod === "card"
                            ? "border-primary bg-primary/10 text-primary shadow-xs ring-1 ring-primary/30"
                            : "border-border/70 hover:border-border hover:bg-muted/40 text-muted-foreground"
                        )}
                      >
                        <CreditCard className="w-3.5 h-3.5" />
                        <span className="text-[11px] font-bold">Carta / POS</span>
                      </button>

                      <button
                        type="button"
                        onClick={() => form.setValue("paymentMethod", "transfer")}
                        className={cn(
                          "p-2.5 rounded-lg border flex flex-col items-center justify-center text-center gap-1 transition-all cursor-pointer",
                          currentMethod === "transfer"
                            ? "border-primary bg-primary/10 text-primary shadow-xs ring-1 ring-primary/30"
                            : "border-border/70 hover:border-border hover:bg-muted/40 text-muted-foreground"
                        )}
                      >
                        <Building2 className="w-3.5 h-3.5" />
                        <span className="text-[11px] font-bold">Bonifico</span>
                      </button>
                    </div>
                  </div>
                )}
              </div>

              {/* SUMMARY BOX */}
              <div className="p-3.5 rounded-xl border border-primary/20 bg-gradient-to-br from-primary/10 via-primary/[0.04] to-muted/20 flex items-center justify-between shadow-2xs">
                <div className="space-y-0.5">
                  <span className="text-xs font-bold uppercase tracking-wider text-muted-foreground flex items-center gap-1">
                    <Sparkles className="w-3.5 h-3.5 text-primary" />
                    Quota Iscrizione A.A. {academicYear}
                  </span>
                  <p className="text-[11px] text-muted-foreground">
                    {currentStatus === "succeeded" ? "Tesseramento con incasso immediato" : "Tesseramento registrato come da saldare"}
                  </p>
                </div>
                <div className="text-right">
                  <span className="text-xl font-black font-mono tracking-tight text-foreground">
                    €{feeAmount.toFixed(2)}
                  </span>
                </div>
              </div>
            </div>

            {/* MODAL FOOTER */}
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
                type="submit"
                disabled={submitting}
                className="text-xs font-bold bg-primary text-primary-foreground h-9 px-5 rounded-lg shadow-xs cursor-pointer gap-1.5"
              >
                {submitting ? (
                  <Loader2 className="w-4 h-4 animate-spin" />
                ) : (
                  <CheckCircle2 className="w-4 h-4" />
                )}
                <span>
                  {submitting
                    ? t("common.loading")
                    : `${t("memberships.dialog.submit") || "Registra Quota"} (€${feeAmount.toFixed(2)})`}
                </span>
              </Button>
            </DialogFooter>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  );
}
