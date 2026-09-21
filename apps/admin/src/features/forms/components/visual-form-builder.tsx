import React, { useState } from "react";
import {
  FormTemplate,
  FormFieldConfig,
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
} from "lucide-react";
import { FormPreviewModal } from "./form-preview-modal";

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
  const [formData, setFormData] = useState<FormTemplate>(
    initialForm || {
      id: "",
      title: "Nuovo Modulo Iscrizione",
      description: "",
      form_type: FormType.BOOKING,
      is_default: false,
      is_active: true,
      category_slug: null,
      course_id: null,
      fields_config: [],
    }
  );

  const [previewOpen, setPreviewOpen] = useState(false);
  const [editingField, setEditingField] = useState<FormFieldConfig | null>(null);
  const [fieldDialogOpen, setFieldDialogOpen] = useState(false);

  // Field modal state
  const [fieldKey, setFieldKey] = useState("");
  const [fieldLabel, setFieldLabel] = useState("");
  const [fieldPlaceholder, setFieldPlaceholder] = useState("");
  const [fieldType, setFieldType] = useState<FormFieldType>(FormFieldType.TEXT);
  const [fieldTarget, setFieldTarget] = useState<FormFieldTarget>(FormFieldTarget.STUDENT);
  const [fieldRequired, setFieldRequired] = useState(false);
  const [fieldEnabled, setFieldEnabled] = useState(true);
  const [fieldHelpText, setFieldHelpText] = useState("");
  const [fieldOptionsText, setFieldOptionsText] = useState("");

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
      f.options ? f.options.map((o) => `${o.label}:${o.value}`).join("\n") : ""
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

    // update sort orders
    list.forEach((f, idx) => {
      f.sort_order = idx + 1;
    });

    setFormData((prev) => ({ ...prev, fields_config: list }));
  };

  return (
    <div className="space-y-6">
      {/* Top Header Actions */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 bg-white p-6 rounded-2xl border border-slate-100 shadow-sm">
        <div>
          <h2 className="text-xl font-black text-slate-900 flex items-center gap-2">
            <Layers className="w-5 h-5 text-[#FAA904]" />
            {initialForm?.id ? "Modifica Modulo" : "Nuovo Modulo di Iscrizione"}
          </h2>
          <p className="text-xs text-slate-500 mt-1">
            Configura i campi dinamici e il target di applicazione del modulo.
          </p>
        </div>

        <div className="flex items-center gap-2 w-full sm:w-auto">
          <Button
            type="button"
            variant="outline"
            size="sm"
            className="gap-1.5"
            onClick={() => setPreviewOpen(true)}
          >
            <Eye className="w-4 h-4" />
            Anteprima
          </Button>
          <Button
            type="button"
            variant="ghost"
            size="sm"
            onClick={onCancel}
          >
            Annulla
          </Button>
          <Button
            type="button"
            size="sm"
            className="gap-1.5 bg-[#043569] text-white hover:bg-[#032850]"
            onClick={() => onSave(formData)}
            disabled={isSaving || !formData.title.trim()}
          >
            <Save className="w-4 h-4" />
            {isSaving ? "Salvataggio..." : "Salva Modulo"}
          </Button>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left 2 Cols: Form Metadata & Scope Settings */}
        <div className="lg:col-span-1 space-y-6">
          <div className="bg-white p-6 rounded-2xl border border-slate-100 shadow-sm space-y-4">
            <h3 className="text-sm font-black uppercase tracking-wider text-slate-900 border-b border-slate-100 pb-2">
              Impostazioni Base
            </h3>

            <div className="space-y-1.5">
              <Label className="text-xs font-bold text-slate-700">Titolo Modulo *</Label>
              <Input
                value={formData.title}
                onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                placeholder="Es. Modulo Corsi Bambini (Kids)"
                className="text-xs"
              />
            </div>

            <div className="space-y-1.5">
              <Label className="text-xs font-bold text-slate-700">Descrizione interna</Label>
              <Textarea
                value={formData.description || ""}
                onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                placeholder="Note per la segreteria sull'utilizzo..."
                rows={2}
                className="text-xs"
              />
            </div>

            <div className="space-y-1.5">
              <Label className="text-xs font-bold text-slate-700">Tipo di Form</Label>
              <select
                value={formData.form_type}
                onChange={(e) => setFormData({ ...formData, form_type: e.target.value as FormType })}
                className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 text-xs"
              >
                <option value={FormType.BOOKING}>Iscrizione Corso (Booking)</option>
                <option value={FormType.CONTACT}>Contatti & Info (Lead)</option>
                <option value={FormType.TEST}>Test di Livello (Test)</option>
                <option value={FormType.CUSTOM}>Personalizzato (Custom)</option>
              </select>
            </div>

            <div className="pt-2 border-t border-slate-100 space-y-3">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-xs font-bold text-slate-800">Modulo Attivo</p>
                  <p className="text-[10px] text-slate-400">Abilita o disabilita il modulo sul sito</p>
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

          {/* Scope / Targeting */}
          <div className="bg-white p-6 rounded-2xl border border-slate-100 shadow-sm space-y-4">
            <h3 className="text-sm font-black uppercase tracking-wider text-slate-900 border-b border-slate-100 pb-2 flex items-center gap-1.5">
              <Sparkles className="w-4 h-4 text-[#FAA904]" />
              Targeting & Applicazione
            </h3>

            <div className="space-y-1.5">
              <Label className="text-xs font-bold text-slate-700">Categoria Corsi (Opzionale)</Label>
              <Input
                value={formData.category_slug || ""}
                onChange={(e) => setFormData({ ...formData, category_slug: e.target.value || null })}
                placeholder="Es. kids, language, certipass (vuoto = tutte)"
                className="text-xs"
              />
              <p className="text-[10px] text-slate-400">
                Se specificato, questo modulo si attiverà per tutti i corsi di questa categoria.
              </p>
            </div>

            <div className="space-y-1.5">
              <Label className="text-xs font-bold text-slate-700">ID Corso Specifico (Opzionale)</Label>
              <Input
                value={formData.course_id || ""}
                onChange={(e) => setFormData({ ...formData, course_id: e.target.value || null })}
                placeholder="UUID o slug del corso (priorità massima)"
                className="text-xs"
              />
            </div>
          </div>
        </div>

        {/* Right 2 Cols: Fields Manager */}
        <div className="lg:col-span-2 space-y-4">
          <div className="bg-white p-6 rounded-2xl border border-slate-100 shadow-sm space-y-4">
            <div className="flex items-center justify-between border-b border-slate-100 pb-4">
              <div>
                <h3 className="text-sm font-black uppercase tracking-wider text-slate-900">
                  Campi Personalizzati ({formData.fields_config.length})
                </h3>
                <p className="text-xs text-slate-400">
                  I campi anagrafici base (Nome, Cognome, Email, Tel, Codice Fiscale) sono sempre inclusi automaticamente.
                </p>
              </div>

              <Button
                type="button"
                size="sm"
                className="gap-1.5 bg-[#FAA904] text-slate-900 hover:bg-[#e09804] font-bold text-xs"
                onClick={handleOpenAddField}
              >
                <Plus className="w-3.5 h-3.5" />
                Aggiungi Campo
              </Button>
            </div>

            {formData.fields_config.length === 0 ? (
              <div className="text-center py-12 border-2 border-dashed border-slate-100 rounded-2xl">
                <p className="text-xs font-bold text-slate-500">Nessun campo personalizzato aggiunto.</p>
                <p className="text-[11px] text-slate-400 mt-1 mb-4">
                  Clicca su "Aggiungi Campo" per inserire domande o scelte aggiuntive.
                </p>
                <Button size="sm" variant="outline" onClick={handleOpenAddField}>
                  <Plus className="w-3.5 h-3.5 mr-1" />
                  Crea il primo campo
                </Button>
              </div>
            ) : (
              <div className="space-y-2.5">
                {formData.fields_config.map((field, idx) => (
                  <div
                    key={field.id}
                    className={`flex items-center justify-between p-3.5 rounded-xl border transition-all ${
                      field.is_enabled
                        ? "bg-slate-50/70 border-slate-200"
                        : "bg-slate-100/50 border-dashed border-slate-200 opacity-60"
                    }`}
                  >
                    <div className="flex items-center gap-3">
                      <div className="flex flex-col gap-0.5">
                        <button
                          type="button"
                          disabled={idx === 0}
                          onClick={() => handleMoveField(idx, "up")}
                          className="text-slate-400 hover:text-slate-700 disabled:opacity-20 p-0.5"
                        >
                          <ArrowUp className="w-3 h-3" />
                        </button>
                        <button
                          type="button"
                          disabled={idx === formData.fields_config.length - 1}
                          onClick={() => handleMoveField(idx, "down")}
                          className="text-slate-400 hover:text-slate-700 disabled:opacity-20 p-0.5"
                        >
                          <ArrowDown className="w-3 h-3" />
                        </button>
                      </div>

                      <div>
                        <div className="flex items-center gap-2">
                          <span className="text-xs font-bold text-slate-900">{field.label}</span>
                          <code className="text-[10px] text-slate-500 bg-slate-200/70 px-1.5 py-0.5 rounded font-mono">
                            {field.key}
                          </code>
                          {field.is_required && (
                            <Badge variant="destructive" className="text-[9px] px-1 py-0 h-4">
                              Obbligatorio
                            </Badge>
                          )}
                        </div>
                        <div className="flex items-center gap-2 mt-1">
                          <Badge variant="secondary" className="text-[9px] px-1.5 py-0 h-4 uppercase">
                            {field.field_type}
                          </Badge>
                          <span className="text-[10px] text-slate-400">
                            Target: <span className="font-bold text-slate-600">{field.target}</span>
                          </span>
                        </div>
                      </div>
                    </div>

                    <div className="flex items-center gap-2">
                      <Button
                        type="button"
                        size="icon"
                        variant="ghost"
                        className="h-8 w-8 text-slate-500 hover:text-slate-900"
                        onClick={() => handleOpenEditField(field)}
                      >
                        <Edit2 className="w-3.5 h-3.5" />
                      </Button>
                      <Button
                        type="button"
                        size="icon"
                        variant="ghost"
                        className="h-8 w-8 text-red-500 hover:bg-red-50"
                        onClick={() => handleDeleteField(field.id)}
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </Button>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Field Editor Dialog */}
      <Dialog open={fieldDialogOpen} onOpenChange={setFieldDialogOpen}>
        <DialogContent className="max-w-md bg-white text-slate-900">
          <DialogHeader>
            <DialogTitle className="text-base font-bold">
              {editingField ? "Modifica Campo" : "Aggiungi Nuovo Campo"}
            </DialogTitle>
          </DialogHeader>

          <div className="space-y-4 py-2">
            <div className="space-y-1.5">
              <Label className="text-xs font-bold">Etichetta Visibile (Label) *</Label>
              <Input
                value={fieldLabel}
                onChange={(e) => setFieldLabel(e.target.value)}
                placeholder="Es. Livello di conoscenza inglese"
                className="text-xs"
              />
            </div>

            <div className="space-y-1.5">
              <Label className="text-xs font-bold">Chiave di Sistema (Key / Variabile)</Label>
              <Input
                value={fieldKey}
                onChange={(e) => setFieldKey(e.target.value)}
                placeholder="Es. study_level (generato automaticamente se vuoto)"
                className="text-xs font-mono"
              />
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div className="space-y-1.5">
                <Label className="text-xs font-bold">Tipo di Campo</Label>
                <select
                  value={fieldType}
                  onChange={(e) => setFieldType(e.target.value as FormFieldType)}
                  className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 text-xs"
                >
                  <option value={FormFieldType.TEXT}>Testo breve</option>
                  <option value={FormFieldType.SELECT}>Menu a tendina (Select)</option>
                  <option value={FormFieldType.TEXTAREA}>Testo lungo (Textarea)</option>
                  <option value={FormFieldType.CHECKBOX}>Casella di spunta (Checkbox)</option>
                  <option value={FormFieldType.NUMBER}>Numero</option>
                  <option value={FormFieldType.DATE}>Data</option>
                </select>
              </div>

              <div className="space-y-1.5">
                <Label className="text-xs font-bold">Target Campo</Label>
                <select
                  value={fieldTarget}
                  onChange={(e) => setFieldTarget(e.target.value as FormFieldTarget)}
                  className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 text-xs"
                >
                  <option value={FormFieldTarget.STUDENT}>Studente / Allievo</option>
                  <option value={FormFieldTarget.PURCHASER}>Acquirente / Genitore</option>
                  <option value={FormFieldTarget.BOOKING}>Generale / Prenotazione</option>
                </select>
              </div>
            </div>

            <div className="space-y-1.5">
              <Label className="text-xs font-bold">Segnaposto (Placeholder)</Label>
              <Input
                value={fieldPlaceholder}
                onChange={(e) => setFieldPlaceholder(e.target.value)}
                placeholder="Es. Seleziona una voce..."
                className="text-xs"
              />
            </div>

            {fieldType === FormFieldType.SELECT && (
              <div className="space-y-1.5">
                <Label className="text-xs font-bold">Opzioni (una per riga: "Nome:valore")</Label>
                <Textarea
                  value={fieldOptionsText}
                  onChange={(e) => setFieldOptionsText(e.target.value)}
                  placeholder={"Principiante:A1\nIntermedio:B1\nAvanzato:C1"}
                  rows={3}
                  className="text-xs font-mono"
                />
              </div>
            )}

            <div className="flex items-center justify-between pt-2 border-t border-slate-100">
              <span className="text-xs font-bold text-slate-700">Campo Obbligatorio</span>
              <Switch checked={fieldRequired} onCheckedChange={setFieldRequired} />
            </div>

            <div className="flex items-center justify-between">
              <span className="text-xs font-bold text-slate-700">Campo Attivo</span>
              <Switch checked={fieldEnabled} onCheckedChange={setFieldEnabled} />
            </div>
          </div>

          <DialogFooter>
            <Button variant="ghost" size="sm" onClick={() => setFieldDialogOpen(false)}>
              Annulla
            </Button>
            <Button size="sm" className="bg-[#043569] text-white" onClick={handleSaveFieldDialog}>
              Salva Campo
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Live Preview Modal */}
      <FormPreviewModal
        isOpen={previewOpen}
        onClose={() => setPreviewOpen(false)}
        form={formData}
      />
    </div>
  );
}
