import { useMemo, useState } from "react";
import { AppHeader } from "@/components/app-header";
import { Avatar, AvatarImage, AvatarFallback } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { useAppStore, LEVELS_UI } from "@/stores/app-store";
import { courses, calcolaEta, CONTRATTI } from "@/lib/mock-data";
import { levelColor, type Level } from "@/features/courses";
import { Eye, Mail, Calendar, Phone, Pencil, Trash2 } from "lucide-react";
import { DocumentPreviewDialog, type DocumentRecord } from "@/features/documents";
import { PillSelect } from "@/components/ui/pill-select";
import { StudentForm } from "./student-form";
import type { StudentFormValues, Student, StudentStatus } from "../types";
import { toast } from "sonner";
import { formatDateSafe } from "@/lib/utils";
import { it } from "date-fns/locale";
import { DataTable } from "@/components/data-table";
import type { TableCol } from "@/components/data-table";

function InteractiveLevelBadge({ studentId, livello }: { studentId: string; livello: Level }) {
  const updateStudent = useAppStore((s) => s.updateStudent);

  const solidLevelColor = (l: Level): string => {
    switch (l) {
      case "A1":
        return "bg-chart-2 hover:bg-chart-2/95 focus:bg-chart-2 text-white border-transparent";
      case "A2":
        return "bg-chart-3 hover:bg-chart-3/95 focus:bg-chart-3 text-white border-transparent";
      case "B1":
        return "bg-chart-1 hover:bg-chart-1/95 focus:bg-chart-1 text-white border-transparent";
      case "B2":
        return "bg-chart-5 hover:bg-chart-5/95 focus:bg-chart-5 text-white border-transparent";
      case "C1":
        return "bg-chart-4 hover:bg-chart-4/95 focus:bg-chart-4 text-white border-transparent";
      case "C2":
        return "bg-primary hover:bg-primary/95 focus:bg-primary text-white border-transparent";
    }
  };

  const options = LEVELS_UI.map((l) => ({
    value: l,
    label: l,
    activeClass: solidLevelColor(l),
    inactiveClass: `bg-muted/30 hover:bg-muted/70 focus:bg-muted/70 text-muted-foreground hover:text-foreground focus:text-foreground font-medium ${levelColor(l)} border-transparent hover:border-transparent`,
  }));

  return (
    <PillSelect
      value={livello}
      onChange={(val) => {
        updateStudent(studentId, { livello: val as Level });
        toast.success(`Livello aggiornato a ${val}`);
      }}
      options={options}
      minWidth="90px"
      trigger={
        <button
          className="focus:outline-none select-none cursor-pointer"
          onClick={(e) => e.stopPropagation()}
        >
          <Badge
            variant="outline"
            className={`text-[11px] font-semibold transition-all hover:brightness-95 hover:scale-105 active:scale-95 cursor-pointer ${levelColor(livello)}`}
          >
            {livello}
          </Badge>
        </button>
      }
    />
  );
}

function InteractiveStatoBadge({ studentId, stato }: { studentId: string; stato: StudentStatus }) {
  const updateStudent = useAppStore((s) => s.updateStudent);

  const map = {
    attivo: "bg-success/10 text-success border-success/40",
    sospeso: "bg-warning/15 text-warning-foreground border-warning/40",
    ritirato: "bg-muted text-muted-foreground border-border",
  };
  const label = { attivo: "Attivo", sospeso: "Sospeso", ritirato: "Ritirato" }[stato];

  const options = [
    {
      value: "attivo",
      label: "Attivo",
      activeClass:
        "bg-emerald-500 hover:bg-emerald-500/90 focus:bg-emerald-500 text-white font-semibold",
      dotColor: "bg-success",
    },
    {
      value: "sospeso",
      label: "Non attivo",
      activeClass: "bg-amber-500 hover:bg-amber-500/90 focus:bg-amber-500 text-white font-semibold",
      dotColor: "bg-warning",
    },
    {
      value: "ritirato",
      label: "Ritirato",
      activeClass: "bg-slate-500 hover:bg-slate-500/90 focus:bg-slate-500 text-white font-semibold",
      dotColor: "bg-muted-foreground",
    },
  ];

  return (
    <PillSelect
      value={stato}
      onChange={(val) => {
        updateStudent(studentId, { stato: val as StudentStatus });
        toast.success(`Stato aggiornato a ${val}`);
      }}
      options={options}
      minWidth="130px"
      trigger={
        <button
          className="focus:outline-none select-none cursor-pointer"
          onClick={(e) => e.stopPropagation()}
        >
          <Badge
            variant="outline"
            className={`text-[11px] font-medium rounded-full gap-1.5 transition-all hover:brightness-95 hover:scale-105 active:scale-95 cursor-pointer ${map[stato]}`}
          >
            <span className="h-1.5 w-1.5 rounded-full bg-current" />
            {label}
          </Badge>
        </button>
      }
    />
  );
}

