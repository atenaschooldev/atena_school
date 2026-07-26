import { useEffect, useState } from "react";
import { Search, SlidersHorizontal, Plus, X, Download } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
  CommandDialog,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
  CommandList,
} from "@/components/ui/command";
import { useAppStore } from "@/stores/app-store";
import { useNavigate } from "@tanstack/react-router";
import { Tooltip, TooltipTrigger, TooltipContent, TooltipProvider } from "@/components/ui/tooltip";

const routes = [
  { label: "Dashboard", url: "/dashboard" },
  { label: "Corsi", url: "/corsi" },
  { label: "Orari", url: "/orari" },
  { label: "Prenotazioni", url: "/prenotazioni" },
];

export function AppHeader({
  searchPlaceholder = "Cerca...",
  onNew,
  newLabel = "Aggiungi nuovo",
  leftElement,
  rightElement,
  hideSearch = false,
  tableKey,
}: {
  searchPlaceholder?: string;
  onNew?: () => void;
  newLabel?: string;
  leftElement?: React.ReactNode;
  rightElement?: React.ReactNode;
  hideSearch?: boolean;
  tableKey?: string;
}) {
  const [open, setOpen] = useState(false);
  const navigate = useNavigate();
  const tableSearch = useAppStore((s) => s.tableSearch);
  const setTableSearch = useAppStore((s) => s.setTableSearch);
  const tableActions = useAppStore((s) => s.tableActions);
  const viewMode = useAppStore((s) => s.viewMode);
  const setViewMode = useAppStore((s) => s.setViewMode);

  useEffect(() => {
    const down = (e: KeyboardEvent) => {
      if (e.key === "k" && (e.metaKey || e.ctrlKey)) {
        e.preventDefault();
        setOpen((v) => !v);
      }
    };
    document.addEventListener("keydown", down);
    return () => document.removeEventListener("keydown", down);
  }, []);

  return (
    <header className="h-16 grid grid-cols-3 items-center px-6 bg-background shrink-0 border-b border-border/40">
      {/* Colonna 1: Sinistra - Azzera filtri */}
      <div className="flex items-center justify-start min-w-0">
        {leftElement ? (
          leftElement
        ) : tableActions &&
          tableActions.clearFilters &&
          tableActions.activeFiltersColCount !== undefined &&
          tableActions.activeFiltersColCount > 0 ? (
          <Button
            variant="outline"
            size="sm"
            onClick={tableActions.clearFilters}
            className="h-10 text-xs text-destructive hover:text-destructive bg-destructive/5 hover:bg-destructive/10 border-destructive/20 hover:border-destructive/40 px-3.5 font-semibold flex items-center gap-1.5 transition-all cursor-pointer rounded-full shrink-0 shadow-sm hover:scale-105 active:scale-95 animate-in fade-in zoom-in-95 duration-200"
            title="Azzera tutti i filtri applicati alle colonne"
          >
            <X className="h-4 w-4 stroke-[2.5]" />
            <span className="hidden md:inline">
              Azzera filtri ({tableActions.activeFiltersColCount})
            </span>
          </Button>
        ) : null}
      </div>

      {/* Colonna 2: Centro - Campo di ricerca */}
      <div className="flex justify-center w-full min-w-0">
        {!hideSearch && (
          <div className="w-full max-w-lg relative flex items-center gap-3 h-10 rounded-full bg-muted/60 border border-transparent focus-within:border-primary/55 focus-within:ring-2 focus-within:ring-primary/20 focus-within:bg-background transition-all duration-200 px-4 text-sm text-muted-foreground shadow-sm">
            <Search className="h-4 w-4 text-muted-foreground/60 shrink-0" />
            <input
              type="text"
              value={tableSearch}
              onChange={(e) => setTableSearch(e.target.value)}
              placeholder={searchPlaceholder}
              className="bg-transparent border-none outline-none flex-1 text-foreground placeholder:text-muted-foreground/60 h-full text-xs"
            />
            {tableSearch ? (
              <button
                onClick={() => setTableSearch("")}
                className="hover:text-foreground text-muted-foreground/60 p-1 rounded-full transition-colors shrink-0"
                title="Cancella ricerca"
              >
                <X className="h-3.5 w-3.5" />
              </button>
            ) : (
              <kbd className="hidden md:inline-flex items-center gap-1 rounded border bg-background px-1.5 py-0.5 text-[9px] font-medium shrink-0 select-none">
                Ctrl + K
              </kbd>
            )}
          </div>
        )}
      </div>

      {/* Colonna 3: Destra - Azioni Tabella */}
      <div className="flex items-center justify-end gap-2 shrink-0 min-w-0">
        {rightElement ? (
          rightElement
        ) : (
          <>
            {tableActions ? (
              <TooltipProvider delayDuration={200}>
                <Tooltip>
                  <DropdownMenu>
                    <TooltipTrigger asChild>
                      <DropdownMenuTrigger asChild>
                        <Button
                          variant="outline"
                          size="icon"
                          className="group rounded-full h-10 w-10 border-border/60 hover:border-primary/30 hover:bg-primary/5 active:scale-95 transition-all duration-300 hover:scale-110 hover:shadow-sm"
                        >
                          <SlidersHorizontal className="h-4 w-4 transition-transform duration-300 group-hover:rotate-90 text-foreground" />
                        </Button>
                      </DropdownMenuTrigger>
                    </TooltipTrigger>
                    <DropdownMenuContent align="end" className="w-56 p-2">
                      <DropdownMenuLabel className="text-[10px] uppercase tracking-wider text-muted-foreground">
                        Visibilità Colonne
                      </DropdownMenuLabel>
                      <DropdownMenuSeparator />
                      <div className="flex flex-col gap-1">
                        {tableActions.cols.map((col) => {
                          const isVisible = !tableActions.hiddenCols.has(col.key);
                          return (
                            <label
                              key={col.key}
                              className="flex items-center gap-2 px-2 py-1.5 rounded-sm hover:bg-muted/50 cursor-pointer text-xs select-none font-medium text-foreground"
                            >
                              <Checkbox
                                checked={isVisible}
                                onCheckedChange={() => tableActions.toggleCol(col.key)}
                              />
                              <span>{col.label}</span>
                            </label>
                          );
                        })}
                      </div>
                      <DropdownMenuSeparator />
                      {tableKey && viewMode[tableKey] !== undefined && (
                        <>
                          <DropdownMenuLabel className="text-[10px] uppercase tracking-wider text-muted-foreground">
                            Visualizzazione
                          </DropdownMenuLabel>
                          <div className="flex gap-1 p-1">
                            <Button
                              variant={viewMode[tableKey] === "table" ? "secondary" : "ghost"}
                              size="sm"
                              className="flex-1 text-[11px] h-7 font-bold rounded-lg gap-1 border-0"
                              onClick={() => setViewMode(tableKey, "table")}
                            >
                              Tabella
                            </Button>
                            <Button
                              variant={viewMode[tableKey] === "cards" ? "secondary" : "ghost"}
                              size="sm"
                              className="flex-1 text-[11px] h-7 font-bold rounded-lg gap-1 border-0"
                              onClick={() => setViewMode(tableKey, "cards")}
                            >
                              Card
                            </Button>
                          </div>
                          <DropdownMenuSeparator />
                        </>
                      )}
                      <DropdownMenuItem
                        onClick={tableActions.exportToCSV}
                        className="text-xs flex items-center gap-2 cursor-pointer p-2 rounded-sm text-foreground hover:bg-muted/50"
                      >
                        <Download className="h-3.5 w-3.5 text-muted-foreground" />
                        <span>Esporta CSV</span>
                      </DropdownMenuItem>
                    </DropdownMenuContent>
                  </DropdownMenu>
                  <TooltipContent
                    side="bottom"
                    align="center"
                    className="bg-foreground text-background text-[10px] font-semibold px-2.5 py-1 rounded-md shadow-md"
                  >
                    Opzioni tabella
                  </TooltipContent>
                </Tooltip>
              </TooltipProvider>
            ) : (
              <Button
                variant="outline"
                size="icon"
                className="rounded-full h-10 w-10 border-border/20 opacity-40 cursor-not-allowed"
                disabled
              >
                <SlidersHorizontal className="h-4 w-4 text-muted-foreground/40" />
              </Button>
            )}

            {onNew && (
              <Button
                className="h-10 px-4 rounded-xl font-semibold flex items-center gap-2 shadow-md hover:shadow-lg active:scale-95 transition-all duration-300 hover:scale-105 hover:-translate-y-0.5 bg-primary hover:bg-primary/95 text-primary-foreground text-xs"
                onClick={onNew}
              >
                <Plus className="h-4 w-4 shrink-0 transition-transform duration-300 group-hover:rotate-90" />
                <span>{newLabel}</span>
              </Button>
            )}
          </>
        )}
      </div>

      <CommandDialog open={open} onOpenChange={setOpen}>
        <CommandInput placeholder="Cerca sezione, corso o prenotazione..." />
        <CommandList>
          <CommandEmpty>Nessun risultato.</CommandEmpty>
          <CommandGroup heading="Navigazione">
            {routes.map((r) => (
              <CommandItem
                key={r.url}
                onSelect={() => {
                  setOpen(false);
                  navigate({ to: r.url });
                }}
              >
                {r.label}
              </CommandItem>
            ))}
          </CommandGroup>
        </CommandList>
      </CommandDialog>
    </header>
  );
}
