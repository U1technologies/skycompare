import { Link } from "@tanstack/react-router";
import { Search } from "lucide-react";
import { Button } from "@/components/ui/button";

export function Header() {
  const nav = [
    { label: "Hotels", href: "/#search" },
    { label: "Flights", href: "/#search" },
    { label: "Deals", href: "/#deals" },
    { label: "Contact", href: "/#contact" },
  ];
  return (
    <header className="fixed top-0 left-0 right-0 z-50">
      <div className="mx-auto mt-4 md:mt-6 flex w-[calc(100%_-_2rem)] max-w-7xl items-center justify-between rounded-2xl glass px-4 py-2.5 shadow-soft sm:w-[calc(100%_-_2rem)] sm:px-5">
        <Link to="/" className="flex items-center gap-2">
          <span className="text-lg font-bold tracking-tight text-foreground">
            Hotelz<span className="text-gradient-brand">Off</span>
          </span>
        </Link>
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
          <a href="/#search">
            <Search className="mr-1.5 h-4 w-4" /> Search
          </a>
        </Button>
      </div>
    </header>
  );
}

export function Footer() {
  return (
    <footer id="contact" className="border-t border-border bg-background">
      <div className="mx-auto max-w-7xl px-4 py-14">
        <div className="grid gap-10 md:grid-cols-5">
          <div className="md:col-span-3">
            <h3 className="text-xl font-bold font-display text-foreground">
              Hotelz<span className="text-gradient-brand">Off</span>
            </h3>
            <p className="mt-4 max-w-xl text-sm text-muted-foreground/90 leading-relaxed">
              HotelzOff instantly compares prices across hundreds of trusted travel sites, helping you find the absolute best deals on both hotels and flights. Book with confidence, save time, and travel smarter.
            </p>
          </div>

          <FooterCol 
            title="COMPANY" 
            links={[
              { label: "Contact", href: "mailto:contact@hotelzoff.com" }, 
              { label: "Privacy Policy", href: "/privacy" }, 
              { label: "Terms & Conditions", href: "/terms" }
            ]} 
          />
          <FooterCol 
            title="EXPLORE" 
            links={[
              { label: "Hotels", href: "/#search" }, 
              { label: "Car Rentals", href: "/#search" }, 
              { label: "Flights", href: "/#search" }
            ]} 
          />
        </div>

        <div className="mt-12 flex flex-col items-start justify-between gap-3 border-t border-border pt-6 text-xs text-muted-foreground sm:flex-row sm:items-center">
          <p>© {new Date().getFullYear()} HotelzOff. All rights reserved.</p>
          <p className="sm:text-right">
            Marketed by <span className="font-bold text-foreground">NextagMedia</span>
          </p>
        </div>
      </div>
    </footer>
  );
}

function FooterCol({ title, links }: { title: string; links: { label: string; href?: string }[] }) {
  return (
    <div>
      <h4 className="text-[11px] font-bold uppercase tracking-widest text-foreground">{title}</h4>
      <ul className="mt-4 space-y-3 text-sm">
        {links.map((l) => (
          <li key={l.label}>
            {l.href?.startsWith("/") ? (
              <Link 
                to={l.href} 
                className="transition hover:text-primary text-muted-foreground"
              >
                {l.label}
              </Link>
            ) : (
              <a 
                href={l.href || "#"} 
                className="transition hover:text-primary text-muted-foreground"
              >
                {l.label}
              </a>
            )}
          </li>
        ))}
      </ul>
    </div>
  );
}
