"use client";

import { useState, useMemo } from "react";
import { useUsers } from "../hooks/use-users";
import { UsersMetrics } from "./users-metrics";
import { getUsersTableColumns } from "./users-table-columns";
import { UserFormDialog } from "./dialogs/user-form-dialog";
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
import type { User } from "../types";

export function UsersView() {
  const { t } = useTranslation();
  const { users, loading, selectedRole, setSelectedRole, addUser, deleteUser } = useUsers();

  const [searchQuery, setSearchQuery] = useState("");
  const [deletingUserId, setDeletingUserId] = useState<string | null>(null);
  const [sorting, setSorting] = useState<SortingState>([]);
  const [columnFilters, setColumnFilters] = useState<ColumnFiltersState>([]);
  const [columnVisibility, setColumnVisibility] = useState<VisibilityState>({});
  const [rowSelection, setRowSelection] = useState({});

  const filteredUsers = useMemo(() => {
    return users.filter((u) => {
      const q = searchQuery.toLowerCase().trim();
      if (q) {
        const name = (u.name || "").toLowerCase();
        const email = (u.email || "").toLowerCase();
        if (!name.includes(q) && !email.includes(q)) return false;
      }
      return true;
    });
  }, [users, searchQuery]);

  const columns = useMemo(
    () =>
      getUsersTableColumns({
        onEdit: (_u) => {},
        onDelete: (id) => setDeletingUserId(id),
        t,
      }),
    [t]
  );

  const table = useReactTable({
    data: filteredUsers,
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

  const roleOptions = [
    { value: "all", label: t("users.allRoles") },
    { value: "admin", label: t("roles.admin") },
    { value: "teacher", label: t("roles.teacher") },
    { value: "student", label: t("roles.student") },
  ];

  return (
    <div className="flex flex-col gap-6">
      <UsersMetrics users={users} />

      <div className="@container/main px-4 lg:px-6 space-y-4">
        <DataTableToolbar
          table={table}
          searchKey="name"
          searchPlaceholder={t("users.searchPlaceholder")}
          searchValue={searchQuery}
          onSearchChange={setSearchQuery}
          filterKey="role"
          filterTitle={t("users.role")}
          filterValue={selectedRole}
          onFilterChange={setSelectedRole}
          filterOptions={roleOptions}
          actionButton={<UserFormDialog onAddUser={addUser} />}
        />

        <AtenaDataTable
          table={table}
          columns={columns}
          loading={loading}
          emptyMessage={t("users.noUsersFound")}
        />
      </div>

      <DeleteConfirmDialog
        open={!!deletingUserId}
        onOpenChange={(open) => !open && setDeletingUserId(null)}
        onConfirm={async () => {
          if (deletingUserId) {
            await deleteUser(deletingUserId);
            setDeletingUserId(null);
          }
        }}
      />
    </div>
  );
}
