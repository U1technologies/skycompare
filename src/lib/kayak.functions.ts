/**
 * Server function that validates /go query params and returns a KAYAK
 * deep-link URL built from KAYAK's tracked redirect endpoint:
 *   https://<market domain>/in?a=<deeplink code>&lc=en&url=<relative KAYAK path>
 *
 * `a` is the "Deeplink integration code" from process.env.KAYAK_DEEPLINK_CODE
 * (Affiliate Network dashboard → Products → Text links) — this is what KAYAK
 * actually keys click/booking attribution on. Building it server-side just
 * keeps the code in one place; unlike a real API key it isn't secret, since
 * it ends up in plain sight in the redirect URL the browser navigates to.
 *
 * The market (which KAYAK domain) is resolved by resolveKayakMarket: an
 * explicit ?market= override, else the visitor's country from Cloudflare's
 * cf-ipcountry header, else "us". See kayak-markets.ts.
 */
import { createServerFn } from "@tanstack/react-start";
import { getRequestHeader } from "@tanstack/react-start/server";
import { goSchema } from "./go-schema";
import { buildKayakHotelUrl, buildKayakFlightUrl } from "./affiliates";
import { resolveKayakMarket } from "./kayak-markets";

export type BuildKayakResult =
  | { ok: true; url: string; providerName: "KAYAK"; type: "hotel" | "flight" }
  | { ok: false; error: string; paramPath?: string };

export const buildKayakRedirect = createServerFn({ method: "GET" })
  .inputValidator((input: Record<string, unknown>) => input)
  .handler(async ({ data }): Promise<BuildKayakResult> => {
    const parsed = goSchema.safeParse(data);
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
    const explicitMarket = typeof data.market === "string" ? data.market : undefined;
    const detectedCountry = getRequestHeader("cf-ipcountry");
    const { domain } = resolveKayakMarket(explicitMarket, detectedCountry);

    try {
      const relativePath =
        parsed.data.type === "hotel"
          ? buildKayakHotelUrl(parsed.data)
          : buildKayakFlightUrl(parsed.data);

      let url: string;
      if (deeplinkCode) {
        const redirect = new URL(`https://${domain}/in`);
        redirect.searchParams.set("a", deeplinkCode);
        redirect.searchParams.set("lc", "en");
        redirect.searchParams.set("url", relativePath);
        url = redirect.toString();
      } else {
        // No deeplink code configured (e.g. local dev) — fall back to a
        // plain, untracked KAYAK link so the redirect still works.
        url = new URL(relativePath, `https://${domain}`).toString();
      }

      return { ok: true, url, providerName: "KAYAK", type: parsed.data.type };
    } catch (err) {
      return {
        ok: false,
        error: err instanceof Error ? err.message : "Failed to build KAYAK URL.",
      };
    }
  });
