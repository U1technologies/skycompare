/**
 * KAYAK-only affiliate deep links.
 *
 * We deliberately keep a single partner (KAYAK) so every search on the site
 * lands on kayak.com with the same params the user filled in (destination,
 * dates, travellers, rooms, cabin class). The KAYAK Partner Network
 * tracking id (`a1aid`) is appended server-side from process.env.KAYAK_API_KEY
 * — see src/lib/kayak.functions.ts.
 */

export type HotelSearch = {
  destination: string;
  checkIn: string; // yyyy-mm-dd
  checkOut: string;
  rooms: number;
  adults: number;
  children: number;
};

export type FlightSearch = {
  tripType: "one-way" | "round-trip";
  from: string;
  to: string;
  depart: string;
  return?: string;
  travellers: number;
  cabin: "economy" | "premium" | "business" | "first";
};

const enc = encodeURIComponent;

const slug = (s: string) =>
  s
    .normalize("NFKD")
    .replace(/[\u0300-\u036f]/g, "")
    .replace(/[^a-zA-Z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "")
    .toLowerCase();

/** KAYAK hotel deep link (no partner id — that's appended server-side). */
export function buildKayakHotelUrl(s: HotelSearch): string {
  const place = slug(s.destination) || "anywhere";
  const guests = `${s.adults}adults${s.children > 0 ? `-${s.children}children` : ""}`;
  const rooms = s.rooms > 1 ? `?rooms=${s.rooms}` : "";
  return `https://www.kayak.com/hotels/${place}/${s.checkIn}/${s.checkOut}/${guests}${rooms}`;
}

/** KAYAK flight deep link. Cabin class passed via `fs=cfc=<class>`. */
export function buildKayakFlightUrl(s: FlightSearch): string {
  const from = enc(s.from.toUpperCase());
  const to = enc(s.to.toUpperCase());
  const legs =
    s.tripType === "round-trip" && s.return
      ? `${from}-${to}/${s.depart}/${s.return}`
      : `${from}-${to}/${s.depart}`;
  return `https://www.kayak.com/flights/${legs}/${s.travellers}adults?sort=bestflight_a&fs=cfc=${s.cabin}`;
}

/**
 * Build a URL to our internal /go redirect handler, preserving every search
 * parameter as safely-encoded query string values. The /go route re-validates
 * the params server-side and appends the KAYAK partner id before redirecting.
 */
function toQuery(obj: Record<string, string | number | undefined>) {
  const p = new URLSearchParams();
  for (const [k, v] of Object.entries(obj)) {
    if (v === undefined || v === null || v === "") continue;
    p.set(k, String(v));
  }
  return p.toString();
}

export function buildHotelRedirect(s: HotelSearch) {
  return `/go?${toQuery({ type: "hotel", ...s })}`;
}

export function buildFlightRedirect(s: FlightSearch) {
  return `/go?${toQuery({ type: "flight", ...s })}`;
}

export function openRedirect(url: string) {
  if (typeof window !== "undefined") window.location.assign(url);
}
