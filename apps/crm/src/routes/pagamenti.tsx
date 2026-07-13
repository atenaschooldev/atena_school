import { createFileRoute } from "@tanstack/react-router";
import { PagamentiView } from "@/features/payments";

export const Route = createFileRoute("/pagamenti")({
  head: () => ({ meta: [{ title: "Pagamenti — Atena Scuola" }] }),
  component: PagamentiView,
});
