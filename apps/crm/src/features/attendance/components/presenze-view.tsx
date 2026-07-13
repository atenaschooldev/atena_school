import { AppHeader } from "@/components/app-header";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { lessons, courses } from "@/lib/mock-data";
import { GIORNI } from "@/lib/utils";
import { levelColor } from "@/features/courses";
import { Check, X, Clock } from "lucide-react";
import { useAttendance } from "../hooks/use-attendance";
import { StatCard } from "./stat-card";
import { ToggleBtn } from "./toggle-btn";

export function PresenzeView() {
  const { lessonId, setLessonId, corso, iscritti, attendance, updateAttendance, totali, pct } =
    useAttendance();

  return (
    <>
      <AppHeader searchPlaceholder="Cerca studenti..." />
      <main className="flex-1 overflow-auto p-6 space-y-4">
        <div className="flex flex-wrap items-center gap-3">
          <span className="text-sm font-medium">Lezione:</span>
          <Select value={lessonId} onValueChange={setLessonId}>
            <SelectTrigger className="w-96">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              {lessons.map((l) => {
                const c = courses.find((x) => x.id === l.corsoId)!;
                return (
                  <SelectItem key={l.id} value={l.id}>
                    {c.nome} — {GIORNI[l.giorno]} {l.oraInizio}
                  </SelectItem>
                );
              })}
            </SelectContent>
          </Select>
          <Badge variant="outline" className={`ml-auto ${levelColor(corso.livello)}`}>
            {corso.livello}
          </Badge>
        </div>

        <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
          <StatCard label="Presenza" value={`${pct}%`} tone="success" />
          <StatCard label="Presenti" value={totali.presente} tone="success" />
          <StatCard label="Assenti" value={totali.assente} tone="destructive" />
          <StatCard label="Ritardi" value={totali.ritardo} tone="warning" />
        </div>

        <div className="rounded-xl border bg-card divide-y">
          {iscritti.length === 0 && (
            <div className="p-8 text-center text-sm text-muted-foreground">
              Nessuno studente iscritto.
            </div>
          )}
          {iscritti.map((s) => {
            const cur = attendance[s.id] || "presente";
            return (
              <div key={s.id} className="flex items-center gap-3 p-3 pl-6">
                <Avatar className="h-9 w-9">
                  <AvatarFallback className="bg-primary/10 text-primary text-xs font-semibold">
                    {s.nome[0]}
                    {s.cognome[0]}
                  </AvatarFallback>
                </Avatar>
                <div className="flex-1 min-w-0">
                  <div className="font-medium text-sm">
                    {s.nome} {s.cognome}
                  </div>
                  <div className="text-xs text-muted-foreground">{s.email}</div>
                </div>
                <div className="flex gap-1">
                  <ToggleBtn
                    active={cur === "presente"}
                    onClick={() => updateAttendance(s.id, "presente")}
                    tone="success"
                    icon={<Check className="h-4 w-4" />}
                    label="Presente"
                  />
                  <ToggleBtn
                    active={cur === "ritardo"}
                    onClick={() => updateAttendance(s.id, "ritardo")}
                    tone="warning"
                    icon={<Clock className="h-4 w-4" />}
                    label="Ritardo"
                  />
                  <ToggleBtn
                    active={cur === "assente"}
                    onClick={() => updateAttendance(s.id, "assente")}
                    tone="destructive"
                    icon={<X className="h-4 w-4" />}
                    label="Assente"
                  />
                </div>
              </div>
            );
          })}
        </div>
      </main>
    </>
  );
}
