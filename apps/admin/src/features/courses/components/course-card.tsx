import { Badge } from "@/components/ui/badge";
import { Euro, Pencil, Trash2, Calendar, Clock } from "lucide-react";
import { type Course } from "../types";

interface CourseCardProps {
  course: Course;
  onEdit: (course: Course) => void;
  onDelete: (course: Course) => void;
}

export function CourseCard({ course, onEdit, onDelete }: CourseCardProps) {
  const iscritti = 0; // We'll keep this 0 for now since we removed studentCount/capienza
  const statusLabel = {
    attivo: "Attivo",
    "in-programmazione": "Pianificato",
    concluso: "Concluso",
  }[course.stato];

  return (
    <div className="flex flex-col h-full bg-card rounded-2xl overflow-hidden border border-border/40 hover:border-primary/30 shadow-sm hover:shadow-lg transition-all duration-300 select-none group relative">
      {/* ── Banner / Photo header ── */}
      <div className="card-banner relative shrink-0 bg-gradient-to-br from-primary/10 to-emerald-500/10 overflow-hidden">
        {course.foto ? (
          <img
            src={course.foto}
            alt={course.nome}
            className="h-full w-full object-cover group-hover:scale-105 transition-transform duration-500"
          />
        ) : (
          <div className="h-full w-full flex items-center justify-center text-4xl font-black text-primary/20 uppercase tracking-widest">
            {course.nome.slice(0, 2)}
          </div>
        )}
        <div className="absolute top-3 right-3 flex flex-col gap-1.5 items-end">
          <Badge
            variant="outline"
            className={`text-xs font-bold rounded-full border-0 px-3 py-0.5 shadow ${course.stato === "attivo" ? "bg-emerald-500 text-white" : course.stato === "in-programmazione" ? "bg-amber-400 text-white" : "bg-slate-500 text-white"}`}
          >
            {statusLabel}
          </Badge>
          <Badge
            variant="outline"
            className="text-xs font-bold rounded-full border-0 px-2.5 py-0.5 bg-background/90 text-muted-foreground shadow-sm"
          >
            {course.categoria}
          </Badge>
        </div>
        <div className="absolute top-3 left-3">
          <Badge
            variant="outline"
            className="text-xs font-bold rounded-full border-0 shadow-sm px-3 py-0.5 bg-primary/20 text-primary"
          >
            {course.courseFormat || "In Sede"}
          </Badge>
        </div>
        <div className="absolute bottom-3 left-3 backdrop-blur-md bg-background/85 border border-white/20 px-3 py-1 rounded-full text-sm font-bold flex items-center gap-1 shadow">
          <Euro className="h-3.5 w-3.5 text-primary" />
          {course.prezzo}
        </div>
        <div className="absolute bottom-3 right-3 opacity-0 group-hover:opacity-100 transition-opacity flex gap-1.5">
          <button
            onClick={(e) => {
              e.stopPropagation();
              onEdit(course);
            }}
            className="h-7 w-7 bg-background/95 hover:text-primary rounded-full flex items-center justify-center shadow border border-border/50 cursor-pointer"
          >
            <Pencil className="h-3.5 w-3.5" />
          </button>
          <button
            onClick={(e) => {
              e.stopPropagation();
              onDelete(course);
            }}
            className="h-7 w-7 bg-destructive text-white rounded-full flex items-center justify-center shadow cursor-pointer"
          >
            <Trash2 className="h-3.5 w-3.5" />
          </button>
        </div>
      </div>

      {/* ── Stat chips ── */}
      <div className="px-4 pt-3 pb-2 shrink-0">
        <div className="grid grid-cols-3 gap-2">
          {[
            { label: "Lez/Sett", value: course.lessonsPerWeek ? `${course.lessonsPerWeek}x` : "-" },
            { label: "Ore Tot", value: course.totalHours ? `${course.totalHours}h` : "-" },
            { label: "Lez Tot", value: course.totalLessons ? `${course.totalLessons}` : "-" },
          ].map(({ label, value }) => (
            <div
              key={label}
              className="card-chip bg-muted/30 border border-border/30 rounded-xl px-2 text-center"
            >
              <p className="card-chip-label font-bold text-muted-foreground uppercase tracking-wider">
                {label}
              </p>
              <p className="card-chip-value font-bold text-foreground truncate">{value}</p>
            </div>
          ))}
        </div>
      </div>

      {/* ── Body ── */}
      <div className="flex-1 flex flex-col px-4 pb-4 min-h-0">
        <div>
          <h3 className="card-course-title font-extrabold text-foreground tracking-tight leading-snug group-hover:text-primary transition-colors line-clamp-1">
            {course.nome}
          </h3>
          <p className="card-course-desc text-muted-foreground line-clamp-3 leading-relaxed mt-1">
            {course.descrizione}
          </p>
        </div>

        <div className="flex-1" />

        <div className="flex justify-between items-center mt-3 pt-3 border-t border-border/30 text-xs text-muted-foreground">
           <div className="flex items-center gap-1">
             <Calendar className="h-3.5 w-3.5" />
             <span className="font-medium truncate max-w-[120px]">{course.scheduleDays.length > 0 ? course.scheduleDays.join(', ') : "Da definire"}</span>
           </div>
           {course.startTime && (
             <div className="flex items-center gap-1 font-mono">
               <Clock className="h-3.5 w-3.5" />
               <span>{course.startTime}{course.endTime ? ` - ${course.endTime}` : ''}</span>
             </div>
           )}
        </div>
      </div>
    </div>
  );
}
