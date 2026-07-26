import { useState } from "react";
import { BookingOrder } from "../types/booking";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
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
  Tag,
  GraduationCap,
  Sparkles,
  Trash2,
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
  booking: BookingOrder | null;
  isOpen: boolean;
  onClose: () => void;
  onUpdateStatus?: (id: string, paymentStatus: "paid" | "reserved" | "pending_payment", scheduleStatus?: "scheduled" | "pending_coordination" | "confirmed") => void;
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

  if (!booking) return null;

  const isPaid = booking.payment_status === "paid";
  const isReserved = booking.payment_status === "reserved";
  const isLead = booking.scheduling_status === "pending_coordination";
  const isChild = booking.is_for_child || booking.purchaser_name !== booking.student_name;

  const formattedSchedule = formatScheduleText(
    booking.schedule_days,
    booking.start_time,
    booking.end_time
  );

  return (
    <Dialog open={isOpen} onOpenChange={(open) => !open && onClose()}>
      <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto p-6 sm:p-8 rounded-3xl">
        <DialogHeader className="space-y-3 border-b pb-4">
          <div className="flex items-center justify-between gap-2 flex-wrap">
            <div className="flex items-center gap-2">
              <Badge variant="outline" className="font-mono text-xs text-muted-foreground">
                #{booking.id.slice(0, 8)}
              </Badge>
              {isChild && (
                <Badge className="bg-amber-500/10 text-amber-600 border-amber-500/20 font-bold">
                  Per Mio Figlio (Bambino)
                </Badge>
              )}
            </div>

            <div className="flex items-center gap-2">
              <Badge
                className={
                  isPaid
                    ? "bg-emerald-500/10 text-emerald-600 border-emerald-500/20 font-bold"
                    : isReserved
                      ? "bg-amber-500/10 text-amber-600 border-amber-500/20 font-bold"
                      : "bg-slate-500/10 text-slate-600 border-slate-500/20 font-bold"
                }
              >
                {isPaid ? "Pagato Online (Stripe)" : isReserved ? "Paga in Sede" : "In Attesa"}
              </Badge>
              {isLead && (
                <Badge className="bg-sky-500/10 text-sky-600 border-sky-500/20 font-bold">
                  Lead: Da Concordare
                </Badge>
              )}
            </div>
          </div>

          <DialogTitle className="text-2xl font-black text-foreground flex items-center gap-2">
            <Tag className="w-6 h-6 text-primary shrink-0" />
            <span>{booking.course_name}</span>
          </DialogTitle>
          <DialogDescription className="text-xs text-muted-foreground flex items-center gap-2">
            <Calendar className="w-3.5 h-3.5" />
            <span>Ordinato il {format(new Date(booking.created_at), "d MMMM yyyy, HH:mm", { locale: it })}</span>
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-6 py-4 text-sm">
          {/* Section 1: Customer / Parent & Student */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {/* Acquirente (Parent / Buyer) */}
            <div className="bg-muted/40 p-4 rounded-2xl border border-border/60 space-y-2.5">
              <div className="flex items-center gap-2 font-bold text-foreground text-xs uppercase tracking-wider">
                <User className="w-4 h-4 text-primary" />
                <span>Acquirente / Genitore</span>
              </div>
              <div className="space-y-1 text-xs">
                <p className="font-bold text-foreground text-sm">{booking.purchaser_name}</p>
                <p className="text-muted-foreground flex items-center gap-1.5">
                  <Mail className="w-3.5 h-3.5 text-primary shrink-0" />
                  <span>{booking.purchaser_email}</span>
                </p>
                {booking.purchaser_phone && (
                  <p className="text-muted-foreground flex items-center gap-1.5">
                    <Phone className="w-3.5 h-3.5 text-primary shrink-0" />
                    <span>{booking.purchaser_phone}</span>
                  </p>
                )}
                {booking.purchaser_tax_code && (
                  <p className="text-muted-foreground flex items-center gap-1.5 font-mono">
                    <FileText className="w-3.5 h-3.5 text-primary shrink-0" />
                    <span>CF: {booking.purchaser_tax_code}</span>
                  </p>
                )}
              </div>
            </div>

            {/* Student */}
            <div className="bg-muted/40 p-4 rounded-2xl border border-border/60 space-y-2.5">
              <div className="flex items-center gap-2 font-bold text-foreground text-xs uppercase tracking-wider">
                <GraduationCap className="w-4 h-4 text-primary" />
                <span>Studente / Alunno</span>
              </div>
              <div className="space-y-1 text-xs">
                <p className="font-bold text-foreground text-sm">{booking.student_name}</p>
                {booking.student_email && (
                  <p className="text-muted-foreground flex items-center gap-1.5">
                    <Mail className="w-3.5 h-3.5 text-primary shrink-0" />
                    <span>{booking.student_email}</span>
                  </p>
                )}
                {booking.student_birth_date && (
                  <p className="text-muted-foreground flex items-center gap-1.5">
                    <Calendar className="w-3.5 h-3.5 text-primary shrink-0" />
                    <span>Nato il: {booking.student_birth_date}</span>
                  </p>
                )}
                {booking.student_tax_code && (
                  <p className="text-muted-foreground flex items-center gap-1.5 font-mono">
                    <FileText className="w-3.5 h-3.5 text-primary shrink-0" />
                    <span>CF: {booking.student_tax_code}</span>
                  </p>
                )}
              </div>
            </div>
          </div>

          {/* Section 2: Schedule & Location */}
          <div className="bg-primary/5 p-4 rounded-2xl border border-primary/10 space-y-2">
            <h4 className="font-bold text-primary text-xs uppercase tracking-wider flex items-center gap-1.5">
              <Clock className="w-4 h-4" />
              <span>Dettagli Orario e Calendario</span>
            </h4>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 text-xs">
              <div>
                <span className="text-muted-foreground">Stato schedulazione: </span>
                <span className="font-bold text-foreground">
                  {booking.scheduling_status === "confirmed" || booking.scheduling_status === "scheduled"
                    ? "Confermato"
                    : "Da concordare (Lead)"}
                </span>
              </div>
              <div>
                <span className="text-muted-foreground">Orario standard: </span>
                <span className="font-bold text-foreground">
                  {formattedSchedule !== "Da concordare" ? formattedSchedule : "Flessibile / Da concordare"}
                </span>
              </div>
              {booking.start_date && (
                <div>
                  <span className="text-muted-foreground">Data inizio: </span>
                  <span className="font-bold text-foreground">{booking.start_date}</span>
                </div>
              )}
            </div>
          </div>

          {/* Section 3: Financial & Invoice Details */}
          <div className="space-y-3 bg-muted/30 p-4 rounded-2xl border border-border/60">
            <h4 className="font-bold text-foreground text-xs uppercase tracking-wider flex items-center gap-1.5">
              <CreditCard className="w-4 h-4 text-primary" />
              <span>Riepilogo Finanziario e Fattura</span>
            </h4>
            <div className="space-y-1.5 text-xs">
              <div className="flex justify-between items-center">
                <span className="text-muted-foreground">Metodo di pagamento:</span>
                <span className="font-bold text-foreground capitalize">{booking.payment_method || "Online"}</span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-muted-foreground">Quota iscrizione annuale (€30):</span>
                <span className="font-bold text-foreground">
                  {Number(booking.registration_fee || 0) > 0 ? "Inclusa (€30.00)" : "Già pagata / Esente (€0.00)"}
                </span>
              </div>
              <div className="flex justify-between items-center pt-2 border-t font-bold text-sm">
                <span>Importo Totale:</span>
                <span className="text-primary text-base font-black">€{Number(booking.amount_paid || 0).toFixed(2)}</span>
              </div>
            </div>

            {(booking.sdi_code || booking.pec_email) && (
              <div className="pt-2 border-t border-border/60 text-xs space-y-1">
                <p className="font-bold text-foreground flex items-center gap-1.5">
                  <Building2 className="w-3.5 h-3.5 text-primary" />
                  <span>Fatturazione Elettronica (Azienda)</span>
                </p>
                {booking.sdi_code && <p className="text-muted-foreground font-mono">Codice SDI: {booking.sdi_code}</p>}
                {booking.pec_email && <p className="text-muted-foreground font-mono">PEC: {booking.pec_email}</p>}
              </div>
            )}
          </div>

          {/* Notes */}
          {booking.notes && (
            <div className="p-3 bg-amber-500/10 rounded-2xl border border-amber-500/20 text-xs space-y-1">
              <p className="font-bold text-amber-800 flex items-center gap-1.5">
                <Sparkles className="w-3.5 h-3.5" />
                <span>Note cliente:</span>
              </p>
              <p className="text-amber-950 leading-relaxed">{booking.notes}</p>
            </div>
          )}
        </div>

        {/* Footer Actions */}
        <div className="flex flex-wrap justify-between items-center gap-2 pt-4 border-t">
          <div className="flex items-center gap-2">
            {onUpdateStatus && booking.payment_status !== "paid" && (
              <Button
                size="sm"
                className="bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs"
                onClick={() => {
                  onUpdateStatus(booking.id, "paid", "confirmed");
                }}
              >
                <CheckCircle2 className="w-4 h-4 mr-1.5" />
                Segna come Pagato
              </Button>
            )}
            {onDelete && (
              <Button
                size="sm"
                variant="destructive"
                className="font-bold text-xs"
                onClick={() => setConfirmOpen(true)}
              >
                <Trash2 className="w-4 h-4 mr-1.5" />
                Elimina
              </Button>
            )}
          </div>
          <Button variant="outline" size="sm" onClick={onClose} className="font-bold text-xs">
            Chiudi Scheda
          </Button>
        </div>
      </DialogContent>

      <AlertDialog open={confirmOpen} onOpenChange={setConfirmOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Eliminare la prenotazione?</AlertDialogTitle>
            <AlertDialogDescription>
              Verranno eliminati anche lezioni e membership collegati. L&apos;azione non può essere
              annullata.
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
