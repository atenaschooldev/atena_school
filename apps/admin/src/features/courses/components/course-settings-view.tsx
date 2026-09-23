"use client";

import React, { useState, useMemo } from "react";
import type { ColumnDef, SortingState } from "@tanstack/react-table";
import {
  flexRender,
  getCoreRowModel,
  getPaginationRowModel,
  getSortedRowModel,
  getFilteredRowModel,
  useReactTable,
} from "@tanstack/react-table";
import {
  CourseDeliveryMode,
  COURSE_DELIVERY_MODE_DICTIONARY,
  DAY_OF_WEEK_DICTIONARY,
  DayOfWeek,
} from "@atena/api-types";
import { useCourseSettings } from "../hooks/use-course-settings";
import type { CourseSettingsRecord, CreateCourseSettingsDto } from "../types";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog";
import { DeleteConfirmDialog } from "@/components/delete-confirm-dialog";
import { AtenaDataTable, DataTableToolbar, DataTableColumnHeader, CellAvatar } from "@/components/shared/data-table";
import { Checkbox } from "@/components/ui/checkbox";
import { useTranslation } from "@/i18n/context";
import {
  Settings,
  Layers,
  Sparkles,
  Plus,
  Pencil,
  Trash2,
  RefreshCw,
  ArrowDown,
  ArrowUp,
  ArrowUpDown,
  Clock,
  Calendar,
  Users,
  Award,
  BookOpen,
  Check,
} from "lucide-react";

const WEEKDAYS = [
  { id: DayOfWeek.MONDAY, labelIt: "Lun", labelEn: "Mon", fullIt: DAY_OF_WEEK_DICTIONARY[DayOfWeek.MONDAY].label_it, fullEn: DAY_OF_WEEK_DICTIONARY[DayOfWeek.MONDAY].label_en },
  { id: DayOfWeek.TUESDAY, labelIt: "Mar", labelEn: "Tue", fullIt: DAY_OF_WEEK_DICTIONARY[DayOfWeek.TUESDAY].label_it, fullEn: DAY_OF_WEEK_DICTIONARY[DayOfWeek.TUESDAY].label_en },
  { id: DayOfWeek.WEDNESDAY, labelIt: "Mer", labelEn: "Wed", fullIt: DAY_OF_WEEK_DICTIONARY[DayOfWeek.WEDNESDAY].label_it, fullEn: DAY_OF_WEEK_DICTIONARY[DayOfWeek.WEDNESDAY].label_en },
  { id: DayOfWeek.THURSDAY, labelIt: "Gio", labelEn: "Thu", fullIt: DAY_OF_WEEK_DICTIONARY[DayOfWeek.THURSDAY].label_it, fullEn: DAY_OF_WEEK_DICTIONARY[DayOfWeek.THURSDAY].label_en },
  { id: DayOfWeek.FRIDAY, labelIt: "Ven", labelEn: "Fri", fullIt: DAY_OF_WEEK_DICTIONARY[DayOfWeek.FRIDAY].label_it, fullEn: DAY_OF_WEEK_DICTIONARY[DayOfWeek.FRIDAY].label_en },
  { id: DayOfWeek.SATURDAY, labelIt: "Sab", labelEn: "Sat", fullIt: DAY_OF_WEEK_DICTIONARY[DayOfWeek.SATURDAY].label_it, fullEn: DAY_OF_WEEK_DICTIONARY[DayOfWeek.SATURDAY].label_en },
  { id: DayOfWeek.SUNDAY, labelIt: "Dom", labelEn: "Sun", fullIt: DAY_OF_WEEK_DICTIONARY[DayOfWeek.SUNDAY].label_it, fullEn: DAY_OF_WEEK_DICTIONARY[DayOfWeek.SUNDAY].label_en },
];

