/**
 * Local destination dataset for the autocomplete feature.
 *
 * Curated worldwide list of cities, airports (with IATA codes) and iconic
 * hotels. `label` is the canonical string sent to affiliate partners.
 *
 * Airports include a `lat`/`lon` so we can rank nearby suggestions when the
 * browser exposes geolocation.
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
  /** Approximate coordinates for distance ranking (optional). */
  lat?: number;
  lon?: number;
};

// prettier-ignore
export const DESTINATIONS: Destination[] = [
  // ---- Cities (worldwide) ----
  { id: "c-par", kind: "city", name: "Paris", region: "France", label: "Paris, France", lat: 48.8566, lon: 2.3522 },
  { id: "c-lon", kind: "city", name: "London", region: "United Kingdom", label: "London, United Kingdom", lat: 51.5074, lon: -0.1278 },
  { id: "c-nyc", kind: "city", name: "New York", region: "United States", label: "New York, NY, United States", lat: 40.7128, lon: -74.006 },
  { id: "c-tok", kind: "city", name: "Tokyo", region: "Japan", label: "Tokyo, Japan", lat: 35.6762, lon: 139.6503 },
  { id: "c-dxb", kind: "city", name: "Dubai", region: "United Arab Emirates", label: "Dubai, United Arab Emirates", lat: 25.2048, lon: 55.2708 },
  { id: "c-bkk", kind: "city", name: "Bangkok", region: "Thailand", label: "Bangkok, Thailand", lat: 13.7563, lon: 100.5018 },
  { id: "c-sin", kind: "city", name: "Singapore", region: "Singapore", label: "Singapore", lat: 1.3521, lon: 103.8198 },
  { id: "c-rom", kind: "city", name: "Rome", region: "Italy", label: "Rome, Italy", lat: 41.9028, lon: 12.4964 },
  { id: "c-bcn", kind: "city", name: "Barcelona", region: "Spain", label: "Barcelona, Spain", lat: 41.3874, lon: 2.1686 },
  { id: "c-ist", kind: "city", name: "Istanbul", region: "Turkey", label: "Istanbul, Turkey", lat: 41.0082, lon: 28.9784 },
  { id: "c-syd", kind: "city", name: "Sydney", region: "Australia", label: "Sydney, Australia", lat: -33.8688, lon: 151.2093 },
  { id: "c-mel", kind: "city", name: "Melbourne", region: "Australia", label: "Melbourne, Australia", lat: -37.8136, lon: 144.9631 },
  { id: "c-hkg", kind: "city", name: "Hong Kong", region: "Hong Kong", label: "Hong Kong", lat: 22.3193, lon: 114.1694 },
  { id: "c-ams", kind: "city", name: "Amsterdam", region: "Netherlands", label: "Amsterdam, Netherlands", lat: 52.3676, lon: 4.9041 },
  { id: "c-ber", kind: "city", name: "Berlin", region: "Germany", label: "Berlin, Germany", lat: 52.52, lon: 13.405 },
  { id: "c-mun", kind: "city", name: "Munich", region: "Germany", label: "Munich, Germany", lat: 48.1351, lon: 11.582 },
  { id: "c-fra", kind: "city", name: "Frankfurt", region: "Germany", label: "Frankfurt, Germany", lat: 50.1109, lon: 8.6821 },
  { id: "c-mad", kind: "city", name: "Madrid", region: "Spain", label: "Madrid, Spain", lat: 40.4168, lon: -3.7038 },
  { id: "c-lax", kind: "city", name: "Los Angeles", region: "California, US", label: "Los Angeles, CA, United States", lat: 34.0522, lon: -118.2437 },
  { id: "c-mia", kind: "city", name: "Miami", region: "Florida, US", label: "Miami, FL, United States", lat: 25.7617, lon: -80.1918 },
  { id: "c-sfo", kind: "city", name: "San Francisco", region: "California, US", label: "San Francisco, CA, United States", lat: 37.7749, lon: -122.4194 },
  { id: "c-chi", kind: "city", name: "Chicago", region: "Illinois, US", label: "Chicago, IL, United States", lat: 41.8781, lon: -87.6298 },
  { id: "c-bos", kind: "city", name: "Boston", region: "Massachusetts, US", label: "Boston, MA, United States", lat: 42.3601, lon: -71.0589 },
  { id: "c-was", kind: "city", name: "Washington", region: "DC, US", label: "Washington, DC, United States", lat: 38.9072, lon: -77.0369 },
  { id: "c-sea", kind: "city", name: "Seattle", region: "Washington, US", label: "Seattle, WA, United States", lat: 47.6062, lon: -122.3321 },
  { id: "c-den", kind: "city", name: "Denver", region: "Colorado, US", label: "Denver, CO, United States", lat: 39.7392, lon: -104.9903 },
  { id: "c-lav", kind: "city", name: "Las Vegas", region: "Nevada, US", label: "Las Vegas, NV, United States", lat: 36.1699, lon: -115.1398 },
  { id: "c-yyz", kind: "city", name: "Toronto", region: "Canada", label: "Toronto, ON, Canada", lat: 43.6532, lon: -79.3832 },
  { id: "c-yvr", kind: "city", name: "Vancouver", region: "Canada", label: "Vancouver, BC, Canada", lat: 49.2827, lon: -123.1207 },
  { id: "c-yul", kind: "city", name: "Montreal", region: "Canada", label: "Montreal, QC, Canada", lat: 45.5017, lon: -73.5673 },
  { id: "c-mex", kind: "city", name: "Mexico City", region: "Mexico", label: "Mexico City, Mexico", lat: 19.4326, lon: -99.1332 },
  { id: "c-cun", kind: "city", name: "Cancun", region: "Mexico", label: "Cancun, Mexico", lat: 21.1619, lon: -86.8515 },
  { id: "c-rio", kind: "city", name: "Rio de Janeiro", region: "Brazil", label: "Rio de Janeiro, Brazil", lat: -22.9068, lon: -43.1729 },
  { id: "c-sao", kind: "city", name: "São Paulo", region: "Brazil", label: "São Paulo, Brazil", lat: -23.5505, lon: -46.6333 },
  { id: "c-bue", kind: "city", name: "Buenos Aires", region: "Argentina", label: "Buenos Aires, Argentina", lat: -34.6037, lon: -58.3816 },
  { id: "c-lim", kind: "city", name: "Lima", region: "Peru", label: "Lima, Peru", lat: -12.0464, lon: -77.0428 },
  { id: "c-bali", kind: "city", name: "Bali", region: "Indonesia", label: "Bali, Indonesia", lat: -8.3405, lon: 115.092 },
  { id: "c-jak", kind: "city", name: "Jakarta", region: "Indonesia", label: "Jakarta, Indonesia", lat: -6.2088, lon: 106.8456 },
  { id: "c-mle", kind: "city", name: "Maldives", region: "Maldives", label: "Maldives", lat: 3.2028, lon: 73.2207 },
  { id: "c-lis", kind: "city", name: "Lisbon", region: "Portugal", label: "Lisbon, Portugal", lat: 38.7223, lon: -9.1393 },
  { id: "c-vie", kind: "city", name: "Vienna", region: "Austria", label: "Vienna, Austria", lat: 48.2082, lon: 16.3738 },
  { id: "c-pra", kind: "city", name: "Prague", region: "Czechia", label: "Prague, Czechia", lat: 50.0755, lon: 14.4378 },
  { id: "c-ath", kind: "city", name: "Athens", region: "Greece", label: "Athens, Greece", lat: 37.9838, lon: 23.7275 },
  { id: "c-cai", kind: "city", name: "Cairo", region: "Egypt", label: "Cairo, Egypt", lat: 30.0444, lon: 31.2357 },
  { id: "c-cpt", kind: "city", name: "Cape Town", region: "South Africa", label: "Cape Town, South Africa", lat: -33.9249, lon: 18.4241 },
  { id: "c-jnb", kind: "city", name: "Johannesburg", region: "South Africa", label: "Johannesburg, South Africa", lat: -26.2041, lon: 28.0473 },
  { id: "c-nbo", kind: "city", name: "Nairobi", region: "Kenya", label: "Nairobi, Kenya", lat: -1.2921, lon: 36.8219 },
  { id: "c-del", kind: "city", name: "Delhi", region: "India", label: "Delhi, India", lat: 28.6139, lon: 77.209 },
  { id: "c-bom", kind: "city", name: "Mumbai", region: "India", label: "Mumbai, India", lat: 19.076, lon: 72.8777 },
  { id: "c-blr", kind: "city", name: "Bangalore", region: "India", label: "Bangalore, India", lat: 12.9716, lon: 77.5946 },
  { id: "c-goa", kind: "city", name: "Goa", region: "India", label: "Goa, India", lat: 15.2993, lon: 74.124 },
  { id: "c-sel", kind: "city", name: "Seoul", region: "South Korea", label: "Seoul, South Korea", lat: 37.5665, lon: 126.978 },
  { id: "c-kul", kind: "city", name: "Kuala Lumpur", region: "Malaysia", label: "Kuala Lumpur, Malaysia", lat: 3.139, lon: 101.6869 },
  { id: "c-man", kind: "city", name: "Manila", region: "Philippines", label: "Manila, Philippines", lat: 14.5995, lon: 120.9842 },
  { id: "c-ho", kind: "city", name: "Ho Chi Minh City", region: "Vietnam", label: "Ho Chi Minh City, Vietnam", lat: 10.8231, lon: 106.6297 },
  { id: "c-han", kind: "city", name: "Hanoi", region: "Vietnam", label: "Hanoi, Vietnam", lat: 21.0285, lon: 105.8542 },
  { id: "c-doh", kind: "city", name: "Doha", region: "Qatar", label: "Doha, Qatar", lat: 25.2854, lon: 51.531 },
  { id: "c-auh", kind: "city", name: "Abu Dhabi", region: "United Arab Emirates", label: "Abu Dhabi, United Arab Emirates", lat: 24.4539, lon: 54.3773 },
  { id: "c-riy", kind: "city", name: "Riyadh", region: "Saudi Arabia", label: "Riyadh, Saudi Arabia", lat: 24.7136, lon: 46.6753 },
  { id: "c-tlv", kind: "city", name: "Tel Aviv", region: "Israel", label: "Tel Aviv, Israel", lat: 32.0853, lon: 34.7818 },
  { id: "c-dub", kind: "city", name: "Dublin", region: "Ireland", label: "Dublin, Ireland", lat: 53.3498, lon: -6.2603 },
  { id: "c-edi", kind: "city", name: "Edinburgh", region: "United Kingdom", label: "Edinburgh, United Kingdom", lat: 55.9533, lon: -3.1883 },
  { id: "c-zur", kind: "city", name: "Zurich", region: "Switzerland", label: "Zurich, Switzerland", lat: 47.3769, lon: 8.5417 },
  { id: "c-gva", kind: "city", name: "Geneva", region: "Switzerland", label: "Geneva, Switzerland", lat: 46.2044, lon: 6.1432 },
  { id: "c-cph", kind: "city", name: "Copenhagen", region: "Denmark", label: "Copenhagen, Denmark", lat: 55.6761, lon: 12.5683 },
  { id: "c-sto", kind: "city", name: "Stockholm", region: "Sweden", label: "Stockholm, Sweden", lat: 59.3293, lon: 18.0686 },
  { id: "c-osl", kind: "city", name: "Oslo", region: "Norway", label: "Oslo, Norway", lat: 59.9139, lon: 10.7522 },
  { id: "c-hel", kind: "city", name: "Helsinki", region: "Finland", label: "Helsinki, Finland", lat: 60.1699, lon: 24.9384 },
  { id: "c-rey", kind: "city", name: "Reykjavik", region: "Iceland", label: "Reykjavik, Iceland", lat: 64.1466, lon: -21.9426 },
  { id: "c-war", kind: "city", name: "Warsaw", region: "Poland", label: "Warsaw, Poland", lat: 52.2297, lon: 21.0122 },
  { id: "c-bud", kind: "city", name: "Budapest", region: "Hungary", label: "Budapest, Hungary", lat: 47.4979, lon: 19.0402 },
  { id: "c-mos", kind: "city", name: "Moscow", region: "Russia", label: "Moscow, Russia", lat: 55.7558, lon: 37.6173 },
  { id: "c-bei", kind: "city", name: "Beijing", region: "China", label: "Beijing, China", lat: 39.9042, lon: 116.4074 },
  { id: "c-sha", kind: "city", name: "Shanghai", region: "China", label: "Shanghai, China", lat: 31.2304, lon: 121.4737 },
  { id: "c-tai", kind: "city", name: "Taipei", region: "Taiwan", label: "Taipei, Taiwan", lat: 25.033, lon: 121.5654 },
  { id: "c-auk", kind: "city", name: "Auckland", region: "New Zealand", label: "Auckland, New Zealand", lat: -36.8485, lon: 174.7633 },
  { id: "c-mrs", kind: "city", name: "Marrakech", region: "Morocco", label: "Marrakech, Morocco", lat: 31.6295, lon: -7.9811 },

  // ---- Airports (major hubs worldwide) ----
  { id: "a-jfk", kind: "airport", name: "John F. Kennedy Intl", region: "New York, US", label: "JFK — John F. Kennedy Intl", iata: "JFK", lat: 40.6413, lon: -73.7781 },
  { id: "a-lga", kind: "airport", name: "LaGuardia", region: "New York, US", label: "LGA — LaGuardia", iata: "LGA", lat: 40.7769, lon: -73.874 },
  { id: "a-ewr", kind: "airport", name: "Newark Liberty Intl", region: "New York, US", label: "EWR — Newark Liberty Intl", iata: "EWR", lat: 40.6895, lon: -74.1745 },
  { id: "a-lhr", kind: "airport", name: "Heathrow", region: "London, UK", label: "LHR — Heathrow", iata: "LHR", lat: 51.47, lon: -0.4543 },
  { id: "a-lgw", kind: "airport", name: "Gatwick", region: "London, UK", label: "LGW — Gatwick", iata: "LGW", lat: 51.1537, lon: -0.1821 },
  { id: "a-stn", kind: "airport", name: "Stansted", region: "London, UK", label: "STN — Stansted", iata: "STN", lat: 51.885, lon: 0.235 },
  { id: "a-cdg", kind: "airport", name: "Charles de Gaulle", region: "Paris, FR", label: "CDG — Charles de Gaulle", iata: "CDG", lat: 49.0097, lon: 2.5479 },
  { id: "a-ory", kind: "airport", name: "Orly", region: "Paris, FR", label: "ORY — Orly", iata: "ORY", lat: 48.7233, lon: 2.3794 },
  { id: "a-dxb", kind: "airport", name: "Dubai Intl", region: "Dubai, UAE", label: "DXB — Dubai Intl", iata: "DXB", lat: 25.2532, lon: 55.3657 },
  { id: "a-auh", kind: "airport", name: "Abu Dhabi Intl", region: "Abu Dhabi, UAE", label: "AUH — Abu Dhabi Intl", iata: "AUH", lat: 24.433, lon: 54.6511 },
  { id: "a-doh", kind: "airport", name: "Hamad Intl", region: "Doha, QA", label: "DOH — Hamad Intl", iata: "DOH", lat: 25.2731, lon: 51.608 },
  { id: "a-sin", kind: "airport", name: "Changi", region: "Singapore", label: "SIN — Changi", iata: "SIN", lat: 1.3644, lon: 103.9915 },
  { id: "a-hnd", kind: "airport", name: "Haneda", region: "Tokyo, JP", label: "HND — Haneda", iata: "HND", lat: 35.5494, lon: 139.7798 },
  { id: "a-nrt", kind: "airport", name: "Narita", region: "Tokyo, JP", label: "NRT — Narita", iata: "NRT", lat: 35.772, lon: 140.3929 },
  { id: "a-lax", kind: "airport", name: "Los Angeles Intl", region: "Los Angeles, US", label: "LAX — Los Angeles Intl", iata: "LAX", lat: 33.9416, lon: -118.4085 },
  { id: "a-sfo", kind: "airport", name: "San Francisco Intl", region: "San Francisco, US", label: "SFO — San Francisco Intl", iata: "SFO", lat: 37.6213, lon: -122.379 },
  { id: "a-ord", kind: "airport", name: "O'Hare", region: "Chicago, US", label: "ORD — O'Hare", iata: "ORD", lat: 41.9742, lon: -87.9073 },
  { id: "a-mia", kind: "airport", name: "Miami Intl", region: "Miami, US", label: "MIA — Miami Intl", iata: "MIA", lat: 25.7959, lon: -80.287 },
  { id: "a-atl", kind: "airport", name: "Hartsfield-Jackson Atlanta", region: "Atlanta, US", label: "ATL — Hartsfield-Jackson Atlanta", iata: "ATL", lat: 33.6407, lon: -84.4277 },
  { id: "a-dfw", kind: "airport", name: "Dallas/Fort Worth", region: "Dallas, US", label: "DFW — Dallas/Fort Worth", iata: "DFW", lat: 32.8998, lon: -97.0403 },
  { id: "a-den", kind: "airport", name: "Denver Intl", region: "Denver, US", label: "DEN — Denver Intl", iata: "DEN", lat: 39.8561, lon: -104.6737 },
  { id: "a-sea", kind: "airport", name: "Seattle-Tacoma", region: "Seattle, US", label: "SEA — Seattle-Tacoma", iata: "SEA", lat: 47.4502, lon: -122.3088 },
  { id: "a-bos", kind: "airport", name: "Boston Logan", region: "Boston, US", label: "BOS — Boston Logan", iata: "BOS", lat: 42.3656, lon: -71.0096 },
  { id: "a-las", kind: "airport", name: "Harry Reid Intl", region: "Las Vegas, US", label: "LAS — Harry Reid Intl", iata: "LAS", lat: 36.084, lon: -115.1537 },
  { id: "a-syd", kind: "airport", name: "Kingsford Smith", region: "Sydney, AU", label: "SYD — Kingsford Smith", iata: "SYD", lat: -33.9399, lon: 151.1753 },
  { id: "a-mel", kind: "airport", name: "Melbourne Tullamarine", region: "Melbourne, AU", label: "MEL — Melbourne Tullamarine", iata: "MEL", lat: -37.669, lon: 144.841 },
  { id: "a-hkg", kind: "airport", name: "Hong Kong Intl", region: "Hong Kong", label: "HKG — Hong Kong Intl", iata: "HKG", lat: 22.308, lon: 113.9185 },
  { id: "a-bkk", kind: "airport", name: "Suvarnabhumi", region: "Bangkok, TH", label: "BKK — Suvarnabhumi", iata: "BKK", lat: 13.69, lon: 100.7501 },
  { id: "a-ist", kind: "airport", name: "Istanbul Airport", region: "Istanbul, TR", label: "IST — Istanbul Airport", iata: "IST", lat: 41.2753, lon: 28.7519 },
  { id: "a-fra", kind: "airport", name: "Frankfurt", region: "Frankfurt, DE", label: "FRA — Frankfurt", iata: "FRA", lat: 50.0379, lon: 8.5622 },
  { id: "a-muc", kind: "airport", name: "Munich", region: "Munich, DE", label: "MUC — Munich", iata: "MUC", lat: 48.3538, lon: 11.7861 },
  { id: "a-ams", kind: "airport", name: "Schiphol", region: "Amsterdam, NL", label: "AMS — Schiphol", iata: "AMS", lat: 52.3105, lon: 4.7683 },
  { id: "a-mad", kind: "airport", name: "Madrid Barajas", region: "Madrid, ES", label: "MAD — Madrid Barajas", iata: "MAD", lat: 40.4936, lon: -3.5668 },
  { id: "a-bcn", kind: "airport", name: "Barcelona El Prat", region: "Barcelona, ES", label: "BCN — Barcelona El Prat", iata: "BCN", lat: 41.2974, lon: 2.0833 },
  { id: "a-fco", kind: "airport", name: "Rome Fiumicino", region: "Rome, IT", label: "FCO — Rome Fiumicino", iata: "FCO", lat: 41.8003, lon: 12.2389 },
  { id: "a-zrh", kind: "airport", name: "Zurich", region: "Zurich, CH", label: "ZRH — Zurich", iata: "ZRH", lat: 47.4647, lon: 8.5492 },
  { id: "a-cph", kind: "airport", name: "Copenhagen", region: "Copenhagen, DK", label: "CPH — Copenhagen", iata: "CPH", lat: 55.6181, lon: 12.6561 },
  { id: "a-arn", kind: "airport", name: "Stockholm Arlanda", region: "Stockholm, SE", label: "ARN — Stockholm Arlanda", iata: "ARN", lat: 59.6519, lon: 17.9186 },
  { id: "a-hel", kind: "airport", name: "Helsinki-Vantaa", region: "Helsinki, FI", label: "HEL — Helsinki-Vantaa", iata: "HEL", lat: 60.3172, lon: 24.9633 },
  { id: "a-yyz", kind: "airport", name: "Toronto Pearson", region: "Toronto, CA", label: "YYZ — Toronto Pearson", iata: "YYZ", lat: 43.6777, lon: -79.6248 },
  { id: "a-yvr", kind: "airport", name: "Vancouver Intl", region: "Vancouver, CA", label: "YVR — Vancouver Intl", iata: "YVR", lat: 49.1967, lon: -123.1815 },
  { id: "a-gru", kind: "airport", name: "São Paulo Guarulhos", region: "São Paulo, BR", label: "GRU — São Paulo Guarulhos", iata: "GRU", lat: -23.4356, lon: -46.4731 },
  { id: "a-eze", kind: "airport", name: "Buenos Aires Ezeiza", region: "Buenos Aires, AR", label: "EZE — Buenos Aires Ezeiza", iata: "EZE", lat: -34.8222, lon: -58.5358 },
  { id: "a-mex", kind: "airport", name: "Mexico City Intl", region: "Mexico City, MX", label: "MEX — Mexico City Intl", iata: "MEX", lat: 19.4363, lon: -99.0721 },
  { id: "a-del", kind: "airport", name: "Indira Gandhi Intl", region: "Delhi, IN", label: "DEL — Indira Gandhi Intl", iata: "DEL", lat: 28.5562, lon: 77.1 },
  { id: "a-bom", kind: "airport", name: "Chhatrapati Shivaji", region: "Mumbai, IN", label: "BOM — Chhatrapati Shivaji", iata: "BOM", lat: 19.0896, lon: 72.8656 },
  { id: "a-blr", kind: "airport", name: "Kempegowda Intl", region: "Bangalore, IN", label: "BLR — Kempegowda Intl", iata: "BLR", lat: 13.1986, lon: 77.7066 },
  { id: "a-icn", kind: "airport", name: "Incheon", region: "Seoul, KR", label: "ICN — Incheon", iata: "ICN", lat: 37.4602, lon: 126.4407 },
  { id: "a-kul", kind: "airport", name: "KLIA", region: "Kuala Lumpur, MY", label: "KUL — Kuala Lumpur Intl", iata: "KUL", lat: 2.7456, lon: 101.7099 },
  { id: "a-cgk", kind: "airport", name: "Soekarno-Hatta", region: "Jakarta, ID", label: "CGK — Soekarno-Hatta", iata: "CGK", lat: -6.1256, lon: 106.6559 },
  { id: "a-mnl", kind: "airport", name: "Ninoy Aquino Intl", region: "Manila, PH", label: "MNL — Ninoy Aquino Intl", iata: "MNL", lat: 14.5086, lon: 121.0198 },
  { id: "a-sgn", kind: "airport", name: "Tan Son Nhat", region: "Ho Chi Minh City, VN", label: "SGN — Tan Son Nhat", iata: "SGN", lat: 10.8188, lon: 106.6519 },
  { id: "a-pek", kind: "airport", name: "Beijing Capital", region: "Beijing, CN", label: "PEK — Beijing Capital", iata: "PEK", lat: 40.0801, lon: 116.5846 },
  { id: "a-pvg", kind: "airport", name: "Shanghai Pudong", region: "Shanghai, CN", label: "PVG — Shanghai Pudong", iata: "PVG", lat: 31.1443, lon: 121.8083 },
  { id: "a-cpt", kind: "airport", name: "Cape Town Intl", region: "Cape Town, ZA", label: "CPT — Cape Town Intl", iata: "CPT", lat: -33.9648, lon: 18.6017 },
  { id: "a-jnb", kind: "airport", name: "OR Tambo", region: "Johannesburg, ZA", label: "JNB — OR Tambo", iata: "JNB", lat: -26.1367, lon: 28.2411 },
  { id: "a-cai", kind: "airport", name: "Cairo Intl", region: "Cairo, EG", label: "CAI — Cairo Intl", iata: "CAI", lat: 30.1219, lon: 31.4056 },
  { id: "a-akl", kind: "airport", name: "Auckland", region: "Auckland, NZ", label: "AKL — Auckland", iata: "AKL", lat: -37.0082, lon: 174.785 },

  // ---- Hotels ----
  { id: "h-atl", kind: "hotel", name: "Atlantis The Palm", region: "Dubai, UAE", label: "Atlantis The Palm, Dubai" },
  { id: "h-brj", kind: "hotel", name: "Burj Al Arab", region: "Dubai, UAE", label: "Burj Al Arab Jumeirah, Dubai" },
  { id: "h-mbs", kind: "hotel", name: "Marina Bay Sands", region: "Singapore", label: "Marina Bay Sands, Singapore" },
  { id: "h-plz", kind: "hotel", name: "The Plaza", region: "New York, US", label: "The Plaza Hotel, New York" },
  { id: "h-ritzp", kind: "hotel", name: "Ritz Paris", region: "Paris, FR", label: "Ritz Paris" },
  { id: "h-savoy", kind: "hotel", name: "The Savoy", region: "London, UK", label: "The Savoy, London" },
  { id: "h-mand", kind: "hotel", name: "Mandarin Oriental", region: "Bangkok, TH", label: "Mandarin Oriental, Bangkok" },
  { id: "h-fair", kind: "hotel", name: "Fairmont", region: "San Francisco, US", label: "Fairmont San Francisco" },
  { id: "h-peninhk", kind: "hotel", name: "The Peninsula", region: "Hong Kong", label: "The Peninsula, Hong Kong" },
  { id: "h-bell", kind: "hotel", name: "Bellagio", region: "Las Vegas, US", label: "Bellagio, Las Vegas" },
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
/**
 * Precomputed normalized fields for each destination — computed once on module
 * load so `searchDestinations` never re-normalizes the dataset while typing.
 */
type Indexed = {
  d: Destination;
  name: string;
  region: string;
  label: string;
  iata: string;
};
const INDEX: Indexed[] = DESTINATIONS.map((d) => ({
  d,
  name: norm(d.name),
  region: norm(d.region),
  label: norm(d.label),
  iata: d.iata ? norm(d.iata) : "",
}));

/**
 * LRU-ish memoization keyed by (query|kinds|limit). Cuts repeat filters to
 * O(1) while the user backspaces, retypes, or focuses/blurs the field.
 */
const CACHE = new Map<string, Destination[]>();
const CACHE_MAX = 128;

export function searchDestinations(query: string, opts: SearchOptions = {}): Destination[] {
  const q = norm(query.trim());
  if (!q) return [];
  const kinds = opts.kinds;
  const limit = opts.limit ?? 8;

  const cacheKey = `${q}|${kinds ? kinds.slice().sort().join(",") : "*"}|${limit}`;
  const cached = CACHE.get(cacheKey);
  if (cached) {
    // Refresh LRU position.
    CACHE.delete(cacheKey);
    CACHE.set(cacheKey, cached);
    return cached;
  }

  type Scored = { d: Destination; score: number };
  const scored: Scored[] = [];

  for (const idx of INDEX) {
    if (kinds && !kinds.includes(idx.d.kind)) continue;

    let score = -1;
    if (idx.iata && idx.iata === q) score = 100;
    else if (idx.name === q) score = 90;
    else if (idx.iata && idx.iata.startsWith(q)) score = 80;
    else if (idx.name.startsWith(q)) score = 70;
    else if (idx.label.startsWith(q)) score = 60;
    else if (idx.name.includes(q)) score = 50;
    else if (idx.region.includes(q)) score = 30;
    else if (idx.label.includes(q)) score = 20;

    if (score >= 0) scored.push({ d: idx.d, score });
  }

  scored.sort((a, b) => b.score - a.score || a.d.name.length - b.d.name.length);
  const out = scored.slice(0, limit).map((s) => s.d);

  if (CACHE.size >= CACHE_MAX) {
    const firstKey = CACHE.keys().next().value;
    if (firstKey !== undefined) CACHE.delete(firstKey);
  }
  CACHE.set(cacheKey, out);
  return out;
}

/** Great-circle distance in km between two lat/lon pairs (haversine). */
export function distanceKm(aLat: number, aLon: number, bLat: number, bLon: number): number {
  const R = 6371;
  const toRad = (v: number) => (v * Math.PI) / 180;
  const dLat = toRad(bLat - aLat);
  const dLon = toRad(bLon - aLon);
  const s =
    Math.sin(dLat / 2) ** 2 +
    Math.cos(toRad(aLat)) * Math.cos(toRad(bLat)) * Math.sin(dLon / 2) ** 2;
  return 2 * R * Math.asin(Math.sqrt(s));
}

/**
 * Rank destinations by proximity to a given lat/lon. Only entries that carry
 * coordinates are considered (airports and most cities).
 */
export function nearestDestinations(
  lat: number,
  lon: number,
  opts: SearchOptions = {},
): Destination[] {
  const kinds = opts.kinds;
  const limit = opts.limit ?? 6;
  const scored: { d: Destination; dist: number }[] = [];
  for (const d of DESTINATIONS) {
    if (d.lat == null || d.lon == null) continue;
    if (kinds && !kinds.includes(d.kind)) continue;
    scored.push({ d, dist: distanceKm(lat, lon, d.lat, d.lon) });
  }
  scored.sort((a, b) => a.dist - b.dist);
  return scored.slice(0, limit).map((s) => s.d);
}

/** Popular destinations used as the default suggestions when the input is empty. */
export function popularDestinations(opts: SearchOptions = {}): Destination[] {
  const kinds = opts.kinds;
  const limit = opts.limit ?? 6;
  const popularIds = [
    "c-par", "c-lon", "c-nyc", "c-tok", "c-dxb", "c-bkk",
    "c-sin", "c-rom", "c-bcn", "c-bali", "c-mle", "c-syd",
    "a-jfk", "a-lhr", "a-cdg", "a-dxb", "a-sin", "a-hnd",
  ];
  const byId = new Map(DESTINATIONS.map((d) => [d.id, d]));
  const out: Destination[] = [];
  for (const id of popularIds) {
    const d = byId.get(id);
    if (!d) continue;
    if (kinds && !kinds.includes(d.kind)) continue;
    out.push(d);
    if (out.length >= limit) break;
  }
  return out;
}
