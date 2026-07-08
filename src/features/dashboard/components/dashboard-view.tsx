import { AppHeader } from "@/components/app-header";
import { Card } from "@/components/ui/card";
import { GraduationCap, BookOpen, Calendar, TrendingUp } from "lucide-react";
import { useAppStore } from "@/stores/app-store";
import { courses, lessons, weeklyAttendance, GIORNI } from "@/lib/mock-data";
import { levelColor } from "@/features/courses";
import {
  ResponsiveContainer,
  AreaChart,
  Area,
  XAxis,
  YAxis,
  Tooltip,
  CartesianGrid,
} from "recharts";

export function DashboardView() {
  const students = useAppStore((s) => s.students);
  const attivi = students.filter((s) => s.stato === "attivo").length;
  const oggi = new Date().getDay(); // 0=Dom
  const oggiIndex = oggi === 0 ? 5 : oggi - 1;
  const lezioniOggi = lessons.filter((l) => l.giorno === oggiIndex);
  const mediaPresenza = Math.round(
    weeklyAttendance.reduce((a, b) => a + b.presenza, 0) / weeklyAttendance.length,
  );

  const kpis = [
    { label: "Studenti attivi", value: attivi, icon: GraduationCap, trend: "+3 questa settimana" },
    { label: "Corsi attivi", value: courses.length, icon: BookOpen, trend: "8 livelli CEFR" },
    {
      label: "Lezioni oggi",
      value: lezioniOggi.length,
      icon: Calendar,
      trend: "prossima alle 09:00",
    },
    {
      label: "Presenza media",
      value: `${mediaPresenza}%`,
      icon: TrendingUp,
      trend: "+2% vs sett. scorsa",
    },
  ];

  return (
    <>
      <AppHeader searchPlaceholder="Cerca qualsiasi cosa..." />
      <main className="flex-1 overflow-auto p-6 space-y-6">
        <div>
          <h1 className="text-2xl font-semibold tracking-tight">Buongiorno 👋</h1>
          <p className="text-sm text-muted-foreground mt-1">
            Ecco la panoramica della tua scuola oggi.
          </p>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
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

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          <Card className="p-6 lg:col-span-2">
            <div className="flex items-center justify-between mb-4">
              <div>
                <h2 className="font-semibold">Presenze settimanali</h2>
                <p className="text-xs text-muted-foreground">
                  Percentuale media di presenza per giorno
                </p>
              </div>
            </div>
            <div className="h-64">
              <ResponsiveContainer width="100%" height="100%">
                <AreaChart data={weeklyAttendance}>
                  <defs>
                    <linearGradient id="pres" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="0%" stopColor="var(--color-primary)" stopOpacity={0.35} />
                      <stop offset="100%" stopColor="var(--color-primary)" stopOpacity={0} />
                    </linearGradient>
                  </defs>
                  <CartesianGrid
                    strokeDasharray="3 3"
                    stroke="var(--color-border)"
                    vertical={false}
                  />
                  <XAxis
                    dataKey="giorno"
                    tickLine={false}
                    axisLine={false}
                    tick={{ fill: "var(--color-muted-foreground)", fontSize: 12 }}
                  />
                  <YAxis
                    tickLine={false}
                    axisLine={false}
                    tick={{ fill: "var(--color-muted-foreground)", fontSize: 12 }}
                    domain={[60, 100]}
                  />
                  <Tooltip
                    contentStyle={{
                      background: "var(--color-popover)",
                      border: "1px solid var(--color-border)",
                      borderRadius: 8,
                      fontSize: 12,
                    }}
                  />
                  <Area
                    type="monotone"
                    dataKey="presenza"
                    stroke="var(--color-primary)"
                    strokeWidth={2}
                    fill="url(#pres)"
                  />
                </AreaChart>
              </ResponsiveContainer>
            </div>
          </Card>

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
        </div>
      </main>
    </>
  );
}
