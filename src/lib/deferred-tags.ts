/**
 * GTM, GA4 and Meta Pixel are loaded after the page goes idle (with a short
 * timeout fallback) instead of in <head>, since none of them need to be
 * ready before the visitor can act. `track()` (src/lib/analytics.ts) only
 * fires on a real click — see the `redirect_attempt` call in
 * routes/index.tsx — so there is no event that can be lost by the small
 * delay. `window.dataLayer` itself is still seeded synchronously (see the
 * inline script in __root.tsx) so an early track() call always has
 * somewhere to push to, even before these scripts arrive.
 *
 * This is what GTmetrix's Total Blocking Time metric was penalizing: three
 * separate third-party runtimes (GTM, gtag.js, fbevents.js) parsing and
 * executing on the main thread during the critical first paint window.
 */

declare global {
  interface Window {
    dataLayer?: unknown[];
    gtag?: (...args: unknown[]) => void;
    fbq?: ((...args: unknown[]) => void) & {
      callMethod?: (...args: unknown[]) => void;
      queue?: unknown[];
      loaded?: boolean;
      version?: string;
    };
    _fbq?: Window["fbq"];
  }
}

const GTM_ID = "GTM-KFZJ35X4";
const GA4_ID = "G-LP9NQXSKWR";
const META_PIXEL_ID = "1394984585847930";

function loadGTM() {
  window.dataLayer = window.dataLayer || [];
  window.dataLayer.push({ "gtm.start": Date.now(), event: "gtm.js" });
  const script = document.createElement("script");
  script.async = true;
  script.src = `https://www.googletagmanager.com/gtm.js?id=${GTM_ID}`;
  document.head.appendChild(script);
}

function loadGA4() {
  const script = document.createElement("script");
  script.async = true;
  script.src = `https://www.googletagmanager.com/gtag/js?id=${GA4_ID}`;
  document.head.appendChild(script);

  window.dataLayer = window.dataLayer || [];
  window.gtag = function gtag(...args: unknown[]) {
    window.dataLayer!.push(args);
  };
  window.gtag("js", new Date());
  // navigator.sendBeacon transport so GA4 never blocks navigation with an XHR.
  window.gtag("config", GA4_ID, { transport_type: "beacon" });
}

type FbqFn = ((...args: unknown[]) => void) & {
  callMethod?: (...args: unknown[]) => void;
  queue: unknown[];
  loaded: boolean;
  version: string;
};

function loadMetaPixel() {
  if (window.fbq) return;
  const fbq = function (...args: unknown[]) {
    if (fbq.callMethod) fbq.callMethod(...args);
    else fbq.queue.push(args);
  } as FbqFn;
  fbq.queue = [];
  fbq.loaded = true;
  fbq.version = "2.0";
  window.fbq = fbq;
  window._fbq = fbq;

  const script = document.createElement("script");
  script.async = true;
  script.src = "https://connect.facebook.net/en_US/fbevents.js";
  document.head.appendChild(script);

  window.fbq("init", META_PIXEL_ID);
  window.fbq("track", "PageView");
}

let loaded = false;

function loadThirdPartyTags() {
  if (loaded) return;
  loaded = true;
  loadGTM();
  loadGA4();
  loadMetaPixel();
}

/**
 * Schedules the tag load for idle time, falling back to a 2s timeout so it
 * never waits indefinitely on a busy main thread (and never fires sooner
 * than a visitor could plausibly have already left).
 */
export function scheduleThirdPartyTags(): void {
  if (typeof window === "undefined") return;
  if ("requestIdleCallback" in window) {
    window.requestIdleCallback(loadThirdPartyTags, { timeout: 2000 });
  } else {
    setTimeout(loadThirdPartyTags, 2000);
  }
}
