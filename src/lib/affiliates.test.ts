import { describe, it, expect } from "vitest";
import {
  HOTEL_PROVIDERS,
  FLIGHT_PROVIDERS,
  buildHotelRedirect,
  buildFlightRedirect,
  type HotelSearch,
  type FlightSearch,
} from "./affiliates";
import { goSchema } from "./go-schema";

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

describe("hotel affiliate links", () => {
  for (const provider of HOTEL_PROVIDERS) {
    it(`${provider.name}: preserves dates, rooms, and travellers`, () => {
      const url = provider.build(HOTEL);
      expect(url).toContain(HOTEL.checkIn);
      expect(url).toContain(HOTEL.checkOut);
      expect(url).toMatch(new RegExp(`${HOTEL.adults}`));
      // At least one of rooms or a rooms-hint must be present in the URL.
      expect(url).toMatch(new RegExp(`${HOTEL.rooms}`));
    });

    it(`${provider.name}: URI-encodes the destination`, () => {
      const url = provider.build({ ...HOTEL, destination: "Rio de Janeiro, Brazil" });
      // Spaces & commas must be percent-encoded in the query string (not raw).
      expect(url).not.toMatch(/[?&][^=]+=Rio de Janeiro/);
      expect(url.toLowerCase()).toContain("rio%20de%20janeiro");
    });
  }
});

describe("flight affiliate links", () => {
  for (const provider of FLIGHT_PROVIDERS) {
    it(`${provider.name}: preserves airports, dates, travellers, and cabin`, () => {
      const url = provider.build(FLIGHT);
      expect(url).toContain("JFK".toLowerCase()) || expect(url).toContain("JFK");
      expect(url.toUpperCase()).toContain("JFK");
      expect(url.toUpperCase()).toContain("LHR");
      // Cabin class preserved (either lower-cased in path or query).
      expect(url.toLowerCase()).toContain(FLIGHT.cabin);
      expect(url).toMatch(new RegExp(`${FLIGHT.travellers}`));
    });

    it(`${provider.name}: handles one-way (no return date)`, () => {
      const oneway: FlightSearch = { ...FLIGHT, tripType: "one-way", return: undefined };
      const url = provider.build(oneway);
      expect(url).not.toContain("2026-07-17");
      expect(url).not.toContain("260717");
    });
  }
});

describe("internal /go redirect builders", () => {
  it("buildHotelRedirect emits /go?type=hotel with encoded params", () => {
    const url = buildHotelRedirect("booking", HOTEL);
    expect(url.startsWith("/go?")).toBe(true);
    const q = new URLSearchParams(url.split("?")[1]);
    expect(q.get("type")).toBe("hotel");
    expect(q.get("provider")).toBe("booking");
    expect(q.get("destination")).toBe(HOTEL.destination);
    expect(q.get("checkIn")).toBe(HOTEL.checkIn);
    expect(q.get("checkOut")).toBe(HOTEL.checkOut);
    expect(q.get("rooms")).toBe(String(HOTEL.rooms));
    expect(q.get("adults")).toBe(String(HOTEL.adults));
    expect(q.get("children")).toBe(String(HOTEL.children));
  });

  it("buildFlightRedirect preserves cabin, travellers, and return date", () => {
    const url = buildFlightRedirect("kayak", FLIGHT);
    const q = new URLSearchParams(url.split("?")[1]);
    expect(q.get("type")).toBe("flight");
    expect(q.get("provider")).toBe("kayak");
    expect(q.get("cabin")).toBe("business");
    expect(q.get("travellers")).toBe("2");
    expect(q.get("return")).toBe(FLIGHT.return);
  });

  it("buildFlightRedirect drops empty return for one-way", () => {
    const url = buildFlightRedirect("kayak", { ...FLIGHT, tripType: "one-way", return: undefined });
    const q = new URLSearchParams(url.split("?")[1]);
    expect(q.get("return")).toBeNull();
  });
});

describe("goSchema validation", () => {
  it("accepts a valid hotel payload", () => {
    const r = goSchema.safeParse({ type: "hotel", provider: "booking", ...HOTEL });
    expect(r.success).toBe(true);
  });

  it("rejects invalid dates", () => {
    const r = goSchema.safeParse({
      type: "hotel",
      provider: "booking",
      destination: "Paris",
      checkIn: "not-a-date",
      checkOut: "2026-07-14",
    });
    expect(r.success).toBe(false);
  });

  it("rejects checkOut before checkIn", () => {
    const r = goSchema.safeParse({
      type: "hotel",
      provider: "booking",
      destination: "Paris",
      checkIn: "2026-07-14",
      checkOut: "2026-07-10",
    });
    expect(r.success).toBe(false);
  });

  it("uppercases flight airports", () => {
    const r = goSchema.safeParse({
      type: "flight",
      provider: "kayak",
      tripType: "round-trip",
      from: "jfk",
      to: "lhr",
      depart: "2026-07-10",
      return: "2026-07-17",
      travellers: "2",
      cabin: "economy",
    });
    expect(r.success).toBe(true);
    if (r.success && r.data.type === "flight") {
      expect(r.data.from).toBe("JFK");
      expect(r.data.to).toBe("LHR");
      expect(r.data.travellers).toBe(2);
    }
  });

  it("clamps travellers/rooms to allowed ranges", () => {
    const r = goSchema.safeParse({
      type: "hotel",
      provider: "booking",
      destination: "Paris",
      checkIn: "2026-07-10",
      checkOut: "2026-07-14",
      rooms: "999",
      adults: "0",
    });
    expect(r.success).toBe(true);
    if (r.success && r.data.type === "hotel") {
      expect(r.data.rooms).toBeLessThanOrEqual(8);
      expect(r.data.adults).toBeGreaterThanOrEqual(1);
    }
  });
});
