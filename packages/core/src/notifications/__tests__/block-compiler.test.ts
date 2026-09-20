import { describe, it, expect } from "vitest";
import {
  compileTemplateVariables,
  getDefaultBlocksForTemplate,
  renderEmailFromBlocks,
  renderTelegramFromBlocks,
} from "../block-compiler";
import { NotificationChannel } from "@atena/api-types";
import { DEFAULT_SCHOOL_PROFILE } from "../../system/school-profile.service";

describe("@atena/core - Block Compiler & Notification Renderer", () => {
  describe("Variable Interpolation (compileTemplateVariables)", () => {
    it("replaces double-curly braces with variable values", () => {
      const template = "Ciao {{student_name}}, la tua lezione di {{course_name}} è confermata per {{date}}.";
      const vars = {
        student_name: "Marco",
        course_name: "Inglese A1",
        date: "06/10/2026",
      };

      const result = compileTemplateVariables(template, vars);
      expect(result).toBe("Ciao Marco, la tua lezione di Inglese A1 è confermata per 06/10/2026.");
    });

    it("handles whitespace inside brackets and missing variables gracefully", () => {
      const template = "Ricevuta di {{ amount_paid }}€ per {{ missing_var }}.";
      const vars = { amount_paid: "103.20" };

      const result = compileTemplateVariables(template, vars);
      expect(result).toBe("Ricevuta di 103.20€ per .");
    });
  });

  describe("Default Template Blocks Generator", () => {
    it("generates structured email blocks for core template codes", () => {
      const emailConfig = getDefaultBlocksForTemplate(
        "booking_confirmation_customer",
        NotificationChannel.EMAIL
      );
      expect(emailConfig.channel).toBe(NotificationChannel.EMAIL);
      expect(emailConfig.blocks.length).toBeGreaterThan(0);
      expect(emailConfig.blocks.some((b) => b.type === "header")).toBe(true);
      expect(emailConfig.blocks.some((b) => b.type === "summary_table")).toBe(true);
    });

    it("generates telegram blocks for lead alert code", () => {
      const tgConfig = getDefaultBlocksForTemplate(
        "telegram_lead_alert",
        NotificationChannel.TELEGRAM
      );
      expect(tgConfig.channel).toBe(NotificationChannel.TELEGRAM);
      expect(tgConfig.blocks.length).toBeGreaterThan(0);
      expect(tgConfig.blocks.some((b) => b.type === "tg_header")).toBe(true);
    });
  });

  describe("HTML Email Rendering (renderEmailFromBlocks)", () => {
    it("compiles email blocks into full HTML structure with school branding", () => {
      const emailConfig = getDefaultBlocksForTemplate(
        "booking_confirmation_customer",
        NotificationChannel.EMAIL
      );
      const variables = {
        student_name: "Laura Bianchi",
        purchaser_name: "Mario Bianchi",
        course_name: "English Kids",
        amount_paid: "103.20",
        total_amount: "103.20",
        date: "2026-10-06",
        time: "17:00-18:00",
      };

      const rendered = renderEmailFromBlocks(emailConfig, variables, DEFAULT_SCHOOL_PROFILE);
      expect(rendered.subject).toBeTruthy();
      expect(rendered.html).toContain("<!DOCTYPE html>");
      expect(rendered.html).toContain("Laura Bianchi");
      expect(rendered.html).toContain("English Kids");
      expect(rendered.html).toContain(DEFAULT_SCHOOL_PROFILE.name);
    });
  });

  describe("Telegram Message Rendering (renderTelegramFromBlocks)", () => {
    it("compiles telegram blocks into clean formatted text", () => {
      const tgConfig = getDefaultBlocksForTemplate(
        "telegram_lead_alert",
        NotificationChannel.TELEGRAM
      );
      const variables = {
        student_name: "Giuseppe Verdi",
        purchaser_name: "Giuseppe Verdi",
        phone: "+393331122334",
        email: "giuseppe@email.com",
        interest: "Corso Spagnolo",
        message: "Vorrei informazioni sul corso serale.",
      };

      const rendered = renderTelegramFromBlocks(tgConfig, variables);
      expect(rendered.text).toContain("Giuseppe Verdi");
      expect(rendered.text).toContain("+393331122334");
      expect(rendered.text).toContain("Corso Spagnolo");
    });
  });
});
