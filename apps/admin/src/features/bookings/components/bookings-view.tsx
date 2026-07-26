import { useState } from "react";
import { AppHeader } from "@/components/app-header";
import { useBookings } from "../hooks/use-bookings";
import { BookingDetailDialog } from "./booking-detail-dialog";
import {
  ShoppingBag,
  CreditCard,
  Store,
  Clock,
  Search,
  Eye,
  GraduationCap,
  Mail,
  Phone,
  IdCard,
  CalendarDays,
  User,
  MoreHorizontal,
  ChevronRight,
  CircleDashed,
  CheckCircle2,
  AlertCircle
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { format } from "date-fns";
import { it } from "date-fns/locale";
import { cn } from "@/lib/utils";

const DAYS_IT = ["", "Lunedì", "Martedì", "Mercoledì", "Giovedì", "Venerdì", "Sabato", "Domenica"];

function formatScheduleText(days?: number[] | null, startTime?: string | null, endTime?: string | null) {
  if (!days || days.length === 0 || !startTime) return "Flessibile / Da concordare";
  const dayNames = days.map((d) => DAYS_IT[d] || `Giorno ${d}`).join(", ");
  return endTime ? `${dayNames} ${startTime}-${endTime}` : `${dayNames} ${startTime}`;
}

export function BookingsView() {
  const {
    bookings,
    loading,
    error,
    searchQuery,
    setSearchQuery,
    activeTab,
    setActiveTab,
    selectedBooking,
    setSelectedBooking,
    stats,
    updateBookingStatus,
  } = useBookings();

  return (
    <div className="flex-1 flex flex-col h-full overflow-hidden bg-background">
      <AppHeader searchPlaceholder="Cerca acquisti, ordini o lead..." />

      <main className="flex-1 overflow-y-auto p-6 md:p-10 lg:px-12 xl:px-16 space-y-10 max-w-[1600px] mx-auto w-full">
        {/* Header Section */}
        <div className="flex flex-col md:flex-row md:items-end justify-between gap-6">
          <div className="space-y-1.5">
            <h1 className="text-2xl font-semibold tracking-tight text-foreground">
              Ordini e Acquisizioni
            </h1>
            <p className="text-[14px] text-muted-foreground">
              Gestisci acquisti online, prenotazioni e lead in un'unica vista.
            </p>
          </div>
        </div>

        {/* Linear-style Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <div className="flex flex-col p-5 border border-border/60 rounded-2xl bg-card/40 shadow-sm">
            <span className="text-[13px] font-medium text-muted-foreground mb-3 flex items-center gap-2">
              <ShoppingBag className="w-4 h-4 opacity-70" /> Totale Ordini
            </span>
            <span className="text-3xl font-semibold tracking-tight text-foreground">{stats.totalCount}</span>
          </div>

          <div className="flex flex-col p-5 border border-border/60 rounded-2xl bg-card/40 shadow-sm">
            <span className="text-[13px] font-medium text-emerald-600/80 mb-3 flex items-center gap-2">
              <CheckCircle2 className="w-4 h-4 opacity-70" /> Pagati Online
            </span>
            <span className="text-3xl font-semibold tracking-tight text-foreground">{stats.paidCount}</span>
          </div>

          <div className="flex flex-col p-5 border border-border/60 rounded-2xl bg-card/40 shadow-sm">
            <span className="text-[13px] font-medium text-amber-600/80 mb-3 flex items-center gap-2">
              <Store className="w-4 h-4 opacity-70" /> Da Saldare (Sede)
            </span>
            <span className="text-3xl font-semibold tracking-tight text-foreground">{stats.reservedCount}</span>
          </div>

          <div className="flex flex-col p-5 border border-border/60 rounded-2xl bg-card/40 shadow-sm">
            <span className="text-[13px] font-medium text-sky-600/80 mb-3 flex items-center gap-2">
              <CircleDashed className="w-4 h-4 opacity-70" /> Lead in Sospeso
            </span>
            <span className="text-3xl font-semibold tracking-tight text-foreground">{stats.leadsCount}</span>
          </div>
        </div>

        {/* Table Section */}
        <div className="border border-border/60 rounded-2xl bg-card shadow-sm flex flex-col">
          {/* Controls Bar */}
          <div className="flex flex-col sm:flex-row items-center justify-between p-2 border-b border-border/40 gap-3">
            <div className="flex items-center gap-1 overflow-x-auto w-full sm:w-auto px-2">
              {[
                { id: "all", label: "Tutti" },
                { id: "paid", label: "Pagati" },
                { id: "reserved", label: "Prenotazioni" },
                { id: "leads", label: "Lead" },
                { id: "child", label: "Per Figlio" },
              ].map((tab) => (
                <button
                  key={tab.id}
                  onClick={() => setActiveTab(tab.id as any)}
                  className={cn(
                    "px-3 py-1.5 text-[13px] font-medium rounded-lg transition-colors whitespace-nowrap",
                    activeTab === tab.id
                      ? "bg-secondary text-secondary-foreground"
                      : "text-muted-foreground hover:text-foreground hover:bg-secondary/50"
                  )}
                >
                  {tab.label}
                </button>
              ))}
            </div>

            <div className="relative w-full sm:w-[280px] px-2 sm:px-0 sm:pr-2 pb-2 sm:pb-0">
              <Search className="w-4 h-4 absolute left-4 sm:left-3 top-1/2 -translate-y-1/2 text-muted-foreground/60" />
              <Input
                type="text"
                placeholder="Cerca nome, email..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-9 h-8 text-[13px] rounded-lg border-border/50 bg-muted/30 focus-visible:ring-1 focus-visible:bg-background transition-colors"
              />
            </div>
          </div>

          {/* Table */}
          <div className="overflow-x-auto min-h-[400px]">
            {loading ? (
              <div className="flex justify-center items-center h-64">
                <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-primary" />
              </div>
            ) : error ? (
              <div className="flex flex-col justify-center items-center h-64 text-center space-y-3">
                <AlertCircle className="w-8 h-8 text-destructive/50" />
                <p className="text-[14px] font-medium text-destructive">Errore nel caricamento</p>
                <p className="text-[13px] text-muted-foreground max-w-sm">{error}</p>
              </div>
            ) : bookings.length === 0 ? (
              <div className="flex flex-col justify-center items-center h-64 text-center space-y-3">
                <ShoppingBag className="w-8 h-8 text-muted-foreground/30" />
                <p className="text-[14px] font-medium text-foreground">Nessun risultato</p>
                <p className="text-[13px] text-muted-foreground">Prova a modificare i filtri o la ricerca.</p>
              </div>
            ) : (
              <table className="w-full text-left border-collapse">
                <thead className="bg-transparent border-b border-border/40">
                  <tr>
                    <th className="py-3 px-5 text-[12px] font-medium text-muted-foreground/80 font-sans tracking-tight w-[140px]">Ordine</th>
                    <th className="py-3 px-5 text-[12px] font-medium text-muted-foreground/80 font-sans tracking-tight">Corso</th>
                    <th className="py-3 px-5 text-[12px] font-medium text-muted-foreground/80 font-sans tracking-tight">Acquirente</th>
                    <th className="py-3 px-5 text-[12px] font-medium text-muted-foreground/80 font-sans tracking-tight">Studente</th>
                    <th className="py-3 px-5 text-[12px] font-medium text-muted-foreground/80 font-sans tracking-tight">Orari e Date</th>
                    <th className="py-3 px-5 text-[12px] font-medium text-muted-foreground/80 font-sans tracking-tight">Stato</th>
                    <th className="py-3 px-5 text-[12px] font-medium text-muted-foreground/80 font-sans tracking-tight text-right">Importo</th>
                    <th className="py-3 px-5 text-[12px] font-medium text-muted-foreground/80 font-sans tracking-tight text-right w-16"></th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-border/30">
                  {bookings.map((booking) => {
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
                      <tr 
                        key={booking.id} 
                        className="hover:bg-muted/20 transition-colors group cursor-pointer"
                        onClick={() => setSelectedBooking(booking)}
                      >
                        {/* ID & Date */}
                        <td className="py-4 px-5 align-top">
                          <div className="flex items-center gap-2 mb-1.5">
                            <span className="font-mono text-[11px] font-medium text-muted-foreground bg-muted/50 px-1.5 py-0.5 rounded-md border border-border/50">
                              {booking.id.slice(0, 8)}
                            </span>
                          </div>
                          <div className="text-[13px] text-foreground font-medium">
                            {format(new Date(booking.created_at), "dd MMM yyyy", { locale: it })}
                          </div>
                          <div className="text-[12px] text-muted-foreground">
                            {format(new Date(booking.created_at), "HH:mm")}
                          </div>
                        </td>

                        {/* Course */}
                        <td className="py-4 px-5 align-top">
                          <div className="text-[14px] font-medium text-foreground mb-1">
                            {booking.course_name}
                          </div>
                          {booking.total_lessons_count && (
                            <div className="flex items-center text-[12px] text-muted-foreground mt-2">
                              <GraduationCap className="w-3 h-3 mr-1.5 opacity-60" />
                              <span>{booking.total_lessons_count} {booking.total_lessons_count === 1 ? 'lezione' : 'lezioni'}</span>
                            </div>
                          )}
                        </td>

                        {/* Purchaser */}
                        <td className="py-4 px-5 align-top">
                          <div className="flex items-center gap-1.5 mb-1">
                            <User className="w-3.5 h-3.5 text-muted-foreground/70" />
                            <span className="text-[13px] font-medium text-foreground">{booking.purchaser_name}</span>
                          </div>
                          <div className="pl-5 flex flex-col gap-0.5">
                            <span className="text-[12px] text-muted-foreground">{booking.purchaser_email}</span>
                            {booking.purchaser_phone && <span className="text-[12px] text-muted-foreground">{booking.purchaser_phone}</span>}
                            {booking.purchaser_tax_code && <span className="text-[11px] text-muted-foreground font-mono mt-0.5">{booking.purchaser_tax_code}</span>}
                          </div>
                        </td>

                        {/* Student */}
                        <td className="py-4 px-5 align-top">
                          <div className="flex items-center gap-1.5 mb-1">
                            <div className="w-3.5 h-3.5 rounded bg-secondary flex items-center justify-center">
                              <User className="w-2.5 h-2.5 text-foreground opacity-70" />
                            </div>
                            <span className="text-[13px] font-medium text-foreground">{booking.student_name}</span>
                            {isChild && (
                              <span className="text-[9px] font-medium uppercase tracking-wider text-muted-foreground bg-muted px-1 rounded ml-1">Figlio</span>
                            )}
                          </div>
                          <div className="pl-5 flex flex-col gap-0.5">
                            {booking.student_email && booking.student_email !== booking.purchaser_email && (
                              <span className="text-[12px] text-muted-foreground">{booking.student_email}</span>
                            )}
                            {booking.student_phone && booking.student_phone !== booking.purchaser_phone && (
                              <span className="text-[12px] text-muted-foreground">{booking.student_phone}</span>
                            )}
                            {booking.student_tax_code && booking.student_tax_code !== booking.purchaser_tax_code && (
                              <span className="text-[11px] text-muted-foreground font-mono mt-0.5">{booking.student_tax_code}</span>
                            )}
                            {(!booking.student_email || booking.student_email === booking.purchaser_email) &&
                             (!booking.student_phone || booking.student_phone === booking.purchaser_phone) &&
                             (!booking.student_tax_code || booking.student_tax_code === booking.purchaser_tax_code) && (
                              <span className="text-[11px] text-muted-foreground italic mt-0.5">
                                Come acquirente
                              </span>
                            )}
                          </div>
                        </td>

                        {/* Schedule & Dates */}
                        <td className="py-4 px-5 align-top">
                          <div className="flex flex-col gap-1.5">
                            {(booking.subscription_starts_at || booking.start_date) && (
                              <div className="flex flex-col gap-0.5">
                                <div className="flex items-center text-[12px] text-foreground font-medium">
                                  <CalendarDays className="w-3 h-3 mr-1.5 text-primary/70" />
                                  <span>Inizio: {format(new Date(booking.subscription_starts_at || booking.start_date!), "dd/MM/yyyy")}</span>
                                </div>
                                {booking.subscription_ends_at && (
                                  <div className="flex items-center text-[12px] text-muted-foreground pl-4.5">
                                    <span>Fine: {format(new Date(booking.subscription_ends_at), "dd/MM/yyyy")}</span>
                                  </div>
                                )}
                              </div>
                            )}
                            
                            {!isLead && formattedSchedule !== "Da concordare" && (
                              <div className="flex items-center text-[12px] text-muted-foreground mt-1 bg-muted/40 p-1.5 rounded-md w-fit">
                                <Clock className="w-3 h-3 mr-1.5 opacity-60" />
                                <span>{formattedSchedule}</span>
                              </div>
                            )}
                          </div>
                        </td>

                        {/* Status */}
                        <td className="py-4 px-5 align-top">
                          <div className="flex flex-col gap-2.5">
                            <div className="flex items-center gap-2">
                              {isPaid ? (
                                <div className="w-2 h-2 rounded-full bg-emerald-500" />
                              ) : isReserved ? (
                                <div className="w-2 h-2 rounded-full bg-amber-500" />
                              ) : (
                                <div className="w-2 h-2 rounded-full bg-slate-300" />
                              )}
                              <span className="text-[13px] font-medium text-foreground">
                                {isPaid ? "Pagato" : isReserved ? "Da Saldare" : "In Attesa"}
                              </span>
                            </div>
                            
                            <div className="text-[11px] font-medium text-muted-foreground uppercase tracking-wider">
                              {isReserved ? "Prenotazione" : "Acquisto Web"}
                            </div>

                            {isLead && (
                              <div className="inline-flex items-center gap-1.5 text-[11px] font-medium text-sky-600 bg-sky-500/10 px-2 py-0.5 rounded-md w-fit">
                                <CircleDashed className="w-3 h-3" />
                                Lead / Da Concordare
                              </div>
                            )}
                          </div>
                        </td>

                        {/* Amount Paid */}
                        <td className="py-4 px-5 align-top text-right">
                          <div className="text-[14px] font-semibold text-foreground">
                            €{Number(booking.amount_paid || 0).toFixed(2)}
                          </div>
                          {Number(booking.registration_fee || 0) > 0 && (
                            <div className="flex flex-col text-[11px] text-muted-foreground mt-1 items-end gap-0.5">
                              <span>Corso: €{(Number(booking.amount_paid || 0) - Number(booking.registration_fee || 0)).toFixed(2)}</span>
                              <span>Iscrizione: €{Number(booking.registration_fee || 0).toFixed(2)}</span>
                            </div>
                          )}
                        </td>

                        {/* Actions */}
                        <td className="py-4 px-5 align-middle text-right">
                          <Button
                            size="icon"
                            variant="ghost"
                            className="w-8 h-8 opacity-0 group-hover:opacity-100 transition-opacity"
                          >
                            <ChevronRight className="w-4 h-4 text-muted-foreground" />
                          </Button>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            )}
          </div>
        </div>
      </main>

      <BookingDetailDialog
        booking={selectedBooking}
        isOpen={!!selectedBooking}
        onClose={() => setSelectedBooking(null)}
        onUpdateStatus={updateBookingStatus}
      />
    </div>
  );
}
