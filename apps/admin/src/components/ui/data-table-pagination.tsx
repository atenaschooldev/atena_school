"use client";

import { type Table } from "@tanstack/react-table";
import {
  ChevronLeft,
  ChevronRight,
  ChevronsLeft,
  ChevronsRight,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { useTranslation } from "@/i18n/context";

interface DataTablePaginationProps<TData> {
  table: Table<TData>;
  pageSizeOptions?: number[];
  showSelectedCount?: boolean;
}

export function DataTablePagination<TData>({
  table,
  pageSizeOptions = [10, 20, 50],
  showSelectedCount = true,
}: DataTablePaginationProps<TData>) {
  const { t, locale } = useTranslation();
  const pageIndex = table.getState().pagination.pageIndex;
  const pageSize = table.getState().pagination.pageSize;
  const totalPages = table.getPageCount() || 1;
  const selectedRows = table.getFilteredSelectedRowModel().rows.length;
  const totalRows = table.getFilteredRowModel().rows.length;

  return (
    <div className="flex flex-col sm:flex-row items-center justify-between gap-4 py-2 px-1 text-xs">
      <div className="flex items-center gap-4 text-muted-foreground flex-wrap">
        {showSelectedCount && selectedRows > 0 ? (
          <span className="font-medium text-foreground">
            {selectedRows} {t("common.of") || "di"} {totalRows} {locale === "en" ? "row(s) selected" : "righe selezionate"}
          </span>
        ) : (
          <span className="font-normal text-muted-foreground">
            {totalRows} {locale === "en" ? "total items" : "elementi totali"}
          </span>
        )}

        <div className="flex items-center gap-2">
          <span>{locale === "en" ? "Rows per page:" : "Righe per pagina:"}</span>
          <Select
            value={`${pageSize}`}
            onValueChange={(val) => table.setPageSize(Number(val))}
          >
            <SelectTrigger className="h-8 w-[68px] cursor-pointer rounded-lg border-border/60 bg-background px-2.5 text-xs font-semibold">
              <SelectValue placeholder={`${pageSize}`} />
            </SelectTrigger>
            <SelectContent side="top">
              {pageSizeOptions.map((size) => (
                <SelectItem key={size} value={`${size}`} className="text-xs cursor-pointer">
                  {size}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
      </div>

      <div className="flex items-center gap-1.5">
        <Button
          variant="outline"
          size="icon"
          className="h-8 w-8 rounded-lg border-border/60 cursor-pointer text-muted-foreground hover:text-foreground hover:bg-muted/80 disabled:opacity-40"
          onClick={() => table.setPageIndex(0)}
          disabled={!table.getCanPreviousPage()}
          title={locale === "en" ? "First page" : "Prima pagina"}
        >
          <ChevronsLeft className="h-3.5 w-3.5" />
        </Button>

        <Button
          variant="outline"
          size="icon"
          className="h-8 w-8 rounded-lg border-border/60 cursor-pointer text-muted-foreground hover:text-foreground hover:bg-muted/80 disabled:opacity-40"
          onClick={() => table.previousPage()}
          disabled={!table.getCanPreviousPage()}
          title={locale === "en" ? "Previous page" : "Pagina precedente"}
        >
          <ChevronLeft className="h-3.5 w-3.5" />
        </Button>

        <span className="text-xs font-medium text-foreground px-2">
          {locale === "en" ? "Page" : "Pagina"} {pageIndex + 1} {t("common.of") || "di"} {totalPages}
        </span>

        <Button
          variant="outline"
          size="icon"
          className="h-8 w-8 rounded-lg border-border/60 cursor-pointer text-muted-foreground hover:text-foreground hover:bg-muted/80 disabled:opacity-40"
          onClick={() => table.nextPage()}
          disabled={!table.getCanNextPage()}
          title={locale === "en" ? "Next page" : "Pagina successiva"}
        >
          <ChevronRight className="h-3.5 w-3.5" />
        </Button>

        <Button
          variant="outline"
          size="icon"
          className="h-8 w-8 rounded-lg border-border/60 cursor-pointer text-muted-foreground hover:text-foreground hover:bg-muted/80 disabled:opacity-40"
          onClick={() => table.setPageIndex(totalPages - 1)}
          disabled={!table.getCanNextPage()}
          title={locale === "en" ? "Last page" : "Ultima pagina"}
        >
          <ChevronsRight className="h-3.5 w-3.5" />
        </Button>
      </div>
    </div>
  );
}
