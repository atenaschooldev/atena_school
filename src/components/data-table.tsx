import { useMemo, useRef, useState, useEffect, useCallback } from "react";
import { useAppStore } from "@/stores/app-store";
import { Checkbox } from "@/components/ui/checkbox";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  ContextMenu,
  ContextMenuContent,
  ContextMenuItem,
  ContextMenuSeparator,
  ContextMenuTrigger,
} from "@/components/ui/context-menu";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
  DropdownMenuSeparator,
  DropdownMenuSub,
  DropdownMenuSubTrigger,
  DropdownMenuSubContent,
  DropdownMenuPortal,
  DropdownMenuLabel,
} from "@/components/ui/dropdown-menu";
import {
  ChevronsUpDown,
  CheckCircle2,
  ChevronLeft,
  ChevronRight,
  GripVertical,
  Copy,
  Pencil,
  Trash2,
  ArrowUp,
  ArrowDown,
  Filter,
  Search,
  X,
  Check,
  Pin,
  Download,
  Eye,
  EyeOff,
  Settings2,
} from "lucide-react";
import { toast } from "sonner";

export type TableCol<T> = {
  key: string;
  label: string;
  width: number;
  render: (row: T) => React.ReactNode;
  copy: (row: T) => string;
  pinned?: boolean;
  align?: "left" | "center" | "right";
  flexGrow?: boolean;
  maxWidth?: number;

  // Filtering
  hasFilter?: boolean;
  hasSearch?: boolean;
  directFilter?: boolean; // immediately shows filters instead of options submenu
  filterOptions?:
    { value: string; label: string }[] | ((data: T[]) => { value: string; label: string }[]);
  filterFn?: (row: T, filter: { search?: string; selected?: string[] }) => boolean;

  // Sorting
  sortAscLabel?: string;
  sortDescLabel?: string;
  sortFn?: (a: T, b: T) => number;
};

type ColumnHeaderProps<T> = {
  col: TableCol<T>;
  idx: number;
  dragIdx: number | null;
  overIdx: number | null;
  setDragIdx: (idx: number | null) => void;
  setOverIdx: (idx: number | null) => void;
  setCols: React.Dispatch<React.SetStateAction<TableCol<T>[]>>;
  startResize: (idx: number, e: React.MouseEvent) => void;
  sort: { key: string; order: "asc" | "desc" } | null;
  setSort: React.Dispatch<React.SetStateAction<{ key: string; order: "asc" | "desc" } | null>>;
  filters: Record<string, { search?: string; selected?: string[] }>;
  setFilters: React.Dispatch<
    React.SetStateAction<Record<string, { search?: string; selected?: string[] }>>
  >;
  data: T[];
  pinnedOffsets: Record<string, number>;
  lastPinnedKey: string | null;
  togglePin: (key: string) => void;
  defaultCols: TableCol<T>[];
};

