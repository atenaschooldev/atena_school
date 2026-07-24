import { useMemo } from "react";
import { AppHeader } from "@/components/app-header";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { DataTable } from "@/components/data-table";
import type { TableCol } from "@/components/data-table";
import { DocumentPreviewDialog } from "./document-preview-dialog";
import { Eye, ArrowLeft, User, X } from "lucide-react";
import { formatDateSafe } from "@/lib/utils";
import type { DocumentRecord } from "../types";
import { useDocuments } from "../hooks/use-documents";
import { DocumentPdfPreview } from "./document-pdf-preview";

const STORAGE_KEY = "atena-scuola-documenti-cols";

export function DocumentiView() {
  const {
    documents,
    viewMode,
    setViewMode,
    selectedDoc,
    zoomScale,
    setZoomScale,
    previewDoc,
    setPreviewDoc,
    previewOpen,
    setPreviewOpen,
    nome,
    setNome,
    cognome,
    setCognome,
    email,
    setEmail,
    telefono,
    setTelefono,
    dataIscrizione,
    setDataIscrizione,
    genitoreNome,
    setGenitoreNome,
    genitoreCognome,
    setGenitoreCognome,
    signatureData,
    canvasRef,
    handleOpenCreate,
    handleViewDoc,
    startDrawing,
    draw,
    stopDrawing,
    startDrawingTouch,
    drawTouch,
    clearCanvas,
    handleSave,
    handlePrint,
    handleShare,
    handleDownloadMock,
    formattedIscrizioneDate,
    formattedDocDate,
  } = useDocuments();

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
    [setPreviewDoc, setPreviewOpen],
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
              onRowEdit={handleViewDoc}
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
            <DocumentPdfPreview
              zoomScale={zoomScale}
              setZoomScale={setZoomScale}
              onPrint={handlePrint}
              onShare={handleShare}
              onDownload={handleDownloadMock}
              selectedDoc={selectedDoc}
              nome={nome}
              cognome={cognome}
              email={email}
              telefono={telefono}
              genitoreNome={genitoreNome}
              genitoreCognome={genitoreCognome}
              signatureData={signatureData}
              formattedIscrizioneDate={formattedIscrizioneDate}
              formattedDocDate={formattedDocDate}
            />
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
