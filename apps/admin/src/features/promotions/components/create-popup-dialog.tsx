"use client";

import { useEffect, useRef, useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from "@/components/ui/dialog";
import {
  Form,
  FormControl,
  FormDescription,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Button } from "@/components/ui/button";
import { Switch } from "@/components/ui/switch";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Image as ImageIcon,
  Upload,
  X,
  Sparkles,
  Loader2,
  ArrowRight,
  Clock,
  Smartphone,
  Monitor,
  Layers,
  Settings2,
  Calendar,
  MousePointerClick,
  Copy,
  MessageCircle,
  Send,
  ExternalLink,
  Sliders,
  Palette,
} from "lucide-react";
import { toast } from "sonner";
import { useTranslation } from "@/i18n/context";
import type { MarketingPopupItem, CreateMarketingPopupInput } from "@atena/api-types";
import { useMarketingPopups } from "../hooks/use-marketing-popups";

const popupFormSchema = z.object({
  title: z.string().min(1, "Il titolo della campagna è obbligatorio"),
  is_active: z.boolean().default(true),
  content_type: z.enum(["image_only", "text_only", "combined"]).default("combined"),
  position: z.enum(["center", "bottom_bar", "bottom_right", "bottom_left"]).default("center"),
  custom_theme_color: z.string().optional().nullable(),
  
  image_url: z.string().optional().nullable(),
  badge_text: z.string().optional().nullable(),
  display_title: z.string().optional().nullable(),
  display_text: z.string().optional().nullable(),
  
  cta_text: z.string().optional().nullable(),
  cta_url: z.string().optional().nullable(),
  cta_action_type: z.enum(["link", "copy_promo", "scroll_to", "whatsapp", "telegram"]).default("link"),
  cta_target: z.enum(["_blank", "_self"]).default("_blank"),
  promo_code_to_copy: z.string().optional().nullable(),
  
  secondary_cta_text: z.string().optional().nullable(),
  secondary_cta_action_type: z.enum(["dismiss", "link", "whatsapp", "telegram"]).default("dismiss"),
  secondary_cta_url: z.string().optional().nullable(),
  secondary_cta_target: z.enum(["_blank", "_self"]).default("_blank"),
  
  trigger_type: z.enum(["delay", "scroll", "exit_intent", "immediate", "inactivity"]).default("delay"),
  trigger_delay_seconds: z.coerce.number().min(0).max(120).default(5),
  trigger_scroll_percentage: z.coerce.number().min(1).max(100).default(40),
  trigger_inactivity_seconds: z.coerce.number().min(0).max(300).default(0),
  multi_trigger: z.boolean().default(false),
  
  frequency: z.enum(["once_per_session", "once_per_day", "once_forever", "always"]).default("once_per_day"),
  target_devices: z.enum(["all", "desktop_only", "mobile_only"]).default("all"),
  target_languages: z.string().default("*"),
  target_routes: z.string().default("*"),
  
  start_date: z.string().optional().nullable(),
  end_date: z.string().optional().nullable(),
  priority: z.coerce.number().default(0),
});

type PopupFormValues = z.infer<typeof popupFormSchema>;

interface CreatePopupDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  initialData?: MarketingPopupItem | null;
  onSubmit: (data: CreateMarketingPopupInput) => Promise<void>;
}

