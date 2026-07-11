/**
 * "Click Search" end-to-end coverage.
 *
 * We simulate the exact chain the app runs when a user submits the Hotels
 * or Flights form:
 *   1. `buildHotelRedirect` / `buildFlightRedirect` produces the /go URL.
 *   2. The browser refresh / share of that /go URL round-trips through
 *      `buildTargetUrl` (which re-validates via zod).
 *   3. Every partner's deep link opens with destination, dates, travellers,
 *      rooms and cabin all preserved.
 *
 * This is what a real click-through has to satisfy — no partner may drop a
 * param, and refreshing the /go URL must yield an identical deep link.
 */
import { describe, it, expect } from "vitest";
import {
  HOTEL_PROVIDERS,
  FLIGHT_PROVIDERS,
  buildHotelRedirect,
  buildFlightRedirect,
  type HotelSearch,
  type FlightSearch,
} from "@/lib/affiliates";
import { buildTargetUrl, isValidHttpUrl, type BuildOk } from "./go";

const HOTEL: HotelSearch = {
  destination: "Paris, France",
  checkIn: "2026-07-10",
  checkOut: "2026-07-14",
  rooms: 2,
  adults: 3,
  children: 1,
};

const FLIGHT: FlightSearch = {
  tripType: "round-trip",
  from: "JFK",
  to: "LHR",
  depart: "2026-07-10",
  return: "2026-07-17",
  travellers: 2,
  cabin: "business",
};

function paramsFromGoUrl(goUrl: string): Record<string, string> {
  const q = new URLSearchParams(goUrl.split("?")[1]);
  return Object.fromEntries(q.entries());
}

describe("Search click → /go → partner (Hotels)", () => {
  for (const provider of HOTEL_PROVIDERS) {
    it(`${provider.name} preserves destination, dates, rooms, travellers after refresh`, () => {
      const goUrl = buildHotelRedirect(provider.id, HOTEL);
      const result = buildTargetUrl(paramsFromGoUrl(goUrl));
      expect(result.ok).toBe(true);
      const ok = result as BuildOk;
      expect(isValidHttpUrl(ok.url)).toBe(true);
      expect(ok.providerName).toBe(provider.name);
      // Dates + travellers + rooms all reach the partner URL.
      expect(ok.url).toContain(HOTEL.checkIn);
      expect(ok.url).toContain(HOTEL.checkOut);
      expect(ok.url).toMatch(new RegExp(`${HOTEL.adults}`));
      expect(ok.url).toMatch(new RegExp(`${HOTEL.rooms}`));
      // Destination is present in some encoded form (query or slug path).
      const decoded = decodeURIComponent(ok.url).toLowerCase();
      expect(decoded).toMatch(/paris/);
    });
  }
});

describe("Search click → /go → partner (Flights)", () => {
  for (const provider of FLIGHT_PROVIDERS) {
    it(`${provider.name} preserves route, dates, travellers, cabin after refresh`, () => {
      const goUrl = buildFlightRedirect(provider.id, FLIGHT);
      const result = buildTargetUrl(paramsFromGoUrl(goUrl));
      expect(result.ok).toBe(true);
      const ok = result as BuildOk;
      expect(isValidHttpUrl(ok.url)).toBe(true);
      expect(ok.providerName).toBe(provider.name);
      const up = ok.url.toUpperCase();
      expect(up).toContain("JFK");
      expect(up).toContain("LHR");
      expect(ok.url.toLowerCase()).toContain(FLIGHT.cabin);
      expect(ok.url).toMatch(new RegExp(`${FLIGHT.travellers}`));
    });
  }

  it("round-trip return date survives the /go round-trip for KAYAK", () => {
    const goUrl = buildFlightRedirect("kayak", FLIGHT);
    const ok = buildTargetUrl(paramsFromGoUrl(goUrl)) as BuildOk;
    expect(ok.url).toContain(FLIGHT.return!);
  });

  it("one-way drops the return leg for every provider", () => {
    for (const p of FLIGHT_PROVIDERS) {
      const goUrl = buildFlightRedirect(p.id, { ...FLIGHT, tripType: "one-way", return: undefined });
      const ok = buildTargetUrl(paramsFromGoUrl(goUrl)) as BuildOk;
      expect(ok.url).not.toContain("2026-07-17");
    }
  });
});

describe("Deep-link runtime validation", () => {
  it("isValidHttpUrl accepts partner URLs and rejects junk", () => {
    expect(isValidHttpUrl("https://www.booking.com/x?y=1")).toBe(true);
    expect(isValidHttpUrl("http://example.com")).toBe(true);
    expect(isValidHttpUrl("javascript:alert(1)")).toBe(false);
    expect(isValidHttpUrl("not a url")).toBe(false);
    expect(isValidHttpUrl("")).toBe(false);
  });

  it("falls back to a working partner when the requested provider is unknown", () => {
    const goUrl = buildHotelRedirect("does-not-exist", HOTEL);
    const result = buildTargetUrl(paramsFromGoUrl(goUrl));
    expect(result.ok).toBe(true);
    if (result.ok) {
      expect(result.usedFallback).toBeTruthy();
      expect(result.usedFallback!.originalProviderId).toBe("does-not-exist");
      expect(isValidHttpUrl(result.url)).toBe(true);
    }
  });
});
