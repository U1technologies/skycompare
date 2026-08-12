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
      { src: "https://www.googletagmanager.com/gtag/js?id=G-LP9NQXSKWR", async: true },
      {
        // Initializes window.dataLayer, which src/lib/analytics.ts's track()
        // already pushes every redirect_attempt/redirect_success/etc. event
        // into — without this, that push target never existed.
        // transport_type: 'beacon' makes GA4 use navigator.sendBeacon so it
        // never blocks navigation with an XHR.
        children:
          "window.dataLayer = window.dataLayer || [];" +
          "function gtag(){dataLayer.push(arguments);}" +
          "gtag('js', new Date());" +
          "gtag('config', 'G-LP9NQXSKWR', {'transport_type': 'beacon'});",
      },
      {
        /**
         * Meta Pixel 1394984585847930, as a script entry rather than raw HTML.
         * This is a .tsx module, not an HTML file, so a pasted <script> block
         * cannot be parsed here — `scripts` takes objects, and `children` is
         * the inline-script body. The snippet itself is Meta's, unchanged.
         *
         * The matching <noscript> image lives in RootShell, since it is body
         * markup rather than a script.
         */
        children:
          "!function(f,b,e,v,n,t,s)" +
          "{if(f.fbq)return;n=f.fbq=function(){n.callMethod?" +
          "n.callMethod.apply(n,arguments):n.queue.push(arguments)};" +
          "if(!f._fbq)f._fbq=n;n.push=n;n.loaded=!0;n.version='2.0';" +
          "n.queue=[];t=b.createElement(e);t.async=!0;" +
          "t.src=v;s=b.getElementsByTagName(e)[0];" +
          "s.parentNode.insertBefore(t,s)}(window, document,'script'," +
          "'https://connect.facebook.net/en_US/fbevents.js');" +
          "fbq('init', '1394984585847930');" +
          "fbq('track', 'PageView');",
      },
    ],
  }),
  shellComponent: RootShell,
  component: RootComponent,
  notFoundComponent: NotFoundComponent,
  errorComponent: ErrorComponent,
});

function RootShell({ children }: { children: ReactNode }) {
  return (
    <html lang="en">
      <head>
        <HeadContent /> 
        <!-- Meta Pixel Code -->
<script>
!function(f,b,e,v,n,t,s)
{if(f.fbq)return;n=f.fbq=function(){n.callMethod?
n.callMethod.apply(n,arguments):n.queue.push(arguments)};
if(!f._fbq)f._fbq=n;n.push=n;n.loaded=!0;n.version='2.0';
n.queue=[];t=b.createElement(e);t.async=!0;
t.src=v;s=b.getElementsByTagName(e)[0];
s.parentNode.insertBefore(t,s)}(window, document,'script',
'https://connect.facebook.net/en_US/fbevents.js');
fbq('init', '1394984585847930');
fbq('track', 'PageView');
</script>
<noscript><img height="1" width="1" style="display:none"
src="https://www.facebook.com/tr?id=1394984585847930&ev=PageView&noscript=1"
/></noscript>
<!-- End Meta Pixel Code -->


<!-- Google Tag Manager -->
<script>(function(w,d,s,l,i){w[l]=w[l]||[];w[l].push({'gtm.start':
new Date().getTime(),event:'gtm.js'});var f=d.getElementsByTagName(s)[0],
j=d.createElement(s),dl=l!='dataLayer'?'&l='+l:'';j.async=true;j.src=
'https://www.googletagmanager.com/gtm.js?id='+i+dl;f.parentNode.insertBefore(j,f);
})(window,document,'script','dataLayer','GTM-KFZJ35X4');</script>
<!-- End Google Tag Manager -->
  
      </head>
      <body>
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

        <!-- Google Tag Manager (noscript) -->
<noscript><iframe src="https://www.googletagmanager.com/ns.html?id=GTM-KFZJ35X4"
height="0" width="0" style="display:none;visibility:hidden"></iframe></noscript>
<!-- End Google Tag Manager (noscript) -->
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
