import { useState } from "react";
import { Card } from "@/components/ui/card";
import { ShoppingBag, BookOpen, Calendar } from "lucide-react";
import { courses, lessons } from "@/lib/mock-data";
import { GIORNI } from "@/lib/utils";
import { levelColor } from "@/features/courses";

export function DashboardView() {
  const oggi = new Date().getDay(); // 0=Dom
  const oggiIndex = oggi === 0 ? 5 : oggi - 1;
  const lezioniOggi = lessons.filter((l) => l.giorno === oggiIndex);

  const kpis = [
    { label: "Prenotazioni", value: 0, icon: ShoppingBag, trend: "da integrare API" },
    { label: "Corsi attivi", value: courses.length, icon: BookOpen, trend: "8 livelli CEFR" },
    {
      label: "Lezioni oggi",
      value: lezioniOggi.length,
      icon: Calendar,
      trend: "prossima alle 09:00",
    },
  ];

  return (
    <main className="flex-1 overflow-auto p-6 space-y-6">
        <div>
          <h1 className="text-2xl font-semibold tracking-tight">Buongiorno 👋</h1>
          <p className="text-sm text-muted-foreground mt-1">
            Ecco la panoramica della tua scuola oggi.
          </p>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {kpis.map((k) => (
            <Card key={k.label} className="p-5">
              <div className="flex items-start justify-between">
                <div>
                  <div className="text-xs font-medium uppercase tracking-wider text-muted-foreground">
                    {k.label}
                  </div>
                  <div className="text-3xl font-semibold mt-2 tabular">{k.value}</div>
                  <div className="text-xs text-muted-foreground mt-1">{k.trend}</div>
                </div>
                <div className="h-10 w-10 rounded-lg bg-primary/10 text-primary flex items-center justify-center">
                  <k.icon className="h-5 w-5" />
                </div>
              </div>
            </Card>
          ))}
        </div>

        <Card className="p-6">
          <h2 className="font-semibold">Prossime lezioni</h2>
          <p className="text-xs text-muted-foreground mb-4">Oggi — {GIORNI[oggiIndex]}</p>
          <div className="space-y-3">
            {lezioniOggi.length === 0 && (
              <p className="text-sm text-muted-foreground">Nessuna lezione oggi.</p>
            )}
            {lezioniOggi.map((l) => {
              const c = courses.find((x) => x.id === l.corsoId);
              if (!c) return null;
              return (
                <div key={l.id} className="flex items-start gap-3 p-3 rounded-lg border bg-card">
                  <div
                    className={`text-xs font-semibold px-2 py-1 rounded border ${levelColor(c.livello)}`}
                  >
                    {c.livello}
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="text-sm font-medium truncate">{c.nome}</div>
                    <div className="text-xs text-muted-foreground">
                      {l.oraInizio}–{l.oraFine} · {l.aula}
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </Card>
      </main>
  );
}
