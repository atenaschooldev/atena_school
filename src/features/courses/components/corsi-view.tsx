import { useState, useMemo } from "react";
import { AppHeader } from "@/components/app-header";
import { Badge } from "@/components/ui/badge";
import { levelColor } from "../utils";
import { DataTable } from "@/components/data-table";
import type { TableCol } from "@/components/data-table";
import { useAppStore } from "@/stores/app-store";
import { toast } from "sonner";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { CourseForm } from "./course-form";
import { Pencil, Trash2, Users, BookOpen, Euro } from "lucide-react";
import type { Course, CourseFormValues } from "../types";
import type { Student } from "@/features/students";
import type { Teacher } from "@/features/teachers";

const getCols = (teachers: Teacher[], students: Student[]): TableCol<Course>[] => [
  {
    key: "nome",
    label: "Corso",
    width: 220,
    flexGrow: true,
    maxWidth: 350,
    render: (c) => (
      <div className="flex items-center gap-3">
        <div className="h-9 w-14 rounded-lg overflow-hidden border border-border/40 bg-muted shrink-0 shadow-sm">
          {c.foto ? (
            <img src={c.foto} alt={c.nome} className="h-full w-full object-cover" />
          ) : (
            <div className="h-full w-full bg-primary/10 text-primary flex items-center justify-center text-xs font-semibold">
              {c.nome[0]}
            </div>
          )}
        </div>
        <span className="font-semibold text-sm whitespace-nowrap text-foreground">{c.nome}</span>
      </div>
    ),
    copy: (c) => c.nome,
    hasFilter: true,
    hasSearch: true,
    sortAscLabel: "A → Z",
    sortDescLabel: "Z → A",
    sortFn: (a, b) => a.nome.localeCompare(b.nome),
  },
  {
    key: "categoria",
    label: "Categoria",
    width: 150,
    render: (c) => (
      <span className="text-sm font-medium text-muted-foreground whitespace-nowrap">
        {c.categoria}
      </span>
    ),
    copy: (c) => c.categoria,
    hasFilter: true,
    hasSearch: true,
    directFilter: true,
    filterOptions: (data) =>
      Array.from(new Set(data.map((c) => c.categoria)))
        .sort()
        .map((cat) => ({ value: cat, label: cat })),
    filterFn: (c, filter) => {
      const selectMatch =
        !filter.selected || filter.selected.length === 0 || filter.selected.includes(c.categoria);
      return selectMatch;
    },
  },
  {
    key: "durata",
    label: "Durata",
    width: 120,
    render: (c) => (
      <span className="text-sm font-mono text-muted-foreground whitespace-nowrap">{c.durata}</span>
    ),
    copy: (c) => c.durata,
    hasFilter: true,
    hasSearch: true,
  },
  {
    key: "prezzo",
    label: "Prezzo",
    width: 110,
    align: "right",
    render: (c) => (
      <span className="text-sm font-mono font-medium text-foreground whitespace-nowrap">
        € {c.prezzo.toFixed(2)}
      </span>
    ),
    copy: (c) => `€ ${c.prezzo.toFixed(2)}`,
    hasFilter: true,
    hasSearch: true,
    sortAscLabel: "Più economici",
    sortDescLabel: "Più costosi",
    sortFn: (a, b) => a.prezzo - b.prezzo,
  },
  {
    key: "stato",
    label: "Stato",
    width: 140,
    align: "center",
    render: (c) => {
      const label = { attivo: "Attivo", "in-programmazione": "Pianificato", concluso: "Concluso" }[
        c.stato
      ];
      return (
        <Badge
          variant="outline"
          className={`text-[11px] rounded-full gap-1.5 whitespace-nowrap ${c.stato === "attivo" ? "bg-success/10 text-success border-success/40" : c.stato === "in-programmazione" ? "bg-warning/15 text-warning-foreground border-warning/40" : "bg-muted text-muted-foreground border-border"}`}
        >
          <span className="h-1.5 w-1.5 rounded-full bg-current" />
          {label}
        </Badge>
      );
    },
    copy: (c) => c.stato,
    hasFilter: true,
    hasSearch: true,
    directFilter: true,
    filterOptions: [
      { value: "attivo", label: "Attivo" },
      { value: "in-programmazione", label: "Pianificato" },
      { value: "concluso", label: "Concluso" },
    ],
    filterFn: (c, filter) => {
      const selectMatch =
        !filter.selected || filter.selected.length === 0 || filter.selected.includes(c.stato);
      return selectMatch;
    },
  },
  {
    key: "studentiIscritti",
    label: "Iscritti",
    width: 110,
    align: "center",
    render: (c) => {
      const iscritti = students.filter((s) => s.corsiIds.includes(c.id)).length;
      return (
        <span className="text-sm font-medium whitespace-nowrap">
          {iscritti} / {c.capienza}
        </span>
      );
    },
    copy: (c) => {
      const iscritti = students.filter((s) => s.corsiIds.includes(c.id)).length;
      return `${iscritti} / ${c.capienza}`;
    },
    sortAscLabel: "Meno frequentati",
    sortDescLabel: "Più frequentati",
    sortFn: (a, b) => {
      const countA = students.filter((s) => s.corsiIds.includes(a.id)).length;
      const countB = students.filter((s) => s.corsiIds.includes(b.id)).length;
      return countA - countB;
    },
  },
  {
    key: "insegnanti",
    label: "Insegnanti",
    width: 220,
    flexGrow: true,
    maxWidth: 350,
    render: (c) => (
      <div className="flex gap-1.5 flex-nowrap overflow-visible py-1">
        {(c.insegnanteIds || [c.insegnanteId]).map((tid) => {
          const t = teachers.find((x) => x.id === tid);
          return t ? (
            <Badge
              key={tid}
              variant="outline"
              className="text-[10px] rounded-full whitespace-nowrap bg-primary/5 text-primary border-primary/20"
            >
              {t.nome} {t.cognome}
            </Badge>
          ) : null;
        })}
        {(!c.insegnanteIds || c.insegnanteIds.length === 0) && !c.insegnanteId && (
          <span className="text-xs text-muted-foreground">—</span>
        )}
      </div>
    ),
    copy: (c) =>
      (c.insegnanteIds || [c.insegnanteId])
        .map((tid) => {
          const t = teachers.find((x) => x.id === tid);
          return t ? `${t.nome} ${t.cognome}` : "";
        })
        .filter(Boolean)
        .join(", "),
    hasFilter: true,
    hasSearch: true,
    directFilter: true,
    filterOptions: teachers.map((t) => ({ value: t.id, label: `${t.nome} ${t.cognome}` })),
    filterFn: (c, filter) => {
      const ids = c.insegnanteIds || [c.insegnanteId];
      const selectMatch =
        !filter.selected ||
        filter.selected.length === 0 ||
        ids.some((tid) => filter.selected!.includes(tid));
      return selectMatch;
    },
  },
  {
    key: "descrizione",
    label: "Descrizione",
    width: 260,
    flexGrow: true,
    render: (c) => (
      <span className="text-sm text-muted-foreground whitespace-nowrap">{c.descrizione}</span>
    ),
    copy: (c) => c.descrizione,
    hasFilter: true,
    hasSearch: true,
  },
];

