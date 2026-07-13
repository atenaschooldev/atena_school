import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import type { Student } from "@/features/students";

interface GradesTableProps {
  rows: Array<{
    s: Student;
    g: { speaking: number; listening: number; reading: number; writing: number } | undefined;
    media: number;
  }>;
  votoColor: (v: number) => string;
}

export function GradesTable({ rows, votoColor }: GradesTableProps) {
  return (
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
  );
}
