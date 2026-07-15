/**
 * KAYAK-only affiliate deep links.
 *
 * We deliberately keep a single partner (KAYAK) so every search on the site
 * lands on kayak.com with the same params the user filled in (destination,
 * dates, travellers, rooms, cabin class).
 *
 * buildKayakHotelUrl/buildKayakFlightUrl return a *relative* KAYAK path
 * (e.g. "/hotels/paris/2026-08-01/2026-08-05/2adults"). That path gets
 * wrapped server-side into KAYAK's tracked deep-link redirect —
 * https://www.kayak.com/in?a=<deeplink code>&lc=en&url=<this path> —
 * using the "Deeplink integration code" from process.env.KAYAK_DEEPLINK_CODE
 * (Affiliate Network dashboard → Products → Text links). See
 * src/lib/kayak.functions.ts.
 */

export type HotelSearch = {
  destination: string;
  checkIn: string; // yyyy-mm-dd
  checkOut: string;
  rooms: number;
  adults: number;
  children: number;
  /**
   * KAYAK's own place identifiers for `destination`, from the Autocomplete
   * API (see kayak-autocomplete.functions.ts). Optional — only present when
   * the user picked a live suggestion rather than typing free text. When
   * present, buildKayakHotelUrl embeds them so KAYAK resolves the exact
   * place instead of guessing from a slug.
   */
  placeId?: number;
  entityKey?: string;
  lat?: number;
  lon?: number;
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

/**
 * Relative KAYAK hotel path — wrapped into a tracked /in redirect
 * server-side. When placeId/entityKey/lat/lon are present (the user picked
 * a live Autocomplete suggestion rather than typing free text), they're
 * appended so KAYAK resolves the exact place instead of guessing from a slug.
 */
export function buildKayakHotelUrl(s: HotelSearch): string {
  const place = slug(s.destination) || "anywhere";
  const guests = `${s.adults}adults${s.children > 0 ? `-${s.children}children` : ""}`;
  const path = `/hotels/${place}/${s.checkIn}/${s.checkOut}/${guests}`;

  const params = new URLSearchParams();
  if (s.rooms > 1) params.set("rooms", String(s.rooms));
  if (s.placeId != null) params.set("placeId", String(s.placeId));
  if (s.lat != null) params.set("latitude", String(s.lat));
  if (s.lon != null) params.set("longitude", String(s.lon));
  if (s.entityKey) params.set("entityKey", s.entityKey);

  const qs = params.toString();
  return qs ? `${path}?${qs}` : path;
}

/** Relative KAYAK flight path. Cabin class passed via `fs=cfc=<class>`. */
export function buildKayakFlightUrl(s: FlightSearch): string {
  const from = enc(s.from.toUpperCase());
  const to = enc(s.to.toUpperCase());
  const legs =
    s.tripType === "round-trip" && s.return
      ? `${from}-${to}/${s.depart}/${s.return}`
      : `${from}-${to}/${s.depart}`;
  return `/flights/${legs}/${s.travellers}adults?sort=bestflight_a&fs=cfc=${s.cabin}`;
}

/**
 * Build a URL to our internal /go redirect handler, preserving every search
 * parameter as safely-encoded query string values. The /go route re-validates
 * the params server-side and wraps the result in KAYAK's tracked /in redirect
 * before sending the browser onward.
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

/**
 * Build a shareable link to the homepage itself, pre-filled with this
 * search (destination, dates, guests, and — for hotels — the resolved
 * placeId/entityKey/lat/lon if the user picked a live Autocomplete
 * suggestion). Anyone who opens the link lands with the form already
 * filled in; every field but destination/from+to is optional and defaults
 * sensibly if omitted. Unlike buildHotelRedirect/buildFlightRedirect (which
 * point at /go and immediately redirect to KAYAK), this points at `/` so
 * the recipient sees the search form itself before deciding to search.
 */
export function buildHotelShareLink(s: HotelSearch) {
  return `/?${toQuery({ type: "hotel", ...s })}`;
}

export function buildFlightShareLink(s: FlightSearch) {
  return `/?${toQuery({ type: "flight", ...s })}`;
}

export function openRedirect(url: string) {
  if (typeof window !== "undefined") window.location.assign(url);
}
