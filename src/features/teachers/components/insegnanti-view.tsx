import { useMemo } from "react";
import { AppHeader } from "@/components/app-header";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { courses } from "@/lib/mock-data";
import { DataTable } from "@/components/data-table";
import type { TableCol } from "@/components/data-table";
import { DocumentPreviewDialog } from "@/features/documents";
import { Eye } from "lucide-react";
import { formatDateSafe } from "@/lib/utils";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { TeacherForm } from "./teacher-form";
import type { Teacher } from "../types";
import { useTeachers } from "../hooks/use-teachers";
import { TeacherCard } from "./teacher-card";

const getCols = (onViewDoc: (t: Teacher) => void): TableCol<Teacher>[] => [
  {
    key: "nome",
    label: "Insegnante",
    width: 180,
    flexGrow: true,
    maxWidth: 320,
    render: (t) => (
      <div className="flex items-center gap-3">
        <Avatar className="h-9 w-9">
          {t.foto && (
            <AvatarImage src={t.foto} alt={`${t.nome} ${t.cognome}`} referrerPolicy="no-referrer" />
          )}
          <AvatarFallback className="bg-primary/10 text-primary text-xs font-semibold">
            {t.nome[0]}
            {t.cognome[0]}
          </AvatarFallback>
        </Avatar>
        <span className="font-medium text-sm whitespace-nowrap">
          {t.nome} {t.cognome}
        </span>
      </div>
    ),
    copy: (t) => `${t.nome} ${t.cognome}`,
    hasFilter: true,
    hasSearch: true,
    filterOptions: (data) =>
      Array.from(new Set(data.map((t) => `${t.nome} ${t.cognome}`)))
        .sort()
        .map((n) => ({ value: n, label: n })),
    filterFn: (t, filter) => {
      const termMatch =
        !filter.search ||
        t.nome.toLowerCase().includes(filter.search.toLowerCase()) ||
        t.cognome.toLowerCase().includes(filter.search.toLowerCase());
      const selectMatch =
        !filter.selected ||
        filter.selected.length === 0 ||
        filter.selected.includes(`${t.nome} ${t.cognome}`);
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
    label: "Email",
    width: 210,
    flexGrow: true,
    render: (t) => (
      <span className="text-sm text-muted-foreground whitespace-nowrap">{t.email}</span>
    ),
    copy: (t) => t.email,
    hasFilter: true,
    hasSearch: true,
    filterOptions: (data) =>
      Array.from(new Set(data.map((t) => t.email)))
        .sort()
        .map((e) => ({ value: e, label: e })),
    filterFn: (t, filter) => {
      const termMatch =
        !filter.search || t.email.toLowerCase().includes(filter.search.toLowerCase());
      const selectMatch =
        !filter.selected || filter.selected.length === 0 || filter.selected.includes(t.email);
      return termMatch && selectMatch;
    },
    sortAscLabel: "Ordinamento A → Z",
    sortDescLabel: "Ordinamento Z → A",
    sortFn: (a, b) => a.email.localeCompare(b.email),
  },
  {
    key: "telefono",
    label: "Telefono",
    width: 140,
    render: (t) => (
      <span className="text-sm font-mono text-muted-foreground whitespace-nowrap">
        {t.telefono}
      </span>
    ),
    copy: (t) => t.telefono,
    hasFilter: true,
    hasSearch: true,
    filterOptions: (data) =>
      Array.from(new Set(data.map((t) => t.telefono)))
        .sort()
        .map((p) => ({ value: p, label: p })),
    filterFn: (t, filter) => {
      const termMatch = !filter.search || t.telefono.includes(filter.search);
      const selectMatch =
        !filter.selected || filter.selected.length === 0 || filter.selected.includes(t.telefono);
      return termMatch && selectMatch;
    },
  },
  {
    key: "esperienza",
    label: "Esperienza",
    width: 170,
    render: (t) => {
      const anni = t.esperienzaAnni || 0;
      const mesi = t.esperienzaMesi || 0;
      const parts: string[] = [];
      if (anni > 0) {
        parts.push(anni === 1 ? "1 anno" : `${anni} anni`);
      }
      if (mesi > 0) {
        parts.push(mesi === 1 ? "1 mese" : `${mesi} mesi`);
      }
      const label = parts.length === 0 ? "Senza esperienza" : parts.join(" e ");
      return <span className="text-sm font-medium whitespace-nowrap">{label}</span>;
    },
    copy: (t) => {
      const anni = t.esperienzaAnni || 0;
      const mesi = t.esperienzaMesi || 0;
      const parts: string[] = [];
      if (anni > 0) {
        parts.push(anni === 1 ? "1 anno" : `${anni} anni`);
      }
      if (mesi > 0) {
        parts.push(mesi === 1 ? "1 mese" : `${mesi} mesi`);
      }
      return parts.length === 0 ? "Senza esperienza" : parts.join(" e ");
    },
    hasFilter: true,
    hasSearch: true,
    filterOptions: (data) =>
      Array.from(
        new Set(
          data.map((t) => {
            const anni = t.esperienzaAnni || 0;
            const mesi = t.esperienzaMesi || 0;
            const parts: string[] = [];
            if (anni > 0) parts.push(anni === 1 ? "1 anno" : `${anni} anni`);
            if (mesi > 0) parts.push(mesi === 1 ? "1 mese" : `${mesi} mesi`);
            return parts.length === 0 ? "Senza esperienza" : parts.join(" e ");
          }),
        ),
      )
        .sort()
        .map((exp) => ({ value: exp, label: exp })),
    filterFn: (t, filter) => {
      const anni = t.esperienzaAnni || 0;
      const mesi = t.esperienzaMesi || 0;
      const parts: string[] = [];
      if (anni > 0) parts.push(anni === 1 ? "1 anno" : `${anni} anni`);
      if (mesi > 0) parts.push(mesi === 1 ? "1 mese" : `${mesi} mesi`);
      const label = parts.length === 0 ? "Senza esperienza" : parts.join(" e ");

      const termMatch = !filter.search || label.toLowerCase().includes(filter.search.toLowerCase());
      const selectMatch =
        !filter.selected || filter.selected.length === 0 || filter.selected.includes(label);
      return termMatch && selectMatch;
    },
    sortAscLabel: "Meno esperti",
    sortDescLabel: "Più esperti",
    sortFn: (a, b) => {
      const totalA = (a.esperienzaAnni || 0) * 12 + (a.esperienzaMesi || 0);
      const totalB = (b.esperienzaAnni || 0) * 12 + (b.esperienzaMesi || 0);
      return totalA - totalB;
    },
  },
  {
    key: "stato",
    label: "Stato",
    width: 100,
    align: "center",
    render: (t) => (
      <Badge
        variant="outline"
        className={`text-[11px] rounded-full gap-1.5 ${t.stato === "attivo" ? "bg-success/10 text-success border-success/40" : "bg-warning/15 text-warning-foreground border-warning/40"}`}
      >
        <span className="h-1.5 w-1.5 rounded-full bg-current" />
        {t.stato === "attivo" ? "Attivo" : "In ferie"}
      </Badge>
    ),
    copy: (t) => (t.stato === "attivo" ? "Attivo" : "In ferie"),
    hasFilter: true,
    hasSearch: true,
    directFilter: true,
    filterOptions: [
      { value: "attivo", label: "Attivo" },
      { value: "in-ferie", label: "In ferie" },
    ],
    filterFn: (t, filter) => {
      const selectMatch =
        !filter.selected || filter.selected.length === 0 || filter.selected.includes(t.stato);
      const searchMatch =
        !filter.search ||
        (t.stato === "attivo" ? "attivo" : "in ferie")
          .toLowerCase()
          .includes(filter.search.toLowerCase());
      return selectMatch && searchMatch;
    },
  },
  {
    key: "dataNascita",
    label: "Data di Nascita",
    width: 130,
    render: (t) => (
      <span className="text-sm font-mono text-muted-foreground whitespace-nowrap">
        {formatDateSafe(t.dataNascita)}
      </span>
    ),
    copy: (t) => t.dataNascita,
    sortAscLabel: "Dal più anziano al più giovane",
    sortDescLabel: "Dal più giovane al più anziano",
    sortFn: (a, b) => new Date(a.dataNascita).getTime() - new Date(b.dataNascita).getTime(),
  },
  {
    key: "dataAssunzione",
    label: "Inizio Lavoro",
    width: 130,
    render: (t) => (
      <span className="text-sm font-mono text-muted-foreground whitespace-nowrap">
        {formatDateSafe(t.dataAssunzione)}
      </span>
    ),
    copy: (t) => t.dataAssunzione,
    sortAscLabel: "Dall'assunzione meno recente",
    sortDescLabel: "Dall'assunzione più recente",
    sortFn: (a, b) => new Date(a.dataAssunzione).getTime() - new Date(b.dataAssunzione).getTime(),
  },
  {
    key: "corsi",
    label: "Corsi",
    width: 240,
    flexGrow: true,
    maxWidth: 450,
    render: (t) => (
      <div className="flex gap-1 flex-nowrap overflow-visible py-1">
        {t.corsiIds.map((cid) => {
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
        {t.corsiIds.length === 0 && <span className="text-xs text-muted-foreground">—</span>}
      </div>
    ),
    copy: (t) => t.corsiIds.map((cid) => courses.find((x) => x.id === cid)?.nome ?? "").join(", "),
    hasFilter: true,
    hasSearch: true,
    directFilter: true,
    filterOptions: courses.map((c) => ({ value: c.id, label: c.nome })),
    filterFn: (t, filter) => {
      const selectMatch =
        !filter.selected ||
        filter.selected.length === 0 ||
        t.corsiIds.some((cid) => filter.selected!.includes(cid));
      const searchMatch =
        !filter.search ||
        t.corsiIds.some((cid) =>
          (courses.find((c) => c.id === cid)?.nome || "")
            .toLowerCase()
            .includes(filter.search!.toLowerCase()),
        );
      return selectMatch && searchMatch;
    },
  },
  {
    key: "documenti",
    label: "Contratto",
    width: 100,
    align: "center",
    render: (t) =>
      t.documenti === 0 ? (
        <span className="text-xs text-muted-foreground">Nessuno</span>
      ) : (
        <Button
          variant="ghost"
          size="icon"
          className="h-8 w-8 text-primary"
          onClick={(e) => {
            e.stopPropagation();
            onViewDoc(t);
          }}
        >
          <Eye className="h-4 w-4" />
        </Button>
      ),
    copy: (t) => `${t.documenti} documenti`,
  },
];

const STORAGE_KEY = "atena-insegnanti-cols-v5";

export function InsegnantiView() {
  const {
    teachers,
    open,
    editing,
    previewDoc,
    previewOpen,
    initialFormValues,
    handleNewClick,
    handleEditClick,
    handleDeleteClick,
    handleDeleteSelected,
    handleFormSubmit,
    handleViewDocument,
    handleCloseDialog,
    handleClosePreview,
  } = useTeachers();

  const defaultCols = useMemo(() => {
    return getCols(handleViewDocument);
  }, [handleViewDocument]);

  return (
    <>
      <AppHeader
        searchPlaceholder="Cerca insegnanti..."
        onNew={handleNewClick}
        newLabel="Insegnanti"
        tableKey="insegnanti"
      />
      <main className="flex-1 min-h-0 overflow-hidden flex flex-col">
        <DataTable<Teacher>
          data={teachers}
          defaultCols={defaultCols}
          storageKey={STORAGE_KEY}
          tableKey="insegnanti"
          footerLabelSingular="insegnante"
          footerLabelPlural="insegnanti"
          onRowEdit={handleEditClick}
          onRowDelete={handleDeleteClick}
          onDeleteSelected={handleDeleteSelected}
          renderCard={(t) => (
            <TeacherCard teacher={t} onEdit={handleEditClick} onDelete={handleDeleteClick} />
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
              {editing ? "Modifica insegnante" : "Nuovo insegnante"}
            </DialogTitle>
            <p className="text-[11px] text-muted-foreground mt-0.5">
              {editing
                ? "Modifica le informazioni del profilo, corsi e stato dell'insegnante."
                : "Crea un nuovo insegnante inserendo i suoi dettagli professionali."}
            </p>
          </DialogHeader>

          <TeacherForm
            key={editing ? editing.id : "new"}
            initialValues={initialFormValues}
            onSubmit={handleFormSubmit}
            onCancel={handleCloseDialog}
            submitLabel={editing ? "Salva Modifiche" : "Crea Insegnante"}
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
