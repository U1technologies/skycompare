import { describe, it, expect } from "vitest";
import { resolveKayakMarket, KAYAK_DOMAINS } from "./kayak-markets";

describe("resolveKayakMarket", () => {
  it("uses the detected country when there is no explicit override", () => {
    expect(resolveKayakMarket(undefined, "GB")).toEqual({ code: "gb", domain: "www.kayak.co.uk" });
  });

  it("prefers an explicit override over the detected country", () => {
    expect(resolveKayakMarket("fr", "GB")).toEqual({ code: "fr", domain: "www.kayak.fr" });
  });

  it("accepts friendly aliases in the explicit override", () => {
    expect(resolveKayakMarket("germany", undefined)).toEqual({
      code: "de",
      domain: "www.kayak.de",
    });
  });

  it("is case-insensitive and tolerates whitespace", () => {
    expect(resolveKayakMarket(" India ", undefined)).toEqual({
      code: "in",
      domain: "www.kayak.co.in",
    });
  });

  it("falls back to the us default when nothing resolves", () => {
    expect(resolveKayakMarket(undefined, undefined)).toEqual({
      code: "us",
      domain: "www.kayak.com",
    });
  });

  it("falls back to the us default for an unrecognized override or country", () => {
    expect(resolveKayakMarket("not-a-real-market", "ZZ")).toEqual({
      code: "us",
      domain: "www.kayak.com",
    });
  });

  it("falls back to the detected country when the override is unrecognized", () => {
    expect(resolveKayakMarket("not-a-real-market", "JP")).toEqual({
      code: "jp",
      domain: "www.kayak.co.jp",
    });
  });
});

/**
 * Every hostname in the map was verified against KAYAK: the bare forms answer
 * with a 301 to their www version, which costs the visitor a whole extra round
 * trip to KAYAK before their results page starts loading. These tests fail if
 * someone "tidies" a www away, so no market can quietly get slower again.
 */
describe("every market points at a canonical KAYAK host", () => {
  /** Verified exceptions: not bare, and not a www redirect. */
  const CANONICAL_WITHOUT_WWW = new Set(["cn.kayak.com"]);

  it("has no bare kayak.* hostname left", () => {
    const bare = Object.entries(KAYAK_DOMAINS)
      .filter(([, domain]) => /^kayak\./.test(domain))
      .map(([market, domain]) => `${market} -> ${domain}`);

    expect(bare).toEqual([]);
  });

  it("starts every hostname with www., apart from the verified exceptions", () => {
    const offenders = Object.entries(KAYAK_DOMAINS)
      .filter(([, domain]) => !domain.startsWith("www.") && !CANONICAL_WITHOUT_WWW.has(domain))
      .map(([market, domain]) => `${market} -> ${domain}`);

    expect(offenders).toEqual([]);
  });

  it("resolves every market to a usable https host", () => {
    for (const [market, domain] of Object.entries(KAYAK_DOMAINS)) {
      expect(resolveKayakMarket(market, undefined).domain, market).toBe(domain);
      expect(() => new URL(`https://${domain}/hotels/goa`), market).not.toThrow();
    }
  });
});
