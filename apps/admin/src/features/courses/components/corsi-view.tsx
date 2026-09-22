"use client";

import { useState, useMemo } from "react";
import { Plus } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent } from "@/components/ui/dialog";
import { useCourses } from "../hooks/use-courses";
import { CoursesMetrics } from "./courses-metrics";
import { getCoursesTableColumns } from "./courses-table-columns";
import { CourseCard } from "./course-card";
import { CourseForm } from "./course-form";
import { DataViewToolbar } from "@/components/shared/data-view-toolbar";
import { DeleteConfirmDialog } from "@/components/delete-confirm-dialog";
import { DataTablePagination } from "@/components/ui/data-table-pagination";
import { TableSkeletonRows } from "@/components/ui/table-skeleton";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  type SortingState,
  flexRender,
  getCoreRowModel,
  getPaginationRowModel,
  getSortedRowModel,
  getFilteredRowModel,
  useReactTable,
} from "@tanstack/react-table";
import type { Course } from "../types";

import { useTranslation } from "@/i18n/context";

export function CorsiView() {
  const { t } = useTranslation();
  const {
    coursesList,
    loading,
    open,
    editing,
    initialFormValues,
    handleNewClick,
    handleEditClick,
    handleDeleteClick,
    handleFormSubmit,
    handleCloseDialog,
  } = useCourses();

  const [searchQuery, setSearchQuery] = useState("");
  const [categoryFilter, setCategoryFilter] = useState("all");
  const [statusFilter, setStatusFilter] = useState("all");
  const [formatFilter, setFormatFilter] = useState("all");
  const [viewMode, setViewMode] = useState<"table" | "grid">("table");
  const [deletingCourse, setDeletingCourse] = useState<Course | null>(null);
  const [sorting, setSorting] = useState<SortingState>([
    { id: "nome", desc: false },
  ]);

  const categories = useMemo(() => {
    const map = new Map<string, string>();
    coursesList.forEach((c) => {
      if (c.categoria) {
        map.set(c.categoria, c.categoryName || formatCategoryLabel(c.categoria, t));
      }
    });
    return Array.from(map.entries()).map(([value, label]) => ({ value, label }));
  }, [coursesList, t]);

  const filteredCourses = useMemo(() => {
    return coursesList.filter((c) => {
      const q = searchQuery.toLowerCase().trim();
      if (q) {
        const matchName = (c.nome || "").toLowerCase().includes(q);
        const matchCat = (c.categoria || "").toLowerCase().includes(q) || (c.categoryName || "").toLowerCase().includes(q);
        if (!matchName && !matchCat) return false;
      }
      if (categoryFilter !== "all" && c.categoria !== categoryFilter && c.categoryId !== categoryFilter) return false;
      if (statusFilter !== "all" && (c.stato || "attivo") !== statusFilter) return false;
      if (formatFilter !== "all" && c.courseFormat !== formatFilter) return false;
      return true;
    });
  }, [coursesList, searchQuery, categoryFilter, statusFilter, formatFilter]);

  const columns = useMemo(
    () =>
      getCoursesTableColumns({
        onEdit: (c) => handleEditClick(c),
        onDelete: (c) => setDeletingCourse(c),
        t,
      }),
    [handleEditClick, t]
  );

  const table = useReactTable({
    data: filteredCourses,
    columns,
    state: { sorting },
    onSortingChange: setSorting,
    getCoreRowModel: getCoreRowModel(),
    getPaginationRowModel: getPaginationRowModel(),
    getSortedRowModel: getSortedRowModel(),
    getFilteredRowModel: getFilteredRowModel(),
  });

  return (
    <div className="flex flex-col gap-4">
      <CoursesMetrics courses={coursesList} />

      <div className="@container/main px-4 lg:px-6 space-y-4">
        <DataViewToolbar
          searchQuery={searchQuery}
          onSearchChange={setSearchQuery}
          searchPlaceholder={t("courses.searchPlaceholder") || t("common.search")}
          filters={[
            {
              value: categoryFilter,
              onChange: setCategoryFilter,
              placeholder: t("courses.language"),
              options: [
                { value: "all", label: t("courses.allCategories") },
                ...categories,
              ],
            },
            {
              value: statusFilter,
              onChange: setStatusFilter,
              placeholder: t("common.status"),
              options: [
                { value: "all", label: t("courses.allStatuses") },
                { value: "attivo", label: t("common.active") },
                { value: "in-programmazione", label: t("courses.inPlanning") },
                { value: "concluso", label: t("common.completed") },
              ],
            },
          ]}
          actionElement={
            <Button onClick={handleNewClick} className="font-medium cursor-pointer shadow-sm text-xs">
              <Plus className="mr-1.5 h-4 w-4" /> {t("courses.addCourse")}
            </Button>
          }
          viewMode={viewMode}
          onViewModeChange={setViewMode}
        />

        {viewMode === "table" ? (
          <div className="space-y-4">
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
                  {loading ? (
                    <TableSkeletonRows columnsCount={columns.length} rowCount={6} />
                  ) : table.getRowModel().rows?.length ? (
                    table.getRowModel().rows.map((row) => (
                      <TableRow key={row.id} className="hover:bg-muted/50 transition-all duration-200">
                        {row.getVisibleCells().map((cell) => (
                          <TableCell key={cell.id}>
                            {flexRender(cell.column.columnDef.cell, cell.getContext())}
                          </TableCell>
                        ))}
                      </TableRow>
                    ))
                  ) : (
                    <TableRow>
                      <TableCell colSpan={columns.length} className="h-24 text-center text-muted-foreground">
                        Nessun corso trovato.
                      </TableCell>
                    </TableRow>
                  )}
                </TableBody>
              </Table>
            </div>

            <DataTablePagination table={table} />
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 2xl:grid-cols-4 gap-4">
            {filteredCourses.map((course) => (
              <CourseCard
                key={course.id}
                course={course}
                onEdit={handleEditClick}
                onDelete={(c) => setDeletingCourse(c)}
              />
            ))}
            {filteredCourses.length === 0 && (
              <div className="col-span-full py-12 text-center text-sm text-muted-foreground border rounded-md">
                Nessun corso trovato.
              </div>
            )}
          </div>
        )}
      </div>

      <Dialog open={open} onOpenChange={(v) => !v && handleCloseDialog()}>
        <DialogContent className="sm:max-w-[650px] p-6 max-h-[90vh] overflow-y-auto">
          <CourseForm
            initialValues={initialFormValues}
            onSubmit={handleFormSubmit}
            onCancel={handleCloseDialog}
            submitLabel={editing ? "Salva Modifiche" : "Crea Corso"}
          />
        </DialogContent>
      </Dialog>

      <DeleteConfirmDialog
        open={!!deletingCourse}
        onOpenChange={(v) => !v && setDeletingCourse(null)}
        title="Elimina Corso"
        description={`Sei sicuro di voler eliminare il corso "${deletingCourse?.nome}"? Questa azione non può essere annullata.`}
        onConfirm={async () => {
          if (deletingCourse) {
            await handleDeleteClick(deletingCourse);
            setDeletingCourse(null);
          }
        }}
      />
    </div>
  );
}
