"use client";

import type { ColumnDef } from "@tanstack/react-table";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Trash2, Eye, Award, AlertCircle } from "lucide-react";
import { StudentStatus, LanguageLevel, parseStudentStatus, parseLanguageLevel } from "@atena/api-types";
import { DataTableColumnHeader } from "@/components/shared/data-table/data-table-column-header";
import { CellAvatar } from "@/components/shared/data-table/cells/cell-avatar";
import { CellCopyableId } from "@/components/shared/cell-copyable-id";
import { CellFormattedDate } from "@/components/shared/cell-formatted-date";
import type { Student } from "../types";

const LEVEL_LABELS: Record<number, string> = {
  1: "A1",
  2: "A2",
  3: "B1",
  4: "B2",
  5: "C1",
  6: "C2",
};

export function getStudentsTableColumns({
  onViewDetails,
  onDeleteStudent,
  t,
}: {
  onViewDetails: (student: Student) => void;
  onDeleteStudent: (studentId: string) => void;
  t: (k: string) => string;
}): ColumnDef<Student>[] {
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
      accessorKey: "full_name",
      header: ({ column }) => (
        <DataTableColumnHeader column={column} title={t("students.studentName")} />
      ),
      cell: ({ row }) => {
        const s = row.original;
        const name = s.full_name || `${s.first_name || ""} ${s.last_name || ""}`.trim() || t("common.student");
        const sub = [s.email, s.phone].filter(Boolean).join(" • ");
        return (
          <CellAvatar
            title={name}
            subtitle={sub || undefined}
            badgeColor="bg-blue-500/10 text-blue-600"
          />
        );
      },
    },
    {
      accessorKey: "tax_code",
      header: ({ column }) => (
        <DataTableColumnHeader column={column} title={t("common.taxCode")} />
      ),
      cell: ({ row }) => {
        const cf = row.original.tax_code;
        return (
          <span className="font-mono text-xs font-semibold text-foreground uppercase">
            {cf || <span className="text-muted-foreground italic">-</span>}
          </span>
        );
      },
      size: 150,
    },
    {
      accessorKey: "birth_date",
      header: ({ column }) => (
        <DataTableColumnHeader column={column} title={t("students.birthDate")} />
      ),
      cell: ({ row }) => {
        const bd = row.original.birth_date;
        if (!bd) return <span className="text-muted-foreground text-xs italic">-</span>;
        return <CellFormattedDate dateValue={bd} showTime={false} />;
      },
      size: 130,
    },
    {
      accessorKey: "language_level",
      header: ({ column }) => (
        <DataTableColumnHeader column={column} title={t("students.level")} />
      ),
      cell: ({ row }) => {
        const raw = row.original.language_level;
        const num = parseLanguageLevel(raw);
        const label = LEVEL_LABELS[num] || "A1";

        return (
          <Badge variant="outline" className="font-mono font-bold text-xs bg-muted/60">
            {label}
          </Badge>
        );
      },
      size: 90,
    },
    {
      accessorKey: "annual_fee_paid",
      header: ({ column }) => (
        <DataTableColumnHeader column={column} title={t("students.annualFee")} />
      ),
      cell: ({ row }) => {
        const isPaid = row.original.annual_fee_paid;
        return isPaid ? (
          <Badge variant="outline" className="gap-1 border-emerald-500/30 bg-emerald-500/10 text-emerald-600 font-semibold text-xs">
            <Award className="w-3 h-3" />
            {t("students.feePaidBadge")}
          </Badge>
        ) : (
          <Badge variant="outline" className="gap-1 border-amber-500/30 bg-amber-500/10 text-amber-600 font-semibold text-xs">
            <AlertCircle className="w-3 h-3" />
            {t("students.feePendingBadge")}
          </Badge>
        );
      },
      size: 140,
    },
    {
      accessorKey: "status",
      header: ({ column }) => (
        <DataTableColumnHeader column={column} title={t("common.status")} />
      ),
      cell: ({ row }) => {
        const status = parseStudentStatus(row.original.status);
        const isActive = status === StudentStatus.ACTIVE;
        return (
          <Badge
            variant="outline"
            className={
              isActive
                ? "border-emerald-500/30 bg-emerald-500/10 text-emerald-600 text-xs"
                : "border-muted-foreground/30 bg-muted text-muted-foreground text-xs"
            }
          >
            {isActive ? t("common.active") : t("common.inactive")}
          </Badge>
        );
      },
      size: 110,
    },
    {
      id: "actions",
      header: () => (
        <div className="text-right text-xs font-medium text-muted-foreground">
          {t("common.actions")}
        </div>
      ),
      cell: ({ row }) => {
        const s = row.original;
        return (
          <div className="flex items-center justify-end gap-1">
            <Button
              variant="outline"
              size="sm"
              className="h-8 gap-1 text-xs cursor-pointer rounded-lg border-border/60 hover:bg-muted/80"
              onClick={() => onViewDetails(s)}
            >
              <Eye className="w-3.5 h-3.5" />
              {t("common.details")}
            </Button>
            <Button
              variant="ghost"
              size="icon"
              className="h-8 w-8 text-muted-foreground hover:text-destructive hover:bg-destructive/10 rounded-lg cursor-pointer"
              onClick={() => {
                if (confirm(`${t("students.deleteConfirmTitle")} "${s.full_name}"?`)) {
                  onDeleteStudent(s.id);
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
