"use client"

import * as React from "react"
import { useNavigate } from "react-router-dom"
import { Command as CommandPrimitive } from "cmdk"
import {
  Search,
  LayoutDashboard,
  Globe,
  BookOpen,
  Layers,
  CreditCard,
  Sparkles,
  Receipt,
  CheckCircle2,
  BadgeCheck,
  GraduationCap,
  Tag,
  Calendar,
  Users,
  Bell,
  ClipboardList,
  HelpCircle,
  Plug,
  Building2,
  User,
  Palette,
  Settings,
  Shield,
  AlertTriangle,
  ArrowRight,
  type LucideIcon,
} from "lucide-react"

import { Dialog, DialogContent, DialogTitle } from "@/components/ui/dialog"
import { Badge } from "@/components/ui/badge"
import { cn } from "@/lib/utils"
import { useTranslation } from "@/i18n/context"

const Command = React.forwardRef<
  React.ElementRef<typeof CommandPrimitive>,
  React.ComponentPropsWithoutRef<typeof CommandPrimitive>
>(({ className, ...props }, ref) => (
  <CommandPrimitive
    ref={ref}
    className={cn(
      "flex h-full w-full flex-col overflow-hidden rounded-xl bg-popover text-popover-foreground",
      className
    )}
    {...props}
  />
))
Command.displayName = CommandPrimitive.displayName

const CommandInput = React.forwardRef<
  React.ElementRef<typeof CommandPrimitive.Input>,
  React.ComponentPropsWithoutRef<typeof CommandPrimitive.Input>
>(({ className, ...props }, ref) => (
  <div className="flex items-center border-b px-3.5" cmdk-input-wrapper="">
    <Search className="mr-2.5 h-4 w-4 shrink-0 text-muted-foreground" />
    <CommandPrimitive.Input
      ref={ref}
      className={cn(
        "flex h-12 w-full rounded-md bg-transparent py-3 text-sm outline-none placeholder:text-muted-foreground disabled:cursor-not-allowed disabled:opacity-50",
        className
      )}
      {...props}
    />
  </div>
))
CommandInput.displayName = CommandPrimitive.Input.displayName

const CommandList = React.forwardRef<
  React.ElementRef<typeof CommandPrimitive.List>,
  React.ComponentPropsWithoutRef<typeof CommandPrimitive.List>
>(({ className, ...props }, ref) => (
  <CommandPrimitive.List
    ref={ref}
    className={cn("max-h-[380px] overflow-y-auto overflow-x-hidden p-2", className)}
    {...props}
  />
))
CommandList.displayName = CommandPrimitive.List.displayName

const CommandEmpty = React.forwardRef<
  React.ElementRef<typeof CommandPrimitive.Empty>,
  React.ComponentPropsWithoutRef<typeof CommandPrimitive.Empty>
>((props, ref) => (
  <CommandPrimitive.Empty
    ref={ref}
    className="py-8 text-center text-xs text-muted-foreground"
    {...props}
  />
))
CommandEmpty.displayName = CommandPrimitive.Empty.displayName

const CommandGroup = React.forwardRef<
  React.ElementRef<typeof CommandPrimitive.Group>,
  React.ComponentPropsWithoutRef<typeof CommandPrimitive.Group>
>(({ className, ...props }, ref) => (
  <CommandPrimitive.Group
    ref={ref}
    className={cn(
      "overflow-hidden p-1 text-foreground [&_[cmdk-group-heading]]:px-2.5 [&_[cmdk-group-heading]]:py-1.5 [&_[cmdk-group-heading]]:text-[11px] [&_[cmdk-group-heading]]:font-bold [&_[cmdk-group-heading]]:uppercase [&_[cmdk-group-heading]]:tracking-wider [&_[cmdk-group-heading]]:text-muted-foreground",
      className
    )}
    {...props}
  />
))
CommandGroup.displayName = CommandPrimitive.Group.displayName

const CommandItem = React.forwardRef<
  React.ElementRef<typeof CommandPrimitive.Item>,
  React.ComponentPropsWithoutRef<typeof CommandPrimitive.Item>
>(({ className, ...props }, ref) => (
  <CommandPrimitive.Item
    ref={ref}
    className={cn(
      "relative flex cursor-pointer select-none items-center justify-between rounded-lg px-3 py-2 text-xs font-medium outline-none transition-colors aria-selected:bg-accent aria-selected:text-accent-foreground data-[disabled=true]:pointer-events-none data-[disabled=true]:opacity-50",
      className
    )}
    {...props}
  />
))
CommandItem.displayName = CommandPrimitive.Item.displayName

