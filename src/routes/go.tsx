import { createFileRoute } from "@tanstack/react-router";
import { useEffect, useMemo, useState } from "react";
import { Loader2, ExternalLink, AlertTriangle } from "lucide-react";
import {
  HOTEL_PROVIDERS,
  FLIGHT_PROVIDERS,
  type HotelSearch,
  type FlightSearch,
} from "@/lib/affiliates";
import { Button } from "@/components/ui/button";

/**
 * Dedicated affiliate redirect handler.
 *
 * URL shape:
 *   /go?type=hotel&provider=booking&destination=Paris&checkIn=2026-07-10&checkOut=2026-07-14&rooms=1&adults=2&children=0
 *   /go?type=flight&provider=kayak&tripType=round-trip&from=JFK&to=LHR&depart=2026-07-10&return=2026-07-17&travellers=1&cabin=economy
 *
 * The route:
 *  - Parses & validates all search params
 *  - Rebuilds a safe, fully-encoded affiliate deep-link
 *  - Auto-redirects (window.location.replace) after a short delay
 *  - Falls back to a manual "Continue" button if the browser blocks it
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
      { title: "Redirecting… — SkyCompare" },
      { name: "robots", content: "noindex, nofollow" },
    ],
  }),
  component: GoPage,
});

function buildTargetUrl(params: Search): { url: string; providerName: string } | { error: string } {
  const type = params.type;
  const providerId = params.provider;
  if (!type || !providerId) return { error: "Missing type or provider." };

  if (type === "hotel") {
    const provider = HOTEL_PROVIDERS.find((p) => p.id === providerId);
    if (!provider) return { error: `Unknown hotel provider: ${providerId}` };

    const s: HotelSearch = {
      destination: (params.destination ?? "").trim(),
      checkIn: params.checkIn ?? "",
      checkOut: params.checkOut ?? "",
      rooms: clampInt(params.rooms, 1, 8, 1),
      adults: clampInt(params.adults, 1, 16, 2),
      children: clampInt(params.children, 0, 8, 0),
    };
    if (!s.destination) return { error: "Missing destination." };
    if (!isValidDate(s.checkIn) || !isValidDate(s.checkOut))
      return { error: "Invalid check-in / check-out date." };
    if (new Date(s.checkOut) <= new Date(s.checkIn))
      return { error: "Check-out must be after check-in." };

    return { url: provider.build(s), providerName: provider.name };
  }

  if (type === "flight") {
    const provider = FLIGHT_PROVIDERS.find((p) => p.id === providerId);
    if (!provider) return { error: `Unknown flight provider: ${providerId}` };

    const tripType: FlightSearch["tripType"] =
      params.tripType === "one-way" ? "one-way" : "round-trip";
    const cabin: FlightSearch["cabin"] =
      (["economy", "premium", "business", "first"] as const).find((c) => c === params.cabin) ??
      "economy";

    const s: FlightSearch = {
      tripType,
      from: (params.from ?? "").trim().toUpperCase(),
      to: (params.to ?? "").trim().toUpperCase(),
      depart: params.depart ?? "",
      return: params.return || undefined,
      travellers: clampInt(params.travellers, 1, 9, 1),
      cabin,
    };
    if (!s.from || !s.to) return { error: "Missing From / To airport." };
    if (!isValidDate(s.depart)) return { error: "Invalid departure date." };
    if (tripType === "round-trip") {
      if (!s.return || !isValidDate(s.return))
        return { error: "Invalid return date." };
      if (new Date(s.return) <= new Date(s.depart))
        return { error: "Return must be after departure." };
    }
    return { url: provider.build(s), providerName: provider.name };
  }

  return { error: `Unknown search type: ${type}` };
}

function clampInt(v: string | undefined, min: number, max: number, fallback: number) {
  const n = Number.parseInt(v ?? "", 10);
  if (!Number.isFinite(n)) return fallback;
  return Math.min(max, Math.max(min, n));
}

function isValidDate(v: string) {
  return /^\d{4}-\d{2}-\d{2}$/.test(v) && !Number.isNaN(new Date(v).getTime());
}

function GoPage() {
  const params = Route.useSearch();
  const result = useMemo(() => buildTargetUrl(params), [params]);
  const [countdown, setCountdown] = useState(2);

  useEffect(() => {
    if ("error" in result) return;
    if (typeof window === "undefined") return;
    const t = setTimeout(() => window.location.replace(result.url), 1200);
    const i = setInterval(() => setCountdown((c) => Math.max(0, c - 1)), 1000);
    return () => {
      clearTimeout(t);
      clearInterval(i);
    };
  }, [result]);

  if ("error" in result) {
    return (
      <main className="grid min-h-[100svh] place-items-center bg-background p-6">
        <div className="w-full max-w-md rounded-3xl border border-border bg-card p-8 text-center shadow-soft">
          <AlertTriangle className="mx-auto mb-4 h-10 w-10 text-destructive" />
          <h1 className="text-xl font-bold">Can't build that link</h1>
          <p className="mt-2 text-sm text-muted-foreground">{result.error}</p>
          <Button asChild className="mt-6 bg-gradient-brand text-primary-foreground">
            <a href="/">Back to search</a>
          </Button>
        </div>
      </main>
    );
  }

  return (
    <main className="grid min-h-[100svh] place-items-center bg-background p-6">
      <div className="w-full max-w-md rounded-3xl border border-border bg-card p-8 text-center shadow-soft">
        <Loader2 className="mx-auto mb-4 h-10 w-10 animate-spin text-primary" />
        <h1 className="text-xl font-bold">
          Redirecting to <span className="text-gradient-brand">{result.providerName}</span>
        </h1>
        <p className="mt-2 text-sm text-muted-foreground">
          Opening in {countdown}s. If nothing happens, tap continue.
        </p>
        <Button
          asChild
          className="mt-6 bg-gradient-brand text-primary-foreground shadow-brand"
        >
          <a href={result.url} rel="noopener noreferrer">
            Continue to {result.providerName} <ExternalLink className="ml-2 h-4 w-4" />
          </a>
        </Button>
        <p className="mt-4 break-all text-[11px] text-muted-foreground/70">{result.url}</p>
      </div>
    </main>
  );
}
