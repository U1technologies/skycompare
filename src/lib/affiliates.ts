/**
 * KAYAK-only affiliate deep links.
 *
 * We deliberately keep a single partner (KAYAK) so every search on the site
 * lands on kayak.com with the same params the user filled in (destination,
 * dates, travellers, rooms, cabin class).
 *
 * buildKayakHotelUrl/buildKayakFlightUrl return a *relative* KAYAK path
 * (e.g. "/hotels/paris/2026-08-01/2026-08-05/2adults"). wrapKayakTrackedUrl
 * turns that path into the final absolute link through KAYAK's tracked
 * deep-link redirect —
 * https://<market domain>/in?a=<deeplink code>&lc=en&url=<this path> —
 * where the code is the "Deeplink integration code" from the Affiliate
 * Network dashboard (Products → Text links).
 *
 * Both halves of the site build links through the same two steps:
 *   - the search buttons on the homepage, so a click is a plain <a> straight
 *     to KAYAK with nothing of ours in the middle (see SearchSubmit in
 *     src/routes/index.tsx);
 *   - the /go route, which resolves the same link server-side for shared
 *     links and for visitors without JS (see src/lib/kayak-redirect.ts).
 *
 * The market domain and deeplink code are always passed in rather than read
 * from the environment here, because this module runs in the browser too.
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

/**
 * Everything needed to turn a relative KAYAK path into the final tracked link.
 * Resolved per visitor on the server (see getKayakLinkContext in
 * kayak.functions.ts) and handed to the browser with the page, so a search
 * click needs no round-trip of ours to work out where to go.
 */
export type KayakLinkContext = {
  /** Market-specific KAYAK domain for this visitor, e.g. "kayak.co.in". */
  domain: string;
  /** Affiliate deeplink code. Absent in local dev, where links go untracked. */
  deeplinkCode?: string;
};

/**
 * Wrap a relative KAYAK path in the tracked /in redirect that credits us for
 * the click. Without a deeplink code (local dev) it returns a plain, untracked
 * KAYAK link so the flow still works end to end.
 */
export function wrapKayakTrackedUrl(relativePath: string, ctx: KayakLinkContext): string {
  if (!ctx.deeplinkCode) return new URL(relativePath, `https://${ctx.domain}`).toString();

  const redirect = new URL(`https://${ctx.domain}/in`);
  redirect.searchParams.set("a", ctx.deeplinkCode);
  redirect.searchParams.set("lc", "en");
  redirect.searchParams.set("url", relativePath);
  return redirect.toString();
}

/** Final KAYAK hotel link for this visitor, ready to use as an href. */
export function buildKayakHotelLink(s: HotelSearch, ctx: KayakLinkContext): string {
  return wrapKayakTrackedUrl(buildKayakHotelUrl(s), ctx);
}

/** Final KAYAK flight link for this visitor, ready to use as an href. */
export function buildKayakFlightLink(s: FlightSearch, ctx: KayakLinkContext): string {
  return wrapKayakTrackedUrl(buildKayakFlightUrl(s), ctx);
}
