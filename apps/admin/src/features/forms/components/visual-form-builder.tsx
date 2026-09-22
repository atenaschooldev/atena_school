"use client";

import React, { useState, useMemo } from "react";
import {
  type FormTemplate,
  type FormFieldConfig,
  type FormFieldItem,
  FormFieldType,
  FormFieldTarget,
  FormType,
  FORM_TYPE_DICTIONARY,
  FORM_FIELD_TYPE_DICTIONARY,
  FORM_FIELD_TARGET_DICTIONARY,
  parseFormType,
} from "../types";
import { useFormFields } from "../hooks/use-form-fields";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { Badge } from "@/components/ui/badge";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
  DialogDescription,
} from "@/components/ui/dialog";
import {
  Plus,
  Trash2,
  Edit2,
  ArrowUp,
  ArrowDown,
  Save,
  Eye,
  Layers,
  Sparkles,
  ShieldCheck,
  Star,
  User,
  FileText,
  Smartphone,
  Monitor,
  Building,
  Globe,
  Folder,
  GraduationCap,
  ChevronRight,
  Search,
  Check,
  Calendar,
  Phone,
  Mail,
  HelpCircle,
} from "lucide-react";
import { StatusBadge } from "@/components/shared/status-badge";
import { useCourses } from "@/features/courses/hooks/use-courses";
import { useTranslation } from "@/i18n/context";

const CORE_BASE_KEYS_BOOKING = new Set([
  "purchaser_first_name",
  "purchaser_last_name",
  "purchaser_email",
  "purchaser_phone",
  "purchaser_tax_code",
  "purchaser_birth_date",
  "purchaser_birth_place",
  "student_first_name",
  "student_last_name",
  "student_email",
  "student_phone",
  "student_tax_code",
  "student_birth_date",
  "student_birth_place",
]);

const CORE_BASE_KEYS_CONTACT = new Set([
  "contact_full_name",
  "contact_email",
  "contact_phone",
  "inquiry_subject",
  "inquiry_message",
  "privacy_consent",
]);

interface VisualFormBuilderProps {
  initialForm?: FormTemplate | null;
  onSave: (form: FormTemplate) => Promise<void>;
  onCancel: () => void;
  isSaving?: boolean;
}

