"use client";

import { useState, useMemo } from "react";
import { useGroups } from "../hooks/use-groups";
import { GroupsMetrics } from "./groups-metrics";
import { getGroupsTableColumns } from "./groups-table-columns";
import { CreateGroupDialog } from "./create-group-dialog";
import { GroupDetailDialog } from "./group-detail-dialog";
import { Button } from "@/components/ui/button";
import { Plus, Users, RefreshCw } from "lucide-react";
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
import { AtenaDataTable } from "@/components/shared/data-table/atena-data-table";
import { DataTableToolbar } from "@/components/shared/data-table/data-table-toolbar";
import { useTranslation } from "@/i18n/context";
import type { Group } from "../types";

export function GroupsView() {
  const { t } = useTranslation();
  const [searchQuery, setSearchQuery] = useState("");
  const [statusFilter, setStatusFilter] = useState<string>("all");
  const [isCreateOpen, setIsCreateOpen] = useState(false);
  const [selectedGroup, setSelectedGroup] = useState<Group | null>(null);
  const [isDetailOpen, setIsDetailOpen] = useState(false);
  const [sorting, setSorting] = useState<SortingState>([]);
  const [columnFilters, setColumnFilters] = useState<ColumnFiltersState>([]);
  const [columnVisibility, setColumnVisibility] = useState<VisibilityState>({});

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
        t,
      }),
    [deleteGroup, t]
  );

  const table = useReactTable({
    data: filteredGroups,
    columns,
    state: {
      sorting,
      columnFilters,
      columnVisibility,
    },
    onSortingChange: setSorting,
    onColumnFiltersChange: setColumnFilters,
    onColumnVisibilityChange: setColumnVisibility,
    getCoreRowModel: getCoreRowModel(),
    getPaginationRowModel: getPaginationRowModel(),
    getSortedRowModel: getSortedRowModel(),
    getFilteredRowModel: getFilteredRowModel(),
  });

  const statusOptions = [
    { label: t("groups.allStatuses"), value: "all" },
    { label: t("groups.recruiting"), value: "1" },
    { label: t("groups.inProgress"), value: "2" },
    { label: t("groups.completed"), value: "3" },
    { label: t("groups.archived"), value: "4" },
  ];

  return (
    <div className="space-y-6">
      {/* Top Header */}
      <div className="px-4 lg:px-6 flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b pb-3">
        <div>
          <h1 className="text-xl font-bold tracking-tight text-foreground flex items-center gap-2">
            <Users className="w-5 h-5 text-primary" />
            {t("groups.title")}
          </h1>
          <p className="text-xs text-muted-foreground mt-0.5">
            {t("groups.subtitle")}
          </p>
        </div>
        <div className="flex items-center gap-2">
          <Button
            variant="outline"
            size="sm"
            onClick={() => refetch()}
            className="h-8 gap-1.5 text-xs cursor-pointer rounded-lg border-border/60 hover:bg-muted/80"
          >
            <RefreshCw className="w-3.5 h-3.5" />
            {t("common.refresh")}
          </Button>
          <Button
            size="sm"
            onClick={() => setIsCreateOpen(true)}
            className="h-8 gap-1.5 text-xs shadow-xs cursor-pointer rounded-lg font-medium"
          >
            <Plus className="w-4 h-4" />
            {t("groups.newGroup")}
          </Button>
        </div>
      </div>

      {/* Metrics Cards */}
      <div className="@container/main px-4 lg:px-6">
        <GroupsMetrics groups={groups} />
      </div>

      {/* Main Container with Standard Padding */}
      <div className="@container/main px-4 lg:px-6 space-y-4">
        {/* Toolbar on Steroids */}
        <DataTableToolbar
          table={table}
          searchKey="name"
          searchPlaceholder={t("groups.searchPlaceholder")}
          searchValue={searchQuery}
          onSearchChange={setSearchQuery}
          filterKey="status"
          filterTitle={t("common.status")}
          filterValue={statusFilter}
          onFilterChange={setStatusFilter}
          filterOptions={statusOptions}
          actionButton={
            <Button
              size="sm"
              onClick={() => setIsCreateOpen(true)}
              className="h-8 text-xs font-semibold gap-1.5 cursor-pointer rounded-lg"
            >
              <Plus className="w-4 h-4" />
              <span className="hidden sm:inline">{t("groups.newGroup")}</span>
            </Button>
          }
        />

        {/* Universal Atena Data Table */}
        <AtenaDataTable
          table={table}
          columns={columns}
          loading={isLoading}
          emptyMessage={t("groups.noGroupsFound")}
        />
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
