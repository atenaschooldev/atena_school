import { format, parseISO, isFuture } from "date-fns";
import { it } from "date-fns/locale";

/**
 * Annual registration fee in EUR
 */
export const ANNUAL_REGISTRATION_FEE_EUR = 30;

/**
 * Format currency amount to EUR (e.g. €152.00)
 */
export function formatCurrency(amount: number | string): string {
  const num = typeof amount === "string" ? parseFloat(amount) : amount;
  if (isNaN(num)) return "€0.00";
  return new Intl.NumberFormat("it-IT", {
    style: "currency",
    currency: "EUR",
    minimumFractionDigits: 2,
  }).format(num);
}

/**
 * Format ISO date string into readable Italian date (e.g. 29 luglio 2026)
 */
export function formatDateItalian(dateString?: string): string {
  if (!dateString) return "";
  try {
    const dateObj = dateString.includes("T") ? parseISO(dateString) : new Date(dateString);
    if (isNaN(dateObj.getTime())) return dateString;
    return format(dateObj, "d MMMM yyyy", { locale: it });
  } catch {
    return dateString;
  }
}

/**
 * Safely parse date and check if it is in the future
 */
export function isFutureDate(dateString?: string): boolean {
  if (!dateString) return false;
  try {
    const d = dateString.includes("T") ? parseISO(dateString) : new Date(dateString);
    if (isNaN(d.getTime())) return false;
    const now = new Date();
    now.setHours(0, 0, 0, 0);
    return d.getTime() >= now.getTime();
  } catch {
    return false;
  }
}

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

  if (startDay === 1 || startDay === 3) {
    return 9;
  }
  if (startDay === 2 || startDay === 4) {
    return 10;
  }

  return 8;
}

export function calculateLessonDates(
  startDateStr: string,
  timeStr: string,
  courseType?: string,
  dbScheduleDays?: number[] | null,
  dbDurationMinutes?: number | null,
  dbStartTime?: string | null,
  dbEndTime?: string | null,
  dbScheduleType?: string | null,
  customMaxLessons?: number | null
): ScheduledLesson[] {
  if (!startDateStr) return [];

  const baseDate = new Date(startDateStr);
  if (isNaN(baseDate.getTime())) return [];

  let startTime = dbStartTime || "10:00";
  let durationMinutes = dbDurationMinutes || 60;

  if (!dbStartTime) {
    const timeMatch = timeStr.match(/(\d{1,2}:\d{2})\s*-\s*(\d{1,2}:\d{2})/);
    if (timeMatch) {
      startTime = timeMatch[1];
      const startMin = parseInt(timeMatch[1].split(":")[0]) * 60 + parseInt(timeMatch[1].split(":")[1]);
      const endMin = parseInt(timeMatch[2].split(":")[0]) * 60 + parseInt(timeMatch[2].split(":")[1]);
      durationMinutes = endMin - startMin > 0 ? endMin - startMin : 60;
    } else {
      const singleTimeMatch = timeStr.match(/(\d{1,2}:\d{2})/);
      if (singleTimeMatch) {
        startTime = singleTimeMatch[1];
      }
    }
  }

  const [startHour, startMin] = startTime.split(":").map((n) => parseInt(n, 10));

  let targetDays: number[] = [];
  if (dbScheduleDays && dbScheduleDays.length > 0) {
    targetDays = dbScheduleDays;
  } else {
    const timeLower = timeStr.toLowerCase();
    if (timeLower.includes("lunedì") || timeLower.includes("lunedi")) targetDays.push(1);
    if (timeLower.includes("martedì") || timeLower.includes("martedi")) targetDays.push(2);
    if (timeLower.includes("mercoledì") || timeLower.includes("mercoledi")) targetDays.push(3);
    if (timeLower.includes("giovedì") || timeLower.includes("giovedi")) targetDays.push(4);
    if (timeLower.includes("venerdì") || timeLower.includes("venerdi")) targetDays.push(5);
    if (timeLower.includes("sabato")) targetDays.push(6);
    if (timeLower.includes("domenica")) targetDays.push(0);

    if (targetDays.length === 0) {
      targetDays = [baseDate.getDay()];
    }
  }

  let totalLessonsNeeded = customMaxLessons || getDynamicMaxLessons("General Course", startDateStr, courseType, targetDays.length);

  const lessons: ScheduledLesson[] = [];
  let currDate = new Date(baseDate);
  let attempts = 0;

  while (lessons.length < totalLessonsNeeded && attempts < 90) {
    attempts++;
    const dayOfWeek = currDate.getDay();

    if (targetDays.includes(dayOfWeek)) {
      const year = currDate.getFullYear();
      const month = currDate.getMonth();
      const day = currDate.getDate();

      const candidateLocalStart = new Date(year, month, day, startHour, startMin, 0);
      const romeOffsetHours = getRomeOffsetHours(candidateLocalStart);

      const utcTimeMs = Date.UTC(year, month, day, startHour - romeOffsetHours, startMin, 0);
      const startIso = new Date(utcTimeMs).toISOString();
      const endIso = new Date(utcTimeMs + durationMinutes * 60 * 1000).toISOString();

      lessons.push({
        startsAt: startIso,
        endsAt: endIso,
      });
    }

    currDate = addDays(currDate, 1);
  }

  return lessons;
}
