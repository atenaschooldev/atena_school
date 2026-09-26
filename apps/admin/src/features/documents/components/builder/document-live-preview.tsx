import React, { useEffect, useRef, useState } from 'react';
import { Button } from '@/components/ui/button';
import { Printer, Download, ZoomIn, ZoomOut, RotateCcw, ExternalLink } from 'lucide-react';
import { DocumentPaperFormat, type DocumentBlocksConfig } from '../../types';
import { compileDocumentHtml } from '@atena/core';

interface DocumentLivePreviewProps {
  blocksConfig: DocumentBlocksConfig;
  data: Record<string, any>;
  documentTitle?: string;
  documentNumber?: string;
}

export function DocumentLivePreview({
  blocksConfig,
  data,
  documentTitle,
  documentNumber,
}: DocumentLivePreviewProps) {
  const iframeRef = useRef<HTMLIFrameElement>(null);
  const [zoom, setZoom] = useState(100);
  const [compiledHtml, setCompiledHtml] = useState('');

  useEffect(() => {
    try {
      const html = compileDocumentHtml({
        blocksConfig,
        data,
        documentTitle: documentTitle || 'Anteprima Documento',
        documentNumber: documentNumber || 'DOC-ANTEPRIMA',
      });
      setCompiledHtml(html);

      if (iframeRef.current) {
        const doc = iframeRef.current.contentDocument || iframeRef.current.contentWindow?.document;
        if (doc) {
          doc.open();
          doc.write(html);
          doc.close();
        }
      }
    } catch (err) {
      console.error('Error compiling document preview:', err);
    }
  }, [blocksConfig, data, documentTitle, documentNumber]);

  const handlePrint = () => {
    if (iframeRef.current?.contentWindow) {
      iframeRef.current.contentWindow.focus();
      iframeRef.current.contentWindow.print();
    }
  };

  const handleOpenNewWindow = () => {
    const win = window.open('', '_blank');
    if (win) {
      win.document.write(compiledHtml);
      win.document.close();
    }
  };

  const isLandscape = blocksConfig.paper_format === DocumentPaperFormat.A4_LANDSCAPE;

  return (
    <div className="flex flex-col h-full bg-slate-900 border rounded-xl overflow-hidden shadow-2xl">
      {/* Control Bar */}
      <div className="flex items-center justify-between px-4 py-2.5 bg-slate-950/80 border-b border-slate-800 text-slate-200 text-xs">
        <div className="flex items-center gap-2">
          <span className="inline-flex items-center px-2 py-0.5 rounded text-[10px] font-bold bg-blue-500/20 text-blue-400 uppercase tracking-wider">
            {isLandscape ? 'A4 Landscape' : 'A4 Portrait'}
          </span>
          <span className="text-slate-400 font-mono text-[11px] truncate max-w-[200px]">
            {documentNumber || 'DOC-2026/XXXXX'}
          </span>
        </div>

        {/* Zoom & Action Buttons */}
        <div className="flex items-center gap-1.5">
          <div className="flex items-center bg-slate-800/80 rounded-lg p-0.5 border border-slate-700/60 mr-2">
            <Button
              variant="ghost"
              size="icon"
              className="h-6 w-6 text-slate-300 hover:text-white"
              onClick={() => setZoom((z) => Math.max(50, z - 10))}
              title="Zoom out"
            >
              <ZoomOut className="h-3.5 w-3.5" />
            </Button>
            <span className="px-2 text-[11px] font-mono text-slate-300 select-none">{zoom}%</span>
            <Button
              variant="ghost"
              size="icon"
              className="h-6 w-6 text-slate-300 hover:text-white"
              onClick={() => setZoom((z) => Math.min(150, z + 10))}
              title="Zoom in"
            >
              <ZoomIn className="h-3.5 w-3.5" />
            </Button>
            <Button
              variant="ghost"
              size="icon"
              className="h-6 w-6 text-slate-400 hover:text-white"
              onClick={() => setZoom(100)}
              title="Ripristina 100%"
            >
              <RotateCcw className="h-3 w-3" />
            </Button>
          </div>

          <Button
            variant="outline"
            size="sm"
            onClick={handleOpenNewWindow}
            className="h-7 text-xs bg-slate-800 border-slate-700 hover:bg-slate-700 text-slate-200"
          >
            <ExternalLink className="h-3.5 w-3.5 mr-1" />
            Nuova Finestra
          </Button>

          <Button
            size="sm"
            onClick={handlePrint}
            className="h-7 text-xs bg-blue-600 hover:bg-blue-500 text-white font-semibold shadow-md"
          >
            <Printer className="h-3.5 w-3.5 mr-1" />
            Stampa / PDF
          </Button>
        </div>
      </div>

      {/* Sheet Canvas with Scale */}
      <div className="flex-1 overflow-auto p-6 flex justify-center items-start bg-slate-950/60 custom-scrollbar">
        <div
          style={{
            transform: `scale(${zoom / 100})`,
            transformOrigin: 'top center',
            transition: 'transform 0.15s ease-out',
          }}
          className="shadow-2xl rounded-sm overflow-hidden border border-slate-700/50 bg-white"
        >
          <iframe
            ref={iframeRef}
            title="Anteprima Documento A4"
            className="border-0 bg-white"
            style={{
              width: isLandscape ? '1120px' : '860px',
              height: isLandscape ? '790px' : '1180px',
            }}
          />
        </div>
      </div>
    </div>
  );
}
