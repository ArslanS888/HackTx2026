import { describe, it, expect } from "vitest";
import { formatRelativeTime, distanceMiles, isAllowedEmail } from "./format";

describe("formatRelativeTime", () => {
  const now = new Date("2024-01-01T12:00:00Z");

  it("shows minutes for upcoming events", () => {
    const soon = new Date("2024-01-01T12:25:00Z");
    expect(formatRelativeTime(soon, now)).toBe("in 25 min");
  });

  it("shows hours for events far in future", () => {
    const later = new Date("2024-01-01T14:00:00Z");
    expect(formatRelativeTime(later, now)).toBe("in 2h");
  });

  it("shows started X min ago for recent past", () => {
    const past = new Date("2024-01-01T11:45:00Z");
    expect(formatRelativeTime(past, now)).toBe("started 15 min ago");
  });

  it("shows started Xh ago for old past", () => {
    const past = new Date("2024-01-01T10:00:00Z");
    expect(formatRelativeTime(past, now)).toBe("started 2h ago");
  });
});

describe("distanceMiles", () => {
  it("returns 0 for same point", () => {
    const p = { lat: 29.8886, lng: -97.9407 };
    expect(distanceMiles(p, p)).toBeCloseTo(0, 5);
  });

  it("calculates a known distance within tolerance", () => {
    const alkek = { lat: 29.8886, lng: -97.9407 };
    const quad = { lat: 29.8871, lng: -97.9384 };
    const d = distanceMiles(alkek, quad);
    expect(d).toBeGreaterThan(0.05);
    expect(d).toBeLessThan(0.5);
  });
});

describe("isAllowedEmail", () => {
  it("allows all emails when domain is empty", () => {
    expect(isAllowedEmail("anyone@gmail.com", "")).toBe(true);
    expect(isAllowedEmail("anyone@gmail.com", null)).toBe(true);
    expect(isAllowedEmail("anyone@gmail.com", undefined)).toBe(true);
  });

  it("allows matching domain (case-insensitive)", () => {
    expect(isAllowedEmail("student@TXSTATE.EDU", "txstate.edu")).toBe(true);
    expect(isAllowedEmail("student@txstate.edu", "txstate.edu")).toBe(true);
  });

  it("rejects non-matching domain", () => {
    expect(isAllowedEmail("user@gmail.com", "txstate.edu")).toBe(false);
  });
});
