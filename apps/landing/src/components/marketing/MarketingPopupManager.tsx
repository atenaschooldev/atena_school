'use client';

import React, { useEffect, useState, useCallback, useRef } from 'react';
import { usePathname } from 'next/navigation';
import {
  X,
  ArrowRight,
  Sparkles,
  Copy,
  Check,
  MessageCircle,
  Send,
  ExternalLink,
} from 'lucide-react';
import { toast } from 'sonner';
import { api } from '@/lib/api';
import type { MarketingPopupItem } from '@atena/api-types';

export function MarketingPopupManager() {
  const pathname = usePathname();
  const [popup, setPopup] = useState<MarketingPopupItem | null>(null);
  const [isOpen, setIsOpen] = useState(false);
  const [isClosing, setIsClosing] = useState(false);
  const [copied, setCopied] = useState(false);
  
  const timerRef = useRef<NodeJS.Timeout | null>(null);
  const inactivityTimerRef = useRef<NodeJS.Timeout | null>(null);
  const triggerFiredRef = useRef(false);

  // Fetch active popup for current route, device & language
  useEffect(() => {
    let isMounted = true;

    async function loadActivePopup() {
      try {
        const isMobile = window.innerWidth <= 768;
        const device = isMobile ? 'mobile' : 'desktop';
        const lang = document.documentElement.lang || 'it';

        const res = await api.marketingPopups.getActive(pathname || '/', device, lang);
        if (isMounted && res.success && res.popup) {
          const p: MarketingPopupItem = res.popup;

          const shouldShow = checkFrequencyEligibility(p);
          if (shouldShow) {
            setPopup(p);
            triggerFiredRef.current = false;
          }
        }
      } catch (e) {
        console.warn('[MarketingPopupManager] Failed to load popup:', e);
      }
    }

    loadActivePopup();

    return () => {
      isMounted = false;
      if (timerRef.current) clearTimeout(timerRef.current);
      if (inactivityTimerRef.current) clearTimeout(inactivityTimerRef.current);
    };
  }, [pathname]);

  // Check frequency rules in localStorage / sessionStorage
  const checkFrequencyEligibility = (p: MarketingPopupItem): boolean => {
    if (typeof window === 'undefined') return false;

    try {
      if (p.frequency === 'always') return true;

      if (p.frequency === 'once_per_session') {
        const sessionKey = `atena_popup_session_${p.id}`;
        return !sessionStorage.getItem(sessionKey);
      }

      if (p.frequency === 'once_forever') {
        const foreverKey = `atena_popup_forever_${p.id}`;
        return !localStorage.getItem(foreverKey);
      }

      if (p.frequency === 'once_per_day') {
        const dayKey = `atena_popup_day_${p.id}`;
        const lastShown = localStorage.getItem(dayKey);
        if (!lastShown) return true;
        const diffHours = (Date.now() - parseInt(lastShown, 10)) / (1000 * 60 * 60);
        return diffHours >= 24;
      }
    } catch {
      return true;
    }

    return true;
  };

  const markPopupShown = useCallback((p: MarketingPopupItem) => {
    try {
      if (p.frequency === 'once_per_session') {
        sessionStorage.setItem(`atena_popup_session_${p.id}`, '1');
      } else if (p.frequency === 'once_forever') {
        localStorage.setItem(`atena_popup_forever_${p.id}`, '1');
      } else if (p.frequency === 'once_per_day') {
        localStorage.setItem(`atena_popup_day_${p.id}`, Date.now().toString());
      }
    } catch {
      // Ignore storage errors
    }
  }, []);

  const openPopup = useCallback(() => {
    if (triggerFiredRef.current || !popup) return;
    triggerFiredRef.current = true;
    setIsOpen(true);
    markPopupShown(popup);
  }, [popup, markPopupShown]);

  // Setup Trigger listeners
  useEffect(() => {
    if (!popup || triggerFiredRef.current) return;

    // Helper to setup delay
    const setupDelay = (seconds: number) => {
      timerRef.current = setTimeout(() => {
        openPopup();
      }, seconds * 1000);
    };

    // Helper to setup scroll
    const setupScroll = (percentage: number) => {
      const handleScroll = () => {
        const scrollTop = window.scrollY || document.documentElement.scrollTop;
        const scrollHeight = document.documentElement.scrollHeight - document.documentElement.clientHeight;
        if (scrollHeight <= 0) return;
        const currentPercent = (scrollTop / scrollHeight) * 100;
        if (currentPercent >= percentage) {
          openPopup();
          window.removeEventListener('scroll', handleScroll);
        }
      };
      window.addEventListener('scroll', handleScroll, { passive: true });
      return () => window.removeEventListener('scroll', handleScroll);
    };

    // Helper to setup exit intent
    const setupExitIntent = () => {
      const handleMouseLeave = (e: MouseEvent) => {
        if (e.clientY <= 10 && e.relatedTarget === null) {
          openPopup();
          document.removeEventListener('mouseleave', handleMouseLeave);
        }
      };
      document.addEventListener('mouseleave', handleMouseLeave);
      return () => document.removeEventListener('mouseleave', handleMouseLeave);
    };

    // Helper to setup inactivity
    const setupInactivity = (seconds: number) => {
      const resetInactivity = () => {
        if (inactivityTimerRef.current) clearTimeout(inactivityTimerRef.current);
        inactivityTimerRef.current = setTimeout(() => {
          openPopup();
        }, seconds * 1000);
      };

      resetInactivity();
      window.addEventListener('mousemove', resetInactivity, { passive: true });
      window.addEventListener('keydown', resetInactivity, { passive: true });
      window.addEventListener('scroll', resetInactivity, { passive: true });

      return () => {
        if (inactivityTimerRef.current) clearTimeout(inactivityTimerRef.current);
        window.removeEventListener('mousemove', resetInactivity);
        window.removeEventListener('keydown', resetInactivity);
        window.removeEventListener('scroll', resetInactivity);
      };
    };

    // 1. If MULTI-TRIGGER: enable all active conditions simultaneously
    if (popup.multi_trigger) {
      if (popup.trigger_delay_seconds > 0) setupDelay(popup.trigger_delay_seconds);
      const cleanScroll = setupScroll(popup.trigger_scroll_percentage || 40);
      const cleanExit = setupExitIntent();
      const cleanInactivity = popup.trigger_inactivity_seconds > 0
        ? setupInactivity(popup.trigger_inactivity_seconds)
        : () => {};

      return () => {
        if (timerRef.current) clearTimeout(timerRef.current);
        cleanScroll();
        cleanExit();
        cleanInactivity();
      };
    }

    // 2. Single Trigger Mode
    if (popup.trigger_type === 'immediate') {
      openPopup();
      return;
    }

    if (popup.trigger_type === 'delay') {
      setupDelay(popup.trigger_delay_seconds ?? 5);
      return () => {
        if (timerRef.current) clearTimeout(timerRef.current);
      };
    }

    if (popup.trigger_type === 'scroll') {
      return setupScroll(popup.trigger_scroll_percentage ?? 40);
    }

    if (popup.trigger_type === 'exit_intent') {
      return setupExitIntent();
    }

    if (popup.trigger_type === 'inactivity') {
      return setupInactivity(popup.trigger_inactivity_seconds || 15);
    }
  }, [popup, openPopup]);

  const handleClose = () => {
    setIsClosing(true);
    setTimeout(() => {
      setIsOpen(false);
      setIsClosing(false);
    }, 220);
  };

  // Close on Escape
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape' && isOpen) {
        handleClose();
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isOpen]);

  // Primary CTA Handler
  const handlePrimaryAction = async (e: React.MouseEvent) => {
    if (!popup) return;

    // 1. Copy promo code action
    if (popup.cta_action_type === 'copy_promo' && popup.promo_code_to_copy) {
      e.preventDefault();
      try {
        await navigator.clipboard.writeText(popup.promo_code_to_copy);
        setCopied(true);
        toast.success(`Codice "${popup.promo_code_to_copy}" copiato negli appunti!`, {
          description: 'Inseriscilo al momento del checkout per applicare lo sconto.',
        });
        setTimeout(() => setCopied(false), 3000);
      } catch {
        toast.info(`Codice promo: ${popup.promo_code_to_copy}`);
      }

      if (popup.cta_url) {
        setTimeout(() => {
          handleClose();
          if (popup.cta_url?.startsWith('http') || popup.cta_target === '_blank') {
            window.open(popup.cta_url!, popup.cta_target || '_blank');
          } else {
            window.location.href = popup.cta_url!;
          }
        }, 600);
      }
      return;
    }

    // 2. Scroll to section action
    if (popup.cta_action_type === 'scroll_to' && popup.cta_url) {
      e.preventDefault();
      handleClose();
      const targetId = popup.cta_url.replace(/^#/, '');
      const el = document.getElementById(targetId);
      if (el) {
        el.scrollIntoView({ behavior: 'smooth' });
      } else {
        window.location.hash = targetId;
      }
      return;
    }

    // 3. WhatsApp action
    if (popup.cta_action_type === 'whatsapp' && popup.cta_url) {
      e.preventDefault();
      handleClose();
      const waUrl = popup.cta_url.startsWith('http')
        ? popup.cta_url
        : `https://wa.me/${popup.cta_url.replace(/[^0-9]/g, '')}`;
      window.open(waUrl, '_blank', 'noopener,noreferrer');
      return;
    }

    // 4. Telegram action
    if (popup.cta_action_type === 'telegram' && popup.cta_url) {
      e.preventDefault();
      handleClose();
      const tgUrl = popup.cta_url.startsWith('http')
        ? popup.cta_url
        : `https://t.me/${popup.cta_url.replace(/^@/, '')}`;
      window.open(tgUrl, '_blank', 'noopener,noreferrer');
      return;
    }

    // 5. Standard link / social (Instagram, partner, etc.)
    if (popup.cta_url) {
      handleClose();
    }
  };

  // Secondary CTA Handler
  const handleSecondaryAction = (e: React.MouseEvent) => {
    if (!popup) return;

    if (popup.secondary_cta_action_type === 'dismiss' || !popup.secondary_cta_url) {
      handleClose();
      return;
    }

    if (popup.secondary_cta_action_type === 'whatsapp' && popup.secondary_cta_url) {
      e.preventDefault();
      handleClose();
      const waUrl = popup.secondary_cta_url.startsWith('http')
        ? popup.secondary_cta_url
        : `https://wa.me/${popup.secondary_cta_url.replace(/[^0-9]/g, '')}`;
      window.open(waUrl, '_blank', 'noopener,noreferrer');
      return;
    }

    if (popup.secondary_cta_action_type === 'telegram' && popup.secondary_cta_url) {
      e.preventDefault();
      handleClose();
      const tgUrl = popup.secondary_cta_url.startsWith('http')
        ? popup.secondary_cta_url
        : `https://t.me/${popup.secondary_cta_url.replace(/^@/, '')}`;
      window.open(tgUrl, '_blank', 'noopener,noreferrer');
      return;
    }

    if (popup.secondary_cta_url) {
      handleClose();
      window.open(popup.secondary_cta_url, popup.secondary_cta_target || '_blank');
    }
  };

  if (!isOpen || !popup) return null;

  const isImageOnly = popup.content_type === 'image_only';
  const isTextOnly = popup.content_type === 'text_only';
  const isCombined = popup.content_type === 'combined';
  const position = popup.position || 'center';

  // Position wrapper classes
  let positionClasses = 'fixed inset-0 z-[99999] flex items-center justify-center p-4 sm:p-6';
  let containerPositionClasses = 'w-full max-w-[460px] max-h-[90vh]';

  if (position === 'bottom_bar') {
    positionClasses = 'fixed inset-x-0 bottom-0 z-[99999] flex justify-center p-3 sm:p-4 pointer-events-none';
    containerPositionClasses = 'w-full max-w-4xl max-h-[85vh] pointer-events-auto';
  } else if (position === 'bottom_right') {
    positionClasses = 'fixed bottom-4 right-4 z-[99999] flex justify-end pointer-events-none';
    containerPositionClasses = 'w-[90vw] max-w-[380px] max-h-[85vh] pointer-events-auto';
  } else if (position === 'bottom_left') {
    positionClasses = 'fixed bottom-4 left-4 z-[99999] flex justify-start pointer-events-none';
    containerPositionClasses = 'w-[90vw] max-w-[380px] max-h-[85vh] pointer-events-auto';
  }

  const customStyle = popup.custom_theme_color
    ? { '--custom-accent': popup.custom_theme_color } as React.CSSProperties
    : {};

  return (
    <div
      role="dialog"
      aria-modal={position === 'center'}
      style={customStyle}
      className={`${positionClasses} transition-all duration-200 ${
        isClosing ? 'opacity-0' : 'opacity-100'
      }`}
    >
      {/* Backdrop only for center modal */}
      {position === 'center' && (
        <div
          onClick={handleClose}
          className="fixed inset-0 bg-black/60 backdrop-blur-sm transition-opacity"
        />
      )}

      {/* Popup Main Card */}
      <div
        className={`relative flex flex-col bg-white dark:bg-slate-900 text-slate-900 dark:text-white rounded-3xl shadow-2xl border border-slate-200/80 dark:border-slate-800 overflow-hidden transform transition-all duration-200 ${containerPositionClasses} ${
          isClosing ? 'scale-95 opacity-0' : 'scale-100 opacity-100'
        }`}
      >
        {/* Close Button */}
        <button
          type="button"
          onClick={handleClose}
          aria-label="Chiudi"
          className="absolute top-3.5 right-3.5 z-20 size-8 flex items-center justify-center rounded-full bg-black/40 hover:bg-black/60 text-white backdrop-blur-md transition-transform hover:scale-105 active:scale-95 cursor-pointer shadow-md"
        >
          <X className="size-4" />
        </button>

        {/* --- 1. IMAGE ONLY MODE --- */}
        {isImageOnly && popup.image_url && (
          <a
            href={popup.cta_url || '#'}
            onClick={handlePrimaryAction}
            target={popup.cta_target || '_blank'}
            rel="noopener noreferrer"
            className="group relative block w-full overflow-hidden cursor-pointer"
          >
            <img
              src={popup.image_url}
              alt={popup.display_title || popup.title}
              className="w-full h-auto object-cover max-h-[80vh] transition-transform duration-300 group-hover:scale-[1.02]"
            />
          </a>
        )}

        {/* --- 2. COMBINED MODE --- */}
        {isCombined && (
          <div className="flex flex-col w-full overflow-y-auto">
            {popup.image_url && (
              <>
                {popup.image_fit === 'cover' ? (
                  <div className="relative w-full overflow-hidden bg-slate-100 dark:bg-slate-800 h-[220px] sm:h-[260px]">
                    <img
                      src={popup.image_url}
                      alt={popup.display_title || popup.title}
                      className="w-full h-full object-cover transition-transform duration-300 hover:scale-105"
                    />
                  </div>
                ) : popup.image_fit === 'contain' ? (
                  <div className="relative w-full overflow-hidden bg-slate-100/90 dark:bg-slate-800/80 flex items-center justify-center h-[220px] sm:h-[260px] p-3 sm:p-4">
                    <img
                      src={popup.image_url}
                      alt={popup.display_title || popup.title}
                      className="w-full h-full object-contain mx-auto"
                    />
                  </div>
                ) : popup.image_fit === 'padded' ? (
                  <div className="px-5 pt-5 pb-0 w-full">
                    <div className="relative w-full overflow-hidden rounded-2xl border border-slate-200/80 dark:border-slate-800 bg-slate-100 dark:bg-slate-800 shadow-sm h-[180px] sm:h-[220px]">
                      <img
                        src={popup.image_url}
                        alt={popup.display_title || popup.title}
                        className="w-full h-full object-cover"
                      />
                    </div>
                  </div>
                ) : (
                  /* Ambient glow mode (default) */
                  <div className="relative w-full overflow-hidden bg-slate-900/5 dark:bg-slate-800/80 flex items-center justify-center max-h-[300px] sm:max-h-[340px]">
                    <div
                      className="absolute inset-0 bg-cover bg-center blur-2xl opacity-35 scale-125"
                      style={{ backgroundImage: `url(${popup.image_url})` }}
                    />
                    <img
                      src={popup.image_url}
                      alt={popup.display_title || popup.title}
                      className="relative z-10 w-full h-auto max-h-[300px] sm:max-h-[340px] object-contain mx-auto transition-transform duration-300"
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

              {/* Promo code badge if copy_promo */}
              {popup.cta_action_type === 'copy_promo' && popup.promo_code_to_copy && (
                <div className="flex items-center justify-between p-3 rounded-xl bg-muted/60 border border-border">
                  <div className="flex flex-col">
                    <span className="text-[10px] text-muted-foreground uppercase font-bold tracking-wider">Codice Promo:</span>
                    <span className="font-mono font-black text-sm tracking-wider text-primary">{popup.promo_code_to_copy}</span>
                  </div>
                  <span className="text-xs font-semibold text-primary flex items-center gap-1">
                    {copied ? <Check className="size-3.5 text-emerald-500" /> : <Copy className="size-3.5" />}
                    {copied ? 'Copiato!' : 'Clicca per copiare'}
                  </span>
                </div>
              )}

              {popup.cta_text && (
                <div className="pt-2 flex flex-col sm:flex-row gap-2.5">
                  <a
                    href={popup.cta_url || '#'}
                    onClick={handlePrimaryAction}
                    target={popup.cta_target || '_blank'}
                    rel="noopener noreferrer"
                    className="w-full inline-flex items-center justify-center gap-2 px-5 py-3 rounded-xl bg-primary hover:bg-primary/90 text-primary-foreground font-bold text-sm shadow-lg shadow-primary/25 transition-all hover:translate-y-[-1px] active:translate-y-[1px] cursor-pointer"
                  >
                    <span>{popup.cta_text}</span>
                    {popup.cta_action_type === 'whatsapp' ? (
                      <MessageCircle className="size-4" />
                    ) : popup.cta_action_type === 'telegram' ? (
                      <Send className="size-4" />
                    ) : popup.cta_action_type === 'copy_promo' ? (
                      copied ? <Check className="size-4" /> : <Copy className="size-4" />
                    ) : popup.cta_target === '_blank' ? (
                      <ExternalLink className="size-4" />
                    ) : (
                      <ArrowRight className="size-4" />
                    )}
                  </a>

                  {popup.secondary_cta_text && (
                    <button
                      type="button"
                      onClick={handleSecondaryAction}
                      className="px-4 py-2.5 text-xs font-semibold text-slate-500 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white transition-colors cursor-pointer text-center"
                    >
                      {popup.secondary_cta_text}
                    </button>
                  )}
                </div>
              )}
            </div>
          </div>
        )}

        {/* --- 3. TEXT ONLY MODE --- */}
        {isTextOnly && (
          <div className="p-7 sm:p-8 space-y-5 overflow-y-auto">
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

            {/* Promo code badge if copy_promo */}
            {popup.cta_action_type === 'copy_promo' && popup.promo_code_to_copy && (
              <div className="flex items-center justify-between p-3 rounded-xl bg-muted/60 border border-border">
                <div className="flex flex-col">
                  <span className="text-[10px] text-muted-foreground uppercase font-bold tracking-wider">Codice Promo:</span>
                  <span className="font-mono font-black text-sm tracking-wider text-primary">{popup.promo_code_to_copy}</span>
                </div>
                <span className="text-xs font-semibold text-primary flex items-center gap-1">
                  {copied ? <Check className="size-3.5 text-emerald-500" /> : <Copy className="size-3.5" />}
                  {copied ? 'Copiato!' : 'Clicca per copiare'}
                </span>
              </div>
            )}

            {popup.cta_text && (
              <div className="pt-2 flex flex-col sm:flex-row gap-2.5">
                <a
                  href={popup.cta_url || '#'}
                  onClick={handlePrimaryAction}
                  target={popup.cta_target || '_blank'}
                  rel="noopener noreferrer"
                  className="w-full inline-flex items-center justify-center gap-2 px-5 py-3 rounded-xl bg-primary hover:bg-primary/90 text-primary-foreground font-bold text-sm shadow-lg shadow-primary/25 transition-all hover:translate-y-[-1px] active:translate-y-[1px] cursor-pointer"
                >
                  <span>{popup.cta_text}</span>
                  {popup.cta_action_type === 'whatsapp' ? (
                    <MessageCircle className="size-4" />
                  ) : popup.cta_action_type === 'telegram' ? (
                    <Send className="size-4" />
                  ) : popup.cta_action_type === 'copy_promo' ? (
                    copied ? <Check className="size-4" /> : <Copy className="size-4" />
                  ) : popup.cta_target === '_blank' ? (
                    <ExternalLink className="size-4" />
                  ) : (
                    <ArrowRight className="size-4" />
                  )}
                </a>

                {popup.secondary_cta_text && (
                  <button
                    type="button"
                    onClick={handleSecondaryAction}
                    className="px-4 py-2.5 text-xs font-semibold text-slate-500 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white transition-colors cursor-pointer text-center"
                  >
                    {popup.secondary_cta_text}
                  </button>
                )}
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
}
