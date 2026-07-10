import { CreditCard } from "lucide-react";

export function PaymentsPlaceholder() {
  return (
    <div className="text-center max-w-md">
      <div className="h-14 w-14 rounded-2xl bg-primary/10 text-primary flex items-center justify-center mx-auto mb-4">
        <CreditCard className="h-7 w-7" />
      </div>
      <h1 className="text-xl font-semibold">Pagamenti</h1>
      <p className="text-sm text-muted-foreground mt-2">Rate, scadenze e fatture degli studenti.</p>
    </div>
  );
}
