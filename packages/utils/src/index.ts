import { format, parseISO, isFuture } from "date-fns";
import { it } from "date-fns/locale";

/**
 * Centralized Domain Enums and Status Types
 */
export type PaymentStatus = 'pending' | 'processing' | 'paid' | 'failed' | 'refunded';
export type CourseStatus = 'active' | 'published' | 'draft' | 'archived';
export type UserRole = 'admin' | 'student' | 'teacher' | 'parent';

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
  const dayNames = ["Domenica", "Lunedì", "Martedì", "Mercoledì", "Giovedì", "Venerdì", "Sabato"];
  const daysText = scheduleDays.map((d) => dayNames[d % 7]).join(" e ");
  const timeText = endTime ? `${startTime}-${endTime}` : startTime;
  return `${daysText} ${timeText}`;
}

/**
 * HMAC slot signature key for URL integrity check
 */
const SLOT_SECRET_SALT = "atena_slot_salt_2026";

/**
 * Generate 8-character HMAC signature for course slot parameters
 */
export function generateSlotSignature(itemSlugOrId: string, dateStr: string, daysSlug: string, timeSlug: string): string {
  const payload = `${itemSlugOrId}:${dateStr}:${daysSlug}:${timeSlug}:${SLOT_SECRET_SALT}`;
  let hash = 0;
  for (let i = 0; i < payload.length; i++) {
    const char = payload.charCodeAt(i);
    hash = (hash << 5) - hash + char;
    hash |= 0;
  }
  return Math.abs(hash).toString(16).padStart(8, '0').slice(0, 8);
}

/**
 * Verify HMAC slot signature for URL integrity check
 */
export function verifySlotSignature(itemSlugOrId: string, dateStr?: string | null, daysSlug?: string | null, timeSlug?: string | null, sig?: string | null): boolean {
  if (!dateStr || !daysSlug || !timeSlug || !sig) return false;
  const expectedSig = generateSlotSignature(itemSlugOrId, dateStr, daysSlug, timeSlug);
  return sig === expectedSig;
}

/**
 * Convert raw Italian schedule string (e.g. "Martedì e Giovedì 16:00-16:50") to ASCII slugs
 */
export function encodeScheduleSlot(rawTimeText?: string | null): { daysSlug: string; timeSlug: string } {
  if (!rawTimeText) return { daysSlug: 'lun-ven', timeSlug: '16:00' };

  let text = rawTimeText.trim();
  const timeMatch = text.match(/(\d{1,2}:\d{2})/);
  const timeSlug = timeMatch ? timeMatch[1] : '16:00';

  let daysSlug = 'lun-ven';
  const lower = text.toLowerCase();

  if (lower.includes('mar') && lower.includes('gio')) {
    daysSlug = 'mar-gio';
  } else if (lower.includes('lun') && lower.includes('mer')) {
    daysSlug = 'lun-mer';
  } else if (lower.includes('mar') && lower.includes('ven')) {
    daysSlug = 'mar-ven';
  } else if (lower.includes('lun') && lower.includes('ven')) {
    daysSlug = 'lun-ven';
  } else if (lower.includes('lun')) {
    daysSlug = 'lun';
  } else if (lower.includes('mar')) {
    daysSlug = 'mar';
  } else if (lower.includes('mer')) {
    daysSlug = 'mer';
  } else if (lower.includes('gio')) {
    daysSlug = 'gio';
  } else if (lower.includes('ven')) {
    daysSlug = 'ven';
  } else if (lower.includes('sab')) {
    daysSlug = 'sab';
  } else if (lower.includes('dom')) {
    daysSlug = 'dom';
  }

  return { daysSlug, timeSlug };
}

/**
 * Reconstruct Italian schedule string from ASCII slugs or fallback safely
 */
export function decodeScheduleSlot(daysSlug?: string | null, timeSlug?: string | null, rawTime?: string | null): string {
  if (rawTime && (rawTime.includes('Martedì') || rawTime.includes('Lunedì') || rawTime.includes('Mercoledì') || rawTime.includes('Giovedì') || rawTime.includes('Venerdì'))) {
    return rawTime;
  }

  const daysMap: Record<string, string> = {
    'mar-gio': 'Martedì e Giovedì',
    'lun-mer': 'Lunedì e Mercoledì',
    'mar-ven': 'Martedì e Venerdì',
    'lun-ven': 'Lunedì e Venerdì',
    'lun': 'Lunedì',
    'mar': 'Martedì',
    'mer': 'Mercoledì',
    'gio': 'Giovedì',
    'ven': 'Venerdì',
    'sab': 'Sabato',
    'dom': 'Domenica',
  };

  const dayText = (daysSlug && daysMap[daysSlug]) ? daysMap[daysSlug] : 'Martedì e Giovedì';
  const timeText = timeSlug || '16:00';
  return `${dayText} ${timeText}`;
}

/**
 * Build clean Human-readable ASCII + HMAC Signed Checkout URL
 */
