import { format, parseISO, isFuture } from "date-fns";
import { it } from "date-fns/locale";
import { addDays } from "date-fns";
import {
  CourseScheduleType,
  parseCourseScheduleType,
  CourseCategory,
  parseCourseCategory,
  CourseFormat,
  parseCourseFormat,
  COURSE_SCHEDULE_TYPE_DICTIONARY,
  Weekday,
  WEEKDAY_DICTIONARY,
} from "@atena/api-types";


/**
 * Annual registration fee in EUR
 */
export const ANNUAL_REGISTRATION_FEE_EUR = 30;

/**
 * Returns dynamic academic year in Italy (runs from 1 September to 31 August).
 * E.g., for any date between 2026-09-01 and 2027-08-31 returns academicYear: "2026/2027", expiresAt: "2027-08-31T23:59:59.000Z".
 */
export function getCurrentAcademicYear(dateInput?: Date | string | null): {
  academicYear: string;
  expiresAt: string;
  startYear: number;
  endYear: number;
} {
  const d = dateInput ? (typeof dateInput === "string" ? new Date(dateInput) : dateInput) : new Date();
  const validDate = isNaN(d.getTime()) ? new Date() : d;
  const currentYear = validDate.getFullYear();
  const currentMonth = validDate.getMonth() + 1; // 1-12 (September is 9)

  const startYear = currentMonth >= 9 ? currentYear : currentYear - 1;
  const endYear = startYear + 1;

  return {
    academicYear: `${startYear}/${endYear}`,
    expiresAt: new Date(Date.UTC(endYear, 7, 31, 23, 59, 59, 999)).toISOString(),
    startYear,
    endYear,
  };
}

/**
 * Generates official Italian Association Membership Card Number (Numero Tessera Socio)
 * Format: ATN-2026-0001
 */
export function generateMembershipNumber(academicYear?: string | null, sequenceNumber: number = 1): string {
  const yearPrefix = (academicYear || "2026/2027").split("/")[0] || "2026";
  const paddedSeq = String(Math.max(1, sequenceNumber || 1)).padStart(4, "0");
  return `ATN-${yearPrefix}-${paddedSeq}`;
}

/**
 * Computes Gregorian Easter Sunday for a given year using Anonymous Gregorian Algorithm (Meeus/Jones/Butcher).
 */
export function computeEasterSunday(year: number): Date {
  const a = year % 19;
  const b = Math.floor(year / 100);
  const c = year % 100;
  const d = Math.floor(b / 4);
  const e = b % 4;
  const f = Math.floor((b + 8) / 25);
  const g = Math.floor((b - f + 1) / 3);
  const h = (19 * a + b - d - g + 15) % 30;
  const i = Math.floor(c / 4);
  const k = c % 4;
  const l = (32 + 2 * e + 2 * i - h - k) % 7;
  const m = Math.floor((a + 11 * h + 22 * l) / 451);
  const month = Math.floor((h + l - 7 * m + 114) / 31); // 3=March, 4=April
  const day = ((h + l - 7 * m + 114) % 31) + 1;
  return new Date(Date.UTC(year, month - 1, day));
}

/**
 * Official School Holidays Calendar for Academic Year
 */
export interface SchoolHolidayPeriod {
  name: string;
  startDate: string; // YYYY-MM-DD
  endDate: string;   // YYYY-MM-DD
  description: string;
}

/**
 * Dynamically computes official Italian Association / School holiday calendar for any academic year.
 * (Ponte dei Defunti, Immacolata, Natale/Epifania, Pasqua, Liberazione, Festa del Lavoro, Repubblica).
 */
