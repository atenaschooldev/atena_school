/**
 * ============================================================================
 * ATENA SCHOOL — DAYS OF WEEK (CALENDAR & SCHEDULING)
 * ============================================================================
 * @module @atena/api-types/common/days-of-week
 * @description
 * Константы и словари дней недели для модуля расписания, бронирований и уроков.
 * Поддерживает как стандарт ISO 8601 (1=Monday..7=Sunday), так и JS Date (0=Sunday..6=Saturday).
 * ============================================================================
 */

import { DictionaryEntry } from './dictionary';

// ----------------------------------------------------------------------------
// 1. ISO 8601 Day of Week (1 = Monday ... 7 = Sunday) — Основной стандарт
// ----------------------------------------------------------------------------

export const DayOfWeek = {
  MONDAY:    1, // Monday / Lunedì / Понедельник
  TUESDAY:   2, // Tuesday / Martedì / Вторник
  WEDNESDAY: 3, // Wednesday / Mercoledì / Среда
  THURSDAY:  4, // Thursday / Giovedì / Четверг
  FRIDAY:    5, // Friday / Venerdì / Пятница
  SATURDAY:  6, // Saturday / Sabato / Суббота
  SUNDAY:    7, // Sunday / Domenica / Воскресенье
} as const;
export type DayOfWeek = (typeof DayOfWeek)[keyof typeof DayOfWeek];

export const DAY_OF_WEEK_DICTIONARY: Record<DayOfWeek, DictionaryEntry> = {
  [DayOfWeek.MONDAY]: {
    id: 1,
    code: 'MONDAY',
    label_it: 'Lunedì',
    label_en: 'Monday',
    label_ru: 'Понедельник',
    description: 'Первый рабочий день недели (ISO 8601)',
  },
  [DayOfWeek.TUESDAY]: {
    id: 2,
    code: 'TUESDAY',
    label_it: 'Martedì',
    label_en: 'Tuesday',
    label_ru: 'Вторник',
    description: 'Второй день недели',
  },
  [DayOfWeek.WEDNESDAY]: {
    id: 3,
    code: 'WEDNESDAY',
    label_it: 'Mercoledì',
    label_en: 'Wednesday',
    label_ru: 'Среда',
    description: 'Третий день недели',
  },
  [DayOfWeek.THURSDAY]: {
    id: 4,
    code: 'THURSDAY',
    label_it: 'Giovedì',
    label_en: 'Thursday',
    label_ru: 'Четверг',
    description: 'Четвёртый день недели',
  },
  [DayOfWeek.FRIDAY]: {
    id: 5,
    code: 'FRIDAY',
    label_it: 'Venerdì',
    label_en: 'Friday',
    label_ru: 'Пятница',
    description: 'Пятый рабочий день недели',
  },
  [DayOfWeek.SATURDAY]: {
    id: 6,
    code: 'SATURDAY',
    label_it: 'Sabato',
    label_en: 'Saturday',
    label_ru: 'Суббота',
    description: 'Шестой день недели, обычно выходной',
  },
  [DayOfWeek.SUNDAY]: {
    id: 7,
    code: 'SUNDAY',
    label_it: 'Domenica',
    label_en: 'Sunday',
    label_ru: 'Воскресенье',
    description: 'Последний день недели, выходной',
  },
};

export const DAY_OF_WEEK_STRING_TO_ID: Record<string, DayOfWeek> = {
  monday:    DayOfWeek.MONDAY,
  lunedi:    DayOfWeek.MONDAY,
  tuesday:   DayOfWeek.TUESDAY,
  martedi:   DayOfWeek.TUESDAY,
  wednesday: DayOfWeek.WEDNESDAY,
  mercoledi: DayOfWeek.WEDNESDAY,
  thursday:  DayOfWeek.THURSDAY,
  giovedi:   DayOfWeek.THURSDAY,
  friday:    DayOfWeek.FRIDAY,
  venerdi:   DayOfWeek.FRIDAY,
  saturday:  DayOfWeek.SATURDAY,
  sabato:    DayOfWeek.SATURDAY,
  sunday:    DayOfWeek.SUNDAY,
  domenica:  DayOfWeek.SUNDAY,
};

export const DAY_OF_WEEK_ID_TO_STRING: Record<DayOfWeek, string> = {
  [DayOfWeek.MONDAY]:    'monday',
  [DayOfWeek.TUESDAY]:   'tuesday',
  [DayOfWeek.WEDNESDAY]: 'wednesday',
  [DayOfWeek.THURSDAY]:  'thursday',
  [DayOfWeek.FRIDAY]:    'friday',
  [DayOfWeek.SATURDAY]:  'saturday',
  [DayOfWeek.SUNDAY]:    'sunday',
};

// ----------------------------------------------------------------------------
// 2. JS Date Compatible Weekday (0 = Sunday ... 6 = Saturday)
// ----------------------------------------------------------------------------

export const Weekday = {
  SUNDAY:    0,
  MONDAY:    1,
  TUESDAY:   2,
  WEDNESDAY: 3,
  THURSDAY:  4,
  FRIDAY:    5,
  SATURDAY:  6,
} as const;
export type Weekday = (typeof Weekday)[keyof typeof Weekday];

export const WEEKDAY_DICTIONARY: Record<number, DictionaryEntry> = {
  [Weekday.SUNDAY]:    { id: 0, code: 'SUN', label_it: 'Domenica',  label_en: 'Sunday',    label_ru: 'Воскресенье', description: 'Domenica' },
  [Weekday.MONDAY]:    { id: 1, code: 'MON', label_it: 'Lunedì',    label_en: 'Monday',    label_ru: 'Понедельник', description: 'Lunedì' },
  [Weekday.TUESDAY]:   { id: 2, code: 'TUE', label_it: 'Martedì',   label_en: 'Tuesday',   label_ru: 'Вторник',      description: 'Martedì' },
  [Weekday.WEDNESDAY]: { id: 3, code: 'WED', label_it: 'Mercoledì', label_en: 'Wednesday', label_ru: 'Среда',        description: 'Mercoledì' },
  [Weekday.THURSDAY]:  { id: 4, code: 'THU', label_it: 'Giovedì',   label_en: 'Thursday',  label_ru: 'Четверг',      description: 'Giovedì' },
  [Weekday.FRIDAY]:    { id: 5, code: 'FRI', label_it: 'Venerdì',   label_en: 'Friday',    label_ru: 'Пятница',      description: 'Venerdì' },
  [Weekday.SATURDAY]:  { id: 6, code: 'SAT', label_it: 'Sabato',    label_en: 'Saturday',  label_ru: 'Суббота',      description: 'Sabato' },
};
