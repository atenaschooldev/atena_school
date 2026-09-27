"use client";

import React, { useState, useMemo, useCallback } from "react";
import {
  DndContext,
  closestCenter,
  KeyboardSensor,
  PointerSensor,
  useSensor,
  useSensors,
} from "@dnd-kit/core";
import type { DragEndEvent } from "@dnd-kit/core";
import {
  arrayMove,
  SortableContext,
  sortableKeyboardCoordinates,
  verticalListSortingStrategy,
  useSortable,
} from "@dnd-kit/sortable";
import { CSS } from "@dnd-kit/utilities";
import { NotificationChannel } from "../../types";
import type {
  NotificationTemplateRecord,
  TemplateBlock,
  TemplateBlocksConfig,
  UpdateNotificationTemplateDto,
} from "../../types";
import {
  getDefaultBlocksForTemplate,
  renderEmailFromBlocks,
  renderTelegramFromBlocks,
  DEFAULT_SCHOOL_PROFILE,
} from "@atena/core";
import { useSchoolProfile } from "@/hooks/use-school-profile";
import { morphDom } from "@/utils/morph-dom";

function EmailLivePreviewIframe({ html }: { html: string }) {
  const iframeRef = React.useRef<HTMLIFrameElement>(null);
  const isInitializedRef = React.useRef(false);

  React.useEffect(() => {
    const timer = setTimeout(() => {
      const iframe = iframeRef.current;
      if (!iframe) return;

      const doc = iframe.contentDocument || iframe.contentWindow?.document;
      if (!doc) return;

      if (!isInitializedRef.current || !doc.body || !doc.head) {
        doc.open();
        doc.write(html);
        doc.close();
        isInitializedRef.current = true;
      } else {
        const scrollY = iframe.contentWindow?.scrollY ?? 0;
        const scrollX = iframe.contentWindow?.scrollX ?? 0;

        const parser = new DOMParser();
        const newDoc = parser.parseFromString(html, 'text/html');

        const oldStyle = doc.querySelector('style');
        const newStyle = newDoc.querySelector('style');
        if (newStyle && oldStyle) {
          if (oldStyle.textContent !== newStyle.textContent) {
            oldStyle.textContent = newStyle.textContent;
          }
        } else if (newStyle && !oldStyle) {
          doc.head.appendChild(newStyle.cloneNode(true));
        }

        morphDom(doc.body, newDoc.body);

        if (iframe.contentWindow && (scrollY > 0 || scrollX > 0)) {
          iframe.contentWindow.scrollTo(scrollX, scrollY);
        }
      }
    }, 80);

    return () => clearTimeout(timer);
  }, [html]);

  return (
    <iframe
      ref={iframeRef}
      title="Email Live Preview"
      className="w-full h-full border-0 absolute inset-0 bg-[#f8fafc]"
    />
  );
}

const SAMPLE_PREVIEW_DATA: Record<string, string> = {
  student_name: "Viktoria Petukhova",
  purchaser_name: "Petukhov Andrii",
  course_name: "Kids (6-7 anni)",
  amount_paid: "103.20",
  total_amount: "103.20",
  course_price: "73.20",
  registration_fee: "30.00",
  date: "2026-10-06",
  start_date: "2026-10-06",
  time: "Martedì e Giovedì 17:00-18:00",
  lesson_schedule: "Martedì e Giovedì 17:00-18:00",
  schedule_text: "Martedì e Giovedì 17:00-18:00",
  student_birth_date: "2005-12-02",
  birth_place: "Cittanova RC",
  student_birth_place: "Cittanova RC",
  student_tax_code: "PTKNDR05T02Z138X",
  purchaser_tax_code: "PTKNDR05T02Z138X",
  purchaser_email: "andrii.petukhov@gmail.com",
  purchaser_phone: "+39 333 1234567",
  email: "andrii.petukhov@gmail.com",
  phone: "+39 333 1234567",
  app_url: "https://app.atenaschool.com",
  dashboard_url: "https://app.atenaschool.com",
  admin_url: "https://admin.atenaschool.com",
  booking_id: "10bde731-f620-4e16-a240-63bb08b86d70",
  sender_name: "Andrii Petukhov",
  sender_email: "andrii.petukhov@gmail.com",
  sender_phone: "+39 333 1234567",
  interest: "Kids (6-7 anni)",
  topic: "Iscrizione Corso",
  message: "Vorrei confermare l'orario delle lezioni per il corso Kids.",
  message_body: "Vorrei confermare l'orario delle lezioni per il corso Kids.",
  payment_method: "Contanti / Saldo in Sede",
  payment_method_label: "Saldo in Sede",
  payment_status: "In attesa di saldo",
  payment_status_label: "⏳ Saldo in Sede",
};
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { Badge } from "@/components/ui/badge";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from "@/components/ui/dialog";
import {
  GripVertical,
  ChevronDown,
  ChevronUp,
  Trash2,
  Plus,
  Send,
  Save,
  RotateCcw,
  Sparkles,
  Mail,
  MessageSquare,
  Check,
  Eye,
  Sliders,
  Layers,
  HelpCircle,
  Building2,
  FileText,
  CreditCard,
  MapPin,
  ExternalLink,
  TableProperties,
  ArrowUp,
  ArrowDown,
  X,
  Smartphone,
  Monitor,
  Undo2,
  Redo2,
  Copy,
} from "lucide-react";
import { useTranslation } from "@/i18n/context";
import { toast } from "sonner";

interface VisualTemplateBuilderProps {
  template: NotificationTemplateRecord | null;
  isOpen: boolean;
  onClose: () => void;
  onSave: (id: string, dto: UpdateNotificationTemplateDto) => Promise<void>;
  onOpenTest: (template: NotificationTemplateRecord) => void;
  isLoading?: boolean;
}

// Block type metadata helper
const BLOCK_META: Record<
  string,
  { icon: React.ComponentType<{ className?: string }>; color: string; defaultLabel: string }
> = {
  header: { icon: Building2, color: "text-blue-500 bg-blue-500/10", defaultLabel: "Brand Header (Header)" },
  greeting: { icon: FileText, color: "text-indigo-500 bg-indigo-500/10", defaultLabel: "Greeting & Intro Text" },
  summary_table: { icon: TableProperties, color: "text-amber-500 bg-amber-500/10", defaultLabel: "Course Summary Table" },
  contact_summary_table: { icon: TableProperties, color: "text-amber-500 bg-amber-500/10", defaultLabel: "Contact Request Data Table" },
  cta_button: { icon: ExternalLink, color: "text-emerald-500 bg-emerald-500/10", defaultLabel: "Action Button (CTA)" },
  bank_details: { icon: CreditCard, color: "text-green-600 bg-green-600/10", defaultLabel: "Bank Details IBAN / Payment" },
  school_location: { icon: MapPin, color: "text-orange-500 bg-orange-500/10", defaultLabel: "School Location & WhatsApp" },
  custom_text: { icon: HelpCircle, color: "text-purple-500 bg-purple-500/10", defaultLabel: "Custom Block / Note" },
  footer: { icon: Building2, color: "text-slate-500 bg-slate-500/10", defaultLabel: "School Footer" },
  tg_header: { icon: MessageSquare, color: "text-sky-500 bg-sky-500/10", defaultLabel: "Telegram Header" },
  tg_student_info: { icon: FileText, color: "text-indigo-500 bg-indigo-500/10", defaultLabel: "Student & Customer Data" },
  tg_course_info: { icon: TableProperties, color: "text-amber-500 bg-amber-500/10", defaultLabel: "Course Details & Schedule" },
  tg_payment_info: { icon: CreditCard, color: "text-emerald-500 bg-emerald-500/10", defaultLabel: "Amount & Payment Status" },
  tg_custom_text: { icon: HelpCircle, color: "text-purple-500 bg-purple-500/10", defaultLabel: "Telegram Note Text" },
};

