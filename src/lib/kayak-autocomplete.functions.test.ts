import { describe, it, expect } from "vitest";
import { toPlace } from "./kayak-autocomplete.functions";

describe("toPlace — KAYAK Autocomplete response mapping", () => {
  it("maps a hotels-vertical record, including location and entityKey", () => {
    const raw = {
      placeId: 59560,
      primaryPlaceType: "city",
      displayPlaceType: { type: "city", displayName: "City" },
      name: "Las Vegas",
      fullName: "Las Vegas, Nevada",
      location: { latitude: 36.09024, longitude: -115.17246 },
      places: ["Nevada"],
      entityKey: "kplace:59560",
      countryName: "United States",
      countryCode: "US",
      regionName: "Nevada",
      cityName: "Las Vegas",
      cityId: 15830,
    };

    expect(toPlace(raw)).toEqual({
      placeId: 59560,
      primaryPlaceType: "city",
      name: "Las Vegas",
      fullName: "Las Vegas, Nevada",
      cityName: "Las Vegas",
      regionName: "Nevada",
      countryName: "United States",
      iataCode: undefined,
      isMetro: undefined,
      entityKey: "kplace:59560",
      latitude: 36.09024,
      longitude: -115.17246,
    });
  });

  it("maps a flights-vertical record, with no location or entityKey", () => {
    const raw = {
      placeId: 175485,
      primaryPlaceType: "city",
      displayPlaceType: { type: "city", displayName: "City" },
      name: "John F Kennedy Intl",
      fullName: "John F Kennedy Intl, New York, United States, (JFK)",
      countryName: "United States",
      regionName: "New York",
      cityName: "New York",
      iataCode: "JFK",
      isMetro: false,
    };

    expect(toPlace(raw)).toEqual({
      placeId: 175485,
      primaryPlaceType: "city",
      name: "John F Kennedy Intl",
      fullName: "John F Kennedy Intl, New York, United States, (JFK)",
      cityName: "New York",
      regionName: "New York",
      countryName: "United States",
      iataCode: "JFK",
      isMetro: false,
      entityKey: undefined,
      latitude: undefined,
      longitude: undefined,
    });
  });

  it("tolerates missing optional fields without throwing", () => {
    const raw = { placeId: 1, primaryPlaceType: "city", fullName: "Nowhere" };
    expect(toPlace(raw)).toMatchObject({ placeId: 1, primaryPlaceType: "city", fullName: "Nowhere" });
  });
});
