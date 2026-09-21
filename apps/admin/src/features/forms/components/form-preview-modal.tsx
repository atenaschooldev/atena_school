import React, { useState } from "react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { FormTemplate, FormFieldType, FormFieldTarget } from "../types";
import { Smartphone, Monitor, CheckCircle, Info, ShieldCheck } from "lucide-react";

interface FormPreviewModalProps {
  form: FormTemplate | null;
  isOpen: boolean;
  onClose: () => void;
}

export function FormPreviewModal({ form, isOpen, onClose }: FormPreviewModalProps) {
  const [device, setDevice] = useState<"desktop" | "mobile">("desktop");

  if (!form) return null;

  const enabledFields = (form.fields_config || [])
    .filter((f) => f.is_enabled)
    .sort((a, b) => (a.sort_order ?? 0) - (b.sort_order ?? 0));

  const purchaserFields = enabledFields.filter((f) => f.target === FormFieldTarget.PURCHASER);
  const studentFields = enabledFields.filter((f) => f.target === FormFieldTarget.STUDENT);
  const generalFields = enabledFields.filter((f) => f.target === FormFieldTarget.BOOKING);

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-4xl max-h-[90vh] flex flex-col p-0 overflow-hidden bg-slate-900 border-slate-800 text-slate-100">
        <DialogHeader className="p-4 bg-slate-950 border-b border-slate-800 flex flex-row items-center justify-between">
          <div className="space-y-1">
            <DialogTitle className="text-lg font-bold flex items-center gap-2 text-white">
              <span>Anteprima: {form.title}</span>
              <Badge variant="outline" className="border-amber-500/40 text-amber-400 bg-amber-500/10 text-[10px] uppercase">
                {form.form_type}
              </Badge>
            </DialogTitle>
            <p className="text-xs text-slate-400">
              Simulazione dell'esperienza utente su desktop e smartphone.
            </p>
          </div>

          <div className="flex items-center gap-1 bg-slate-800 p-1 rounded-lg border border-slate-700">
            <Button
              size="sm"
              variant={device === "desktop" ? "secondary" : "ghost"}
              className="h-7 px-2.5 text-xs gap-1.5"
              onClick={() => setDevice("desktop")}
            >
              <Monitor className="w-3.5 h-3.5" />
              Desktop
            </Button>
            <Button
              size="sm"
              variant={device === "mobile" ? "secondary" : "ghost"}
              className="h-7 px-2.5 text-xs gap-1.5"
              onClick={() => setDevice("mobile")}
            >
              <Smartphone className="w-3.5 h-3.5" />
              Mobile
            </Button>
          </div>
        </DialogHeader>

        <div className="flex-1 overflow-y-auto p-6 flex justify-center bg-slate-950/60">
          <div
            className={`transition-all duration-300 bg-white text-slate-900 rounded-3xl p-6 sm:p-8 shadow-2xl border border-slate-100 ${
              device === "mobile" ? "w-full max-w-[390px] text-xs" : "w-full max-w-2xl"
            }`}
          >
            {/* Core Protected Purchaser Header */}
            <div className="space-y-4 pb-6 border-b border-slate-100">
              <div className="flex items-center justify-between">
                <h4 className="text-sm font-black uppercase tracking-wider text-[#043569]">
                  1. Dati Acquirente / Genitore
                </h4>
                <span className="text-[10px] font-bold text-emerald-600 bg-emerald-50 px-2 py-0.5 rounded-full flex items-center gap-1">
                  <ShieldCheck className="w-3 h-3" />
                  Campi Protetti
                </span>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="text-xs font-bold text-slate-600 block mb-1">Nome *</label>
                  <input disabled placeholder="Mario" className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 text-xs" />
                </div>
                <div>
                  <label className="text-xs font-bold text-slate-600 block mb-1">Cognome *</label>
                  <input disabled placeholder="Rossi" className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 text-xs" />
                </div>
                <div>
                  <label className="text-xs font-bold text-slate-600 block mb-1">Email *</label>
                  <input disabled placeholder="mario.rossi@example.com" className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 text-xs" />
                </div>
                <div>
                  <label className="text-xs font-bold text-slate-600 block mb-1">Telefono *</label>
                  <input disabled placeholder="+39 333 1234567" className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 text-xs" />
                </div>
                <div className="sm:col-span-2">
                  <label className="text-xs font-bold text-slate-600 block mb-1">Codice Fiscale (Acquirente) *</label>
                  <input disabled placeholder="RSSMRA80A01H501Z" className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 text-xs uppercase" />
                </div>
              </div>

              {/* Dynamic Purchaser Fields */}
              {purchaserFields.length > 0 && (
                <div className="pt-3 space-y-3">
                  <p className="text-[11px] font-bold text-amber-700 bg-amber-50 px-2.5 py-1 rounded-lg">
                    Campi aggiuntivi configurati per l'acquirente:
                  </p>
                  {purchaserFields.map((field) => (
                    <div key={field.id} className="space-y-1">
                      <label className="text-xs font-bold text-slate-700 block">
                        {field.label} {field.is_required && <span className="text-red-500">*</span>}
                      </label>
                      {field.field_type === FormFieldType.SELECT ? (
                        <select className="w-full bg-white border border-slate-300 rounded-xl px-3 py-2 text-xs">
                          <option value="">{field.placeholder || "Seleziona un'opzione..."}</option>
                          {field.options?.map((opt) => (
                            <option key={opt.value} value={opt.value}>{opt.label}</option>
                          ))}
                        </select>
                      ) : field.field_type === FormFieldType.TEXTAREA ? (
                        <textarea placeholder={field.placeholder} rows={2} className="w-full bg-white border border-slate-300 rounded-xl px-3 py-2 text-xs" />
                      ) : field.field_type === FormFieldType.CHECKBOX ? (
                        <label className="flex items-center gap-2 cursor-pointer pt-1">
                          <input type="checkbox" className="rounded text-[#043569]" />
                          <span className="text-xs font-medium text-slate-700">{field.placeholder || field.label}</span>
                        </label>
                      ) : (
                        <input type={field.field_type} placeholder={field.placeholder} className="w-full bg-white border border-slate-300 rounded-xl px-3 py-2 text-xs" />
                      )}
                    </div>
                  ))}
                </div>
              )}
            </div>

            {/* Student & Custom Fields Section */}
            <div className="space-y-4 pt-6">
              <h4 className="text-sm font-black uppercase tracking-wider text-[#043569]">
                2. Dati Studente & Preferenze
              </h4>

              {studentFields.length === 0 && generalFields.length === 0 ? (
                <p className="text-xs text-slate-400 italic py-2">
                  Nessun campo personalizzato aggiuntivo. Verranno utilizzati solo i campi anagrafici standard.
                </p>
              ) : (
                <div className="space-y-3">
                  {[...studentFields, ...generalFields].map((field) => (
                    <div key={field.id} className="space-y-1">
                      <label className="text-xs font-bold text-slate-700 block">
                        {field.label} {field.is_required && <span className="text-red-500">*</span>}
                      </label>
                      {field.field_type === FormFieldType.SELECT ? (
                        <select className="w-full bg-white border border-slate-300 rounded-xl px-3 py-2 text-xs">
                          <option value="">{field.placeholder || "Seleziona un'opzione..."}</option>
                          {field.options?.map((opt) => (
                            <option key={opt.value} value={opt.value}>{opt.label}</option>
                          ))}
                        </select>
                      ) : field.field_type === FormFieldType.TEXTAREA ? (
                        <textarea placeholder={field.placeholder} rows={3} className="w-full bg-white border border-slate-300 rounded-xl px-3 py-2 text-xs" />
                      ) : field.field_type === FormFieldType.CHECKBOX ? (
                        <label className="flex items-center gap-2 cursor-pointer pt-1">
                          <input type="checkbox" className="rounded text-[#043569]" />
                          <span className="text-xs font-medium text-slate-700">{field.placeholder || field.label}</span>
                        </label>
                      ) : (
                        <input type={field.field_type} placeholder={field.placeholder} className="w-full bg-white border border-slate-300 rounded-xl px-3 py-2 text-xs" />
                      )}
                      {field.help_text && (
                        <p className="text-[10px] text-slate-400">{field.help_text}</p>
                      )}
                    </div>
                  ))}
                </div>
              )}

              {/* Submit Button Simulation */}
              <div className="pt-4">
                <button disabled className="w-full py-3 bg-[#043569] text-white rounded-xl text-xs font-black uppercase tracking-wider opacity-90 cursor-not-allowed">
                  Procedi al Pagamento Segreto →
                </button>
              </div>
            </div>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}
