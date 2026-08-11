import { describe, it, expect, beforeEach, afterEach } from "vitest";
import { buildKayakUrl } from "./kayak-redirect";

describe("buildKayakUrl", () => {
  const hotel = {
    type: "hotel",
    destination: "Goa",
    checkIn: "2026-07-21",
    checkOut: "2026-07-23",
    rooms: "1",
    adults: "2",
    children: "0",
  };

  const originalCode = process.env.KAYAK_DEEPLINK_CODE;

  beforeEach(() => {
    process.env.KAYAK_DEEPLINK_CODE = "kan_test_code";
  });

  afterEach(() => {
    if (originalCode === undefined) delete process.env.KAYAK_DEEPLINK_CODE;
    else process.env.KAYAK_DEEPLINK_CODE = originalCode;
  });

  it("wraps the KAYAK path in the tracked /in redirect using the deeplink code", () => {
    const result = buildKayakUrl(hotel);

    expect(result.ok).toBe(true);
    if (!result.ok) return;

    const url = new URL(result.url);
    expect(url.host).toBe("www.kayak.com");
    expect(url.pathname).toBe("/in");
    expect(url.searchParams.get("a")).toBe("kan_test_code");
    expect(url.searchParams.get("lc")).toBe("en");
    expect(url.searchParams.get("url")).toBe("/hotels/goa/2026-07-21/2026-07-23/2adults");
    expect(result.type).toBe("hotel");
  });

  it("sends the visitor to the domain for their detected country", () => {
    const result = buildKayakUrl(hotel, "IN");

    expect(result.ok).toBe(true);
    if (!result.ok) return;
    expect(new URL(result.url).host).toBe("www.kayak.co.in");
  });

  it("prefers an explicit market param over the detected country", () => {
    const result = buildKayakUrl({ ...hotel, market: "uk" }, "IN");

    expect(result.ok).toBe(true);
    if (!result.ok) return;
    expect(new URL(result.url).host).toBe("www.kayak.co.uk");
  });

  it("falls back to an untracked KAYAK link when no deeplink code is configured", () => {
    delete process.env.KAYAK_DEEPLINK_CODE;
    const result = buildKayakUrl(hotel);

    expect(result.ok).toBe(true);
    if (!result.ok) return;
    expect(result.url).toBe("https://www.kayak.com/hotels/goa/2026-07-21/2026-07-23/2adults");
  });

  it("builds a flight deep link with cabin class and both legs", () => {
    const result = buildKayakUrl({
      type: "flight",
      tripType: "round-trip",
      from: "DEL",
      to: "BOM",
      depart: "2026-09-01",
      return: "2026-09-08",
      travellers: "2",
      cabin: "business",
    });

    expect(result.ok).toBe(true);
    if (!result.ok) return;
    expect(new URL(result.url).searchParams.get("url")).toBe(
      "/flights/DEL-BOM/2026-09-01/2026-09-08/2adults?sort=bestflight_a&fs=cfc=business",
    );
  });

  it("reports the offending field when validation fails, so /go can render the error card", () => {
    const result = buildKayakUrl({ ...hotel, checkOut: "2026-07-20" });

    expect(result.ok).toBe(false);
    if (result.ok) return;
    expect(result.paramPath).toBe("checkOut");
    expect(result.error).toContain("Check-out must be after check-in");
  });

  it("rejects a request with no type instead of guessing hotel or flight", () => {
    const result = buildKayakUrl({ destination: "Goa" });

    expect(result.ok).toBe(false);
  });
});
