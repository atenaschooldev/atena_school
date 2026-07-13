import { AppHeader } from "@/components/app-header";
import { usePayments } from "../hooks/use-payments";
import { PaymentsPlaceholder } from "./payments-placeholder";

export function PagamentiView() {
  usePayments();

  return (
    <>
      <AppHeader searchPlaceholder="Cerca pagamenti..." />
      <main className="flex-1 flex items-center justify-center p-6">
        <PaymentsPlaceholder />
      </main>
    </>
  );
}
