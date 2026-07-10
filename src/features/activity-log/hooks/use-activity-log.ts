import { useAppStore } from "@/stores/app-store";

export function useActivityLog() {
  const tableSearch = useAppStore((s) => s.tableSearch);

  return {
    tableSearch,
  };
}
