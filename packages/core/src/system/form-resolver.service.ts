import {
  FormTemplate,
  FormType,
  FormFieldType,
  FormFieldTarget,
  ResolveFormQuery,
} from '@atena/api-types';

/**
 * Стандартный дефолтный шаблон формы бронирования курса
 */
export const DEFAULT_BOOKING_FORM_TEMPLATE: FormTemplate = {
  id: 'default-booking-form',
  title: 'Modulo Iscrizione Standard',
  description: 'Modulo predefinito per la prenotazione e acquisto dei corsi',
  form_type: FormType.BOOKING,
  is_default: true,
  is_active: true,
  category_slug: null,
  course_id: null,
  fields_config: [],
};

export const DEFAULT_CONTACT_FORM_TEMPLATE: FormTemplate = {
  id: 'default-contact-form',
  title: 'Modulo Contatto Standard',
  description: 'Modulo predefinito per le richieste di informazioni e contatto',
  form_type: FormType.CONTACT,
  is_default: true,
  is_active: true,
  category_slug: null,
  course_id: null,
  fields_config: [],
};

/**
 * Каскадный резолвер активного шаблона формы:
 * Приоритет 1: Точный курс (`course_id === query.course_id`)
 * Приоритет 2: Категория курса (`category_slug === query.category_slug`)
 * Приоритет 3: Форма по умолчанию (`is_default === true && form_type === query.form_type`)
 * Приоритет 4: Первая активная форма указанного типа (`form_type === query.form_type`)
 * Приоритет 5: Дефолтный встроенный шаблон системы (для booking или contact)
 */
export function resolveActiveFormTemplate(
  templates?: FormTemplate[] | null,
  query: ResolveFormQuery = { form_type: FormType.BOOKING }
): FormTemplate {
  const safeTemplates = Array.isArray(templates) ? templates : [];
  const activeTemplates = safeTemplates.filter(
    (t) => t && t.is_active && t.form_type === query.form_type
  );

  // 1. Проверка по конкретному курсу
  if (query.course_id) {
    const courseSpecific = activeTemplates.find(
      (t) => t.course_id === query.course_id
    );
    if (courseSpecific) return courseSpecific;
  }

  // 2. Проверка по категории
  if (query.category_slug) {
    const categorySpecific = activeTemplates.find(
      (t) => t.category_slug === query.category_slug && !t.course_id
    );
    if (categorySpecific) return categorySpecific;
  }

  // 3. Форма по умолчанию
  const defaultTemplate = activeTemplates.find((t) => t.is_default);
  if (defaultTemplate) return defaultTemplate;

  // 4. Первая активная
  if (activeTemplates.length > 0) return activeTemplates[0];

  // 5. Встроенный фоллбэк
  if (query.form_type === FormType.BOOKING) {
    return DEFAULT_BOOKING_FORM_TEMPLATE;
  }
  if (query.form_type === FormType.CONTACT) {
    return DEFAULT_CONTACT_FORM_TEMPLATE;
  }

  return {
    id: `default-${query.form_type}-form`,
    title: `Modulo ${query.form_type}`,
    form_type: query.form_type,
    is_default: true,
    is_active: true,
    fields_config: [],
  };
}

/**
 * Фильтрует и сортирует поля формы для клиентского рендеринга
 */
export function getActiveFormFields(template?: FormTemplate | null) {
  if (!template || !Array.isArray(template.fields_config)) return [];
  return template.fields_config
    .filter((f) => f.is_enabled)
    .sort((a, b) => (a.sort_order ?? 0) - (b.sort_order ?? 0));
}
