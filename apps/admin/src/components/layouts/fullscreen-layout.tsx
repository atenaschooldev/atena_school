"use client"

import * as React from "react"
import { AppSidebar } from "@/components/app-sidebar"
import { SiteHeader } from "@/components/site-header"
import { ThemeCustomizer } from "@/components/theme-customizer"
import { useSidebarConfig } from "@/hooks/use-sidebar-config"
import {
  SidebarInset,
  SidebarProvider,
} from "@/components/ui/sidebar"

interface FullscreenLayoutProps {
  children: React.ReactNode
}

/**
 * Layout without footer/padding wrappers — used for fullscreen views like the calendar.
 * The child component is responsible for its own padding/sizing.
 */
export function FullscreenLayout({ children }: FullscreenLayoutProps) {
  const [themeCustomizerOpen, setThemeCustomizerOpen] = React.useState(false)
  const { config } = useSidebarConfig()

  return (
    <SidebarProvider
      style={
        {
          "--sidebar-width": "16rem",
          "--sidebar-width-icon": "3rem",
          "--header-height": "calc(var(--spacing) * 14)",
        } as React.CSSProperties
      }
      className={`h-svh overflow-hidden ${config.collapsible === "none" ? "sidebar-none-mode" : ""}`}
    >
      {config.side === "left" ? (
        <>
          <AppSidebar
            variant={config.variant}
            collapsible={config.collapsible}
            side={config.side}
          />
          <SidebarInset className="flex flex-col min-h-0 overflow-hidden">
            <SiteHeader onOpenCustomizer={() => setThemeCustomizerOpen(true)} />
            <div className="flex flex-1 flex-col min-h-0 overflow-hidden">
              {children}
            </div>
          </SidebarInset>
        </>
      ) : (
        <>
          <SidebarInset className="flex flex-col min-h-0 overflow-hidden">
            <SiteHeader onOpenCustomizer={() => setThemeCustomizerOpen(true)} />
            <div className="flex flex-1 flex-col min-h-0 overflow-hidden">
              {children}
            </div>
          </SidebarInset>
          <AppSidebar
            variant={config.variant}
            collapsible={config.collapsible}
            side={config.side}
          />
        </>
      )}

      <ThemeCustomizer
        open={themeCustomizerOpen}
        onOpenChange={setThemeCustomizerOpen}
      />
    </SidebarProvider>
  )
}
