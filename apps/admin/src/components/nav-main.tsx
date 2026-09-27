"use client"

import * as React from "react"
import { ChevronRight, ExternalLink, SlidersHorizontal, type LucideIcon } from "lucide-react"
import { Link, useLocation } from "react-router-dom"

import {
  Collapsible,
  CollapsibleContent,
  CollapsibleTrigger,
} from "@/components/ui/collapsible"
import {
  SidebarGroup,
  SidebarGroupLabel,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
  SidebarMenuSub,
  SidebarMenuSubButton,
  SidebarMenuSubItem,
} from "@/components/ui/sidebar"
import { SidebarReorderDialog, type NavItemDef } from "@/components/sidebar-reorder-dialog"
import { useTranslation } from "@/i18n/context"

export function NavMain({
  label,
  items,
  groupKey,
}: {
  label: string
  groupKey?: string
  items: {
    title: string
    url: string
    icon?: LucideIcon
    isActive?: boolean
    items?: {
      title: string
      url: string
      isActive?: boolean
    }[]
  }[]
}) {
  const location = useLocation()
  const { locale } = useTranslation()
  const isEn = locale === "en"
  const storageKey = `atena_nav_order_${groupKey || label.toLowerCase().replace(/\s+/g, "_")}`

  const [customOrder, setCustomOrder] = React.useState<string[]>(() => {
    try {
      const saved = localStorage.getItem(storageKey)
      return saved ? JSON.parse(saved) : []
    } catch {
      return []
    }
  })

  const [isReorderOpen, setIsReorderOpen] = React.useState(false)

  // Sort items based on customOrder if present
  const sortedItems = React.useMemo(() => {
    if (!customOrder || customOrder.length === 0) return items
    const orderMap = new Map(customOrder.map((url, idx) => [url, idx]))
    return [...items].sort((a, b) => {
      const idxA = orderMap.has(a.url) ? orderMap.get(a.url)! : 999
      const idxB = orderMap.has(b.url) ? orderMap.get(b.url)! : 999
      return idxA - idxB
    })
  }, [items, customOrder])

  const handleSaveOrder = (newOrder: string[]) => {
    setCustomOrder(newOrder)
    try {
      localStorage.setItem(storageKey, JSON.stringify(newOrder))
    } catch {
      // Ignore
    }
  }

  const handleResetOrder = () => {
    setCustomOrder([])
    try {
      localStorage.removeItem(storageKey)
    } catch {
      // Ignore
    }
  }

  // Check if any subitem is active to determine if parent should be open
  const shouldBeOpen = (item: typeof items[0]) => {
    if (item.isActive) return true
    return item.items?.some((subItem) => location.pathname === subItem.url) || false
  }

  const navItemDefs: NavItemDef[] = items.map((i) => ({
    id: i.url,
    title: i.title,
    url: i.url,
    icon: i.icon,
  }))

  return (
    <>
      <SidebarGroup className="group/navgroup">
        <div className="flex items-center justify-between pr-2">
          <SidebarGroupLabel className="flex-1 select-none">{label}</SidebarGroupLabel>
          {items.length > 2 && (
            <button
              type="button"
              onClick={() => setIsReorderOpen(true)}
              className="opacity-0 group-hover/navgroup:opacity-100 hover:opacity-100 focus:opacity-100 p-1 rounded-md text-muted-foreground hover:text-foreground hover:bg-muted/80 transition-all cursor-pointer"
              title={isEn ? "Customize menu order" : "Personalizza ordine menu"}
            >
              <SlidersHorizontal className="w-3.5 h-3.5" />
            </button>
          )}
        </div>
        <SidebarMenu>
          {sortedItems.map((item) => (
            <Collapsible
              key={item.title}
              asChild
              defaultOpen={shouldBeOpen(item)}
              className="group/collapsible"
            >
              <SidebarMenuItem>
                {item.items?.length ? (
                  <>
                    <CollapsibleTrigger asChild>
                      <SidebarMenuButton tooltip={item.title} className="cursor-pointer">
                        {item.icon && <item.icon />}
                        <span>{item.title}</span>
                        <ChevronRight className="ml-auto transition-transform duration-200 group-data-[state=open]/collapsible:rotate-90" />
                      </SidebarMenuButton>
                    </CollapsibleTrigger>
                    <CollapsibleContent>
                      <SidebarMenuSub>
                        {item.items?.map((subItem) => (
                          <SidebarMenuSubItem key={subItem.title}>
                            <SidebarMenuSubButton
                              asChild
                              className="cursor-pointer"
                              isActive={location.pathname === subItem.url}
                            >
                              <Link
                                to={subItem.url}
                                target={
                                  item.title === "Auth Pages" || item.title === "Errors"
                                    ? "_blank"
                                    : undefined
                                }
                                rel={
                                  item.title === "Auth Pages" || item.title === "Errors"
                                    ? "noopener noreferrer"
                                    : undefined
                                }
                              >
                                <span>{subItem.title}</span>
                              </Link>
                            </SidebarMenuSubButton>
                          </SidebarMenuSubItem>
                        ))}
                      </SidebarMenuSub>
                    </CollapsibleContent>
                  </>
                ) : item.url.startsWith("http") ? (
                  <SidebarMenuButton asChild tooltip={item.title} className="cursor-pointer">
                    <a href={item.url} target="_blank" rel="noopener noreferrer">
                      {item.icon && <item.icon />}
                      <span>{item.title}</span>
                      <ExternalLink className="ml-auto w-3.5 h-3.5 opacity-60" />
                    </a>
                  </SidebarMenuButton>
                ) : (
                  <SidebarMenuButton
                    asChild
                    tooltip={item.title}
                    className="cursor-pointer"
                    isActive={location.pathname === item.url}
                  >
                    <Link to={item.url}>
                      {item.icon && <item.icon />}
                      <span>{item.title}</span>
                    </Link>
                  </SidebarMenuButton>
                )}
              </SidebarMenuItem>
            </Collapsible>
          ))}
        </SidebarMenu>
      </SidebarGroup>

      <SidebarReorderDialog
        open={isReorderOpen}
        onOpenChange={setIsReorderOpen}
        groupLabel={label}
        items={navItemDefs}
        customOrder={customOrder}
        onSaveOrder={handleSaveOrder}
        onResetOrder={handleResetOrder}
      />
    </>
  )
}

