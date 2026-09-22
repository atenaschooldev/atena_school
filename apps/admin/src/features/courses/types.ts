import { CourseStatus as CourseStatusEnum, CourseScheduleType, CourseFormat, CourseDeliveryMode, type CourseSettingsItem } from '@atena/api-types';

export type Level = "A1" | "A2" | "B1" | "B2" | "C1" | "C2";
export const LEVELS: Level[] = ["A1", "A2", "B1", "B2", "C1", "C2"];

export type CourseStatus = "attivo" | "in-programmazione" | "concluso" | "archiviato";

export interface CourseTeacherAssignment {
  teacherId: string;
  fullName?: string;
  role: number;
  isPrimary: boolean;
}

export interface Course {
  id: string;
  nome: string; // mapped to name
  categoria: string;
  categoryId?: string | null;
  categorySlug?: string | null;
  categoryName?: string | null;
  prezzo: number;
  stato: CourseStatus;
  foto?: string; // mapped to photoUrl
  descrizione: string;
  insegnanteId: string;
  insegnanteIds: string[];
  teacherName?: string | null;
  teachers?: CourseTeacherAssignment[];
  courseTeachers?: any[];
  
  // Operational Configuration (Settings)
  settingsId?: string | null;
  deliveryMode?: number | null;
  settings?: CourseSettingsItem | null;

  // Additional fields
  lessonsPerWeek: number | null;
  sortOrder: number | null;
  scheduleType: string | number | null;
  totalLessons: number | null;
  scheduleDays: string[];
  startTime: string | null;
  endTime: string | null;
  lessonDurationMinutes: number | null;
  totalHours: number | null;
  courseFormat: string | number | null;
  slug: string | null;
}

export interface CourseFormValues {
  nome: string;
  categoria: string;
  categoryId?: string;
  prezzo: number;
  stato: CourseStatus;
  foto: string;
  descrizione: string;
  insegnanteIds: string[];
  teachers?: Array<{ teacher_id: string; role: number; is_primary: boolean }>;
  
  // Operational Configuration (Settings)
  settingsId?: string | null;
  deliveryMode?: number | null;
  settings?: Partial<CourseSettingsItem> | null;

  // Additional fields
  lessonsPerWeek: number | null;
  sortOrder: number;
  scheduleType: string | number;
  totalLessons: number | null;
  scheduleDays: string[];
  startTime: string;
  endTime: string;
  lessonDurationMinutes: number | null;
  totalHours: number | null;
  courseFormat: string | number;
  slug: string;
}

export interface CourseApiResponse {
  id: string;
  name: string;
  title: string;
  category: string | null;
  categoryId?: string | null;
  categorySlug?: string | null;
  categoryName?: string | null;
  settingsId?: string | null;
  price: number | null;
  status: number | string | null;
  photoUrl: string | null;
  description: string | null;
  teacherId: string | null;
  teacherName: string | null;
  deliveryMode?: number | null;
  settings?: CourseSettingsItem | null;
  lessonsPerWeek: number | null;
  sortOrder: number | null;
  scheduleType: number | string | null;
  totalLessons: number | null;
  scheduleDays: string[] | null;
  startTime: string | null;
  endTime: string | null;
  lessonDurationMinutes: number | null;
  totalHours: number | null;
  courseFormat: number | string | null;
  slug: string | null;
  updatedAt: string | null;
  teachers?: CourseTeacherAssignment[];
  courseTeachers?: any[];
}