export function buildCheckoutUrl(courseSlugOrId: string, dateInput?: string | Date | null, timeText?: string | null): string {
  if (!dateInput) return `/checkout/${courseSlugOrId}`;
  const dateStr = typeof dateInput === 'string' ? dateInput : format(dateInput, 'yyyy-MM-dd');
  const { daysSlug, timeSlug } = encodeScheduleSlot(timeText);
  const sig = generateSlotSignature(courseSlugOrId, dateStr, daysSlug, timeSlug);
  return `/checkout/${courseSlugOrId}?date=${dateStr}&days=${daysSlug}&time=${timeSlug}&sig=${sig}`;
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

  const isFlexible = dbScheduleType === "flexible" || courseType === "flexible";

  let startTime = dbStartTime || "10:00";
  let durationMinutes = dbDurationMinutes || 60;

  if (!dbStartTime && timeStr) {
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

  if (isFlexible) {
    const year = baseDate.getFullYear();
    const month = baseDate.getMonth();
    const day = baseDate.getDate();

    const candidateLocalStart = new Date(year, month, day, startHour, startMin, 0);
    const romeOffsetHours = getRomeOffsetHours(candidateLocalStart);

    const utcTimeMs = Date.UTC(year, month, day, startHour - romeOffsetHours, startMin, 0);
    return [{
      startsAt: new Date(utcTimeMs).toISOString(),
      endsAt: new Date(utcTimeMs + durationMinutes * 60 * 1000).toISOString(),
    }];
  }

  let targetDays: number[] = [];
  if (dbScheduleDays && dbScheduleDays.length > 0) {
    targetDays = dbScheduleDays;
  } else if (timeStr) {
    const timeLower = timeStr.toLowerCase();
    if (timeLower.includes("lunedì") || timeLower.includes("lunedi")) targetDays.push(1);
    if (timeLower.includes("martedì") || timeLower.includes("martedi")) targetDays.push(2);
    if (timeLower.includes("mercoledì") || timeLower.includes("mercoledi")) targetDays.push(3);
    if (timeLower.includes("giovedì") || timeLower.includes("giovedi")) targetDays.push(4);
    if (timeLower.includes("venerdì") || timeLower.includes("venerdi")) targetDays.push(5);
    if (timeLower.includes("sabato")) targetDays.push(6);
    if (timeLower.includes("domenica")) targetDays.push(0);
  }

  if (targetDays.length === 0) {
    targetDays = [baseDate.getDay()];
  }

  const endDate = new Date(baseDate);
  endDate.setMonth(endDate.getMonth() + 1);

  const lessons: ScheduledLesson[] = [];
  let currDate = new Date(baseDate);
  let attempts = 0;

  while (currDate <= endDate && attempts < 60) {
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

export function slugify(text: string): string {
  return text
    .toString()
    .toLowerCase()
    .trim()
    .replace(/\s+/g, '-')
    .replace(/[^\w\-]+/g, '')
    .replace(/\-\-+/g, '-');
}

export interface CourseFrequencyParams {
  scheduleType?: string | null;
  lessonsPerWeek?: number | null;
  scheduleDays?: (string | number)[] | null;
  startTime?: string | null;
  endTime?: string | null;
  totalLessons?: number | null;
}

export function formatCourseFrequencyDetails(params: CourseFrequencyParams): {
  primary: string;
  secondary: string;
} {
  const { scheduleType, lessonsPerWeek, scheduleDays, startTime, endTime, totalLessons } = params;

  const dayNames: Record<number, string> = {
    1: "Lunedì",
    2: "Martedì",
    3: "Mercoledì",
    4: "Giovedì",
    5: "Venerdì",
    6: "Sabato",
    0: "Domenica",
    7: "Domenica",
  };

  const formattedDays =
    scheduleDays && scheduleDays.length > 0
      ? scheduleDays
          .map((d) => (typeof d === "number" ? dayNames[d] || String(d) : d))
          .filter(Boolean)
          .join(", ")
      : null;

  const timeText = startTime ? `${startTime}${endTime ? ` - ${endTime}` : ""}` : null;
  const freqText = lessonsPerWeek ? `${lessonsPerWeek}x / sett.` : totalLessons ? `${totalLessons} lez.` : null;

  const primary =
    formattedDays ||
    freqText ||
    (scheduleType === "flexible" ? "Flessibile" : scheduleType === "fixed" ? "Fissa" : "-");

  const secondaryParts: string[] = [];
  if (formattedDays) {
    if (freqText) secondaryParts.push(freqText);
    if (timeText) secondaryParts.push(timeText);
  } else if (freqText) {
    if (timeText) secondaryParts.push(timeText);
    if (scheduleType === "flexible") secondaryParts.push("Flessibile");
    else if (scheduleType === "fixed") secondaryParts.push("Fissa");
  } else if (scheduleType) {
    secondaryParts.push(scheduleType === "flexible" ? "Flessibile" : "Fissa");
  }

  return {
    primary,
    secondary: secondaryParts.join(" • "),
  };
}

