"use client";

import { useState } from "react";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Checkbox } from "@/components/ui/checkbox";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import {
  Search,
  Banknote,
  CreditCard,
  Building2,
  CheckCircle2,
  AlertCircle,
  User,
  Plus,
  Receipt,
  FileText,
} from "lucide-react";
import { toast } from "sonner";
import { useQueryClient } from "@tanstack/react-query";
import { api } from "@/lib/api";
import { formatCurrency } from "@atena/utils";

interface UniversalPosCheckoutModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  defaultFeeOnly?: boolean;
  preselectedBooking?: {
    id: string;
    purchaserName: string;
    purchaserEmail: string;
    purchaserTaxCode?: string;
    courseName?: string;
    outstandingEstimate?: number;
  } | null;
}

export function UniversalPosCheckoutModal({
  open,
  onOpenChange,
  defaultFeeOnly = false,
  preselectedBooking,
}: UniversalPosCheckoutModalProps) {
  const queryClient = useQueryClient();

  const [searchQuery, setSearchQuery] = useState("");
  const [searching, setSearching] = useState(false);
  const [selectedClient, setSelectedClient] = useState<{
    bookingId?: string;
    name: string;
    email: string;
    taxCode?: string;
    phone?: string;
    courseName?: string;
    outstandingEstimate?: number;
  } | null>(
    preselectedBooking
      ? {
          bookingId: preselectedBooking.id,
          name: preselectedBooking.purchaserName,
          email: preselectedBooking.purchaserEmail,
          taxCode: preselectedBooking.purchaserTaxCode,
          courseName: preselectedBooking.courseName,
          outstandingEstimate: preselectedBooking.outstandingEstimate,
        }
      : null
  );

  // Checkbox states for atomic payment items
  const [payCourse, setPayCourse] = useState(!defaultFeeOnly);
  const [courseAmount, setCourseAmount] = useState<number>(
    preselectedBooking?.outstandingEstimate ?? 0
  );

  const [payRegistrationFee, setPayRegistrationFee] = useState(defaultFeeOnly);
  const [registrationFeeAmount] = useState<number>(30);

  const [paymentMethod, setPaymentMethod] = useState<"cash" | "pos" | "bank_transfer">("cash");
  const [notes, setNotes] = useState("");
  const [submitting, setSubmitting] = useState(false);

  const handleSearchClient = async () => {
    if (!searchQuery.trim()) return;
    setSearching(true);
    try {
      const res = await api.get<any>(
        `/admin/bookings/lookup-client?q=${encodeURIComponent(searchQuery.trim())}`
      );
      if (res.found) {
        const outstanding = Number(res.outstandingEstimate ?? res.totalPrice ?? 0);
        setSelectedClient({
          bookingId: res.bookingId || res.id,
          name: res.studentName || res.purchaserName || "Cliente",
          email: res.studentEmail || res.purchaserEmail || "",
          taxCode: res.studentTaxCode || res.purchaserTaxCode || "",
          phone: res.studentPhone || res.purchaserPhone || "",
          courseName: res.courseName || res.course_name,
          outstandingEstimate: outstanding,
        });
        if (outstanding > 0) {
          setCourseAmount(outstanding);
          setPayCourse(true);
        }
        toast.success("Anagrafica cliente trovata!");
      } else {
        toast.error("Nessun cliente trovato con questi parametri.");
      }
    } catch (e: any) {
      toast.error(e.message || "Errore durante la ricerca");
    } finally {
      setSearching(false);
    }
  };

  const totalPayable =
    (payCourse ? courseAmount : 0) +
    (payRegistrationFee ? registrationFeeAmount : 0);

  const handleSubmitCheckout = async () => {
    if (!selectedClient && !searchQuery.trim()) {
      toast.error("Seleziona o cerca prima un cliente");
      return;
    }
    if (totalPayable <= 0) {
      toast.error("Seleziona almeno una voce di pagamento");
      return;
    }

    setSubmitting(true);
    try {
      const items = [];
      if (payCourse && courseAmount > 0) {
        items.push({
          type: "payment",
          amount: courseAmount,
          description: selectedClient?.courseName
            ? `Quota Corso: ${selectedClient.courseName}`
            : "Quota Corso",
        });
      }
      if (payRegistrationFee) {
        items.push({
          type: "registration_fee",
          amount: registrationFeeAmount,
          description: "Quota Iscrizione Annuale €30",
        });
      }

      await api.post("/admin/payments/pos-checkout", {
        bookingId: selectedClient?.bookingId,
        purchaserName: selectedClient?.name || searchQuery,
        purchaserEmail: selectedClient?.email,
        purchaserTaxCode: selectedClient?.taxCode,
        paymentMethod,
        items,
        notes,
      });

      toast.success("Incasso registrato con successo!");
      queryClient.invalidateQueries({ queryKey: ["payments"] });
      queryClient.invalidateQueries({ queryKey: ["payments-summary"] });
      queryClient.invalidateQueries({ queryKey: ["bookings"] });
      queryClient.invalidateQueries({ queryKey: ["memberships"] });

      onOpenChange(false);
      setSelectedClient(null);
      setSearchQuery("");
      setNotes("");
    } catch (e: any) {
      toast.error(e.message || "Errore nella registrazione dell'incasso");
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[540px] p-0 overflow-hidden">
        <DialogHeader className="p-5 bg-muted/20 border-b">
          <div className="flex items-center gap-2.5">
            <div className="w-9 h-9 rounded-xl bg-primary/10 flex items-center justify-center border border-primary/20">
              <Receipt className="w-5 h-5 text-primary" />
            </div>
            <div>
              <DialogTitle className="text-base font-bold">Registrazione Incasso in Sede</DialogTitle>
              <DialogDescription className="text-xs">
                Emissione scontrino e registrazione pagamenti per corsi, tessere e lezioni
              </DialogDescription>
            </div>
          </div>
        </DialogHeader>

        <div className="p-5 space-y-5 max-h-[75vh] overflow-y-auto text-xs">
          {/* STEP 1: CLIENT LOOKUP */}
          <div className="space-y-2">
            <Label className="text-xs font-bold uppercase tracking-wider text-muted-foreground flex items-center gap-1">
              <User className="w-3.5 h-3.5 text-primary" /> 1. Cliente / Studente
            </Label>

            {selectedClient ? (
              <div className="p-3 bg-primary/5 border border-primary/20 rounded-xl flex items-center justify-between">
                <div>
                  <p className="font-bold text-sm text-foreground">{selectedClient.name}</p>
                  <p className="text-xs text-muted-foreground">
                    {selectedClient.email} {selectedClient.taxCode ? `• CF: ${selectedClient.taxCode}` : ""}
                  </p>
                  {selectedClient.courseName && (
                    <p className="text-[11px] text-primary font-medium mt-0.5">
                      Corso: {selectedClient.courseName}
                    </p>
                  )}
                </div>
                <Button
                  type="button"
                  variant="ghost"
                  size="sm"
                  className="text-xs h-7 text-muted-foreground hover:text-foreground cursor-pointer"
                  onClick={() => setSelectedClient(null)}
                >
                  Cambia
                </Button>
              </div>
            ) : (
              <div className="flex gap-2">
                <Input
                  placeholder="Nome, Email o Codice Fiscale del cliente..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  onKeyDown={(e) => {
                    if (e.key === "Enter") {
                      e.preventDefault();
                      handleSearchClient();
                    }
                  }}
                  className="h-9 text-xs bg-background"
                />
                <Button
                  type="button"
                  variant="secondary"
                  size="sm"
                  disabled={searching || !searchQuery.trim()}
                  onClick={handleSearchClient}
                  className="h-9 px-3 text-xs cursor-pointer"
                >
                  <Search className="w-3.5 h-3.5 mr-1" />
                  Cerca
                </Button>
              </div>
            )}
          </div>

          {/* STEP 2: ITEMS SELECTOR (CHECKBOXES) */}
          <div className="space-y-3">
            <Label className="text-xs font-bold uppercase tracking-wider text-muted-foreground flex items-center gap-1">
              <FileText className="w-3.5 h-3.5 text-primary" /> 2. Voci dello Scontrino
            </Label>

            <div className="space-y-2 border rounded-xl p-3 bg-card/60">
              {/* Option A: Course Fee */}
              <div className="flex items-center justify-between p-2 rounded-lg border bg-background">
                <div className="flex items-center space-x-2.5">
                  <Checkbox
                    id="item-course"
                    checked={payCourse}
                    onCheckedChange={(v) => setPayCourse(Boolean(v))}
                  />
                  <label htmlFor="item-course" className="text-xs font-semibold cursor-pointer">
                    {selectedClient?.courseName
                      ? `Quota Corso: ${selectedClient.courseName}`
                      : "Quota Corso"}
                  </label>
                </div>
                {payCourse && (
                  <div className="flex items-center gap-1">
                    <span className="text-xs text-muted-foreground">€</span>
                    <Input
                      type="number"
                      value={courseAmount}
                      onChange={(e) => setCourseAmount(Number(e.target.value))}
                      className="w-20 h-7 text-xs font-mono font-bold text-right"
                    />
                  </div>
                )}
              </div>

              {/* Option B: Registration Fee €30 */}
              <div className="flex items-center justify-between p-2 rounded-lg border bg-background">
                <div className="flex items-center space-x-2.5">
                  <Checkbox
                    id="item-fee"
                    checked={payRegistrationFee}
                    onCheckedChange={(v) => setPayRegistrationFee(Boolean(v))}
                  />
                  <label htmlFor="item-fee" className="text-xs font-semibold cursor-pointer">
                    Quota Annuale Iscrizione (€30.00)
                  </label>
                </div>
                <span className="font-bold font-mono text-xs text-emerald-600 dark:text-emerald-400">
                  €30.00
                </span>
              </div>
            </div>
          </div>

          {/* STEP 3: PAYMENT METHOD */}
          <div className="space-y-2">
            <Label className="text-xs font-bold uppercase tracking-wider text-muted-foreground flex items-center gap-1">
              <Banknote className="w-3.5 h-3.5 text-primary" /> 3. Metodo di Pagamento
            </Label>
            <div className="grid grid-cols-3 gap-2">
              <Button
                type="button"
                variant={paymentMethod === "cash" ? "default" : "outline"}
                className="h-10 text-xs font-bold cursor-pointer"
                onClick={() => setPaymentMethod("cash")}
              >
                <Banknote className="w-3.5 h-3.5 mr-1" /> Contanti
              </Button>
              <Button
                type="button"
                variant={paymentMethod === "pos" ? "default" : "outline"}
                className="h-10 text-xs font-bold cursor-pointer"
                onClick={() => setPaymentMethod("pos")}
              >
                <CreditCard className="w-3.5 h-3.5 mr-1" /> Carta / POS
              </Button>
              <Button
                type="button"
                variant={paymentMethod === "bank_transfer" ? "default" : "outline"}
                className="h-10 text-xs font-bold cursor-pointer"
                onClick={() => setPaymentMethod("bank_transfer")}
              >
                <Building2 className="w-3.5 h-3.5 mr-1" /> Bonifico
              </Button>
            </div>
          </div>

          {/* TOTAL PAYABLE SUMMARY BOX */}
          <div className="p-4 bg-gradient-to-br from-primary/10 via-muted/30 to-muted/20 border border-primary/20 rounded-xl flex items-center justify-between">
            <span className="font-bold text-sm text-foreground">Totale da Incassare:</span>
            <span className="text-xl font-extrabold font-mono text-primary">
              {formatCurrency(totalPayable)}
            </span>
          </div>

          {/* NOTES */}
          <div className="space-y-1">
            <Label className="text-[11px] text-muted-foreground">Note interne (opzionale)</Label>
            <Textarea
              placeholder="Note su sconto, scontrino o numero ricevuta..."
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              className="h-16 text-xs bg-background"
            />
          </div>
        </div>

        {/* FOOTER ACTIONS */}
        <div className="p-4 bg-muted/30 border-t flex items-center justify-between">
          <Button
            type="button"
            variant="ghost"
            className="text-xs cursor-pointer font-semibold"
            onClick={() => onOpenChange(false)}
          >
            Annulla
          </Button>

          <Button
            type="button"
            disabled={submitting || totalPayable <= 0}
            onClick={handleSubmitCheckout}
            className="text-xs font-bold bg-primary text-primary-foreground px-5 cursor-pointer"
          >
            <CheckCircle2 className="w-4 h-4 mr-1.5" />
            {submitting ? "Elaborazione..." : `Registra Incasso (${formatCurrency(totalPayable)})`}
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
}
