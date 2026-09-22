"use client";

import React, { useState, useMemo } from "react";
import {
  type FormTemplate,
  type FormFieldConfig,
  FormFieldType,
  FormFieldTarget,
  FormType,
  FORM_TYPE_DICTIONARY,
  FORM_FIELD_TYPE_DICTIONARY,
  FORM_FIELD_TARGET_DICTIONARY,
  parseFormType,
} from "../types";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Switch } from "@/components/ui/switch";
import { Badge } from "@/components/ui/badge";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
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
  HelpCircle,
  Smartphone,
  Monitor,
  Building,
  Globe,
  Folder,
  GraduationCap,
  ChevronRight,
  Search,
} from "lucide-react";
import { StatusBadge } from "@/components/shared/status-badge";
import { useCourses } from "@/features/courses/hooks/use-courses";
import { useTranslation } from "@/i18n/context";

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
  const { coursesList, loading: loadingCourses } = useCourses();

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

  // Field modal state
  const [editingField, setEditingField] = useState<FormFieldConfig | null>(null);
  const [fieldDialogOpen, setFieldDialogOpen] = useState(false);
  const [fieldKey, setFieldKey] = useState("");
  const [fieldLabel, setFieldLabel] = useState("");
  const [fieldPlaceholder, setFieldPlaceholder] = useState("");
  const [fieldType, setFieldType] = useState<FormFieldType>(FormFieldType.TEXT);
  const [fieldTarget, setFieldTarget] = useState<FormFieldTarget>(FormFieldTarget.STUDENT);
  const [fieldRequired, setFieldRequired] = useState(false);
  const [fieldEnabled, setFieldEnabled] = useState(true);
  const [fieldHelpText, setFieldHelpText] = useState("");
  const [fieldOptionsText, setFieldOptionsText] = useState("");

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

  const handleOpenAddField = () => {
    setEditingField(null);
    setFieldKey("");
    setFieldLabel("");
    setFieldPlaceholder("");
    setFieldType(FormFieldType.TEXT);
    setFieldTarget(FormFieldTarget.STUDENT);
    setFieldRequired(false);
    setFieldEnabled(true);
    setFieldHelpText("");
    setFieldOptionsText("");
    setFieldDialogOpen(true);
  };

  const handleOpenEditField = (f: FormFieldConfig) => {
    setEditingField(f);
    setFieldKey(f.key);
    setFieldLabel(f.label);
    setFieldPlaceholder(f.placeholder || "");
    setFieldType(f.field_type);
    setFieldTarget(f.target);
    setFieldRequired(f.is_required);
    setFieldEnabled(f.is_enabled);
    setFieldHelpText(f.help_text || "");
    setFieldOptionsText(
      f.options
        ? f.options
            .map((o) => (typeof o === "string" ? `${o}:${o}` : `${o.label}:${o.value}`))
            .join("\n")
        : ""
    );
    setFieldDialogOpen(true);
  };


  const handleSaveFieldDialog = () => {
    if (!fieldLabel.trim()) return;

    const normalizedKey =
      fieldKey.trim() ||
      fieldLabel
        .toLowerCase()
        .replace(/[^a-z0-9]/g, "_")
        .replace(/_+/g, "_");

    const parsedOptions = fieldOptionsText
      .split("\n")
      .map((line) => line.trim())
      .filter(Boolean)
      .map((line) => {
        const [label, val] = line.split(":");
        return {
          label: label.trim(),
          value: (val || label).trim(),
        };
      });

    const newField: FormFieldConfig = {
      id: editingField?.id || `field-${Date.now()}`,
      key: normalizedKey,
      label: fieldLabel,
      placeholder: fieldPlaceholder || undefined,
      field_type: fieldType,
      target: fieldTarget,
      is_required: fieldRequired,
      is_enabled: fieldEnabled,
      sort_order: editingField ? editingField.sort_order : formData.fields_config.length + 1,
      help_text: fieldHelpText || undefined,
      options: parsedOptions.length > 0 ? parsedOptions : undefined,
    };

    if (editingField) {
      setFormData((prev) => ({
        ...prev,
        fields_config: prev.fields_config.map((f) =>
          f.id === editingField.id ? newField : f
        ),
      }));
    } else {
      setFormData((prev) => ({
        ...prev,
        fields_config: [...prev.fields_config, newField],
      }));
    }

    setFieldDialogOpen(false);
  };

  const handleDeleteField = (id: string) => {
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

  const studentFields = formData.fields_config.filter(
    (f) => f.target === FormFieldTarget.STUDENT
  );
  const purchaserFields = formData.fields_config.filter(
    (f) => f.target === FormFieldTarget.PURCHASER || f.target === FormFieldTarget.BOOKING
  );

  return (
    <div className="flex flex-col gap-6">
      {/* ── Top Header Bar ── */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 border-b pb-4">
        <div className="space-y-1">
          <Button
            type="button"
            variant="ghost"
            size="sm"
            onClick={onCancel}
            className="gap-1.5 text-xs text-muted-foreground hover:text-foreground cursor-pointer -ml-2 h-7 px-2"
          >
            <ChevronRight className="w-3.5 h-3.5 rotate-180" />
            {t("forms.builderBackBtn")}
          </Button>
          <div className="flex items-center gap-2.5 flex-wrap">
            <h1 className="text-xl font-bold tracking-tight text-foreground">
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
            <p className="text-xs text-muted-foreground line-clamp-1">{formData.description}</p>
          )}
        </div>

        <div className="flex items-center gap-2 w-full sm:w-auto">
          <div className="flex rounded-lg bg-muted/50 p-1 border">
            <button
              type="button"
              onClick={() => setActiveTab("builder")}
              className={`flex items-center gap-1.5 px-3 py-1.5 rounded-md text-xs font-semibold transition-all cursor-pointer ${
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
              className={`flex items-center gap-1.5 px-3 py-1.5 rounded-md text-xs font-semibold transition-all cursor-pointer ${
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
            className="text-xs cursor-pointer h-8"
          >
            {t("forms.builderCancel")}
          </Button>

          <Button
            type="button"
            size="sm"
            onClick={() => onSave(formData)}
            disabled={isSaving || !formData.title.trim()}
            className="font-semibold text-xs shadow-xs gap-1.5 cursor-pointer h-8"
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
            <Card className="border">
              <CardHeader className="px-4 py-2.5 border-b">
                <CardTitle className="text-xs font-semibold flex items-center gap-1.5">
                  <FileText className="w-3.5 h-3.5 text-primary" />
                  {t("forms.builderInfoTitle")}
                </CardTitle>
              </CardHeader>
              <CardContent className="p-4 space-y-3">
                <div className="space-y-1">
                  <Label className="text-xs font-medium">{t("forms.builderTitleLabel")}</Label>
                  <Input
                    value={formData.title}
                    onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                    placeholder={t("forms.builderTitlePlaceholder")}
                    className="text-xs h-8"
                  />
                </div>

                <div className="space-y-1">
                  <Label className="text-xs font-medium">{t("forms.builderDescLabel")}</Label>
                  <Textarea
                    value={formData.description || ""}
                    onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                    placeholder={t("forms.builderDescPlaceholder")}
                    rows={1}
                    className="text-xs resize-none"
                  />
                </div>

                <div className="space-y-1">
                  <Label className="text-xs font-medium">{t("forms.builderTypeLabel")}</Label>
                  <select
                    value={formData.form_type}
                    onChange={(e) => setFormData({ ...formData, form_type: e.target.value as FormType })}
                    className="w-full bg-background border border-border rounded-md px-2.5 py-1.5 text-xs font-medium text-foreground cursor-pointer"
                  >
                    {Object.entries(FORM_TYPE_DICTIONARY).map(([key, dict]) => (
                      <option key={key} value={key}>
                        {locale === "en" ? dict.label_en : dict.label_it}
                      </option>
                    ))}
                  </select>
                </div>

                <div className="flex items-center gap-4 pt-1 border-t">
                  <div className="flex items-center justify-between flex-1">
                    <span className="text-xs font-medium">{t("forms.builderActiveLabel")}</span>
                    <Switch
                      checked={formData.is_active}
                      onCheckedChange={(checked) => setFormData({ ...formData, is_active: checked })}
                      className="cursor-pointer data-[state=checked]:bg-emerald-600 scale-90"
                    />
                  </div>
                  <div className="flex items-center justify-between flex-1">
                    <span className="text-xs font-medium">{t("forms.builderDefaultLabel")}</span>
                    <Switch
                      checked={formData.is_default}
                      onCheckedChange={(checked) => setFormData({ ...formData, is_default: checked })}
                      className="cursor-pointer data-[state=checked]:bg-amber-500 scale-90"
                    />
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Scope / Destination Card */}
            <Card className="border">
              <CardHeader className="px-4 py-2.5 border-b">
                <CardTitle className="text-xs font-semibold flex items-center gap-1.5">
                  <Sparkles className="w-3.5 h-3.5 text-primary" />
                  {t("forms.builderScopeTitle")}
                </CardTitle>
              </CardHeader>
              <CardContent className="p-4 space-y-3">
                {formData.form_type === FormType.CONTACT ? (
                  <div className="p-2.5 rounded-lg bg-blue-500/10 border border-blue-500/20 text-xs flex items-center gap-2">
                    <Globe className="w-3.5 h-3.5 text-blue-600 shrink-0" />
                    <p className="text-muted-foreground">{t("forms.builderScopeContactHint")}</p>
                  </div>
                ) : (
                  <>
                    <div className="grid grid-cols-3 gap-1 bg-muted/50 p-1 rounded-lg border">
                      <button
                        type="button"
                        onClick={() => handleScopeChange("global")}
                        className={`py-1.5 px-1 text-[11px] font-semibold rounded transition-all cursor-pointer flex flex-col items-center gap-1 text-center ${
                          scopeMode === "global"
                            ? "bg-background text-foreground shadow-xs"
                            : "text-muted-foreground hover:text-foreground"
                        }`}
                      >
                        <Globe className="w-3.5 h-3.5" />
                        {t("forms.builderScopeGlobal")}
                      </button>
                      <button
                        type="button"
                        onClick={() => handleScopeChange("category")}
                        className={`py-1.5 px-1 text-[11px] font-semibold rounded transition-all cursor-pointer flex flex-col items-center gap-1 text-center ${
                          scopeMode === "category"
                            ? "bg-background text-foreground shadow-xs"
                            : "text-muted-foreground hover:text-foreground"
                        }`}
                      >
                        <Folder className="w-3.5 h-3.5" />
                        {t("forms.builderScopeCategory")}
                      </button>
                      <button
                        type="button"
                        onClick={() => handleScopeChange("course")}
                        className={`py-1.5 px-1 text-[11px] font-semibold rounded transition-all cursor-pointer flex flex-col items-center gap-1 text-center ${
                          scopeMode === "course"
                            ? "bg-background text-foreground shadow-xs"
                            : "text-muted-foreground hover:text-foreground"
                        }`}
                      >
                        <GraduationCap className="w-3.5 h-3.5" />
                        {t("forms.builderScopeCourse")}
                      </button>
                    </div>

                    {scopeMode === "global" && (
                      <p className="text-[11px] text-muted-foreground bg-muted/40 px-2.5 py-2 rounded-md">
                        🌐 {t("forms.builderScopeGlobalHint")}
                      </p>
                    )}

                    {scopeMode === "category" && (
                      <div className="space-y-1">
                        <Label className="text-xs font-medium">{t("forms.builderScopeCategoryLabel")}</Label>
                        <select
                          value={formData.category_slug || ""}
                          onChange={(e) =>
                            setFormData({
                              ...formData,
                              category_slug: e.target.value || null,
                              course_id: null,
                            })
                          }
                          className="w-full bg-background border border-border rounded-md px-2.5 py-1.5 text-xs font-medium text-foreground cursor-pointer"
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
                      <div className="space-y-2">
                        <div className="relative">
                          <Search className="w-3.5 h-3.5 absolute left-2.5 top-1/2 -translate-y-1/2 text-muted-foreground" />
                          <Input
                            value={courseSearch}
                            onChange={(e) => setCourseSearch(e.target.value)}
                            placeholder={t("forms.builderScopeCourseFilterPlaceholder")}
                            className="pl-8 h-7 text-xs rounded-md"
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
                          className="w-full bg-background border border-border rounded-md px-2.5 py-1.5 text-xs font-medium text-foreground cursor-pointer"
                        >
                          <option value="">{t("forms.builderScopeCoursePlaceholder")}</option>
                          {filteredCourses.map((course) => (
                            <option key={course.id} value={course.id}>
                              📘 {course.nome} (€{course.prezzo})
                            </option>
                          ))}
                        </select>
                        {selectedCourse && (
                          <div className="px-2.5 py-1.5 rounded-md bg-purple-500/10 border border-purple-500/20 text-xs">
                            <span className="font-semibold text-foreground">{selectedCourse.nome}</span>
                            <span className="text-muted-foreground ml-1.5">• €{selectedCourse.prezzo}</span>
                          </div>
                        )}
                      </div>
                    )}
                  </>
                )}
              </CardContent>
            </Card>
          </div>

          {/* ── Fields: full width ── */}
          <div className="space-y-3">
            {/* Custom Dynamic Fields Card */}
            <Card className="border">
              <CardHeader className="px-4 py-2.5 border-b flex flex-row items-center justify-between gap-4">
                <CardTitle className="text-xs font-semibold flex items-center gap-1.5">
                  <Sparkles className="w-3.5 h-3.5 text-primary" />
                  {t("forms.builderFieldsTitle")} ({formData.fields_config.length})
                </CardTitle>
                <Button
                  type="button"
                  size="sm"
                  onClick={handleOpenAddField}
                  className="gap-1.5 font-semibold text-xs cursor-pointer shadow-xs shrink-0 h-7 px-2.5"
                >
                  <Plus className="w-3.5 h-3.5" />
                  {t("forms.builderAddFieldBtn")}
                </Button>
              </CardHeader>

              <CardContent className="p-4">
                {/* Fields List or Empty State */}
                {formData.fields_config.length === 0 ? (
                  <div className="flex items-center justify-between py-3 px-4 border border-dashed rounded-lg bg-muted/20">
                    <div className="flex items-center gap-2.5">
                      <HelpCircle className="w-4 h-4 text-muted-foreground/40 shrink-0" />
                      <p className="text-xs text-muted-foreground">{t("forms.builderEmptyFields")}</p>
                    </div>
                    <Button
                      type="button"
                      variant="outline"
                      size="sm"
                      onClick={handleOpenAddField}
                      className="text-xs cursor-pointer h-7 px-2.5 shrink-0"
                    >
                      <Plus className="w-3 h-3 mr-1" /> {t("forms.builderAddFirst")}
                    </Button>
                  </div>
                ) : (
                  <div className="space-y-1.5">
                    {formData.fields_config.map((field, index) => {
                      const isStudent = field.target === FormFieldTarget.STUDENT;
                      return (
                        <div
                          key={field.id}
                          className={`px-3 py-2 rounded-lg border transition-all ${
                            field.is_enabled
                              ? "bg-card border-border hover:border-primary/40"
                              : "bg-muted/30 border-border/60 opacity-60"
                          }`}
                        >
                          <div className="flex items-center justify-between gap-2">
                            <div className="flex items-center gap-2 min-w-0">
                              <div className="flex flex-col shrink-0">
                                <button type="button" disabled={index === 0} onClick={() => handleMoveField(index, "up")} className="p-0.5 rounded hover:bg-muted text-muted-foreground disabled:opacity-20 cursor-pointer">
                                  <ArrowUp className="w-3 h-3" />
                                </button>
                                <button type="button" disabled={index === formData.fields_config.length - 1} onClick={() => handleMoveField(index, "down")} className="p-0.5 rounded hover:bg-muted text-muted-foreground disabled:opacity-20 cursor-pointer">
                                  <ArrowDown className="w-3 h-3" />
                                </button>
                              </div>
                              <div className="flex items-center gap-1.5 flex-wrap min-w-0">
                                <span className="text-xs font-semibold text-foreground">{field.label}</span>
                                <code className="bg-muted text-muted-foreground px-1 rounded text-[10px] font-mono">{`{{${field.key}}}`}</code>
                                <span className="bg-primary/10 text-primary px-1.5 rounded text-[10px] font-semibold uppercase">{getFieldTypeLabel(field.field_type)}</span>
                                <span className="flex items-center gap-0.5 text-[10px] text-muted-foreground">
                                  {isStudent ? <User className="w-2.5 h-2.5" /> : <Building className="w-2.5 h-2.5" />}
                                  {getFieldTargetLabel(field.target)}
                                </span>
                                {field.is_required && <Badge variant="destructive" className="text-[9px] py-0 px-1">{locale === "en" ? "Req." : "Obbl."}</Badge>}
                              </div>
                            </div>
                            <div className="flex items-center gap-0.5 shrink-0">
                              <Switch
                                checked={field.is_enabled}
                                onCheckedChange={(checked) => setFormData((prev) => ({ ...prev, fields_config: prev.fields_config.map((f) => f.id === field.id ? { ...f, is_enabled: checked } : f) }))}
                                className="cursor-pointer data-[state=checked]:bg-emerald-600 scale-75"
                              />
                              <Button type="button" size="sm" variant="ghost" className="h-7 w-7 p-0 text-muted-foreground hover:text-foreground cursor-pointer" onClick={() => handleOpenEditField(field)}>
                                <Edit2 className="w-3 h-3" />
                              </Button>
                              <Button type="button" size="sm" variant="ghost" className="h-7 w-7 p-0 text-muted-foreground hover:text-destructive cursor-pointer" onClick={() => handleDeleteField(field.id)}>
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

            {/* System Fields — compact flat row */}
            <div className="flex items-center gap-2 flex-wrap px-1">
              <div className="flex items-center gap-1.5 shrink-0">
                <ShieldCheck className="w-3.5 h-3.5 text-emerald-600" />
                <span className="text-[11px] font-medium text-muted-foreground">{t("forms.builderSystemFieldsLabel")}</span>
              </div>
              {(formData.form_type === FormType.CONTACT
                ? [
                    locale === "en" ? "Full Name" : "Nome & Cognome",
                    "Email",
                    locale === "en" ? "Phone" : "Telefono",
                    locale === "en" ? "Course of Interest" : "Corso d'Interesse",
                    locale === "en" ? "Message" : "Messaggio",
                    "Privacy GDPR"
                  ]
                : [
                    locale === "en" ? "Full Name" : "Nome & Cognome",
                    "Email",
                    locale === "en" ? "Phone" : "Telefono",
                    locale === "en" ? "Tax Code" : "Codice Fiscale",
                    locale === "en" ? "Date & Place of Birth" : "Data & Luogo Nascita",
                    locale === "en" ? "Parent Mode" : "Modalità Genitore"
                  ]
              ).map((name) => (
                <span key={name} className="text-[10px] font-medium bg-muted border rounded px-1.5 py-0.5 text-muted-foreground">
                  {name}
                </span>
              ))}
            </div>
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
                        ✨ Campi Aggiuntivi Configurati ({formData.fields_config.filter(f => f.is_enabled).length})
                      </p>
                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                        {formData.fields_config.filter(f => f.is_enabled).map(f => (
                          <div key={f.id} className="space-y-1">
                            <label className="text-xs font-bold text-slate-700">
                              {f.label} {f.is_required && <span className="text-red-500">*</span>}
                            </label>
                            {f.field_type === FormFieldType.SELECT ? (
                              <select disabled className="w-full bg-blue-50/50 border border-blue-200 rounded-xl px-3 py-2 text-xs">
                                <option>{f.placeholder || "Seleziona..."}</option>
                                {f.options?.map((o: any, idx: number) => (
                                  <option key={idx}>{typeof o === 'string' ? o : o.label}</option>
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
                {/* Checkout Title */}
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

                {/* Login Banner */}
                <div className="p-3.5 rounded-2xl bg-amber-50/70 border border-amber-200/80 flex items-center justify-between gap-3">
                  <div className="flex items-center gap-2 text-xs font-bold text-slate-800">
                    <Sparkles className="w-4 h-4 text-[#FAA904]" />
                    Sei già nostro corsista o genitore?
                  </div>
                  <button className="bg-[#043569] text-white text-xs font-bold px-3 py-1.5 rounded-xl">
                    Accedi per autocompilare
                  </button>
                </div>

              {/* isForChild Toggle Box */}
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

              {/* Purchaser / Parent Data */}
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

                  <div className={`space-y-1 ${previewMode === "direct" ? "sm:col-span-2" : "sm:col-span-2"}`}>
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

      {/* Add / Edit Field Dialog */}
      <Dialog open={fieldDialogOpen} onOpenChange={setFieldDialogOpen}>
        <DialogContent className="max-w-lg">
          <DialogHeader>
            <DialogTitle className="text-base font-bold flex items-center gap-2">
              <Sparkles className="w-4 h-4 text-primary" />
              {editingField ? t("forms.builderDialogEditTitle") : t("forms.builderDialogAddTitle")}
            </DialogTitle>
          </DialogHeader>

          <div className="space-y-4 py-1">
            <div className="space-y-1.5">
              <Label className="text-xs font-medium">{t("forms.builderDialogLabelLabel")} *</Label>
              <Input
                value={fieldLabel}
                onChange={(e) => setFieldLabel(e.target.value)}
                placeholder={t("forms.builderDialogLabelPlaceholder")}
                className="text-xs"
              />
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div className="space-y-1.5">
                <Label className="text-xs font-medium">{t("forms.builderDialogKeyLabel")}</Label>
                <Input
                  value={fieldKey}
                  onChange={(e) => setFieldKey(e.target.value)}
                  placeholder={t("forms.builderDialogKeyPlaceholder")}
                  className="text-xs font-mono"
                />
              </div>

              <div className="space-y-1.5">
                <Label className="text-xs font-medium">{t("forms.builderDialogTypeLabel")}</Label>
                <select
                  value={fieldType}
                  onChange={(e) => setFieldType(e.target.value as FormFieldType)}
                  className="w-full bg-background border border-border rounded-md px-3 py-2 text-xs text-foreground"
                >
                  {Object.entries(FORM_FIELD_TYPE_DICTIONARY).map(([key, dict]) => (
                    <option key={key} value={key}>
                      {locale === "en" ? dict.label_en : dict.label_it}
                    </option>
                  ))}
                </select>
              </div>
            </div>

            <div className="space-y-1.5">
              <Label className="text-xs font-medium">{t("forms.builderDialogTargetLabel")}</Label>
              <select
                value={fieldTarget}
                onChange={(e) => setFieldTarget(e.target.value as FormFieldTarget)}
                className="w-full bg-background border border-border rounded-md px-3 py-2 text-xs text-foreground"
              >
                {Object.entries(FORM_FIELD_TARGET_DICTIONARY).map(([key, dict]) => (
                  <option key={key} value={key}>
                    {locale === "en" ? dict.label_en : dict.label_it}
                  </option>
                ))}
              </select>
            </div>

            {(fieldType === FormFieldType.SELECT || fieldType === FormFieldType.RADIO) && (
              <div className="space-y-1.5">
                <Label className="text-xs font-medium">
                  {t("forms.builderDialogOptionsLabel")}
                </Label>
                <Textarea
                  value={fieldOptionsText}
                  onChange={(e) => setFieldOptionsText(e.target.value)}
                  placeholder={t("forms.builderDialogOptionsPlaceholder")}
                  rows={4}
                  className="text-xs font-mono"
                />
              </div>
            )}

            <div className="space-y-1.5">
              <Label className="text-xs font-medium">{t("forms.builderDialogPlaceholderLabel")}</Label>
              <Input
                value={fieldPlaceholder}
                onChange={(e) => setFieldPlaceholder(e.target.value)}
                placeholder={t("forms.builderDialogPlaceholderPlaceholder")}
                className="text-xs"
              />
            </div>

            {/* Inline live preview */}
            <div className="p-3 rounded-lg bg-muted/40 border space-y-2">
              <div className="flex items-center justify-between">
                <span className="text-[10px] font-semibold text-muted-foreground uppercase tracking-wider">
                  {locale === "en" ? "Preview" : "Anteprima"}
                </span>
                <Badge variant="secondary" className="text-[10px] gap-1">
                  {getFieldTargetLabel(fieldTarget)}
                </Badge>
              </div>
              <div className="space-y-1">
                <label className="text-xs font-semibold text-foreground">
                  {fieldLabel || (locale === "en" ? "Field name" : "Nome del campo")} {fieldRequired && <span className="text-destructive">*</span>}
                </label>
                {fieldType === FormFieldType.SELECT ? (
                  <select className="w-full bg-background border border-border rounded-md px-2.5 py-1.5 text-xs text-foreground">
                    <option>{fieldPlaceholder || (locale === "en" ? "-- Select option --" : "-- Seleziona opzione --")}</option>
                    {fieldOptionsText
                      .split("\n")
                      .filter(Boolean)
                      .map((opt, i) => (
                        <option key={i}>{opt.split(":")[0]}</option>
                      ))}
                  </select>
                ) : fieldType === FormFieldType.TEXTAREA ? (
                  <textarea
                    rows={2}
                    placeholder={fieldPlaceholder || (locale === "en" ? "Write here..." : "Scrivi qui...")}
                    className="w-full bg-background border border-border rounded-md px-2.5 py-1.5 text-xs"
                  />
                ) : fieldType === FormFieldType.CHECKBOX ? (
                  <div className="flex items-center gap-2 pt-1">
                    <input type="checkbox" className="w-4 h-4 rounded" />
                    <span className="text-xs text-muted-foreground">{fieldPlaceholder || (locale === "en" ? "I agree" : "Confermo")}</span>
                  </div>
                ) : (
                  <input
                    type={fieldType === FormFieldType.NUMBER ? "number" : fieldType === FormFieldType.DATE ? "date" : "text"}
                    placeholder={fieldPlaceholder || (locale === "en" ? "Enter value..." : "Inserisci...")}
                    className="w-full bg-background border border-border rounded-md px-2.5 py-1.5 text-xs"
                  />
                )}
              </div>
            </div>

            <div className="flex items-center justify-between pt-2 border-t">
              <div>
                <p className="text-xs font-medium text-foreground">{t("forms.builderDialogRequiredLabel")}</p>
                <p className="text-[10px] text-muted-foreground">
                  {locale === "en" ? "Blocks checkout if not filled" : "Blocca il checkout se non compilato"}
                </p>
              </div>
              <Switch checked={fieldRequired} onCheckedChange={setFieldRequired} className="cursor-pointer" />
            </div>
          </div>

          <DialogFooter className="gap-2">
            <Button
              type="button"
              variant="outline"
              size="sm"
              onClick={() => setFieldDialogOpen(false)}
              className="cursor-pointer"
            >
              {t("forms.builderDialogCancelBtn")}
            </Button>
            <Button
              type="button"
              size="sm"
              onClick={handleSaveFieldDialog}
              disabled={!fieldLabel.trim()}
              className="cursor-pointer"
            >
              {t("forms.builderDialogSaveBtn")}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
