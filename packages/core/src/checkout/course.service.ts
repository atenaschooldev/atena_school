import type { SupabaseClient } from '@supabase/supabase-js';
import { CourseStatus, CourseScheduleType } from '@atena/api-types';
import { SupabaseCourseRow } from '../types';

export function extractCleanTime(timeStr?: string | null): string | null {
  if (!timeStr) return null;
  const match = timeStr.match(/(\d{1,2}:\d{2})/);
  return match ? match[1] : timeStr.trim();
}

export function computeEndTime(startTime?: string | null, durationMinutes: number = 60): string | null {
  if (!startTime) return null;
  const clean = extractCleanTime(startTime);
  if (!clean || !clean.includes(':')) return null;
  const [hStr, mStr] = clean.split(':');
  const h = parseInt(hStr, 10);
  const m = parseInt(mStr, 10);
  if (isNaN(h) || isNaN(m)) return null;
  const totalMin = h * 60 + m + durationMinutes;
  const endH = Math.floor(totalMin / 60) % 24;
  const endM = totalMin % 60;
  return `${endH.toString().padStart(2, '0')}:${endM.toString().padStart(2, '0')}`;
}

export function computeTotalLessonsCount(course: SupabaseCourseRow | null, calculatedLessonsCount: number): number | null {
  if (course?.total_lessons != null) return course.total_lessons;
  if (course?.total_hours != null) return null;
  if (course?.lessons_per_week != null && Number(course?.schedule_type) === CourseScheduleType.FLEXIBLE) {
    return course.lessons_per_week * 4;
  }
  return calculatedLessonsCount || 8;
}

export interface TeacherRow {
  teacher_id: string;
  full_name: string | null;
  photo_url: string | null;
}

export type CourseWithTeacher = SupabaseCourseRow & {
  teacher_name: string | null;
  teacher_photo_url: string | null;
};

export type GetItemResult =
  | { success: true; item: CourseWithTeacher; error?: never }
  | { success: false; error: string; item?: never };

export type GetPublicCoursesResult = {
  success: boolean;
  courses: CourseWithTeacher[];
};

function sanitizePublicCourse(
  c: SupabaseCourseRow,
  teacherName: string | null,
  teacherPhotoUrl: string | null,
): CourseWithTeacher {
  const {
    created_at,
    updated_at,
    teacher_id,
    ...rest
  } = c as any;

  return {
    ...rest,
    teacher_name: teacherName || null,
    teacher_photo_url: teacherPhotoUrl || null,
  };
}

export async function getPublicCourses(supabase: SupabaseClient): Promise<GetPublicCoursesResult> {
  let { data: coursesData, error } = await supabase
    .from('courses')
    .select('*')
    .eq('status', CourseStatus.ACTIVE)
    .order('name')
    .returns<SupabaseCourseRow[]>();

  if (error || !coursesData || coursesData.length === 0) {
    const { data: fallbackData } = await supabase
      .from('courses')
      .select('*')
      .neq('status', CourseStatus.ARCHIVED)
      .returns<SupabaseCourseRow[]>();
    coursesData = fallbackData || [];
  }


  const { data: teachersData } = await supabase
    .from('teachers')
    .select('teacher_id, full_name, photo_url')
    .returns<TeacherRow[]>();
  const teacherMap = new Map((teachersData || []).map((t) => [t.teacher_id, t]));

  const courses: CourseWithTeacher[] = (coursesData || []).map((c) => {
    const teacher = c.teacher_id ? teacherMap.get(c.teacher_id) : null;
    return sanitizePublicCourse(c, teacher?.full_name || null, teacher?.photo_url || null);
  });

  return { success: true, courses };
}

export async function getPublicCourseById(supabase: SupabaseClient, id: string): Promise<GetItemResult> {
  const isUuid = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i.test(id);

  let courseData: SupabaseCourseRow | null = null;
  if (isUuid) {
    const { data } = await supabase.from('courses').select('*').eq('id', id).maybeSingle<SupabaseCourseRow>();
    courseData = data;
  }
  if (!courseData) {
    const { data } = await supabase.from('courses').select('*').eq('slug', id).maybeSingle<SupabaseCourseRow>();
    courseData = data;
  }

  if (!courseData) {
    return { success: false, error: 'Item not found' };
  }

  let teacherName: string | null = null;
  let teacherPhotoUrl: string | null = null;
  if (courseData.teacher_id) {
    const { data: teacher } = await supabase
      .from('teachers')
      .select('full_name, photo_url')
      .eq('teacher_id', courseData.teacher_id)
      .maybeSingle<TeacherRow>();
    if (teacher) {
      teacherName = teacher.full_name;
      teacherPhotoUrl = teacher.photo_url;
    }
  }

  const course = sanitizePublicCourse(courseData, teacherName, teacherPhotoUrl);

  return { success: true, item: course };
}