// Sortable Block Item Component
function SortableBlockItem({
  block,
  index,
  total,
  isExpanded,
  onToggleExpand,
  onToggleEnabled,
  onMoveUp,
  onMoveDown,
  onUpdateProps,
  onDelete,
  availableVariables,
}: {
  block: TemplateBlock;
  index: number;
  total: number;
  isExpanded: boolean;
  onToggleExpand: () => void;
  onToggleEnabled: (val: boolean) => void;
  onMoveUp: () => void;
  onMoveDown: () => void;
  onUpdateProps: (key: string, val: any) => void;
  onDelete?: () => void;
  availableVariables: string[];
}) {
  const { t } = useTranslation();
  const { attributes, listeners, setNodeRef, transform, transition, isDragging } =
    useSortable({ id: block.id });

  const style = {
    transform: CSS.Translate.toString(transform),
    transition,
    opacity: isDragging ? 0.4 : 1,
    zIndex: isDragging ? 50 : undefined,
  };

  const meta = BLOCK_META[block.type] || {
    icon: Layers,
    color: "text-primary bg-primary/10",
    defaultLabel: block.title || block.type,
  };
  const IconComp = meta.icon;
  const blockTitle = t(`notifications.block_${block.type}` as any) || block.title || meta.defaultLabel;

  const insertVariable = (propKey: string, varName: string) => {
    const current = block.props[propKey] || "";
    onUpdateProps(propKey, `${current} {{${varName}}}`);
  };

  return (
    <div
      ref={setNodeRef}
      style={style}
      className={`rounded-2xl border transition-all duration-200 bg-card ${
        block.is_enabled
          ? isExpanded
            ? "border-primary/50 shadow-md ring-1 ring-primary/20"
            : "border-border/80 hover:border-border shadow-xs"
          : "border-border/40 opacity-60 bg-muted/20"
      }`}
    >
      {/* Block Header Row */}
      <div className="flex items-center justify-between p-3.5 gap-2 select-none">
        <div className="flex items-center gap-2.5 min-w-0 flex-1">
          {/* Drag Handle */}
          <button
            type="button"
            {...attributes}
            {...listeners}
            className="p-1 rounded-md text-muted-foreground/60 hover:text-foreground hover:bg-muted cursor-grab active:cursor-grabbing transition-colors touch-none select-none"
            style={{ touchAction: "none" }}
            title={t("notifications.tipDrag") || "Drag to reorder"}
          >
            <GripVertical className="h-4 w-4" />
          </button>

          {/* Icon Badge */}
          <div className={`p-2 rounded-xl shrink-0 ${meta.color}`}>
            <IconComp className="h-4 w-4" />
          </div>

          {/* Title and Type */}
          <div className="min-w-0 flex-1">
            <div className="flex items-center gap-2">
              <span className="font-bold text-xs text-foreground truncate">
                {blockTitle}
              </span>
              {!block.is_enabled && (
                <Badge variant="secondary" className="text-[10px] py-0 px-1.5 font-normal">
                  {t("notifications.blockHidden") || "Nascosto"}
                </Badge>
              )}
            </div>
            <span className="text-[10px] text-muted-foreground font-mono truncate block">
              {block.type}
            </span>
          </div>
        </div>

        {/* Action Controls */}
        <div className="flex items-center gap-1.5 shrink-0">
          {/* Reorder Arrows */}
          <Button
            type="button"
            variant="ghost"
            size="icon"
            className="h-7 w-7 text-muted-foreground hover:text-foreground disabled:opacity-20 cursor-pointer"
            onClick={onMoveUp}
            disabled={index === 0}
            title={t("common.previous") || "Move up"}
          >
            <ArrowUp className="h-3.5 w-3.5" />
          </Button>

          <Button
            type="button"
            variant="ghost"
            size="icon"
            className="h-7 w-7 text-muted-foreground hover:text-foreground disabled:opacity-20 cursor-pointer"
            onClick={onMoveDown}
            disabled={index === total - 1}
            title={t("common.next") || "Move down"}
          >
            <ArrowDown className="h-3.5 w-3.5" />
          </Button>

          {/* Enable / Disable Switch */}
          <Switch
            checked={block.is_enabled}
            onCheckedChange={onToggleEnabled}
            className="scale-80 cursor-pointer data-[state=checked]:bg-emerald-600"
            title={block.is_enabled ? (t("notifications.blockHidden") || "Nascondi") : (t("common.active") || "Attiva")}
          />

          {/* Expand Settings Button */}
          <Button
            type="button"
            variant="ghost"
            size="icon"
            className={`h-7 w-7 text-muted-foreground hover:text-foreground rounded-lg transition-transform duration-200 cursor-pointer ${
              isExpanded ? "bg-muted text-foreground" : ""
            }`}
            onClick={onToggleExpand}
            title={isExpanded ? (t("common.close") || "Chiudi") : (t("common.edit") || "Modifica")}
          >
            {isExpanded ? <ChevronUp className="h-4 w-4" /> : <ChevronDown className="h-4 w-4" />}
          </Button>

          {/* Delete (if custom) */}
          {onDelete && (
            <Button
              type="button"
              variant="ghost"
              size="icon"
              className="h-7 w-7 text-muted-foreground hover:text-destructive cursor-pointer"
              onClick={onDelete}
              title={t("notifications.blockDeleted") || "Elimina"}
            >
              <Trash2 className="h-3.5 w-3.5" />
            </Button>
          )}
        </div>
      </div>

      {/* Expanded Block Settings Drawer */}
      {isExpanded && (
        <div className="px-4 pb-4 pt-1 border-t border-border/40 space-y-3.5 bg-muted/5 rounded-b-2xl animate-in fade-in-50 duration-150">
          {/* 1. Header Props */}
          {block.type === "header" && (
            <div className="space-y-3 text-xs">
              <div className="space-y-1">
                <Label className="text-[11px] font-semibold">Название школы / Бренд</Label>
                <Input
                  value={block.props.title_text || ""}
                  onChange={(e) => onUpdateProps("title_text", e.target.value)}
                  placeholder="ATENA SCHOOL"
                  className="h-8 text-xs font-medium"
                />
              </div>

              <div className="space-y-1">
                <Label className="text-[11px] font-semibold">Подзаголовок / Город</Label>
                <Input
                  value={block.props.subtitle_text || ""}
                  onChange={(e) => onUpdateProps("subtitle_text", e.target.value)}
                  placeholder="CITTANOVA • CIVITATIS ORNAMENTO"
                  className="h-8 text-xs"
                />
              </div>

              <div className="space-y-1">
                <Label className="text-[11px] font-semibold">Текст бейджа статуса</Label>
                <Input
                  value={block.props.status_text || ""}
                  onChange={(e) => onUpdateProps("status_text", e.target.value)}
                  placeholder="⏳ PRENOTAZIONE CONFERMATA - SALDO IN SEDE"
                  className="h-8 text-xs font-medium"
                />
              </div>

              <div className="flex items-center justify-between pt-1">
                <Label className="text-[11px] font-semibold">Показывать бейдж рейтинга (★ 4.9/5)</Label>
                <Switch
                  checked={block.props.show_rating !== false}
                  onCheckedChange={(val) => onUpdateProps("show_rating", val)}
                  className="scale-80"
                />
              </div>
            </div>
          )}

          {/* 2. Greeting Props */}
          {block.type === "greeting" && (
            <div className="space-y-3 text-xs">
              <div className="space-y-1">
                <div className="flex items-center justify-between">
                  <Label className="text-[11px] font-semibold">Главный заголовок обращения</Label>
                  <div className="flex gap-1">
                    {["purchaser_name", "student_name"].map((v) => (
                      <button
                        key={v}
                        type="button"
                        onClick={() => insertVariable("heading", v)}
                        className="text-[10px] font-mono px-1.5 py-0.5 rounded bg-primary/10 text-primary hover:bg-primary/20 transition-colors"
                      >
                        +{v}
                      </button>
                    ))}
                  </div>
                </div>
                <Input
                  value={block.props.heading || ""}
                  onChange={(e) => onUpdateProps("heading", e.target.value)}
                  placeholder="Grazie per la tua iscrizione, {{purchaser_name}}!"
                  className="h-8 text-xs font-semibold"
                />
              </div>

              <div className="space-y-1">
                <div className="flex items-center justify-between">
                  <Label className="text-[11px] font-semibold">Текст сообщения</Label>
                  <div className="flex gap-1">
                    {["course_name", "total_amount"].map((v) => (
                      <button
                        key={v}
                        type="button"
                        onClick={() => insertVariable("body_text", v)}
                        className="text-[10px] font-mono px-1.5 py-0.5 rounded bg-primary/10 text-primary hover:bg-primary/20 transition-colors"
                      >
                        +{v}
                      </button>
                    ))}
                  </div>
                </div>
                <Textarea
                  value={block.props.body_text || ""}
                  onChange={(e) => onUpdateProps("body_text", e.target.value)}
                  rows={3}
                  className="text-xs leading-relaxed"
                  placeholder="La tua prenotazione per il corso {{course_name}} è stata registrata..."
                />
              </div>
            </div>
          )}

          {/* 3. Summary Table Props */}
          {block.type === "summary_table" && (
            <div className="space-y-2.5 text-xs">
              <div className="space-y-1">
                <Label className="text-[11px] font-semibold">Заголовок таблицы</Label>
                <Input
                  value={block.props.table_title || ""}
                  onChange={(e) => onUpdateProps("table_title", e.target.value)}
                  placeholder="Riepilogo Iscrizione"
                  className="h-8 text-xs font-semibold"
                />
              </div>

              <Label className="text-[11px] font-semibold text-muted-foreground pt-1 block">
                Видимость строк таблицы:
              </Label>

              <div className="grid grid-cols-2 gap-2 bg-muted/30 p-2.5 rounded-xl border border-border/40">
                {[
                  { key: "show_course", label: "📚 Название курса" },
                  { key: "show_purchaser", label: "👤 Покупатель / Родитель" },
                  { key: "show_student", label: "🎓 Ученик (Allievo)" },
                  { key: "show_birth_date", label: "🎂 Дата рождения" },
                  { key: "show_birth_place", label: "📍 Место рождения" },
                  { key: "show_start_date", label: "📅 Дата старта курса" },
                  { key: "show_schedule", label: "⏰ Расписание уроков" },
                  { key: "show_reg_fee", label: "💶 Quota / Взнос ассоциации" },
                  { key: "show_total", label: "💰 Итоговая сумма" },
                ].map(({ key, label }) => (
                  <label
                    key={key}
                    className="flex items-center justify-between text-[11px] py-0.5 cursor-pointer"
                  >
                    <span className="text-foreground">{label}</span>
                    <Switch
                      checked={block.props[key] !== false}
                      onCheckedChange={(val) => onUpdateProps(key, val)}
                      className="scale-75"
                    />
                  </label>
                ))}
              </div>
            </div>
          )}

          {/* 3b. Contact Summary Table Props */}
          {block.type === "contact_summary_table" && (
            <div className="space-y-2.5 text-xs">
              <div className="space-y-1">
                <Label className="text-[11px] font-semibold">Заголовок таблицы</Label>
                <Input
                  value={block.props.table_title || ""}
                  onChange={(e) => onUpdateProps("table_title", e.target.value)}
                  placeholder="Dettagli Mittente"
                  className="h-8 text-xs font-semibold"
                />
              </div>

              <Label className="text-[11px] font-semibold text-muted-foreground pt-1 block">
                Видимость строк таблицы:
              </Label>

              <div className="grid grid-cols-2 gap-2 bg-muted/30 p-2.5 rounded-xl border border-border/40">
                {[
                  { key: "show_name", label: "👤 Имя отправителя" },
                  { key: "show_email", label: "✉️ Email отправителя" },
                  { key: "show_phone", label: "📞 Телефон" },
                  { key: "show_interest", label: "🎯 Интерес / Тема" },
                ].map(({ key, label }) => (
                  <label
                    key={key}
                    className="flex items-center justify-between text-[11px] py-0.5 cursor-pointer"
                  >
                    <span className="text-foreground">{label}</span>
                    <Switch
                      checked={block.props[key] !== false}
                      onCheckedChange={(val) => onUpdateProps(key, val)}
                      className="scale-75"
                    />
                  </label>
                ))}
              </div>
            </div>
          )}

          {/* 4. CTA Button Props */}
          {block.type === "cta_button" && (
            <div className="space-y-3 text-xs">
              <div className="space-y-1">
                <Label className="text-[11px] font-semibold">Текст на кнопке</Label>
                <Input
                  value={block.props.button_text || ""}
                  onChange={(e) => onUpdateProps("button_text", e.target.value)}
                  placeholder="Accedi al Portale Studente →"
                  className="h-8 text-xs font-bold"
                />
              </div>
              <div className="space-y-1">
                <Label className="text-[11px] font-semibold">Ссылка / URL</Label>
                <Input
                  value={block.props.button_url || ""}
                  onChange={(e) => onUpdateProps("button_url", e.target.value)}
                  placeholder="{{dashboard_url}}"
                  className="h-8 text-xs font-mono"
                />
              </div>
            </div>
          )}

          {/* 5. Bank Details Props */}
          {block.type === "bank_details" && (
            <div className="space-y-3 text-xs">
              <div className="space-y-1">
                <Label className="text-[11px] font-semibold">Заголовок блока оплаты</Label>
                <Input
                  value={block.props.box_title || ""}
                  onChange={(e) => onUpdateProps("box_title", e.target.value)}
                  placeholder="🏦 Coordinate per Saldo tramite Bonifico Bancario:"
                  className="h-8 text-xs font-semibold"
                />
              </div>
              <div className="space-y-1">
                <Label className="text-[11px] font-semibold">Инструкция / Примечание</Label>
                <Input
                  value={block.props.notes_text || ""}
                  onChange={(e) => onUpdateProps("notes_text", e.target.value)}
                  placeholder="Se preferisci saldare con bonifico prima dell'inizio..."
                  className="h-8 text-xs"
                />
              </div>
              <div className="grid grid-cols-2 gap-2 pt-1">
                {[
                  { key: "show_iban", label: "Показывать IBAN" },
                  { key: "show_bank_name", label: "Показывать Банк" },
                  { key: "show_account_holder", label: "Показывать Владельца" },
                  { key: "show_causale", label: "Генерировать назначение (Causale)" },
                ].map(({ key, label }) => (
                  <label
                    key={key}
                    className="flex items-center justify-between text-[11px] bg-muted/40 p-2 rounded-lg cursor-pointer"
                  >
                    <span>{label}</span>
                    <Switch
                      checked={block.props[key] !== false}
                      onCheckedChange={(val) => onUpdateProps(key, val)}
                      className="scale-75"
                    />
                  </label>
                ))}
              </div>
            </div>
          )}

          {/* 6. School Location Props */}
          {block.type === "school_location" && (
            <div className="space-y-3 text-xs">
              <div className="space-y-1">
                <Label className="text-[11px] font-semibold">Заголовок адреса</Label>
                <Input
                  value={block.props.box_title || ""}
                  onChange={(e) => onUpdateProps("box_title", e.target.value)}
                  placeholder="📍 Sede delle lezioni & Segreteria:"
                  className="h-8 text-xs font-semibold"
                />
              </div>
              <div className="space-y-1">
                <Label className="text-[11px] font-semibold">Дополнительное уведомление</Label>
                <Textarea
                  value={block.props.custom_notice || ""}
                  onChange={(e) => onUpdateProps("custom_notice", e.target.value)}
                  rows={2}
                  className="text-xs"
                  placeholder="Per qualsiasi variazione di orario o richiesta..."
                />
              </div>
              <div className="flex items-center justify-between pt-1">
                <Label className="text-[11px] font-semibold">Включить кнопку прямого перехода в WhatsApp</Label>
                <Switch
                  checked={block.props.show_whatsapp !== false}
                  onCheckedChange={(val) => onUpdateProps("show_whatsapp", val)}
                  className="scale-80"
                />
              </div>
            </div>
          )}

          {/* 7. Custom Text Block */}
          {block.type === "custom_text" && (
            <div className="space-y-3 text-xs">
              <div className="space-y-1">
                <Label className="text-[11px] font-semibold">Заголовок плашки (опционально)</Label>
                <Input
                  value={block.props.box_title || ""}
                  onChange={(e) => onUpdateProps("box_title", e.target.value)}
                  placeholder="💬 Messaggio / Nota:"
                  className="h-8 text-xs font-semibold"
                />
              </div>
              <div className="space-y-1">
                <div className="flex items-center justify-between">
                  <Label className="text-[11px] font-semibold">Текст содержимого</Label>
                  {availableVariables && availableVariables.length > 0 && (
                    <div className="flex flex-wrap gap-1 max-w-[280px] justify-end">
                      {availableVariables.slice(0, 5).map((v) => (
                        <button
                          key={v}
                          type="button"
                          onClick={() => insertVariable("content", v)}
                          className="text-[10px] font-mono px-1.5 py-0.5 rounded bg-primary/10 text-primary hover:bg-primary/20 transition-colors"
                        >
                          +{v}
                        </button>
                      ))}
                    </div>
                  )}
                </div>
                <Textarea
                  value={block.props.content || ""}
                  onChange={(e) => onUpdateProps("content", e.target.value)}
                  rows={3}
                  className="text-xs"
                  placeholder="Inserisci qui il testo personalizzato..."
                />
              </div>
            </div>
          )}

          {/* 8. Telegram Header */}
          {block.type === "tg_header" && (
            <div className="space-y-3 text-xs">
              <div className="space-y-1">
                <Label className="text-[11px] font-semibold">Текст шапки (Markdown)</Label>
                <Input
                  value={block.props.title_text || ""}
                  onChange={(e) => onUpdateProps("title_text", e.target.value)}
                  placeholder="🎓 *NUOVA PRENOTAZIONE CORSO*"
                  className="h-8 text-xs font-bold font-mono"
                />
              </div>
              <div className="flex items-center justify-between">
                <Label className="text-[11px] font-semibold">Разделительная линия (━━━━━)</Label>
                <Switch
                  checked={block.props.divider !== false}
                  onCheckedChange={(val) => onUpdateProps("divider", val)}
                  className="scale-80"
                />
              </div>
            </div>
          )}

          {/* 9. Telegram Student / Course / Payment Info */}
          {(block.type === "tg_student_info" ||
            block.type === "tg_course_info" ||
            block.type === "tg_payment_info") && (
            <div className="space-y-2 text-xs">
              <Label className="text-[11px] font-semibold text-muted-foreground">
                Поля для отправки в сообщении:
              </Label>
              <div className="grid grid-cols-2 gap-2 bg-muted/40 p-2.5 rounded-xl">
                {Object.keys(block.props).map((k) => (
                  <label
                    key={k}
                    className="flex items-center justify-between text-[11px] py-0.5 cursor-pointer"
                  >
                    <span className="font-mono text-[10px] text-foreground">{k}</span>
                    <Switch
                      checked={block.props[k] !== false}
                      onCheckedChange={(val) => onUpdateProps(k, val)}
                      className="scale-75"
                    />
                  </label>
                ))}
              </div>
            </div>
          )}

          {/* 10. Telegram Custom Text */}
          {block.type === "tg_custom_text" && (
            <div className="space-y-2 text-xs">
              <div className="flex items-center justify-between">
                <Label className="text-[11px] font-semibold">Текст заметки (Markdown)</Label>
                {availableVariables && availableVariables.length > 0 && (
                  <div className="flex flex-wrap gap-1 max-w-[280px] justify-end">
                    {availableVariables.slice(0, 5).map((v) => (
                      <button
                        key={v}
                        type="button"
                        onClick={() => insertVariable("content", v)}
                        className="text-[10px] font-mono px-1.5 py-0.5 rounded bg-primary/10 text-primary hover:bg-primary/20 transition-colors"
                      >
                        +{v}
                      </button>
                    ))}
                  </div>
                )}
              </div>
              <Textarea
                value={block.props.content || ""}
                onChange={(e) => onUpdateProps("content", e.target.value)}
                rows={3}
                className="text-xs font-mono"
                placeholder="💬 *Messaggio:*\n_{{message_body}}_"
              />
            </div>
          )}
        </div>
      )}
    </div>
  );
}

