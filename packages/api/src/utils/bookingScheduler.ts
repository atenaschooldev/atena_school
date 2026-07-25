import { addDays } from "date-fns";

export interface ScheduledLesson {
  startsAt: string; // ISO string with timezone
  endsAt: string;   // ISO string with timezone
}

function getRomeOffsetHours(date: Date): number {
  const romeString = date.toLocaleString("en-US", { timeZone: "Europe/Rome" });
  const utcString = date.toLocaleString("en-US", { timeZone: "UTC" });
  
  const romeDate = new Date(romeString);
  const utcDate = new Date(utcString);
  
  return Math.round((romeDate.getTime() - utcDate.getTime()) / (1000 * 60 * 60));
}

function parseDurationToMinutes(durationStr: string): number {
  if (!durationStr) return 60;
  const lower = durationStr.toLowerCase();
  if (lower.includes("10h")) return 60;
  
  const matchOre = lower.match(/(\d+(?:\.\d+)?)\s*or/);
  if (matchOre) {
    return Math.round(parseFloat(matchOre[1]) * 60);
  }
  
  const matchMin = lower.match(/(\d+)\s*min/);
  if (matchMin) {
    return parseInt(matchMin[1], 10);
  }
  
  return 60;
}

export function formatCourseDurationText(
  lessonDurationMinutes?: number | null,
  totalHours?: number | null,
  totalLessons?: number | null
): string {
  if (totalHours && totalHours > 0) {
    return `${totalHours} ore totali`;
  }
  if (lessonDurationMinutes && totalLessons) {
    const hours = Math.round((lessonDurationMinutes * totalLessons) / 60);
    if (hours > 0) return `${hours} ore totali`;
  }
  if (totalLessons && totalLessons > 0) {
    return `${totalLessons} lezioni`;
  }
  return "Orario flessibile";
}

export function formatCourseScheduleText(
  scheduleDays?: number[] | null,
  startTime?: string | null,
  endTime?: string | null
): string {
  if (!scheduleDays || scheduleDays.length === 0 || !startTime) {
    return "Da concordare";
  }
  const dayNames: Record<number, string> = {
    1: "Lunedì",
    2: "Martedì",
    3: "Mercoledì",
    4: "Giovedì",
    5: "Venerdì",
    6: "Sabato",
    0: "Domenica",
  };
  const daysStr = scheduleDays.map((d) => dayNames[d] || "").filter(Boolean).join(" e ");
  const timeStr = endTime ? `${startTime}-${endTime}` : startTime;
  return `${daysStr} ${timeStr}`.trim();
}

export function getDynamicMaxLessons(
  titleOrName: string,
  startDateStr?: string | null,
  category?: string | null,
  lessonsPerWeek?: number | null
): number {
  const nameLower = (titleOrName || "").toLowerCase();
  
  if (nameLower.includes("dizione") || nameLower.includes("lettura espressiva")) {
    return 10;
  }
  
  if (lessonsPerWeek && lessonsPerWeek > 0) {
    return lessonsPerWeek * 4;
  }

  if (category === "individual" || nameLower.includes("individual")) {
    return 4;
  }

  if (!startDateStr) return 8;

  const baseDate = new Date(startDateStr);
  const startDay = baseDate.getDay();

  const addMonths = (d: Date, m: number): Date => {
    const res = new Date(d);
    res.setMonth(res.getMonth() + m);
    return res;
  };
  const endDate = addMonths(baseDate, 1);

  let targetDays = [2, 4];
  if (startDay === 1 || startDay === 3 || startDay === 5) {
    targetDays = [1, 3];
  } else if (startDay === 6 || startDay === 0) {
    targetDays = [2, 4];
  }

  let count = 0;
  let current = new Date(baseDate);
  let attempts = 0;
  while (current <= endDate && attempts < 60) {
    attempts++;
    if (targetDays.includes(current.getDay())) {
      count++;
    }
    current = addDays(current, 1);
  }

  return count > 0 ? count : 8;
}

export function calculateLessonDates(
  startDateStr: string,
  timeParam: string,
  category: string,
  scheduleDaysOrLegacySchedule?: number[] | string | null,
  durationStr: string | number = 60,
  startTimeParam?: string | null,
  endTimeParam?: string | null,
  scheduleType?: string | null
): ScheduledLesson[] {
  const lessons: ScheduledLesson[] = [];
  const durationMinutes = typeof durationStr === "number"
    ? durationStr
    : parseDurationToMinutes(durationStr);
  
  const baseDate = new Date(startDateStr);
  const isFlexible = scheduleType === "flexible" || !scheduleDaysOrLegacySchedule;

  if (isFlexible) {
    const timeMatch = (timeParam || "").match(/^(\d{2}):(\d{2})$/);
    const startHour = timeMatch ? parseInt(timeMatch[1], 10) : 10;
    const startMin = timeMatch ? parseInt(timeMatch[2], 10) : 0;

    const startsAt = new Date(baseDate);
    startsAt.setUTCHours(12, 0, 0, 0);
    const offset = getRomeOffsetHours(startsAt);

    startsAt.setUTCHours(startHour - offset, startMin, 0, 0);

    const endsAt = new Date(startsAt);
    endsAt.setMinutes(endsAt.getMinutes() + durationMinutes);

    lessons.push({
      startsAt: startsAt.toISOString(),
      endsAt: endsAt.toISOString(),
    });
    return lessons;
  }

  const addMonths = (d: Date, m: number): Date => {
    const res = new Date(d);
    res.setMonth(res.getMonth() + m);
    return res;
  };
  const endDate = addMonths(baseDate, 1);

  const targetDays: number[] = Array.isArray(scheduleDaysOrLegacySchedule)
    ? scheduleDaysOrLegacySchedule
    : [];

  if (targetDays.length === 0) {
    targetDays.push(baseDate.getDay());
  }

  let startHour = 16, startMin = 0;
  if (startTimeParam) {
    const sMatch = startTimeParam.match(/^(\d{2}):(\d{2})$/);
    if (sMatch) {
      startHour = parseInt(sMatch[1], 10);
      startMin = parseInt(sMatch[2], 10);
    }
  }

  let current = new Date(baseDate);

  let attempts = 0;
  while (current <= endDate && attempts < 60) {
    attempts++;
    const dayOfWeek = current.getDay();
    if (targetDays.includes(dayOfWeek)) {
      const startsAt = new Date(current);
      startsAt.setUTCHours(12, 0, 0, 0);
      const offset = getRomeOffsetHours(startsAt);

      startsAt.setUTCHours(startHour - offset, startMin, 0, 0);

      const endsAt = new Date(startsAt);
      if (endTimeParam) {
        const eMatch = endTimeParam.match(/^(\d{2}):(\d{2})$/);
        if (eMatch) {
          endsAt.setUTCHours(parseInt(eMatch[1], 10) - offset, parseInt(eMatch[2], 10), 0, 0);
        } else {
          endsAt.setMinutes(endsAt.getMinutes() + durationMinutes);
        }
      } else {
        endsAt.setMinutes(endsAt.getMinutes() + durationMinutes);
      }

      lessons.push({
        startsAt: startsAt.toISOString(),
        endsAt: endsAt.toISOString(),
      });
    }
    current = addDays(current, 1);
  }

  return lessons;
}
