/**
 * Zod schemas for the /go redirect handler.
 *
 * All /go query params flow through these schemas so we get:
 *  - guaranteed types before building affiliate deep-links
 *  - safe encoding (numbers are actually numbers, dates match ISO shape)
 */

import { z } from "zod";

// `new Date("2026-02-30")` doesn't throw or return NaN — it silently rolls
// over to 2026-03-02, and native Date parsing rejects an out-of-range month
// (13) but not an out-of-range day (30 in February). Round-tripping through
// Date.UTC and comparing the components back catches both.
const isoDate = z
  .string()
  .regex(/^\d{4}-\d{2}-\d{2}$/, "Date must be YYYY-MM-DD")
  .refine((v) => {
    const [y, m, d] = v.split("-").map(Number);
    const date = new Date(Date.UTC(y, m - 1, d));
    return date.getUTCFullYear() === y && date.getUTCMonth() === m - 1 && date.getUTCDate() === d;
  }, "Invalid calendar date");

const intFromString = (min: number, max: number, fallback: number) =>
  z
    .union([z.string(), z.number()])
    .optional()
    .transform((v) => {
      const n = typeof v === "number" ? v : Number.parseInt(String(v ?? ""), 10);
      if (!Number.isFinite(n)) return fallback;
      return Math.min(max, Math.max(min, n));
    });

// Optional KAYAK place enrichment from the Autocomplete API — unlike
// rooms/adults/etc. there's no sensible fallback for a malformed value, so
// this just drops it rather than clamping to a default.
const optionalNumber = z
  .union([z.string(), z.number()])
  .optional()
  .transform((v) => {
    if (v === undefined || v === "") return undefined;
    const n = typeof v === "number" ? v : Number(v);
    return Number.isFinite(n) ? n : undefined;
  });

export const hotelGoSchema = z.object({
  type: z.literal("hotel"),
  destination: z.string().trim().min(1, "Missing destination").max(200),
  checkIn: isoDate,
  checkOut: isoDate,
  rooms: intFromString(1, 8, 1),
  adults: intFromString(1, 16, 2),
  children: intFromString(0, 8, 0),
  placeId: optionalNumber,
  lat: optionalNumber,
  lon: optionalNumber,
  entityKey: z.string().trim().max(100).optional(),
});

// Extract a 3-letter IATA code from free-form input like "New York (JFK)",
// "jfk", or "JFK - John F Kennedy". Falls back to the trimmed uppercase text
// so city-name searches still work.
const toIata = (raw: string): string => {
  const v = raw.trim();
  if (!v) return v;
  const paren = v.match(/\(([A-Za-z]{3})\)/);
  if (paren) return paren[1].toUpperCase();
  const bare = v.match(/\b([A-Za-z]{3})\b/);
  if (bare && v.length <= 6) return bare[1].toUpperCase();
  return v.toUpperCase();
};

export const flightGoSchema = z.object({
  type: z.literal("flight"),
  tripType: z.enum(["one-way", "round-trip"]).default("round-trip"),
  from: z.string().trim().min(1, "Missing From airport").max(100).transform(toIata),
  to: z.string().trim().min(1, "Missing To airport").max(100).transform(toIata),
  depart: isoDate,
  return: isoDate.optional().or(z.literal("").transform(() => undefined)),
  travellers: intFromString(1, 9, 1),
  cabin: z.enum(["economy", "premium", "business", "first"]).default("economy"),
});

// A plain z.union tries both branches on every input; when a "hotel" payload
// fails hotel validation it also gets tried (and fails) against flightGoSchema,
// collapsing everything into one generic "invalid_union" issue and discarding
// the specific per-field messages below. discriminatedUnion picks the branch
// by `type` first, so the real field error survives. Cross-field checks can't
// live inside a discriminatedUnion branch (it rejects .refine()-wrapped
// schemas), so they're applied afterwards via superRefine instead.
export const goSchema = z
  .discriminatedUnion("type", [hotelGoSchema, flightGoSchema])
  .superRefine((s, ctx) => {
    if (s.type === "hotel") {
      if (new Date(s.checkOut) <= new Date(s.checkIn)) {
        ctx.addIssue({
          code: z.ZodIssueCode.custom,
          message: "Check-out must be after check-in",
          path: ["checkOut"],
        });
      }
      return;
    }
    if (s.tripType === "round-trip" && !(s.return && new Date(s.return) > new Date(s.depart))) {
      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        message: "Return must be after departure",
        path: ["return"],
      });
    }
  });

export type HotelGo = z.infer<typeof hotelGoSchema>;
export type FlightGo = z.infer<typeof flightGoSchema>;
export type GoParams = z.infer<typeof goSchema>;
