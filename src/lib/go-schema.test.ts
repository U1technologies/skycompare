import { describe, it, expect } from "vitest";
import { goSchema } from "./go-schema";

function firstError(input: Record<string, unknown>) {
  const parsed = goSchema.safeParse(input);
  if (parsed.success) return null;
  const issue = parsed.error.issues[0];
  return { path: issue.path.join("."), message: issue.message };
}

const validHotel = {
  type: "hotel",
  destination: "Paris",
  checkIn: "2026-08-01",
  checkOut: "2026-08-05",
  rooms: 1,
  adults: 2,
  children: 0,
};

const validOneWayFlight = {
  type: "flight",
  tripType: "one-way",
  from: "JFK",
  to: "LAX",
  depart: "2026-08-01",
  travellers: 1,
  cabin: "economy",
};

const validRoundTripFlight = {
  ...validOneWayFlight,
  tripType: "round-trip",
  return: "2026-08-10",
};

describe("goSchema — happy paths", () => {
  it("accepts a valid hotel search", () => {
    const parsed = goSchema.safeParse(validHotel);
    expect(parsed.success).toBe(true);
  });

  it("accepts a valid one-way flight search", () => {
    const parsed = goSchema.safeParse(validOneWayFlight);
    expect(parsed.success).toBe(true);
  });

  it("accepts a valid round-trip flight search", () => {
    const parsed = goSchema.safeParse(validRoundTripFlight);
    expect(parsed.success).toBe(true);
  });

  it("ignores unknown extra query params instead of failing", () => {
    const parsed = goSchema.safeParse({ ...validHotel, utm_source: "newsletter" });
    expect(parsed.success).toBe(true);
    expect(parsed.success && (parsed.data as { utm_source?: unknown }).utm_source).toBeUndefined();
  });

  it("trims whitespace from destination", () => {
    const parsed = goSchema.safeParse({ ...validHotel, destination: "  Paris  " });
    expect(parsed.success).toBe(true);
    expect(parsed.success && parsed.data.type === "hotel" && parsed.data.destination).toBe("Paris");
  });
});

describe("goSchema — missing required fields surface the specific error", () => {
  it("missing destination on a hotel search", () => {
    const { destination, ...rest } = validHotel;
    expect(firstError(rest)).toEqual({ path: "destination", message: "Required" });
  });

  it("missing From airport on a flight search", () => {
    const { from, ...rest } = validOneWayFlight;
    expect(firstError(rest)).toEqual({ path: "from", message: "Required" });
  });

  it("missing To airport on a flight search", () => {
    const { to, ...rest } = validOneWayFlight;
    expect(firstError(rest)).toEqual({ path: "to", message: "Required" });
  });

  it("missing checkIn on a hotel search", () => {
    const { checkIn, ...rest } = validHotel;
    expect(firstError(rest)).toEqual({ path: "checkIn", message: "Required" });
  });

  it("missing depart on a flight search", () => {
    const { depart, ...rest } = validOneWayFlight;
    expect(firstError(rest)).toEqual({ path: "depart", message: "Required" });
  });

  it("over-length destination", () => {
    const err = firstError({ ...validHotel, destination: "x".repeat(201) });
    expect(err?.path).toBe("destination");
  });
});

describe("goSchema — date validation", () => {
  it("rejects a non-YYYY-MM-DD date", () => {
    expect(firstError({ ...validHotel, checkIn: "08/01/2026" })).toEqual({
      path: "checkIn",
      message: "Date must be YYYY-MM-DD",
    });
  });

  it("rejects a day that overflows its month (Feb 30)", () => {
    expect(firstError({ ...validHotel, checkIn: "2026-02-30" })).toEqual({
      path: "checkIn",
      message: "Invalid calendar date",
    });
  });

  it("rejects a day that overflows its month (Apr 31)", () => {
    expect(firstError({ ...validHotel, checkIn: "2026-04-31" })).toEqual({
      path: "checkIn",
      message: "Invalid calendar date",
    });
  });

  it("rejects Feb 29 in a non-leap year", () => {
    expect(firstError({ ...validHotel, checkIn: "2026-02-29" })).toEqual({
      path: "checkIn",
      message: "Invalid calendar date",
    });
  });

  it("accepts Feb 29 in a leap year", () => {
    const parsed = goSchema.safeParse({
      ...validHotel,
      checkIn: "2028-02-29",
      checkOut: "2028-03-05",
    });
    expect(parsed.success).toBe(true);
  });

  it("rejects an out-of-range month", () => {
    expect(firstError({ ...validHotel, checkIn: "2026-13-01" })).toEqual({
      path: "checkIn",
      message: "Invalid calendar date",
    });
  });

  it("rejects checkOut equal to checkIn", () => {
    expect(firstError({ ...validHotel, checkIn: "2026-08-01", checkOut: "2026-08-01" })).toEqual({
      path: "checkOut",
      message: "Check-out must be after check-in",
    });
  });

  it("rejects checkOut before checkIn", () => {
    expect(firstError({ ...validHotel, checkIn: "2026-08-05", checkOut: "2026-08-01" })).toEqual({
      path: "checkOut",
      message: "Check-out must be after check-in",
    });
  });

  it("rejects a round-trip flight missing a return date", () => {
    const { return: _return, ...rest } = validRoundTripFlight;
    expect(firstError(rest)).toEqual({ path: "return", message: "Return must be after departure" });
  });

  it("rejects a round-trip flight with return before depart", () => {
    expect(
      firstError({ ...validRoundTripFlight, depart: "2026-08-10", return: "2026-08-01" }),
    ).toEqual({ path: "return", message: "Return must be after departure" });
  });

  it("allows a one-way flight even if a stray return date is present", () => {
    const parsed = goSchema.safeParse({
      ...validOneWayFlight,
      tripType: "one-way",
      return: "2026-01-01", // earlier than depart — irrelevant for one-way
    });
    expect(parsed.success).toBe(true);
  });
});