function ColumnHeader<T>({
  col,
  idx,
  dragIdx,
  overIdx,
  setDragIdx,
  setOverIdx,
  setCols,
  startResize,
  sort,
  setSort,
  filters,
  setFilters,
  data,
  pinnedOffsets,
  lastPinnedKey,
  togglePin,
  defaultCols,
}: ColumnHeaderProps<T>) {
  const isSorted = sort?.key === col.key;
  const colFilter = filters[col.key];
  const isFiltered =
    !!colFilter && (!!colFilter.search || (!!colFilter.selected && colFilter.selected.length > 0));

  const options = useMemo(() => {
    if (!col.hasFilter) return [];
    if (typeof col.filterOptions === "function") {
      return col.filterOptions(data);
    }
    return col.filterOptions || [];
  }, [col, data]);

  const filterState = filters[col.key] || { search: "", selected: [] };
  const [localSearch, setLocalSearch] = useState(filterState.search || "");
  const [isDragReady, setIsDragReady] = useState(false);

  // Sync state if changed externally
  useEffect(() => {
    setLocalSearch(filterState.search || "");
  }, [filterState.search]);

  const handleSearchChange = (val: string) => {
    setLocalSearch(val);
    setFilters((prev) => ({
      ...prev,
      [col.key]: {
        ...prev[col.key],
        search: val,
      },
    }));
  };

  const handleCheckboxToggle = (val: string) => {
    const currentSelected = filterState.selected ? [...filterState.selected] : [];
    const optionIdx = currentSelected.indexOf(val);
    if (optionIdx >= 0) {
      currentSelected.splice(optionIdx, 1);
    } else {
      currentSelected.push(val);
    }
    setFilters((prev) => ({
      ...prev,
      [col.key]: {
        ...prev[col.key],
        selected: currentSelected,
      },
    }));
  };

  const clearColumnFilter = () => {
    setFilters((prev) => {
      const next = { ...prev };
      delete next[col.key];
      return next;
    });
    setLocalSearch("");
  };

  const filteredOptions = useMemo(() => {
    if (!localSearch) return options;
    const term = localSearch.toLowerCase();
    return options.filter((o) => o.label.toLowerCase().includes(term));
  }, [options, localSearch]);

  const isPinned = !!col.pinned;
  const pinOffset = isPinned ? pinnedOffsets[col.key] : undefined;
  const isLastPinned = lastPinnedKey === col.key;

  return (
    <div
      draggable={isDragReady}
      onDragStart={(e) => {
        setDragIdx(idx);
        e.dataTransfer.effectAllowed = "move";
      }}
      onDragOver={(e) => {
        e.preventDefault();
        if (overIdx !== idx) setOverIdx(idx);
      }}
      onDragLeave={() => {
        if (overIdx === idx) setOverIdx(null);
      }}
      onDrop={(e) => {
        e.preventDefault();
        if (dragIdx === null || dragIdx === idx) {
          setDragIdx(null);
          setOverIdx(null);
          return;
        }
        setCols((cs) => {
          const next = [...cs];
          const draggedCol = next[dragIdx];
          const targetCol = next[idx];

          const wasPinned = draggedCol ? !!draggedCol.pinned : false;
          if (draggedCol && targetCol) {
            // Update the dragged column's pinned state to match the zone it was dropped in
            draggedCol.pinned = targetCol.pinned;
          }
          const isPinnedNow = draggedCol ? !!draggedCol.pinned : false;

          const [m] = next.splice(dragIdx, 1);
          next.splice(idx, 0, m);

          // Always ensure pinned columns are grouped at the beginning
          const pinned = next.filter((c) => c.pinned);
          const unpinned = next.filter((c) => !c.pinned);

          // If pinned state changed, sort the destination group by its defaultCols order
          if (wasPinned !== isPinnedNow) {
            const defaultKeys = defaultCols.map((c) => c.key);
            if (isPinnedNow) {
              pinned.sort((a, b) => defaultKeys.indexOf(a.key) - defaultKeys.indexOf(b.key));
            } else {
              unpinned.sort((a, b) => defaultKeys.indexOf(a.key) - defaultKeys.indexOf(b.key));
            }
          }

          return [...pinned, ...unpinned];
        });
        setDragIdx(null);
        setOverIdx(null);
      }}
      onDragEnd={() => {
        setDragIdx(null);
        setOverIdx(null);
        setIsDragReady(false);
      }}
      style={{
        width: col.width,
        flex: col.pinned
          ? `0 0 ${col.width}px`
          : col.flexGrow
            ? `1 1 ${col.width}px`
            : `0 0 ${col.width}px`,
        minWidth: `${Math.min(60, col.width)}px`,
        maxWidth: col.maxWidth !== undefined ? `${col.maxWidth}px` : undefined,
        left: pinOffset !== undefined ? pinOffset : undefined,
      }}
      className={`relative flex items-center px-3 min-w-0 group select-none h-full border-r border-primary/15
        ${isPinned ? "sticky z-20 bg-[#e8f3f2] dark:bg-[#183538]" : ""}
        ${isLastPinned ? "border-r-2 border-primary/25" : ""}
        ${overIdx === idx && dragIdx !== null && dragIdx !== idx ? "bg-primary/10" : ""}
        ${dragIdx === idx ? "opacity-50" : ""}`}
    >
      <div
        className={`flex items-center w-full h-full min-w-0 ${dragIdx !== null ? "pointer-events-none" : ""}`}
      >
        {col.width >= 80 && (
          <GripVertical
            className="h-3.5 w-3.5 opacity-30 group-hover:opacity-85 -ml-1 mr-1 shrink-0 cursor-grab active:cursor-grabbing text-muted-foreground transition-opacity duration-150"
            onMouseEnter={() => setIsDragReady(true)}
            onMouseLeave={() => {
              if (dragIdx === null) setIsDragReady(false);
            }}
          />
        )}

        <div
          className={`flex-1 min-w-0 h-full flex items-center relative ${col.align === "center" ? "justify-center" : col.align === "right" ? "justify-end" : "justify-between"}`}
        >
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <div
                role="button"
                tabIndex={0}
                title={col.label}
                className={`flex-1 min-w-0 flex items-center focus:outline-none cursor-pointer py-1.5 h-full select-none
                  ${col.align === "center" ? "justify-center text-center" : col.align === "right" ? "justify-end text-right" : "justify-between text-left"}
                  ${isSorted || isFiltered ? "text-primary font-bold" : "text-muted-foreground/95"}
                  ${isFiltered ? "pr-6" : ""}`}
                onClick={(e) => e.stopPropagation()}
                onKeyDown={(e) => {
                  if (e.key === "Enter" || e.key === " ") {
                    e.preventDefault();
                    e.currentTarget.click();
                  }
                }}
              >
                {col.align === "center" || col.align === "right" ? (
                  <div className="flex items-center gap-1.5 min-w-0">
                    <span className="text-[10px] font-semibold uppercase tracking-[0.14em] truncate">
                      {col.label}
                    </span>
                    {isFiltered && (
                      <Filter className="h-2.5 w-2.5 text-primary fill-primary/10 shrink-0" />
                    )}
                    <span className="shrink-0">
                      {isSorted ? (
                        sort.order === "asc" ? (
                          <ArrowUp className="h-3 w-3 text-primary animate-in fade-in duration-200" />
                        ) : (
                          <ArrowDown className="h-3 w-3 text-primary animate-in fade-in duration-200" />
                        )
                      ) : (
                        col.width >= 80 && (
                          <ChevronsUpDown className="h-3 w-3 opacity-40 group-hover:opacity-80 transition-opacity" />
                        )
                      )}
                    </span>
                  </div>
                ) : (
                  <>
                    <span className="text-[10px] font-semibold uppercase tracking-[0.14em] truncate flex items-center gap-1 min-w-0">
                      <span className="truncate">{col.label}</span>
                      {isFiltered && (
                        <Filter className="h-2.5 w-2.5 text-primary fill-primary/10 shrink-0" />
                      )}
                    </span>
                    <span className="shrink-0 ml-1">
                      {isSorted ? (
                        sort.order === "asc" ? (
                          <ArrowUp className="h-3 w-3 text-primary animate-in fade-in duration-200" />
                        ) : (
                          <ArrowDown className="h-3 w-3 text-primary animate-in fade-in duration-200" />
                        )
                      ) : (
                        col.width >= 80 && (
                          <ChevronsUpDown className="h-3 w-3 opacity-40 group-hover:opacity-80 transition-opacity" />
                        )
                      )}
                    </span>
                  </>
                )}
              </div>
            </DropdownMenuTrigger>

            {col.directFilter ? (
              <DropdownMenuContent
                align="start"
                className="w-64 p-2"
                onClick={(e) => e.stopPropagation()}
              >
                <div className="flex flex-col gap-2">
                  <div className="text-[10px] font-semibold uppercase tracking-wider text-muted-foreground px-1 py-0.5 flex items-center justify-between">
                    <span>Filtri {col.label}</span>
                    {isFiltered && (
                      <button
                        onClick={clearColumnFilter}
                        className="text-destructive hover:underline capitalize font-medium cursor-pointer"
                      >
                        Azzera
                      </button>
                    )}
                  </div>

                  <div className="flex items-center justify-between px-1 border-b border-border/40 pb-1.5 mb-1 bg-muted/20 rounded-sm p-1">
                    <span className="text-[10px] font-semibold text-muted-foreground">
                      Posizione
                    </span>
                    <button
                      onClick={() => togglePin(col.key)}
                      className="text-xs hover:underline flex items-center gap-1 cursor-pointer text-primary font-semibold"
                    >
                      <Pin
                        className={`h-3 w-3 ${col.pinned ? "rotate-45 text-primary fill-primary/10" : ""}`}
                      />
                      <span>{col.pinned ? "Sblocca colonna" : "Blocca colonna"}</span>
                    </button>
                  </div>

                  {col.hasSearch && (
                    <div className="relative" onClick={(e) => e.stopPropagation()}>
                      <Search className="absolute left-2 top-2.5 h-3 w-3 text-muted-foreground/70" />
                      <Input
                        placeholder="Cerca..."
                        value={localSearch}
                        onChange={(e) => handleSearchChange(e.target.value)}
                        className="h-7 pl-7 pr-7 text-xs bg-muted/40 focus-visible:ring-1"
                      />
                      {localSearch && (
                        <button
                          onClick={() => handleSearchChange("")}
                          className="absolute right-2 top-2 hover:text-foreground text-muted-foreground/60"
                        >
                          <X className="h-3 w-3" />
                        </button>
                      )}
                    </div>
                  )}

                  <div className="max-h-48 overflow-y-auto scrollbar-none flex flex-col gap-1 py-1 pr-1 border-t border-border/40 mt-1">
                    {filteredOptions.length === 0 ? (
                      <span className="text-[11px] text-muted-foreground text-center py-2">
                        Nessun valore trovato
                      </span>
                    ) : (
                      filteredOptions.map((opt) => {
                        const isChecked = filterState.selected?.includes(opt.value) || false;
                        return (
                          <div
                            key={opt.value}
                            className="flex items-center gap-2 px-2 py-1.5 rounded-sm hover:bg-muted/50 cursor-pointer text-xs select-none transition-colors"
                            onClick={(e) => {
                              e.stopPropagation();
                              handleCheckboxToggle(opt.value);
                            }}
                          >
                            <Checkbox
                              checked={isChecked}
                              onCheckedChange={() => {}}
                              className="pointer-events-none"
                            />
                            <span className="truncate font-medium text-foreground">
                              {opt.label}
                            </span>
                          </div>
                        );
                      })
                    )}
                  </div>
                </div>
              </DropdownMenuContent>
            ) : (
              <DropdownMenuContent
                align="start"
                className="w-56"
                onClick={(e) => e.stopPropagation()}
              >
                <DropdownMenuLabel className="text-[10px] uppercase tracking-wider text-muted-foreground">
                  Opzioni colonna
                </DropdownMenuLabel>
                <DropdownMenuSeparator />

                <DropdownMenuItem
                  className="text-xs cursor-pointer flex items-center gap-2"
                  onClick={() => togglePin(col.key)}
                >
                  <Pin
                    className={`h-3.5 w-3.5 opacity-60 ${col.pinned ? "rotate-45 text-primary fill-primary/10" : ""}`}
                  />
                  <span>{col.pinned ? "Sblocca colonna" : "Blocca colonna"}</span>
                </DropdownMenuItem>
                <DropdownMenuSeparator />

                {/* Sorting choices */}
                {col.sortAscLabel && (
                  <>
                    <DropdownMenuItem
                      className="text-xs cursor-pointer flex items-center gap-2"
                      onClick={() => setSort({ key: col.key, order: "asc" })}
                    >
                      <ArrowUp className="h-3.5 w-3.5 opacity-60" />
                      <span>{col.sortAscLabel}</span>
                      {isSorted && sort.order === "asc" && (
                        <Check className="h-3.5 w-3.5 ml-auto text-primary" />
                      )}
                    </DropdownMenuItem>
                    <DropdownMenuItem
                      className="text-xs cursor-pointer flex items-center gap-2"
                      onClick={() => setSort({ key: col.key, order: "desc" })}
                    >
                      <ArrowDown className="h-3.5 w-3.5 opacity-60" />
                      <span>{col.sortDescLabel}</span>
                      {isSorted && sort.order === "desc" && (
                        <Check className="h-3.5 w-3.5 ml-auto text-primary" />
                      )}
                    </DropdownMenuItem>
                    {(col.hasFilter || isSorted) && <DropdownMenuSeparator />}
                  </>
                )}

                {/* Filtering choice */}
                {col.hasFilter && (
                  <DropdownMenuSub>
                    <DropdownMenuSubTrigger
                      className="text-xs cursor-pointer flex items-center gap-2"
                      onSelect={(e) => e.preventDefault()}
                    >
                      <Filter className="h-3.5 w-3.5 opacity-60" />
                      <span>Filtra per valore</span>
                      {isFiltered && (
                        <span className="ml-auto text-[10px] bg-primary/15 text-primary px-1.5 py-0.5 rounded-full font-semibold">
                          Attivo
                        </span>
                      )}
                    </DropdownMenuSubTrigger>
                    <DropdownMenuPortal>
                      <DropdownMenuSubContent
                        className="w-64 p-2"
                        onClick={(e) => e.stopPropagation()}
                      >
                        <div className="flex flex-col gap-2">
                          <div className="text-[10px] font-semibold uppercase tracking-wider text-muted-foreground px-1 py-0.5 flex items-center justify-between">
                            <span>Filtri {col.label}</span>
                            {isFiltered && (
                              <button
                                onClick={clearColumnFilter}
                                className="text-destructive hover:underline capitalize font-medium cursor-pointer"
                              >
                                Azzera
                              </button>
                            )}
                          </div>

                          {col.hasSearch && (
                            <div className="relative" onClick={(e) => e.stopPropagation()}>
                              <Search className="absolute left-2 top-2.5 h-3 w-3 text-muted-foreground/70" />
                              <Input
                                placeholder="Cerca..."
                                value={localSearch}
                                onChange={(e) => handleSearchChange(e.target.value)}
                                className="h-7 pl-7 pr-7 text-xs bg-muted/40 focus-visible:ring-1"
                              />
                              {localSearch && (
                                <button
                                  onClick={() => handleSearchChange("")}
                                  className="absolute right-2 top-2 hover:text-foreground text-muted-foreground/60"
                                >
                                  <X className="h-3 w-3" />
                                </button>
                              )}
                            </div>
                          )}

                          <div className="max-h-48 overflow-y-auto scrollbar-none flex flex-col gap-1 py-1 pr-1 border-t border-border/40 mt-1">
                            {filteredOptions.length === 0 ? (
                              <span className="text-[11px] text-muted-foreground text-center py-2">
                                Nessun valore trovato
                              </span>
                            ) : (
                              filteredOptions.map((opt) => {
                                const isChecked =
                                  filterState.selected?.includes(opt.value) || false;
                                return (
                                  <div
                                    key={opt.value}
                                    className="flex items-center gap-2 px-2 py-1.5 rounded-sm hover:bg-muted/50 cursor-pointer text-xs select-none transition-colors"
                                    onClick={(e) => {
                                      e.stopPropagation();
                                      handleCheckboxToggle(opt.value);
                                    }}
                                  >
                                    <Checkbox
                                      checked={isChecked}
                                      onCheckedChange={() => {}}
                                      className="pointer-events-none"
                                    />
                                    <span className="truncate font-medium text-foreground text-left">
                                      {opt.label}
                                    </span>
                                  </div>
                                );
                              })
                            )}
                          </div>
                        </div>
                      </DropdownMenuSubContent>
                    </DropdownMenuPortal>
                  </DropdownMenuSub>
                )}

                {isFiltered && (
                  <>
                    <DropdownMenuSeparator />
                    <DropdownMenuItem
                      className="text-xs text-destructive hover:text-destructive focus:bg-destructive/10 cursor-pointer font-medium"
                      onClick={clearColumnFilter}
                    >
                      Rimuovi filtri
                    </DropdownMenuItem>
                  </>
                )}
              </DropdownMenuContent>
            )}
          </DropdownMenu>

          {isFiltered && (
            <button
              onClick={(e) => {
                e.stopPropagation();
                e.preventDefault();
                clearColumnFilter();
              }}
              className="absolute right-0 top-1/2 -translate-y-1/2 h-5 w-5 rounded-full flex items-center justify-center bg-destructive/15 hover:bg-destructive/25 text-destructive hover:scale-110 active:scale-95 transition-all cursor-pointer shrink-0 z-30 shadow-sm animate-in zoom-in-50 duration-150"
              title="Azzera filtro per questa colonna"
            >
              <X className="h-3 w-3 stroke-[3]" />
            </button>
          )}
        </div>
      </div>

      <div
        onMouseDown={(e) => startResize(idx, e)}
        onDragStart={(e) => e.preventDefault()}
        className="absolute -right-[3px] top-0 bottom-0 w-2 cursor-col-resize z-30 group/resizer"
      >
        <div className="absolute right-[3px] top-0 bottom-0 w-[2px] bg-transparent group-hover/resizer:bg-primary/40 group-active/resizer:bg-primary transition-colors" />
      </div>
    </div>
  );
}

