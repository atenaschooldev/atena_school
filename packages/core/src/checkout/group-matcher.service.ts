import type { SupabaseClient } from '@supabase/supabase-js';
import {
  LessonStatus,
  LessonLocationType,
  CourseFormat,
  parseCourseFormat,
  GroupStatus,
  GroupMemberStatus,
} from '@atena/api-types';
import { formatCourseScheduleText } from '@atena/utils';
import type { SupabaseCourseRow } from '../types';

export interface GroupEnrollmentParams {
  supabase: SupabaseClient;
  course: SupabaseCourseRow | null;
  courseId: string | number;
  studentId: string;
  bookingId: string;
  startDateStr: string;
  timeStr: string;
  calculatedLessons: Array<{ startsAt: string; endsAt: string }>;
  explicitGroupId?: string | null;
}

export interface GroupEnrollmentResult {
  groupId: string | null;
  enrolledLessonsCount: number;
}

/**
 * Normalizes an ISO date/time string to minute-precision key (e.g. "2026-10-14T16:00")
 * to ensure robust deduplication across timezones and minor millisecond variations.
 */
function normalizeDateMinuteKey(isoString: string): string {
  try {
    const d = new Date(isoString);
    if (isNaN(d.getTime())) return isoString.slice(0, 16);
    return d.toISOString().slice(0, 16);
  } catch {
    return isoString.slice(0, 16);
  }
}

/**
 * Smart Group Matcher & Lesson Deduplicator
 * 
 * Ensures:
 * 1. Individual 1-on-1 courses keep personal lessons with student_id and booking_id.
 * 2. Group courses match/auto-create a Group, enroll student in group_members, and deduplicate lessons.
 * 3. Students registering on different dates keep their exact calculated date window without creating duplicate classroom lesson rows in DB.
 * 4. Attendance records are mapped for every student for each of their enrolled lesson dates.
 */
