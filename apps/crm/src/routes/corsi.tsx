import { createFileRoute } from "@tanstack/react-router";
import { CorsiView } from "@/features/courses";

export const Route = createFileRoute("/corsi")({
  head: () => ({ meta: [{ title: "Corsi — Atena Scuola" }] }),
  component: CorsiView,
});