interface DataTableProps<T> {
  data: T[];
  defaultCols: TableCol<T>[];
  storageKey: string;
  idField?: keyof T;
  footerLabelSingular?: string;
  footerLabelPlural?: string;
  onRowEdit?: (row: T) => void;
  onRowDelete?: (row: T) => void;
  onDeleteSelected?: (ids: string[]) => void;
  renderCard?: (row: T, isSelected: boolean, toggleSelect: () => void) => React.ReactNode;
  tableKey?: string;
}

export function DataTable<T>({
  data,
  defaultCols,
  storageKey,
  idField = "id" as keyof T,
  footerLabelSingular = "riga",
  footerLabelPlural = "righe",
  onRowEdit,
  onRowDelete,
  onDeleteSelected,
  renderCard,
  tableKey,
}: DataTableProps<T>) {
  const [selected, setSelected] = useState<Set<string>>(new Set());
  const [sort, setSort] = useState<{ key: string; order: "asc" | "desc" } | null>(null);
  const [filters, setFilters] = useState<Record<string, { search?: string; selected?: string[] }>>(
    {},
  );

  const globalSearch = useAppStore((s) => s.tableSearch);
  const setGlobalSearch = useAppStore((s) => s.setTableSearch);
  const setTableActions = useAppStore((s) => s.setTableActions);
  const viewMode = useAppStore((s) => (tableKey ? s.viewMode[tableKey] || "table" : "table"));

  const [isMounted, setIsMounted] = useState(false);
  const [hiddenCols, setHiddenCols] = useState<Set<string>>(new Set());
  const [hoveredColKey, setHoveredColKey] = useState<string | null>(null);
  const [showLeftShadow, setShowLeftShadow] = useState(false);
  const [showRightShadow, setShowRightShadow] = useState(false);
  const [focusedRowId, setFocusedRowId] = useState<string | null>(null);

  // columns state (widths + order), persisted
  const [cols, setCols] = useState<TableCol<T>[]>(defaultCols);

  // Initialize from localStorage once on mount
  useEffect(() => {
    try {
      const savedHidden = JSON.parse(localStorage.getItem(storageKey + "-hidden") || "[]");
      if (savedHidden && Array.isArray(savedHidden)) {
        setHiddenCols(new Set(savedHidden));
      }
    } catch (e) {
      console.warn("Failed to parse hidden columns from localStorage:", e);
    }

    try {
      const saved = JSON.parse(localStorage.getItem(storageKey) || "null") as
        { key: string; width: number; pinned?: boolean }[] | null;
      if (saved && Array.isArray(saved)) {
        const map = new Map(defaultCols.map((c) => [c.key, c]));
        const ordered = saved
          .map((s) => {
            const c = map.get(s.key);
            if (c) {
              const width = s.width;
              return { ...c, width, pinned: !!s.pinned };
            }
            return null;
          })
          .filter(Boolean) as TableCol<T>[];
        // append any new default cols not yet in saved
        defaultCols.forEach((c) => {
          if (!ordered.find((x) => x.key === c.key)) ordered.push(c);
        });
        setCols(ordered);
      }
    } catch (e) {
      console.warn("Failed to parse columns from localStorage:", e);
    }
    setIsMounted(true);
  }, [storageKey, defaultCols]);

  useEffect(() => {
    if (!isMounted) return;
    localStorage.setItem(storageKey + "-hidden", JSON.stringify(Array.from(hiddenCols)));
  }, [hiddenCols, storageKey, isMounted]);

  const visibleCols = useMemo(() => {
    return cols.filter((c) => !hiddenCols.has(c.key));
  }, [cols, hiddenCols]);

  useEffect(() => {
    if (!isMounted) return;
    localStorage.setItem(
      storageKey,
      JSON.stringify(cols.map((c) => ({ key: c.key, width: c.width, pinned: !!c.pinned }))),
    );
  }, [cols, storageKey, isMounted]);

  useEffect(() => {
    return () => {
      setGlobalSearch("");
    };
  }, [setGlobalSearch]);

  const togglePin = (key: string) => {
    setCols((prev) => {
      const updated = prev.map((c) => {
        if (c.key === key) {
          return { ...c, pinned: !c.pinned };
        }
        return c;
      });

      const target = updated.find((c) => c.key === key);
      const isNowPinned = target?.pinned;

      const pinned = updated.filter((c) => c.pinned);
      const unpinned = updated.filter((c) => !c.pinned);
      const defaultKeys = defaultCols.map((c) => c.key);

      if (!isNowPinned) {
        // The column was unpinned! Sort the unpinned columns by defaultCols order
        unpinned.sort((a, b) => defaultKeys.indexOf(a.key) - defaultKeys.indexOf(b.key));
      } else {
        // The column was pinned! Let's also sort the pinned columns by defaultCols order
        pinned.sort((a, b) => defaultKeys.indexOf(a.key) - defaultKeys.indexOf(b.key));
      }

      return [...pinned, ...unpinned];
    });
  };

  const toggleColVisibility = useCallback(
    (key: string) => {
      setHiddenCols((prev) => {
        const next = new Set(prev);
        if (next.has(key)) {
          next.delete(key);
        } else {
          if (next.size >= cols.length - 1) {
            toast.error("Almeno una colonna deve rimanere visibile");
            return prev;
          }
          next.add(key);
        }
        return next;
      });
    },
    [cols.length],
  );

  const pinnedOffsets = useMemo(() => {
    const offsets: Record<string, number> = {};
    let currentOffset = 48; // starting after checkbox
    visibleCols.forEach((col) => {
      if (col.pinned) {
        offsets[col.key] = currentOffset;
        currentOffset += col.width;
      }
    });
    return offsets;
  }, [visibleCols]);

  const lastPinnedKey = useMemo(() => {
    const pinnedCols = visibleCols.filter((c) => c.pinned);
    return pinnedCols.length > 0 ? pinnedCols[pinnedCols.length - 1].key : null;
  }, [visibleCols]);

  // Apply filters and sorting
  const rows = useMemo(() => {
    let result = [...data];

    // Apply global search
    if (globalSearch) {
      const term = globalSearch.toLowerCase();
      result = result.filter((row) => {
        return visibleCols.some((col) => {
          try {
            const text = col.copy(row).toLowerCase();
            return text.includes(term);
          } catch {
            return false;
          }
        });
      });
    }

    // Apply filters
    Object.entries(filters).forEach(([key, filter]) => {
      if (!filter) return;
      const col = cols.find((c) => c.key === key);
      if (!col) return;

      if (col.filterFn) {
        result = result.filter((row) => col.filterFn!(row, filter));
      } else {
        // Fallback simple string matching if no filterFn is provided
        if (filter.search) {
          const term = filter.search.toLowerCase();
          result = result.filter((row) => {
            const val = String(row[key as keyof T] || "").toLowerCase();
            return val.includes(term);
          });
        }
        if (filter.selected && filter.selected.length > 0) {
          result = result.filter((row) => {
            const val = String(row[key as keyof T] || "");
            return filter.selected!.includes(val);
          });
        }
      }
    });

    // Apply sorting
    if (sort) {
      const { key, order } = sort;
      const descMult = order === "desc" ? -1 : 1;
      const col = cols.find((c) => c.key === key);

      if (col?.sortFn) {
        result.sort((a, b) => col.sortFn!(a, b) * descMult);
      } else {
        // Fallback simple sorting
        result.sort((a, b) => {
          const valA = a[key as keyof T];
          const valB = b[key as keyof T];

          if (typeof valA === "string" && typeof valB === "string") {
            return valA.localeCompare(valB) * descMult;
          }
          if (typeof valA === "number" && typeof valB === "number") {
            return (valA - valB) * descMult;
          }
          return 0;
        });
      }
    }

    return result;
  }, [data, filters, sort, cols, globalSearch, visibleCols]);

  // Pagination
  const [currentPage, setCurrentPage] = useState(1);
  const [pageSize, setPageSize] = useState(15);
  const [containerHeight, setContainerHeight] = useState(0);
  const bodyContainerRef = useRef<HTMLDivElement>(null);
  const cardsContainerRef = useRef<HTMLDivElement>(null);
  const tableWrapperRef = useRef<HTMLDivElement>(null);

  const dynamicRowHeight = useMemo(() => {
    if (!containerHeight || viewMode === "cards") return 54;
    const headerHeight = 44;
    const hasHScroll = bodyContainerRef.current
      ? bodyContainerRef.current.scrollWidth > bodyContainerRef.current.clientWidth
      : false;
    const scrollbarHeight = hasHScroll ? 12 : 0;
    const availableHeight = containerHeight - headerHeight - scrollbarHeight;
    const optimal = availableHeight / pageSize;
    // Allow larger rows up to 72px on big screens to close any empty gaps
    return Math.min(72, Math.max(48, optimal));
  }, [containerHeight, pageSize, viewMode]);

  const paginatedRows = useMemo(() => {
    const start = (currentPage - 1) * pageSize;
    return rows.slice(start, start + pageSize);
  }, [rows, currentPage, pageSize]);

  const totalPages = Math.ceil(rows.length / pageSize) || 1;

  const updateScrollShadows = () => {
    const el = bodyContainerRef.current;
    if (el) {
      const { scrollLeft, scrollWidth, clientWidth } = el;
      setShowLeftShadow(scrollLeft > 2);
      setShowRightShadow(scrollWidth - clientWidth - scrollLeft > 2);
    }
  };

  const handleScroll = () => {
    updateScrollShadows();
  };

  useEffect(() => {
    const t = setTimeout(updateScrollShadows, 50);
    return () => clearTimeout(t);
  }, [visibleCols, paginatedRows]);

  useEffect(() => {
    const activeRef = viewMode === "cards" ? cardsContainerRef : bodyContainerRef;
    if (!activeRef.current) return;
    const observer = new ResizeObserver((entries) => {
      for (const entry of entries) {
        const height = entry.contentRect.height;

        if (viewMode === "cards") {
          setPageSize(8);
        } else {
          setContainerHeight(height);
          const headerHeight = 44;
          const baseRowHeight = 54; // default base row height
          const hasHScroll = bodyContainerRef.current
            ? bodyContainerRef.current.scrollWidth > bodyContainerRef.current.clientWidth
            : false;
          const scrollbarHeight = hasHScroll ? 12 : 0;
          const calculatedPageSize = Math.floor(
            (height - headerHeight - scrollbarHeight) / baseRowHeight,
          );
          setPageSize(Math.max(5, calculatedPageSize));
        }
        setTimeout(updateScrollShadows, 50);
      }
    });

    observer.observe(activeRef.current);
    return () => observer.disconnect();
  }, [viewMode]);

  // Reset to page 1 on data or filter/search changes (but NOT on pageSize change)
  useEffect(() => {
    setCurrentPage(1);
  }, [data.length, filters, sort, globalSearch]);

  // Clamp current page to total pages if it exceeds it due to pageSize changes
  useEffect(() => {
    if (currentPage > totalPages) {
      setCurrentPage(Math.max(1, totalPages));
    }
  }, [totalPages, currentPage]);

  const lastSelectedId = useRef<string | null>(null);

  const toggle = (id: string, shiftKey?: boolean) => {
    const n = new Set(selected);

    if (shiftKey && lastSelectedId.current && lastSelectedId.current !== id) {
      const rowIds = paginatedRows.map((r) => String(r[idField]));
      const lastIdx = rowIds.indexOf(lastSelectedId.current);
      const currIdx = rowIds.indexOf(id);

      if (lastIdx !== -1 && currIdx !== -1) {
        const start = Math.min(lastIdx, currIdx);
        const end = Math.max(lastIdx, currIdx);
        const shouldSelect = selected.has(lastSelectedId.current);

        for (let i = start; i <= end; i++) {
          if (shouldSelect) {
            n.add(rowIds[i]);
          } else {
            n.delete(rowIds[i]);
          }
        }
        setSelected(n);
        lastSelectedId.current = id;
        return;
      }
    }

    if (n.has(id)) {
      n.delete(id);
    } else {
      n.add(id);
    }
    setSelected(n);
    lastSelectedId.current = id;
  };

  const toggleAll = () => {
    const ids = rows.map((r) => String(r[idField]));
    setSelected(selected.size === rows.length ? new Set() : new Set(ids));
  };

  // resize
  const resizing = useRef<{ idx: number; startX: number; startW: number } | null>(null);
  useEffect(() => {
    const onMove = (e: MouseEvent) => {
      if (!resizing.current) return;
      const { idx, startX, startW } = resizing.current;
      const w = Math.max(60, startW + (e.clientX - startX));
      setCols((cs) => cs.map((c, i) => (i === idx ? { ...c, width: w } : c)));
    };
    const onUp = () => {
      resizing.current = null;
      document.body.style.cursor = "";
      document.body.style.userSelect = "";
    };
    window.addEventListener("mousemove", onMove);
    window.addEventListener("mouseup", onUp);
    return () => {
      window.removeEventListener("mousemove", onMove);
      window.removeEventListener("mouseup", onUp);
    };
  }, []);

  const startResize = (idx: number, e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    resizing.current = { idx, startX: e.clientX, startW: cols[idx].width };
    document.body.style.cursor = "col-resize";
    document.body.style.userSelect = "none";
  };

  // reorder
  const [dragIdx, setDragIdx] = useState<number | null>(null);
  const [overIdx, setOverIdx] = useState<number | null>(null);

  // right-click cell tracking
  const rightClickInfo = useRef<{ rowId: string; colKey: string } | null>(null);
  const onCellContext = (rowId: string, colKey: string) => () => {
    rightClickInfo.current = { rowId, colKey };
  };

  const doCopy = () => {
    const info = rightClickInfo.current;
    if (!info) return;
    const r = data.find((x) => String(x[idField]) === info.rowId);
    const c = cols.find((x) => x.key === info.colKey);
    if (!r || !c) return;
    const text = c.copy(r);
    navigator.clipboard
      ?.writeText(text)
      .then(() => toast.success("Copiato: " + (text.length > 40 ? text.slice(0, 40) + "…" : text)));
  };

  const doEdit = () => {
    const r = data.find((x) => String(x[idField]) === rightClickInfo.current?.rowId);
    if (r && onRowEdit) onRowEdit(r);
  };

  const doDelete = () => {
    const id = rightClickInfo.current?.rowId;
    if (!id) return;
    const r = data.find((x) => String(x[idField]) === id);
    if (r && onRowDelete) {
      onRowDelete(r);
    }
  };

  const totalWidth = 48 + visibleCols.reduce((a, c) => a + c.width, 0);

  const hasActiveFilters =
    Object.values(filters).some((f) => f && (f.search || (f.selected && f.selected.length > 0))) ||
    sort !== null ||
    globalSearch !== "";

  const hasActiveColumnFilters = useMemo(() => {
    return Object.values(filters).some(
      (f) => f && (f.search || (f.selected && f.selected.length > 0)),
    );
  }, [filters]);

  const activeFiltersColCount = useMemo(() => {
    return Object.keys(filters).filter(
      (k) =>
        filters[k] &&
        (filters[k].search || (filters[k].selected && filters[k].selected.length > 0)),
    ).length;
  }, [filters]);

  const activeRowsCount = rows.length;

  const exportToCSV = useCallback(() => {
    if (rows.length === 0) {
      toast.error("Nessun dato da esportare");
      return;
    }

    const headers = visibleCols.map((c) => `"${c.label.replace(/"/g, '""')}"`).join(",");
    const csvRows = rows.map((row) => {
      return visibleCols
        .map((c) => {
          const text = c.copy(row);
          const escapedText = text.replace(/"/g, '""').replace(/\r?\n/g, " ");
          return `"${escapedText}"`;
        })
        .join(",");
    });

    const csvString = "\uFEFF" + [headers, ...csvRows].join("\n");
    const blob = new Blob([csvString], { type: "text/csv;charset=utf-8;" });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.href = url;
    link.setAttribute(
      "download",
      `${footerLabelPlural || "export"}_${new Date().toISOString().slice(0, 10)}.csv`,
    );
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    toast.success("File CSV esportato con successo!");
  }, [rows, visibleCols, footerLabelPlural]);

  useEffect(() => {
    setTableActions({
      cols,
      hiddenCols,
      toggleCol: toggleColVisibility,
      exportToCSV,
      clearFilters: () => setFilters({}),
      activeFiltersColCount,
    });
    return () => {
      setTableActions(null);
    };
  }, [cols, hiddenCols, toggleColVisibility, exportToCSV, setTableActions, activeFiltersColCount]);

  return (
    <div className="flex-1 flex flex-col min-h-0 min-w-0 relative">
      {/* Table Island wrapper */}
      <div
        ref={tableWrapperRef}
        className={`flex-1 min-h-0 min-w-0 flex flex-col relative
        ${
          viewMode === "cards"
            ? "mx-0 my-0"
            : "mx-6 my-4 rounded-xl border border-border/60 bg-background shadow-[0_2px_8px_rgba(0,0,0,0.04)] overflow-hidden"
        }`}
      >
        {/* Scroll shadows */}
        {showLeftShadow && viewMode !== "cards" && (
          <div
            className="absolute top-[44px] bottom-0 w-6 pointer-events-none z-30 bg-gradient-to-r from-black/[0.06] dark:from-black/[0.25] to-transparent animate-in fade-in duration-200"
            style={{
              left: lastPinnedKey
                ? (pinnedOffsets[lastPinnedKey] || 48) +
                  (cols.find((c) => c.key === lastPinnedKey)?.width || 0)
                : 48,
            }}
          />
        )}
        {showRightShadow && viewMode !== "cards" && (
          <div className="absolute right-0 top-[44px] bottom-0 w-6 pointer-events-none z-30 bg-gradient-to-l from-black/[0.06] dark:from-black/[0.25] to-transparent animate-in fade-in duration-200" />
        )}
        <div
          ref={bodyContainerRef}
          onScroll={handleScroll}
          className={
            viewMode === "cards"
              ? "hidden"
              : "flex-1 overflow-x-auto overflow-y-hidden overscroll-none"
          }
        >
          {viewMode !== "cards" && (
            <div style={{ minWidth: totalWidth }} className="min-w-full flex flex-col">
              {/* header */}
              <div className="flex bg-[#e8f3f2] dark:bg-[#183538] sticky top-0 z-10 h-11 items-stretch">
                <div
                  className="w-12 flex items-center justify-center shrink-0 border-r border-primary/15 bg-[#e8f3f2] dark:bg-[#183538] sticky left-0 z-20 cursor-pointer hover:bg-primary/20 transition-colors"
                  onClick={(e) => {
                    e.stopPropagation();
                    toggleAll();
                  }}
                >
                  <Checkbox
                    checked={selected.size === activeRowsCount && activeRowsCount > 0}
                    onCheckedChange={() => {}}
                    className="pointer-events-none"
                  />
                </div>
                {visibleCols.map((c) => {
                  const fullIdx = cols.findIndex((col) => col.key === c.key);
                  return (
                    <ColumnHeader
                      key={c.key}
                      col={c}
                      idx={fullIdx}
                      dragIdx={dragIdx}
                      overIdx={overIdx}
                      setDragIdx={setDragIdx}
                      setOverIdx={setOverIdx}
                      setCols={setCols}
                      startResize={startResize}
                      sort={sort}
                      setSort={setSort}
                      filters={filters}
                      setFilters={setFilters}
                      data={data}
                      pinnedOffsets={pinnedOffsets}
                      lastPinnedKey={lastPinnedKey}
                      togglePin={togglePin}
                      defaultCols={defaultCols}
                    />
                  );
                })}
              </div>

              {/* body */}
              {paginatedRows.map((row) => {
                const rId = String(row[idField]);
                return (
                  <ContextMenu key={rId}>
                    <ContextMenuTrigger asChild>
                      <div
                        id={`row-${rId}`}
                        tabIndex={0}
                        onFocus={() => setFocusedRowId(rId)}
                        onBlur={() => setFocusedRowId((prev) => (prev === rId ? null : prev))}
                        onKeyDown={(e) => {
                          if (e.key === " ") {
                            e.preventDefault();
                            toggle(rId);
                          } else if (e.key === "Enter") {
                            e.preventDefault();
                            if (onRowEdit) {
                              const r = data.find((x) => String(x[idField]) === rId);
                              if (r) onRowEdit(r);
                            }
                          } else if (e.key === "ArrowDown") {
                            e.preventDefault();
                            const idx = paginatedRows.findIndex((r) => String(r[idField]) === rId);
                            if (idx < paginatedRows.length - 1) {
                              const nextId = String(paginatedRows[idx + 1][idField]);
                              const nextEl = document.getElementById(`row-${nextId}`);
                              nextEl?.focus();
                            }
                          } else if (e.key === "ArrowUp") {
                            e.preventDefault();
                            const idx = paginatedRows.findIndex((r) => String(r[idField]) === rId);
                            if (idx > 0) {
                              const prevId = String(paginatedRows[idx - 1][idField]);
                              const prevEl = document.getElementById(`row-${prevId}`);
                              prevEl?.focus();
                            }
                          }
                        }}
                        className={`flex border-b hover:bg-muted/45 items-stretch bg-background group/row outline-none transition-colors duration-150 relative
                        ${focusedRowId === rId ? "bg-primary/[0.02]" : ""}`}
                        style={{ height: `${dynamicRowHeight}px` }}
                      >
                        {focusedRowId === rId && (
                          <>
                            <div className="absolute top-0 left-0 right-0 h-[2px] bg-primary pointer-events-none z-20" />
                            <div className="absolute bottom-0 left-0 right-0 h-[2px] bg-primary pointer-events-none z-20" />
                            <div className="absolute top-0 bottom-0 left-0 w-[2px] bg-primary pointer-events-none z-20" />
                            <div className="absolute top-0 bottom-0 right-0 w-[2px] bg-primary pointer-events-none z-20" />
                          </>
                        )}
                        <div
                          className="w-12 flex items-center justify-center shrink-0 sticky left-0 z-10 table-sticky-cell border-r border-border/45 cursor-pointer hover:bg-muted/65 transition-colors"
                          onClick={(e) => {
                            e.stopPropagation();
                            toggle(rId, e.shiftKey);
                          }}
                        >
                          <Checkbox
                            checked={selected.has(rId)}
                            onCheckedChange={() => {}}
                            className="pointer-events-none"
                          />
                        </div>
                        {visibleCols.map((c) => {
                          const isPinned = !!c.pinned;
                          const pinOffset = isPinned ? pinnedOffsets[c.key] : undefined;
                          const isLastPinned = lastPinnedKey === c.key;
                          return (
                            <div
                              key={c.key}
                              style={{
                                width: c.width,
                                flex: c.pinned
                                  ? `0 0 ${c.width}px`
                                  : c.flexGrow
                                    ? `1 1 ${c.width}px`
                                    : `0 0 ${c.width}px`,
                                minWidth: `${Math.min(60, c.width)}px`,
                                maxWidth: c.maxWidth !== undefined ? `${c.maxWidth}px` : undefined,
                                left: pinOffset !== undefined ? pinOffset : undefined,
                              }}
                              className={`flex items-center px-3 min-w-0 overflow-hidden border-r border-border/45 transition-colors duration-150 select-text cursor-pointer
                              ${c.align === "center" ? "justify-center text-center" : c.align === "right" ? "justify-end text-right" : "justify-start text-left"}
                              ${isPinned ? "sticky z-10 table-sticky-cell" : ""}
                              ${isLastPinned ? "border-r-2 border-primary/25" : ""}
                              ${hoveredColKey === c.key ? "bg-primary/[0.02] dark:bg-primary/[0.04]" : ""}`}
                              onContextMenu={onCellContext(rId, c.key)}
                              onMouseEnter={() => setHoveredColKey(c.key)}
                              onMouseLeave={() => setHoveredColKey(null)}
                              onDoubleClick={() => {
                                const text = c.copy(row);
                                navigator.clipboard?.writeText(text).then(() => {
                                  toast.success(
                                    "Copiato: " +
                                      (text.length > 40 ? text.slice(0, 40) + "…" : text),
                                  );
                                });
                              }}
                              title="Doppio clic per copiare"
                            >
                              {c.render(row)}
                            </div>
                          );
                        })}
                      </div>
                    </ContextMenuTrigger>
                    <ContextMenuContent className="w-52">
                      <ContextMenuItem onSelect={doCopy}>
                        <Copy className="h-4 w-4 mr-2" />
                        Copia testo cella
                      </ContextMenuItem>
                      {onRowEdit && (
                        <ContextMenuItem onSelect={doEdit}>
                          <Pencil className="h-4 w-4 mr-2" />
                          Modifica riga
                        </ContextMenuItem>
                      )}
                      {onRowDelete && (
                        <>
                          <ContextMenuSeparator />
                          <ContextMenuItem
                            onSelect={doDelete}
                            className="text-destructive focus:text-destructive"
                          >
                            <Trash2 className="h-4 w-4 mr-2" />
                            Elimina riga
                          </ContextMenuItem>
                        </>
                      )}
                    </ContextMenuContent>
                  </ContextMenu>
                );
              })}

              {paginatedRows.length === 0 && (
                <div className="flex flex-col items-center justify-center py-20 text-muted-foreground bg-background">
                  <Search className="h-10 w-10 mb-3 opacity-30 text-muted-foreground" />
                  <span className="text-sm font-semibold">Nessun risultato trovato</span>
                  <p className="text-xs text-muted-foreground/75 mt-1">
                    Nessun elemento corrisponde alla ricerca corrente o ai filtri applicati.
                  </p>
                </div>
              )}
            </div>
          )}
        </div>

        {/* ── CARD GRID (sibling to table scroll container) ── */}
        {viewMode === "cards" && renderCard && (
          <div ref={cardsContainerRef} className="flex-1 overflow-hidden">
            {paginatedRows.length === 0 ? (
              <div className="flex flex-col items-center justify-center h-full text-muted-foreground">
                <Search className="h-10 w-10 mb-3 opacity-30" />
                <span className="text-sm font-semibold">Nessun risultato trovato</span>
                <p className="text-xs text-muted-foreground/75 mt-1">
                  Nessun elemento corrisponde alla ricerca o ai filtri applicati.
                </p>
              </div>
            ) : (
              <div
                className="h-full px-6 py-4 grid grid-cols-2 lg:grid-cols-4 gap-5"
                style={{ gridAutoRows: "1fr" }}
              >
                {paginatedRows.map((row) => {
                  const rId = String(row[idField]);
                  const isSelected = selected.has(rId);
                  return (
                    <ContextMenu key={rId}>
                      <ContextMenuTrigger asChild>
                        <div
                          id={`card-${rId}`}
                          tabIndex={0}
                          onKeyDown={(e) => {
                            if (e.key === "Enter" && onRowEdit) onRowEdit(row);
                          }}
                          onDoubleClick={() => onRowEdit?.(row)}
                          className={`relative outline-none group cursor-pointer rounded-2xl transition-all duration-200 h-full
                            ${isSelected ? "ring-2 ring-primary/60 ring-offset-2" : ""}`}
                        >
                          {/* Checkbox overlay */}
                          <div className="absolute top-3 left-3 z-10 opacity-0 group-hover:opacity-100 focus-within:opacity-100 transition-opacity">
                            <Checkbox checked={isSelected} onCheckedChange={() => toggle(rId)} />
                          </div>
                          {renderCard(row, isSelected, () => toggle(rId))}
                        </div>
                      </ContextMenuTrigger>
                      <ContextMenuContent className="w-52">
                        {onRowEdit && (
                          <ContextMenuItem onSelect={() => onRowEdit(row)}>
                            <Pencil className="h-4 w-4 mr-2" />
                            Modifica
                          </ContextMenuItem>
                        )}
                        {onRowDelete && (
                          <>
                            <ContextMenuSeparator />
                            <ContextMenuItem
                              onSelect={() => onRowDelete(row)}
                              className="text-destructive focus:text-destructive"
                            >
                              <Trash2 className="h-4 w-4 mr-2" />
                              Elimina
                            </ContextMenuItem>
                          </>
                        )}
                      </ContextMenuContent>
                    </ContextMenu>
                  );
                })}
              </div>
            )}
          </div>
        )}

        {selected.size > 0 && onDeleteSelected && (
          <div className="fixed bottom-20 left-1/2 -translate-x-1/2 bg-foreground text-background rounded-full px-4 py-2 shadow-lg flex items-center gap-3 text-sm z-20">
            <span>{selected.size} selezionati</span>
            <Button
              size="sm"
              variant="secondary"
              className="h-7 rounded-full"
              onClick={() => {
                onDeleteSelected(Array.from(selected));
                setSelected(new Set());
              }}
            >
              Elimina
            </Button>
          </div>
        )}
      </div>

      <footer className="h-14 flex items-center justify-between px-6 bg-background shrink-0 border-t border-border/45">
        <div className="flex items-center gap-3 text-sm min-w-0 flex-1">
          <Badge
            variant="outline"
            className="border-success/40 bg-success/10 text-success gap-1.5 rounded-full shrink-0"
          >
            <CheckCircle2 className="h-3 w-3" />
            Salvato localmente
          </Badge>

          {hasActiveColumnFilters && (
            <Button
              variant="outline"
              size="sm"
              onClick={() => setFilters({})}
              className="h-8 text-xs text-destructive hover:text-destructive bg-destructive/5 hover:bg-destructive/10 border-destructive/20 hover:border-destructive/40 px-3 font-semibold flex items-center gap-1.5 transition-all cursor-pointer rounded-full shrink-0 shadow-sm hover:scale-105 active:scale-95"
              title="Azzera tutti i filtri applicati alle colonne"
            >
              <X className="h-3.5 w-3.5 stroke-[2.5]" />
              <span>Azzera tutti i filtri ({activeFiltersColCount})</span>
            </Button>
          )}

          <span className="text-muted-foreground truncate hidden md:inline">
            Visualizzazione di {rows.length > 0 ? (currentPage - 1) * pageSize + 1 : 0}–
            {Math.min(currentPage * pageSize, rows.length)} di {rows.length}{" "}
            {rows.length === 1 ? footerLabelSingular : footerLabelPlural} · trascina l'intestazione
            per riordinare, bordo destro per ridimensionare
          </span>
        </div>
        <div className="flex items-center gap-2">
          <Button
            variant="ghost"
            size="icon"
            className="h-8 w-8"
            disabled={currentPage === 1}
            onClick={() => setCurrentPage((p) => Math.max(1, p - 1))}
          >
            <ChevronLeft className="h-4 w-4" />
          </Button>
          <Button
            variant="outline"
            size="sm"
            className="h-8 rounded-full bg-success/10 border-success/40 text-success pointer-events-none"
          >
            Pagina {currentPage} di {totalPages}
          </Button>
          <Button
            variant="ghost"
            size="icon"
            className="h-8 w-8"
            disabled={currentPage === totalPages}
            onClick={() => setCurrentPage((p) => Math.min(totalPages, p + 1))}
          >
            <ChevronRight className="h-4 w-4" />
          </Button>
        </div>
      </footer>
    </div>
  );
}
