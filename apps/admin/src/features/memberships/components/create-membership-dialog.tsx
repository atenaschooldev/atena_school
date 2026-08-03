"use client";

import { useState } from "react";
import { useQueryClient } from "@tanstack/react-query";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import {
  Plus,
  ShieldCheck,
  Search,
  CheckCircle2,
  AlertCircle,
  Loader2,
  CheckCheck,
} from "lucide-react";
import { api } from "@/lib/api";

interface CreateMembershipDialogProps {
  onSuccess?: () => void;
}

export function CreateMembershipDialog({ onSuccess }: CreateMembershipDialogProps) {
  const queryClient = useQueryClient();
  const [open, setOpen] = useState(false);
  const [loading, setLoading] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const [isSearchingClient, setIsSearchingClient] = useState(false);
  const [clientFound, setClientFound] = useState<boolean | null>(null);

  // Form state
  const [studentId, setStudentId] = useState<string | undefined>(undefined);
  const [fullName, setFullName] = useState("");
  const [email, setEmail] = useState("");
  const [phone, setPhone] = useState("");
  const [taxCode, setTaxCode] = useState("");
  const [birthDate, setBirthDate] = useState("");
  const [paymentMethod, setPaymentMethod] = useState("cash");

  const resetForm = () => {
    setSearchQuery("");
    setClientFound(null);
    setStudentId(undefined);
    setFullName("");
    setEmail("");
    setPhone("");
    setTaxCode("");
    setBirthDate("");
    setPaymentMethod("cash");
  };

  const handleClose = () => {
    resetForm();
    setOpen(false);
  };

  const handleLookup = async () => {
    if (!searchQuery.trim()) return;
    setIsSearchingClient(true);
    setClientFound(null);
    try {
      const res = await api.get<{
        found: boolean;
        studentId?: string;
        purchaserName?: string;
        purchaserEmail?: string;
        purchaserPhone?: string;
        purchaserTaxCode?: string;
        studentName?: string;
        studentEmail?: string;
        studentPhone?: string;
        studentTaxCode?: string;
        studentBirthDate?: string;
      }>(`/admin/bookings/lookup-client?q=${encodeURIComponent(searchQuery.trim())}`);

      setClientFound(res.found);
      if (res.found) {
        setFullName(res.studentName || res.purchaserName || "");
        setEmail(res.studentEmail || res.purchaserEmail || "");
        setPhone(res.studentPhone || res.purchaserPhone || "");
        setTaxCode(res.studentTaxCode || res.purchaserTaxCode || "");
        setBirthDate(res.studentBirthDate || "");
      } else {
        if (searchQuery.includes("@")) setEmail(searchQuery);
        else setTaxCode(searchQuery);
      }
    } catch (err) {
      console.error("Client lookup error:", err);
    } finally {
      setIsSearchingClient(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!fullName.trim() && !email.trim() && !taxCode.trim()) {
      alert("Inserisci almeno il Nome, l'Email o il Codice Fiscale.");
      return;
    }

    setLoading(true);
    try {
      await api.post("/checkout/admin/memberships/pay-fee", {
        studentId,
        fullName: fullName.trim() || undefined,
        email: email.trim() || undefined,
        phone: phone.trim() || undefined,
        taxCode: taxCode.trim() || undefined,
        birthDate: birthDate || undefined,
        paymentMethod,
      });

      queryClient.invalidateQueries({ queryKey: ["memberships"] });
      queryClient.invalidateQueries({ queryKey: ["payments"] });
      handleClose();
      if (onSuccess) onSuccess();
    } catch (err: any) {
      alert(`Errore durante la registrazione della quota: ${err?.message || "Riprova."}`);
    } finally {
      setLoading(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={(v) => { if (!v) handleClose(); else setOpen(true); }}>
      <DialogTrigger asChild>
        <Button className="cursor-pointer font-semibold gap-1.5 shadow-xs">
          <Plus className="h-4 w-4" />
          Nuova Iscrizione Annuale (€30)
        </Button>
      </DialogTrigger>

      <DialogContent className="p-0 gap-0 border-border/60 flex flex-col sm:max-w-[540px] overflow-hidden">
        <form onSubmit={handleSubmit} className="flex flex-col flex-1">
          {/* Header */}
          <div className="flex items-center gap-3 pl-6 pr-14 py-4 border-b border-border/60 bg-muted/30">
            <div className="w-9 h-9 rounded-xl bg-primary/10 flex items-center justify-center border border-primary/20 shrink-0">
              <ShieldCheck className="h-5 w-5 text-primary" />
            </div>
            <div>
              <p className="text-base font-bold leading-tight">Riscossione Quota Annuale</p>
              <p className="text-xs text-muted-foreground leading-tight">Anno Accademico 2026/2027 · €30,00</p>
            </div>
          </div>

          <div className="p-6 space-y-4 max-h-[75vh] overflow-y-auto">
            {/* Quick client search */}
            <div className="p-3.5 bg-muted/30 rounded-xl border border-border/60 space-y-2.5">
              <div className="flex items-center gap-2">
                <Search className="w-3.5 h-3.5 text-primary" />
                <p className="text-[11px] font-bold uppercase tracking-wider text-muted-foreground">Cerca Studente Esistente</p>
              </div>
              <div className="flex gap-2">
                <Input
                  placeholder="Email, Codice Fiscale, Telefono o Nome..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  onKeyDown={(e) => {
                    if (e.key === "Enter") {
                      e.preventDefault();
                      handleLookup();
                    }
                  }}
                  className="text-xs bg-background h-9"
                />
                <Button
                  type="button"
                  variant="secondary"
                  size="sm"
                  disabled={isSearchingClient || !searchQuery.trim()}
                  onClick={handleLookup}
                  className="cursor-pointer text-xs shrink-0 h-9"
                >
                  {isSearchingClient ? (
                    <><Loader2 className="w-3.5 h-3.5 mr-1.5 animate-spin" />Cerca...</>
                  ) : (
                    <><Search className="w-3.5 h-3.5 mr-1.5" />Cerca</>
                  )}
                </Button>
              </div>
              {clientFound === true && (
                <p className="text-xs text-emerald-600 dark:text-emerald-400 font-medium flex items-center gap-1.5">
                  <CheckCircle2 className="w-3.5 h-3.5 shrink-0" />
                  Studente trovato! I dati sono stati precompilati.
                </p>
              )}
              {clientFound === false && (
                <p className="text-xs text-amber-600 dark:text-amber-400 font-medium flex items-center gap-1.5">
                  <AlertCircle className="w-3.5 h-3.5 shrink-0" />
                  Nessun record trovato. Inserisci i dati manualmente.
                </p>
              )}
            </div>

            {/* Quota Badge highlight */}
            <div className="p-3.5 bg-primary/8 border border-primary/20 rounded-xl flex items-center justify-between">
              <div>
                <p className="text-xs font-bold text-primary">Quota d'Iscrizione Associazione</p>
                <p className="text-[11px] text-muted-foreground mt-0.5">Valida fino al 31 Agosto 2027</p>
              </div>
              <Badge className="text-sm font-mono font-black px-3 py-1 bg-primary text-primary-foreground">
                €30,00
              </Badge>
            </div>

            {/* Student details */}
            <div className="space-y-3">
              <div className="space-y-1">
                <label className="text-xs font-semibold">Nome e Cognome Studente *</label>
                <Input
                  placeholder="Es. Marco Rossi"
                  value={fullName}
                  onChange={(e) => setFullName(e.target.value)}
                  className="h-9 text-xs"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div className="space-y-1">
                  <label className="text-xs font-semibold">Codice Fiscale</label>
                  <Input
                    placeholder="RSSMRC95A01H501Z"
                    value={taxCode}
                    onChange={(e) => setTaxCode(e.target.value.toUpperCase())}
                    className="h-9 text-xs font-mono uppercase"
                  />
                </div>
                <div className="space-y-1">
                  <label className="text-xs font-semibold">Data di Nascita</label>
                  <Input
                    type="date"
                    value={birthDate}
                    onChange={(e) => setBirthDate(e.target.value)}
                    className="h-9 text-xs"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div className="space-y-1">
                  <label className="text-xs font-semibold">Email</label>
                  <Input
                    type="email"
                    placeholder="marco.rossi@email.com"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    className="h-9 text-xs"
                  />
                </div>
                <div className="space-y-1">
                  <label className="text-xs font-semibold">Telefono</label>
                  <Input
                    placeholder="+39 340 1234567"
                    value={phone}
                    onChange={(e) => setPhone(e.target.value)}
                    className="h-9 text-xs"
                  />
                </div>
              </div>
            </div>

            {/* Payment Method */}
            <div className="space-y-1 pt-1">
              <label className="text-xs font-semibold">Metodo di Incasso *</label>
              <Select value={paymentMethod} onValueChange={setPaymentMethod}>
                <SelectTrigger className="cursor-pointer h-9 text-xs">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="cash">💵 Contanti (In sede)</SelectItem>
                  <SelectItem value="pos">💳 POS / Carta (In sede)</SelectItem>
                  <SelectItem value="transfer">🏦 Bonifico Bancario</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>

          {/* Footer */}
          <div className="flex items-center justify-between px-6 py-3 border-t border-border/60 bg-muted/20">
            <Button type="button" variant="ghost" size="sm" onClick={handleClose} className="cursor-pointer text-xs text-muted-foreground">
              Annulla
            </Button>
            <Button type="submit" disabled={loading} size="sm" className="cursor-pointer font-bold text-xs gap-1.5">
              {loading ? (
                <><Loader2 className="w-3.5 h-3.5 animate-spin" />Registrazione...</>
              ) : (
                <><CheckCheck className="w-3.5 h-3.5" />Conferma e Registra Incasso (€30,00)</>
              )}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
}