export function CourseSettingsView() {
  const { t, locale } = useTranslation();
  const {
    settings,
    loading,
    refresh,
    createSettings,
    updateSettings,
    deleteSettings,
    isCreating,
    isUpdating,
    isDeleting,
  } = useCourseSettings();

  const [searchQuery, setSearchQuery] = useState("");
  const [modeFilter, setModeFilter] = useState("all");
  const [sorting, setSorting] = useState<SortingState>([
    { id: "name", desc: false },
  ]);

  // Dialog states
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [editingSettings, setEditingSettings] = useState<CourseSettingsRecord | null>(null);
  const [deletingSettings, setDeletingSettings] = useState<CourseSettingsRecord | null>(null);

  // Form states
  const [formName, setFormName] = useState("");
  const [formDeliveryMode, setFormDeliveryMode] = useState<number>(1);
  const [formScheduleDays, setFormScheduleDays] = useState<number[]>([]);
  const [formStartTime, setFormStartTime] = useState("");
  const [formEndTime, setFormEndTime] = useState("");
  const [formDuration, setFormDuration] = useState<number | string>(60);
  const [formLessonsPerWeek, setFormLessonsPerWeek] = useState<number | string>(2);
  const [formTotalLessons, setFormTotalLessons] = useState<number | string>(32);
  const [formTotalHours, setFormTotalHours] = useState<number | string>(48);
  const [formMinStudents, setFormMinStudents] = useState<number | string>(3);
  const [formMaxStudents, setFormMaxStudents] = useState<number | string>(8);

  const getDeliveryModeBadge = (mode: number) => {
    switch (Number(mode)) {
      case 1:
        return (
          <Badge variant="outline" className="border-blue-500/30 text-blue-600 dark:text-blue-400 bg-blue-500/5 font-semibold text-xs gap-1">
            <Calendar className="h-3 w-3" />
            {t("courses.deliveryModeFixed") || "Orario Fisso di Gruppo"}
          </Badge>
        );
      case 2:
        return (
          <Badge variant="outline" className="border-purple-500/30 text-purple-600 dark:text-purple-400 bg-purple-500/5 font-semibold text-xs gap-1">
            <Clock className="h-3 w-3" />
            {t("courses.deliveryModeFlexible") || "Flessibile / Individuale"}
          </Badge>
        );
      case 4:
        return (
          <Badge variant="outline" className="border-amber-500/30 text-amber-600 dark:text-amber-400 bg-amber-500/5 font-semibold text-xs gap-1">
            <Award className="h-3 w-3" />
            {t("courses.deliveryModeCertification") || "Certificazione / Esame"}
          </Badge>
        );
      default:
        return (
          <Badge variant="secondary" className="text-xs">
            Standard ({mode})
          </Badge>
        );
    }
  };

  const metricsData = useMemo(() => {
    const total = settings.length;
    const fixedCount = settings.filter((s) => Number(s.deliveryMode ?? s.delivery_mode) === 1).length;
    const flexibleCount = settings.filter((s) => Number(s.deliveryMode ?? s.delivery_mode) === 2).length;
    const certCount = settings.filter((s) => Number(s.deliveryMode ?? s.delivery_mode) === 4).length;

    return [
      {
        title: t("courses.metricTotalSettings") || "Preset Totali",
        value: total,
        description: t("courses.metricsTotalSettingsDesc") || "Configurazioni orarie riutilizzabili",
        icon: Settings,
      },
      {
        title: t("courses.deliveryModeFixed") || "Orario Fisso",
        value: fixedCount,
        description: t("courses.metricsFixedDesc") || "Corsi con giorni e fasce prestabilite",
        icon: Calendar,
      },
      {
        title: t("courses.deliveryModeFlexible") || "Flessibili / Privati",
        value: flexibleCount,
        description: t("courses.metricsFlexibleDesc") || "Pacchetti con orari concordati",
        icon: Clock,
      },
      {
        title: t("courses.deliveryModeCertification") || "Certificazioni",
        value: certCount,
        description: t("courses.metricsCertDesc") || "Esami e percorsi di qualifica",
        icon: Award,
      },
    ];
  }, [settings, t]);

  const filteredSettings = useMemo(() => {
    return settings.filter((item) => {
      const mode = String(item.deliveryMode ?? item.delivery_mode ?? 1);
      if (modeFilter !== "all" && mode !== modeFilter) return false;

      if (searchQuery.trim() !== "") {
        const q = searchQuery.toLowerCase().trim();
        const matchName = (item.name || "").toLowerCase().includes(q);
        const matchTime = `${item.startTime || ""} ${item.endTime || ""}`.toLowerCase().includes(q);
        if (!matchName && !matchTime) return false;
      }

      return true;
    });
  }, [settings, modeFilter, searchQuery]);

  const normalizeDays = (raw: any): number[] => {
    if (!raw || !Array.isArray(raw)) return [];
    return raw.map((d) => {
      if (typeof d === "number") return d;
      const str = String(d).toLowerCase().trim();
      if (str.startsWith("lun") || str.startsWith("mon")) return 1;
      if (str.startsWith("mar") || str.startsWith("tue")) return 2;
      if (str.startsWith("mer") || str.startsWith("wed")) return 3;
      if (str.startsWith("gio") || str.startsWith("thu")) return 4;
      if (str.startsWith("ven") || str.startsWith("fri")) return 5;
      if (str.startsWith("sab") || str.startsWith("sat")) return 6;
      if (str.startsWith("dom") || str.startsWith("sun")) return 7;
      return parseInt(str, 10) || 0;
    }).filter((d) => d >= 1 && d <= 7);
  };

  const handleOpenCreate = () => {
    setEditingSettings(null);
    setFormName("");
    setFormDeliveryMode(1);
    setFormScheduleDays([1, 3]);
    setFormStartTime("18:00");
    setFormEndTime("19:30");
    setFormDuration(90);
    setFormLessonsPerWeek(2);
    setFormTotalLessons(32);
    setFormTotalHours(48);
    setFormMinStudents(3);
    setFormMaxStudents(8);
    setIsDialogOpen(true);
  };

  const handleOpenEdit = (item: CourseSettingsRecord) => {
    setEditingSettings(item);
    setFormName(item.name);
    setFormDeliveryMode(Number(item.deliveryMode ?? item.delivery_mode ?? 1));
    setFormScheduleDays(normalizeDays(item.scheduleDays ?? item.schedule_days));
    setFormStartTime(item.startTime ?? item.start_time ?? "");
    setFormEndTime(item.endTime ?? item.end_time ?? "");
    setFormDuration(item.lessonDurationMinutes ?? item.lesson_duration_minutes ?? 60);
    setFormLessonsPerWeek(item.lessonsPerWeek ?? item.lessons_per_week ?? 1);
    setFormTotalLessons(item.totalLessons ?? item.total_lessons ?? "");
    setFormTotalHours(item.totalHours ?? item.total_hours ?? "");
    setFormMinStudents(item.minStudents ?? item.min_students ?? 1);
    setFormMaxStudents(item.maxStudents ?? item.max_students ?? 8);
    setIsDialogOpen(true);
  };

  const handleToggleDay = (dayId: number) => {
    setFormScheduleDays((prev) =>
      prev.includes(dayId) ? prev.filter((d) => d !== dayId) : [...prev, dayId].sort()
    );
  };

  const handleSaveSettings = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!formName.trim()) return;

    const payload: CreateCourseSettingsDto = {
      name: formName.trim(),
      deliveryMode: Number(formDeliveryMode),
      scheduleDays: formDeliveryMode === 1 ? formScheduleDays : [],
      startTime: formDeliveryMode === 1 ? formStartTime || undefined : undefined,
      endTime: formDeliveryMode === 1 ? formEndTime || undefined : undefined,
      lessonDurationMinutes: formDuration !== "" ? Number(formDuration) : undefined,
      lessonsPerWeek: formLessonsPerWeek !== "" ? Number(formLessonsPerWeek) : undefined,
      totalLessons: formTotalLessons !== "" ? Number(formTotalLessons) : undefined,
      totalHours: formTotalHours !== "" ? Number(formTotalHours) : undefined,
      minStudents: formMinStudents !== "" ? Number(formMinStudents) : undefined,
      maxStudents: formMaxStudents !== "" ? Number(formMaxStudents) : undefined,
    };

    if (editingSettings) {
      await updateSettings(editingSettings.id, payload);
    } else {
      await createSettings(payload);
    }
    setIsDialogOpen(false);
  };

  const columns: ColumnDef<CourseSettingsRecord>[] = useMemo(
    () => [
      {
        id: "select",
        header: ({ table }) => (
          <div className="flex items-center justify-center px-2">
            <Checkbox
              checked={
                table.getIsAllPageRowsSelected() ||
                (table.getIsSomePageRowsSelected() && "indeterminate")
              }
              onCheckedChange={(value) => table.toggleAllPageRowsSelected(!!value)}
              aria-label={t("common.selectAll") || "Seleziona tutti"}
            />
          </div>
        ),
        cell: ({ row }) => (
          <div className="flex items-center justify-center px-2">
            <Checkbox
              checked={row.getIsSelected()}
              onCheckedChange={(value) => row.toggleSelected(!!value)}
              aria-label={t("common.selectRow") || "Seleziona riga"}
            />
          </div>
        ),
        enableSorting: false,
        size: 40,
      },
      {
        accessorKey: "name",
        header: ({ column }) => (
          <DataTableColumnHeader
            column={column}
            title={t("courses.columnPresetName") || "Nome Configurazione"}
          />
        ),
        cell: ({ row }) => {
          const mode = Number(row.original.deliveryMode ?? row.original.delivery_mode ?? 1);
          return (
            <CellAvatar
              title={row.original.name}
              subtitle={getDeliveryModeBadge(mode)}
              icon={Settings}
            />
          );
        },
      },
      {
        id: "scheduleDays",
        header: t("courses.columnScheduleDays") || "Giorni di Lezione",
        cell: ({ row }) => {
          const days = normalizeDays(row.original.scheduleDays ?? row.original.schedule_days);
          if (days.length === 0) {
            return <span className="text-xs text-muted-foreground italic">{t("courses.flexibleDays") || "Flessibile / Su accordo"}</span>;
          }
          return (
            <div className="flex items-center gap-1 flex-wrap">
              {days.map((d) => {
                const w = WEEKDAYS.find((item) => item.id === d);
                return (
                  <Badge key={d} variant="secondary" className="text-[11px] font-bold px-1.5 py-0.5">
                    {locale === "en" ? w?.labelEn : w?.labelIt}
                  </Badge>
                );
              })}
            </div>
          );
        },
      },
      {
        id: "time",
        header: t("courses.columnTimeDuration") || "Orario & Durata",
        cell: ({ row }) => {
          const start = row.original.startTime ?? row.original.start_time;
          const end = row.original.endTime ?? row.original.end_time;
          const duration = row.original.lessonDurationMinutes ?? row.original.lesson_duration_minutes;
          return (
            <div className="flex flex-col gap-0.5 text-xs">
              <span className="font-semibold text-foreground">
                {start && end ? `${start} – ${end}` : start ? `Dalle ${start}` : "—"}
              </span>
              {duration && (
                <span className="text-muted-foreground font-mono">
                  {duration} min / {t("courses.lessonSingle") || "lezione"}
                </span>
              )}
            </div>
          );
        },
      },
      {
        id: "volume",
        header: t("courses.columnVolume") || "Frequenza & Volume",
        cell: ({ row }) => {
          const perWeek = row.original.lessonsPerWeek ?? row.original.lessons_per_week;
          const totalL = row.original.totalLessons ?? row.original.total_lessons;
          const totalH = row.original.totalHours ?? row.original.total_hours;
          return (
            <div className="flex flex-col gap-0.5 text-xs text-muted-foreground">
              {perWeek && <span className="font-medium text-foreground">{perWeek}x / {t("courses.weekSingle") || "settimana"}</span>}
              <span>
                {totalL ? `${totalL} ${t("courses.lessonPlural") || "lezioni"}` : ""}
                {totalH ? ` (${totalH} ore)` : ""}
              </span>
            </div>
          );
        },
      },
      {
        id: "capacity",
        header: t("courses.columnCapacity") || "Capacità Gruppo",
        cell: ({ row }) => {
          const min = row.original.minStudents ?? row.original.min_students;
          const max = row.original.maxStudents ?? row.original.max_students;
          const isUnlimited = max === null || max === undefined || max === "" || Number(max) <= 0;
          return (
            <div className="flex items-center gap-1.5 text-xs font-medium text-muted-foreground">
              <Users className="h-3.5 w-3.5 text-muted-foreground shrink-0" />
              <span>
                Min {min || 1} – {isUnlimited ? (t("courses.unlimitedStudents") || "Illimitato (∞)") : `Max ${max}`}
              </span>
            </div>
          );
        },
      },
      {
        id: "coursesCount",
        header: t("courses.columnCoursesCount") || "Corsi Collegati",
        cell: ({ row }) => {
          const count = row.original.coursesCount ?? row.original.courses_count ?? 0;
          return (
            <Badge variant="outline" className="text-xs font-semibold">
              {count} {count === 1 ? (t("courses.courseSingle") || "corso") : (t("courses.coursePlural") || "corsi")}
            </Badge>
          );
        },
      },
      {
        id: "actions",
        header: t("common.actions") || "Azioni",
        enableHiding: false,
        cell: ({ row }) => {
          const item = row.original;
          return (
            <div className="flex items-center gap-1">
              <Button
                variant="ghost"
                size="icon"
                className="h-8 w-8 cursor-pointer text-muted-foreground hover:text-foreground"
                onClick={() => handleOpenEdit(item)}
                title={t("common.edit") || "Modifica"}
              >
                <Pencil className="h-4 w-4" />
              </Button>
              <Button
                variant="ghost"
                size="icon"
                className="h-8 w-8 cursor-pointer text-muted-foreground hover:text-destructive transition-colors"
                onClick={() => setDeletingSettings(item)}
                disabled={isDeleting}
                title={t("common.delete") || "Elimina"}
              >
                <Trash2 className="h-4 w-4" />
              </Button>
            </div>
          );
        },
      },
    ],
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [isUpdating, isDeleting, t, locale]
  );

  const table = useReactTable({
    data: filteredSettings,
    columns,
    state: { sorting },
    onSortingChange: setSorting,
    getCoreRowModel: getCoreRowModel(),
    getPaginationRowModel: getPaginationRowModel(),
    getSortedRowModel: getSortedRowModel(),
    getFilteredRowModel: getFilteredRowModel(),
  });

  return (
    <div className="flex flex-col gap-4">
      {/* ── Top Metrics ── */}
      <div className="@container/main px-4 lg:px-6">
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
          {metricsData.map((metric, index) => (
            <Card key={index} className="border">
              <CardContent className="space-y-4 pt-6">
                <div className="flex items-center justify-between">
                  <metric.icon className="text-muted-foreground size-6" />
                </div>
                <div className="space-y-1">
                  <p className="text-muted-foreground text-sm font-medium">{metric.title}</p>
                  <div className="text-2xl font-bold">{metric.value}</div>
                  <div className="text-muted-foreground text-xs">{metric.description}</div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      </div>

      {/* ── Main Toolbar & Content Container ── */}
      <div className="@container/main px-4 lg:px-6 space-y-4">
        <DataTableToolbar
          searchQuery={searchQuery}
          onSearchChange={setSearchQuery}
          searchPlaceholder={t("courses.searchSettingsPlaceholder") || "Cerca per nome o orario..."}
          onResetFilters={() => {
            setSearchQuery("");
            setModeFilter("all");
          }}
          filters={[
            {
              value: modeFilter,
              onChange: setModeFilter,
              placeholder: t("courses.deliveryModeLabel") || "Modalità",
              options: [
                { value: "all", label: t("courses.allModes") || "Tutte le modalità" },
                { value: "1", label: t("courses.deliveryModeFixed") || "Orario Fisso di Gruppo" },
                { value: "2", label: t("courses.deliveryModeFlexible") || "Flessibile / Individuale" },
                { value: "4", label: t("courses.deliveryModeCertification") || "Certificazione / Esame" },
              ],
            },
          ]}
          table={table}
          actionElement={
            <div className="flex items-center gap-2">
              <Button
                variant="default"
                size="sm"
                className="h-8 px-3 cursor-pointer text-xs font-bold gap-1.5 shadow-xs"
                onClick={handleOpenCreate}
              >
                <Plus className="h-3.5 w-3.5" />
                {t("courses.newPresetBtn") || "Nuovo Preset"}
              </Button>
              <Button
                variant="outline"
                size="sm"
                className="h-8 px-2.5 cursor-pointer text-xs font-medium"
                onClick={() => refresh()}
                disabled={loading}
              >
                <RefreshCw className={`mr-1.5 h-3.5 w-3.5 ${loading ? "animate-spin" : ""}`} />
                {t("common.refresh") || "Aggiorna"}
              </Button>
            </div>
          }
        />

        <AtenaDataTable
          table={table}
          loading={loading}
          columnsCount={columns.length}
          emptyTitle={t("courses.noSettingsFound") || "Nessun preset di configurazione trovato."}
          onResetFilters={() => {
            setSearchQuery("");
            setModeFilter("all");
          }}
        />
      </div>

      {/* Add / Edit Settings Dialog */}
      <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
        <DialogContent className="sm:max-w-[620px] max-h-[90vh] overflow-y-auto">
          <form onSubmit={handleSaveSettings}>
            <DialogHeader>
              <DialogTitle className="text-base font-bold">
                {editingSettings
                  ? t("courses.editPresetTitle") || "Modifica Preset Configurazione"
                  : t("courses.createPresetTitle") || "Nuovo Preset Configurazione"}
              </DialogTitle>
            </DialogHeader>

            <div className="space-y-4 py-4">
              <div className="space-y-1.5">
                <Label htmlFor="preset-name" className="text-xs font-semibold">
                  {t("courses.presetNameLabel") || "Nome Configurazione Preset"} *
                </Label>
                <Input
                  id="preset-name"
                  value={formName}
                  onChange={(e) => setFormName(e.target.value)}
                  placeholder="es. Corso di Gruppo Serale (Lun-Mer), Pacchetto Individuale..."
                  required
                />
              </div>

              <div className="space-y-1.5">
                <Label htmlFor="preset-mode" className="text-xs font-semibold">
                  {t("courses.deliveryModeLabel") || "Modalità di Erogazione"} *
                </Label>
                <Select
                  value={String(formDeliveryMode)}
                  onValueChange={(val) => setFormDeliveryMode(Number(val))}
                >
                  <SelectTrigger id="preset-mode">
                    <SelectValue placeholder="Seleziona modalità..." />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="1">{t("courses.deliveryModeFixed") || "1 — Orario Fisso di Gruppo"}</SelectItem>
                    <SelectItem value="2">{t("courses.deliveryModeFlexible") || "2 — Flessibile / Individuale"}</SelectItem>
                    <SelectItem value="4">{t("courses.deliveryModeCertification") || "4 — Certificazione / Esame"}</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              {/* Schedule days selector */}
              {formDeliveryMode === 1 && (
                <div className="space-y-2">
                  <Label className="text-xs font-semibold">
                    {t("courses.scheduleDaysLabel") || "Giorni Settimanali di Lezione"}
                  </Label>
                  <div className="flex flex-wrap gap-1.5">
                    {WEEKDAYS.map((w) => {
                      const selected = formScheduleDays.includes(w.id);
                      return (
                        <button
                          key={w.id}
                          type="button"
                          onClick={() => handleToggleDay(w.id)}
                          className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-bold transition-all cursor-pointer border ${
                            selected
                              ? "bg-primary text-primary-foreground border-primary shadow-2xs"
                              : "bg-muted/40 text-muted-foreground border-border/60 hover:text-foreground"
                          }`}
                        >
                          {selected && <Check className="h-3 w-3" />}
                          {locale === "en" ? w.fullEn : w.fullIt}
                        </button>
                      );
                    })}
                  </div>
                </div>
              )}

              {/* Time inputs */}
              {formDeliveryMode === 1 && (
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-1.5">
                    <Label htmlFor="preset-start-time" className="text-xs font-semibold">
                      {t("courses.startTimeLabel") || "Orario Inizio (HH:MM)"}
                    </Label>
                    <Input
                      id="preset-start-time"
                      type="time"
                      value={formStartTime}
                      onChange={(e) => setFormStartTime(e.target.value)}
                    />
                  </div>

                  <div className="space-y-1.5">
                    <Label htmlFor="preset-end-time" className="text-xs font-semibold">
                      {t("courses.endTimeLabel") || "Orario Fine (HH:MM)"}
                    </Label>
                    <Input
                      id="preset-end-time"
                      type="time"
                      value={formEndTime}
                      onChange={(e) => setFormEndTime(e.target.value)}
                    />
                  </div>
                </div>
              )}

              <div className="grid grid-cols-3 gap-4">
                <div className="space-y-1.5">
                  <Label htmlFor="preset-duration" className="text-xs font-semibold">
                    {t("courses.lessonDurationLabel") || "Durata Lezione (min)"}
                  </Label>
                  <Input
                    id="preset-duration"
                    type="number"
                    value={formDuration}
                    onChange={(e) => setFormDuration(e.target.value)}
                    min={15}
                    step={15}
                    placeholder="60"
                  />
                </div>

                <div className="space-y-1.5">
                  <Label htmlFor="preset-lessons-week" className="text-xs font-semibold">
                    {t("courses.lessonsPerWeekLabel") || "Lezioni / Settimana"}
                  </Label>
                  <Input
                    id="preset-lessons-week"
                    type="number"
                    value={formLessonsPerWeek}
                    onChange={(e) => setFormLessonsPerWeek(e.target.value)}
                    min={1}
                    placeholder="2"
                  />
                </div>

                <div className="space-y-1.5">
                  <Label htmlFor="preset-total-lessons" className="text-xs font-semibold">
                    {t("courses.totalLessonsLabel") || "Totale Lezioni"}
                  </Label>
                  <Input
                    id="preset-total-lessons"
                    type="number"
                    value={formTotalLessons}
                    onChange={(e) => setFormTotalLessons(e.target.value)}
                    min={1}
                    placeholder="32"
                  />
                </div>
              </div>

              <div className="grid grid-cols-3 gap-4">
                <div className="space-y-1.5">
                  <Label htmlFor="preset-total-hours" className="text-xs font-semibold">
                    {t("courses.totalHoursLabel") || "Totale Ore"}
                  </Label>
                  <Input
                    id="preset-total-hours"
                    type="number"
                    value={formTotalHours}
                    onChange={(e) => setFormTotalHours(e.target.value)}
                    min={1}
                    step={0.5}
                    placeholder="48"
                  />
                </div>

                <div className="space-y-1.5">
                  <Label htmlFor="preset-min-students" className="text-xs font-semibold">
                    {t("courses.minStudentsLabel") || "Min Studenti"}
                  </Label>
                  <Input
                    id="preset-min-students"
                    type="number"
                    value={formMinStudents}
                    onChange={(e) => setFormMinStudents(e.target.value)}
                    min={1}
                    placeholder="1"
                  />
                </div>

                <div className="space-y-1.5">
                  <div className="flex items-center justify-between">
                    <Label htmlFor="preset-max-students" className="text-xs font-semibold">
                      {t("courses.maxStudentsLabel") || "Max Studenti"}
                    </Label>
                    <span className="text-[10px] text-muted-foreground">
                      {t("courses.unlimitedHint") || "(vuoto = Illimitato)"}
                    </span>
                  </div>
                  <Input
                    id="preset-max-students"
                    type="number"
                    value={formMaxStudents}
                    onChange={(e) => setFormMaxStudents(e.target.value)}
                    min={1}
                    placeholder={t("courses.unlimitedPlaceholder") || "Illimitato (∞)"}
                  />
                </div>
              </div>
            </div>

            <DialogFooter className="gap-2">
              <Button
                type="button"
                variant="outline"
                onClick={() => setIsDialogOpen(false)}
                className="cursor-pointer text-xs"
              >
                {t("common.cancel") || "Annulla"}
              </Button>
              <Button
                type="submit"
                disabled={isCreating || isUpdating}
                className="cursor-pointer text-xs font-semibold"
              >
                {isCreating || isUpdating
                  ? t("common.saving") || "Salvataggio..."
                  : t("common.save") || "Salva"}
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>

      {/* Delete Confirmation Dialog */}
      <DeleteConfirmDialog
        open={!!deletingSettings}
        onOpenChange={(open) => !open && setDeletingSettings(null)}
        title={t("courses.deletePresetConfirmTitle") || "Elimina Preset"}
        description={
          (
            t("courses.deletePresetConfirmDesc") ||
            "Sei sicuro di voler eliminare la configurazione '{name}'? I corsi associati manterranno i propri parametri ma perderanno il collegamento al preset."
          ).replace("{name}", deletingSettings?.name || "")
        }
        onConfirm={async () => {
          if (deletingSettings) {
            await deleteSettings(deletingSettings.id);
            setDeletingSettings(null);
          }
        }}
        loading={isDeleting}
      />
    </div>
  );
}
