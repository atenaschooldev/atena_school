import { AppHeader } from "@/components/app-header";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import { courses } from "@/lib/mock-data";
import { levelColor } from "@/features/courses";
import { useGrades } from "../hooks/use-grades";
import { GradesTable } from "./grades-table";

export function ValutazioniView() {
  const { corsoId, setCorsoId, corso, rows, votoColor } = useGrades();

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
        <GradesTable rows={rows} votoColor={votoColor} />
      </main>
    </>
  );
}
