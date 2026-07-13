import { useState, useMemo } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { type DocumentRecord } from "../types";
import { FileText, Printer, Share2, Download, ZoomIn, ZoomOut } from "lucide-react";
import { toast } from "sonner";
import { format } from "date-fns";
import { it } from "date-fns/locale";

interface DocumentPreviewDialogProps {
  documentRecord: DocumentRecord | null;
  isOpen: boolean;
  onClose: () => void;
}

export function DocumentPreviewDialog({
  documentRecord,
  isOpen,
  onClose,
}: DocumentPreviewDialogProps) {
  const [zoomScale, setZoomScale] = useState(1);

  const formattedIscrizioneDate = useMemo(() => {
    if (!documentRecord?.dataIscrizione) return "";
    try {
      const d = new Date(documentRecord.dataIscrizione);
      return format(d, "dd MMMM yyyy", { locale: it });
    } catch {
      return documentRecord.dataIscrizione;
    }
  }, [documentRecord]);

  const formattedDocDate = useMemo(() => {
    if (!documentRecord?.createdAt) return "";
    try {
      const d = new Date(documentRecord.createdAt);
      return format(d, "dd/MM/yyyy");
    } catch {
      return documentRecord.createdAt;
    }
  }, [documentRecord]);

  if (!documentRecord) return null;

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
      link.href = documentRecord.signature || "#";
      link.download = `contratto_${documentRecord.studentName}_${documentRecord.studentLastName}.png`;
      toast.success("Contratto scaricato correttamente!");
    }, 1000);
  };

  return (
    <Dialog open={isOpen} onOpenChange={(v) => !v && onClose()}>
      <DialogContent className="max-w-[760px] w-full p-0 overflow-hidden flex flex-col h-[92vh] max-h-[860px] border rounded-xl shadow-2xl bg-background">
        <DialogHeader className="h-12 border-b bg-card pl-4 pr-12 flex flex-row justify-between items-center shrink-0 space-y-0 select-none">
          <DialogTitle className="flex items-center gap-2 text-xs font-bold font-mono text-muted-foreground min-w-0">
            <FileText className="h-4 w-4 text-blue-500 shrink-0" />
            <span className="truncate max-w-[150px] sm:max-w-[280px]">
              contratto_{documentRecord.studentName.toLowerCase()}_
              {documentRecord.studentLastName.toLowerCase()}.pdf
            </span>
          </DialogTitle>

          <div className="flex items-center gap-3 shrink-0">
            {/* Zoom Controls */}
            <div className="flex items-center gap-1 bg-muted/40 rounded-lg px-2 py-0.5 border border-border/40 shrink-0">
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

            {/* Document Actions */}
            <div className="flex items-center gap-1 shrink-0">
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
        </DialogHeader>

        {/* Scrollable document area */}
        <div className="flex-1 overflow-y-auto overscroll-y-contain p-4 flex justify-center items-start bg-zinc-100/70 dark:bg-zinc-900/40 select-none">
          <div
            style={{
              width: "100%",
              display: "flex",
              justifyContent: "center",
              transform: `scale(${zoomScale})`,
              transformOrigin: "top center",
              transition: "transform 0.15s ease-out",
              height: `${760 * zoomScale}px`,
            }}
          >
            {/* Styled PDF Sheet (A4 layout styling) */}
            <div className="printable-document w-full max-w-[580px] bg-white text-slate-900 p-8 pb-10 shadow-xl border rounded flex flex-col gap-5 text-[10px] leading-relaxed relative min-h-[740px]">
              {/* Official stamp box */}
              <div className="absolute right-8 bottom-10 border-2 border-blue-600/40 p-2.5 w-28 text-center rounded flex flex-col items-center justify-center rotate-3 opacity-90 z-10">
                <span className="text-[7.5px] uppercase font-mono tracking-widest text-blue-600/70">
                  Atena School
                </span>
                <span className="text-[8px] uppercase font-bold text-blue-600 tracking-wider my-0.5">
                  Timbro della Scuola
                </span>
                <span className="text-[7px] text-blue-500 font-medium">Validità Ufficiale</span>
              </div>

              {/* PDF Header block */}
              <div className="flex justify-between items-start border-b pb-3">
                <div>
                  <h2 className="text-xs font-extrabold tracking-wider text-slate-900 uppercase">
                    Atena School
                  </h2>
                  <span className="text-[7.5px] font-bold text-slate-500 uppercase tracking-widest">
                    Reparto Amministrativo
                  </span>
                </div>
                <div className="text-right font-mono text-[7.5px] text-slate-500 space-y-0.5">
                  <div>DOC-ID: {documentRecord.id}</div>
                  <div>Data: {formattedDocDate}</div>
                </div>
              </div>

              {/* PDF Title block */}
              <div className="text-center my-1.5">
                <h1 className="text-sm font-extrabold uppercase tracking-wide text-slate-950 border-y py-2">
                  Contratto di Iscrizione e Apprendimento
                </h1>
              </div>

              {/* PDF Paragraph Intro */}
              <div>
                <p className="text-slate-700 italic">
                  Il presente accordo stabilisce i termini e le condizioni tra Atena School (di
                  seguito &ldquo;la Scuola&rdquo;) e il genitore/tutore legale identificato di
                  seguito (di seguito &ldquo;il Contraente&rdquo;).
                </p>
              </div>

              {/* PDF Section 1: Dati identificativi */}
              <div className="space-y-1.5">
                <h3 className="font-extrabold text-[9px] uppercase text-slate-900 border-l-2 border-slate-900 pl-1.5">
                  1. Dati Identificativi
                </h3>
                <div className="grid grid-cols-2 gap-y-1.5 gap-x-3 border rounded p-2.5 bg-slate-50/50">
                  <div>
                    <span className="text-[7.5px] uppercase font-bold text-slate-400 block">
                      Studente
                    </span>
                    <span className="font-semibold text-slate-900">
                      {documentRecord.studentName} {documentRecord.studentLastName}
                    </span>
                  </div>
                  <div>
                    <span className="text-[7.5px] uppercase font-bold text-slate-400 block">
                      Genitore
                    </span>
                    <span className="font-semibold text-slate-900">
                      {documentRecord.genitoreName} {documentRecord.genitoreLastName}
                    </span>
                  </div>
                  <div>
                    <span className="text-[7.5px] uppercase font-bold text-slate-400 block">
                      Contatto
                    </span>
                    <span className="font-semibold text-slate-900">{documentRecord.email}</span>
                  </div>
                  <div>
                    <span className="text-[7.5px] uppercase font-bold text-slate-400 block">
                      Telefono
                    </span>
                    <span className="font-semibold text-slate-900">{documentRecord.telefono}</span>
                  </div>
                </div>
              </div>

              {/* PDF Section 2: Oggetto del contratto */}
              <div className="space-y-1.5">
                <h3 className="font-extrabold text-[9px] uppercase text-slate-900 border-l-2 border-slate-900 pl-1.5">
                  2. Oggetto del Contratto
                </h3>
                <p className="text-slate-700">
                  La Scuola si impegna a fornire i servizi educativi allo studente sopra menzionato
                  a partire dalla data di iscrizione effettiva del{" "}
                  <strong className="text-slate-900">{formattedIscrizioneDate}</strong>. Il
                  Contraente accetta di rispettare i regolamenti interni della Scuola e di
                  corrispondere le rette previste per il corso di studi.
                </p>
              </div>

              {/* PDF Section 3: Termini e Condizioni */}
              <div className="space-y-1.5">
                <h3 className="font-extrabold text-[9px] uppercase text-slate-900 border-l-2 border-slate-900 pl-1.5">
                  3. Termini e Condizioni
                </h3>
                <ul className="list-disc pl-3.5 space-y-1 text-slate-700">
                  <li>La durata del corso è soggetta alla pianificazione accademica vigente.</li>
                  <li>
                    Il recesso dal contratto deve essere comunicato con almeno 30 giorni di
                    preavviso.
                  </li>
                  <li>
                    Tutti i dati personali sono trattati in conformità con le normative vigenti
                    sulla privacy.
                  </li>
                </ul>
              </div>

              {/* Signature preview block */}
              <div className="mt-auto pt-6 border-t flex justify-between items-end">
                <div className="flex flex-col w-48">
                  <div className="h-12 flex items-end justify-center mb-1 bg-slate-50/20 border border-dashed border-slate-200 rounded p-1">
                    {documentRecord.signature ? (
                      <img
                        src={documentRecord.signature}
                        alt="Firma"
                        className="max-h-10 object-contain"
                      />
                    ) : (
                      <span className="text-[7.5px] text-slate-300 italic">
                        In attesa di firma...
                      </span>
                    )}
                  </div>
                  <span className="text-[7.5px] font-bold text-slate-400 border-t pt-1 block uppercase">
                    Firma del Contraente
                  </span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}
