import { createFileRoute, Link } from "@tanstack/react-router";
import { useEffect, useMemo, useRef, useState } from "react";
import { createPortal } from "react-dom";
import { motion } from "framer-motion";
import {
  Plane,
  Hotel,
  MapPin,
  CalendarDays,
  Users,
  Search,
  Plus,
  Minus,
  ShieldCheck,
  Sparkles,
  Zap,
  Globe2,
  BadgePercent,
  Handshake,
  ChevronDown,
  ArrowRight,
  Twitter,
  Facebook,
  Instagram,
  Youtube,
  Copy,
} from "lucide-react";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";
import { toast } from "sonner";
import { Toaster } from "@/components/ui/sonner";

import heroImage from "@/assets/hero-travel.jpg";
import logo from "@/assets/logo.png";
import bookingLogo from "@/assets/partners/booking.svg";
import expediaLogo from "@/assets/partners/expedia.svg";
import hotelsComLogo from "@/assets/partners/hotels-com.svg";
import kayakLogo from "@/assets/partners/kayak.svg";
import skyscannerLogo from "@/assets/partners/skyscanner.svg";
import tripComLogo from "@/assets/partners/trip-com.svg";
import {
  buildHotelRedirect,
  buildFlightRedirect,
  buildHotelShareLink,
  buildFlightShareLink,
  openRedirect,
  type HotelSearch,
  type FlightSearch,
} from "@/lib/affiliates";
import { DestinationAutocomplete } from "@/components/DestinationAutocomplete";
import { useAnchoredMenuPosition } from "@/hooks/use-anchored-menu-position";
import { Header, Footer } from "@/components/SharedLayout";

/**
 * Optional deep-link params (?type=hotel&destination=Goa&checkIn=...) so a
 * marketing link can land here with the search form pre-filled. Loosely
 * typed on purpose — HotelForm/FlightForm parse whatever's present and
 * default the rest, they never fail the whole page over a bad param.
 */
export type IndexSearch = Record<string, string | undefined>;

export const Route = createFileRoute("/")({
  validateSearch: (s: Record<string, unknown>): IndexSearch => {
    const out: IndexSearch = {};
    for (const [k, v] of Object.entries(s)) {
      if (v == null) continue;
      out[k] = String(v);
    }
    return out;
  },
  head: () => ({
    meta: [
      { title: "HotelzOff — Compare Hotel & Flight Prices from Top Travel Brands" },
      {
        name: "description",
        content:
          "Compare hotel and flight prices from KAYAK, Booking.com, Agoda, Expedia and more. Find the best deals and book with trusted travel partners.",
      },
      { property: "og:title", content: "HotelzOff — Compare Hotel & Flight Prices" },
      {
        property: "og:description",
        content: "Find the best deals from trusted travel partners worldwide.",
      },
      { property: "og:url", content: "/" },
    ],
    links: [{ rel: "canonical", href: "/" }],
  }),
  component: Index,
});

const today = () => new Date().toISOString().slice(0, 10);
const addDays = (n: number) => {
  const d = new Date();
  d.setDate(d.getDate() + n);
  return d.toISOString().slice(0, 10);
};

function pickString(params: IndexSearch, key: string): string | undefined {
  const v = params[key];
  return typeof v === "string" && v.trim() ? v.trim() : undefined;
}
function pickIsoDate(params: IndexSearch, key: string): string | undefined {
  const v = pickString(params, key);
  return v && /^\d{4}-\d{2}-\d{2}$/.test(v) && !Number.isNaN(new Date(v).getTime()) ? v : undefined;
}
function pickInt(params: IndexSearch, key: string, min: number, max: number): number | undefined {
  const v = pickString(params, key);
  if (!v) return undefined;
  const n = Number.parseInt(v, 10);
  return Number.isFinite(n) ? Math.min(max, Math.max(min, n)) : undefined;
}

function pickFloat(params: IndexSearch, key: string): number | undefined {
  const v = pickString(params, key);
  if (!v) return undefined;
  const n = Number(v);
  return Number.isFinite(n) ? n : undefined;
}

/** Best-effort pre-fill from deep-link params — takes whatever's present and
 * valid, defaults the rest. Never fails the page over one bad field.
 * placeId/entityKey/lat/lon round-trip a share link's resolved KAYAK place
 * (see buildHotelShareLink) so the eventual /go redirect stays precise
 * instead of falling back to a guessed slug. */
