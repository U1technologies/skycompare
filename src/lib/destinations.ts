/**
 * Local destination dataset for the autocomplete feature.
 *
 * We keep this list curated (top cities, airports, and iconic hotels) so the
 * app returns instant, correctly-spelled results with no network calls or API
 * keys. The `label` field is what gets sent to affiliate partners — it's the
 * canonical, unambiguous spelling that partner search engines resolve well.
 *
 * For flight From/To we also expose an `iata` code for airports.
 */

export type DestinationKind = "city" | "airport" | "hotel";

export type Destination = {
  id: string;
  kind: DestinationKind;
  /** Canonical label sent to partners (e.g. "Paris, France"). */
  label: string;
  /** Short display name (e.g. "Paris"). */
  name: string;
  /** Region / country / airport code for the secondary line. */
  region: string;
  /** IATA 3-letter code — airports only. */
  iata?: string;
};

export const DESTINATIONS: Destination[] = [
  // ---- Cities ----
  { id: "c-par", kind: "city", name: "Paris", region: "France", label: "Paris, France" },
  { id: "c-lon", kind: "city", name: "London", region: "United Kingdom", label: "London, United Kingdom" },
  { id: "c-nyc", kind: "city", name: "New York", region: "United States", label: "New York, NY, United States" },
  { id: "c-tok", kind: "city", name: "Tokyo", region: "Japan", label: "Tokyo, Japan" },
  { id: "c-dxb", kind: "city", name: "Dubai", region: "United Arab Emirates", label: "Dubai, United Arab Emirates" },
  { id: "c-bkk", kind: "city", name: "Bangkok", region: "Thailand", label: "Bangkok, Thailand" },
  { id: "c-sin", kind: "city", name: "Singapore", region: "Singapore", label: "Singapore" },
  { id: "c-rom", kind: "city", name: "Rome", region: "Italy", label: "Rome, Italy" },
  { id: "c-bcn", kind: "city", name: "Barcelona", region: "Spain", label: "Barcelona, Spain" },
  { id: "c-ist", kind: "city", name: "Istanbul", region: "Turkey", label: "Istanbul, Turkey" },
  { id: "c-syd", kind: "city", name: "Sydney", region: "Australia", label: "Sydney, Australia" },
  { id: "c-hkg", kind: "city", name: "Hong Kong", region: "Hong Kong", label: "Hong Kong" },
  { id: "c-ams", kind: "city", name: "Amsterdam", region: "Netherlands", label: "Amsterdam, Netherlands" },
  { id: "c-ber", kind: "city", name: "Berlin", region: "Germany", label: "Berlin, Germany" },
  { id: "c-mad", kind: "city", name: "Madrid", region: "Spain", label: "Madrid, Spain" },
  { id: "c-lax", kind: "city", name: "Los Angeles", region: "United States", label: "Los Angeles, CA, United States" },
  { id: "c-mia", kind: "city", name: "Miami", region: "United States", label: "Miami, FL, United States" },
  { id: "c-sfo", kind: "city", name: "San Francisco", region: "United States", label: "San Francisco, CA, United States" },
  { id: "c-yyz", kind: "city", name: "Toronto", region: "Canada", label: "Toronto, ON, Canada" },
  { id: "c-mex", kind: "city", name: "Mexico City", region: "Mexico", label: "Mexico City, Mexico" },
  { id: "c-mvd", kind: "city", name: "Bali", region: "Indonesia", label: "Bali, Indonesia" },
  { id: "c-mle", kind: "city", name: "Maldives", region: "Maldives", label: "Maldives" },
  { id: "c-lis", kind: "city", name: "Lisbon", region: "Portugal", label: "Lisbon, Portugal" },
  { id: "c-vie", kind: "city", name: "Vienna", region: "Austria", label: "Vienna, Austria" },
  { id: "c-pra", kind: "city", name: "Prague", region: "Czechia", label: "Prague, Czechia" },
  { id: "c-ath", kind: "city", name: "Athens", region: "Greece", label: "Athens, Greece" },
  { id: "c-cai", kind: "city", name: "Cairo", region: "Egypt", label: "Cairo, Egypt" },
  { id: "c-cpt", kind: "city", name: "Cape Town", region: "South Africa", label: "Cape Town, South Africa" },
  { id: "c-del", kind: "city", name: "Delhi", region: "India", label: "Delhi, India" },
  { id: "c-bom", kind: "city", name: "Mumbai", region: "India", label: "Mumbai, India" },
  { id: "c-sel", kind: "city", name: "Seoul", region: "South Korea", label: "Seoul, South Korea" },
  { id: "c-kul", kind: "city", name: "Kuala Lumpur", region: "Malaysia", label: "Kuala Lumpur, Malaysia" },

  // ---- Airports ----
  { id: "a-jfk", kind: "airport", name: "John F. Kennedy Intl", region: "New York, US", label: "JFK — John F. Kennedy Intl", iata: "JFK" },
  { id: "a-lga", kind: "airport", name: "LaGuardia", region: "New York, US", label: "LGA — LaGuardia", iata: "LGA" },
  { id: "a-lhr", kind: "airport", name: "Heathrow", region: "London, UK", label: "LHR — Heathrow", iata: "LHR" },
  { id: "a-lgw", kind: "airport", name: "Gatwick", region: "London, UK", label: "LGW — Gatwick", iata: "LGW" },
  { id: "a-cdg", kind: "airport", name: "Charles de Gaulle", region: "Paris, FR", label: "CDG — Charles de Gaulle", iata: "CDG" },
  { id: "a-ory", kind: "airport", name: "Orly", region: "Paris, FR", label: "ORY — Orly", iata: "ORY" },
  { id: "a-dxb", kind: "airport", name: "Dubai Intl", region: "Dubai, UAE", label: "DXB — Dubai Intl", iata: "DXB" },
  { id: "a-sin", kind: "airport", name: "Changi", region: "Singapore", label: "SIN — Changi", iata: "SIN" },
  { id: "a-hnd", kind: "airport", name: "Haneda", region: "Tokyo, JP", label: "HND — Haneda", iata: "HND" },
  { id: "a-nrt", kind: "airport", name: "Narita", region: "Tokyo, JP", label: "NRT — Narita", iata: "NRT" },
  { id: "a-lax", kind: "airport", name: "Los Angeles Intl", region: "Los Angeles, US", label: "LAX — Los Angeles Intl", iata: "LAX" },
  { id: "a-sfo", kind: "airport", name: "San Francisco Intl", region: "San Francisco, US", label: "SFO — San Francisco Intl", iata: "SFO" },
  { id: "a-ord", kind: "airport", name: "O'Hare", region: "Chicago, US", label: "ORD — O'Hare", iata: "ORD" },
  { id: "a-mia", kind: "airport", name: "Miami Intl", region: "Miami, US", label: "MIA — Miami Intl", iata: "MIA" },
  { id: "a-syd", kind: "airport", name: "Kingsford Smith", region: "Sydney, AU", label: "SYD — Kingsford Smith", iata: "SYD" },
  { id: "a-hkg", kind: "airport", name: "Hong Kong Intl", region: "Hong Kong", label: "HKG — Hong Kong Intl", iata: "HKG" },
  { id: "a-bkk", kind: "airport", name: "Suvarnabhumi", region: "Bangkok, TH", label: "BKK — Suvarnabhumi", iata: "BKK" },
  { id: "a-ist", kind: "airport", name: "Istanbul Airport", region: "Istanbul, TR", label: "IST — Istanbul Airport", iata: "IST" },
  { id: "a-fra", kind: "airport", name: "Frankfurt", region: "Frankfurt, DE", label: "FRA — Frankfurt", iata: "FRA" },
  { id: "a-ams", kind: "airport", name: "Schiphol", region: "Amsterdam, NL", label: "AMS — Schiphol", iata: "AMS" },
  { id: "a-yyz", kind: "airport", name: "Toronto Pearson", region: "Toronto, CA", label: "YYZ — Toronto Pearson", iata: "YYZ" },
  { id: "a-del", kind: "airport", name: "Indira Gandhi Intl", region: "Delhi, IN", label: "DEL — Indira Gandhi Intl", iata: "DEL" },
  { id: "a-bom", kind: "airport", name: "Chhatrapati Shivaji", region: "Mumbai, IN", label: "BOM — Chhatrapati Shivaji", iata: "BOM" },
  { id: "a-icn", kind: "airport", name: "Incheon", region: "Seoul, KR", label: "ICN — Incheon", iata: "ICN" },
  { id: "a-kul", kind: "airport", name: "KLIA", region: "Kuala Lumpur, MY", label: "KUL — Kuala Lumpur Intl", iata: "KUL" },

  // ---- Hotels ----
  { id: "h-atl", kind: "hotel", name: "Atlantis The Palm", region: "Dubai, UAE", label: "Atlantis The Palm, Dubai" },
  { id: "h-brj", kind: "hotel", name: "Burj Al Arab", region: "Dubai, UAE", label: "Burj Al Arab Jumeirah, Dubai" },
  { id: "h-mbs", kind: "hotel", name: "Marina Bay Sands", region: "Singapore", label: "Marina Bay Sands, Singapore" },
  { id: "h-plz", kind: "hotel", name: "The Plaza", region: "New York, US", label: "The Plaza Hotel, New York" },
  { id: "h-ritzp", kind: "hotel", name: "Ritz Paris", region: "Paris, FR", label: "Ritz Paris" },
  { id: "h-savoy", kind: "hotel", name: "The Savoy", region: "London, UK", label: "The Savoy, London" },
  { id: "h-mand", kind: "hotel", name: "Mandarin Oriental", region: "Bangkok, TH", label: "Mandarin Oriental, Bangkok" },
];

