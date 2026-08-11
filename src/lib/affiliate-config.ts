/**
 * Redirect configuration.
 *
 *   REDIRECT_MODE
 *     "auto"    — /go answers the browser with an HTTP 302 straight to KAYAK
 *                 (no interstitial page). If the redirect ever has to happen
 *                 in the browser instead — e.g. a client-side navigation to
 *                 /go, where no document request reaches the server — the page
 *                 falls back to window.location.replace.
 *     "confirm" — the /go page shows a "Continue to KAYAK" button and does
 *                 not open anything until the user clicks.
 */

export type RedirectMode = "auto" | "confirm";

export const REDIRECT_MODE: RedirectMode = "auto";

/**
 * Delay before the *client-side* fallback redirect fires. The server 302 path
 * never waits, so keep this at 0 unless a partner requires a visible splash.
 */
export const AUTO_REDIRECT_DELAY_MS = 0;
