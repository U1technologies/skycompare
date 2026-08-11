/**
 * The check-in date the form starts with must be the visitor's own calendar
 * date. These tests run the clock at real problem moments in real timezones,
 * because the bug they guard against only appears inside a few hours of local
 * midnight and is invisible to anyone testing from UTC.
 */
import { describe, it, expect, beforeEach, afterEach, vi } from "vitest";
import { toIsoDate, today, addDays } from "./dates";

const ORIGINAL_TZ = process.env.TZ;

/** Run the clock at a real instant, in a real timezone. */
function at(utcInstant: string, timezone: string) {
  process.env.TZ = timezone;
  vi.setSystemTime(new Date(utcInstant));
}

beforeEach(() => vi.useFakeTimers());

afterEach(() => {
  vi.useRealTimers();
  process.env.TZ = ORIGINAL_TZ;
});

describe("toIsoDate", () => {
  it("pads single-digit months and days", () => {
    expect(toIsoDate(new Date(2026, 0, 5))).toBe("2026-01-05");
  });

  it("reads the calendar date, not the UTC date", () => {
    process.env.TZ = "Asia/Kolkata";
    // 20:15 UTC on the 11th is 01:45 on the 12th in India.
    expect(toIsoDate(new Date("2026-08-11T20:15:00Z"))).toBe("2026-08-12");
  });
});

describe("today", () => {
  it("gives the Indian visitor's date just after local midnight, not yesterday", () => {
    at("2026-08-11T20:15:00Z", "Asia/Kolkata"); // 01:45, 12 Aug in India

    expect(today()).toBe("2026-08-12");
    // The old implementation, kept here as the thing that must never come back.
    expect(new Date().toISOString().slice(0, 10)).toBe("2026-08-11");
  });

  it("gives the US visitor's date in the evening, not tomorrow", () => {
    at("2026-08-12T03:00:00Z", "America/Los_Angeles"); // 20:00, 11 Aug in LA

    expect(today()).toBe("2026-08-11");
    expect(new Date().toISOString().slice(0, 10)).toBe("2026-08-12");
  });

  it("agrees with UTC when the visitor is on UTC", () => {
    at("2026-08-12T10:00:00Z", "UTC");

    expect(today()).toBe("2026-08-12");
  });
});

describe("addDays", () => {
  it("keeps the visitor's timezone when offsetting", () => {
    at("2026-08-11T20:15:00Z", "Asia/Kolkata"); // 12 Aug locally

    expect(addDays(3)).toBe("2026-08-15");
  });

  it("carries across a month boundary", () => {
    at("2026-08-30T06:00:00Z", "Asia/Kolkata");

    expect(addDays(3)).toBe("2026-09-02");
  });

  it("carries across a year boundary", () => {
    at("2026-12-30T06:00:00Z", "Asia/Kolkata");

    expect(addDays(3)).toBe("2027-01-02");
  });

  it("stays on the intended day across a daylight saving change", () => {
    // US clocks go forward on 8 March 2026.
    at("2026-03-07T18:00:00Z", "America/Los_Angeles"); // 10:00, 7 Mar

    expect(addDays(1)).toBe("2026-03-08");
    expect(addDays(3)).toBe("2026-03-10");
  });

  it("defaults check-out after check-in, which is what the form relies on", () => {
    at("2026-08-11T20:15:00Z", "Asia/Kolkata");

    expect(new Date(addDays(3)).getTime()).toBeGreaterThan(new Date(today()).getTime());
  });
});
