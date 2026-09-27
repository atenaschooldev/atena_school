import { describe, it, expect } from "vitest";
import { sanitizeTaxCode, extractBirthDateFromTaxCode, parseTaxCode } from "../index";

describe("Codice Fiscale Utils", () => {
  it("sanitizes tax code string", () => {
    expect(sanitizeTaxCode(" rss mra 80a01 h501z ")).toBe("RSSMRA80A01H501Z");
    expect(sanitizeTaxCode("ptk-vk-t03t05z138i")).toBe("PTKVKT03T05Z138I");
  });

  it("extracts male birth date correctly", () => {
    // RSSMRA80A01H501Z -> 1980-01-01 (M)
    const date = extractBirthDateFromTaxCode("RSSMRA80A01H501Z");
    expect(date).toBe("1980-01-01");
  });

  it("extracts female birth date with +40 day offset correctly", () => {
    // PTKVKT03T05Z138I -> 03 (2003), T (12 = Dec), 05 (Day 05, not +40 because <= 40 -> 05)
    const date = extractBirthDateFromTaxCode("PTKVKT03T05Z138I");
    expect(date).toBe("2003-12-05");

    // Female with +40 offset: Day 45 -> Day 05
    const femaleDate = extractBirthDateFromTaxCode("RSSMRA80A45H501Z");
    expect(femaleDate).toBe("1980-01-05");
  });

  it("parses full metadata with parseTaxCode", () => {
    const maleRes = parseTaxCode("RSSMRA80A01H501Z");
    expect(maleRes.clean).toBe("RSSMRA80A01H501Z");
    expect(maleRes.isComplete).toBe(true);
    expect(maleRes.birthDate).toBe("1980-01-01");
    expect(maleRes.gender).toBe("M");

    const femaleRes = parseTaxCode("RSSMRA80A45H501Z");
    expect(femaleRes.clean).toBe("RSSMRA80A45H501Z");
    expect(femaleRes.isComplete).toBe(true);
    expect(femaleRes.birthDate).toBe("1980-01-05");
    expect(femaleRes.gender).toBe("F");

    const incompleteRes = parseTaxCode("RSSMRA80A");
    expect(incompleteRes.isComplete).toBe(false);
    expect(incompleteRes.birthDate).toBeNull();
  });
});
