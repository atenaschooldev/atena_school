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
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
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
  RefreshCw,
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
  Search,
} from "lucide-react";

export function FormFieldsView() {
  const { t, locale } = useTranslation();
  const {
    fields,
    isLoading,
    refetch,
    createField,
    updateField,
    deleteField,
    isCreating,
    isUpdating,
    isDeleting,
  } = useFormFields();

  // Search & Filter state
  const [globalFilter, setGlobalFilter] = useState("");
  const [targetFilter, setTargetFilter] = useState<string>("all");
  const [systemFilter, setSystemFilter] = useState<string>("all");
  const [sorting, setSorting] = useState<SortingState>([
    { id: "sort_order", desc: false },
  ]);

  // Modal states
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingField, setEditingField] = useState<FormFieldItem | null>(null);
  const [fieldToDelete, setFieldToDelete] = useState<FormFieldItem | null>(null);

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
          label: locale === "en" ? "Purchaser" : "Acquirente",
          badgeClass: "bg-blue-50 text-blue-700 dark:bg-blue-950/50 dark:text-blue-300 border-blue-200 dark:border-blue-800",
          icon: <User className="w-3.5 h-3.5 mr-1 text-blue-500" />,
        };
      case FormFieldTarget.STUDENT:
        return {
          label: locale === "en" ? "Student" : "Studente",
          badgeClass: "bg-emerald-50 text-emerald-700 dark:bg-emerald-950/50 dark:text-emerald-300 border-emerald-200 dark:border-emerald-800",
          icon: <Users className="w-3.5 h-3.5 mr-1 text-emerald-500" />,
        };
      case FormFieldTarget.BOOKING:
        return {
          label: locale === "en" ? "Booking" : "Iscrizione",
          badgeClass: "bg-purple-50 text-purple-700 dark:bg-purple-950/50 dark:text-purple-300 border-purple-200 dark:border-purple-800",
          icon: <Calendar className="w-3.5 h-3.5 mr-1 text-purple-500" />,
        };
      case FormFieldTarget.CONTACT:
        return {
          label: locale === "en" ? "Contact Form" : "Modulo Contatto",
          badgeClass: "bg-amber-50 text-amber-700 dark:bg-amber-950/50 dark:text-amber-300 border-amber-200 dark:border-amber-800",
          icon: <Mail className="w-3.5 h-3.5 mr-1 text-amber-500" />,
        };
      default:
        return {
          label: target,
          badgeClass: "bg-muted text-muted-foreground",
          icon: <Layers className="w-3.5 h-3.5 mr-1" />,
        };
    }
  };

  const getFieldTypeIcon = (type: FormFieldType) => {
    switch (type) {
      case FormFieldType.TEXT:
        return <FileText className="w-3.5 h-3.5 text-muted-foreground mr-1.5" />;
      case FormFieldType.EMAIL:
        return <Mail className="w-3.5 h-3.5 text-blue-500 mr-1.5" />;
      case FormFieldType.PHONE:
        return <Phone className="w-3.5 h-3.5 text-emerald-500 mr-1.5" />;
      case FormFieldType.NUMBER:
        return <Hash className="w-3.5 h-3.5 text-amber-500 mr-1.5" />;
      case FormFieldType.SELECT:
        return <List className="w-3.5 h-3.5 text-indigo-500 mr-1.5" />;
      case FormFieldType.CHECKBOX:
        return <CheckSquare className="w-3.5 h-3.5 text-green-500 mr-1.5" />;
      case FormFieldType.RADIO:
        return <List className="w-3.5 h-3.5 text-violet-500 mr-1.5" />;
      case FormFieldType.TEXTAREA:
        return <FileText className="w-3.5 h-3.5 text-orange-500 mr-1.5" />;
      case FormFieldType.DATE:
        return <Calendar className="w-3.5 h-3.5 text-pink-500 mr-1.5" />;
      default:
        return <HelpCircle className="w-3.5 h-3.5 text-muted-foreground mr-1.5" />;
    }
  };

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

      if (globalFilter.trim()) {
        const q = globalFilter.toLowerCase();
        const matchKey = f.key.toLowerCase().includes(q);
        const matchIt = f.label_it.toLowerCase().includes(q);
        const matchEn = f.label_en.toLowerCase().includes(q);
        return matchKey || matchIt || matchEn;
      }
      return true;
    });
  }, [fields, targetFilter, systemFilter, globalFilter]);

  // Columns definition
  const columns = useMemo<ColumnDef<FormFieldItem>[]>(
    () => [
      {
        accessorKey: "sort_order",
        header: "#",
        size: 50,
        cell: ({ row }) => (
          <span className="font-mono text-xs text-muted-foreground">
            {row.original.sort_order ?? 0}
          </span>
        ),
      },
      {
        accessorKey: "key",
        header: locale === "en" ? "Field Key & Label" : "Chiave & Etichetta",
        cell: ({ row }) => {
          const item = row.original;
          return (
            <div className="flex flex-col gap-0.5">
              <div className="flex items-center gap-2">
                <span className="font-medium text-sm text-foreground">
                  {locale === "en" ? item.label_en : item.label_it}
                </span>
                {item.is_system ? (
                  <Badge variant="outline" className="text-[10px] px-1.5 py-0 bg-muted/60 text-muted-foreground border-border/80 flex items-center gap-1">
                    <Lock className="w-2.5 h-2.5" />
                    {locale === "en" ? "System" : "Sistema"}
                  </Badge>
                ) : (
                  <Badge variant="outline" className="text-[10px] px-1.5 py-0 bg-primary/10 text-primary border-primary/20">
                    {locale === "en" ? "Custom" : "Personalizzato"}
                  </Badge>
                )}
              </div>
              <span className="font-mono text-xs text-muted-foreground">
                {item.key}
              </span>
            </div>
          );
        },
      },
      {
        accessorKey: "target",
        header: locale === "en" ? "Target" : "Destinazione",
        size: 150,
        cell: ({ row }) => {
          const meta = getTargetMeta(row.original.target);
          return (
            <Badge variant="outline" className={`text-xs font-normal border flex items-center w-fit ${meta.badgeClass}`}>
              {meta.icon}
              {meta.label}
            </Badge>
          );
        },
      },
      {
        accessorKey: "field_type",
        header: locale === "en" ? "Type" : "Tipo",
        size: 140,
        cell: ({ row }) => {
          const type = row.original.field_type;
          const dict = FORM_FIELD_TYPE_DICTIONARY[type];
          const label = dict ? (locale === "en" ? dict.label_en : dict.label_it) : type;
          return (
            <div className="flex items-center text-xs text-foreground/90">
              {getFieldTypeIcon(type)}
              <span>{label}</span>
            </div>
          );
        },
      },
      {
        accessorKey: "is_required_default",
        header: locale === "en" ? "Required by Default" : "Obbligatorio Base",
        size: 140,
        cell: ({ row }) => {
          const isReq = row.original.is_required_default;
          return (
            <span
              className={`inline-flex items-center px-2 py-0.5 rounded-full text-[11px] font-medium ${
                isReq
                  ? "bg-amber-100 text-amber-800 dark:bg-amber-950/60 dark:text-amber-300"
                  : "bg-muted text-muted-foreground"
              }`}
            >
              {isReq ? (locale === "en" ? "Required" : "Obbligatorio") : (locale === "en" ? "Optional" : "Facoltativo")}
            </span>
          );
        },
      },
      {
        id: "actions",
        header: () => <div className="text-right">{locale === "en" ? "Actions" : "Azioni"}</div>,
        size: 100,
        cell: ({ row }) => {
          const item = row.original;
          return (
            <div className="flex items-center justify-end gap-1">
              <Button
                variant="ghost"
                size="sm"
                className="h-8 w-8 p-0 text-muted-foreground hover:text-foreground"
                onClick={() => handleOpenEdit(item)}
                title={locale === "en" ? "Edit field" : "Modifica campo"}
              >
                <Pencil className="w-4 h-4" />
              </Button>
              {!item.is_system && (
                <Button
                  variant="ghost"
                  size="sm"
                  className="h-8 w-8 p-0 text-destructive/80 hover:text-destructive hover:bg-destructive/10"
                  onClick={() => setFieldToDelete(item)}
                  title={locale === "en" ? "Delete field" : "Elimina campo"}
                >
                  <Trash2 className="w-4 h-4" />
                </Button>
              )}
            </div>
          );
        },
      },
    ],
    [locale]
  );

  const table = useReactTable({
    data: filteredData,
    columns,
    state: {
      sorting,
    },
    onSortingChange: setSorting,
    getCoreRowModel: getCoreRowModel(),
    getSortedRowModel: getSortedRowModel(),
    getPaginationRowModel: getPaginationRowModel(),
    initialState: {
      pagination: {
        pageSize: 20,
      },
    },
  });

  return (
    <div className="space-y-4">
      {/* Top Header Card */}
      <Card className="border-border/60 shadow-sm">
        <CardHeader className="pb-3">
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
            <div>
              <CardTitle className="text-lg font-semibold flex items-center gap-2">
                <Layers className="w-5 h-5 text-primary" />
                {locale === "en" ? "Form Fields Catalog" : "Catalogo Campi Moduli"}
              </CardTitle>
              <CardDescription className="text-sm mt-1">
                {locale === "en"
                  ? "Centralized database catalog of system and custom form fields for booking and contact forms."
                  : "Catalogo centralizzato dei campi di sistema e personalizzati per i moduli di iscrizione e contatto."}
              </CardDescription>
            </div>
            <div className="flex items-center gap-2">
              <Button
                variant="outline"
                size="sm"
                onClick={() => refetch()}
                disabled={isLoading}
                className="h-9 gap-1.5"
              >
                <RefreshCw className={`w-3.5 h-3.5 ${isLoading ? "animate-spin" : ""}`} />
                {locale === "en" ? "Refresh" : "Aggiorna"}
              </Button>
              <Button
                size="sm"
                onClick={handleOpenCreate}
                className="h-9 gap-1.5 bg-primary text-primary-foreground hover:bg-primary/90 shadow-sm"
              >
                <Plus className="w-4 h-4" />
                {locale === "en" ? "New Custom Field" : "Nuovo Campo"}
              </Button>
            </div>
          </div>
        </CardHeader>
        <CardContent className="pt-0">
          {/* Filters and search toolbar */}
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-3 pt-2 border-t border-border/40">
            <div className="flex items-center gap-2 flex-1 max-w-sm">
              <div className="relative w-full">
                <Search className="w-4 h-4 absolute left-2.5 top-1/2 -translate-y-1/2 text-muted-foreground" />
                <Input
                  placeholder={locale === "en" ? "Search key or label..." : "Cerca chiave o etichetta..."}
                  value={globalFilter}
                  onChange={(e) => setGlobalFilter(e.target.value)}
                  className="pl-8 h-9 text-sm"
                />
              </div>
            </div>

            <div className="flex flex-wrap items-center gap-2">
              {/* Target filter */}
              <div className="flex items-center gap-1 bg-muted/60 p-1 rounded-lg border border-border/50 text-xs">
                <span className="px-2 font-medium text-muted-foreground">
                  {locale === "en" ? "Target:" : "Destinazione:"}
                </span>
                <Button
                  variant={targetFilter === "all" ? "secondary" : "ghost"}
                  size="sm"
                  onClick={() => setTargetFilter("all")}
                  className="h-7 px-2.5 text-xs font-normal"
                >
                  {locale === "en" ? "All" : "Tutti"} ({fields.length})
                </Button>
                <Button
                  variant={targetFilter === FormFieldTarget.PURCHASER ? "secondary" : "ghost"}
                  size="sm"
                  onClick={() => setTargetFilter(FormFieldTarget.PURCHASER)}
                  className="h-7 px-2.5 text-xs font-normal"
                >
                  {locale === "en" ? "Purchaser" : "Acquirente"}
                </Button>
                <Button
                  variant={targetFilter === FormFieldTarget.STUDENT ? "secondary" : "ghost"}
                  size="sm"
                  onClick={() => setTargetFilter(FormFieldTarget.STUDENT)}
                  className="h-7 px-2.5 text-xs font-normal"
                >
                  {locale === "en" ? "Student" : "Studente"}
                </Button>
                <Button
                  variant={targetFilter === FormFieldTarget.BOOKING ? "secondary" : "ghost"}
                  size="sm"
                  onClick={() => setTargetFilter(FormFieldTarget.BOOKING)}
                  className="h-7 px-2.5 text-xs font-normal"
                >
                  {locale === "en" ? "Booking" : "Iscrizione"}
                </Button>
                <Button
                  variant={targetFilter === FormFieldTarget.CONTACT ? "secondary" : "ghost"}
                  size="sm"
                  onClick={() => setTargetFilter(FormFieldTarget.CONTACT)}
                  className="h-7 px-2.5 text-xs font-normal"
                >
                  {locale === "en" ? "Contact" : "Contatto"}
                </Button>
              </div>

              {/* System/Custom filter */}
              <div className="flex items-center gap-1 bg-muted/60 p-1 rounded-lg border border-border/50 text-xs">
                <Button
                  variant={systemFilter === "all" ? "secondary" : "ghost"}
                  size="sm"
                  onClick={() => setSystemFilter("all")}
                  className="h-7 px-2 text-xs font-normal"
                >
                  {locale === "en" ? "All Types" : "Tutti"}
                </Button>
                <Button
                  variant={systemFilter === "system" ? "secondary" : "ghost"}
                  size="sm"
                  onClick={() => setSystemFilter("system")}
                  className="h-7 px-2 text-xs font-normal gap-1"
                >
                  <Lock className="w-3 h-3" />
                  {locale === "en" ? "System" : "Sistema"}
                </Button>
                <Button
                  variant={systemFilter === "custom" ? "secondary" : "ghost"}
                  size="sm"
                  onClick={() => setSystemFilter("custom")}
                  className="h-7 px-2 text-xs font-normal"
                >
                  {locale === "en" ? "Custom" : "Personalizzati"}
                </Button>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Main Table */}
      <Card className="border-border/60 shadow-sm overflow-hidden">
        <div className="overflow-x-auto">
          <Table>
            <TableHeader className="bg-muted/40">
              {table.getHeaderGroups().map((headerGroup) => (
                <TableRow key={headerGroup.id}>
                  {headerGroup.headers.map((header) => (
                    <TableHead key={header.id} style={{ width: header.getSize() }}>
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
                <TableSkeletonRows columns={6} rows={6} />
              ) : table.getRowModel().rows.length > 0 ? (
                table.getRowModel().rows.map((row) => (
                  <TableRow key={row.id} className="hover:bg-muted/30 transition-colors">
                    {row.getVisibleCells().map((cell) => (
                      <TableCell key={cell.id} className="py-2.5">
                        {flexRender(cell.column.columnDef.cell, cell.getContext())}
                      </TableCell>
                    ))}
                  </TableRow>
                ))
              ) : (
                <TableRow>
                  <TableCell colSpan={6} className="h-32 text-center text-muted-foreground">
                    {locale === "en" ? "No fields found matching criteria." : "Nessun campo trovato con i criteri specificati."}
                  </TableCell>
                </TableRow>
              )}
            </TableBody>
          </Table>
        </div>
        <div className="p-3 border-t border-border/40">
          <DataTablePagination table={table} />
        </div>
      </Card>

      {/* Create / Edit Modal */}
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
                      key: e.target.value.toLowerCase().replace(/[^a-z0-9_]/g, "_"),
                    })
                  }
                  placeholder="es. codice_sdi, heard_from, study_level"
                  disabled={!!editingField}
                  required
                  className="mt-1.5 font-mono text-sm"
                />
                {editingField?.is_system && (
                  <p className="text-[11px] text-muted-foreground mt-1 flex items-center gap-1">
                    <Lock className="w-3 h-3 text-muted-foreground" />
                    {locale === "en"
                      ? "System keys cannot be modified to protect database and booking integrity."
                      : "Le chiavi di sistema non possono essere modificate per garantire l'integrità del database."}
                  </p>
                )}
              </div>

              {/* Labels IT / EN */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <Label htmlFor="label_it" className="text-xs font-semibold">
                    {locale === "en" ? "Label (Italian)" : "Etichetta (Italiano)"}
                    <span className="text-destructive ml-1">*</span>
                  </Label>
                  <Input
                    id="label_it"
                    value={formData.label_it}
                    onChange={(e) => setFormData({ ...formData, label_it: e.target.value })}
                    placeholder="es. Livello di partenza"
                    required
                    className="mt-1.5 text-sm"
                  />
                </div>
                <div>
                  <Label htmlFor="label_en" className="text-xs font-semibold">
                    {locale === "en" ? "Label (English)" : "Etichetta (Inglese)"}
                    <span className="text-destructive ml-1">*</span>
                  </Label>
                  <Input
                    id="label_en"
                    value={formData.label_en}
                    onChange={(e) => setFormData({ ...formData, label_en: e.target.value })}
                    placeholder="e.g. Starting level"
                    required
                    className="mt-1.5 text-sm"
                  />
                </div>
              </div>

              {/* Placeholders IT / EN */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <Label htmlFor="placeholder_it" className="text-xs font-semibold text-muted-foreground">
                    {locale === "en" ? "Placeholder (Italian)" : "Segnaposto (Italiano)"}
                  </Label>
                  <Input
                    id="placeholder_it"
                    value={formData.placeholder_it}
                    onChange={(e) => setFormData({ ...formData, placeholder_it: e.target.value })}
                    placeholder="es. Seleziona una voce..."
                    className="mt-1.5 text-sm"
                  />
                </div>
                <div>
                  <Label htmlFor="placeholder_en" className="text-xs font-semibold text-muted-foreground">
                    {locale === "en" ? "Placeholder (English)" : "Segnaposto (Inglese)"}
                  </Label>
                  <Input
                    id="placeholder_en"
                    value={formData.placeholder_en}
                    onChange={(e) => setFormData({ ...formData, placeholder_en: e.target.value })}
                    placeholder="e.g. Select an option..."
                    className="mt-1.5 text-sm"
                  />
                </div>
              </div>

              {/* Target & Field Type */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <Label htmlFor="target" className="text-xs font-semibold">
                    {locale === "en" ? "Target Entity" : "Destinazione Campo"}
                  </Label>
                  <select
                    id="target"
                    value={formData.target}
                    onChange={(e) => setFormData({ ...formData, target: e.target.value as FormFieldTarget })}
                    className="w-full mt-1.5 h-9 rounded-md border border-input bg-background px-3 py-1 text-sm shadow-sm focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring"
                  >
                    <option value={FormFieldTarget.PURCHASER}>
                      {locale === "en" ? "Purchaser / Parent" : "Acquirente / Genitore"}
                    </option>
                    <option value={FormFieldTarget.STUDENT}>
                      {locale === "en" ? "Student / Child" : "Studente / Figlio"}
                    </option>
                    <option value={FormFieldTarget.BOOKING}>
                      {locale === "en" ? "Booking / General" : "Iscrizione / Generale"}
                    </option>
                    <option value={FormFieldTarget.CONTACT}>
                      {locale === "en" ? "Contact Form" : "Modulo Contatto"}
                    </option>
                  </select>
                </div>

                <div>
                  <Label htmlFor="field_type" className="text-xs font-semibold">
                    {locale === "en" ? "Field Type" : "Tipo di Campo"}
                  </Label>
                  <select
                    id="field_type"
                    value={formData.field_type}
                    onChange={(e) => setFormData({ ...formData, field_type: e.target.value as FormFieldType })}
                    className="w-full mt-1.5 h-9 rounded-md border border-input bg-background px-3 py-1 text-sm shadow-sm focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring"
                  >
                    {Object.values(FormFieldType).map((type) => {
                      const entry = FORM_FIELD_TYPE_DICTIONARY[type];
                      return (
                        <option key={type} value={type}>
                          {entry ? (locale === "en" ? entry.label_en : entry.label_it) : type}
                        </option>
                      );
                    })}
                  </select>
                </div>
              </div>

              {/* Dynamic options for select / radio */}
              {(formData.field_type === FormFieldType.SELECT || formData.field_type === FormFieldType.RADIO) && (
                <div className="p-3 bg-muted/40 rounded-lg border border-border/60 space-y-2">
                  <div className="flex items-center justify-between">
                    <Label className="text-xs font-semibold flex items-center gap-1.5">
                      <List className="w-3.5 h-3.5 text-primary" />
                      {locale === "en" ? "Dropdown / Radio Options" : "Opzioni Menu / Scelta"}
                    </Label>
                    <Button
                      type="button"
                      variant="outline"
                      size="sm"
                      onClick={() =>
                        setFormData({
                          ...formData,
                          options: [...formData.options, { label: "", value: "" }],
                        })
                      }
                      className="h-7 text-xs gap-1"
                    >
                      <Plus className="w-3 h-3" />
                      {locale === "en" ? "Add Option" : "Aggiungi Opzione"}
                    </Button>
                  </div>

                  {formData.options.length === 0 && (
                    <p className="text-xs text-muted-foreground italic py-1">
                      {locale === "en" ? "No options configured yet. Click above to add choices." : "Nessuna opzione configurata. Clicca sopra per aggiungerne."}
                    </p>
                  )}

                  <div className="space-y-2 max-h-48 overflow-y-auto pr-1">
                    {formData.options.map((opt, idx) => (
                      <div key={idx} className="flex items-center gap-2">
                        <Input
                          placeholder={locale === "en" ? "Label (e.g. Intermediate B1)" : "Etichetta (es. Intermedio B1)"}
                          value={opt.label}
                          onChange={(e) => {
                            const newOpts = [...formData.options];
                            newOpts[idx].label = e.target.value;
                            if (!newOpts[idx].value) {
                              newOpts[idx].value = e.target.value.toLowerCase().replace(/[^a-z0-9_]/g, "_");
                            }
                            setFormData({ ...formData, options: newOpts });
                          }}
                          className="h-8 text-xs flex-1"
                        />
                        <Input
                          placeholder="value_key"
                          value={opt.value}
                          onChange={(e) => {
                            const newOpts = [...formData.options];
                            newOpts[idx].value = e.target.value;
                            setFormData({ ...formData, options: newOpts });
                          }}
                          className="h-8 text-xs font-mono w-1/3"
                        />
                        <Button
                          type="button"
                          variant="ghost"
                          size="sm"
                          onClick={() => {
                            const newOpts = formData.options.filter((_, i) => i !== idx);
                            setFormData({ ...formData, options: newOpts });
                          }}
                          className="h-8 w-8 p-0 text-muted-foreground hover:text-destructive"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                        </Button>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* Required by default & Sort Order */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 pt-2 border-t border-border/40">
                <div className="flex items-center justify-between p-2.5 rounded-lg border border-border/50 bg-muted/20">
                  <div>
                    <Label htmlFor="req_def" className="text-xs font-semibold cursor-pointer">
                      {locale === "en" ? "Required by Default" : "Obbligatorio Base"}
                    </Label>
                    <p className="text-[11px] text-muted-foreground">
                      {locale === "en" ? "Set as mandatory in newly created forms" : "Predefinisce il campo come obbligatorio"}
                    </p>
                  </div>
                  <Switch
                    id="req_def"
                    checked={formData.is_required_default}
                    onCheckedChange={(c) => setFormData({ ...formData, is_required_default: c })}
                  />
                </div>

                <div>
                  <Label htmlFor="sort_order" className="text-xs font-semibold">
                    {locale === "en" ? "Sort Order Weight" : "Peso Ordinamento"}
                  </Label>
                  <Input
                    id="sort_order"
                    type="number"
                    value={formData.sort_order}
                    onChange={(e) => setFormData({ ...formData, sort_order: Number(e.target.value) })}
                    className="mt-1.5 text-sm font-mono h-9"
                  />
                </div>
              </div>
            </div>

            <DialogFooter className="gap-2 sm:gap-0 pt-2 border-t border-border/40">
              <Button type="button" variant="outline" onClick={() => setIsModalOpen(false)}>
                {locale === "en" ? "Cancel" : "Annulla"}
              </Button>
              <Button
                type="submit"
                disabled={isCreating || isUpdating}
                className="bg-primary text-primary-foreground hover:bg-primary/90"
              >
                {isCreating || isUpdating ? (
                  <RefreshCw className="w-4 h-4 animate-spin mr-1.5" />
                ) : (
                  <Sparkles className="w-4 h-4 mr-1.5" />
                )}
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

      {/* Delete Confirmation Dialog */}
      <AlertDialog open={!!fieldToDelete} onOpenChange={(open) => !open && setFieldToDelete(null)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>
              {locale === "en" ? "Delete Form Field?" : "Eliminare il campo?"}
            </AlertDialogTitle>
            <AlertDialogDescription>
              {locale === "en"
                ? `Are you sure you want to permanently delete "${fieldToDelete?.label_en || fieldToDelete?.key}"? This action cannot be undone.`
                : `Sei sicuro di voler eliminare definitivamente il campo "${fieldToDelete?.label_it || fieldToDelete?.key}"? L'azione non può essere annullata.`}
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>{locale === "en" ? "Cancel" : "Annulla"}</AlertDialogCancel>
            <AlertDialogAction
              className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
              onClick={async () => {
                if (fieldToDelete) {
                  await deleteField(fieldToDelete.id);
                  setFieldToDelete(null);
                }
              }}
              disabled={isDeleting}
            >
              {isDeleting ? (
                <RefreshCw className="w-4 h-4 animate-spin mr-1.5" />
              ) : (
                <Trash2 className="w-4 h-4 mr-1.5" />
              )}
              {locale === "en" ? "Delete" : "Elimina"}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}
