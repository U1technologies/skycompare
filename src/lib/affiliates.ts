/**
 * Affiliate deep-link providers.
 *
 * Each provider builds a URL from the user's search parameters and returns it.
 * Add new partners by pushing a new entry into HOTEL_PROVIDERS / FLIGHT_PROVIDERS.
 * Wire real affiliate IDs by replacing the `aid` / `siteID` / `label` placeholders.
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

export type Provider = {
  id: string;
  name: string;
  domain: string;
};

const enc = encodeURIComponent;

/**
 * Deep-link URL formats verified against each partner's live search form.
 * Every builder pre-fills destination/route, dates, travellers, rooms and
 * cabin class so the partner opens directly on the search results page.
 */

// Slugify a destination for path-style URLs (KAYAK hotels, Trip.com).
const slug = (s: string) =>
  s
    .normalize("NFKD")
    .replace(/[\u0300-\u036f]/g, "")
    .replace(/[^a-zA-Z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "")
    .toLowerCase();

// Skyscanner cabin codes differ from ours.
const skyCabin = (c: FlightSearch["cabin"]) =>
  c === "premium" ? "premiumeconomy" : c; // economy | business | first pass through

export const HOTEL_PROVIDERS: (Provider & { build: (s: HotelSearch) => string })[] = [
  {
    id: "booking",
    name: "Booking.com",
    domain: "booking.com",
    // Booking.com honours ss (search string), checkin/checkout, group_adults,
    // group_children, no_rooms on searchresults.html.
    build: (s) =>
      `https://www.booking.com/searchresults.html?ss=${enc(s.destination)}` +
      `&checkin=${s.checkIn}&checkout=${s.checkOut}` +
      `&group_adults=${s.adults}&group_children=${s.children}&no_rooms=${s.rooms}`,
  },
  {
    id: "agoda",
    name: "Agoda",
    domain: "agoda.com",
    // Agoda's public search endpoint uses `textToSearch` for free-form
    // destinations; `city=` requires an internal numeric id.
    build: (s) =>
      `https://www.agoda.com/search?textToSearch=${enc(s.destination)}` +
      `&checkIn=${s.checkIn}&checkOut=${s.checkOut}` +
      `&rooms=${s.rooms}&adults=${s.adults}&children=${s.children}`,
  },
  {
    id: "expedia",
    name: "Expedia",
    domain: "expedia.com",
    // Expedia Hotel-Search accepts a JSON-style destination object plus
    // startDate/endDate + rooms qualifier.
    build: (s) => {
      const destination = enc(JSON.stringify({ regionName: s.destination }));
      const rooms = `adults:${s.adults}|children:${s.children}`;
      return (
        `https://www.expedia.com/Hotel-Search?destination=${enc(s.destination)}` +
        `&d1=${s.checkIn}&startDate=${s.checkIn}` +
        `&d2=${s.checkOut}&endDate=${s.checkOut}` +
        `&rooms=${s.rooms}&adults=${s.adults}&children=${s.children}` +
        `&x_pwa=1&destinationId=&regionId=&latLong=&semdtl=&sort=RECOMMENDED` +
        `&useRewards=false&destination_meta=${destination}&roomsAdultsChildren=${enc(rooms)}`
      );
    },
  },
  {
    id: "hotels",
    name: "Hotels.com",
    domain: "hotels.com",
    // Hotels.com (Expedia group) uses the same Hotel-Search structure.
    build: (s) =>
      `https://www.hotels.com/Hotel-Search?destination=${enc(s.destination)}` +
      `&d1=${s.checkIn}&startDate=${s.checkIn}` +
      `&d2=${s.checkOut}&endDate=${s.checkOut}` +
      `&rooms=${s.rooms}&adults=${s.adults}&children=${s.children}&sort=RECOMMENDED`,
  },
  {
    id: "trip",
    name: "Trip.com",
    domain: "trip.com",
    // Trip.com hotel list: `city=0` + `searchWord` lets the free-text search
    // resolve the destination when we don't know the internal city id.
    build: (s) =>
      `https://www.trip.com/hotels/list?city=0&searchWord=${enc(s.destination)}` +
      `&checkin=${s.checkIn}&checkout=${s.checkOut}` +
      `&adult=${s.adults}&children=${s.children}&crn=${s.rooms}`,
  },
  {
    id: "kayak-hotel",
    name: "KAYAK",
    domain: "kayak.com",
    // KAYAK hotels use a positional path: /hotels/<place>/<in>/<out>/<a>adults
    // The place must be URL-safe — slugify user text.
    build: (s) =>
      `https://www.kayak.com/hotels/${slug(s.destination) || "anywhere"}/${s.checkIn}/${s.checkOut}/${s.adults}adults` +
      (s.children > 0 ? `/children-${s.children}` : "") +
      (s.rooms > 1 ? `?rooms=${s.rooms}` : ""),
  },
];

export const FLIGHT_PROVIDERS: (Provider & { build: (s: FlightSearch) => string })[] = [
  {
    id: "kayak",
    name: "KAYAK",
    domain: "kayak.com",
    // KAYAK flights: /flights/<FROM>-<TO>/<depart>[/<return>]/<pax>adults
    build: (s) => {
      const from = s.from.toUpperCase();
      const to = s.to.toUpperCase();
      const legs =
        s.tripType === "round-trip" && s.return
          ? `${from}-${to}/${s.depart}/${s.return}`
          : `${from}-${to}/${s.depart}`;
      return `https://www.kayak.com/flights/${legs}/${s.travellers}adults?sort=bestflight_a&fs=cfc=${s.cabin}`;
    },
  },
  {
    id: "skyscanner",
    name: "Skyscanner",
    domain: "skyscanner.com",
    // Skyscanner: /transport/flights/<from>/<to>/<YYMMDD>[/<YYMMDD>]/
    build: (s) => {
      const d = s.depart.replaceAll("-", "").slice(2);
      const r = s.return ? s.return.replaceAll("-", "").slice(2) : "";
      const tail = s.tripType === "round-trip" && r ? `/${r}` : "";
      return (
        `https://www.skyscanner.com/transport/flights/${s.from.toLowerCase()}/${s.to.toLowerCase()}/${d}${tail}/` +
        `?adultsv2=${s.travellers}&cabinclass=${skyCabin(s.cabin)}&rtn=${s.tripType === "round-trip" ? 1 : 0}`
      );
    },
  },
  {
    id: "expedia-fl",
    name: "Expedia",
    domain: "expedia.com",
    // Expedia Flights-Search: legN uses `from:X,to:Y,departure:YYYY-MM-DDTANYT`.
    // The TANYT suffix (time-any) is what makes Expedia pre-fill the date.
    build: (s) => {
      const trip = s.tripType === "round-trip" ? "roundtrip" : "oneway";
      const leg1 = `from:${s.from},to:${s.to},departure:${s.depart}TANYT`;
      const leg2 =
        s.tripType === "round-trip" && s.return
          ? `&leg2=${enc(`from:${s.to},to:${s.from},departure:${s.return}TANYT`)}`
          : "";
      return (
        `https://www.expedia.com/Flights-Search?trip=${trip}` +
        `&leg1=${enc(leg1)}${leg2}` +
        `&passengers=adults:${s.travellers},children:0,seniors:0,infantinlap:Y` +
        `&options=cabinclass:${s.cabin}&mode=search`
      );
    },
  },
  {
    id: "priceline",
    name: "Priceline",
    domain: "priceline.com",
    // Priceline mobile flight search: /m/fly/search/<FROM>-<TO>-<depart>[/<return>]
    build: (s) => {
      const from = s.from.toUpperCase();
      const to = s.to.toUpperCase();
      const path =
        s.tripType === "round-trip" && s.return
          ? `${from}-${to}-${s.depart}/${s.return}`
          : `${from}-${to}-${s.depart}`;
      return `https://www.priceline.com/m/fly/search/${path}/?cabin-class=${s.cabin}&num-adults=${s.travellers}`;
    },
  },
  },
];

export function openAffiliate(url: string) {
  if (typeof window !== "undefined") window.open(url, "_blank", "noopener,noreferrer");
}

/**
 * Build a URL to our internal /go redirect handler, preserving every search
 * parameter (dates, travellers, cabin class, rooms, etc.) as safely-encoded
 * query string values. The /go route re-validates and rebuilds the affiliate
 * deep link server- or client-side before redirecting.
 */
function toQuery(obj: Record<string, string | number | undefined>) {
  const p = new URLSearchParams();
  for (const [k, v] of Object.entries(obj)) {
    if (v === undefined || v === null || v === "") continue;
    p.set(k, String(v));
  }
  return p.toString();
}

export function buildHotelRedirect(providerId: string, s: HotelSearch) {
  return `/go?${toQuery({ type: "hotel", provider: providerId, ...s })}`;
}

export function buildFlightRedirect(providerId: string, s: FlightSearch) {
  return `/go?${toQuery({ type: "flight", provider: providerId, ...s })}`;
}

export function openRedirect(url: string) {
  if (typeof window !== "undefined") window.open(url, "_blank", "noopener,noreferrer");
}
