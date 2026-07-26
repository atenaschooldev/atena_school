import { createFileRoute } from "@tanstack/react-router";
import { BookingsView } from "@/features/bookings";

export const Route = createFileRoute("/prenotazioni")({
  head: () => ({ meta: [{ title: "Ordini & Prenotazioni — Atena Scuola" }] }),
  component: BookingsView,
});
