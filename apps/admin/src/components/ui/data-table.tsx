"use client"

import * as React from "react"
import {
  ColumnDef,
  flexRender,
  getCoreRowModel,
  useReactTable,
  getPaginationRowModel,
  SortingState,
  getSortedRowModel,
  ColumnFiltersState,
  getFilteredRowModel,
  getFacetedRowModel,
  getFacetedUniqueValues,
  VisibilityState,
  ColumnSizingState,
  ColumnOrderState,
  Header,
} from "@tanstack/react-table"

import {
  DndContext,
  closestCenter,
  KeyboardSensor,
  PointerSensor,
  useSensor,
  useSensors,
  DragEndEvent,
} from "@dnd-kit/core"
import {
  arrayMove,
  SortableContext,
  horizontalListSortingStrategy,
  useSortable,
} from "@dnd-kit/sortable"
import { CSS } from "@dnd-kit/utilities"

import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table"

import { DataTablePagination } from "../data-table/data-table-pagination"
import { DataTableToolbar } from "../data-table/data-table-toolbar"
import { cn } from "@/lib/utils"

const DraggableTableHeader = ({ header }: { header: Header<any, unknown> }) => {
  const { attributes, isDragging, listeners, setNodeRef, transform, transition } = useSortable({
    id: header.column.id,
  })

  const style: React.CSSProperties = {
    transform: CSS.Translate.toString(transform),
    transition,
    width: header.column.getIsResizing() || header.getContext().table.getState().columnSizing[header.column.id] ? header.getSize() : undefined,
    opacity: isDragging ? 0.5 : 1,
    zIndex: isDragging ? 1 : 0,
    position: "relative",
  }

  return (
    <TableHead
      ref={setNodeRef}
      style={style}
      className="text-xs font-semibold uppercase tracking-wider text-muted-foreground bg-muted/40 h-10 px-4 relative select-none"
    >
      <div className="flex w-full items-center gap-1">
        {header.column.getCanSort() || header.column.getCanHide() ? (
          // If it has its own sorting/menu, we only drag by the surrounding area, but typically you'd want a drag handle.
          // For simplicity, making the entire header cell except the buttons draggable is tough. We'll make the whole cell draggable.
          <div {...attributes} {...listeners} className="flex-1 cursor-grab active:cursor-grabbing flex items-center h-full">
            {header.isPlaceholder ? null : flexRender(header.column.columnDef.header, header.getContext())}
          </div>
        ) : (
          <div {...attributes} {...listeners} className="w-full flex items-center cursor-grab active:cursor-grabbing">
             {header.isPlaceholder ? null : flexRender(header.column.columnDef.header, header.getContext())}
          </div>
        )}
      </div>

      {header.column.getCanResize() && (
        <div
          onMouseDown={header.getResizeHandler()}
          onTouchStart={header.getResizeHandler()}
          className={cn(
            "absolute right-0 top-0 h-full w-2 cursor-col-resize user-select-none touch-none hover:bg-primary/50",
            header.column.getIsResizing() ? "bg-primary w-2" : "bg-transparent"
          )}
        />
      )}
    </TableHead>
  )
}

interface DataTableProps<TData, TValue> {
  columns: ColumnDef<TData, TValue>[]
  data: TData[]
  globalFilter?: string
  searchColumn?: string
  searchPlaceholder?: string
  filterColumn?: string
  filterTitle?: string
  filterOptions?: { label: string; value: string; icon?: React.ComponentType<{ className?: string }> }[]
  storageKey?: string
}

