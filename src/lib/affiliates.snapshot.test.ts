/**
 * Deep-link URL snapshot tests.
 *
 * Any change to a provider's URL shape (path, query keys, encoding, cabin
 * mapping) breaks these snapshots on purpose — inspect the diff and only
 * refresh the snapshot after confirming the new URL still lands on the
 * partner's search results with all params prefilled.
 */
import { describe, it, expect } from "vitest";
import {
  HOTEL_PROVIDERS,
  FLIGHT_PROVIDERS,
  type HotelSearch,
  type FlightSearch,
} from "./affiliates";

const HOTEL: HotelSearch = {
  destination: "Rio de Janeiro, Brazil",
  checkIn: "2026-07-10",
  checkOut: "2026-07-14",
  rooms: 2,
  adults: 3,
  children: 1,
};

const FLIGHT_RT: FlightSearch = {
  tripType: "round-trip",
  from: "JFK",
  to: "LHR",
  depart: "2026-07-10",
  return: "2026-07-17",
  travellers: 2,
  cabin: "business",
};

const FLIGHT_OW: FlightSearch = { ...FLIGHT_RT, tripType: "one-way", return: undefined };

describe("hotel provider URL snapshots", () => {
  for (const p of HOTEL_PROVIDERS) {
    it(`${p.id}`, () => {
      expect(p.build(HOTEL)).toMatchSnapshot();
    });
  }
});

describe("flight provider URL snapshots — round trip", () => {
  for (const p of FLIGHT_PROVIDERS) {
    it(`${p.id}`, () => {
      expect(p.build(FLIGHT_RT)).toMatchSnapshot();
    });
  }
});

describe("flight provider URL snapshots — one way", () => {
  for (const p of FLIGHT_PROVIDERS) {
    it(`${p.id}`, () => {
      expect(p.build(FLIGHT_OW)).toMatchSnapshot();
    });
  }
});
