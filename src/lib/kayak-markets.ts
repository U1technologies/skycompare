/**
 * KAYAK operates region-specific domains (kayak.co.uk, kayak.fr, kayak.de, ...).
 * Sending a visitor to the domain matching their market keeps them on a
 * results page in their own currency/locale instead of always kayak.com.
 *
 * Market resolution order (see resolveKayakMarket): an explicit `market`
 * override (e.g. a marketing link with ?market=uk, useful for QA too) wins
 * over the visitor's detected country (Cloudflare's cf-ipcountry header),
 * which wins over the "us" default.
 */

export const KAYAK_DOMAINS: Record<string, string> = {
  ar: "kayak.com.ar",
  au: "kayak.com.au",
  at: "at.kayak.com",
  be: "be.kayak.com",
  bo: "kayak.bo",
  br: "kayak.com.br",
  ca: "ca.kayak.com",
  cat: "kayak.cat",
  cl: "kayak.cl",
  cn: "cn.kayak.com",
  co: "kayak.com.co",
  cr: "kayak.co.cr",
  cz: "cz.kayak.com",
  dk: "kayak.dk",
  do: "kayak.com.do",
  ec: "kayak.com.ec",
  sv: "kayak.com.sv",
  ee: "www.kayak.com",
  fi: "fi.kayak.com",
  fr: "kayak.fr",
  de: "kayak.de",
  gr: "gr.kayak.com",
  gt: "kayak.com.gt",
  hn: "kayak.com.hn",
  hk: "kayak.com.hk",
  in: "kayak.co.in",
  id: "kayak.co.id",
  ie: "kayak.ie",
  il: "il.kayak.com",
  it: "kayak.it",
  jp: "kayak.co.jp",
  my: "kayak.com.my",
  mx: "kayak.com.mx",
  nl: "kayak.nl",
  nz: "nz.kayak.com",
  ni: "kayak.com.ni",
  no: "kayak.no",
  pa: "kayak.com.pa",
  py: "kayak.com.py",
  pe: "kayak.com.pe",
  ph: "kayak.com.ph",
  pl: "kayak.pl",
  pt: "kayak.pt",
  pr: "kayak.com.pr",
  qa: "www.kayak.com",
  ro: "ro.kayak.com",
  sa: "en.kayak.sa",
  sg: "kayak.sg",
  za: "za.kayak.com",
  kr: "kayak.co.kr",
  es: "kayak.es",
  se: "kayak.se",
  ch: "kayak.ch",
  tw: "tw.kayak.com",
  th: "kayak.co.th",
  tr: "kayak.com.tr",
  ua: "ua.kayak.com",
  ae: "kayak.ae",
  uk: "kayak.co.uk",
  gb: "kayak.co.uk",
  us: "www.kayak.com",
  uy: "kayak.com.uy",
  ve: "kayak.co.ve",
  vn: "vn.kayak.com",
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
