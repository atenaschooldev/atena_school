"use client";

import { useState, useMemo } from "react";
import { Plus } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useTeachers } from "../hooks/use-teachers";
import { TeachersMetrics } from "./teachers-metrics";
import { getTeachersTableColumns } from "./teachers-table-columns";
import { TeacherFormDialog } from "./dialogs/teacher-form-dialog";
import { DataViewToolbar } from "@/components/shared/data-view-toolbar";
import { DeleteConfirmDialog } from "@/components/delete-confirm-dialog";
import { DataTablePagination } from "@/components/ui/data-table-pagination";
import { TableSkeletonRows } from "@/components/ui/table-skeleton";
import { useTranslation } from "@/i18n/context";
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
    state: { sorting },
    onSortingChange: setSorting,
    getCoreRowModel: getCoreRowModel(),
    getPaginationRowModel: getPaginationRowModel(),
    getSortedRowModel: getSortedRowModel(),
    getFilteredRowModel: getFilteredRowModel(),
  });

  return (
    <div className="flex flex-col gap-4">
      <TeachersMetrics teachers={teachers} />

      <div className="@container/main px-4 lg:px-6 space-y-4">
        <DataViewToolbar
          searchQuery={searchQuery}
          onSearchChange={setSearchQuery}
          searchPlaceholder={t("teachers.searchPlaceholder")}
          filters={[
            {
              value: statusFilter,
              onChange: setStatusFilter,
              placeholder: t("teachers.teacherStatus"),
              options: [
                { value: "all", label: t("common.all") },
                { value: "active", label: t("common.active") },
                { value: "inactive", label: t("common.inactive") },
              ],
            },
          ]}
          actionElement={
            <Button
              onClick={() => {
                setEditingTeacher(null);
                setFormDialogOpen(true);
              }}
              className="font-medium cursor-pointer shadow-xs text-xs"
            >
              <Plus className="mr-1.5 h-4 w-4" /> {t("teachers.newTeacher")}
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
                  <TableSkeletonRows columnsCount={columns.length} rowsCount={6} />
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
                      {t("teachers.noTeachersFound")}
                    </TableCell>
                  </TableRow>
                )}
              </TableBody>
            </Table>
          </div>

          <DataTablePagination table={table} />
        </div>
      </div>

      <TeacherFormDialog
        open={formDialogOpen}
        onOpenChange={setFormDialogOpen}
        initialValues={editingTeacher}
        onSubmit={async (values) => {
          if (editingTeacher) {
            await updateTeacher(editingTeacher.id, values);
          } else {
            await createTeacher(values);
          }
        }}
      />

      <DeleteConfirmDialog
        open={!!deletingTeacherId}
        onOpenChange={(v) => !v && setDeletingTeacherId(null)}
        title={t("teachers.deleteConfirmTitle")}
        description={t("teachers.deleteConfirmDesc")}
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