export function getItalianSchoolHolidaysForYear(startYear: number): SchoolHolidayPeriod[] {
  const nextYear = startYear + 1;

  // Compute Easter and related holidays (Giovedì Santo to Martedì di Pasqua)
  const easterSunday = computeEasterSunday(nextYear);
  const holyThursday = new Date(easterSunday.getTime() - 3 * 24 * 60 * 60 * 1000);
  const easterTuesday = new Date(easterSunday.getTime() + 2 * 24 * 60 * 60 * 1000);

  const formatIsoDate = (d: Date) => d.toISOString().split("T")[0];

  return [
    {
      name: "Ponte dei Defunti",
      startDate: `${startYear}-11-01`,
      endDate: `${startYear}-11-02`,
      description: "Chiusura per ponte dei defunti e festa di tutti i santi",
    },
    {
      name: "Ponte dell'Immacolata",
      startDate: `${startYear}-12-07`,
      endDate: `${startYear}-12-08`,
      description: "Festa dell'Immacolata Concezione",
    },
    {
      name: "Vacanze di Natale",
      startDate: `${startYear}-12-23`,
      endDate: `${nextYear}-01-06`,
      description: "Festività natalizie ed Epifania",
    },
    {
      name: "Vacanze di Pasqua",
      startDate: formatIsoDate(holyThursday),
      endDate: formatIsoDate(easterTuesday),
      description: "Festività pasquali",
    },
    {
      name: "Festa della Liberazione",
      startDate: `${nextYear}-04-25`,
      endDate: `${nextYear}-04-25`,
      description: "Anniversario della Liberazione d'Italia",
    },
    {
      name: "Festa del Lavoro",
      startDate: `${nextYear}-05-01`,
      endDate: `${nextYear}-05-01`,
      description: "Festa dei Lavoratori",
    },
    {
      name: "Festa della Repubblica",
      startDate: `${nextYear}-06-02`,
      endDate: `${nextYear}-06-02`,
      description: "Festa Nazionale della Repubblica Italiana",
    },
  ];
}

/** Precalculated holidays for 2026/2027 academic year for backwards compatibility */
export const ATENA_HOLIDAYS_2026_2027: SchoolHolidayPeriod[] = getItalianSchoolHolidaysForYear(2026);

export function isSchoolHoliday(date: Date | string, holidays?: SchoolHolidayPeriod[] | null): boolean {
  const d = typeof date === "string" ? new Date(date) : date;
  if (isNaN(d.getTime())) return false;
  const dateStr = d.toISOString().split("T")[0];

  const resolvedHolidays = holidays || getItalianSchoolHolidaysForYear(getCurrentAcademicYear(d).startYear);
  return resolvedHolidays.some((h) => dateStr >= h.startDate && dateStr <= h.endDate);
}

/**
 * Format currency amount to EUR (e.g. €152.00)
 */
