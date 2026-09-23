"use client"

import * as React from "react"
import {
  LayoutDashboard,
  CheckSquare,
  Layers,
  Calendar,
  Settings,
  CreditCard,
  Users,
  BadgeCheck,
  GraduationCap,
  CheckCircle2,
  Globe,
  Tag,
  Bell,
  Plug,
  Building2,
  Palette,
  ClipboardList,
  Sparkles,
} from "lucide-react"
import { Link } from "react-router-dom"
import { Logo } from "@/components/logo"

import { NavMain } from "@/components/nav-main"
import { NavUser } from "@/components/nav-user"
import { useTranslation } from "@/i18n/context"
import { useSchoolProfile } from "@/hooks/use-school-profile"
import {
  Sidebar,
  SidebarContent,
  SidebarFooter,
  SidebarHeader,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
} from "@/components/ui/sidebar"

export function AppSidebar({ ...props }: React.ComponentProps<typeof Sidebar>) {
  const { t } = useTranslation()
  const { profile } = useSchoolProfile()

  const user = {
    name: profile.name || "Atena School",
    email: profile.email || "admin@atenaschool.com",
    avatar: profile.logo_url || "",
  }

  const navGroups = [
    {
      label: t("nav.overview"),
      items: [
        {
          title: t("nav.dashboard"),
          url: "/dashboard",
          icon: LayoutDashboard,
        },
        {
          title: t("nav.website"),
          url: profile.site_url || profile.website || "https://atenaschool.com",
          icon: Globe,
        },
      ],
    },
    {
      label: t("nav.schoolManagement"),
      items: [
        {
          title: t("nav.courses"),
          url: "/corsi",
          icon: CheckSquare,
        },
        {
          title: t("nav.groups") || "Gruppi Classi",
          url: "/gruppi",
          icon: Layers,
        },
        {
          title: t("nav.bookings"),
          url: "/prenotazioni",
          icon: CreditCard,
        },
        {
          title: t("nav.activeServices") || "Servizi Attivi",
          url: "/servizi-attivi",
          icon: Sparkles,
        },
        {
          title: t("nav.payments"),
          url: "/pagamenti",
          icon: CreditCard,
        },
        {
          title: t("nav.attendance"),
          url: "/presenze",
          icon: CheckCircle2,
        },
        {
          title: t("nav.annualMemberships"),
          url: "/iscrizioni",
          icon: BadgeCheck,
        },
        {
          title: t("nav.teachers"),
          url: "/insegnanti",
          icon: GraduationCap,
        },
        {
          title: t("nav.promotions") || "Codici Promo",
          url: "/promozioni",
          icon: Tag,
        },
        {
          title: t("nav.schedule"),
          url: "/orari",
          icon: Calendar,
        },
        {
          title: t("nav.users"),
          url: "/users",
          icon: Users,
        },
        {
          title: t("nav.notifications") || "Notifiche & Template",
          url: "/notifiche",
          icon: Bell,
        },
        {
          title: "Moduli & Form Engine",
          url: "/moduli",
          icon: ClipboardList,
        },
      ],
    },
    {
      label: t("nav.settings"),
      items: [
        {
          title: t("nav.integrations") || "Integrazioni & White-Label",
          url: "/settings/connections",
          icon: Plug,
        },
        {
          title: t("nav.accountSettings"),
          url: "/settings/account",
          icon: Building2,
        },
        {
          title: t("nav.appearance"),
          url: "/settings/appearance",
          icon: Palette,
        },
      ],
    },
  ]

  return (
    <Sidebar {...props}>
      <SidebarHeader>
        <SidebarMenu>
          <SidebarMenuItem>
            <SidebarMenuButton size="lg" asChild>
              <Link to="/dashboard">
                <div className="flex aspect-square size-8 items-center justify-center rounded-lg bg-primary text-primary-foreground overflow-hidden">
                  {profile.logo_url ? (
                    <img
                      src={profile.logo_url}
                      alt={profile.name}
                      className="size-6 object-contain"
                      onError={(e) => {
                        e.currentTarget.style.display = "none";
                      }}
                    />
                  ) : (
                    <Logo size={24} className="text-current" />
                  )}
                </div>
                <div className="grid flex-1 text-left text-sm leading-tight">
                  <span className="truncate font-medium">{profile.name || "Atena School"}</span>
                  <span className="truncate text-xs">{t("nav.adminDashboard")}</span>
                </div>
              </Link>
            </SidebarMenuButton>
          </SidebarMenuItem>
        </SidebarMenu>
      </SidebarHeader>
      <SidebarContent>
        {navGroups.map((group) => (
          <NavMain key={group.label} label={group.label} items={group.items} />
        ))}
      </SidebarContent>
      <SidebarFooter>
        <NavUser user={user} />
      </SidebarFooter>
    </Sidebar>
  )
}
