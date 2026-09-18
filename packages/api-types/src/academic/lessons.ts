/**
 * ============================================================================
 * ATENA SCHOOL — ACADEMIC / LESSONS DOMAIN
 * ============================================================================
 * @module @atena/api-types/academic/lessons
 * @description
 * Расписание занятий, статусы уроков, посещаемость и форматы локаций:
 * - LessonStatus: 1=SCHEDULED, 2=COMPLETED, 3=CANCELLED, 4=RESCHEDULED
 * - LessonAttendance: 1=PENDING, 2=PRESENT, 3=ABSENT, 4=LATE, 5=EXCUSED
 * - LessonLocationType: 1=IN_PERSON, 2=ONLINE, 3=HYBRID
 * ============================================================================
 */

import { DictionaryEntry } from '../common/dictionary';

// ----------------------------------------------------------------------------
// 1. Lesson Lifecycle Status
// ----------------------------------------------------------------------------

export const LessonStatus = {
  SCHEDULED:   1, // Scheduled / Programmata
  COMPLETED:   2, // Completed / Completata
  CANCELLED:   3, // Cancelled / Annullata
  RESCHEDULED: 4, // Rescheduled / Riprogrammata
} as const;
export type LessonStatus = (typeof LessonStatus)[keyof typeof LessonStatus];

export const LessonAttendance = {
  PENDING: 1, // Not yet recorded / Da registrare
  PRESENT: 2, // Attended / Presente
  ABSENT:  3, // Absent / Assente
  LATE:    4, // Late / In ritardo
  EXCUSED: 5, // Excused absence / Giustificato
} as const;
export type LessonAttendance = (typeof LessonAttendance)[keyof typeof LessonAttendance];

export const LessonLocationType = {
  IN_PERSON: 1, // In person / In presenza
  ONLINE:    2, // Online
  HYBRID:    3, // Hybrid / Ibrido
} as const;
export type LessonLocationType = (typeof LessonLocationType)[keyof typeof LessonLocationType];

export const LESSON_STATUS_DICTIONARY: Record<LessonStatus, DictionaryEntry> = {
  [LessonStatus.SCHEDULED]: {
    id: 1,
    code: 'SCHEDULED',
    label_it: 'Programmata',
    label_en: 'Scheduled',
    label_ru: 'Запланировано',
    description: 'Урок запланирован в календаре, ещё не проведён',
  },
  [LessonStatus.COMPLETED]: {
    id: 2,
    code: 'COMPLETED',
    label_it: 'Completata',
    label_en: 'Completed',
    label_ru: 'Проведён',
    description: 'Урок состоялся, посещаемость отмечена',
  },
  [LessonStatus.CANCELLED]: {
    id: 3,
    code: 'CANCELLED',
    label_it: 'Annullata',
    label_en: 'Cancelled',
    label_ru: 'Отменён',
    description: 'Урок отменён (праздник, болезнь, форс-мажор)',
  },
  [LessonStatus.RESCHEDULED]: {
    id: 4,
    code: 'RESCHEDULED',
    label_it: 'Riprogrammata',
    label_en: 'Rescheduled',
    label_ru: 'Перенесён',
    description: 'Урок перенесён на другую дату/время',
  },
};

export const LESSON_ATTENDANCE_DICTIONARY: Record<LessonAttendance, DictionaryEntry> = {
  [LessonAttendance.PENDING]: {
    id: 1,
    code: 'PENDING',
    label_it: 'Da registrare',
    label_en: 'Pending',
    label_ru: 'Не отмечено',
    description: 'Присутствие ещё не отмечено (по умолчанию)',
  },
  [LessonAttendance.PRESENT]: {
    id: 2,
    code: 'PRESENT',
    label_it: 'Presente',
    label_en: 'Present',
    label_ru: 'Присутствовал',
    description: 'Студент присутствовал на уроке',
  },
  [LessonAttendance.ABSENT]: {
    id: 3,
    code: 'ABSENT',
    label_it: 'Assente',
    label_en: 'Absent',
    label_ru: 'Отсутствовал',
    description: 'Студент пропустил урок без уважительной причины',
  },
  [LessonAttendance.LATE]: {
    id: 4,
    code: 'LATE',
    label_it: 'In ritardo',
    label_en: 'Late',
    label_ru: 'Опоздал',
    description: 'Студент пришёл с опозданием',
  },
  [LessonAttendance.EXCUSED]: {
    id: 5,
    code: 'EXCUSED',
    label_it: 'Giustificato',
    label_en: 'Excused',
    label_ru: 'Уважительная причина',
    description: 'Пропуск по уважительной причине (болезнь, справка)',
  },
};

