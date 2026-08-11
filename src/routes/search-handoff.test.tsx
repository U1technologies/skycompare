/**
 * The Search button is the whole point of the KAYAK handoff being fast, so its
 * shape is pinned down here. If someone turns it back into a scripted
 * navigation, or drops the pre-built href, the click starts costing a server
 * round-trip again and these tests fail rather than the slowdown going
 * unnoticed.
 */
import { describe, it, expect } from "vitest";
import { render, screen, fireEvent } from "@testing-library/react";
import { SearchBox } from "@/routes/index";
import { Toaster } from "@/components/ui/sonner";
import { KayakLinkProvider } from "@/lib/kayak-link-context";
import type { KayakLinkContext } from "@/lib/affiliates";

const IN_MARKET: KayakLinkContext = { domain: "kayak.co.in", deeplinkCode: "kan_test_code" };

const HOTEL_SEARCH = {
  type: "hotel",
  destination: "Goa",
  checkIn: "2026-09-01",
  checkOut: "2026-09-03",
  rooms: "1",
  adults: "2",
  children: "0",
};

function renderSearchBox(
  initial: Record<string, string>,
  linkContext: KayakLinkContext | undefined = IN_MARKET,
) {
  return render(
    <KayakLinkProvider value={linkContext}>
      <Toaster />
      <SearchBox initialSearch={initial} />
    </KayakLinkProvider>,
  );
}

/** The Search control, whether it rendered as a link or as a button. */
function searchControl() {
  return screen.getByTestId("search-submit");
}

describe("Search hands off to KAYAK with no round-trip of ours", () => {
  it("is a link straight to KAYAK, so the browser navigates on its own", () => {
    renderSearchBox(HOTEL_SEARCH);

    const link = searchControl();
    expect(link.tagName).toBe("A");

    const href = link.getAttribute("href")!;
    expect(href.startsWith("https://kayak.co.in/in?")).toBe(true);
    expect(new URL(href).searchParams.get("a")).toBe("kan_test_code");
    expect(new URL(href).searchParams.get("url")).toBe("/hotels/goa/2026-09-01/2026-09-03/2adults");
  });

  it("leaves this tab for KAYAK instead of opening a second one", () => {
    renderSearchBox(HOTEL_SEARCH);

    expect(searchControl()).not.toHaveAttribute("target");
  });

  it("shows a spinner in the button while KAYAK is answering", async () => {
    renderSearchBox(HOTEL_SEARCH);

    const control = searchControl();
    expect(control.textContent).toContain("Search");

    fireEvent.click(control);
    // KAYAK needs ~1.4 s to send its first byte, during which the browser still
    // shows this page. Without this the click looks like nothing happened.
    expect(await screen.findByText("Searching")).toBeInTheDocument();
  });

  it("does not strand a spinner when the click opens KAYAK elsewhere", async () => {
    renderSearchBox(HOTEL_SEARCH);

    fireEvent.click(searchControl(), { metaKey: true });
    expect(screen.queryByText("Searching")).not.toBeInTheDocument();
  });

  it("marks the outbound link as the paid affiliate link Google requires", () => {
    renderSearchBox(HOTEL_SEARCH);

    const rel = searchControl().getAttribute("rel") ?? "";
    expect(rel).toContain("sponsored");
    expect(rel).toContain("nofollow");
    // The referrer stays: KAYAK reports on traffic source.
    expect(rel).not.toContain("noreferrer");
  });

  it("sends the visitor to their own market's KAYAK domain", () => {
    renderSearchBox(HOTEL_SEARCH, { domain: "kayak.co.uk", deeplinkCode: "kan_test_code" });

    expect(searchControl().getAttribute("href")!).toContain("https://kayak.co.uk/in?");
  });

  it("falls back to the /go redirect when the link context never arrived", () => {
    // Rendered without the provider on purpose, so the context really is
    // missing. Passing `undefined` to renderSearchBox would hit its default.
    render(<SearchBox initialSearch={HOTEL_SEARCH} />);

    const href = searchControl().getAttribute("href")!;
    expect(href.startsWith("/go?")).toBe(true);
    expect(new URLSearchParams(href.slice(4)).get("destination")).toBe("Goa");
  });

  it("stays a button with no href while the search is incomplete", () => {
    renderSearchBox({ type: "hotel" }); // no destination

    const control = searchControl();
    expect(control.tagName).toBe("BUTTON");
    expect(control).not.toHaveAttribute("href");
  });

  it("explains what is missing instead of opening a broken KAYAK search", async () => {
    renderSearchBox({ type: "hotel" });

    fireEvent.click(searchControl());
    expect(await screen.findByText("Please enter a destination")).toBeInTheDocument();
  });

  it("builds the flight link from both legs, travellers and cabin", () => {
    renderSearchBox({
      type: "flight",
      tripType: "round-trip",
      from: "DEL",
      to: "LHR",
      depart: "2026-09-01",
      return: "2026-09-10",
      travellers: "2",
      cabin: "business",
    });

    const href = searchControl().getAttribute("href")!;
    expect(new URL(href).searchParams.get("url")).toBe(
      "/flights/DEL-LHR/2026-09-01/2026-09-10/2adults?sort=bestflight_a&fs=cfc=business",
    );
  });

  it("requires both airports before it will hand off a flight search", async () => {
    renderSearchBox({ type: "flight", from: "DEL" }); // no destination airport

    const control = searchControl();
    expect(control.tagName).toBe("BUTTON");
    fireEvent.click(control);
    expect(await screen.findByText("Enter both From and To airports")).toBeInTheDocument();
  });
});
