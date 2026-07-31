import { useState } from "react";
import type { Booking } from "../types/booking";
import { usePayments } from "@/features/payments/hooks/use-payments";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from "@/components/ui/dialog";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  User,
  Mail,
  Phone,
  CreditCard,
  Calendar,
  Clock,
  CheckCircle2,
  FileText,
  Building2,
  GraduationCap,
  Sparkles,
  Trash2,
  ExternalLink,
  AlertCircle,
  Plus,
  Receipt,
} from "lucide-react";
import { format } from "date-fns";
import { it } from "date-fns/locale";

const DAYS_IT = ["", "Lunedì", "Martedì", "Mercoledì", "Giovedì", "Venerdì", "Sabato", "Domenica"];

function formatScheduleText(days?: number[] | null, startTime?: string | null, endTime?: string | null) {
  if (!days || days.length === 0 || !startTime) {
    return "Flessibile / Da concordare";
  }
  const dayNames = days.map((d) => DAYS_IT[d] || `Giorno ${d}`).join(" e ");
  if (endTime) {
    return `${dayNames} ${startTime}-${endTime}`;
  }
  return `${dayNames} ${startTime}`;
}

interface BookingDetailDialogProps {
  booking: Booking | null;
  isOpen: boolean;
  onClose: () => void;
  onUpdateStatus?: (id: string, paymentStatus: string, scheduleStatus?: string) => void;
  onDelete?: (id: string) => Promise<boolean>;
}

