"use client";

import { useMemo, useState } from "react";
import {
  type ColumnDef,
  type ColumnFiltersState,
  type SortingState,
  type VisibilityState,
  type Row,
  flexRender,
  getCoreRowModel,
  getFilteredRowModel,
  getPaginationRowModel,
  getSortedRowModel,
  useReactTable,
} from "@tanstack/react-table";
import {
  Search,
  Plus,
  Pencil,
  Trash2,
  Copy,
  ChevronDown,
  Download,
  Eye,
  EllipsisVertical,
  ChevronLeft,
  ChevronRight,
  ChevronsLeft,
  ChevronsRight,
} from "lucide-react";

import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import {
  DropdownMenu,
  DropdownMenuCheckboxItem,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Sheet, SheetContent, SheetHeader, SheetTitle } from "@/components/ui/sheet";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import { CourseForm } from "./course-form";
import type { Course } from "../types";
import { useCourses } from "../hooks/use-courses";
import { formatCategoryLabel, categoryColor, COURSE_CATEGORIES, formatCourseFormatLabel, COURSE_FORMAT_OPTIONS } from "../utils";
import { useAppStore } from "@/stores/app-store";

export function CorsiView() {
  const {
    coursesList,
    open,
    editing,
    initialFormValues,
    handleNewClick,
    handleEditClick,
    handleDeleteClick,
    handleFormSubmit,
    handleCloseDialog,
  } = useCourses();

  const [sorting, setSorting] = useState<SortingState>([]);
  const [columnFilters, setColumnFilters] = useState<ColumnFiltersState>([]);
  const [columnVisibility, setColumnVisibility] = useState<VisibilityState>({});
  const [rowSelection, setRowSelection] = useState({});
  const [pageSize, setPageSize] = useState("10");
  const [deletingCourse, setDeletingCourse] = useState<Course | null>(null);

  const tableSearch = useAppStore((s) => s.tableSearch);
  const setTableSearch = useAppStore((s) => s.setTableSearch);

  const exactFilter = (row: Row<Course>, columnId: string, value: string) => {
    if (!value) return true;
    const rawVal = (row.getValue(columnId) as string) || "";
    if (columnId === "categoria") {
      if (value === "Certipass") return rawVal.toLowerCase().includes("certipass");
      if (value === "languages") return rawVal.toLowerCase().includes("lang") || rawVal.toLowerCase().includes("lingu");
      return rawVal === value;
    }
    if (columnId === "courseFormat") {
      const formatted = formatCourseFormatLabel(rawVal);
      const targetFormatted = formatCourseFormatLabel(value);
      return formatted === targetFormatted || rawVal.toLowerCase() === value.toLowerCase();
    }
    return rawVal === value;
  };

  const columns: ColumnDef<Course>[] = [
    {
      id: "select",
      header: ({ table }) => (
        <div className="flex items-center justify-center px-2">
          <Checkbox
            checked={
              table.getIsAllPageRowsSelected() ||
              (table.getIsSomePageRowsSelected() && "indeterminate")
            }
            onCheckedChange={(value) => table.toggleAllPageRowsSelected(!!value)}
            aria-label="Select all"
          />
        </div>
      ),
      cell: ({ row }) => (
        <div className="flex items-center justify-center px-2">
          <Checkbox
            checked={row.getIsSelected()}
            onCheckedChange={(value) => row.toggleSelected(!!value)}
            aria-label="Select row"
          />
        </div>
      ),
      enableSorting: false,
      enableHiding: false,
    },
    {
      accessorKey: "nome",
      header: "Corso",
      cell: ({ row }) => {
        const course = row.original;
        const initials = course.nome.slice(0, 2).toUpperCase();
        return (
          <div className="flex items-center gap-3">
            <Avatar className="h-9 w-9 rounded-lg border border-border/50 shrink-0">
              {course.foto ? <AvatarImage src={course.foto} alt={course.nome} className="object-cover" /> : null}
              <AvatarFallback className="text-xs font-bold bg-primary/10 text-primary">
                {initials}
              </AvatarFallback>
            </Avatar>
            <div className="flex flex-col min-w-0">
              <span className="text-sm font-semibold text-foreground truncate">{course.nome}</span>
              <span className="text-xs text-muted-foreground truncate">{formatCategoryLabel(course.categoria)}</span>
            </div>
          </div>
        );
      },
    },
    {
      accessorKey: "categoria",
      header: "Categoria",
      cell: ({ row }) => {
        const rawCat = row.getValue("categoria") as string;
        const cat = formatCategoryLabel(rawCat);
        const colorClasses = categoryColor(rawCat);
        return (
          <Badge variant="secondary" className={`text-xs font-semibold px-2.5 py-0.5 border ${colorClasses}`}>
            {cat}
          </Badge>
        );
      },
      filterFn: exactFilter,
    },
    {
      accessorKey: "courseFormat",
      header: "Formato",
      cell: ({ row }) => (
        <span className="text-sm font-medium text-foreground">
          {formatCourseFormatLabel(row.getValue("courseFormat"))}
        </span>
      ),
      filterFn: exactFilter,
    },
    {
      accessorKey: "orari",
      header: "Orari & Giorni",
      cell: ({ row }) => {
        const course = row.original;
        const hasDays = course.scheduleDays && course.scheduleDays.length > 0;
        const hasTime = !!course.startTime;
        if (!hasDays && !hasTime) {
          return <span className="inline-flex items-center px-2 py-0.5 rounded-md text-xs font-medium text-muted-foreground bg-muted/50">Da concordare</span>;
        }
        return (
          <div className="flex flex-col gap-1">
            {hasDays && (
              <div className="flex flex-wrap gap-1">
                {course.scheduleDays.map((d) => (
                  <Badge key={d} variant="outline" className="text-[10px] uppercase px-1.5 py-0 font-semibold bg-muted/40">
                    {d}
                  </Badge>
                ))}
              </div>
            )}
            {hasTime && (
              <span className="text-xs font-mono text-muted-foreground">
                {course.startTime} {course.endTime ? `- ${course.endTime}` : ""}
              </span>
            )}
          </div>
        );
      },
    },
    {
      accessorKey: "prezzo",
      header: "Prezzo",
      cell: ({ row }) => {
        const val = parseFloat(row.getValue("prezzo") || "0");
        const formatted = new Intl.NumberFormat("it-IT", {
          style: "currency",
          currency: "EUR",
        }).format(val);
        return <span className="text-sm font-semibold text-foreground">{formatted}</span>;
      },
    },
    {
      accessorKey: "stato",
      header: "Stato",
      cell: ({ row }) => {
        const stato = (row.getValue("stato") as string) || "attivo";
        let colorClass = "text-green-600 bg-green-50 dark:text-green-400 dark:bg-green-900/20";
        let label = "Attivo";

        if (stato === "in-programmazione") {
          colorClass = "text-orange-600 bg-orange-50 dark:text-orange-400 dark:bg-orange-900/20";
          label = "Pianificato";
        } else if (stato === "concluso") {
          colorClass = "text-gray-600 bg-gray-50 dark:text-gray-400 dark:bg-gray-900/20";
          label = "Concluso";
        }

        return (
          <Badge variant="secondary" className={`text-xs font-medium border-none ${colorClass}`}>
            {label}
          </Badge>
        );
      },
      filterFn: exactFilter,
    },
    {
      accessorKey: "teacherName",
      header: "Insegnante",
      cell: ({ row }) => {
        const name = row.getValue("teacherName") as string | null;
        return (
          <span className="text-sm text-foreground">
            {name || <span className="text-muted-foreground">—</span>}
          </span>
        );
      },
    },
    {
      accessorKey: "lessonDurationMinutes",
      header: "Durata Lezione",
      cell: ({ row }) => {
        const course = row.original;
        const min = course.lessonDurationMinutes;
        const totalHours = course.totalHours;

        if (!min && totalHours) {
          return <span className="text-sm font-medium text-foreground">{totalHours}h totali</span>;
        }

        if (!min) return <span className="text-muted-foreground text-sm">—</span>;
        const h = Math.floor(min / 60);
        const m = min % 60;
        const label = h > 0 ? (m > 0 ? `${h}h ${m}min` : `${h}h`) : `${m}min`;
        return <span className="text-sm font-medium text-foreground">{label}</span>;
      },
    },
    {
      id: "actions",
      header: "Azioni",
      enableHiding: false,
      cell: ({ row }) => {
        const course = row.original;
        return (
          <div className="flex items-center gap-1">
            <Button
              variant="ghost"
              size="icon"
              className="h-8 w-8 cursor-pointer text-muted-foreground hover:text-foreground"
              onClick={() => handleEditClick(course)}
              title="Modifica"
            >
              <Pencil className="size-4" />
            </Button>
            <Button
              variant="ghost"
              size="icon"
              className="h-8 w-8 cursor-pointer text-muted-foreground hover:text-rose-600 dark:hover:text-rose-400"
              onClick={() => setDeletingCourse(course)}
              title="Elimina"
            >
              <Trash2 className="size-4" />
            </Button>
          </div>
        );
      },
    },
  ];

  const table = useReactTable({
    data: coursesList,
    columns,
    onSortingChange: setSorting,
    onColumnFiltersChange: setColumnFilters,
    getCoreRowModel: getCoreRowModel(),
    getPaginationRowModel: getPaginationRowModel(),
    getSortedRowModel: getSortedRowModel(),
    getFilteredRowModel: getFilteredRowModel(),
    onColumnVisibilityChange: setColumnVisibility,
    onRowSelectionChange: setRowSelection,
    onGlobalFilterChange: setTableSearch,
    state: {
      sorting,
      columnFilters,
      columnVisibility,
      rowSelection,
      globalFilter: tableSearch,
    },
  });

  const categoryFilter = table.getColumn("categoria")?.getFilterValue() as string;
  const formatFilter = table.getColumn("courseFormat")?.getFilterValue() as string;
  const statusFilter = table.getColumn("stato")?.getFilterValue() as string;

  return (
    <div className="p-6 space-y-6 max-w-[1600px] mx-auto w-full">
      {/* Search & Action Bar */}
      <div className="w-full space-y-4">
        <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
          <div className="flex flex-1 items-center space-x-2">
            <div className="relative flex-1 max-w-sm">
              <Search className="absolute left-3 top-1/2 size-4 -translate-y-1/2 text-muted-foreground" />
              <Input
                placeholder="Cerca corsi..."
                value={tableSearch}
                onChange={(e) => setTableSearch(e.target.value)}
                className="pl-9"
              />
            </div>
          </div>
          <div className="flex items-center space-x-2">
            <Button variant="outline" className="cursor-pointer">
              <Download className="mr-2 size-4" />
              Esporta
            </Button>
            <Button onClick={handleNewClick} className="cursor-pointer font-semibold gap-2">
              <Plus className="size-4" />
              Nuovo Corso
            </Button>
          </div>
        </div>

        {/* 4-Column Select Filters */}
        <div className="grid gap-2 sm:grid-cols-4 sm:gap-4">
          <div className="space-y-2">
            <Label htmlFor="category-filter" className="text-sm font-medium">
              Categoria
            </Label>
            <Select
              value={categoryFilter || "all"}
              onValueChange={(value) =>
                table.getColumn("categoria")?.setFilterValue(value === "all" ? "" : value)
              }
            >
              <SelectTrigger className="cursor-pointer w-full" id="category-filter">
                <SelectValue placeholder="Seleziona Categoria" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">Tutte le Categorie</SelectItem>
                {COURSE_CATEGORIES.map(({ value, label }) => (
                  <SelectItem key={value} value={value}>
                    {label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <div className="space-y-2">
            <Label htmlFor="format-filter" className="text-sm font-medium">
              Formato
            </Label>
            <Select
              value={formatFilter || "all"}
              onValueChange={(value) =>
                table.getColumn("courseFormat")?.setFilterValue(value === "all" ? "" : value)
              }
            >
              <SelectTrigger className="cursor-pointer w-full" id="format-filter">
                <SelectValue placeholder="Seleziona Formato" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">Tutti i Formati</SelectItem>
                {COURSE_FORMAT_OPTIONS.map(({ value, label }) => (
                  <SelectItem key={value} value={value}>
                    {label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <div className="space-y-2">
            <Label htmlFor="status-filter" className="text-sm font-medium">
              Stato
            </Label>
            <Select
              value={statusFilter || "all"}
              onValueChange={(value) =>
                table.getColumn("stato")?.setFilterValue(value === "all" ? "" : value)
              }
            >
              <SelectTrigger className="cursor-pointer w-full" id="status-filter">
                <SelectValue placeholder="Seleziona Stato" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">Tutti gli Stati</SelectItem>
                <SelectItem value="attivo">Attivo</SelectItem>
                <SelectItem value="in-programmazione">Pianificato</SelectItem>
                <SelectItem value="concluso">Concluso</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <div className="space-y-2">
            <Label htmlFor="column-visibility" className="text-sm font-medium">
              Visibilità Colonne
            </Label>
            <DropdownMenu>
              <DropdownMenuTrigger asChild id="column-visibility">
                <Button variant="outline" className="cursor-pointer w-full justify-between">
                  Colonne <ChevronDown className="ml-2 size-4" />
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end" className="w-48">
                {table
                  .getAllColumns()
                  .filter((column) => column.getCanHide())
                  .map((column) => {
                    const label =
                      typeof column.columnDef.header === "string"
                        ? column.columnDef.header
                        : column.id;
                    return (
                      <DropdownMenuCheckboxItem
                        key={column.id}
                        className="cursor-pointer"
                        checked={column.getIsVisible()}
                        onCheckedChange={(value) => column.toggleVisibility(!!value)}
                      >
                        {label}
                      </DropdownMenuCheckboxItem>
                    );
                  })}
              </DropdownMenuContent>
            </DropdownMenu>
          </div>
        </div>

        {/* Data Table */}
        <div className="rounded-md border bg-card">
          <Table>
            <TableHeader>
              {table.getHeaderGroups().map((headerGroup) => (
                <TableRow key={headerGroup.id}>
                  {headerGroup.headers.map((header) => (
                    <TableHead key={header.id}>
                      {header.isPlaceholder
                        ? null
                        : flexRender(header.column.columnDef.header, header.getContext())}
                    </TableHead>
                  ))}
                </TableRow>
              ))}
            </TableHeader>
            <TableBody>
              {table.getRowModel().rows?.length ? (
                table.getRowModel().rows.map((row) => (
                  <TableRow key={row.id} data-state={row.getIsSelected() && "selected"}>
                    {row.getVisibleCells().map((cell) => (
                      <TableCell key={cell.id}>
                        {flexRender(cell.column.columnDef.cell, cell.getContext())}
                      </TableCell>
                    ))}
                  </TableRow>
                ))
              ) : (
                <TableRow>
                  <TableCell colSpan={columns.length} className="h-24 text-center">
                    Nessun corso trovato.
                  </TableCell>
                </TableRow>
              )}
            </TableBody>
          </Table>
        </div>

        {/* Pagination Bar */}
        <div className="flex flex-col sm:flex-row items-center justify-between gap-4 py-4 px-1">
          <div className="flex items-center gap-3 text-sm font-medium text-foreground">
            <span>Rows per page</span>
            <Select value={pageSize} onValueChange={(val) => { setPageSize(val); table.setPageSize(Number(val)); }}>
              <SelectTrigger className="h-9 w-[70px] cursor-pointer rounded-lg border-border/60 bg-background px-3">
                <SelectValue placeholder={pageSize} />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="10">10</SelectItem>
                <SelectItem value="20">20</SelectItem>
                <SelectItem value="50">50</SelectItem>
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
      </div>

      {/* Course Form Sheet */}
      <Sheet open={open} onOpenChange={(v) => !v && handleCloseDialog()}>
        <SheetContent side="right" className="w-full sm:max-w-xl overflow-y-auto p-6">
          <SheetHeader className="mb-4">
            <SheetTitle className="text-xl font-bold">
              {editing ? "Modifica Corso" : "Nuovo Corso"}
            </SheetTitle>
          </SheetHeader>
          <CourseForm
            key={editing ? editing.id : "new"}
            initialValues={initialFormValues}
            onSubmit={handleFormSubmit}
            onCancel={handleCloseDialog}
            submitLabel={editing ? "Salva Modifiche" : "Crea Corso"}
          />
        </SheetContent>
      </Sheet>

      {/* Confirmation Dialog before Delete */}
      <AlertDialog open={!!deletingCourse} onOpenChange={(v) => !v && setDeletingCourse(null)}>
        <AlertDialogContent className="sm:max-w-md">
          <AlertDialogHeader>
            <AlertDialogTitle className="text-lg font-bold text-foreground">
              Elimina Corso
            </AlertDialogTitle>
            <AlertDialogDescription className="text-sm text-muted-foreground mt-2">
              Sei sicuro di voler eliminare il corso <strong className="text-foreground">{deletingCourse?.nome}</strong>? Questa azione è irreversibile.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter className="mt-4 gap-2 sm:gap-0">
            <AlertDialogCancel className="cursor-pointer">Annulla</AlertDialogCancel>
            <AlertDialogAction
              className="bg-rose-600 hover:bg-rose-700 text-white font-medium cursor-pointer"
              onClick={async () => {
                if (deletingCourse) {
                  await handleDeleteClick(deletingCourse);
                  setDeletingCourse(null);
                }
              }}
            >
              Elimina
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}
