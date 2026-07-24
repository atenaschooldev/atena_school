import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { courses } from "@/lib/mock-data";
import { Mail, Phone, Calendar, Briefcase, Pencil, Trash2 } from "lucide-react";
import { type Teacher } from "../types";
import { formatDateSafe } from "@/lib/utils";

interface TeacherCardProps {
  teacher: Teacher;
  onEdit: (teacher: Teacher) => void;
  onDelete: (teacher: Teacher) => void;
}

export function TeacherCard({ teacher, onEdit, onDelete }: TeacherCardProps) {
  const initials = `${teacher.nome[0]}${teacher.cognome[0]}`;
  const formattedHireDate = formatDateSafe(teacher.dataAssunzione);

  return (
    <div className="flex flex-col h-full bg-card rounded-2xl overflow-hidden border border-border/40 hover:border-primary/30 shadow-sm hover:shadow-lg transition-all duration-300 select-none group relative">
      {/* ── Header band ── */}
      <div
        className={`card-header relative shrink-0 px-5 pt-6 pb-12 text-center
        ${teacher.stato === "attivo" ? "bg-gradient-to-br from-emerald-500/10 to-primary/5" : "bg-gradient-to-br from-amber-500/10 to-amber-500/3"}`}
      >
        <div className="absolute top-3 right-3 opacity-0 group-hover:opacity-100 transition-opacity flex gap-1.5">
          <button
            onClick={(e) => {
              e.stopPropagation();
              onEdit(teacher);
            }}
            className="h-7 w-7 bg-background/95 hover:text-primary rounded-full flex items-center justify-center shadow border border-border/50 cursor-pointer"
          >
            <Pencil className="h-3.5 w-3.5" />
          </button>
          <button
            onClick={(e) => {
              e.stopPropagation();
              onDelete(teacher);
            }}
            className="h-7 w-7 bg-destructive text-white rounded-full flex items-center justify-center shadow cursor-pointer"
          >
            <Trash2 className="h-3.5 w-3.5" />
          </button>
        </div>
        <div className="relative inline-block">
          <Avatar className="card-avatar h-24 w-24 border-4 border-background shadow-xl">
            {teacher.foto && (
              <AvatarImage src={teacher.foto} alt={`${teacher.nome} ${teacher.cognome}`} />
            )}
            <AvatarFallback className="card-avatar-initials text-2xl font-bold bg-primary/10 text-primary">
              {initials}
            </AvatarFallback>
          </Avatar>
          <span
            className={`card-status-dot absolute bottom-1 right-1 h-5 w-5 rounded-full border-[3px] border-background shadow
            ${teacher.stato === "attivo" ? "bg-emerald-500" : "bg-amber-400"}`}
          />
        </div>
        <h3 className="card-title mt-3 font-extrabold text-lg text-foreground tracking-tight group-hover:text-primary transition-colors">
          {teacher.nome} {teacher.cognome}
        </h3>
        <p className="card-subtitle text-sm text-muted-foreground mt-1">
          {teacher.stato === "attivo" ? "Attivo" : "In ferie"}
        </p>
      </div>

      {/* ── Stat chips ── */}
      <div className="-mt-6 px-4 shrink-0 relative z-10">
        <div className="grid grid-cols-3 gap-2">
          {[
            { label: "Esperienza", value: `${teacher.esperienzaAnni}a ${teacher.esperienzaMesi}m` },
            { label: "Assunto", value: formattedHireDate },
            { label: "Corsi", value: String(teacher.corsiIds.length) },
          ].map(({ label, value }) => (
            <div
              key={label}
              className="card-chip bg-background border border-border/40 rounded-xl px-2 py-2.5 text-center shadow-sm"
            >
              <p className="card-chip-label text-[10px] font-bold text-muted-foreground uppercase tracking-wider">
                {label}
              </p>
              <p className="card-chip-value text-sm font-bold text-foreground mt-0.5 truncate">
                {value}
              </p>
            </div>
          ))}
        </div>
      </div>

      {/* ── Info chips grid + courses ── */}
      <div className="flex-1 flex flex-col px-4 pt-4 pb-4 min-h-0">
        <div className="grid grid-cols-2 gap-2">
          {/* Email — full width */}
          <a
            href={`mailto:${teacher.email}`}
            className="col-span-2 group/chip flex items-center gap-2.5 bg-muted/20 hover:bg-primary/5 border border-border/30 hover:border-primary/30 rounded-xl px-3 card-chip transition-all duration-200 cursor-pointer"
          >
            <Mail className="card-info-icon shrink-0 text-muted-foreground/50 group-hover/chip:text-primary/70 transition-colors" />
            <div className="min-w-0">
              <p className="card-chip-label font-bold text-muted-foreground uppercase tracking-wider">
                Email
              </p>
              <p className="card-chip-value font-semibold text-foreground truncate">
                {teacher.email}
              </p>
            </div>
          </a>

          {/* Telefono */}
          {teacher.telefono ? (
            <a
              href={`tel:${teacher.telefono}`}
              className="group/chip flex items-center gap-2.5 bg-muted/20 hover:bg-primary/5 border border-border/30 hover:border-primary/30 rounded-xl px-3 card-chip transition-all duration-200 cursor-pointer"
            >
              <Phone className="card-info-icon shrink-0 text-muted-foreground/50 group-hover/chip:text-primary/70 transition-colors" />
              <div className="min-w-0">
                <p className="card-chip-label font-bold text-muted-foreground uppercase tracking-wider">
                  Tel
                </p>
                <p className="card-chip-value font-semibold text-foreground font-mono truncate">
                  {teacher.telefono}
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
                {formatDateSafe(teacher.dataNascita)}
              </p>
            </div>
          </div>

          {/* Ore settimana — full width */}
          <div className="col-span-2 flex items-center gap-2.5 bg-muted/20 border border-border/30 rounded-xl px-3 card-chip">
            <Briefcase className="card-info-icon shrink-0 text-muted-foreground/50" />
            <div className="min-w-0">
              <p className="card-chip-label font-bold text-muted-foreground uppercase tracking-wider">
                Ore/settimana
              </p>
              <p className="card-chip-value font-semibold text-foreground truncate">
                {teacher.oreSettimana} ore
              </p>
            </div>
          </div>
        </div>

        {/* Spacer */}
        <div className="flex-1" />

        {/* Course badges */}
        <div className="pt-3 border-t border-border/30">
          {teacher.corsiIds.length > 0 ? (
            <div className="flex flex-wrap gap-1.5">
              {teacher.corsiIds.map((cid) => {
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
          ) : (
            <p className="card-badge text-muted-foreground/60 italic text-center">
              Nessun corso assegnato
            </p>
          )}
        </div>
      </div>
    </div>
  );
}
