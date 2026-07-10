import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { courses } from "@/lib/mock-data";
import { levelColor, type Level } from "@/features/courses";
import { Eye, Mail, Calendar, Phone, Pencil, Trash2 } from "lucide-react";
import { type Student, type StudentStatus } from "../types";
import { formatDateSafe, calcolaEta } from "@/lib/utils";
import { LevelBadgeSelector, StatusBadgeSelector } from "./student-badges";
import { type DocumentRecord } from "@/features/documents";

interface StudentCardProps {
  student: Student;
  documents: DocumentRecord[];
  onEdit: (student: Student) => void;
  onDelete: (student: Student) => void;
  onViewDocument: (student: Student) => void;
  onLevelChange: (studentId: string, level: Level) => void;
  onStatusChange: (studentId: string, status: StudentStatus) => void;
}

export function StudentCard({
  student,
  documents,
  onEdit,
  onDelete,
  onViewDocument,
  onLevelChange,
  onStatusChange,
}: StudentCardProps) {
  const initials = `${student.nome[0]}${student.cognome[0]}`;
  const eta = calcolaEta(student.dataNascita);
  const formattedRegDate = formatDateSafe(student.dataIscrizione);
  const hasDoc = documents.some(
    (d) =>
      d.studentName.toLowerCase() === student.nome.toLowerCase() &&
      d.studentLastName.toLowerCase() === student.cognome.toLowerCase(),
  );

  return (
    <div className="flex flex-col h-full bg-card rounded-2xl overflow-hidden border border-border/40 hover:border-primary/30 shadow-sm hover:shadow-lg transition-all duration-300 select-none group relative">
      {/* ── Header band ── */}
      <div
        className={`card-header relative shrink-0 px-5 text-center
        ${student.stato === "attivo" ? "bg-gradient-to-br from-emerald-500/10 to-emerald-500/3" : student.stato === "sospeso" ? "bg-gradient-to-br from-amber-500/10 to-amber-500/3" : "bg-gradient-to-br from-destructive/10 to-destructive/3"}`}
      >
        <div className="absolute top-3 left-3">
          <LevelBadgeSelector
            value={student.livello}
            onChange={(level) => onLevelChange(student.id, level)}
          />
        </div>
        <div className="absolute top-3 right-3 opacity-0 group-hover:opacity-100 transition-opacity flex gap-1.5">
          <button
            onClick={(e) => {
              e.stopPropagation();
              onEdit(student);
            }}
            className="h-7 w-7 bg-background/95 hover:text-primary rounded-full flex items-center justify-center shadow border border-border/50 cursor-pointer"
          >
            <Pencil className="h-3.5 w-3.5" />
          </button>
          <button
            onClick={(e) => {
              e.stopPropagation();
              onDelete(student);
            }}
            className="h-7 w-7 bg-destructive text-white rounded-full flex items-center justify-center shadow cursor-pointer"
          >
            <Trash2 className="h-3.5 w-3.5" />
          </button>
        </div>
        <div className="relative inline-block">
          <Avatar className="card-avatar border-4 border-background shadow-xl">
            {student.foto && (
              <AvatarImage src={student.foto} alt={`${student.nome} ${student.cognome}`} />
            )}
            <AvatarFallback className="card-avatar-initials font-bold bg-primary/10 text-primary">
              {initials}
            </AvatarFallback>
          </Avatar>
          <span
            className={`card-status-dot absolute bottom-1 right-1 rounded-full border-[3px] border-background shadow
            ${student.stato === "attivo" ? "bg-emerald-500" : student.stato === "sospeso" ? "bg-amber-400" : "bg-destructive"}`}
          />
        </div>
        <h3 className="card-title mt-3 font-extrabold text-foreground tracking-tight group-hover:text-primary transition-colors">
          {student.nome} {student.cognome}
        </h3>
        <div className="card-subtitle mt-1 flex justify-center">
          <StatusBadgeSelector
            value={student.stato}
            onChange={(status) => onStatusChange(student.id, status)}
          />
        </div>
      </div>

      {/* ── Stat chips ── */}
      <div className="-mt-6 px-4 shrink-0 relative z-10">
        <div className="grid grid-cols-3 gap-2">
          {[
            { label: "Età", value: `${eta} anni` },
            { label: "Iscritto", value: formattedRegDate },
            { label: "Corsi", value: String(student.corsiIds.length) },
          ].map(({ label, value }) => (
            <div
              key={label}
              className="card-chip bg-background border border-border/40 rounded-xl px-2 text-center shadow-sm"
            >
              <p className="card-chip-label font-bold text-muted-foreground uppercase tracking-wider">
                {label}
              </p>
              <p className="card-chip-value font-bold text-foreground truncate">{value}</p>
            </div>
          ))}
        </div>
      </div>

      {/* ── Info chips grid + courses ── */}
      <div className="flex-1 flex flex-col px-4 pt-4 pb-4 min-h-0">
        <div className="grid grid-cols-2 gap-2">
          {/* Email — full width, clickable */}
          <a
            href={`mailto:${student.email}`}
            className="col-span-2 group/chip flex items-center gap-2.5 bg-muted/20 hover:bg-primary/5 border border-border/30 hover:border-primary/30 rounded-xl px-3 card-chip transition-all duration-200 cursor-pointer"
          >
            <Mail className="card-info-icon shrink-0 text-muted-foreground/50 group-hover/chip:text-primary/70 transition-colors" />
            <div className="min-w-0">
              <p className="card-chip-label font-bold text-muted-foreground uppercase tracking-wider">
                Email
              </p>
              <p className="card-chip-value font-semibold text-foreground truncate">
                {student.email}
              </p>
            </div>
          </a>

          {/* Telefono */}
          {student.telefono ? (
            <a
              href={`tel:${student.telefono}`}
              className="group/chip flex items-center gap-2.5 bg-muted/20 hover:bg-primary/5 border border-border/30 hover:border-primary/30 rounded-xl px-3 card-chip transition-all duration-200 cursor-pointer"
            >
              <Phone className="card-info-icon shrink-0 text-muted-foreground/50 group-hover/chip:text-primary/70 transition-colors" />
              <div className="min-w-0">
                <p className="card-chip-label font-bold text-muted-foreground uppercase tracking-wider">
                  Tel
                </p>
                <p className="card-chip-value font-semibold text-foreground font-mono truncate">
                  {student.telefono}
                </p>
              </div>
            </a>
          ) : (
            <div className="bg-muted/10 border border-border/20 rounded-xl px-3 card-chip opacity-50">
              <p className="card-chip-label font-bold text-muted-foreground uppercase tracking-wider">
                Tel
              </p>
              <p className="card-chip-value text-muted-foreground italic">—</p>
            </div>
          )}

          {/* Nato il */}
          <div className="flex items-center gap-2.5 bg-muted/20 border border-border/30 rounded-xl px-3 card-chip">
            <Calendar className="card-info-icon shrink-0 text-muted-foreground/50" />
            <div className="min-w-0">
              <p className="card-chip-label font-bold text-muted-foreground uppercase tracking-wider">
                Nato il
              </p>
              <p className="card-chip-value font-semibold text-foreground truncate">
                {formatDateSafe(student.dataNascita)}
              </p>
            </div>
          </div>

          {/* Contratto — full width */}
          {hasDoc ? (
            <button
              onClick={(e) => {
                e.stopPropagation();
                onViewDocument(student);
              }}
              className="col-span-2 group/chip flex items-center gap-2.5 bg-primary/5 hover:bg-primary/10 border border-primary/20 hover:border-primary/40 rounded-xl px-3 card-chip transition-all duration-200 cursor-pointer w-full text-left"
            >
              <Eye className="card-info-icon shrink-0 text-primary/60 group-hover/chip:text-primary transition-colors" />
              <div className="min-w-0">
                <p className="card-chip-label font-bold text-primary/60 uppercase tracking-wider">
                  Contratto
                </p>
                <p className="card-chip-value font-semibold text-primary truncate">
                  Visualizza documento →
                </p>
              </div>
            </button>
          ) : (
            <div className="col-span-2 flex items-center gap-2.5 bg-muted/10 border border-border/20 rounded-xl px-3 card-chip opacity-60">
              <Eye className="card-info-icon shrink-0 text-muted-foreground/40" />
              <div className="min-w-0">
                <p className="card-chip-label font-bold text-muted-foreground/60 uppercase tracking-wider">
                  Contratto
                </p>
                <p className="card-chip-value text-muted-foreground/60 italic">Nessun contratto</p>
              </div>
            </div>
          )}
        </div>

        {/* Spacer */}
        <div className="flex-1" />

        {/* Course badges */}
        {student.corsiIds.length > 0 && (
          <div className="pt-3 border-t border-border/30 flex flex-wrap gap-1.5">
            {student.corsiIds.map((cid) => {
              const c = courses.find((x) => x.id === cid);
              return c ? (
                <Badge
                  key={cid}
                  variant="outline"
                  className="card-badge font-semibold rounded-lg px-2.5 py-0.5 bg-muted/30 text-muted-foreground border-border/40 hover:bg-primary/5 hover:text-primary hover:border-primary/20 transition-all cursor-default"
                >
                  {c.nome}
                </Badge>
              ) : null;
            })}
          </div>
        )}
      </div>
    </div>
  );
}
