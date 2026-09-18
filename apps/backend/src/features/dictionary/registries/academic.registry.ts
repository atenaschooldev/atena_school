/**
 * ============================================================================
 * ATENA SCHOOL — ACADEMIC DICTIONARY REGISTRY
 * ============================================================================
 * @module @atena/backend/features/dictionary/registries/academic.registry
 * @description
 * Реестр метаданных для учебных и академических таблиц:
 * - courses (Курсы, форматы, статусы публикации, категории)
 * - lessons (Уроки в расписании, статусы проведения, форматы аудитория/онлайн)
 * - attendance_records (Детализированный журнал посещаемости по студентам)
 * - students (Реестр студентов, уровни владения языком CEFR A1..C2)
 * - annual_memberships (Годовые членские карты ассоциации €30)
 * ============================================================================
 */

import {
  COURSE_STATUS_DICTIONARY,
  COURSE_SCHEDULE_TYPE_DICTIONARY,
  COURSE_FORMAT_DICTIONARY,
  COURSE_CATEGORY_DICTIONARY,
  LESSON_STATUS_DICTIONARY,
  LESSON_ATTENDANCE_DICTIONARY,
  LESSON_LOCATION_TYPE_DICTIONARY,
  MEMBERSHIP_STATUS_DICTIONARY,
  STUDENT_STATUS_DICTIONARY,
  LANGUAGE_LEVEL_DICTIONARY,
  CourseStatus,
  CourseScheduleType,
  CourseFormat,
  CourseCategory,
  LessonStatus,
  LessonAttendance,
  LessonLocationType,
  MembershipStatus,
  StudentStatus,
  LanguageLevel,
} from '@atena/api-types';
import { DictionaryTableDefinition } from './types';

// ----------------------------------------------------------------------------
// 1. Courses Table Metadata
// ----------------------------------------------------------------------------

export function getCoursesDictionary(): DictionaryTableDefinition {
  const columns = {
    status: {
      column: 'status',
      dbType: 'SMALLINT / INTEGER',
      name: 'CourseStatus',
      description: 'Статус курса в каталоге (1=ACTIVE, 2=DRAFT, 3=ARCHIVED)',
      values: COURSE_STATUS_DICTIONARY,
      codes: CourseStatus,
    },
    schedule_type: {
      column: 'schedule_type',
      dbType: 'SMALLINT / INTEGER',
      name: 'CourseScheduleType',
      description: 'Тип расписания занятий (1=FIXED, 2=FLEXIBLE)',
      values: COURSE_SCHEDULE_TYPE_DICTIONARY,
      codes: CourseScheduleType,
    },
    course_format: {
      column: 'course_format',
      dbType: 'SMALLINT / INTEGER',
      name: 'CourseFormat',
      description: 'Формат проведения курса (1=GROUP, 2=INDIVIDUAL, 3=ONLINE, 4=CERTIFICATION)',
      values: COURSE_FORMAT_DICTIONARY,
      codes: CourseFormat,
    },
    category: {
      column: 'category',
      dbType: 'TEXT / SMALLINT',
      name: 'CourseCategory',
      description: 'Предметная категория курса (1=LANGUAGES, 2=ACADEMIC, 3=CERTIPASS, 4=OTHER)',
      values: COURSE_CATEGORY_DICTIONARY,
      codes: CourseCategory,
    },
  };

  return {
    table: 'courses',
    title: 'Курсы и программы обучения',
    description:
      'Каталог курсов языковой школы Atena: индивидуальные и групповые курсы, онлайн-программы и курсы сертификации Certipass/Cambridge.',
    columns,
    enums: columns,
  };
}

// ----------------------------------------------------------------------------
// 2. Lessons Table Metadata
// ----------------------------------------------------------------------------

