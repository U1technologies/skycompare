import { useEffect, useMemo, useRef, useState } from "react";
import { MapPin, Plane, Building2, Compass, Star } from "lucide-react";
import {
  searchDestinations,
  popularDestinations,
  type Destination,
  type DestinationKind,
} from "@/lib/destinations";
import { useNearbyDestinations } from "@/lib/use-nearby-destinations";
import { Input } from "@/components/ui/input";
import { autocompletePlaces, type AutocompletePlace } from "@/lib/kayak-autocomplete.functions";

/** KAYAK primaryPlaceType -> the icon bucket this component already renders. */
function placeTypeToKind(primaryPlaceType: string): DestinationKind {
  if (primaryPlaceType === "airport") return "airport";
  if (primaryPlaceType === "hotel") return "hotel";
  return "city";
}

function placeToDestination(p: AutocompletePlace): Destination {
  return {
    id: `api-${p.placeId}`,
    kind: placeTypeToKind(p.primaryPlaceType),
    label: p.fullName,
    name: p.name || p.fullName,
    region: [p.regionName, p.countryName].filter(Boolean).join(", "),
    iata: p.iataCode,
    lat: p.latitude,
    lon: p.longitude,
    placeId: p.placeId,
    entityKey: p.entityKey,
  };
}

/** Session-lived cache of API results, keyed by "vertical:term" — avoids
 * re-hitting KAYAK for a term already fetched while the user backspaces. */
const API_CACHE = new Map<string, Destination[]>();

/**
 * Destination autocomplete with:
 *  - Debounced query filtering (memoized against the curated dataset)
 *  - When `apiVertical` is set, live results from KAYAK's Autocomplete API
 *    (see kayak-autocomplete.functions.ts) take over from the local list —
 *    these carry KAYAK's real placeId/entityKey/lat/lng, which get threaded
 *    through to the final deep link. Falls back to the local list if the
 *    API is unconfigured, fails, or is still loading.
 *  - Default suggestions: nearby (via browser geolocation) → popular fallback
 *  - Keyboard navigation
 *
 * The canonical `label` picked from a suggestion is what gets sent to
 * affiliate partners — critical for clean deep-links.
 */