export function CreatePopupDialog({
  open,
  onOpenChange,
  initialData,
  onSubmit,
}: CreatePopupDialogProps) {
  const { t } = useTranslation();
  const { uploadImage } = useMarketingPopups();
  const [isUploading, setIsUploading] = useState(false);
  const [previewDevice, setPreviewDevice] = useState<"mobile" | "desktop">("mobile");
  const fileInputRef = useRef<HTMLInputElement>(null);

  const form = useForm<PopupFormValues>({
    resolver: zodResolver(popupFormSchema) as any,
    defaultValues: {
      title: "",
      is_active: true,
      content_type: "combined",
      position: "center",
      custom_theme_color: "",
      image_url: "",
      badge_text: "OFFERTA SPECIALE",
      display_title: "Impara una nuova lingua con noi!",
      display_text: "Iscriviti subito ai corsi autunnali e ricevi uno sconto esclusivo del 15%.",
      cta_text: "Scopri i Corsi",
      cta_url: "/corsi",
      cta_action_type: "link",
      cta_target: "_blank",
      promo_code_to_copy: "",
      secondary_cta_text: "Non ora",
      secondary_cta_action_type: "dismiss",
      secondary_cta_url: "",
      secondary_cta_target: "_blank",
      trigger_type: "delay",
      trigger_delay_seconds: 5,
      trigger_scroll_percentage: 40,
      trigger_inactivity_seconds: 0,
      multi_trigger: false,
      frequency: "once_per_day",
      target_devices: "all",
      target_languages: "*",
      target_routes: "*",
      start_date: "",
      end_date: "",
      priority: 0,
    },
  });

  useEffect(() => {
    if (open) {
      if (initialData) {
        form.reset({
          title: initialData.title,
          is_active: initialData.is_active,
          content_type: initialData.content_type,
          position: initialData.position || "center",
          custom_theme_color: initialData.custom_theme_color || "",
          image_url: initialData.image_url || "",
          badge_text: initialData.badge_text || "",
          display_title: initialData.display_title || "",
          display_text: initialData.display_text || "",
          cta_text: initialData.cta_text || "",
          cta_url: initialData.cta_url || "",
          cta_action_type: initialData.cta_action_type || "link",
          cta_target: initialData.cta_target || "_blank",
          promo_code_to_copy: initialData.promo_code_to_copy || "",
          secondary_cta_text: initialData.secondary_cta_text || "",
          secondary_cta_action_type: initialData.secondary_cta_action_type || "dismiss",
          secondary_cta_url: initialData.secondary_cta_url || "",
          secondary_cta_target: initialData.secondary_cta_target || "_blank",
          trigger_type: initialData.trigger_type,
          trigger_delay_seconds: initialData.trigger_delay_seconds ?? 5,
          trigger_scroll_percentage: initialData.trigger_scroll_percentage ?? 40,
          trigger_inactivity_seconds: initialData.trigger_inactivity_seconds ?? 0,
          multi_trigger: Boolean(initialData.multi_trigger),
          frequency: initialData.frequency,
          target_devices: initialData.target_devices || "all",
          target_languages: Array.isArray(initialData.target_languages)
            ? initialData.target_languages.join(", ")
            : "*",
          target_routes: Array.isArray(initialData.target_routes)
            ? initialData.target_routes.join(", ")
            : "*",
          start_date: initialData.start_date
            ? new Date(initialData.start_date).toISOString().slice(0, 16)
            : "",
          end_date: initialData.end_date
            ? new Date(initialData.end_date).toISOString().slice(0, 16)
            : "",
          priority: initialData.priority ?? 0,
        });
      } else {
        form.reset({
          title: "",
          is_active: true,
          content_type: "combined",
          position: "center",
          custom_theme_color: "",
          image_url: "",
          badge_text: "OFFERTA SPECIALE",
          display_title: "Impara una nuova lingua con noi!",
          display_text: "Iscriviti subito ai nostri corsi e ricevi uno sconto esclusivo.",
          cta_text: "Scopri i Corsi",
          cta_url: "/corsi",
          cta_action_type: "link",
          cta_target: "_blank",
          promo_code_to_copy: "",
          secondary_cta_text: "Non ora",
          secondary_cta_action_type: "dismiss",
          secondary_cta_url: "",
          secondary_cta_target: "_blank",
          trigger_type: "delay",
          trigger_delay_seconds: 5,
          trigger_scroll_percentage: 40,
          trigger_inactivity_seconds: 0,
          multi_trigger: false,
          frequency: "once_per_day",
          target_devices: "all",
          target_languages: "*",
          target_routes: "*",
          start_date: "",
          end_date: "",
          priority: 0,
        });
      }
    }
  }, [open, initialData, form]);

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (!file.type.startsWith("image/")) {
      toast.error(t("promotions.popups.toastInvalidImage") || "Seleziona un'immagine valida (PNG, JPG, WebP, SVG, AVIF)");
      return;
    }

    if (file.size > 10 * 1024 * 1024) {
      toast.error(t("promotions.popups.toastImageTooLarge") || "L'immagine non può superare 10MB");
      return;
    }

    setIsUploading(true);
    const reader = new FileReader();
    reader.onload = async (ev) => {
      const dataUrl = ev.target?.result as string;
      if (dataUrl) {
        try {
          const publicUrl = await uploadImage(dataUrl, file.name);
          form.setValue("image_url", publicUrl, { shouldDirty: true });
          toast.success(t("promotions.popups.toastImageUploadSuccess") || "Immagine caricata con successo su Supabase Storage!");
        } catch (err: any) {
          toast.error(err?.message || t("promotions.popups.toastImageUploadError") || "Errore durante il caricamento dell'immagine");
        } finally {
          setIsUploading(false);
          if (fileInputRef.current) fileInputRef.current.value = "";
        }
      }
    };
    reader.onerror = () => {
      toast.error(t("promotions.popups.toastImageReadError") || "Errore lettura file");
      setIsUploading(false);
    };
    reader.readAsDataURL(file);
  };

  const onFormSubmit = async (values: PopupFormValues) => {
    try {
      const routesArray = values.target_routes
        .split(",")
        .map((r) => r.trim())
        .filter(Boolean);

      const langsArray = values.target_languages
        .split(",")
        .map((l) => l.trim())
        .filter(Boolean);

      const payload: CreateMarketingPopupInput = {
        title: values.title,
        is_active: values.is_active,
        content_type: values.content_type,
        position: values.position,
        custom_theme_color: values.custom_theme_color || null,
        
        image_url: values.image_url || null,
        badge_text: values.badge_text || null,
        display_title: values.display_title || null,
        display_text: values.display_text || null,
        
        cta_text: values.cta_text || null,
        cta_url: values.cta_url || null,
        cta_action_type: values.cta_action_type,
        cta_target: values.cta_target,
        promo_code_to_copy: values.promo_code_to_copy || null,
        
        secondary_cta_text: values.secondary_cta_text || null,
        secondary_cta_action_type: values.secondary_cta_action_type,
        secondary_cta_url: values.secondary_cta_url || null,
        secondary_cta_target: values.secondary_cta_target,
        
        trigger_type: values.trigger_type,
        trigger_delay_seconds: values.trigger_delay_seconds,
        trigger_scroll_percentage: values.trigger_scroll_percentage,
        trigger_inactivity_seconds: values.trigger_inactivity_seconds,
        multi_trigger: values.multi_trigger,
        
        frequency: values.frequency,
        target_devices: values.target_devices,
        target_languages: langsArray.length > 0 ? langsArray : ["*"],
        target_routes: routesArray.length > 0 ? routesArray : ["*"],
        
        start_date: values.start_date ? new Date(values.start_date).toISOString() : null,
        end_date: values.end_date ? new Date(values.end_date).toISOString() : null,
        priority: values.priority,
      };

      await onSubmit(payload);
      onOpenChange(false);
    } catch (err) {
      // Handled in hook
    }
  };

  const watched = form.watch();

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="w-[96vw] sm:max-w-5xl max-h-[94vh] overflow-y-auto p-0 gap-0 border border-border bg-background shadow-2xl rounded-2xl">
        <DialogHeader className="p-6 pb-4 border-b border-border bg-muted/20">
          <div className="flex items-center justify-between">
            <div>
              <DialogTitle className="text-xl font-bold flex items-center gap-2">
                <Sparkles className="size-5 text-primary" />
                {initialData ? (t("promotions.popups.editPopup") || "Modifica Popup Marketing") : (t("promotions.popups.createPopupTitle") || "Crea Nuovo Popup Marketing")}
              </DialogTitle>
              <DialogDescription className="text-xs text-muted-foreground mt-0.5">
                {t("promotions.popups.createPopupSubtitle") || "Configura grafiche, testi, azioni CTA, social, trigger avanzati e target per i visitatori del sito."}
              </DialogDescription>
            </div>
            <FormField
              control={form.control}
              name="is_active"
              render={({ field }) => (
                <div className="flex items-center gap-2 bg-background border border-border px-3 py-1.5 rounded-xl shadow-xs">
                  <span className="text-xs font-bold text-foreground">{t("promotions.popups.activeImmediately") || "Attivo subito"}</span>
                  <Switch
                    checked={field.value}
                    onCheckedChange={field.onChange}
                    className="cursor-pointer"
                  />
                </div>
              )}
            />
          </div>
        </DialogHeader>

        <div className="grid grid-cols-1 lg:grid-cols-12 min-h-[520px]">
          {/* LEFT: 3 TABS FORM CONTROLS */}
          <div className="lg:col-span-7 p-6 border-r border-border space-y-5">
            <Form {...form}>
              <form onSubmit={form.handleSubmit(onFormSubmit)} className="space-y-4">
                <Tabs defaultValue="content" className="w-full">
                  <TabsList className="grid grid-cols-3 w-full mb-4">
                    <TabsTrigger value="content" className="text-xs font-semibold gap-1.5 cursor-pointer">
                      <Layers className="size-3.5" /> {t("promotions.popups.tabContent") || "1. Contenuto"}
                    </TabsTrigger>
                    <TabsTrigger value="actions" className="text-xs font-semibold gap-1.5 cursor-pointer">
                      <MousePointerClick className="size-3.5" /> {t("promotions.popups.tabActions") || "2. Azioni & CTA"}
                    </TabsTrigger>
                    <TabsTrigger value="rules" className="text-xs font-semibold gap-1.5 cursor-pointer">
                      <Sliders className="size-3.5" /> {t("promotions.popups.tabRules") || "3. Trigger & Target"}
                    </TabsTrigger>
                  </TabsList>

                  {/* ── TAB 1: CONTENT & DESIGN ── */}
                  <TabsContent value="content" className="space-y-4 mt-0">
                    <FormField
                      control={form.control}
                      name="title"
                      render={({ field }) => (
                        <FormItem className="min-w-0">
                          <FormLabel className="text-xs font-bold">{t("promotions.popups.campaignName") || "Nome Campagna (Interno)"} *</FormLabel>
                          <FormControl>
                            <Input placeholder="Es. Sconto Autunno 2026 - Black Friday" {...field} />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />

                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                      <FormField
                        control={form.control}
                        name="content_type"
                        render={({ field }) => (
                          <FormItem className="min-w-0">
                            <FormLabel className="text-xs font-bold">{t("promotions.popups.layoutType") || "Tipo di Layout"}</FormLabel>
                            <Select onValueChange={field.onChange} value={field.value}>
                              <FormControl>
                                <SelectTrigger className="cursor-pointer text-xs w-full min-w-0 overflow-hidden [&>span]:truncate">
                                  <SelectValue placeholder="Seleziona layout" />
                                </SelectTrigger>
                              </FormControl>
                              <SelectContent>
                                <SelectItem value="combined" className="cursor-pointer text-xs">
                                  {t("promotions.popups.formatCombined") || "🎨 Ibrido: Banner + Testo + Bottone"}
                                </SelectItem>
                                <SelectItem value="image_only" className="cursor-pointer text-xs">
                                  {t("promotions.popups.formatImageOnly") || "🖼️ Solo Immagine (Banner Cliccabile)"}
                                </SelectItem>
                                <SelectItem value="text_only" className="cursor-pointer text-xs">
                                  {t("promotions.popups.formatTextOnly") || "📝 Solo Testo + Bottone"}
                                </SelectItem>
                              </SelectContent>
                            </Select>
                            <FormMessage />
                          </FormItem>
                        )}
                      />

                      <FormField
                        control={form.control}
                        name="position"
                        render={({ field }) => (
                          <FormItem className="min-w-0">
                            <FormLabel className="text-xs font-bold">{t("promotions.popups.positionLabel") || "Posizione Schermo"}</FormLabel>
                            <Select onValueChange={field.onChange} value={field.value}>
                              <FormControl>
                                <SelectTrigger className="cursor-pointer text-xs w-full min-w-0 overflow-hidden [&>span]:truncate">
                                  <SelectValue placeholder="Seleziona posizione" />
                                </SelectTrigger>
                              </FormControl>
                              <SelectContent>
                                <SelectItem value="center" className="cursor-pointer text-xs">
                                  {t("promotions.popups.posCenter") || "Centrale (Modale con Backdrop)"}
                                </SelectItem>
                                <SelectItem value="bottom_bar" className="cursor-pointer text-xs">
                                  {t("promotions.popups.posBottomBar") || "Barra Flottante in Basso"}
                                </SelectItem>
                                <SelectItem value="bottom_right" className="cursor-pointer text-xs">
                                  {t("promotions.popups.posBottomRight") || "Card in Basso a Destra"}
                                </SelectItem>
                                <SelectItem value="bottom_left" className="cursor-pointer text-xs">
                                  {t("promotions.popups.posBottomLeft") || "Card in Basso a Sinistra"}
                                </SelectItem>
                              </SelectContent>
                            </Select>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                    </div>

                    {/* Image Uploader */}
                    {watched.content_type !== "text_only" && (
                      <div className="space-y-2 p-3.5 bg-muted/30 border border-border/80 rounded-2xl">
                        <div className="flex items-center justify-between">
                          <label className="text-xs font-bold text-foreground flex items-center gap-1.5">
                            <ImageIcon className="size-3.5 text-primary" /> {t("promotions.popups.imageLabel") || "Immagine del Banner"}
                          </label>
                          <span className="text-[10px] text-muted-foreground">{t("promotions.popups.imageHint") || "WebP, PNG, JPG, AVIF (max 10MB)"}</span>
                        </div>

                        <div className="flex items-center gap-3">
                          {watched.image_url ? (
                            <div className="relative w-16 h-16 rounded-xl border border-border overflow-hidden bg-white shrink-0 shadow-xs">
                              <img
                                src={watched.image_url}
                                alt="Preview"
                                className="w-full h-full object-cover"
                              />
                            </div>
                          ) : (
                            <div className="w-16 h-16 rounded-xl border border-dashed border-border flex items-center justify-center bg-muted/40 shrink-0">
                              <ImageIcon className="size-6 text-muted-foreground/40" />
                            </div>
                          )}

                          <div className="flex-1 space-y-1.5 min-w-0">
                            <div className="flex items-center gap-2">
                              <input
                                type="file"
                                ref={fileInputRef}
                                onChange={handleFileUpload}
                                accept="image/png,image/jpeg,image/jpg,image/webp,image/svg+xml,image/avif"
                                className="hidden"
                              />
                              <Button
                                type="button"
                                variant="outline"
                                size="sm"
                                onClick={() => fileInputRef.current?.click()}
                                disabled={isUploading}
                                className="h-8 text-xs cursor-pointer gap-1.5 bg-background shadow-xs"
                              >
                                {isUploading ? (
                                  <Loader2 className="size-3.5 animate-spin" />
                                ) : (
                                  <Upload className="size-3.5 text-primary" />
                                )}
                                {watched.image_url ? (t("promotions.popups.replaceImage") || "Sostituisci") : (t("promotions.popups.uploadFromFile") || "Carica da File")}
                              </Button>

                              {watched.image_url && (
                                <Button
                                  type="button"
                                  variant="ghost"
                                  size="sm"
                                  onClick={() => form.setValue("image_url", "", { shouldDirty: true })}
                                  className="h-8 text-xs text-rose-500 hover:text-rose-600 hover:bg-rose-50 dark:hover:bg-rose-950/30 cursor-pointer"
                                >
                                  <X className="size-3.5 mr-1" /> {t("promotions.popups.removeImage") || "Rimuovi"}
                                </Button>
                              )}
                            </div>
                            <Input
                              placeholder={t("promotions.popups.imagePasteUrlPlaceholder") || "O incolla URL immagine https://..."}
                              value={watched.image_url || ""}
                              onChange={(e) => form.setValue("image_url", e.target.value, { shouldDirty: true })}
                              className="h-7 text-[11px] font-mono bg-background"
                            />
                          </div>
                        </div>
                      </div>
                    )}

                    {/* Text & Copy fields */}
                    {watched.content_type !== "image_only" && (
                      <div className="space-y-3 pt-1">
                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                          <FormField
                            control={form.control}
                            name="badge_text"
                            render={({ field }) => (
                              <FormItem className="min-w-0">
                                <FormLabel className="text-xs font-bold">{t("promotions.popups.badgeLabel") || "Etichetta Badge"}</FormLabel>
                                <FormControl>
                                  <Input placeholder="Es. SCONTO 20% / NOVITÀ" {...field} value={field.value || ""} />
                                </FormControl>
                                <FormMessage />
                              </FormItem>
                            )}
                          />
                          <FormField
                            control={form.control}
                            name="display_title"
                            render={({ field }) => (
                              <FormItem className="min-w-0">
                                <FormLabel className="text-xs font-bold">{t("promotions.popups.displayTitle") || "Titolo Visibile"}</FormLabel>
                                <FormControl>
                                  <Input placeholder="Es. Corsi di Spagnolo 2026" {...field} value={field.value || ""} />
                                </FormControl>
                                <FormMessage />
                              </FormItem>
                            )}
                          />
                        </div>

                        <FormField
                          control={form.control}
                          name="display_text"
                          render={({ field }) => (
                            <FormItem className="min-w-0">
                              <FormLabel className="text-xs font-bold">{t("promotions.popups.displayText") || "Testo Descrittivo"}</FormLabel>
                              <FormControl>
                                <Textarea
                                  rows={2}
                                  placeholder="Descrivi l'offerta o il vantaggio..."
                                  {...field}
                                  value={field.value || ""}
                                />
                              </FormControl>
                              <FormMessage />
                            </FormItem>
                          )}
                        />
                      </div>
                    )}
                  </TabsContent>

                  {/* ── TAB 2: ACTIONS & CTAS ── */}
                  <TabsContent value="actions" className="space-y-4 mt-0">
                    <div className="p-4 bg-muted/20 border border-border/80 rounded-2xl space-y-3">
                      <div className="flex items-center gap-1.5 text-xs font-bold text-foreground">
                        <MousePointerClick className="size-4 text-primary" />
                        <span>{t("promotions.popups.primaryCtaSection") || "Azione Primaria (Pulsante / Immagine)"}</span>
                      </div>

                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                        <FormField
                          control={form.control}
                          name="cta_action_type"
                          render={({ field }) => (
                            <FormItem className="min-w-0">
                              <FormLabel className="text-xs font-bold">{t("promotions.popups.ctaActionType") || "Tipo di Azione"}</FormLabel>
                              <Select onValueChange={field.onChange} value={field.value}>
                                <FormControl>
                                  <SelectTrigger className="cursor-pointer text-xs w-full min-w-0 overflow-hidden [&>span]:truncate">
                                    <SelectValue placeholder="Seleziona azione" />
                                  </SelectTrigger>
                                </FormControl>
                                <SelectContent>
                                  <SelectItem value="link" className="cursor-pointer text-xs">
                                    {t("promotions.popups.actLink") || "🔗 Link Web / Social (Instagram, Pagina)"}
                                  </SelectItem>
                                  <SelectItem value="copy_promo" className="cursor-pointer text-xs">
                                    {t("promotions.popups.actCopyPromo") || "📋 Copia Codice Promo"}
                                  </SelectItem>
                                  <SelectItem value="scroll_to" className="cursor-pointer text-xs">
                                    {t("promotions.popups.actScrollTo") || "⚓ Scorri a Sezione (#lead-form)"}
                                  </SelectItem>
                                  <SelectItem value="whatsapp" className="cursor-pointer text-xs">
                                    {t("promotions.popups.actWhatsapp") || "💬 Chat WhatsApp"}
                                  </SelectItem>
                                  <SelectItem value="telegram" className="cursor-pointer text-xs">
                                    {t("promotions.popups.actTelegram") || "✈️ Canale / Chat Telegram"}
                                  </SelectItem>
                                </SelectContent>
                              </Select>
                              <FormMessage />
                            </FormItem>
                          )}
                        />

                        <FormField
                          control={form.control}
                          name="cta_target"
                          render={({ field }) => (
                            <FormItem className="min-w-0">
                              <FormLabel className="text-xs font-bold">{t("promotions.popups.ctaTarget") || "Apertura Link"}</FormLabel>
                              <Select onValueChange={field.onChange} value={field.value}>
                                <FormControl>
                                  <SelectTrigger className="cursor-pointer text-xs w-full min-w-0 overflow-hidden [&>span]:truncate">
                                    <SelectValue placeholder="Target" />
                                  </SelectTrigger>
                                </FormControl>
                                <SelectContent>
                                  <SelectItem value="_blank" className="cursor-pointer text-xs">
                                    {t("promotions.popups.targetBlank") || "Nuova Scheda (_blank)"}
                                  </SelectItem>
                                  <SelectItem value="_self" className="cursor-pointer text-xs">
                                    {t("promotions.popups.targetSelf") || "Stessa Scheda (_self)"}
                                  </SelectItem>
                                </SelectContent>
                              </Select>
                              <FormMessage />
                            </FormItem>
                          )}
                        />
                      </div>

                      {/* Promo Code Input if copy_promo */}
                      {watched.cta_action_type === "copy_promo" && (
                        <FormField
                          control={form.control}
                          name="promo_code_to_copy"
                          render={({ field }) => (
                            <FormItem className="min-w-0">
                              <FormLabel className="text-xs font-bold text-primary flex items-center gap-1.5">
                                <Copy className="size-3.5" /> {t("promotions.popups.promoCodeToCopy") || "Codice Promo da Copiare"}
                              </FormLabel>
                              <FormControl>
                                <Input placeholder="Es. BLACKFRIDAY2026" className="font-mono uppercase font-bold" {...field} value={field.value || ""} />
                              </FormControl>
                              <FormDescription className="text-[11px]">
                                {t("promotions.popups.promoCodeToCopyHint") || "Verrà copiato con 1 clic negli appunti dell'utente con conferma visiva."}
                              </FormDescription>
                              <FormMessage />
                            </FormItem>
                          )}
                        />
                      )}

                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                        {watched.content_type !== "image_only" && (
                          <FormField
                            control={form.control}
                            name="cta_text"
                            render={({ field }) => (
                              <FormItem className="min-w-0">
                                <FormLabel className="text-xs font-bold">{t("promotions.popups.ctaText") || "Testo del Bottone"}</FormLabel>
                                <FormControl>
                                  <Input placeholder="Es. Iscriviti Ora / Seguici" {...field} value={field.value || ""} />
                                </FormControl>
                                <FormMessage />
                              </FormItem>
                            )}
                          />
                        )}

                        <FormField
                          control={form.control}
                          name="cta_url"
                          render={({ field }) => (
                            <FormItem className={watched.content_type === "image_only" ? "sm:col-span-2 min-w-0" : "min-w-0"}>
                              <FormLabel className="text-xs font-bold">{t("promotions.popups.ctaUrl") || "Destinazione Link / URL Social"}</FormLabel>
                              <FormControl>
                                <Input placeholder="https://instagram.com/..., /corsi, o #form" {...field} value={field.value || ""} />
                              </FormControl>
                              <FormDescription className="text-[11px]">
                                {t("promotions.popups.ctaUrlHint") || "Inserisci URL esterno, percorso interno (/corsi) o anchor (#lead-form)."}
                              </FormDescription>
                              <FormMessage />
                            </FormItem>
                          )}
                        />
                      </div>
                    </div>

                    {/* Secondary Button / Dismiss Configuration */}
                    {watched.content_type !== "image_only" && (
                      <div className="p-4 bg-muted/10 border border-border/60 rounded-2xl space-y-3">
                        <div className="text-xs font-bold text-foreground">
                          {t("promotions.popups.secondaryCtaSection") || "Pulsante Secondario / Chiusura"}
                        </div>

                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                          <FormField
                            control={form.control}
                            name="secondary_cta_action_type"
                            render={({ field }) => (
                              <FormItem className="min-w-0">
                                <FormLabel className="text-xs font-bold">{t("promotions.popups.secondaryCtaActionType") || "Azione Secondaria"}</FormLabel>
                                <Select onValueChange={field.onChange} value={field.value}>
                                  <FormControl>
                                    <SelectTrigger className="cursor-pointer text-xs w-full min-w-0 overflow-hidden [&>span]:truncate">
                                      <SelectValue placeholder="Azione" />
                                    </SelectTrigger>
                                  </FormControl>
                                  <SelectContent>
                                    <SelectItem value="dismiss" className="cursor-pointer text-xs">
                                      {t("promotions.popups.secActDismiss") || "Solo Chiusura / Rifiuto"}
                                    </SelectItem>
                                    <SelectItem value="link" className="cursor-pointer text-xs">
                                      {t("promotions.popups.secActLink") || "Link Secondario Esterno / Interno"}
                                    </SelectItem>
                                    <SelectItem value="whatsapp" className="cursor-pointer text-xs">
                                      {t("promotions.popups.secActWhatsapp") || "WhatsApp Secondario"}
                                    </SelectItem>
                                    <SelectItem value="telegram" className="cursor-pointer text-xs">
                                      {t("promotions.popups.secActTelegram") || "Telegram Secondario"}
                                    </SelectItem>
                                  </SelectContent>
                                </Select>
                                <FormMessage />
                              </FormItem>
                            )}
                          />

                          <FormField
                            control={form.control}
                            name="secondary_cta_text"
                            render={({ field }) => (
                              <FormItem className="min-w-0">
                                <FormLabel className="text-xs font-bold">{t("promotions.popups.secondaryCtaText") || "Testo Pulsante Secondario"}</FormLabel>
                                <FormControl>
                                  <Input placeholder="Es. Non ora / Chat WhatsApp" {...field} value={field.value || ""} />
                                </FormControl>
                                <FormMessage />
                              </FormItem>
                            )}
                          />
                        </div>

                        {watched.secondary_cta_action_type !== "dismiss" && (
                          <FormField
                            control={form.control}
                            name="secondary_cta_url"
                            render={({ field }) => (
                              <FormItem className="min-w-0">
                                <FormLabel className="text-xs font-bold">{t("promotions.popups.secondaryCtaUrl") || "URL Pulsante Secondario"}</FormLabel>
                                <FormControl>
                                  <Input placeholder="Es. https://... o +393331234567" {...field} value={field.value || ""} />
                                </FormControl>
                                <FormMessage />
                              </FormItem>
                            )}
                          />
                        )}
                      </div>
                    )}
                  </TabsContent>

                  {/* ── TAB 3: RULES, TRIGGERS & AUDIENCE ── */}
                  <TabsContent value="rules" className="space-y-4 mt-0">
                    {/* Multi-trigger switch */}
                    <FormField
                      control={form.control}
                      name="multi_trigger"
                      render={({ field }) => (
                        <div className="flex items-center justify-between p-3.5 bg-primary/5 border border-primary/20 rounded-xl">
                          <div className="space-y-0.5 min-w-0">
                            <span className="text-xs font-bold text-foreground flex items-center gap-1.5">
                              <Sparkles className="size-3.5 text-primary shrink-0" />
                              {t("promotions.popups.multiTrigger") || "Modalità Multi-Trigger"}
                            </span>
                            <p className="text-[11px] text-muted-foreground leading-snug">
                              {t("promotions.popups.multiTriggerDesc") || "Mostra il popup non appena si verifica la prima condizione tra ritardo, scroll, uscita o inattività."}
                            </p>
                          </div>
                          <Switch
                            checked={field.value}
                            onCheckedChange={field.onChange}
                            className="cursor-pointer shrink-0 ml-3"
                          />
                        </div>
                      )}
                    />

                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                      {!watched.multi_trigger && (
                        <FormField
                          control={form.control}
                          name="trigger_type"
                          render={({ field }) => (
                            <FormItem className="min-w-0">
                              <FormLabel className="text-xs font-bold">{t("promotions.popups.triggerLabel") || "Trigger Principale"}</FormLabel>
                              <Select onValueChange={field.onChange} value={field.value}>
                                <FormControl>
                                  <SelectTrigger className="cursor-pointer text-xs w-full min-w-0 overflow-hidden [&>span]:truncate">
                                    <SelectValue placeholder={t("promotions.popups.triggerLabel")} />
                                  </SelectTrigger>
                                </FormControl>
                                <SelectContent>
                                  <SelectItem value="delay" className="cursor-pointer text-xs">
                                    {t("promotions.popups.triggerDelay") || "⏱️ Timer Ritardo (Secondi)"}
                                  </SelectItem>
                                  <SelectItem value="scroll" className="cursor-pointer text-xs">
                                    {t("promotions.popups.triggerScroll") || "📜 Percentuale di Scroll"}
                                  </SelectItem>
                                  <SelectItem value="exit_intent" className="cursor-pointer text-xs">
                                    {t("promotions.popups.triggerExitIntent") || "🚪 Exit Intent (Uscita mouse)"}
                                  </SelectItem>
                                  <SelectItem value="inactivity" className="cursor-pointer text-xs">
                                    {t("promotions.popups.triggerInactivity") || "💤 Inattività Utente"}
                                  </SelectItem>
                                  <SelectItem value="immediate" className="cursor-pointer text-xs">
                                    {t("promotions.popups.triggerImmediate") || "⚡ Subito all'apertura"}
                                  </SelectItem>
                                </SelectContent>
                              </Select>
                              <FormMessage />
                            </FormItem>
                          )}
                        />
                      )}

                      {(watched.multi_trigger || watched.trigger_type === "delay") && (
                        <FormField
                          control={form.control}
                          name="trigger_delay_seconds"
                          render={({ field }) => (
                            <FormItem className="min-w-0">
                              <FormLabel className="text-xs font-bold">{t("promotions.popups.delaySeconds") || "Ritardo in Secondi"}</FormLabel>
                              <FormControl>
                                <Input type="number" min={0} max={120} {...field} />
                              </FormControl>
                              <FormMessage />
                            </FormItem>
                          )}
                        />
                      )}

                      {(watched.multi_trigger || watched.trigger_type === "scroll") && (
                        <FormField
                          control={form.control}
                          name="trigger_scroll_percentage"
                          render={({ field }) => (
                            <FormItem className="min-w-0">
                              <FormLabel className="text-xs font-bold">{t("promotions.popups.scrollPercentage") || "Scroll Minimo (%)"}</FormLabel>
                              <FormControl>
                                <Input type="number" min={1} max={100} {...field} />
                              </FormControl>
                              <FormMessage />
                            </FormItem>
                          )}
                        />
                      )}

                      {(watched.multi_trigger || watched.trigger_type === "inactivity") && (
                        <FormField
                          control={form.control}
                          name="trigger_inactivity_seconds"
                          render={({ field }) => (
                            <FormItem className="min-w-0">
                              <FormLabel className="text-xs font-bold">{t("promotions.popups.inactivitySeconds") || "Secondi Inattività"}</FormLabel>
                              <FormControl>
                                <Input type="number" min={0} max={300} placeholder="15" {...field} />
                              </FormControl>
                              <FormMessage />
                            </FormItem>
                          )}
                        />
                      )}

                      <FormField
                        control={form.control}
                        name="frequency"
                        render={({ field }) => (
                          <FormItem className="min-w-0">
                            <FormLabel className="text-xs font-bold">{t("promotions.popups.frequencyLabel") || "Frequenza di Mostra"}</FormLabel>
                            <Select onValueChange={field.onChange} value={field.value}>
                              <FormControl>
                                <SelectTrigger className="cursor-pointer text-xs w-full min-w-0 overflow-hidden [&>span]:truncate">
                                  <SelectValue placeholder={t("promotions.popups.frequencyLabel")} />
                                </SelectTrigger>
                              </FormControl>
                              <SelectContent>
                                <SelectItem value="once_per_day" className="cursor-pointer text-xs">
                                  {t("promotions.popups.freqOncePerDay") || "1 volta ogni 24 ore"}
                                </SelectItem>
                                <SelectItem value="once_per_session" className="cursor-pointer text-xs">
                                  {t("promotions.popups.freqOncePerSession") || "1 volta per sessione"}
                                </SelectItem>
                                <SelectItem value="once_forever" className="cursor-pointer text-xs">
                                  {t("promotions.popups.freqOnceForever") || "1 sola volta per sempre"}
                                </SelectItem>
                                <SelectItem value="always" className="cursor-pointer text-xs">
                                  {t("promotions.popups.freqAlways") || "Mostra sempre a ogni ricarica"}
                                </SelectItem>
                              </SelectContent>
                            </Select>
                            <FormMessage />
                          </FormItem>
                        )}
                      />

                      <FormField
                        control={form.control}
                        name="target_devices"
                        render={({ field }) => (
                          <FormItem className="min-w-0">
                            <FormLabel className="text-xs font-bold">{t("promotions.popups.targetDevices") || "Target Dispositivi"}</FormLabel>
                            <Select onValueChange={field.onChange} value={field.value}>
                              <FormControl>
                                <SelectTrigger className="cursor-pointer text-xs w-full min-w-0 overflow-hidden [&>span]:truncate">
                                  <SelectValue placeholder="Dispositivi" />
                                </SelectTrigger>
                              </FormControl>
                              <SelectContent>
                                <SelectItem value="all" className="cursor-pointer text-xs">
                                  {t("promotions.popups.devAll") || "Tutti (Desktop + Mobile)"}
                                </SelectItem>
                                <SelectItem value="desktop_only" className="cursor-pointer text-xs">
                                  {t("promotions.popups.devDesktopOnly") || "Solo Desktop / Computer"}
                                </SelectItem>
                                <SelectItem value="mobile_only" className="cursor-pointer text-xs">
                                  {t("promotions.popups.devMobileOnly") || "Solo Smartphone / Tablet"}
                                </SelectItem>
                              </SelectContent>
                            </Select>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                    </div>

                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                      <FormField
                        control={form.control}
                        name="target_routes"
                        render={({ field }) => (
                          <FormItem className="min-w-0">
                            <FormLabel className="text-xs font-bold">{t("promotions.popups.targetRoutes") || "Pagine di Destinazione"}</FormLabel>
                            <FormControl>
                              <Input placeholder="Es. * oppure /, /corsi, /corsi/*" {...field} />
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />

                      <FormField
                        control={form.control}
                        name="target_languages"
                        render={({ field }) => (
                          <FormItem className="min-w-0">
                            <FormLabel className="text-xs font-bold">{t("promotions.popups.targetLanguages") || "Lingue del Sito"}</FormLabel>
                            <FormControl>
                              <Input placeholder="* oppure it, en" {...field} />
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                    </div>

                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-2 border-t border-border">
                      <FormField
                        control={form.control}
                        name="start_date"
                        render={({ field }) => (
                          <FormItem className="min-w-0">
                            <FormLabel className="text-xs font-bold">{t("promotions.popups.startDate") || "Data Inizio (Opzionale)"}</FormLabel>
                            <FormControl>
                              <Input type="datetime-local" {...field} value={field.value || ""} />
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                      <FormField
                        control={form.control}
                        name="end_date"
                        render={({ field }) => (
                          <FormItem className="min-w-0">
                            <FormLabel className="text-xs font-bold">{t("promotions.popups.endDate") || "Data Fine (Opzionale)"}</FormLabel>
                            <FormControl>
                              <Input type="datetime-local" {...field} value={field.value || ""} />
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                    </div>

                    <FormField
                      control={form.control}
                      name="priority"
                      render={({ field }) => (
                        <FormItem className="min-w-0">
                          <FormLabel className="text-xs font-bold">{t("promotions.popups.priorityLabel") || "Priorità di Visualizzazione"}</FormLabel>
                          <FormControl>
                            <Input type="number" min={0} max={100} {...field} />
                          </FormControl>
                          <FormDescription className="text-[11px]">
                            {t("promotions.popups.priorityHint") || "Se più popup sono attivi contemporaneamente, verrà mostrato quello con priorità più alta."}
                          </FormDescription>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                  </TabsContent>
                </Tabs>
              </form>
            </Form>
          </div>

          {/* RIGHT: LIVE INTERACTIVE PREVIEW */}
          <div className="lg:col-span-5 p-6 bg-slate-100 dark:bg-slate-950 flex flex-col items-center justify-center">
            <div className="w-full flex items-center justify-between mb-4">
              <span className="text-xs font-bold text-muted-foreground uppercase tracking-wider flex items-center gap-1.5">
                <Sparkles className="size-3.5 text-primary" /> {t("promotions.popups.previewTitle") || "Anteprima dal Vivo"}
              </span>
              <div className="flex items-center gap-1 bg-background border border-border p-0.5 rounded-lg shadow-2xs">
                <Button
                  type="button"
                  variant={previewDevice === "mobile" ? "secondary" : "ghost"}
                  size="sm"
                  onClick={() => setPreviewDevice("mobile")}
                  className="h-6 px-2 text-[10px] font-bold cursor-pointer gap-1"
                >
                  <Smartphone className="size-3" /> {t("promotions.popups.deviceMobile") || "Mobile"}
                </Button>
                <Button
                  type="button"
                  variant={previewDevice === "desktop" ? "secondary" : "ghost"}
                  size="sm"
                  onClick={() => setPreviewDevice("desktop")}
                  className="h-6 px-2 text-[10px] font-bold cursor-pointer gap-1"
                >
                  <Monitor className="size-3" /> {t("promotions.popups.deviceDesktop") || "Desktop"}
                </Button>
              </div>
            </div>

            {/* PREVIEW CONTAINER */}
            <div
              className={`w-full transition-all duration-300 ${
                previewDevice === "mobile" ? "max-w-[320px]" : "max-w-[390px]"
              }`}
            >
              <div className="relative rounded-3xl bg-white dark:bg-slate-900 shadow-2xl border border-slate-200 dark:border-slate-800 overflow-hidden text-slate-900 dark:text-white">
                {/* Fake Close Icon */}
                <div className="absolute top-3 right-3 z-10 size-6 rounded-full bg-black/40 text-white flex items-center justify-center shadow-sm">
                  <X className="size-3" />
                </div>

                {/* Preview: Image Only */}
                {watched.content_type === "image_only" && (
                  <div className="w-full bg-slate-200 dark:bg-slate-800 min-h-[200px] flex items-center justify-center overflow-hidden">
                    {watched.image_url ? (
                      <img src={watched.image_url} alt="" className="w-full h-auto object-cover" />
                    ) : (
                      <div className="p-8 text-center text-xs text-muted-foreground">
                        <ImageIcon className="size-8 mx-auto mb-2 opacity-50" />
                        {t("promotions.popups.imageLabel")}
                      </div>
                    )}
                  </div>
                )}

                {/* Preview: Combined */}
                {watched.content_type === "combined" && (
                  <div className="flex flex-col">
                    {watched.image_url ? (
                      <div className="w-full aspect-[16/9] bg-slate-100 dark:bg-slate-800 overflow-hidden">
                        <img src={watched.image_url} alt="" className="w-full h-full object-cover" />
                      </div>
                    ) : (
                      <div className="w-full aspect-[16/9] bg-primary/10 border-b border-primary/20 flex items-center justify-center text-primary/60">
                        <ImageIcon className="size-8" />
                      </div>
                    )}

                    <div className="p-5 space-y-3">
                      {watched.badge_text && (
                        <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-primary/10 text-primary border border-primary/20">
                          <Sparkles className="size-2.5" /> {watched.badge_text}
                        </span>
                      )}

                      {watched.display_title && (
                        <h4 className="text-base font-black tracking-tight leading-snug">
                          {watched.display_title}
                        </h4>
                      )}

                      {watched.display_text && (
                        <p className="text-xs text-slate-600 dark:text-slate-300 leading-relaxed whitespace-pre-line">
                          {watched.display_text}
                        </p>
                      )}

                      {/* Promo code preview */}
                      {watched.cta_action_type === "copy_promo" && watched.promo_code_to_copy && (
                        <div className="flex items-center justify-between p-2.5 rounded-xl bg-muted/60 border border-border text-xs">
                          <span className="font-mono font-bold text-primary">{watched.promo_code_to_copy}</span>
                          <span className="text-[10px] text-muted-foreground flex items-center gap-1 font-semibold">
                            <Copy className="size-3" /> Copia
                          </span>
                        </div>
                      )}

                      {watched.cta_text && (
                        <div className="pt-1 flex flex-col gap-1.5">
                          <div className="w-full py-2.5 px-3 rounded-xl bg-primary text-primary-foreground text-xs font-bold flex items-center justify-center gap-1.5 shadow-md shadow-primary/20 cursor-pointer">
                            <span>{watched.cta_text}</span>
                            {watched.cta_action_type === "whatsapp" ? (
                              <MessageCircle className="size-3.5" />
                            ) : watched.cta_action_type === "telegram" ? (
                              <Send className="size-3.5" />
                            ) : watched.cta_action_type === "copy_promo" ? (
                              <Copy className="size-3.5" />
                            ) : watched.cta_target === "_blank" ? (
                              <ExternalLink className="size-3.5" />
                            ) : (
                              <ArrowRight className="size-3.5" />
                            )}
                          </div>

                          {watched.secondary_cta_text && (
                            <span className="text-[10px] text-center text-muted-foreground py-0.5 font-medium">
                              {watched.secondary_cta_text}
                            </span>
                          )}
                        </div>
                      )}
                    </div>
                  </div>
                )}

                {/* Preview: Text Only */}
                {watched.content_type === "text_only" && (
                  <div className="p-6 space-y-3.5">
                    {watched.badge_text && (
                      <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-primary/10 text-primary border border-primary/20">
                        <Sparkles className="size-2.5" /> {watched.badge_text}
                      </span>
                    )}

                    {watched.display_title && (
                      <h4 className="text-lg font-black tracking-tight leading-snug">
                        {watched.display_title}
                      </h4>
                    )}

                    {watched.display_text && (
                      <p className="text-xs text-slate-600 dark:text-slate-300 leading-relaxed whitespace-pre-line">
                        {watched.display_text}
                      </p>
                    )}

                    {/* Promo code preview */}
                    {watched.cta_action_type === "copy_promo" && watched.promo_code_to_copy && (
                      <div className="flex items-center justify-between p-2.5 rounded-xl bg-muted/60 border border-border text-xs">
                        <span className="font-mono font-bold text-primary">{watched.promo_code_to_copy}</span>
                        <span className="text-[10px] text-muted-foreground flex items-center gap-1 font-semibold">
                          <Copy className="size-3" /> Copia
                        </span>
                      </div>
                    )}

                    {watched.cta_text && (
                      <div className="pt-2 flex flex-col gap-1.5">
                        <div className="w-full py-2.5 px-3 rounded-xl bg-primary text-primary-foreground text-xs font-bold flex items-center justify-center gap-1.5 shadow-md shadow-primary/20 cursor-pointer">
                          <span>{watched.cta_text}</span>
                          {watched.cta_action_type === "whatsapp" ? (
                            <MessageCircle className="size-3.5" />
                          ) : watched.cta_action_type === "telegram" ? (
                            <Send className="size-3.5" />
                          ) : watched.cta_action_type === "copy_promo" ? (
                            <Copy className="size-3.5" />
                          ) : watched.cta_target === "_blank" ? (
                            <ExternalLink className="size-3.5" />
                          ) : (
                            <ArrowRight className="size-3.5" />
                          )}
                        </div>

                        {watched.secondary_cta_text && (
                          <span className="text-[10px] text-center text-muted-foreground py-0.5 font-medium">
                            {watched.secondary_cta_text}
                          </span>
                        )}
                      </div>
                    )}
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>

        <DialogFooter className="p-4 border-t border-border bg-muted/20 flex items-center justify-between sm:justify-between">
          <Button
            type="button"
            variant="ghost"
            size="sm"
            onClick={() => onOpenChange(false)}
            className="cursor-pointer text-xs"
          >
            {t("common.cancel") || "Annulla"}
          </Button>
          <Button
            type="button"
            size="sm"
            onClick={form.handleSubmit(onFormSubmit)}
            className="cursor-pointer text-xs font-bold bg-primary hover:bg-primary/90 shadow-sm"
          >
            {initialData ? (t("promotions.popups.saveChanges") || "Salva Modifiche") : (t("promotions.popups.publishPopup") || "Pubblica Popup")}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
