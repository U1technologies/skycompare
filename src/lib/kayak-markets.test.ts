import { describe, it, expect } from "vitest";
import { resolveKayakMarket } from "./kayak-markets";

describe("resolveKayakMarket", () => {
  it("uses the detected country when there is no explicit override", () => {
    expect(resolveKayakMarket(undefined, "GB")).toEqual({ code: "gb", domain: "kayak.co.uk" });
  });

  it("prefers an explicit override over the detected country", () => {
    expect(resolveKayakMarket("fr", "GB")).toEqual({ code: "fr", domain: "kayak.fr" });
  });

  it("accepts friendly aliases in the explicit override", () => {
    expect(resolveKayakMarket("germany", undefined)).toEqual({ code: "de", domain: "kayak.de" });
  });

  it("is case-insensitive and tolerates whitespace", () => {
    expect(resolveKayakMarket(" India ", undefined)).toEqual({ code: "in", domain: "kayak.co.in" });
  });

  it("falls back to the us default when nothing resolves", () => {
    expect(resolveKayakMarket(undefined, undefined)).toEqual({ code: "us", domain: "www.kayak.com" });
  });

  it("falls back to the us default for an unrecognized override or country", () => {
    expect(resolveKayakMarket("not-a-real-market", "ZZ")).toEqual({ code: "us", domain: "www.kayak.com" });
  });

  it("falls back to the detected country when the override is unrecognized", () => {
    expect(resolveKayakMarket("not-a-real-market", "JP")).toEqual({ code: "jp", domain: "kayak.co.jp" });
  });
});