export function formatCurrency(amount: any): string {
  if (amount === null || amount === undefined) return "€0.00";
  let num: number;
  if (typeof amount === "number") {
    num = amount;
  } else if (typeof amount === "string") {
    num = parseFloat(amount);
  } else if (typeof amount === "object") {
    if (typeof amount.toNumber === "function") num = amount.toNumber();
    else if (typeof amount.toString === "function") num = parseFloat(amount.toString());
    else if ("d" in amount) num = Number(amount);
    else num = 0;
  } else {
    num = Number(amount);
  }
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

export interface ScheduledLesson {
  startsAt: string; // ISO string with timezone
  endsAt: string;   // ISO string with timezone
}

/**
 * Deterministically converts a local Rome date & time to a precise UTC ISO-8601 string.
 * Immune to Daylight Saving Time (DST) changes (UTC+1 CET / UTC+2 CEST) and server host timezones.
 */
export function romeDateTimeToIso(year: number, month: number, day: number, hour: number, min: number): string {
  try {
    const tentativeUtc = Date.UTC(year, month, day, hour, min, 0);
    const dtf = new Intl.DateTimeFormat("en-US", {
      timeZone: "Europe/Rome",
      year: "numeric",
      month: "numeric",
      day: "numeric",
      hour: "numeric",
      minute: "numeric",
      second: "numeric",
      hourCycle: "h23",
    });
    const parts = dtf.formatToParts(new Date(tentativeUtc));
    const p: Record<string, number> = {};
    for (const part of parts) {
      if (part.type !== "literal") {
        p[part.type] = parseInt(part.value, 10);
      }
    }
    const romeUtcMs = Date.UTC(p.year, p.month - 1, p.day, p.hour === 24 ? 0 : p.hour, p.minute, p.second);
    const offsetMs = romeUtcMs - tentativeUtc;
    const exactUtcMs = tentativeUtc - offsetMs;
    return new Date(exactUtcMs).toISOString();
  } catch {
    return new Date(Date.UTC(year, month, day, hour - 1, min, 0)).toISOString();
  }
}

/**
 * Get UTC offset in hours for Europe/Rome at a specific Date instance.
 */
export function getRomeOffsetHours(date: Date): number {
  try {
    const dtf = new Intl.DateTimeFormat("en-US", {
      timeZone: "Europe/Rome",
      year: "numeric",
      month: "numeric",
      day: "numeric",
      hour: "numeric",
      minute: "numeric",
      second: "numeric",
      hourCycle: "h23",
    });
    const parts = dtf.formatToParts(date);
    const p: Record<string, number> = {};
    for (const part of parts) {
      if (part.type !== "literal") {
        p[part.type] = parseInt(part.value, 10);
      }
    }
    const romeUtcMs = Date.UTC(p.year, p.month - 1, p.day, p.hour === 24 ? 0 : p.hour, p.minute, p.second);
    return Math.round((romeUtcMs - date.getTime()) / (1000 * 60 * 60));
  } catch {
    return 1;
  }
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
  if (lessonDurationMinutes && lessonDurationMinutes > 0) {
    return `${lessonDurationMinutes} min / lezione`;
  }
  return "";
}

export function formatCourseScheduleText(
  scheduleDays?: (number | string)[] | null,
  startTime?: string | null,
  endTime?: string | null
): string {
  if (!scheduleDays || scheduleDays.length === 0 || !startTime) {
    return COURSE_SCHEDULE_TYPE_DICTIONARY[CourseScheduleType.FLEXIBLE].label_it;
  }
  const daysText = scheduleDays
    .map(Number)
    .filter((d) => !isNaN(d))
    .map((d) => WEEKDAY_DICTIONARY[d % 7]?.label_it || String(d))
    .join(" e ");
  const timeText = endTime ? `${startTime}-${endTime}` : startTime;
  return `${daysText} ${timeText}`;
}

/**
 * URL Checksum Salt for frontend query parameter integrity verification
 * (Protects prefilled checkout query parameters from accidental URL corruption).
 */
export const SLOT_CHECKSUM_SALT =
  (typeof process !== 'undefined' && (process.env?.SLOT_CHECKSUM_SALT || process.env?.NEXT_PUBLIC_SLOT_SALT)) ||
  "atena_slot_salt_2026";
/** @deprecated Alias for backwards compatibility */
export const SLOT_SECRET_SALT = SLOT_CHECKSUM_SALT;

/**
 * Generate 8-character URL checksum for course slot query parameters
 */
export function generateSlotSignature(itemSlugOrId: string, dateStr: string, daysSlug: string, timeSlug: string): string {
  const payload = `${itemSlugOrId}:${dateStr}:${daysSlug}:${timeSlug}:${SLOT_CHECKSUM_SALT}`;
  let hash = 0;
  for (let i = 0; i < payload.length; i++) {
    const char = payload.charCodeAt(i);
    hash = (hash << 5) - hash + char;
    hash |= 0;
  }
  return Math.abs(hash).toString(16).padStart(8, '0').slice(0, 8);
}

/**
 * Verify 8-character URL checksum for course slot query parameters
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
  if (
    rawTime &&
    (rawTime.includes(WEEKDAY_DICTIONARY[Weekday.TUESDAY].label_it) ||
      rawTime.includes(WEEKDAY_DICTIONARY[Weekday.MONDAY].label_it) ||
      rawTime.includes(WEEKDAY_DICTIONARY[Weekday.WEDNESDAY].label_it) ||
      rawTime.includes(WEEKDAY_DICTIONARY[Weekday.THURSDAY].label_it) ||
      rawTime.includes(WEEKDAY_DICTIONARY[Weekday.FRIDAY].label_it))
  ) {
    return rawTime;
  }

  const daysMap: Record<string, string> = {
    'mar-gio': `${WEEKDAY_DICTIONARY[Weekday.TUESDAY].label_it} e ${WEEKDAY_DICTIONARY[Weekday.THURSDAY].label_it}`,
    'lun-mer': `${WEEKDAY_DICTIONARY[Weekday.MONDAY].label_it} e ${WEEKDAY_DICTIONARY[Weekday.WEDNESDAY].label_it}`,
    'mar-ven': `${WEEKDAY_DICTIONARY[Weekday.TUESDAY].label_it} e ${WEEKDAY_DICTIONARY[Weekday.FRIDAY].label_it}`,
    'lun-ven': `${WEEKDAY_DICTIONARY[Weekday.MONDAY].label_it} e ${WEEKDAY_DICTIONARY[Weekday.FRIDAY].label_it}`,
    lun: WEEKDAY_DICTIONARY[Weekday.MONDAY].label_it,
    mar: WEEKDAY_DICTIONARY[Weekday.TUESDAY].label_it,
    mer: WEEKDAY_DICTIONARY[Weekday.WEDNESDAY].label_it,
    gio: WEEKDAY_DICTIONARY[Weekday.THURSDAY].label_it,
    ven: WEEKDAY_DICTIONARY[Weekday.FRIDAY].label_it,
    sab: WEEKDAY_DICTIONARY[Weekday.SATURDAY].label_it,
    dom: WEEKDAY_DICTIONARY[Weekday.SUNDAY].label_it,
  };

  const dayText =
    daysSlug && daysMap[daysSlug]
      ? daysMap[daysSlug]
      : `${WEEKDAY_DICTIONARY[Weekday.TUESDAY].label_it} e ${WEEKDAY_DICTIONARY[Weekday.THURSDAY].label_it}`;
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
  titleOrName?: string | null,
  startDateStr?: string | null,
  category?: CourseCategory | number | string | null,
  lessonsPerWeek?: number | null,
  totalLessons?: number | null,
  courseFormat?: CourseFormat | number | string | null
): number {
  if (totalLessons && totalLessons > 0) {
    return totalLessons;
  }

  if (lessonsPerWeek && lessonsPerWeek > 0) {
    return lessonsPerWeek * 4;
  }

  const format = parseCourseFormat(courseFormat);
  if (format === CourseFormat.INDIVIDUAL) {
    return 4;
  }

  const parsedCategory = parseCourseCategory(category);
  if (parsedCategory === CourseCategory.CERTIPASS) {
    return 10;
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
  courseCategory?: CourseCategory | number | string | null,
  dbScheduleDays?: (number | string)[] | null,
  dbDurationMinutes?: number | null,
  dbStartTime?: string | null,
  dbEndTime?: string | null,
  dbScheduleType?: CourseScheduleType | number | string | null,
  customMaxLessons?: number | null
): ScheduledLesson[] {
  if (!startDateStr) return [];

  const baseDate = new Date(startDateStr);
  if (isNaN(baseDate.getTime())) return [];

  const scheduleType = parseCourseScheduleType(dbScheduleType);
  const isFlexible = scheduleType === CourseScheduleType.FLEXIBLE;

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

    const startIso = romeDateTimeToIso(year, month, day, startHour, startMin);
    const endIso = new Date(new Date(startIso).getTime() + durationMinutes * 60 * 1000).toISOString();

    return [{
      startsAt: startIso,
      endsAt: endIso,
    }];
  }

  let targetDays: number[] = [];
  if (dbScheduleDays && dbScheduleDays.length > 0) {
    targetDays = dbScheduleDays.map(Number).filter((d) => !isNaN(d));
  } else if (timeStr) {
    const timeLower = timeStr.toLowerCase();
    if (timeLower.includes(WEEKDAY_DICTIONARY[Weekday.MONDAY].label_it.toLowerCase()) || timeLower.includes("lunedi")) targetDays.push(Weekday.MONDAY);
    if (timeLower.includes(WEEKDAY_DICTIONARY[Weekday.TUESDAY].label_it.toLowerCase()) || timeLower.includes("martedi")) targetDays.push(Weekday.TUESDAY);
    if (timeLower.includes(WEEKDAY_DICTIONARY[Weekday.WEDNESDAY].label_it.toLowerCase()) || timeLower.includes("mercoledi")) targetDays.push(Weekday.WEDNESDAY);
    if (timeLower.includes(WEEKDAY_DICTIONARY[Weekday.THURSDAY].label_it.toLowerCase()) || timeLower.includes("giovedi")) targetDays.push(Weekday.THURSDAY);
    if (timeLower.includes(WEEKDAY_DICTIONARY[Weekday.FRIDAY].label_it.toLowerCase()) || timeLower.includes("venerdi")) targetDays.push(Weekday.FRIDAY);
    if (timeLower.includes(WEEKDAY_DICTIONARY[Weekday.SATURDAY].label_it.toLowerCase())) targetDays.push(Weekday.SATURDAY);
    if (timeLower.includes(WEEKDAY_DICTIONARY[Weekday.SUNDAY].label_it.toLowerCase())) targetDays.push(Weekday.SUNDAY);
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

      const startIso = romeDateTimeToIso(year, month, day, startHour, startMin);
      const endIso = new Date(new Date(startIso).getTime() + durationMinutes * 60 * 1000).toISOString();

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
  scheduleType?: CourseScheduleType | number | string | null;
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

  const formattedDays =
    scheduleDays && scheduleDays.length > 0
      ? scheduleDays
          .map((d) => (typeof d === "number" ? WEEKDAY_DICTIONARY[d % 7]?.label_it || String(d) : d))
          .filter(Boolean)
          .join(", ")
      : null;

  const timeText = startTime ? `${startTime}${endTime ? ` - ${endTime}` : ""}` : null;
  const freqText = lessonsPerWeek ? `${lessonsPerWeek}x / sett.` : totalLessons ? `${totalLessons} lez.` : null;

  const parsedSchedType = parseCourseScheduleType(scheduleType);
  const schedLabel = COURSE_SCHEDULE_TYPE_DICTIONARY[parsedSchedType]?.label_it || COURSE_SCHEDULE_TYPE_DICTIONARY[CourseScheduleType.FIXED].label_it;

  const primary =
    formattedDays ||
    freqText ||
    (scheduleType ? schedLabel : "-");

  const secondaryParts: string[] = [];
  if (formattedDays) {
    if (freqText) secondaryParts.push(freqText);
    if (timeText) secondaryParts.push(timeText);
  } else if (freqText) {
    if (timeText) secondaryParts.push(timeText);
    if (scheduleType) secondaryParts.push(schedLabel);
  } else if (scheduleType) {
    secondaryParts.push(schedLabel);
  }

  return {
    primary,
    secondary: secondaryParts.join(" • "),
  };
}

/**
 * Sanitizes tax code by stripping whitespace, hyphens, dots and converting to uppercase.
 */
export function sanitizeTaxCode(input?: string | null): string {
  if (!input) return "";
  return input.replace(/[\s\-_.]/g, "").toUpperCase();
}

const CF_MONTHS: Record<string, string> = {
  A: "01",
  B: "02",
  C: "03",
  D: "04",
  E: "05",
  H: "06",
  L: "07",
  M: "08",
  P: "09",
  R: "10",
  S: "11",
  T: "12",
};

/**
 * Extracts birth date (YYYY-MM-DD) from a 16-character Italian Codice Fiscale.
 * Returns null if the format is invalid or cannot be parsed.
 */
export function extractBirthDateFromTaxCode(cf?: string | null): string | null {
  if (!cf) return null;
  const clean = sanitizeTaxCode(cf);
  if (clean.length < 11) return null;

  // Italian CF: positions 6-7 = year, 8 = month letter, 9-10 = day (+40 for females)
  const yrStr = clean.slice(6, 8);
  const mChar = clean.charAt(8);
  const dayStr = clean.slice(9, 11);

  if (!/^\d{2}$/.test(yrStr) || !/^\d{2}$/.test(dayStr)) return null;
  const month = CF_MONTHS[mChar];
  if (!month) return null;

  const rawDay = parseInt(dayStr, 10);
  const actualDay = rawDay > 40 ? rawDay - 40 : rawDay;
  if (actualDay < 1 || actualDay > 31) return null;

  const twoDigitYear = parseInt(yrStr, 10);
  const currentYear = new Date().getFullYear();
  const currentTwoDigit = currentYear % 100;

  // If twoDigitYear <= currentTwoDigit, assume 2000s (e.g. 02 -> 2002, 24 -> 2024), else 1900s (e.g. 80 -> 1980)
  const fullYear = twoDigitYear <= currentTwoDigit ? 2000 + twoDigitYear : 1900 + twoDigitYear;
  const formattedDay = String(actualDay).padStart(2, "0");

  const isoDate = `${fullYear}-${month}-${formattedDay}`;
  const d = new Date(isoDate);
  if (isNaN(d.getTime())) return null;

  return isoDate;
}

export interface ParsedTaxCode {
  clean: string;
  isComplete: boolean;
  birthDate: string | null;
  gender: "M" | "F" | null;
}

/**
 * Parses and extracts all metadata from an Italian Tax Code (Codice Fiscale).
 * Returns normalized string, completion flag, birth date (YYYY-MM-DD), and gender.
 */
export function parseTaxCode(input?: string | null): ParsedTaxCode {
  const clean = sanitizeTaxCode(input).slice(0, 16);
  const isComplete = clean.length === 16;
  const birthDate = isComplete ? extractBirthDateFromTaxCode(clean) : null;

  let gender: "M" | "F" | null = null;
  if (clean.length >= 11) {
    const dayStr = clean.slice(9, 11);
    if (/^\d{2}$/.test(dayStr)) {
      const rawDay = parseInt(dayStr, 10);
      if (rawDay > 40 && rawDay <= 71) gender = "F";
      else if (rawDay >= 1 && rawDay <= 31) gender = "M";
    }
  }

  return {
    clean,
    isComplete,
    birthDate,
    gender,
  };
}
