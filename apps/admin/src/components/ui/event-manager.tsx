"use client"

import { useState, useCallback, useMemo } from "react"
import { Button } from "@/components/ui/button"
import { Card } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
import { Badge } from "@/components/ui/badge"
import { ChevronLeft, ChevronRight, Plus, Calendar, Clock, Grid3x3, List, Search, Filter, X } from "lucide-react"
import { cn } from "@/lib/utils"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuCheckboxItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"

export interface CalEvent {
  id: string
  title: string
  description?: string
  startTime: Date
  endTime: Date
  color: string
  category?: string
  attendees?: string[]
  tags?: string[]
}

export interface EventManagerProps {
  events?: CalEvent[]
  onEventCreate?: (event: Omit<CalEvent, "id">) => void
  onEventUpdate?: (id: string, event: Partial<CalEvent>) => void
  onEventDelete?: (id: string) => void
  categories?: string[]
  colors?: { name: string; value: string; bg: string; text: string }[]
  defaultView?: "month" | "week" | "day" | "list"
  className?: string
  availableTags?: string[]
  createButtonLabel?: string
}

const defaultColors = [
  { name: "Blue", value: "blue", bg: "bg-blue-500", text: "text-blue-700" },
  { name: "Green", value: "green", bg: "bg-green-500", text: "text-green-700" },
  { name: "Purple", value: "purple", bg: "bg-purple-500", text: "text-purple-700" },
  { name: "Orange", value: "orange", bg: "bg-orange-500", text: "text-orange-700" },
  { name: "Pink", value: "pink", bg: "bg-pink-500", text: "text-pink-700" },
  { name: "Red", value: "red", bg: "bg-red-500", text: "text-red-700" },
  { name: "Teal", value: "teal", bg: "bg-teal-500", text: "text-teal-700" },
  { name: "Indigo", value: "indigo", bg: "bg-indigo-500", text: "text-indigo-700" },
]

