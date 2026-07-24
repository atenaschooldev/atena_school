import React from "react";
import { Button } from "@/components/ui/button";
import { FileText, Printer, Share2, Download, ZoomIn, ZoomOut } from "lucide-react";
import type { DocumentRecord } from "../types";

interface DocumentPdfPreviewProps {
  zoomScale: number;
  setZoomScale: React.Dispatch<React.SetStateAction<number>>;
  onPrint: () => void;
  onShare: () => void;
  onDownload: () => void;
  selectedDoc: DocumentRecord | null;
  nome: string;
  cognome: string;
  email: string;
  telefono: string;
  genitoreNome: string;
  genitoreCognome: string;
  signatureData?: string;
  formattedIscrizioneDate: string;
  formattedDocDate: string;
}

export function DocumentPdfPreview({
  zoomScale,
  setZoomScale,
  onPrint,
  onShare,
  onDownload,
  selectedDoc,
  nome,
  cognome,
  email,
  telefono,
  genitoreNome,
  genitoreCognome,
  signatureData,
  formattedIscrizioneDate,
  formattedDocDate,
}: DocumentPdfPreviewProps) {
  return (
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
            onClick={onPrint}
            className="h-7 w-7 rounded-md text-muted-foreground hover:text-foreground active:scale-90 transition-transform"
            title="Stampa documento"
          >
            <Printer className="h-3.5 w-3.5" />
          </Button>
          <Button
            variant="ghost"
            size="icon"
            onClick={onShare}
            className="h-7 w-7 rounded-md text-muted-foreground hover:text-foreground active:scale-90 transition-transform"
            title="Condividi documento"
          >
            <Share2 className="h-3.5 w-3.5" />
          </Button>
          <Button
            variant="ghost"
            size="icon"
            onClick={onDownload}
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
              <span className="text-[7.5px] text-blue-500 font-medium">Validità Ufficiale</span>
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
                Il presente accordo stabilisce i termini e le condizioni tra Atena School (di
                seguito &ldquo;la Scuola&rdquo;) e il genitore/tutore legale identificato di seguito
                (di seguito &ldquo;il Contraente&rdquo;).
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
                  <span className="font-semibold text-slate-900">{telefono || "Telefono"}</span>
                </div>
              </div>
            </div>

            {/* PDF Section 2: Oggetto del contratto */}
            <div className="space-y-2">
              <h3 className="font-extrabold text-[10px] uppercase text-slate-900 border-l-2 border-slate-900 pl-2">
                2. Oggetto del Contratto
              </h3>
              <p className="text-slate-700">
                La Scuola si impegna a fornire i servizi educativi allo studente sopra menzionato a
                partire dalla data di iscrizione effettiva del{" "}
                <strong className="text-slate-900">
                  {formattedIscrizioneDate || "[Data di Iscrizione]"}
                </strong>
                . Il Contraente accetta di rispettare i regolamenti interni della Scuola e di
                corrispondere le rette previste per il corso di studi.
              </p>
            </div>

            {/* PDF Section 3: Termini e Condizioni */}
            <div className="space-y-2">
              <h3 className="font-extrabold text-[10px] uppercase text-slate-900 border-l-2 border-slate-900 pl-2">
                3. Termini e Condizioni
              </h3>
              <ul className="list-disc pl-4 space-y-1.5 text-slate-700">
                <li>La durata del corso è soggetta alla pianificazione accademica vigente.</li>
                <li>
                  Il recesso dal contratto deve essere comunicato con almeno 30 giorni di preavviso.
                </li>
                <li>
                  Tutti i dati personali sono trattati in conformità con le normative vigenti sulla
                  privacy.
                </li>
              </ul>
            </div>

            {/* Signature preview block */}
            <div className="mt-auto pt-8 border-t flex justify-between items-end">
              <div className="flex flex-col w-56">
                <div className="h-16 flex items-end justify-center mb-1 bg-slate-50/20 border border-dashed border-slate-200 rounded p-1">
                  {signatureData ? (
                    <img src={signatureData} alt="Firma" className="max-h-14 object-contain" />
                  ) : (
                    <span className="text-[8px] text-slate-300 italic">In attesa di firma...</span>
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
  );
}
