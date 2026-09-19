"use client";

import { useState, useMemo } from "react";
import { useGroups } from "../hooks/use-groups";
import { GroupsMetrics } from "./groups-metrics";
import { getGroupsTableColumns } from "./groups-table-columns";
import { CreateGroupDialog } from "./create-group-dialog";
import { GroupDetailDialog } from "./group-detail-dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Plus, Search, Users, RefreshCw } from "lucide-react";
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
import { DataTablePagination } from "@/components/ui/data-table-pagination";
import { TableSkeletonRows } from "@/components/ui/table-skeleton";
import type { Group } from "../types";

export function GroupsView() {
  const [searchQuery, setSearchQuery] = useState("");
  const [statusFilter, setStatusFilter] = useState<string>("all");
  const [isCreateOpen, setIsCreateOpen] = useState(false);
  const [selectedGroup, setSelectedGroup] = useState<Group | null>(null);
  const [isDetailOpen, setIsDetailOpen] = useState(false);
  const [sorting, setSorting] = useState<SortingState>([]);

  const {
    groups,
    isLoading,
    refetch,
    createGroup,
    deleteGroup,
    addMember,
    removeMember,
  } = useGroups();

  const filteredGroups = useMemo(() => {
    return groups.filter((g) => {
      const q = searchQuery.toLowerCase().trim();
      if (q) {
        const matchName = (g.name || "").toLowerCase().includes(q);
        const matchCourse = (g.courseName || "").toLowerCase().includes(q);
        const matchTeacher = (g.teacherName || "").toLowerCase().includes(q);
        if (!matchName && !matchCourse && !matchTeacher) return false;
      }
      if (statusFilter !== "all" && String(g.status) !== statusFilter) {
        return false;
      }
      return true;
    });
  }, [groups, searchQuery, statusFilter]);

  const handleViewDetails = (group: Group) => {
    setSelectedGroup(group);
    setIsDetailOpen(true);
  };

  const columns = useMemo(
    () =>
      getGroupsTableColumns({
        onViewDetails: handleViewDetails,
        onDeleteGroup: deleteGroup,
      }),
    [deleteGroup]
  );

  const table = useReactTable({
    data: filteredGroups,
    columns,
    state: {
      sorting,
    },
    onSortingChange: setSorting,
    getCoreRowModel: getCoreRowModel(),
    getPaginationRowModel: getPaginationRowModel(),
    getSortedRowModel: getSortedRowModel(),
    getFilteredRowModel: getFilteredRowModel(),
    initialState: {
      pagination: {
        pageSize: 10,
      },
    },
  });

  return (
    <div className="space-y-6">
      {/* Top Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-foreground flex items-center gap-2">
            <Users className="w-6 h-6 text-primary" />
            Gruppi e Classi
          </h1>
          <p className="text-xs text-muted-foreground mt-1">
            Gestisci la composizione delle classi, capienza dei gruppi e orari condivisi
          </p>
        </div>
        <div className="flex items-center gap-2">
          <Button
            variant="outline"
            size="sm"
            onClick={() => refetch()}
            className="h-9 gap-1.5 text-xs"
          >
            <RefreshCw className="w-3.5 h-3.5" />
            Aggiorna
          </Button>
          <Button
            size="sm"
            onClick={() => setIsCreateOpen(true)}
            className="h-9 gap-1.5 text-xs shadow-sm"
          >
            <Plus className="w-4 h-4" />
            Nuovo Gruppo
          </Button>
        </div>
      </div>

      {/* Metrics Cards */}
      <GroupsMetrics groups={groups} />

      {/* Filter and Search Bar */}
      <div className="flex flex-col sm:flex-row items-center justify-between gap-3">
        <div className="relative w-full sm:w-80">
          <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
          <Input
            placeholder="Cerca gruppo, corso o docente..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="pl-8 text-xs h-9"
          />
        </div>
        <div className="flex items-center gap-2 w-full sm:w-auto">
          <select
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
            className="text-xs h-9 px-3 rounded-lg border border-input bg-background text-foreground"
          >
            <option value="all">Tutti gli stati</option>
            <option value="1">Iscrizioni aperte</option>
            <option value="2">In corso</option>
            <option value="3">Completato</option>
            <option value="4">Archiviato</option>
          </select>
        </div>
      </div>

      {/* Main Table */}
      <div className="rounded-xl border border-border/60 bg-card overflow-hidden shadow-sm">
        <Table>
          <TableHeader>
            {table.getHeaderGroups().map((headerGroup) => (
              <TableRow key={headerGroup.id}>
                {headerGroup.headers.map((header) => (
                  <TableHead key={header.id} className="text-xs">
                    {header.isPlaceholder
                      ? null
                      : flexRender(header.column.columnDef.header, header.getContext())}
                  </TableHead>
                ))}
              </TableRow>
            ))}
          </TableHeader>
          <TableBody>
            {isLoading ? (
              <TableSkeletonRows columnsCount={columns.length} rowsCount={5} />
            ) : table.getRowModel().rows?.length ? (
              table.getRowModel().rows.map((row) => (
                <TableRow key={row.id}>
                  {row.getVisibleCells().map((cell) => (
                    <TableCell key={cell.id} className="text-xs py-3">
                      {flexRender(cell.column.columnDef.cell, cell.getContext())}
                    </TableCell>
                  ))}
                </TableRow>
              ))
            ) : (
              <TableRow>
                <TableCell colSpan={columns.length} className="h-32 text-center text-xs text-muted-foreground">
                  Nessun gruppo trovato.
                </TableCell>
              </TableRow>
            )}
          </TableBody>
        </Table>

        {table.getPageCount() > 1 && (
          <div className="p-3 border-t">
            <DataTablePagination table={table} />
          </div>
        )}
      </div>

      {/* Create Dialog */}
      <CreateGroupDialog
        open={isCreateOpen}
        onOpenChange={setIsCreateOpen}
        onSubmit={createGroup}
      />

      {/* Detail Dialog */}
      <GroupDetailDialog
        group={selectedGroup}
        open={isDetailOpen}
        onOpenChange={setIsDetailOpen}
        onAddMember={async (groupId, values) => {
          await addMember({ groupId, values });
          // Refresh local selected group
          refetch().then((res) => {
            const updated = res.data?.find((g) => g.id === groupId);
            if (updated) setSelectedGroup(updated);
          });
        }}
        onRemoveMember={async (groupId, studentId) => {
          await removeMember({ groupId, studentId });
          refetch().then((res) => {
            const updated = res.data?.find((g) => g.id === groupId);
            if (updated) setSelectedGroup(updated);
          });
        }}
      />
    </div>
  );
}