export function mapApiToCourse(api: CourseApiResponse): Course {
  const statusRaw = String(api.status || "1");
  const statusMap: Record<string, CourseStatus> = {
    "1": "attivo",
    "2": "in-programmazione",
    "3": "archiviato",
    active: "attivo",
    published: "attivo",
    draft: "in-programmazione",
    scheduled: "in-programmazione",
    planned: "in-programmazione",
    completed: "concluso",
    ended: "concluso",
    concluded: "concluso",
    archived: "archiviato",
    "in-programmazione": "in-programmazione",
    attivo: "attivo",
    concluso: "concluso",
    archiviato: "archiviato",
  };

  const assignedTeacherIds: string[] = [];
  if (Array.isArray(api.teachers) && api.teachers.length > 0) {
    for (const t of api.teachers) {
      if (t.teacherId && !assignedTeacherIds.includes(t.teacherId)) {
        assignedTeacherIds.push(t.teacherId);
      }
    }
  } else if (Array.isArray(api.courseTeachers) && api.courseTeachers.length > 0) {
    for (const ct of api.courseTeachers) {
      const tId = ct.teacher_id || ct.teacherId;
      if (tId && !assignedTeacherIds.includes(tId)) {
        assignedTeacherIds.push(tId);
      }
    }
  } else if (api.teacherId) {
    assignedTeacherIds.push(api.teacherId);
  }

  const settings = api.settings || null;
  const deliveryMode = api.deliveryMode ?? settings?.deliveryMode ?? (
    api.courseFormat === 4 || api.courseFormat === "certification" ? 4 :
    api.scheduleType === 2 || api.scheduleType === "flexible" || api.courseFormat === 2 || api.courseFormat === "private" ? 2 : 1
  );

  return {
    id: api.id,
    nome: api.name || api.title || "",
    categoria: api.categorySlug || api.category || "",
    categoryId: api.categoryId || null,
    categorySlug: api.categorySlug || null,
    categoryName: api.categoryName || null,
    settingsId: api.settingsId ?? settings?.id ?? null,
    prezzo: Number(api.price || 0),
    stato: statusMap[statusRaw] || "attivo",
    foto: api.photoUrl || undefined,
    descrizione: api.description || "",
    insegnanteId: assignedTeacherIds[0] || api.teacherId || "",
    insegnanteIds: assignedTeacherIds,
    teacherName: api.teacherName || null,
    teachers: api.teachers,
    courseTeachers: api.courseTeachers,
    
    deliveryMode: Number(deliveryMode),
    settings: settings,

    lessonsPerWeek: api.lessonsPerWeek ?? settings?.lessonsPerWeek ?? null,
    sortOrder: api.sortOrder ?? 0,
    scheduleType: api.scheduleType ?? (deliveryMode === 1 ? "fixed" : "flexible"),
    totalLessons: api.totalLessons ?? settings?.totalLessons ?? null,
    scheduleDays: api.scheduleDays ?? settings?.scheduleDays ?? [],
    startTime: api.startTime ?? settings?.startTime ?? "",
    endTime: api.endTime ?? settings?.endTime ?? "",
    lessonDurationMinutes: api.lessonDurationMinutes ?? settings?.lessonDurationMinutes ?? null,
    totalHours: api.totalHours ?? settings?.totalHours ?? null,
    courseFormat: api.courseFormat ?? (deliveryMode === 4 ? "certification" : (deliveryMode === 2 ? "private" : "group")),
    slug: api.slug ?? "",
  };
}

