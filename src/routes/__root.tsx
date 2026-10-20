import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import {
  Outlet,
  Link,
  createRootRouteWithContext,
  useRouter,
  HeadContent,
  Scripts,
} from "@tanstack/react-router";
import { useEffect, type ReactNode } from "react";

import appCss from "../styles.css?url";
import { reportLovableError } from "../lib/lovable-error-reporting";
import { getKayakLinkContext } from "../lib/kayak.functions";
import { KayakLinkProvider } from "../lib/kayak-link-context";
import { scheduleThirdPartyTags } from "../lib/deferred-tags";

function NotFoundComponent() {
  return (
    <div className="flex min-h-screen items-center justify-center bg-background px-4">
      <div className="max-w-md text-center">
        <h1 className="text-7xl font-bold text-foreground">404</h1>
        <h2 className="mt-4 text-xl font-semibold text-foreground">Page not found</h2>
        <p className="mt-2 text-sm text-muted-foreground">
          The page you're looking for doesn't exist or has been moved.
        </p>
        <div className="mt-6">
          <Link
            to="/"
            className="inline-flex items-center justify-center rounded-md bg-primary px-4 py-2 text-sm font-medium text-primary-foreground transition-colors hover:bg-primary/90"
          >
            Go home
          </Link>
        </div>
      </div>
    </div>
  );
}

function ErrorComponent({ error, reset }: { error: Error; reset: () => void }) {
  console.error(error);
  const router = useRouter();
  useEffect(() => {
    reportLovableError(error, { boundary: "tanstack_root_error_component" });
  }, [error]);

  return (
    <div className="flex min-h-screen items-center justify-center bg-background px-4">
      <div className="max-w-md text-center">
        <h1 className="text-xl font-semibold tracking-tight text-foreground">
          This page didn't load
        </h1>
        <p className="mt-2 text-sm text-muted-foreground">
          Something went wrong on our end. You can try refreshing or head back home.
        </p>
        <div className="mt-6 flex flex-wrap justify-center gap-2">
          <button
            onClick={() => {
              router.invalidate();
              reset();
            }}
            className="inline-flex items-center justify-center rounded-md bg-primary px-4 py-2 text-sm font-medium text-primary-foreground transition-colors hover:bg-primary/90"
          >
            Try again
          </button>
          <a
            href="/"
            className="inline-flex items-center justify-center rounded-md border border-input bg-background px-4 py-2 text-sm font-medium text-foreground transition-colors hover:bg-accent"
          >
            Go home
          </a>
        </div>
      </div>
    </div>
  );
}