export function getLessonsDictionary(): DictionaryTableDefinition {
  const columns = {
    status: {
      column: 'status',
      dbType: 'SMALLINT / INTEGER',
      name: 'LessonStatus',
      description: 'Статус жизненного цикла урока (1=SCHEDULED, 2=COMPLETED, 3=CANCELLED, 4=RESCHEDULED)',
      values: LESSON_STATUS_DICTIONARY,
      codes: LessonStatus,
    },
    attendance: {
      column: 'attendance',
      dbType: 'SMALLINT / INTEGER',
      name: 'LessonAttendance',
      description: 'Факт посещения студентом урока (1=PENDING, 2=PRESENT, 3=ABSENT, 4=LATE, 5=EXCUSED)',
      values: LESSON_ATTENDANCE_DICTIONARY,
      codes: LessonAttendance,
    },
    location_type: {
      column: 'location_type',
      dbType: 'SMALLINT / INTEGER',
      name: 'LessonLocationType',
      description: 'Формат проведения урока (1=IN_PERSON, 2=ONLINE, 3=HYBRID)',
      values: LESSON_LOCATION_TYPE_DICTIONARY,
      codes: LessonLocationType,
    },
  };

  return {
    table: 'lessons',
    title: 'Уроки и расписание',
    description:
      'Таблица запланированных уроков, привязанных к бронированиям. Хранит дату/время, статус урока, факт посещения, тип проведения и ссылки на преподавателей.',
    columns,
    enums: columns,
  };
}

// ----------------------------------------------------------------------------
// 3. Attendance Records Metadata
// ----------------------------------------------------------------------------

export function getAttendanceRecordsDictionary(): DictionaryTableDefinition {
  const columns = {
    status: {
      column: 'status',
      dbType: 'SMALLINT / INTEGER',
      name: 'LessonAttendance',
      description: 'Отметка посещаемости конкретного студента на занятии (1=PENDING, 2=PRESENT, 3=ABSENT, 4=LATE, 5=EXCUSED)',
      values: LESSON_ATTENDANCE_DICTIONARY,
      codes: LessonAttendance,
    },
  };

  return {
    table: 'attendance_records',
    title: 'Журнал посещаемости (Attendance Records)',
    description: 'Детализированный реестр отметок присутствия студентов на занятиях с фиксацией автора отметки, времени и заметок.',
    columns,
    enums: columns,
  };
}

// ----------------------------------------------------------------------------
// 4. Students Registry Metadata
// ----------------------------------------------------------------------------

export function getStudentsDictionary(): DictionaryTableDefinition {
  const columns = {
    status: {
      column: 'status',
      dbType: 'SMALLINT / INTEGER',
      name: 'StudentStatus',
      description: 'Статус студента в реестре школы (1=ACTIVE, 2=INACTIVE, 3=PAUSED, 4=GRADUATED, 5=ARCHIVED)',
      values: STUDENT_STATUS_DICTIONARY,
      codes: StudentStatus,
    },
    language_level: {
      column: 'language_level',
      dbType: 'SMALLINT / INTEGER',
      name: 'LanguageLevel',
      description: 'Уровень владения языком по шкале CEFR (1=A1..6=C2)',
      values: LANGUAGE_LEVEL_DICTIONARY,
      codes: LanguageLevel,
    },
  };

  return {
    table: 'students',
    title: 'Студенты (Реестр учеников)',
    description:
      'Основная таблица студентов языковой школы Atena. Хранит персональные данные, уровень языка по CEFR, статус обучения и статус оплаты годового взноса.',
    columns,
    enums: columns,
  };
}

// ----------------------------------------------------------------------------
// 5. Annual Memberships Metadata (€30 Tessere)
// ----------------------------------------------------------------------------

export function getAnnualMembershipsDictionary(): DictionaryTableDefinition {
  const columns = {
    status: {
      column: 'status',
      dbType: 'SMALLINT / INTEGER',
      name: 'MembershipStatus',
      description: 'Статус членства ассоциации (1=ACTIVE, 2=PENDING, 3=EXPIRED, 4=REVOKED)',
      values: MEMBERSHIP_STATUS_DICTIONARY,
      codes: MembershipStatus,
    },
  };

  return {
    table: 'annual_memberships',
    title: 'Годовые членские взносы (Tessere)',
    description:
      'Таблица членских карт ассоциации школы (€30 за учебный год). Автоматически активируется при оплате взноса и действует до 31 августа текущего учебного года.',
    columns,
    enums: columns,
  };
}
