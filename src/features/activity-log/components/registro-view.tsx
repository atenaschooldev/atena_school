import { AppHeader } from "@/components/app-header";
import { Activity } from "lucide-react";

export function RegistroView() {
  return (
    <>
      <AppHeader searchPlaceholder="Cerca attività..." />
      <main className="flex-1 flex items-center justify-center p-6">
        <div className="text-center max-w-md">
          <div className="h-14 w-14 rounded-2xl bg-primary/10 text-primary flex items-center justify-center mx-auto mb-4">
            <Activity className="h-7 w-7" />
          </div>
          <h1 className="text-xl font-semibold">Registro attività</h1>
          <p className="text-sm text-muted-foreground mt-2">
            Log completo di ogni modifica nel sistema.
          </p>
        </div>
      </main>
    </>
  );
}
