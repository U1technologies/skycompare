/**
 * Server functions for the KAYAK handoff.
 *
 * Both exist because the final link depends on two things the browser cannot
 * know by itself: the deeplink code in process.env.KAYAK_DEEPLINK_CODE, and the
 * visitor's country from Cloudflare's cf-ipcountry request header.
 */
import { createServerFn } from "@tanstack/react-start";
import { getRequestHeader, getRequestUrl } from "@tanstack/react-start/server";
import { buildKayakUrl } from "./kayak-redirect";
import { resolveKayakMarket } from "./kayak-markets";
import type { KayakLinkContext } from "./affiliates";

export type { BuildKayakResult } from "./kayak-redirect";

/**
 * Resolve this visitor's KAYAK market and our deeplink code, once, while the
 * page is being server-rendered. The root route loads this and hands it to the
 * app (see KayakLinkProvider), which lets the search buttons carry a finished
 * KAYAK href — so clicking Search is a plain link click with no request to us
 * in the way.
 *
 * The deeplink code does reach the browser this way. That is acceptable: it is
 * already public, appearing in the address bar of every visitor we send to
 * KAYAK. The Autocomplete API key is the secret one and stays server-side.
 */
export const getKayakLinkContext = createServerFn({ method: "GET" }).handler(
  async (): Promise<KayakLinkContext> => {
    // ?market=uk overrides the detected country, which makes QA of a specific
    // market possible without a VPN. Read from the request rather than route
    // search params so it works the same on every page.
    const explicitMarket = getRequestUrl().searchParams.get("market");
    const { domain } = resolveKayakMarket(explicitMarket, getRequestHeader("cf-ipcountry"));

    return { domain, deeplinkCode: process.env.KAYAK_DEEPLINK_CODE?.trim() || undefined };
  },
);

/**
 * Build the redirect target for the /go route's page component — the "confirm"
 * mode and the "we couldn't build that link" error card. The happy path never
 * reaches this: /go's GET handler answers with a 302 before React is involved.
 */
export const buildKayakRedirect = createServerFn({ method: "GET" })
  .validator((input: Record<string, unknown>) => input)
  .handler(async ({ data }) => buildKayakUrl(data, getRequestHeader("cf-ipcountry")));
