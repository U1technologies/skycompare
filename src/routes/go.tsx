import { createFileRoute } from "@tanstack/react-router";
import { useEffect, useMemo, useState } from "react";
import { motion } from "framer-motion";
import { ExternalLink, AlertTriangle, Check, Loader2 } from "lucide-react";
import { HOTEL_PROVIDERS, FLIGHT_PROVIDERS } from "@/lib/affiliates";
import { goSchema, type GoParams } from "@/lib/go-schema";
import { Button } from "@/components/ui/button";

/**
 * Dedicated affiliate redirect handler.
 *
 * URL shape:
 *   /go?type=hotel&provider=booking&destination=Paris&checkIn=2026-07-10&checkOut=2026-07-14&rooms=1&adults=2&children=0
 *   /go?type=flight&provider=kayak&tripType=round-trip&from=JFK&to=LHR&depart=2026-07-10&return=2026-07-17&travellers=1&cabin=economy
 *
 * The route:
 *  - Zod-validates every query parameter
 *  - Shows a "Comparing prices from KAYAK, Skyscanner, Agoda…" loading UI
 *  - Rebuilds a safe, fully-encoded affiliate deep-link
 *  - Auto-redirects (window.location.replace) after a short delay
 *  - On failure, offers a manual link to the requested partner AND a fallback
 *    partner so the user is never stuck.
 */

type Search = Record<string, string | undefined>;

export const Route = createFileRoute("/go")({
  validateSearch: (s: Record<string, unknown>): Search => {
    const out: Search = {};
    for (const [k, v] of Object.entries(s)) {
      if (v == null) continue;
      out[k] = String(v);
    }
    return out;
  },
  head: () => ({
    meta: [
      { title: "Comparing prices… — SkyCompare" },
      { name: "robots", content: "noindex, nofollow" },
    ],
  }),
  component: GoPage,
});

type BuildOk = {
  ok: true;
  url: string;
  providerName: string;
  data: GoParams;
  fallback?: { url: string; providerName: string };
};
type BuildErr = { ok: false; error: string; fallback?: { url: string; providerName: string } };

function buildTargetUrl(params: Search): BuildOk | BuildErr {
  const parsed = goSchema.safeParse(params);
  if (!parsed.success) {
    const first = parsed.error.issues[0];
    return { ok: false, error: first ? `${first.path.join(".") || "input"}: ${first.message}` : "Invalid search parameters." };
  }
  const data = parsed.data;

  try {
    if (data.type === "hotel") {
      const provider = HOTEL_PROVIDERS.find((p) => p.id === data.provider);
      if (!provider) {
        const fb = pickFallbackHotel(data.provider);
        return {
          ok: false,
          error: `Unknown hotel provider: ${data.provider}`,
          fallback: fb ? { url: fb.build(data), providerName: fb.name } : undefined,
        };
      }
      const url = provider.build(data);
      const fb = pickFallbackHotel(provider.id);
      return {
        ok: true,
        url,
        providerName: provider.name,
        data,
        fallback: fb ? { url: fb.build(data), providerName: fb.name } : undefined,
      };
    }

    const provider = FLIGHT_PROVIDERS.find((p) => p.id === data.provider);
    if (!provider) {
      const fb = pickFallbackFlight(data.provider);
      return {
        ok: false,
        error: `Unknown flight provider: ${data.provider}`,
        fallback: fb ? { url: fb.build(data), providerName: fb.name } : undefined,
      };
    }
    const url = provider.build(data);
    const fb = pickFallbackFlight(provider.id);
    return {
      ok: true,
      url,
      providerName: provider.name,
      data,
      fallback: fb ? { url: fb.build(data), providerName: fb.name } : undefined,
    };
  } catch (e) {
    return {
      ok: false,
      error: `Couldn't build that link: ${e instanceof Error ? e.message : "unknown error"}`,
    };
  }
}

