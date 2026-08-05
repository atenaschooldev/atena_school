"use client";

import { useState, useEffect } from "react";
import { useQuery } from "@tanstack/react-query";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { UserCheck, Calendar, Clock, BookOpen } from "lucide-react";

const BACKEND_URL = import.meta.env.VITE_BACKEND_URL || "http://localhost:4000";
const ADMIN_TOKEN = import.meta.env.VITE_ADMIN_TOKEN || "DEVELOPMENT_TEST_TOKEN";

interface ActiveBooking {
  id: string;
  student_name: string;
  purchaser_name: string;
  course_name: string;
  billing_scheme: string;
}

interface CreateAttendanceDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onSuccess: () => void;
}

export function CreateAttendanceDialog({
  open,
  onOpenChange,
  onSuccess,
}: CreateAttendanceDialogProps) {
  const [selectedBookingId, setSelectedBookingId] = useState<string>("");
  const [dateStr, setDateStr] = useState<string>(new Date().toISOString().split("T")[0]);
  const [timeStr, setTimeStr] = useState<string>("10:00");
  const [status, setStatus] = useState<string>("present");
  const [notes, setNotes] = useState<string>("");
  const [submitting, setSubmitting] = useState(false);

  const { data: bookings = [] } = useQuery<ActiveBooking[]>({
    queryKey: ["attendance-active-bookings"],
    queryFn: async () => {
      const res = await fetch(`${BACKEND_URL}/api/v1/admin/attendance/active-bookings`, {
        headers: { Authorization: `Bearer ${ADMIN_TOKEN}` },
      });
      if (!res.ok) return [];
      return res.json();
    },
    enabled: open,
  });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedBookingId) {
      toast.error("Seleziona uno studente / prenotazione");
      return;
    }

    setSubmitting(true);
    try {
      const startsAt = new Date(`${dateStr}T${timeStr}:00`).toISOString();
      const res = await fetch(`${BACKEND_URL}/api/v1/admin/attendance/manual`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${ADMIN_TOKEN}`,
        },
        body: JSON.stringify({
          bookingId: selectedBookingId,
          startsAt,
          status,
          notes: notes || undefined,
        }),
      });

      if (!res.ok) {
        throw new Error(await res.text());
      }

      toast.success("Presenza registrata con successo!");
      onSuccess();
      onOpenChange(false);
      setSelectedBookingId("");
      setNotes("");
    } catch (err) {
      console.error(err);
      toast.error("Errore nella registrazione della presenza");
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[500px]">
        <DialogHeader>
          <div className="flex items-center gap-2.5 text-primary">
            <UserCheck className="w-5 h-5" />
            <DialogTitle>Registra Presenza Manuale</DialogTitle>
          </div>
          <DialogDescription>
            Inserisci una presenza o lezione straordinaria per uno studente.
          </DialogDescription>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-4 py-2">
          <div className="space-y-1.5">
            <Label className="text-xs font-semibold">Studente & Corso *</Label>
            <Select value={selectedBookingId} onValueChange={setSelectedBookingId}>
              <SelectTrigger className="h-10 text-sm">
                <SelectValue placeholder="Seleziona studente..." />
              </SelectTrigger>
              <SelectContent className="max-h-60">
                {bookings.map((b) => (
                  <SelectItem key={b.id} value={b.id}>
                    <div className="flex flex-col text-left">
                      <span className="font-medium text-foreground">{b.student_name}</span>
                      <span className="text-xs text-muted-foreground">{b.course_name}</span>
                    </div>
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div className="space-y-1.5">
              <Label className="text-xs font-semibold">Data *</Label>
              <div className="relative">
                <Calendar className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                <Input
                  type="date"
                  value={dateStr}
                  onChange={(e) => setDateStr(e.target.value)}
                  className="pl-9 h-9 text-xs font-medium"
                  required
                />
              </div>
            </div>

            <div className="space-y-1.5">
              <Label className="text-xs font-semibold">Orario *</Label>
              <div className="relative">
                <Clock className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                <Input
                  type="time"
                  value={timeStr}
                  onChange={(e) => setTimeStr(e.target.value)}
                  className="pl-9 h-9 text-xs font-medium"
                  required
                />
              </div>
            </div>
          </div>

          <div className="space-y-1.5">
            <Label className="text-xs font-semibold">Stato Presenza *</Label>
            <Select value={status} onValueChange={setStatus}>
              <SelectTrigger className="h-9 text-xs font-medium">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="present">🟢 Presente</SelectItem>
                <SelectItem value="late">🔵 In Ritardo</SelectItem>
                <SelectItem value="absent">🔴 Assente</SelectItem>
                <SelectItem value="excused">🟡 Giustificato</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <div className="space-y-1.5">
            <Label className="text-xs font-semibold">Note / Note Docente</Label>
            <Textarea
              placeholder="Es. Lezione di recupero, ritardo di 15 minuti..."
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              className="text-xs resize-none h-20"
            />
          </div>

          <DialogFooter className="pt-2">
            <Button
              type="button"
              variant="outline"
              onClick={() => onOpenChange(false)}
              disabled={submitting}
              className="h-9 text-xs"
            >
              Annulla
            </Button>
            <Button type="submit" disabled={submitting} className="h-9 text-xs font-semibold">
              {submitting ? "Salvataggio..." : "Registra Presenza"}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
