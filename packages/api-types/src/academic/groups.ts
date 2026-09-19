/**
 * ============================================================================
 * ATENA SCHOOL — ACADEMIC / GROUPS DOMAIN
 * ============================================================================
 * @module @atena/api-types/academic/groups
 * @description
 * Учебные группы, статусы групп, распределение студентов и групповые занятия:
 * - GroupStatus: 1=RECRUITING, 2=IN_PROGRESS, 3=COMPLETED, 4=ARCHIVED
 * - GroupMemberStatus: 1=ACTIVE, 2=PAUSED, 3=COMPLETED, 4=DROPPED
 * ============================================================================
 */

import { DictionaryEntry } from '../common/dictionary';

// ----------------------------------------------------------------------------
// 1. Group Status
// ----------------------------------------------------------------------------

export const GroupStatus = {
  RECRUITING:  1, // Набор открыт / Iscrizioni aperte
  IN_PROGRESS: 2, // В процессе / In corso
  COMPLETED:   3, // Завершено / Completato
  ARCHIVED:    4, // В архиве / Archiviato
} as const;
export type GroupStatus = (typeof GroupStatus)[keyof typeof GroupStatus];

export const GroupMemberStatus = {
  ACTIVE:    1, // Активен / Attivo
  PAUSED:    2, // Заморожен / Sospeso
  COMPLETED: 3, // Завершил / Completato
  DROPPED:   4, // Отчислен / Ritirato
} as const;
export type GroupMemberStatus = (typeof GroupMemberStatus)[keyof typeof GroupMemberStatus];

export const GROUP_STATUS_DICTIONARY: Record<GroupStatus, DictionaryEntry> = {
  [GroupStatus.RECRUITING]: {
    id: 1,
    code: 'RECRUITING',
    label_it: 'Iscrizioni aperte',
    label_en: 'Recruiting',
    label_ru: 'Набор открыт',
    description: 'Группа формируется, идёт запись учеников',
  },
  [GroupStatus.IN_PROGRESS]: {
    id: 2,
    code: 'IN_PROGRESS',
    label_it: 'In corso',
    label_en: 'In progress',
    label_ru: 'В процессе',
    description: 'Занятия группы идут по расписанию',
  },
  [GroupStatus.COMPLETED]: {
    id: 3,
    code: 'COMPLETED',
    label_it: 'Completato',
    label_en: 'Completed',
    label_ru: 'Завершено',
    description: 'Курс группы успешно завершён',
  },
  [GroupStatus.ARCHIVED]: {
    id: 4,
    code: 'ARCHIVED',
    label_it: 'Archiviato',
    label_en: 'Archived',
    label_ru: 'В архиве',
    description: 'Группа в архиве',
  },
};

export const GROUP_MEMBER_STATUS_DICTIONARY: Record<GroupMemberStatus, DictionaryEntry> = {
  [GroupMemberStatus.ACTIVE]: {
    id: 1,
    code: 'ACTIVE',
    label_it: 'Attivo',
    label_en: 'Active',
    label_ru: 'Активен',
    description: 'Студент активно посещает занятия в группе',
  },
  [GroupMemberStatus.PAUSED]: {
    id: 2,
    code: 'PAUSED',
    label_it: 'Sospeso',
    label_en: 'Paused',
    label_ru: 'Заморожен',
    description: 'Студент временно приостановил посещение',
  },
  [GroupMemberStatus.COMPLETED]: {
    id: 3,
    code: 'COMPLETED',
    label_it: 'Completato',
    label_en: 'Completed',
    label_ru: 'Завершил',
    description: 'Студент закончил курс в группе',
  },
  [GroupMemberStatus.DROPPED]: {
    id: 4,
    code: 'DROPPED',
    label_it: 'Ritirato',
    label_en: 'Dropped',
    label_ru: 'Отчислен',
    description: 'Студент выбыл из группы',
  },
};

export function parseGroupStatus(status: unknown): GroupStatus {
  if (typeof status === 'number' && Object.values(GroupStatus).includes(status as GroupStatus)) {
    return status as GroupStatus;
  }
  if (typeof status === 'string') {
    const s = status.toUpperCase().trim();
    if (s === 'RECRUITING' || s === 'OPEN') return GroupStatus.RECRUITING;
    if (s === 'IN_PROGRESS' || s === 'ACTIVE') return GroupStatus.IN_PROGRESS;
    if (s === 'COMPLETED') return GroupStatus.COMPLETED;
    if (s === 'ARCHIVED') return GroupStatus.ARCHIVED;
  }
  return GroupStatus.RECRUITING;
}

export function parseGroupMemberStatus(status: unknown): GroupMemberStatus {
  if (typeof status === 'number' && Object.values(GroupMemberStatus).includes(status as GroupMemberStatus)) {
    return status as GroupMemberStatus;
  }
  if (typeof status === 'string') {
    const s = status.toUpperCase().trim();
    if (s === 'ACTIVE') return GroupMemberStatus.ACTIVE;
    if (s === 'PAUSED' || s === 'SUSPENDED') return GroupMemberStatus.PAUSED;
    if (s === 'COMPLETED') return GroupMemberStatus.COMPLETED;
    if (s === 'DROPPED') return GroupMemberStatus.DROPPED;
  }
  return GroupMemberStatus.ACTIVE;
}

// ----------------------------------------------------------------------------
// 2. Interfaces & DTOs
// ----------------------------------------------------------------------------

export interface GroupMemberItem {
  id: string;
  groupId: string;
  studentId: string;
  bookingId?: string | null;
  joinedAt: string;
  status: GroupMemberStatus;
  student?: {
    id: string;
    fullName: string;
    email?: string | null;
    phone?: string | null;
    taxCode?: string | null;
  };
}

export interface GroupItem {
  id: string;
  createdAt: string;
  updatedAt: string;
  name: string;
  courseId: string;
  courseName?: string;
  teacherId?: string | null;
  teacherName?: string;
  room?: string | null;
  maxStudents: number;
  currentEnrolledCount: number;
  status: GroupStatus;
  startDate?: string | null;
  endDate?: string | null;
  scheduleDays: number[];
  startTime?: string | null;
  endTime?: string | null;
  notes?: string | null;
  members?: GroupMemberItem[];
  totalLessonsCount?: number;
}

export interface CreateGroupDto {
  name: string;
  courseId: string;
  teacherId?: string | null;
  room?: string | null;
  maxStudents?: number;
  status?: GroupStatus;
  startDate?: string | null;
  endDate?: string | null;
  scheduleDays: number[];
  startTime: string;
  endTime?: string | null;
  notes?: string | null;
  generateLessons?: boolean;
}

export interface UpdateGroupDto {
  name?: string;
  courseId?: string;
  teacherId?: string | null;
  room?: string | null;
  maxStudents?: number;
  status?: GroupStatus;
  startDate?: string | null;
  endDate?: string | null;
  scheduleDays?: number[];
  startTime?: string;
  endTime?: string | null;
  notes?: string | null;
}

export interface AddGroupMemberDto {
  studentId: string;
  bookingId?: string | null;
  status?: GroupMemberStatus;
}
