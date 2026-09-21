"use client";

import React from "react";
import { FormFieldConfig, FormFieldType, FormFieldTarget } from "@atena/api-types";
import type { UseFormRegister, FieldErrors } from "react-hook-form";
import { CaretDown } from "@phosphor-icons/react";

interface DynamicCustomFieldsProps {
  fields: FormFieldConfig[];
  target: FormFieldTarget;
  register: UseFormRegister<any>;
  errors?: FieldErrors<any>;
  namePrefix?: string;
  inline?: boolean;
  title?: string;
}

export function DynamicCustomFields({
  fields,
  target,
  register,
  errors,
  namePrefix = "custom_fields",
  inline = true,
  title,
}: DynamicCustomFieldsProps) {
  const targetFields = (fields || []).filter(
    (f) => f.is_enabled && f.target === target
  );

  if (targetFields.length === 0) return null;

  const content = (
    <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
      {targetFields.map((field) => {
        const fieldName = `${namePrefix}.${field.key}`;
        const isFullWidth =
          field.field_type === FormFieldType.TEXTAREA ||
          field.field_type === FormFieldType.CHECKBOX;

        return (
          <div
            key={field.id}
            className={`min-w-0 ${isFullWidth ? "sm:col-span-2" : ""}`}
          >
            {field.field_type !== FormFieldType.CHECKBOX && (
              <label htmlFor={fieldName} className="block text-xs font-bold text-slate-700 mb-1">
                {field.label}{" "}
                {field.is_required && <span className="text-red-500">*</span>}
              </label>
            )}

            {field.field_type === FormFieldType.SELECT ? (
              <div className="relative">
                <select
                  id={fieldName}
                  {...register(fieldName, {
                    required: field.is_required ? "Campo obbligatorio" : false,
                  })}
                  className="w-full px-3 py-2 text-xs border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-[#043569]/10 focus:border-[#043569] bg-white font-medium transition-all text-slate-800 appearance-none pr-8 cursor-pointer"
                >
                  <option value="">
                    {field.placeholder || "Seleziona..."}
                  </option>
                  {field.options?.map((opt: any) => {
                    const val = typeof opt === "string" ? opt : (opt?.value || String(opt));
                    const label = typeof opt === "string" ? opt : (opt?.label || val);
                    return (
                      <option key={val} value={val}>
                        {label}
                      </option>
                    );
                  })}
                </select>
                <CaretDown className="w-3.5 h-3.5 text-slate-400 absolute right-2.5 top-1/2 -translate-y-1/2 pointer-events-none" />
              </div>
            ) : field.field_type === FormFieldType.TEXTAREA ? (
              <textarea
                id={fieldName}
                {...register(fieldName, {
                  required: field.is_required ? "Campo obbligatorio" : false,
                })}
                placeholder={field.placeholder || "Inserisci dettagli..."}
                rows={3}
                className="w-full px-3 py-2 text-xs border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-[#043569]/10 focus:border-[#043569] bg-white font-medium transition-all text-slate-800 resize-none"
              />
            ) : field.field_type === FormFieldType.CHECKBOX ? (
              <label className="flex items-start gap-2.5 cursor-pointer bg-slate-50 p-2.5 rounded-xl border border-slate-200/80 mt-1">
                <input
                  type="checkbox"
                  id={fieldName}
                  {...register(fieldName, {
                    required: field.is_required ? "Campo obbligatorio" : false,
                  })}
                  className="w-4 h-4 rounded text-[#043569] border-slate-300 focus:ring-[#043569] mt-0.5"
                />
                <div>
                  <span className="text-xs font-bold text-slate-800 block leading-snug">
                    {field.label} {field.is_required && <span className="text-red-500">*</span>}
                  </span>
                  {field.placeholder && (
                    <span className="text-[10px] sm:text-[11px] text-slate-500 leading-tight block mt-0.5">
                      {field.placeholder}
                    </span>
                  )}
                </div>
              </label>
            ) : (
              <input
                id={fieldName}
                type={
                  field.field_type === FormFieldType.NUMBER
                    ? "number"
                    : field.field_type === FormFieldType.DATE
                    ? "date"
                    : "text"
                }
                {...register(fieldName, {
                  required: field.is_required ? "Campo obbligatorio" : false,
                })}
                placeholder={field.placeholder || ""}
                className="w-full px-3 py-2 text-xs border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-[#043569]/10 focus:border-[#043569] bg-white font-medium transition-all text-slate-800"
              />
            )}

            {field.help_text && (
              <p className="text-[10px] text-slate-400 mt-1 leading-tight">
                {field.help_text}
              </p>
            )}
          </div>
        );
      })}
    </div>
  );

  if (inline) {
    return content;
  }

  return (
    <div className="space-y-3 pt-3 border-t border-slate-100">
      {title && (
        <h3 className="text-[10px] font-black uppercase tracking-wider text-slate-400">
          {title}
        </h3>
      )}
      {content}
    </div>
  );
}
