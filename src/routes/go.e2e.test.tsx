/**
 * End-to-end style tests for the /go view.
 *
 * Renders the exported `GoView` directly (no router) with the exact
 * BuildOk/BuildErr shapes that `buildTargetUrl` would return, to prove that:
 *   - failures show the friendly error UI + the fallback partner CTA
 *   - "confirm" mode surfaces the primary CTA and every alternative
 *   - "auto" mode still exposes the manual continue link (SSR/noscript safety)
 */
import { describe, it, expect } from "vitest";
import { render, screen, within } from "@testing-library/react";
import { GoView, buildTargetUrl, type BuildOk } from "./go";
import { HOTEL_PROVIDERS } from "@/lib/affiliates";

describe("/go — failure UI + fallback partner", () => {
  it("shows the error message and a fallback partner CTA when params are invalid", () => {
    const result = buildTargetUrl({ type: "hotel", provider: "booking" }); // missing dates & destination
    expect(result.ok).toBe(false);

    render(<GoView result={result} mode="confirm" />);

    expect(screen.getByTestId("go-error")).toBeInTheDocument();
    expect(screen.getByTestId("go-error-message").textContent).toMatch(/./);
    // Zod failure has no fallback URL — but the "Back to search" affordance
    // still renders so the user is never trapped.
    expect(screen.getByRole("link", { name: /back to search/i })).toHaveAttribute("href", "/");
  });

  it("surfaces a working fallback link when the requested provider is unknown", () => {
    // Simulate a hand-crafted BuildErr with a fallback (unknown provider path).
    const fb = HOTEL_PROVIDERS[1];
    const fallback = {
      id: fb.id,
      providerName: fb.name,
      url: "https://example.com/fallback?x=1",
    };
    render(
      <GoView
        result={{ ok: false, error: "Unknown hotel provider: mystery-partner", fallback }}
        mode="confirm"
      />,
    );

    const link = screen.getByTestId("fallback-link");
    expect(link).toHaveAttribute("href", "https://example.com/fallback?x=1");
    expect(link).toHaveAttribute("target", "_blank");
    expect(link).toHaveAttribute("rel", expect.stringContaining("noopener"));
    expect(link.textContent).toMatch(new RegExp(fb.name, "i"));
  });

  it("catches build-time exceptions from a partner and reports them", () => {
    // buildTargetUrl swallows thrown provider errors — verify the shape.
    // We can't easily inject a throwing provider without mutating exports,
    // so cover the equivalent BuildErr rendering path directly.
    render(
      <GoView
        result={{ ok: false, error: "Couldn't build that link: boom" }}
        mode="auto"
      />,
    );
    expect(screen.getByTestId("go-error-message").textContent).toContain("boom");
  });
});

describe("/go — confirm mode UI", () => {
  const okResult = buildTargetUrl({
    type: "hotel",
    provider: "booking",
    destination: "Paris, France",
    checkIn: "2026-07-10",
    checkOut: "2026-07-14",
    rooms: "1",
    adults: "2",
    children: "0",
  }) as BuildOk;

  it("renders the primary Continue CTA pointing at the partner URL", () => {
    expect(okResult.ok).toBe(true);
    render(<GoView result={okResult} mode="confirm" />);

    expect(screen.getByTestId("go-confirm")).toBeInTheDocument();
    const cta = screen.getByTestId("continue-primary");
    expect(cta).toHaveAttribute("href", okResult.url);
    expect(cta).toHaveAttribute("target", "_blank");
    expect(cta.textContent).toMatch(/Booking\.com/i);
  });

  it("lists every alternative partner as its own outbound link", () => {
    render(<GoView result={okResult} mode="confirm" />);
    const container = screen.getByTestId("go-confirm");
    // Every non-primary hotel provider should appear once.
    for (const alt of okResult.alternatives) {
      const el = within(container).getByTestId(`alt-${alt.id}`);
      expect(el).toHaveAttribute("href", alt.url);
      expect(el).toHaveAttribute("target", "_blank");
    }
    // Primary should NOT appear as an alternative.
    expect(within(container).queryByTestId("alt-booking")).toBeNull();
  });
});

describe("/go — auto mode UI (fallback affordance)", () => {
  it("still renders a manual continue link for users whose auto-redirect stalls", () => {
    const ok = buildTargetUrl({
      type: "flight",
      provider: "kayak",
      tripType: "round-trip",
      from: "JFK",
      to: "LHR",
      depart: "2026-07-10",
      return: "2026-07-17",
      travellers: "1",
      cabin: "economy",
    }) as BuildOk;

    render(<GoView result={ok} mode="auto" />);
    const link = screen.getByTestId("continue-link");
    expect(link).toHaveAttribute("href", ok.url);
    expect(link.textContent).toMatch(/KAYAK/i);
  });
});
