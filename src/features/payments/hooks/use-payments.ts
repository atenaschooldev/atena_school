import { useAppStore } from "@/stores/app-store";

export function usePayments() {
  const tableSearch = useAppStore((s) => s.tableSearch);

  return {
    tableSearch,
  };
}
