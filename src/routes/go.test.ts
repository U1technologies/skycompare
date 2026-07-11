/**
 * Integration tests for the /go redirect handler's link-builder.
 *
 * Simulates deep-link generation failures (unknown provider, invalid params)
 * and confirms the fallback partner and error messaging behave correctly.
 */
import { describe, it, expect } from "vitest";
import { buildTargetUrl } from "./go";
import { HOTEL_PROVIDERS, FLIGHT_PROVIDERS } from "@/lib/affiliates";

describe("/go buildTargetUrl", () => {
  const baseHotel = {
    type: "hotel",
    provider: "booking",
    destination: "Paris, France",
    checkIn: "2026-07-10",
    checkOut: "2026-07-14",
    rooms: "1",
    adults: "2",
    children: "0",
  };
  const baseFlight = {
    type: "flight",
    provider: "kayak",
    tripType: "round-trip",
    from: "JFK",
    to: "LHR",
    depart: "2026-07-10",
    return: "2026-07-17",
    travellers: "1",
    cabin: "economy",
  };

  it("builds a valid hotel deep-link and includes a fallback partner", () => {
    const r = buildTargetUrl(baseHotel);
    expect(r.ok).toBe(true);
    if (!r.ok) throw new Error("unreachable");
    expect(r.providerName).toBe("Booking.com");
    expect(r.url).toContain("booking.com");
    expect(r.url).toContain("Paris");
    expect(r.fallback).toBeDefined();
    expect(r.fallback!.providerName).not.toBe("Booking.com");
  });

  it("builds a valid flight deep-link preserving IATA codes and cabin", () => {
    const r = buildTargetUrl(baseFlight);
    expect(r.ok).toBe(true);
    if (!r.ok) throw new Error("unreachable");
    expect(r.url).toContain("JFK");
    expect(r.url.toLowerCase()).toContain("lhr");
    expect(r.url).toContain("economy");
  });

  it("falls back to the next working partner when the requested provider is unknown", () => {
    const r = buildTargetUrl({ ...baseHotel, provider: "does-not-exist" });
    expect(r.ok).toBe(true);
    if (!r.ok) throw new Error("unreachable");
    expect(r.usedFallback).toBeTruthy();
    expect(r.usedFallback!.originalProviderId).toBe("does-not-exist");
  });

  it("returns an error when required params are missing", () => {
    const { destination: _drop, ...missing } = baseHotel;
    void _drop;
    const r = buildTargetUrl(missing);
    expect(r.ok).toBe(false);
  });

  it("returns an error when check-out is before check-in", () => {
    const r = buildTargetUrl({
      ...baseHotel,
      checkIn: "2026-07-14",
      checkOut: "2026-07-10",
    });
    expect(r.ok).toBe(false);
  });

  it("returns an error when the From field is empty", () => {
    const r = buildTargetUrl({ ...baseFlight, from: "" });
    expect(r.ok).toBe(false);
  });

  it("each hotel provider builds a URL that mentions its own domain", () => {
    for (const p of HOTEL_PROVIDERS) {
      const r = buildTargetUrl({ ...baseHotel, provider: p.id });
      expect(r.ok, `provider ${p.id}`).toBe(true);
      if (!r.ok) continue;
      expect(r.url).toContain(p.domain);
    }
  });

  it("each flight provider builds a URL that mentions its own domain", () => {
    for (const p of FLIGHT_PROVIDERS) {
      const r = buildTargetUrl({ ...baseFlight, provider: p.id });
      expect(r.ok, `provider ${p.id}`).toBe(true);
      if (!r.ok) continue;
      expect(r.url).toContain(p.domain);
    }
  });
});
