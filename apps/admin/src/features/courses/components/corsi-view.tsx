import { useMemo } from "react";
import { AppHeader } from "@/components/app-header";
import { Badge } from "@/components/ui/badge";
import { levelColor } from "../utils";
import { DataTable } from "@/components/data-table";
import type { TableCol } from "@/components/data-table";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { CourseForm } from "./course-form";
import type { Course } from "../types";
import type { Student } from "@/features/students";
import type { Teacher } from "@/features/teachers";
import { useCourses } from "../hooks/use-courses";
import { CourseCard } from "./course-card";

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
  const {
    coursesList,
    teachers,
    students,
    open,
    editing,
    initialFormValues,
    handleNewClick,
    handleEditClick,
    handleDeleteClick,
    handleDeleteSelected,
    handleFormSubmit,
    handleCloseDialog,
  } = useCourses();

  const defaultCols = useMemo(() => getCols(teachers, students), [teachers, students]);

  return (
    <>
      <AppHeader
        searchPlaceholder="Cerca corsi..."
        onNew={handleNewClick}
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
          onRowEdit={handleEditClick}
          onRowDelete={handleDeleteClick}
          onDeleteSelected={handleDeleteSelected}
          renderCard={(c) => (
            <CourseCard
              course={c}
              students={students}
              teachers={teachers}
              onEdit={handleEditClick}
              onDelete={handleDeleteClick}
            />
          )}
        />
      </main>

      <Dialog
        open={open}
        onOpenChange={(v) => {
          if (!v) handleCloseDialog();
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
            onCancel={handleCloseDialog}
            submitLabel={editing ? "Salva Modifiche" : "Crea Corso"}
          />
        </DialogContent>
      </Dialog>
    </>
  );
}
