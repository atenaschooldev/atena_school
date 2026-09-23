"use client";

import { useState, useMemo } from "react";
import { Plus } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useTeachers } from "../hooks/use-teachers";
import { TeachersMetrics } from "./teachers-metrics";
import { getTeachersTableColumns } from "./teachers-table-columns";
import { TeacherFormDialog } from "./dialogs/teacher-form-dialog";
import { DeleteConfirmDialog } from "@/components/delete-confirm-dialog";
import { AtenaDataTable } from "@/components/shared/data-table/atena-data-table";
import { DataTableToolbar } from "@/components/shared/data-table/data-table-toolbar";
import { useTranslation } from "@/i18n/context";
import {
  type SortingState,
  type ColumnFiltersState,
  type VisibilityState,
  getCoreRowModel,
  getPaginationRowModel,
  getSortedRowModel,
  getFilteredRowModel,
  useReactTable,
} from "@tanstack/react-table";
import type { Teacher } from "../types";

export function TeachersView() {
  const { t } = useTranslation();
  const { teachers, loading, createTeacher, updateTeacher, deleteTeacher } = useTeachers();

  const [searchQuery, setSearchQuery] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");
  const [formDialogOpen, setFormDialogOpen] = useState(false);
  const [editingTeacher, setEditingTeacher] = useState<Teacher | null>(null);
  const [deletingTeacherId, setDeletingTeacherId] = useState<string | null>(null);
  const [sorting, setSorting] = useState<SortingState>([]);
  const [columnFilters, setColumnFilters] = useState<ColumnFiltersState>([]);
  const [columnVisibility, setColumnVisibility] = useState<VisibilityState>({});
  const [rowSelection, setRowSelection] = useState({});

  const filteredTeachers = useMemo(() => {
    return teachers.filter((teacher) => {
      const q = searchQuery.toLowerCase().trim();
      if (q) {
        const name = (teacher.fullName || `${teacher.nome || ""} ${teacher.cognome || ""}`).toLowerCase();
        const email = (teacher.email || "").toLowerCase();
        if (!name.includes(q) && !email.includes(q)) return false;
      }
      if (statusFilter !== "all" && (teacher.status || "active") !== statusFilter) return false;
      return true;
    });
  }, [teachers, searchQuery, statusFilter]);

  const columns = useMemo(
    () =>
      getTeachersTableColumns({
        onEdit: (teacher) => {
          setEditingTeacher(teacher);
          setFormDialogOpen(true);
        },
        onDelete: (id) => setDeletingTeacherId(id),
        t,
      }),
    [t]
  );

  const table = useReactTable({
    data: filteredTeachers,
    columns,
    state: {
      sorting,
      columnFilters,
      columnVisibility,
      rowSelection,
    },
    enableRowSelection: true,
    onRowSelectionChange: setRowSelection,
    onSortingChange: setSorting,
    onColumnFiltersChange: setColumnFilters,
    onColumnVisibilityChange: setColumnVisibility,
    getCoreRowModel: getCoreRowModel(),
    getPaginationRowModel: getPaginationRowModel(),
    getSortedRowModel: getSortedRowModel(),
    getFilteredRowModel: getFilteredRowModel(),
  });

  const statusOptions = [
    { value: "all", label: t("common.all") },
    { value: "active", label: t("common.active") },
    { value: "inactive", label: t("common.inactive") },
  ];

  return (
    <div className="flex flex-col gap-6">
      <TeachersMetrics teachers={teachers} />

      <div className="@container/main px-4 lg:px-6 space-y-4">
        <DataTableToolbar
          table={table}
          searchKey="fullName"
          searchPlaceholder={t("teachers.searchPlaceholder")}
          searchValue={searchQuery}
          onSearchChange={setSearchQuery}
          filterKey="status"
          filterTitle={t("teachers.teacherStatus")}
          filterValue={statusFilter}
          onFilterChange={setStatusFilter}
          filterOptions={statusOptions}
          actionButton={
            <Button
              size="sm"
              onClick={() => {
                setEditingTeacher(null);
                setFormDialogOpen(true);
              }}
              className="h-8 text-xs font-semibold gap-1.5 cursor-pointer rounded-lg shadow-xs"
            >
              <Plus className="h-4 w-4" />
              <span>{t("teachers.newTeacher")}</span>
            </Button>
          }
        />

        <AtenaDataTable
          table={table}
          columns={columns}
          loading={loading}
          emptyMessage={t("teachers.emptyState.title") || t("teachers.searchPlaceholder")}
        />
      </div>

      <TeacherFormDialog
        open={formDialogOpen}
        onOpenChange={setFormDialogOpen}
        initialData={editingTeacher}
        onSubmit={async (values) => {
          if (editingTeacher) {
            await updateTeacher({ id: editingTeacher.id, ...values });
          } else {
            await createTeacher(values);
          }
          setFormDialogOpen(false);
          setEditingTeacher(null);
        }}
      />

      <DeleteConfirmDialog
        open={!!deletingTeacherId}
        onOpenChange={(open) => !open && setDeletingTeacherId(null)}
        onConfirm={async () => {
          if (deletingTeacherId) {
            await deleteTeacher(deletingTeacherId);
            setDeletingTeacherId(null);
          }
        }}
      />
    </div>
  );
}
