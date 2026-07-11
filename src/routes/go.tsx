import { createFileRoute } from "@tanstack/react-router";
import { useEffect, useMemo, useState } from "react";
import { ExternalLink, AlertTriangle, ShieldCheck, Plane, RefreshCw } from "lucide-react";
import { HOTEL_PROVIDERS, FLIGHT_PROVIDERS } from "@/lib/affiliates";
import { goSchema, type GoParams } from "@/lib/go-schema";
import { REDIRECT_MODE, AUTO_REDIRECT_DELAY_MS } from "@/lib/affiliate-config";
import { track } from "@/lib/analytics";
import { Button } from "@/components/ui/button";

/**
 * Dedicated affiliate redirect handler.
 *
 * Every /go query param is re-validated with zod and re-encoded into the
 * partner's deep-link URL, so the exact same destination / dates / travellers
 * / rooms / cabin class survive a browser refresh, a share of the /go URL,
 * and both "auto" and "confirm" redirect modes.
 *
 * Fallback chain: if the chosen partner's builder throws or produces a
 * malformed URL, we automatically walk the remaining partners in order and
 * open the first one that yields a valid http(s) URL. Only when NO partner
 * can be reached do we render the error card, showing exactly which param
 * caused the failure and a retry button.
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
      { title: "Comparing partners… — SkyCompare" },
      { name: "robots", content: "noindex, nofollow" },
    ],
  }),
  component: GoPage,
});

export type Alternative = { id: string; url: string; providerName: string };

export type BuildOk = {
  ok: true;
  url: string;
  providerId: string;
  providerName: string;
  data: GoParams;
  fallback?: Alternative;
  alternatives: Alternative[];
  /** Populated when the originally requested provider failed and we picked another. */
  usedFallback?: { originalProviderId: string; fallbackProviderId: string };
};
export type BuildErr = {
  ok: false;
  error: string;
  /** Which query param triggered the failure (e.g. "checkOut", "from"). */
  paramPath?: string;
  fallback?: Alternative;
  /** True when zod passed but every partner URL failed validation. */
  allProvidersFailed?: boolean;
};

/** Runtime guard: a valid, absolute http(s) URL under 2048 chars. */
export function isValidHttpUrl(u: string): boolean {
  if (typeof u !== "string" || u.length === 0 || u.length > 2048) return false;
  try {
    const parsed = new URL(u);
    return parsed.protocol === "http:" || parsed.protocol === "https:";
  } catch {
    return false;
  }
}

function safeBuild<T>(builder: (s: T) => string, s: T): string | null {
  try {
    const url = builder(s);
    return isValidHttpUrl(url) ? url : null;
  } catch {
    return null;
  }
}

export function buildTargetUrl(params: Search): BuildOk | BuildErr {
  const parsed = goSchema.safeParse(params);
  if (!parsed.success) {
    const first = parsed.error.issues[0];
    const paramPath = first?.path.join(".") || "input";
    return {
      ok: false,
      error: first ? `${paramPath}: ${first.message}` : "Invalid search parameters.",
      paramPath,
    };
  }
  const data = parsed.data;
  const pool = data.type === "hotel" ? HOTEL_PROVIDERS : FLIGHT_PROVIDERS;

  // Build every provider's URL up front so alternatives / fallback are ready.
  const built = pool
    .map((p) => ({ id: p.id, providerName: p.name, url: safeBuild(p.build as (x: GoParams) => string, data) }))
    .filter((x): x is Alternative => x.url !== null);

  if (built.length === 0) {
    return {
      ok: false,
      error: `We couldn't reach any partner for this ${data.type} search. Please adjust your search and try again.`,
      allProvidersFailed: true,
    };
  }

  // Prefer the requested provider, otherwise walk the pool in order (fallback chain).
  const orderedIds = [data.provider, ...pool.map((p) => p.id).filter((id) => id !== data.provider)];
  const chosen = orderedIds.map((id) => built.find((b) => b.id === id)).find(Boolean) as Alternative;

  const alternatives = built.filter((x) => x.id !== chosen.id);
  const usedFallback =
    chosen.id !== data.provider
      ? { originalProviderId: data.provider, fallbackProviderId: chosen.id }
      : undefined;

  return {
    ok: true,
    url: chosen.url,
    providerId: chosen.id,
    providerName: chosen.providerName,
    data,
    alternatives,
    fallback: alternatives[0],
    usedFallback,
  };
}

