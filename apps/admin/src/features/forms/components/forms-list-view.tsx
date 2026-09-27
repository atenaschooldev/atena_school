"use client";

import React, { useState, useMemo, useEffect } from "react";
import { useSearchParams } from "react-router-dom";
import type { ColumnDef, SortingState, ColumnFiltersState, VisibilityState } from "@tanstack/react-table";
import {
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
  FormFieldTarget,
  FORM_TYPE_DICTIONARY,
  FORM_FIELD_TARGET_DICTIONARY,
  parseFormType,
} from "../types";
import { VisualFormBuilder } from "./visual-form-builder";
import { FormPreviewModal } from "./form-preview-modal";
import { FormFieldsView } from "./form-fields-view";
import { useCourses } from "@/features/courses/hooks/use-courses";
import { useFormFields } from "../hooks/use-form-fields";
import { useTranslation } from "@/i18n/context";

// shadcn / CRM UI components
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Switch } from "@/components/ui/switch";
import { Checkbox } from "@/components/ui/checkbox";
import { StatusBadge } from "@/components/shared/status-badge";
import { AtenaDataTable } from "@/components/shared/data-table/atena-data-table";
import { DataTableToolbar } from "@/components/shared/data-table/data-table-toolbar";
import { DataTableColumnHeader } from "@/components/shared/data-table/data-table-column-header";
import { CellAvatar } from "@/components/shared/data-table/cells/cell-avatar";
import { CellCopyableId } from "@/components/shared/cell-copyable-id";
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
  Sliders,
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

  const [activeTab, setActiveTab] = useState<"templates" | "fields_catalog">("templates");
  const [editingForm, setEditingForm] = useState<FormTemplate | "new" | null>(null);
  const [previewForm, setPreviewForm] = useState<FormTemplate | null>(null);

  // Filters & Sorting
  const [searchQuery, setSearchQuery] = useState("");
  const [typeFilter, setTypeFilter] = useState("all");
  const [statusFilter, setStatusFilter] = useState("all");
  const [sorting, setSorting] = useState<SortingState>([
    { id: "title", desc: false },
  ]);
  const [columnFilters, setColumnFilters] = useState<ColumnFiltersState>([]);
  const [columnVisibility, setColumnVisibility] = useState<VisibilityState>({});
  const [rowSelection, setRowSelection] = useState({});

  useEffect(() => {
    if (targetCourseParam && forms.length > 0) {
      const matched = forms.find((f) => f.course_id === targetCourseParam);
      if (matched) {
        setEditingForm(matched);
      }
    }
  }, [targetCourseParam, forms]);

  const metricsData = useMemo(() => {
    const total = forms.length;
    const active = forms.filter((f) => f.is_active).length;
    const bookingForms = forms.filter((f) => f.form_type === FormType.BOOKING).length;
    const contactForms = forms.filter((f) => f.form_type === FormType.CONTACT).length;

    return [
      {
        title: t("forms.metricTotalForms"),
        value: total,
        description: `${active} ${t("forms.metricActiveCount")}`,
        icon: Layers,
      },
      {
        title: t("forms.metricBookingForms"),
        value: bookingForms,
        description: t("forms.metricBookingFormsDesc"),
        icon: GraduationCap,
      },
      {
        title: t("forms.metricContactForms"),
        value: contactForms,
        description: t("forms.metricContactFormsDesc"),
        icon: Globe,
      },
      {
        title: t("forms.metricFieldsCatalog"),
        value: catalogFields.length,
        description: t("forms.metricFieldsCatalogDesc"),
        icon: Sliders,
      },
    ];
  }, [forms, catalogFields, t]);

  const filteredForms = useMemo(() => {
    return forms.filter((f) => {
      if (searchQuery.trim()) {
        const q = searchQuery.toLowerCase().trim();
        const matchTitle = f.title.toLowerCase().includes(q);
        const matchDesc = (f.description || "").toLowerCase().includes(q);
        if (!matchTitle && !matchDesc) return false;
      }

      if (typeFilter !== "all" && f.form_type !== typeFilter) {
        return false;
      }

      if (statusFilter !== "all") {
        if (statusFilter === "active" && !f.is_active) return false;
        if (statusFilter === "inactive" && f.is_active) return false;
      }

      return true;
    });
  }, [forms, searchQuery, typeFilter, statusFilter]);

  const isSystemTemplate = (form: FormTemplate): boolean => {
    if ((form as any).is_system) return true;
    const SYSTEM_SLUGS = [
      "default-booking-form",
      "contact-landing-form",
      "modulo-iscrizione-base",
      "modulo-contatto-sito",
      "default_booking_form",
      "contact_landing_form",
    ];
    if (form.slug && SYSTEM_SLUGS.includes(form.slug.toLowerCase())) return true;
    if (form.is_default && form.form_type === FormType.BOOKING && !form.course_id && !form.category_slug) {
      return true;
    }
    if (form.form_type === FormType.CONTACT && !form.course_id && !form.category_slug) {
      return true;
    }
    return false;
  };

  const handleToggleStatus = async (form: FormTemplate, newActive: boolean) => {
    await updateForm(form.id, { is_active: newActive });
  };

  const handleDeleteForm = async (form: FormTemplate) => {
    if (isSystemTemplate(form)) {
      alert(t("forms.cannotDeleteSystemForm"));
      return;
    }

    const confirmed = window.confirm(
      t("forms.deleteConfirm").replace("{title}", form.title)
    );
    if (!confirmed) return;
    await deleteForm(form.id);
  };

  const handleSave = async (data: any) => {
    try {
      const rawId = (editingForm && typeof editingForm === "object") ? editingForm.id : data?.id;
      const isValidId = Boolean(rawId && rawId !== "new" && rawId !== "draft" && rawId !== "undefined");
      if (!isValidId || editingForm === "new") {
        await createForm(data);
      } else {
        await updateForm(rawId, data);
      }
      setEditingForm(null);
    } catch (e: any) {
      console.error("Error saving form:", e);
    }
  };

  const columns: ColumnDef<FormTemplate>[] = useMemo(() => {
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
              aria-label={t("common.selectAll")}
            />
          </div>
        ),
        cell: ({ row }) => (
          <div className="flex items-center justify-center px-2">
            <Checkbox
              checked={row.getIsSelected()}
              onCheckedChange={(value) => row.toggleSelected(!!value)}
              aria-label={t("common.selectRow")}
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
        accessorKey: "title",
        header: ({ column }) => (
          <DataTableColumnHeader column={column} title={t("forms.columnName")} />
        ),
        cell: ({ row }) => {
          const form = row.original;
          const isContact = form.form_type === FormType.CONTACT;
          const icon = isContact
            ? Globe
            : form.course_id
            ? GraduationCap
            : form.category_slug
            ? Folder
            : Layers;

          return (
            <div className="flex items-center gap-3 min-w-[240px]">
              <CellAvatar
                title={form.title}
                subtitle={form.description || undefined}
                icon={icon}
                badgeColor="bg-primary/10 text-primary"
              />
              {form.is_default && (
                <Badge className="bg-amber-500 text-slate-950 font-black text-[10px] gap-1 px-1.5 py-0 shadow-2xs">
                  <Star className="w-2.5 h-2.5 fill-current" />
                  {t("forms.badgeDefault")}
                </Badge>
              )}
            </div>
          );
        },
      },
      {
        id: "target",
        header: ({ column }) => (
          <DataTableColumnHeader column={column} title={t("forms.columnDestination")} />
        ),
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
            <Badge variant="outline" className="border-border/60 text-muted-foreground bg-muted/40 font-medium text-xs gap-1.5 py-1">
              <Globe className="w-3.5 h-3.5 text-muted-foreground" />
              {t("forms.targetGlobal")}
            </Badge>
          );
        },
      },
      {
        id: "fields",
        header: ({ column }) => (
          <DataTableColumnHeader column={column} title={t("forms.columnFields")} />
        ),
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
                <span className="text-[11px] text-muted-foreground font-medium bg-muted px-1.5 py-0.5 rounded">
                  {purchaserCount} {getFieldTargetLabel(FormFieldTarget.PURCHASER).toLowerCase()}
                </span>
              )}
              {studentCount > 0 && (
                <span className="text-[11px] text-muted-foreground font-medium bg-muted px-1.5 py-0.5 rounded">
                  {studentCount} {getFieldTargetLabel(FormFieldTarget.STUDENT).toLowerCase()}
                </span>
              )}
            </div>
          );
        },
      },
      {
        accessorKey: "is_active",
        header: ({ column }) => (
          <DataTableColumnHeader column={column} title={t("forms.columnStatus")} />
        ),
        cell: ({ row }) => {
          const form = row.original;
          if (isSystemTemplate(form)) {
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
        header: () => (
          <div className="text-right text-xs font-medium text-muted-foreground">
            {t("forms.columnActions")}
          </div>
        ),
        enableHiding: false,
        cell: ({ row }) => {
          const form = row.original;
          const isSys = isSystemTemplate(form);
          return (
            <div className="flex items-center justify-end gap-1">
              {!form.is_default && (
                <Button
                  variant="ghost"
                  size="icon"
                  className="h-8 w-8 cursor-pointer text-muted-foreground hover:text-amber-600 hover:bg-muted/80 rounded-lg"
                  onClick={() => setDefaultForm(form.id)}
                  title={t("forms.badgeDefault")}
                >
                  <Star className="h-4 w-4" />
                </Button>
              )}
              <Button
                variant="ghost"
                size="icon"
                className="h-8 w-8 cursor-pointer text-muted-foreground hover:text-foreground hover:bg-muted/80 rounded-lg"
                onClick={() => setPreviewForm(form)}
                title="Preview"
              >
                <Eye className="h-4 w-4" />
              </Button>
              <Button
                variant="ghost"
                size="icon"
                className="h-8 w-8 cursor-pointer text-muted-foreground hover:text-foreground hover:bg-muted/80 rounded-lg"
                onClick={() => duplicateForm(form.id)}
                title={t("forms.actionDuplicate")}
              >
                <Copy className="h-4 w-4" />
              </Button>
              <Button
                variant="ghost"
                size="icon"
                className="h-8 w-8 cursor-pointer text-muted-foreground hover:text-foreground hover:bg-muted/80 rounded-lg"
                onClick={() => setEditingForm(form)}
                title={t("forms.actionEdit")}
              >
                <Pencil className="h-4 w-4" />
              </Button>
              {!isSys && (
                <Button
                  variant="ghost"
                  size="icon"
                  className="h-8 w-8 cursor-pointer text-rose-600/70 hover:text-rose-600 hover:bg-rose-500/10 rounded-lg dark:hover:text-rose-400 transition-colors"
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
    state: {
      sorting,
      columnFilters,
      columnVisibility,
      rowSelection,
    },
    enableRowSelection: true,
    onRowSelectionChange: setRowSelection,
    onSortingChange: setSorting,
    onColumnFiltersChange: setColumnFilters,
    onColumnVisibilityChange: setColumnVisibility,
    getCoreRowModel: getCoreRowModel(),
    getPaginationRowModel: getPaginationRowModel(),
    getSortedRowModel: getSortedRowModel(),
    getFilteredRowModel: getFilteredRowModel(),
  });

  const typeOptions = [
    { value: "all", label: t("forms.typeAll") },
    { value: FormType.BOOKING, label: getFormTypeLabel(FormType.BOOKING) },
    { value: FormType.CONTACT, label: getFormTypeLabel(FormType.CONTACT) },
    { value: FormType.TEST, label: getFormTypeLabel(FormType.TEST) },
    { value: FormType.CUSTOM, label: getFormTypeLabel(FormType.CUSTOM) },
  ];

  const statusOptions = [
    { value: "all", label: t("forms.statusAll") },
    { value: "active", label: t("forms.statusActive") },
    { value: "inactive", label: t("forms.statusInactive") },
  ];

  if (editingForm) {
    return (
      <div className="@container/main px-4 lg:px-6">
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
    <div className="flex flex-col gap-6">
      {/* ── Top Navigation Tabs ── */}
      <div className="px-4 lg:px-6 flex items-center justify-between border-b pb-3 flex-wrap gap-3">
        <div className="flex rounded-xl bg-muted/50 p-1 border border-border/60 flex-wrap">
          <button
            type="button"
            onClick={() => setActiveTab("templates")}
            className={`flex items-center gap-2 px-4 py-1.5 rounded-lg text-xs font-semibold transition-all cursor-pointer ${
              activeTab === "templates"
                ? "bg-background shadow-xs text-foreground font-bold"
                : "text-muted-foreground hover:text-foreground"
            }`}
          >
            <Layers className="h-4 w-4" />
            {t("forms.tabTemplates")} ({forms.length})
          </button>
          <button
            type="button"
            onClick={() => setActiveTab("fields_catalog")}
            className={`flex items-center gap-2 px-4 py-1.5 rounded-lg text-xs font-semibold transition-all cursor-pointer ${
              activeTab === "fields_catalog"
                ? "bg-background shadow-xs text-foreground font-bold"
                : "text-muted-foreground hover:text-foreground"
            }`}
          >
            <Sliders className="h-4 w-4 text-primary" />
            {t("forms.tabFieldsCatalog") || "Catalogo Campi"} ({catalogFields.length})
          </button>
        </div>
      </div>

      {activeTab === "fields_catalog" ? (
        <div className="@container/main px-4 lg:px-6 space-y-4">
          <FormFieldsView />
        </div>
      ) : (
        <>
          {/* ── Top Metrics ── */}
          <div className="@container/main px-4 lg:px-6">
            <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
              {metricsData.map((metric, index) => (
                <Card key={index} className="border border-border/60 bg-card/70 backdrop-blur-sm shadow-xs">
                  <CardContent className="space-y-3 p-5">
                    <div className="flex items-center justify-between">
                      <span className="text-muted-foreground text-xs font-semibold">{metric.title}</span>
                      <div className="p-2 bg-primary/10 text-primary rounded-lg">
                        <metric.icon className="size-4" />
                      </div>
                    </div>
                    <div>
                      <div className="text-2xl font-bold text-foreground">{metric.value}</div>
                      <div className="text-muted-foreground text-xs mt-0.5">{metric.description}</div>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          </div>

          {/* ── Main Toolbar & Content Container ── */}
          <div className="@container/main px-4 lg:px-6 space-y-4">
            <DataTableToolbar
              table={table}
              searchKey="title"
              searchPlaceholder={t("forms.searchPlaceholder")}
              searchValue={searchQuery}
              onSearchChange={setSearchQuery}
              filterKey="form_type"
              filterTitle={t("forms.filterType")}
              filterValue={typeFilter}
              onFilterChange={setTypeFilter}
              filterOptions={typeOptions}
              actionButton={
                <Button
                  size="sm"
                  onClick={() => setEditingForm("new")}
                  className="h-8 text-xs font-semibold gap-1.5 cursor-pointer rounded-lg shadow-xs"
                >
                  <Plus className="h-4 w-4" />
                  <span>{t("forms.newFormBtn")}</span>
                </Button>
              }
            />

            <AtenaDataTable
              table={table}
              columns={columns}
              loading={isLoading}
              emptyMessage={t("forms.emptyState.title") || t("forms.searchPlaceholder")}
            />
          </div>
        </>
      )}

      {previewForm && (
        <FormPreviewModal
          form={previewForm}
          open={!!previewForm}
          onOpenChange={(open) => !open && setPreviewForm(null)}
        />
      )}
    </div>
  );
}
