/**
 * KAYAK operates region-specific domains (kayak.co.uk, kayak.fr, kayak.de, ...).
 * Sending a visitor to the domain matching their market keeps them on a
 * results page in their own currency/locale instead of always kayak.com.
 *
 * Market resolution order (see resolveKayakMarket): an explicit `market`
 * override (e.g. a marketing link with ?market=uk, useful for QA too) wins
 * over the visitor's detected country (Cloudflare's cf-ipcountry header),
 * which wins over the "us" default.
 *
 * KEEP THE `www.` PREFIXES. Every host below was checked against KAYAK: the
 * bare form (kayak.co.in, at.kayak.com, ...) answers with a 301 to the www
 * form, so dropping it costs the visitor an entire extra round trip to KAYAK
 * before their results page even starts loading. These are KAYAK's own
 * canonical hostnames, taken from the Location header they send back, not a
 * convention we invented. Two exceptions on purpose: "cn" stays
 * cn.kayak.com because it redirects to www.kayak.com — a different market, not
 * a www fix — and "us"/"ee"/"qa" were already canonical.
 */

export const KAYAK_DOMAINS: Record<string, string> = {
  ar: "www.kayak.com.ar",
  au: "www.kayak.com.au",
  at: "www.at.kayak.com",
  be: "www.be.kayak.com",
  bo: "www.kayak.bo",
  br: "www.kayak.com.br",
  ca: "www.ca.kayak.com",
  cat: "www.kayak.cat",
  cl: "www.kayak.cl",
  cn: "cn.kayak.com",
  co: "www.kayak.com.co",
  cr: "www.kayak.co.cr",
  cz: "www.cz.kayak.com",
  dk: "www.kayak.dk",
  do: "www.kayak.com.do",
  ec: "www.kayak.com.ec",
  sv: "www.kayak.com.sv",
  ee: "www.kayak.com",
  fi: "www.fi.kayak.com",
  fr: "www.kayak.fr",
  de: "www.kayak.de",
  gr: "www.gr.kayak.com",
  gt: "www.kayak.com.gt",
  hn: "www.kayak.com.hn",
  hk: "www.kayak.com.hk",
  in: "www.kayak.co.in",
  id: "www.kayak.co.id",
  ie: "www.kayak.ie",
  il: "www.il.kayak.com",
  it: "www.kayak.it",
  jp: "www.kayak.co.jp",
  my: "www.kayak.com.my",
  mx: "www.kayak.com.mx",
  nl: "www.kayak.nl",
  nz: "www.nz.kayak.com",
  ni: "www.kayak.com.ni",
  no: "www.kayak.no",
  pa: "www.kayak.com.pa",
  py: "www.kayak.com.py",
  pe: "www.kayak.com.pe",
  ph: "www.kayak.com.ph",
  pl: "www.kayak.pl",
  pt: "www.kayak.pt",
  pr: "www.kayak.com.pr",
  qa: "www.kayak.com",
  ro: "www.ro.kayak.com",
  sa: "www.en.kayak.sa",
  sg: "www.kayak.sg",
  za: "www.za.kayak.com",
  kr: "www.kayak.co.kr",
  es: "www.kayak.es",
  se: "www.kayak.se",
  ch: "www.kayak.ch",
  tw: "www.tw.kayak.com",
  th: "www.kayak.co.th",
  tr: "www.kayak.com.tr",
  ua: "www.ua.kayak.com",
  ae: "www.kayak.ae",
  uk: "www.kayak.co.uk",
  gb: "www.kayak.co.uk",
  us: "www.kayak.com",
  uy: "www.kayak.com.uy",
  ve: "www.kayak.co.ve",
  vn: "www.vn.kayak.com",
};

/** Friendly names accepted in a manual ?market= override, mapped to the codes above. */
const MARKET_ALIASES: Record<string, string> = {
  argentina: "ar", australia: "au", austria: "at", belgium: "be", bolivia: "bo", brazil: "br", canada: "ca",
  catalonia: "cat", chile: "cl", china: "cn", colombia: "co", costa_rica: "cr", czech_republic: "cz", denmark: "dk",
  dominican_republic: "do", ecuador: "ec", el_salvador: "sv", estonia: "ee", finland: "fi", france: "fr", germany: "de",
  greece: "gr", guatemala: "gt", honduras: "hn", hong_kong: "hk", india: "in", indonesia: "id", ireland: "ie", israel: "il",
  italy: "it", japan: "jp", malaysia: "my", mexico: "mx", netherlands: "nl", new_zealand: "nz", nicaragua: "ni", norway: "no",
  panama: "pa", paraguay: "py", peru: "pe", philippines: "ph", poland: "pl", portugal: "pt", puerto_rico: "pr", qatar: "qa",
  romania: "ro", saudi_arabia: "sa", singapore: "sg", south_africa: "za", south_korea: "kr", spain: "es", sweden: "se",
  switzerland: "ch", taiwan: "tw", thailand: "th", turkey: "tr", ukraine: "ua", united_arab_emirates: "ae", uae: "ae",
  united_kingdom: "uk", great_britain: "gb", england: "uk", united_states: "us", usa: "us", america: "us", uruguay: "uy",
  venezuela: "ve", vietnam: "vn",
};

const DEFAULT_MARKET = "us";

function normalize(value: string | undefined | null): string {
  return String(value || "").trim().toLowerCase().replace(/[-\s]+/g, "_");
}

/** Resolve a raw value (ISO country code, alias, or garbage) to a known market code. */
function toKnownMarketCode(value: string | undefined | null): string | undefined {
  const normalized = normalize(value);
  const code = MARKET_ALIASES[normalized] || normalized;
  return KAYAK_DOMAINS[code] ? code : undefined;
}

export type KayakMarket = { code: string; domain: string };

/**
 * Resolve which KAYAK domain a visitor should be redirected to.
 * Priority: explicit override > detected country > "us" default.
 */
export function resolveKayakMarket(
  explicitMarket: string | undefined | null,
  detectedCountry: string | undefined | null,
): KayakMarket {
  const code = toKnownMarketCode(explicitMarket) ?? toKnownMarketCode(detectedCountry) ?? DEFAULT_MARKET;
  return { code, domain: KAYAK_DOMAINS[code] };
}
