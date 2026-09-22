"use client";

import React, { useState, useMemo, useEffect } from "react";
import { useSearchParams } from "react-router-dom";
import type { ColumnDef, SortingState } from "@tanstack/react-table";
import {
  flexRender,
  getCoreRowModel,
  getPaginationRowModel,
  getSortedRowModel,
  getFilteredRowModel,
  useReactTable,
} from "@tanstack/react-table";
import { useForms } from "../hooks/use-forms";
import {
  type FormTemplate,
  FormType,
  FormFieldType,
  FormFieldTarget,
  FORM_TYPE_DICTIONARY,
  FORM_FIELD_TARGET_DICTIONARY,
  parseFormType,
} from "../types";
import { VisualFormBuilder } from "./visual-form-builder";
import { FormPreviewModal } from "./form-preview-modal";
import { FormFieldsView } from "./form-fields-view";
import { RegistrationFeeSettingsCard } from "@/components/shared/registration-fee-settings-card";
import { useCourses } from "@/features/courses/hooks/use-courses";
import { useFormFields } from "../hooks/use-form-fields";
import { useTranslation } from "@/i18n/context";

// shadcn / CRM UI components
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Switch } from "@/components/ui/switch";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";
import { DataViewToolbar } from "@/components/shared/data-view-toolbar";
import { DataTablePagination } from "@/components/ui/data-table-pagination";
import { TableSkeletonRows } from "@/components/ui/table-skeleton";
import { StatusBadge } from "@/components/shared/status-badge";
import { Checkbox } from "@/components/ui/checkbox";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  Layers,
  Star,
  Copy,
  Trash2,
  Pencil,
  Eye,
  CheckCircle2,
  Sparkles,
  Plus,
  RefreshCw,
  GraduationCap,
  Folder,
  Globe,
  Award,
  BookOpen,
  User,
  Users,
  Calendar,
  HelpCircle,
  Sliders,
  ArrowDown,
  ArrowUp,
  ArrowUpDown,
} from "lucide-react";

