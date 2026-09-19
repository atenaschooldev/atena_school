"use client";

import { Users, UserCheck, ShieldCheck, Clock } from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import { UserRole, parseUserRole } from "@atena/api-types";
import { useTranslation } from "@/i18n/context";
import type { User } from "../types";

export interface UsersMetricsProps {
  users: User[];
}

export function UsersMetrics({ users }: UsersMetricsProps) {
  const { t } = useTranslation();
  const adminCount = users.filter((u) => {
    const r = parseUserRole(u.role);
    return r === UserRole.ADMIN || r === UserRole.SUPERADMIN;
  }).length;
  const teacherCount = users.filter((u) => parseUserRole(u.role) === UserRole.TEACHER).length;
  const studentCount = users.filter((u) => parseUserRole(u.role) === UserRole.STUDENT).length;

  const metrics = [
    {
      title: t("users.totalUsers"),
      value: users.length,
      description: t("users.registeredAccounts"),
      icon: Users,
    },
    {
      title: t("users.administrators"),
      value: adminCount,
      description: t("users.fullAccess"),
      icon: ShieldCheck,
    },
    {
      title: t("roles.teacher"),
      value: teacherCount,
      description: t("users.facultyProfiles"),
      icon: UserCheck,
    },
    {
      title: t("users.studentsAndClients"),
      value: studentCount,
      description: t("users.enrolledInCourses"),
      icon: Clock,
    },
  ];

  return (
    <div className="@container/main px-4 lg:px-6">
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        {metrics.map((metric, index) => (
          <Card key={index} className="border">
            <CardContent className="space-y-4 pt-6">
              <div className="flex items-center justify-between">
                <metric.icon className="text-muted-foreground size-6" />
              </div>
              <div className="space-y-1">
                <p className="text-muted-foreground text-sm font-medium">{metric.title}</p>
                <div className="text-2xl font-bold">{metric.value}</div>
                <div className="text-muted-foreground text-xs">{metric.description}</div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  );
}
