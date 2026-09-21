"use client";

import React, { useState, useMemo } from "react";
import {
  type FormTemplate,
  type FormFieldConfig,
  FormFieldType,
  FormFieldTarget,
  FormType,
} from "../types";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Switch } from "@/components/ui/switch";
import { Badge } from "@/components/ui/badge";
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
  CheckCircle2,
  ShieldCheck,
  User,
  Users,
  FileText,
  HelpCircle,
  Smartphone,
  Monitor,
  Calendar,
  Building,
  CreditCard,
  Lock,
  Globe,
  Folder,
  GraduationCap,
  ChevronRight,
  Search,
} from "lucide-react";
import { FormPreviewModal } from "./form-preview-modal";
import { useCourses } from "@/features/courses/hooks/use-courses";

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
  const { coursesList, loading: loadingCourses } = useCourses();

  const [formData, setFormData] = useState<FormTemplate>(
    initialForm || {
      id: "",
      title: "Modulo Iscrizione Standard",
      description: "Modulo predefinito per la prenotazione e acquisto dei corsi",
      form_type: FormType.BOOKING,
      is_default: true,
      is_active: true,
      category_slug: null,
      course_id: null,
      fields_config: [
        {
          id: "f-level",
          key: "study_level",
          label: "Livello di partenza stimato",
          placeholder: "Seleziona il tuo livello...",
          field_type: FormFieldType.SELECT,
          target: FormFieldTarget.STUDENT,
          is_required: true,
          is_enabled: true,
          sort_order: 1,
          options: [
            { label: "A1 - Principiante assoluto", value: "A1" },
            { label: "A2 - Elementare", value: "A2" },
            { label: "B1 - Intermedio", value: "B1" },
            { label: "B2 - Intermedio superiore", value: "B2" },
            { label: "C1 - Avanzato", value: "C1" },
            { label: "C2 - Padronanza completa", value: "C2" },
          ],
        },
        {
          id: "f-source",
          key: "heard_from",
          label: "Come hai conosciuto Atena School?",
          placeholder: "Seleziona come ci hai trovati...",
          field_type: FormFieldType.SELECT,
          target: FormFieldTarget.PURCHASER,
          is_required: false,
          is_enabled: true,
          sort_order: 2,
          options: [
            { label: "Passaparola / Amici", value: "word_of_mouth" },
            { label: "Social Network (Instagram / Facebook)", value: "social" },
            { label: "Ricerca Google / Mappe", value: "google" },
            { label: "Volantini / Cartellonistica a scuola", value: "flyers" },
            { label: "Altro", value: "other" },
          ],
        },
      ],
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
  const [previewModalOpen, setPreviewModalOpen] = useState(false);

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

  const handleApplyPreset = (preset: {
    key: string;
    label: string;
    type: FormFieldType;
    target: FormFieldTarget;
    options?: { label: string; value: string }[];
  }) => {
    const newField: FormFieldConfig = {
      id: `field-${Date.now()}`,
      key: preset.key,
      label: preset.label,
      field_type: preset.type,
      target: preset.target,
      is_required: false,
      is_enabled: true,
      sort_order: formData.fields_config.length + 1,
      options: preset.options,
    };

    setFormData((prev) => ({
      ...prev,
      fields_config: [...prev.fields_config, newField],
    }));
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
    <div className="space-y-6">
      {/* Top Header Actions */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 bg-white p-6 rounded-2xl border border-slate-100 shadow-sm">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <Badge variant="secondary" className="text-[10px] font-bold uppercase tracking-wider">
              {formData.form_type}
            </Badge>
            {formData.is_default && (
              <Badge className="bg-amber-500 text-slate-950 font-black text-[10px]">
                Predefinito Globale
              </Badge>
            )}
            <span
              className={`w-2 h-2 rounded-full ${formData.is_active ? "bg-emerald-500" : "bg-slate-300"}`}
            />
          </div>
          <h2 className="text-xl font-black text-slate-900 flex items-center gap-2">
            <Layers className="w-5 h-5 text-[#FAA904]" />
            {formData.title || "Configurazione Modulo"}
          </h2>
          <p className="text-xs text-slate-500 mt-0.5">
            Personalizza i campi e visualizza esattamente come appare il checkout per corsisti e genitori.
          </p>
        </div>

        <div className="flex items-center gap-2 w-full sm:w-auto">
          <div className="bg-slate-100 p-1 rounded-xl flex items-center gap-1 mr-2">
            <button
              type="button"
              onClick={() => setActiveTab("builder")}
              className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all ${
                activeTab === "builder"
                  ? "bg-white text-[#043569] shadow-xs"
                  : "text-slate-600 hover:text-slate-900"
              }`}
            >
              🛠️ Editor Modulo
            </button>
            <button
              type="button"
              onClick={() => setActiveTab("preview")}
              className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all ${
                activeTab === "preview"
                  ? "bg-white text-[#043569] shadow-xs"
                  : "text-slate-600 hover:text-slate-900"
              }`}
            >
              👁️ Anteprima Live Checkout
            </button>
          </div>

          <Button
            type="button"
            variant="outline"
            size="sm"
            className="gap-1.5 text-xs font-bold"
            onClick={() => setPreviewModalOpen(true)}
          >
            <Eye className="w-3.5 h-3.5" />
            Modal Simulatore
          </Button>

          <Button
            type="button"
            variant="ghost"
            size="sm"
            onClick={onCancel}
            className="text-xs font-bold"
          >
            Annulla
          </Button>

          <Button
            type="button"
            size="sm"
            className="gap-1.5 bg-[#043569] text-white hover:bg-[#032850] font-bold text-xs cursor-pointer"
            onClick={() => onSave(formData)}
            disabled={isSaving || !formData.title.trim()}
          >
            <Save className="w-4 h-4" />
            {isSaving ? "Salvataggio..." : "Salva Modulo"}
          </Button>
        </div>
      </div>

      {activeTab === "builder" ? (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Left Column (1/3): Form Scope & Targeting (100% Database First) */}
          <div className="lg:col-span-1 space-y-6">
            {/* General Settings */}
            <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-sm space-y-4">
              <h3 className="text-xs font-black uppercase tracking-wider text-[#043569] border-b border-slate-100 pb-2 flex items-center gap-1.5">
                <FileText className="w-4 h-4 text-amber-500" />
                1. Informazioni Modulo
              </h3>

              <div className="space-y-1.5">
                <Label className="text-xs font-bold text-slate-800">Titolo Modulo *</Label>
                <Input
                  value={formData.title}
                  onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                  placeholder="Es. Modulo Corsi Bambini (Kids)"
                  className="text-xs font-medium"
                />
              </div>

              <div className="space-y-1.5">
                <Label className="text-xs font-bold text-slate-800">Descrizione interna</Label>
                <Textarea
                  value={formData.description || ""}
                  onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                  placeholder="Note per la segreteria sull'utilizzo..."
                  rows={2}
                  className="text-xs"
                />
              </div>

              <div className="space-y-1.5">
                <Label className="text-xs font-bold text-slate-800">Tipo di Modulo</Label>
                <select
                  value={formData.form_type}
                  onChange={(e) => setFormData({ ...formData, form_type: e.target.value as FormType })}
                  className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 text-xs font-medium"
                >
                  <option value={FormType.BOOKING}>Iscrizione Corso (Booking / Checkout)</option>
                  <option value={FormType.CONTACT}>Contatti & Info (Lead Form)</option>
                  <option value={FormType.TEST}>Test di Livello Inglese</option>
                  <option value={FormType.CUSTOM}>Personalizzato (Custom)</option>
                </select>
              </div>

              <div className="pt-3 border-t border-slate-100 space-y-3">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-xs font-bold text-slate-800">Modulo Attivo</p>
                    <p className="text-[10px] text-slate-400">Abilita o disabilita il modulo</p>
                  </div>
                  <Switch
                    checked={formData.is_active}
                    onCheckedChange={(checked) => setFormData({ ...formData, is_active: checked })}
                  />
                </div>

                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-xs font-bold text-slate-800">Modulo Predefinito</p>
                    <p className="text-[10px] text-slate-400">Usato se nessun altro modulo corrisponde</p>
                  </div>
                  <Switch
                    checked={formData.is_default}
                    onCheckedChange={(checked) => setFormData({ ...formData, is_default: checked })}
                  />
                </div>
              </div>
            </div>

            {/* Scope / Targeting (DATABASE FIRST) */}
            <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-sm space-y-4">
              <h3 className="text-xs font-black uppercase tracking-wider text-[#043569] border-b border-slate-100 pb-2 flex items-center gap-1.5">
                <Sparkles className="w-4 h-4 text-amber-500" />
                2. A Quali Corsi si Applica? (Database First)
              </h3>

              <div className="grid grid-cols-3 gap-1.5 bg-slate-100 p-1 rounded-xl">
                <button
                  type="button"
                  onClick={() => handleScopeChange("global")}
                  className={`py-2 px-1 text-[11px] font-bold rounded-lg transition-all flex flex-col items-center gap-1 text-center ${
                    scopeMode === "global"
                      ? "bg-white text-[#043569] shadow-xs"
                      : "text-slate-600 hover:text-slate-900"
                  }`}
                >
                  <Globe className="w-4 h-4" />
                  Globale
                </button>
                <button
                  type="button"
                  onClick={() => handleScopeChange("category")}
                  className={`py-2 px-1 text-[11px] font-bold rounded-lg transition-all flex flex-col items-center gap-1 text-center ${
                    scopeMode === "category"
                      ? "bg-white text-[#043569] shadow-xs"
                      : "text-slate-600 hover:text-slate-900"
                  }`}
                >
                  <Folder className="w-4 h-4" />
                  Categoria
                </button>
                <button
                  type="button"
                  onClick={() => handleScopeChange("course")}
                  className={`py-2 px-1 text-[11px] font-bold rounded-lg transition-all flex flex-col items-center gap-1 text-center ${
                    scopeMode === "course"
                      ? "bg-white text-[#043569] shadow-xs"
                      : "text-slate-600 hover:text-slate-900"
                  }`}
                >
                  <GraduationCap className="w-4 h-4" />
                  Singolo Corso
                </button>
              </div>

              {scopeMode === "global" && (
                <div className="p-3.5 rounded-xl bg-blue-50/80 border border-blue-200/80 text-blue-900 text-xs leading-relaxed space-y-1">
                  <p className="font-bold flex items-center gap-1 text-blue-950">
                    <Globe className="w-3.5 h-3.5 text-blue-600" />
                    Applicazione su Tutti i Corsi
                  </p>
                  <p className="text-[11px] text-blue-800">
                    Questo modulo sarà utilizzato come standard per tutti i corsi della scuola, a meno che non esista un modulo specifico per categoria o singolo corso.
                  </p>
                </div>
              )}

              {scopeMode === "category" && (
                <div className="space-y-2">
                  <Label className="text-xs font-bold text-slate-800">
                    Seleziona Categoria dal Database
                  </Label>
                  <select
                    value={formData.category_slug || ""}
                    onChange={(e) =>
                      setFormData({
                        ...formData,
                        category_slug: e.target.value || null,
                        course_id: null,
                      })
                    }
                    className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 text-xs font-bold text-slate-800"
                  >
                    <option value="">-- Seleziona una categoria --</option>
                    {availableCategories.map((cat) => {
                      const count = coursesList.filter((c) => String(c.categoria || "").toLowerCase() === cat).length;
                      return (
                        <option key={cat} value={cat}>
                          📂 {cat.toUpperCase()} ({count} corsi nel database)
                        </option>
                      );
                    })}
                  </select>
                  <p className="text-[10px] text-slate-500 leading-tight">
                    Tutti i corsi appartenenti a questa categoria useranno questo modulo automaticamente.
                  </p>
                </div>
              )}

              {scopeMode === "course" && (
                <div className="space-y-3">
                  <div className="flex items-center justify-between">
                    <Label className="text-xs font-bold text-slate-800">
                      Seleziona Corso dal Database
                    </Label>
                    <span className="text-[10px] text-purple-700 font-bold bg-purple-50 px-2 py-0.5 rounded-md">
                      {coursesList.length} corsi disponibili
                    </span>
                  </div>

                  {/* Course Search Filter */}
                  <div className="relative">
                    <Search className="w-3.5 h-3.5 absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
                    <Input
                      value={courseSearch}
                      onChange={(e) => setCourseSearch(e.target.value)}
                      placeholder="Cerca corso per nome o categoria..."
                      className="pl-8 h-8 text-xs rounded-xl bg-slate-50 border-slate-200"
                    />
                  </div>

                  {/* Course Select Dropdown */}
                  <select
                    value={formData.course_id || ""}
                    onChange={(e) =>
                      setFormData({
                        ...formData,
                        course_id: e.target.value || null,
                        category_slug: null,
                      })
                    }
                    className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 text-xs font-bold text-slate-800 cursor-pointer"
                  >
                    <option value="">-- Seleziona il corso --</option>
                    {filteredCourses.map((course) => (
                      <option key={course.id} value={course.id}>
                        📘 {course.nome} — €{course.prezzo} ({course.categoria || "Generale"})
                      </option>
                    ))}
                  </select>

                  {/* Selected Course Card Preview */}
                  {selectedCourse ? (
                    <div className="p-3.5 rounded-xl bg-purple-50/80 border border-purple-200/80 space-y-2">
                      <div className="flex items-center justify-between">
                        <span className="text-[10px] font-black uppercase tracking-wider text-purple-900 flex items-center gap-1">
                          <GraduationCap className="w-3.5 h-3.5 text-purple-600" />
                          Corso Collegato
                        </span>
                        <Badge className="bg-purple-200 text-purple-900 border-purple-300 text-[10px]">
                          €{selectedCourse.prezzo}
                        </Badge>
                      </div>
                      <p className="text-xs font-black text-purple-950">{selectedCourse.nome}</p>
                      <div className="flex items-center gap-2 text-[10px] text-purple-800">
                        <span>Categoria: <strong>{selectedCourse.categoria || "Nessuna"}</strong></span>
                        {selectedCourse.teacherName && (
                          <span>• Docente: <strong>{selectedCourse.teacherName}</strong></span>
                        )}
                      </div>
                    </div>
                  ) : (
                    <p className="text-[10px] text-amber-600 font-medium">
                      ⚠️ Seleziona un corso per attivare la priorità massima su quel corso.
                    </p>
                  )}
                </div>
              )}
            </div>

            {/* Quick Field Presets */}
            <div className="bg-gradient-to-br from-amber-50 to-orange-50 p-5 rounded-2xl border border-amber-200/80 shadow-sm space-y-3">
              <h3 className="text-xs font-black uppercase tracking-wider text-amber-900 flex items-center gap-1.5">
                <Plus className="w-4 h-4 text-amber-600" />
                Domande Pronte (Preimpostate)
              </h3>
              <p className="text-[11px] text-amber-800/80 leading-tight">
                Clicca per aggiungere istantaneamente un campo frequente:
              </p>
              <div className="flex flex-col gap-1.5">
                <Button
                  type="button"
                  variant="outline"
                  size="sm"
                  onClick={() =>
                    handleApplyPreset({
                      key: "study_level",
                      label: "Livello di partenza stimato",
                      type: FormFieldType.SELECT,
                      target: FormFieldTarget.STUDENT,
                      options: [
                        { label: "A1 - Principiante assoluto", value: "A1" },
                        { label: "A2 - Elementare", value: "A2" },
                        { label: "B1 - Intermedio", value: "B1" },
                        { label: "B2 - Intermedio superiore", value: "B2" },
                        { label: "C1 - Avanzato", value: "C1" },
                        { label: "C2 - Padronanza completa", value: "C2" },
                      ],
                    })
                  }
                  className="justify-start text-xs bg-white text-slate-700 border-amber-200 hover:bg-amber-100/50"
                >
                  🎓 + Livello Linguistico (A1-C2)
                </Button>

                <Button
                  type="button"
                  variant="outline"
                  size="sm"
                  onClick={() =>
                    handleApplyPreset({
                      key: "heard_from",
                      label: "Come hai conosciuto Atena School?",
                      type: FormFieldType.SELECT,
                      target: FormFieldTarget.PURCHASER,
                      options: [
                        { label: "Passaparola / Amici", value: "word_of_mouth" },
                        { label: "Social Network (Instagram / FB)", value: "social" },
                        { label: "Ricerca Google / Mappe", value: "google" },
                        { label: "Volantini / Scuola", value: "flyers" },
                        { label: "Altro", value: "other" },
                      ],
                    })
                  }
                  className="justify-start text-xs bg-white text-slate-700 border-amber-200 hover:bg-amber-100/50"
                >
                  📢 + Come ci hai conosciuto?
                </Button>

                <Button
                  type="button"
                  variant="outline"
                  size="sm"
                  onClick={() =>
                    handleApplyPreset({
                      key: "preferred_time",
                      label: "Fascia oraria preferita per essere ricontattato",
                      type: FormFieldType.SELECT,
                      target: FormFieldTarget.PURCHASER,
                      options: [
                        { label: "Mattina (09:00 - 13:00)", value: "morning" },
                        { label: "Pomeriggio (14:00 - 18:00)", value: "afternoon" },
                        { label: "Sera (18:00 - 20:00)", value: "evening" },
                      ],
                    })
                  }
                  className="justify-start text-xs bg-white text-slate-700 border-amber-200 hover:bg-amber-100/50"
                >
                  🕒 + Fascia Oraria Preferita
                </Button>

                <Button
                  type="button"
                  variant="outline"
                  size="sm"
                  onClick={() =>
                    handleApplyPreset({
                      key: "preferred_method",
                      label: "Canale di contatto preferito",
                      type: FormFieldType.SELECT,
                      target: FormFieldTarget.PURCHASER,
                      options: [
                        { label: "WhatsApp", value: "whatsapp" },
                        { label: "Chiamata telefonica", value: "phone" },
                        { label: "Email", value: "email" },
                      ],
                    })
                  }
                  className="justify-start text-xs bg-white text-slate-700 border-amber-200 hover:bg-amber-100/50"
                >
                  📱 + Canale di Contatto Preferito
                </Button>
              </div>
            </div>
          </div>

          {/* Right Column (2/3): Complete Form Structure & Custom Fields Management */}
          <div className="lg:col-span-2 space-y-6">
            {/* 1. Core System Fields Overview (Transparent Breakdown) */}
            <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm space-y-4">
              <div className="flex items-center justify-between">
                <div>
                  <h3 className="text-sm font-black uppercase tracking-wider text-[#043569] flex items-center gap-2">
                    <ShieldCheck className="w-5 h-5 text-emerald-600" />
                    {formData.form_type === FormType.CONTACT
                      ? "Campi di Sistema Obbligatori (Form Contatti / Lead)"
                      : "Campi di Sistema Obbligatori (Core Anagrafica & Fiscale)"}
                  </h3>
                  <p className="text-xs text-slate-500 mt-0.5">
                    {formData.form_type === FormType.CONTACT
                      ? "Campi essenziali per la ricezione, tracciamento e gestione della richiesta nella CRM."
                      : "Questi campi sono sempre presenti e protetti per legge per garantire la fatturazione e il contratto."}
                  </p>
                </div>
                <Badge className="bg-emerald-500/10 text-emerald-800 border-emerald-300 text-[10px] font-bold">
                  🔒 Protetto di sistema
                </Badge>
              </div>

              {/* Core fields grid */}
              <div className="grid grid-cols-2 sm:grid-cols-3 gap-2.5 pt-2">
                {(formData.form_type === FormType.CONTACT
                  ? [
                      { name: "Nome & Cognome", desc: "Mittente della richiesta", lock: true },
                      { name: "Email", desc: "Indirizzo per la risposta", lock: true },
                      { name: "Telefono (WhatsApp)", desc: "Contatto diretto e promemoria", lock: true },
                      { name: "Corso d'Interesse", desc: "Selezione percorso didattico", lock: true },
                      { name: "Messaggio / Richiesta", desc: "Testo libero del cliente", lock: true },
                      { name: "Privacy Policy GDPR", desc: "Consenso legale obbligatorio", lock: true },
                    ]
                  : [
                      { name: "Nome & Cognome", desc: "Acquirente / Studente", lock: true },
                      { name: "Email", desc: "Ricevute e notifiche", lock: true },
                      { name: "Telefono (WhatsApp)", desc: "Contatto segreteria", lock: true },
                      { name: "Codice Fiscale", desc: "Verifica quota €30 & SDI", lock: true },
                      { name: "Data & Luogo Nascita", desc: "Generazione automatica CF", lock: true },
                      { name: "Modalità Genitore", desc: "Sto iscrivendo un figlio", lock: true },
                    ]
                ).map((item, i) => (
                  <div key={i} className="p-3 rounded-xl bg-slate-50 border border-slate-200/80">
                    <div className="flex items-center justify-between text-xs font-bold text-slate-800">
                      <span>{item.name}</span>
                      <Lock className="w-3 h-3 text-slate-400" />
                    </div>
                    <p className="text-[10px] text-slate-500 mt-0.5">{item.desc}</p>
                  </div>
                ))}
              </div>
            </div>

            {/* 2. Custom Dynamic Fields Management */}
            <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm space-y-4">
              <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 border-b border-slate-100 pb-4">
                <div>
                  <h3 className="text-sm font-black uppercase tracking-wider text-[#043569] flex items-center gap-2">
                    <Sparkles className="w-5 h-5 text-amber-500" />
                    Domande & Campi Personalizzati ({formData.fields_config.length})
                  </h3>
                  <p className="text-xs text-slate-500 mt-0.5">
                    Campi dinamici aggiuntivi che verranno mostrati nella sezione &quot;Informazioni Aggiuntive&quot;.
                  </p>
                </div>

                <Button
                  type="button"
                  onClick={handleOpenAddField}
                  className="gap-1.5 bg-[#FAA904] text-slate-950 hover:bg-[#e09804] font-bold text-xs cursor-pointer"
                >
                  <Plus className="w-4 h-4" />
                  Aggiungi Campo
                </Button>
              </div>

              {formData.fields_config.length === 0 ? (
                <div className="text-center py-10 border-2 border-dashed border-slate-200 rounded-2xl bg-slate-50/50">
                  <HelpCircle className="w-8 h-8 text-slate-300 mx-auto mb-2" />
                  <p className="text-xs font-bold text-slate-700">Nessun campo personalizzato attivo</p>
                  <p className="text-[11px] text-slate-400 max-w-sm mx-auto mt-1">
                    Questo modulo conterrà solo i campi base. Clicca su &quot;Aggiungi Campo&quot; per richiedere informazioni aggiuntive.
                  </p>
                </div>
              ) : (
                <div className="space-y-3">
                  {formData.fields_config.map((field, index) => {
                    const isStudent = field.target === FormFieldTarget.STUDENT;

                    return (
                      <div
                        key={field.id}
                        className={`p-4 rounded-xl border transition-all ${
                          field.is_enabled
                            ? "bg-white border-slate-200 shadow-xs"
                            : "bg-slate-50/60 border-slate-200/60 opacity-60"
                        }`}
                      >
                        <div className="flex items-center justify-between gap-3">
                          {/* Left: Reorder buttons & Label */}
                          <div className="flex items-center gap-3">
                            <div className="flex flex-col gap-0.5">
                              <button
                                type="button"
                                disabled={index === 0}
                                onClick={() => handleMoveField(index, "up")}
                                className="p-1 rounded hover:bg-slate-100 text-slate-400 hover:text-slate-700 disabled:opacity-30 cursor-pointer"
                              >
                                <ArrowUp className="w-3.5 h-3.5" />
                              </button>
                              <button
                                type="button"
                                disabled={index === formData.fields_config.length - 1}
                                onClick={() => handleMoveField(index, "down")}
                                className="p-1 rounded hover:bg-slate-100 text-slate-400 hover:text-slate-700 disabled:opacity-30 cursor-pointer"
                              >
                                <ArrowDown className="w-3.5 h-3.5" />
                              </button>
                            </div>

                            <div>
                              <div className="flex items-center gap-2 flex-wrap">
                                <h4 className="text-xs font-bold text-slate-900">
                                  {field.label}
                                </h4>
                                <code className="bg-slate-100 text-slate-600 px-1.5 py-0.5 rounded text-[10px] font-mono">
                                  {`{{${field.key}}}`}
                                </code>
                                {field.is_required && (
                                  <Badge variant="destructive" className="text-[9px] py-0 px-1.5 font-bold">
                                    Obbligatorio
                                  </Badge>
                                )}
                              </div>

                              <div className="flex items-center gap-2 mt-1 text-[11px] text-slate-500">
                                <span className="bg-blue-50 text-blue-700 font-bold px-2 py-0.5 rounded text-[10px] uppercase">
                                  {field.field_type}
                                </span>
                                <span className="flex items-center gap-1 font-medium">
                                  {isStudent ? (
                                    <>
                                      <User className="w-3 h-3 text-purple-600" />
                                      Studente
                                    </>
                                  ) : (
                                    <>
                                      <Building className="w-3 h-3 text-amber-600" />
                                      Acquirente
                                    </>
                                  )}
                                </span>
                                {field.options && (
                                  <span className="text-slate-400">
                                    • {field.options.length} opzioni
                                  </span>
                                )}
                              </div>
                            </div>
                          </div>

                          {/* Right: Actions */}
                          <div className="flex items-center gap-1">
                            <Switch
                              checked={field.is_enabled}
                              onCheckedChange={(checked) => {
                                setFormData((prev) => ({
                                  ...prev,
                                  fields_config: prev.fields_config.map((f) =>
                                    f.id === field.id ? { ...f, is_enabled: checked } : f
                                  ),
                                }));
                              }}
                              className="mr-2"
                              title="Abilita / Disabilita campo"
                            />
                            <Button
                              type="button"
                              size="sm"
                              variant="ghost"
                              className="h-8 w-8 p-0 text-slate-500 hover:text-slate-900 cursor-pointer"
                              onClick={() => handleOpenEditField(field)}
                            >
                              <Edit2 className="w-3.5 h-3.5" />
                            </Button>
                            <Button
                              type="button"
                              size="sm"
                              variant="ghost"
                              className="h-8 w-8 p-0 text-red-500 hover:bg-red-50 cursor-pointer"
                              onClick={() => handleDeleteField(field.id)}
                            >
                              <Trash2 className="w-3.5 h-3.5" />
                            </Button>
                          </div>
                        </div>
                      </div>
                    );
                  })}
                </div>
              )}
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
        <DialogContent className="max-w-lg bg-white rounded-2xl p-6">
          <DialogHeader>
            <DialogTitle className="text-base font-black text-slate-900 flex items-center gap-2">
              <Sparkles className="w-4 h-4 text-[#FAA904]" />
              {editingField ? "Modifica Campo" : "Aggiungi Campo Personalizzato"}
            </DialogTitle>
          </DialogHeader>

          <div className="space-y-4 py-3">
            <div className="space-y-1.5">
              <Label className="text-xs font-bold text-slate-700">Etichetta Visibile (Label) *</Label>
              <Input
                value={fieldLabel}
                onChange={(e) => setFieldLabel(e.target.value)}
                placeholder="Es. Livello di partenza stimato"
                className="text-xs"
              />
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div className="space-y-1.5">
                <Label className="text-xs font-bold text-slate-700">Chiave Tecnica (Key)</Label>
                <Input
                  value={fieldKey}
                  onChange={(e) => setFieldKey(e.target.value)}
                  placeholder="study_level"
                  className="text-xs font-mono"
                />
              </div>

              <div className="space-y-1.5">
                <Label className="text-xs font-bold text-slate-700">Tipo di Input</Label>
                <select
                  value={fieldType}
                  onChange={(e) => setFieldType(e.target.value as FormFieldType)}
                  className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 text-xs"
                >
                  <option value={FormFieldType.TEXT}>Testo Singolo (Text)</option>
                  <option value={FormFieldType.SELECT}>Menu a Tendina (Select)</option>
                  <option value={FormFieldType.RADIO}>Scelta Singola (Radio)</option>
                  <option value={FormFieldType.CHECKBOX}>Casella Singola (Checkbox)</option>
                  <option value={FormFieldType.NUMBER}>Numero (Number)</option>
                  <option value={FormFieldType.DATE}>Data (Date)</option>
                  <option value={FormFieldType.TEXTAREA}>Testo Esteso (Textarea)</option>
                </select>
              </div>
            </div>

            <div className="space-y-1.5">
              <Label className="text-xs font-bold text-slate-700">Destinatario del Dato (Target)</Label>
              <select
                value={fieldTarget}
                onChange={(e) => setFieldTarget(e.target.value as FormFieldTarget)}
                className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 text-xs"
              >
                <option value={FormFieldTarget.STUDENT}>👤 Studente (ripetuto per ogni figlio/corsista)</option>
                <option value={FormFieldTarget.PURCHASER}>💳 Acquirente / Genitore (un solo dato globale)</option>
                <option value={FormFieldTarget.BOOKING}>📦 Prenotazione Generale</option>
              </select>
            </div>

            {(fieldType === FormFieldType.SELECT || fieldType === FormFieldType.RADIO) && (
              <div className="space-y-1.5">
                <Label className="text-xs font-bold text-slate-700">
                  Opzioni di Scelta (una per riga: &quot;Etichetta:Valore&quot;)
                </Label>
                <Textarea
                  value={fieldOptionsText}
                  onChange={(e) => setFieldOptionsText(e.target.value)}
                  placeholder="A1 - Principiante:A1&#10;A2 - Elementare:A2&#10;B1 - Intermedio:B1"
                  rows={4}
                  className="text-xs font-mono"
                />
              </div>
            )}

            <div className="space-y-1.5">
              <Label className="text-xs font-bold text-slate-700">Placeholder o Testo di Esempio</Label>
              <Input
                value={fieldPlaceholder}
                onChange={(e) => setFieldPlaceholder(e.target.value)}
                placeholder="Es. Seleziona il livello desiderato..."
                className="text-xs"
              />
            </div>

            {/* Live Visual Preview of the Field inside the Dialog */}
            <div className="p-3.5 rounded-xl bg-slate-50 border border-slate-200/80 space-y-2">
              <div className="flex items-center justify-between">
                <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">
                  Anteprima dal vivo
                </span>
                <span className="text-[10px] font-bold text-[#043569] bg-blue-50 px-2 py-0.5 rounded">
                  {fieldTarget === FormFieldTarget.STUDENT ? "👤 Per lo studente" : "💳 Per l'acquirente"}
                </span>
              </div>
              <div className="space-y-1">
                <label className="text-xs font-bold text-slate-800">
                  {fieldLabel || "Nome del campo"} {fieldRequired && <span className="text-red-500">*</span>}
                </label>
                {fieldType === FormFieldType.SELECT ? (
                  <select className="w-full bg-white border border-slate-200 rounded-lg px-2.5 py-1.5 text-xs text-slate-700">
                    <option>{fieldPlaceholder || "-- Seleziona opzione --"}</option>
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
                    placeholder={fieldPlaceholder || "Scrivi qui..."}
                    className="w-full bg-white border border-slate-200 rounded-lg px-2.5 py-1.5 text-xs"
                  />
                ) : fieldType === FormFieldType.CHECKBOX ? (
                  <div className="flex items-center gap-2 pt-1">
                    <input type="checkbox" className="w-4 h-4 rounded text-[#043569]" />
                    <span className="text-xs text-slate-600">{fieldPlaceholder || "Confermo"}</span>
                  </div>
                ) : (
                  <input
                    type={fieldType === FormFieldType.NUMBER ? "number" : fieldType === FormFieldType.DATE ? "date" : "text"}
                    placeholder={fieldPlaceholder || "Inserisci..."}
                    className="w-full bg-white border border-slate-200 rounded-lg px-2.5 py-1.5 text-xs"
                  />
                )}
              </div>
            </div>

            <div className="flex items-center justify-between pt-2 border-t border-slate-100">
              <div>
                <p className="text-xs font-bold text-slate-800">Campo Obbligatorio</p>
                <p className="text-[10px] text-slate-400">Blocca il checkout se non compilato</p>
              </div>
              <Switch checked={fieldRequired} onCheckedChange={setFieldRequired} />
            </div>
          </div>

          <DialogFooter className="gap-2">
            <Button
              type="button"
              variant="outline"
              size="sm"
              onClick={() => setFieldDialogOpen(false)}
            >
              Annulla
            </Button>
            <Button
              type="button"
              size="sm"
              className="bg-[#043569] text-white hover:bg-[#032850]"
              onClick={handleSaveFieldDialog}
              disabled={!fieldLabel.trim()}
            >
              {editingField ? "Salva Modifiche" : "Aggiungi al Modulo"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Standalone Simulator Modal */}
      <FormPreviewModal
        isOpen={previewModalOpen}
        onClose={() => setPreviewModalOpen(false)}
        form={formData}
      />
    </div>
  );
}
