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
  
  const isFixedSchedule = category === "languages" && 
    standardSchedule && 
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
  // 1. Determine number of lessons (C2 = 12, others = 8)
  const isC2 = standardSchedule.toUpperCase().includes("C2");
  const totalLessons = isC2 ? 12 : 8;

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
  while (lessons.length < totalLessons && attempts < 100) {
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
