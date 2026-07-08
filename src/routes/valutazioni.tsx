import { createFileRoute } from "@tanstack/react-router";
import { ValutazioniView } from "@/features/grades";

export const Route = createFileRoute("/valutazioni")({
  head: () => ({ meta: [{ title: "Valutazioni — Atena Scuola" }] }),
  component: ValutazioniView,
});
