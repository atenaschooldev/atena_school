import { useMemo } from "react";
import { AppHeader } from "@/components/app-header";
import { Avatar, AvatarImage, AvatarFallback } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { courses } from "@/lib/mock-data";
import { type Level } from "@/features/courses";
import { Eye } from "lucide-react";
import { DocumentPreviewDialog } from "@/features/documents";
import { StudentForm } from "./student-form";
import type { Student, StudentStatus } from "../types";
import { formatDateSafe, calcolaEta } from "@/lib/utils";
import { it } from "date-fns/locale";
import { DataTable } from "@/components/data-table";
import type { TableCol } from "@/components/data-table";
import { useStudents } from "../hooks/use-students";
import { LevelBadgeSelector, StatusBadgeSelector } from "./student-badges";
import { StudentCard } from "./student-card";
import { LEVELS_UI } from "@/stores/app-store";

const getCols = (
  onViewDoc: (s: Student) => void,
  onLevelChange: (studentId: string, level: Level) => void,
  onStatusChange: (studentId: string, status: StudentStatus) => void,
): TableCol<Student>[] => [
  {
    key: "nome",
    label: "Nome",
    width: 140,
    flexGrow: true,
    maxWidth: 300,
    render: (s) => (
      <div className="flex items-center gap-3">
        <Avatar className="h-8 w-8">
          {s.foto && (
            <AvatarImage src={s.foto} alt={`${s.nome} ${s.cognome}`} referrerPolicy="no-referrer" />
          )}
          <AvatarFallback className="bg-primary/10 text-primary text-xs font-semibold">
            {s.nome[0]}
            {s.cognome[0]}
          </AvatarFallback>
        </Avatar>
        <span className="font-medium text-sm truncate">
          {s.nome} {s.cognome}
        </span>
      </div>
    ),
    copy: (s) => `${s.nome} ${s.cognome}`,
    hasFilter: true,
    hasSearch: true,
    filterOptions: (data) =>
      Array.from(new Set(data.map((s) => `${s.nome} ${s.cognome}`)))
        .sort()
        .map((n) => ({ value: n, label: n })),
    filterFn: (s, filter) => {
      const termMatch =
        !filter.search ||
        s.nome.toLowerCase().includes(filter.search.toLowerCase()) ||
        s.cognome.toLowerCase().includes(filter.search.toLowerCase());
      const selectMatch =
        !filter.selected ||
        filter.selected.length === 0 ||
        filter.selected.includes(`${s.nome} ${s.cognome}`);
      return termMatch && selectMatch;
    },
    sortAscLabel: "Ordinamento A → Z",
    sortDescLabel: "Ordinamento Z → A",
    sortFn: (a, b) => {
      const nameA = `${a.nome} ${a.cognome}`.toLowerCase();
      const nameB = `${b.nome} ${b.cognome}`.toLowerCase();
      return nameA.localeCompare(nameB);
    },
  },
  {
    key: "email",
    label: "Indirizzo email",
    width: 140,
    flexGrow: true,
    render: (s) => <span className="text-sm text-muted-foreground truncate">{s.email}</span>,
    copy: (s) => s.email,
    hasFilter: true,
    hasSearch: true,
    filterOptions: (data) =>
      Array.from(new Set(data.map((s) => s.email)))
        .sort()
        .map((e) => ({ value: e, label: e })),
    filterFn: (s, filter) => {
      const termMatch =
        !filter.search || s.email.toLowerCase().includes(filter.search.toLowerCase());
      const selectMatch =
        !filter.selected || filter.selected.length === 0 || filter.selected.includes(s.email);
      return termMatch && selectMatch;
    },
    sortAscLabel: "Ordinamento A → Z",
    sortDescLabel: "Ordinamento Z → A",
    sortFn: (a, b) => a.email.localeCompare(b.email),
  },
  {
    key: "telefono",
    label: "Telefono",
    width: 100,
    flexGrow: true,
    maxWidth: 180,
    align: "center",
    render: (s) => (
      <span className="text-sm tabular text-muted-foreground truncate">{s.telefono}</span>
    ),
    copy: (s) => s.telefono,
    hasFilter: true,
    hasSearch: true,
    filterOptions: (data) =>
      Array.from(new Set(data.map((s) => s.telefono)))
        .sort()
        .map((p) => ({ value: p, label: p })),
    filterFn: (s, filter) => {
      const termMatch = !filter.search || s.telefono.includes(filter.search);
      const selectMatch =
        !filter.selected || filter.selected.length === 0 || filter.selected.includes(s.telefono);
      return termMatch && selectMatch;
    },
    sortAscLabel: "Dal minore al maggiore",
    sortDescLabel: "Dal maggiore al minore",
    sortFn: (a, b) => {
      const numA = parseInt(a.telefono.replace(/\D/g, "")) || 0;
      const numB = parseInt(b.telefono.replace(/\D/g, "")) || 0;
      return numA - numB;
    },
  },
  {
    key: "livello",
    label: "Livello",
    width: 85,
    align: "center",
    render: (s) => (
      <LevelBadgeSelector value={s.livello} onChange={(level) => onLevelChange(s.id, level)} />
    ),
    copy: (s) => s.livello,
    hasFilter: true,
    hasSearch: true,
    directFilter: true,
    filterOptions: LEVELS_UI.map((l) => ({ value: l, label: l })),
    filterFn: (s, filter) => {
      const selectMatch =
        !filter.selected || filter.selected.length === 0 || filter.selected.includes(s.livello);
      const searchMatch =
        !filter.search || s.livello.toLowerCase().includes(filter.search.toLowerCase());
      return selectMatch && searchMatch;
    },
  },
  {
    key: "dataNascita",
    label: "Data di nascita",
    width: 90,
    align: "center",
    render: (s) => (
      <span className="text-sm tabular text-muted-foreground">{formatDateSafe(s.dataNascita)}</span>
    ),
    copy: (s) => s.dataNascita,
    sortAscLabel: "Dal più giovane al più anziano",
    sortDescLabel: "Dal più anziano al più giovane",
    sortFn: (a, b) => new Date(a.dataNascita).getTime() - new Date(b.dataNascita).getTime(),
  },
  {
    key: "eta",
    label: "Età",
    width: 70,
    align: "center",
    render: (s) => <span className="text-sm tabular">{calcolaEta(s.dataNascita)}</span>,
    copy: (s) => String(calcolaEta(s.dataNascita)),
    hasFilter: true,
    hasSearch: true,
    filterOptions: (data) =>
      Array.from(new Set(data.map((s) => String(calcolaEta(s.dataNascita)))))
        .sort((a, b) => parseInt(a) - parseInt(b))
        .map((age) => ({ value: age, label: age + " anni" })),
    filterFn: (s, filter) => {
      const age = String(calcolaEta(s.dataNascita));
      const termMatch = !filter.search || age.includes(filter.search);
      const selectMatch =
        !filter.selected || filter.selected.length === 0 || filter.selected.includes(age);
      return termMatch && selectMatch;
    },
    sortAscLabel: "Dal più giovane al più anziano",
    sortDescLabel: "Dal più anziano al più giovane",
    sortFn: (a, b) => calcolaEta(a.dataNascita) - calcolaEta(b.dataNascita),
  },
  {
    key: "corsi",
    label: "Corsi",
    width: 160,
    flexGrow: true,
    maxWidth: 380,
    render: (s) => (
      <div className="flex flex-row flex-nowrap items-center gap-1.5 py-1 max-w-full overflow-x-auto scrollbar-none">
        {s.corsiIds.map((cid) => {
          const c = courses.find((x) => x.id === cid);
          return c ? (
            <Badge
              key={cid}
              variant="secondary"
              className="text-[10px] font-medium rounded-full whitespace-nowrap shrink-0"
            >
              {c.nome}
            </Badge>
          ) : null;
        })}
        {s.corsiIds.length === 0 && <span className="text-xs text-muted-foreground">—</span>}
      </div>
    ),
    copy: (s) => s.corsiIds.map((cid) => courses.find((x) => x.id === cid)?.nome ?? "").join(", "),
    hasFilter: true,
    hasSearch: true,
    directFilter: true,
    filterOptions: courses.map((c) => ({ value: c.id, label: c.nome })),
    filterFn: (s, filter) => {
      const selectMatch =
        !filter.selected ||
        filter.selected.length === 0 ||
        s.corsiIds.some((cid) => filter.selected!.includes(cid));
      const searchMatch =
        !filter.search ||
        s.corsiIds.some((cid) =>
          (courses.find((c) => c.id === cid)?.nome || "")
            .toLowerCase()
            .includes(filter.search!.toLowerCase()),
        );
      return selectMatch && searchMatch;
    },
  },
  {
    key: "documenti",
    label: "Documenti",
    width: 80,
    align: "center",
    render: (s) =>
      s.documenti === 0 ? (
        <span className="text-xs text-muted-foreground">Nessuno</span>
      ) : (
        <Button
          variant="ghost"
          size="icon"
          className="h-8 w-8 text-primary"
          onClick={(e) => {
            e.stopPropagation();
            onViewDoc(s);
          }}
        >
          <Eye className="h-4 w-4" />
        </Button>
      ),
    copy: (s) => `${s.documenti} documenti`,
  },
  {
    key: "stato",
    label: "Stato",
    width: 85,
    align: "center",
    render: (s) => (
      <StatusBadgeSelector value={s.stato} onChange={(status) => onStatusChange(s.id, status)} />
    ),
    copy: (s) => s.stato,
    hasFilter: true,
    hasSearch: true,
    directFilter: true,
    filterOptions: [
      { value: "attivo", label: "Attivo" },
      { value: "sospeso", label: "Sospeso" },
      { value: "ritirato", label: "Ritirato" },
    ],
    filterFn: (s, filter) => {
      const selectMatch =
        !filter.selected || filter.selected.length === 0 || filter.selected.includes(s.stato);
      const searchMatch =
        !filter.search || s.stato.toLowerCase().includes(filter.search.toLowerCase());
      return selectMatch && searchMatch;
    },
  },
  {
    key: "dataIscrizione",
    label: "Data di iscrizione",
    width: 120,
    align: "center",
    render: (s) => (
      <span className="text-sm tabular text-muted-foreground">
        {formatDateSafe(s.dataIscrizione, "MMM dd, yyyy", { locale: it })}
      </span>
    ),
    copy: (s) => s.dataIscrizione,
    sortAscLabel: "Dalla più vecchia alla più recente",
    sortDescLabel: "Dalla più recente alla più vecchia",
    sortFn: (a, b) => new Date(a.dataIscrizione).getTime() - new Date(b.dataIscrizione).getTime(),
  },
];

