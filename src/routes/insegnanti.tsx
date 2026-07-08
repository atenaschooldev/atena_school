import { createFileRoute } from "@tanstack/react-router";
import { InsegnantiView } from "@/features/teachers";

export const Route = createFileRoute("/insegnanti")({
  head: () => ({ meta: [{ title: "Insegnanti — Atena Scuola" }] }),
  component: InsegnantiView,
});
