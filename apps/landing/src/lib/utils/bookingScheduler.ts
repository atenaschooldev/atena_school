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

export function calculateLessonDates(
  startDateStr: string, // "2026-07-23"
  timeParam: string,    // "16:00" OR "Martedì e Giovedì 16:00-17:15"
  category: string,     // "languages"
  standardSchedule: string, // "Martedì e Giovedì 16:00-17:15"
  durationStr: string = "1h"
): ScheduledLesson[] {
  const lessons: ScheduledLesson[] = [];
  const durationMinutes = parseDurationToMinutes(durationStr);
  
  // Parse startDate
  const baseDate = new Date(startDateStr);
  
  const isFixedSchedule = standardSchedule && 
    !standardSchedule.toLowerCase().includes("flessibile") &&
    !standardSchedule.toLowerCase().includes("concordare");

  if (!isFixedSchedule) {
    // Flexible lesson (Single private lesson or first of 10 package)
    // Parse timeParam like "16:00"
    const timeMatch = (timeParam || "").match(/^(\d{2}):(\d{2})$/);
    const startHour = timeMatch ? parseInt(timeMatch[1], 10) : 10;
    const startMin = timeMatch ? parseInt(timeMatch[2], 10) : 0;

    const startsAt = new Date(baseDate);
    startsAt.setUTCHours(12, 0, 0, 0); // Temporary middle of day to fetch offset safely
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

  // Fixed schedule languages course
  // 1. Determine active subscription end date (1 month from start date)
  const addMonths = (d: Date, m: number): Date => {
    const res = new Date(d);
    res.setMonth(res.getMonth() + m);
    return res;
  };
  const endDate = addMonths(baseDate, 1);

  // 2. Parse weekdays and time range from standardSchedule (e.g. "Martedì e Giovedì 16:00-17:15")
  const lowerSchedule = standardSchedule.toLowerCase();
  
  // Parse weekdays
  const targetDays: number[] = []; // 0 = Sunday, 1 = Monday, 2 = Tuesday, etc.
  if (lowerSchedule.includes("luned")) targetDays.push(1);
  if (lowerSchedule.includes("marted")) targetDays.push(2);
  if (lowerSchedule.includes("mercoled")) targetDays.push(3);
  if (lowerSchedule.includes("gioved")) targetDays.push(4);
  if (lowerSchedule.includes("venerd")) targetDays.push(5);
  if (lowerSchedule.includes("sabat")) targetDays.push(6);
  if (lowerSchedule.includes("domenic")) targetDays.push(0);

  if (targetDays.length === 0) {
    // Fallback: use the starting weekday
    targetDays.push(baseDate.getDay());
  }

  // Parse time range, e.g., "16:00-17:15"
  const timeRangeMatch = lowerSchedule.match(/(\d{2}):(\d{2})\s*-\s*(\d{2}):(\d{2})/);
  let startHour = 16, startMin = 0, endHour = 17, endMin = 15;
  if (timeRangeMatch) {
    startHour = parseInt(timeRangeMatch[1], 10);
    startMin = parseInt(timeRangeMatch[2], 10);
    endHour = parseInt(timeRangeMatch[3], 10);
    endMin = parseInt(timeRangeMatch[4], 10);
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

      const endsAt = new Date(current);
      endsAt.setUTCHours(endHour - offset, endMin, 0, 0);

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