function initialHotelSearch(params: IndexSearch): HotelSearch {
  return {
    destination: pickString(params, "destination") ?? "",
    checkIn: pickIsoDate(params, "checkIn") ?? today(),
    checkOut: pickIsoDate(params, "checkOut") ?? addDays(3),
    rooms: pickInt(params, "rooms", 1, 8) ?? 1,
    adults: pickInt(params, "adults", 1, 16) ?? 2,
    children: pickInt(params, "children", 0, 8) ?? 0,
    placeId: pickInt(params, "placeId", 0, Number.MAX_SAFE_INTEGER),
    entityKey: pickString(params, "entityKey"),
    lat: pickFloat(params, "lat"),
    lon: pickFloat(params, "lon"),
  };
}

function initialFlightSearch(params: IndexSearch): FlightSearch {
  const tripType = params.tripType === "one-way" ? "one-way" : "round-trip";
  const cabinValues: FlightSearch["cabin"][] = ["economy", "premium", "business", "first"];
  const cabin = cabinValues.includes(params.cabin as FlightSearch["cabin"])
    ? (params.cabin as FlightSearch["cabin"])
    : "economy";
  return {
    tripType,
    from: (pickString(params, "from") ?? "").toUpperCase(),
    to: (pickString(params, "to") ?? "").toUpperCase(),
    depart: pickIsoDate(params, "depart") ?? today(),
    return: tripType === "round-trip" ? (pickIsoDate(params, "return") ?? addDays(7)) : undefined,
    travellers: pickInt(params, "travellers", 1, 9) ?? 1,
    cabin,
  };
}

function Index() {
  const search = Route.useSearch();
  return (
    <div className="min-h-screen bg-background text-foreground">
      <Toaster position="top-center" />
      <Header />
      <Hero initialSearch={search} />
      <PartnersStrip />
      <PopularDestinations />
      <Deals />
      <HowItWorks />
      <FAQ />
      <Footer />
    </div>
  );
}

/* ------------------------------ Header ------------------------------ */



/* ------------------------------- Hero ------------------------------- */

function Hero({ initialSearch }: { initialSearch: IndexSearch }) {
  return (
    <section id="top" className="relative isolate w-full overflow-x-hidden pt-20 sm:pt-24">
      <img
        src={heroImage}
        alt="Aerial view of a tropical island with overwater bungalows"
        className="absolute inset-0 -z-10 h-full w-full object-cover"
        width={1920}
        height={1280}
      />
      <div className="absolute inset-0 -z-10 bg-gradient-hero" />

      <div className="mx-auto max-w-7xl px-4 pb-10 pt-6 sm:px-6 sm:pb-14 sm:pt-10 lg:pb-20 lg:pt-14">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.7 }}
          className="mx-auto max-w-[22rem] text-center text-white sm:max-w-2xl lg:max-w-4xl"
        >
          <span className="inline-flex items-center gap-1.5 rounded-full glass-dark px-2.5 py-1 text-[10px] font-medium text-white/90 sm:text-xs">
            <Sparkles className="h-3 w-3 sm:h-3.5 sm:w-3.5" /> Compare 100+ trusted travel brands
          </span>
          <h1 className="mt-3 text-balance text-[1.35rem] font-extrabold leading-[1.15] tracking-tight sm:mt-4 sm:text-3xl md:text-4xl lg:text-5xl xl:text-[3.25rem]">
            Compare Hotel &amp; Flight Prices from Top Travel Brands
          </h1>
          <p className="mt-2 text-pretty text-[13px] text-white/85 sm:mt-3 sm:text-sm md:text-base">
            Find the best deals and book with trusted travel partners.
          </p>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.7, delay: 0.15 }}
          id="search"
          className="mx-auto mt-6 max-w-6xl sm:mt-8"
        >
          <SearchBox initialSearch={initialSearch} />
        </motion.div>
      </div>
    </section>
  );
}

/* ---------------------------- Search Box ---------------------------- */

type Tab = "hotels" | "flights";

