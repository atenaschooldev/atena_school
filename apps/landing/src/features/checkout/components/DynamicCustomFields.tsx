"use client";

import React from "react";
import { FormFieldConfig, FormFieldType, FormFieldTarget } from "@atena/api-types";
import type { UseFormRegister, FieldErrors } from "react-hook-form";
import { Sparkle } from "@phosphor-icons/react";

interface DynamicCustomFieldsProps {
  fields: FormFieldConfig[];
  target: FormFieldTarget;
  register: UseFormRegister<any>;
  errors: FieldErrors<any>;
}

export function DynamicCustomFields({
  fields,
  target,
  register,
  errors,
}: DynamicCustomFieldsProps) {
  const targetFields = (fields || []).filter(
    (f) => f.is_enabled && f.target === target
  );

  if (targetFields.length === 0) return null;

  return (
    <div className="space-y-4 pt-4 border-t border-slate-100">
      <div className="flex items-center gap-2">
        <Sparkle className="w-4 h-4 text-[#FAA904]" weight="bold" />
        <h3 className="text-xs font-black uppercase tracking-wider text-[#043569]">
          Informazioni Aggiuntive
        </h3>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5">
        {targetFields.map((field) => {
          const fieldName = `custom_fields.${field.key}`;
          const isFullWidth =
            field.field_type === FormFieldType.TEXTAREA ||
            field.field_type === FormFieldType.CHECKBOX;

          return (
            <div
              key={field.id}
              className={`space-y-1.5 ${isFullWidth ? "sm:col-span-2" : ""}`}
            >
              <label className="text-xs font-bold text-slate-700 block">
                {field.label}{" "}
                {field.is_required && <span className="text-red-500">*</span>}
              </label>

              {field.field_type === FormFieldType.SELECT ? (
                <select
                  {...register(fieldName, {
                    required: field.is_required ? "Campo obbligatorio" : false,
                  })}
                  className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-2.5 text-xs text-slate-800 focus:outline-none focus:ring-2 focus:ring-[#043569]/20"
                >
                  <option value="">
                    {field.placeholder || "Seleziona un'opzione..."}
                  </option>
                  {field.options?.map((opt) => (
                    <option key={opt.value} value={opt.value}>
                      {opt.label}
                    </option>
                  ))}
                </select>
              ) : field.field_type === FormFieldType.TEXTAREA ? (
                <textarea
                  {...register(fieldName, {
                    required: field.is_required ? "Campo obbligatorio" : false,
                  })}
                  placeholder={field.placeholder}
                  rows={3}
                  className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 text-xs text-slate-800 focus:outline-none focus:ring-2 focus:ring-[#043569]/20 resize-none"
                />
              ) : field.field_type === FormFieldType.CHECKBOX ? (
                <label className="flex items-center gap-2.5 cursor-pointer pt-1">
                  <input
                    type="checkbox"
                    {...register(fieldName, {
                      required: field.is_required ? "Campo obbligatorio" : false,
                    })}
                    className="w-4 h-4 rounded text-[#043569] border-slate-300 focus:ring-[#043569]"
                  />
                  <span className="text-xs font-medium text-slate-700">
                    {field.placeholder || field.label}
                  </span>
                </label>
              ) : (
                <input
                  type={field.field_type === FormFieldType.NUMBER ? "number" : field.field_type === FormFieldType.DATE ? "date" : "text"}
                  {...register(fieldName, {
                    required: field.is_required ? "Campo obbligatorio" : false,
                  })}
                  placeholder={field.placeholder}
                  className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-2.5 text-xs text-slate-800 focus:outline-none focus:ring-2 focus:ring-[#043569]/20"
                />
              )}

              {field.help_text && (
                <p className="text-[10px] text-slate-400 leading-tight">
                  {field.help_text}
                </p>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
}