export function FormsListView() {
  const { t, locale } = useTranslation();
  const searchParams = useSearchParams();
  const targetCourseParam = searchParams[0]?.get("courseId") || searchParams[0]?.get("course_id");
  const { coursesList } = useCourses();
  const { fields: catalogFields } = useFormFields();

  const getFormTypeLabel = (val: any): string => {
    const parsed = parseFormType(val);
    const entry = FORM_TYPE_DICTIONARY[parsed];
    if (entry) return locale === "en" ? entry.label_en : entry.label_it;
    return String(val);
  };

  const getFieldTargetLabel = (val: FormFieldTarget): string => {
    const entry = FORM_FIELD_TARGET_DICTIONARY[val];
    if (entry) return locale === "en" ? entry.label_en : entry.label_it;
    return val;
  };

  const {
    forms,
    isLoading,
    refetch,
    createForm,
    updateForm,
    deleteForm,
    setDefaultForm,
    duplicateForm,
    isCreating,
    isUpdating,
    isDeleting,
  } = useForms();

  const [activeTab, setActiveTab] = useState<"templates" | "fields_catalog" | "fields_guide" | "quota">("templates");

  const [searchQuery, setSearchQuery] = useState<string>("");
  const [typeFilter, setTypeFilter] = useState<string>("all");
  const [targetFilter, setTargetFilter] = useState<string>("all");
  const [statusFilter, setStatusFilter] = useState<string>("all");
  const [viewMode, setViewMode] = useState<"table" | "grid">("table");
  const [sorting, setSorting] = useState<SortingState>([
    { id: "title", desc: false },
  ]);

  const [editingForm, setEditingForm] = useState<FormTemplate | null | "new">(null);
  const [previewForm, setPreviewForm] = useState<FormTemplate | null>(null);

  // Auto-open builder if courseId query param is provided
  useEffect(() => {
    if (targetCourseParam && forms.length > 0 && editingForm === null) {
      const existing = forms.find((f) => f.course_id === targetCourseParam);
      if (existing) {
        setEditingForm(existing);
      } else {
        const courseObj = coursesList.find((c) => c.id === targetCourseParam || c.slug === targetCourseParam);
        const newCourseForm: FormTemplate = {
          id: "",
          title: courseObj ? `Modulo Iscrizione — ${courseObj.nome}` : "Modulo Corso Dedicato",
          description: `Modulo personalizzato per il corso ${courseObj?.nome || ""}`,
          form_type: FormType.BOOKING,
          is_default: false,
          is_active: true,
          category_slug: null,
          course_id: courseObj?.id || targetCourseParam,
          fields_config: [],
        };
        setEditingForm(newCourseForm);
      }
    }
  }, [targetCourseParam, forms, coursesList]);

  // Metrics computation (styled strictly like Courses & Notifications metrics)
  const metricsData = useMemo(() => {
    const total = forms.length;
    const activeCount = forms.filter((f) => f.is_active).length;
    const courseSpecific = forms.filter((f) => Boolean(f.course_id)).length;
    const categorySpecific = forms.filter((f) => Boolean(f.category_slug) && !f.course_id).length;

    return [
      {
        title: t("forms.metricTotalForms"),
        value: total,
        description: t("forms.metricTotalFormsDesc"),
        icon: Layers,
      },
      {
        title: t("forms.metricActiveForms"),
        value: activeCount,
        description: t("forms.metricActiveFormsDesc"),
        icon: CheckCircle2,
      },
      {
        title: t("forms.metricCourseSpecific"),
        value: courseSpecific,
        description: t("forms.metricCourseSpecificDesc"),
        icon: GraduationCap,
      },
      {
        title: t("forms.metricCategorySpecific"),
        value: categorySpecific,
        description: t("forms.metricCategorySpecificDesc"),
        icon: Folder,
      },
    ];
  }, [forms, t]);

  // Filtering
  const filteredForms = useMemo(() => {
    return forms.filter((form) => {
      // Type filter
      if (typeFilter !== "all" && form.form_type !== typeFilter) {
        return false;
      }

      // Status filter
      if (statusFilter === "active" && !form.is_active) return false;
      if (statusFilter === "inactive" && form.is_active) return false;

      // Target filter
      if (targetFilter === "courses" && !form.course_id) return false;
      if (targetFilter === "categories" && !form.category_slug) return false;
      if (targetFilter === "global" && (form.course_id || form.category_slug)) return false;

      // Search query
      if (searchQuery.trim()) {
        const q = searchQuery.toLowerCase().trim();
        const matchTitle = form.title.toLowerCase().includes(q);
        const matchDesc = (form.description || "").toLowerCase().includes(q);
        const matchType = form.form_type.toLowerCase().includes(q);
        return matchTitle || matchDesc || matchType;
      }

      return true;
    });
  }, [forms, typeFilter, statusFilter, targetFilter, searchQuery]);

  const handleToggleStatus = async (form: FormTemplate, checked: boolean) => {
    await updateForm({
      id: form.id,
      payload: {
        is_active: checked,
      },
    });
  };

  const handleDeleteForm = async (form: FormTemplate) => {
    if (form.is_default) {
      return;
    }
    await deleteForm(form.id);
  };

  const handleSave = async (form: FormTemplate) => {
    if (!form.id || form.id === "new") {
      await createForm({
        title: form.title,
        description: form.description,
        form_type: form.form_type,
        is_default: form.is_default,
        is_active: form.is_active,
        category_slug: form.category_slug,
        course_id: form.course_id,
        fields_config: form.fields_config,
      });
    } else {
      await updateForm({
        id: form.id,
        payload: {
          title: form.title,
          description: form.description,
          form_type: form.form_type,
          is_default: form.is_default,
          is_active: form.is_active,
          category_slug: form.category_slug,
          course_id: form.course_id,
          fields_config: form.fields_config,
        },
      });
    }
    setEditingForm(null);
  };

  // TanStack Table Columns Definition
  const columns = useMemo<ColumnDef<FormTemplate>[]>(() => {
    return [
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
        accessorKey: "title",
        header: ({ column }) => (
          <Button
            variant="ghost"
            size="sm"
            className="-ml-3 h-8 cursor-pointer font-semibold text-xs text-muted-foreground hover:bg-accent/50"
            onClick={() => column.toggleSorting(column.getIsSorted() === "asc")}
          >
            <span>{t("forms.columnNameDetails")}</span>
            {column.getIsSorted() === "desc" ? (
              <ArrowDown className="ml-1.5 h-3.5 w-3.5 text-primary" />
            ) : column.getIsSorted() === "asc" ? (
              <ArrowUp className="ml-1.5 h-3.5 w-3.5 text-primary" />
            ) : (
              <ArrowUpDown className="ml-1.5 h-3.5 w-3.5 opacity-50" />
            )}
          </Button>
        ),
        cell: ({ row }) => {
          const form = row.original;
          const isContact = form.form_type === FormType.CONTACT;
          const iconColorClass = isContact
            ? "bg-amber-500/10 text-amber-600 dark:text-amber-400 border-amber-500/20"
            : form.course_id
            ? "bg-purple-500/10 text-purple-600 dark:text-purple-400 border-purple-500/20"
            : form.category_slug
            ? "bg-blue-500/10 text-blue-600 dark:text-blue-400 border-blue-500/20"
            : "bg-primary/10 text-primary border-primary/20";

          return (
            <div className="flex items-center gap-3 min-w-[240px]">
              <div className={`h-9 w-9 rounded-lg flex items-center justify-center font-bold text-xs shrink-0 border ${iconColorClass}`}>
                {isContact ? (
                  <Globe className="h-4 w-4" />
                ) : form.course_id ? (
                  <GraduationCap className="h-4 w-4" />
                ) : form.category_slug ? (
                  <Folder className="h-4 w-4" />
                ) : (
                  <Layers className="h-4 w-4" />
                )}
              </div>
              <div className="flex flex-col gap-0.5 min-w-0">
                <div className="flex items-center gap-2 flex-wrap">
                  <span className="font-bold text-sm text-foreground truncate">{form.title}</span>
                  {form.is_default && (
                    <Badge className="bg-amber-500 text-slate-950 font-black text-[10px] gap-1 px-1.5 py-0 shadow-2xs">
                      <Star className="w-2.5 h-2.5 fill-current" />
                      {t("forms.badgeDefault")}
                    </Badge>
                  )}
                  <Badge variant="secondary" className="text-[10px] uppercase font-semibold">
                    {getFormTypeLabel(form.form_type)}
                  </Badge>
                </div>
                {form.description && (
                  <p className="text-xs text-muted-foreground line-clamp-1">{form.description}</p>
                )}
              </div>
            </div>
          );
        },
      },
      {
        id: "target",
        header: t("forms.columnDestination"),
        cell: ({ row }) => {
          const form = row.original;
          if (form.form_type === FormType.CONTACT) {
            return (
              <Badge variant="outline" className="border-blue-500/30 text-blue-700 dark:text-blue-400 bg-blue-50/60 font-semibold text-xs gap-1.5 py-1">
                <Globe className="w-3.5 h-3.5 text-blue-500" />
                {t("forms.targetContactSite")}
              </Badge>
            );
          }
          if (form.course_id) {
            const course = coursesList.find((c) => c.id === form.course_id);
            return (
              <Badge variant="outline" className="border-purple-500/30 text-purple-600 dark:text-purple-400 bg-purple-500/5 font-semibold text-xs gap-1.5 py-1">
                <GraduationCap className="w-3.5 h-3.5" />
                {course?.nome || t("forms.targetCourse")}
              </Badge>
            );
          }
          if (form.category_slug) {
            return (
              <Badge variant="outline" className="border-blue-500/30 text-blue-600 dark:text-blue-400 bg-blue-500/5 font-semibold text-xs gap-1.5 py-1">
                <Folder className="w-3.5 h-3.5" />
                {t("forms.targetCategory")}: {form.category_slug.toUpperCase()}
              </Badge>
            );
          }
          return (
            <Badge variant="outline" className="border-slate-300 text-slate-600 dark:text-slate-400 bg-slate-100/50 font-medium text-xs gap-1.5 py-1">
              <Globe className="w-3.5 h-3.5 text-slate-400" />
              {t("forms.targetGlobal")}
            </Badge>
          );
        },
      },
      {
        id: "fields",
        header: t("forms.columnFields"),
        cell: ({ row }) => {
          const fields = row.original.fields_config || [];
          const enabledCount = fields.filter((f) => f.is_enabled).length;
          const purchaserCount = fields.filter((f) => f.is_enabled && f.target === FormFieldTarget.PURCHASER).length;
          const studentCount = fields.filter((f) => f.is_enabled && f.target === FormFieldTarget.STUDENT).length;

          return (
            <div className="flex items-center gap-1.5 flex-wrap">
              <Badge variant="secondary" className="text-xs font-bold px-2 py-0.5">
                {enabledCount} {t("forms.badgeActive").toLowerCase()}
              </Badge>
              {purchaserCount > 0 && (
                <span className="text-[11px] text-muted-foreground font-medium bg-slate-100 dark:bg-slate-800 px-1.5 py-0.5 rounded">
                  {purchaserCount} {getFieldTargetLabel(FormFieldTarget.PURCHASER).toLowerCase()}
                </span>
              )}
              {studentCount > 0 && (
                <span className="text-[11px] text-muted-foreground font-medium bg-slate-100 dark:bg-slate-800 px-1.5 py-0.5 rounded">
                  {studentCount} {getFieldTargetLabel(FormFieldTarget.STUDENT).toLowerCase()}
                </span>
              )}
            </div>
          );
        },
      },
      {
        accessorKey: "is_active",
        header: t("forms.columnStatus"),
        cell: ({ row }) => {
          const form = row.original;
          if (form.is_default) {
            return <StatusBadge status="attivo" />;
          }
          return (
            <div className="flex items-center gap-2">
              <StatusBadge status={form.is_active ? "attivo" : "archived"} />
              <Switch
                checked={form.is_active}
                onCheckedChange={(checked) => handleToggleStatus(form, checked)}
                disabled={isUpdating}
                className="scale-75 cursor-pointer data-[state=checked]:bg-emerald-600"
                aria-label="Attiva/Disattiva modulo"
              />
            </div>
          );
        },
      },
      {
        id: "actions",
        header: t("forms.columnActions"),
        enableHiding: false,
        cell: ({ row }) => {
          const form = row.original;
          return (
            <div className="flex items-center gap-1">
              {!form.is_default && (
                <Button
                  variant="ghost"
                  size="icon"
                  className="h-8 w-8 cursor-pointer text-muted-foreground hover:text-amber-600"
                  onClick={() => setDefaultForm(form.id)}
                  title={t("forms.badgeDefault")}
                >
                  <Star className="h-4 w-4" />
                </Button>
              )}
              <Button
                variant="ghost"
                size="icon"
                className="h-8 w-8 cursor-pointer text-muted-foreground hover:text-foreground"
                onClick={() => setPreviewForm(form)}
                title="Preview"
              >
                <Eye className="h-4 w-4" />
              </Button>
              <Button
                variant="ghost"
                size="icon"
                className="h-8 w-8 cursor-pointer text-muted-foreground hover:text-foreground"
                onClick={() => duplicateForm(form.id)}
                title={t("forms.actionDuplicate")}
              >
                <Copy className="h-4 w-4" />
              </Button>
              <Button
                variant="ghost"
                size="icon"
                className="h-8 w-8 cursor-pointer text-muted-foreground hover:text-foreground"
                onClick={() => setEditingForm(form)}
                title={t("forms.actionEdit")}
              >
                <Pencil className="h-4 w-4" />
              </Button>
              {!form.is_default && (
                <Button
                  variant="ghost"
                  size="icon"
                  className="h-8 w-8 cursor-pointer text-muted-foreground hover:text-destructive transition-colors"
                  onClick={() => handleDeleteForm(form)}
                  disabled={isDeleting}
                  title={t("forms.actionDelete")}
                >
                  <Trash2 className="h-4 w-4" />
                </Button>
              )}
            </div>
          );
        },
      },
    ];
  }, [coursesList, isUpdating, isDeleting, setDefaultForm, duplicateForm, t, locale]);

  const table = useReactTable({
    data: filteredForms,
    columns,
    state: { sorting },
    onSortingChange: setSorting,
    getCoreRowModel: getCoreRowModel(),
    getSortedRowModel: getSortedRowModel(),
    getPaginationRowModel: getPaginationRowModel(),
    getFilteredRowModel: getFilteredRowModel(),
  });

  if (editingForm) {
    return (
      <div className="px-4 lg:px-6">
        <VisualFormBuilder
          key={editingForm === "new" ? "new" : (editingForm.id || "draft")}
          initialForm={editingForm === "new" ? null : editingForm}
          onSave={handleSave}
          onCancel={() => setEditingForm(null)}
          isSaving={isCreating || isUpdating}
        />
      </div>
    );
  }

  return (
    <div className="flex flex-col gap-4">
      {/* ── Top Navigation Tabs (Templates vs Catalogo Campi vs Fields Guide vs Quota Associativa) ── */}
      <div className="px-4 lg:px-6 flex items-center justify-between border-b pb-3">
        <div className="flex items-center gap-2">
          <div className="flex rounded-xl bg-muted/50 p-1 border flex-wrap">
            <button
              type="button"
              onClick={() => setActiveTab("templates")}
              className={`flex items-center gap-2 px-4 py-2 rounded-lg text-xs font-bold transition-all cursor-pointer ${
                activeTab === "templates"
                  ? "bg-background shadow-xs text-foreground"
                  : "text-muted-foreground hover:text-foreground"
              }`}
            >
              <Layers className="h-4 w-4" />
              {t("forms.tabTemplates")} ({forms.length})
            </button>
            <button
              type="button"
              onClick={() => setActiveTab("fields_catalog")}
              className={`flex items-center gap-2 px-4 py-2 rounded-lg text-xs font-bold transition-all cursor-pointer ${
                activeTab === "fields_catalog"
                  ? "bg-background shadow-xs text-foreground"
                  : "text-muted-foreground hover:text-foreground"
              }`}
            >
              <Sliders className="h-4 w-4 text-primary" />
              {t("forms.tabFieldsCatalog") || "Catalogo Campi"} ({catalogFields.length})
            </button>
            <button
              type="button"
              onClick={() => setActiveTab("fields_guide")}
              className={`flex items-center gap-2 px-4 py-2 rounded-lg text-xs font-bold transition-all cursor-pointer ${
                activeTab === "fields_guide"
                  ? "bg-background shadow-xs text-foreground"
                  : "text-muted-foreground hover:text-foreground"
              }`}
            >
              <BookOpen className="h-4 w-4 text-sky-500" />
              {t("forms.tabFieldsGuide")}
            </button>
            <button
              type="button"
              onClick={() => setActiveTab("quota")}
              className={`flex items-center gap-2 px-4 py-2 rounded-lg text-xs font-bold transition-all cursor-pointer ${
                activeTab === "quota"
                  ? "bg-background shadow-xs text-foreground"
                  : "text-muted-foreground hover:text-foreground"
              }`}
            >
              <Award className="h-4 w-4 text-amber-500" />
              {t("forms.tabQuota")} (€30)
            </button>
          </div>
        </div>
      </div>

      {activeTab === "fields_catalog" ? (
        <div className="@container/main px-4 lg:px-6 space-y-4">
          <FormFieldsView />
        </div>
      ) : activeTab === "fields_guide" ? (
        <div className="@container/main px-4 lg:px-6 space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <Card className="border">
              <CardHeader className="pb-3">
                <div className="p-2 w-fit rounded-lg bg-blue-500/10 text-blue-600 mb-2">
                  <User className="w-5 h-5" />
                </div>
                <CardTitle className="text-base font-bold">{t("forms.guidePurchaserTitle")}</CardTitle>
                <CardDescription className="text-xs">
                  {t("forms.guidePurchaserDesc")}
                </CardDescription>
              </CardHeader>
              <CardContent className="text-xs text-muted-foreground space-y-2">

                <p>• Esempi: <em>"Come ci hai conosciuto?", "Necessità fattura aziendale", "Codice SDI"</em>.</p>
                <p>• Viene renderizzato nel primo blocco di anagrafica del checkout online.</p>
              </CardContent>
            </Card>

            <Card className="border">
              <CardHeader className="pb-3">
                <div className="p-2 w-fit rounded-lg bg-purple-500/10 text-purple-600 mb-2">
                  <Users className="w-5 h-5" />
                </div>
                <CardTitle className="text-base font-bold">{t("forms.guideStudentTitle")}</CardTitle>
                <CardDescription className="text-xs">
                  {t("forms.guideStudentDesc")}
                </CardDescription>
              </CardHeader>
              <CardContent className="text-xs text-muted-foreground space-y-2">
                <p>• Esempi: <em>"Livello di partenza stimato", "Obiettivo esame", "Classe frequentata"</em>.</p>
                <p>• Viene associato al partecipante del corso in tabella <code>students</code> e salvato in JSONB.</p>
              </CardContent>
            </Card>

            <Card className="border">
              <CardHeader className="pb-3">
                <div className="p-2 w-fit rounded-lg bg-emerald-500/10 text-emerald-600 mb-2">
                  <Calendar className="w-5 h-5" />
                </div>
                <CardTitle className="text-base font-bold">{t("forms.guideBookingTitle")}</CardTitle>
                <CardDescription className="text-xs">
                  {t("forms.guideBookingDesc")}
                </CardDescription>
              </CardHeader>
              <CardContent className="text-xs text-muted-foreground space-y-2">
                <p>• Esempi: <em>"Disponibilità fasce orarie", "Richieste particolari al docente"</em>.</p>
                <p>• Viene archiviato direttamente in <code>bookings.custom_fields</code>.</p>
              </CardContent>
            </Card>
          </div>
        </div>
      ) : activeTab === "quota" ? (
        <div className="@container/main px-4 lg:px-6">
          <RegistrationFeeSettingsCard />
        </div>
      ) : (
        <>
          {/* ── Top Metrics (Strictly matching CoursesMetrics & Notifications design) ── */}
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
            <DataViewToolbar
              searchQuery={searchQuery}
              onSearchChange={setSearchQuery}
              searchPlaceholder={t("forms.searchPlaceholder")}
              filters={[
                {
                  value: typeFilter,
                  onChange: setTypeFilter,
                  placeholder: t("forms.filterType"),
                  options: [
                    { value: "all", label: t("forms.typeAll") },
                    { value: FormType.BOOKING, label: getFormTypeLabel(FormType.BOOKING) },
                    { value: FormType.CONTACT, label: getFormTypeLabel(FormType.CONTACT) },
                    { value: FormType.TEST, label: getFormTypeLabel(FormType.TEST) },
                    { value: FormType.CUSTOM, label: getFormTypeLabel(FormType.CUSTOM) },
                  ],
                },
                {
                  value: statusFilter,
                  onChange: setStatusFilter,
                  placeholder: t("forms.filterStatus"),
                  options: [
                    { value: "all", label: t("forms.statusAll") },
                    { value: "active", label: t("forms.statusActive") },
                    { value: "inactive", label: t("forms.statusInactive") },
                  ],
                },
              ]}
              actionElement={
                <Button
                  onClick={() => setEditingForm("new")}
                  className="font-medium cursor-pointer shadow-sm text-xs"
                >
                  <Plus className="mr-1.5 h-4 w-4" /> {t("forms.newFormBtn")}
                </Button>
              }
              viewMode={viewMode}
              onViewModeChange={setViewMode}
            />

            {viewMode === "table" ? (
              <div className="space-y-4">
                <div className="rounded-md border bg-card">
                  <Table>
                    <TableHeader>
                      {table.getHeaderGroups().map((headerGroup) => (
                        <TableRow key={headerGroup.id}>
                          {headerGroup.headers.map((header) => (
                            <TableHead key={header.id}>
                              {header.isPlaceholder
                                ? null
                                : flexRender(header.column.columnDef.header, header.getContext())}
                            </TableHead>
                          ))}
                        </TableRow>
                      ))}
                    </TableHeader>
                    <TableBody>
                      {isLoading ? (
                        <TableSkeletonRows columnsCount={columns.length} rowCount={6} />
                      ) : table.getRowModel().rows?.length ? (
                        table.getRowModel().rows.map((row) => (
                          <TableRow key={row.id} className="hover:bg-muted/50 transition-all duration-200">
                            {row.getVisibleCells().map((cell) => (
                              <TableCell key={cell.id}>
                                {flexRender(cell.column.columnDef.cell, cell.getContext())}
                              </TableCell>
                            ))}
                          </TableRow>
                        ))
                      ) : (
                        <TableRow>
                          <TableCell colSpan={columns.length} className="h-24 text-center text-muted-foreground">
                            {t("forms.noFormsFound")}
                          </TableCell>
                        </TableRow>
                      )}
                    </TableBody>
                  </Table>
                </div>

                <DataTablePagination table={table} />
              </div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 2xl:grid-cols-4 gap-4">
                {filteredForms.map((form) => {
                  const fieldsCount = form.fields_config?.length || 0;
                  const enabledCount = form.fields_config?.filter((f) => f.is_enabled).length || 0;
                  return (
                    <Card
                      key={form.id}
                      className={`border flex flex-col justify-between hover:shadow-sm transition-all ${
                        form.is_default ? "border-amber-400/80 ring-1 ring-amber-400/30" : ""
                      }`}
                    >
                      <CardHeader className="pb-3 space-y-2">
                        <div className="flex items-center justify-between gap-2">
                          <div className="flex items-center gap-1.5 flex-wrap">
                            <Badge variant="secondary" className="text-[10px] uppercase font-semibold">
                              {getFormTypeLabel(form.form_type)}
                            </Badge>
                            {form.is_default && (
                              <Badge className="bg-amber-500 text-slate-950 font-black text-[10px] gap-1 px-1.5 py-0.5">
                                <Star className="w-3 h-3 fill-current" />
                                {t("forms.badgeDefault")}
                              </Badge>
                            )}
                          </div>
                          {!form.is_default && (
                            <Switch
                              checked={form.is_active}
                              onCheckedChange={(checked) => handleToggleStatus(form, checked)}
                              disabled={isUpdating}
                              className="scale-75 cursor-pointer data-[state=checked]:bg-emerald-600"
                            />
                          )}
                        </div>

                        <div>
                          <CardTitle className="text-sm font-bold text-foreground">
                            {form.title}
                          </CardTitle>
                          {form.description && (
                            <CardDescription className="text-xs text-muted-foreground line-clamp-2 mt-1">
                              {form.description}
                            </CardDescription>
                          )}
                        </div>
                      </CardHeader>

                      <CardContent className="space-y-3 pb-3 text-xs">
                        <div className="flex items-center gap-1.5">
                          <span className="font-semibold text-muted-foreground">Target:</span>
                          {form.course_id ? (
                            <Badge variant="outline" className="text-purple-600 dark:text-purple-400 border-purple-500/30 bg-purple-500/5 font-semibold text-[11px] gap-1">
                              <GraduationCap className="w-3 h-3" />
                              {coursesList.find((c) => c.id === form.course_id)?.nome || t("forms.targetCourse")}
                            </Badge>
                          ) : form.category_slug ? (
                            <Badge variant="outline" className="text-blue-600 dark:text-blue-400 border-blue-500/30 bg-blue-500/5 font-semibold text-[11px] gap-1">
                              <Folder className="w-3 h-3" />
                              {t("forms.targetCategory")}: {form.category_slug.toUpperCase()}
                            </Badge>
                          ) : form.form_type === FormType.CONTACT ? (
                            <Badge variant="outline" className="text-blue-600 dark:text-blue-400 border-blue-500/30 bg-blue-500/5 text-[11px] gap-1">
                              <Globe className="w-3 h-3 text-blue-500" />
                              {t("forms.targetContactSite")}
                            </Badge>
                          ) : (
                            <Badge variant="outline" className="text-muted-foreground text-[11px] gap-1">
                              <Globe className="w-3 h-3" />
                              {t("forms.targetGlobal")}
                            </Badge>
                          )}
                        </div>

                        <div className="text-xs text-muted-foreground flex items-center justify-between">
                          <span>{t("forms.columnFields")}:</span>
                          <span className="font-bold text-foreground">
                            {enabledCount} {t("forms.badgeActive").toLowerCase()} {fieldsCount !== enabledCount && `(${fieldsCount} tot)`}
                          </span>
                        </div>
                      </CardContent>

                      <div className="p-3 border-t flex items-center justify-between gap-1">
                        <div className="flex items-center gap-1">
                          {!form.is_default && (
                            <Button
                              size="sm"
                              variant="ghost"
                              className="h-8 w-8 p-0 text-muted-foreground hover:text-amber-600 cursor-pointer"
                              title={t("forms.badgeDefault")}
                              onClick={() => setDefaultForm(form.id)}
                            >
                              <Star className="w-3.5 h-3.5" />
                            </Button>
                          )}
                          <Button
                            size="sm"
                            variant="ghost"
                            className="h-8 w-8 p-0 text-muted-foreground hover:text-foreground cursor-pointer"
                            title="Preview"
                            onClick={() => setPreviewForm(form)}
                          >
                            <Eye className="w-3.5 h-3.5" />
                          </Button>
                          <Button
                            size="sm"
                            variant="ghost"
                            className="h-8 w-8 p-0 text-muted-foreground hover:text-foreground cursor-pointer"
                            title={t("forms.actionDuplicate")}
                            onClick={() => duplicateForm(form.id)}
                          >
                            <Copy className="w-3.5 h-3.5" />
                          </Button>
                          {!form.is_default && (
                            <Button
                              size="sm"
                              variant="ghost"
                              className="h-8 w-8 p-0 text-muted-foreground hover:text-destructive cursor-pointer"
                              title={t("forms.actionDelete")}
                              onClick={() => handleDeleteForm(form)}
                            >
                              <Trash2 className="w-3.5 h-3.5" />
                            </Button>
                          )}
                        </div>

                        <Button
                          size="sm"
                          variant="outline"
                          className="h-8 text-xs cursor-pointer gap-1 px-2.5"
                          onClick={() => setEditingForm(form)}
                        >
                          <Pencil className="w-3.5 h-3.5" />
                          {t("forms.actionEdit")}
                        </Button>
                      </div>
                    </Card>
                  );
                })}
                {filteredForms.length === 0 && (
                  <div className="col-span-full py-12 text-center text-sm text-muted-foreground border rounded-md">
                    {t("forms.noFormsFound")}
                  </div>
                )}
              </div>
            )}
          </div>
        </>
      )}

      {/* Interactive Preview Modal */}
      <FormPreviewModal
        isOpen={Boolean(previewForm)}
        onClose={() => setPreviewForm(null)}
        form={previewForm}
      />
    </div>
  );
}

export default FormsListView;