describe("goSchema — numeric clamping", () => {
  it("clamps rooms above the max down to 8", () => {
    const parsed = goSchema.safeParse({ ...validHotel, rooms: 999 });
    expect(parsed.success && parsed.data.type === "hotel" && parsed.data.rooms).toBe(8);
  });

  it("falls back to the default when a numeric field isn't a number", () => {
    const parsed = goSchema.safeParse({ ...validHotel, adults: "not-a-number" });
    expect(parsed.success && parsed.data.type === "hotel" && parsed.data.adults).toBe(2);
  });

  it("clamps a negative children count up to 0", () => {
    const parsed = goSchema.safeParse({ ...validHotel, children: -5 });
    expect(parsed.success && parsed.data.type === "hotel" && parsed.data.children).toBe(0);
  });
});

describe("goSchema — IATA extraction", () => {
  it("extracts a code from parentheses", () => {
    const parsed = goSchema.safeParse({ ...validOneWayFlight, from: "New York (JFK)" });
    expect(parsed.success && parsed.data.type === "flight" && parsed.data.from).toBe("JFK");
  });

  it("uppercases a bare 3-letter code", () => {
    const parsed = goSchema.safeParse({ ...validOneWayFlight, to: "lax" });
    expect(parsed.success && parsed.data.type === "flight" && parsed.data.to).toBe("LAX");
  });

  it("falls back to the uppercased full text for a city name with no code", () => {
    const parsed = goSchema.safeParse({ ...validOneWayFlight, to: "San Francisco" });
    expect(parsed.success && parsed.data.type === "flight" && parsed.data.to).toBe(
      "SAN FRANCISCO",
    );
  });
});

describe("goSchema — optional KAYAK place enrichment (placeId/lat/lon/entityKey)", () => {
  it("passes through valid enrichment fields instead of stripping them", () => {
    const parsed = goSchema.safeParse({
      ...validHotel,
      placeId: "15470",
      lat: "15.335556788612399",
      lon: "73.94661313133179",
      entityKey: "kplace:15470",
    });
    expect(parsed.success).toBe(true);
    if (parsed.success && parsed.data.type === "hotel") {
      expect(parsed.data.placeId).toBe(15470);
      expect(parsed.data.lat).toBeCloseTo(15.335556788612399);
      expect(parsed.data.lon).toBeCloseTo(73.94661313133179);
      expect(parsed.data.entityKey).toBe("kplace:15470");
    }
  });

  it("succeeds with enrichment fields entirely absent", () => {
    const parsed = goSchema.safeParse(validHotel);
    expect(parsed.success).toBe(true);
    if (parsed.success && parsed.data.type === "hotel") {
      expect(parsed.data.placeId).toBeUndefined();
      expect(parsed.data.entityKey).toBeUndefined();
    }
  });

  it("drops a malformed placeId instead of failing the whole search", () => {
    const parsed = goSchema.safeParse({ ...validHotel, placeId: "not-a-number" });
    expect(parsed.success).toBe(true);
    if (parsed.success && parsed.data.type === "hotel") {
      expect(parsed.data.placeId).toBeUndefined();
    }
  });
});

describe("goSchema — type discrimination", () => {
  it("rejects a payload with no type at all", () => {
    const { type: _type, ...rest } = validHotel;
    const parsed = goSchema.safeParse(rest);
    expect(parsed.success).toBe(false);
  });

  it("rejects an unrecognized type value", () => {
    const parsed = goSchema.safeParse({ ...validHotel, type: "cruise" });
    expect(parsed.success).toBe(false);
  });
});
