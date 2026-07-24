import { AppHeader } from "@/components/app-header";
import { useActivityLog } from "../hooks/use-activity-log";
import { ActivityLogPlaceholder } from "./activity-log-placeholder";

export function RegistroView() {
  useActivityLog();

  return (
    <>
      <AppHeader searchPlaceholder="Cerca attività..." />
      <main className="flex-1 flex items-center justify-center p-6">
        <ActivityLogPlaceholder />
      </main>
    </>
  );
}
