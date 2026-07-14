/**
 * Server function that validates /go query params and returns a KAYAK
 * deep-link URL with our KAYAK Partner Network tracking id (`a1aid`)
 * appended from process.env.KAYAK_API_KEY.
 *
 * Keeping the tracking id server-side means the raw affiliate key never
 * ships to the browser bundle.
 */
import { createServerFn } from "@tanstack/react-start";
import { goSchema } from "./go-schema";
import { buildKayakHotelUrl, buildKayakFlightUrl } from "./affiliates";

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

    const partnerId = process.env.KAYAK_API_KEY?.trim();

    try {
      const base =
        parsed.data.type === "hotel"
          ? buildKayakHotelUrl(parsed.data)
          : buildKayakFlightUrl(parsed.data);
      const url = new URL(base);
      if (partnerId) url.searchParams.set("a1aid", partnerId);
      return { ok: true, url: url.toString(), providerName: "KAYAK", type: parsed.data.type };
    } catch (err) {
      return {
        ok: false,
        error: err instanceof Error ? err.message : "Failed to build KAYAK URL.",
      };
    }
  });