const norm = (s: string) => s.toLowerCase().normalize("NFD").replace(/[\u0300-\u036f]/g, "");

export type SearchOptions = {
  /** Only include destinations of these kinds. Default: all. */
  kinds?: DestinationKind[];
  /** Max results. Default: 8. */
  limit?: number;
};

/**
 * Fuzzy-search destinations by name, region, label, or IATA code.
 * Ranks exact IATA matches, prefix matches, then substring matches.
 */
export function searchDestinations(query: string, opts: SearchOptions = {}): Destination[] {
  const q = norm(query.trim());
  if (!q) return [];
  const kinds = opts.kinds;
  const limit = opts.limit ?? 8;

  type Scored = { d: Destination; score: number };
  const scored: Scored[] = [];

  for (const d of DESTINATIONS) {
    if (kinds && !kinds.includes(d.kind)) continue;
    const name = norm(d.name);
    const region = norm(d.region);
    const label = norm(d.label);
    const iata = d.iata ? norm(d.iata) : "";

    let score = -1;
    if (iata && iata === q) score = 100;
    else if (name === q) score = 90;
    else if (iata && iata.startsWith(q)) score = 80;
    else if (name.startsWith(q)) score = 70;
    else if (label.startsWith(q)) score = 60;
    else if (name.includes(q)) score = 50;
    else if (region.includes(q)) score = 30;
    else if (label.includes(q)) score = 20;

    if (score >= 0) scored.push({ d, score });
  }

  scored.sort((a, b) => b.score - a.score || a.d.name.length - b.d.name.length);
  return scored.slice(0, limit).map((s) => s.d);
}
