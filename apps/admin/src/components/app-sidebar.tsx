"use client"

import * as React from "react"
import {
  LayoutDashboard,
  CheckSquare,
  Calendar,
  Settings,
  CreditCard,
  Users,
  BadgeCheck,
  GraduationCap,
  CheckCircle2,
  Globe,
} from "lucide-react"
import { Link } from "react-router-dom"
import { Logo } from "@/components/logo"

import { NavMain } from "@/components/nav-main"
import { NavUser } from "@/components/nav-user"
import {
  Sidebar,
  SidebarContent,
  SidebarFooter,
  SidebarHeader,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
} from "@/components/ui/sidebar"

const data = {
  user: {
    name: "Atena School",
    email: "store@example.com",
    avatar: "",
  },
  navGroups: [
    {
      label: "Panoramica",
      items: [
        {
          title: "Dashboard",
          url: "/dashboard",
          icon: LayoutDashboard,
        },
        {
          title: "Sito Web (Landing)",
          url: "https://atena-school-landing-three.vercel.app/",
          icon: Globe,
        },
      ],
    },
    {
      label: "Gestione Scuola",
      items: [
        {
          title: "Corsi",
          url: "/corsi",
          icon: CheckSquare,
        },
        {
          title: "Prenotazioni & Ordini",
          url: "/prenotazioni",
          icon: CreditCard,
        },
        {
          title: "Pagamenti",
          url: "/pagamenti",
          icon: CreditCard,
        },
        {
          title: "Presenze & Registro",
          url: "/presenze",
          icon: CheckCircle2,
        },
        {
          title: "Iscrizioni Annuali",
          url: "/iscrizioni",
          icon: BadgeCheck,
        },
        {
          title: "Docenti",
          url: "/insegnanti",
          icon: GraduationCap,
        },
        {
          title: "Orari & Calendario",
          url: "/orari",
          icon: Calendar,
        },
        {
          title: "Utenti & Studenti",
          url: "/users",
          icon: Users,
        },
      ],
    },
    {
      label: "Impostazioni",
      items: [
        {
          title: "Profilo & Account",
          url: "/settings/account",
          icon: Settings,
        },
        {
          title: "Aspetto & Tema",
          url: "/settings/appearance",
          icon: Settings,
        },
      ],
    },
  ],
}

export function AppSidebar({ ...props }: React.ComponentProps<typeof Sidebar>) {
  return (
    <Sidebar {...props}>
      <SidebarHeader>
        <SidebarMenu>
          <SidebarMenuItem>
            <SidebarMenuButton size="lg" asChild>
              <Link to="/dashboard">
                <div className="flex aspect-square size-8 items-center justify-center rounded-lg bg-primary text-primary-foreground">
                  <Logo size={24} className="text-current" />
                </div>
                <div className="grid flex-1 text-left text-sm leading-tight">
                  <span className="truncate font-medium">Atena School</span>
                  <span className="truncate text-xs">Admin Dashboard</span>
                </div>
              </Link>
            </SidebarMenuButton>
          </SidebarMenuItem>
        </SidebarMenu>
      </SidebarHeader>
      <SidebarContent>
        {data.navGroups.map((group) => (
          <NavMain key={group.label} label={group.label} items={group.items} />
        ))}
      </SidebarContent>
      <SidebarFooter>
        <NavUser user={data.user} />
      </SidebarFooter>
    </Sidebar>
  )
}
