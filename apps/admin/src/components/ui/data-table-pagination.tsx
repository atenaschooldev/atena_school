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

interface DataTablePaginationProps<TData> {
  table: Table<TData>;
  pageSizeOptions?: number[];
}

export function DataTablePagination<TData>({
  table,
  pageSizeOptions = [10, 20, 50],
}: DataTablePaginationProps<TData>) {
  return (
    <div className="flex flex-col sm:flex-row items-center justify-between gap-4 py-4 px-1">
      <div className="flex items-center gap-3 text-sm font-medium text-foreground">
        <span>Rows per page</span>
        <Select
          value={`${table.getState().pagination.pageSize}`}
          onValueChange={(val) => table.setPageSize(Number(val))}
        >
          <SelectTrigger className="h-9 w-[70px] cursor-pointer rounded-lg border-border/60 bg-background px-3">
            <SelectValue placeholder={`${table.getState().pagination.pageSize}`} />
          </SelectTrigger>
          <SelectContent side="top">
            {pageSizeOptions.map((size) => (
              <SelectItem key={size} value={`${size}`}>
                {size}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      <div className="flex items-center gap-2">
        <Button
          variant="outline"
          size="icon"
          className="h-9 w-9 rounded-lg border-border/60 cursor-pointer text-muted-foreground hover:text-foreground"
          onClick={() => table.setPageIndex(0)}
          disabled={!table.getCanPreviousPage()}
          title="First Page"
        >
          <ChevronsLeft className="h-4 w-4" />
        </Button>

        <Button
          variant="outline"
          size="icon"
          className="h-9 w-9 rounded-lg border-border/60 cursor-pointer text-muted-foreground hover:text-foreground"
          onClick={() => table.previousPage()}
          disabled={!table.getCanPreviousPage()}
          title="Previous Page"
        >
          <ChevronLeft className="h-4 w-4" />
        </Button>

        <span className="text-sm font-medium text-foreground px-3">
          Page {table.getState().pagination.pageIndex + 1} of {table.getPageCount() || 1}
        </span>

        <Button
          variant="outline"
          size="icon"
          className="h-9 w-9 rounded-lg border-border/60 cursor-pointer text-muted-foreground hover:text-foreground"
          onClick={() => table.nextPage()}
          disabled={!table.getCanNextPage()}
          title="Next Page"
        >
          <ChevronRight className="h-4 w-4" />
        </Button>

        <Button
          variant="outline"
          size="icon"
          className="h-9 w-9 rounded-lg border-border/60 cursor-pointer text-muted-foreground hover:text-foreground"
          onClick={() => table.setPageIndex(table.getPageCount() - 1)}
          disabled={!table.getCanNextPage()}
          title="Last Page"
        >
          <ChevronsRight className="h-4 w-4" />
        </Button>
      </div>
    </div>
  );
}