export function mapCourseToApiPayload(
  form: CourseFormValues,
): Record<string, unknown> {
  const statusMap: Record<CourseStatus, number> = {
    attivo: CourseStatusEnum.ACTIVE,
    "in-programmazione": CourseStatusEnum.DRAFT,
    concluso: CourseStatusEnum.ARCHIVED,
    archiviato: CourseStatusEnum.ARCHIVED,
  };

  const primaryId = form.insegnanteIds[0] || "";
  const teachersPayload = form.insegnanteIds.map((tId, idx) => ({
    teacher_id: tId,
    role: idx === 0 ? 1 : 2, // 1 = PRIMARY, 2 = ASSISTANT
    is_primary: idx === 0,
  }));

  const deliveryMode = form.deliveryMode ? Number(form.deliveryMode) : (
    form.courseFormat === 'certification' ? CourseDeliveryMode.CERTIFICATION :
    form.scheduleType === 'flexible' || form.courseFormat === 'private' ? CourseDeliveryMode.FLEXIBLE_SCHEDULE : CourseDeliveryMode.FIXED_SCHEDULE
  );

  const settingsPayload: Partial<CourseSettingsItem> = {
    id: form.settingsId || undefined,
    deliveryMode,
    scheduleDays: form.scheduleDays || [],
    startTime: form.startTime || null,
    endTime: form.endTime || null,
    lessonDurationMinutes: form.lessonDurationMinutes != null ? Number(form.lessonDurationMinutes) : null,
    lessonsPerWeek: form.lessonsPerWeek != null ? Number(form.lessonsPerWeek) : null,
    totalLessons: form.totalLessons != null ? Number(form.totalLessons) : null,
    totalHours: form.totalHours != null ? Number(form.totalHours) : null,
  };

  return {
    title: form.nome,
    name: form.nome,
    category: form.categoria,
    categoryId: form.categoryId || null,
    category_id: form.categoryId || null,
    settingsId: form.settingsId || null,
    settings_id: form.settingsId || null,
    price: Number(form.prezzo || 0),
    status: statusMap[form.stato] ?? CourseStatusEnum.ACTIVE,
    teacherId: primaryId || null,
    teachers: teachersPayload,
    description: form.descrizione,
    photoUrl: form.foto || null,
    
    deliveryMode,
    delivery_mode: deliveryMode,
    settings: settingsPayload,

    lessonsPerWeek: form.lessonsPerWeek != null ? Number(form.lessonsPerWeek) : null,
    sortOrder: Number(form.sortOrder || 0),
    scheduleType: form.scheduleType || null,
    totalLessons: form.totalLessons != null ? Number(form.totalLessons) : null,
    scheduleDays: form.scheduleDays || [],
    startTime: form.startTime || null,
    endTime: form.endTime || null,
    lessonDurationMinutes: form.lessonDurationMinutes != null ? Number(form.lessonDurationMinutes) : null,
    totalHours: form.totalHours != null ? Number(form.totalHours) : null,
    courseFormat: form.courseFormat || null,
    slug: form.slug || null,
  };
}

export interface CourseCategoryRecord {
  id: string;
  name: string;
  slug: string;
  description?: string | null;
  sortOrder: number;
  sort_order?: number;
  isActive: boolean;
  is_active?: boolean;
  coursesCount?: number;
  courses_count?: number;
  createdAt?: string | Date;
  updatedAt?: string | Date;
}

export interface CreateCourseCategoryDto {
  name: string;
  slug?: string;
  description?: string;
  sortOrder?: number;
  sort_order?: number;
  isActive?: boolean;
  is_active?: boolean;
}

export type UpdateCourseCategoryDto = Partial<CreateCourseCategoryDto>;

export interface CourseSettingsRecord {
  id: string;
  name: string;
  deliveryMode: number;
  delivery_mode?: number;
  scheduleDays: any[];
  schedule_days?: any[];
  startTime?: string | null;
  start_time?: string | null;
  endTime?: string | null;
  end_time?: string | null;
  lessonDurationMinutes?: number | null;
  lesson_duration_minutes?: number | null;
  lessonsPerWeek?: number | null;
  lessons_per_week?: number | null;
  totalLessons?: number | null;
  total_lessons?: number | null;
  totalHours?: number | null;
  total_hours?: number | null;
  minStudents?: number | null;
  min_students?: number | null;
  maxStudents?: number | null;
  max_students?: number | null;
  coursesCount?: number;
  courses_count?: number;
  createdAt?: string | Date;
  updatedAt?: string | Date;
}

export interface CreateCourseSettingsDto {
  name: string;
  deliveryMode?: number;
  delivery_mode?: number;
  scheduleDays?: any[];
  schedule_days?: any[];
  startTime?: string;
  start_time?: string;
  endTime?: string;
  end_time?: string;
  lessonDurationMinutes?: number;
  lesson_duration_minutes?: number;
  lessonsPerWeek?: number;
  lessons_per_week?: number;
  totalLessons?: number;
  total_lessons?: number;
  totalHours?: number;
  total_hours?: number;
  minStudents?: number;
  min_students?: number;
  maxStudents?: number;
  max_students?: number;
}

export type UpdateCourseSettingsDto = Partial<CreateCourseSettingsDto>;
