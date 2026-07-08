import { useState } from "react";
import { AppHeader } from "@/components/app-header";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { courses, grades } from "@/lib/mock-data";
import { levelColor } from "@/features/courses";
import { useAppStore } from "@/stores/app-store";

export function ValutazioniView() {
  const students = useAppStore((s) => s.students);
  const [corsoId, setCorsoId] = useState(courses[0].id);
  const corso = courses.find((c) => c.id === corsoId)!;
  const rows = students
    .filter((s) => s.corsiIds.includes(corsoId))
    .map((s) => {
      const g = grades.find((x) => x.studentId === s.id && x.corsoId === corsoId);
      const media = g ? Math.round((g.speaking + g.listening + g.reading + g.writing) / 4) : 0;
      return { s, g, media };
    });

  const votoColor = (v: number) =>
    v >= 85
      ? "bg-success/10 text-success border-success/40"
      : v >= 70
        ? "bg-primary/10 text-primary border-primary/40"
        : v >= 55
          ? "bg-warning/15 text-warning-foreground border-warning/40"
          : "bg-destructive/10 text-destructive border-destructive/40";

  return (
    <>
      <AppHeader searchPlaceholder="Cerca studenti..." />
      <main className="flex-1 overflow-auto p-6 space-y-4">
        <div className="flex items-center gap-3">
          <span className="text-sm font-medium">Corso:</span>
          <Select value={corsoId} onValueChange={setCorsoId}>
            <SelectTrigger className="w-80">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              {courses.map((c) => (
                <SelectItem key={c.id} value={c.id}>
                  {c.nome} · {c.livello}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
          <Badge variant="outline" className={`ml-auto ${levelColor(corso.livello)}`}>
            {corso.livello}
          </Badge>
        </div>
        <div className="rounded-xl border bg-card overflow-hidden">
          <Table>
            <TableHeader>
              <TableRow className="hover:bg-transparent">
                {["Studente", "Speaking", "Listening", "Reading", "Writing", "Media"].map((h) => (
                  <TableHead
                    key={h}
                    className="text-[10px] font-semibold uppercase tracking-[0.14em] text-muted-foreground first:pl-6"
                  >
                    {h}
                  </TableHead>
                ))}
              </TableRow>
            </TableHeader>
            <TableBody>
              {rows.length === 0 && (
                <TableRow>
                  <TableCell colSpan={6} className="text-center text-sm text-muted-foreground py-8">
                    Nessuno studente iscritto a questo corso.
                  </TableCell>
                </TableRow>
              )}
              {rows.map(({ s, g, media }) => (
                <TableRow key={s.id} className="hover:bg-muted/40">
                  <TableCell className="pl-6 font-medium text-sm">
                    {s.nome} {s.cognome}
                  </TableCell>
                  {(["speaking", "listening", "reading", "writing"] as const).map((k) => (
                    <TableCell key={k} className="tabular text-sm">
                      {g ? g[k] : "—"}
                    </TableCell>
                  ))}
                  <TableCell>
                    <Badge
                      variant="outline"
                      className={`tabular text-[11px] font-semibold ${votoColor(media)}`}
                    >
                      {media}
                    </Badge>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </div>
      </main>
    </>
  );
}
