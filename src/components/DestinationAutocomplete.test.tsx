import { describe, it, expect, vi, beforeEach } from "vitest";
import { render, screen, fireEvent, waitFor } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { useState } from "react";
import { DestinationAutocomplete } from "./DestinationAutocomplete";
import { buildHotelRedirect, buildFlightRedirect } from "@/lib/affiliates";

// jsdom lacks geolocation — force fallback to "popular" defaults.
beforeEach(() => {
  Object.defineProperty(global.navigator, "geolocation", {
    configurable: true,
    value: undefined,
  });
});

function Harness({
  initial = "",
  kinds,
  autoUpper,
  onValue,
}: {
  initial?: string;
  kinds?: ("city" | "airport" | "hotel")[];
  autoUpper?: boolean;
  onValue?: (v: string) => void;
}) {
  const [v, setV] = useState(initial);
  return (
    <DestinationAutocomplete
      value={v}
      onChange={(nv) => {
        setV(nv);
        onValue?.(nv);
      }}
      kinds={kinds}
      autoUpper={autoUpper}
      debounceMs={0}
    />
  );
}

describe("DestinationAutocomplete — suggestion formatting", () => {
  it("formats a city suggestion with 'City, Country' label", async () => {
    const user = userEvent.setup();
    const spy = vi.fn();
    render(<Harness kinds={["city"]} onValue={spy} />);

    const input = screen.getByRole("combobox");
    await user.type(input, "paris");

    const opt = await screen.findByTestId("suggestion-c-par");
    expect(opt.textContent).toContain("Paris");
    expect(opt.textContent).toContain("city");

    fireEvent.click(opt);
    expect(spy).toHaveBeenLastCalledWith("Paris, France");
  });

  it("formats an airport suggestion with IATA code and returns IATA when autoUpper is on", async () => {
    const user = userEvent.setup();
    const spy = vi.fn();
    render(<Harness kinds={["airport"]} autoUpper onValue={spy} />);

    const input = screen.getByRole("combobox");
    await user.type(input, "jfk");

    const opt = await screen.findByTestId("suggestion-a-jfk");
    expect(opt.textContent).toContain("(JFK)");
    expect(opt.textContent).toContain("airport");

    fireEvent.click(opt);
    // autoUpper on airports should send the IATA code, not the full label
    expect(spy).toHaveBeenLastCalledWith("JFK");
  });

  it("formats a hotel suggestion with property + city label", async () => {
    const user = userEvent.setup();
    const spy = vi.fn();
    render(<Harness kinds={["hotel"]} onValue={spy} />);

    const input = screen.getByRole("combobox");
    await user.type(input, "atlantis");

    const opt = await screen.findByTestId("suggestion-h-atl");
    expect(opt.textContent).toContain("Atlantis The Palm");
    expect(opt.textContent).toContain("hotel");

    fireEvent.click(opt);
    expect(spy).toHaveBeenLastCalledWith("Atlantis The Palm, Dubai");
  });

  it("shows popular defaults on focus when no query is entered", async () => {
    render(<Harness />);
    const input = screen.getByRole("combobox");
    fireEvent.focus(input);
    await waitFor(() => {
      expect(screen.getByRole("listbox")).toBeInTheDocument();
    });
    // popular list includes Paris
    expect(screen.getByTestId("suggestion-c-par")).toBeInTheDocument();
  });
});

describe("Autocomplete → /go deep-link preserves destination codes", () => {
  it("hotel: selected city label survives verbatim into the /go URL", async () => {
    const user = userEvent.setup();
    render(<Harness kinds={["city"]} />);
    const input = screen.getByRole("combobox");
    await user.type(input, "tokyo");
    fireEvent.click(await screen.findByTestId("suggestion-c-tok"));

    const url = buildHotelRedirect("booking", {
      destination: (input as HTMLInputElement).value,
      checkIn: "2026-07-10",
      checkOut: "2026-07-14",
      rooms: 1,
      adults: 2,
      children: 0,
    });

    const params = new URLSearchParams(url.split("?")[1]);
    expect(params.get("destination")).toBe("Tokyo, Japan");
    expect(params.get("provider")).toBe("booking");
    expect(params.get("type")).toBe("hotel");
  });

  it("flight: selected airport's IATA code lands in from/to of the /go URL", async () => {
    const user = userEvent.setup();
    render(<Harness kinds={["airport"]} autoUpper />);
    const input = screen.getByRole("combobox");
    await user.type(input, "lhr");
    fireEvent.click(await screen.findByTestId("suggestion-a-lhr"));

    const url = buildFlightRedirect("kayak", {
      tripType: "round-trip",
      from: (input as HTMLInputElement).value,
      to: "JFK",
      depart: "2026-07-10",
      return: "2026-07-17",
      travellers: 1,
      cabin: "economy",
    });

    const params = new URLSearchParams(url.split("?")[1]);
    expect(params.get("from")).toBe("LHR");
    expect(params.get("to")).toBe("JFK");
    expect(params.get("cabin")).toBe("economy");
  });
});
