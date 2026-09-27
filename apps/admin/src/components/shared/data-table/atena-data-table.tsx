"use client";

import * as React from "react";
import type { Table as TanstackTable, Row } from "@tanstack/react-table";
import { flexRender } from "@tanstack/react-table";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { DataTablePagination } from "@/components/ui/data-table-pagination";
import { TableSkeletonRows } from "@/components/ui/table-skeleton";
import { DataTableEmptyState } from "./data-table-empty-state";
import { DataTableFloatingBar } from "./data-table-floating-bar";
import { cn } from "@/lib/utils";

export interface AtenaDataTableProps<TData> {
  table: TanstackTable<TData>;
  columnsCount?: number;
  loading?: boolean;
  emptyTitle?: string;
  emptyDescription?: string;
  emptyIcon?: React.ComponentType<{ className?: string }>;
  onResetFilters?: () => void;
  emptyAction?: React.ReactNode;
  bulkActions?: (table: TanstackTable<TData>) => React.ReactNode;
  showPagination?: boolean;
  onRowClick?: (row: Row<TData>) => void;
  className?: string;
}

export function AtenaDataTable<TData>({
  table,
  columnsCount,
  loading = false,
  emptyTitle,
  emptyDescription,
  emptyIcon,
  onResetFilters,
  emptyAction,
  bulkActions,
  showPagination = true,
  onRowClick,
  className,
}: AtenaDataTableProps<TData>) {
  const visibleColumnsCount =
    columnsCount || table.getVisibleLeafColumns().length || 6;
  const rows = table.getRowModel().rows;

  return (
    <div className={cn("space-y-4", className)}>
      <div className="rounded-xl border border-border/70 bg-card/70 backdrop-blur-sm shadow-xs overflow-hidden">
        <Table>
          <TableHeader className="bg-muted/40 border-b border-border/60">
            {table.getHeaderGroups().map((headerGroup) => (
              <TableRow key={headerGroup.id} className="hover:bg-transparent">
                {headerGroup.headers.map((header) => (
                  <TableHead
                    key={header.id}
                    style={{
                      width: header.column.columnDef.size
                        ? `${header.column.columnDef.size}px`
                        : undefined,
                    }}
                    className="h-10 text-xs font-semibold text-muted-foreground px-4"
                  >
                    {header.isPlaceholder
                      ? null
                      : flexRender(
                          header.column.columnDef.header,
                          header.getContext()
                        )}
                  </TableHead>
                ))}
              </TableRow>
            ))}
          </TableHeader>
          <TableBody>
            {loading ? (
              <TableSkeletonRows
                columnsCount={visibleColumnsCount}
                rowCount={6}
              />
            ) : rows?.length ? (
              rows.map((row) => (
                <TableRow
                  key={row.id}
                  data-state={row.getIsSelected() && "selected"}
                  onClick={() => onRowClick && onRowClick(row)}
                  className={cn(
                    "hover:bg-muted/40 transition-colors duration-150 border-b border-border/40",
                    onRowClick && "cursor-pointer"
                  )}
                >
                  {row.getVisibleCells().map((cell) => (
                    <TableCell
                      key={cell.id}
                      style={{
                        width: cell.column.columnDef.size
                          ? `${cell.column.columnDef.size}px`
                          : undefined,
                      }}
                      className="px-4 py-3"
                    >
                      {flexRender(
                        cell.column.columnDef.cell,
                        cell.getContext()
                      )}
                    </TableCell>
                  ))}
                </TableRow>
              ))
            ) : (
              <TableRow className="hover:bg-transparent">
                <TableCell
                  colSpan={visibleColumnsCount}
                  className="h-48 text-center p-0"
                >
                  <DataTableEmptyState
                    title={emptyTitle}
                    description={emptyDescription}
                    icon={emptyIcon}
                    onResetFilters={onResetFilters}
                    actionElement={emptyAction}
                  />
                </TableCell>
              </TableRow>
            )}
          </TableBody>
        </Table>
      </div>

      {showPagination && <DataTablePagination table={table} />}

      {bulkActions && (
        <DataTableFloatingBar table={table}>
          {bulkActions(table)}
        </DataTableFloatingBar>
      )}
    </div>
  );
}
