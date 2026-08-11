/**
 * Pure KAYAK deep-link builder.
 *
 * Kept free of request-context and server-function plumbing so the same logic
 * can run in two places:
 *   - the /go GET route handler (src/routes/go.tsx), which answers the browser
 *     with a 302 straight to KAYAK — no HTML, no JS, no interstitial;
 *   - the buildKayakRedirect server function (src/lib/kayak.functions.ts),
 *     which the /go component still uses for the "confirm" mode and for the
 *     "we couldn't build that link" error page.
 *
 * The final URL uses KAYAK's tracked redirect endpoint:
 *   https://<market domain>/in?a=<deeplink code>&lc=en&url=<relative KAYAK path>
 *
 * `a` is the "Deeplink integration code" from process.env.KAYAK_DEEPLINK_CODE
 * (Affiliate Network dashboard → Products → Text links) — this is what KAYAK
 * actually keys click/booking attribution on. Building it server-side just
 * keeps the code in one place; unlike a real API key it isn't secret, since
 * it ends up in plain sight in the redirect URL the browser navigates to.
 *
 * The market (which KAYAK domain) is resolved by resolveKayakMarket: an
 * explicit `market` param override, else the visitor's country from
 * Cloudflare's cf-ipcountry header, else "us". See kayak-markets.ts.
 */
import { goSchema } from "./go-schema";
import { buildKayakHotelLink, buildKayakFlightLink } from "./affiliates";
import { resolveKayakMarket } from "./kayak-markets";

export type BuildKayakResult =
  | { ok: true; url: string; providerName: "KAYAK"; type: "hotel" | "flight" }
  | { ok: false; error: string; paramPath?: string };

/**
 * Validate /go search params and build the KAYAK URL to send the visitor to.
 *
 * @param input           raw /go query params (unvalidated)
 * @param detectedCountry visitor country from the cf-ipcountry request header
 */
export function buildKayakUrl(
  input: Record<string, unknown>,
  detectedCountry?: string,
): BuildKayakResult {
  const parsed = goSchema.safeParse(input);
  if (!parsed.success) {
    const first = parsed.error.issues[0];
    const paramPath = first?.path.join(".") || "input";
    return {
      ok: false,
      error: first ? `${paramPath}: ${first.message}` : "Invalid search parameters.",
      paramPath,
    };
  }

  const deeplinkCode = process.env.KAYAK_DEEPLINK_CODE?.trim();
  const explicitMarket = typeof input.market === "string" ? input.market : undefined;
  const { domain } = resolveKayakMarket(explicitMarket, detectedCountry);

  try {
    const linkContext = { domain, deeplinkCode };
    const url =
      parsed.data.type === "hotel"
        ? buildKayakHotelLink(parsed.data, linkContext)
        : buildKayakFlightLink(parsed.data, linkContext);

    return { ok: true, url, providerName: "KAYAK", type: parsed.data.type };
  } catch (err) {
    return {
      ok: false,
      error: err instanceof Error ? err.message : "Failed to build KAYAK URL.",
    };
  }
}
