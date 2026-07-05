import { useEffect, useMemo, useRef, useState } from "react";
import { MapPin, Plane, Building2 } from "lucide-react";
import { searchDestinations, type Destination, type DestinationKind } from "@/lib/destinations";
import { Input } from "@/components/ui/input";

/**
 * Destination autocomplete with keyboard navigation.
 *
 * Suggests cities / airports / hotels as the user types. Uses a local curated
 * dataset (see lib/destinations.ts) so results are instant and correctly
 * spelled — critical for producing clean affiliate deep-links.
 *
 * Callers pass a controlled `value` and get notified via `onChange` (raw text)
 * and `onSelect` (fired when a suggestion is picked; receives the canonical
 * `label` and full Destination object).
 */
export function DestinationAutocomplete({
  value,
  onChange,
  onSelect,
  kinds,
  placeholder,
  className,
  autoUpper,
}: {
  value: string;
  onChange: (v: string) => void;
  onSelect?: (d: Destination) => void;
  kinds?: DestinationKind[];
  placeholder?: string;
  className?: string;
  /** For flight From/To fields — display value in uppercase. */
  autoUpper?: boolean;
}) {
  const [open, setOpen] = useState(false);
  const [highlight, setHighlight] = useState(0);
  const [dirty, setDirty] = useState(false);
  const rootRef = useRef<HTMLDivElement>(null);

  const results = useMemo(
    () => (dirty && value ? searchDestinations(value, { kinds, limit: 6 }) : []),
    [value, kinds, dirty],
  );

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
    setDirty(false);
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
          setDirty(true);
          setOpen(true);
          setHighlight(0);
        }}
        onFocus={() => value && setOpen(true)}
        onKeyDown={(e) => {
          if (!open || results.length === 0) return;
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
      />
      {open && results.length > 0 && (
        <div className="absolute left-0 right-0 top-full z-50 mt-2 max-h-72 overflow-auto rounded-xl border border-border bg-popover p-1 text-popover-foreground shadow-xl">
          {results.map((d, i) => (
            <button
              type="button"
              key={d.id}
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
