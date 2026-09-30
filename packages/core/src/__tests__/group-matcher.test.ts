import { describe, it, expect, vi } from "vitest";
import { findOrCreateGroupAndEnroll } from "../checkout/group-matcher.service";
import { calculateLessonDates } from "@atena/utils";
import { CourseCategory, CourseFormat, CourseScheduleType } from "@atena/api-types";

describe("Smart Group Matcher & Lesson Deduplication Unit Tests", () => {
  it("creates a group and generates lessons for the first student, then deduplicates overlapping lessons for the second student", async () => {
    // Mock in-memory DB tables
    const groupsTable: any[] = [];
    const groupMembersTable: any[] = [];
    const lessonsTable: any[] = [];
    const attendanceTable: any[] = [];
    const bookingsTable: any[] = [{ id: "booking-1" }, { id: "booking-2" }];

    // Mock Supabase Client
    const mockSupabase: any = {
      from: (table: string) => {
        return {
          select: (fields?: string) => ({
            eq: (col: string, val: any) => ({
              eq: (col2: string, val2: any) => ({
                order: () => Promise.resolve({
                  data: groupsTable.filter(g => g.course_id === val && g.status === val2).map(g => ({
                    ...g,
                    members: [{ count: groupMembersTable.filter(m => m.group_id === g.id).length }]
                  }))
                }),
                maybeSingle: () => Promise.resolve({
                  data: groupsTable.find(g => g.course_id === val && g.status === val2) || null
                }),
              }),
              order: () => Promise.resolve({
                data: groupsTable.filter(g => g.course_id === val).map(g => ({
                  ...g,
                  members: [{ count: groupMembersTable.filter(m => m.group_id === g.id).length }]
                }))
              }),
              maybeSingle: () => Promise.resolve({
                data: groupsTable.find(g => String(g.id) === String(val)) || null
              }),
            }),
            eq_direct: (col: string, val: any) => {
              if (table === "lessons") {
                return Promise.resolve({ data: lessonsTable.filter(l => String(l.group_id) === String(val)) });
              }
              return Promise.resolve({ data: [] });
            }
          }),
          insert: (rows: any | any[]) => {
            const rowArr = Array.isArray(rows) ? rows : [rows];
            if (table === "groups") {
              const newG = { id: String(groupsTable.length + 1), ...rowArr[0] };
              groupsTable.push(newG);
              return {
                select: () => ({
                  single: () => Promise.resolve({ data: newG, error: null })
                })
              };
            }
            if (table === "lessons") {
              rowArr.forEach(r => {
                lessonsTable.push({ id: String(lessonsTable.length + 1), ...r });
              });
              return Promise.resolve({ data: rowArr, error: null });
            }
            return Promise.resolve({ data: rowArr, error: null });
          },
          upsert: (rows: any | any[]) => {
            const rowArr = Array.isArray(rows) ? rows : [rows];
            if (table === "group_members") {
              rowArr.forEach(r => {
                const existingIdx = groupMembersTable.findIndex(m => m.group_id === r.group_id && m.student_id === r.student_id);
                if (existingIdx >= 0) groupMembersTable[existingIdx] = { ...groupMembersTable[existingIdx], ...r };
                else groupMembersTable.push({ id: String(groupMembersTable.length + 1), ...r });
              });
            }
            if (table === "attendance_records") {
              rowArr.forEach(r => {
                const existingIdx = attendanceTable.findIndex(a => a.lesson_id === r.lesson_id && a.student_id === r.student_id);
                if (existingIdx >= 0) attendanceTable[existingIdx] = { ...attendanceTable[existingIdx], ...r };
                else attendanceTable.push({ id: String(attendanceTable.length + 1), ...r });
              });
            }
            return Promise.resolve({ data: rowArr, error: null });
          },
          update: (data: any) => ({
            eq: (col: string, val: any) => {
              if (table === "bookings") {
                const b = bookingsTable.find(item => item.id === val);
                if (b) Object.assign(b, data);
              }
              return Promise.resolve({ data: null, error: null });
            }
          })
        };
      }
    };

    // Override eq for lessons query in helper
    const originalFrom = mockSupabase.from;
    mockSupabase.from = (tableName: string) => {
      const base = originalFrom(tableName);
      if (tableName === "lessons") {
        return {
          ...base,
          select: () => ({
            eq: (_col: string, val: any) => Promise.resolve({
              data: lessonsTable.filter(l => String(l.group_id) === String(val))
            })
          })
        };
      }
      return base;
    };

    const course = {
      id: "course-inglese-a1",
      name: "Inglese A1 Base",
      category: CourseCategory.ADULTS,
      price: 120,
      schedule_days: [1, 3], // Monday (1) & Wednesday (3)
      start_time: "18:00",
      end_time: "19:30",
      max_students: 8,
      lesson_duration_minutes: 90,
      schedule_type: CourseScheduleType.FIXED,
    };

    // ------------------------------------------------------------------------
    // Student 1: Registers with start date 2026-10-05 (Monday) -> 9 lessons
    // ------------------------------------------------------------------------
    const student1Lessons = calculateLessonDates(
      "2026-10-05",
      "18:00",
      course.category,
      course.schedule_days,
      course.lesson_duration_minutes,
      course.start_time,
      course.end_time,
      course.schedule_type
    );

    const res1 = await findOrCreateGroupAndEnroll({
      supabase: mockSupabase,
      course: course as any,
      courseId: course.id,
      studentId: "student-uuid-1",
      bookingId: "booking-1",
      startDateStr: "2026-10-05",
      timeStr: "18:00-19:30",
      calculatedLessons: student1Lessons,
    });

    expect(res1.groupId).toBe("1");
    expect(groupsTable.length).toBe(1);
    expect(groupsTable[0].name).toContain("Inglese A1 Base");
    expect(groupMembersTable.length).toBe(1);
    expect(groupMembersTable[0].student_id).toBe("student-uuid-1");
    expect(lessonsTable.length).toBe(student1Lessons.length); // 9 lessons generated for group

    // ------------------------------------------------------------------------
    // Student 2: Registers 1 week later with start date 2026-10-12 (Monday)
    // ------------------------------------------------------------------------
    const student2Lessons = calculateLessonDates(
      "2026-10-12",
      "18:00",
      course.category,
      course.schedule_days,
      course.lesson_duration_minutes,
      course.start_time,
      course.end_time,
      course.schedule_type
    );

    const initialLessonCount = lessonsTable.length;

    const res2 = await findOrCreateGroupAndEnroll({
      supabase: mockSupabase,
      course: course as any,
      courseId: course.id,
      studentId: "student-uuid-2",
      bookingId: "booking-2",
      startDateStr: "2026-10-12",
      timeStr: "18:00-19:30",
      calculatedLessons: student2Lessons,
    });

    expect(res2.groupId).toBe("1"); // Matched to SAME existing group
    expect(groupsTable.length).toBe(1); // No redundant group created
    expect(groupMembersTable.length).toBe(2); // Both students in group

    // Overlapping lessons were deduplicated:
    // Only future dates not in student 1's window were added, existing shared dates were not duplicated!
    const nonOverlappingCount = student2Lessons.filter(l2 => !student1Lessons.some(l1 => l1.startsAt.slice(0, 16) === l2.startsAt.slice(0, 16))).length;
    expect(lessonsTable.length).toBe(initialLessonCount + nonOverlappingCount);
  });
});
