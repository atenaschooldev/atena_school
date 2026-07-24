import { createFileRoute } from "@tanstack/react-router";
import { StudentiView } from "@/features/students";

export const Route = createFileRoute("/studenti")({
  head: () => ({ meta: [{ title: "Studenti — Atena Scuola" }] }),
  component: StudentiView,
});
