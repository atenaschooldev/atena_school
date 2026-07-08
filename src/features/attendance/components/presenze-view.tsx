import { useMemo, useState } from "react";
import { AppHeader } from "@/components/app-header";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { lessons, courses, GIORNI } from "@/lib/mock-data";
import { levelColor } from "@/features/courses";
import { useAppStore } from "@/stores/app-store";
import { Check, X, Clock } from "lucide-react";

type Stato = "presente" | "assente" | "ritardo";

function StatCard({
  label,
  value,
  tone,
}: {
  label: string;
  value: string | number;
  tone: "success" | "destructive" | "warning";
}) {
  const toneClass = {
    success: "bg-success/10 text-success",
    destructive: "bg-destructive/10 text-destructive",
    warning: "bg-warning/15 text-warning-foreground",
  }[tone];
  return (
    <div className="rounded-xl border bg-card p-4">
      <div className="text-[10px] font-semibold uppercase tracking-wider text-muted-foreground">
        {label}
      </div>
      <div
        className={`text-2xl font-semibold tabular mt-2 inline-block px-2 py-0.5 rounded ${toneClass}`}
      >
        {value}
      </div>
    </div>
  );
}

interface ToggleBtnProps {
  active: boolean;
  onClick: () => void;
  tone: "success" | "destructive" | "warning";
  icon: React.ReactNode;
  label: string;
}

function ToggleBtn({ active, onClick, tone, icon, label }: ToggleBtnProps) {
  const activeCls = {
    success: "bg-success text-success-foreground border-success",
    destructive: "bg-destructive text-destructive-foreground border-destructive",
    warning: "bg-warning text-warning-foreground border-warning",
  }[tone];
  return (
    <Button
      size="sm"
      variant="outline"
      onClick={onClick}
      className={`h-8 gap-1.5 text-xs ${active ? activeCls : ""}`}
      title={label}
    >
      {icon}
      <span className="hidden sm:inline">{label}</span>
    </Button>
  );
}

export function PresenzeView() {
  const students = useAppStore((s) => s.students);
  const [lessonId, setLessonId] = useState(lessons[0].id);
  const lesson = lessons.find((l) => l.id === lessonId)!;
  const corso = courses.find((c) => c.id === lesson.corsoId)!;
  const iscritti = useMemo(
    () => students.filter((s) => s.corsiIds.includes(corso.id)),
    [students, corso.id],
  );

  const [attendance, setAttendance] = useState<Record<string, Stato>>(() =>
    Object.fromEntries(iscritti.map((s) => [s.id, "presente" as Stato])),
  );

  const totali = { presente: 0, assente: 0, ritardo: 0 };
  Object.values(attendance).forEach((v) => totali[v]++);
  const pct = iscritti.length ? Math.round((totali.presente / iscritti.length) * 100) : 0;

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
            const cur = attendance[s.id];
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
                    onClick={() => setAttendance({ ...attendance, [s.id]: "presente" })}
                    tone="success"
                    icon={<Check className="h-4 w-4" />}
                    label="Presente"
                  />
                  <ToggleBtn
                    active={cur === "ritardo"}
                    onClick={() => setAttendance({ ...attendance, [s.id]: "ritardo" })}
                    tone="warning"
                    icon={<Clock className="h-4 w-4" />}
                    label="Ritardo"
                  />
                  <ToggleBtn
                    active={cur === "assente"}
                    onClick={() => setAttendance({ ...attendance, [s.id]: "assente" })}
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
