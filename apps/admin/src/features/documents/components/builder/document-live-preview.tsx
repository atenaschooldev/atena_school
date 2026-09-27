import React, { useEffect, useRef, useState } from 'react';
import { Button } from '@/components/ui/button';
import { Printer, ZoomIn, ZoomOut, RotateCcw, ExternalLink } from 'lucide-react';
import { DocumentPaperFormat, type DocumentBlocksConfig } from '../../types';
import { compileDocumentHtml } from '@atena/core';
import { useTranslation } from '@/i18n/context';
import { morphDom } from '@/utils/morph-dom';

interface DocumentLivePreviewProps {
  blocksConfig: DocumentBlocksConfig;
  data?: Record<string, any>;
  formData?: Record<string, any>;
  documentTitle?: string;
  documentNumber?: string;
  locale?: string;
  className?: string;
}

export function DocumentLivePreview({
  blocksConfig,
  data,
  formData,
  documentTitle,
  documentNumber,
  locale = 'it',
  className = '',
}: DocumentLivePreviewProps) {
  const { t } = useTranslation();
  const tr = (key: string, fallback: string) => t(key) || fallback;

  const iframeRef = useRef<HTMLIFrameElement>(null);
  const [zoom, setZoom] = useState(100);
  const [compiledHtml, setCompiledHtml] = useState('');
  const isInitializedRef = useRef(false);

  const activeData = data || formData || {};

  // Debounced smooth live update without tearing down the iframe window/DOM
  useEffect(() => {
    const timer = setTimeout(() => {
      try {
        const fullHtml = compileDocumentHtml({
          blocksConfig,
          data: activeData,
          documentTitle: documentTitle || tr('documents.builder.previewTitle', 'Anteprima Documento'),
          documentNumber: documentNumber || 'DOC-ANTEPRIMA',
          locale,
        });
        setCompiledHtml(fullHtml);

        const iframe = iframeRef.current;
        if (!iframe) return;

        const doc = iframe.contentDocument || iframe.contentWindow?.document;
        if (!doc) return;

        // If iframe is not initialized or empty, do initial full write
        if (!isInitializedRef.current || !doc.body || !doc.head) {
          doc.open();
          doc.write(fullHtml);
          doc.close();
          isInitializedRef.current = true;
        } else {
          // Smooth live update: preserve scroll position and avoid destroying iframe context/styles
          const scrollY = iframe.contentWindow?.scrollY ?? 0;
          const scrollX = iframe.contentWindow?.scrollX ?? 0;

          const parser = new DOMParser();
          const newDoc = parser.parseFromString(fullHtml, 'text/html');

          if (doc.title !== newDoc.title) {
            doc.title = newDoc.title;
          }

          const oldStyle = doc.querySelector('style');
          const newStyle = newDoc.querySelector('style');
          if (newStyle && oldStyle) {
            if (oldStyle.textContent !== newStyle.textContent) {
              oldStyle.textContent = newStyle.textContent;
            }
          } else if (newStyle && !oldStyle) {
            doc.head.appendChild(newStyle.cloneNode(true));
          }

          // In-place surgical DOM morphing: mutates only changed text nodes and block elements without resetting DOM or reloading images
          morphDom(doc.body, newDoc.body);

          // Restore scroll position
          if (iframe.contentWindow && (scrollY > 0 || scrollX > 0)) {
            iframe.contentWindow.scrollTo(scrollX, scrollY);
          }
        }
      } catch (err) {
        console.error('Error compiling document preview:', err);
      }
    }, 80); // 80ms debounce: lightning fast feel without any DOM thrashing or flashing

    return () => clearTimeout(timer);
  }, [blocksConfig, activeData, documentTitle, documentNumber, locale]);

  const handlePrint = () => {
    if (iframeRef.current?.contentWindow) {
      iframeRef.current.contentWindow.focus();
      iframeRef.current.contentWindow.print();
    }
  };

  const handleOpenNewWindow = () => {
    const win = window.open('', '_blank');
    if (win) {
      win.document.open();
      win.document.write(compiledHtml);
      win.document.close();
    }
  };

  const isLandscape = blocksConfig?.paper_format === DocumentPaperFormat.A4_LANDSCAPE;

  return (
    <div className={`flex flex-col h-full bg-slate-900 border border-slate-800 rounded-xl overflow-hidden shadow-2xl ${className}`}>
      {/* Control Bar */}
      <div className="flex items-center justify-between px-4 py-2.5 bg-slate-950/80 border-b border-slate-800 text-slate-200 text-xs shrink-0">
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
              title={tr('documents.builder.resetZoom', 'Ripristina 100%')}
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
            {tr('documents.builder.newWindow', 'Nuova Finestra')}
          </Button>

          <Button
            size="sm"
            onClick={handlePrint}
            className="h-7 text-xs bg-blue-600 hover:bg-blue-500 text-white font-semibold shadow-md"
          >
            <Printer className="h-3.5 w-3.5 mr-1" />
            {tr('documents.builder.printPdf', 'Stampa / PDF')}
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
            className="border-0 bg-white block"
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