export function DataTable<TData, TValue>({
  columns,
  data,
  globalFilter,
  searchColumn,
  searchPlaceholder,
  filterColumn,
  filterTitle,
  filterOptions,
  storageKey,
}: DataTableProps<TData, TValue>) {
  const [sorting, setSorting] = React.useState<SortingState>([])
  const [columnFilters, setColumnFilters] = React.useState<ColumnFiltersState>([])
  
  // Persist state hooks
  const [columnVisibility, setColumnVisibility] = React.useState<VisibilityState>(() => {
    if (typeof window !== "undefined" && storageKey) {
      const saved = localStorage.getItem(`${storageKey}-visibility`)
      return saved ? JSON.parse(saved) : {}
    }
    return {}
  })
  
  const [columnSizing, setColumnSizing] = React.useState<ColumnSizingState>(() => {
    if (typeof window !== "undefined" && storageKey) {
      const saved = localStorage.getItem(`${storageKey}-sizing`)
      return saved ? JSON.parse(saved) : {}
    }
    return {}
  })
  
  const [columnOrder, setColumnOrder] = React.useState<ColumnOrderState>(() => {
    if (typeof window !== "undefined" && storageKey) {
      const saved = localStorage.getItem(`${storageKey}-order`)
      if (saved) return JSON.parse(saved)
    }
    return columns.map(c => c.id as string || (c as any).accessorKey as string)
  })

  const [rowSelection, setRowSelection] = React.useState({})

  // Save to local storage on change
  React.useEffect(() => {
    if (storageKey) {
      localStorage.setItem(`${storageKey}-visibility`, JSON.stringify(columnVisibility))
    }
  }, [columnVisibility, storageKey])

  React.useEffect(() => {
    if (storageKey) {
      localStorage.setItem(`${storageKey}-sizing`, JSON.stringify(columnSizing))
    }
  }, [columnSizing, storageKey])

  React.useEffect(() => {
    if (storageKey) {
      localStorage.setItem(`${storageKey}-order`, JSON.stringify(columnOrder))
    }
  }, [columnOrder, storageKey])

  const table = useReactTable({
    data,
    columns,
    enableRowSelection: true,
    columnResizeMode: "onChange",
    getCoreRowModel: getCoreRowModel(),
    getPaginationRowModel: getPaginationRowModel(),
    onSortingChange: setSorting,
    getSortedRowModel: getSortedRowModel(),
    onColumnFiltersChange: setColumnFilters,
    getFilteredRowModel: getFilteredRowModel(),
    onColumnVisibilityChange: setColumnVisibility,
    onColumnSizingChange: setColumnSizing,
    onColumnOrderChange: setColumnOrder,
    onRowSelectionChange: setRowSelection,
    getFacetedRowModel: getFacetedRowModel(),
    getFacetedUniqueValues: getFacetedUniqueValues(),
    state: {
      sorting,
      columnFilters,
      columnVisibility,
      columnSizing,
      columnOrder,
      rowSelection,
      globalFilter,
    },
    onGlobalFilterChange: undefined,
  })

  const sensors = useSensors(
    useSensor(PointerSensor, {
      activationConstraint: {
        distance: 5,
      },
    }),
    useSensor(KeyboardSensor)
  )

  function handleDragEnd(event: DragEndEvent) {
    const { active, over } = event
    if (active && over && active.id !== over.id) {
      setColumnOrder((order) => {
        const oldIndex = order.indexOf(active.id as string)
        const newIndex = order.indexOf(over.id as string)
        return arrayMove(order, oldIndex, newIndex)
      })
    }
  }

  return (
    <div className="space-y-4">
      {(searchColumn || filterColumn) && (
        <DataTableToolbar
          table={table}
          searchColumn={searchColumn}
          searchPlaceholder={searchPlaceholder}
          filterColumn={filterColumn}
          filterTitle={filterTitle}
          filterOptions={filterOptions}
        />
      )}
      <div className="rounded-md border bg-card">
        <DndContext sensors={sensors} collisionDetection={closestCenter} onDragEnd={handleDragEnd}>
          <Table>
            <TableHeader>
              {table.getHeaderGroups().map((headerGroup) => (
                <TableRow key={headerGroup.id} className="hover:bg-transparent">
                  <SortableContext items={columnOrder} strategy={horizontalListSortingStrategy}>
                    {headerGroup.headers.map((header) => {
                      return (
                        <DraggableTableHeader key={header.id} header={header} />
                      )
                    })}
                  </SortableContext>
                </TableRow>
              ))}
            </TableHeader>
            <TableBody>
              {table.getRowModel().rows?.length ? (
                table.getRowModel().rows.map((row) => (
                  <TableRow
                    key={row.id}
                    data-state={row.getIsSelected() && "selected"}
                    className="group transition-colors hover:bg-muted/30 border-b-muted"
                  >
                    {row.getVisibleCells().map((cell) => (
                      <TableCell 
                        key={cell.id} 
                        className="py-3 px-4"
                        style={{ width: cell.column.getIsResizing() || table.getState().columnSizing[cell.column.id] ? cell.column.getSize() : undefined }}
                      >
                        {flexRender(cell.column.columnDef.cell, cell.getContext())}
                      </TableCell>
                    ))}
                  </TableRow>
                ))
              ) : (
                <TableRow>
                  <TableCell colSpan={columns.length} className="h-32 text-center text-muted-foreground text-sm">
                    Nessun risultato.
                  </TableCell>
                </TableRow>
              )}
            </TableBody>
          </Table>
        </DndContext>
      </div>
      
      <DataTablePagination table={table} />
    </div>
  )
}
