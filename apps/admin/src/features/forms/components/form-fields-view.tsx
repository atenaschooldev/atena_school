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
import { useFormFields } from "../hooks/use-form-fields";
import {
  type FormFieldItem,
  type CreateFormFieldDto,
  type UpdateFormFieldDto,
  FormFieldType,
  FormFieldTarget,
  FORM_FIELD_TYPE_DICTIONARY,
  FORM_FIELD_TARGET_DICTIONARY,
} from "../types";
import { useTranslation } from "@/i18n/context";

// UI Components
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { Checkbox } from "@/components/ui/checkbox";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { DeleteConfirmDialog } from "@/components/delete-confirm-dialog";
import { DataViewToolbar } from "@/components/shared/data-view-toolbar";
import { DataTablePagination } from "@/components/ui/data-table-pagination";
import { TableSkeletonRows } from "@/components/ui/table-skeleton";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  Plus,
  Pencil,
  Trash2,
  Lock,
  Sparkles,
  User,
  Users,
  Calendar,
  Mail,
  Phone,
  Hash,
  List,
  CheckSquare,
  FileText,
  HelpCircle,
  Layers,
  ArrowDown,
  ArrowUp,
  ArrowUpDown,
  Settings,
} from "lucide-react";

export function FormFieldsView() {
  const { t, locale } = useTranslation();
  const {
    fields,
    isLoading,
    createField,
    updateField,
    deleteField,
    isCreating,
    isUpdating,
    isDeleting,
  } = useFormFields();

  // Search & Filter state
  const [searchQuery, setSearchQuery] = useState("");
  const [targetFilter, setTargetFilter] = useState<string>("all");
  const [systemFilter, setSystemFilter] = useState<string>("all");
  const [viewMode, setViewMode] = useState<"table" | "grid">("table");
  const [sorting, setSorting] = useState<SortingState>([
    { id: "sort_order", desc: false },
  ]);

  // Modal states
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingField, setEditingField] = useState<FormFieldItem | null>(null);
  const [deletingField, setDeletingField] = useState<FormFieldItem | null>(null);

  // Form state inside modal
  const [formData, setFormData] = useState<{
    key: string;
    label_it: string;
    label_en: string;
    placeholder_it: string;
    placeholder_en: string;
    field_type: FormFieldType;
    target: FormFieldTarget;
    is_required_default: boolean;
    sort_order: number;
    options: { label: string; value: string }[];
  }>({
    key: "",
    label_it: "",
    label_en: "",
    placeholder_it: "",
    placeholder_en: "",
    field_type: FormFieldType.TEXT,
    target: FormFieldTarget.PURCHASER,
    is_required_default: false,
    sort_order: 0,
    options: [],
  });

  const getTargetMeta = (target: FormFieldTarget) => {
    switch (target) {
      case FormFieldTarget.PURCHASER:
        return {
          label: locale === "en" ? "Purchaser / Parent" : "Acquirente / Genitore",
          shortLabel: locale === "en" ? "Purchaser" : "Acquirente",
          badgeClass: "bg-blue-500/10 text-blue-600 dark:text-blue-400 border-blue-500/20",
          icon: <User className="w-3.5 h-3.5 mr-1 text-blue-500" />,
        };
      case FormFieldTarget.STUDENT:
        return {
          label: locale === "en" ? "Student / Child" : "Studente / Figlio",
          shortLabel: locale === "en" ? "Student" : "Studente",
          badgeClass: "bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border-emerald-500/20",
          icon: <Users className="w-3.5 h-3.5 mr-1 text-emerald-500" />,
        };
      case FormFieldTarget.BOOKING:
        return {
          label: locale === "en" ? "Booking / Course" : "Iscrizione / Corso",
          shortLabel: locale === "en" ? "Booking" : "Iscrizione",
          badgeClass: "bg-purple-500/10 text-purple-600 dark:text-purple-400 border-purple-500/20",
          icon: <Calendar className="w-3.5 h-3.5 mr-1 text-purple-500" />,
        };
      case FormFieldTarget.CONTACT:
        return {
          label: locale === "en" ? "Contact Lead" : "Modulo Contatto",
          shortLabel: locale === "en" ? "Contact" : "Contatto",
          badgeClass: "bg-amber-500/10 text-amber-600 dark:text-amber-400 border-amber-500/20",
          icon: <Mail className="w-3.5 h-3.5 mr-1 text-amber-500" />,
        };
      default:
        return {
          label: target,
          shortLabel: target,
          badgeClass: "bg-muted text-muted-foreground border-border",
          icon: <Layers className="w-3.5 h-3.5 mr-1" />,
        };
    }
  };

  const getFieldTypeMeta = (type: FormFieldType) => {
    const dict = FORM_FIELD_TYPE_DICTIONARY[type];
    const label = dict ? (locale === "en" ? dict.label_en : dict.label_it) : type;
    switch (type) {
      case FormFieldType.TEXT:
        return { label, icon: <FileText className="w-3.5 h-3.5 text-muted-foreground mr-1.5" /> };
      case FormFieldType.EMAIL:
        return { label, icon: <Mail className="w-3.5 h-3.5 text-blue-500 mr-1.5" /> };
      case FormFieldType.PHONE:
        return { label, icon: <Phone className="w-3.5 h-3.5 text-emerald-500 mr-1.5" /> };
      case FormFieldType.NUMBER:
        return { label, icon: <Hash className="w-3.5 h-3.5 text-amber-500 mr-1.5" /> };
      case FormFieldType.SELECT:
        return { label, icon: <List className="w-3.5 h-3.5 text-indigo-500 mr-1.5" /> };
      case FormFieldType.CHECKBOX:
        return { label, icon: <CheckSquare className="w-3.5 h-3.5 text-green-500 mr-1.5" /> };
      case FormFieldType.RADIO:
        return { label, icon: <List className="w-3.5 h-3.5 text-violet-500 mr-1.5" /> };
      case FormFieldType.TEXTAREA:
        return { label, icon: <FileText className="w-3.5 h-3.5 text-orange-500 mr-1.5" /> };
      case FormFieldType.DATE:
        return { label, icon: <Calendar className="w-3.5 h-3.5 text-pink-500 mr-1.5" /> };
      default:
        return { label, icon: <HelpCircle className="w-3.5 h-3.5 text-muted-foreground mr-1.5" /> };
    }
  };

  // Top Metrics computation (identical styling to CoursesMetrics)
  const metricsData = useMemo(() => {
    const total = fields.length;
    const purchaserCount = fields.filter((f) => f.target === FormFieldTarget.PURCHASER).length;
    const studentCount = fields.filter((f) => f.target === FormFieldTarget.STUDENT).length;
    const bookingContactCount = fields.filter((f) => f.target === FormFieldTarget.BOOKING || f.target === FormFieldTarget.CONTACT).length;

    return [
      {
        title: locale === "en" ? "Total Fields" : "Campi Totali",
        value: total,
        description: locale === "en" ? "Registered in database catalog" : "Registrati nel catalogo di sistema",
        icon: Layers,
      },
      {
        title: locale === "en" ? "Purchaser Data" : "Dati Acquirente",
        value: purchaserCount,
        description: locale === "en" ? "Parent / Billing contact fields" : "Anagrafica pagatore / genitore",
        icon: User,
      },
      {
        title: locale === "en" ? "Student Data" : "Dati Studente",
        value: studentCount,
        description: locale === "en" ? "Child / Participant academic fields" : "Livello e anagrafica partecipante",
        icon: Users,
      },
      {
        title: locale === "en" ? "Booking & Leads" : "Iscrizioni & Contatti",
        value: bookingContactCount,
        description: locale === "en" ? "Form questions & lead inquiries" : "Note corso e form del sito",
        icon: Calendar,
      },
    ];
  }, [fields, locale]);

  // Open Create Modal
  const handleOpenCreate = () => {
    setEditingField(null);
    setFormData({
      key: "",
      label_it: "",
      label_en: "",
      placeholder_it: "",
      placeholder_en: "",
      field_type: FormFieldType.TEXT,
      target: FormFieldTarget.PURCHASER,
      is_required_default: false,
      sort_order: (fields.length + 1) * 10,
      options: [],
    });
    setIsModalOpen(true);
  };

  // Open Edit Modal
  const handleOpenEdit = (field: FormFieldItem) => {
    setEditingField(field);
    setFormData({
      key: field.key,
      label_it: field.label_it,
      label_en: field.label_en,
      placeholder_it: field.placeholder_it || "",
      placeholder_en: field.placeholder_en || "",
      field_type: field.field_type,
      target: field.target,
      is_required_default: field.is_required_default,
      sort_order: field.sort_order ?? 0,
      options: Array.isArray(field.options) ? [...field.options] : [],
    });
    setIsModalOpen(true);
  };

  // Save (Create or Update)
  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.label_it.trim() || !formData.label_en.trim()) return;

    if (editingField) {
      await updateField(editingField.id, {
        label_it: formData.label_it,
        label_en: formData.label_en,
        placeholder_it: formData.placeholder_it,
        placeholder_en: formData.placeholder_en,
        field_type: formData.field_type,
        target: formData.target,
        is_required_default: formData.is_required_default,
        sort_order: Number(formData.sort_order) || 0,
        options: formData.options,
      });
    } else {
      if (!formData.key.trim()) return;
      await createField({
        key: formData.key,
        label_it: formData.label_it,
        label_en: formData.label_en,
        placeholder_it: formData.placeholder_it,
        placeholder_en: formData.placeholder_en,
        field_type: formData.field_type,
        target: formData.target,
        is_required_default: formData.is_required_default,
        sort_order: Number(formData.sort_order) || 0,
        options: formData.options,
      });
    }
    setIsModalOpen(false);
  };

  // Filtered data
  const filteredData = useMemo(() => {
    return fields.filter((f) => {
      if (targetFilter !== "all" && f.target !== targetFilter) return false;
      if (systemFilter === "system" && !f.is_system) return false;
      if (systemFilter === "custom" && f.is_system) return false;

      if (searchQuery.trim()) {
        const q = searchQuery.toLowerCase().trim();
        const matchKey = (f.key || "").toLowerCase().includes(q);
        const matchIt = (f.label_it || "").toLowerCase().includes(q);
        const matchEn = (f.label_en || "").toLowerCase().includes(q);
        return matchKey || matchIt || matchEn;
      }
      return true;
    });
  }, [fields, targetFilter, systemFilter, searchQuery]);

  // Columns definition (matching exact Courses & Settings table pattern)
  const columns = useMemo<ColumnDef<FormFieldItem>[]>(
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
        accessorKey: "sort_order",
        header: ({ column }) => (
          <Button
            variant="ghost"
            size="sm"
            className="-ml-3 h-8 cursor-pointer font-semibold text-xs text-muted-foreground hover:bg-accent/50"
            onClick={() => column.toggleSorting(column.getIsSorted() === "asc")}
          >
            <span>#</span>
            {column.getIsSorted() === "desc" ? (
              <ArrowDown className="ml-1.5 h-3.5 w-3.5 text-primary" />
            ) : column.getIsSorted() === "asc" ? (
              <ArrowUp className="ml-1.5 h-3.5 w-3.5 text-primary" />
            ) : (
              <ArrowUpDown className="ml-1.5 h-3.5 w-3.5 opacity-50" />
            )}
          </Button>
        ),
        cell: ({ row }) => (
          <span className="font-mono text-xs text-muted-foreground font-semibold">
            #{row.original.sort_order ?? 0}
          </span>
        ),
        size: 60,
      },
      {
        accessorKey: "label_it",
        header: ({ column }) => (
          <Button
            variant="ghost"
            size="sm"
            className="-ml-3 h-8 cursor-pointer font-semibold text-xs text-muted-foreground hover:bg-accent/50"
            onClick={() => column.toggleSorting(column.getIsSorted() === "asc")}
          >
            <span>{locale === "en" ? "Field Name & Key" : "Nome Campo & Chiave"}</span>
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
          const item = row.original;
          const targetMeta = getTargetMeta(item.target);
          const iconColorClass = item.target === FormFieldTarget.PURCHASER
            ? "bg-blue-500/10 text-blue-600 dark:text-blue-400 border-blue-500/20"
            : item.target === FormFieldTarget.STUDENT
            ? "bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border-emerald-500/20"
            : item.target === FormFieldTarget.BOOKING
            ? "bg-purple-500/10 text-purple-600 dark:text-purple-400 border-purple-500/20"
            : "bg-amber-500/10 text-amber-600 dark:text-amber-400 border-amber-500/20";

          return (
            <div className="flex items-center gap-3 min-w-[240px]">
              <div className={`h-9 w-9 rounded-lg flex items-center justify-center font-bold text-xs shrink-0 border ${iconColorClass}`}>
                {targetMeta.icon}
              </div>
              <div className="flex flex-col gap-0.5 min-w-0">
                <div className="flex items-center gap-1.5 flex-wrap">
                  <span className="font-bold text-sm text-foreground truncate">
                    {locale === "en" ? item.label_en : item.label_it}
                  </span>
                  {item.is_system && (
                    <Badge variant="outline" className="text-[10px] px-1.5 py-0 bg-muted/60 text-muted-foreground border-border/80 flex items-center gap-0.5 font-medium shrink-0">
                      <Lock className="w-2.5 h-2.5" />
                      {locale === "en" ? "System" : "Sistema"}
                    </Badge>
                  )}
                </div>
                <div className="flex items-center gap-2 text-xs text-muted-foreground">
                  <code className="font-mono bg-muted/50 px-1.5 py-0.5 rounded text-[11px] text-foreground/80 border border-border/40">
                    {item.key}
                  </code>
                  {item.placeholder_it && (
                    <span className="italic text-[11px] text-muted-foreground/70 truncate max-w-[200px]">
                      «{locale === "en" && item.placeholder_en ? item.placeholder_en : item.placeholder_it}»
                    </span>
                  )}
                </div>
              </div>
            </div>
          );
        },
      },
      {
        accessorKey: "target",
        header: ({ column }) => (
          <Button
            variant="ghost"
            size="sm"
            className="-ml-3 h-8 cursor-pointer font-semibold text-xs text-muted-foreground hover:bg-accent/50"
            onClick={() => column.toggleSorting(column.getIsSorted() === "asc")}
          >
            <span>{locale === "en" ? "Target" : "Destinazione"}</span>
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
          const meta = getTargetMeta(row.original.target);
          return (
            <Badge variant="outline" className={`text-xs font-semibold border flex items-center w-fit py-1 px-2.5 ${meta.badgeClass}`}>
              {meta.icon}
              {meta.label}
            </Badge>
          );
        },
      },
      {
        accessorKey: "field_type",
        header: locale === "en" ? "Field Type" : "Tipo di Dato",
        cell: ({ row }) => {
          const meta = getFieldTypeMeta(row.original.field_type);
          return (
            <div className="flex items-center gap-1.5 text-xs font-medium text-foreground">
              {meta.icon}
              <span>{meta.label}</span>
              {Array.isArray(row.original.options) && row.original.options.length > 0 && (
                <Badge variant="secondary" className="text-[10px] font-mono px-1.5 py-0">
                  {row.original.options.length} opt
                </Badge>
              )}
            </div>
          );
        },
      },
      {
        accessorKey: "is_required_default",
        header: locale === "en" ? "Default Required" : "Obbligatorietà Base",
        cell: ({ row }) => {
          const isReq = row.original.is_required_default;
          return (
            <Badge
              variant="outline"
              className={`text-xs font-medium ${
                isReq
                  ? "border-amber-500/30 text-amber-700 dark:text-amber-300 bg-amber-500/10"
                  : "border-border text-muted-foreground bg-muted/40"
              }`}
            >
              {isReq ? (locale === "en" ? "Required" : "Obbligatorio") : (locale === "en" ? "Optional" : "Facoltativo")}
            </Badge>
          );
        },
      },
      {
        id: "actions",
        header: locale === "en" ? "Actions" : "Azioni",
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
                title={locale === "en" ? "Edit field" : "Modifica campo"}
              >
                <Pencil className="h-4 w-4" />
              </Button>
              {!item.is_system ? (
                <Button
                  variant="ghost"
                  size="icon"
                  className="h-8 w-8 cursor-pointer text-rose-600/70 hover:text-rose-600 dark:hover:text-rose-400"
                  onClick={() => setDeletingField(item)}
                  title={locale === "en" ? "Delete field" : "Elimina campo"}
                >
                  <Trash2 className="h-4 w-4" />
                </Button>
              ) : (
                <Button
                  variant="ghost"
                  size="icon"
                  disabled
                  className="h-8 w-8 text-muted-foreground/30 cursor-not-allowed"
                  title={locale === "en" ? "System field (Protected)" : "Campo di sistema (Protetto)"}
                >
                  <Lock className="h-4 w-4" />
                </Button>
              )}
            </div>
          );
        },
      },
    ],
    [locale, t]
  );

  const table = useReactTable({
    data: filteredData,
    columns,
    state: { sorting },
    onSortingChange: setSorting,
    getCoreRowModel: getCoreRowModel(),
    getSortedRowModel: getSortedRowModel(),
    getPaginationRowModel: getPaginationRowModel(),
    getFilteredRowModel: getFilteredRowModel(),
    initialState: {
      pagination: {
        pageSize: 20,
      },
    },
  });

  return (
    <div className="space-y-4">
      {/* ── Top Metrics Cards ── */}
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

      {/* ── Main DataViewToolbar ── */}
      <DataViewToolbar
        searchQuery={searchQuery}
        onSearchChange={setSearchQuery}
        searchPlaceholder={locale === "en" ? "Search by key, label..." : "Cerca per chiave o nome campo..."}
        filters={[
          {
            value: targetFilter,
            onChange: setTargetFilter,
            placeholder: locale === "en" ? "Target" : "Destinazione",
            options: [
              { value: "all", label: locale === "en" ? "All Targets" : "Tutte le destinazioni" },
              { value: FormFieldTarget.PURCHASER, label: locale === "en" ? "Purchaser / Parent" : "Acquirente / Genitore" },
              { value: FormFieldTarget.STUDENT, label: locale === "en" ? "Student / Child" : "Studente / Figlio" },
              { value: FormFieldTarget.BOOKING, label: locale === "en" ? "Booking / General" : "Iscrizione / Corso" },
              { value: FormFieldTarget.CONTACT, label: locale === "en" ? "Contact Lead" : "Modulo Contatto" },
            ],
          },
          {
            value: systemFilter,
            onChange: setSystemFilter,
            placeholder: locale === "en" ? "Origin" : "Origine",
            options: [
              { value: "all", label: locale === "en" ? "All Types" : "Tutti i tipi" },
              { value: "system", label: locale === "en" ? "System Fields 🔒" : "Campi di Sistema 🔒" },
              { value: "custom", label: locale === "en" ? "Custom Fields ✏️" : "Personalizzati ✏️" },
            ],
          },
        ]}
        actionElement={
          <Button onClick={handleOpenCreate} className="font-medium cursor-pointer shadow-sm text-xs">
            <Plus className="mr-1.5 h-4 w-4" /> {locale === "en" ? "New Field" : "Nuovo Campo"}
          </Button>
        }
        viewMode={viewMode}
        onViewModeChange={setViewMode}
      />

      {/* ── Content: Table or Grid View ── */}
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
                      {locale === "en" ? "No fields found matching criteria." : "Nessun campo trovato con i criteri specificati."}
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
          {filteredData.map((field) => {
            const targetMeta = getTargetMeta(field.target);
            const typeMeta = getFieldTypeMeta(field.field_type);
            return (
              <Card key={field.id} className="border flex flex-col justify-between hover:shadow-sm transition-all">
                <CardHeader className="pb-3 space-y-2">
                  <div className="flex items-start justify-between gap-2">
                    <Badge variant="outline" className={`text-[10px] font-semibold ${targetMeta.badgeClass}`}>
                      {targetMeta.shortLabel}
                    </Badge>
                    <div className="flex items-center gap-1">
                      {field.is_system ? (
                        <Badge variant="outline" className="text-[10px] px-1.5 py-0 bg-muted/60 text-muted-foreground border-border/80 flex items-center gap-0.5 font-medium">
                          <Lock className="w-2.5 h-2.5" />
                          {locale === "en" ? "System" : "Sistema"}
                        </Badge>
                      ) : null}
                    </div>
                  </div>
                  <div>
                    <CardTitle className="text-sm font-bold text-foreground">
                      {locale === "en" ? field.label_en : field.label_it}
                    </CardTitle>
                    <code className="text-[11px] font-mono text-muted-foreground mt-0.5 block">
                      {field.key}
                    </code>
                  </div>
                </CardHeader>
                <CardContent className="space-y-2.5 pb-3 text-xs">
                  <div className="flex items-center justify-between text-muted-foreground">
                    <span>{locale === "en" ? "Type:" : "Tipo:"}</span>
                    <span className="font-medium text-foreground flex items-center">
                      {typeMeta.icon}
                      {typeMeta.label}
                    </span>
                  </div>
                  <div className="flex items-center justify-between text-muted-foreground">
                    <span>{locale === "en" ? "Required:" : "Obbligatorio:"}</span>
                    <span className={`font-semibold ${field.is_required_default ? "text-amber-600 dark:text-amber-400" : "text-muted-foreground"}`}>
                      {field.is_required_default ? (locale === "en" ? "Yes" : "Sì") : (locale === "en" ? "No" : "No")}
                    </span>
                  </div>
                  {field.placeholder_it && (
                    <div className="text-[11px] text-muted-foreground italic truncate">
                      «{field.placeholder_it}»
                    </div>
                  )}
                </CardContent>
                <CardFooter className="pt-2 border-t flex items-center justify-between">
                  <span className="font-mono text-[11px] text-muted-foreground">
                    #{field.sort_order}
                  </span>
                  <div className="flex items-center gap-1">
                    <Button
                      size="sm"
                      variant="ghost"
                      className="h-8 px-2.5 text-xs cursor-pointer text-muted-foreground hover:text-foreground"
                      onClick={() => handleOpenEdit(field)}
                    >
                      <Pencil className="w-3.5 h-3.5 mr-1" />
                      {locale === "en" ? "Edit" : "Modifica"}
                    </Button>
                    {!field.is_system ? (
                      <Button
                        size="sm"
                        variant="ghost"
                        className="h-8 w-8 p-0 cursor-pointer text-rose-600/70 hover:text-rose-600 dark:hover:text-rose-400"
                        onClick={() => setDeletingField(field)}
                      >
                        <Trash2 className="w-4 h-4" />
                      </Button>
                    ) : (
                      <Button
                        size="sm"
                        variant="ghost"
                        disabled
                        className="h-8 w-8 p-0 text-muted-foreground/30 cursor-not-allowed"
                      >
                        <Lock className="w-4 h-4" />
                      </Button>
                    )}
                  </div>
                </CardFooter>
              </Card>
            );
          })}
          {filteredData.length === 0 && (
            <div className="col-span-full py-12 text-center text-sm text-muted-foreground border rounded-md">
              {locale === "en" ? "No fields found matching criteria." : "Nessun campo trovato con i criteri specificati."}
            </div>
          )}
        </div>
      )}

      {/* ── Create / Edit Modal Dialog ── */}
      <Dialog open={isModalOpen} onOpenChange={setIsModalOpen}>
        <DialogContent className="sm:max-w-[620px] max-h-[90vh] overflow-y-auto">
          <form onSubmit={handleSave}>
            <DialogHeader>
              <DialogTitle className="flex items-center gap-2">
                <Sparkles className="w-5 h-5 text-primary" />
                {editingField
                  ? locale === "en"
                    ? "Edit Form Field"
                    : "Modifica Campo Modulo"
                  : locale === "en"
                  ? "New Custom Form Field"
                  : "Nuovo Campo Personalizzato"}
              </DialogTitle>
              <DialogDescription>
                {locale === "en"
                  ? "Define the field properties, bilingual labels, target entity, and type."
                  : "Definisci le proprietà del campo, etichette bilingui, destinazione e tipo di dato."}
              </DialogDescription>
            </DialogHeader>

            <div className="space-y-4 py-4">
              {/* Field Key */}
              <div>
                <Label htmlFor="key" className="text-xs font-semibold">
                  {locale === "en" ? "System Key (Latin unique identifier)" : "Chiave di Sistema (Identificatore univoco)"}
                  <span className="text-destructive ml-1">*</span>
                </Label>
                <Input
                  id="key"
                  value={formData.key}
                  onChange={(e) =>
                    setFormData({
                      ...formData,
                      key: e.target.value.toLowerCase().replace(/[^a-z0-9_]/g, ""),
                    })
                  }
                  placeholder="es. fiscal_number, passport_no"
                  disabled={!!editingField}
                  required
                  className="mt-1 font-mono text-xs"
                />
                {editingField?.is_system && (
                  <p className="text-[11px] text-muted-foreground mt-1 flex items-center gap-1">
                    <Lock className="w-3 h-3 text-amber-500" />
                    {locale === "en"
                      ? "System fields cannot change key name to protect API contracts."
                      : "I campi di sistema non possono modificare la chiave per proteggere i contratti API."}
                  </p>
                )}
              </div>

              {/* Target & Field Type */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <Label className="text-xs font-semibold">
                    {locale === "en" ? "Target Entity" : "Destinazione Dato"}
                    <span className="text-destructive ml-1">*</span>
                  </Label>
                  <Select
                    value={formData.target}
                    onValueChange={(val: FormFieldTarget) => setFormData({ ...formData, target: val })}
                    disabled={editingField?.is_system}
                  >
                    <SelectTrigger className="mt-1 text-xs">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value={FormFieldTarget.PURCHASER}>
                        {locale === "en" ? "Purchaser / Parent (Billing)" : "Acquirente / Genitore (Pagatore)"}
                      </SelectItem>
                      <SelectItem value={FormFieldTarget.STUDENT}>
                        {locale === "en" ? "Student / Child (Participant)" : "Studente / Figlio (Partecipante)"}
                      </SelectItem>
                      <SelectItem value={FormFieldTarget.BOOKING}>
                        {locale === "en" ? "Booking / Course Notes" : "Iscrizione / Corso (Note & Extra)"}
                      </SelectItem>
                      <SelectItem value={FormFieldTarget.CONTACT}>
                        {locale === "en" ? "Contact Form (Website Lead)" : "Modulo Contatto (Richieste Sito)"}
                      </SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <div>
                  <Label className="text-xs font-semibold">
                    {locale === "en" ? "Field Type" : "Tipo di Input"}
                    <span className="text-destructive ml-1">*</span>
                  </Label>
                  <Select
                    value={formData.field_type}
                    onValueChange={(val: FormFieldType) => setFormData({ ...formData, field_type: val })}
                    disabled={editingField?.is_system}
                  >
                    <SelectTrigger className="mt-1 text-xs">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value={FormFieldType.TEXT}>{locale === "en" ? "Text input" : "Campo di testo"}</SelectItem>
                      <SelectItem value={FormFieldType.EMAIL}>{locale === "en" ? "Email address" : "Indirizzo Email"}</SelectItem>
                      <SelectItem value={FormFieldType.PHONE}>{locale === "en" ? "Phone number" : "Numero di Telefono"}</SelectItem>
                      <SelectItem value={FormFieldType.NUMBER}>{locale === "en" ? "Number" : "Numero"}</SelectItem>
                      <SelectItem value={FormFieldType.DATE}>{locale === "en" ? "Date picker" : "Data"}</SelectItem>
                      <SelectItem value={FormFieldType.TEXTAREA}>{locale === "en" ? "Long text (Textarea)" : "Testo lungo (Area di testo)"}</SelectItem>
                      <SelectItem value={FormFieldType.SELECT}>{locale === "en" ? "Dropdown select" : "Menu a tendina (Select)"}</SelectItem>
                      <SelectItem value={FormFieldType.RADIO}>{locale === "en" ? "Radio options" : "Scelta singola (Radio)"}</SelectItem>
                      <SelectItem value={FormFieldType.CHECKBOX}>{locale === "en" ? "Checkbox toggle" : "Casella di controllo (Checkbox)"}</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>

              {/* Bilingual Labels */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="label_it" className="text-xs font-semibold">
                    {locale === "en" ? "Italian Label" : "Etichetta (Italiano)"}
                    <span className="text-destructive ml-1">*</span>
                  </Label>
                  <Input
                    id="label_it"
                    value={formData.label_it}
                    onChange={(e) => setFormData({ ...formData, label_it: e.target.value })}
                    placeholder="es. Livello Linguistico"
                    required
                    className="mt-1 text-xs"
                  />
                </div>
                <div>
                  <Label htmlFor="label_en" className="text-xs font-semibold">
                    {locale === "en" ? "English Label" : "Etichetta (Inglese)"}
                    <span className="text-destructive ml-1">*</span>
                  </Label>
                  <Input
                    id="label_en"
                    value={formData.label_en}
                    onChange={(e) => setFormData({ ...formData, label_en: e.target.value })}
                    placeholder="e.g. Language Level"
                    required
                    className="mt-1 text-xs"
                  />
                </div>
              </div>

              {/* Bilingual Placeholders */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="placeholder_it" className="text-xs font-semibold">
                    {locale === "en" ? "Placeholder (IT)" : "Placeholder (Italiano)"}
                  </Label>
                  <Input
                    id="placeholder_it"
                    value={formData.placeholder_it}
                    onChange={(e) => setFormData({ ...formData, placeholder_it: e.target.value })}
                    placeholder="es. Seleziona il livello..."
                    className="mt-1 text-xs"
                  />
                </div>
                <div>
                  <Label htmlFor="placeholder_en" className="text-xs font-semibold">
                    {locale === "en" ? "Placeholder (EN)" : "Placeholder (Inglese)"}
                  </Label>
                  <Input
                    id="placeholder_en"
                    value={formData.placeholder_en}
                    onChange={(e) => setFormData({ ...formData, placeholder_en: e.target.value })}
                    placeholder="e.g. Select your level..."
                    className="mt-1 text-xs"
                  />
                </div>
              </div>

              {/* Options Builder (for SELECT and RADIO) */}
              {(formData.field_type === FormFieldType.SELECT || formData.field_type === FormFieldType.RADIO) && (
                <div className="space-y-2 border rounded-lg p-3 bg-muted/20">
                  <div className="flex items-center justify-between">
                    <Label className="text-xs font-semibold">
                      {locale === "en" ? "Options list" : "Opzioni di scelta"}
                    </Label>
                    <Button
                      type="button"
                      variant="outline"
                      size="sm"
                      className="h-7 text-xs"
                      onClick={() =>
                        setFormData({
                          ...formData,
                          options: [
                            ...formData.options,
                            { label: `Opzione ${formData.options.length + 1}`, value: `opt_${formData.options.length + 1}` },
                          ],
                        })
                      }
                    >
                      <Plus className="w-3.5 h-3.5 mr-1" />
                      {locale === "en" ? "Add Option" : "Aggiungi Opzione"}
                    </Button>
                  </div>
                  <div className="space-y-2 max-h-40 overflow-y-auto pr-1">
                    {formData.options.map((opt, idx) => (
                      <div key={idx} className="flex items-center gap-2">
                        <Input
                          placeholder="Etichetta"
                          value={opt.label}
                          onChange={(e) => {
                            const next = [...formData.options];
                            next[idx].label = e.target.value;
                            setFormData({ ...formData, options: next });
                          }}
                          className="text-xs h-8"
                        />
                        <Input
                          placeholder="Valore"
                          value={opt.value}
                          onChange={(e) => {
                            const next = [...formData.options];
                            next[idx].value = e.target.value;
                            setFormData({ ...formData, options: next });
                          }}
                          className="text-xs font-mono h-8 w-32 shrink-0"
                        />
                        <Button
                          type="button"
                          variant="ghost"
                          size="sm"
                          className="h-8 w-8 p-0 text-destructive/80 hover:text-destructive"
                          onClick={() => {
                            const next = formData.options.filter((_, i) => i !== idx);
                            setFormData({ ...formData, options: next });
                          }}
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                        </Button>
                      </div>
                    ))}
                    {formData.options.length === 0 && (
                      <p className="text-xs text-muted-foreground italic">
                        {locale === "en" ? "No options configured." : "Nessuna opzione configurata."}
                      </p>
                    )}
                  </div>
                </div>
              )}

              {/* Switches & Sorting */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 pt-2">
                <div className="flex items-center justify-between border rounded-lg p-3 bg-muted/20">
                  <div className="space-y-0.5">
                    <Label className="text-xs font-semibold cursor-pointer">
                      {locale === "en" ? "Required by Default" : "Obbligatorio Base"}
                    </Label>
                    <p className="text-[11px] text-muted-foreground">
                      {locale === "en" ? "Pre-checked when added to forms" : "Pre-impostato come obbligatorio"}
                    </p>
                  </div>
                  <Switch
                    checked={formData.is_required_default}
                    onCheckedChange={(val) => setFormData({ ...formData, is_required_default: val })}
                  />
                </div>

                <div>
                  <Label htmlFor="sort_order" className="text-xs font-semibold">
                    {locale === "en" ? "Sort Order (#)" : "Ordinamento (#)"}
                  </Label>
                  <Input
                    id="sort_order"
                    type="number"
                    value={formData.sort_order}
                    onChange={(e) => setFormData({ ...formData, sort_order: Number(e.target.value) || 0 })}
                    className="mt-1 text-xs"
                  />
                </div>
              </div>
            </div>

            <DialogFooter className="gap-2 sm:gap-0">
              <Button
                type="button"
                variant="outline"
                onClick={() => setIsModalOpen(false)}
                className="cursor-pointer text-xs"
              >
                {locale === "en" ? "Cancel" : "Annulla"}
              </Button>
              <Button
                type="submit"
                disabled={isCreating || isUpdating}
                className="cursor-pointer text-xs font-medium"
              >
                {editingField
                  ? locale === "en"
                    ? "Save Changes"
                    : "Salva Modifiche"
                  : locale === "en"
                  ? "Create Field"
                  : "Crea Campo"}
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>

      {/* ── Delete Confirm Dialog ── */}
      <DeleteConfirmDialog
        open={!!deletingField}
        onOpenChange={(v) => !v && setDeletingField(null)}
        title={locale === "en" ? "Delete Custom Field" : "Elimina Campo Personalizzato"}
        description={
          locale === "en"
            ? `Are you sure you want to delete the field "${deletingField?.label_en || deletingField?.key}"? This cannot be undone.`
            : `Sei sicuro di voler eliminare definitivamente il campo "${deletingField?.label_it || deletingField?.key}"? Questa azione non può essere annullata.`
        }
        onConfirm={async () => {
          if (deletingField) {
            await deleteField(deletingField.id);
            setDeletingField(null);
          }
        }}
      />
    </div>
  );
}
