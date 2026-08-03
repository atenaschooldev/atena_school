"use client";

import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Pencil, Loader2, Save, ShoppingBag } from "lucide-react";
import { useQueryClient } from "@tanstack/react-query";
import { api } from "@/lib/api";
import type { Booking } from "../types";

interface EditBookingDialogProps {
  booking: Booking | null;
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onSuccess?: () => void;
}

export function EditBookingDialog({
  booking,
  open,
  onOpenChange,
  onSuccess,
}: EditBookingDialogProps) {
  const queryClient = useQueryClient();
  const [loading, setLoading] = useState(false);

  // Form states
  const [purchaserName, setPurchaserName] = useState("");
  const [purchaserEmail, setPurchaserEmail] = useState("");
  const [purchaserPhone, setPurchaserPhone] = useState("");
  const [purchaserTaxCode, setPurchaserTaxCode] = useState("");

  const [studentName, setStudentName] = useState("");
  const [studentEmail, setStudentEmail] = useState("");
  const [studentPhone, setStudentPhone] = useState("");
  const [studentTaxCode, setStudentTaxCode] = useState("");

  const [paymentStatus, setPaymentStatus] = useState("reserved");
  const [paymentMethod, setPaymentMethod] = useState("cash");
  const [notes, setNotes] = useState("");

  useEffect(() => {
    if (booking) {
      setPurchaserName(booking.purchaser_name || "");
      setPurchaserEmail(booking.purchaser_email || "");
      setPurchaserPhone(booking.purchaser_phone || "");
      setPurchaserTaxCode(booking.purchaser_tax_code || "");

      setStudentName(booking.student_name || booking.purchaser_name || "");
      setStudentEmail(booking.student_email || booking.purchaser_email || "");
      setStudentPhone(booking.student_phone || booking.purchaser_phone || "");
      setStudentTaxCode(booking.student_tax_code || booking.purchaser_tax_code || "");

      setPaymentStatus(booking.payment_status || "reserved");
      setPaymentMethod(booking.payment_method || "cash");
      setNotes(booking.notes || "");
    }
  }, [booking]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!booking) return;

    setLoading(true);
    try {
      await api.patch(`/checkout/admin/bookings/${booking.id}`, {
        purchaser_name: purchaserName.trim(),
        purchaser_email: purchaserEmail.trim(),
        purchaser_phone: purchaserPhone.trim(),
        purchaser_tax_code: purchaserTaxCode.trim(),
        student_name: studentName.trim(),
        student_email: studentEmail.trim(),
        student_phone: studentPhone.trim(),
        student_tax_code: studentTaxCode.trim(),
        payment_status: paymentStatus,
        payment_method: paymentMethod,
        notes: notes.trim(),
      });

      queryClient.invalidateQueries({ queryKey: ["bookings"] });
      queryClient.invalidateQueries({ queryKey: ["payments"] });
      queryClient.invalidateQueries({ queryKey: ["memberships"] });

      onOpenChange(false);
      if (onSuccess) onSuccess();
    } catch (err: any) {
      alert(`Errore nell'aggiornamento dell'ordine: ${err?.message || "Riprova."}`);
    } finally {
      setLoading(false);
    }
  };

  if (!booking) return null;

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="p-0 gap-0 border-border/60 flex flex-col sm:max-w-[620px] overflow-hidden">
        <form onSubmit={handleSubmit} className="flex flex-col flex-1">
          {/* Header */}
          <div className="flex items-center gap-3 pl-6 pr-14 py-4 border-b border-border/60 bg-muted/30">
            <div className="w-9 h-9 rounded-xl bg-primary/10 flex items-center justify-center border border-primary/20 shrink-0">
              <Pencil className="h-4 w-4 text-primary" />
            </div>
            <div>
              <p className="text-base font-bold leading-tight">Modifica Ordine #{booking.id.slice(0, 8)}</p>
              <p className="text-xs text-muted-foreground leading-tight">{booking.course_name}</p>
            </div>
          </div>

          <div className="p-6 space-y-4 max-h-[75vh] overflow-y-auto text-xs">
            {/* Customer Details */}
            <div className="space-y-3">
              <div className="flex items-center gap-2">
                <p className="text-[10px] font-bold uppercase tracking-widest text-primary">Dati Cliente / Genitore</p>
                <div className="h-px flex-1 bg-border/50" />
              </div>
              <div className="grid grid-cols-2 gap-3">
                <div className="space-y-1">
                  <label className="font-semibold text-foreground">Nome e Cognome *</label>
                  <Input
                    value={purchaserName}
                    onChange={(e) => setPurchaserName(e.target.value)}
                    className="h-9 text-xs"
                    required
                  />
                </div>
                <div className="space-y-1">
                  <label className="font-semibold text-foreground">Codice Fiscale</label>
                  <Input
                    value={purchaserTaxCode}
                    onChange={(e) => setPurchaserTaxCode(e.target.value.toUpperCase())}
                    className="h-9 text-xs font-mono uppercase"
                  />
                </div>
                <div className="space-y-1">
                  <label className="font-semibold text-foreground">Email</label>
                  <Input
                    type="email"
                    value={purchaserEmail}
                    onChange={(e) => setPurchaserEmail(e.target.value)}
                    className="h-9 text-xs"
                  />
                </div>
                <div className="space-y-1">
                  <label className="font-semibold text-foreground">Telefono</label>
                  <Input
                    value={purchaserPhone}
                    onChange={(e) => setPurchaserPhone(e.target.value)}
                    className="h-9 text-xs"
                  />
                </div>
              </div>
            </div>

            {/* Student Details */}
            <div className="space-y-3 pt-2">
              <div className="flex items-center gap-2">
                <p className="text-[10px] font-bold uppercase tracking-widest text-primary">Dati Studente</p>
                <div className="h-px flex-1 bg-border/50" />
              </div>
              <div className="grid grid-cols-2 gap-3">
                <div className="space-y-1">
                  <label className="font-semibold text-foreground">Nome Studente</label>
                  <Input
                    value={studentName}
                    onChange={(e) => setStudentName(e.target.value)}
                    className="h-9 text-xs"
                  />
                </div>
                <div className="space-y-1">
                  <label className="font-semibold text-foreground">CF Studente</label>
                  <Input
                    value={studentTaxCode}
                    onChange={(e) => setStudentTaxCode(e.target.value.toUpperCase())}
                    className="h-9 text-xs font-mono uppercase"
                  />
                </div>
                <div className="space-y-1">
                  <label className="font-semibold text-foreground">Email Studente</label>
                  <Input
                    type="email"
                    value={studentEmail}
                    onChange={(e) => setStudentEmail(e.target.value)}
                    className="h-9 text-xs"
                  />
                </div>
                <div className="space-y-1">
                  <label className="font-semibold text-foreground">Telefono Studente</label>
                  <Input
                    value={studentPhone}
                    onChange={(e) => setStudentPhone(e.target.value)}
                    className="h-9 text-xs"
                  />
                </div>
              </div>
            </div>

            {/* Payment & Method */}
            <div className="space-y-3 pt-2">
              <div className="flex items-center gap-2">
                <p className="text-[10px] font-bold uppercase tracking-widest text-primary">Stato & Metodo Pagamento</p>
                <div className="h-px flex-1 bg-border/50" />
              </div>
              <div className="grid grid-cols-2 gap-3">
                <div className="space-y-1">
                  <label className="font-semibold text-foreground">Stato Pagamento</label>
                  <Select value={paymentStatus} onValueChange={setPaymentStatus}>
                    <SelectTrigger className="cursor-pointer h-9 text-xs">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="reserved">⏳ Da Saldare (Acconto / Riservato)</SelectItem>
                      <SelectItem value="completed">✓ Pagato (Saldo Completo)</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div className="space-y-1">
                  <label className="font-semibold text-foreground">Metodo di Pagamento</label>
                  <Select value={paymentMethod} onValueChange={setPaymentMethod}>
                    <SelectTrigger className="cursor-pointer h-9 text-xs">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="cash">💵 Contanti (In sede)</SelectItem>
                      <SelectItem value="pos">💳 POS / Carta (In sede)</SelectItem>
                      <SelectItem value="transfer">🏦 Bonifico Bancario</SelectItem>
                      <SelectItem value="stripe">🔗 Stripe (Online)</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>
            </div>

            {/* Notes */}
            <div className="space-y-1 pt-1">
              <label className="font-semibold text-foreground">Note Reception</label>
              <Textarea
                placeholder="Note interne sul pagamento o cliente..."
                value={notes}
                onChange={(e) => setNotes(e.target.value)}
                className="text-xs min-h-[60px]"
              />
            </div>
          </div>

          {/* Footer */}
          <div className="flex items-center justify-between px-6 py-3 border-t border-border/60 bg-muted/20">
            <Button
              type="button"
              variant="ghost"
              size="sm"
              onClick={() => onOpenChange(false)}
              className="cursor-pointer text-xs text-muted-foreground"
            >
              Annulla
            </Button>
            <Button
              type="submit"
              disabled={loading}
              size="sm"
              className="cursor-pointer font-bold text-xs gap-1.5"
            >
              {loading ? (
                <><Loader2 className="w-3.5 h-3.5 animate-spin" />Salvataggio...</>
              ) : (
                <><Save className="w-3.5 h-3.5" />Salva Modifiche</>
              )}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
}
