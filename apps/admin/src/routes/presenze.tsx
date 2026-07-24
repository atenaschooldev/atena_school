import { createFileRoute } from "@tanstack/react-router";
import { PresenzeView } from "@/features/attendance";

export const Route = createFileRoute("/presenze")({
  head: () => ({ meta: [{ title: "Presenze — Atena Scuola" }] }),
  component: PresenzeView,
});
