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
  if (totalLessons) {
    return `${totalLessons} ${totalLessons === 1 ? "lezione" : "lezioni"}`;
  }
  if (totalHours) {
    return `${totalHours} ore`;
  }
  if (lessonDurationMinutes) {
    if (lessonDurationMinutes >= 60) {
      const hours = Math.floor(lessonDurationMinutes / 60);
      const mins = lessonDurationMinutes % 60;
      if (mins > 0) {
        return `${hours}h e ${mins} min`;
      }
      return `${hours} ${hours === 1 ? "ora" : "ore"}`;
    }
    return `${lessonDurationMinutes} minuti`;
  }
  return "60 minuti";
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

export function calculateLessonDates(
  startDateStr: string, // "2026-07-23"
  timeParam: string,    // "16:00" OR "16:00-17:15"
  category: string,     // "languages"
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

  // Generate lessons
  let current = new Date(baseDate);

  // Safeguard loop limit
  let attempts = 0;
  while (current <= endDate && attempts < 60) {
    attempts++;
    const dayOfWeek = current.getDay();
    if (targetDays.includes(dayOfWeek)) {
      const startsAt = new Date(current);
      startsAt.setUTCHours(12, 0, 0, 0); // Safety check for DST shifts
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
    // Go to next day
    current = addDays(current, 1);
  }

  return lessons;
}

export function getDynamicMaxLessons(
  courseName: string, 
  startDateStr: string, 
  category: string = "languages", 
  lessonsPerWeek?: number | null
): number {
  const lowerName = courseName.toLowerCase();
  if (lowerName.includes("10 lezioni")) return 10;
  if (lowerName.includes("singole")) return 1;
  
  const baseDate = new Date(startDateStr);
  const addMonths = (d: Date, m: number): Date => {
    const res = new Date(d);
    res.setMonth(res.getMonth() + m);
    return res;
  };
  const endDate = addMonths(baseDate, 1);

  // If lessonsPerWeek is specified in DB, use it to count weekdays dynamically
  if (typeof lessonsPerWeek === "number" && lessonsPerWeek > 0) {
    let targetDays: number[] = [];
    if (lessonsPerWeek === 1) {
      targetDays = [1]; // Mon
    } else if (lessonsPerWeek === 2) {
      targetDays = [1, 3]; // Mon, Wed
    } else if (lessonsPerWeek === 3) {
      targetDays = [1, 3, 5]; // Mon, Wed, Fri
    } else if (lessonsPerWeek === 4) {
      targetDays = [1, 2, 3, 4]; // Mon, Tue, Wed, Thu
    } else if (lessonsPerWeek >= 5) {
      targetDays = [1, 2, 3, 4, 5]; // Weekdays
    }

    let current = new Date(baseDate);
    let count = 0;
    let attempts = 0;
    while (current <= endDate && attempts < 60) {
      attempts++;
      const day = current.getDay();
      if (targetDays.includes(day)) {
        count++;
      }
      current = addDays(current, 1);
    }
    return count || (lessonsPerWeek * 4);
  }

  // Fallbacks if lessonsPerWeek is null
  if (lowerName.includes("c2")) {
    // 3 lessons a week virtual schedule (Mon, Wed, Fri)
    let current = new Date(baseDate);
    let count = 0;
    let attempts = 0;
    while (current <= endDate && attempts < 60) {
      attempts++;
      const day = current.getDay();
      if (day === 1 || day === 3 || day === 5) {
        count++;
      }
      current = addDays(current, 1);
    }
    return count || 12;
  }

  if (lowerName.includes("c1")) {
    // 2 lessons a week virtual schedule (Mon, Wed)
    let current = new Date(baseDate);
    let count = 0;
    let attempts = 0;
    while (current <= endDate && attempts < 60) {
      attempts++;
      const day = current.getDay();
      if (day === 1 || day === 3) {
        count++;
      }
      current = addDays(current, 1);
    }
    return count || 8;
  }

  if (category === "academic" || category === "certipass") {
    return 1;
  }

  return 8;
}