export function SearchBox({
  initialSearch,
  showCopyLink = false,
}: {
  initialSearch: IndexSearch;
  showCopyLink?: boolean;
}) {
  const [tab, setTab] = useState<Tab>(initialSearch.type === "flight" ? "flights" : "hotels");

  return (
    <div className="rounded-3xl glass p-3 md:p-5 shadow-brand">
      <div className="mb-3 grid grid-cols-2 gap-1.5 rounded-2xl bg-secondary p-1">
        <TabButton active={tab === "hotels"} onClick={() => setTab("hotels")} icon={<Hotel className="h-4 w-4" />}>
          Hotels
        </TabButton>
        <TabButton active={tab === "flights"} onClick={() => setTab("flights")} icon={<Plane className="h-4 w-4" />}>
          Flights
        </TabButton>
      </div>
      {tab === "hotels" ? (
        <HotelForm initial={initialSearch} showCopyLink={showCopyLink} />
      ) : (
        <FlightForm initial={initialSearch} showCopyLink={showCopyLink} />
      )}
    </div>
  );
}

function TabButton({
  active,
  onClick,
  icon,
  children,
}: {
  active: boolean;
  onClick: () => void;
  icon: React.ReactNode;
  children: React.ReactNode;
}) {
  return (
    <button
      onClick={onClick}
      className={`flex items-center justify-center gap-2 rounded-xl px-4 py-2 text-sm font-semibold transition ${
        active
          ? "bg-gradient-brand text-primary-foreground shadow-brand"
          : "text-foreground/70 hover:text-foreground"
      }`}
    >
      {icon}
      {children}
    </button>
  );
}

function Field({
  label,
  icon,
  children,
  className,
}: {
  label: string;
  icon?: React.ReactNode;
  children: React.ReactNode;
  className?: string;
}) {
  return (
    <div className={`flex h-[3.75rem] min-w-0 sm:h-16 flex-col justify-center overflow-visible rounded-2xl bg-background/95 px-4 ring-1 ring-border ${className ?? ""}`}>
      <Label className="mb-0.5 flex items-center gap-1 text-[10px] font-bold uppercase tracking-wider text-muted-foreground leading-none">
        {icon}
        {label}
      </Label>
      {children}
    </div>
  );
}

const inputClass = "h-auto border-0 bg-transparent p-0 pl-0.5 pt-0.5 text-sm font-semibold leading-normal shadow-none focus-visible:ring-0 focus-visible:ring-offset-0 placeholder:text-foreground/50 placeholder:font-medium";


function HotelForm({ initial, showCopyLink = false }: { initial: IndexSearch; showCopyLink?: boolean }) {
  const [s, setS] = useState<HotelSearch>(() => initialHotelSearch(initial));

  const validate = () => {
    if (!s.destination.trim()) {
      toast.error("Please enter a destination");
      return false;
    }
    if (new Date(s.checkOut) <= new Date(s.checkIn)) {
      toast.error("Check-out must be after check-in");
      return false;
    }
    return true;
  };

  const handleSearch = () => {
    if (!validate()) return;
    openRedirect(buildHotelRedirect(s));
  };

  const handleCopyLink = async () => {
    if (!validate()) return;
    const link = `${window.location.origin}${buildHotelShareLink(s)}`;
    await navigator.clipboard.writeText(link);
    toast.success("Link copied!");
  };

  return (
    <div className="space-y-3">
      <div className="grid gap-1.5 md:grid-cols-[2.6fr_1fr_1fr_1fr_0.6fr]">
        <Field label="Destination" icon={<MapPin className="h-3 w-3" />}>
          <DestinationAutocomplete
            value={s.destination}
            onChange={(v) => setS({ ...s, destination: v, placeId: undefined, entityKey: undefined, lat: undefined, lon: undefined })}
            onSelect={(d) =>
              setS((prev) => ({ ...prev, placeId: d.placeId, entityKey: d.entityKey, lat: d.lat, lon: d.lon }))
            }
            kinds={["city", "hotel", "airport"]}
            placeholder="City, hotel or airport"
            apiVertical="hotels"
            debounceMs={250}
          />
        </Field>
        <Field label="Check-in" icon={<CalendarDays className="h-3 w-3" />}>
          <Input type="date" className={inputClass} value={s.checkIn} onChange={(e) => setS({ ...s, checkIn: e.target.value })} />
        </Field>
        <Field label="Check-out" icon={<CalendarDays className="h-3 w-3" />}>
          <Input type="date" className={inputClass} value={s.checkOut} onChange={(e) => setS({ ...s, checkOut: e.target.value })} />
        </Field>
        <Field label="Guests" icon={<Users className="h-3 w-3" />}>
          <GuestsField
            value={{ rooms: s.rooms, adults: s.adults, children: s.children }}
            onChange={(v) => setS({ ...s, ...v })}
          />
        </Field>
        <div className="flex h-[3.75rem] gap-1.5 sm:h-16">
          <Button
            onClick={handleSearch}
            aria-label="Search"
            className="h-full flex-1 rounded-2xl bg-gradient-brand text-base font-bold text-primary-foreground shadow-brand hover:opacity-95"
          >
            <Search className="mr-2 h-5 w-5" /> Search
          </Button>
          {showCopyLink && (
            <Button
              type="button"
              variant="outline"
              onClick={handleCopyLink}
              aria-label="Copy shareable link"
              title="Copy shareable link"
              className="h-full w-12 shrink-0 rounded-2xl p-0"
            >
              <Copy className="h-4 w-4" />
            </Button>
          )}
        </div>
      </div>
    </div>
  );
}

