import { Card, CardContent } from "@/components/ui/card";
import { Users, BookOpen, UserCheck, Calendar } from "lucide-react";
import type { Group } from "../types";
import { GroupStatus } from "@atena/api-types";
import { useTranslation } from "@/i18n/context";

interface GroupsMetricsProps {
  groups: Group[];
}

export function GroupsMetrics({ groups }: GroupsMetricsProps) {
  const { t } = useTranslation();
  const totalGroups = groups.length;
  const activeGroups = groups.filter(
    (g) => g.status === GroupStatus.RECRUITING || g.status === GroupStatus.IN_PROGRESS
  ).length;

  const totalEnrolled = groups.reduce((acc, g) => acc + (g.currentEnrolledCount || 0), 0);
  const totalCapacity = groups.reduce((acc, g) => acc + (g.maxStudents || 8), 0);

  const fillRate = totalCapacity > 0 ? Math.round((totalEnrolled / totalCapacity) * 100) : 0;

  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
      <Card className="shadow-xs border-border/60">
        <CardContent className="p-5 flex items-center justify-between">
          <div>
            <p className="text-xs font-medium text-muted-foreground uppercase tracking-wider">
              {t("groups.totalGroups")}
            </p>
            <h3 className="text-2xl font-bold mt-1 text-foreground">{totalGroups}</h3>
            <p className="text-xs text-muted-foreground mt-1">
              <span className="text-emerald-500 font-semibold">{activeGroups}</span> {t("groups.activeOrRecruiting")}
            </p>
          </div>
          <div className="p-3 bg-blue-500/10 text-blue-500 rounded-xl">
            <BookOpen className="w-5 h-5" />
          </div>
        </CardContent>
      </Card>

      <Card className="shadow-xs border-border/60">
        <CardContent className="p-5 flex items-center justify-between">
          <div>
            <p className="text-xs font-medium text-muted-foreground uppercase tracking-wider">
              {t("groups.studentsInGroups")}
            </p>
            <h3 className="text-2xl font-bold mt-1 text-foreground">{totalEnrolled}</h3>
            <p className="text-xs text-muted-foreground mt-1">
              {t("groups.totalActiveEnrolled")}
            </p>
          </div>
          <div className="p-3 bg-emerald-500/10 text-emerald-500 rounded-xl">
            <UserCheck className="w-5 h-5" />
          </div>
        </CardContent>
      </Card>

      <Card className="shadow-xs border-border/60">
        <CardContent className="p-5 flex items-center justify-between">
          <div>
            <p className="text-xs font-medium text-muted-foreground uppercase tracking-wider">
              {t("groups.totalCapacity")}
            </p>
            <h3 className="text-2xl font-bold mt-1 text-foreground">{totalCapacity} {t("groups.spots")}</h3>
            <p className="text-xs text-muted-foreground mt-1">
              {t("groups.availableInClasses")}
            </p>
          </div>
          <div className="p-3 bg-purple-500/10 text-purple-500 rounded-xl">
            <Users className="w-5 h-5" />
          </div>
        </CardContent>
      </Card>

      <Card className="shadow-xs border-border/60">
        <CardContent className="p-5 flex items-center justify-between">
          <div>
            <p className="text-xs font-medium text-muted-foreground uppercase tracking-wider">
              {t("groups.fillRate")}
            </p>
            <h3 className="text-2xl font-bold mt-1 text-foreground">{fillRate}%</h3>
            <p className="text-xs text-muted-foreground mt-1">
              {totalEnrolled} / {totalCapacity} {t("groups.spotsOccupied")}
            </p>
          </div>
          <div className="p-3 bg-amber-500/10 text-amber-500 rounded-xl">
            <Calendar className="w-5 h-5" />
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