export function DestinationAutocomplete({
  value,
  onChange,
  onSelect,
  kinds,
  placeholder,
  className,
  autoUpper,
  debounceMs = 120,
  apiVertical,
}: {
  value: string;
  onChange: (v: string) => void;
  onSelect?: (d: Destination) => void;
  kinds?: DestinationKind[];
  placeholder?: string;
  className?: string;
  /** For flight From/To fields — display value in uppercase. */
  autoUpper?: boolean;
  debounceMs?: number;
  /** Which KAYAK Autocomplete vertical to call live, if any. */
  apiVertical?: "hotels" | "flights";
}) {
  const [open, setOpen] = useState(false);
  const [highlight, setHighlight] = useState(0);
  const [debounced, setDebounced] = useState(value);
  const [apiResults, setApiResults] = useState<Destination[] | null>(null);
  const fetchTokenRef = useRef(0);
  const rootRef = useRef<HTMLDivElement>(null);

  // Debounce the query to avoid unnecessary re-filters while typing.
  useEffect(() => {
    if (value === debounced) return;
    const t = setTimeout(() => setDebounced(value), debounceMs);
    return () => clearTimeout(t);
  }, [value, debounced, debounceMs]);

  const nearby = useNearbyDestinations({ kinds, limit: 6 });
  const defaults = useMemo<Destination[]>(() => {
    return nearby.length > 0 ? nearby : popularDestinations({ kinds, limit: 6 });
  }, [nearby, kinds]);

  const localResults = useMemo<Destination[]>(() => {
    const q = debounced.trim();
    if (!q) return defaults;
    return searchDestinations(q, { kinds, limit: 8 });
  }, [debounced, kinds, defaults]);

  // Live KAYAK lookup — only when a vertical is wired up and the query is
  // long enough to be worth a network round trip.
  useEffect(() => {
    const q = debounced.trim();
    if (!apiVertical || q.length < 2) {
      setApiResults(null);
      return;
    }

    const cacheKey = `${apiVertical}:${q.toLowerCase()}`;
    const cached = API_CACHE.get(cacheKey);
    if (cached) {
      setApiResults(cached);
      return;
    }

    const token = ++fetchTokenRef.current;
    autocompletePlaces({ data: { vertical: apiVertical, searchTerm: q } })
      .then((res) => {
        if (token !== fetchTokenRef.current) return; // a newer query superseded this one
        if (!res.ok) {
          setApiResults(null); // fall back to the local list
          return;
        }
        const mapped = res.places.map(placeToDestination);
        API_CACHE.set(cacheKey, mapped);
        setApiResults(mapped);
      })
      .catch(() => {
        if (token === fetchTokenRef.current) setApiResults(null);
      });
  }, [debounced, apiVertical]);

  const results = apiVertical && debounced.trim() && apiResults ? apiResults : localResults;

  const showDefaults = !debounced.trim();

  useEffect(() => setHighlight(0), [results]);

  useEffect(() => {
    if (!open) return;
    const onDoc = (e: MouseEvent) => {
      if (rootRef.current && !rootRef.current.contains(e.target as Node)) setOpen(false);
    };
    document.addEventListener("mousedown", onDoc);
    return () => document.removeEventListener("mousedown", onDoc);
  }, [open]);

  const pick = (d: Destination) => {
    onChange(autoUpper ? (d.iata ?? d.label) : d.label);
    onSelect?.(d);
    setOpen(false);
  };

  return (
    <div ref={rootRef} className={`relative ${className ?? ""}`}>
      <Input
        className="h-8 border-0 bg-transparent p-0 text-base font-semibold shadow-none focus-visible:ring-0 focus-visible:ring-offset-0"
        placeholder={placeholder}
        value={value}
        onChange={(e) => {
          const v = autoUpper ? e.target.value.toUpperCase() : e.target.value;
          onChange(v);
          setOpen(true);
        }}
        onFocus={() => setOpen(true)}
        onKeyDown={(e) => {
          if (!open) setOpen(true);
          if (results.length === 0) return;
          if (e.key === "ArrowDown") {
            e.preventDefault();
            setHighlight((h) => (h + 1) % results.length);
          } else if (e.key === "ArrowUp") {
            e.preventDefault();
            setHighlight((h) => (h - 1 + results.length) % results.length);
          } else if (e.key === "Enter") {
            e.preventDefault();
            pick(results[highlight]);
          } else if (e.key === "Escape") {
            setOpen(false);
          }
        }}
        autoComplete="off"
        aria-autocomplete="list"
        aria-expanded={open}
        role="combobox"
      />
      {open && results.length > 0 && (
        <div
          role="listbox"
          className="absolute left-0 right-0 top-full z-50 mt-2 max-h-72 overflow-auto rounded-xl border border-border bg-popover p-1 text-popover-foreground shadow-xl"
        >
          {showDefaults && (
            <div className="flex items-center gap-1.5 px-3 py-1.5 text-[10px] font-bold uppercase tracking-wide text-muted-foreground">
              {nearby.length > 0 ? (
                <>
                  <Compass className="h-3 w-3" /> Nearby
                </>
              ) : (
                <>
                  <Star className="h-3 w-3" /> Popular right now
                </>
              )}
            </div>
          )}
          {results.map((d, i) => (
            <button
              type="button"
              key={d.id}
              role="option"
              aria-selected={i === highlight}
              data-testid={`suggestion-${d.id}`}
              onMouseDown={(e) => e.preventDefault()}
              onClick={() => pick(d)}
              onMouseEnter={() => setHighlight(i)}
              className={`flex w-full items-center gap-3 rounded-lg px-3 py-2 text-left text-sm transition ${
                i === highlight ? "bg-accent text-accent-foreground" : "hover:bg-accent/60"
              }`}
            >
              <KindIcon kind={d.kind} />
              <span className="min-w-0 flex-1">
                <span className="block truncate font-semibold">
                  {d.name}
                  {d.iata ? <span className="ml-1.5 text-xs text-muted-foreground">({d.iata})</span> : null}
                </span>
                <span className="block truncate text-xs text-muted-foreground">{d.region}</span>
              </span>
              <span className="text-[10px] font-bold uppercase tracking-wide text-muted-foreground">
                {d.kind}
              </span>
            </button>
          ))}
        </div>
      )}
    </div>
  );
}

function KindIcon({ kind }: { kind: DestinationKind }) {
  const cls = "h-4 w-4 shrink-0 text-primary";
  if (kind === "airport") return <Plane className={cls} />;
  if (kind === "hotel") return <Building2 className={cls} />;
  return <MapPin className={cls} />;
}