/* ---------------------------- Guests Field --------------------------- */

type GuestsValue = { rooms: number; adults: number; children: number };

const GUESTS_LIMITS = {
  adults: { min: 1, max: 8 },
  children: { min: 0, max: 6 },
  rooms: { min: 1, max: 6 },
} as const;

function GuestsField({ value, onChange }: { value: GuestsValue; onChange: (v: GuestsValue) => void }) {
  const [open, setOpen] = useState(false);
  const rootRef = useRef<HTMLDivElement>(null);
  const menuRef = useRef<HTMLDivElement>(null);
  const pos = useAnchoredMenuPosition(open, rootRef);

  useEffect(() => {
    if (!open) return;
    const onDoc = (e: MouseEvent) => {
      const target = e.target as Node;
      const insideRoot = rootRef.current?.contains(target);
      const insideMenu = menuRef.current?.contains(target);
      if (!insideRoot && !insideMenu) setOpen(false);
    };
    document.addEventListener("mousedown", onDoc);
    return () => document.removeEventListener("mousedown", onDoc);
  }, [open]);

  const totalGuests = value.adults + value.children;
  const summary = `${totalGuests} guest${totalGuests === 1 ? "" : "s"}, ${value.rooms} room${value.rooms === 1 ? "" : "s"}`;

  const step = (key: keyof GuestsValue, delta: number) => {
    const { min, max } = GUESTS_LIMITS[key];
    onChange({ ...value, [key]: Math.min(max, Math.max(min, value[key] + delta)) });
  };

  const menuWidth = pos ? Math.max(pos.width, 300) : 0;
  const menuLeft = pos ? Math.min(pos.left, Math.max(16, window.innerWidth - menuWidth - 16)) : 0;

  return (
    <div ref={rootRef} className="relative">
      <button
        type="button"
        onClick={() => setOpen((o) => !o)}
        aria-expanded={open}
        className="block w-full truncate text-left text-sm font-semibold leading-none"
      >
        {summary}
      </button>
      {open && pos && createPortal(
        <div
          ref={menuRef}
          style={{ position: "fixed", top: pos.top, left: menuLeft, width: menuWidth }}
          className="z-50 rounded-2xl border border-border bg-popover p-4 text-popover-foreground shadow-xl"
        >
          <GuestCounterRow
            label="Adults"
            sublabel="18+ years"
            value={value.adults}
            onDecrease={() => step("adults", -1)}
            onIncrease={() => step("adults", 1)}
          />
          <GuestCounterRow
            label="Children"
            sublabel="0-17 years"
            value={value.children}
            onDecrease={() => step("children", -1)}
            onIncrease={() => step("children", 1)}
          />
          <GuestCounterRow
            label="Rooms"
            sublabel="Each room should contain at least 1 adult"
            value={value.rooms}
            onDecrease={() => step("rooms", -1)}
            onIncrease={() => step("rooms", 1)}
            last
          />
          <div className="mt-2 flex justify-end">
            <button
              type="button"
              onClick={() => setOpen(false)}
              className="text-sm font-semibold text-primary underline-offset-2 hover:underline"
            >
              Done
            </button>
          </div>
        </div>,
        document.body
      )}
    </div>
  );
}

