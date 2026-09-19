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
import { MoreHorizontal, Edit, Trash2, Copy, Percent, Euro, Check, Calendar } from "lucide-react";
import { toast } from "sonner";
import type { PromoCodeItem } from "../types";

interface PromoColumnsProps {
  onEdit: (item: PromoCodeItem) => void;
  onDelete: (id: string) => void;
  onToggleStatus: (id: string) => void;
}

export function getPromoCodesTableColumns({
  onEdit,
  onDelete,
  onToggleStatus,
}: PromoColumnsProps): ColumnDef<PromoCodeItem>[] {
  return [
    {
      accessorKey: "code",
      header: "Codice Promo",
      cell: ({ row }) => {
        const item = row.original;
        const copyToClipboard = () => {
          navigator.clipboard.writeText(item.code);
          toast.success(`Codice "${item.code}" copiato negli appunti!`);
        };

        return (
          <div className="flex items-center gap-2">
            <span className="font-mono font-bold text-xs sm:text-sm px-2.5 py-1 rounded-lg bg-slate-100 border border-slate-200 text-slate-900 tracking-wider">
              {item.code}
            </span>
            <Button
              variant="ghost"
              size="icon"
              className="h-6 w-6 text-slate-400 hover:text-slate-700"
              onClick={copyToClipboard}
              title="Copia codice"
            >
              <Copy className="w-3.5 h-3.5" />
            </Button>
          </div>
        );
      },
    },
    {
      accessorKey: "discount_value",
      header: "Sconto Applicato",
      cell: ({ row }) => {
        const item = row.original;
        const isPercentage = Number(item.discount_type) === 1;

        return (
          <div className="flex flex-col gap-1">
            <div className="flex items-center gap-1.5">
              {isPercentage ? (
                <Badge variant="secondary" className="bg-blue-50 text-blue-700 border-blue-200 font-bold text-xs gap-1">
                  <Percent className="w-3 h-3" />
                  -{item.discount_value}%
                </Badge>
              ) : (
                <Badge variant="secondary" className="bg-emerald-50 text-emerald-700 border-emerald-200 font-bold text-xs gap-1">
                  <Euro className="w-3 h-3" />
                  -{Number(item.discount_value).toFixed(2)} €
                </Badge>
              )}
            </div>
            {item.waive_registration_fee && (
              <span className="text-[10px] text-amber-700 font-semibold bg-amber-50 border border-amber-200 px-1.5 py-0.5 rounded w-fit">
                + Quota 30€ azzerata
              </span>
            )}
          </div>
        );
      },
    },
    {
      accessorKey: "description",
      header: "Descrizione",
      cell: ({ row }) => {
        const desc = row.original.description;
        return (
          <span className="text-xs text-slate-600 line-clamp-2 max-w-[240px]">
            {desc || <span className="text-slate-400 italic">Nessuna descrizione</span>}
          </span>
        );
      },
    },
    {
      accessorKey: "used_count",
      header: "Utilizzi Effettivi",
      cell: ({ row }) => {
        const item = row.original;
        const used = item.used_count || 0;
        const max = item.max_uses;

        return (
          <div className="flex flex-col gap-1">
            <div className="flex items-center gap-1.5">
              <span className="font-mono text-xs font-bold text-slate-800">
                {used}
              </span>
              <span className="text-xs text-slate-400">
                / {max != null ? max : "∞"}
              </span>
            </div>
            {max != null && max > 0 && (
              <div className="w-20 bg-slate-100 rounded-full h-1.5 overflow-hidden">
                <div
                  className={`h-full rounded-full transition-all ${
                    used >= max ? "bg-red-500" : "bg-primary"
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
      header: "Validità",
      cell: ({ row }) => {
        const item = row.original;
        const now = new Date();
        const from = item.valid_from ? new Date(item.valid_from) : null;
        const until = item.valid_until ? new Date(item.valid_until) : null;

        const isExpired = until && until < now;
        const isFuture = from && from > now;

        if (!from && !until) {
          return <span className="text-xs text-slate-500 font-medium">Sempre valido</span>;
        }

        return (
          <div className="flex flex-col gap-0.5">
            {from && (
              <span className="text-[11px] text-slate-600 flex items-center gap-1">
                <Calendar className="w-3 h-3 text-slate-400" />
                Dal {from.toLocaleDateString("it-IT")}
              </span>
            )}
            {until && (
              <span className={`text-[11px] flex items-center gap-1 font-medium ${isExpired ? "text-red-600 font-bold" : "text-slate-600"}`}>
                <Calendar className="w-3 h-3 text-slate-400" />
                Fino al {until.toLocaleDateString("it-IT")}
              </span>
            )}
            {isExpired && (
              <Badge variant="outline" className="text-[9px] bg-red-50 text-red-700 border-red-200 w-fit">
                Scaduto
              </Badge>
            )}
            {isFuture && (
              <Badge variant="outline" className="text-[9px] bg-blue-50 text-blue-700 border-blue-200 w-fit">
                Programmato
              </Badge>
            )}
          </div>
        );
      },
    },
    {
      accessorKey: "is_active",
      header: "Stato",
      cell: ({ row }) => {
        const item = row.original;
        return (
          <div className="flex items-center gap-2">
            <Switch
              checked={item.is_active}
              onCheckedChange={() => onToggleStatus(item.id)}
            />
            <span className={`text-xs font-semibold ${item.is_active ? "text-emerald-700" : "text-slate-400"}`}>
              {item.is_active ? "Attivo" : "Disattivo"}
            </span>
          </div>
        );
      },
    },
    {
      id: "actions",
      header: "",
      cell: ({ row }) => {
        const item = row.original;
        return (
          <div className="flex justify-end">
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="ghost" className="h-8 w-8 p-0">
                  <span className="sr-only">Menu azioni</span>
                  <MoreHorizontal className="h-4 w-4" />
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end">
                <DropdownMenuItem onClick={() => onEdit(item)}>
                  <Edit className="mr-2 h-3.5 w-3.5" />
                  Modifica
                </DropdownMenuItem>
                <DropdownMenuItem
                  onClick={() => onDelete(item.id)}
                  className="text-red-600 focus:text-red-600"
                >
                  <Trash2 className="mr-2 h-3.5 w-3.5" />
                  Elimina
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          </div>
        );
      },
    },
  ];
}
