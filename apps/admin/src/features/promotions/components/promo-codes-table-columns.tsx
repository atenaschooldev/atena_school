"use client";

import React from "react";
import { type ColumnDef } from "@tanstack/react-table";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Switch } from "@/components/ui/switch";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { MoreHorizontal, Edit, Trash2, Copy, Percent, Euro, Calendar, Tag } from "lucide-react";
import { toast } from "sonner";
import { DataTableColumnHeader } from "@/components/shared/data-table/data-table-column-header";
import { CellCopyableId } from "@/components/shared/cell-copyable-id";
import type { PromoCodeItem } from "../types";

interface PromoColumnsProps {
  onEdit: (item: PromoCodeItem) => void;
  onDelete: (id: string) => void;
  onToggleStatus: (id: string) => void;
  t: (k: string) => string;
}

export function getPromoCodesTableColumns({
  onEdit,
  onDelete,
  onToggleStatus,
  t,
}: PromoColumnsProps): ColumnDef<PromoCodeItem>[] {
  return [
    {
      accessorKey: "id",
      header: ({ column }) => (
        <DataTableColumnHeader column={column} title="ID" />
      ),
      cell: ({ row }) => <CellCopyableId id={row.original.id} />,
      size: 110,
    },
    {
      accessorKey: "code",
      header: ({ column }) => (
        <DataTableColumnHeader column={column} title={t("promotions.promoCode")} />
      ),
      cell: ({ row }) => {
        const item = row.original;
        const copyToClipboard = () => {
          navigator.clipboard.writeText(item.code);
          toast.success(`${t("promotions.copiedToClipboard")}: "${item.code}"`);
        };

        return (
          <div className="flex items-center gap-2">
            <Badge
              variant="outline"
              className="font-mono font-bold text-xs px-2.5 py-1 tracking-wider bg-muted/40 border-border/60 text-foreground"
            >
              {item.code}
            </Badge>
            <Button
              variant="ghost"
              size="icon"
              className="h-7 w-7 text-muted-foreground hover:text-foreground cursor-pointer rounded-lg hover:bg-muted/80"
              onClick={copyToClipboard}
              title={t("promotions.copiedToClipboard")}
            >
              <Copy className="w-3.5 h-3.5" />
            </Button>
          </div>
        );
      },
    },
    {
      accessorKey: "discount_value",
      header: ({ column }) => (
        <DataTableColumnHeader column={column} title={t("promotions.discountApplied")} />
      ),
      cell: ({ row }) => {
        const item = row.original;
        const isPercentage = Number(item.discount_type) === 1;

        return (
          <div className="flex flex-col gap-1.5">
            <div className="flex items-center gap-1.5">
              {isPercentage ? (
                <Badge
                  variant="secondary"
                  className="font-semibold text-xs gap-1 text-blue-600 bg-blue-50 dark:text-blue-400 dark:bg-blue-900/20 border border-blue-500/30"
                >
                  <Percent className="w-3 h-3" />
                  -{item.discount_value}%
                </Badge>
              ) : (
                <Badge
                  variant="secondary"
                  className="font-semibold text-xs gap-1 text-emerald-600 bg-emerald-50 dark:text-emerald-400 dark:bg-emerald-900/20 border border-emerald-500/30"
                >
                  <Euro className="w-3 h-3" />
                  -{Number(item.discount_value).toFixed(2)} €
                </Badge>
              )}
            </div>
            {item.waive_registration_fee && (
              <Badge
                variant="outline"
                className="text-[10px] text-amber-600 bg-amber-50 dark:text-amber-400 dark:bg-amber-900/20 border-amber-500/30 font-medium w-fit"
              >
                + {t("promotions.waiveRegistrationFee")}
              </Badge>
            )}
          </div>
        );
      },
    },
    {
      accessorKey: "description",
      header: ({ column }) => (
        <DataTableColumnHeader column={column} title={t("promotions.description")} />
      ),
      cell: ({ row }) => {
        const desc = row.original.description;
        return (
          <span className="text-xs text-muted-foreground line-clamp-2 max-w-[240px]">
            {desc || <span className="italic opacity-60">{t("common.noData")}</span>}
          </span>
        );
      },
    },
    {
      accessorKey: "used_count",
      header: ({ column }) => (
        <DataTableColumnHeader column={column} title={t("promotions.actualUses")} />
      ),
      cell: ({ row }) => {
        const item = row.original;
        const used = item.used_count || 0;
        const max = item.max_uses;

        return (
          <div className="flex flex-col gap-1">
            <div className="flex items-center gap-1.5">
              <span className="font-mono text-xs font-bold text-foreground">
                {used}
              </span>
              <span className="text-xs text-muted-foreground">
                / {max != null ? max : "∞"}
              </span>
            </div>
            {max != null && max > 0 && (
              <div className="w-20 bg-muted rounded-full h-1.5 overflow-hidden">
                <div
                  className={`h-full rounded-full transition-all ${
                    used >= max ? "bg-destructive" : "bg-primary"
                  }`}
                  style={{ width: `${Math.min(100, (used / max) * 100)}%` }}
                />
              </div>
            )}
          </div>
        );
      },
    },
    {
      accessorKey: "valid_until",
      header: ({ column }) => (
        <DataTableColumnHeader column={column} title={t("promotions.validity")} />
      ),
      cell: ({ row }) => {
        const item = row.original;
        const now = new Date();
        const from = item.valid_from ? new Date(item.valid_from) : null;
        const until = item.valid_until ? new Date(item.valid_until) : null;

        const isExpired = until && until < now;
        const isFuture = from && from > now;

        if (!from && !until) {
          return <span className="text-xs text-muted-foreground font-medium">{t("promotions.alwaysValid")}</span>;
        }

        return (
          <div className="flex flex-col gap-0.5">
            {from && (
              <span className="text-[11px] text-muted-foreground flex items-center gap-1">
                <Calendar className="w-3 h-3 text-muted-foreground/70" />
                {t("promotions.validFrom")} {from.toLocaleDateString()}
              </span>
            )}
            {until && (
              <span
                className={`text-[11px] flex items-center gap-1 font-medium ${
                  isExpired ? "text-rose-600 dark:text-rose-400 font-bold" : "text-muted-foreground"
                }`}
              >
                <Calendar className="w-3 h-3 text-muted-foreground/70" />
                {t("promotions.validUntil")} {until.toLocaleDateString()}
              </span>
            )}
            {isExpired && (
              <Badge
                variant="outline"
                className="text-[9px] bg-rose-50 text-rose-600 dark:bg-rose-900/20 dark:text-rose-400 border-rose-500/30 w-fit"
              >
                {t("promotions.expired")}
              </Badge>
            )}
            {isFuture && (
              <Badge
                variant="outline"
                className="text-[9px] bg-blue-50 text-blue-600 dark:bg-blue-900/20 dark:text-blue-400 border-blue-500/30 w-fit"
              >
                {t("promotions.scheduled")}
              </Badge>
            )}
          </div>
        );
      },
    },
    {
      accessorKey: "is_active",
      header: ({ column }) => (
        <DataTableColumnHeader column={column} title={t("common.status")} />
      ),
      cell: ({ row }) => {
        const item = row.original;
        return (
          <div className="flex items-center gap-2">
            <Switch
              checked={item.is_active}
              onCheckedChange={() => onToggleStatus(item.id)}
            />
            <span
              className={`text-xs font-semibold ${
                item.is_active
                  ? "text-emerald-600 dark:text-emerald-400"
                  : "text-muted-foreground"
              }`}
            >
              {item.is_active ? t("common.active") : t("common.inactive")}
            </span>
          </div>
        );
      },
    },
    {
      id: "actions",
      header: () => (
        <div className="text-right text-xs font-medium text-muted-foreground">
          {t("common.actions")}
        </div>
      ),
      enableHiding: false,
      cell: ({ row }) => {
        const item = row.original;
        return (
          <div className="flex justify-end">
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="ghost" className="h-8 w-8 p-0 cursor-pointer rounded-lg hover:bg-muted/80">
                  <span className="sr-only">{t("common.actions")}</span>
                  <MoreHorizontal className="h-4 w-4" />
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end">
                <DropdownMenuItem onClick={() => onEdit(item)} className="cursor-pointer">
                  <Edit className="mr-2 h-3.5 w-3.5" />
                  {t("common.edit")}
                </DropdownMenuItem>
                <DropdownMenuItem
                  onClick={() => onDelete(item.id)}
                  className="text-destructive focus:text-destructive cursor-pointer"
                >
                  <Trash2 className="mr-2 h-3.5 w-3.5" />
                  {t("common.delete")}
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          </div>
        );
      },
    },
  ];
}