const getCols = (onViewDoc: (s: Student) => void): TableCol<Student>[] => [
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
    render: (s) => <InteractiveLevelBadge studentId={s.id} livello={s.livello} />,
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
      <span className="text-sm tabular text-muted-foreground">
        {formatDateSafe(s.dataNascita)}
      </span>
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
    render: (s) => <InteractiveStatoBadge studentId={s.id} stato={s.stato} />,
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
  const students = useAppStore((s) => s.students);
  const documents = useAppStore((s) => s.documents);
  const addStudent = useAppStore((s) => s.addStudent);
  const updateStudent = useAppStore((s) => s.updateStudent);
  const removeStudent = useAppStore((s) => s.removeStudent);

  const [open, setOpen] = useState(false);
  const [editing, setEditing] = useState<Student | null>(null);

  const [previewDoc, setPreviewDoc] = useState<DocumentRecord | null>(null);
  const [previewOpen, setPreviewOpen] = useState(false);

  const defaultCols = useMemo(() => {
    return getCols((student) => {
      const doc = documents.find(
        (d) =>
          d.studentName.toLowerCase() === student.nome.toLowerCase() &&
          d.studentLastName.toLowerCase() === student.cognome.toLowerCase(),
      );
      if (doc) {
        setPreviewDoc(doc);
        setPreviewOpen(true);
      } else {
        toast.error("Nessun contratto di iscrizione trovato per questo studente.");
      }
    });
  }, [documents]);

  const handleFormSubmit = (formData: StudentFormValues) => {
    if (editing) {
      updateStudent(editing.id, formData);
      toast.success("Studente aggiornato");
    } else {
      addStudent(formData);
      toast.success("Studente aggiunto");
    }
    setOpen(false);
    setEditing(null);
  };

  const initialFormValues: StudentFormValues = editing
    ? {
        nome: editing.nome,
        cognome: editing.cognome,
        email: editing.email,
        telefono: editing.telefono,
        livello: editing.livello,
        dataNascita: editing.dataNascita,
        stato: editing.stato,
        foto: editing.foto ?? "",
        dataIscrizione: editing.dataIscrizione,
        contratto: editing.contratto ?? CONTRATTI[0],
        corsiIds: [...editing.corsiIds],
      }
    : {
        nome: "",
        cognome: "",
        email: "",
        telefono: "",
        livello: "A1" as Level,
        dataNascita: "2005-01-01",
        foto: "",
        stato: "attivo" as StudentStatus,
        dataIscrizione: new Date().toISOString().slice(0, 10),
        contratto: CONTRATTI[0] as string,
        corsiIds: [],
      };

  return (
    <>
      <AppHeader
        searchPlaceholder="Cerca studenti per nome o email..."
        onNew={() => {
          setEditing(null);
          setOpen(true);
        }}
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
          onRowEdit={(s) => {
            setEditing(s);
            setOpen(true);
          }}
          onRowDelete={(s) => {
            removeStudent(s.id);
            toast.success("Studente eliminato");
          }}
          onDeleteSelected={(ids) => {
            ids.forEach((id) => removeStudent(id));
            toast.success("Studenti eliminati");
          }}
          renderCard={(s) => {
            const initials = `${s.nome[0]}${s.cognome[0]}`;
            const eta = calcolaEta(s.dataNascita);
            const formattedRegDate = formatDateSafe(s.dataIscrizione);
            const hasDoc = documents.some(
              (d) =>
                d.studentName.toLowerCase() === s.nome.toLowerCase() &&
                d.studentLastName.toLowerCase() === s.cognome.toLowerCase(),
            );
            const handleViewDoc = (e: React.MouseEvent) => {
              e.stopPropagation();
              const doc = documents.find(
                (d) =>
                  d.studentName.toLowerCase() === s.nome.toLowerCase() &&
                  d.studentLastName.toLowerCase() === s.cognome.toLowerCase(),
              );
              if (doc) {
                setPreviewDoc(doc);
                setPreviewOpen(true);
              } else {
                toast.error("Nessun contratto di iscrizione trovato per questo studente.");
              }
            };
            return (
              <div className="flex flex-col h-full bg-card rounded-2xl overflow-hidden border border-border/40 hover:border-primary/30 shadow-sm hover:shadow-lg transition-all duration-300 select-none group relative">
                {/* ── Header band ── */}
                <div
                  className={`card-header relative shrink-0 px-5 text-center
                  ${s.stato === "attivo" ? "bg-gradient-to-br from-emerald-500/10 to-emerald-500/3" : s.stato === "sospeso" ? "bg-gradient-to-br from-amber-500/10 to-amber-500/3" : "bg-gradient-to-br from-destructive/10 to-destructive/3"}`}
                >
                  <div className="absolute top-3 left-3">
                    <Badge
                      variant="outline"
                      className={`card-badge font-bold rounded-full border-0 shadow-sm px-3 py-1 ${levelColor(s.livello)}`}
                    >
                      {s.livello}
                    </Badge>
                  </div>
                  <div className="absolute top-3 right-3 opacity-0 group-hover:opacity-100 transition-opacity flex gap-1.5">
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        setEditing(s);
                        setOpen(true);
                      }}
                      className="h-7 w-7 bg-background/95 hover:text-primary rounded-full flex items-center justify-center shadow border border-border/50 cursor-pointer"
                    >
                      <Pencil className="h-3.5 w-3.5" />
                    </button>
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        removeStudent(s.id);
                        toast.success("Studente eliminato");
                      }}
                      className="h-7 w-7 bg-destructive text-white rounded-full flex items-center justify-center shadow cursor-pointer"
                    >
                      <Trash2 className="h-3.5 w-3.5" />
                    </button>
                  </div>
                  <div className="relative inline-block">
                    <Avatar className="card-avatar border-4 border-background shadow-xl">
                      {s.foto && <AvatarImage src={s.foto} alt={`${s.nome} ${s.cognome}`} />}
                      <AvatarFallback className="card-avatar-initials font-bold bg-primary/10 text-primary">
                        {initials}
                      </AvatarFallback>
                    </Avatar>
                    <span
                      className={`card-status-dot absolute bottom-1 right-1 rounded-full border-[3px] border-background shadow
                      ${s.stato === "attivo" ? "bg-emerald-500" : s.stato === "sospeso" ? "bg-amber-400" : "bg-destructive"}`}
                    />
                  </div>
                  <h3 className="card-title mt-3 font-extrabold text-foreground tracking-tight group-hover:text-primary transition-colors">
                    {s.nome} {s.cognome}
                  </h3>
                  <p className="card-subtitle text-muted-foreground">
                    {s.stato === "attivo"
                      ? "Attivo"
                      : s.stato === "sospeso"
                        ? "Sospeso"
                        : "Ritirato"}
                  </p>
                </div>

                {/* ── Stat chips ── */}
                <div className="-mt-6 px-4 shrink-0 relative z-10">
                  <div className="grid grid-cols-3 gap-2">
                    {[
                      { label: "Età", value: `${eta} anni` },
                      { label: "Iscritto", value: formattedRegDate },
                      { label: "Corsi", value: String(s.corsiIds.length) },
                    ].map(({ label, value }) => (
                      <div
                        key={label}
                        className="card-chip bg-background border border-border/40 rounded-xl px-2 text-center shadow-sm"
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

                {/* ── Info chips grid + courses ── */}
                <div className="flex-1 flex flex-col px-4 pt-4 pb-4 min-h-0">
                  <div className="grid grid-cols-2 gap-2">
                    {/* Email — full width, clickable */}
                    <a
                      href={`mailto:${s.email}`}
                      className="col-span-2 group/chip flex items-center gap-2.5 bg-muted/20 hover:bg-primary/5 border border-border/30 hover:border-primary/30 rounded-xl px-3 card-chip transition-all duration-200 cursor-pointer"
                    >
                      <Mail className="card-info-icon shrink-0 text-muted-foreground/50 group-hover/chip:text-primary/70 transition-colors" />
                      <div className="min-w-0">
                        <p className="card-chip-label font-bold text-muted-foreground uppercase tracking-wider">
                          Email
                        </p>
                        <p className="card-chip-value font-semibold text-foreground truncate">
                          {s.email}
                        </p>
                      </div>
                    </a>

                    {/* Telefono */}
                    {s.telefono ? (
                      <a
                        href={`tel:${s.telefono}`}
                        className="group/chip flex items-center gap-2.5 bg-muted/20 hover:bg-primary/5 border border-border/30 hover:border-primary/30 rounded-xl px-3 card-chip transition-all duration-200 cursor-pointer"
                      >
                        <Phone className="card-info-icon shrink-0 text-muted-foreground/50 group-hover/chip:text-primary/70 transition-colors" />
                        <div className="min-w-0">
                          <p className="card-chip-label font-bold text-muted-foreground uppercase tracking-wider">
                            Tel
                          </p>
                          <p className="card-chip-value font-semibold text-foreground font-mono truncate">
                            {s.telefono}
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
                          {formatDateSafe(s.dataNascita)}
                        </p>
                      </div>
                    </div>

                    {/* Contratto — full width */}
                    {hasDoc ? (
                      <button
                        onClick={handleViewDoc}
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
                          <p className="card-chip-value text-muted-foreground/60 italic">
                            Nessun contratto
                          </p>
                        </div>
                      </div>
                    )}
                  </div>

                  {/* Spacer */}
                  <div className="flex-1" />

                  {/* Course badges */}
                  {s.corsiIds.length > 0 && (
                    <div className="pt-3 border-t border-border/30 flex flex-wrap gap-1.5">
                      {s.corsiIds.map((cid) => {
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
            onCancel={() => {
              setOpen(false);
              setEditing(null);
            }}
            submitLabel={editing ? "Salva Modifiche" : "Crea Studente"}
          />
        </DialogContent>
      </Dialog>

      <DocumentPreviewDialog
        documentRecord={previewDoc}
        isOpen={previewOpen}
        onClose={() => {
          setPreviewOpen(false);
          setPreviewDoc(null);
        }}
      />
    </>
  );
}