export function BookingDetailDialog({
  booking,
  isOpen,
  onClose,
  onUpdateStatus,
  onDelete,
}: BookingDetailDialogProps) {
  const [confirmOpen, setConfirmOpen] = useState(false);
  const [deleting, setDeleting] = useState(false);
  const [addPaymentOpen, setAddPaymentOpen] = useState(false);

  // New Payment Form State
  const [newPaymentAmount, setNewPaymentAmount] = useState("");
  const [newPaymentMethod, setNewPaymentMethod] = useState("cash");
  const [newPaymentType, setNewPaymentType] = useState("payment");
  const [newPaymentNotes, setNewPaymentNotes] = useState("");

  const { payments, loading: paymentsLoading, createPayment, refresh: refreshPayments } = usePayments(
    booking?.id,
  );

  if (!booking) return null;

  const isCompleted = booking.payment_status === "completed" || booking.payment_status === "paid";
  const isReserved = booking.payment_status === "reserved";
  const isDifferentStudent = booking.student_name && booking.purchaser_name !== booking.student_name;

  const formattedSchedule = formatScheduleText(
    booking.schedule_days,
    booking.start_time,
    booking.end_time,
  );

  const formattedDate = booking.created_at
    ? format(new Date(booking.created_at), "d MMMM yyyy 'alle' HH:mm", { locale: it })
    : "N/D";

  const handleAddPayment = async () => {
    if (!newPaymentAmount || Number(newPaymentAmount) <= 0) return;
    await createPayment({
      bookingId: booking.id,
      amount: Number(newPaymentAmount),
      paymentMethod: newPaymentMethod,
      type: newPaymentType,
      notes: newPaymentNotes || undefined,
    });
    setNewPaymentAmount("");
    setNewPaymentNotes("");
    setAddPaymentOpen(false);
    refreshPayments();
    if (onUpdateStatus) {
      onUpdateStatus(booking.id, "completed");
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={(open) => !open && onClose()}>
      <DialogContent className="max-w-3xl p-0 gap-0 overflow-hidden">
        {/* Header Bar */}
        <div className="p-6 pb-4 border-b bg-muted/20 space-y-3">
          <div className="flex items-center justify-between gap-2">
            <div className="flex items-center gap-2">
              <Badge variant="outline" className="font-mono text-xs text-muted-foreground bg-background">
                #{booking.id.slice(0, 8)}
              </Badge>
              {isDifferentStudent && (
                <Badge variant="secondary" className="bg-amber-50 text-amber-700 dark:bg-amber-950/30 dark:text-amber-400 font-medium">
                  Acquisto per figlio / terzi
                </Badge>
              )}
            </div>

            <Badge
              variant="secondary"
              className={
                isCompleted
                  ? "text-emerald-600 bg-emerald-50 dark:text-emerald-400 dark:bg-emerald-900/20 font-medium"
                  : isReserved
                    ? "text-amber-600 bg-amber-50 dark:text-amber-400 dark:bg-amber-900/20 font-medium"
                    : "text-sky-600 bg-sky-50 dark:text-sky-400 dark:bg-sky-900/20 font-medium"
              }
            >
              {isCompleted
                ? "Pagato Online"
                : isReserved
                  ? "Da Saldare in Sede"
                  : "In Coordinamento"}
            </Badge>
          </div>

          <div>
            <DialogTitle className="text-xl font-bold tracking-tight text-foreground">
              {booking.course_name}
            </DialogTitle>
            <DialogDescription className="text-xs text-muted-foreground flex items-center gap-1.5 mt-1">
              <Calendar className="w-3.5 h-3.5" />
              <span>Ordinato il {formattedDate}</span>
            </DialogDescription>
          </div>
        </div>

        {/* Content Body */}
        <div className="p-6 space-y-6 max-h-[70vh] overflow-y-auto text-sm">
          {/* Section 1: Customer & Student Details */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {/* Acquirente */}
            <div className="rounded-lg border p-4 bg-card space-y-3">
              <div className="flex items-center gap-2 text-xs font-semibold text-muted-foreground uppercase tracking-wider">
                <User className="w-4 h-4 text-primary" />
                <span>Acquirente / Genitore</span>
              </div>
              <div className="space-y-2 text-xs">
                <div>
                  <span className="text-[11px] text-muted-foreground block">Nome e Cognome</span>
                  <p className="font-semibold text-sm text-foreground">{booking.purchaser_name || "N/D"}</p>
                </div>
                <div className="grid grid-cols-1 gap-1.5 pt-1 border-t">
                  <p className="text-muted-foreground flex items-center gap-2">
                    <Mail className="w-3.5 h-3.5 text-primary shrink-0" />
                    <span className="font-medium text-foreground">{booking.purchaser_email || "N/D"}</span>
                  </p>
                  {booking.purchaser_phone && (
                    <p className="text-muted-foreground flex items-center gap-2">
                      <Phone className="w-3.5 h-3.5 text-primary shrink-0" />
                      <span className="font-medium text-foreground">{booking.purchaser_phone}</span>
                    </p>
                  )}
                  {booking.purchaser_tax_code && (
                    <p className="text-muted-foreground flex items-center gap-2 font-mono">
                      <FileText className="w-3.5 h-3.5 text-primary shrink-0" />
                      <span>CF: <strong className="text-foreground">{booking.purchaser_tax_code}</strong></span>
                    </p>
                  )}
                </div>
              </div>
            </div>

            {/* Studente */}
            <div className="rounded-lg border p-4 bg-card space-y-3">
              <div className="flex items-center gap-2 text-xs font-semibold text-muted-foreground uppercase tracking-wider">
                <GraduationCap className="w-4 h-4 text-primary" />
                <span>Studente / Alunno</span>
              </div>
              <div className="space-y-2 text-xs">
                <div>
                  <span className="text-[11px] text-muted-foreground block">Nome e Cognome</span>
                  <p className="font-semibold text-sm text-foreground">
                    {booking.student_name || booking.purchaser_name || "N/D"}
                  </p>
                </div>
                <div className="grid grid-cols-1 gap-1.5 pt-1 border-t">
                  {(booking.student_email || booking.purchaser_email) && (
                    <p className="text-muted-foreground flex items-center gap-2">
                      <Mail className="w-3.5 h-3.5 text-primary shrink-0" />
                      <span className="font-medium text-foreground">
                        {booking.student_email || booking.purchaser_email}
                      </span>
                    </p>
                  )}
                  {booking.student_phone && (
                    <p className="text-muted-foreground flex items-center gap-2">
                      <Phone className="w-3.5 h-3.5 text-primary shrink-0" />
                      <span className="font-medium text-foreground">{booking.student_phone}</span>
                    </p>
                  )}
                  {booking.student_birth_date && (
                    <p className="text-muted-foreground flex items-center gap-2">
                      <Calendar className="w-3.5 h-3.5 text-primary shrink-0" />
                      <span>Nato il: <strong className="text-foreground">{
                        new Date(booking.student_birth_date).toLocaleDateString("it-IT", {
                          day: "2-digit",
                          month: "2-digit",
                          year: "numeric",
                        })
                      }</strong></span>
                    </p>
                  )}
                  {booking.student_tax_code && (
                    <p className="text-muted-foreground flex items-center gap-2 font-mono">
                      <FileText className="w-3.5 h-3.5 text-primary shrink-0" />
                      <span>CF: <strong className="text-foreground">{booking.student_tax_code}</strong></span>
                    </p>
                  )}
                </div>
              </div>
            </div>
          </div>

          {/* Section 2: Schedule */}
          <div className="rounded-lg border p-4 bg-card space-y-3">
            <div className="flex items-center gap-2 text-xs font-semibold text-muted-foreground uppercase tracking-wider">
              <Clock className="w-4 h-4 text-primary" />
              <span>Orario e Calendario</span>
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs">
              <div className="space-y-0.5">
                <span className="text-muted-foreground">Stato schedulazione</span>
                <p className="font-semibold text-foreground">
                  {booking.scheduling_status === "confirmed" || booking.scheduling_status === "scheduled"
                    ? "Confermato"
                    : "Da concordare"}
                </p>
              </div>
              <div className="space-y-0.5">
                <span className="text-muted-foreground">Frequenza oraria</span>
                <p className="font-semibold text-foreground">{formattedSchedule}</p>
              </div>
            </div>
          </div>

          {/* Section 3: Payments Table & History (Supabase `payments`) */}
          <div className="rounded-lg border p-4 bg-card space-y-3">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2 text-xs font-semibold text-muted-foreground uppercase tracking-wider">
                <Receipt className="w-4 h-4 text-primary" />
                <span>Storico Transazioni & Pagamenti</span>
              </div>

              <Button
                size="sm"
                variant="outline"
                className="h-7 text-xs font-medium cursor-pointer gap-1"
                onClick={() => setAddPaymentOpen(true)}
              >
                <Plus className="w-3.5 h-3.5" /> Registra Pagamento
              </Button>
            </div>

            {paymentsLoading ? (
              <div className="py-4 text-center text-xs text-muted-foreground">
                Caricamento transazioni...
              </div>
            ) : payments.length > 0 ? (
              <div className="space-y-2 border-t pt-3">
                {payments.map((p) => {
                  const pMethod = p.paymentMethod || p.payment_method;
                  const dateVal = p.createdAt || p.created_at;
                  const txId = p.providerTransactionId || p.provider_transaction_id;
                  return (
                    <div
                      key={p.id}
                      className="flex flex-col sm:flex-row sm:items-center justify-between p-3 rounded-md bg-muted/40 border text-xs gap-2"
                    >
                      <div className="space-y-0.5">
                        <div className="flex items-center gap-2">
                          <span className="font-semibold text-foreground">
                            {p.type === "registration_fee" ? "Quota Iscrizione" : "Pagamento Corso"}
                          </span>
                          <Badge
                            variant="secondary"
                            className={
                              p.status === "succeeded"
                                ? "bg-emerald-50 text-emerald-700 text-[10px]"
                                : "bg-amber-50 text-amber-700 text-[10px]"
                            }
                          >
                            {p.status === "succeeded" ? "Completato" : p.status}
                          </Badge>
                        </div>
                        <div className="text-[11px] text-muted-foreground flex items-center gap-2">
                          <span className="capitalize">{pMethod || "N/D"}</span>
                          <span>•</span>
                          <span>
                            {dateVal
                              ? new Date(dateVal).toLocaleDateString("it-IT", {
                                day: "2-digit",
                                month: "short",
                                year: "numeric",
                                hour: "2-digit",
                                minute: "2-digit",
                              })
                              : "N/D"}
                          </span>
                          {p.notes && (
                            <>
                              <span>•</span>
                              <span className="italic">{p.notes}</span>
                            </>
                          )}
                        </div>
                      </div>

                      <div className="flex items-center gap-3 justify-between sm:justify-end">
                        {txId && (
                          <a
                            href={`https://dashboard.stripe.com/payments/${txId}`}
                            target="_blank"
                            rel="noreferrer"
                            className="inline-flex items-center gap-1 text-[11px] text-primary hover:underline font-mono"
                          >
                            <span>{txId.slice(0, 14)}...</span>
                            <ExternalLink className="w-3 h-3" />
                          </a>
                        )}
                        <span className="font-bold text-sm text-foreground font-mono">
                          €{Number(p.amount).toFixed(2)}
                        </span>
                      </div>
                    </div>
                  );
                })}
              </div>
            ) : (
              <div className="py-4 text-center text-xs text-muted-foreground border-t pt-3">
                Nessuna transazione registrata nel database per questa prenotazione.
              </div>
            )}
          </div>

          {/* Section 4: Notes */}
          {booking.notes && (
            <div className="rounded-lg border bg-amber-50/50 dark:bg-amber-950/10 border-amber-200 dark:border-amber-900/30 p-3.5 text-xs space-y-1">
              <p className="font-semibold text-amber-800 dark:text-amber-400 flex items-center gap-1.5">
                <Sparkles className="w-3.5 h-3.5" />
                <span>Note allegate:</span>
              </p>
              <p className="text-amber-900 dark:text-amber-300 leading-relaxed">{booking.notes}</p>
            </div>
          )}
        </div>

        {/* Single Row Footer Bar */}
        <div className="p-4 bg-muted/20 border-t flex flex-col-reverse sm:flex-row sm:items-center sm:justify-between gap-3">
          <div className="flex items-center gap-2 flex-wrap">
            {onUpdateStatus && (
              <Button
                size="sm"
                variant={isCompleted ? "outline" : "default"}
                className="font-medium text-xs cursor-pointer h-9"
                onClick={() => {
                  onUpdateStatus(booking.id, isCompleted ? "reserved" : "completed");
                }}
              >
                {isCompleted ? (
                  <>
                    <AlertCircle className="w-4 h-4 mr-1.5 text-amber-500" />
                    Segna Da Saldare
                  </>
                ) : (
                  <>
                    <CheckCircle2 className="w-4 h-4 mr-1.5 text-emerald-500" />
                    Segna Come Pagato
                  </>
                )}
              </Button>
            )}
            <a
              href="https://dashboard.stripe.com/payments"
              target="_blank"
              rel="noreferrer"
              className="inline-flex items-center"
            >
              <Button size="sm" variant="outline" className="font-medium text-xs cursor-pointer h-9 gap-1.5">
                Stripe Dashboard <ExternalLink className="w-3.5 h-3.5 text-muted-foreground" />
              </Button>
            </a>
          </div>

          <div className="flex items-center gap-2 justify-end">
            {onDelete && (
              <Button
                size="sm"
                variant="ghost"
                className="font-medium text-xs cursor-pointer h-9 text-destructive hover:bg-destructive/10 hover:text-destructive"
                onClick={() => setConfirmOpen(true)}
              >
                <Trash2 className="w-4 h-4 mr-1.5" />
                Elimina
              </Button>
            )}
            <Button variant="outline" size="sm" onClick={onClose} className="font-medium text-xs cursor-pointer h-9">
              Chiudi
            </Button>
          </div>
        </div>
      </DialogContent>

      {/* Manual Payment Modal */}
      <Dialog open={addPaymentOpen} onOpenChange={setAddPaymentOpen}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>Registra Pagamento Manuale</DialogTitle>
            <DialogDescription>
              Aggiungi una transazione effettuata in sede per questo ordine.
            </DialogDescription>
          </DialogHeader>

          <div className="space-y-4 py-2">
            <div className="space-y-2">
              <Label className="text-xs font-medium">Importo (€)</Label>
              <Input
                type="number"
                step="0.01"
                placeholder="Es. 150.00"
                value={newPaymentAmount}
                onChange={(e) => setNewPaymentAmount(e.target.value)}
              />
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label className="text-xs font-medium">Metodo</Label>
                <Select value={newPaymentMethod} onValueChange={setNewPaymentMethod}>
                  <SelectTrigger className="cursor-pointer">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="cash">Contanti</SelectItem>
                    <SelectItem value="pos">POS / Carta</SelectItem>
                    <SelectItem value="transfer">Bonifico</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-2">
                <Label className="text-xs font-medium">Tipo</Label>
                <Select value={newPaymentType} onValueChange={setNewPaymentType}>
                  <SelectTrigger className="cursor-pointer">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="payment">Pagamento Corso</SelectItem>
                    <SelectItem value="registration_fee">Quota Iscrizione</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>

            <div className="space-y-2">
              <Label className="text-xs font-medium">Note (opzionale)</Label>
              <Input
                placeholder="Es. Saldo in contanti consegnato in segreteria"
                value={newPaymentNotes}
                onChange={(e) => setNewPaymentNotes(e.target.value)}
              />
            </div>
          </div>

          <DialogFooter>
            <Button variant="outline" size="sm" onClick={() => setAddPaymentOpen(false)}>
              Annulla
            </Button>
            <Button size="sm" onClick={handleAddPayment} className="cursor-pointer">
              Salva Pagamento
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Delete Confirmation Alert */}
      <AlertDialog open={confirmOpen} onOpenChange={setConfirmOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Eliminare la prenotazione?</AlertDialogTitle>
            <AlertDialogDescription>
              Verranno eliminati lezioni e storico collegati. L&apos;azione non può essere annullata.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel disabled={deleting}>Annulla</AlertDialogCancel>
            <AlertDialogAction
              disabled={deleting}
              className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
              onClick={async (e) => {
                e.preventDefault();
                if (!onDelete) return;
                setDeleting(true);
                const ok = await onDelete(booking.id);
                setDeleting(false);
                if (ok) setConfirmOpen(false);
              }}
            >
              {deleting ? "Eliminazione..." : "Elimina"}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </Dialog>
  );
}
