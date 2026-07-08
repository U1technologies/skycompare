import { createFileRoute } from "@tanstack/react-router";
import { useEffect, useMemo } from "react";
import { ExternalLink, AlertTriangle, ShieldCheck, Loader2 } from "lucide-react";
import { HOTEL_PROVIDERS, FLIGHT_PROVIDERS } from "@/lib/affiliates";
import { goSchema, type GoParams } from "@/lib/go-schema";
import { REDIRECT_MODE } from "@/lib/affiliate-config";
import { Button } from "@/components/ui/button";

/**
 * Dedicated affiliate redirect handler.
 *
 * Behaviour is driven by REDIRECT_MODE (src/lib/affiliate-config.ts):
 *   - "auto"    → immediately window.location.replace() to the primary partner.
 *   - "confirm" → render a "Continue to <Partner>" screen with alternatives.
 * If link generation fails, always show a friendly error page with a
 * fallback partner link.
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
        const fb = HOTEL_PROVIDERS.find((p) => p.id !== data.provider);
        return {
          ok: false,
          error: `Unknown hotel provider: ${data.provider}`,
          fallback: fb ? { id: fb.id, url: fb.build(data), providerName: fb.name } : undefined,
        };
      }
      const url = provider.build(data);
      const alternatives = HOTEL_PROVIDERS.filter((p) => p.id !== provider.id).map((p) => ({
        id: p.id,
        url: p.build(data),
        providerName: p.name,
      }));
      return {
        ok: true,
        url,
        providerName: provider.name,
        data,
        alternatives,
        fallback: alternatives[0],
      };
    }

    const provider = FLIGHT_PROVIDERS.find((p) => p.id === data.provider);
    if (!provider) {
      const fb = FLIGHT_PROVIDERS.find((p) => p.id !== data.provider);
      return {
        ok: false,
        error: `Unknown flight provider: ${data.provider}`,
        fallback: fb ? { id: fb.id, url: fb.build(data), providerName: fb.name } : undefined,
      };
    }
    const url = provider.build(data);
    const alternatives = FLIGHT_PROVIDERS.filter((p) => p.id !== provider.id).map((p) => ({
      id: p.id,
      url: p.build(data),
      providerName: p.name,
    }));
    return {
      ok: true,
      url,
      providerName: provider.name,
      data,
      alternatives,
      fallback: alternatives[0],
    };
  } catch (e) {
    return {
      ok: false,
      error: `Couldn't build that link: ${e instanceof Error ? e.message : "unknown error"}`,
    };
  }
}

/**
 * Pure view rendered by /go. Exported so tests can render it without the
 * router. `mode` mirrors REDIRECT_MODE; when "auto" and result is ok, the
 * caller is responsible for triggering the actual navigation (side effect
 * lives in GoPage).
 */
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

  // auto mode — brief "Redirecting to <Partner>…" screen
  return (
    <main className="grid min-h-[100svh] place-items-center bg-background p-6">
      <div
        data-testid="go-loading"
        className="w-full max-w-md rounded-3xl border border-border bg-card p-8 text-center shadow-soft"
      >
        <Loader2 className="mx-auto mb-4 h-10 w-10 animate-spin text-primary" />
        <h1 className="text-xl font-bold">Redirecting to {result.providerName}…</h1>
        <p className="mt-2 text-sm text-muted-foreground">
          Comparing options and opening the best match on {result.providerName}.
        </p>
        <noscript>
          <a href={result.url}>Continue to {result.providerName}</a>
        </noscript>
        <a
          data-testid="continue-link"
          href={result.url}
          rel="noopener noreferrer"
          className="mt-6 inline-block text-xs text-muted-foreground underline-offset-4 hover:underline"
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
    // Brief pause so the "Redirecting to <Partner>…" screen is actually visible.
    const id = window.setTimeout(() => window.location.replace(result.url), 900);
    return () => window.clearTimeout(id);
  }, [result]);

  return <GoView result={result} mode={REDIRECT_MODE} />;
}
