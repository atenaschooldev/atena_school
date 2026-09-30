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
  parseFormFieldTargets,
  getFieldTargets,
} from "../types";
import { useTranslation } from "@/i18n/context";
import { toast } from "sonner";

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
import { AtenaDataTable } from "@/components/shared/data-table/atena-data-table";
import { DataTableToolbar } from "@/components/shared/data-table/data-table-toolbar";
import { DataTableColumnHeader } from "@/components/shared/data-table/data-table-column-header";
import { CellAvatar } from "@/components/shared/data-table/cells/cell-avatar";
import { CellCopyableId } from "@/components/shared/cell-copyable-id";
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
  Check,
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
    targets: FormFieldTarget[];
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
    targets: [FormFieldTarget.PURCHASER],
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

  // Only show and manage Custom fields in this catalog
  const customFields = useMemo(() => fields.filter((f) => !f.is_system), [fields]);

  // Top Metrics computation (identical styling to CoursesMetrics)
  const metricsData = useMemo(() => {
    const total = customFields.length;
    const purchaserCount = customFields.filter((f) => getFieldTargets(f).includes(FormFieldTarget.PURCHASER)).length;
    const studentCount = customFields.filter((f) => getFieldTargets(f).includes(FormFieldTarget.STUDENT)).length;
    const bookingContactCount = customFields.filter((f) =>
      getFieldTargets(f).some((t) => t === FormFieldTarget.BOOKING || t === FormFieldTarget.CONTACT)
    ).length;

    return [
      {
        title: locale === "en" ? "Custom Fields" : "Campi Personalizzati",
        value: total,
        description: locale === "en" ? "Active custom fields in database" : "Campi personalizzati nel database",
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
  }, [customFields, locale]);

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
      targets: [FormFieldTarget.PURCHASER],
      is_required_default: false,
      sort_order: (fields.length + 1) * 10,
      options: [],
    });
    setIsModalOpen(true);
  };

  // Open Edit Modal
  const handleOpenEdit = (field: FormFieldItem) => {
    setEditingField(field);
    const itemTargets = getFieldTargets(field);
    setFormData({
      key: field.key,
      label_it: field.label_it,
      label_en: field.label_en,
      placeholder_it: field.placeholder_it || "",
      placeholder_en: field.placeholder_en || "",
      field_type: field.field_type,
      targets: itemTargets.length > 0 ? itemTargets : [FormFieldTarget.PURCHASER],
      is_required_default: field.is_required_default,
      sort_order: field.sort_order ?? 0,
      options: Array.isArray(field.options) ? [...field.options] : [],
    });
    setIsModalOpen(true);
  };

  // Save (Create or Update)
  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    const labelIt = formData.label_it.trim();
    if (!labelIt) {
      toast.error(locale === "en" ? "Please enter an Italian label" : "Inserisci l'etichetta in italiano per il campo");
      return;
    }
    if (!formData.targets || formData.targets.length === 0) {
      toast.error(locale === "en" ? "Please select at least one target entity" : "Seleziona almeno una destinazione per il campo");
      return;
    }

    const labelEn = formData.label_en.trim() || labelIt;
    let fieldKey = formData.key.trim().toLowerCase().replace(/[^a-z0-9_]/g, "_");
    if (!fieldKey) {
      fieldKey = labelIt.toLowerCase().replace(/[^a-z0-9_]/g, "_");
    }

    try {
      if (editingField) {
        await updateField(editingField.id, {
          label_it: labelIt,
          label_en: labelEn,
          placeholder_it: formData.placeholder_it.trim() || undefined,
          placeholder_en: formData.placeholder_en.trim() || undefined,
          field_type: formData.field_type,
          targets: formData.targets,
          target: formData.targets[0] || FormFieldTarget.PURCHASER,
          is_required_default: formData.is_required_default,
          sort_order: Number(formData.sort_order) || 0,
          options: formData.options,
        });
      } else {
        await createField({
          key: fieldKey,
          label_it: labelIt,
          label_en: labelEn,
          placeholder_it: formData.placeholder_it.trim() || undefined,
          placeholder_en: formData.placeholder_en.trim() || undefined,
          field_type: formData.field_type,
          targets: formData.targets,
          target: formData.targets[0] || FormFieldTarget.PURCHASER,
          is_required_default: formData.is_required_default,
          sort_order: Number(formData.sort_order) || 0,
          options: formData.options,
        });
      }
      setIsModalOpen(false);
    } catch (err: any) {
      console.error("[FormFieldsView] Error saving field:", err);
      toast.error(err?.message || "Errore durante il salvataggio del campo");
    }
  };

  // Filtered data (only custom fields)
  const filteredData = useMemo(() => {
    return customFields.filter((f) => {
      if (targetFilter !== "all") {
        const itemTargets = getFieldTargets(f);
        if (!itemTargets.includes(targetFilter as FormFieldTarget)) return false;
      }

      if (searchQuery.trim()) {
        const q = searchQuery.toLowerCase().trim();
        const matchKey = (f.key || "").toLowerCase().includes(q);
        const matchIt = (f.label_it || "").toLowerCase().includes(q);
        const matchEn = (f.label_en || "").toLowerCase().includes(q);
        return matchKey || matchIt || matchEn;
      }
      return true;
    });
  }, [customFields, targetFilter, searchQuery]);

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
        accessorKey: "id",
        header: ({ column }) => (
          <DataTableColumnHeader column={column} title="ID" />
        ),
        cell: ({ row }) => <CellCopyableId id={row.original.id} />,
        size: 110,
      },
      {
        accessorKey: "sort_order",
        header: ({ column }) => (
          <DataTableColumnHeader column={column} title="#" />
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
          <DataTableColumnHeader
            column={column}
            title={locale === "en" ? "Field Name & Key" : "Nome Campo & Chiave"}
          />
        ),
        cell: ({ row }) => {
          const item = row.original;
          const targets = getFieldTargets(item);
          const isStudent = targets.includes(FormFieldTarget.STUDENT);
          return (
            <div className="flex items-center gap-2">
              <CellAvatar
                title={locale === "en" ? item.label_en : item.label_it}
                subtitle={item.key}
                icon={isStudent ? Users : User}
                badgeColor="bg-primary/10 text-primary"
              />
              {item.is_system && (
                <Badge variant="outline" className="text-[10px] px-1.5 py-0 bg-muted/60 text-muted-foreground border-border/80 flex items-center gap-0.5 font-medium shrink-0">
                  <Lock className="w-2.5 h-2.5" />
                  {locale === "en" ? "System" : "Sistema"}
                </Badge>
              )}
            </div>
          );
        },
      },
      {
        accessorKey: "target",
        header: ({ column }) => (
          <DataTableColumnHeader
            column={column}
            title={locale === "en" ? "Targets" : "Destinazioni"}
          />
        ),
        cell: ({ row }) => {
          const targets = getFieldTargets(row.original);
          return (
            <div className="flex flex-wrap gap-1.5 items-center">
              {targets.map((t) => {
                const meta = getTargetMeta(t);
                return (
                  <Badge
                    key={t}
                    variant="outline"
                    className={`text-[11px] font-semibold border flex items-center py-0.5 px-2 ${meta.badgeClass}`}
                  >
                    {meta.icon}
                    <span>{meta.shortLabel}</span>
                  </Badge>
                );
              })}
            </div>
          );
        },
      },
      {
        accessorKey: "field_type",
        header: ({ column }) => (
          <DataTableColumnHeader
            column={column}
            title={locale === "en" ? "Field Type" : "Tipo di Dato"}
          />
        ),
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
        header: ({ column }) => (
          <DataTableColumnHeader
            column={column}
            title={locale === "en" ? "Default Required" : "Obbligatorietà Base"}
          />
        ),
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
        header: () => (
          <div className="text-right text-xs font-medium text-muted-foreground">
            {locale === "en" ? "Actions" : "Azioni"}
          </div>
        ),
        enableHiding: false,
        cell: ({ row }) => {
          const item = row.original;
          return (
            <div className="flex items-center justify-end gap-1">
              <Button
                variant="ghost"
                size="icon"
                className="h-8 w-8 cursor-pointer text-muted-foreground hover:text-foreground hover:bg-muted/80 rounded-lg"
                onClick={() => handleOpenEdit(item)}
                title={locale === "en" ? "Edit field" : "Modifica campo"}
              >
                <Pencil className="h-4 w-4" />
              </Button>
              {!item.is_system ? (
                <Button
                  variant="ghost"
                  size="icon"
                  className="h-8 w-8 cursor-pointer text-rose-600/70 hover:text-rose-600 hover:bg-rose-500/10 rounded-lg dark:hover:text-rose-400"
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

  const [columnFilters, setColumnFilters] = useState<ColumnFiltersState>([]);
  const [columnVisibility, setColumnVisibility] = useState<VisibilityState>({});
  const [rowSelection, setRowSelection] = useState({});

  const table = useReactTable({
    data: filteredData,
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
    getSortedRowModel: getSortedRowModel(),
    getPaginationRowModel: getPaginationRowModel(),
    getFilteredRowModel: getFilteredRowModel(),
  });

  const targetOptions = [
    { value: "all", label: locale === "en" ? "All Targets" : "Tutte le destinazioni" },
    { value: FormFieldTarget.PURCHASER, label: locale === "en" ? "Purchaser / Parent" : "Acquirente / Genitore" },
    { value: FormFieldTarget.STUDENT, label: locale === "en" ? "Student / Child" : "Studente / Figlio" },
    { value: FormFieldTarget.BOOKING, label: locale === "en" ? "Booking / General" : "Iscrizione / Corso" },
    { value: FormFieldTarget.CONTACT, label: locale === "en" ? "Contact Lead" : "Modulo Contatto" },
  ];

  return (
    <div className="space-y-6">
      {/* ── Top Metrics Cards ── */}
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

      {/* ── Main DataViewToolbar ── */}
      <DataTableToolbar
        table={table}
        searchKey="label_it"
        searchValue={searchQuery}
        onSearchChange={setSearchQuery}
        searchPlaceholder={locale === "en" ? "Search by key, label..." : "Cerca per chiave o nome campo..."}
        filterKey="target"
        filterTitle={locale === "en" ? "Target" : "Destinazione"}
        filterValue={targetFilter}
        onFilterChange={setTargetFilter}
        filterOptions={targetOptions}
        actionButton={
          <Button
            size="sm"
            onClick={handleOpenCreate}
            className="h-8 text-xs font-semibold gap-1.5 cursor-pointer rounded-lg shadow-xs"
          >
            <Plus className="h-4 w-4" />
            <span>{locale === "en" ? "New Field" : "Nuovo Campo"}</span>
          </Button>
        }
      />

      <AtenaDataTable
        table={table}
        columns={columns}
        loading={isLoading}
        emptyMessage={locale === "en" ? "No fields found matching criteria." : "Nessun campo trovato con i criteri specificati."}
      />

      {/* ── Create / Edit Modal Dialog ── */}
      <Dialog open={isModalOpen} onOpenChange={setIsModalOpen}>
        <DialogContent className="sm:max-w-[620px] max-h-[90vh] overflow-y-auto">
          <form noValidate onSubmit={handleSave}>
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

              {/* Target Entities (Multiple selection) */}
              <div>
                <div className="flex items-center justify-between mb-1.5">
                  <Label className="text-xs font-semibold">
                    {locale === "en" ? "Target Entities (Where can this field be used?)" : "Destinazioni Dato (Dove può comparire questo campo?)"}
                    <span className="text-destructive ml-1">*</span>
                  </Label>
                  <span className="text-[11px] font-medium text-muted-foreground">
                    {formData.targets.length} {locale === "en" ? "selected" : "selezionati"}
                  </span>
                </div>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                  {[
                    {
                      target: FormFieldTarget.PURCHASER,
                      label: locale === "en" ? "Purchaser / Parent" : "Acquirente / Genitore",
                      sub: locale === "en" ? "Billing & payer details" : "Anagrafica pagatore / genitore",
                      icon: User,
                      color: "text-blue-500",
                      activeBorder: "border-blue-500 bg-blue-500/10 text-foreground",
                    },
                    {
                      target: FormFieldTarget.STUDENT,
                      label: locale === "en" ? "Student / Child" : "Studente / Figlio",
                      sub: locale === "en" ? "Participant & academic info" : "Dati studente / partecipante",
                      icon: Users,
                      color: "text-emerald-500",
                      activeBorder: "border-emerald-500 bg-emerald-500/10 text-foreground",
                    },
                    {
                      target: FormFieldTarget.BOOKING,
                      label: locale === "en" ? "Booking / Course" : "Iscrizione / Corso",
                      sub: locale === "en" ? "Course options & notes" : "Note e opzioni corso",
                      icon: Calendar,
                      color: "text-purple-500",
                      activeBorder: "border-purple-500 bg-purple-500/10 text-foreground",
                    },
                    {
                      target: FormFieldTarget.CONTACT,
                      label: locale === "en" ? "Contact Form" : "Modulo Contatto",
                      sub: locale === "en" ? "Website lead inquiries" : "Richieste sito web / contatti",
                      icon: Mail,
                      color: "text-amber-500",
                      activeBorder: "border-amber-500 bg-amber-500/10 text-foreground",
                    },
                  ].map((item) => {
                    const isSelected = formData.targets.includes(item.target);
                    const Icon = item.icon;
                    return (
                      <button
                        key={item.target}
                        type="button"
                        onClick={() => {
                          const exists = formData.targets.includes(item.target);
                          let newTargets: FormFieldTarget[];
                          if (exists) {
                            if (formData.targets.length === 1) {
                              toast.warning(locale === "en" ? "Select at least one target entity" : "Seleziona almeno una destinazione");
                              return;
                            }
                            newTargets = formData.targets.filter((t) => t !== item.target);
                          } else {
                            newTargets = [...formData.targets, item.target];
                          }
                          setFormData({ ...formData, targets: newTargets });
                        }}
                        className={`flex items-start gap-2.5 p-2.5 rounded-xl border text-left transition-all cursor-pointer ${
                          isSelected
                            ? `${item.activeBorder} shadow-xs font-semibold`
                            : "border-border/70 hover:border-border hover:bg-muted/40 text-muted-foreground"
                        }`}
                      >
                        <div
                          className={`mt-0.5 size-4 rounded border flex items-center justify-center transition-colors shrink-0 ${
                            isSelected
                              ? "bg-primary border-primary text-primary-foreground"
                              : "border-muted-foreground/40 bg-background"
                          }`}
                        >
                          {isSelected && <Check className="size-3 stroke-[3]" />}
                        </div>
                        <div className="min-w-0 flex-1">
                          <div className="flex items-center gap-1.5 text-xs text-foreground">
                            <Icon className={`w-3.5 h-3.5 ${item.color}`} />
                            <span>{item.label}</span>
                          </div>
                          <p className="text-[11px] text-muted-foreground mt-0.5 leading-tight font-normal">
                            {item.sub}
                          </p>
                        </div>
                      </button>
                    );
                  })}
                </div>
              </div>

              {/* Field Type */}
              <div>
                <Label className="text-xs font-semibold">
                  {locale === "en" ? "Field Type" : "Tipo di Input"}
                  <span className="text-destructive ml-1">*</span>
                </Label>
                <Select
                  modal={false}
                  value={formData.field_type}
                  onValueChange={(val: FormFieldType) => setFormData({ ...formData, field_type: val })}
                >
                  <SelectTrigger className="mt-1 text-xs">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent position="popper" className="z-[99999]">
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
                    className="mt-1 text-xs"
                  />
                </div>
                <div>
                  <Label htmlFor="label_en" className="text-xs font-semibold">
                    {locale === "en" ? "English Label" : "Etichetta (Inglese)"}
                  </Label>
                  <Input
                    id="label_en"
                    value={formData.label_en}
                    onChange={(e) => setFormData({ ...formData, label_en: e.target.value })}
                    placeholder="e.g. Language Level (optional, defaults to Italian)"
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
