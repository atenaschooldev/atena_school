"use client";

import { Users, UserCheck, FileX, AlertTriangle } from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import { useTranslation } from "@/i18n/context";

export interface AttendanceMetricsProps {
  totalCount: number;
  presentCount: number;
  absentCount: number;
  pendingPaymentCount: number;
}

export function AttendanceMetrics({
  totalCount,
  presentCount,
  absentCount,
  pendingPaymentCount,
}: AttendanceMetricsProps) {
  const { t } = useTranslation();

  const metrics = [
    {
      title: t("attendance.studentsInRegister"),
      value: totalCount,
      description: t("attendance.totalScheduled"),
      icon: Users,
    },
    {
      title: t("attendance.presentToday"),
      value: presentCount,
      description: t("attendance.confirmedAttendance"),
      icon: UserCheck,
    },
    {
      title: t("attendance.absentCount"),
      value: absentCount,
      description: t("attendance.absencesRecorded"),
      icon: FileX,
    },
    {
      title: t("attendance.pendingPayment"),
      value: pendingPaymentCount,
      description: t("attendance.pendingPaymentDesc"),
      icon: AlertTriangle,
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
