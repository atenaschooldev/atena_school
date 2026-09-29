"use client";

import React, { useState, useMemo } from "react";
import type { ColumnDef, SortingState } from "@tanstack/react-table";
import {
  getCoreRowModel,
  getPaginationRowModel,
  getSortedRowModel,
  getFilteredRowModel,
  useReactTable,
} from "@tanstack/react-table";
import { useCourseSettings } from "../hooks/use-course-settings";
import type { CourseSettingsRecord, CreateCourseSettingsDto } from "../types";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog";
import { DeleteConfirmDialog } from "@/components/delete-confirm-dialog";
import { AtenaDataTable, DataTableToolbar, DataTableColumnHeader, CellAvatar, CellCopyableId } from "@/components/shared/data-table";
import { Checkbox } from "@/components/ui/checkbox";
import { useTranslation } from "@/i18n/context";
import {
  Settings,
  Plus,
  Pencil,
  Trash2,
  RefreshCw,
  Clock,
  Users,
  Award,
  BookOpen,
} from "lucide-react";

export function CourseSettingsView() {
  const { t } = useTranslation();
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
  const [formDuration, setFormDuration] = useState<number | string>(75);
  const [formLessonsPerWeek, setFormLessonsPerWeek] = useState<number | string>(2);
  const [formTotalLessons, setFormTotalLessons] = useState<number | string>("");
  const [formTotalHours, setFormTotalHours] = useState<number | string>("");

  const getDeliveryModeBadge = (mode: number) => {
    switch (Number(mode)) {
      case 1:
        return (
          <Badge variant="outline" className="border-blue-500/30 text-blue-600 dark:text-blue-400 bg-blue-500/5 font-semibold text-xs gap-1">
            <Users className="h-3 w-3" />
            {t("courses.deliveryModeFixed") || "Corso di Gruppo"}
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
            {t("courses.deliveryModeCertification") || "Certificazione / Monte Ore"}
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
        title: t("courses.metricTotalSettings") || "Formati Totali",
        value: total,
        description: t("courses.metricsTotalSettingsDesc") || "Template metodologici riutilizzabili",
        icon: Settings,
      },
      {
        title: t("courses.deliveryModeFixed") || "Corsi di Gruppo",
        value: fixedCount,
        description: t("courses.metricsFixedDesc") || "Formati didattici per classi di gruppo",
        icon: Users,
      },
      {
        title: t("courses.deliveryModeFlexible") || "Flessibili / Privati",
        value: flexibleCount,
        description: t("courses.metricsFlexibleDesc") || "Pacchetti e lezioni individuali",
        icon: Clock,
      },
      {
        title: t("courses.deliveryModeCertification") || "Certificazioni",
        value: certCount,
        description: t("courses.metricsCertDesc") || "Monte ore per certificazioni ed esami",
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
        if (!matchName) return false;
      }

      return true;
    });
  }, [settings, modeFilter, searchQuery]);

  const handleOpenCreate = () => {
    setEditingSettings(null);
    setFormName("");
    setFormDeliveryMode(1);
    setFormDuration(75);
    setFormLessonsPerWeek(2);
    setFormTotalLessons("");
    setFormTotalHours("");
    setIsDialogOpen(true);
  };

  const handleOpenEdit = (item: CourseSettingsRecord) => {
    setEditingSettings(item);
    setFormName(item.name);
    setFormDeliveryMode(Number(item.deliveryMode ?? item.delivery_mode ?? 1));
    setFormDuration(item.lessonDurationMinutes ?? item.lesson_duration_minutes ?? 60);
    setFormLessonsPerWeek(item.lessonsPerWeek ?? item.lessons_per_week ?? "");
    setFormTotalLessons(item.totalLessons ?? item.total_lessons ?? "");
    setFormTotalHours(item.totalHours ?? item.total_hours ?? "");
    setIsDialogOpen(true);
  };

  const handleSaveSettings = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!formName.trim()) return;

    const payload: CreateCourseSettingsDto = {
      name: formName.trim(),
      deliveryMode: Number(formDeliveryMode),
      lessonDurationMinutes: formDuration !== "" ? Number(formDuration) : undefined,
      lessonsPerWeek: formLessonsPerWeek !== "" ? Number(formLessonsPerWeek) : undefined,
      totalLessons: formTotalLessons !== "" ? Number(formTotalLessons) : undefined,
      totalHours: formTotalHours !== "" ? Number(formTotalHours) : undefined,
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
        accessorKey: "id",
        header: ({ column }) => (
          <DataTableColumnHeader column={column} title="ID" />
        ),
        cell: ({ row }) => <CellCopyableId id={row.original.id} />,
        size: 110,
      },
      {
        accessorKey: "name",
        header: ({ column }) => (
          <DataTableColumnHeader
            column={column}
            title={t("courses.columnPresetName") || "Nome Configurazione / Formato"}
          />
        ),
        cell: ({ row }) => {
          const mode = Number(row.original.deliveryMode ?? row.original.delivery_mode ?? 1);
          return (
            <CellAvatar
              title={row.original.name}
              subtitle={getDeliveryModeBadge(mode)}
              icon={BookOpen}
            />
          );
        },
      },
      {
        id: "duration",
        header: t("courses.lessonDurationLabel") || "Durata Singola Lezione",
        cell: ({ row }) => {
          const duration = row.original.lessonDurationMinutes ?? row.original.lesson_duration_minutes;
          if (!duration) {
            return <span className="text-xs text-muted-foreground">—</span>;
          }
          return (
            <div className="flex items-center gap-1.5 text-xs font-semibold text-foreground">
              <Clock className="h-3.5 w-3.5 text-muted-foreground shrink-0" />
              <span>{duration} min</span>
            </div>
          );
        },
      },
      {
        id: "volume",
        header: t("courses.columnVolume") || "Frequenza & Volume Didattico",
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
                {!perWeek && !totalL && !totalH && "—"}
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
    [isUpdating, isDeleting, t]
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
          searchPlaceholder={t("courses.searchSettingsPlaceholder") || "Cerca per formato..."}
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
                {t("courses.newPresetBtn") || "Nuovo Formato"}
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
          emptyTitle={t("courses.noSettingsFound") || "Nessun formato di corso trovato."}
          onResetFilters={() => {
            setSearchQuery("");
            setModeFilter("all");
          }}
        />
      </div>

      {/* Add / Edit Settings Dialog */}
      <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
        <DialogContent className="sm:max-w-[540px] max-h-[90vh] overflow-y-auto">
          <form onSubmit={handleSaveSettings}>
            <DialogHeader>
              <DialogTitle className="text-base font-bold">
                {editingSettings
                  ? t("courses.editPresetTitle") || "Modifica Formato Didattico"
                  : t("courses.createPresetTitle") || "Nuovo Formato Didattico"}
              </DialogTitle>
            </DialogHeader>

            <div className="space-y-4 py-4">
              <div className="space-y-1.5">
                <Label htmlFor="preset-name" className="text-xs font-semibold">
                  {t("courses.presetNameLabel") || "Nome Formato / Preset"} *
                </Label>
                <Input
                  id="preset-name"
                  value={formName}
                  onChange={(e) => setFormName(e.target.value)}
                  placeholder="es. Corso di Gruppo Standard, Pacchetto Individuale..."
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

              <div className="grid grid-cols-2 gap-4">
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
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-1.5">
                  <Label htmlFor="preset-total-lessons" className="text-xs font-semibold">
                    {t("courses.totalLessonsLabel") || "Totale Lezioni (Default)"}
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

                <div className="space-y-1.5">
                  <Label htmlFor="preset-total-hours" className="text-xs font-semibold">
                    {t("courses.totalHoursLabel") || "Totale Ore (Default)"}
                  </Label>
                  <Input
                    id="preset-total-hours"
                    type="number"
                    value={formTotalHours}
                    onChange={(e) => setFormTotalHours(e.target.value)}
                    min={1}
                    step={0.5}
                    placeholder="40"
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
        title={t("courses.deletePresetConfirmTitle") || "Elimina Formato"}
        description={
          (
            t("courses.deletePresetConfirmDesc") ||
            "Sei sicuro di voler eliminare la configurazione '{name}'? I corsi associati manterranno i propri parametri ma perderanno il collegamento al formato."
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
