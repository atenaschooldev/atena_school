import { describe, it, expect } from "vitest";
import {
  getCurrentAcademicYear,
  generateMembershipNumber,
  formatCurrency,
  formatDateItalian,
  encodeScheduleSlot,
  decodeScheduleSlot,
  generateSlotSignature,
  verifySlotSignature,
  calculateLessonDates,
  getDynamicMaxLessons,
  romeDateTimeToIso,
} from "../index";
import { CourseCategory, CourseFormat, CourseScheduleType } from "@atena/api-types";

describe("@atena/utils - Business Logic & Scheduler Unit Tests", () => {
  describe("Academic Year & Membership Number", () => {
    it("correctly determines Italian academic year (Sep 1 - Aug 31)", () => {
      // In September 2026 -> 2026/2027
      const sep = getCurrentAcademicYear("2026-09-15");
      expect(sep.academicYear).toBe("2026/2027");
      expect(sep.startYear).toBe(2026);
      expect(sep.endYear).toBe(2027);

      // In March 2027 -> 2026/2027
      const mar = getCurrentAcademicYear("2027-03-10");
      expect(mar.academicYear).toBe("2026/2027");

      // In August 2027 -> 2026/2027
      const aug = getCurrentAcademicYear("2027-08-31");
      expect(aug.academicYear).toBe("2026/2027");
    });

    it("generates correct membership card format (ATN-YYYY-NNNN)", () => {
      expect(generateMembershipNumber("2026/2027", 1)).toBe("ATN-2026-0001");
      expect(generateMembershipNumber("2026/2027", 42)).toBe("ATN-2026-0042");
      expect(generateMembershipNumber("2027/2028", 1234)).toBe("ATN-2027-1234");
    });
  });

  describe("Currency and Date Formatting", () => {
    it("formats amounts to EUR correctly", () => {
      expect(formatCurrency(30)).toContain("30,00");
      expect(formatCurrency("103.20")).toContain("103,20");
      expect(formatCurrency(0)).toContain("0,00");
    });

    it("formats ISO dates to human-readable Italian format", () => {
      expect(formatDateItalian("2026-10-06")).toBe("6 ottobre 2026");
      expect(formatDateItalian("2027-01-15")).toBe("15 gennaio 2027");
    });
  });

  describe("Schedule Slots & HMAC Checksum Signatures", () => {
    it("encodes Italian schedule strings into URL slugs", () => {
      const slot = encodeScheduleSlot("Martedì e Giovedì 17:00-18:00");
      expect(slot.daysSlug).toBe("mar-gio");
      expect(slot.timeSlug).toBe("17:00");

      const monWed = encodeScheduleSlot("Lunedì e Mercoledì 18:30");
      expect(monWed.daysSlug).toBe("lun-mer");
      expect(monWed.timeSlug).toBe("18:30");
    });

    it("decodes URL slugs back to human Italian schedule", () => {
      const decoded = decodeScheduleSlot("mar-gio", "17:00");
      expect(decoded).toContain("Martedì");
      expect(decoded).toContain("Giovedì");
      expect(decoded).toContain("17:00");
    });

    it("generates and verifies HMAC signatures for slot query parameters", () => {
      const courseId = "english-kids-6-7";
      const date = "2026-10-06";
      const days = "mar-gio";
      const time = "17:00";

      const sig = generateSlotSignature(courseId, date, days, time);
      expect(typeof sig).toBe("string");
      expect(sig.length).toBe(8);

      expect(verifySlotSignature(courseId, date, days, time, sig)).toBe(true);
      expect(verifySlotSignature(courseId, date, days, "18:00", sig)).toBe(false);
      expect(verifySlotSignature(courseId, "2026-10-07", days, time, sig)).toBe(false);
    });
  });

  describe("Lesson Dates Calculator (calculateLessonDates)", () => {
    it("generates exact lessons for Tuesday/Thursday schedule across 1 month window", () => {
      // Start Tuesday 2026-10-06, Martedì e Giovedì 17:00-18:00
      const lessons = calculateLessonDates(
        "2026-10-06",
        "Martedì e Giovedì 17:00-18:00",
        CourseCategory.KIDS,
        [2, 4],
        60,
        "17:00",
        "18:00",
        CourseScheduleType.FIXED
      );

      expect(lessons.length).toBe(10);

      // Check dates progression:
      // Lesson 1: Tue 2026-10-06
      // Lesson 2: Thu 2026-10-08
      // Lesson 3: Tue 2026-10-13
      // Lesson 4: Thu 2026-10-15
      expect(lessons[0].startsAt).toContain("2026-10-06");
      expect(lessons[1].startsAt).toContain("2026-10-08");
      expect(lessons[2].startsAt).toContain("2026-10-13");
      expect(lessons[3].startsAt).toContain("2026-10-15");
    });

    it("generates single lesson for flexible schedule", () => {
      const lessons = calculateLessonDates(
        "2026-10-06",
        "17:00",
        CourseCategory.INDIVIDUAL,
        null,
        60,
        "17:00",
        "18:00",
        CourseScheduleType.FLEXIBLE
      );

      expect(lessons.length).toBe(1);
      expect(lessons[0].startsAt).toContain("2026-10-06");
    });

    it("respects dynamic max lessons for individual courses (4 lessons)", () => {
      const max = getDynamicMaxLessons("Individual Lesson", "2026-10-06", null, null, null, CourseFormat.INDIVIDUAL);
      expect(max).toBe(4);
    });
  });
});