function GuestCounterRow({
  label,
  sublabel,
  value,
  onDecrease,
  onIncrease,
  last,
}: {
  label: string;
  sublabel: string;
  value: number;
  onDecrease: () => void;
  onIncrease: () => void;
  last?: boolean;
}) {
  return (
    <div className={`flex items-center justify-between gap-4 py-3 ${last ? "" : "border-b border-border"}`}>
      <div>
        <p className="text-sm font-semibold text-foreground">{label}</p>
        <p className="text-xs text-muted-foreground">{sublabel}</p>
      </div>
      <div className="flex items-center gap-3">
        <button
          type="button"
          onClick={onDecrease}
          aria-label={`Decrease ${label}`}
          className="flex h-8 w-8 items-center justify-center rounded-full bg-secondary text-foreground transition hover:bg-secondary/70"
        >
          <Minus className="h-4 w-4" />
        </button>
        <span className="w-4 text-center text-sm font-semibold">{value}</span>
        <button
          type="button"
          onClick={onIncrease}
          aria-label={`Increase ${label}`}
          className="flex h-8 w-8 items-center justify-center rounded-full bg-secondary text-foreground transition hover:bg-secondary/70"
        >
          <Plus className="h-4 w-4" />
        </button>
      </div>
    </div>
  );
}

function FlightForm({ initial, showCopyLink = false }: { initial: IndexSearch; showCopyLink?: boolean }) {
  const [s, setS] = useState<FlightSearch>(() => initialFlightSearch(initial));

  const validate = () => {
    if (!s.from.trim() || !s.to.trim()) {
      toast.error("Enter both From and To airports");
      return false;
    }
    return true;
  };

  const handleSearch = () => {
    if (!validate()) return;
    openRedirect(buildFlightRedirect(s));
  };

  const handleCopyLink = async () => {
    if (!validate()) return;
    const link = `${window.location.origin}${buildFlightShareLink(s)}`;
    await navigator.clipboard.writeText(link);
    toast.success("Link copied!");
  };

  return (
    <div className="space-y-2">
      <div className="flex gap-1 rounded-full bg-secondary p-1 w-fit">
        {(["round-trip", "one-way"] as const).map((t) => (
          <button
            key={t}
            onClick={() => setS({ ...s, tripType: t })}
            className={`rounded-full px-4 py-1.5 text-xs font-semibold transition ${
              s.tripType === t ? "bg-background text-foreground shadow-sm" : "text-muted-foreground"
            }`}
          >
            {t === "round-trip" ? "Round Trip" : "One Way"}
          </button>
        ))}
      </div>

      <div className="grid gap-2 md:grid-cols-6">
        <Field label="From" icon={<Plane className="h-3 w-3 -rotate-45" />}>
          <DestinationAutocomplete
            value={s.from}
            onChange={(v) => setS({ ...s, from: v })}
            kinds={["airport", "city"]}
            placeholder="JFK"
            autoUpper
            apiVertical="flights"
            debounceMs={250}
          />
        </Field>
        <Field label="To" icon={<Plane className="h-3 w-3 rotate-45" />}>
          <DestinationAutocomplete
            value={s.to}
            onChange={(v) => setS({ ...s, to: v })}
            kinds={["airport", "city"]}
            placeholder="LHR"
            autoUpper
            apiVertical="flights"
            debounceMs={250}
          />
        </Field>
        <Field label="Departure" icon={<CalendarDays className="h-3 w-3" />}>
          <Input type="date" className={inputClass} value={s.depart} onChange={(e) => setS({ ...s, depart: e.target.value })} />
        </Field>
        <Field label="Return" icon={<CalendarDays className="h-3 w-3" />}>
          <Input
            type="date"
            className={inputClass}
            value={s.return ?? ""}
            disabled={s.tripType === "one-way"}
            onChange={(e) => setS({ ...s, return: e.target.value })}
          />
        </Field>
        <Field label="Travellers & Class" icon={<Users className="h-3 w-3" />}>
          <div className="flex items-center gap-1">
            <NumSelect value={s.travellers} onChange={(v) => setS({ ...s, travellers: v })} max={9} suffix="pax" />
            <Select value={s.cabin} onValueChange={(v) => setS({ ...s, cabin: v as FlightSearch["cabin"] })}>
              <SelectTrigger className="h-8 border-0 bg-transparent p-1 text-sm font-semibold shadow-none focus:ring-0">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="economy">Economy</SelectItem>
                <SelectItem value="premium">Premium</SelectItem>
                <SelectItem value="business">Business</SelectItem>
                <SelectItem value="first">First</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </Field>
        <div className="flex h-[3.75rem] gap-1.5 sm:h-16">
          <Button onClick={handleSearch} className="h-full flex-1 rounded-2xl bg-gradient-brand text-base font-bold text-primary-foreground shadow-brand hover:opacity-95">
            <Search className="mr-2 h-5 w-5" /> Search
          </Button>
          {showCopyLink && (
            <Button
              type="button"
              variant="outline"
              onClick={handleCopyLink}
              aria-label="Copy shareable link"
              title="Copy shareable link"
              className="h-full w-12 shrink-0 rounded-2xl p-0"
            >
              <Copy className="h-4 w-4" />
            </Button>
          )}
        </div>
      </div>
    </div>
  );
}