export function VisualFormBuilder({
  initialForm,
  onSave,
  onCancel,
  isSaving = false,
}: VisualFormBuilderProps) {
  const { t, locale } = useTranslation();
  const { coursesList } = useCourses();
  const { fields: catalogFields, loading: loadingCatalog } = useFormFields();

  const getFormTypeLabel = (val: any): string => {
    const parsed = parseFormType(val);
    const entry = FORM_TYPE_DICTIONARY[parsed];
    if (entry) return locale === "en" ? entry.label_en : entry.label_it;
    return String(val);
  };

  const getFieldTypeLabel = (val: FormFieldType): string => {
    const entry = FORM_FIELD_TYPE_DICTIONARY[val];
    if (entry) return locale === "en" ? entry.label_en : entry.label_it;
    return val;
  };

  const getFieldTargetLabel = (val: FormFieldTarget): string => {
    const entry = FORM_FIELD_TARGET_DICTIONARY[val];
    if (entry) return locale === "en" ? entry.label_en : entry.label_it;
    return val;
  };

  const [formData, setFormData] = useState<FormTemplate>(
    initialForm || {
      id: "",
      title: "Nuovo Modulo",
      description: "Descrizione del modulo",
      form_type: FormType.BOOKING,
      is_default: false,
      is_active: true,
      category_slug: null,
      course_id: null,
      fields_config: [],
    }
  );

  // Derive unique categories from real courses in the database
  const availableCategories = useMemo(() => {
    const set = new Set<string>();
    coursesList.forEach((c) => {
      if (c.categoria) {
        const catStr = String(c.categoria).trim();
        if (catStr) {
          set.add(catStr.toLowerCase());
        }
      }
    });
    return Array.from(set);
  }, [coursesList]);

  const [courseSearch, setCourseSearch] = useState<string>("");

  // Scope mode state
  const [scopeMode, setScopeMode] = useState<"global" | "category" | "course">(() => {
    if (formData.course_id) return "course";
    if (formData.category_slug) return "category";
    return "global";
  });

  const selectedCourse = useMemo(() => {
    if (!formData.course_id) return null;
    return coursesList.find((c) => c.id === formData.course_id || c.slug === formData.course_id) || null;
  }, [formData.course_id, coursesList]);

  const filteredCourses = useMemo(() => {
    if (!courseSearch.trim()) return coursesList;
    const q = courseSearch.toLowerCase();
    return coursesList.filter((c) => {
      const nomeStr = String(c.nome || "").toLowerCase();
      const catStr = String(c.categoria || "").toLowerCase();
      const teacherStr = String(c.teacherName || "").toLowerCase();
      return nomeStr.includes(q) || catStr.includes(q) || teacherStr.includes(q);
    });
  }, [coursesList, courseSearch]);

  const [activeTab, setActiveTab] = useState<"builder" | "preview">("builder");
  const [previewMode, setPreviewMode] = useState<"direct" | "child">("direct");
  const [previewDevice, setPreviewDevice] = useState<"desktop" | "mobile">("desktop");

  // Modal Dialogs state
  const [catalogModalOpen, setCatalogModalOpen] = useState(false);
  const [catalogSearch, setCatalogSearch] = useState("");
  const [catalogTargetFilter, setCatalogTargetFilter] = useState<string>("all");

  const [editModalOpen, setEditModalOpen] = useState(false);
  const [editingField, setEditingField] = useState<FormFieldConfig | null>(null);
  const [editLabel, setEditLabel] = useState("");
  const [editPlaceholder, setEditPlaceholder] = useState("");
  const [editHelpText, setEditHelpText] = useState("");
  const [editRequired, setEditRequired] = useState(false);
  const [editEnabled, setEditEnabled] = useState(true);

  const handleScopeChange = (mode: "global" | "category" | "course") => {
    setScopeMode(mode);
    if (mode === "global") {
      setFormData((prev) => ({ ...prev, course_id: null, category_slug: null }));
    } else if (mode === "category") {
      setFormData((prev) => ({
        ...prev,
        course_id: null,
        category_slug: prev.category_slug || availableCategories[0] || "lingue",
      }));
    } else if (mode === "course") {
      setFormData((prev) => ({
        ...prev,
        category_slug: null,
        course_id: prev.course_id || coursesList[0]?.id || null,
      }));
    }
  };

  // Base core keys for this form type
  const baseCoreKeys = useMemo(() => {
    return formData.form_type === FormType.CONTACT ? CORE_BASE_KEYS_CONTACT : CORE_BASE_KEYS_BOOKING;
  }, [formData.form_type]);

  // Available catalog fields (excluding base core fields)
  const availableCatalogFields = useMemo(() => {
    return catalogFields.filter((cf) => !baseCoreKeys.has(cf.key));
  }, [catalogFields, baseCoreKeys]);

  // Filtered catalog fields for the selection modal
  const filteredCatalogFields = useMemo(() => {
    return availableCatalogFields.filter((cf) => {
      // Filter by target
      if (catalogTargetFilter !== "all" && cf.target !== catalogTargetFilter) {
        return false;
      }
      // Filter by search query
      if (catalogSearch.trim()) {
        const q = catalogSearch.toLowerCase();
        const labelIt = (cf.label_it || "").toLowerCase();
        const labelEn = (cf.label_en || "").toLowerCase();
        const key = (cf.key || "").toLowerCase();
        return labelIt.includes(q) || labelEn.includes(q) || key.includes(q);
      }
      return true;
    });
  }, [availableCatalogFields, catalogTargetFilter, catalogSearch]);

  const handleAttachCatalogField = (catalogField: FormFieldItem) => {
    const existing = formData.fields_config.find((f) => f.key === catalogField.key);
    if (existing) return;

    const newField: FormFieldConfig = {
      id: `field-${Date.now()}-${Math.random().toString(36).substring(2, 6)}`,
      key: catalogField.key,
      label: locale === "en" ? catalogField.label_en : catalogField.label_it,
      placeholder: (locale === "en" ? catalogField.placeholder_en : catalogField.placeholder_it) || undefined,
      field_type: catalogField.field_type,
      target: catalogField.target,
      is_required: catalogField.is_required_default,
      is_enabled: true,
      sort_order: formData.fields_config.length + 1,
      options: Array.isArray(catalogField.options) && catalogField.options.length > 0 ? catalogField.options : undefined,
    };

    setFormData((prev) => ({
      ...prev,
      fields_config: [...prev.fields_config, newField],
    }));
  };

  const handleRemoveField = (id: string) => {
    setFormData((prev) => ({
      ...prev,
      fields_config: prev.fields_config.filter((f) => f.id !== id),
    }));
  };

  const handleMoveField = (index: number, direction: "up" | "down") => {
    const list = [...formData.fields_config];
    const targetIndex = direction === "up" ? index - 1 : index + 1;
    if (targetIndex < 0 || targetIndex >= list.length) return;

    const temp = list[index];
    list[index] = list[targetIndex];
    list[targetIndex] = temp;

    list.forEach((f, idx) => {
      f.sort_order = idx + 1;
    });

    setFormData((prev) => ({ ...prev, fields_config: list }));
  };

  const handleOpenEditField = (f: FormFieldConfig) => {
    setEditingField(f);
    setEditLabel(f.label);
    setEditPlaceholder(f.placeholder || "");
    setEditHelpText(f.help_text || "");
    setEditRequired(f.is_required);
    setEditEnabled(f.is_enabled);
    setEditModalOpen(true);
  };

  const handleSaveEditField = () => {
    if (!editingField || !editLabel.trim()) return;

    setFormData((prev) => ({
      ...prev,
      fields_config: prev.fields_config.map((f) =>
        f.id === editingField.id
          ? {
              ...f,
              label: editLabel.trim(),
              placeholder: editPlaceholder.trim() || undefined,
              help_text: editHelpText.trim() || undefined,
              is_required: editRequired,
              is_enabled: editEnabled,
            }
          : f
      ),
    }));

    setEditModalOpen(false);
    setEditingField(null);
  };

  const studentFields = formData.fields_config.filter(
    (f) => f.target === FormFieldTarget.STUDENT
  );
  const purchaserFields = formData.fields_config.filter(
    (f) => f.target === FormFieldTarget.PURCHASER || f.target === FormFieldTarget.BOOKING
  );

  return (
    <div className="flex flex-col gap-4">
      {/* ── Top Header Bar ── */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 border-b pb-3">
        <div className="space-y-0.5">
          <Button
            type="button"
            variant="ghost"
            size="sm"
            onClick={onCancel}
            className="gap-1 text-xs text-muted-foreground hover:text-foreground cursor-pointer -ml-2 h-6 px-2"
          >
            <ChevronRight className="w-3.5 h-3.5 rotate-180" />
            {t("forms.builderBackBtn")}
          </Button>
          <div className="flex items-center gap-2 flex-wrap">
            <h1 className="text-lg font-bold tracking-tight text-foreground">
              {formData.title || t("forms.newFormBtn")}
            </h1>
            <Badge variant="secondary" className="text-[10px] uppercase font-semibold">
              {getFormTypeLabel(formData.form_type)}
            </Badge>
            {formData.is_default && (
              <Badge className="bg-amber-500 text-slate-950 font-black text-[10px] gap-1 px-1.5 py-0.5">
                <Star className="w-3 h-3 fill-current" />
                {t("forms.badgeDefault")}
              </Badge>
            )}
            <StatusBadge status={formData.is_active ? "attivo" : "archived"} />
          </div>
          {formData.description && (
            <p className="text-[11px] text-muted-foreground line-clamp-1">{formData.description}</p>
          )}
        </div>

        <div className="flex items-center gap-2 w-full sm:w-auto">
          <div className="flex rounded-md bg-muted/60 p-0.5 border">
            <button
              type="button"
              onClick={() => setActiveTab("builder")}
              className={`flex items-center gap-1.5 px-2.5 py-1 rounded text-xs font-semibold transition-all cursor-pointer ${
                activeTab === "builder"
                  ? "bg-background shadow-xs text-foreground"
                  : "text-muted-foreground hover:text-foreground"
              }`}
            >
              <Layers className="w-3.5 h-3.5" />
              {t("forms.builderTabBuilder")}
            </button>
            <button
              type="button"
              onClick={() => setActiveTab("preview")}
              className={`flex items-center gap-1.5 px-2.5 py-1 rounded text-xs font-semibold transition-all cursor-pointer ${
                activeTab === "preview"
                  ? "bg-background shadow-xs text-foreground"
                  : "text-muted-foreground hover:text-foreground"
              }`}
            >
              <Eye className="w-3.5 h-3.5" />
              {locale === "en" ? "Live Preview" : "Anteprima Live"}
            </button>
          </div>

          <Button
            type="button"
            variant="outline"
            size="sm"
            onClick={onCancel}
            className="text-xs cursor-pointer h-7"
          >
            {t("forms.builderCancel")}
          </Button>

          <Button
            type="button"
            size="sm"
            onClick={() => onSave(formData)}
            disabled={isSaving || !formData.title.trim()}
            className="font-semibold text-xs shadow-xs gap-1.5 cursor-pointer h-7"
          >
            <Save className="w-3.5 h-3.5" />
            {isSaving ? t("forms.builderSaving") : t("forms.builderSaveBtn")}
          </Button>
        </div>
      </div>

      {activeTab === "builder" ? (
        <div className="space-y-3">
          {/* ── Settings Row: Info + Scope side by side ── */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
            {/* General Information Card */}
            <Card className="border shadow-xs">
              <CardHeader className="px-3.5 py-2 border-b bg-muted/20">
                <CardTitle className="text-xs font-semibold flex items-center gap-1.5">
                  <FileText className="w-3.5 h-3.5 text-primary" />
                  {t("forms.builderInfoTitle")}
                </CardTitle>
              </CardHeader>
              <CardContent className="p-3 space-y-2.5">
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-2">
                  <div className="sm:col-span-2 space-y-1">
                    <Label className="text-[11px] font-medium text-muted-foreground">{t("forms.builderTitleLabel")}</Label>
                    <Input
                      value={formData.title}
                      onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                      placeholder={t("forms.builderTitlePlaceholder")}
                      className="text-xs h-7"
                    />
                  </div>
                  <div className="space-y-1">
                    <Label className="text-[11px] font-medium text-muted-foreground">{t("forms.builderTypeLabel")}</Label>
                    <select
                      value={formData.form_type}
                      onChange={(e) => setFormData({ ...formData, form_type: e.target.value as FormType })}
                      className="w-full bg-background border border-border rounded-md px-2 py-1 text-xs font-medium text-foreground cursor-pointer h-7"
                    >
                      {Object.entries(FORM_TYPE_DICTIONARY).map(([key, dict]) => (
                        <option key={key} value={key}>
                          {locale === "en" ? dict.label_en : dict.label_it}
                        </option>
                      ))}
                    </select>
                  </div>
                </div>

                <div className="space-y-1">
                  <Label className="text-[11px] font-medium text-muted-foreground">{t("forms.builderDescLabel")}</Label>
                  <Input
                    value={formData.description || ""}
                    onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                    placeholder={t("forms.builderDescPlaceholder")}
                    className="text-xs h-7"
                  />
                </div>

                <div className="flex items-center gap-4 pt-2 border-t text-xs">
                  <div className="flex items-center justify-between flex-1">
                    <span className="text-[11px] font-medium">{t("forms.builderActiveLabel")}</span>
                    <Switch
                      checked={formData.is_active}
                      onCheckedChange={(checked) => setFormData({ ...formData, is_active: checked })}
                      className="cursor-pointer data-[state=checked]:bg-emerald-600 scale-75"
                    />
                  </div>
                  <div className="flex items-center justify-between flex-1">
                    <span className="text-[11px] font-medium">{t("forms.builderDefaultLabel")}</span>
                    <Switch
                      checked={formData.is_default}
                      onCheckedChange={(checked) => setFormData({ ...formData, is_default: checked })}
                      className="cursor-pointer data-[state=checked]:bg-amber-500 scale-75"
                    />
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Scope / Destination Card */}
            <Card className="border shadow-xs">
              <CardHeader className="px-3.5 py-2 border-b bg-muted/20">
                <CardTitle className="text-xs font-semibold flex items-center gap-1.5">
                  <Sparkles className="w-3.5 h-3.5 text-primary" />
                  {t("forms.builderScopeTitle")}
                </CardTitle>
              </CardHeader>
              <CardContent className="p-3 space-y-2.5">
                {formData.form_type === FormType.CONTACT ? (
                  <div className="p-2.5 rounded-md bg-blue-500/10 border border-blue-500/20 text-xs flex items-center gap-2">
                    <Globe className="w-3.5 h-3.5 text-blue-600 shrink-0" />
                    <p className="text-muted-foreground text-[11px]">{t("forms.builderScopeContactHint")}</p>
                  </div>
                ) : (
                  <>
                    <div className="grid grid-cols-3 gap-1 bg-muted/50 p-0.5 rounded-md border">
                      <button
                        type="button"
                        onClick={() => handleScopeChange("global")}
                        className={`py-1 px-1 text-[11px] font-medium rounded transition-all cursor-pointer flex items-center justify-center gap-1 text-center ${
                          scopeMode === "global"
                            ? "bg-background text-foreground shadow-xs font-semibold"
                            : "text-muted-foreground hover:text-foreground"
                        }`}
                      >
                        <Globe className="w-3 h-3" />
                        {t("forms.builderScopeGlobal")}
                      </button>
                      <button
                        type="button"
                        onClick={() => handleScopeChange("category")}
                        className={`py-1 px-1 text-[11px] font-medium rounded transition-all cursor-pointer flex items-center justify-center gap-1 text-center ${
                          scopeMode === "category"
                            ? "bg-background text-foreground shadow-xs font-semibold"
                            : "text-muted-foreground hover:text-foreground"
                        }`}
                      >
                        <Folder className="w-3 h-3" />
                        {t("forms.builderScopeCategory")}
                      </button>
                      <button
                        type="button"
                        onClick={() => handleScopeChange("course")}
                        className={`py-1 px-1 text-[11px] font-medium rounded transition-all cursor-pointer flex items-center justify-center gap-1 text-center ${
                          scopeMode === "course"
                            ? "bg-background text-foreground shadow-xs font-semibold"
                            : "text-muted-foreground hover:text-foreground"
                        }`}
                      >
                        <GraduationCap className="w-3 h-3" />
                        {t("forms.builderScopeCourse")}
                      </button>
                    </div>

                    {scopeMode === "global" && (
                      <p className="text-[11px] text-muted-foreground bg-muted/30 px-2 py-1.5 rounded-md">
                        🌐 {t("forms.builderScopeGlobalHint")}
                      </p>
                    )}

                    {scopeMode === "category" && (
                      <div className="space-y-1">
                        <select
                          value={formData.category_slug || ""}
                          onChange={(e) =>
                            setFormData({
                              ...formData,
                              category_slug: e.target.value || null,
                              course_id: null,
                            })
                          }
                          className="w-full bg-background border border-border rounded-md px-2 py-1 text-xs font-medium text-foreground cursor-pointer h-7"
                        >
                          <option value="">{t("forms.builderScopeCategoryPlaceholder")}</option>
                          {availableCategories.map((cat) => {
                            const count = coursesList.filter((c) => String(c.categoria || "").toLowerCase() === cat).length;
                            return (
                              <option key={cat} value={cat}>
                                📂 {cat.toUpperCase()} ({count} {locale === "en" ? "courses" : "corsi"})
                              </option>
                            );
                          })}
                        </select>
                      </div>
                    )}

                    {scopeMode === "course" && (
                      <div className="space-y-1.5">
                        <div className="relative">
                          <Search className="w-3 h-3 absolute left-2 top-1/2 -translate-y-1/2 text-muted-foreground" />
                          <Input
                            value={courseSearch}
                            onChange={(e) => setCourseSearch(e.target.value)}
                            placeholder={t("forms.builderScopeCourseFilterPlaceholder")}
                            className="pl-7 h-6 text-xs rounded-md"
                          />
                        </div>
                        <select
                          value={formData.course_id || ""}
                          onChange={(e) =>
                            setFormData({
                              ...formData,
                              course_id: e.target.value || null,
                              category_slug: null,
                            })
                          }
                          className="w-full bg-background border border-border rounded-md px-2 py-1 text-xs font-medium text-foreground cursor-pointer h-7"
                        >
                          <option value="">{t("forms.builderScopeCoursePlaceholder")}</option>
                          {filteredCourses.map((course) => (
                            <option key={course.id} value={course.id}>
                              📘 {course.nome} (€{course.prezzo})
                            </option>
                          ))}
                        </select>
                      </div>
                    )}
                  </>
                )}
              </CardContent>
            </Card>
          </div>

          {/* ── Custom Dynamic Fields Section ── */}
          <Card className="border shadow-xs">
            <CardHeader className="px-3.5 py-2 border-b bg-muted/20 flex flex-row items-center justify-between gap-3">
              <div className="flex items-center gap-2">
                <CardTitle className="text-xs font-semibold flex items-center gap-1.5">
                  <Sparkles className="w-3.5 h-3.5 text-primary" />
                  {t("forms.builderFieldsTitle")}
                </CardTitle>
                <Badge variant="outline" className="text-[10px] px-1.5 py-0 h-4 font-semibold">
                  {formData.fields_config.length}
                </Badge>
              </div>

              <Button
                type="button"
                size="sm"
                onClick={() => {
                  setCatalogSearch("");
                  setCatalogTargetFilter("all");
                  setCatalogModalOpen(true);
                }}
                className="gap-1.5 font-semibold text-xs cursor-pointer shadow-xs shrink-0 h-7 px-2.5"
              >
                <Plus className="w-3.5 h-3.5" />
                {t("forms.builderAddFieldBtn")}
              </Button>
            </CardHeader>

            <CardContent className="p-3">
              {formData.fields_config.length === 0 ? (
                <div className="flex items-center gap-3 py-3 px-3.5 border border-dashed rounded-lg bg-muted/15">
                  <HelpCircle className="w-4 h-4 text-muted-foreground/50 shrink-0" />
                  <div>
                    <p className="text-xs font-medium text-foreground">{t("forms.builderEmptyFields")}</p>
                    <p className="text-[11px] text-muted-foreground">
                      {locale === "en"
                        ? "Click \"Add Field\" above to include additional questions from the database catalog."
                        : "Clicca su \"Aggiungi Campo\" in alto per includere campi extra dal catalogo database."}
                    </p>
                  </div>
                </div>
              ) : (
                <div className="space-y-1.5">
                  {formData.fields_config.map((field, index) => {
                    const isStudent = field.target === FormFieldTarget.STUDENT;
                    const isPurchaser = field.target === FormFieldTarget.PURCHASER;
                    return (
                      <div
                        key={field.id}
                        className={`px-3 py-1.5 rounded-md border transition-all ${
                          field.is_enabled
                            ? "bg-card border-border hover:border-primary/40"
                            : "bg-muted/30 border-border/60 opacity-60"
                        }`}
                      >
                        <div className="flex items-center justify-between gap-2">
                          <div className="flex items-center gap-2 min-w-0">
                            <div className="flex flex-col shrink-0">
                              <button
                                type="button"
                                disabled={index === 0}
                                onClick={() => handleMoveField(index, "up")}
                                className="p-0.5 rounded hover:bg-muted text-muted-foreground disabled:opacity-20 cursor-pointer"
                                title={locale === "en" ? "Move up" : "Sposta su"}
                              >
                                <ArrowUp className="w-2.5 h-2.5" />
                              </button>
                              <button
                                type="button"
                                disabled={index === formData.fields_config.length - 1}
                                onClick={() => handleMoveField(index, "down")}
                                className="p-0.5 rounded hover:bg-muted text-muted-foreground disabled:opacity-20 cursor-pointer"
                                title={locale === "en" ? "Move down" : "Sposta giù"}
                              >
                                <ArrowDown className="w-2.5 h-2.5" />
                              </button>
                            </div>

                            <div className="flex items-center gap-1.5 flex-wrap min-w-0">
                              <span className="text-xs font-semibold text-foreground">{field.label}</span>
                              <code className="bg-muted text-muted-foreground px-1 rounded text-[10px] font-mono">{`{{${field.key}}}`}</code>
                              <span className="bg-primary/10 text-primary px-1.5 py-0.2 rounded text-[10px] font-semibold uppercase">
                                {getFieldTypeLabel(field.field_type)}
                              </span>
                              <span
                                className={`inline-flex items-center gap-0.5 text-[10px] px-1.5 py-0.2 rounded font-medium ${
                                  isStudent
                                    ? "bg-blue-500/10 text-blue-700 dark:text-blue-400"
                                    : isPurchaser
                                    ? "bg-amber-500/10 text-amber-700 dark:text-amber-400"
                                    : "bg-purple-500/10 text-purple-700 dark:text-purple-400"
                                }`}
                              >
                                {isStudent ? <User className="w-2.5 h-2.5" /> : <Building className="w-2.5 h-2.5" />}
                                {getFieldTargetLabel(field.target)}
                              </span>
                              {field.is_required && (
                                <Badge variant="destructive" className="text-[9px] py-0 px-1 font-semibold">
                                  {locale === "en" ? "Req." : "Obbl."}
                                </Badge>
                              )}
                            </div>
                          </div>

                          <div className="flex items-center gap-1 shrink-0">
                            <Switch
                              checked={field.is_enabled}
                              onCheckedChange={(checked) =>
                                setFormData((prev) => ({
                                  ...prev,
                                  fields_config: prev.fields_config.map((f) =>
                                    f.id === field.id ? { ...f, is_enabled: checked } : f
                                  ),
                                }))
                              }
                              className="cursor-pointer data-[state=checked]:bg-emerald-600 scale-75"
                              title={field.is_enabled ? "Attivo nel modulo" : "Disattivato nel modulo"}
                            />
                            <Button
                              type="button"
                              size="sm"
                              variant="ghost"
                              className="h-6 w-6 p-0 text-muted-foreground hover:text-foreground cursor-pointer"
                              onClick={() => handleOpenEditField(field)}
                              title={locale === "en" ? "Edit field" : "Modifica campo"}
                            >
                              <Edit2 className="w-3 h-3" />
                            </Button>
                            <Button
                              type="button"
                              size="sm"
                              variant="ghost"
                              className="h-6 w-6 p-0 text-muted-foreground hover:text-destructive cursor-pointer"
                              onClick={() => handleRemoveField(field.id)}
                              title={locale === "en" ? "Remove field" : "Rimuovi campo"}
                            >
                              <Trash2 className="w-3 h-3" />
                            </Button>
                          </div>
                        </div>
                      </div>
                    );
                  })}
                </div>
              )}
            </CardContent>
          </Card>

          {/* System Core Fields — Compact flat indicator */}
          <div className="flex items-center gap-1.5 flex-wrap px-1 text-muted-foreground">
            <div className="flex items-center gap-1 shrink-0">
              <ShieldCheck className="w-3.5 h-3.5 text-emerald-600" />
              <span className="text-[10px] font-medium">{t("forms.builderSystemFieldsLabel")}</span>
            </div>
            {(formData.form_type === FormType.CONTACT
              ? [
                  locale === "en" ? "Full Name" : "Nome & Cognome",
                  "Email",
                  locale === "en" ? "Phone" : "Telefono",
                  locale === "en" ? "Course of Interest" : "Corso d'Interesse",
                  locale === "en" ? "Message" : "Messaggio",
                  "Privacy GDPR",
                ]
              : [
                  locale === "en" ? "Full Name" : "Nome & Cognome",
                  "Email",
                  locale === "en" ? "Phone" : "Telefono",
                  locale === "en" ? "Tax Code" : "Codice Fiscale",
                  locale === "en" ? "Date & Place of Birth" : "Data & Luogo Nascita",
                  locale === "en" ? "Parent Mode" : "Modalità Genitore",
                ]
            ).map((name) => (
              <span key={name} className="text-[9px] font-medium bg-muted/60 border rounded px-1.5 py-0.5 text-muted-foreground">
                {name}
              </span>
            ))}
          </div>
        </div>
      ) : (
        <div className="bg-slate-100 p-6 rounded-3xl border border-slate-200 shadow-inner">
          {/* Simulator Bar */}
          <div className="flex flex-col sm:flex-row items-center justify-between gap-4 bg-white p-4 rounded-2xl border border-slate-200 shadow-sm mb-6">
            <div className="flex items-center gap-2">
              <span className="text-xs font-bold text-slate-700">Simula modalità checkout:</span>
              <div className="bg-slate-100 p-1 rounded-xl flex items-center gap-1">
                <button
                  type="button"
                  onClick={() => setPreviewMode("direct")}
                  className={`px-3 py-1 rounded-lg text-xs font-bold transition-all ${
                    previewMode === "direct"
                      ? "bg-white text-[#043569] shadow-xs"
                      : "text-slate-600 hover:text-slate-900"
                  }`}
                >
                  🧑 Corsista Diretto (Adulto)
                </button>
                <button
                  type="button"
                  onClick={() => setPreviewMode("child")}
                  className={`px-3 py-1 rounded-lg text-xs font-bold transition-all ${
                    previewMode === "child"
                      ? "bg-white text-[#043569] shadow-xs"
                      : "text-slate-600 hover:text-slate-900"
                  }`}
                >
                  👨‍👩‍👧 Genitore che iscrive il figlio
                </button>
              </div>
            </div>

            <div className="flex items-center gap-2">
              <span className="text-xs font-bold text-slate-700">Dispositivo:</span>
              <div className="bg-slate-100 p-1 rounded-xl flex items-center gap-1">
                <button
                  type="button"
                  onClick={() => setPreviewDevice("desktop")}
                  className={`p-1.5 rounded-lg text-xs transition-all ${
                    previewDevice === "desktop" ? "bg-white text-[#043569] shadow-xs" : "text-slate-500"
                  }`}
                >
                  <Monitor className="w-4 h-4" />
                </button>
                <button
                  type="button"
                  onClick={() => setPreviewDevice("mobile")}
                  className={`p-1.5 rounded-lg text-xs transition-all ${
                    previewDevice === "mobile" ? "bg-white text-[#043569] shadow-xs" : "text-slate-500"
                  }`}
                >
                  <Smartphone className="w-4 h-4" />
                </button>
              </div>
            </div>
          </div>

          {/* Card Container (Adapts based on form_type) */}
          <div className={`mx-auto transition-all ${previewDevice === "mobile" ? "max-w-md" : "max-w-3xl"}`}>
            {formData.form_type === FormType.CONTACT ? (
              <div className="bg-white rounded-3xl p-6 sm:p-8 border border-slate-200 shadow-xl space-y-6">
                <div>
                  <p className="text-xs font-black uppercase tracking-wider text-[#00328F]">
                    CONTATTI & INFORMAZIONI
                  </p>
                  <h2 className="text-2xl font-black text-slate-900">
                    Contatta la Scuola
                  </h2>
                  <p className="text-xs text-slate-500 mt-1">
                    Compila il modulo per richiedere informazioni o essere ricontattato dalla segreteria.
                  </p>
                </div>

                <div className="space-y-4 pt-2">
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5">
                    <div className="space-y-1">
                      <label className="text-xs font-bold text-slate-700">Nome *</label>
                      <input disabled placeholder="Mario" className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-2.5 text-xs" />
                    </div>
                    <div className="space-y-1">
                      <label className="text-xs font-bold text-slate-700">Cognome *</label>
                      <input disabled placeholder="Rossi" className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-2.5 text-xs" />
                    </div>
                    <div className="space-y-1">
                      <label className="text-xs font-bold text-slate-700">Email *</label>
                      <input disabled placeholder="mario.rossi@gmail.com" className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-2.5 text-xs" />
                    </div>
                    <div className="space-y-1">
                      <label className="text-xs font-bold text-slate-700">Telefono (WhatsApp) *</label>
                      <input disabled placeholder="+39 340 1234567" className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-2.5 text-xs" />
                    </div>
                    <div className="space-y-1 sm:col-span-2">
                      <label className="text-xs font-bold text-slate-700">Corso di interesse</label>
                      <select disabled className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-2.5 text-xs">
                        <option>Corsi di Lingua (Inglese)</option>
                        <option>Certificazioni Informatiche (EIPASS)</option>
                        <option>Doposcuola & Recupero</option>
                      </select>
                    </div>
                    <div className="space-y-1 sm:col-span-2">
                      <label className="text-xs font-bold text-slate-700">Messaggio *</label>
                      <textarea disabled placeholder="Scrivi qui la tua richiesta..." rows={3} className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 text-xs resize-none" />
                    </div>
                  </div>

                  {/* Dynamic Custom Fields in Contact Preview */}
                  {formData.fields_config.filter((f) => f.is_enabled).length > 0 && (
                    <div className="pt-3 border-t border-slate-100 space-y-3">
                      <p className="text-[11px] font-bold text-[#00328F] uppercase tracking-wider">
                        ✨ Campi Aggiuntivi Configurati ({formData.fields_config.filter((f) => f.is_enabled).length})
                      </p>
                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                        {formData.fields_config.filter((f) => f.is_enabled).map((f) => (
                          <div key={f.id} className="space-y-1">
                            <label className="text-xs font-bold text-slate-700">
                              {f.label} {f.is_required && <span className="text-red-500">*</span>}
                            </label>
                            {f.field_type === FormFieldType.SELECT ? (
                              <select disabled className="w-full bg-blue-50/50 border border-blue-200 rounded-xl px-3 py-2 text-xs">
                                <option>{f.placeholder || "Seleziona..."}</option>
                                {f.options?.map((o: any, idx: number) => (
                                  <option key={idx}>{typeof o === "string" ? o : o.label}</option>
                                ))}
                              </select>
                            ) : (
                              <input disabled placeholder={f.placeholder} className="w-full bg-blue-50/50 border border-blue-200 rounded-xl px-3 py-2 text-xs" />
                            )}
                          </div>
                        ))}
                      </div>
                    </div>
                  )}

                  <div className="pt-2">
                    <label className="flex items-center gap-2 text-xs text-slate-500">
                      <input type="checkbox" checked disabled className="rounded text-[#00328F]" />
                      Accetto l&apos;Informativa sulla Privacy GDPR *
                    </label>
                  </div>

                  <Button disabled className="w-full bg-[#00328F] text-white py-3 rounded-xl font-bold text-xs">
                    Invia richiesta
                  </Button>
                </div>
              </div>
            ) : (
              <div className="bg-white rounded-3xl p-6 sm:p-8 border border-slate-200 shadow-xl space-y-6">
                <div>
                  <p className="text-xs font-black uppercase tracking-wider text-[#FAA904]">
                    ISCRIZIONE E CHECKOUT
                  </p>
                  <h2 className="text-2xl font-black text-[#043569]">
                    Completa l&apos;iscrizione
                  </h2>
                  <p className="text-xs text-slate-500 mt-1">
                    Inserisci i dati dello studente e seleziona la modalità di pagamento desiderata.
                  </p>
                </div>

                <div className="p-3.5 rounded-2xl bg-amber-50/70 border border-amber-200/80 flex items-center justify-between gap-3">
                  <div className="flex items-center gap-2 text-xs font-bold text-slate-800">
                    <Sparkles className="w-4 h-4 text-[#FAA904]" />
                    Sei già nostro corsista o genitore?
                  </div>
                  <button className="bg-[#043569] text-white text-xs font-bold px-3 py-1.5 rounded-xl">
                    Accedi per autocompilare
                  </button>
                </div>

                <div className="p-4 rounded-2xl border border-slate-200 bg-slate-50/50 flex items-start gap-3">
                  <input
                    type="checkbox"
                    checked={previewMode === "child"}
                    onChange={(e) => setPreviewMode(e.target.checked ? "child" : "direct")}
                    className="w-4 h-4 rounded mt-0.5 text-[#043569]"
                  />
                  <div>
                    <p className="text-xs font-bold text-slate-900">
                      Sto iscrivendo un figlio o minorenne (sono un genitore)
                    </p>
                    <p className="text-[11px] text-slate-500 mt-0.5">
                      Seleziona se l&apos;intestatario del corso è diverso da chi effettua il pagamento.
                    </p>
                  </div>
                </div>

                <div className="space-y-4 pt-2">
                  <h3 className="text-xs font-black uppercase tracking-wider text-[#043569]">
                    {previewMode === "child" ? "DATI DEL GENITORE / ACQUIRENTE" : "DATI PERSONALI"}
                  </h3>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5">
                    <div className="space-y-1">
                      <label className="text-xs font-bold text-slate-700">Nome *</label>
                      <input
                        disabled
                        placeholder="Mario"
                        className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-2.5 text-xs"
                      />
                    </div>
                    <div className="space-y-1">
                      <label className="text-xs font-bold text-slate-700">Cognome *</label>
                      <input
                        disabled
                        placeholder="Rossi"
                        className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-2.5 text-xs"
                      />
                    </div>
                    <div className="space-y-1">
                      <label className="text-xs font-bold text-slate-700">Email *</label>
                      <input
                        disabled
                        placeholder="mario.rossi@gmail.com"
                        className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-2.5 text-xs"
                      />
                    </div>
                    <div className="space-y-1">
                      <label className="text-xs font-bold text-slate-700">Telefono (WhatsApp) *</label>
                      <input
                        disabled
                        placeholder="+39 340 1234567"
                        className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-2.5 text-xs"
                      />
                    </div>

                    {previewMode === "direct" && (
                      <>
                        <div className="space-y-1">
                          <label className="text-xs font-bold text-slate-700">Data di Nascita *</label>
                          <input
                            disabled
                            placeholder="mm/dd/yyyy"
                            className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-2.5 text-xs"
                          />
                        </div>
                        <div className="space-y-1">
                          <label className="text-xs font-bold text-slate-700">Luogo di Nascita *</label>
                          <input
                            disabled
                            placeholder="es. Milano (MI)"
                            className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-2.5 text-xs"
                          />
                        </div>
                      </>
                    )}

                    <div className="space-y-1 sm:col-span-2">
                      <label className="text-xs font-bold text-slate-700">
                        Codice Fiscale {previewMode === "child" ? "Genitore *" : "*"}
                      </label>
                      <input
                        disabled
                        placeholder="RSSMRA80A01H501Z"
                        className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-2.5 text-xs font-mono"
                      />
                    </div>
                  </div>

                  {/* Purchaser Custom Fields */}
                  {purchaserFields.filter((f) => f.is_enabled).length > 0 && (
                    <div className="pt-3 border-t border-slate-100 space-y-3">
                      <p className="text-[11px] font-bold text-[#FAA904] uppercase tracking-wider">
                        ✨ Domande Aggiuntive Acquirente
                      </p>
                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                        {purchaserFields
                          .filter((f) => f.is_enabled)
                          .map((f) => (
                            <div key={f.id} className="space-y-1">
                              <label className="text-xs font-bold text-slate-700">
                                {f.label} {f.is_required && <span className="text-red-500">*</span>}
                              </label>
                              {f.field_type === FormFieldType.SELECT ? (
                                <select className="w-full bg-amber-50/50 border border-amber-200 rounded-xl px-3 py-2 text-xs">
                                  <option>{f.placeholder || "Seleziona..."}</option>
                                  {f.options?.map((o, idx) => (
                                    <option key={idx}>
                                      {typeof o === "string" ? o : o.label}
                                    </option>
                                  ))}
                                </select>
                              ) : (
                                <input
                                  placeholder={f.placeholder}
                                  className="w-full bg-amber-50/50 border border-amber-200 rounded-xl px-3 py-2 text-xs"
                                />
                              )}
                            </div>
                          ))}
                      </div>
                    </div>
                  )}
                </div>

                {/* If Child Mode: Render Student Card */}
                {previewMode === "child" && (
                  <div className="p-5 rounded-2xl bg-indigo-50/40 border border-indigo-200/80 space-y-4">
                    <div className="flex items-center justify-between">
                      <h3 className="text-xs font-black uppercase tracking-wider text-indigo-950 flex items-center gap-2">
                        🎓 DATI DEGLI STUDENTI (1)
                      </h3>
                      <Badge className="bg-indigo-100 text-indigo-900 border-indigo-300 text-[10px]">
                        1 Studente
                      </Badge>
                    </div>

                    <div className="bg-white p-4 rounded-xl border border-indigo-100 space-y-3">
                      <p className="text-xs font-black text-slate-900">1. STUDENTE #1</p>
                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                        <div className="space-y-1">
                          <label className="text-xs font-bold text-slate-700">Nome Studente *</label>
                          <input
                            disabled
                            placeholder="Luca"
                            className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 text-xs"
                          />
                        </div>
                        <div className="space-y-1">
                          <label className="text-xs font-bold text-slate-700">Cognome Studente *</label>
                          <input
                            disabled
                            placeholder="Rossi"
                            className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 text-xs"
                          />
                        </div>
                        <div className="space-y-1 sm:col-span-2">
                          <label className="text-xs font-bold text-slate-700">Codice Fiscale Studente *</label>
                          <input
                            disabled
                            placeholder="RSSLCU10A01H501Z"
                            className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 text-xs font-mono"
                          />
                        </div>
                        <div className="space-y-1">
                          <label className="text-xs font-bold text-slate-700">Data di Nascita *</label>
                          <input
                            disabled
                            placeholder="mm/dd/yyyy"
                            className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 text-xs"
                          />
                        </div>
                        <div className="space-y-1">
                          <label className="text-xs font-bold text-slate-700">Luogo di Nascita *</label>
                          <input
                            disabled
                            placeholder="es. Roma (RM)"
                            className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 text-xs"
                          />
                        </div>
                      </div>

                      {/* Student Custom Fields */}
                      {studentFields.filter((f) => f.is_enabled).length > 0 && (
                        <div className="pt-3 border-t border-slate-100 space-y-2">
                          <p className="text-[11px] font-bold text-[#FAA904] uppercase tracking-wider">
                            ✨ Domande per lo Studente
                          </p>
                          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                            {studentFields
                              .filter((f) => f.is_enabled)
                              .map((f) => (
                                <div key={f.id} className="space-y-1">
                                  <label className="text-xs font-bold text-slate-700">
                                    {f.label} {f.is_required && <span className="text-red-500">*</span>}
                                  </label>
                                  {f.field_type === FormFieldType.SELECT ? (
                                    <select className="w-full bg-amber-50/50 border border-amber-200 rounded-xl px-3 py-2 text-xs">
                                      <option>{f.placeholder || "Seleziona..."}</option>
                                      {f.options?.map((o, idx) => (
                                        <option key={idx}>
                                          {typeof o === "string" ? o : o.label}
                                        </option>
                                      ))}
                                    </select>
                                  ) : (
                                    <input
                                      placeholder={f.placeholder}
                                      className="w-full bg-amber-50/50 border border-amber-200 rounded-xl px-3 py-2 text-xs"
                                    />
                                  )}
                                </div>
                              ))}
                          </div>
                        </div>
                      )}
                    </div>

                    <button className="w-full py-2.5 rounded-xl border-2 border-dashed border-indigo-200 text-indigo-700 text-xs font-bold bg-white hover:bg-indigo-50/50">
                      + AGGIUNGI UN ALTRO STUDENTE
                    </button>
                  </div>
                )}

                {/* Student Custom Fields in Direct Mode */}
                {previewMode === "direct" && studentFields.filter((f) => f.is_enabled).length > 0 && (
                  <div className="pt-3 border-t border-slate-100 space-y-3">
                    <h3 className="text-xs font-black uppercase tracking-wider text-[#043569]">
                      INFORMAZIONI AGGIUNTIVE
                    </h3>
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5">
                      {studentFields
                        .filter((f) => f.is_enabled)
                        .map((f) => (
                          <div key={f.id} className="space-y-1">
                            <label className="text-xs font-bold text-slate-700">
                              {f.label} {f.is_required && <span className="text-red-500">*</span>}
                            </label>
                            {f.field_type === FormFieldType.SELECT ? (
                              <select className="w-full bg-amber-50/50 border border-amber-200 rounded-xl px-3 py-2 text-xs">
                                <option>{f.placeholder || "Seleziona..."}</option>
                                {f.options?.map((o, idx) => (
                                  <option key={idx}>
                                    {typeof o === "string" ? o : o.label}
                                  </option>
                                ))}
                              </select>
                            ) : (
                              <input
                                placeholder={f.placeholder}
                                className="w-full bg-amber-50/50 border border-amber-200 rounded-xl px-3 py-2 text-xs"
                              />
                            )}
                          </div>
                        ))}
                    </div>
                  </div>
                )}

                {/* Electronic Invoicing & Notes */}
                <div className="space-y-4 pt-2 border-t border-slate-100">
                  <div className="flex items-center gap-2">
                    <input type="checkbox" className="w-4 h-4 rounded text-[#043569]" />
                    <span className="text-xs font-bold text-slate-800">
                      Richiedo fatturazione elettronica aziendale (Azienda / P.IVA / Freelance)
                    </span>
                  </div>

                  <div className="space-y-1">
                    <label className="text-xs font-bold text-slate-700">
                      Note o richieste per la segreteria (opzionale)
                    </label>
                    <textarea
                      rows={2}
                      placeholder="Es. preferenze orarie, segnalazioni didattiche..."
                      className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 text-xs"
                    />
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>
      )}

      {/* ── Dialog 1: Add Field from Database Catalog Modal ── */}
      <Dialog open={catalogModalOpen} onOpenChange={setCatalogModalOpen}>
        <DialogContent className="max-w-2xl max-h-[85vh] flex flex-col p-0 gap-0 overflow-hidden">
          <DialogHeader className="p-4 pb-3 border-b bg-muted/20 shrink-0">
            <div className="flex items-center gap-2">
              <div className="p-1.5 rounded-md bg-primary/10 text-primary">
                <Layers className="w-4 h-4" />
              </div>
              <div>
                <DialogTitle className="text-sm font-bold">
                  {locale === "en" ? "Add Field from Catalog" : "Aggiungi Campo dal Catalogo"}
                </DialogTitle>
                <DialogDescription className="text-xs text-muted-foreground">
                  {locale === "en"
                    ? "Select fields defined in the database catalog to attach to this form template."
                    : "Seleziona i campi dal database da includere in questo modello di form."}
                </DialogDescription>
              </div>
            </div>

            {/* Filter and Search Bar */}
            <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-2 pt-3">
              <div className="relative flex-1">
                <Search className="w-3.5 h-3.5 absolute left-2.5 top-1/2 -translate-y-1/2 text-muted-foreground" />
                <Input
                  value={catalogSearch}
                  onChange={(e) => setCatalogSearch(e.target.value)}
                  placeholder={locale === "en" ? "Search catalog by name or key..." : "Cerca campo per nome o chiave..."}
                  className="pl-8 h-8 text-xs"
                />
              </div>

              <div className="flex items-center gap-1 bg-muted/60 p-0.5 rounded-md border shrink-0 overflow-x-auto">
                {[
                  { id: "all", label: locale === "en" ? "All" : "Tutti" },
                  { id: FormFieldTarget.PURCHASER, label: locale === "en" ? "Purchaser" : "Acquirente" },
                  { id: FormFieldTarget.STUDENT, label: locale === "en" ? "Student" : "Studente" },
                  { id: FormFieldTarget.BOOKING, label: locale === "en" ? "Booking" : "Iscrizione" },
                  { id: FormFieldTarget.CONTACT, label: locale === "en" ? "Contact" : "Contatto" },
                ].map((tab) => (
                  <button
                    key={tab.id}
                    type="button"
                    onClick={() => setCatalogTargetFilter(tab.id)}
                    className={`px-2 py-1 rounded text-[11px] font-medium transition-all cursor-pointer whitespace-nowrap ${
                      catalogTargetFilter === tab.id
                        ? "bg-background text-foreground shadow-xs font-semibold"
                        : "text-muted-foreground hover:text-foreground"
                    }`}
                  >
                    {tab.label}
                  </button>
                ))}
              </div>
            </div>
          </DialogHeader>

          <div className="flex-1 overflow-y-auto p-4 space-y-2 max-h-[50vh]">
            {loadingCatalog ? (
              <div className="py-8 text-center text-xs text-muted-foreground">
                {locale === "en" ? "Loading database catalog..." : "Caricamento catalogo campi..."}
              </div>
            ) : filteredCatalogFields.length === 0 ? (
              <div className="py-8 text-center space-y-1">
                <HelpCircle className="w-8 h-8 text-muted-foreground/40 mx-auto" />
                <p className="text-xs font-medium text-foreground">
                  {locale === "en" ? "No available fields found" : "Nessun campo disponibile"}
                </p>
                <p className="text-[11px] text-muted-foreground max-w-sm mx-auto">
                  {catalogSearch
                    ? locale === "en"
                      ? "Try changing your search keywords or filter category."
                      : "Prova a modificare i termini di ricerca o la categoria."
                    : locale === "en"
                    ? "All available fields from the catalog are already added to this form."
                    : "Tutti i campi disponibili dal catalogo sono già stati aggiunti a questo modulo."}
                </p>
              </div>
            ) : (
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                {filteredCatalogFields.map((cf) => {
                  const isAttached = formData.fields_config.some((fc) => fc.key === cf.key);
                  const isStudent = cf.target === FormFieldTarget.STUDENT;
                  const isPurchaser = cf.target === FormFieldTarget.PURCHASER;

                  return (
                    <div
                      key={cf.id}
                      className={`p-2.5 rounded-lg border transition-all flex flex-col justify-between gap-2 ${
                        isAttached
                          ? "bg-muted/40 border-border/60 opacity-60"
                          : "bg-card border-border hover:border-primary/50 hover:shadow-2xs"
                      }`}
                    >
                      <div className="space-y-1 min-w-0">
                        <div className="flex items-center justify-between gap-1">
                          <span
                            className={`inline-flex items-center gap-1 text-[10px] px-1.5 py-0.2 rounded font-medium ${
                              isStudent
                                ? "bg-blue-500/10 text-blue-700 dark:text-blue-400"
                                : isPurchaser
                                ? "bg-amber-500/10 text-amber-700 dark:text-amber-400"
                                : "bg-purple-500/10 text-purple-700 dark:text-purple-400"
                            }`}
                          >
                            {isStudent ? <User className="w-2.5 h-2.5" /> : <Building className="w-2.5 h-2.5" />}
                            {getFieldTargetLabel(cf.target)}
                          </span>
                          <span className="text-[10px] font-semibold text-muted-foreground uppercase bg-muted px-1.5 py-0.2 rounded">
                            {getFieldTypeLabel(cf.field_type)}
                          </span>
                        </div>

                        <div className="min-w-0">
                          <p className="text-xs font-semibold text-foreground truncate">
                            {locale === "en" ? cf.label_en : cf.label_it}
                          </p>
                          <code className="text-[10px] font-mono text-muted-foreground">{`{{${cf.key}}}`}</code>
                        </div>

                        {(cf.help_text_it || cf.placeholder_it) && (
                          <p className="text-[10px] text-muted-foreground line-clamp-1">
                            {locale === "en" ? cf.help_text_en || cf.placeholder_en : cf.help_text_it || cf.placeholder_it}
                          </p>
                        )}
                      </div>

                      <div className="pt-1.5 border-t flex items-center justify-between gap-2">
                        {cf.is_required_default ? (
                          <span className="text-[9px] font-medium text-amber-600 dark:text-amber-400">
                            * {locale === "en" ? "Required default" : "Obbligatorio"}
                          </span>
                        ) : (
                          <span className="text-[9px] text-muted-foreground">
                            {locale === "en" ? "Optional" : "Facoltativo"}
                          </span>
                        )}

                        <Button
                          type="button"
                          size="sm"
                          variant={isAttached ? "secondary" : "default"}
                          disabled={isAttached}
                          onClick={() => handleAttachCatalogField(cf)}
                          className="h-6 px-2 text-[11px] font-medium gap-1 cursor-pointer"
                        >
                          {isAttached ? (
                            <>
                              <Check className="w-3 h-3 text-emerald-600" />
                              {locale === "en" ? "Added" : "Aggiunto"}
                            </>
                          ) : (
                            <>
                              <Plus className="w-3 h-3" />
                              {locale === "en" ? "Add to Form" : "Aggiungi"}
                            </>
                          )}
                        </Button>
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </div>

          <DialogFooter className="p-3 border-t bg-muted/10 shrink-0 flex items-center justify-between sm:justify-between">
            <span className="text-[11px] text-muted-foreground">
              {formData.fields_config.length} {locale === "en" ? "fields configured in this form" : "campi configurati in questo modulo"}
            </span>
            <Button
              type="button"
              variant="outline"
              size="sm"
              onClick={() => setCatalogModalOpen(false)}
              className="h-7 text-xs cursor-pointer"
            >
              {locale === "en" ? "Done" : "Fatto / Chiudi"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* ── Dialog 2: Edit Attached Field Modal ── */}
      <Dialog open={editModalOpen} onOpenChange={setEditModalOpen}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle className="text-sm font-bold flex items-center gap-2">
              <Edit2 className="w-4 h-4 text-primary" />
              {t("forms.builderDialogEditTitle")}
            </DialogTitle>
            <DialogDescription className="text-xs text-muted-foreground">
              {locale === "en"
                ? "Configure how this field behaves in this specific form template."
                : "Personalizza etichetta, placeholder e obbligatorietà per questo modulo."}
            </DialogDescription>
          </DialogHeader>

          {editingField && (
            <div className="space-y-3 py-1 text-xs">
              <div className="p-2.5 rounded-md bg-muted/40 border space-y-1">
                <div className="flex items-center justify-between">
                  <span className="text-[10px] font-bold text-muted-foreground uppercase">{getFieldTypeLabel(editingField.field_type)}</span>
                  <Badge variant="secondary" className="text-[9px]">{getFieldTargetLabel(editingField.target)}</Badge>
                </div>
                <code className="text-xs font-mono font-semibold text-foreground">{`{{${editingField.key}}}`}</code>
              </div>

              <div className="space-y-1">
                <Label className="text-[11px] font-medium">{t("forms.builderDialogLabelLabel")} *</Label>
                <Input
                  value={editLabel}
                  onChange={(e) => setEditLabel(e.target.value)}
                  placeholder={t("forms.builderDialogLabelPlaceholder")}
                  className="text-xs h-8"
                />
              </div>

              <div className="space-y-1">
                <Label className="text-[11px] font-medium">{t("forms.builderDialogPlaceholderLabel")}</Label>
                <Input
                  value={editPlaceholder}
                  onChange={(e) => setEditPlaceholder(e.target.value)}
                  placeholder={t("forms.builderDialogPlaceholderPlaceholder")}
                  className="text-xs h-8"
                />
              </div>

              <div className="space-y-1">
                <Label className="text-[11px] font-medium">
                  {locale === "en" ? "Help / Tooltip text" : "Testo di aiuto o suggerimento"}
                </Label>
                <Input
                  value={editHelpText}
                  onChange={(e) => setEditHelpText(e.target.value)}
                  placeholder={locale === "en" ? "e.g. Inserisci 7 caratteri..." : "es. Inserisci 7 caratteri del codice SDI"}
                  className="text-xs h-8"
                />
              </div>

              <div className="flex items-center justify-between pt-2 border-t">
                <div>
                  <p className="text-xs font-medium text-foreground">{t("forms.builderDialogRequiredLabel")}</p>
                  <p className="text-[10px] text-muted-foreground">
                    {locale === "en" ? "Blocks checkout if not filled" : "Blocca il checkout se non compilato"}
                  </p>
                </div>
                <Switch
                  checked={editRequired}
                  onCheckedChange={setEditRequired}
                  className="cursor-pointer data-[state=checked]:bg-destructive"
                />
              </div>

              <div className="flex items-center justify-between pt-2 border-t">
                <div>
                  <p className="text-xs font-medium text-foreground">{locale === "en" ? "Field Active in Form" : "Campo Attivo nel Modulo"}</p>
                  <p className="text-[10px] text-muted-foreground">
                    {locale === "en" ? "Show field to customers" : "Mostra questo campo nel modulo"}
                  </p>
                </div>
                <Switch
                  checked={editEnabled}
                  onCheckedChange={setEditEnabled}
                  className="cursor-pointer data-[state=checked]:bg-emerald-600"
                />
              </div>
            </div>
          )}

          <DialogFooter className="gap-2 pt-2 border-t">
            <Button
              type="button"
              variant="outline"
              size="sm"
              onClick={() => setEditModalOpen(false)}
              className="text-xs cursor-pointer h-7"
            >
              {t("forms.builderDialogCancelBtn")}
            </Button>
            <Button
              type="button"
              size="sm"
              onClick={handleSaveEditField}
              disabled={!editLabel.trim()}
              className="text-xs font-semibold cursor-pointer h-7"
            >
              {t("forms.builderDialogSaveBtn")}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
