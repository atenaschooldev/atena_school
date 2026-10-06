import { type ColumnDef } from "@tanstack/react-table";
import {
  MoreHorizontal,
  Pencil,
  Trash2,
  Sparkles,
  Eye,
  Clock,
  MousePointerClick,
  Layers,
  Calendar,
  Image as ImageIcon,
  Type,
  LayoutTemplate,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Switch } from "@/components/ui/switch";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import type { MarketingPopupItem } from "@atena/api-types";

interface TableColumnsProps {
  onEdit: (item: MarketingPopupItem) => void;
  onDelete: (id: string) => void;
  onToggleStatus: (id: string) => void;
  onPreview: (item: MarketingPopupItem) => void;
  t: (key: string) => string;
}

export const getMarketingPopupsTableColumns = ({
  onEdit,
  onDelete,
  onToggleStatus,
  onPreview,
  t,
}: TableColumnsProps): ColumnDef<MarketingPopupItem>[] => [
  {
    accessorKey: "title",
    header: t("promotions.popups.campaignName") || "Campagna & Contenuto",
    cell: ({ row }) => {
      const p = row.original;
      return (
        <div className="flex items-center gap-3">
          {p.image_url ? (
            <div className="w-10 h-10 rounded-lg bg-muted border border-border overflow-hidden shrink-0 flex items-center justify-center shadow-2xs">
              <img src={p.image_url} alt="" className="w-full h-full object-cover" />
            </div>
          ) : (
            <div className="w-10 h-10 rounded-lg bg-primary/10 text-primary flex items-center justify-center shrink-0">
              <Type className="size-5" />
            </div>
          )}
          <div className="flex flex-col min-w-0">
            <div className="flex items-center gap-1.5">
              <span className="font-bold text-sm text-foreground truncate">{p.title}</span>
              {p.badge_text && (
                <Badge variant="outline" className="text-[10px] px-1.5 py-0 bg-primary/5 text-primary border-primary/20 font-bold">
                  {p.badge_text}
                </Badge>
              )}
            </div>
            <span className="text-xs text-muted-foreground truncate">
              {p.display_title || p.display_text || p.cta_text || "—"}
            </span>
          </div>
        </div>
      );
    },
  },
  {
    accessorKey: "content_type",
    header: t("promotions.popups.layoutType") || "Formato & Azione",
    cell: ({ row }) => {
      const p = row.original;
      const type = p.content_type;
      
      let actionBadge = null;
      if (p.cta_action_type === "whatsapp") {
        actionBadge = <Badge variant="outline" className="text-[10px] px-1 py-0 bg-emerald-500/10 text-emerald-600 border-emerald-500/20 gap-0.5">💬 WhatsApp</Badge>;
      } else if (p.cta_action_type === "telegram") {
        actionBadge = <Badge variant="outline" className="text-[10px] px-1 py-0 bg-sky-500/10 text-sky-600 border-sky-500/20 gap-0.5">✈️ Telegram</Badge>;
      } else if (p.cta_action_type === "copy_promo") {
        actionBadge = <Badge variant="outline" className="text-[10px] px-1 py-0 bg-amber-500/10 text-amber-600 border-amber-500/20 gap-0.5">📋 Copia Codice</Badge>;
      } else if (p.cta_action_type === "scroll_to") {
        actionBadge = <Badge variant="outline" className="text-[10px] px-1 py-0 bg-indigo-500/10 text-indigo-600 border-indigo-500/20 gap-0.5">⚓ Scroll</Badge>;
      }

      return (
        <div className="flex flex-col gap-1 items-start">
          {type === "image_only" && (
            <Badge variant="secondary" className="gap-1 text-[11px] font-semibold bg-blue-500/10 text-blue-600 dark:text-blue-400 border-blue-500/20">
              <ImageIcon className="size-3" /> {t("promotions.popups.formatImageOnly") || "Solo Immagine"}
            </Badge>
          )}
          {type === "text_only" && (
            <Badge variant="secondary" className="gap-1 text-[11px] font-semibold bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border-emerald-500/20">
              <Type className="size-3" /> {t("promotions.popups.formatTextOnly") || "Solo Testo"}
            </Badge>
          )}
          {type === "combined" && (
            <Badge variant="secondary" className="gap-1 text-[11px] font-semibold bg-purple-500/10 text-purple-600 dark:text-purple-400 border-purple-500/20">
              <LayoutTemplate className="size-3" /> {t("promotions.popups.formatCombined") || "Ibrido"}
            </Badge>
          )}
          {actionBadge}
        </div>
      );
    },
  },
  {
    accessorKey: "trigger_type",
    header: t("promotions.popups.triggerLabel") || "Trigger & Dispositivi",
    cell: ({ row }) => {
      const p = row.original;
      let triggerLabel = t("promotions.popups.triggerImmediate") || "Immediato";
      if (p.multi_trigger) triggerLabel = "⚡ Multi-Trigger";
      else if (p.trigger_type === "delay") triggerLabel = `+${p.trigger_delay_seconds || 5}s`;
      else if (p.trigger_type === "scroll") triggerLabel = `Scroll ${p.trigger_scroll_percentage || 40}%`;
      else if (p.trigger_type === "exit_intent") triggerLabel = "Exit Intent";
      else if (p.trigger_type === "inactivity") triggerLabel = `Inattività ${p.trigger_inactivity_seconds || 15}s`;

      let deviceLabel = "Tutti";
      if (p.target_devices === "desktop_only") deviceLabel = "Solo PC";
      if (p.target_devices === "mobile_only") deviceLabel = "Solo Mobile";

      return (
        <div className="flex flex-col text-xs gap-0.5">
          <span className="font-semibold text-foreground flex items-center gap-1">
            <Clock className="size-3 text-muted-foreground" /> {triggerLabel}
          </span>
          <span className="text-muted-foreground text-[11px]">
            {deviceLabel} • {p.frequency === "once_per_session" ? "1 / sessione" : p.frequency === "once_forever" ? "1x per sempre" : p.frequency === "always" ? "Sempre" : "1 / 24h"}
          </span>
        </div>
      );
    },
  },
  {
    accessorKey: "schedule",
    header: t("promotions.validity") || "Programmazione",
    cell: ({ row }) => {
      const p = row.original;
      const now = new Date().getTime();
      const start = p.start_date ? new Date(p.start_date).getTime() : null;
      const end = p.end_date ? new Date(p.end_date).getTime() : null;

      let isScheduled = start && start > now;
      let isExpired = end && end < now;

      if (isScheduled) {
        return (
          <Badge variant="outline" className="text-amber-600 bg-amber-500/10 border-amber-500/20 text-[11px]">
            {t("promotions.scheduled") || "In arrivo"}
          </Badge>
        );
      }
      if (isExpired) {
        return (
          <Badge variant="outline" className="text-rose-600 bg-rose-500/10 border-rose-500/20 text-[11px]">
            {t("promotions.expired") || "Scaduto"}
          </Badge>
        );
      }
      return (
        <span className="text-xs text-muted-foreground">
          {p.start_date || p.end_date ? (
            <span className="flex items-center gap-1">
              <Calendar className="size-3" />
              {p.end_date ? `Fino al ${new Date(p.end_date).toLocaleDateString()}` : "Attivo"}
            </span>
          ) : (
            t("promotions.alwaysValid") || "Sempre attivo"
          )}
        </span>
      );
    },
  },
  {
    accessorKey: "is_active",
    header: t("common.status") || "Stato",
    cell: ({ row }) => {
      const p = row.original;
      return (
        <div className="flex items-center gap-2">
          <Switch
            checked={p.is_active}
            onCheckedChange={() => onToggleStatus(p.id)}
            className="cursor-pointer"
          />
          <span className={`text-xs font-semibold ${p.is_active ? "text-emerald-600 dark:text-emerald-400" : "text-muted-foreground"}`}>
            {p.is_active ? (t("common.active") || "Attivo") : (t("common.inactive") || "Disattivo")}
          </span>
        </div>
      );
    },
  },
  {
    id: "actions",
    header: () => <div className="text-right">{t("common.actions") || "Azioni"}</div>,
    cell: ({ row }) => {
      const p = row.original;
      return (
        <div className="flex items-center justify-end gap-1">
          <Button
            variant="ghost"
            size="icon"
            onClick={() => onPreview(p)}
            className="h-8 w-8 text-muted-foreground hover:text-primary cursor-pointer"
            title={t("promotions.popups.previewTitle") || "Anteprima"}
          >
            <Eye className="size-4" />
          </Button>
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="ghost" size="icon" className="h-8 w-8 cursor-pointer">
                <MoreHorizontal className="size-4" />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end" className="w-44">
              <DropdownMenuLabel className="text-xs font-bold">{t("common.actions") || "Azioni"}</DropdownMenuLabel>
              <DropdownMenuSeparator />
              <DropdownMenuItem onClick={() => onPreview(p)} className="gap-2 cursor-pointer text-xs">
                <Eye className="size-3.5" /> {t("promotions.popups.previewTitle") || "Anteprima"}
              </DropdownMenuItem>
              <DropdownMenuItem onClick={() => onEdit(p)} className="gap-2 cursor-pointer text-xs">
                <Pencil className="size-3.5" /> {t("common.edit") || "Modifica"}
              </DropdownMenuItem>
              <DropdownMenuSeparator />
              <DropdownMenuItem
                onClick={() => onDelete(p.id)}
                className="gap-2 cursor-pointer text-xs text-rose-500 focus:text-rose-600 focus:bg-rose-50 dark:focus:bg-rose-950/30"
              >
                <Trash2 className="size-3.5" /> {t("common.delete") || "Elimina"}
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
      );
    },
  },
];
