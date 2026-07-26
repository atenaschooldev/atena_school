import { Link, useRouterState } from "@tanstack/react-router";
import {
  LayoutDashboard,
  ShoppingBag,
  GraduationCap,
  Users,
  BookOpen,
  FileText,
  CreditCard,
  Calendar,
  ClipboardCheck,
  UserCheck,
  Activity,
  LogOut,
  Moon,
  Sun,
  Languages,
} from "lucide-react";
import {
  Sidebar,
  SidebarContent,
  SidebarFooter,
  SidebarGroup,
  SidebarGroupContent,
  SidebarGroupLabel,
  SidebarHeader,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
  useSidebar,
} from "@/components/ui/sidebar";
import { useAppStore } from "@/stores/app-store";
import { useTheme } from "next-themes";
import { Button } from "@/components/ui/button";

type Item = {
  title: string;
  url: string;
  icon: typeof Users;
  roles: Array<"admin" | "insegnante" | "studente">;
};

const gestione: Item[] = [
  {
    title: "Dashboard",
    url: "/dashboard",
    icon: LayoutDashboard,
    roles: ["admin", "insegnante", "studente"],
  },
  { title: "Ordini & Prenotazioni", url: "/prenotazioni", icon: ShoppingBag, roles: ["admin"] },
  { title: "Studenti", url: "/studenti", icon: GraduationCap, roles: ["admin"] },
  { title: "Insegnanti", url: "/insegnanti", icon: Users, roles: ["admin"] },
  { title: "Corsi", url: "/corsi", icon: BookOpen, roles: ["admin", "insegnante", "studente"] },
];

const documenti: Item[] = [
  { title: "Documenti", url: "/documenti", icon: FileText, roles: ["admin", "studente"] },
  { title: "Pagamenti", url: "/pagamenti", icon: CreditCard, roles: ["admin", "studente"] },
];

const scuola: Item[] = [
  { title: "Orari", url: "/orari", icon: Calendar, roles: ["admin", "insegnante", "studente"] },
  {
    title: "Valutazioni",
    url: "/valutazioni",
    icon: ClipboardCheck,
    roles: ["admin", "insegnante", "studente"],
  },
  {
    title: "Presenze",
    url: "/presenze",
    icon: UserCheck,
    roles: ["admin", "insegnante", "studente"],
  },
  { title: "Registro Attività", url: "/registro", icon: Activity, roles: ["admin"] },
];

export function AppSidebar() {
  const { state } = useSidebar();
  const collapsed = state === "collapsed";
  const pathname = useRouterState({ select: (r) => r.location.pathname });
  const role = useAppStore((s) => s.role);
  const { theme, setTheme } = useTheme();

  const isActive = (url: string) => pathname === url || pathname.startsWith(url + "/");

  const renderGroup = (label: string, items: Item[]) => {
    const filtered = items.filter((i) => i.roles.includes(role));
    if (filtered.length === 0) return null;
    return (
      <SidebarGroup>
        {!collapsed && (
          <SidebarGroupLabel className="text-sidebar-foreground/50 text-[10px] font-semibold tracking-[0.14em] uppercase px-3">
            {label}
          </SidebarGroupLabel>
        )}
        <SidebarGroupContent>
          <SidebarMenu>
            {filtered.map((item) => (
              <SidebarMenuItem key={item.url}>
                <SidebarMenuButton
                  asChild
                  isActive={isActive(item.url)}
                  className="data-[active=true]:bg-sidebar-primary data-[active=true]:text-sidebar-primary-foreground data-[active=true]:font-medium hover:bg-sidebar-accent hover:text-sidebar-accent-foreground rounded-lg h-10"
                >
                  <Link to={item.url}>
                    <item.icon className="h-4 w-4 shrink-0" />
                    {!collapsed && <span>{item.title}</span>}
                  </Link>
                </SidebarMenuButton>
              </SidebarMenuItem>
            ))}
          </SidebarMenu>
        </SidebarGroupContent>
      </SidebarGroup>
    );
  };

  return (
    <Sidebar collapsible="offcanvas" className="border-r border-sidebar-border">
      <SidebarHeader className="p-4">
        <Link to="/dashboard" className="flex items-center gap-3">
          <div className="h-12 w-12 flex items-center justify-center shrink-0">
            <img
              src="/no_white_stroke.svg"
              alt="Atena Scuola Logo"
              className="h-12 w-12 object-contain"
            />
          </div>
          {!collapsed && (
            <div className="min-w-0">
              <div className="font-semibold text-sidebar-foreground truncate">Atena Scuola</div>
              <div className="text-[11px] text-sidebar-foreground/60 truncate">
                English Learning Hub
              </div>
            </div>
          )}
        </Link>
      </SidebarHeader>

      <SidebarContent className="px-2">
        {renderGroup("Gestione", gestione)}
        {renderGroup("Documenti", documenti)}
        {renderGroup("Scuola", scuola)}
      </SidebarContent>

      <SidebarFooter className="p-3">
        <div className={collapsed ? "flex flex-col gap-2 items-center" : "flex items-center gap-2"}>
          <div className="h-9 w-9 rounded-full bg-sidebar-primary/20 border border-sidebar-primary/40 flex items-center justify-center text-sidebar-primary-foreground text-xs font-semibold">
            A
          </div>
          {!collapsed && (
            <>
              <Button
                size="icon"
                variant="ghost"
                className="h-9 w-9 text-sidebar-foreground/80 hover:bg-sidebar-accent hover:text-sidebar-accent-foreground"
                onClick={() => setTheme(theme === "dark" ? "light" : "dark")}
                aria-label="Cambia tema"
              >
                {theme === "dark" ? <Sun className="h-4 w-4" /> : <Moon className="h-4 w-4" />}
              </Button>
              <Button
                size="icon"
                variant="ghost"
                className="h-9 w-9 text-sidebar-foreground/80 hover:bg-sidebar-accent hover:text-sidebar-accent-foreground text-[11px] font-semibold"
                aria-label="Lingua"
              >
                <Languages className="h-4 w-4" />
              </Button>
              <Button
                size="icon"
                variant="ghost"
                className="h-9 w-9 text-sidebar-foreground/80 hover:bg-sidebar-accent hover:text-sidebar-accent-foreground ml-auto"
                aria-label="Esci"
              >
                <LogOut className="h-4 w-4" />
              </Button>
            </>
          )}
        </div>
      </SidebarFooter>
    </Sidebar>
  );
}
