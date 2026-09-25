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
    settings,
    ...rest
  } = c as any;

  const st = settings || c.settings;
  const deliveryMode = Number(st?.delivery_mode ?? st?.deliveryMode ?? 1);

  return {
    ...rest,
    schedule_days: st?.schedule_days ?? st?.scheduleDays ?? [],
    start_time: st?.start_time ?? st?.startTime ?? null,
    end_time: st?.end_time ?? st?.endTime ?? null,
    lesson_duration_minutes: st?.lesson_duration_minutes ?? st?.lessonDurationMinutes ?? null,
    lessons_per_week: st?.lessons_per_week ?? st?.lessonsPerWeek ?? null,
    total_lessons: st?.total_lessons ?? st?.totalLessons ?? null,
    total_hours: st?.total_hours != null ? Number(st.total_hours) : (st?.totalHours != null ? Number(st.totalHours) : null),
    schedule_type: deliveryMode === 2 ? CourseScheduleType.FLEXIBLE : CourseScheduleType.FIXED,
    course_format: deliveryMode === 4 ? 4 : (deliveryMode === 2 ? 2 : 1),
    delivery_mode: deliveryMode,
    settings: st || null,
    teacher_name: teacherName || null,
    teacher_photo_url: teacherPhotoUrl || null,
  };
}

export async function getPublicCourses(supabase: SupabaseClient): Promise<GetPublicCoursesResult> {
  let { data: coursesData, error } = await supabase
    .from('courses')
    .select('*, settings:course_settings(*)')
    .eq('status', CourseStatus.ACTIVE)
    .order('name')
    .returns<SupabaseCourseRow[]>();

  if (error || !coursesData || coursesData.length === 0) {
    const { data: fallbackData } = await supabase
      .from('courses')
      .select('*, settings:course_settings(*)')
      .neq('status', CourseStatus.ARCHIVED)
      .returns<SupabaseCourseRow[]>();
    coursesData = fallbackData || [];
  }

  const { data: teachersData } = await supabase
    .from('teachers')
    .select('teacher_id, full_name, photo_url')
    .returns<TeacherRow[]>();
  const teacherMap = new Map((teachersData || []).map((t) => [t.teacher_id, t]));

  // Also load primary course_teachers if any courses don't have teacher_id directly
  const coursesWithoutTeacher = (coursesData || []).filter(c => !c.teacher_id).map(c => c.id);
  const courseTeacherMap = new Map<string, TeacherRow>();
  if (coursesWithoutTeacher.length > 0) {
    try {
      const { data: ctRows } = await supabase
        .from('course_teachers')
        .select('course_id, teacher_id, is_primary, role, teachers(teacher_id, full_name, photo_url)')
        .in('course_id', coursesWithoutTeacher)
        .order('is_primary', { ascending: false });
      if (ctRows) {
        for (const ct of ctRows as any[]) {
          if (!courseTeacherMap.has(ct.course_id) && ct.teachers) {
            courseTeacherMap.set(ct.course_id, ct.teachers);
          }
        }
      }
    } catch {}
  }

  const courses: CourseWithTeacher[] = (coursesData || []).map((c) => {
    const teacher = c.teacher_id ? teacherMap.get(c.teacher_id) : courseTeacherMap.get(c.id);
    return sanitizePublicCourse(c, teacher?.full_name || null, teacher?.photo_url || null);
  });

  return { success: true, courses };
}

export async function getPublicCourseById(supabase: SupabaseClient, id: string): Promise<GetItemResult> {
  const isNumericOrUuid = /^\d+$/.test(id) || /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i.test(id);

  let courseData: SupabaseCourseRow | null = null;
  if (isNumericOrUuid) {
    const { data } = await supabase.from('courses').select('*, settings:course_settings(*)').eq('id', id).maybeSingle<SupabaseCourseRow>();
    courseData = data;
  }
  if (!courseData) {
    const { data } = await supabase.from('courses').select('*, settings:course_settings(*)').eq('slug', id).maybeSingle<SupabaseCourseRow>();
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
      .eq('id', courseData.teacher_id)
      .maybeSingle<TeacherRow>();
    if (teacher) {
      teacherName = teacher.full_name;
      teacherPhotoUrl = teacher.photo_url;
    }
  }

  if (!teacherName) {
    try {
      const { data: ctData } = await supabase
        .from('course_teachers')
        .select('role, is_primary, teachers(full_name, photo_url)')
        .eq('course_id', courseData.id)
        .order('is_primary', { ascending: false })
        .limit(1)
        .maybeSingle<any>();
      if (ctData?.teachers) {
        teacherName = ctData.teachers.full_name;
        teacherPhotoUrl = ctData.teachers.photo_url;
      }
    } catch {}
  }

  const course = sanitizePublicCourse(courseData, teacherName, teacherPhotoUrl);

  return { success: true, item: course };
}