export function EventManager({
  events: initialEvents = [],
  onEventCreate,
  onEventUpdate,
  onEventDelete,
  categories = ["Lezione", "Esame", "Evento", "Altro"],
  colors = defaultColors,
  defaultView = "week",
  className,
  availableTags = ["Online", "In presenza", "Importante", "Urgente"],
  createButtonLabel = "Nuovo Evento",
}: EventManagerProps) {
  const [events, setEvents] = useState<CalEvent[]>(initialEvents)
  const [currentDate, setCurrentDate] = useState(new Date())
  const [view, setView] = useState<"month" | "week" | "day" | "list">(defaultView)
  const [selectedEvent, setSelectedEvent] = useState<CalEvent | null>(null)
  const [isDialogOpen, setIsDialogOpen] = useState(false)
  const [isCreating, setIsCreating] = useState(false)
  const [draggedEvent, setDraggedEvent] = useState<CalEvent | null>(null)
  const [newEvent, setNewEvent] = useState<Partial<CalEvent>>({
    title: "",
    description: "",
    color: colors[0].value,
    category: categories[0],
    tags: [],
  })

  const [searchQuery, setSearchQuery] = useState("")
  const [selectedColors, setSelectedColors] = useState<string[]>([])
  const [selectedTags, setSelectedTags] = useState<string[]>([])
  const [selectedCategories, setSelectedCategories] = useState<string[]>([])

  // Sync external events changes
  const [prevInitial, setPrevInitial] = useState(initialEvents)
  if (initialEvents !== prevInitial) {
    setPrevInitial(initialEvents)
    setEvents(initialEvents)
  }

  const filteredEvents = useMemo(() => {
    return events.filter((event) => {
      if (searchQuery) {
        const query = searchQuery.toLowerCase()
        const matchesSearch =
          event.title.toLowerCase().includes(query) ||
          event.description?.toLowerCase().includes(query) ||
          event.category?.toLowerCase().includes(query) ||
          event.tags?.some((tag) => tag.toLowerCase().includes(query))
        if (!matchesSearch) return false
      }
      if (selectedColors.length > 0 && !selectedColors.includes(event.color)) return false
      if (selectedTags.length > 0) {
        const hasMatchingTag = event.tags?.some((tag) => selectedTags.includes(tag))
        if (!hasMatchingTag) return false
      }
      if (selectedCategories.length > 0 && event.category && !selectedCategories.includes(event.category)) return false
      return true
    })
  }, [events, searchQuery, selectedColors, selectedTags, selectedCategories])

  const hasActiveFilters = selectedColors.length > 0 || selectedTags.length > 0 || selectedCategories.length > 0

  const clearFilters = () => {
    setSelectedColors([])
    setSelectedTags([])
    setSelectedCategories([])
    setSearchQuery("")
  }

  const handleCreateEvent = useCallback(() => {
    if (!newEvent.title || !newEvent.startTime || !newEvent.endTime) return
    const event: CalEvent = {
      id: Math.random().toString(36).substr(2, 9),
      title: newEvent.title,
      description: newEvent.description,
      startTime: newEvent.startTime,
      endTime: newEvent.endTime,
      color: newEvent.color || colors[0].value,
      category: newEvent.category,
      attendees: newEvent.attendees,
      tags: newEvent.tags || [],
    }
    setEvents((prev) => [...prev, event])
    onEventCreate?.(event)
    setIsDialogOpen(false)
    setIsCreating(false)
    setNewEvent({ title: "", description: "", color: colors[0].value, category: categories[0], tags: [] })
  }, [newEvent, colors, categories, onEventCreate])

  const handleUpdateEvent = useCallback(() => {
    if (!selectedEvent) return
    setEvents((prev) => prev.map((e) => (e.id === selectedEvent.id ? selectedEvent : e)))
    onEventUpdate?.(selectedEvent.id, selectedEvent)
    setIsDialogOpen(false)
    setSelectedEvent(null)
  }, [selectedEvent, onEventUpdate])

  const handleDeleteEvent = useCallback(
    (id: string) => {
      setEvents((prev) => prev.filter((e) => e.id !== id))
      onEventDelete?.(id)
      setIsDialogOpen(false)
      setSelectedEvent(null)
    },
    [onEventDelete],
  )

  const handleDragStart = useCallback((event: CalEvent) => setDraggedEvent(event), [])
  const handleDragEnd = useCallback(() => setDraggedEvent(null), [])

  const handleDrop = useCallback(
    (date: Date, hour?: number) => {
      if (!draggedEvent) return
      const duration = draggedEvent.endTime.getTime() - draggedEvent.startTime.getTime()
      const newStartTime = new Date(date)
      if (hour !== undefined) newStartTime.setHours(hour, 0, 0, 0)
      const newEndTime = new Date(newStartTime.getTime() + duration)
      const updatedEvent = { ...draggedEvent, startTime: newStartTime, endTime: newEndTime }
      setEvents((prev) => prev.map((e) => (e.id === draggedEvent.id ? updatedEvent : e)))
      onEventUpdate?.(draggedEvent.id, updatedEvent)
      setDraggedEvent(null)
    },
    [draggedEvent, onEventUpdate],
  )

  const navigateDate = useCallback(
    (direction: "prev" | "next") => {
      setCurrentDate((prev) => {
        const newDate = new Date(prev)
        if (view === "month") newDate.setMonth(prev.getMonth() + (direction === "next" ? 1 : -1))
        else if (view === "week") newDate.setDate(prev.getDate() + (direction === "next" ? 7 : -7))
        else if (view === "day") newDate.setDate(prev.getDate() + (direction === "next" ? 1 : -1))
        return newDate
      })
    },
    [view],
  )

  const getColorClasses = useCallback(
    (colorValue: string) => colors.find((c) => c.value === colorValue) || colors[0],
    [colors],
  )

  const toggleTag = (tag: string, creating: boolean) => {
    if (creating) {
      setNewEvent((prev) => ({
        ...prev,
        tags: prev.tags?.includes(tag) ? prev.tags.filter((t) => t !== tag) : [...(prev.tags || []), tag],
      }))
    } else {
      setSelectedEvent((prev) =>
        prev
          ? { ...prev, tags: prev.tags?.includes(tag) ? prev.tags.filter((t) => t !== tag) : [...(prev.tags || []), tag] }
          : null,
      )
    }
  }

  const formatDateLabel = () => {
    if (view === "month") return currentDate.toLocaleDateString("it-IT", { month: "long", year: "numeric" })
    if (view === "week") {
      const start = new Date(currentDate)
      start.setDate(currentDate.getDate() - currentDate.getDay() + 1)
      const end = new Date(start)
      end.setDate(start.getDate() + 6)
      return `${start.toLocaleDateString("it-IT", { day: "numeric", month: "short" })} – ${end.toLocaleDateString("it-IT", { day: "numeric", month: "short", year: "numeric" })}`
    }
    if (view === "day") return currentDate.toLocaleDateString("it-IT", { weekday: "long", day: "numeric", month: "long", year: "numeric" })
    return "Tutti gli eventi"
  }

  return (
    <div className={cn("flex flex-col gap-4", className)}>
      {/* Header */}
      <div className="flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
        <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:gap-4">
          <h2 className="text-xl font-semibold sm:text-2xl capitalize">{formatDateLabel()}</h2>
          <div className="flex items-center gap-2">
            <Button variant="outline" size="icon" onClick={() => navigateDate("prev")} className="h-8 w-8">
              <ChevronLeft className="h-4 w-4" />
            </Button>
            <Button variant="outline" size="sm" onClick={() => setCurrentDate(new Date())}>Oggi</Button>
            <Button variant="outline" size="icon" onClick={() => navigateDate("next")} className="h-8 w-8">
              <ChevronRight className="h-4 w-4" />
            </Button>
          </div>
        </div>

        <div className="flex flex-col gap-2 sm:flex-row sm:items-center">
          <div className="hidden sm:flex items-center gap-1 rounded-lg border bg-background p-1">
            {(["month", "week", "day", "list"] as const).map((v) => (
              <Button key={v} variant={view === v ? "secondary" : "ghost"} size="sm" onClick={() => setView(v)} className="h-8">
                {v === "month" && <><Calendar className="h-4 w-4" /><span className="ml-1">Mese</span></>}
                {v === "week" && <><Grid3x3 className="h-4 w-4" /><span className="ml-1">Settimana</span></>}
                {v === "day" && <><Clock className="h-4 w-4" /><span className="ml-1">Giorno</span></>}
                {v === "list" && <><List className="h-4 w-4" /><span className="ml-1">Lista</span></>}
              </Button>
            ))}
          </div>
          <Button onClick={() => { setIsCreating(true); setIsDialogOpen(true) }} className="w-full sm:w-auto">
            <Plus className="mr-2 h-4 w-4" />{createButtonLabel}
          </Button>
        </div>
      </div>

      {/* Search & Filters */}
      <div className="flex flex-col gap-2">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
          <Input placeholder="Cerca eventi..." value={searchQuery} onChange={(e) => setSearchQuery(e.target.value)} className="pl-9" />
          {searchQuery && (
            <Button variant="ghost" size="icon" className="absolute right-1 top-1/2 h-7 w-7 -translate-y-1/2" onClick={() => setSearchQuery("")}>
              <X className="h-4 w-4" />
            </Button>
          )}
        </div>

        <div className="hidden sm:flex items-center gap-2">
          {[
            { label: "Colori", items: colors.map(c => ({ label: c.name, value: c.value })), selected: selectedColors, setSelected: setSelectedColors },
            { label: "Tag", items: availableTags.map(t => ({ label: t, value: t })), selected: selectedTags, setSelected: setSelectedTags },
            { label: "Categorie", items: categories.map(c => ({ label: c, value: c })), selected: selectedCategories, setSelected: setSelectedCategories },
          ].map(({ label, items, selected, setSelected }) => (
            <DropdownMenu key={label}>
              <DropdownMenuTrigger asChild>
                <Button variant="outline" size="sm" className="gap-2 bg-transparent">
                  <Filter className="h-4 w-4" />{label}
                  {selected.length > 0 && <Badge variant="secondary" className="ml-1 h-5 px-1">{selected.length}</Badge>}
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end" className="w-48">
                <DropdownMenuLabel>Filtra per {label}</DropdownMenuLabel>
                <DropdownMenuSeparator />
                {items.map((item) => (
                  <DropdownMenuCheckboxItem
                    key={item.value}
                    checked={selected.includes(item.value)}
                    onCheckedChange={(checked) => setSelected((prev) => checked ? [...prev, item.value] : prev.filter((c) => c !== item.value))}
                  >
                    {item.label}
                  </DropdownMenuCheckboxItem>
                ))}
              </DropdownMenuContent>
            </DropdownMenu>
          ))}
          {hasActiveFilters && (
            <Button variant="ghost" size="sm" onClick={clearFilters} className="gap-2">
              <X className="h-4 w-4" />Pulisci
            </Button>
          )}
        </div>
      </div>

      {/* Views */}
      {view === "month" && (
        <MonthView currentDate={currentDate} events={filteredEvents}
          onEventClick={(e) => { setSelectedEvent(e); setIsDialogOpen(true) }}
          onDragStart={handleDragStart} onDragEnd={handleDragEnd} onDrop={handleDrop} getColorClasses={getColorClasses} />
      )}
      {view === "week" && (
        <WeekView currentDate={currentDate} events={filteredEvents}
          onEventClick={(e) => { setSelectedEvent(e); setIsDialogOpen(true) }}
          onDragStart={handleDragStart} onDragEnd={handleDragEnd} onDrop={handleDrop} getColorClasses={getColorClasses} />
      )}
      {view === "day" && (
        <DayView currentDate={currentDate} events={filteredEvents}
          onEventClick={(e) => { setSelectedEvent(e); setIsDialogOpen(true) }}
          onDragStart={handleDragStart} onDragEnd={handleDragEnd} onDrop={handleDrop} getColorClasses={getColorClasses} />
      )}
      {view === "list" && (
        <ListView events={filteredEvents}
          onEventClick={(e) => { setSelectedEvent(e); setIsDialogOpen(true) }}
          getColorClasses={getColorClasses} />
      )}

      {/* Dialog */}
      <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
        <DialogContent className="max-w-md max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>{isCreating ? "Crea Evento" : "Dettagli Evento"}</DialogTitle>
            <DialogDescription>{isCreating ? "Aggiungi un nuovo evento al calendario" : "Visualizza e modifica i dettagli dell'evento"}</DialogDescription>
          </DialogHeader>

          <div className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="em-title">Titolo</Label>
              <Input id="em-title"
                value={isCreating ? newEvent.title : selectedEvent?.title}
                onChange={(e) => isCreating ? setNewEvent((p) => ({ ...p, title: e.target.value })) : setSelectedEvent((p) => p ? { ...p, title: e.target.value } : null)}
                placeholder="Titolo evento" />
            </div>

            <div className="space-y-2">
              <Label htmlFor="em-desc">Descrizione</Label>
              <Textarea id="em-desc"
                value={isCreating ? newEvent.description : selectedEvent?.description}
                onChange={(e) => isCreating ? setNewEvent((p) => ({ ...p, description: e.target.value })) : setSelectedEvent((p) => p ? { ...p, description: e.target.value } : null)}
                placeholder="Descrizione" rows={3} />
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="em-start">Inizio</Label>
                <Input id="em-start" type="datetime-local"
                  value={isCreating
                    ? newEvent.startTime ? new Date(newEvent.startTime.getTime() - newEvent.startTime.getTimezoneOffset() * 60000).toISOString().slice(0, 16) : ""
                    : selectedEvent ? new Date(selectedEvent.startTime.getTime() - selectedEvent.startTime.getTimezoneOffset() * 60000).toISOString().slice(0, 16) : ""}
                  onChange={(e) => { const d = new Date(e.target.value); isCreating ? setNewEvent((p) => ({ ...p, startTime: d })) : setSelectedEvent((p) => p ? { ...p, startTime: d } : null) }} />
              </div>
              <div className="space-y-2">
                <Label htmlFor="em-end">Fine</Label>
                <Input id="em-end" type="datetime-local"
                  value={isCreating
                    ? newEvent.endTime ? new Date(newEvent.endTime.getTime() - newEvent.endTime.getTimezoneOffset() * 60000).toISOString().slice(0, 16) : ""
                    : selectedEvent ? new Date(selectedEvent.endTime.getTime() - selectedEvent.endTime.getTimezoneOffset() * 60000).toISOString().slice(0, 16) : ""}
                  onChange={(e) => { const d = new Date(e.target.value); isCreating ? setNewEvent((p) => ({ ...p, endTime: d })) : setSelectedEvent((p) => p ? { ...p, endTime: d } : null) }} />
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label>Categoria</Label>
                <Select value={isCreating ? newEvent.category : selectedEvent?.category}
                  onValueChange={(v) => isCreating ? setNewEvent((p) => ({ ...p, category: v })) : setSelectedEvent((p) => p ? { ...p, category: v } : null)}>
                  <SelectTrigger><SelectValue placeholder="Seleziona" /></SelectTrigger>
                  <SelectContent>{categories.map((c) => <SelectItem key={c} value={c}>{c}</SelectItem>)}</SelectContent>
                </Select>
              </div>
              <div className="space-y-2">
                <Label>Colore</Label>
                <Select value={isCreating ? newEvent.color : selectedEvent?.color}
                  onValueChange={(v) => isCreating ? setNewEvent((p) => ({ ...p, color: v })) : setSelectedEvent((p) => p ? { ...p, color: v } : null)}>
                  <SelectTrigger><SelectValue /></SelectTrigger>
                  <SelectContent>
                    {colors.map((c) => (
                      <SelectItem key={c.value} value={c.value}>
                        <div className="flex items-center gap-2"><div className={cn("h-4 w-4 rounded", c.bg)} />{c.name}</div>
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </div>

            <div className="space-y-2">
              <Label>Tag</Label>
              <div className="flex flex-wrap gap-2">
                {availableTags.map((tag) => {
                  const isSelected = isCreating ? newEvent.tags?.includes(tag) : selectedEvent?.tags?.includes(tag)
                  return (
                    <Badge key={tag} variant={isSelected ? "default" : "outline"} className="cursor-pointer transition-all hover:scale-105" onClick={() => toggleTag(tag, isCreating)}>
                      {tag}
                    </Badge>
                  )
                })}
              </div>
            </div>
          </div>

          <DialogFooter>
            {!isCreating && <Button variant="destructive" onClick={() => selectedEvent && handleDeleteEvent(selectedEvent.id)}>Elimina</Button>}
            <Button variant="outline" onClick={() => { setIsDialogOpen(false); setIsCreating(false); setSelectedEvent(null) }}>Annulla</Button>
            <Button onClick={isCreating ? handleCreateEvent : handleUpdateEvent}>{isCreating ? "Crea" : "Salva"}</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  )
}

// ─── EventCard ────────────────────────────────────────────────────────────────
function EventCard({
  event, onEventClick, onDragStart, onDragEnd, getColorClasses, variant = "default",
}: {
  event: CalEvent
  onEventClick: (e: CalEvent) => void
  onDragStart: (e: CalEvent) => void
  onDragEnd: () => void
  getColorClasses: (c: string) => { bg: string; text: string }
  variant?: "default" | "compact" | "detailed"
}) {
  const [isHovered, setIsHovered] = useState(false)
  const colorClasses = getColorClasses(event.color)

  const fmt = (d: Date) => d.toLocaleTimeString("it-IT", { hour: "2-digit", minute: "2-digit" })
  const getDuration = () => {
    const diff = event.endTime.getTime() - event.startTime.getTime()
    const h = Math.floor(diff / 3600000)
    const m = Math.floor((diff % 3600000) / 60000)
    return h > 0 ? `${h}h ${m}m` : `${m}m`
  }

  const hoverCard = (
    <div className="absolute left-0 top-full z-50 mt-1 w-64 animate-in fade-in slide-in-from-top-2 duration-200">
      <Card className="border-2 p-3 shadow-xl">
        <div className="space-y-2">
          <div className="flex items-start justify-between gap-2">
            <h4 className="font-semibold text-sm leading-tight">{event.title}</h4>
            <div className={cn("h-3 w-3 rounded-full flex-shrink-0", colorClasses.bg)} />
          </div>
          {event.description && <p className="text-xs text-muted-foreground line-clamp-2">{event.description}</p>}
          <div className="flex items-center gap-1 text-xs text-muted-foreground">
            <Clock className="h-3 w-3" />
            <span>{fmt(event.startTime)} – {fmt(event.endTime)}</span>
            <span className="text-[10px]">({getDuration()})</span>
          </div>
          <div className="flex flex-wrap gap-1">
            {event.category && <Badge variant="secondary" className="text-[10px] h-5">{event.category}</Badge>}
            {event.tags?.map((t) => <Badge key={t} variant="outline" className="text-[10px] h-5">{t}</Badge>)}
          </div>
        </div>
      </Card>
    </div>
  )

  if (variant === "compact") {
    return (
      <div draggable onDragStart={() => onDragStart(event)} onDragEnd={onDragEnd} onClick={() => onEventClick(event)}
        onMouseEnter={() => setIsHovered(true)} onMouseLeave={() => setIsHovered(false)} className="relative cursor-pointer">
        <div className={cn("rounded px-1.5 py-0.5 text-xs font-medium transition-all duration-300 text-white truncate animate-in fade-in", colorClasses.bg, isHovered && "scale-105 shadow-lg z-10")}>
          {event.title}
        </div>
        {isHovered && hoverCard}
      </div>
    )
  }

  if (variant === "detailed") {
    return (
      <div draggable onDragStart={() => onDragStart(event)} onDragEnd={onDragEnd} onClick={() => onEventClick(event)}
        onMouseEnter={() => setIsHovered(true)} onMouseLeave={() => setIsHovered(false)}
        className={cn("cursor-pointer rounded-lg p-3 transition-all duration-300 text-white animate-in fade-in", colorClasses.bg, isHovered && "scale-[1.03] shadow-2xl ring-2 ring-white/50")}>
        <div className="font-semibold">{event.title}</div>
        {event.description && <div className="mt-1 text-sm opacity-90 line-clamp-2">{event.description}</div>}
        <div className="mt-2 flex items-center gap-2 text-xs opacity-80">
          <Clock className="h-3 w-3" />{fmt(event.startTime)} – {fmt(event.endTime)}
        </div>
      </div>
    )
  }

  return (
    <div draggable onDragStart={() => onDragStart(event)} onDragEnd={onDragEnd} onClick={() => onEventClick(event)}
      onMouseEnter={() => setIsHovered(true)} onMouseLeave={() => setIsHovered(false)} className="relative">
      <div className={cn("cursor-pointer rounded px-2 py-1 text-xs font-medium transition-all duration-300 text-white animate-in fade-in", colorClasses.bg, isHovered && "scale-105 shadow-lg z-10")}>
        <div className="truncate">{event.title}</div>
      </div>
      {isHovered && hoverCard}
    </div>
  )
}

// ─── MonthView ────────────────────────────────────────────────────────────────
function MonthView({ currentDate, events, onEventClick, onDragStart, onDragEnd, onDrop, getColorClasses }: {
  currentDate: Date; events: CalEvent[]
  onEventClick: (e: CalEvent) => void; onDragStart: (e: CalEvent) => void; onDragEnd: () => void
  onDrop: (d: Date) => void; getColorClasses: (c: string) => { bg: string; text: string }
}) {
  const firstDay = new Date(currentDate.getFullYear(), currentDate.getMonth(), 1)
  const startDate = new Date(firstDay)
  // Start from Monday
  const dow = firstDay.getDay()
  startDate.setDate(startDate.getDate() - (dow === 0 ? 6 : dow - 1))

  const days: Date[] = []
  const cur = new Date(startDate)
  for (let i = 0; i < 42; i++) { days.push(new Date(cur)); cur.setDate(cur.getDate() + 1) }

  const getEventsForDay = (d: Date) => events.filter((e) => {
    const ed = new Date(e.startTime)
    return ed.getDate() === d.getDate() && ed.getMonth() === d.getMonth() && ed.getFullYear() === d.getFullYear()
  })

  const dayNames = ["Lun", "Mar", "Mer", "Gio", "Ven", "Sab", "Dom"]

  return (
    <Card className="overflow-hidden">
      <div className="grid grid-cols-7 border-b">
        {dayNames.map((d) => (
          <div key={d} className="border-r p-2 text-center text-xs font-medium last:border-r-0 sm:text-sm">{d}</div>
        ))}
      </div>
      <div className="grid grid-cols-7">
        {days.map((day, i) => {
          const dayEvents = getEventsForDay(day)
          const isCurrentMonth = day.getMonth() === currentDate.getMonth()
          const isToday = day.toDateString() === new Date().toDateString()
          return (
            <div key={i}
              className={cn("min-h-20 border-b border-r p-1 transition-colors last:border-r-0 sm:min-h-24 sm:p-2 hover:bg-accent/50", !isCurrentMonth && "bg-muted/30")}
              onDragOver={(e) => e.preventDefault()} onDrop={() => onDrop(day)}>
              <div className={cn("mb-1 flex h-5 w-5 items-center justify-center rounded-full text-xs sm:h-6 sm:w-6 sm:text-sm", isToday && "bg-primary text-primary-foreground font-semibold")}>
                {day.getDate()}
              </div>
              <div className="space-y-1">
                {dayEvents.slice(0, 3).map((e) => (
                  <EventCard key={e.id} event={e} onEventClick={onEventClick} onDragStart={onDragStart} onDragEnd={onDragEnd} getColorClasses={getColorClasses} variant="compact" />
                ))}
                {dayEvents.length > 3 && <div className="text-[10px] text-muted-foreground sm:text-xs">+{dayEvents.length - 3} altri</div>}
              </div>
            </div>
          )
        })}
      </div>
    </Card>
  )
}

// ─── WeekView ─────────────────────────────────────────────────────────────────
function WeekView({ currentDate, events, onEventClick, onDragStart, onDragEnd, onDrop, getColorClasses }: {
  currentDate: Date; events: CalEvent[]
  onEventClick: (e: CalEvent) => void; onDragStart: (e: CalEvent) => void; onDragEnd: () => void
  onDrop: (d: Date, h: number) => void; getColorClasses: (c: string) => { bg: string; text: string }
}) {
  // Start from Monday
  const startOfWeek = new Date(currentDate)
  const dow = currentDate.getDay()
  startOfWeek.setDate(currentDate.getDate() - (dow === 0 ? 6 : dow - 1))

  const weekDays = Array.from({ length: 6 }, (_, i) => {
    const d = new Date(startOfWeek); d.setDate(startOfWeek.getDate() + i); return d
  })

  const hours = Array.from({ length: 14 }, (_, i) => i + 8) // 08:00–21:00

  const getEventsForDayAndHour = (d: Date, h: number) => events.filter((e) => {
    const ed = new Date(e.startTime)
    return ed.getDate() === d.getDate() && ed.getMonth() === d.getMonth() && ed.getFullYear() === d.getFullYear() && ed.getHours() === h
  })

  const dayNames = ["Lun", "Mar", "Mer", "Gio", "Ven", "Sab"]

  return (
    <Card className="overflow-auto">
      <div className="grid grid-cols-7 border-b">
        <div className="border-r p-2 text-center text-xs font-medium sm:text-sm text-muted-foreground">Ora</div>
        {weekDays.map((day, i) => {
          const isToday = day.toDateString() === new Date().toDateString()
          return (
            <div key={i} className={cn("border-r p-2 text-center text-xs font-medium last:border-r-0 sm:text-sm", isToday && "bg-primary/5 text-primary")}>
              <div>{dayNames[i]}</div>
              <div className={cn("text-base font-bold", isToday && "text-primary")}>{day.getDate()}</div>
            </div>
          )
        })}
      </div>
      <div className="grid grid-cols-7">
        {hours.map((hour) => (
          <React.Fragment key={`hour-row-${hour}`}>
            <div className="border-b border-r p-1 text-[10px] text-muted-foreground sm:p-2 sm:text-xs font-mono">
              {hour.toString().padStart(2, "0")}:00
            </div>
            {weekDays.map((day, di) => {
              const dayEvents = getEventsForDayAndHour(day, hour)
              const isToday = day.toDateString() === new Date().toDateString()
              return (
                <div key={`${di}-${hour}`}
                  className={cn("min-h-12 border-b border-r p-0.5 transition-colors hover:bg-accent/50 last:border-r-0 sm:min-h-16 sm:p-1", isToday && "bg-primary/[0.02]")}
                  onDragOver={(e) => e.preventDefault()} onDrop={() => onDrop(day, hour)}>
                  <div className="space-y-1">
                    {dayEvents.map((e) => (
                      <EventCard key={e.id} event={e} onEventClick={onEventClick} onDragStart={onDragStart} onDragEnd={onDragEnd} getColorClasses={getColorClasses} variant="default" />
                    ))}
                  </div>
                </div>
              )
            })}
          </React.Fragment>
        ))}
      </div>
    </Card>
  )
}

// ─── DayView ──────────────────────────────────────────────────────────────────
function DayView({ currentDate, events, onEventClick, onDragStart, onDragEnd, onDrop, getColorClasses }: {
  currentDate: Date; events: CalEvent[]
  onEventClick: (e: CalEvent) => void; onDragStart: (e: CalEvent) => void; onDragEnd: () => void
  onDrop: (d: Date, h: number) => void; getColorClasses: (c: string) => { bg: string; text: string }
}) {
  const hours = Array.from({ length: 14 }, (_, i) => i + 8)
  const getEventsForHour = (h: number) => events.filter((e) => {
    const ed = new Date(e.startTime)
    return ed.getDate() === currentDate.getDate() && ed.getMonth() === currentDate.getMonth() && ed.getFullYear() === currentDate.getFullYear() && ed.getHours() === h
  })

  return (
    <Card className="overflow-auto">
      <div className="space-y-0">
        {hours.map((hour) => {
          const hourEvents = getEventsForHour(hour)
          return (
            <div key={hour} className="flex border-b last:border-b-0" onDragOver={(e) => e.preventDefault()} onDrop={() => onDrop(currentDate, hour)}>
              <div className="w-14 flex-shrink-0 border-r p-2 text-xs text-muted-foreground font-mono sm:w-20 sm:p-3 sm:text-sm">
                {hour.toString().padStart(2, "0")}:00
              </div>
              <div className="min-h-16 flex-1 p-1 transition-colors hover:bg-accent/50 sm:min-h-20 sm:p-2">
                <div className="space-y-2">
                  {hourEvents.map((e) => (
                    <EventCard key={e.id} event={e} onEventClick={onEventClick} onDragStart={onDragStart} onDragEnd={onDragEnd} getColorClasses={getColorClasses} variant="detailed" />
                  ))}
                </div>
              </div>
            </div>
          )
        })}
      </div>
    </Card>
  )
}

// ─── ListView ─────────────────────────────────────────────────────────────────
function ListView({ events, onEventClick, getColorClasses }: {
  events: CalEvent[]; onEventClick: (e: CalEvent) => void; getColorClasses: (c: string) => { bg: string; text: string }
}) {
  const sorted = [...events].sort((a, b) => a.startTime.getTime() - b.startTime.getTime())
  const grouped = sorted.reduce((acc, e) => {
    const key = e.startTime.toLocaleDateString("it-IT", { weekday: "long", year: "numeric", month: "long", day: "numeric" })
    if (!acc[key]) acc[key] = []
    acc[key].push(e)
    return acc
  }, {} as Record<string, CalEvent[]>)

  return (
    <Card className="p-3 sm:p-4">
      <div className="space-y-6">
        {Object.entries(grouped).map(([date, dateEvents]) => (
          <div key={date} className="space-y-3">
            <h3 className="text-xs font-semibold text-muted-foreground sm:text-sm capitalize">{date}</h3>
            <div className="space-y-2">
              {dateEvents.map((e) => {
                const cc = getColorClasses(e.color)
                return (
                  <div key={e.id} onClick={() => onEventClick(e)}
                    className="group cursor-pointer rounded-lg border bg-card p-3 transition-all hover:shadow-md hover:scale-[1.01] animate-in fade-in sm:p-4">
                    <div className="flex items-start gap-3">
                      <div className={cn("mt-1 h-3 w-3 rounded-full flex-shrink-0", cc.bg)} />
                      <div className="flex-1 min-w-0">
                        <div className="flex flex-col gap-2 sm:flex-row sm:items-start sm:justify-between">
                          <div className="min-w-0">
                            <h4 className="font-semibold text-sm group-hover:text-primary transition-colors sm:text-base truncate">{e.title}</h4>
                            {e.description && <p className="mt-1 text-xs text-muted-foreground sm:text-sm line-clamp-2">{e.description}</p>}
                          </div>
                          <div className="flex flex-wrap gap-1">
                            {e.category && <Badge variant="secondary" className="text-xs">{e.category}</Badge>}
                          </div>
                        </div>
                        <div className="mt-2 flex flex-wrap items-center gap-2 text-[10px] text-muted-foreground sm:gap-4 sm:text-xs">
                          <div className="flex items-center gap-1">
                            <Clock className="h-3 w-3" />
                            {e.startTime.toLocaleTimeString("it-IT", { hour: "2-digit", minute: "2-digit" })} – {e.endTime.toLocaleTimeString("it-IT", { hour: "2-digit", minute: "2-digit" })}
                          </div>
                          {e.tags && e.tags.length > 0 && (
                            <div className="flex flex-wrap gap-1">
                              {e.tags.map((t) => <Badge key={t} variant="outline" className="text-[10px] h-4 sm:text-xs sm:h-5">{t}</Badge>)}
                            </div>
                          )}
                        </div>
                      </div>
                    </div>
                  </div>
                )
              })}
            </div>
          </div>
        ))}
        {sorted.length === 0 && <div className="py-12 text-center text-sm text-muted-foreground">Nessun evento trovato</div>}
      </div>
    </Card>
  )
}
