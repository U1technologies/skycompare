import { createFileRoute } from "@tanstack/react-router";
import { useMemo, useState } from "react";
import { motion } from "framer-motion";
import {
  Plane,
  Hotel,
  MapPin,
  CalendarDays,
  Users,
  Search,
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
import {
  HOTEL_PROVIDERS,
  FLIGHT_PROVIDERS,
  buildHotelRedirect,
  buildFlightRedirect,
  openRedirect,
  type HotelSearch,
  type FlightSearch,
} from "@/lib/affiliates";
import { DestinationAutocomplete } from "@/components/DestinationAutocomplete";

export const Route = createFileRoute("/")({
  head: () => ({
    meta: [
      { title: "SkyCompare — Compare Hotel & Flight Prices from Top Travel Brands" },
      {
        name: "description",
        content:
          "Compare hotel and flight prices from KAYAK, Booking.com, Agoda, Expedia and more. Find the best deals and book with trusted travel partners.",
      },
      { property: "og:title", content: "SkyCompare — Compare Hotel & Flight Prices" },
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

function Index() {
  return (
    <div className="min-h-screen bg-background text-foreground">
      <Toaster position="top-center" />
      <Header />
      <Hero />
      <PartnersStrip />
      <WhyChoose />
      <PopularDestinations />
      <Deals />
      <HowItWorks />
      <FAQ />
      <Footer />
    </div>
  );
}

/* ------------------------------ Header ------------------------------ */

function Header() {
  const nav = [
    { label: "Hotels", href: "#search" },
    { label: "Flights", href: "#search" },
    { label: "Deals", href: "#deals" },
    { label: "Contact", href: "#contact" },
  ];
  return (
    <header className="fixed top-0 left-0 right-0 z-50">
      <div className="mx-auto mt-3 flex max-w-7xl items-center justify-between rounded-2xl glass px-4 py-2.5 shadow-soft sm:mx-4 sm:px-5">
        <a href="#top" className="flex items-center gap-2">
          <img src={logo} alt="SkyCompare" className="h-9 w-9" width={36} height={36} />
          <span className="text-lg font-bold tracking-tight text-foreground">
            Sky<span className="text-gradient-brand">Compare</span>
          </span>
        </a>
        <nav className="hidden items-center gap-1 md:flex">
          {nav.map((n) => (
            <a
              key={n.label}
              href={n.href}
              className="rounded-lg px-3 py-2 text-sm font-medium text-foreground/80 transition hover:bg-secondary hover:text-foreground"
            >
              {n.label}
            </a>
          ))}
        </nav>
        <Button asChild size="sm" className="bg-gradient-brand text-primary-foreground shadow-brand">
          <a href="#search">
            <Search className="mr-1.5 h-4 w-4" /> Search
          </a>
        </Button>
      </div>
    </header>
  );
}

/* ------------------------------- Hero ------------------------------- */

function Hero() {
  return (
    <section id="top" className="relative isolate w-full overflow-hidden pt-20 sm:pt-24">
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
          className="mx-auto mt-6 max-w-5xl sm:mt-8"
        >
          <SearchBox />
        </motion.div>
      </div>
    </section>
  );
}

/* ---------------------------- Search Box ---------------------------- */

type Tab = "hotels" | "flights";

function SearchBox() {
  const [tab, setTab] = useState<Tab>("hotels");

  return (
    <div className="rounded-3xl glass p-3 shadow-brand sm:p-4">
      <div className="mb-3 grid grid-cols-2 gap-1.5 rounded-2xl bg-secondary p-1">
        <TabButton active={tab === "hotels"} onClick={() => setTab("hotels")} icon={<Hotel className="h-4 w-4" />}>
          Hotels
        </TabButton>
        <TabButton active={tab === "flights"} onClick={() => setTab("flights")} icon={<Plane className="h-4 w-4" />}>
          Flights
        </TabButton>
      </div>
      {tab === "hotels" ? <HotelForm /> : <FlightForm />}
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
      className={`flex items-center justify-center gap-2 rounded-xl px-4 py-2.5 text-sm font-semibold transition ${
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
    <div className={`rounded-2xl bg-background/95 p-3 ring-1 ring-border ${className ?? ""}`}>
      <Label className="mb-1 flex items-center gap-1.5 text-[11px] font-semibold uppercase tracking-wide text-muted-foreground">
        {icon}
        {label}
      </Label>
      {children}
    </div>
  );
}

const inputClass =
  "border-0 bg-transparent p-0 text-base font-semibold shadow-none focus-visible:ring-0 focus-visible:ring-offset-0 h-8";

function HotelForm() {
  const [s, setS] = useState<HotelSearch>({
    destination: "",
    checkIn: today(),
    checkOut: addDays(3),
    rooms: 1,
    adults: 2,
    children: 0,
  });
  const [providerId, setProviderId] = useState(HOTEL_PROVIDERS[0].id);

  const handleSearch = () => {
    if (!s.destination.trim()) {
      toast.error("Please enter a destination");
      return;
    }
    if (new Date(s.checkOut) <= new Date(s.checkIn)) {
      toast.error("Check-out must be after check-in");
      return;
    }
    const p = HOTEL_PROVIDERS.find((p) => p.id === providerId)!;
    toast.success(`Redirecting to ${p.name}…`);
    openRedirect(buildHotelRedirect(p.id, s));
  };

  return (
    <div className="grid gap-2 md:grid-cols-6">
      <Field label="Destination" icon={<MapPin className="h-3 w-3" />} className="md:col-span-2">
        <DestinationAutocomplete
          value={s.destination}
          onChange={(v) => setS({ ...s, destination: v })}
          kinds={["city", "hotel", "airport"]}
          placeholder="City, hotel or airport"
        />
      </Field>
      <Field label="Check-in" icon={<CalendarDays className="h-3 w-3" />}>
        <Input type="date" className={inputClass} value={s.checkIn} onChange={(e) => setS({ ...s, checkIn: e.target.value })} />
      </Field>
      <Field label="Check-out" icon={<CalendarDays className="h-3 w-3" />}>
        <Input type="date" className={inputClass} value={s.checkOut} onChange={(e) => setS({ ...s, checkOut: e.target.value })} />
      </Field>
      <Field label="Guests" icon={<Users className="h-3 w-3" />}>
        <div className="flex items-center gap-1 text-sm font-semibold">
          <NumSelect value={s.rooms} onChange={(v) => setS({ ...s, rooms: v })} max={6} suffix="rm" />
          <NumSelect value={s.adults} onChange={(v) => setS({ ...s, adults: v })} max={8} suffix="ad" />
          <NumSelect value={s.children} onChange={(v) => setS({ ...s, children: v })} max={6} suffix="ch" min={0} />
        </div>
      </Field>
      <Button onClick={handleSearch} className="h-full min-h-14 rounded-2xl bg-gradient-brand text-base font-bold text-primary-foreground shadow-brand hover:opacity-95">
        <Search className="mr-2 h-5 w-5" /> Search
      </Button>

      <div className="md:col-span-6 flex flex-wrap items-center gap-2 pt-1">
        <span className="text-xs font-medium text-muted-foreground">Redirect to:</span>
        {HOTEL_PROVIDERS.map((p) => (
          <button
            key={p.id}
            onClick={() => setProviderId(p.id)}
            className={`rounded-full px-3 py-1 text-xs font-semibold transition ${
              providerId === p.id ? "bg-primary text-primary-foreground" : "bg-secondary text-foreground/70 hover:bg-secondary/70"
            }`}
          >
            {p.name}
          </button>
        ))}
      </div>
    </div>
  );
}

function FlightForm() {
  const [s, setS] = useState<FlightSearch>({
    tripType: "round-trip",
    from: "",
    to: "",
    depart: today(),
    return: addDays(7),
    travellers: 1,
    cabin: "economy",
  });
  const [providerId, setProviderId] = useState(FLIGHT_PROVIDERS[0].id);

  const handleSearch = () => {
    if (!s.from.trim() || !s.to.trim()) {
      toast.error("Enter both From and To airports");
      return;
    }
    const p = FLIGHT_PROVIDERS.find((p) => p.id === providerId)!;
    toast.success(`Redirecting to ${p.name}…`);
    openRedirect(buildFlightRedirect(p.id, s));
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
          <Input className={inputClass} placeholder="JFK" value={s.from} onChange={(e) => setS({ ...s, from: e.target.value.toUpperCase() })} />
        </Field>
        <Field label="To" icon={<Plane className="h-3 w-3 rotate-45" />}>
          <Input className={inputClass} placeholder="LHR" value={s.to} onChange={(e) => setS({ ...s, to: e.target.value.toUpperCase() })} />
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
        <Button onClick={handleSearch} className="h-full min-h-14 rounded-2xl bg-gradient-brand text-base font-bold text-primary-foreground shadow-brand hover:opacity-95">
          <Search className="mr-2 h-5 w-5" /> Search
        </Button>
      </div>

      <div className="flex flex-wrap items-center gap-2 pt-1">
        <span className="text-xs font-medium text-muted-foreground">Redirect to:</span>
        {FLIGHT_PROVIDERS.map((p) => (
          <button
            key={p.id}
            onClick={() => setProviderId(p.id)}
            className={`rounded-full px-3 py-1 text-xs font-semibold transition ${
              providerId === p.id ? "bg-primary text-primary-foreground" : "bg-secondary text-foreground/70 hover:bg-secondary/70"
            }`}
          >
            {p.name}
          </button>
        ))}
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
        <span className="text-xs text-muted-foreground">{suffix}</span>
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
  "KAYAK",
  "Booking.com",
  "Agoda",
  "Expedia",
  "Hotels.com",
  "Trip.com",
  "Priceline",
  "Skyscanner",
];

function PartnersStrip() {
  return (
    <section className="border-y border-border bg-secondary/40 py-10">
      <div className="mx-auto max-w-7xl px-4">
        <p className="mb-6 text-center text-xs font-semibold uppercase tracking-widest text-muted-foreground">
          Trusted Travel Partners
        </p>
        <div className="grid grid-cols-2 gap-4 sm:grid-cols-4 lg:grid-cols-8">
          {PARTNERS.map((p) => (
            <div
              key={p}
              className="flex h-14 items-center justify-center rounded-xl bg-background text-sm font-bold text-foreground/70 shadow-soft ring-1 ring-border transition hover:text-primary"
            >
              {p}
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

function WhyChoose() {
  return (
    <section className="py-20">
      <div className="mx-auto max-w-7xl px-4">
        <SectionHead eyebrow="Why SkyCompare" title="Everything you need to travel smarter" />
        <div className="mt-10 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {FEATURES.map((f, i) => (
            <motion.div
              key={f.title}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true, margin: "-60px" }}
              transition={{ duration: 0.4, delay: i * 0.05 }}
              className="group rounded-3xl border border-border bg-card p-6 shadow-soft transition hover:-translate-y-1 hover:shadow-brand"
            >
              <div className="mb-4 inline-flex h-12 w-12 items-center justify-center rounded-2xl bg-gradient-brand text-primary-foreground shadow-brand">
                <f.icon className="h-6 w-6" />
              </div>
              <h3 className="text-lg font-bold">{f.title}</h3>
              <p className="mt-1.5 text-sm text-muted-foreground">{f.desc}</p>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
}

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
    <section className="bg-secondary/40 py-20">
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
    <section id="deals" className="py-20">
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
    <section className="bg-secondary/40 py-20">
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
    a: "No. SkyCompare is completely free to use. We may earn an affiliate commission from partners when you book, at no extra cost to you.",
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
    <section className="py-20">
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

/* ------------------------------ Footer ------------------------------ */

function Footer() {
  return (
    <footer id="contact" className="border-t border-border bg-secondary/60">
      <div className="mx-auto max-w-7xl px-4 py-14">
        <div className="grid gap-10 md:grid-cols-4">
          <div>
            <div className="flex items-center gap-2">
              <img src={logo} alt="SkyCompare" className="h-9 w-9" width={36} height={36} loading="lazy" />
              <span className="text-lg font-bold">
                Sky<span className="text-gradient-brand">Compare</span>
              </span>
            </div>
            <p className="mt-4 max-w-xs text-sm text-muted-foreground">
              Compare hotels and flights from the world's most trusted travel brands — all in one place.
            </p>
            <div className="mt-5 flex gap-3">
              {[Twitter, Facebook, Instagram, Youtube].map((Icon, i) => (
                <a
                  key={i}
                  href="#"
                  aria-label="Social link"
                  className="inline-flex h-9 w-9 items-center justify-center rounded-full bg-background text-foreground/70 shadow-soft ring-1 ring-border transition hover:text-primary"
                >
                  <Icon className="h-4 w-4" />
                </a>
              ))}
            </div>
          </div>

          <FooterCol title="Company" links={["About", "Contact", "Careers", "Blog"]} />
          <FooterCol title="Legal" links={["Privacy Policy", "Terms & Conditions", "Cookie Policy", "Affiliate Disclosure"]} />
          <FooterCol title="Support" links={["Help Center", "How it works", "Partner with us", "Report an issue"]} />
        </div>

        <div className="mt-12 flex flex-col items-start justify-between gap-3 border-t border-border pt-6 text-xs text-muted-foreground sm:flex-row sm:items-center">
          <p>© {new Date().getFullYear()} SkyCompare. All rights reserved.</p>
          <p className="max-w-2xl sm:text-right">
            Affiliate disclosure: SkyCompare may earn a commission when you book via a partner link. This never affects the price you pay.
          </p>
        </div>
      </div>
    </footer>
  );
}

function FooterCol({ title, links }: { title: string; links: string[] }) {
  return (
    <div>
      <h4 className="text-sm font-bold text-foreground">{title}</h4>
      <ul className="mt-4 space-y-2 text-sm text-muted-foreground">
        {links.map((l) => (
          <li key={l}>
            <a href="#" className="transition hover:text-primary">
              {l}
            </a>
          </li>
        ))}
      </ul>
    </div>
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
