import { CourseStatus, CourseScheduleType } from '@atena/api-types';
import { getSupabaseAdmin } from '../supabase-admin';
import { SupabaseCourseRow } from './types';

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
  if (course?.lessons_per_week != null && (Number(course?.schedule_type) === CourseScheduleType.FLEXIBLE || course?.schedule_type === 'flexible')) {
    return course.lessons_per_week * 4;
  }
  return calculatedLessonsCount || 8;
}

export async function getPublicCourses() {
  const supabase = getSupabaseAdmin();
  let { data: coursesData, error } = await supabase
    .from('courses')
    .select('*')
    .eq('status', CourseStatus.ACTIVE)
    .order('name');

  if (error || !coursesData) {
    const { data: fallbackData } = await supabase.from('courses').select('*');
    coursesData = fallbackData || [];
  }

  const { data: teachersData } = await supabase.from('teachers').select('teacher_id, full_name, photo_url');
  const teacherMap = new Map((teachersData || []).map((t: any) => [t.teacher_id, t]));

  const courses = (coursesData || []).map((c: any) => {
    const teacher = c.teacher_id ? teacherMap.get(c.teacher_id) : null;
    return {
      ...c,
      teacher_name: teacher?.full_name || null,
      teacher_photo_url: teacher?.photo_url || null,
    };
  });

  return { success: true, courses };
}

export async function getItem(id: string) {
  const supabase = getSupabaseAdmin();
  const isUuid = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i.test(id);

  let courseData: any = null;
  if (isUuid) {
    const { data } = await supabase.from('courses').select('*').eq('id', id).maybeSingle();
    courseData = data;
  }
  if (!courseData) {
    const { data } = await supabase.from('courses').select('*').eq('slug', id).maybeSingle();
    courseData = data;
  }

  if (!courseData) {
    return { success: false, error: 'Item not found' };
  }

  let teacherName = null;
  let teacherPhotoUrl = null;
  if (courseData.teacher_id) {
    const { data: teacher } = await supabase
      .from('teachers')
      .select('full_name, photo_url')
      .eq('teacher_id', courseData.teacher_id)
      .maybeSingle();
    if (teacher) {
      teacherName = teacher.full_name;
      teacherPhotoUrl = teacher.photo_url;
    }
  }

  const course = {
    ...courseData,
    teacher_name: teacherName,
    teacher_photo_url: teacherPhotoUrl,
  };

  return { success: true, item: course, course };
}
