"use client";

import * as React from "react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
  DialogDescription,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { ArrowUp, ArrowDown, RotateCcw, Check, GripVertical, type LucideIcon } from "lucide-react";
import { useTranslation } from "@/i18n/context";

export interface NavItemDef {
  id: string;
  title: string;
  url: string;
  icon?: LucideIcon;
}

interface SidebarReorderDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  groupLabel: string;
  items: NavItemDef[];
  customOrder: string[];
  onSaveOrder: (newOrder: string[]) => void;
  onResetOrder: () => void;
}

export function SidebarReorderDialog({
  open,
  onOpenChange,
  groupLabel,
  items,
  customOrder,
  onSaveOrder,
  onResetOrder,
}: SidebarReorderDialogProps) {
  const { t, locale } = useTranslation();
  const isEn = locale === "en";

  // Sort items based on customOrder or default
  const getSortedItems = React.useCallback(
    (order: string[]) => {
      const orderMap = new Map(order.map((url, idx) => [url, idx]));
      return [...items].sort((a, b) => {
        const idxA = orderMap.has(a.url) ? orderMap.get(a.url)! : 999;
        const idxB = orderMap.has(b.url) ? orderMap.get(b.url)! : 999;
        return idxA - idxB;
      });
    },
    [items]
  );

  const [currentList, setCurrentList] = React.useState<NavItemDef[]>(() =>
    getSortedItems(customOrder)
  );

  React.useEffect(() => {
    setCurrentList(getSortedItems(customOrder));
  }, [customOrder, getSortedItems, open]);

  const moveItem = (index: number, direction: "up" | "down") => {
    const targetIndex = direction === "up" ? index - 1 : index + 1;
    if (targetIndex < 0 || targetIndex >= currentList.length) return;

    const newList = [...currentList];
    const [moved] = newList.splice(index, 1);
    newList.splice(targetIndex, 0, moved);
    setCurrentList(newList);
  };

  const handleSave = () => {
    onSaveOrder(currentList.map((i) => i.url));
    onOpenChange(false);
  };

  const handleReset = () => {
    onResetOrder();
    setCurrentList(items);
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[480px] max-h-[85vh] flex flex-col">
        <DialogHeader>
          <DialogTitle className="text-lg font-bold flex items-center gap-2">
            <GripVertical className="w-5 h-5 text-primary" />
            {isEn ? `Customize Order — ${groupLabel}` : `Personalizza Ordine — ${groupLabel}`}
          </DialogTitle>
          <DialogDescription className="text-xs text-muted-foreground">
            {isEn
              ? "Move items up or down to customize your sidebar navigation."
              : "Sposta le voci in alto o in basso per personalizzare il menu laterale."}
          </DialogDescription>
        </DialogHeader>

        <div className="flex-1 overflow-y-auto pr-1 py-2 space-y-1.5 max-h-[50vh]">
          {currentList.map((item, index) => {
            const Icon = item.icon;
            const isFirst = index === 0;
            const isLast = index === currentList.length - 1;

            return (
              <div
                key={item.url}
                className="flex items-center justify-between p-2.5 bg-card hover:bg-muted/50 border border-border/70 rounded-xl transition-colors text-xs"
              >
                <div className="flex items-center gap-2.5 min-w-0 flex-1">
                  <span className="text-muted-foreground font-mono text-[11px] w-4 text-center">
                    {index + 1}
                  </span>
                  <div className="p-1.5 rounded-lg bg-muted text-foreground">
                    {Icon && <Icon className="w-4 h-4" />}
                  </div>
                  <span className="font-semibold text-foreground truncate">{item.title}</span>
                </div>

                <div className="flex items-center gap-1 shrink-0 ml-2">
                  <Button
                    type="button"
                    variant="ghost"
                    size="icon"
                    className="h-7 w-7 rounded-lg cursor-pointer"
                    disabled={isFirst}
                    onClick={() => moveItem(index, "up")}
                    title={isEn ? "Move Up" : "Sposta in alto"}
                  >
                    <ArrowUp className="w-3.5 h-3.5" />
                  </Button>
                  <Button
                    type="button"
                    variant="ghost"
                    size="icon"
                    className="h-7 w-7 rounded-lg cursor-pointer"
                    disabled={isLast}
                    onClick={() => moveItem(index, "down")}
                    title={isEn ? "Move Down" : "Sposta in basso"}
                  >
                    <ArrowDown className="w-3.5 h-3.5" />
                  </Button>
                </div>
              </div>
            );
          })}
        </div>

        <DialogFooter className="pt-2 border-t flex flex-row items-center justify-between gap-2">
          <Button
            type="button"
            variant="outline"
            size="sm"
            onClick={handleReset}
            className="gap-1.5 text-xs cursor-pointer text-muted-foreground hover:text-foreground"
          >
            <RotateCcw className="w-3.5 h-3.5" />
            {isEn ? "Reset Default" : "Ripristina"}
          </Button>

          <div className="flex items-center gap-2">
            <Button
              type="button"
              variant="outline"
              size="sm"
              onClick={() => onOpenChange(false)}
              className="text-xs cursor-pointer"
            >
              {isEn ? "Cancel" : "Annulla"}
            </Button>
            <Button
              type="button"
              size="sm"
              onClick={handleSave}
              className="gap-1.5 text-xs cursor-pointer"
            >
              <Check className="w-3.5 h-3.5" />
              {isEn ? "Save Order" : "Salva Ordine"}
            </Button>
          </div>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
