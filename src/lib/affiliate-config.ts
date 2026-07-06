/**
 * Affiliate redirect configuration.
 *
 * Change these values to control which partner the /go handler prefers and
 * whether users are redirected silently or shown a confirmation screen with
 * a "Continue to <Partner>" button and alternatives.
 *
 *   REDIRECT_MODE
 *     "auto"    — the default primary partner opens automatically (silent).
 *     "confirm" — the /go page shows a "Continue to <Partner>" screen with
 *                 the primary partner CTA plus every alternative partner
 *                 listed underneath. Nothing is opened until the user taps.
 *
 * The DEFAULT_*_PROVIDER_ID values must match an `id` in
 * HOTEL_PROVIDERS / FLIGHT_PROVIDERS (see src/lib/affiliates.ts).
 */

export type RedirectMode = "auto" | "confirm";

export const REDIRECT_MODE: RedirectMode = "confirm";

export const DEFAULT_HOTEL_PROVIDER_ID = "booking";
export const DEFAULT_FLIGHT_PROVIDER_ID = "kayak";
