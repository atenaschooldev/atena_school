/**
 * ============================================================================
 * ATENA SCHOOL — SYSTEM / DYNAMIC FORMS & TEMPLATES DOMAIN
 * ============================================================================
 * @module @atena/api-types/system/form-templates
 * @description
 * Движок динамических форм, шаблонов и настраиваемых полей:
 * - FormType: 'booking' | 'contact' | 'test' | 'custom'
 * - FormFieldType: 'text' | 'email' | 'phone' | 'number' | 'select' | 'checkbox' | 'radio' | 'textarea' | 'date'
 * - FormFieldTarget: 'purchaser' | 'student' | 'booking'
 * - FormTemplate: Реестр шаблонов форм с привязкой к курсам/категориям
 * ============================================================================
 */

export const FormType = {
  BOOKING: 'booking',
  CONTACT: 'contact',
  TEST: 'test',
  CUSTOM: 'custom',
} as const;
export type FormType = (typeof FormType)[keyof typeof FormType];

export const FormFieldType = {
  TEXT: 'text',
  EMAIL: 'email',
  PHONE: 'phone',
  NUMBER: 'number',
  SELECT: 'select',
  CHECKBOX: 'checkbox',
  RADIO: 'radio',
  TEXTAREA: 'textarea',
  DATE: 'date',
} as const;
export type FormFieldType = (typeof FormFieldType)[keyof typeof FormFieldType];

export const FormFieldTarget = {
  PURCHASER: 'purchaser', // Относится к плательщику/родителю
  STUDENT: 'student',     // Относится к студенту/ребёнку
  BOOKING: 'booking',     // Общие параметры бронирования/заявки
} as const;
export type FormFieldTarget = (typeof FormFieldTarget)[keyof typeof FormFieldTarget];

export interface FormFieldOption {
  label: string;
  value: string;
}

export interface FormFieldConfig {
  id: string;
  key: string;                          // Системный ключ латиницей ("study_level", "heard_from")
  label: string;                        // Заголовок для пользователя ("Livello attuale")
  placeholder?: string;
  field_type: FormFieldType;
  target: FormFieldTarget;
  is_required: boolean;
  is_enabled: boolean;
  sort_order: number;
  options?: FormFieldOption[];          // Для select, radio
  help_text?: string;
  default_value?: any;
  validation_pattern?: string;          // Regex паттерн валидации
}

export interface FormTemplate {
  id: string;
  title: string;                        // Название шаблона в CRM: "Детская анкета (Kids)"
  description?: string;
  form_type: FormType;                  // 'booking' | 'contact' | 'test' | 'custom'
  is_default: boolean;                  // Основная форма по умолчанию для данного типа
  is_active: boolean;                   // Активен ли шаблон
  category_slug?: string | null;        // Привязка к категории курсов (null = все)
  course_id?: string | null;            // Привязка к конкретному курсу (null = все)
  fields_config: FormFieldConfig[];     // Список полей
  created_at?: string;
  updated_at?: string;
}

export interface ResolveFormQuery {
  form_type: FormType;
  course_id?: string;
  category_slug?: string;
}

export interface CreateFormTemplateDto {
  title: string;
  description?: string;
  form_type: FormType;
  is_default?: boolean;
  is_active?: boolean;
  category_slug?: string | null;
  course_id?: string | null;
  fields_config: FormFieldConfig[];
}

export interface UpdateFormTemplateDto {
  title?: string;
  description?: string;
  form_type?: FormType;
  is_default?: boolean;
  is_active?: boolean;
  category_slug?: string | null;
  course_id?: string | null;
  fields_config?: FormFieldConfig[];
}
