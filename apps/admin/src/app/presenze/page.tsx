"use client";

import { BaseLayout } from "@/components/layouts/base-layout";
import { AttendanceView } from "@/features/attendance/components/attendance-view";

export default function PresenzePage() {
  return (
    <BaseLayout title="Presenze & Registro" description="Registro quotidiano delle presenze e incasso post-lezione">
      <AttendanceView />
    </BaseLayout>
  );
}