function pickFallbackHotel(excludeId: string) {
  return HOTEL_PROVIDERS.find((p) => p.id !== excludeId);
}
function pickFallbackFlight(excludeId: string) {
  return FLIGHT_PROVIDERS.find((p) => p.id !== excludeId);
}

const LOADING_PARTNERS = ["KAYAK", "Skyscanner", "Booking.com", "Agoda", "Expedia", "Trip.com"];

function GoPage() {
  const params = Route.useSearch();
  const result = useMemo(() => buildTargetUrl(params), [params]);
  const [step, setStep] = useState(0);

  useEffect(() => {
    if (!result.ok) return;
    if (typeof window === "undefined") return;
    const stepper = setInterval(
      () => setStep((s) => Math.min(LOADING_PARTNERS.length, s + 1)),
      280,
    );
    const redirect = setTimeout(() => window.location.replace(result.url), 2200);
    return () => {
      clearInterval(stepper);
      clearTimeout(redirect);
    };
  }, [result]);

  if (!result.ok) {
    return (
      <main className="grid min-h-[100svh] place-items-center bg-background p-6">
        <div className="w-full max-w-md rounded-3xl border border-border bg-card p-8 text-center shadow-soft">
          <AlertTriangle className="mx-auto mb-4 h-10 w-10 text-destructive" />
          <h1 className="text-xl font-bold">We couldn't build that link</h1>
          <p className="mt-2 text-sm text-muted-foreground">{result.error}</p>
          <div className="mt-6 flex flex-col gap-2">
            {result.fallback && (
              <Button asChild className="bg-gradient-brand text-primary-foreground shadow-brand">
                <a href={result.fallback.url} target="_blank" rel="noopener noreferrer">
                  Try {result.fallback.providerName} instead <ExternalLink className="ml-2 h-4 w-4" />
                </a>
              </Button>
            )}
            <Button asChild variant="outline">
              <a href="/">Back to search</a>
            </Button>
          </div>
        </div>
      </main>
    );
  }

  return (
    <main className="grid min-h-[100svh] place-items-center bg-background p-6">
      <div className="w-full max-w-lg rounded-3xl border border-border bg-card p-8 text-center shadow-soft">
        <div className="mx-auto mb-6 grid h-14 w-14 place-items-center rounded-2xl bg-gradient-brand text-primary-foreground shadow-brand">
          <Loader2 className="h-6 w-6 animate-spin" />
        </div>
        <h1 className="text-2xl font-extrabold tracking-tight">
          Comparing prices from top partners
        </h1>
        <p className="mt-2 text-sm text-muted-foreground">
          Finding the best deal for your trip on{" "}
          <span className="font-semibold text-foreground">{result.providerName}</span>.
        </p>

        <ul className="mt-6 space-y-2 text-left">
          {LOADING_PARTNERS.map((name, i) => {
            const done = i < step;
            return (
              <motion.li
                key={name}
                initial={{ opacity: 0, x: -8 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: i * 0.08 }}
                className="flex items-center justify-between rounded-xl bg-secondary/60 px-4 py-2.5 text-sm"
              >
                <span className="font-semibold text-foreground/80">{name}</span>
                {done ? (
                  <span className="flex items-center gap-1 text-xs font-semibold text-primary">
                    <Check className="h-3.5 w-3.5" /> Compared
                  </span>
                ) : (
                  <Loader2 className="h-3.5 w-3.5 animate-spin text-muted-foreground" />
                )}
              </motion.li>
            );
          })}
        </ul>

        <div className="mt-6 flex flex-col gap-2">
          <Button
            asChild
            className="bg-gradient-brand text-primary-foreground shadow-brand"
          >
            <a href={result.url} rel="noopener noreferrer">
              Continue to {result.providerName} <ExternalLink className="ml-2 h-4 w-4" />
            </a>
          </Button>
          {result.fallback && (
            <Button asChild variant="ghost" size="sm">
              <a href={result.fallback.url} target="_blank" rel="noopener noreferrer">
                Also check {result.fallback.providerName} →
              </a>
            </Button>
          )}
        </div>
      </div>
    </main>
  );
}
