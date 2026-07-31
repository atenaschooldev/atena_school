import type { Payment } from "../types";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from "@/components/ui/dialog";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { useNavigate } from "react-router-dom";
import {
  Receipt,
  CreditCard,
  Calendar,
  ExternalLink,
  Tag,
  CheckCircle2,
  FileText,
  ShoppingBag,
  ArrowRight,
} from "lucide-react";
import { format } from "date-fns";
import { it } from "date-fns/locale";

interface PaymentDetailDialogProps {
  payment: Payment | null;
  isOpen: boolean;
  onClose: () => void;
}

export function PaymentDetailDialog({
  payment,
  isOpen,
  onClose,
}: PaymentDetailDialogProps) {
  const navigate = useNavigate();
  if (!payment) return null;

  const isSucceeded = payment.status === "succeeded" || payment.status === "paid";
  const dateVal = payment.createdAt || payment.created_at;
  const pMethod = payment.paymentMethod || payment.payment_method;
  const pTxId = payment.providerTransactionId || payment.provider_transaction_id;
  const bId = payment.bookingId || payment.booking_id;

  const formattedDate = dateVal
    ? format(new Date(dateVal), "d MMMM yyyy 'alle' HH:mm", { locale: it })
    : "N/D";

  return (
    <Dialog open={isOpen} onOpenChange={(open) => !open && onClose()}>
      <DialogContent className="max-w-md p-0 gap-0 overflow-hidden">
        <div className="p-6 pb-4 border-b bg-muted/20 space-y-3">
          <div className="flex items-center justify-between gap-2">
            <Badge variant="outline" className="font-mono text-xs text-muted-foreground bg-background">
              #{payment.id.slice(0, 8)}
            </Badge>

            <Badge
              variant="secondary"
              className={
                isSucceeded
                  ? "text-emerald-600 bg-emerald-50 dark:text-emerald-400 dark:bg-emerald-900/20 font-medium"
                  : "text-amber-600 bg-amber-50 dark:text-amber-400 dark:bg-amber-900/20 font-medium"
              }
            >
              {isSucceeded ? "Completato" : payment.status}
            </Badge>
          </div>

          <div>
            <DialogTitle className="text-xl font-bold tracking-tight text-foreground flex items-center gap-2">
              <Receipt className="w-5 h-5 text-primary shrink-0" />
              <span>
                {payment.type === "registration_fee" ? "Quota Iscrizione" : "Pagamento Corso"}
              </span>
            </DialogTitle>
            <DialogDescription className="text-xs text-muted-foreground flex items-center gap-1.5 mt-1">
              <Calendar className="w-3.5 h-3.5" />
              <span>Registrato il {formattedDate}</span>
            </DialogDescription>
          </div>
        </div>

        <div className="p-6 space-y-4 text-xs">
          <div className="rounded-lg border p-4 bg-card space-y-3">
            <div className="flex justify-between items-center border-b pb-2">
              <span className="text-muted-foreground">Importo Transazione</span>
              <span className="font-bold text-lg text-primary font-mono">
                €{Number(payment.amount).toFixed(2)}
              </span>
            </div>

            <div className="space-y-1.5 pt-1">
              <div className="flex justify-between items-center">
                <span className="text-muted-foreground">Metodo di Pagamento:</span>
                <span className="font-semibold text-foreground capitalize">
                  {pMethod || "N/D"}
                </span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-muted-foreground">Provider:</span>
                <span className="font-semibold text-foreground capitalize">
                  {payment.provider || "Manual"}
                </span>
              </div>
              {pTxId && (
                <div className="flex justify-between items-center font-mono">
                  <span className="text-muted-foreground">Transaction ID:</span>
                  <span className="font-bold text-foreground text-[11px]">
                    {pTxId}
                  </span>
                </div>
              )}
            </div>
          </div>

          {bId && (
            <div className="rounded-lg border p-3.5 bg-primary/5 border-primary/20 space-y-2">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-1.5 font-medium text-foreground">
                  <ShoppingBag className="w-4 h-4 text-primary shrink-0" />
                  <span>Ordine di Riferimento</span>
                </div>
                <span className="font-mono text-xs font-bold text-primary">#{bId.slice(0, 8)}</span>
              </div>
              <Button
                variant="default"
                size="sm"
                className="w-full text-xs h-8 cursor-pointer gap-1.5 mt-1"
                onClick={() => {
                  onClose();
                  navigate(`/prenotazioni?id=${bId}`);
                }}
              >
                Vedi Dettagli Ordine <ArrowRight className="w-3.5 h-3.5" />
              </Button>
            </div>
          )}

          {payment.notes && (
            <div className="rounded-lg border bg-muted/40 p-3 space-y-1">
              <span className="font-semibold text-foreground flex items-center gap-1.5">
                <FileText className="w-3.5 h-3.5 text-primary" />
                Note:
              </span>
              <p className="text-muted-foreground leading-relaxed">{payment.notes}</p>
            </div>
          )}
        </div>

        <div className="p-4 bg-muted/20 border-t flex items-center justify-between">
          {pTxId ? (
            <a
              href={`https://dashboard.stripe.com/payments/${pTxId}`}
              target="_blank"
              rel="noreferrer"
              className="inline-flex items-center"
            >
              <Button size="sm" variant="outline" className="font-medium text-xs cursor-pointer gap-1.5">
                Stripe Dashboard <ExternalLink className="w-3.5 h-3.5 text-muted-foreground" />
              </Button>
            </a>
          ) : (
            <div />
          )}

          <Button variant="outline" size="sm" onClick={onClose} className="font-medium text-xs cursor-pointer">
            Chiudi
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
}
