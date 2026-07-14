import { describe, it, expect } from "vitest";
import { buildKayakHotelUrl, buildKayakFlightUrl } from "./affiliates";

describe("buildKayakHotelUrl", () => {
  const base = {
    destination: "Goa",
    checkIn: "2026-07-21",
    checkOut: "2026-07-23",
    rooms: 1,
    adults: 2,
    children: 0,
  };

  it("builds a bare slug path when no Autocomplete enrichment is present", () => {
    expect(buildKayakHotelUrl(base)).toBe("/hotels/goa/2026-07-21/2026-07-23/2adults");
  });

  it("appends placeId, latitude, longitude and entityKey when present", () => {
    const url = buildKayakHotelUrl({
      ...base,
      placeId: 15470,
      lat: 15.335556788612399,
      lon: 73.94661313133179,
      entityKey: "kplace:15470",
    });

    expect(url).toBe(
      "/hotels/goa/2026-07-21/2026-07-23/2adults" +
        "?placeId=15470&latitude=15.335556788612399&longitude=73.94661313133179&entityKey=kplace%3A15470",
    );
  });

  it("combines rooms and enrichment params in one query string", () => {
    const url = buildKayakHotelUrl({ ...base, rooms: 3, placeId: 15470, entityKey: "kplace:15470" });
    const [path, qs] = url.split("?");
    const params = new URLSearchParams(qs);

    expect(path).toBe("/hotels/goa/2026-07-21/2026-07-23/2adults");
    expect(params.get("rooms")).toBe("3");
    expect(params.get("placeId")).toBe("15470");
    expect(params.get("entityKey")).toBe("kplace:15470");
  });

  it("omits an enrichment field that wasn't provided, without breaking the others", () => {
    const url = buildKayakHotelUrl({ ...base, lat: 15.3, lon: 73.9 });
    const params = new URLSearchParams(url.split("?")[1]);
    expect(params.get("latitude")).toBe("15.3");
    expect(params.get("longitude")).toBe("73.9");
    expect(params.has("placeId")).toBe(false);
    expect(params.has("entityKey")).toBe(false);
  });
});

describe("buildKayakFlightUrl", () => {
  it("builds a one-way path", () => {
    const url = buildKayakFlightUrl({
      tripType: "one-way",
      from: "JFK",
      to: "LAX",
      depart: "2026-08-01",
      travellers: 1,
      cabin: "economy",
    });
    expect(url).toBe("/flights/JFK-LAX/2026-08-01/1adults?sort=bestflight_a&fs=cfc=economy");
  });

  it("builds a round-trip path with both dates", () => {
    const url = buildKayakFlightUrl({
      tripType: "round-trip",
      from: "JFK",
      to: "LAX",
      depart: "2026-08-01",
      return: "2026-08-10",
      travellers: 2,
      cabin: "business",
    });
    expect(url).toBe("/flights/JFK-LAX/2026-08-01/2026-08-10/2adults?sort=bestflight_a&fs=cfc=business");
  });
});
