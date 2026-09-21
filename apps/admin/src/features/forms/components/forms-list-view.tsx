import React, { useState } from "react";
import { useForms } from "../hooks/use-forms";
import { type FormTemplate, FormType } from "../types";
import { VisualFormBuilder } from "./visual-form-builder";
import { FormPreviewModal } from "./form-preview-modal";
import { RegistrationFeeSettingsCard } from "@/components/shared/registration-fee-settings-card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
  Plus,
  Layers,
  Star,
  Copy,
  Trash2,
  Edit2,
  Eye,
  CheckCircle2,
  Sparkles,
  ArrowRight,
  Award,
  ChevronDown,
  ChevronUp,
} from "lucide-react";

export function FormsListView() {
  const {
    forms,
    isLoading,
    createForm,
    updateForm,
    deleteForm,
    setDefaultForm,
    duplicateForm,
    isCreating,
    isUpdating,
  } = useForms();

  const [selectedType, setSelectedType] = useState<string>("all");
  const [editingForm, setEditingForm] = useState<FormTemplate | null | "new">(null);
  const [previewForm, setPreviewForm] = useState<FormTemplate | null>(null);
  const [showQuotaCard, setShowQuotaCard] = useState<boolean>(true);

  const filteredForms = forms.filter((f) => {
    if (selectedType === "all") return true;
    return f.form_type === selectedType;
  });

  const handleSave = async (form: FormTemplate) => {
    if (editingForm === "new" || !form.id) {
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

  if (editingForm) {
    return (
      <VisualFormBuilder
        initialForm={editingForm === "new" ? null : editingForm}
        onSave={handleSave}
        onCancel={() => setEditingForm(null)}
        isSaving={isCreating || isUpdating}
      />
    );
  }

  return (
    <div className="space-y-6">
      {/* Top Header & Filter Bar */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 bg-white p-6 rounded-2xl border border-slate-100 shadow-sm">
        <div>
          <h2 className="text-xl font-black text-slate-900 flex items-center gap-2">
            <Layers className="w-5 h-5 text-[#FAA904]" />
            Moduli di Iscrizione & Form Engine
          </h2>
          <p className="text-xs text-slate-500 mt-1">
            Gestisci le domande, i campi personalizzati e i modelli di form sul sito web e nel checkout.
          </p>
        </div>

        <div className="flex items-center gap-2">
          <Button
            variant="outline"
            onClick={() => setShowQuotaCard((prev) => !prev)}
            className="gap-1.5 border-amber-300 text-amber-900 bg-amber-50 hover:bg-amber-100 font-bold text-xs px-3.5"
          >
            <Award className="w-4 h-4 text-amber-600" />
            Quota Associativa
            {showQuotaCard ? <ChevronUp className="w-3.5 h-3.5" /> : <ChevronDown className="w-3.5 h-3.5" />}
          </Button>

          <Button
            onClick={() => setEditingForm("new")}
            className="gap-1.5 bg-[#FAA904] text-slate-950 hover:bg-[#e09804] font-black text-xs px-4"
          >
            <Plus className="w-4 h-4" />
            Crea Nuovo Modulo
          </Button>
        </div>
      </div>

      {/* Quota Associativa Management Block */}
      {showQuotaCard && (
        <RegistrationFeeSettingsCard />
      )}

      {/* Type Filter Pills */}
      <div className="flex flex-wrap items-center gap-2">
        {[
          { label: "Tutti i Moduli", value: "all" },
          { label: "Iscrizioni Corsi (Booking)", value: FormType.BOOKING },
          { label: "Contattaci & Lead", value: FormType.CONTACT },
          { label: "Test Inglese", value: FormType.TEST },
          { label: "Personalizzati", value: FormType.CUSTOM },
        ].map((pill) => (
          <button
            key={pill.value}
            onClick={() => setSelectedType(pill.value)}
            className={`px-3.5 py-1.5 rounded-full text-xs font-bold transition-all ${
              selectedType === pill.value
                ? "bg-[#043569] text-white shadow-sm"
                : "bg-white text-slate-600 border border-slate-200 hover:bg-slate-50"
            }`}
          >
            {pill.label}
          </button>
        ))}
      </div>

      {/* Forms Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
        {filteredForms.map((form) => {
          const fieldsCount = form.fields_config?.length || 0;
          const enabledCount = form.fields_config?.filter((f) => f.is_enabled).length || 0;

          return (
            <div
              key={form.id}
              className={`bg-white rounded-2xl p-5 border flex flex-col justify-between transition-all duration-300 hover:shadow-md ${
                form.is_default
                  ? "border-amber-300 ring-1 ring-amber-300/50 shadow-sm"
                  : "border-slate-200/80 shadow-sm"
              }`}
            >
              <div>
                {/* Badges Row */}
                <div className="flex items-center justify-between gap-2 mb-3">
                  <div className="flex items-center gap-1.5 flex-wrap">
                    <Badge variant="secondary" className="text-[10px] uppercase font-bold px-2 py-0.5">
                      {form.form_type}
                    </Badge>
                    {form.is_default && (
                      <Badge className="bg-amber-500 text-slate-950 font-black text-[10px] gap-1 px-2 py-0.5">
                        <Star className="w-3 h-3 fill-current" />
                        Predefinito
                      </Badge>
                    )}
                  </div>

                  <span
                    className={`inline-block w-2.5 h-2.5 rounded-full ${
                      form.is_active ? "bg-emerald-500" : "bg-slate-300"
                    }`}
                    title={form.is_active ? "Attivo" : "Disattivato"}
                  />
                </div>

                {/* Title & Description */}
                <h3 className="text-base font-bold text-slate-900 leading-tight mb-1">
                  {form.title}
                </h3>
                {form.description && (
                  <p className="text-xs text-slate-500 line-clamp-2 mb-3 leading-relaxed">
                    {form.description}
                  </p>
                )}

                {/* Scope pill */}
                <div className="mt-3 pt-3 border-t border-slate-100 flex flex-wrap items-center gap-1.5 text-[11px] text-slate-500">
                  <span className="font-bold text-slate-700">Target:</span>
                  {form.course_id ? (
                    <span className="bg-purple-50 text-purple-700 font-bold px-2 py-0.5 rounded-md">
                      Corso specifico
                    </span>
                  ) : form.category_slug ? (
                    <span className="bg-blue-50 text-blue-700 font-bold px-2 py-0.5 rounded-md">
                      Categoria: {form.category_slug}
                    </span>
                  ) : (
                    <span className="bg-slate-100 text-slate-700 px-2 py-0.5 rounded-md">
                      Tutti i corsi
                    </span>
                  )}
                </div>

                {/* Fields summary */}
                <div className="mt-2 text-[11px] text-slate-500 flex items-center gap-2">
                  <span className="font-bold text-slate-700">Campi personalizzati:</span>
                  <span className="bg-slate-100 font-bold text-slate-800 px-2 py-0.5 rounded-full">
                    {enabledCount} attivi {fieldsCount !== enabledCount && `(${fieldsCount} tot)`}
                  </span>
                </div>
              </div>

              {/* Bottom Actions */}
              <div className="pt-4 border-t border-slate-100 mt-5 flex items-center justify-between gap-1">
                <div className="flex items-center gap-1">
                  {!form.is_default && (
                    <Button
                      size="sm"
                      variant="ghost"
                      className="h-8 text-xs px-2 text-slate-500 hover:text-amber-600"
                      title="Imposta come predefinito"
                      onClick={() => setDefaultForm(form.id)}
                    >
                      <Star className="w-3.5 h-3.5" />
                    </Button>
                  )}
                  <Button
                    size="sm"
                    variant="ghost"
                    className="h-8 text-xs px-2 text-slate-500 hover:text-slate-900"
                    title="Duplica modello"
                    onClick={() => duplicateForm(form.id)}
                  >
                    <Copy className="w-3.5 h-3.5" />
                  </Button>
                  <Button
                    size="sm"
                    variant="ghost"
                    className="h-8 text-xs px-2 text-slate-500 hover:text-slate-900"
                    title="Anteprima"
                    onClick={() => setPreviewForm(form)}
                  >
                    <Eye className="w-3.5 h-3.5" />
                  </Button>
                  {!form.is_default && (
                    <Button
                      size="sm"
                      variant="ghost"
                      className="h-8 text-xs px-2 text-red-500 hover:bg-red-50"
                      title="Elimina"
                      onClick={() => deleteForm(form.id)}
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                    </Button>
                  )}
                </div>

                <Button
                  size="sm"
                  className="h-8 text-xs bg-[#043569] text-white hover:bg-[#032850] gap-1 px-3"
                  onClick={() => setEditingForm(form)}
                >
                  <Edit2 className="w-3.5 h-3.5" />
                  Modifica
                </Button>
              </div>
            </div>
          );
        })}
      </div>

      {/* Preview Modal */}
      <FormPreviewModal
        isOpen={Boolean(previewForm)}
        onClose={() => setPreviewForm(null)}
        form={previewForm}
      />
    </div>
  );
}
