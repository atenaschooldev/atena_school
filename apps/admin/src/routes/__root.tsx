import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import {
  Outlet,
  Link,
  createRootRouteWithContext,
  useRouter,
  HeadContent,
  Scripts,
} from "@tanstack/react-router";
import { useEffect, type ReactNode } from "react";

import appCss from "../styles.css?url";
import { reportLovableError } from "../lib/lovable-error-reporting";
import { SidebarProvider, useSidebar } from "@/components/ui/sidebar";
import { AppSidebar } from "@/components/app-sidebar";
import { ClientProviders } from "@/components/client-providers";
import { Toaster } from "@/components/ui/sonner";
import { ChevronLeft, ChevronRight } from "lucide-react";
import { cn } from "@/lib/utils";

function NotFoundComponent() {
  return (
    <div className="flex min-h-screen items-center justify-center bg-background px-4">
      <div className="max-w-md text-center">
        <h1 className="text-7xl font-bold text-foreground">404</h1>
        <h2 className="mt-4 text-xl font-semibold text-foreground">Pagina non trovata</h2>
        <p className="mt-2 text-sm text-muted-foreground">
          La pagina che stai cercando non esiste o è stata spostata.
        </p>
        <div className="mt-6">
          <Link
            to="/dashboard"
            className="inline-flex items-center justify-center rounded-md bg-primary px-4 py-2 text-sm font-medium text-primary-foreground transition-colors hover:bg-primary/90"
          >
            Vai alla dashboard
          </Link>
        </div>
      </div>
    </div>
  );
}

function ErrorComponent({ error, reset }: { error: Error; reset: () => void }) {
  console.error(error);
  const router = useRouter();
  useEffect(() => {
    reportLovableError(error, { boundary: "tanstack_root_error_component" });
  }, [error]);

  return (
    <div className="flex min-h-screen items-center justify-center bg-background px-4">
      <div className="max-w-md text-center">
        <h1 className="text-xl font-semibold tracking-tight text-foreground">
          Qualcosa è andato storto
        </h1>
        <p className="mt-2 text-sm text-muted-foreground">Riprova o torna alla dashboard.</p>
        <div className="mt-6 flex flex-wrap justify-center gap-2">
          <button
            onClick={() => {
              router.invalidate();
              reset();
            }}
            className="inline-flex items-center justify-center rounded-md bg-primary px-4 py-2 text-sm font-medium text-primary-foreground transition-colors hover:bg-primary/90"
          >
            Riprova
          </button>
          <a
            href="/dashboard"
            className="inline-flex items-center justify-center rounded-md border border-input bg-background px-4 py-2 text-sm font-medium text-foreground transition-colors hover:bg-accent"
          >
            Dashboard
          </a>
        </div>
      </div>
    </div>
  );
}

export const Route = createRootRouteWithContext<{ queryClient: QueryClient }>()({
  head: () => ({
    meta: [
      { charSet: "utf-8" },
      { name: "viewport", content: "width=device-width, initial-scale=1" },
      { title: "Atena Scuola — Gestionale Scuola d'Inglese" },
      {
        name: "description",
        content:
          "Sistema completo di gestione per scuole d'inglese: studenti, insegnanti, corsi, orari, valutazioni e presenze.",
      },
      { property: "og:title", content: "Atena Scuola — Gestionale Scuola d'Inglese" },
      {
        property: "og:description",
        content:
          "Gestisci studenti, corsi e valutazioni della tua scuola d'inglese in un'unica piattaforma.",
      },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary_large_image" },
    ],
    links: [
      { rel: "stylesheet", href: appCss },
      { rel: "icon", href: "/favicon.ico", type: "image/x-icon" },
    ],
  }),
  shellComponent: RootShell,
  component: RootComponent,
  notFoundComponent: NotFoundComponent,
  errorComponent: ErrorComponent,
});

function RootShell({ children }: { children: ReactNode }) {
  return (
    <html lang="it" suppressHydrationWarning>
      <head>
        <HeadContent />
      </head>
      <body suppressHydrationWarning>
        {children}
        <Scripts />
      </body>
    </html>
  );
}

function SidebarToggle() {
  const { open, toggleSidebar } = useSidebar();
  return (
    <button
      onClick={toggleSidebar}
      className={cn(
        "fixed top-[16px] z-50 h-10 w-3.5 flex items-center justify-center bg-background border border-l-0 border-sidebar-border rounded-r-lg shadow-md transition-all duration-200 ease-linear hover:bg-accent text-sidebar-foreground/80 hover:text-sidebar-foreground hover:w-4.5 active:scale-95 group cursor-pointer",
        open ? "left-[16rem]" : "left-0",
      )}
      title={open ? "Nascondi barra laterale (⌘B)" : "Mostra barra laterale (⌘B)"}
    >
      {open ? (
        <ChevronLeft className="h-3.5 w-3.5 transition-transform duration-300" />
      ) : (
        <ChevronRight className="h-3.5 w-3.5 transition-transform duration-300" />
      )}
    </button>
  );
}

function RootComponent() {
  const { queryClient } = Route.useRouteContext();

  return (
    <QueryClientProvider client={queryClient}>
      <ClientProviders>
        <SidebarProvider>
          <div className="min-h-screen flex w-full bg-background overflow-hidden relative">
            <AppSidebar />
            <SidebarToggle />
            <div className="flex-1 flex flex-col min-w-0 h-screen">
              <div className="flex-1 flex flex-col bg-background overflow-hidden relative">
                <Outlet />
              </div>
            </div>
          </div>
          <Toaster position="top-right" />
        </SidebarProvider>
      </ClientProviders>
    </QueryClientProvider>
  );
}
