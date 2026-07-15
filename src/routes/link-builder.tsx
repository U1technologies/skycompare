import { createFileRoute } from "@tanstack/react-router";
import { Toaster } from "@/components/ui/sonner";
import { SearchBox, type IndexSearch } from "@/routes/index";

/**
 * Internal-only link builder — not linked from anywhere in the site nav and
 * marked noindex so it isn't crawled. NOTE: this is obscurity, not real
 * access control — the route's code still ships in the client bundle like
 * any other route, so anyone who finds the URL (e.g. via the network tab)
 * can open it. Fine for "keep this out of normal visitors' way," not fine
 * if genuine restriction is ever needed (that would require an actual
 * password/auth check).
 *
 * Reuses the same SearchBox used on the homepage, with showCopyLink enabled
 * so the Copy Link button appears here (and only here) — the public
 * homepage never renders it.
 */
export const Route = createFileRoute("/link-builder")({
  head: () => ({
    meta: [
      { title: "Link Builder — HotelzOff" },
      { name: "robots", content: "noindex, nofollow" },
    ],
  }),
  component: LinkBuilderPage,
});

const emptySearch: IndexSearch = {};

function LinkBuilderPage() {
  return (
    <main className="min-h-screen bg-background px-4 py-16 text-foreground">
      <Toaster position="top-center" />
      <div className="mx-auto max-w-3xl">
        <h1 className="text-2xl font-bold tracking-tight">Link Builder</h1>
        <p className="mt-2 text-sm text-muted-foreground">
          Fill in a search and use the copy icon next to Search to grab a shareable link —
          it carries the exact destination (including KAYAK's resolved place data, if you pick
          one from the dropdown), dates, and guests into a link anyone can open.
        </p>
      </div>
      {/* Same max-w-6xl as the homepage's Hero — narrower than this collapses the
          date/guests fields into each other and blocks clicks on their controls. */}
      <div className="mx-auto mt-8 max-w-6xl">
        <SearchBox initialSearch={emptySearch} showCopyLink />
      </div>
    </main>
  );
}
