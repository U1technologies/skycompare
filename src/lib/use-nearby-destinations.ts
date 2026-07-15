import { useEffect, useMemo, useState } from "react";
import { nearestDestinations, type Destination, type SearchOptions } from "@/lib/destinations";

/**
 * Best-effort browser geolocation → nearby destinations.
 *
 * Returns an empty array until the browser resolves (or denies) permission.
 * Silent on error; caller should fall back to the popular list.
 */
export function useNearbyDestinations(opts: SearchOptions = {}): Destination[] {
  const [coords, setCoords] = useState<{ lat: number; lon: number } | null>(null);

  useEffect(() => {
    if (typeof navigator === "undefined" || !navigator.geolocation) return;
    let cancelled = false;
    navigator.geolocation.getCurrentPosition(
      (pos) => {
        if (cancelled) return;
        setCoords({ lat: pos.coords.latitude, lon: pos.coords.longitude });
      },
      () => {
        /* denied / unavailable — silently ignore */
      },
      { enableHighAccuracy: false, timeout: 4000, maximumAge: 10 * 60 * 1000 },
    );
    return () => {
      cancelled = true;
    };
  }, []);

  // Memoized on primitive values (not the `opts`/`opts.kinds` object identity,
  // which callers commonly recreate every render) so this returns a stable
  // array reference across unrelated re-renders — callers depend on that
  // stability (e.g. resetting keyboard/hover highlight only when it changes).
  const kindsKey = opts.kinds?.join(",") ?? "";
  return useMemo(() => {
    if (!coords) return [];
    return nearestDestinations(coords.lat, coords.lon, opts);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [coords, kindsKey, opts.limit]);
}
