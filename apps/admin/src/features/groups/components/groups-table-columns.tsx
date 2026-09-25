"use client";

import type { ColumnDef } from "@tanstack/react-table";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import { Users, Trash2, Eye, Calendar, Clock, MapPin } from "lucide-react";
import { GroupStatus } from "@atena/api-types";
import { StatusBadge } from "@/components/shared/status-badge";
import { DataTableColumnHeader } from "@/components/shared/data-table/data-table-column-header";
import { CellAvatar } from "@/components/shared/data-table/cells/cell-avatar";
import { CellCopyableId } from "@/components/shared/cell-copyable-id";
import type { Group } from "../types";

const WEEKDAY_KEYS: Record<number, string> = {
  1: "monday",
  2: "tuesday",
  3: "wednesday",
  4: "thursday",
  5: "friday",
  6: "saturday",
  0: "sunday",
  7: "sunday",
};

export function getGroupsTableColumns({
  onViewDetails,
  onDeleteGroup,
  t,
}: {
  onViewDetails: (group: Group) => void;
  onDeleteGroup: (groupId: string) => void;
  t: (k: string) => string;
}): ColumnDef<Group>[] {
  return [
    {
      accessorKey: "id",
      header: ({ column }) => (
        <DataTableColumnHeader column={column} title="ID" />
      ),
      cell: ({ row }) => <CellCopyableId id={row.original.id} />,
      size: 110,
    },
    {
      accessorKey: "name",
      header: ({ column }) => (
        <DataTableColumnHeader column={column} title={t("groups.groupName")} />
      ),
      cell: ({ row }) => {
        const g = row.original;
        const sub = [g.courseName || t("groups.defaultGroupCourse"), g.room].filter(Boolean).join(" • ");
        return (
          <CellAvatar
            title={g.name}
            subtitle={sub}
            icon={Users}
            badgeColor="bg-primary/10 text-primary"
          />
        );
      },
    },
    {
      accessorKey: "teacherName",
      header: ({ column }) => (
        <DataTableColumnHeader column={column} title={t("groups.teacher")} />
      ),
      cell: ({ row }) => {
        const teacher = row.original.teacherName;
        return (
          <span className="text-xs font-medium text-foreground">
            {teacher || <span className="text-muted-foreground italic">{t("groups.unassigned")}</span>}
          </span>
        );
      },
    },
    {
      accessorKey: "schedule",
      header: ({ column }) => (
        <DataTableColumnHeader column={column} title={t("groups.schedule")} />
      ),
      cell: ({ row }) => {
        const g = row.original;
        const days = g.scheduleDays || [];
        const daysText =
          days.length > 0
            ? days
                .map((d) => {
                  const key = WEEKDAY_KEYS[d % 7] || "monday";
                  return t(`weekdays.${key}`);
                })
                .join(` ${t("weekdays.and")} `)
            : t("common.flexible");
        const timeText = g.startTime ? `${g.startTime}${g.endTime ? ` - ${g.endTime}` : ""}` : "";

        return (
          <div className="text-xs space-y-0.5">
            <div className="flex items-center gap-1.5 text-foreground font-medium">
              <Calendar className="w-3.5 h-3.5 text-muted-foreground" />
              <span>{daysText}</span>
            </div>
            {timeText && (
              <div className="flex items-center gap-1.5 text-muted-foreground text-[11px]">
                <Clock className="w-3 h-3" />
                <span>{timeText}</span>
              </div>
            )}
          </div>
        );
      },
    },
    {
      accessorKey: "enrolled",
      header: ({ column }) => (
        <DataTableColumnHeader column={column} title={t("groups.capacity")} />
      ),
      cell: ({ row }) => {
        const g = row.original;
        const current = g.currentEnrolledCount || g.members?.length || 0;
        const max = g.maxStudents || 8;
        const percent = Math.min(100, Math.round((current / max) * 100));

        return (
          <div className="w-32 space-y-1.5">
            <div className="flex justify-between text-xs font-medium">
              <span className="text-foreground">{current} / {max} {t("groups.spots")}</span>
              <span className="text-muted-foreground text-[11px]">{percent}%</span>
            </div>
            <Progress value={percent} className="h-1.5 bg-muted" />
          </div>
        );
      },
    },
    {
      accessorKey: "status",
      header: ({ column }) => (
        <DataTableColumnHeader column={column} title={t("common.status")} />
      ),
      cell: ({ row }) => {
        const status = row.original.status || GroupStatus.RECRUITING;
        return <StatusBadge status={status} />;
      },
    },
    {
      id: "actions",
      header: () => (
        <div className="text-right text-xs font-medium text-muted-foreground">
          {t("common.actions")}
        </div>
      ),
      cell: ({ row }) => {
        const g = row.original;
        return (
          <div className="flex items-center justify-end gap-1">
            <Button
              variant="outline"
              size="sm"
              className="h-8 gap-1 text-xs cursor-pointer rounded-lg border-border/60 hover:bg-muted/80"
              onClick={() => onViewDetails(g)}
            >
              <Eye className="w-3.5 h-3.5" />
              {t("common.details")}
            </Button>
            <Button
              variant="ghost"
              size="icon"
              className="h-8 w-8 text-muted-foreground hover:text-destructive hover:bg-destructive/10 rounded-lg cursor-pointer"
              onClick={() => {
                if (confirm(`${t("groups.deleteConfirmTitle")} "${g.name}"?`)) {
                  onDeleteGroup(g.id);
                }
              }}
              title={t("common.delete")}
            >
              <Trash2 className="w-3.5 h-3.5" />
            </Button>
          </div>
        );
      },
    },
  ];
}
