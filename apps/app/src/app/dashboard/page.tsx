"use client";

import { Calendar, Clock, BookmarkSimple, MapPin } from "@phosphor-icons/react";
import { format } from "date-fns";
import { it } from "date-fns/locale";
import { Link } from "@/i18n/routing";
import { useDashboard } from "@/features/dashboard/hooks/useDashboard";

export default function DashboardPage() {
  const dateLocale = it;

  const {
    user,
    loading,
    activeTab,
    setActiveTab,
    upcomingBookings,
    pastBookings,
    profileName,
    setProfileName,
    profilePhone,
    setProfilePhone,
    savingProfile,
    handleSaveProfile,
  } = useDashboard();

  if (loading) {
    return (
      <div className="flex justify-center items-center min-h-[60vh]">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary" />
      </div>
    );
  }

  if (!user) {
    return (
      <main className="min-h-screen pt-24 pb-16 px-4 bg-[#f8f9fa] flex items-center justify-center">
        <div className="max-w-md w-full text-center space-y-6 p-8 bg-white rounded-3xl border border-border shadow-xl">
          <div className="w-16 h-16 bg-primary/10 rounded-2xl flex items-center justify-center mx-auto text-primary">
            <BookmarkSimple className="w-8 h-8" />
          </div>
          <div className="space-y-2">
            <h1 className="text-2xl font-bold text-foreground">Accesso richiesto</h1>
            <p className="text-sm text-foreground/60">
              Accedi con il tuo account per visualizzare le tue prenotazioni e corsi.
            </p>
          </div>
          <Link
            href="/autenticazione/accedi?redirect=/dashboard"
            className="w-full py-4 bg-[#043569] text-white rounded-2xl font-black uppercase tracking-widest text-xs hover:bg-[#F8861D] transition-all flex items-center justify-center gap-2 shadow-lg shadow-[#043569]/15"
          >
            Accedi ora
          </Link>
        </div>
      </main>
    );
  }

  const displayedBookings = activeTab === "upcoming" ? upcomingBookings : pastBookings;

  return (
    <main className="min-h-screen pt-8 md:pt-16 pb-16 px-4 bg-[#f8f9fa]">
      <div className="max-w-5xl mx-auto space-y-8">
        {/* Header */}
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 bg-white p-6 sm:p-8 rounded-3xl border border-border shadow-sm">
          <div>
            <span className="text-xs uppercase tracking-widest font-bold text-primary">
              Area Riservata
            </span>
            <h1 className="text-2xl sm:text-3xl font-black text-foreground mt-1">
              Pannello Studente
            </h1>
            <p className="text-xs sm:text-sm text-foreground/60 mt-1">
              Benvenuto, {user.user_metadata?.custom_full_name || user.user_metadata?.full_name || user.email}
            </p>
          </div>
          <Link
            href="/corsi"
            className="inline-flex items-center justify-center gap-2 px-6 py-3.5 bg-secondary/10 hover:bg-secondary/20 text-foreground rounded-2xl font-bold text-xs uppercase tracking-wider transition-all"
          >
            Esplora altri corsi
          </Link>
        </div>

        <div className="grid md:grid-cols-3 gap-8">
          {/* Main Bookings Feed */}
          <div className="md:col-span-2 space-y-6">
            {/* Tabs */}
            <div className="flex items-center gap-2 p-1.5 bg-white rounded-2xl border border-border shadow-sm w-fit">
              <button
                onClick={() => setActiveTab("upcoming")}
                className={`px-5 py-2.5 rounded-xl font-bold text-xs uppercase tracking-wider transition-all ${
                  activeTab === "upcoming"
                    ? "bg-[#043569] text-white shadow-md shadow-[#043569]/15"
                    : "text-foreground/60 hover:text-foreground hover:bg-muted/50"
                }`}
              >
                In programma ({upcomingBookings.length})
              </button>
              <button
                onClick={() => setActiveTab("past")}
                className={`px-5 py-2.5 rounded-xl font-bold text-xs uppercase tracking-wider transition-all ${
                  activeTab === "past"
                    ? "bg-[#043569] text-white shadow-md shadow-[#043569]/15"
                    : "text-foreground/60 hover:text-foreground hover:bg-muted/50"
                }`}
              >
                Passati ({pastBookings.length})
              </button>
            </div>

            {/* Bookings List */}
            {displayedBookings.length === 0 ? (
              <div className="p-12 text-center bg-white rounded-3xl border border-border shadow-sm space-y-4">
                <p className="text-sm font-medium text-foreground/60">
                  Nessuna lezione o corso trovato in questa sezione.
                </p>
                <Link
                  href="/corsi"
                  className="inline-flex items-center gap-2 text-xs font-bold uppercase tracking-wider text-primary hover:underline"
                >
                  Prenota una lezione ora →
                </Link>
              </div>
            ) : (
              <div className="space-y-4">
                {displayedBookings.map((b) => (
                  <Link
                    key={b.id}
                    href={`/dashboard/bookings/${b.id}`}
                    className="block p-6 bg-white hover:bg-muted/5 rounded-3xl border border-border shadow-sm hover:shadow-md hover:border-primary/30 transition-all space-y-4 cursor-pointer"
                  >
                    <div className="flex items-start justify-between gap-4">
                      <div>
                        <span className="text-[10px] font-black uppercase tracking-widest px-2.5 py-1 rounded-lg bg-primary/10 text-primary">
                          {b.item_type === "course" ? "Corso" : "Servizio"}
                        </span>
                        <h3 className="font-bold text-foreground text-lg mt-2">
                          {b.item_title}
                        </h3>
                        <p className="text-xs text-foreground/60 font-medium">
                          Docente: {b.teacher_name}
                        </p>
                      </div>
                      <div className="text-right">
                        <span className="text-lg font-black text-primary">€{Number(b.price || 0).toFixed(2)}</span>
                        <span
                          className={`block text-[10px] font-bold uppercase tracking-wider mt-1 px-2.5 py-1 rounded-full text-center ${
                            (b.payment_status || b.status) === "paid" || (b.payment_status || b.status) === "completed"
                              ? "bg-green-500/10 text-green-700 border border-green-500/20"
                              : (b.payment_status || b.status) === "reserved"
                              ? "bg-amber-500/10 text-amber-700 border border-amber-500/20"
                              : "bg-muted/60 text-muted-foreground border border-border"
                          }`}
                        >
                          {(b.payment_status || b.status) === "paid" || (b.payment_status || b.status) === "completed"
                            ? "✓ Pagato"
                            : (b.payment_status || b.status) === "reserved"
                            ? "Prenotato"
                            : "In attesa"}
                        </span>
                      </div>
                    </div>

                    <div className="flex flex-wrap items-center gap-4 pt-4 border-t border-border text-xs text-foreground/70 font-medium">
                      {(b.start_date || b.booking_date) && (
                        <div className="flex items-center gap-1.5">
                          <Calendar className="w-4 h-4 text-primary shrink-0" />
                          <span>
                            {format(new Date(b.start_date || b.booking_date), "EEEE d MMMM yyyy", { locale: dateLocale })}
                          </span>
                        </div>
                      )}
                      {b.booking_time && (
                        <div className="flex items-center gap-1.5">
                          <Clock className="w-4 h-4 text-primary shrink-0" />
                          <span>Ore {b.booking_time}</span>
                        </div>
                      )}
                      {b.location && (
                        <div className="flex items-center gap-1.5">
                          <MapPin className="w-4 h-4 text-primary shrink-0" />
                          <span>{b.location}</span>
                        </div>
                      )}
                    </div>
                  </Link>
                ))}
              </div>
            )}
          </div>

          {/* Profile Settings Sidebar */}
          <div className="space-y-6">
            <div className="p-6 bg-white rounded-3xl border border-border shadow-sm space-y-6">
              <h2 className="font-bold text-foreground text-lg pb-3 border-b border-border">
                Profilo Personale
              </h2>
              <form onSubmit={handleSaveProfile} className="space-y-4">
                <div className="space-y-1.5">
                  <label className="text-xs font-bold uppercase tracking-wider text-foreground/70">
                    Nome e Cognome
                  </label>
                  <input
                    type="text"
                    value={profileName}
                    onChange={(e) => setProfileName(e.target.value)}
                    placeholder="Mario Rossi"
                    className="w-full px-4 py-3 bg-secondary/5 border border-border rounded-2xl text-xs focus:outline-none focus:border-primary transition-colors"
                  />
                </div>
                <div className="space-y-1.5">
                  <label className="text-xs font-bold uppercase tracking-wider text-foreground/70">
                    Telefono
                  </label>
                  <input
                    type="tel"
                    value={profilePhone}
                    onChange={(e) => setProfilePhone(e.target.value)}
                    placeholder="+39 340 1234567"
                    className="w-full px-4 py-3 bg-secondary/5 border border-border rounded-2xl text-xs focus:outline-none focus:border-primary transition-colors"
                  />
                </div>
                <button
                  type="submit"
                  disabled={savingProfile}
                  className="w-full py-3.5 bg-[#043569] text-white rounded-2xl font-bold uppercase tracking-wider text-xs hover:bg-[#F8861D] transition-all disabled:opacity-50"
                >
                  {savingProfile ? "Salvataggio..." : "Salva Profilo"}
                </button>
              </form>
            </div>
          </div>
        </div>
      </div>
    </main>
  );
}
