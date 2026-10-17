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
  locale?: string;
}

export function DynamicCustomFields({
  fields,
  target,
  register,
  errors,
  namePrefix = "custom_fields",
  inline = true,
  title,
  locale = "it",
}: DynamicCustomFieldsProps) {
  const targetFields = (fields || []).filter(
    (f) => f.is_enabled && f.target === target
  );

  if (targetFields.length === 0) return null;

  const isEn = locale === "en";
  const requiredMsg = isEn ? "Required field" : "Campo obbligatorio";
  const selectPlaceholder = isEn ? "Select..." : "Seleziona...";
  const textPlaceholder = isEn ? "Enter details..." : "Inserisci dettagli...";

  const content = (
    <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
      {targetFields.map((field) => {
        const fieldName = `${namePrefix}.${field.key}`;
        const fieldError = errors && ((errors as any)[namePrefix]?.[field.key] || (errors as any)[field.key]);
        const errorText = fieldError?.message ? String(fieldError.message) : (fieldError ? requiredMsg : null);
        const isFullWidth =
          field.field_type === FormFieldType.TEXTAREA ||
          field.field_type === FormFieldType.CHECKBOX;

        const resolvedLabel = (isEn ? (field as any).label_en : (field as any).label_it) || field.label;
        const resolvedPlaceholder = (isEn ? (field as any).placeholder_en : (field as any).placeholder_it) || field.placeholder;

        const inputErrorClasses = errorText
          ? "border-red-400 focus:border-red-500 focus:ring-red-100 ring-1 ring-red-300"
          : "border-slate-200 focus:ring-primary/10 focus:border-primary";

        return (
          <div
            key={field.id}
            className={`min-w-0 ${isFullWidth ? "sm:col-span-2" : ""}`}
          >
            {field.field_type !== FormFieldType.CHECKBOX && (
              <label htmlFor={fieldName} className="block text-xs font-bold text-slate-700 mb-1">
                {resolvedLabel}{" "}
                {field.is_required && <span className="text-red-500">*</span>}
              </label>
            )}

            {field.field_type === FormFieldType.SELECT ? (
              <div className="relative">
                <select
                  id={fieldName}
                  {...register(fieldName, {
                    required: field.is_required ? requiredMsg : false,
                  })}
                  className={`w-full px-3 py-2 text-xs border rounded-xl focus:outline-none focus:ring-2 bg-white font-medium transition-all text-slate-800 appearance-none pr-8 cursor-pointer ${inputErrorClasses}`}
                >
                  <option value="">
                    {resolvedPlaceholder || selectPlaceholder}
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
                  required: field.is_required ? requiredMsg : false,
                })}
                placeholder={resolvedPlaceholder || textPlaceholder}
                rows={3}
                className={`w-full px-3 py-2 text-xs border rounded-xl focus:outline-none focus:ring-2 bg-white font-medium transition-all text-slate-800 resize-none ${inputErrorClasses}`}
              />
            ) : field.field_type === FormFieldType.CHECKBOX ? (
              <label className={`flex items-start gap-2.5 cursor-pointer bg-slate-50 p-2.5 rounded-xl border mt-1 ${errorText ? "border-red-300 ring-1 ring-red-200" : "border-slate-200/80"}`}>
                <input
                  type="checkbox"
                  id={fieldName}
                  {...register(fieldName, {
                    required: field.is_required ? requiredMsg : false,
                  })}
                  className="w-4 h-4 rounded text-primary border-slate-300 focus:ring-primary mt-0.5"
                />
                <div>
                  <span className="text-xs font-bold text-slate-800 block leading-snug">
                    {resolvedLabel} {field.is_required && <span className="text-red-500">*</span>}
                  </span>
                  {resolvedPlaceholder && (
                    <span className="text-[10px] sm:text-[11px] text-slate-500 leading-tight block mt-0.5">
                      {resolvedPlaceholder}
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
                  required: field.is_required ? requiredMsg : false,
                })}
                placeholder={resolvedPlaceholder || ""}
                className={`w-full px-3 py-2 text-xs border rounded-xl focus:outline-none focus:ring-2 bg-white font-medium transition-all text-slate-800 ${inputErrorClasses}`}
              />
            )}

            {errorText && (
              <span className="text-[10px] text-red-500 font-semibold mt-1 block">
                {errorText}
              </span>
            )}

            {field.help_text && !errorText && (
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
