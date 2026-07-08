import { useState, useMemo, useRef, useEffect } from "react";
import { AppHeader } from "@/components/app-header";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { useAppStore } from "@/stores/app-store";
import { DataTable, type TableCol } from "@/components/data-table";
import { DocumentPreviewDialog } from "./document-preview-dialog";
import {
  FileText,
  Eye,
  ArrowLeft,
  Printer,
  Share2,
  Download,
  User,
  X,
  ZoomIn,
  ZoomOut,
} from "lucide-react";
import { toast } from "sonner";
import { formatDateSafe } from "@/lib/utils";
import { it } from "date-fns/locale";
import type { DocumentRecord } from "../types";

const STORAGE_KEY = "atena-scuola-documenti-cols";

export function DocumentiView() {
  const documents = useAppStore((s) => s.documents);
  const addDocument = useAppStore((s) => s.addDocument);

  const [viewMode, setViewMode] = useState<"list" | "create" | "view">("list");
  const [selectedDoc, setSelectedDoc] = useState<DocumentRecord | null>(null);
  const [zoomScale, setZoomScale] = useState(1);
  const [previewDoc, setPreviewDoc] = useState<DocumentRecord | null>(null);
  const [previewOpen, setPreviewOpen] = useState(false);

  // Form states
  const [nome, setNome] = useState("");
  const [cognome, setCognome] = useState("");
  const [email, setEmail] = useState("");
  const [telefono, setTelefono] = useState("");
  const [dataIscrizione, setDataIscrizione] = useState(new Date().toISOString().slice(0, 10));
  const [genitoreNome, setGenitoreNome] = useState("");
  const [genitoreCognome, setGenitoreCognome] = useState("");
  const [signatureData, setSignatureData] = useState<string | undefined>(undefined);

  // Canvas drawing ref
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const [isDrawing, setIsDrawing] = useState(false);

  // Set up canvas stroke styles
  useEffect(() => {
    if (viewMode !== "create") return;
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    ctx.strokeStyle = "#0f172a"; // slate-900
    ctx.lineWidth = 2.5;
    ctx.lineCap = "round";
    ctx.lineJoin = "round";
  }, [viewMode, canvasRef.current]);

  // Reset form when opening creation
  const handleOpenCreate = () => {
    setNome("");
    setCognome("");
    setEmail("");
    setTelefono("");
    setDataIscrizione(new Date().toISOString().slice(0, 10));
    setGenitoreNome("");
    setGenitoreCognome("");
    setSignatureData(undefined);
    setSelectedDoc(null);
    setViewMode("create");
  };

  // Open existing document in view-only mode
  const handleViewDoc = (doc: DocumentRecord) => {
    setSelectedDoc(doc);
    setNome(doc.studentName);
    setCognome(doc.studentLastName);
    setEmail(doc.email);
    setTelefono(doc.telefono);
    setDataIscrizione(doc.dataIscrizione);
    setGenitoreNome(doc.genitoreName);
    setGenitoreCognome(doc.genitoreLastName);
    setSignatureData(doc.signature);
    setViewMode("view");
  };

  // Canvas Mouse events
  const startDrawing = (e: React.MouseEvent<HTMLCanvasElement>) => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    const rect = canvas.getBoundingClientRect();
    const x = ((e.clientX - rect.left) / rect.width) * canvas.width;
    const y = ((e.clientY - rect.top) / rect.height) * canvas.height;

    ctx.beginPath();
    ctx.moveTo(x, y);
    setIsDrawing(true);
  };

  const draw = (e: React.MouseEvent<HTMLCanvasElement>) => {
    if (!isDrawing) return;
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    const rect = canvas.getBoundingClientRect();
    const x = ((e.clientX - rect.left) / rect.width) * canvas.width;
    const y = ((e.clientY - rect.top) / rect.height) * canvas.height;

    ctx.lineTo(x, y);
    ctx.stroke();
  };

  const stopDrawing = () => {
    if (!isDrawing) return;
    setIsDrawing(false);
    const canvas = canvasRef.current;
    if (canvas) {
      setSignatureData(canvas.toDataURL());
    }
  };

  // Canvas Touch events for tablet/mobile
  const startDrawingTouch = (e: React.TouchEvent<HTMLCanvasElement>) => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    const rect = canvas.getBoundingClientRect();
    const touch = e.touches[0];
    const x = ((touch.clientX - rect.left) / rect.width) * canvas.width;
    const y = ((touch.clientY - rect.top) / rect.height) * canvas.height;

    ctx.beginPath();
    ctx.moveTo(x, y);
    setIsDrawing(true);
  };

  const drawTouch = (e: React.TouchEvent<HTMLCanvasElement>) => {
    if (!isDrawing) return;
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    const rect = canvas.getBoundingClientRect();
    const touch = e.touches[0];
    const x = ((touch.clientX - rect.left) / rect.width) * canvas.width;
    const y = ((touch.clientY - rect.top) / rect.height) * canvas.height;

    ctx.lineTo(x, y);
    ctx.stroke();
  };

  const clearCanvas = () => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    setSignatureData(undefined);
  };

  // Save document handler
  const handleSave = () => {
    if (!nome || !cognome || !email || !telefono || !genitoreNome || !genitoreCognome) {
      toast.error("Compila tutti i campi richiesti!");
      return;
    }
    if (!signatureData) {
      toast.error("La firma è obbligatoria per stipulare il contratto!");
      return;
    }

    addDocument({
      studentName: nome,
      studentLastName: cognome,
      email,
      telefono,
      dataIscrizione,
      genitoreName: genitoreNome,
      genitoreLastName: genitoreCognome,
      signature: signatureData,
    });

    toast.success("Contratto salvato con successo!");
    setViewMode("list");
  };

  // Actions for Print, Share, Download
  const handlePrint = () => {
    window.print();
  };

  const handleShare = () => {
    navigator.clipboard.writeText(window.location.href);
    toast.success("Link del contratto copiato negli appunti!");
  };

  const handleDownloadMock = () => {
    toast.info("Generazione del file PDF in corso...");
    setTimeout(() => {
      const link = document.createElement("a");
      link.href = signatureData || "#";
      link.download = `contratto_${nome}_${cognome}.png`;
      toast.success("Contratto scaricato correttamente!");
    }, 1000);
  };

  const formattedIscrizioneDate = useMemo(() => {
    return formatDateSafe(dataIscrizione, "dd MMMM yyyy", { locale: it });
  }, [dataIscrizione]);

  const formattedDocDate = useMemo(() => {
    if (selectedDoc) {
      return formatDateSafe(selectedDoc.createdAt, "dd/MM/yyyy");
    }
    return formatDateSafe(new Date(), "dd/MM/yyyy");
  }, [selectedDoc]);

  // Column definitions for the DataTable component
  const defaultCols = useMemo<TableCol<DocumentRecord>[]>(
    () => [
      {
        key: "studentName",
        label: "Nome Studente",
        width: 200,
        flexGrow: true,
        render: (doc) => {
          const studentInitial = doc.studentName ? doc.studentName[0].toUpperCase() : "";
          return (
            <div className="flex items-center gap-3">
              <Avatar className="h-8 w-8 rounded-full border bg-primary/10 text-primary">
                <AvatarFallback className="text-[10px] font-bold">{studentInitial}</AvatarFallback>
              </Avatar>
              <span className="font-semibold text-foreground">
                {doc.studentName} {doc.studentLastName}
              </span>
            </div>
          );
        },
        copy: (doc) => `${doc.studentName} ${doc.studentLastName}`,
        hasFilter: true,
        hasSearch: true,
        sortAscLabel: "Ordinamento A → Z",
        sortDescLabel: "Ordinamento Z → A",
        sortFn: (a, b) => {
          const nameA = `${a.studentName} ${a.studentLastName}`.toLowerCase();
          const nameB = `${b.studentName} ${b.studentLastName}`.toLowerCase();
          return nameA.localeCompare(nameB);
        },
      },
      {
        key: "email",
        label: "Indirizzo Email",
        width: 180,
        flexGrow: true,
        render: (doc) => <span className="text-muted-foreground font-mono">{doc.email}</span>,
        copy: (doc) => doc.email,
        hasFilter: true,
        hasSearch: true,
        sortAscLabel: "Ordinamento A → Z",
        sortDescLabel: "Ordinamento Z → A",
        sortFn: (a, b) => a.email.localeCompare(b.email),
      },
      {
        key: "genitoreName",
        label: "Dati del Genitore",
        width: 180,
        flexGrow: true,
        render: (doc) => (
          <span className="text-muted-foreground">
            {doc.genitoreName} {doc.genitoreLastName}
          </span>
        ),
        copy: (doc) => `${doc.genitoreName} ${doc.genitoreLastName}`,
        hasFilter: true,
        hasSearch: true,
        sortAscLabel: "Ordinamento A → Z",
        sortDescLabel: "Ordinamento Z → A",
        sortFn: (a, b) => {
          const nameA = `${a.genitoreName} ${a.genitoreLastName}`.toLowerCase();
          const nameB = `${b.genitoreName} ${b.genitoreLastName}`.toLowerCase();
          return nameA.localeCompare(nameB);
        },
      },
      {
        key: "dataIscrizione",
        label: "Data di Iscrizione",
        width: 140,
        render: (doc) => (
          <span className="text-muted-foreground font-mono">
            {formatDateSafe(doc.dataIscrizione)}
          </span>
        ),
        copy: (doc) => doc.dataIscrizione,
        hasFilter: true,
        hasSearch: true,
        sortAscLabel: "Dal meno recente",
        sortDescLabel: "Dal più recente",
        sortFn: (a, b) =>
          new Date(a.dataIscrizione).getTime() - new Date(b.dataIscrizione).getTime(),
      },
      {
        key: "azioni",
        label: "Azioni",
        width: 100,
        align: "center",
        render: (doc) => (
          <Button
            size="icon"
            variant="ghost"
            className="h-8 w-8 rounded-full border border-border/60 hover:bg-primary/5 hover:text-primary hover:border-primary/20 active:scale-95 transition-all"
            onClick={(e) => {
              e.stopPropagation();
              setPreviewDoc(doc);
              setPreviewOpen(true);
            }}
            title="Visualizza contratto"
          >
            <Eye className="h-3.5 w-3.5" />
          </Button>
        ),
        copy: () => "",
      },
    ],
    [],
  );

  return (
    <>
      {viewMode === "list" ? (
        <AppHeader
          searchPlaceholder="Cerca documenti..."
          onNew={handleOpenCreate}
          newLabel="Nuovo"
        />
      ) : (
        <AppHeader
          hideSearch
          leftElement={
            <Button
              variant="ghost"
              onClick={() => setViewMode("list")}
              className="h-10 px-4 rounded-full border border-border/40 hover:bg-muted text-xs font-semibold flex items-center gap-1.5 active:scale-95 transition-all shadow-sm"
            >
              <ArrowLeft className="h-4 w-4" />
              Indietro
            </Button>
          }
          rightElement={
            viewMode === "create" ? (
              <Button
                onClick={handleSave}
                className="bg-[#3cd070] hover:bg-[#32c062] text-white text-xs font-bold px-6 h-10 rounded-full shadow-md hover:shadow-lg active:scale-95 transition-all"
              >
                Salva
              </Button>
            ) : undefined
          }
        />
      )}

      <main className="flex-1 main-view overscroll-none min-h-0 overflow-hidden flex flex-col">
        {viewMode === "list" ? (
          /* ── ARCHIVE/LIST VIEW WITH SHARED DATATABLE ── */
          <div className="flex-1 min-h-0 overflow-hidden flex flex-col">
            <DataTable<DocumentRecord>
              data={documents}
              defaultCols={defaultCols}
              storageKey={STORAGE_KEY}
              footerLabelSingular="documento"
              footerLabelPlural="documenti"
              onRowEdit={(doc) => {
                setPreviewDoc(doc);
                setPreviewOpen(true);
              }}
            />
          </div>
        ) : (
          /* ── CREATION / VIEW SPLIT VIEW ────────────────── */
          <div className="flex-1 flex gap-6 p-6 overflow-hidden min-h-0">
            {/* Left Panel: Form & Signature (40%) */}
            <div className="w-[38%] bg-card border rounded-xl p-5 overflow-y-auto overscroll-y-contain flex flex-col gap-5 shadow-sm">
              <div>
                <h2 className="text-sm font-bold text-foreground flex items-center gap-1.5">
                  <User className="h-4 w-4 text-primary" />
                  {viewMode === "create" ? "Compila Contratto" : "Dati del Contratto"}
                </h2>
                <p className="text-[11px] text-muted-foreground mt-0.5">
                  {viewMode === "create"
                    ? "Completa le informazioni per generare il PDF del contratto."
                    : "Dati inseriti per questo documento stipulato."}
                </p>
              </div>

              {/* Section: Student Info */}
              <div className="space-y-3">
                <h3 className="text-xs font-semibold text-muted-foreground uppercase tracking-wider border-b pb-1">
                  Dati dello studente
                </h3>
                <div className="grid grid-cols-2 gap-3">
                  <div className="space-y-1">
                    <Label className="text-[10px] font-bold text-muted-foreground uppercase">
                      Nome
                    </Label>
                    <Input
                      type="text"
                      placeholder="Es. Vika"
                      value={nome}
                      onChange={(e) => setNome(e.target.value)}
                      disabled={viewMode === "view"}
                      className="h-9 text-xs"
                    />
                  </div>
                  <div className="space-y-1">
                    <Label className="text-[10px] font-bold text-muted-foreground uppercase">
                      Cognome
                    </Label>
                    <Input
                      type="text"
                      placeholder="Es. Petukhova"
                      value={cognome}
                      onChange={(e) => setCognome(e.target.value)}
                      disabled={viewMode === "view"}
                      className="h-9 text-xs"
                    />
                  </div>
                </div>

                <div className="space-y-1">
                  <Label className="text-[10px] font-bold text-muted-foreground uppercase">
                    Email
                  </Label>
                  <Input
                    type="text"
                    placeholder="Es. vika@gmail.com"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    disabled={viewMode === "view"}
                    className="h-9 text-xs"
                  />
                </div>

                <div className="space-y-1">
                  <Label className="text-[10px] font-bold text-muted-foreground uppercase">
                    Numero di Telefono
                  </Label>
                  <Input
                    type="text"
                    placeholder="Es. +39 345..."
                    value={telefono}
                    onChange={(e) => setTelefono(e.target.value)}
                    disabled={viewMode === "view"}
                    className="h-9 text-xs"
                  />
                </div>

                <div className="space-y-1">
                  <Label className="text-[10px] font-bold text-muted-foreground uppercase">
                    Data di Iscrizione
                  </Label>
                  <Input
                    type="date"
                    value={dataIscrizione}
                    onChange={(e) => setDataIscrizione(e.target.value)}
                    disabled={viewMode === "view"}
                    className="h-9 text-xs font-mono"
                  />
                </div>
              </div>

              {/* Section: Parent Info */}
              <div className="space-y-3 pt-2">
                <h3 className="text-xs font-semibold text-muted-foreground uppercase tracking-wider border-b pb-1">
                  Dati del genitore
                </h3>
                <div className="grid grid-cols-2 gap-3">
                  <div className="space-y-1">
                    <Label className="text-[10px] font-bold text-muted-foreground uppercase">
                      Nome del genitore
                    </Label>
                    <Input
                      type="text"
                      placeholder="Es. Natalia"
                      value={genitoreNome}
                      onChange={(e) => setGenitoreNome(e.target.value)}
                      disabled={viewMode === "view"}
                      className="h-9 text-xs"
                    />
                  </div>
                  <div className="space-y-1">
                    <Label className="text-[10px] font-bold text-muted-foreground uppercase">
                      Cognome del genitore
                    </Label>
                    <Input
                      type="text"
                      placeholder="Es. Petukhova"
                      value={genitoreCognome}
                      onChange={(e) => setGenitoreCognome(e.target.value)}
                      disabled={viewMode === "view"}
                      className="h-9 text-xs"
                    />
                  </div>
                </div>
              </div>

              {/* Section: Signature pad */}
              <div className="space-y-2 pt-2">
                <div className="flex justify-between items-center border-b pb-1">
                  <h3 className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">
                    Firma
                  </h3>
                  {viewMode === "create" && signatureData && (
                    <button
                      onClick={clearCanvas}
                      className="text-[10px] text-destructive hover:underline font-semibold flex items-center gap-1 cursor-pointer"
                    >
                      <X className="h-3 w-3" />
                      Cancella
                    </button>
                  )}
                </div>
                {viewMode === "create" ? (
                  <div className="border rounded-xl overflow-hidden bg-muted/10 relative h-64">
                    <canvas
                      ref={canvasRef}
                      width={600}
                      height={256}
                      onMouseDown={startDrawing}
                      onMouseMove={draw}
                      onMouseUp={stopDrawing}
                      onMouseLeave={stopDrawing}
                      onTouchStart={startDrawingTouch}
                      onTouchMove={drawTouch}
                      onTouchEnd={stopDrawing}
                      className="absolute inset-0 w-full h-full cursor-crosshair touch-none"
                    />
                    {!signatureData && (
                      <div className="absolute inset-0 flex items-center justify-center pointer-events-none text-muted-foreground/40 text-[10px]">
                        Firma con il cursore o con il touch screen qui
                      </div>
                    )}
                  </div>
                ) : (
                  /* Display saved signature in read-only mode */
                  <div className="border rounded-xl p-2 bg-muted/20 flex items-center justify-center h-64">
                    {signatureData ? (
                      <img
                        src={signatureData}
                        alt="Firma del Contraente"
                        className="max-h-56 object-contain filter dark:invert"
                      />
                    ) : (
                      <span className="text-xs text-muted-foreground/60">
                        Nessuna firma presente
                      </span>
                    )}
                  </div>
                )}
              </div>
            </div>

            {/* Right Panel: Live PDF Preview (62%) */}
            <div className="w-[62%] bg-muted/30 border rounded-xl overflow-hidden flex flex-col min-h-0 shadow-sm">
              {/* PDF Header Controls */}
              <div className="h-10 border-b bg-card px-4 flex justify-between items-center shrink-0">
                <div className="flex items-center gap-2">
                  <FileText className="h-3.5 w-3.5 text-blue-500" />
                  <span className="text-[10px] font-bold font-mono text-muted-foreground">
                    contratto.pdf
                  </span>
                </div>
                <div className="flex items-center gap-1.5 bg-muted/40 rounded-lg px-2 py-0.5 border border-border/40">
                  <Button
                    type="button"
                    variant="ghost"
                    size="icon"
                    onClick={() => setZoomScale((prev) => Math.max(0.5, prev - 0.1))}
                    className="h-6 w-6 rounded text-muted-foreground hover:text-foreground disabled:opacity-40"
                    title="Riduci zoom"
                    disabled={zoomScale <= 0.5}
                  >
                    <ZoomOut className="h-3 w-3" />
                  </Button>
                  <span className="text-[9px] font-bold font-mono text-muted-foreground min-w-[32px] text-center">
                    {Math.round(zoomScale * 100)}%
                  </span>
                  <Button
                    type="button"
                    variant="ghost"
                    size="icon"
                    onClick={() => setZoomScale((prev) => Math.min(1.5, prev + 0.1))}
                    className="h-6 w-6 rounded text-muted-foreground hover:text-foreground disabled:opacity-40"
                    title="Aumenta zoom"
                    disabled={zoomScale >= 1.5}
                  >
                    <ZoomIn className="h-3 w-3" />
                  </Button>
                  {zoomScale !== 1 && (
                    <button
                      type="button"
                      onClick={() => setZoomScale(1)}
                      className="text-[9px] text-primary hover:underline font-semibold ml-1 px-1"
                    >
                      Reset
                    </button>
                  )}
                </div>

                <div className="flex items-center gap-1.5">
                  <Button
                    variant="ghost"
                    size="icon"
                    onClick={handlePrint}
                    className="h-7 w-7 rounded-md text-muted-foreground hover:text-foreground active:scale-90 transition-transform"
                    title="Stampa documento"
                  >
                    <Printer className="h-3.5 w-3.5" />
                  </Button>
                  <Button
                    variant="ghost"
                    size="icon"
                    onClick={handleShare}
                    className="h-7 w-7 rounded-md text-muted-foreground hover:text-foreground active:scale-90 transition-transform"
                    title="Condividi documento"
                  >
                    <Share2 className="h-3.5 w-3.5" />
                  </Button>
                  <Button
                    variant="ghost"
                    size="icon"
                    onClick={handleDownloadMock}
                    className="h-7 w-7 rounded-md text-muted-foreground hover:text-foreground active:scale-90 transition-transform"
                    title="Scarica documento"
                  >
                    <Download className="h-3.5 w-3.5" />
                  </Button>
                </div>
              </div>

              {/* PDF Paper Workspace (Scrollable) */}
              <div className="flex-1 overflow-y-auto overscroll-y-contain p-8 flex justify-center items-start bg-zinc-100/70 dark:bg-zinc-900/40">
                <div
                  style={{
                    width: "100%",
                    display: "flex",
                    justifyContent: "center",
                    transform: `scale(${zoomScale})`,
                    transformOrigin: "top center",
                    transition: "transform 0.15s ease-out",
                    height: `${850 * zoomScale}px`,
                  }}
                >
                  {/* Styled PDF Sheet (A4 layout styling) */}
                  <div className="printable-document w-full max-w-[620px] bg-white text-slate-900 p-10 pb-12 shadow-xl border rounded flex flex-col gap-6 text-[11px] leading-relaxed relative min-h-[800px] select-none">
                    {/* Official stamp box */}
                    <div className="absolute right-10 bottom-12 border-2 border-blue-600/40 p-3 w-32 text-center rounded flex flex-col items-center justify-center rotate-3 opacity-90 z-10 select-none">
                      <span className="text-[8px] uppercase font-mono tracking-widest text-blue-600/70">
                        Atena School
                      </span>
                      <span className="text-[9px] uppercase font-bold text-blue-600 tracking-wider my-0.5">
                        Timbro della Scuola
                      </span>
                      <span className="text-[7.5px] text-blue-500 font-medium">
                        Validità Ufficiale
                      </span>
                    </div>

                    {/* PDF Header block */}
                    <div className="flex justify-between items-start border-b pb-4">
                      <div>
                        <h2 className="text-sm font-extrabold tracking-wider text-slate-900 uppercase">
                          Atena School
                        </h2>
                        <span className="text-[8px] font-bold text-slate-500 uppercase tracking-widest">
                          Reparto Amministrativo
                        </span>
                      </div>
                      <div className="text-right font-mono text-[8px] text-slate-500 space-y-0.5">
                        <div>DOC-ID: {selectedDoc ? selectedDoc.id : "PREVIEW"}</div>
                        <div>Data: {formattedDocDate}</div>
                      </div>
                    </div>

                    {/* PDF Title block */}
                    <div className="text-center my-2">
                      <h1 className="text-base font-extrabold uppercase tracking-wide text-slate-950 border-y py-2.5">
                        Contratto di Iscrizione e Apprendimento
                      </h1>
                    </div>

                    {/* PDF Paragraph Intro */}
                    <div>
                      <p className="text-slate-700 italic">
                        Il presente accordo stabilisce i termini e le condizioni tra Atena School
                        (di seguito &ldquo;la Scuola&rdquo;) e il genitore/tutore legale
                        identificato di seguito (di seguito &ldquo;il Contraente&rdquo;).
                      </p>
                    </div>

                    {/* PDF Section 1: Dati identificativi */}
                    <div className="space-y-2">
                      <h3 className="font-extrabold text-[10px] uppercase text-slate-900 border-l-2 border-slate-900 pl-2">
                        1. Dati Identificativi
                      </h3>
                      <div className="grid grid-cols-2 gap-y-2 gap-x-4 border rounded p-3 bg-slate-50/50">
                        <div>
                          <span className="text-[8px] uppercase font-bold text-slate-400 block">
                            Studente
                          </span>
                          <span className="font-semibold text-slate-900">
                            {nome || cognome ? `${nome} ${cognome}` : "Nome Cognome"}
                          </span>
                        </div>
                        <div>
                          <span className="text-[8px] uppercase font-bold text-slate-400 block">
                            Genitore
                          </span>
                          <span className="font-semibold text-slate-900">
                            {genitoreNome || genitoreCognome
                              ? `${genitoreNome} ${genitoreCognome}`
                              : "Nome del genitore Cognome del genitore"}
                          </span>
                        </div>
                        <div>
                          <span className="text-[8px] uppercase font-bold text-slate-400 block">
                            Contatto
                          </span>
                          <span className="font-semibold text-slate-900">
                            {email || "example@mail.com"}
                          </span>
                        </div>
                        <div>
                          <span className="text-[8px] uppercase font-bold text-slate-400 block">
                            Telefono
                          </span>
                          <span className="font-semibold text-slate-900">
                            {telefono || "Telefono"}
                          </span>
                        </div>
                      </div>
                    </div>

                    {/* PDF Section 2: Oggetto del contratto */}
                    <div className="space-y-2">
                      <h3 className="font-extrabold text-[10px] uppercase text-slate-900 border-l-2 border-slate-900 pl-2">
                        2. Oggetto del Contratto
                      </h3>
                      <p className="text-slate-700">
                        La Scuola si impegna a fornire i servizi educativi allo studente sopra
                        menzionato a partire dalla data di iscrizione effettiva del{" "}
                        <strong className="text-slate-900">
                          {formattedIscrizioneDate || "[Data di Iscrizione]"}
                        </strong>
                        . Il Contraente accetta di rispettare i regolamenti interni della Scuola e
                        di corrispondere le rette previste per il corso di studi.
                      </p>
                    </div>

                    {/* PDF Section 3: Termini e Condizioni */}
                    <div className="space-y-2">
                      <h3 className="font-extrabold text-[10px] uppercase text-slate-900 border-l-2 border-slate-900 pl-2">
                        3. Termini e Condizioni
                      </h3>
                      <ul className="list-disc pl-4 space-y-1.5 text-slate-700">
                        <li>
                          La durata del corso è soggetta alla pianificazione accademica vigente.
                        </li>
                        <li>
                          Il recesso dal contratto deve essere comunicato con almeno 30 giorni di
                          preavviso.
                        </li>
                        <li>
                          Tutti i dati personali sono trattati in conformità con le normative
                          vigenti sulla privacy.
                        </li>
                      </ul>
                    </div>

                    {/* Signature preview block */}
                    <div className="mt-auto pt-8 border-t flex justify-between items-end">
                      <div className="flex flex-col w-56">
                        <div className="h-16 flex items-end justify-center mb-1 bg-slate-50/20 border border-dashed border-slate-200 rounded p-1">
                          {signatureData ? (
                            <img
                              src={signatureData}
                              alt="Firma"
                              className="max-h-14 object-contain"
                            />
                          ) : (
                            <span className="text-[8px] text-slate-300 italic">
                              In attesa di firma...
                            </span>
                          )}
                        </div>
                        <span className="text-[8px] font-bold text-slate-400 border-t pt-1 block uppercase">
                          Firma del Contraente
                        </span>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}
      </main>

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
