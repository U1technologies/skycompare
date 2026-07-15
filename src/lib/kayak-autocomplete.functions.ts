/**
 * Server function that proxies KAYAK's Autocomplete API
 * (GET https://www.kayakaffiliates.com/api/affiliate/autocomplete/v1/<vertical>).
 *
 * Unlike the deeplink code, process.env.KAYAK_AUTOCOMPLETE_API_KEY genuinely
 * is a secret: it's billed/rate-limited per call against this account, and
 * never appears in a URL a browser navigates to. It must never be sent to
 * the client — this function is the only thing that ever sees it.
 */
import { createServerFn } from "@tanstack/react-start";
import { z } from "zod";

const AUTOCOMPLETE_BASE_URL = "https://www.kayakaffiliates.com/api/affiliate/autocomplete/v1";

const inputSchema = z.object({
  vertical: z.enum(["hotels", "flights"]),
  searchTerm: z.string().trim().min(1).max(100),
});

export type AutocompletePlace = {
  placeId: number;
  primaryPlaceType: string;
  name?: string;
  fullName: string;
  cityName?: string;
  regionName?: string;
  countryName?: string;
  iataCode?: string;
  isMetro?: boolean;
  /** Hotels vertical only — lets a Hotel Search API call target this exact place. */
  entityKey?: string;
  /** Hotels vertical only. */
  latitude?: number;
  longitude?: number;
};

export type AutocompleteResult =
  | { ok: true; places: AutocompletePlace[] }
  | { ok: false; error: string };

/** Raw KAYAK response record -> our flattened, client-facing shape. */
export function toPlace(raw: Record<string, unknown>): AutocompletePlace {
  const location = raw.location as { latitude?: number; longitude?: number } | undefined;
  return {
    placeId: Number(raw.placeId),
    primaryPlaceType: String(raw.primaryPlaceType ?? ""),
    name: typeof raw.name === "string" ? raw.name : undefined,
    fullName: String(raw.fullName ?? ""),
    cityName: typeof raw.cityName === "string" ? raw.cityName : undefined,
    regionName: typeof raw.regionName === "string" ? raw.regionName : undefined,
    countryName: typeof raw.countryName === "string" ? raw.countryName : undefined,
    iataCode: typeof raw.iataCode === "string" ? raw.iataCode : undefined,
    isMetro: typeof raw.isMetro === "boolean" ? raw.isMetro : undefined,
    entityKey: typeof raw.entityKey === "string" ? raw.entityKey : undefined,
    latitude: typeof location?.latitude === "number" ? location.latitude : undefined,
    longitude: typeof location?.longitude === "number" ? location.longitude : undefined,
  };
}

export const autocompletePlaces = createServerFn({ method: "GET" })
  .validator((input: Record<string, unknown>) => input)
  .handler(async ({ data }): Promise<AutocompleteResult> => {
    const parsed = inputSchema.safeParse(data);
    if (!parsed.success) {
      return { ok: false, error: "Invalid autocomplete request." };
    }

    const apiKey = process.env.KAYAK_AUTOCOMPLETE_API_KEY?.trim();
    if (!apiKey) {
      return { ok: false, error: "Autocomplete is not configured." };
    }

    const url = new URL(`${AUTOCOMPLETE_BASE_URL}/${parsed.data.vertical}`);
    url.searchParams.set("apiKey", apiKey);
    url.searchParams.set("searchTerm", parsed.data.searchTerm);

    let response: Response;
    try {
      response = await fetch(url, { signal: AbortSignal.timeout(5000) });
    } catch {
      return { ok: false, error: "Could not reach KAYAK Autocomplete." };
    }

    if (!response.ok) {
      return { ok: false, error: `KAYAK Autocomplete returned ${response.status}.` };
    }

    const body = (await response.json()) as { results?: Record<string, unknown>[] };
    const places = Array.isArray(body.results) ? body.results.map(toPlace) : [];
    return { ok: true, places };
  });
