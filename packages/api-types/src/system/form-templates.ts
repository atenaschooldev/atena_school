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

import { DictionaryEntry } from '../common/dictionary';

// ----------------------------------------------------------------------------
// 1. FormType
// ----------------------------------------------------------------------------

export const FormType = {
  BOOKING: 1,
  CONTACT: 2,
  TEST: 3,
  CUSTOM: 4,
} as const;
export type FormType = (typeof FormType)[keyof typeof FormType];

export const FORM_TYPE_DICTIONARY: Record<FormType, DictionaryEntry> = {
  [FormType.BOOKING]: {
    id: 1,
    code: 'BOOKING',
    label_it: 'Iscrizione Corso',
    label_en: 'Course Registration',
    label_ru: 'Запись на курс',
    description: 'Форма записи на курс, используется в checkout лендинга',
  },
  [FormType.CONTACT]: {
    id: 2,
    code: 'CONTACT',
    label_it: 'Contatti & Info',
    label_en: 'Contact & Info',
    label_ru: 'Форма связи',
    description: 'Форма обратной связи / лид-форма на лендинге',
  },
  [FormType.TEST]: {
    id: 3,
    code: 'TEST',
    label_it: 'Test di Livello',
    label_en: 'Level Test',
    label_ru: 'Тест уровня',
    description: 'Форма теста уровня знания языка',
  },
  [FormType.CUSTOM]: {
    id: 4,
    code: 'CUSTOM',
    label_it: 'Personalizzato',
    label_en: 'Custom',
    label_ru: 'Кастомная форма',
    description: 'Произвольная кастомная форма для специальных кейсов',
  },
};

export function parseFormType(val: any): FormType {
  if (typeof val === 'number') {
    if (val === 1) return FormType.BOOKING;
    if (val === 2) return FormType.CONTACT;
    if (val === 3) return FormType.TEST;
    if (val === 4) return FormType.CUSTOM;
  }
  const s = String(val || '').toLowerCase().trim();
  if (s === '1' || s === 'booking') return FormType.BOOKING;
  if (s === '2' || s === 'contact') return FormType.CONTACT;
  if (s === '3' || s === 'test') return FormType.TEST;
  if (s === '4' || s === 'custom') return FormType.CUSTOM;
  return FormType.BOOKING;
}

// ----------------------------------------------------------------------------
// 2. FormFieldType
// ----------------------------------------------------------------------------

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

export const FORM_FIELD_TYPE_DICTIONARY: Record<FormFieldType, DictionaryEntry> = {
  [FormFieldType.TEXT]: {
    id: 1,
    code: 'TEXT',
    label_it: 'Testo Libero',
    label_en: 'Free Text',
    label_ru: 'Текстовое поле',
    description: 'Однострочное текстовое поле',
  },
  [FormFieldType.EMAIL]: {
    id: 2,
    code: 'EMAIL',
    label_it: 'Email',
    label_en: 'Email',
    label_ru: 'Email адрес',
    description: 'Поле email с валидацией формата',
  },
  [FormFieldType.PHONE]: {
    id: 3,
    code: 'PHONE',
    label_it: 'Telefono',
    label_en: 'Phone',
    label_ru: 'Номер телефона',
    description: 'Поле номера телефона',
  },
  [FormFieldType.NUMBER]: {
    id: 4,
    code: 'NUMBER',
    label_it: 'Numero',
    label_en: 'Number',
    label_ru: 'Число',
    description: 'Числовое поле',
  },
  [FormFieldType.SELECT]: {
    id: 5,
    code: 'SELECT',
    label_it: 'Menu a Tendina',
    label_en: 'Dropdown',
    label_ru: 'Выпадающий список',
    description: 'Поле выбора из списка вариантов',
  },
  [FormFieldType.CHECKBOX]: {
    id: 6,
    code: 'CHECKBOX',
    label_it: 'Casella di Controllo',
    label_en: 'Checkbox',
    label_ru: 'Чекбокс',
    description: 'Флажок (булево значение)',
  },
  [FormFieldType.RADIO]: {
    id: 7,
    code: 'RADIO',
    label_it: 'Scelta Singola',
    label_en: 'Radio Buttons',
    label_ru: 'Радиокнопки',
    description: 'Выбор одного варианта из нескольких',
  },
  [FormFieldType.TEXTAREA]: {
    id: 8,
    code: 'TEXTAREA',
    label_it: 'Testo Esteso',
    label_en: 'Long Text',
    label_ru: 'Многострочный текст',
    description: 'Многострочное текстовое поле',
  },
  [FormFieldType.DATE]: {
    id: 9,
    code: 'DATE',
    label_it: 'Data',
    label_en: 'Date',
    label_ru: 'Дата',
    description: 'Поле выбора даты',
  },
};

export function parseFormFieldType(val: any): FormFieldType {
  const s = String(val || '').toLowerCase().trim();
  if (s === 'text') return FormFieldType.TEXT;
  if (s === 'email') return FormFieldType.EMAIL;
  if (s === 'phone') return FormFieldType.PHONE;
  if (s === 'number') return FormFieldType.NUMBER;
  if (s === 'select') return FormFieldType.SELECT;
  if (s === 'checkbox') return FormFieldType.CHECKBOX;
  if (s === 'radio') return FormFieldType.RADIO;
  if (s === 'textarea') return FormFieldType.TEXTAREA;
  if (s === 'date') return FormFieldType.DATE;
  return FormFieldType.TEXT;
}

// ----------------------------------------------------------------------------
// 3. FormFieldTarget
// ----------------------------------------------------------------------------

export const FormFieldTarget = {
  PURCHASER: 'purchaser', // Относится к плательщику/родителю
  STUDENT: 'student',     // Относится к студенту/ребёнку
  BOOKING: 'booking',     // Общие параметры бронирования/заявки
} as const;
export type FormFieldTarget = (typeof FormFieldTarget)[keyof typeof FormFieldTarget];

export const FORM_FIELD_TARGET_DICTIONARY: Record<FormFieldTarget, DictionaryEntry> = {
  [FormFieldTarget.PURCHASER]: {
    id: 1,
    code: 'PURCHASER',
    label_it: 'Acquirente / Genitore',
    label_en: 'Purchaser / Parent',
    label_ru: 'Плательщик / Родитель',
    description: 'Поле относится к данным плательщика или родителя',
  },
  [FormFieldTarget.STUDENT]: {
    id: 2,
    code: 'STUDENT',
    label_it: 'Studente / Figlio',
    label_en: 'Student / Child',
    label_ru: 'Студент / Ребёнок',
    description: 'Поле относится к данным студента или ребёнка',
  },
  [FormFieldTarget.BOOKING]: {
    id: 3,
    code: 'BOOKING',
    label_it: 'Prenotazione / Generale',
    label_en: 'Booking / General',
    label_ru: 'Бронирование / Общее',
    description: 'Поле относится к параметрам бронирования в целом',
  },
};

export function parseFormFieldTarget(val: any): FormFieldTarget {
  const s = String(val || '').toLowerCase().trim();
  if (s === 'purchaser') return FormFieldTarget.PURCHASER;
  if (s === 'student') return FormFieldTarget.STUDENT;
  if (s === 'booking') return FormFieldTarget.BOOKING;
  return FormFieldTarget.PURCHASER;
}

// ----------------------------------------------------------------------------
// 4. FormFieldOption & FormFieldConfig
// ----------------------------------------------------------------------------

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

// ----------------------------------------------------------------------------
// 5. FormTemplate & DTOs
// ----------------------------------------------------------------------------

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


