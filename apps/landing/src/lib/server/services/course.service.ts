import { getSupabaseAdmin } from '../supabase-admin';
import {
  getPublicCourses as getPublicCoursesCore,
  getPublicCourseById as getPublicCourseByIdCore,
  extractCleanTime as extractCleanTimeCore,
  computeEndTime as computeEndTimeCore,
  computeTotalLessonsCount as computeTotalLessonsCountCore,
  CourseWithTeacher as CourseWithTeacherCore,
  GetItemResult as GetItemResultCore,
  GetPublicCoursesResult as GetPublicCoursesResultCore,
} from '@atena/core';

export const extractCleanTime = extractCleanTimeCore;
export const computeEndTime = computeEndTimeCore;
export const computeTotalLessonsCount = computeTotalLessonsCountCore;
export type CourseWithTeacher = CourseWithTeacherCore;
export type GetItemResult = GetItemResultCore;
export type GetPublicCoursesResult = GetPublicCoursesResultCore;

export async function getPublicCourses(): Promise<GetPublicCoursesResult> {
  const supabase = getSupabaseAdmin();
  return getPublicCoursesCore(supabase);
}

export async function getItem(id: string): Promise<GetItemResult> {
  const supabase = getSupabaseAdmin();
  return getPublicCourseByIdCore(supabase, id);
}
