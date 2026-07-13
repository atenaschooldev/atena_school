import { createFileRoute } from "@tanstack/react-router";
import { DocumentiView } from "@/features/documents";

export const Route = createFileRoute("/documenti")({
  head: () => ({ meta: [{ title: "Documenti — Atena Scuola" }] }),
  component: DocumentiView,
});
