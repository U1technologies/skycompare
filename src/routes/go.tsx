import { createFileRoute } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { ExternalLink, AlertTriangle, Plane, RefreshCw } from "lucide-react";
import { buildKayakRedirect, type BuildKayakResult } from "@/lib/kayak.functions";
import { REDIRECT_MODE, AUTO_REDIRECT_DELAY_MS } from "@/lib/affiliate-config";
import { track } from "@/lib/analytics";
import { Button } from "@/components/ui/button";

/**
 * KAYAK redirect handler.
 *
 * We call the `buildKayakRedirect` server function so the KAYAK partner id
 * (`a1aid`) is injected from process.env.KAYAK_API_KEY and never leaves the
 * server. The final URL preserves every field the user filled in
 * (destination, dates, travellers, rooms, cabin class) so KAYAK opens
 * directly on the matching results page.
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
  loader: async ({ location }) => {
    return await buildKayakRedirect({ data: location.search as Record<string, unknown> });
  },
  head: () => ({
    meta: [
      { title: "Redirecting to KAYAK… — SkyCompare" },
      { name: "robots", content: "noindex, nofollow" },
    ],
  }),
  component: GoPage,
});

function GoPage() {
  const result = Route.useLoaderData() as BuildKayakResult;
  const params = Route.useSearch();
  const [nonce, setNonce] = useState(0);

  useEffect(() => {
    if (!result.ok) {
      track("redirect_build_failed", {
        provider: "kayak",
        type: params.type as "hotel" | "flight" | undefined,
        reason: result.error,
        paramPath: result.paramPath,
      });
      return;
    }
    track("redirect_attempt", { provider: "kayak", type: result.type });
  }, [result, params]);

  useEffect(() => {
    if (!result.ok) return;
    if (REDIRECT_MODE !== "auto") return;
    if (typeof window === "undefined") return;
    const id = window.setTimeout(() => {
      track("redirect_success", { provider: "kayak", type: result.type });
      window.location.replace(result.url);
    }, AUTO_REDIRECT_DELAY_MS);
    return () => window.clearTimeout(id);
  }, [result, nonce]);

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
          {result.paramPath && (
            <p
              data-testid="go-error-param"
              className="mt-3 inline-block rounded-full border border-border bg-muted px-3 py-1 text-[11px] font-semibold uppercase tracking-wide text-muted-foreground"
            >
              Problem field: {result.paramPath}
            </p>
          )}
          <div className="mt-6 flex flex-col gap-2">
            <Button
              data-testid="go-retry"
              onClick={() => setNonce((n) => n + 1)}
              className="bg-gradient-brand text-primary-foreground shadow-brand"
            >
              <RefreshCw className="mr-2 h-4 w-4" /> Retry
            </Button>
            <Button asChild variant="ghost">
              <a href="/">Back to search</a>
            </Button>
          </div>
        </div>
      </main>
    );
  }

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
        <h1 className="text-xl font-bold">Redirecting to KAYAK…</h1>
        <p className="mt-3 text-sm text-muted-foreground">
          Opening your search on KAYAK with the exact dates and travellers you picked.
        </p>
        <noscript>
          <a href={result.url}>Continue to KAYAK</a>
        </noscript>
        <div className="mt-6">
          <Button
            asChild
            variant="outline"
            className="w-full"
          >
            <a
              data-testid="continue-link"
              href={result.url}
              rel="noopener noreferrer"
            >
              Continue to KAYAK <ExternalLink className="ml-2 h-4 w-4" />
            </a>
          </Button>
        </div>
      </div>
    </main>
  );
}