export function GoView({
  result,
  mode,
  onRetry,
}: {
  result: BuildOk | BuildErr;
  mode: "auto" | "confirm";
  onRetry?: () => void;
}) {
  if (!result.ok) {
    return (
      <main className="grid min-h-[100svh] place-items-center bg-background p-6">
        <div
          role="alert"
          data-testid="go-error"
          className="w-full max-w-md rounded-3xl border border-border bg-card p-8 text-center shadow-soft"
        >
          <AlertTriangle className="mx-auto mb-4 h-10 w-10 text-destructive" />
          <h1 className="text-xl font-bold">
            {result.allProvidersFailed
              ? "No partner could be reached"
              : "We couldn't build that link"}
          </h1>
          <p data-testid="go-error-message" className="mt-2 text-sm text-muted-foreground">
            {result.error}
          </p>
          {result.paramPath && (
            <p
              data-testid="go-error-param"
              className="mt-3 inline-block rounded-full border border-border bg-muted px-3 py-1 text-[11px] font-semibold uppercase tracking-wide text-muted-foreground"
            >
              Problem field: {result.paramPath}
            </p>
          )}
          <div className="mt-6 flex flex-col gap-2">
            {onRetry && (
              <Button
                data-testid="go-retry"
                onClick={onRetry}
                className="bg-gradient-brand text-primary-foreground shadow-brand"
              >
                <RefreshCw className="mr-2 h-4 w-4" /> Retry
              </Button>
            )}
            {result.fallback && (
              <Button asChild variant="outline">
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
            <Button asChild variant="ghost">
              <a href="/">Back to search</a>
            </Button>
          </div>
        </div>
      </main>
    );
  }

  if (mode === "confirm") {
    return (
      <main className="grid min-h-[100svh] place-items-center bg-background p-6">
        <div
          data-testid="go-confirm"
          className="w-full max-w-md rounded-3xl border border-border bg-card p-8 text-center shadow-soft"
        >
          <ShieldCheck className="mx-auto mb-4 h-10 w-10 text-primary" />
          <h1 className="text-xl font-bold">Continue to {result.providerName}</h1>
          <p className="mt-2 text-sm text-muted-foreground">
            You'll be taken to {result.providerName} to complete your search. Booking happens on
            their secure site — never here.
          </p>
          <div className="mt-6 flex flex-col gap-2">
            <Button asChild className="bg-gradient-brand text-primary-foreground shadow-brand">
              <a
                data-testid="continue-primary"
                href={result.url}
                target="_blank"
                rel="noopener noreferrer"
              >
                Continue to {result.providerName} <ExternalLink className="ml-2 h-4 w-4" />
              </a>
            </Button>
            {result.alternatives.length > 0 && (
              <div className="mt-4">
                <p className="mb-2 text-[11px] font-bold uppercase tracking-wide text-muted-foreground">
                  Or compare with
                </p>
                <div className="grid grid-cols-2 gap-2">
                  {result.alternatives.slice(0, 6).map((alt) => (
                    <a
                      key={alt.id}
                      data-testid={`alt-${alt.id}`}
                      href={alt.url}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="rounded-xl border border-border bg-background px-3 py-2 text-xs font-semibold text-foreground/80 transition hover:text-primary"
                    >
                      {alt.providerName}
                    </a>
                  ))}
                </div>
              </div>
            )}
            <Button asChild variant="ghost" className="mt-2">
              <a href="/">Back to search</a>
            </Button>
          </div>
        </div>
      </main>
    );
  }

  return <AutoSplash result={result} />;
}

/**
 * Rotating "comparing partners…" splash. Cycles every partner name every
 * ~350ms so users see we're checking multiple sources, then the effect in
 * GoPage triggers the actual redirect.
 */
function AutoSplash({ result }: { result: BuildOk }) {
  const names = useMemo(
    () => [result.providerName, ...result.alternatives.map((a) => a.providerName)],
    [result],
  );
  const [i, setI] = useState(0);
  useEffect(() => {
    const id = window.setInterval(() => setI((n) => (n + 1) % names.length), 350);
    return () => window.clearInterval(id);
  }, [names.length]);

  return (
    <main className="grid min-h-[100svh] place-items-center bg-background p-6">
      <div
        data-testid="go-loading"
        className="w-full max-w-md overflow-hidden rounded-3xl border border-border bg-card p-8 text-center shadow-soft"
      >
        <div className="relative mx-auto mb-6 h-16 w-16">
          <div className="absolute inset-0 animate-ping rounded-full bg-primary/20" />
          <div className="absolute inset-2 grid place-items-center rounded-full bg-gradient-brand text-primary-foreground shadow-brand">
            <Plane className="h-6 w-6 animate-pulse" />
          </div>
        </div>
        <h1 className="text-xl font-bold">Comparing partners…</h1>
        <div
          key={i}
          data-testid="rotating-partner"
          className="mt-3 animate-in fade-in slide-in-from-bottom-2 duration-300 text-sm font-semibold text-primary"
        >
          Checking {names[i]}
        </div>
        <p className="mt-4 text-xs text-muted-foreground">
          Opening the best match in a moment…
        </p>
        <noscript>
          <a href={result.url}>Continue to {result.providerName}</a>
        </noscript>
        <a
          data-testid="continue-link"
          href={result.url}
          rel="noopener noreferrer"
          className="mt-6 inline-block text-[11px] text-muted-foreground underline-offset-4 hover:underline"
        >
          Not redirected? Continue to {result.providerName}.
        </a>
      </div>
    </main>
  );
}

function GoPage() {
  const params = Route.useSearch();
  const [nonce, setNonce] = useState(0);
  const result = useMemo(() => buildTargetUrl(params), [params, nonce]);

  // Emit analytics for both the success and failure branches so provider
  // success rate and broken-format alerts stay observable end-to-end.
  useEffect(() => {
    if (!result.ok) {
      track(result.allProvidersFailed ? "redirect_all_failed" : "redirect_build_failed", {
        provider: typeof params.provider === "string" ? params.provider : undefined,
        type: params.type as "hotel" | "flight" | undefined,
        reason: result.error,
        paramPath: result.paramPath,
      });
      return;
    }
    track("redirect_attempt", {
      provider: result.providerId,
      type: result.data.type,
    });
    if (result.usedFallback) {
      track("redirect_fallback_used", {
        provider: result.usedFallback.originalProviderId,
        fallbackProvider: result.usedFallback.fallbackProviderId,
        type: result.data.type,
      });
    }
  }, [result, params]);

  useEffect(() => {
    if (!result.ok) return;
    if (REDIRECT_MODE !== "auto") return;
    if (typeof window === "undefined") return;
    const id = window.setTimeout(() => {
      track("redirect_success", { provider: result.providerId, type: result.data.type });
      window.location.replace(result.url);
    }, AUTO_REDIRECT_DELAY_MS);
    return () => window.clearTimeout(id);
  }, [result]);

  return <GoView result={result} mode={REDIRECT_MODE} onRetry={() => setNonce((n) => n + 1)} />;
}
