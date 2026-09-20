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
import { SAMPLE_PREVIEW_DATA } from "../template-preview-card";
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
} from "lucide-react";
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
  { label: string; icon: React.ComponentType<{ className?: string }>; color: string }
> = {
  header: { label: "Шапка бренда (Header)", icon: Building2, color: "text-blue-500 bg-blue-500/10" },
  greeting: { label: "Приветствие и Вводный текст", icon: FileText, color: "text-indigo-500 bg-indigo-500/10" },
  summary_table: { label: "Таблица деталей курса (Riepilogo)", icon: TableProperties, color: "text-amber-500 bg-amber-500/10" },
  cta_button: { label: "Кнопка действия (CTA)", icon: ExternalLink, color: "text-emerald-500 bg-emerald-500/10" },
  bank_details: { label: "Реквизиты IBAN / Оплата", icon: CreditCard, color: "text-green-600 bg-green-600/10" },
  school_location: { label: "Адрес филиала и WhatsApp", icon: MapPin, color: "text-orange-500 bg-orange-500/10" },
  custom_text: { label: "Пользовательский блок / Заметка", icon: HelpCircle, color: "text-purple-500 bg-purple-500/10" },
  footer: { label: "Подвал школы (Footer)", icon: Building2, color: "text-slate-500 bg-slate-500/10" },
  tg_header: { label: "Заголовок Telegram", icon: MessageSquare, color: "text-sky-500 bg-sky-500/10" },
  tg_student_info: { label: "Данные ученика / клиента", icon: FileText, color: "text-indigo-500 bg-indigo-500/10" },
  tg_course_info: { label: "Детали курса и расписание", icon: TableProperties, color: "text-amber-500 bg-amber-500/10" },
  tg_payment_info: { label: "Сумма и статус оплаты", icon: CreditCard, color: "text-emerald-500 bg-emerald-500/10" },
  tg_custom_text: { label: "Текст заметки Telegram", icon: HelpCircle, color: "text-purple-500 bg-purple-500/10" },
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
  const { attributes, listeners, setNodeRef, transform, transition, isDragging } =
    useSortable({ id: block.id });

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
    opacity: isDragging ? 0.4 : 1,
  };

  const meta = BLOCK_META[block.type] || {
    label: block.title || block.type,
    icon: Layers,
    color: "text-primary bg-primary/10",
  };
  const IconComp = meta.icon;

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
            className="p-1 rounded-md text-muted-foreground/60 hover:text-foreground hover:bg-muted cursor-grab active:cursor-grabbing transition-colors"
            title="Перетащите для изменения порядка"
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
                {block.title || meta.label}
              </span>
              {!block.is_enabled && (
                <Badge variant="secondary" className="text-[10px] py-0 px-1.5 font-normal">
                  Скрыт
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
            className="h-7 w-7 text-muted-foreground hover:text-foreground disabled:opacity-20"
            onClick={onMoveUp}
            disabled={index === 0}
            title="Переместить выше"
          >
            <ArrowUp className="h-3.5 w-3.5" />
          </Button>

          <Button
            type="button"
            variant="ghost"
            size="icon"
            className="h-7 w-7 text-muted-foreground hover:text-foreground disabled:opacity-20"
            onClick={onMoveDown}
            disabled={index === total - 1}
            title="Переместить ниже"
          >
            <ArrowDown className="h-3.5 w-3.5" />
          </Button>

          {/* Enable / Disable Switch */}
          <Switch
            checked={block.is_enabled}
            onCheckedChange={onToggleEnabled}
            className="scale-80 data-[state=checked]:bg-emerald-600"
            title={block.is_enabled ? "Скрыть блок" : "Включить блок"}
          />

          {/* Expand Settings Button */}
          <Button
            type="button"
            variant="ghost"
            size="icon"
            className={`h-7 w-7 text-muted-foreground hover:text-foreground rounded-lg transition-transform duration-200 ${
              isExpanded ? "bg-muted text-foreground" : ""
            }`}
            onClick={onToggleExpand}
            title={isExpanded ? "Свернуть" : "Настроить блок"}
          >
            {isExpanded ? <ChevronUp className="h-4 w-4" /> : <ChevronDown className="h-4 w-4" />}
          </Button>

          {/* Delete (if custom) */}
          {onDelete && (
            <Button
              type="button"
              variant="ghost"
              size="icon"
              className="h-7 w-7 text-muted-foreground hover:text-destructive"
              onClick={onDelete}
              title="Удалить блок"
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
                  { key: "show_reg_fee", label: "💶 Взнос ассоциации (€30)" },
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
                <Label className="text-[11px] font-semibold">Текст содержимого</Label>
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
              <Label className="text-[11px] font-semibold">Текст заметки (Markdown)</Label>
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

export function VisualTemplateBuilder({
  template,
  isOpen,
  onClose,
  onSave,
  onOpenTest,
  isLoading = false,
}: VisualTemplateBuilderProps) {
  if (!template) return null;

  const isEmail = template.channel === NotificationChannel.EMAIL;

  // Initialize blocks configuration
  const [blocksConfig, setBlocksConfig] = useState<TemplateBlocksConfig>(() => {
    if (template.blocks_config && template.blocks_config.blocks?.length) {
      return template.blocks_config;
    }
    return getDefaultBlocksForTemplate(template.code, template.channel);
  });

  const [expandedBlockId, setExpandedBlockId] = useState<string | null>(
    blocksConfig.blocks[0]?.id || null
  );
  const [customVars, setCustomVars] = useState<Record<string, string>>(SAMPLE_PREVIEW_DATA);
  const [activeTab, setActiveTab] = useState<string>("builder");
  const [isSaving, setIsSaving] = useState(false);

  // Sync state when template changes
  React.useEffect(() => {
    if (template) {
      if (template.blocks_config && template.blocks_config.blocks?.length) {
        setBlocksConfig(template.blocks_config);
      } else {
        setBlocksConfig(getDefaultBlocksForTemplate(template.code, template.channel));
      }
    }
  }, [template]);

  // DnD Sensors
  const sensors = useSensors(
    useSensor(PointerSensor, { activationConstraint: { distance: 5 } }),
    useSensor(KeyboardSensor, { coordinateGetter: sortableKeyboardCoordinates })
  );

  const handleDragEnd = (event: DragEndEvent) => {
    const { active, over } = event;
    if (over && active.id !== over.id) {
      setBlocksConfig((prev) => {
        const oldIndex = prev.blocks.findIndex((b) => b.id === active.id);
        const newIndex = prev.blocks.findIndex((b) => b.id === over.id);
        const reordered = arrayMove(prev.blocks, oldIndex, newIndex).map((b, idx) => ({
          ...b,
          order: idx,
        }));
        return { ...prev, blocks: reordered };
      });
      toast.info("Порядок секций обновлен");
    }
  };

  const handleMoveUp = (index: number) => {
    if (index === 0) return;
    setBlocksConfig((prev) => {
      const reordered = arrayMove(prev.blocks, index, index - 1).map((b, idx) => ({
        ...b,
        order: idx,
      }));
      return { ...prev, blocks: reordered };
    });
  };

  const handleMoveDown = (index: number) => {
    setBlocksConfig((prev) => {
      if (index >= prev.blocks.length - 1) return prev;
      const reordered = arrayMove(prev.blocks, index, index + 1).map((b, idx) => ({
        ...b,
        order: idx,
      }));
      return { ...prev, blocks: reordered };
    });
  };

  const handleToggleBlockEnabled = (id: string, enabled: boolean) => {
    setBlocksConfig((prev) => ({
      ...prev,
      blocks: prev.blocks.map((b) => (b.id === id ? { ...b, is_enabled: enabled } : b)),
    }));
  };

  const handleUpdateBlockProps = (id: string, propKey: string, val: any) => {
    setBlocksConfig((prev) => ({
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
      title: isEmail ? "Пользовательский блок" : "Заметка Telegram",
      is_enabled: true,
      order: blocksConfig.blocks.length,
      props: isEmail
        ? { box_title: "📝 Nota Aggiuntiva:", content: "Inserisci qui il testo..." }
        : { content: "📝 *Nota:*\nTesto..." },
    };

    setBlocksConfig((prev) => ({
      ...prev,
      blocks: [...prev.blocks, newBlock],
    }));
    setExpandedBlockId(newBlock.id);
    toast.success("Новый блок добавлен");
  };

  const handleDeleteBlock = (id: string) => {
    setBlocksConfig((prev) => ({
      ...prev,
      blocks: prev.blocks.filter((b) => b.id !== id),
    }));
    toast.info("Блок удален");
  };

  const handleResetToDefault = () => {
    const defaults = getDefaultBlocksForTemplate(template.code, template.channel);
    setBlocksConfig(defaults);
    setExpandedBlockId(defaults.blocks[0]?.id || null);
    toast.success("Шаблон сброшен к эталонному стандарту Atena School");
  };

  // Compile real live preview
  const liveRendered = useMemo(() => {
    if (isEmail) {
      return renderEmailFromBlocks(blocksConfig, customVars, DEFAULT_SCHOOL_PROFILE);
    }
    const compiledTg = renderTelegramFromBlocks(blocksConfig, customVars);
    return { subject: "", html: compiledTg.text };
  }, [blocksConfig, customVars, isEmail]);

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
      toast.success("Шаблон успешно сохранен в базе данных!");
      onClose();
    } catch (err: any) {
      toast.error(err?.message || "Ошибка сохранения шаблона");
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={(open) => !open && onClose()}>
      <DialogContent className="max-w-[96vw] w-[96vw] h-[94vh] flex flex-col p-0 gap-0 overflow-hidden rounded-2xl bg-background border-border/80 shadow-2xl">
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
                  <span>Конструктор: {template.name}</span>
                  <Badge variant={template.is_active ? "default" : "secondary"} className="text-xs">
                    {template.is_active ? "Attivo" : "Disattivato"}
                  </Badge>
                  <Badge variant="outline" className="font-mono text-xs">
                    {template.code}
                  </Badge>
                </DialogTitle>
                <DialogDescription className="text-xs text-muted-foreground mt-0.5">
                  Перетаскивайте блоки, меняйте тексты и настраивайте видимость секций в реальном времени.
                </DialogDescription>
              </div>
            </div>

            {/* Action Buttons */}
            <div className="flex items-center gap-2">
              <Button
                variant="outline"
                size="sm"
                className="gap-1.5 h-8 text-xs rounded-xl"
                onClick={handleResetToDefault}
                title="Сбросить к оригиналу"
              >
                <RotateCcw className="h-3.5 w-3.5" />
                <span>Сброс к оригиналу</span>
              </Button>

              <Button
                variant="outline"
                size="sm"
                className="gap-1.5 h-8 text-xs rounded-xl text-primary font-semibold"
                onClick={() => onOpenTest(template)}
              >
                <Send className="h-3.5 w-3.5" />
                <span>Invia Test</span>
              </Button>

              <Button
                variant="default"
                size="sm"
                className="gap-1.5 h-8 text-xs font-bold rounded-xl shadow-sm"
                onClick={handleSave}
                disabled={isSaving || isLoading}
              >
                <Save className="h-3.5 w-3.5" />
                <span>{isSaving ? "Salvataggio..." : "Salva Modifiche"}</span>
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
                  <TabsTrigger value="builder" className="text-xs gap-1.5 font-semibold">
                    <Layers className="h-3.5 w-3.5" />
                    <span>Блоки ({blocksConfig.blocks.length})</span>
                  </TabsTrigger>
                  <TabsTrigger value="simulator" className="text-xs gap-1.5 font-semibold">
                    <Sliders className="h-3.5 w-3.5" />
                    <span>Симулятор</span>
                  </TabsTrigger>
                </TabsList>

                {activeTab === "builder" && (
                  <Button
                    type="button"
                    variant="outline"
                    size="sm"
                    className="h-8 text-xs gap-1 rounded-lg"
                    onClick={handleAddCustomBlock}
                  >
                    <Plus className="h-3.5 w-3.5" />
                    <span>+ Блок</span>
                  </Button>
                )}
              </div>

              {/* Tab 1: Visual Blocks Constructor */}
              <TabsContent value="builder" className="flex-1 overflow-hidden m-0 p-0">
                <ScrollArea className="h-full p-4">
                  <div className="space-y-3 pb-6">
                    <p className="text-xs text-muted-foreground leading-relaxed">
                      💡 <strong>Совет:</strong> Перетаскивайте плашки за левую ручку или используйте стрелочки для изменения порядка. Клик по блоку раскрывает настройки.
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
                      <span className="text-xs font-bold text-foreground">Тестовые данные для симуляции</span>
                      <Button
                        variant="ghost"
                        size="sm"
                        className="h-6 text-[11px] text-muted-foreground hover:text-primary"
                        onClick={() => {
                          setCustomVars(SAMPLE_PREVIEW_DATA);
                          toast.success("Данные сброшены");
                        }}
                      >
                        <RotateCcw className="h-3 w-3 mr-1" />
                        Сбросить
                      </Button>
                    </div>

                    <p className="text-xs text-muted-foreground">
                      Изменяйте тестовые значения для проверки отображения в разных ситуациях:
                    </p>

                    <div className="space-y-3">
                      {[
                        { key: "purchaser_name", label: "Имя покупателя / родителя" },
                        { key: "student_name", label: "Имя ученика" },
                        { key: "course_name", label: "Название курса" },
                        { key: "total_amount", label: "Итоговая сумма (€)" },
                        { key: "registration_fee", label: "Взнос ассоциации (€)" },
                        { key: "lesson_schedule", label: "Расписание уроков" },
                        { key: "date", label: "Дата старта курса" },
                        { key: "booking_id", label: "ID бронирования" },
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
                <span>Живой рендер 1:1 (Реальный почтовый клиент / Telegram)</span>
              </div>

              <Badge variant="outline" className="text-[10px] font-mono bg-background">
                {isEmail ? "Resend HTML5 Sandbox" : "Telegram Bot Engine"}
              </Badge>
            </div>

            {/* Canvas Frame */}
            <div className="flex-1 w-full h-full min-h-0 rounded-2xl overflow-hidden border border-border/80 shadow-md bg-white text-slate-900 flex flex-col">
              {isEmail ? (
                <>
                  {/* Email Browser Bar */}
                  <div className="bg-[#043569] text-white px-3.5 py-2 flex items-center justify-between text-xs shrink-0 select-none">
                    <div className="flex items-center gap-2 truncate">
                      <div className="h-2.5 w-2.5 rounded-full bg-rose-400" />
                      <div className="h-2.5 w-2.5 rounded-full bg-amber-400" />
                      <div className="h-2.5 w-2.5 rounded-full bg-emerald-400" />
                      <span className="font-bold text-[11px] text-white ml-1 truncate">
                        {liveRendered.subject || "Atena School — Conferma Iscrizione"}
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
                      <span className="font-bold text-slate-800">Da:</span> Atena School &lt;info@atenaschool.com&gt;
                    </div>
                    <div className="text-[10px] text-slate-500 font-mono">HTML 5 • Formattato</div>
                  </div>

                  {/* Iframe View */}
                  <div className="flex-1 w-full h-full bg-[#f8fafc] overflow-hidden relative">
                    <iframe
                      srcDoc={liveRendered.html}
                      title="Email Live Preview"
                      className="w-full h-full border-0 absolute inset-0"
                      sandbox="allow-same-origin"
                    />
                  </div>
                </>
              ) : (
                /* Telegram Live Chat View */
                <div className="w-full h-full bg-gradient-to-b from-[#17212b] to-[#0e1621] text-slate-100 flex flex-col">
                  <div className="bg-[#242f3d] px-4 py-3 flex items-center justify-between border-b border-[#1f2936] text-xs shrink-0 select-none">
                    <div className="flex items-center gap-2.5">
                      <div className="h-7 w-7 rounded-full bg-gradient-to-br from-sky-400 to-blue-600 flex items-center justify-center font-bold text-xs text-white">
                        AS
                      </div>
                      <div>
                        <div className="font-bold text-xs flex items-center gap-1 text-white">
                          Atena School Bot
                          <span className="text-[9px] bg-sky-500/20 text-sky-400 px-1 py-0.2 rounded font-mono">bot</span>
                        </div>
                        <div className="text-[10px] text-slate-400">Canale Segreteria Atena</div>
                      </div>
                    </div>
                    <span className="text-xs text-sky-400 font-semibold flex items-center gap-1">
                      <MessageSquare className="h-4 w-4" /> Telegram
                    </span>
                  </div>

                  <div className="p-4 overflow-y-auto flex-1 flex flex-col justify-end space-y-2">
                    <div className="self-start max-w-[95%] bg-[#182533] border border-[#2b394a]/80 rounded-2xl rounded-tl-xs p-4 shadow-lg">
                      <div className="text-xs leading-relaxed text-slate-100 whitespace-pre-wrap font-sans space-y-1">
                        {liveRendered.html}
                      </div>
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
      </DialogContent>
    </Dialog>
  );
}
