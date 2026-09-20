import { describe, it, expect } from "vitest";
import {
  getFieldValue,
  normalizeBoolean,
  matchesTriggerConditions,
  resolveRecipient,
} from "../trigger-matcher";
import { RecipientType, NotificationChannel } from "@atena/api-types";

describe("@atena/core - Trigger Matcher & Condition Evaluator", () => {
  describe("Field Resolver (getFieldValue)", () => {
    it("resolves top-level and nested properties", () => {
      const data = {
        amount_paid: 103.2,
        customer: {
          email: "mario.rossi@gmail.com",
          profile: {
            is_child: true,
          },
        },
      };

      expect(getFieldValue(data, "amount_paid")).toBe(103.2);
      expect(getFieldValue(data, "customer.email")).toBe("mario.rossi@gmail.com");
      expect(getFieldValue(data, "customer.profile.is_child")).toBe(true);
      expect(getFieldValue(data, "customer.non_existent")).toBeUndefined();
      expect(getFieldValue(data, "completely.missing.field")).toBeUndefined();
    });
  });

  describe("Boolean Normalizer (normalizeBoolean)", () => {
    it("handles booleans, numbers, and strings", () => {
      expect(normalizeBoolean(true)).toBe(true);
      expect(normalizeBoolean(1)).toBe(true);
      expect(normalizeBoolean("true")).toBe(true);
      expect(normalizeBoolean("1")).toBe(true);

      expect(normalizeBoolean(false)).toBe(false);
      expect(normalizeBoolean(0)).toBe(false);
      expect(normalizeBoolean("false")).toBe(false);
      expect(normalizeBoolean(null)).toBe(false);
      expect(normalizeBoolean(undefined)).toBe(false);
    });
  });

  describe("Condition Evaluation (matchesTriggerConditions)", () => {
    const payload = {
      amount: 150,
      payment_method: "stripe",
      course_id: "kids-english-a1",
      is_for_child: true,
      tags: ["summer", "promo2026"],
      notes: null,
    };

    it("evaluates simple key-value equality", () => {
      expect(matchesTriggerConditions(payload, { payment_method: "stripe" })).toBe(true);
      expect(matchesTriggerConditions(payload, { payment_method: "cash" })).toBe(false);
      expect(matchesTriggerConditions(payload, { is_for_child: true })).toBe(true);
      expect(matchesTriggerConditions(payload, { is_for_child: false })).toBe(false);
    });

    it("evaluates comparison operators (gt, gte, lt, lte)", () => {
      expect(matchesTriggerConditions(payload, { amount: { gt: 100 } })).toBe(true);
      expect(matchesTriggerConditions(payload, { amount: { gte: 150 } })).toBe(true);
      expect(matchesTriggerConditions(payload, { amount: { gt: 150 } })).toBe(false);
      expect(matchesTriggerConditions(payload, { amount: { lt: 200 } })).toBe(true);
      expect(matchesTriggerConditions(payload, { amount: { lte: 150 } })).toBe(true);
      expect(matchesTriggerConditions(payload, { amount: { lt: 100 } })).toBe(false);
    });

    it("evaluates contains, in, not_in, is_empty operators", () => {
      expect(matchesTriggerConditions(payload, { course_id: { contains: "kids" } })).toBe(true);
      expect(matchesTriggerConditions(payload, { course_id: { not_contains: "teens" } })).toBe(true);
      expect(matchesTriggerConditions(payload, { payment_method: { in: ["stripe", "paypal"] } })).toBe(true);
      expect(matchesTriggerConditions(payload, { payment_method: { not_in: ["cash", "bonifico"] } })).toBe(true);
      expect(matchesTriggerConditions(payload, { notes: { is_empty: true } })).toBe(true);
    });

    it("evaluates multi-condition matching (all must pass)", () => {
      expect(
        matchesTriggerConditions(payload, {
          payment_method: "stripe",
          amount: { gte: 100 },
          is_for_child: true,
        })
      ).toBe(true);

      expect(
        matchesTriggerConditions(payload, {
          payment_method: "stripe",
          amount: { gte: 200 }, // Fails
          is_for_child: true,
        })
      ).toBe(false);
    });

    it("returns true for empty conditions ({})", () => {
      expect(matchesTriggerConditions(payload, {})).toBe(true);
      expect(matchesTriggerConditions(payload, null)).toBe(true);
      expect(matchesTriggerConditions(payload, undefined)).toBe(true);
    });
  });

  describe("Recipient Resolver (resolveRecipient)", () => {
    const payload = {
      customer_email: "parent@gmail.com",
      purchaser_email: "purchaser@gmail.com",
      customer_phone: "+393401234567",
      teacher_email: "teacher.john@atenaschool.com",
      admin_email: "secretariat@atenaschool.com",
      admin_telegram_chat_id: "-100198273645",
      teacher_telegram_chat_id: "987654321",
    };

    it("resolves customer email and telegram", () => {
      const email = resolveRecipient(
        RecipientType.CUSTOMER,
        NotificationChannel.EMAIL,
        undefined,
        payload
      );
      expect(email).toBe("purchaser@gmail.com");

      const tg = resolveRecipient(
        RecipientType.CUSTOMER,
        NotificationChannel.TELEGRAM,
        undefined,
        payload
      );
      expect(tg).toBe("+393401234567");
    });

    it("resolves teacher email and telegram", () => {
      const email = resolveRecipient(
        RecipientType.TEACHER,
        NotificationChannel.EMAIL,
        undefined,
        payload
      );
      expect(email).toBe("teacher.john@atenaschool.com");

      const tg = resolveRecipient(
        RecipientType.TEACHER,
        NotificationChannel.TELEGRAM,
        undefined,
        payload
      );
      expect(tg).toBe("987654321");
    });

    it("resolves admin email and telegram", () => {
      const email = resolveRecipient(
        RecipientType.ADMIN,
        NotificationChannel.EMAIL,
        undefined,
        payload
      );
      expect(email).toBe("secretariat@atenaschool.com");

      const tg = resolveRecipient(
        RecipientType.ADMIN,
        NotificationChannel.TELEGRAM,
        undefined,
        payload
      );
      expect(tg).toBe("-100198273645");
    });

    it("resolves custom recipients", () => {
      const custom = resolveRecipient(
        4,
        NotificationChannel.EMAIL,
        "director@atenaschool.com",
        payload
      );
      expect(custom).toBe("director@atenaschool.com");
    });
  });
});
