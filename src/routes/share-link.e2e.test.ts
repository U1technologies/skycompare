/**
 * Share-link + browser-refresh survival tests.
 *
 * A user copying a /go URL and reopening it later (share, bookmark, refresh)
 * must land on the SAME partner URL with EVERY search parameter intact.
 *
 * We simulate the round-trip explicitly:
 *   click Search → /go URL → (serialize) → paste back → parse → buildTargetUrl
 * and diff both partner URLs.
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
import { buildTargetUrl, type BuildOk } from "@/routes/go";

const HOTEL: HotelSearch = {
  destination: "Barcelona, Spain",
  checkIn: "2026-09-01",
  checkOut: "2026-09-06",
  rooms: 2,
  adults: 3,
  children: 2,
};

const FLIGHT: FlightSearch = {
  tripType: "round-trip",
  from: "SFO",
  to: "NRT",
  depart: "2026-09-10",
  return: "2026-09-24",
  travellers: 3,
  cabin: "premium",
};

/** Simulate serializing a /go URL, sharing it, then reopening it in a fresh tab. */
function roundTrip(goUrl: string) {
  // Ship through the URL constructor so we go through real encode/decode.
  const shared = new URL(`https://skycompare.example.com${goUrl}`).toString();
  const parsed = new URL(shared);
  const params = Object.fromEntries(parsed.searchParams.entries());
  return buildTargetUrl(params);
}

describe("share-link survival — hotels", () => {
  for (const provider of HOTEL_PROVIDERS) {
    it(`${provider.name}: refreshed /go rebuilds an identical partner URL`, () => {
      const goUrl = buildHotelRedirect(provider.id, HOTEL);
      const first = buildTargetUrl(
        Object.fromEntries(new URLSearchParams(goUrl.split("?")[1]).entries()),
      );
      const second = roundTrip(goUrl);

      expect(first.ok && second.ok).toBe(true);
      const a = first as BuildOk;
      const b = second as BuildOk;
      // Byte-for-byte identical partner URL after serialize → share → parse.
      expect(b.url).toBe(a.url);
      expect(b.providerId).toBe(a.providerId);

      // Every user input must be visible in the final URL.
      const decoded = decodeURIComponent(b.url).toLowerCase();
      expect(decoded).toMatch(/barcelona/);
      expect(b.url).toContain(HOTEL.checkIn);
      expect(b.url).toContain(HOTEL.checkOut);
      expect(b.url).toMatch(new RegExp(`${HOTEL.adults}`));
      expect(b.url).toMatch(new RegExp(`${HOTEL.rooms}`));
    });
  }
});

describe("share-link survival — flights", () => {
  for (const provider of FLIGHT_PROVIDERS) {
    it(`${provider.name}: refreshed /go rebuilds an identical partner URL`, () => {
      const goUrl = buildFlightRedirect(provider.id, FLIGHT);
      const first = buildTargetUrl(
        Object.fromEntries(new URLSearchParams(goUrl.split("?")[1]).entries()),
      );
      const second = roundTrip(goUrl);

      expect(first.ok && second.ok).toBe(true);
      const a = first as BuildOk;
      const b = second as BuildOk;
      expect(b.url).toBe(a.url);

      const up = b.url.toUpperCase();
      expect(up).toContain(FLIGHT.from);
      expect(up).toContain(FLIGHT.to);
      expect(b.url).toContain(FLIGHT.depart);
      expect(b.url).toContain(FLIGHT.return!);
      expect(b.url).toMatch(new RegExp(`${FLIGHT.travellers}`));
      // "premium" maps to skyscanner's "premiumeconomy" but the substring is preserved.
      expect(b.url.toLowerCase()).toContain("premium");
    });
  }
});

describe("share-link survival — cabin class mapping is stable across refresh", () => {
  for (const cabin of ["economy", "premium", "business", "first"] as const) {
    it(`${cabin} survives a KAYAK refresh`, () => {
      const goUrl = buildFlightRedirect("kayak", { ...FLIGHT, cabin });
      const rebuilt = roundTrip(goUrl) as BuildOk;
      expect(rebuilt.ok).toBe(true);
      expect(rebuilt.url.toLowerCase()).toContain(cabin);
    });
  }
});