interface VisualTemplateBuilderContentProps {
  template: NotificationTemplateRecord;
  isOpen: boolean;
  onClose: () => void;
  onSave: (templateId: string, updates: Partial<NotificationTemplateRecord>) => Promise<any>;
  onOpenTest: (template: NotificationTemplateRecord) => void;
  isLoading?: boolean;
}

function VisualTemplateBuilderContent({
  template,
  isOpen,
  onClose,
  onSave,
  onOpenTest,
  isLoading = false,
}: VisualTemplateBuilderContentProps) {
  const { t, locale } = useTranslation();
  const isEmail = template.channel === NotificationChannel.EMAIL;

  const initialConfig = useMemo(() => {
    if (template.blocks_config && template.blocks_config.blocks?.length) {
      return template.blocks_config;
    }
    return getDefaultBlocksForTemplate(template.code, template.channel);
  }, [template]);

  // Blocks configuration with Undo/Redo history stack
  const [blocksConfig, setBlocksConfig] = useState<TemplateBlocksConfig>(initialConfig);
  const [history, setHistory] = useState<TemplateBlocksConfig[]>([initialConfig]);
  const [historyIndex, setHistoryIndex] = useState<number>(0);

  const commitConfigChange = useCallback((nextConfig: TemplateBlocksConfig | ((prev: TemplateBlocksConfig) => TemplateBlocksConfig)) => {
    setBlocksConfig((prev) => {
      const resolved = typeof nextConfig === 'function' ? nextConfig(prev) : nextConfig;
      setHistory((prevHist) => {
        const sliced = prevHist.slice(0, historyIndex + 1);
        const updated = [...sliced, resolved].slice(-30); // Keep max 30 states
        setHistoryIndex(updated.length - 1);
        return updated;
      });
      return resolved;
    });
  }, [historyIndex]);

  const canUndo = historyIndex > 0;
  const canRedo = historyIndex < history.length - 1;

  const handleUndo = useCallback(() => {
    if (!canUndo) return;
    const newIndex = historyIndex - 1;
    setHistoryIndex(newIndex);
    setBlocksConfig(history[newIndex]);
    toast.info(t("notifications.undoSuccess") || "Modifica annullata");
  }, [canUndo, historyIndex, history, t]);

  const handleRedo = useCallback(() => {
    if (!canRedo) return;
    const newIndex = historyIndex + 1;
    setHistoryIndex(newIndex);
    setBlocksConfig(history[newIndex]);
    toast.info(t("notifications.redoSuccess") || "Modifica ripristinata");
  }, [canRedo, historyIndex, history, t]);

  // Global Keyboard Shortcuts (Ctrl+Z / Cmd+Z, Ctrl+Y / Cmd+Shift+Z)
  React.useEffect(() => {
    if (!isOpen) return;

    const handleKeyDown = (e: KeyboardEvent) => {
      if ((e.metaKey || e.ctrlKey) && !e.shiftKey && e.key.toLowerCase() === 'z') {
        e.preventDefault();
        handleUndo();
      } else if (
        ((e.metaKey || e.ctrlKey) && e.shiftKey && e.key.toLowerCase() === 'z') ||
        ((e.metaKey || e.ctrlKey) && e.key.toLowerCase() === 'y')
      ) {
        e.preventDefault();
        handleRedo();
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isOpen, handleUndo, handleRedo]);

  const [expandedBlockId, setExpandedBlockId] = useState<string | null>(
    blocksConfig.blocks[0]?.id || null
  );
  const [customVars, setCustomVars] = useState<Record<string, string>>(SAMPLE_PREVIEW_DATA);
  const [activeTab, setActiveTab] = useState<string>("builder");
  const [previewDevice, setPreviewDevice] = useState<"desktop" | "mobile">("desktop");
  const [isSaving, setIsSaving] = useState(false);
  const [copiedHtml, setCopiedHtml] = useState(false);

  // DnD Sensors
  const sensors = useSensors(
    useSensor(PointerSensor, { activationConstraint: { distance: 3 } }),
    useSensor(KeyboardSensor, { coordinateGetter: sortableKeyboardCoordinates })
  );

  const handleDragEnd = (event: DragEndEvent) => {
    const { active, over } = event;
    if (over && active.id !== over.id) {
      commitConfigChange((prev) => {
        const oldIndex = prev.blocks.findIndex((b) => b.id === active.id);
        const newIndex = prev.blocks.findIndex((b) => b.id === over.id);
        if (oldIndex === -1 || newIndex === -1) return prev;
        const reordered = arrayMove(prev.blocks, oldIndex, newIndex).map((b, idx) => ({
          ...b,
          order: idx,
        }));
        return { ...prev, blocks: reordered };
      });
      toast.info(t("notifications.reorderSuccess") || "Ordine dei blocchi aggiornato");
    }
  };

  const handleMoveUp = (index: number) => {
    if (index === 0) return;
    commitConfigChange((prev) => {
      const reordered = arrayMove(prev.blocks, index, index - 1).map((b, idx) => ({
        ...b,
        order: idx,
      }));
      return { ...prev, blocks: reordered };
    });
  };

  const handleMoveDown = (index: number) => {
    commitConfigChange((prev) => {
      if (index >= prev.blocks.length - 1) return prev;
      const reordered = arrayMove(prev.blocks, index, index + 1).map((b, idx) => ({
        ...b,
        order: idx,
      }));
      return { ...prev, blocks: reordered };
    });
  };

  const handleToggleBlockEnabled = (id: string, enabled: boolean) => {
    commitConfigChange((prev) => ({
      ...prev,
      blocks: prev.blocks.map((b) => (b.id === id ? { ...b, is_enabled: enabled } : b)),
    }));
  };

  const handleUpdateBlockProps = (id: string, propKey: string, val: any) => {
    commitConfigChange((prev) => ({
      ...prev,
      blocks: prev.blocks.map((b) =>
        b.id === id ? { ...b, props: { ...b.props, [propKey]: val } } : b
      ),
    }));
  };

  const handleAddCustomBlock = () => {
    const newBlock: TemplateBlock = {
      id: `custom-${Date.now()}`,
      type: isEmail ? "custom_text" : "tg_custom_text",
      title: isEmail ? (t("notifications.customBlockTitle") || "Blocco Personalizzato") : (t("notifications.customBlockTgTitle") || "Nota Telegram"),
      is_enabled: true,
      order: blocksConfig.blocks.length,
      props: isEmail
        ? { box_title: "📝 " + (t("notifications.customBlockDefaultBox") || "Nota:"), content: t("notifications.customBlockDefaultContent") || "Inserisci qui il testo..." }
        : { content: "📝 *" + (t("notifications.customBlockDefaultBox") || "Nota:") + "*\n..." },
    };

    commitConfigChange((prev) => ({
      ...prev,
      blocks: [...prev.blocks, newBlock],
    }));
    setExpandedBlockId(newBlock.id);
    toast.success(t("notifications.newBlockAdded") || "Nuovo blocco aggiunto");
  };

  const handleDeleteBlock = (id: string) => {
    commitConfigChange((prev) => ({
      ...prev,
      blocks: prev.blocks.filter((b) => b.id !== id),
    }));
    toast.info(t("notifications.blockDeleted") || "Blocco eliminato");
  };

  const handleResetToDefault = () => {
    const defaults = getDefaultBlocksForTemplate(template.code, template.channel);
    commitConfigChange(defaults);
    setExpandedBlockId(defaults.blocks[0]?.id || null);
    toast.success(t("notifications.resetDefaultSuccess") || "Modello ripristinato allo standard originale");
  };

  const { profile } = useSchoolProfile();

  // Compile real live preview
  const liveRendered = useMemo(() => {
    if (isEmail) {
      return renderEmailFromBlocks(blocksConfig, customVars, profile || DEFAULT_SCHOOL_PROFILE);
    }
    const compiledTg = renderTelegramFromBlocks(blocksConfig, customVars);
    return { subject: "", html: compiledTg.text };
  }, [blocksConfig, customVars, isEmail, profile]);

  const handleCopyCleanHtml = useCallback(async () => {
    try {
      await navigator.clipboard.writeText(liveRendered.html);
      setCopiedHtml(true);
      toast.success(t("notifications.htmlCopied") || "Codice HTML copiato negli appunti!");
      setTimeout(() => setCopiedHtml(false), 2000);
    } catch {
      toast.error("Impossibile copiare il codice HTML");
    }
  }, [liveRendered.html, t]);


  // Save handler
  const handleSave = async () => {
    setIsSaving(true);
    try {
      await onSave(template.id, {
        name: template.name,
        description: template.description || undefined,
        blocks_config: blocksConfig,
        subject: isEmail ? liveRendered.subject : undefined,
        is_active: template.is_active,
      });
      toast.success(t("notifications.saveSuccessDb") || "Modello salvato con successo nel database!");
      onClose();
    } catch (err: any) {
      toast.error(err?.message || (t("notifications.saveError") || "Errore durante il salvataggio"));
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={(open) => !open && onClose()}>
      <DialogContent showCloseButton={false} className="sm:max-w-[96vw] max-w-[96vw] w-[96vw] h-[94vh] max-h-[94vh] flex flex-col p-0 gap-0 overflow-hidden rounded-2xl bg-background border-border/80 shadow-2xl">
        {/* Top Navigation Header */}
        <DialogHeader className="p-4 px-6 border-b bg-muted/20 shrink-0 select-none">
          <div className="flex items-center justify-between gap-4">
            <div className="flex items-center gap-3">
              <div
                className={`p-2.5 rounded-xl shadow-xs ${
                  isEmail ? "bg-primary/10 text-primary" : "bg-sky-500/10 text-sky-500"
                }`}
              >
                {isEmail ? <Mail className="h-5 w-5" /> : <MessageSquare className="h-5 w-5" />}
              </div>
              <div>
                <DialogTitle className="text-base font-bold flex items-center gap-2">
                  <span>
                    {(t("notifications.builderTitle") || "Costruttore: {name}").replace("{name}", template.name)}
                  </span>
                  <Badge variant={template.is_active ? "default" : "secondary"} className="text-xs">
                    {template.is_active ? (t("common.active") || "Attivo") : (t("common.archived") || "Disattivato")}
                  </Badge>
                  <Badge variant="outline" className="font-mono text-xs">
                    {template.code}
                  </Badge>
                </DialogTitle>
                <DialogDescription className="text-xs text-muted-foreground mt-0.5">
                  {t("notifications.builderSubtitle") || "Trascina i blocchi per riordinarli, modifica i contenuti e configura la visibilità in tempo reale."}
                </DialogDescription>
              </div>
            </div>

            {/* Action Buttons */}
            <div className="flex items-center gap-2">
              {/* Undo / Redo Toolbar */}
              <div className="flex items-center gap-1 bg-muted/50 p-0.5 rounded-xl border">
                <Button
                  type="button"
                  variant="ghost"
                  size="icon"
                  className="h-7 w-7 rounded-lg cursor-pointer text-muted-foreground hover:text-foreground disabled:opacity-30"
                  onClick={handleUndo}
                  disabled={!canUndo}
                  title="Undo (Ctrl+Z / ⌘Z)"
                >
                  <Undo2 className="h-3.5 w-3.5" />
                </Button>
                <Button
                  type="button"
                  variant="ghost"
                  size="icon"
                  className="h-7 w-7 rounded-lg cursor-pointer text-muted-foreground hover:text-foreground disabled:opacity-30"
                  onClick={handleRedo}
                  disabled={!canRedo}
                  title="Redo (Ctrl+Y / ⌘⇧Z)"
                >
                  <Redo2 className="h-3.5 w-3.5" />
                </Button>
              </div>

              <Button
                variant="outline"
                size="sm"
                className="gap-1.5 h-8 text-xs rounded-xl cursor-pointer"
                onClick={handleResetToDefault}
                title={t("notifications.resetDefault") || "Ripristina originale"}
              >
                <RotateCcw className="h-3.5 w-3.5" />
                <span>{t("notifications.resetDefault") || "Ripristina Originale"}</span>
              </Button>

              <Button
                variant="outline"
                size="sm"
                className="gap-1.5 h-8 text-xs rounded-xl text-primary font-semibold cursor-pointer"
                onClick={() => onOpenTest(template)}
              >
                <Send className="h-3.5 w-3.5" />
                <span>{t("notifications.sendTest") || "Invia Test"}</span>
              </Button>

              <Button
                variant="default"
                size="sm"
                className="gap-1.5 h-8 text-xs font-bold rounded-xl shadow-xs cursor-pointer"
                onClick={handleSave}
                disabled={isSaving || isLoading}
              >
                <Save className="h-3.5 w-3.5" />
                <span>{isSaving ? (t("notifications.savingChanges") || "Salvataggio...") : (t("notifications.saveChanges") || "Salva Modifiche")}</span>
              </Button>

              <div className="h-4 w-px bg-border mx-1" />

              <Button
                variant="ghost"
                size="icon"
                className="h-8 w-8 rounded-xl text-muted-foreground hover:text-foreground hover:bg-muted cursor-pointer"
                onClick={onClose}
                title={t("common.close") || "Chiudi"}
              >
                <X className="h-4 w-4" />
              </Button>
            </div>
          </div>
        </DialogHeader>

        {/* Split Screen Workspace */}
        <div className="grid grid-cols-1 lg:grid-cols-12 flex-1 overflow-hidden">
          {/* Left Column: Visual Block Constructor (5 cols) */}
          <div className="lg:col-span-5 border-r flex flex-col overflow-hidden bg-card">
            {/* Tabs for Blocks vs Simulator */}
            <Tabs value={activeTab} onValueChange={setActiveTab} className="flex flex-col flex-1 overflow-hidden">
              <div className="p-3 border-b bg-muted/10 shrink-0 flex items-center justify-between">
                <TabsList className="grid grid-cols-2 h-8 w-64">
                  <TabsTrigger value="builder" className="text-xs gap-1.5 font-semibold cursor-pointer">
                    <Layers className="h-3.5 w-3.5" />
                    <span>{(t("notifications.tabBlocks") || "Blocchi ({count})").replace("{count}", String(blocksConfig.blocks.length))}</span>
                  </TabsTrigger>
                  <TabsTrigger value="simulator" className="text-xs gap-1.5 font-semibold cursor-pointer">
                    <Sliders className="h-3.5 w-3.5" />
                    <span>{t("notifications.tabSimulator") || "Simulatore"}</span>
                  </TabsTrigger>
                </TabsList>

                {activeTab === "builder" && (
                  <Button
                    type="button"
                    variant="outline"
                    size="sm"
                    className="h-8 text-xs gap-1 rounded-lg cursor-pointer"
                    onClick={handleAddCustomBlock}
                  >
                    <Plus className="h-3.5 w-3.5" />
                    <span>{t("notifications.addBlock") || "+ Blocco"}</span>
                  </Button>
                )}
              </div>

              {/* Tab 1: Visual Blocks Constructor */}
              <TabsContent value="builder" className="flex-1 overflow-hidden m-0 p-0">
                <ScrollArea className="h-full p-4">
                  <div className="space-y-3 pb-6">
                    <p className="text-xs text-muted-foreground leading-relaxed">
                      {t("notifications.tipDrag") || "💡 Suggerimento: Trascina i blocchi dalla maniglia sinistra o usa le frecce per riordinarli. Fai clic su un blocco per aprirne i dettagli."}
                    </p>

                    <DndContext
                      sensors={sensors}
                      collisionDetection={closestCenter}
                      onDragEnd={handleDragEnd}
                    >
                      <SortableContext
                        items={blocksConfig.blocks.map((b) => b.id)}
                        strategy={verticalListSortingStrategy}
                      >
                        <div className="space-y-2.5">
                          {blocksConfig.blocks.map((block, idx) => (
                            <SortableBlockItem
                              key={block.id}
                              block={block}
                              index={idx}
                              total={blocksConfig.blocks.length}
                              isExpanded={expandedBlockId === block.id}
                              onToggleExpand={() =>
                                setExpandedBlockId(expandedBlockId === block.id ? null : block.id)
                              }
                              onToggleEnabled={(val) => handleToggleBlockEnabled(block.id, val)}
                              onMoveUp={() => handleMoveUp(idx)}
                              onMoveDown={() => handleMoveDown(idx)}
                              onUpdateProps={(key, val) =>
                                handleUpdateBlockProps(block.id, key, val)
                              }
                              onDelete={
                                block.id.startsWith("custom-")
                                  ? () => handleDeleteBlock(block.id)
                                  : undefined
                              }
                              availableVariables={template.available_variables || []}
                            />
                          ))}
                        </div>
                      </SortableContext>
                    </DndContext>
                  </div>
                </ScrollArea>
              </TabsContent>

              {/* Tab 2: Live Simulator Variables */}
              <TabsContent value="simulator" className="flex-1 overflow-hidden m-0 p-0">
                <ScrollArea className="h-full p-4">
                  <div className="space-y-3 pb-6">
                    <div className="flex items-center justify-between pb-1 border-b">
                      <span className="text-xs font-bold text-foreground">{t("notifications.simulatorHeading") || "Dati di simulazione di test"}</span>
                      <Button
                        variant="ghost"
                        size="sm"
                        className="h-6 text-[11px] text-muted-foreground hover:text-primary cursor-pointer"
                        onClick={() => {
                          setCustomVars(SAMPLE_PREVIEW_DATA);
                          toast.success(t("notifications.simDataReset") || "Dati di test reimpostati");
                        }}
                      >
                        <RotateCcw className="h-3 w-3 mr-1" />
                        {t("notifications.resetSimData") || "Reimposta"}
                      </Button>
                    </div>

                    <p className="text-xs text-muted-foreground">
                      {t("notifications.simulatorHint") || "Modifica i valori di prova per verificare la resa in diverse situazioni:"}
                    </p>

                    <div className="space-y-3">
                      {[
                        { key: "purchaser_name", label: "purchaser_name (Genitore/Acquirente)" },
                        { key: "student_name", label: "student_name (Studente)" },
                        { key: "course_name", label: "course_name (Corso)" },
                        { key: "total_amount", label: "total_amount (€)" },
                        { key: "registration_fee", label: "registration_fee (€)" },
                        { key: "lesson_schedule", label: "lesson_schedule (Orari)" },
                        { key: "date", label: "date (Data Inizio)" },
                        { key: "booking_id", label: "booking_id (ID)" },
                      ].map(({ key, label }) => (
                        <div key={key} className="space-y-1">
                          <div className="flex items-center justify-between">
                            <Label className="text-[11px] font-semibold">{label}</Label>
                            <span className="text-[10px] font-mono text-muted-foreground">{`{{${key}}}`}</span>
                          </div>
                          <Input
                            value={customVars[key] || ""}
                            onChange={(e) => {
                              const val = e.target.value;
                              setCustomVars((prev) => ({ ...prev, [key]: val }));
                            }}
                            className="h-8 text-xs"
                          />
                        </div>
                      ))}
                    </div>
                  </div>
                </ScrollArea>
              </TabsContent>
            </Tabs>
          </div>

          {/* Right Column: 100% Authentic Live Preview Canvas (7 cols) */}
          <div className="lg:col-span-7 bg-muted/15 p-5 flex flex-col overflow-hidden space-y-3">
            <div className="flex items-center justify-between shrink-0 select-none">
              <div className="flex items-center gap-2 text-xs font-semibold text-foreground">
                <Sparkles className="h-4 w-4 text-amber-500" />
                <span>
                  {(t("notifications.livePreviewTitle") || "Anteprima dal Vivo 1:1 ({device})")
                    .replace("{device}", previewDevice === "mobile" ? (t("notifications.previewDeviceMobile") || "Mobile 375px") : (t("notifications.previewDeviceDesktop") || "Desktop"))}
                </span>
              </div>

              <div className="flex items-center gap-2">
                <div className="flex items-center gap-0.5 bg-background p-0.5 rounded-lg border shadow-2xs">
                  <button
                    type="button"
                    onClick={() => setPreviewDevice("desktop")}
                    className={`flex items-center gap-1 px-2.5 py-1 rounded-md text-[11px] font-medium cursor-pointer transition-colors ${
                      previewDevice === "desktop"
                        ? "bg-primary text-primary-foreground font-semibold shadow-xs"
                        : "text-muted-foreground hover:text-foreground"
                    }`}
                  >
                    <Monitor className="h-3 w-3" />
                    <span>{t("notifications.previewDeviceDesktop") || "Desktop"}</span>
                  </button>
                  <button
                    type="button"
                    onClick={() => setPreviewDevice("mobile")}
                    className={`flex items-center gap-1 px-2.5 py-1 rounded-md text-[11px] font-medium cursor-pointer transition-colors ${
                      previewDevice === "mobile"
                        ? "bg-primary text-primary-foreground font-semibold shadow-xs"
                        : "text-muted-foreground hover:text-foreground"
                    }`}
                  >
                    <Smartphone className="h-3 w-3" />
                    <span>{t("notifications.previewDeviceMobile") || "Mobile (375px)"}</span>
                  </button>
                </div>

                {isEmail && (
                  <Button
                    type="button"
                    variant="outline"
                    size="sm"
                    className="h-7 text-[11px] gap-1 px-2.5 rounded-lg border bg-background hover:bg-muted text-foreground cursor-pointer"
                    onClick={handleCopyCleanHtml}
                    title={t("notifications.copyHtmlTitle") || "Copia il codice HTML pronto per l'invio"}
                  >
                    {copiedHtml ? (
                      <>
                        <Check className="h-3.5 w-3.5 text-emerald-600" />
                        <span className="text-emerald-600 font-semibold">{t("notifications.copied") || "Copiato!"}</span>
                      </>
                    ) : (
                      <>
                        <Copy className="h-3.5 w-3.5 text-muted-foreground" />
                        <span>{t("notifications.copyHtml") || "Copia HTML"}</span>
                      </>
                    )}
                  </Button>
                )}

                <Badge variant="outline" className="text-[10px] font-mono bg-background hidden sm:inline-flex">
                  {isEmail ? "Resend HTML5 Sandbox" : "Telegram Bot Engine"}
                </Badge>
              </div>
            </div>

            {/* Canvas Frame Container */}
            <div className={`flex-1 w-full h-full min-h-0 overflow-hidden flex items-center justify-center ${previewDevice === "mobile" ? "bg-muted/40 p-2" : ""}`}>
              <div
                className={`h-full min-h-0 transition-all duration-300 overflow-hidden border shadow-md bg-white text-slate-900 flex flex-col ${
                  previewDevice === "mobile"
                    ? "w-[385px] max-w-[385px] rounded-[32px] border-4 border-slate-800 shadow-2xl ring-1 ring-slate-900/10"
                    : "w-full rounded-2xl border-border/80"
                }`}
              >
              {isEmail ? (
                <>
                  {/* Email Browser Bar */}
                  <div className="bg-[#043569] text-white px-3.5 py-2 flex items-center justify-between text-xs shrink-0 select-none">
                    <div className="flex items-center gap-2 truncate">
                      <div className="h-2.5 w-2.5 rounded-full bg-rose-400" />
                      <div className="h-2.5 w-2.5 rounded-full bg-amber-400" />
                      <div className="h-2.5 w-2.5 rounded-full bg-emerald-400" />
                      <span className="font-bold text-[11px] text-white ml-1 truncate">
                        {liveRendered.subject || "Notifica — Conferma Iscrizione"}
                      </span>
                    </div>

                    <div className="flex items-center gap-1.5 text-[10px] text-sky-200 bg-white/10 px-2 py-0.5 rounded-full font-mono shrink-0">
                      <Mail className="h-3 w-3 text-[#F8861D]" />
                      <span>Resend Email</span>
                    </div>
                  </div>

                  {/* Sender Bar */}
                  <div className="bg-slate-50 border-b border-slate-200 px-3.5 py-1.5 text-[11px] flex items-center justify-between text-slate-600 shrink-0">
                    <div className="truncate">
                      <span className="font-bold text-slate-800">{t("notifications.emailFrom") || "Da:"}</span> info@scuola.com
                    </div>
                    <div className="text-[10px] text-slate-500 font-mono">{t("notifications.emailHtmlFormatted") || "HTML 5 • Formattato"}</div>
                  </div>

                  {/* Iframe View */}
                  <div className="flex-1 w-full h-full bg-[#f8fafc] overflow-hidden relative">
                    <EmailLivePreviewIframe html={liveRendered.html} />
                  </div>
                </>
              ) : (
                /* Telegram Live Chat View */
                <div className="w-full h-full bg-gradient-to-b from-[#17212b] to-[#0e1621] text-slate-100 flex flex-col">
                  <div className="bg-[#242f3d] px-4 py-3 flex items-center justify-between border-b border-[#1f2936] text-xs shrink-0 select-none">
                    <div className="flex items-center gap-2.5">
                      <div className="h-7 w-7 rounded-full bg-gradient-to-br from-sky-400 to-blue-600 flex items-center justify-center font-bold text-xs text-white">
                        TG
                      </div>
                      <div>
                        <div className="font-bold text-xs flex items-center gap-1 text-white">
                          Telegram Bot
                          <span className="text-[9px] bg-sky-500/20 text-sky-400 px-1 py-0.2 rounded font-mono">bot</span>
                        </div>
                        <div className="text-[10px] text-slate-400">Canale Segreteria</div>
                      </div>
                    </div>
                    <span className="text-xs text-sky-400 font-semibold flex items-center gap-1">
                      <MessageSquare className="h-4 w-4" /> Telegram
                    </span>
                  </div>

                  <div className="p-4 overflow-y-auto flex-1 flex flex-col justify-end space-y-2">
                    <div className="self-start max-w-[95%] bg-[#182533] border border-[#2b394a]/80 rounded-2xl rounded-tl-xs p-4 shadow-lg">
                      <div
                        className="text-xs leading-relaxed text-slate-100 whitespace-pre-wrap font-sans space-y-1 [&_b]:font-bold [&_b]:text-white [&_code]:bg-[#0f1721] [&_code]:text-sky-300 [&_code]:px-1 [&_code]:py-0.5 [&_code]:rounded [&_code]:font-mono [&_a]:text-sky-400 [&_a]:underline [&_i]:italic [&_i]:text-slate-300"
                        dangerouslySetInnerHTML={{ __html: liveRendered.html }}
                      />
                      <div className="flex items-center justify-end gap-1 mt-2 text-[10px] text-slate-400">
                        <span>Oggi 18:30</span>
                        <Check className="h-3.5 w-3.5 text-sky-400" />
                      </div>
                    </div>
                  </div>
                </div>
              )}
              </div>
            </div>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}

export function VisualTemplateBuilder(props: VisualTemplateBuilderProps) {
  if (!props.isOpen || !props.template) return null;

  return (
    <VisualTemplateBuilderContent
      key={props.template.id}
      template={props.template}
      isOpen={props.isOpen}
      onClose={props.onClose}
      onSave={props.onSave}
      onOpenTest={props.onOpenTest}
      isLoading={props.isLoading}
    />
  );
}

