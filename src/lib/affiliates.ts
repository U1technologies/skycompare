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

export const HOTEL_PROVIDERS: (Provider & { build: (s: HotelSearch) => string })[] = [
  {
    id: "booking",
    name: "Booking.com",
    domain: "booking.com",
    build: (s) =>
      `https://www.booking.com/searchresults.html?ss=${enc(s.destination)}` +
      `&checkin=${s.checkIn}&checkout=${s.checkOut}` +
      `&group_adults=${s.adults}&group_children=${s.children}&no_rooms=${s.rooms}`,
  },
  {
    id: "agoda",
    name: "Agoda",
    domain: "agoda.com",
    build: (s) =>
      `https://www.agoda.com/search?city=${enc(s.destination)}` +
      `&checkIn=${s.checkIn}&checkOut=${s.checkOut}` +
      `&rooms=${s.rooms}&adults=${s.adults}&children=${s.children}`,
  },
  {
    id: "expedia",
    name: "Expedia",
    domain: "expedia.com",
    build: (s) =>
      `https://www.expedia.com/Hotel-Search?destination=${enc(s.destination)}` +
      `&startDate=${s.checkIn}&endDate=${s.checkOut}` +
      `&rooms=${s.rooms}&adults=${s.adults}&children=${s.children}`,
  },
  {
    id: "hotels",
    name: "Hotels.com",
    domain: "hotels.com",
    build: (s) =>
      `https://www.hotels.com/Hotel-Search?destination=${enc(s.destination)}` +
      `&startDate=${s.checkIn}&endDate=${s.checkOut}&rooms=${s.rooms}&adults=${s.adults}`,
  },
  {
    id: "trip",
    name: "Trip.com",
    domain: "trip.com",
    build: (s) =>
      `https://www.trip.com/hotels/list?city=${enc(s.destination)}` +
      `&checkin=${s.checkIn}&checkout=${s.checkOut}&adult=${s.adults}&children=${s.children}`,
  },
  {
    id: "kayak-hotel",
    name: "KAYAK",
    domain: "kayak.com",
    build: (s) =>
      `https://www.kayak.com/hotels/${enc(s.destination)}/${s.checkIn}/${s.checkOut}/${s.adults}adults`,
  },
];

export const FLIGHT_PROVIDERS: (Provider & { build: (s: FlightSearch) => string })[] = [
  {
    id: "kayak",
    name: "KAYAK",
    domain: "kayak.com",
    build: (s) => {
      const legs =
        s.tripType === "round-trip" && s.return
          ? `${s.from}-${s.to}/${s.depart}/${s.return}`
          : `${s.from}-${s.to}/${s.depart}`;
      return `https://www.kayak.com/flights/${legs}/${s.travellers}adults?sort=bestflight_a&fs=cabin=${s.cabin}`;
    },
  },
  {
    id: "skyscanner",
    name: "Skyscanner",
    domain: "skyscanner.com",
    build: (s) => {
      const d = s.depart.replaceAll("-", "").slice(2);
      const r = s.return ? s.return.replaceAll("-", "").slice(2) : "";
      const tail = s.tripType === "round-trip" && r ? `/${r}` : "";
      return `https://www.skyscanner.com/transport/flights/${s.from.toLowerCase()}/${s.to.toLowerCase()}/${d}${tail}/?adults=${s.travellers}&cabinclass=${s.cabin}`;
    },
  },
  {
    id: "expedia-fl",
    name: "Expedia",
    domain: "expedia.com",
    build: (s) =>
      `https://www.expedia.com/Flights-Search?trip=${s.tripType === "round-trip" ? "roundtrip" : "oneway"}` +
      `&leg1=from:${enc(s.from)},to:${enc(s.to)},departure:${s.depart}` +
      (s.tripType === "round-trip" && s.return ? `&leg2=from:${enc(s.to)},to:${enc(s.from)},departure:${s.return}` : "") +
      `&passengers=adults:${s.travellers}&cabinclass=${s.cabin}`,
  },
  {
    id: "priceline",
    name: "Priceline",
    domain: "priceline.com",
    build: (s) =>
      `https://www.priceline.com/m/fly/search/${s.from}-${s.to}-${s.depart}` +
      (s.tripType === "round-trip" && s.return ? `/${s.return}` : "") +
      `/?cabin-class=${s.cabin}&num-adults=${s.travellers}`,
  },
];

export function openAffiliate(url: string) {
  if (typeof window !== "undefined") window.open(url, "_blank", "noopener,noreferrer");
}