export async function findOrCreateGroupAndEnroll(params: GroupEnrollmentParams): Promise<GroupEnrollmentResult> {
  const {
    supabase,
    course,
    courseId,
    studentId,
    bookingId,
    startDateStr,
    timeStr,
    calculatedLessons,
    explicitGroupId,
  } = params;

  if (!calculatedLessons || calculatedLessons.length === 0) {
    return { groupId: null, enrolledLessonsCount: 0 };
  }

  const courseFormat = parseCourseFormat((course as any)?.course_format || (course as any)?.delivery_mode);
  const isIndividual = courseFormat === CourseFormat.INDIVIDUAL || Number((course as any)?.max_students) === 1;

  // ── 1. Individual 1-on-1 Courses ──────────────────────────────────────────
  if (isIndividual) {
    const teacherId = course?.teacher_id || null;
    const lessonRows = calculatedLessons.map((l) => ({
      booking_id: bookingId,
      course_id: courseId,
      student_id: studentId,
      teacher_id: teacherId,
      starts_at: l.startsAt,
      ends_at: l.endsAt,
      status: LessonStatus.SCHEDULED,
      location_type: courseFormat === CourseFormat.ONLINE ? LessonLocationType.ONLINE : LessonLocationType.IN_PERSON,
    }));

    try {
      await supabase.from('lessons').insert(lessonRows);
    } catch (err) {
      console.warn('Individual lessons insert error:', err);
    }

    return { groupId: null, enrolledLessonsCount: calculatedLessons.length };
  }

  // ── 2. Group Courses (Collettivo) ─────────────────────────────────────────
  let resolvedGroupId: string | null = explicitGroupId ? String(explicitGroupId) : null;
  const rawScheduleDays = course?.schedule_days || [];
  const scheduleDays = Array.isArray(rawScheduleDays) ? rawScheduleDays.map(Number).filter((d) => !isNaN(d)) : [];
  const cleanStartTime = course?.start_time || (timeStr ? (timeStr.match(/\d{1,2}:\d{2}/)?.[0] || '10:00') : '10:00');
  const cleanEndTime = course?.end_time || null;
  const maxStudents = Number((course as any)?.max_students) || 8;
  const courseTitle = (course as any)?.name || (course as any)?.title_it || 'Corso Atena';

  // Step 2A: Find existing group if not explicitly provided
  if (!resolvedGroupId) {
    try {
      const { data: openGroups } = await supabase
        .from('groups')
        .select('id, name, max_students, schedule_days, start_time, members:group_members(count)')
        .eq('course_id', courseId)
        .eq('status', GroupStatus.RECRUITING)
        .order('created_at', { ascending: true });

      if (openGroups && openGroups.length > 0) {
        for (const g of openGroups) {
          const membersCount = Array.isArray(g.members) ? (g.members[0] as any)?.count ?? g.members.length : 0;
          const groupMax = Number(g.max_students) || maxStudents;

          // Check capacity
          if (membersCount < groupMax) {
            // Check matching schedule days if both specify them
            const gDays = Array.isArray(g.schedule_days) ? g.schedule_days.map(Number) : [];
            const daysMatch = scheduleDays.length === 0 || gDays.length === 0 || scheduleDays.some((d) => gDays.includes(d));
            const timeMatch = !g.start_time || !cleanStartTime || g.start_time === cleanStartTime;

            if (daysMatch && timeMatch) {
              resolvedGroupId = String(g.id);
              break;
            }
          }
        }
      }
    } catch (lookupErr) {
      console.warn('Group lookup warning:', lookupErr);
    }
  }

  // Step 2B: If no group found, auto-create a new Cohort Group for this course
  if (!resolvedGroupId) {
    try {
      const scheduleLabel = formatCourseScheduleText(scheduleDays, cleanStartTime, cleanEndTime);
      const groupName = `${courseTitle} • ${scheduleLabel || cleanStartTime}`.trim();

      const { data: newGroup, error: groupErr } = await supabase
        .from('groups')
        .insert({
          name: groupName,
          course_id: courseId,
          teacher_id: course?.teacher_id || null,
          max_students: maxStudents,
          status: GroupStatus.RECRUITING,
          start_date: startDateStr,
          schedule_days: scheduleDays,
          start_time: cleanStartTime,
          end_time: cleanEndTime,
        })
        .select('id')
        .single();

      if (!groupErr && newGroup) {
        resolvedGroupId = String(newGroup.id);
      }
    } catch (createGroupErr) {
      console.warn('Auto group creation warning:', createGroupErr);
    }
  }

  // Step 2C: Enroll Student in group_members
  if (resolvedGroupId) {
    try {
      await supabase.from('group_members').upsert(
        {
          group_id: resolvedGroupId,
          student_id: studentId,
          booking_id: bookingId,
          status: GroupMemberStatus.ACTIVE,
        },
        { onConflict: 'group_id,student_id' }
      );
    } catch (enrollErr) {
      console.warn('Group member enrollment warning:', enrollErr);
    }

    // Step 2D: Deduplicated Lesson Generation for Group
    try {
      // Fetch all existing lessons for this group
      const { data: existingLessons } = await supabase
        .from('lessons')
        .select('id, starts_at')
        .eq('group_id', resolvedGroupId);

      const existingKeys = new Set((existingLessons || []).map((l: any) => normalizeDateMinuteKey(l.starts_at)));

      const lessonsToInsert = calculatedLessons
        .filter((l) => !existingKeys.has(normalizeDateMinuteKey(l.startsAt)))
        .map((l) => ({
          group_id: resolvedGroupId,
          course_id: courseId,
          teacher_id: course?.teacher_id || null,
          starts_at: l.startsAt,
          ends_at: l.endsAt,
          status: LessonStatus.SCHEDULED,
          location_type: courseFormat === CourseFormat.ONLINE ? LessonLocationType.ONLINE : LessonLocationType.IN_PERSON,
        }));

      if (lessonsToInsert.length > 0) {
        await supabase.from('lessons').insert(lessonsToInsert);
      }

      // Step 2E: Create attendance records for student for each of their enrolled dates
      const { data: allGroupLessons } = await supabase
        .from('lessons')
        .select('id, starts_at')
        .eq('group_id', resolvedGroupId);

      if (allGroupLessons && allGroupLessons.length > 0) {
        const studentLessonKeys = new Set(calculatedLessons.map((l) => normalizeDateMinuteKey(l.startsAt)));
        const matchingLessons = allGroupLessons.filter((l: any) => studentLessonKeys.has(normalizeDateMinuteKey(l.starts_at)));

        const attendanceRows = matchingLessons.map((l: any) => ({
          lesson_id: l.id,
          student_id: studentId,
          booking_id: bookingId,
          status: 1, // PENDING / SCHEDULED
        }));

        if (attendanceRows.length > 0) {
          await supabase.from('attendance_records').upsert(attendanceRows, {
            onConflict: 'lesson_id,student_id',
          });
        }
      }
    } catch (lessonsErr) {
      console.warn('Group lessons deduplication warning:', lessonsErr);
    }

    // Step 2F: Update booking with resolved group_id
    try {
      await supabase.from('bookings').update({ group_id: resolvedGroupId }).eq('id', bookingId);
    } catch (bookingUpdateErr) {
      console.warn('Booking group_id update warning:', bookingUpdateErr);
    }
  }

  return {
    groupId: resolvedGroupId,
    enrolledLessonsCount: calculatedLessons.length,
  };
}
