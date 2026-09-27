import React, { useEffect, useRef, useState, useCallback } from 'react';
import { Button } from '@/components/ui/button';
import { Printer, ZoomIn, ZoomOut, RotateCcw, ExternalLink, FileText, Maximize2 } from 'lucide-react';
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
  const isLandscape = blocksConfig?.paper_format === DocumentPaperFormat.A4_LANDSCAPE;

  const adjustIframeDimensions = useCallback(() => {
    const iframe = iframeRef.current;
    if (!iframe) return;
    const doc = iframe.contentDocument || iframe.contentWindow?.document;
    if (!doc || !doc.body) return;

    // Remove internal scrollbars inside the iframe document
    doc.documentElement.style.overflow = 'hidden';
    doc.body.style.overflow = 'hidden';

    // Standard A4 minimum height (790px for landscape, 1160px for portrait)
    const minHeight = isLandscape ? 790 : 1160;
    const contentHeight = Math.max(doc.body.scrollHeight, doc.documentElement.scrollHeight, minHeight);
    iframe.style.height = `${contentHeight}px`;
  }, [isLandscape]);

  // Debounced smooth live update with DOM morphing and zero double-scrollbars
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

          // In-place surgical DOM morphing: mutates only changed text nodes and block elements
          morphDom(doc.body, newDoc.body);

          // Restore scroll position
          if (iframe.contentWindow && (scrollY > 0 || scrollX > 0)) {
            iframe.contentWindow.scrollTo(scrollX, scrollY);
          }
        }

        // Adjust dimensions so exactly ONE scrollbar exists on the outer canvas
        adjustIframeDimensions();
        requestAnimationFrame(adjustIframeDimensions);
      } catch (err) {
        console.error('Error compiling document preview:', err);
      }
    }, 80);

    return () => clearTimeout(timer);
  }, [blocksConfig, activeData, documentTitle, documentNumber, locale, adjustIframeDimensions]);

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

  return (
    <div className={`flex flex-col h-full bg-card text-card-foreground border border-border/80 rounded-xl overflow-hidden shadow-sm ${className}`}>
      {/* Control Toolbar: fully integrated with active CRM Theme & Color presets */}
      <div className="flex items-center justify-between px-3.5 py-2 bg-muted/40 border-b border-border text-foreground text-xs shrink-0 flex-wrap gap-2">
        <div className="flex items-center gap-2">
          <div className="p-1 rounded-md bg-primary/10 text-primary">
            <FileText className="h-3.5 w-3.5" />
          </div>
          <span className="inline-flex items-center px-2 py-0.5 rounded text-[10px] font-bold bg-primary/10 text-primary border border-primary/20 uppercase tracking-wider">
            {isLandscape ? 'A4 Landscape' : 'A4 Portrait'}
          </span>
          <span className="text-muted-foreground font-mono text-[11px] truncate max-w-[200px]">
            {documentNumber || 'DOC-ANTEPRIMA'}
          </span>
        </div>

        {/* Zoom & Action Buttons */}
        <div className="flex items-center gap-1.5">
          <div className="flex items-center bg-background rounded-lg p-0.5 border border-border shadow-xs mr-1">
            <Button
              variant="ghost"
              size="icon"
              className="h-6 w-6 text-muted-foreground hover:text-foreground cursor-pointer"
              onClick={() => setZoom((z) => Math.max(50, z - 10))}
              title="Zoom out"
            >
              <ZoomOut className="h-3.5 w-3.5" />
            </Button>
            <span className="px-2 text-[11px] font-mono font-medium text-foreground select-none">{zoom}%</span>
            <Button
              variant="ghost"
              size="icon"
              className="h-6 w-6 text-muted-foreground hover:text-foreground cursor-pointer"
              onClick={() => setZoom((z) => Math.min(150, z + 10))}
              title="Zoom in"
            >
              <ZoomIn className="h-3.5 w-3.5" />
            </Button>
            <Button
              variant="ghost"
              size="icon"
              className="h-6 w-6 text-muted-foreground hover:text-foreground cursor-pointer"
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
            className="h-7 text-xs bg-background hover:bg-muted cursor-pointer"
          >
            <ExternalLink className="h-3.5 w-3.5 mr-1" />
            {tr('documents.builder.newWindow', 'Nuova Finestra')}
          </Button>

          <Button
            size="sm"
            onClick={handlePrint}
            className="h-7 text-xs bg-primary text-primary-foreground hover:bg-primary/90 font-semibold shadow-xs cursor-pointer"
          >
            <Printer className="h-3.5 w-3.5 mr-1" />
            {tr('documents.builder.printPdf', 'Stampa / PDF')}
          </Button>
        </div>
      </div>

      {/* Sheet Canvas with Scale: Single Unified Scrollbar, Theme-Aware Neutral Drafting Desk */}
      <div className="flex-1 overflow-auto p-4 sm:p-8 flex justify-center items-start bg-slate-200/60 dark:bg-zinc-950/80 custom-scrollbar">
        <div
          style={{
            transform: `scale(${zoom / 100})`,
            transformOrigin: 'top center',
            transition: 'transform 0.15s ease-out',
            width: isLandscape ? '1120px' : '820px',
          }}
          className="shadow-[0_10px_35px_rgba(0,0,0,0.12)] dark:shadow-[0_10px_35px_rgba(0,0,0,0.6)] rounded-none overflow-hidden border border-slate-300/80 dark:border-zinc-800 bg-white ring-1 ring-black/5 dark:ring-white/10 shrink-0 my-4"
        >
          <iframe
            ref={iframeRef}
            title="Anteprima Documento A4"
            className="border-0 bg-white block w-full rounded-none"
            style={{
              width: '100%',
              minHeight: isLandscape ? '790px' : '1160px',
              overflow: 'hidden',
            }}
          />
        </div>
      </div>
    </div>
  );
}
