/**
 * Lightweight analytics event bus for the affiliate redirect flow.
 *
 * All /go events funnel through `track()` so we can wire GA / PostHog /
 * Segment later without touching call sites. In the browser we also emit a
 * `CustomEvent` on `window` (`skycompare:analytics`) so any external tag
 * manager can subscribe without importing this module.
 *
 * Event catalogue (kept in one place so provider dashboards stay in sync):
 *   - redirect_attempt        primary partner URL built successfully
 *   - redirect_success        user actually navigated to the partner (window.location.replace fired)
 *   - redirect_build_failed   zod / builder error, includes the failing param path
 *   - redirect_fallback_used  primary URL invalid → next partner used
 *   - redirect_all_failed     every partner failed validation for these params
 */

export type AnalyticsEvent =
  | "redirect_attempt"
  | "redirect_success"
  | "redirect_build_failed"
  | "redirect_fallback_used"
  | "redirect_all_failed";

export type AnalyticsPayload = {
  provider?: string;
  type?: "hotel" | "flight";
  /** Which zod / builder param caused the failure, e.g. "checkOut". */
  reason?: string;
  /** The failing zod path, e.g. "checkOut", "from". */
  paramPath?: string;
  /** The provider we fell back to when the primary URL was invalid. */
  fallbackProvider?: string;
  /** Number of partners that failed to build a valid URL. */
  failedProviders?: number;
};

type Handler = (event: AnalyticsEvent, payload: AnalyticsPayload) => void;

const handlers: Handler[] = [];

/** Subscribe to every analytics event. Returns an unsubscribe fn (used in tests). */
export function onAnalyticsEvent(fn: Handler): () => void {
  handlers.push(fn);
  return () => {
    const i = handlers.indexOf(fn);
    if (i >= 0) handlers.splice(i, 1);
  };
}

export function track(event: AnalyticsEvent, payload: AnalyticsPayload = {}): void {
  const enriched = { ...payload, ts: Date.now() };
  for (const h of handlers) {
    try {
      h(event, payload);
    } catch {
      /* handler failures never break the redirect */
    }
  }
  if (typeof window !== "undefined") {
    try {
      window.dispatchEvent(
        new CustomEvent("skycompare:analytics", { detail: { event, ...enriched } }),
      );
    } catch {
      /* ignore */
    }
    // Also emit a dataLayer push for GTM-style consumers.
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const w = window as unknown as { dataLayer?: any[] };
    if (Array.isArray(w.dataLayer)) w.dataLayer.push({ event, ...enriched });
  }
  if (typeof console !== "undefined") {
    // Structured log so provider success rate is greppable from browser logs.
    // eslint-disable-next-line no-console
    console.debug(`[analytics] ${event}`, enriched);
  }
}

/** Clear all subscribers — test-only helper. */
export function __resetAnalyticsForTests(): void {
  handlers.length = 0;
}