interface SearchItem {
  title: string
  subtitle?: string
  keywords?: string
  url: string
  group: string
  icon?: LucideIcon
  badge?: string
}

interface CommandSearchProps {
  open: boolean
  onOpenChange: (open: boolean) => void
}

export function CommandSearch({ open, onOpenChange }: CommandSearchProps) {
  const { t, locale } = useTranslation()
  const navigate = useNavigate()
  const commandRef = React.useRef<HTMLDivElement>(null)

  const tr = (key: string, fallback: string) => {
    const val = t(key)
    return val && val !== key ? val : fallback
  }

  const isEn = locale === "en"

  const searchItems: SearchItem[] = [
    // 1. Overview / Panoramica
    {
      title: tr("nav.dashboard", isEn ? "Dashboard" : "Dashboard Panoramica"),
      subtitle: isEn ? "KPIs, stats, and real-time metrics" : "KPI, statistiche e andamento in tempo reale",
      keywords: "home analytics overview metrics kpi entrate",
      url: "/dashboard",
      group: tr("nav.overview", isEn ? "Overview" : "Panoramica"),
      icon: LayoutDashboard,
    },
    {
      title: tr("nav.website", isEn ? "Public Landing Page" : "Sito Web Pubblico"),
      subtitle: isEn ? "Atena School main storefront" : "Sito vetrina principale Atena School",
      keywords: "landing website homepage storefront portale",
      url: "/landing",
      group: tr("nav.overview", isEn ? "Overview" : "Panoramica"),
      icon: Globe,
      badge: isEn ? "External / Preview" : "Vetrina",
    },

    // 2. School Management / Gestione Didattica & Scuola
    {
      title: tr("nav.courses", isEn ? "Courses & Categories" : "Corsi & Categorie"),
      subtitle: isEn ? "Language programs, pricing, and active course catalogs" : "Catalogo corsi, livelli, tariffe e categorie",
      keywords: "corsi courses categories lingue lezioni lezioni individuali collettivi",
      url: "/corsi",
      group: tr("nav.schoolManagement", isEn ? "School Management" : "Gestione Didattica & Scuola"),
      icon: BookOpen,
    },
    {
      title: tr("nav.groups", isEn ? "Class Groups" : "Gruppi Classi"),
      subtitle: isEn ? "Student groups, cohorts, and assigned rooms" : "Gruppi allievi, classi attive e docenti assegnati",
      keywords: "gruppi groups classi cohorts aule livelli studenti",
      url: "/gruppi",
      group: tr("nav.schoolManagement", isEn ? "School Management" : "Gestione Didattica & Scuola"),
      icon: Layers,
    },
    {
      title: tr("nav.bookings", isEn ? "Bookings & Orders" : "Prenotazioni & Ordini"),
      subtitle: isEn ? "Online checkout reservations and client orders" : "Ordini online, checkout e iscrizioni clienti",
      keywords: "prenotazioni bookings ordini checkout clienti stripe",
      url: "/prenotazioni",
      group: tr("nav.schoolManagement", isEn ? "School Management" : "Gestione Didattica & Scuola"),
      icon: CreditCard,
    },
    {
      title: tr("nav.activeServices", isEn ? "Active Services & Enrollments" : "Servizi Attivi & Iscrizioni"),
      subtitle: isEn ? "Active student enrollments and course services" : "Iscrizioni corsi attive, lezioni residue e pacchetti",
      keywords: "servizi attivi active services iscrizioni lezioni residue abbonamenti",
      url: "/servizi-attivi",
      group: tr("nav.schoolManagement", isEn ? "School Management" : "Gestione Didattica & Scuola"),
      icon: Sparkles,
    },
    {
      title: tr("nav.payments", isEn ? "Payments & Transactions" : "Pagamenti & Transazioni"),
      subtitle: isEn ? "Stripe checkout receipts, registration fees, and cash logs" : "Incassi Stripe, ricevute fiscali, quote €30 e rimborsi",
      keywords: "pagamenti payments transazioni stripe ricevute fatture fee contanti",
      url: "/pagamenti",
      group: tr("nav.schoolManagement", isEn ? "School Management" : "Gestione Didattica & Scuola"),
      icon: Receipt,
    },
    {
      title: tr("nav.attendance", isEn ? "Attendance & Class Register" : "Presenze & Registro Lezioni"),
      subtitle: isEn ? "Lesson completions, student absences, and roll calls" : "Appello lezioni, presenze studenti e completamento ore",
      keywords: "presenze attendance registro lezioni assenze appello ore svolte",
      url: "/presenze",
      group: tr("nav.schoolManagement", isEn ? "School Management" : "Gestione Didattica & Scuola"),
      icon: CheckCircle2,
    },
    {
      title: tr("nav.annualMemberships", isEn ? "Annual Memberships (€30)" : "Quote Annuali & Tesseramento"),
      subtitle: isEn ? "Registration fee (€30) status and validity tracking" : "Stato tesseramento €30, validità annuale e rinnovi",
      keywords: "iscrizioni memberships quota annuale tesseramento 30 euro associazione",
      url: "/iscrizioni",
      group: tr("nav.schoolManagement", isEn ? "School Management" : "Gestione Didattica & Scuola"),
      icon: BadgeCheck,
    },
    {
      title: tr("nav.teachers", isEn ? "Teachers & Instructors" : "Insegnanti & Docenti"),
      subtitle: isEn ? "Faculty members, hourly rates, and bio profiles" : "Corpo docenti, tariffe orarie, materie e contatti",
      keywords: "insegnanti teachers docenti professori staff orario disponibilità",
      url: "/insegnanti",
      group: tr("nav.schoolManagement", isEn ? "School Management" : "Gestione Didattica & Scuola"),
      icon: GraduationCap,
    },
    {
      title: tr("nav.promotions", isEn ? "Promo Codes & Discounts" : "Codici Promo & Sconti"),
      subtitle: isEn ? "Coupons, promotional campaigns, and discount percentages" : "Coupon promozionali, sconti percentuali e fissi",
      keywords: "promozioni promo sconti coupon sconti promo-codes voucher",
      url: "/promozioni",
      group: tr("nav.schoolManagement", isEn ? "School Management" : "Gestione Didattica & Scuola"),
      icon: Tag,
    },
    {
      title: tr("nav.schedule", isEn ? "Schedule & Calendar" : "Orari & Calendario"),
      subtitle: isEn ? "Class timetable, weekly planner, and room allocations" : "Calendario settimanale lezioni, orari e aule",
      keywords: "orari schedule calendario agenda lezioni timetable",
      url: "/orari",
      group: tr("nav.schoolManagement", isEn ? "School Management" : "Gestione Didattica & Scuola"),
      icon: Calendar,
    },
    {
      title: tr("nav.users", isEn ? "Users & Accounts" : "Utenti & Account"),
      subtitle: isEn ? "System administrators, secretaries, and role permissions" : "Amministratori di sistema, segreteria e ruoli",
      keywords: "users utenti account ruoli permessi accessi segreteria",
      url: "/users",
      group: tr("nav.schoolManagement", isEn ? "School Management" : "Gestione Didattica & Scuola"),
      icon: Users,
    },
    {
      title: tr("nav.notifications", isEn ? "Notifications, Triggers & Logs" : "Notifiche, Automazioni & Log"),
      subtitle: isEn ? "Email & Telegram templates, automation triggers, delivery logs" : "Modelli Email/Telegram, regole di trigger e registro consegne",
      keywords: "notifiche notifications templates triggers email telegram resend delivery logs",
      url: "/notifiche",
      group: tr("nav.schoolManagement", isEn ? "School Management" : "Gestione Didattica & Scuola"),
      icon: Bell,
    },
    {
      title: tr("nav.forms", isEn ? "Forms & Dynamic Fields" : "Moduli & Form Engine"),
      subtitle: isEn ? "Custom contact templates, registration fields, and lead capture" : "Moduli di contatto dinamici, campi personalizzati e lead",
      keywords: "moduli forms form-engine campi personalizzati lead iscrizione",
      url: "/moduli",
      group: tr("nav.schoolManagement", isEn ? "School Management" : "Gestione Didattica & Scuola"),
      icon: ClipboardList,
    },
    {
      title: tr("nav.faqs", isEn ? "FAQs & Help Center" : "Domande Frequenti (FAQs)"),
      subtitle: isEn ? "School frequently asked questions and student support" : "Domande frequenti, risposte standard e supporto allievi",
      keywords: "faqs domande frequenti aiuto supporto help guida",
      url: "/faqs",
      group: tr("nav.schoolManagement", isEn ? "School Management" : "Gestione Didattica & Scuola"),
      icon: HelpCircle,
    },

    // 3. Settings & Configurations / Impostazioni
    {
      title: tr("nav.integrations", isEn ? "Integrations & White-Label" : "Integrazioni & White-Label"),
      subtitle: isEn ? "Stripe, Resend, Telegram Bot, Supabase, and Sentry configs" : "Configurazione API Stripe, Resend, Telegram, Supabase e Sentry",
      keywords: "integrazioni connections api stripe resend telegram sentry keys white-label",
      url: "/settings/connections",
      group: tr("nav.settings", isEn ? "Settings" : "Impostazioni"),
      icon: Plug,
    },
    {
      title: tr("nav.accountSettings", isEn ? "School Profile & Company Info" : "Profilo Scuola & Dati Azienda"),
      subtitle: isEn ? "Logo, school name, VAT number, address, and legal contacts" : "Logo, denominazione scuola, P.IVA, indirizzo e recapiti legali",
      keywords: "profilo scuola company logo indirizzo p.iva telefono email account",
      url: "/settings/account",
      group: tr("nav.settings", isEn ? "Settings" : "Impostazioni"),
      icon: Building2,
    },
    {
      title: tr("nav.userProfile", isEn ? "User Profile & Security" : "Profilo Personale & Sicurezza"),
      subtitle: isEn ? "Personal credentials, password update, and session details" : "Credenziali personali, modifica password e sessioni",
      keywords: "profilo utente password sicurezza credenziali sessione",
      url: "/settings/user",
      group: tr("nav.settings", isEn ? "Settings" : "Impostazioni"),
      icon: User,
    },
    {
      title: tr("nav.localization", isEn ? "Localization & AI Translation" : "Lingue & Traduzione AI"),
      subtitle: isEn ? "Multi-language dictionaries, automated translations, and locales" : "Dizionari multilingua, traduzione automatica AI e localizzazione",
      keywords: "lingue localization traduzioni i18n dizionari italiano english",
      url: "/settings/localization",
      group: tr("nav.settings", isEn ? "Settings" : "Impostazioni"),
      icon: Globe,
    },
    {
      title: tr("nav.notificationSettings", isEn ? "System Notification Preferences" : "Preferenze Notifiche Sistema"),
      subtitle: isEn ? "Staff alert preferences, system broadcasts, and digests" : "Preferenze avvisi segreteria, broadcast e notifiche push",
      keywords: "notifiche preferenze avvisi email segreteria broadcast",
      url: "/settings/notifications",
      group: tr("nav.settings", isEn ? "Settings" : "Impostazioni"),
      icon: Bell,
    },
    {
      title: tr("nav.appearance", isEn ? "Theme & Appearance" : "Aspetto & Tema Grafico"),
      subtitle: isEn ? "Light/dark mode, accent colors, and UI customization" : "Modalità chiara/scura, palette colori e raggio bordi",
      keywords: "tema appearance dark mode colori font aspetto personalizzazione",
      url: "/settings/appearance",
      group: tr("nav.settings", isEn ? "Settings" : "Impostazioni"),
      icon: Palette,
    },

    // 4. System & Error Pages / Sistema & Pagine di Errore
    {
      title: isEn ? "Page Not Found (404)" : "Pagina Non Trovata (404)",
      subtitle: isEn ? "Error 404 test page" : "Pagina test errore 404",
      keywords: "error 404 not found pagina non trovata",
      url: "/errors/not-found",
      group: isEn ? "System Pages" : "Sistema & Pagine Errore",
      icon: AlertTriangle,
      badge: "404",
    },
    {
      title: isEn ? "Access Forbidden (403)" : "Accesso Negato (403)",
      subtitle: isEn ? "Error 403 test page" : "Pagina test errore 403",
      keywords: "error 403 forbidden accesso negato",
      url: "/errors/forbidden",
      group: isEn ? "System Pages" : "Sistema & Pagine Errore",
      icon: Shield,
      badge: "403",
    },
    {
      title: isEn ? "Unauthorized Access (401)" : "Non Autorizzato (401)",
      subtitle: isEn ? "Error 401 test page" : "Pagina test errore 401",
      keywords: "error 401 unauthorized non autorizzato",
      url: "/errors/unauthorized",
      group: isEn ? "System Pages" : "Sistema & Pagine Errore",
      icon: Shield,
      badge: "401",
    },
    {
      title: isEn ? "Internal Server Error (500)" : "Errore Interno Server (500)",
      subtitle: isEn ? "Error 500 test page" : "Pagina test errore 500",
      keywords: "error 500 internal server error errore server",
      url: "/errors/internal-server-error",
      group: isEn ? "System Pages" : "Sistema & Pagine Errore",
      icon: AlertTriangle,
      badge: "500",
    },
    {
      title: isEn ? "Under Maintenance" : "In Manutenzione",
      subtitle: isEn ? "Maintenance mode page" : "Pagina manutenzione programmata",
      keywords: "maintenance manutenzione offline",
      url: "/errors/under-maintenance",
      group: isEn ? "System Pages" : "Sistema & Pagine Errore",
      icon: Settings,
      badge: isEn ? "Maintenance" : "Manutenzione",
    },
  ]

  const groupedItems = searchItems.reduce((acc, item) => {
    if (!acc[item.group]) {
      acc[item.group] = []
    }
    acc[item.group].push(item)
    return acc
  }, {} as Record<string, SearchItem[]>)

  const handleSelect = (url: string) => {
    navigate(url)
    onOpenChange(false)
    if (commandRef.current) {
      commandRef.current.style.transform = "scale(0.97)"
      setTimeout(() => {
        if (commandRef.current) {
          commandRef.current.style.transform = ""
        }
      }, 100)
    }
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="overflow-hidden p-0 shadow-2xl border border-border sm:max-w-[640px]">
        <DialogTitle className="sr-only">Spotlight Search</DialogTitle>
        <Command
          ref={commandRef}
          className="transition-transform duration-100 ease-out"
        >
          <CommandInput
            placeholder={
              isEn
                ? "Search pages, settings, courses, bookings, or type a keyword..."
                : "Cerca pagine, impostazioni, corsi, pagamenti o scrivi una parola chiave..."
            }
            autoFocus
          />
          <CommandList>
            <CommandEmpty>
              {isEn ? "No matching pages found." : "Nessuna pagina trovata."}
            </CommandEmpty>
            {Object.entries(groupedItems).map(([group, items]) => (
              <CommandGroup key={group} heading={group}>
                {items.map((item) => {
                  const Icon = item.icon
                  const searchVal = `${item.title} ${item.subtitle || ""} ${item.keywords || ""} ${item.url}`
                  return (
                    <CommandItem
                      key={item.url}
                      value={searchVal}
                      onSelect={() => handleSelect(item.url)}
                      className="group"
                    >
                      <div className="flex items-center gap-3 min-w-0 flex-1">
                        <div className="p-2 rounded-lg bg-muted/60 text-muted-foreground group-aria-selected:bg-primary/10 group-aria-selected:text-primary transition-colors shrink-0">
                          {Icon && <Icon className="h-4 w-4" />}
                        </div>
                        <div className="flex flex-col min-w-0 flex-1">
                          <div className="flex items-center gap-2">
                            <span className="font-semibold text-xs text-foreground truncate">
                              {item.title}
                            </span>
                            {item.badge && (
                              <Badge variant="secondary" className="text-[10px] px-1.5 py-0 font-mono">
                                {item.badge}
                              </Badge>
                            )}
                          </div>
                          {item.subtitle && (
                            <span className="text-[11px] text-muted-foreground truncate">
                              {item.subtitle}
                            </span>
                          )}
                        </div>
                      </div>
                      <div className="flex items-center gap-2 shrink-0 ml-2">
                        <span className="text-[10px] font-mono text-muted-foreground opacity-0 group-aria-selected:opacity-100 transition-opacity hidden sm:inline">
                          {item.url}
                        </span>
                        <ArrowRight className="h-3.5 w-3.5 text-muted-foreground opacity-0 group-aria-selected:opacity-100 transition-opacity" />
                      </div>
                    </CommandItem>
                  )
                })}
              </CommandGroup>
            ))}
          </CommandList>
        </Command>
      </DialogContent>
    </Dialog>
  )
}

export function SearchTrigger({ onClick }: { onClick: () => void }) {
  const { locale } = useTranslation()
  const isEn = locale === "en"

  return (
    <button
      onClick={onClick}
      className="inline-flex items-center gap-2 whitespace-nowrap rounded-md text-xs font-medium transition-colors focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring disabled:pointer-events-none disabled:opacity-50 border border-input bg-background shadow-xs hover:bg-accent hover:text-accent-foreground h-9 px-3 py-1 relative w-full justify-start text-muted-foreground sm:pr-12 md:w-44 lg:w-60 cursor-pointer"
    >
      <Search className="mr-1.5 h-3.5 w-3.5" />
      <span className="hidden sm:inline-flex">{isEn ? "Search pages..." : "Cerca pagine..."}</span>
      <span className="inline-flex sm:hidden">{isEn ? "Search..." : "Cerca..."}</span>
      <kbd className="pointer-events-none absolute right-1.5 top-2 hidden h-4.5 select-none items-center gap-0.5 rounded border bg-muted px-1.5 font-mono text-[10px] font-medium opacity-100 sm:flex">
        <span className="text-[10px]">⌘</span>K
      </kbd>
    </button>
  )
}
