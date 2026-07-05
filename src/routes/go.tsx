import { createFileRoute } from "@tanstack/react-router";
import { useEffect, useMemo } from "react";
import { ExternalLink, AlertTriangle } from "lucide-react";
import { HOTEL_PROVIDERS, FLIGHT_PROVIDERS } from "@/lib/affiliates";
import { goSchema, type GoParams } from "@/lib/go-schema";
import { Button } from "@/components/ui/button";

/**
 * Dedicated affiliate redirect handler.
 *
 * Redirects immediately to the partner (no loading/comparing UI). If link
 * generation fails, shows a friendly error page with a fallback partner link.
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

type BuildOk = {
  ok: true;
  url: string;
  providerName: string;
  data: GoParams;
  fallback?: { url: string; providerName: string };
};
type BuildErr = { ok: false; error: string; fallback?: { url: string; providerName: string } };

export function buildTargetUrl(params: Search): BuildOk | BuildErr {
  const parsed = goSchema.safeParse(params);
  if (!parsed.success) {
    const first = parsed.error.issues[0];
    return {
      ok: false,
      error: first
        ? `${first.path.join(".") || "input"}: ${first.message}`
        : "Invalid search parameters.",
    };
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

function GoPage() {
  const params = Route.useSearch();
  const result = useMemo(() => buildTargetUrl(params), [params]);

  useEffect(() => {
    if (!result.ok) return;
    if (typeof window === "undefined") return;
    window.location.replace(result.url);
  }, [result]);

  if (!result.ok) {
    return (
      <main className="grid min-h-[100svh] place-items-center bg-background p-6">
        <div
          role="alert"
          data-testid="go-error"
          className="w-full max-w-md rounded-3xl border border-border bg-card p-8 text-center shadow-soft"
        >
          <AlertTriangle className="mx-auto mb-4 h-10 w-10 text-destructive" />
          <h1 className="text-xl font-bold">We couldn't build that link</h1>
          <p className="mt-2 text-sm text-muted-foreground">{result.error}</p>
          <div className="mt-6 flex flex-col gap-2">
            {result.fallback && (
              <Button asChild className="bg-gradient-brand text-primary-foreground shadow-brand">
                <a
                  data-testid="fallback-link"
                  href={result.fallback.url}
                  target="_blank"
                  rel="noopener noreferrer"
                >
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
      <noscript>
        <a href={result.url}>Continue to {result.providerName}</a>
      </noscript>
      <a
        data-testid="continue-link"
        href={result.url}
        rel="noopener noreferrer"
        className="text-sm text-muted-foreground underline-offset-4 hover:underline"
      >
        If you're not redirected automatically, continue to {result.providerName}.
      </a>
    </main>
  );
}
