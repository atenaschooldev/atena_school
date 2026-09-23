"use client";

import { useState, useMemo } from "react";
import { Plus, BookOpen, Folder, Settings, Layers } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent } from "@/components/ui/dialog";
import { useCourses } from "../hooks/use-courses";
import { useCourseCategories } from "../hooks/use-course-categories";
import { useCourseSettings } from "../hooks/use-course-settings";
import { CoursesMetrics } from "./courses-metrics";
import { getCoursesTableColumns } from "./courses-table-columns";
import { CourseForm } from "./course-form";
import { CourseCategoriesView } from "./course-categories-view";
import { CourseSettingsView } from "./course-settings-view";
import { DataViewToolbar } from "@/components/shared/data-view-toolbar";
import { DeleteConfirmDialog } from "@/components/delete-confirm-dialog";
import { DataTablePagination } from "@/components/ui/data-table-pagination";
import { TableSkeletonRows } from "@/components/ui/table-skeleton";
import { formatCategoryLabel } from "../utils";
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
  const [activeTab, setActiveTab] = useState<"courses" | "categories" | "settings">("courses");

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

  const { categories: categoryList } = useCourseCategories();
  const { settings: settingsList } = useCourseSettings();

  const [searchQuery, setSearchQuery] = useState("");
  const [categoryFilter, setCategoryFilter] = useState("all");
  const [statusFilter, setStatusFilter] = useState("all");
  const [formatFilter, setFormatFilter] = useState("all");
  const [deletingCourse, setDeletingCourse] = useState<Course | null>(null);
  const [sorting, setSorting] = useState<SortingState>([
    { id: "nome", desc: false },
  ]);

  const categories = useMemo(() => {
    const map = new Map<string, string>();
    // First fill from database categories
    categoryList.forEach((c) => {
      map.set(c.slug || c.id, c.name);
    });
    // Supplement from coursesList
    coursesList.forEach((c) => {
      if (c.categoria && !map.has(c.categoria)) {
        map.set(c.categoria, c.categoryName || formatCategoryLabel(c.categoria, t));
      }
    });
    return Array.from(map.entries()).map(([value, label]) => ({ value, label }));
  }, [categoryList, coursesList, t]);

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
      {/* ── Top Navigation Tabs (Courses vs Categories vs Settings) ── */}
      <div className="px-4 lg:px-6 flex items-center justify-between border-b pb-3">
        <div className="flex items-center gap-2">
          <div className="flex rounded-xl bg-muted/50 p-1 border">
            <button
              type="button"
              onClick={() => setActiveTab("courses")}
              className={`flex items-center gap-2 px-4 py-2 rounded-lg text-xs font-bold transition-all cursor-pointer ${
                activeTab === "courses"
                  ? "bg-background shadow-xs text-foreground"
                  : "text-muted-foreground hover:text-foreground"
              }`}
            >
              <BookOpen className="h-4 w-4" />
              {t("courses.tabCourses") || "Catalogo Corsi"} ({coursesList.length})
            </button>
            <button
              type="button"
              onClick={() => setActiveTab("categories")}
              className={`flex items-center gap-2 px-4 py-2 rounded-lg text-xs font-bold transition-all cursor-pointer ${
                activeTab === "categories"
                  ? "bg-background shadow-xs text-foreground"
                  : "text-muted-foreground hover:text-foreground"
              }`}
            >
              <Folder className="h-4 w-4 text-sky-500" />
              {t("courses.tabCategories") || "Categorie"} ({categoryList.length})
            </button>
            <button
              type="button"
              onClick={() => setActiveTab("settings")}
              className={`flex items-center gap-2 px-4 py-2 rounded-lg text-xs font-bold transition-all cursor-pointer ${
                activeTab === "settings"
                  ? "bg-background shadow-xs text-foreground"
                  : "text-muted-foreground hover:text-foreground"
              }`}
            >
              <Settings className="h-4 w-4 text-amber-500" />
              {t("courses.tabSettings") || "Preset & Configurazioni"} ({settingsList.length})
            </button>
          </div>
        </div>
      </div>

      {activeTab === "categories" ? (
        <CourseCategoriesView />
      ) : activeTab === "settings" ? (
        <CourseSettingsView />
      ) : (
        <>
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
            />

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
                          {t("courses.noCoursesFound") || "Nessun corso trovato."}
                        </TableCell>
                      </TableRow>
                    )}
                  </TableBody>
                </Table>
              </div>

              <DataTablePagination table={table} />
            </div>
          </div>

          <Dialog open={open} onOpenChange={(v) => !v && handleCloseDialog()}>
            <DialogContent className="sm:max-w-[650px] p-6 max-h-[90vh] overflow-y-auto">
              <CourseForm
                initialValues={initialFormValues}
                onSubmit={handleFormSubmit}
                onCancel={handleCloseDialog}
                submitLabel={editing ? (t("common.save") || "Salva Modifiche") : (t("courses.createCourseBtn") || "Crea Corso")}
              />
            </DialogContent>
          </Dialog>

          <DeleteConfirmDialog
            open={!!deletingCourse}
            onOpenChange={(v) => !v && setDeletingCourse(null)}
            title={t("courses.deleteCourseConfirmTitle") || "Elimina Corso"}
            description={
              (
                t("courses.deleteCourseConfirmDesc") ||
                "Sei sicuro di voler eliminare il corso \"{name}\"? Questa azione non può essere annullata."
              ).replace("{name}", deletingCourse?.nome || "")
            }
            onConfirm={async () => {
              if (deletingCourse) {
                await handleDeleteClick(deletingCourse);
                setDeletingCourse(null);
              }
            }}
          />
        </>
      )}
    </div>
  );
}
