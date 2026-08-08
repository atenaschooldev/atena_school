"use client";

import { useState, useMemo } from "react";
import { useUsers } from "../hooks/use-users";
import { UsersMetrics } from "./users-metrics";
import { getUsersTableColumns } from "./users-table-columns";
import { UserFormDialog } from "./dialogs/user-form-dialog";
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
import type { User } from "../types";

export function UsersView() {
  const { users, loading, selectedRole, setSelectedRole, addUser, deleteUser } = useUsers();

  const [searchQuery, setSearchQuery] = useState("");
  const [deletingUserId, setDeletingUserId] = useState<string | null>(null);
  const [sorting, setSorting] = useState<SortingState>([]);

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
        onEdit: (u) => {
          // Edit handler
        },
        onDelete: (id) => setDeletingUserId(id),
      }),
    []
  );

  const table = useReactTable({
    data: filteredUsers,
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
      <UsersMetrics users={users} />

      <div className="@container/main px-4 lg:px-6 space-y-4">
        <DataViewToolbar
          searchQuery={searchQuery}
          onSearchChange={setSearchQuery}
          searchPlaceholder="Cerca utente per nome, email..."
          filters={[
            {
              value: selectedRole,
              onChange: setSelectedRole,
              placeholder: "Ruolo Utente",
              options: [
                { value: "all", label: "Tutti i ruoli" },
                { value: "admin", label: "Amministratore" },
                { value: "teacher", label: "Docente" },
                { value: "student", label: "Studente" },
              ],
            },
          ]}
          actionElement={<UserFormDialog onAddUser={addUser} />}
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
                      Nessun utente trovato.
                    </TableCell>
                  </TableRow>
                )}
              </TableBody>
            </Table>
          </div>

          <DataTablePagination table={table} />
        </div>
      </div>

      <DeleteConfirmDialog
        open={!!deletingUserId}
        onOpenChange={(v) => !v && setDeletingUserId(null)}
        title="Elimina Utente"
        description="Sei sicuro di voler eliminare questo utente? L'operazione non può essere annullata."
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
