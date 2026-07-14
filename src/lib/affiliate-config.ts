/**
 * Redirect configuration.
 *
 *   REDIRECT_MODE
 *     "auto"    — the KAYAK deep link opens automatically after a short
 *                 "Redirecting to KAYAK…" splash.
 *     "confirm" — the /go page shows a "Continue to KAYAK" button and does
 *                 not open anything until the user clicks.
 */

export type RedirectMode = "auto" | "confirm";

export const REDIRECT_MODE: RedirectMode = "auto";

/** How long the "Redirecting to KAYAK…" splash is shown before opening. */
export const AUTO_REDIRECT_DELAY_MS = 1400;
