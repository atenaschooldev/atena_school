import type { ColumnDef } from "@tanstack/react-table";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import { Users, Trash2, Eye, Calendar, Clock, MapPin } from "lucide-react";
import { GroupStatus, GROUP_STATUS_DICTIONARY, WEEKDAY_DICTIONARY } from "@atena/api-types";
import type { Group } from "../types";

export function getGroupsTableColumns({
  onViewDetails,
  onDeleteGroup,
}: {
  onViewDetails: (group: Group) => void;
  onDeleteGroup: (groupId: string) => void;
}): ColumnDef<Group>[] {
  return [
    {
      accessorKey: "name",
      header: "Gruppo / Corso",
      cell: ({ row }) => {
        const g = row.original;
        return (
          <div className="flex items-start gap-2.5">
            <div className="p-2 bg-primary/10 text-primary rounded-lg shrink-0 mt-0.5">
              <Users className="w-4 h-4" />
            </div>
            <div>
              <p className="font-semibold text-foreground text-sm">{g.name}</p>
              <p className="text-xs text-muted-foreground">{g.courseName || "Corso di Gruppo"}</p>
              {g.room && (
                <span className="inline-flex items-center gap-1 text-[11px] text-muted-foreground mt-0.5">
                  <MapPin className="w-3 h-3" /> {g.room}
                </span>
              )}
            </div>
          </div>
        );
      },
    },
    {
      accessorKey: "teacherName",
      header: "Docente",
      cell: ({ row }) => {
        const teacher = row.original.teacherName;
        return (
          <span className="text-xs font-medium text-foreground">
            {teacher || <span className="text-muted-foreground italic">Non assegnato</span>}
          </span>
        );
      },
    },
    {
      accessorKey: "schedule",
      header: "Orario & Giorni",
      cell: ({ row }) => {
        const g = row.original;
        const days = g.scheduleDays || [];
        const daysText =
          days.length > 0
            ? days.map((d) => WEEKDAY_DICTIONARY[d % 7]?.label_it || String(d)).join(" e ")
            : "Flessibile";
        const timeText = g.startTime ? `${g.startTime}${g.endTime ? ` - ${g.endTime}` : ""}` : "";

        return (
          <div className="text-xs space-y-0.5">
            <div className="flex items-center gap-1 text-foreground font-medium">
              <Calendar className="w-3.5 h-3.5 text-muted-foreground" />
              <span>{daysText}</span>
            </div>
            {timeText && (
              <div className="flex items-center gap-1 text-muted-foreground text-[11px]">
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
      header: "Capienza / Iscritti",
      cell: ({ row }) => {
        const g = row.original;
        const current = g.currentEnrolledCount || g.members?.length || 0;
        const max = g.maxStudents || 8;
        const percent = Math.min(100, Math.round((current / max) * 100));

        return (
          <div className="w-32 space-y-1">
            <div className="flex justify-between text-xs font-medium">
              <span className="text-foreground">{current} / {max} posti</span>
              <span className="text-muted-foreground text-[11px]">{percent}%</span>
            </div>
            <Progress value={percent} className="h-1.5" />
          </div>
        );
      },
    },
    {
      accessorKey: "status",
      header: "Stato",
      cell: ({ row }) => {
        const status = row.original.status || GroupStatus.RECRUITING;
        const dict = GROUP_STATUS_DICTIONARY[status as GroupStatus];

        let badgeClass = "bg-blue-500/10 text-blue-600 border-blue-500/20";
        if (status === GroupStatus.IN_PROGRESS) {
          badgeClass = "bg-emerald-500/10 text-emerald-600 border-emerald-500/20";
        } else if (status === GroupStatus.COMPLETED) {
          badgeClass = "bg-purple-500/10 text-purple-600 border-purple-500/20";
        } else if (status === GroupStatus.ARCHIVED) {
          badgeClass = "bg-muted text-muted-foreground border-border";
        }

        return (
          <Badge variant="outline" className={`text-[11px] ${badgeClass}`}>
            {dict?.label_it || "Attivo"}
          </Badge>
        );
      },
    },
    {
      id: "actions",
      header: "",
      cell: ({ row }) => {
        const g = row.original;
        return (
          <div className="flex items-center justify-end gap-1">
            <Button
              variant="outline"
              size="sm"
              className="h-8 gap-1 text-xs"
              onClick={() => onViewDetails(g)}
            >
              <Eye className="w-3.5 h-3.5" />
              Dettagli
            </Button>
            <Button
              variant="ghost"
              size="icon"
              className="h-8 w-8 text-muted-foreground hover:text-destructive"
              onClick={() => {
                if (confirm(`Sei sicuro di voler eliminare il gruppo "${g.name}"?`)) {
                  onDeleteGroup(g.id);
                }
              }}
              title="Elimina gruppo"
            >
              <Trash2 className="w-3.5 h-3.5" />
            </Button>
          </div>
        );
      },
    },
  ];
}