function NumSelect({
  value,
  onChange,
  max,
  min = 1,
  suffix,
}: {
  value: number;
  onChange: (v: number) => void;
  max: number;
  min?: number;
  suffix: string;
}) {
  const opts = useMemo(() => Array.from({ length: max - min + 1 }, (_, i) => i + min), [max, min]);
  return (
    <Select value={String(value)} onValueChange={(v) => onChange(Number(v))}>
      <SelectTrigger className="h-8 w-auto gap-1 border-0 bg-transparent p-1 text-sm font-semibold shadow-none focus:ring-0">
        <SelectValue />
      </SelectTrigger>
      <SelectContent>
        {opts.map((n) => (
          <SelectItem key={n} value={String(n)}>
            {n} {suffix}
          </SelectItem>
        ))}
      </SelectContent>
    </Select>
  );
}

/* --------------------------- Partners Strip -------------------------- */

const PARTNERS = [
  { name: "KAYAK", logo: kayakLogo },
  { name: "Booking.com", logo: bookingLogo },
  { name: "Expedia", logo: expediaLogo },
  { name: "Hotels.com", logo: hotelsComLogo },
  { name: "Trip.com", logo: tripComLogo },
  { name: "Skyscanner", logo: skyscannerLogo },
];

function PartnersStrip() {
  return (
    <section className="border-y border-border bg-secondary/40 py-10">
      <div className="mx-auto w-full max-w-7xl px-4 overflow-hidden">
        <p className="mb-6 text-center text-xs font-semibold uppercase tracking-widest text-muted-foreground">
          Trusted Travel Partners
        </p>
        
        {/* Desktop view (md and above) */}
        <div className="hidden md:grid grid-cols-2 gap-4 md:grid-cols-3 lg:grid-cols-6">
          {PARTNERS.map((p) => (
            <div key={p.name} className="flex h-14 items-center justify-center p-3">
              <img src={p.logo} alt={p.name} className="max-h-8 w-auto object-contain" loading="lazy" />
            </div>
          ))}
        </div>

        {/* Mobile view (below md) */}
        <div className="flex w-max animate-marquee gap-4 md:hidden">
          {[...PARTNERS, ...PARTNERS].map((p, i) => (
            <div
              key={`${p.name}-${i}`}
              className="flex h-14 w-32 shrink-0 items-center justify-center p-3"
            >
              <img src={p.logo} alt={p.name} className="max-h-8 w-auto object-contain" loading="lazy" />
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}

/* ---------------------------- Why Choose Us -------------------------- */

const FEATURES = [
  { icon: BadgePercent, title: "Compare prices instantly", desc: "One search across dozens of travel sites — the lowest price wins." },
  { icon: Handshake, title: "Trusted travel partners", desc: "Only well-known brands like Booking.com, Expedia and KAYAK." },
  { icon: ShieldCheck, title: "Secure booking experience", desc: "You book directly on the partner's secure checkout, not with us." },
  { icon: Sparkles, title: "Best available deals", desc: "Real-time promos, flash sales and exclusive partner offers." },
  { icon: Zap, title: "Lightning fast search", desc: "Get options in seconds with a clean, distraction-free UI." },
  { icon: Globe2, title: "Worldwide destinations", desc: "Over 2 million properties and 500+ airlines in 200+ countries." },
];


/* ------------------------- Popular Destinations ---------------------- */

const DESTINATIONS = [
  { name: "Dubai", country: "UAE", img: "https://images.unsplash.com/photo-1512453979798-5ea266f8880c?w=1200&q=80" },
  { name: "Bali", country: "Indonesia", img: "https://images.unsplash.com/photo-1537996194471-e657df975ab4?w=1200&q=80" },
  { name: "Singapore", country: "Singapore", img: "https://images.unsplash.com/photo-1525625293386-3f8f99389edd?w=1200&q=80" },
  { name: "Bangkok", country: "Thailand", img: "https://images.unsplash.com/photo-1508009603885-50cf7c579365?w=1200&q=80" },
  { name: "London", country: "UK", img: "https://images.unsplash.com/photo-1513635269975-59663e0ac1ad?w=1200&q=80" },
  { name: "Paris", country: "France", img: "https://images.unsplash.com/photo-1502602898657-3e91760cbb34?w=1200&q=80" },
  { name: "New York", country: "USA", img: "https://images.unsplash.com/photo-1496442226666-8d4d0e62e6e9?w=1200&q=80" },
  { name: "Maldives", country: "Maldives", img: "https://images.unsplash.com/photo-1514282401047-d79a71a590e8?w=1200&q=80" },
];

function PopularDestinations() {
  return (
    <section className="bg-secondary/40 pt-15 pb-16">
      <div className="mx-auto max-w-7xl px-4">
        <SectionHead eyebrow="Popular destinations" title="Where travellers are heading now" />
        <div className="mt-10 grid grid-cols-2 gap-4 md:grid-cols-4">
          {DESTINATIONS.map((d, i) => (
            <motion.a
              key={d.name}
              href="#search"
              initial={{ opacity: 0, scale: 0.96 }}
              whileInView={{ opacity: 1, scale: 1 }}
              viewport={{ once: true }}
              transition={{ duration: 0.35, delay: i * 0.03 }}
              className="group relative aspect-[4/5] overflow-hidden rounded-3xl shadow-soft"
            >
              <img
                src={d.img}
                alt={`${d.name}, ${d.country}`}
                loading="lazy"
                className="absolute inset-0 h-full w-full object-cover transition duration-700 group-hover:scale-110"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-black/10 to-transparent" />
              <div className="absolute inset-x-0 bottom-0 p-4 text-white">
                <p className="text-xs font-medium text-white/80">{d.country}</p>
                <h3 className="text-lg font-bold">{d.name}</h3>
              </div>
            </motion.a>
          ))}
        </div>
      </div>
    </section>
  );
}

/* ------------------------------ Deals ------------------------------- */

const DEALS = [
  {
    title: "Maldives Overwater Escape",
    tag: "Hotels • Up to 35% off",
    img: "https://images.unsplash.com/photo-1573843981267-be1999ff37cd?w=1400&q=80",
  },
  {
    title: "Round-trip to Tokyo",
    tag: "Flights • From $612",
    img: "https://images.unsplash.com/photo-1540959733332-eab4deabeeaf?w=1400&q=80",
  },
  {
    title: "Long weekend in Barcelona",
    tag: "Bundle • Save 20%",
    img: "https://images.unsplash.com/photo-1583422409516-2895a77efded?w=1400&q=80",
  },
];

function Deals() {
  return (
    <section id="deals" className="pt-15 pb-16">
      <div className="mx-auto max-w-7xl px-4">
        <SectionHead eyebrow="Featured deals" title="Handpicked offers from our partners" />
        <div className="mt-10 grid gap-5 lg:grid-cols-3">
          {DEALS.map((d, i) => (
            <motion.a
              key={d.title}
              href="#search"
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.4, delay: i * 0.05 }}
              className="group relative overflow-hidden rounded-3xl shadow-soft"
            >
              <div className="aspect-[16/10] overflow-hidden">
                <img src={d.img} alt={d.title} loading="lazy" className="h-full w-full object-cover transition duration-700 group-hover:scale-110" />
              </div>
              <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/20 to-transparent" />
              <div className="absolute inset-x-0 bottom-0 flex items-end justify-between gap-3 p-5 text-white">
                <div className="min-w-0">
                  <p className="text-xs font-semibold uppercase tracking-wider text-white/80">{d.tag}</p>
                  <h3 className="mt-1 truncate text-xl font-bold">{d.title}</h3>
                </div>
                <span className="inline-flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-white text-primary transition group-hover:bg-gradient-brand group-hover:text-primary-foreground">
                  <ArrowRight className="h-5 w-5" />
                </span>
              </div>
            </motion.a>
          ))}
        </div>
      </div>
    </section>
  );
}

/* --------------------------- How it works --------------------------- */

const STEPS = [
  { n: "01", title: "Enter your travel details", desc: "Tell us where you're going, when, and who's coming along." },
  { n: "02", title: "Compare travel options", desc: "We search dozens of partners in real time to find the best deals." },
  { n: "03", title: "Choose your preferred partner", desc: "Pick the offer and provider that suits you best." },
  { n: "04", title: "Complete your booking securely", desc: "You're redirected to the partner's own secure checkout." },
];

function HowItWorks() {
  return (
    <section className="bg-secondary/40 pt-15 pb-16">
      <div className="mx-auto max-w-7xl px-4">
        <SectionHead eyebrow="How it works" title="Book in four simple steps" />
        <div className="mt-10 grid gap-5 md:grid-cols-2 lg:grid-cols-4">
          {STEPS.map((s, i) => (
            <motion.div
              key={s.n}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.4, delay: i * 0.05 }}
              className="rounded-3xl border border-border bg-card p-6 shadow-soft"
            >
              <div className="text-5xl font-extrabold text-gradient-brand">{s.n}</div>
              <h3 className="mt-3 text-lg font-bold">{s.title}</h3>
              <p className="mt-1.5 text-sm text-muted-foreground">{s.desc}</p>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
}

/* -------------------------------- FAQ ------------------------------- */

const FAQS = [
  {
    q: "How does the comparison work?",
    a: "You enter your search details and we generate deep links to major travel partners like Booking.com, Expedia, KAYAK and more. Clicking Search takes you directly to that partner's live results with your dates and travellers pre-filled.",
  },
  {
    q: "Is there any booking fee?",
    a: "No. HotelzOff is completely free to use. We may earn an affiliate commission from partners when you book, at no extra cost to you.",
  },
  {
    q: "Which travel partners are available?",
    a: "We currently integrate with KAYAK, Booking.com, Agoda, Expedia, Hotels.com, Trip.com, Priceline and Skyscanner. More partners are added regularly.",
  },
  {
    q: "How are prices updated?",
    a: "Prices are pulled live from each partner at the moment you click Search, so what you see is what's currently available on their site.",
  },
];

function FAQ() {
  return (
    <section className="pt-15 pb-16">
      <div className="mx-auto max-w-3xl px-4">
        <SectionHead eyebrow="FAQ" title="Answers to common questions" />
        <Accordion type="single" collapsible className="mt-8">
          {FAQS.map((f) => (
            <AccordionItem key={f.q} value={f.q} className="border-b border-border">
              <AccordionTrigger className="text-left text-base font-semibold hover:no-underline">
                {f.q}
              </AccordionTrigger>
              <AccordionContent className="text-sm text-muted-foreground">{f.a}</AccordionContent>
            </AccordionItem>
          ))}
        </Accordion>
      </div>
    </section>
  );
}

/* ---------------------------- Shared UI ----------------------------- */

function SectionHead({ eyebrow, title }: { eyebrow: string; title: string }) {
  return (
    <div className="mx-auto max-w-2xl text-center">
      <span className="text-xs font-semibold uppercase tracking-widest text-primary">{eyebrow}</span>
      <h2 className="mt-3 text-3xl font-extrabold sm:text-4xl">{title}</h2>
      <div className="mx-auto mt-3 h-1 w-16 rounded-full bg-gradient-brand" />
    </div>
  );
}

// Silence unused ChevronDown import (kept for future filters)
void ChevronDown;