const STORAGE_KEY = "atena-studenti-cols-v3";

export function StudentiView() {
  const {
    students,
    documents,
    open,
    editing,
    previewDoc,
    previewOpen,
    initialFormValues,
    handleNewClick,
    handleEditClick,
    handleDeleteClick,
    handleDeleteSelected,
    handleLevelChange,
    handleStatusChange,
    handleViewDocument,
    handleFormSubmit,
    handleCloseDialog,
    handleClosePreview,
  } = useStudents();

  const defaultCols = useMemo(() => {
    return getCols(handleViewDocument, handleLevelChange, handleStatusChange);
  }, [handleViewDocument, handleLevelChange, handleStatusChange]);

  return (
    <>
      <AppHeader
        searchPlaceholder="Cerca studenti per nome o email..."
        onNew={handleNewClick}
        newLabel="Studenti"
        tableKey="studenti"
      />
      <main className="flex-1 min-h-0 overflow-hidden flex flex-col">
        <DataTable<Student>
          data={students}
          defaultCols={defaultCols}
          storageKey={STORAGE_KEY}
          tableKey="studenti"
          footerLabelSingular="studente"
          footerLabelPlural="studenti"
          onRowEdit={handleEditClick}
          onRowDelete={handleDeleteClick}
          onDeleteSelected={handleDeleteSelected}
          renderCard={(s) => (
            <StudentCard
              student={s}
              documents={documents}
              onEdit={handleEditClick}
              onDelete={handleDeleteClick}
              onViewDocument={handleViewDocument}
              onLevelChange={handleLevelChange}
              onStatusChange={handleStatusChange}
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
              {editing ? "Modifica studente" : "Nuovo studente"}
            </DialogTitle>
            <p className="text-[11px] text-muted-foreground mt-0.5">
              {editing
                ? "Modifica le informazioni personali, i corsi e lo stato dello studente."
                : "Crea un nuovo studente inserendo le sue informazioni."}
            </p>
          </DialogHeader>

          <StudentForm
            key={editing ? editing.id : "new"}
            initialValues={initialFormValues}
            onSubmit={handleFormSubmit}
            onCancel={handleCloseDialog}
            submitLabel={editing ? "Salva Modifiche" : "Crea Studente"}
          />
        </DialogContent>
      </Dialog>

      <DocumentPreviewDialog
        documentRecord={previewDoc}
        isOpen={previewOpen}
        onClose={handleClosePreview}
      />
    </>
  );
}
