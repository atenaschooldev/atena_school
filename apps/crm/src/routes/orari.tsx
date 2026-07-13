import { createFileRoute } from "@tanstack/react-router";
import { OrariView } from "@/features/schedule";

export const Route = createFileRoute("/orari")({
  head: () => ({ meta: [{ title: "Orari — Atena Scuola" }] }),
  component: OrariView,
});
