/**
 * Zod schemas for the /go redirect handler.
 *
 * All /go query params flow through these schemas so we get:
 *  - guaranteed types before building affiliate deep-links
 *  - safe encoding (numbers are actually numbers, dates match ISO shape)
 *  - a single source of truth reused by unit tests
 */

import { z } from "zod";

const isoDate = z
  .string()
  .regex(/^\d{4}-\d{2}-\d{2}$/, "Date must be YYYY-MM-DD")
  .refine((v) => !Number.isNaN(new Date(v).getTime()), "Invalid calendar date");

const intFromString = (min: number, max: number, fallback: number) =>
  z
    .union([z.string(), z.number()])
    .optional()
    .transform((v) => {
      const n = typeof v === "number" ? v : Number.parseInt(String(v ?? ""), 10);
      if (!Number.isFinite(n)) return fallback;
      return Math.min(max, Math.max(min, n));
    });

export const hotelGoSchema = z
  .object({
    type: z.literal("hotel"),
    provider: z.string().min(1, "Missing provider"),
    destination: z.string().trim().min(1, "Missing destination").max(200),
    checkIn: isoDate,
    checkOut: isoDate,
    rooms: intFromString(1, 8, 1),
    adults: intFromString(1, 16, 2),
    children: intFromString(0, 8, 0),
  })
  .refine((s) => new Date(s.checkOut) > new Date(s.checkIn), {
    message: "Check-out must be after check-in",
    path: ["checkOut"],
  });

// Extract a 3-letter IATA code from free-form input like "New York (JFK)",
// "jfk", or "JFK - John F Kennedy". Falls back to the trimmed uppercase text
// so partners that accept city names (Expedia/KAYAK city search) still work.
const toIata = (raw: string): string => {
  const v = raw.trim();
  if (!v) return v;
  const paren = v.match(/\(([A-Za-z]{3})\)/);
  if (paren) return paren[1].toUpperCase();
  const bare = v.match(/\b([A-Za-z]{3})\b/);
  if (bare && v.length <= 6) return bare[1].toUpperCase();
  return v.toUpperCase();
};

export const flightGoSchema = z
  .object({
    type: z.literal("flight"),
    provider: z.string().min(1, "Missing provider"),
    tripType: z.enum(["one-way", "round-trip"]).default("round-trip"),
    from: z.string().trim().min(1, "Missing From airport").max(100).transform(toIata),
    to: z.string().trim().min(1, "Missing To airport").max(100).transform(toIata),
    depart: isoDate,
    return: isoDate.optional().or(z.literal("").transform(() => undefined)),
    travellers: intFromString(1, 9, 1),
    cabin: z.enum(["economy", "premium", "business", "first"]).default("economy"),
  })
  .refine((s) => s.tripType === "one-way" || (!!s.return && new Date(s.return) > new Date(s.depart)), {
    message: "Return must be after departure",
    path: ["return"],
  });


export const goSchema = z.union([hotelGoSchema, flightGoSchema]);

export type HotelGo = z.infer<typeof hotelGoSchema>;
export type FlightGo = z.infer<typeof flightGoSchema>;
export type GoParams = z.infer<typeof goSchema>;
