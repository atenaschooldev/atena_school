"use client";

import { useState } from "react";
import { Dialog, DialogContent } from "@/components/ui/dialog";
import {
  X,
  ArrowRight,
  Sparkles,
  Copy,
  Check,
  MessageCircle,
  Send,
  ExternalLink,
} from "lucide-react";
import { toast } from "sonner";
import type { MarketingPopupItem } from "@atena/api-types";

interface PopupPreviewModalProps {
  popup: MarketingPopupItem | null;
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export function PopupPreviewModal({ popup, open, onOpenChange }: PopupPreviewModalProps) {
  const [copied, setCopied] = useState(false);
  if (!popup) return null;

  const isImageOnly = popup.content_type === "image_only";
  const isTextOnly = popup.content_type === "text_only";
  const isCombined = popup.content_type === "combined";
  const position = popup.position || "center";

  const handleCopy = () => {
    if (popup.promo_code_to_copy) {
      navigator.clipboard.writeText(popup.promo_code_to_copy).catch(() => {});
      setCopied(true);
      toast.success(`Codice "${popup.promo_code_to_copy}" copiato!`);
      setTimeout(() => setCopied(false), 2500);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[460px] p-0 border-0 bg-transparent shadow-none overflow-hidden [&>button]:hidden">
        <div className="relative w-full flex flex-col bg-white dark:bg-slate-900 text-slate-900 dark:text-white rounded-3xl shadow-2xl border border-slate-200/80 dark:border-slate-800 overflow-hidden">
          {/* Close button */}
          <button
            type="button"
            onClick={() => onOpenChange(false)}
            aria-label="Chiudi"
            className="absolute top-3.5 right-3.5 z-20 size-8 flex items-center justify-center rounded-full bg-black/40 hover:bg-black/60 text-white backdrop-blur-md transition-transform hover:scale-105 active:scale-95 cursor-pointer shadow-md"
          >
            <X className="size-4" />
          </button>

          {/* 1. IMAGE ONLY */}
          {isImageOnly && popup.image_url && (
            <div className="w-full overflow-hidden">
              <img
                src={popup.image_url}
                alt={popup.display_title || popup.title}
                className="w-full h-auto object-cover max-h-[80vh]"
              />
            </div>
          )}

          {/* 2. COMBINED */}
          {isCombined && (
            <div className="flex flex-col w-full">
              {popup.image_url && (
                <>
                  {popup.image_fit === 'cover' ? (
                    <div className="relative w-full overflow-hidden bg-slate-100 dark:bg-slate-800 h-[220px] sm:h-[240px]">
                      <img
                        src={popup.image_url}
                        alt={popup.display_title || popup.title}
                        className="w-full h-full object-cover"
                      />
                    </div>
                  ) : popup.image_fit === 'contain' ? (
                    <div className="relative w-full overflow-hidden bg-slate-100/90 dark:bg-slate-800/80 flex items-center justify-center h-[200px] sm:h-[230px] p-3">
                      <img
                        src={popup.image_url}
                        alt={popup.display_title || popup.title}
                        className="w-full h-full object-contain mx-auto"
                      />
                    </div>
                  ) : popup.image_fit === 'padded' ? (
                    <div className="px-5 pt-5 pb-0 w-full">
                      <div className="relative w-full overflow-hidden rounded-2xl border border-slate-200/80 dark:border-slate-800 bg-slate-100 dark:bg-slate-800 shadow-sm h-[170px] sm:h-[200px]">
                        <img
                          src={popup.image_url}
                          alt={popup.display_title || popup.title}
                          className="w-full h-full object-cover"
                        />
                      </div>
                    </div>
                  ) : (
                    /* Ambient glow mode (default) */
                    <div className="relative w-full overflow-hidden bg-slate-900/5 dark:bg-slate-800/80 flex items-center justify-center max-h-[300px]">
                      <div
                        className="absolute inset-0 bg-cover bg-center blur-2xl opacity-35 scale-125"
                        style={{ backgroundImage: `url(${popup.image_url})` }}
                      />
                      <img
                        src={popup.image_url}
                        alt={popup.display_title || popup.title}
                        className="relative z-10 w-full h-auto max-h-[300px] object-contain mx-auto"
                      />
                    </div>
                  )}
                </>
              )}

              <div className="p-6 sm:p-7 space-y-4">
                {popup.badge_text && (
                  <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-[11px] font-bold tracking-wider uppercase bg-primary/10 text-primary border border-primary/20">
                    <Sparkles className="size-3" />
                    {popup.badge_text}
                  </span>
                )}

                {popup.display_title && (
                  <h3 className="text-xl sm:text-2xl font-black tracking-tight leading-snug">
                    {popup.display_title}
                  </h3>
                )}

                {popup.display_text && (
                  <p className="text-sm text-slate-600 dark:text-slate-300 leading-relaxed whitespace-pre-line">
                    {popup.display_text}
                  </p>
                )}

                {/* Promo Code Copy Preview */}
                {popup.cta_action_type === "copy_promo" && popup.promo_code_to_copy && (
                  <div
                    onClick={handleCopy}
                    className="flex items-center justify-between p-3 rounded-xl bg-muted/60 border border-border cursor-pointer hover:bg-muted transition-colors"
                  >
                    <div className="flex flex-col">
                      <span className="text-[10px] text-muted-foreground uppercase font-bold tracking-wider">Codice Promo:</span>
                      <span className="font-mono font-black text-sm tracking-wider text-primary">{popup.promo_code_to_copy}</span>
                    </div>
                    <span className="text-xs font-semibold text-primary flex items-center gap-1">
                      {copied ? <Check className="size-3.5 text-emerald-500" /> : <Copy className="size-3.5" />}
                      {copied ? "Copiato!" : "Clicca per copiare"}
                    </span>
                  </div>
                )}

                {popup.cta_text && (
                  <div className="pt-2 flex flex-col sm:flex-row gap-2.5">
                    <button
                      type="button"
                      onClick={() => {
                        if (popup.cta_action_type === "copy_promo") handleCopy();
                        else onOpenChange(false);
                      }}
                      className="w-full inline-flex items-center justify-center gap-2 px-5 py-3 rounded-xl bg-primary hover:bg-primary/90 text-primary-foreground font-bold text-sm shadow-lg shadow-primary/25 cursor-pointer"
                    >
                      <span>{popup.cta_text}</span>
                      {popup.cta_action_type === "whatsapp" ? (
                        <MessageCircle className="size-4" />
                      ) : popup.cta_action_type === "telegram" ? (
                        <Send className="size-4" />
                      ) : popup.cta_action_type === "copy_promo" ? (
                        <Copy className="size-4" />
                      ) : popup.cta_target === "_blank" ? (
                        <ExternalLink className="size-4" />
                      ) : (
                        <ArrowRight className="size-4" />
                      )}
                    </button>

                    {popup.secondary_cta_text && (
                      <button
                        type="button"
                        onClick={() => onOpenChange(false)}
                        className="px-4 py-2.5 text-xs font-semibold text-slate-500 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white cursor-pointer text-center"
                      >
                        {popup.secondary_cta_text}
                      </button>
                    )}
                  </div>
                )}
              </div>
            </div>
          )}

          {/* 3. TEXT ONLY */}
          {isTextOnly && (
            <div className="p-7 sm:p-8 space-y-5">
              {popup.badge_text && (
                <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-[11px] font-bold tracking-wider uppercase bg-primary/10 text-primary border border-primary/20">
                  <Sparkles className="size-3" />
                  {popup.badge_text}
                </span>
              )}

              {popup.display_title && (
                <h3 className="text-2xl font-black tracking-tight leading-tight">
                  {popup.display_title}
                </h3>
              )}

              {popup.display_text && (
                <p className="text-sm text-slate-600 dark:text-slate-300 leading-relaxed whitespace-pre-line">
                  {popup.display_text}
                </p>
              )}

              {/* Promo Code Copy Preview */}
              {popup.cta_action_type === "copy_promo" && popup.promo_code_to_copy && (
                <div
                  onClick={handleCopy}
                  className="flex items-center justify-between p-3 rounded-xl bg-muted/60 border border-border cursor-pointer hover:bg-muted transition-colors"
                >
                  <div className="flex flex-col">
                    <span className="text-[10px] text-muted-foreground uppercase font-bold tracking-wider">Codice Promo:</span>
                    <span className="font-mono font-black text-sm tracking-wider text-primary">{popup.promo_code_to_copy}</span>
                  </div>
                  <span className="text-xs font-semibold text-primary flex items-center gap-1">
                    {copied ? <Check className="size-3.5 text-emerald-500" /> : <Copy className="size-3.5" />}
                    {copied ? "Copiato!" : "Clicca per copiare"}
                  </span>
                </div>
              )}

              {popup.cta_text && (
                <div className="pt-2 flex flex-col sm:flex-row gap-2.5">
                  <button
                    type="button"
                    onClick={() => {
                      if (popup.cta_action_type === "copy_promo") handleCopy();
                      else onOpenChange(false);
                    }}
                    className="w-full inline-flex items-center justify-center gap-2 px-5 py-3 rounded-xl bg-primary hover:bg-primary/90 text-primary-foreground font-bold text-sm shadow-lg shadow-primary/25 cursor-pointer"
                  >
                    <span>{popup.cta_text}</span>
                    {popup.cta_action_type === "whatsapp" ? (
                      <MessageCircle className="size-4" />
                    ) : popup.cta_action_type === "telegram" ? (
                      <Send className="size-4" />
                    ) : popup.cta_action_type === "copy_promo" ? (
                      <Copy className="size-4" />
                    ) : popup.cta_target === "_blank" ? (
                      <ExternalLink className="size-4" />
                    ) : (
                      <ArrowRight className="size-4" />
                    )}
                  </button>

                  {popup.secondary_cta_text && (
                    <button
                      type="button"
                      onClick={() => onOpenChange(false)}
                      className="px-4 py-2.5 text-xs font-semibold text-slate-500 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white cursor-pointer text-center"
                    >
                      {popup.secondary_cta_text}
                    </button>
                  )}
                </div>
              )}
            </div>
          )}
        </div>
      </DialogContent>
    </Dialog>
  );
}