const STORAGE_KEY = "atena-corsi-cols-v1";

export function CorsiView() {
  const coursesList = useAppStore((s) => s.courses);
  const addCourse = useAppStore((s) => s.addCourse);
  const updateCourse = useAppStore((s) => s.updateCourse);
  const removeCourse = useAppStore((s) => s.removeCourse);

  const teachers = useAppStore((s) => s.teachers);
  const students = useAppStore((s) => s.students);

  const [open, setOpen] = useState(false);
  const [editing, setEditing] = useState<Course | null>(null);

  const defaultCols = useMemo(() => getCols(teachers, students), [teachers, students]);

  const handleFormSubmit = (formData: CourseFormValues) => {
    // Primary teacher is mapped to the first teacher in teachers array
    const primaryId = formData.insegnanteIds[0] || "";
    const payload = {
      ...formData,
      insegnanteId: primaryId,
    };
    if (editing) {
      updateCourse(editing.id, payload);
      toast.success("Corso aggiornato");
    } else {
      addCourse(payload);
      toast.success("Corso creato");
    }
    setOpen(false);
    setEditing(null);
  };

  const initialFormValues = useMemo<CourseFormValues>(() => {
    if (editing) {
      return {
        nome: editing.nome,
        livello: editing.livello || "A1",
        insegnanteIds: editing.insegnanteIds || [editing.insegnanteId].filter(Boolean),
        moduli: editing.moduli || 1,
        capienza: editing.capienza || 10,
        colore: editing.colore || "chart-1",
        descrizione: editing.descrizione || "",
        foto: editing.foto || "",
        categoria: editing.categoria || "General English",
        durata: editing.durata || "60 ore",
        prezzo: editing.prezzo || 0,
        stato: editing.stato || "attivo",
      };
    }
    return {
      nome: "",
      livello: "A1",
      insegnanteIds: [],
      moduli: 8,
      capienza: 15,
      colore: "chart-1",
      descrizione: "",
      foto: "",
      categoria: "General English",
      durata: "60 ore",
      prezzo: 0,
      stato: "attivo",
    };
  }, [editing]);

  return (
    <>
      <AppHeader
        searchPlaceholder="Cerca corsi..."
        onNew={() => {
          setEditing(null);
          setOpen(true);
        }}
        newLabel="Corso"
        tableKey="corsi"
      />
      <main className="flex-1 min-h-0 overflow-hidden flex flex-col">
        <DataTable<Course>
          data={coursesList}
          defaultCols={defaultCols}
          storageKey={STORAGE_KEY}
          tableKey="corsi"
          footerLabelSingular="corso"
          footerLabelPlural="corsi"
          onRowEdit={(c) => {
            setEditing(c);
            setOpen(true);
          }}
          onRowDelete={(c) => {
            removeCourse(c.id);
            toast.success("Corso eliminato");
          }}
          onDeleteSelected={(ids) => {
            ids.forEach((id) => removeCourse(id));
            toast.success("Corsi eliminati");
          }}
          renderCard={(c) => {
            const iscritti = students.filter((s) => s.corsiIds.includes(c.id)).length;
            const statusLabel = {
              attivo: "Attivo",
              "in-programmazione": "Pianificato",
              concluso: "Concluso",
            }[c.stato];
            return (
              <div className="flex flex-col h-full bg-card rounded-2xl overflow-hidden border border-border/40 hover:border-primary/30 shadow-sm hover:shadow-lg transition-all duration-300 select-none group relative">
                {/* ── Banner / Photo header ── */}
                <div className="card-banner relative shrink-0 bg-gradient-to-br from-primary/10 to-emerald-500/10 overflow-hidden">
                  {c.foto ? (
                    <img
                      src={c.foto}
                      alt={c.nome}
                      className="h-full w-full object-cover group-hover:scale-105 transition-transform duration-500"
                    />
                  ) : (
                    <div className="h-full w-full flex items-center justify-center text-4xl font-black text-primary/20 uppercase tracking-widest">
                      {c.nome.slice(0, 2)}
                    </div>
                  )}
                  <div className="absolute top-3 right-3 flex flex-col gap-1.5 items-end">
                    <Badge
                      variant="outline"
                      className={`text-xs font-bold rounded-full border-0 px-3 py-0.5 shadow ${c.stato === "attivo" ? "bg-emerald-500 text-white" : c.stato === "in-programmazione" ? "bg-amber-400 text-white" : "bg-slate-500 text-white"}`}
                    >
                      {statusLabel}
                    </Badge>
                    <Badge
                      variant="outline"
                      className="text-xs font-bold rounded-full border-0 px-2.5 py-0.5 bg-background/90 text-muted-foreground shadow-sm"
                    >
                      {c.categoria}
                    </Badge>
                  </div>
                  <div className="absolute top-3 left-3">
                    <Badge
                      variant="outline"
                      className={`text-xs font-bold rounded-full border-0 shadow-sm px-3 py-0.5 ${levelColor(c.livello)}`}
                    >
                      {c.livello}
                    </Badge>
                  </div>
                  <div className="absolute bottom-3 left-3 backdrop-blur-md bg-background/85 border border-white/20 px-3 py-1 rounded-full text-sm font-bold flex items-center gap-1 shadow">
                    <Euro className="h-3.5 w-3.5 text-primary" />
                    {c.prezzo}
                  </div>
                  <div className="absolute bottom-3 right-3 opacity-0 group-hover:opacity-100 transition-opacity flex gap-1.5">
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        setEditing(c);
                        setOpen(true);
                      }}
                      className="h-7 w-7 bg-background/95 hover:text-primary rounded-full flex items-center justify-center shadow border border-border/50 cursor-pointer"
                    >
                      <Pencil className="h-3.5 w-3.5" />
                    </button>
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        removeCourse(c.id);
                        toast.success("Corso eliminato");
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
                      { label: "Iscritti", value: `${iscritti}/${c.capienza}` },
                      { label: "Durata", value: c.durata },
                      { label: "Moduli", value: String(c.moduli) },
                    ].map(({ label, value }) => (
                      <div
                        key={label}
                        className="card-chip bg-muted/30 border border-border/30 rounded-xl px-2 text-center"
                      >
                        <p className="card-chip-label font-bold text-muted-foreground uppercase tracking-wider">
                          {label}
                        </p>
                        <p className="card-chip-value font-bold text-foreground truncate">
                          {value}
                        </p>
                      </div>
                    ))}
                  </div>
                </div>

                {/* ── Body ── */}
                <div className="flex-1 flex flex-col px-4 pb-4 min-h-0">
                  <div>
                    <h3 className="card-course-title font-extrabold text-foreground tracking-tight leading-snug group-hover:text-primary transition-colors line-clamp-1">
                      {c.nome}
                    </h3>
                    <p className="card-course-desc text-muted-foreground line-clamp-3 leading-relaxed">
                      {c.descrizione}
                    </p>
                  </div>

                  {/* Spacer — pushes progress+teachers to bottom */}
                  <div className="flex-1" />

                  {/* Capacity bar */}
                  <div className="space-y-2 pt-2">
                    <div className="flex items-center justify-between card-progress-label font-bold text-muted-foreground">
                      <span>Riempimento</span>
                      <span className="font-mono text-foreground">
                        {Math.round((iscritti / c.capienza) * 100)}%
                      </span>
                    </div>
                    <div className="card-progress-bar bg-muted rounded-full overflow-hidden">
                      <div
                        className="h-full bg-gradient-to-r from-primary to-emerald-500 rounded-full transition-all duration-500"
                        style={{ width: `${Math.min(100, (iscritti / c.capienza) * 100)}%` }}
                      />
                    </div>
                  </div>

                  {/* Teachers row */}
                  <div className="mt-3 pt-3 border-t border-border/30 flex items-center justify-between gap-2">
                    <span className="card-teacher-label text-muted-foreground font-medium">
                      Insegnanti
                    </span>
                    <div className="flex -space-x-2">
                      {(c.insegnanteIds || [c.insegnanteId]).map((tid, idx) => {
                        const t = teachers.find((x) => x.id === tid);
                        if (!t) return null;
                        return (
                          <div
                            key={tid}
                            title={`${t.nome} ${t.cognome}`}
                            className="card-teacher-avatar rounded-full border-2 border-background bg-primary/10 flex items-center justify-center font-bold text-primary shadow-sm hover:z-10 hover:scale-110 transition-all cursor-default relative"
                            style={{ zIndex: 10 - idx }}
                          >
                            {t.foto ? (
                              <img
                                src={t.foto}
                                alt={t.nome}
                                className="h-full w-full object-cover rounded-full"
                              />
                            ) : (
                              `${t.nome[0]}${t.cognome[0]}`
                            )}
                          </div>
                        );
                      })}
                    </div>
                  </div>
                </div>
              </div>
            );
          }}
        />
      </main>

      <Dialog
        open={open}
        onOpenChange={(v) => {
          setOpen(v);
          if (!v) setEditing(null);
        }}
      >
        <DialogContent className="sm:max-w-3xl p-6 rounded-2xl border border-border/50 shadow-xl bg-background/95 backdrop-blur-md">
          <DialogHeader className="pb-2 border-b border-border/30 shrink-0">
            <DialogTitle className="text-base font-bold flex items-center gap-2 text-foreground">
              <span className="h-2 w-2 rounded-full bg-primary animate-pulse" />
              {editing ? "Modifica corso" : "Nuovo corso"}
            </DialogTitle>
            <p className="text-[11px] text-muted-foreground mt-0.5">
              {editing
                ? "Modifica le informazioni generali, il prezzo, gli insegnanti e la descrizione del corso."
                : "Crea un nuovo corso inserendo tutti i dettagli professionali."}
            </p>
          </DialogHeader>

          <CourseForm
            key={editing ? editing.id : "new"}
            initialValues={initialFormValues}
            onSubmit={handleFormSubmit}
            onCancel={() => {
              setOpen(false);
              setEditing(null);
            }}
            submitLabel={editing ? "Salva Modifiche" : "Crea Corso"}
          />
        </DialogContent>
      </Dialog>
    </>
  );
}
