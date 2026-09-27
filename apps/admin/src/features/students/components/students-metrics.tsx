import { Card, CardContent } from "@/components/ui/card";
import { Users, UserCheck, Award, Clock } from "lucide-react";
import { useTranslation } from "@/i18n/context";
import { StudentStatus, parseStudentStatus } from "@atena/api-types";
import type { Student } from "../types";

interface StudentsMetricsProps {
  students: Student[];
}

export function StudentsMetrics({ students = [] }: StudentsMetricsProps) {
  const { t } = useTranslation();

  const total = students.length;
  const active = students.filter(
    (s) => parseStudentStatus(s.status) === StudentStatus.ACTIVE
  ).length;
  const feePaid = students.filter((s) => s.annual_fee_paid).length;
  const feePending = total - feePaid;

  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
      <Card className="shadow-xs border-border/60">
        <CardContent className="p-5 flex items-center justify-between">
          <div>
            <p className="text-xs font-medium text-muted-foreground uppercase tracking-wider">
              {t("students.totalStudents")}
            </p>
            <h3 className="text-2xl font-bold mt-1 text-foreground">{total}</h3>
            <p className="text-xs text-muted-foreground mt-1">
              {t("students.enrolledTotal")}
            </p>
          </div>
          <div className="p-3 bg-blue-500/10 text-blue-500 rounded-xl">
            <Users className="w-5 h-5" />
          </div>
        </CardContent>
      </Card>

      <Card className="shadow-xs border-border/60">
        <CardContent className="p-5 flex items-center justify-between">
          <div>
            <p className="text-xs font-medium text-muted-foreground uppercase tracking-wider">
              {t("students.activeStudents")}
            </p>
            <h3 className="text-2xl font-bold mt-1 text-foreground">{active}</h3>
            <p className="text-xs text-muted-foreground mt-1">
              {t("students.activeDesc")}
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
              {t("students.feePaid")}
            </p>
            <h3 className="text-2xl font-bold mt-1 text-foreground">{feePaid}</h3>
            <p className="text-xs text-muted-foreground mt-1">
              {t("students.feePaidDesc")}
            </p>
          </div>
          <div className="p-3 bg-amber-500/10 text-amber-500 rounded-xl">
            <Award className="w-5 h-5" />
          </div>
        </CardContent>
      </Card>

      <Card className="shadow-xs border-border/60">
        <CardContent className="p-5 flex items-center justify-between">
          <div>
            <p className="text-xs font-medium text-muted-foreground uppercase tracking-wider">
              {t("students.feePending")}
            </p>
            <h3 className="text-2xl font-bold mt-1 text-foreground">{feePending}</h3>
            <p className="text-xs text-muted-foreground mt-1">
              {t("students.feePendingDesc")}
            </p>
          </div>
          <div className="p-3 bg-purple-500/10 text-purple-500 rounded-xl">
            <Clock className="w-5 h-5" />
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
