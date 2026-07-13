import { createFileRoute } from "@tanstack/react-router";
import { RegistroView } from "@/features/activity-log";

export const Route = createFileRoute("/registro")({
  head: () => ({ meta: [{ title: "Registro Attività — Atena Scuola" }] }),
  component: RegistroView,
});