export const LESSON_LOCATION_TYPE_DICTIONARY: Record<LessonLocationType, DictionaryEntry> = {
  [LessonLocationType.IN_PERSON]: {
    id: 1,
    code: 'IN_PERSON',
    label_it: 'In presenza',
    label_en: 'In person',
    label_ru: 'Очно',
    description: 'Урок проводится очно в классе школы',
  },
  [LessonLocationType.ONLINE]: {
    id: 2,
    code: 'ONLINE',
    label_it: 'Online',
    label_en: 'Online',
    label_ru: 'Онлайн',
    description: 'Урок проводится дистанционно (Google Meet и т.п.)',
  },
  [LessonLocationType.HYBRID]: {
    id: 3,
    code: 'HYBRID',
    label_it: 'Ibrido',
    label_en: 'Hybrid',
    label_ru: 'Смешанный',
    description: 'Часть студентов очно, часть подключается онлайн',
  },
};

export const LESSON_STATUS_STRING_TO_ID: Record<string, LessonStatus> = {
  scheduled:   LessonStatus.SCHEDULED,
  completed:   LessonStatus.COMPLETED,
  cancelled:   LessonStatus.CANCELLED,
  rescheduled: LessonStatus.RESCHEDULED,
};

export const LESSON_STATUS_ID_TO_STRING: Record<LessonStatus, string> = {
  [LessonStatus.SCHEDULED]:   'scheduled',
  [LessonStatus.COMPLETED]:   'completed',
  [LessonStatus.CANCELLED]:   'cancelled',
  [LessonStatus.RESCHEDULED]: 'rescheduled',
};

export const LESSON_ATTENDANCE_STRING_TO_ID: Record<string, LessonAttendance> = {
  pending: LessonAttendance.PENDING,
  present: LessonAttendance.PRESENT,
  absent:  LessonAttendance.ABSENT,
  late:    LessonAttendance.LATE,
  excused: LessonAttendance.EXCUSED,
};

export const LESSON_ATTENDANCE_ID_TO_STRING: Record<LessonAttendance, string> = {
  [LessonAttendance.PENDING]: 'pending',
  [LessonAttendance.PRESENT]: 'present',
  [LessonAttendance.ABSENT]:  'absent',
  [LessonAttendance.LATE]:    'late',
  [LessonAttendance.EXCUSED]: 'excused',
};

export const LESSON_LOCATION_TYPE_STRING_TO_ID: Record<string, LessonLocationType> = {
  in_person: LessonLocationType.IN_PERSON,
  offline:   LessonLocationType.IN_PERSON,
  online:    LessonLocationType.ONLINE,
  hybrid:    LessonLocationType.HYBRID,
};

export const LESSON_LOCATION_TYPE_ID_TO_STRING: Record<LessonLocationType, string> = {
  [LessonLocationType.IN_PERSON]: 'in_person',
  [LessonLocationType.ONLINE]:    'online',
  [LessonLocationType.HYBRID]:    'hybrid',
};

export function parseLessonStatus(val: unknown): LessonStatus {
  if (typeof val === 'number' && val in LESSON_STATUS_DICTIONARY) {
    return val as LessonStatus;
  }
  if (typeof val === 'string') {
    const normalized = val.trim().toLowerCase();
    const mapped = LESSON_STATUS_STRING_TO_ID[normalized];
    if (mapped) return mapped;
    const num = parseInt(val, 10);
    if (!isNaN(num) && num in LESSON_STATUS_DICTIONARY) {
      return num as LessonStatus;
    }
  }
  return LessonStatus.SCHEDULED;
}

export function parseLessonAttendance(val: unknown): LessonAttendance {
  if (typeof val === 'number' && val in LESSON_ATTENDANCE_DICTIONARY) {
    return val as LessonAttendance;
  }
  if (typeof val === 'string') {
    const normalized = val.trim().toLowerCase();
    const mapped = LESSON_ATTENDANCE_STRING_TO_ID[normalized];
    if (mapped) return mapped;
    const num = parseInt(val, 10);
    if (!isNaN(num) && num in LESSON_ATTENDANCE_DICTIONARY) {
      return num as LessonAttendance;
    }
  }
  return LessonAttendance.PENDING;
}

export function parseLessonLocationType(val: unknown): LessonLocationType {
  if (typeof val === 'number' && val in LESSON_LOCATION_TYPE_DICTIONARY) {
    return val as LessonLocationType;
  }
  if (typeof val === 'string') {
    const normalized = val.trim().toLowerCase();
    const mapped = LESSON_LOCATION_TYPE_STRING_TO_ID[normalized];
    if (mapped) return mapped;
    const num = parseInt(val, 10);
    if (!isNaN(num) && num in LESSON_LOCATION_TYPE_DICTIONARY) {
      return num as LessonLocationType;
    }
  }
  return LessonLocationType.IN_PERSON;
}
