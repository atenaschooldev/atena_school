/**
 * ============================================================================
 * ATENA SCHOOL — USERS & ROLES DOMAIN
 * ============================================================================
 * @module @atena/api-types/auth/users
 * @description
 * Роли пользователей и профили доступа платформы (users table, auth guard, RBAC).
 * Числовые идентификаторы ролей (SMALLINT DEFAULT 1):
 * - 1: STUDENT    — Студент (личный кабинет, расписание, материалы)
 * - 2: TEACHER    — Преподаватель (журнал занятий, отметки посещаемости)
 * - 3: ADMIN      — Администратор (CRM, курсы, касса, управление бронями)
 * - 4: PARENT     — Родитель/опекун (оплата, контроль посещаемости ребёнка)
 * - 5: SECRETARY  — Секретариат (приём заявок, координация расписания)
 * - 6: SUPERADMIN — Главный администратор платформы (полный доступ)
 * ============================================================================
 */

import { DictionaryEntry } from '../common/dictionary.types';

// ----------------------------------------------------------------------------
// 1. User Role Enum & Dictionary
// ----------------------------------------------------------------------------

export const UserRole = {
  STUDENT: 1,
  TEACHER: 2,
  ADMIN: 3,
  PARENT: 4,
  SECRETARY: 5,
  SUPERADMIN: 6,
} as const;
export type UserRole = (typeof UserRole)[keyof typeof UserRole];

export const USER_ROLE_DICTIONARY: Record<UserRole, DictionaryEntry> = {
  [UserRole.STUDENT]: {
    id: 1,
    code: 'STUDENT',
    label_it: 'Studente',
    label_en: 'Student',
    label_ru: 'Студент',
    description: 'Ученик школы, доступ к личному кабинету и расписанию',
  },
  [UserRole.TEACHER]: {
    id: 2,
    code: 'TEACHER',
    label_it: 'Docente / Insegnante',
    label_en: 'Teacher / Instructor',
    label_ru: 'Преподаватель',
    description: 'Учитель языковой школы, доступ к журналу занятий и группам',
  },
  [UserRole.ADMIN]: {
    id: 3,
    code: 'ADMIN',
    label_it: 'Amministratore',
    label_en: 'Administrator',
    label_ru: 'Администратор',
    description: 'Полный доступ к управлению школой, CRM, кассе и студентам',
  },
  [UserRole.PARENT]: {
    id: 4,
    code: 'PARENT',
    label_it: 'Genitore / Tutore',
    label_en: 'Parent / Guardian',
    label_ru: 'Родитель / Опекун',
    description: 'Законный представитель несовершеннолетнего ученика',
  },
  [UserRole.SECRETARY]: {
    id: 5,
    code: 'SECRETARY',
    label_it: 'Segreteria',
    label_en: 'Secretary',
    label_ru: 'Секретариат',
    description: 'Сотрудник секретариата школы, управление расписанием и клиентами',
  },
  [UserRole.SUPERADMIN]: {
    id: 6,
    code: 'SUPERADMIN',
    label_it: 'Super Admin',
    label_en: 'Super Admin',
    label_ru: 'Главный администратор',
    description: 'Полный технический и финансовый доступ ко всей платформе',
  },
};

/**
 * Безопасный парсер роли пользователя из строки или числа
 */
export function parseUserRole(val: any): UserRole {
  if (typeof val === 'number') {
    if (val >= 1 && val <= 6) return val as UserRole;
    return UserRole.STUDENT;
  }
  const s = String(val || '').toLowerCase().trim();
  if (s === '1' || s === 'student' || s === 'studente' || s === 'allievo' || s === 'user') return UserRole.STUDENT;
  if (s === '2' || s === 'teacher' || s === 'docente' || s === 'insegnante') return UserRole.TEACHER;
  if (s === '3' || s === 'admin' || s === 'administrator' || s === 'amministratore') return UserRole.ADMIN;
  if (s === '4' || s === 'parent' || s === 'genitore' || s === 'tutore') return UserRole.PARENT;
  if (s === '5' || s === 'secretary' || s === 'segreteria') return UserRole.SECRETARY;
  if (s === '6' || s === 'superadmin') return UserRole.SUPERADMIN;
  return UserRole.STUDENT;
}

// ----------------------------------------------------------------------------
// 2. User Profile DTO Interface
// ----------------------------------------------------------------------------

export interface UserProfile {
  id: string;
  email: string;
  full_name?: string;
  phone?: string;
  role: 'student' | 'teacher' | 'admin';
  created_at?: string;
}
