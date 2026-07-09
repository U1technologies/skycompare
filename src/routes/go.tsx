import { createFileRoute } from "@tanstack/react-router";
import { useEffect, useMemo, useState } from "react";
import { ExternalLink, AlertTriangle, ShieldCheck, Plane } from "lucide-react";
import { HOTEL_PROVIDERS, FLIGHT_PROVIDERS } from "@/lib/affiliates";
import { goSchema, type GoParams } from "@/lib/go-schema";
import { REDIRECT_MODE, AUTO_REDIRECT_DELAY_MS } from "@/lib/affiliate-config";
import { Button } from "@/components/ui/button";

/**
 * Dedicated affiliate redirect handler.
 *
 * Every /go query param is re-validated with zod and re-encoded into the
 * partner's deep-link URL, so the exact same destination / dates / travellers
 * / rooms / cabin class survive a browser refresh, a share of the /go URL,
 * and both "auto" and "confirm" redirect modes.
 *
 * If the built URL is malformed (not a valid http(s) URL) or the builder
 * throws, we fall back to another partner and surface a clear message —
 * we never silently open a broken link.
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
  providerName: string;
  data: GoParams;
  fallback?: Alternative;
  alternatives: Alternative[];
};
export type BuildErr = { ok: false; error: string; fallback?: Alternative };

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
    return {
      ok: false,
      error: first
        ? `${first.path.join(".") || "input"}: ${first.message}`
        : "Invalid search parameters.",
    };
  }
  const data = parsed.data;
  const pool = data.type === "hotel" ? HOTEL_PROVIDERS : FLIGHT_PROVIDERS;

  const primary = pool.find((p) => p.id === data.provider);

  // Build every provider's URL up front so alternatives / fallback are ready.
  const built = pool
    .map((p) => ({ id: p.id, providerName: p.name, url: safeBuild(p.build as (x: GoParams) => string, data) }))
    .filter((x): x is Alternative => x.url !== null);

  if (!primary) {
    const fb = built.find((x) => x.id !== data.provider);
    return {
      ok: false,
      error: `Unknown ${data.type} provider: ${data.provider}`,
      fallback: fb,
    };
  }

  const primaryEntry = built.find((x) => x.id === primary.id);
  if (!primaryEntry) {
    // Primary produced an invalid URL — fall through to first working alt.
    const fb = built[0];
    return {
      ok: false,
      error: `We couldn't generate a valid link for ${primary.name}.`,
      fallback: fb,
    };
  }

  const alternatives = built.filter((x) => x.id !== primary.id);
  return {
    ok: true,
    url: primaryEntry.url,
    providerName: primary.name,
    data,
    alternatives,
    fallback: alternatives[0],
  };
}

export function GoView({
  result,
  mode,
}: {
  result: BuildOk | BuildErr;
  mode: "auto" | "confirm";
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
          <h1 className="text-xl font-bold">We couldn't build that link</h1>
          <p data-testid="go-error-message" className="mt-2 text-sm text-muted-foreground">
            {result.error}
          </p>
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
  const result = useMemo(() => buildTargetUrl(params), [params]);

  useEffect(() => {
    if (!result.ok) return;
    if (REDIRECT_MODE !== "auto") return;
    if (typeof window === "undefined") return;
    const id = window.setTimeout(
      () => window.location.replace(result.url),
      AUTO_REDIRECT_DELAY_MS,
    );
    return () => window.clearTimeout(id);
  }, [result]);

  return <GoView result={result} mode={REDIRECT_MODE} />;
}