export const Route = createRootRouteWithContext<{ queryClient: QueryClient }>()({
  /**
   * Resolve this visitor's KAYAK market and deeplink code once, during the
   * server render, so search buttons can carry a finished KAYAK href and a
   * click needs no request to us. Never let it fail the page: without it the
   * buttons fall back to /go, which resolves the same link server-side.
   */
  loader: async () => {
    try {
      return { kayakLink: await getKayakLinkContext() };
    } catch (error) {
      console.error("Failed to resolve KAYAK link context", error);
      return { kayakLink: undefined };
    }
  },
  // Per-visitor and effectively constant, so client navigations reuse it
  // instead of asking the server again.
  staleTime: Infinity,
  head: ({ loaderData }) => ({
    meta: [
      { charSet: "utf-8" },
      { name: "viewport", content: "width=device-width, initial-scale=1" },
      { title: "HotelzOff — Compare Hotel & Flight Prices from Top Travel Brands" },
      { name: "description", content: "Compare hotel and flight prices from KAYAK, Priceline, Agoda, Expedia and more. Find the best deals and book with trusted travel partners." },
      { name: "author", content: "HotelzOff" },
      { property: "og:title", content: "HotelzOff — Compare Hotel & Flight Prices from Top Travel Brands" },
      { property: "og:description", content: "Compare hotel and flight prices from KAYAK, Priceline, Agoda, Expedia and more. Find the best deals and book with trusted travel partners." },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary_large_image" },
      { name: "twitter:title", content: "HotelzOff — Compare Hotel & Flight Prices from Top Travel Brands" },
      { name: "twitter:description", content: "Compare hotel and flight prices from KAYAK, Priceline, Agoda, Expedia and more. Find the best deals and book with trusted travel partners." },
      { property: "og:image", content: "https://storage.googleapis.com/gpt-engineer-file-uploads/attachments/og-images/21237128-830b-41a6-85f0-81e2137ff1ad" },
      { name: "twitter:image", content: "https://storage.googleapis.com/gpt-engineer-file-uploads/attachments/og-images/21237128-830b-41a6-85f0-81e2137ff1ad" },
    ],
    links: [
      { rel: "stylesheet", href: appCss },
      { rel: "icon", href: "/favicon.ico", type: "image/x-icon" },
      { rel: "preconnect", href: "https://fonts.googleapis.com" },
      { rel: "preconnect", href: "https://fonts.gstatic.com", crossOrigin: "anonymous" },
      { rel: "stylesheet", href: "https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700&family=Sora:wght@600;700;800&display=swap" },
      // Pre-connect to the exact KAYAK domain this visitor will be sent to
      // (kayak.co.in, kayak.co.uk, ...) before they click, so DNS, TCP and TLS
      // are already done when the click happens. Measured at ~40 ms saved.
      {
        rel: "preconnect",
        href: `https://${loaderData?.kayakLink?.domain ?? "www.kayak.com"}`,
        crossOrigin: "anonymous",
      },
    ],
    scripts: [
      {
        // Seeds window.dataLayer only — no network request, no main-thread
        // work worth measuring. src/lib/analytics.ts's track() pushes every
        // redirect_attempt/redirect_success/etc. event into this array, so it
        // must exist from the first paint even though the actual GTM/GA4/Meta
        // Pixel runtimes below are deferred (src/lib/deferred-tags.ts) until
        // idle to keep them off the Total Blocking Time critical path.
        children: "window.dataLayer = window.dataLayer || [];",
      },
    ],
  }),
  shellComponent: RootShell,
  component: RootComponent,
  notFoundComponent: NotFoundComponent,
  errorComponent: ErrorComponent,
});

function RootShell({ children }: { children: ReactNode }) {
  useEffect(() => {
    scheduleThirdPartyTags();
  }, []);

  return (
    <html lang="en">
      <head>
        <HeadContent />
      </head>
      <body>
        {/* Google Tag Manager (noscript) fallback, the counterpart to the GTM
            script in `head` above. Kept first so it's as high in <body> as
            possible, per Google's install instructions. */}
        <noscript>
          <iframe
            src="https://www.googletagmanager.com/ns.html?id=GTM-KFZJ35X4"
            height="0"
            width="0"
            style={{ display: "none", visibility: "hidden" }}
            title="gtm"
          />
        </noscript>
        {/* Meta Pixel's no-JS fallback, the counterpart to the pixel script in
            `head` above. Body markup, so it belongs here rather than in
            `scripts`. */}
        <noscript>
          <img
            height="1"
            width="1"
            style={{ display: "none" }}
            src="https://www.facebook.com/tr?id=1394984585847930&ev=PageView&noscript=1"
            alt=""
          />
        </noscript>
        {children}
        <Scripts />
      </body>
    </html>
  );
}

function RootComponent() {
  const { queryClient } = Route.useRouteContext();
  const { kayakLink } = Route.useLoaderData();

  return (
    <QueryClientProvider client={queryClient}>
      <KayakLinkProvider value={kayakLink}>
        {/* Required: nested routes render here. Removing <Outlet /> breaks all child routes. */}
        <Outlet />
      </KayakLinkProvider>
    </QueryClientProvider>
  );
}
