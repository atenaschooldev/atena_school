import { useState, useMemo } from "react";
import { AppHeader } from "@/components/app-header";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { courses } from "@/lib/mock-data";
import { DataTable } from "@/components/data-table";
import type { TableCol } from "@/components/data-table";
import { useAppStore } from "@/stores/app-store";
import { DocumentPreviewDialog, type DocumentRecord } from "@/features/documents";
import { Eye, Mail, Phone, Briefcase, Calendar, Pencil, Trash2 } from "lucide-react";
import { formatDateSafe } from "@/lib/utils";
import { toast } from "sonner";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { TeacherForm } from "./teacher-form";
import type { Teacher, TeacherFormValues } from "../types";

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
              variant="secondary"
              className="text-[10px] rounded-full whitespace-nowrap"
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
  const teachers = useAppStore((s) => s.teachers);
  const addTeacher = useAppStore((s) => s.addTeacher);
  const updateTeacher = useAppStore((s) => s.updateTeacher);
  const removeTeacher = useAppStore((s) => s.removeTeacher);
  const documents = useAppStore((s) => s.documents);

  const [open, setOpen] = useState(false);
  const [editing, setEditing] = useState<Teacher | null>(null);

  const [previewDoc, setPreviewDoc] = useState<DocumentRecord | null>(null);
  const [previewOpen, setPreviewOpen] = useState(false);

  const defaultCols = useMemo(() => {
    return getCols((teacher) => {
      const doc = documents.find(
        (d) =>
          d.studentName.toLowerCase() === teacher.nome.toLowerCase() &&
          d.studentLastName.toLowerCase() === teacher.cognome.toLowerCase(),
      );
      if (doc) {
        setPreviewDoc(doc);
        setPreviewOpen(true);
      } else {
        toast.error("Nessun contratto di assunzione trovato per questo insegnante.");
      }
    });
  }, [documents]);

  const handleFormSubmit = (formData: TeacherFormValues) => {
    const payload = {
      ...formData,
      oreSettimana: editing ? editing.oreSettimana : 0,
    };
    if (editing) {
      updateTeacher(editing.id, payload);
      toast.success("Insegnante aggiornato");
    } else {
      addTeacher(payload);
      toast.success("Insegnante creato");
    }
    setOpen(false);
    setEditing(null);
  };

  const initialFormValues = useMemo<TeacherFormValues>(() => {
    if (editing) {
      return {
        nome: editing.nome,
        cognome: editing.cognome,
        email: editing.email,
        telefono: editing.telefono || "",
        esperienzaAnni: editing.esperienzaAnni || 0,
        esperienzaMesi: editing.esperienzaMesi || 0,
        stato: editing.stato || "attivo",
        dataNascita: editing.dataNascita || "",
        dataAssunzione: editing.dataAssunzione || "",
        foto: editing.foto || "",
        corsiIds: editing.corsiIds || [],
      };
    }
    return {
      nome: "",
      cognome: "",
      email: "",
      telefono: "",
      esperienzaAnni: 0,
      esperienzaMesi: 0,
      stato: "attivo",
      dataNascita: "",
      dataAssunzione: new Date().toISOString().slice(0, 10),
      foto: "",
      corsiIds: [],
    };
  }, [editing]);

  return (
    <>
      <AppHeader
        searchPlaceholder="Cerca insegnanti..."
        onNew={() => {
          setEditing(null);
          setOpen(true);
        }}
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
          onRowEdit={(t) => {
            setEditing(t);
            setOpen(true);
          }}
          onRowDelete={(t) => {
            removeTeacher(t.id);
            toast.success("Insegnante eliminato");
          }}
          onDeleteSelected={(ids) => {
            ids.forEach((id) => removeTeacher(id));
            toast.success("Insegnanti eliminati");
          }}
          renderCard={(t) => {
            const initials = `${t.nome[0]}${t.cognome[0]}`;
            const experienceText =
              t.esperienzaAnni > 0 || t.esperienzaMesi > 0
                ? `${t.esperienzaAnni} ${t.esperienzaAnni === 1 ? "anno" : "anni"}${t.esperienzaMesi > 0 ? ` e ${t.esperienzaMesi} ${t.esperienzaMesi === 1 ? "mese" : "mesi"}` : ""}`
                : "Nessuna";
            const formattedHireDate = formatDateSafe(t.dataAssunzione);
            return (
              <div className="flex flex-col h-full bg-card rounded-2xl overflow-hidden border border-border/40 hover:border-primary/30 shadow-sm hover:shadow-lg transition-all duration-300 select-none group relative">
                {/* ── Header band ── */}
                <div
                  className={`card-header relative shrink-0 px-5 pt-6 pb-12 text-center
                  ${t.stato === "attivo" ? "bg-gradient-to-br from-emerald-500/10 to-primary/5" : "bg-gradient-to-br from-amber-500/10 to-amber-500/3"}`}
                >
                  <div className="absolute top-3 right-3 opacity-0 group-hover:opacity-100 transition-opacity flex gap-1.5">
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        setEditing(t);
                        setOpen(true);
                      }}
                      className="h-7 w-7 bg-background/95 hover:text-primary rounded-full flex items-center justify-center shadow border border-border/50 cursor-pointer"
                    >
                      <Pencil className="h-3.5 w-3.5" />
                    </button>
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        removeTeacher(t.id);
                        toast.success("Insegnante eliminato");
                      }}
                      className="h-7 w-7 bg-destructive text-white rounded-full flex items-center justify-center shadow cursor-pointer"
                    >
                      <Trash2 className="h-3.5 w-3.5" />
                    </button>
                  </div>
                  <div className="relative inline-block">
                    <Avatar className="card-avatar h-24 w-24 border-4 border-background shadow-xl">
                      {t.foto && <AvatarImage src={t.foto} alt={`${t.nome} ${t.cognome}`} />}
                      <AvatarFallback className="card-avatar-initials text-2xl font-bold bg-primary/10 text-primary">
                        {initials}
                      </AvatarFallback>
                    </Avatar>
                    <span
                      className={`card-status-dot absolute bottom-1 right-1 h-5 w-5 rounded-full border-[3px] border-background shadow
                      ${t.stato === "attivo" ? "bg-emerald-500" : "bg-amber-400"}`}
                    />
                  </div>
                  <h3 className="card-title mt-3 font-extrabold text-lg text-foreground tracking-tight group-hover:text-primary transition-colors">
                    {t.nome} {t.cognome}
                  </h3>
                  <p className="card-subtitle text-sm text-muted-foreground mt-1">
                    {t.stato === "attivo" ? "Attivo" : "In ferie"}
                  </p>
                </div>

                {/* ── Stat chips ── */}
                <div className="-mt-6 px-4 shrink-0 relative z-10">
                  <div className="grid grid-cols-3 gap-2">
                    {[
                      { label: "Esperienza", value: `${t.esperienzaAnni}a ${t.esperienzaMesi}m` },
                      { label: "Assunto", value: formattedHireDate },
                      { label: "Corsi", value: String(t.corsiIds.length) },
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
                      href={`mailto:${t.email}`}
                      className="col-span-2 group/chip flex items-center gap-2.5 bg-muted/20 hover:bg-primary/5 border border-border/30 hover:border-primary/30 rounded-xl px-3 card-chip transition-all duration-200 cursor-pointer"
                    >
                      <Mail className="card-info-icon shrink-0 text-muted-foreground/50 group-hover/chip:text-primary/70 transition-colors" />
                      <div className="min-w-0">
                        <p className="card-chip-label font-bold text-muted-foreground uppercase tracking-wider">
                          Email
                        </p>
                        <p className="card-chip-value font-semibold text-foreground truncate">
                          {t.email}
                        </p>
                      </div>
                    </a>

                    {/* Telefono */}
                    {t.telefono ? (
                      <a
                        href={`tel:${t.telefono}`}
                        className="group/chip flex items-center gap-2.5 bg-muted/20 hover:bg-primary/5 border border-border/30 hover:border-primary/30 rounded-xl px-3 card-chip transition-all duration-200 cursor-pointer"
                      >
                        <Phone className="card-info-icon shrink-0 text-muted-foreground/50 group-hover/chip:text-primary/70 transition-colors" />
                        <div className="min-w-0">
                          <p className="card-chip-label font-bold text-muted-foreground uppercase tracking-wider">
                            Tel
                          </p>
                          <p className="card-chip-value font-semibold text-foreground font-mono truncate">
                            {t.telefono}
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
                          {formatDateSafe(t.dataNascita)}
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
                          {t.oreSettimana} ore
                        </p>
                      </div>
                    </div>
                  </div>

                  {/* Spacer */}
                  <div className="flex-1" />

                  {/* Course badges */}
                  <div className="pt-3 border-t border-border/30">
                    {t.corsiIds.length > 0 ? (
                      <div className="flex flex-wrap gap-1.5">
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
            onCancel={() => {
              setOpen(false);
              setEditing(null);
            }}
            submitLabel={editing ? "Salva Modifiche" : "Crea Insegnante"}
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
