import { createFileRoute, Link } from "@tanstack/react-router";
import { Header, Footer } from "@/components/SharedLayout";

export const Route = createFileRoute("/terms")({
  head: () => ({
    meta: [{ title: "Terms & Conditions | HotelzOff" }],
  }),
  component: Terms,
});

function Terms() {
  const currentDate = new Intl.DateTimeFormat("en-US", {
    month: "long",
    day: "numeric",
    year: "numeric",
  }).format(new Date());

  return (
    <div className="min-h-screen bg-background text-foreground pt-20">
      <Header />
      
      <main className="mx-auto max-w-5xl px-4 py-12 sm:py-20">
        <h1 className="text-2xl font-extrabold sm:text-4xl">Terms & Conditions</h1>
        <p className="mt-4 text-sm text-muted-foreground">
          Contact: <strong>contact@hotelzoff.com</strong> • Last updated: {currentDate}
        </p>

        <div className="mt-10 space-y-8 text-base text-foreground/90 leading-relaxed">
          <p>
            These Terms & Conditions govern your use of Hotelzoff. By accessing or using this Platform, you agree to comply with these terms, including all policies referenced herein.
          </p>

          {/* <div className="rounded-lg bg-secondary/30 p-6 border border-border mb-8">
            <h2 className="text-sm font-bold uppercase tracking-widest text-foreground mb-4">Contents</h2>
            <ol className="list-decimal pl-5 space-y-1 text-sm font-medium">
              <li><a href="#acceptance" className="hover:text-primary transition">Acceptance of Terms</a></li>
              <li><a href="#about" className="hover:text-primary transition">About the Platform</a></li>
              <li><a href="#company" className="hover:text-primary transition">Company Information</a></li>
              <li><a href="#eligibility" className="hover:text-primary transition">Eligibility</a></li>
              <li><a href="#affiliate" className="hover:text-primary transition">Affiliate Disclosure</a></li>
              <li><a href="#third-party" className="hover:text-primary transition">Third-Party Providers</a></li>
              <li><a href="#responsibilities" className="hover:text-primary transition">User Responsibilities</a></li>
              <li><a href="#intellectual-property" className="hover:text-primary transition">Intellectual Property</a></li>
              <li><a href="#prohibited" className="hover:text-primary transition">Prohibited Activities</a></li>
              <li><a href="#accuracy" className="hover:text-primary transition">Accuracy of Information</a></li>
              <li><a href="#disclaimer" className="hover:text-primary transition">Disclaimer of Warranties</a></li>
              <li><a href="#liability" className="hover:text-primary transition">Limitation of Liability</a></li>
              <li><a href="#privacy" className="hover:text-primary transition">Privacy</a></li>
              <li><a href="#termination" className="hover:text-primary transition">Termination</a></li>
              <li><a href="#modifications" className="hover:text-primary transition">Modifications</a></li>
              <li><a href="#law" className="hover:text-primary transition">Governing Law</a></li>
              <li><a href="#contact" className="hover:text-primary transition">Contact Information</a></li>
            </ol>
          </div> */}

          <section id="acceptance">
            <h2 className="text-xl font-bold text-foreground mb-4 sm:text-2xl">1. ACCEPTANCE OF TERMS</h2>
            <p>
              By accessing and using Hotelzoff, you agree to these Terms & Conditions. If you do not agree, you should discontinue use of the Platform immediately.
            </p>
          </section>

          <section id="about">
            <h2 className="text-xl font-bold text-foreground mb-4 sm:text-2xl">2. ABOUT THE PLATFORM</h2>
            <p className="mb-4">
              Hotelzoff is a hotel comparison and redirect platform that helps users discover hotel pricing, availability, and travel-related offers from third-party providers.
            </p>
            <p>
              We do not directly own, manage, or operate hotels, nor do we process hotel reservations or payments directly in most cases.
            </p>
          </section>

          <section id="company">
            <h2 className="text-xl font-bold text-foreground mb-4 sm:text-2xl">3. COMPANY INFORMATION</h2>
            <p className="mb-4">
              Hotelzoff is operated by <strong>U1 Technologies Private Limited</strong>.
            </p>
            <p className="mb-4">
              Hotelzoff is a part of U1 Technologies Private Limited and is responsible for operating and managing this Platform.
            </p>
            <div className="rounded-lg bg-secondary/50 p-4 border border-border">
              <strong>Company:</strong> U1 Technologies Private Limited<br/>
              <strong>Address:</strong> 3rd Floor, A-28, Block A, Sector 4, Sector-4, Noida, Uttar Pradesh 201305<br/>
              <strong>Email:</strong> contact@hotelzoff.com
            </div>
          </section>

          <section id="eligibility">
            <h2 className="text-xl font-bold text-foreground mb-4 sm:text-2xl">4. ELIGIBILITY</h2>
            <p>
              You must be at least 18 years old or the legal age required in your jurisdiction to use this Platform.
            </p>
          </section>

          <section id="affiliate">
            <h2 className="text-xl font-bold text-foreground mb-4 sm:text-2xl">5. AFFILIATE DISCLOSURE</h2>
            <p className="mb-4">
              Hotelzoff may earn affiliate commissions when users click on certain links or complete qualifying actions on partner websites.
            </p>
            <div className="rounded-lg bg-secondary/50 p-4 border border-border">
              Your booking price is generally not increased because of affiliate partnerships.
            </div>
          </section>

          <section id="third-party">
            <h2 className="text-xl font-bold text-foreground mb-4 sm:text-2xl">6. THIRD-PARTY PROVIDERS</h2>
            <p className="mb-4">
              The Platform contains links to third-party booking websites and travel providers. Once you leave our Platform, the third party's terms and policies apply.
            </p>
            <p>
              We are not responsible for pricing inaccuracies, cancellations, booking disputes, refunds, availability, or issues caused by third-party providers.
            </p>
          </section>

          <section id="responsibilities">
            <h2 className="text-xl font-bold text-foreground mb-4 sm:text-2xl">7. USER RESPONSIBILITIES</h2>
            <ul className="list-disc pl-5 space-y-2">
              <li>Provide accurate information when using the Platform.</li>
              <li>Use the Platform lawfully and responsibly.</li>
              <li>Do not misuse, disrupt, or attempt unauthorized access.</li>
              <li>Review partner terms before completing bookings.</li>
            </ul>
          </section>

          <section id="intellectual-property">
            <h2 className="text-xl font-bold text-foreground mb-4 sm:text-2xl">8. INTELLECTUAL PROPERTY</h2>
            <p>
              All content on the Platform including branding, text, graphics, layouts, logos, and design elements are owned by Hotelzoff or its licensors and are protected under intellectual property laws.
            </p>
          </section>

          <section id="prohibited">
            <h2 className="text-xl font-bold text-foreground mb-4 sm:text-2xl">9. PROHIBITED ACTIVITIES</h2>
            <ul className="list-disc pl-5 space-y-2">
              <li>Using bots, scrapers, or automated systems.</li>
              <li>Attempting to interfere with security systems.</li>
              <li>Copying or reproducing website content without permission.</li>
              <li>Using the Platform for unlawful activities.</li>
            </ul>
          </section>

          <section id="accuracy">
            <h2 className="text-xl font-bold text-foreground mb-4 sm:text-2xl">10. ACCURACY OF INFORMATION</h2>
            <p>
              We strive to provide accurate and updated information, but we cannot guarantee the completeness, reliability, or accuracy of listings, hotel pricing, availability, or promotional offers.
            </p>
          </section>

          <section id="disclaimer">
            <h2 className="text-xl font-bold text-foreground mb-4 sm:text-2xl">11. DISCLAIMER OF WARRANTIES</h2>
            <p>
              The Platform is provided "as is" and "as available" without warranties of any kind, whether express or implied.
            </p>
          </section>

          <section id="liability">
            <h2 className="text-xl font-bold text-foreground mb-4 sm:text-2xl">12. LIMITATION OF LIABILITY</h2>
            <p>
              To the maximum extent permitted by law, Hotelzoff and U1 Technologies Private Limited shall not be liable for indirect, incidental, special, or consequential damages arising from your use of the Platform.
            </p>
          </section>

          <section id="privacy">
            <h2 className="text-xl font-bold text-foreground mb-4 sm:text-2xl">13. PRIVACY</h2>
            <p>
              Your use of the Platform is also governed by our <Link to="/privacy" className="text-primary hover:underline font-medium">Privacy Policy</Link>.
            </p>
          </section>

          <section id="termination">
            <h2 className="text-xl font-bold text-foreground mb-4 sm:text-2xl">14. TERMINATION</h2>
            <p>
              We reserve the right to restrict or terminate access to the Platform if we believe a user has violated these Terms & Conditions.
            </p>
          </section>

          <section id="modifications">
            <h2 className="text-2xl font-bold text-foreground mb-4">15. MODIFICATIONS</h2>
            <p>
              We may update these Terms & Conditions at any time without prior notice. Continued use of the Platform after updates constitutes acceptance of the revised terms.
            </p>
          </section>

          <section id="law">
            <h2 className="text-2xl font-bold text-foreground mb-4">16. GOVERNING LAW</h2>
            <p>
              These Terms & Conditions shall be governed by and interpreted in accordance with the laws applicable in India.
            </p>
          </section>

          <section id="contact">
            <h2 className="text-2xl font-bold text-foreground mb-4">17. CONTACT INFORMATION</h2>
            <div className="rounded-lg bg-secondary/50 p-4 border border-border">
              <strong>Operated by:</strong> U1 Technologies Private Limited<br/>
              <strong>Address:</strong> 3rd Floor, A-28, Block A, Sector 4, Sector-4, Noida, Uttar Pradesh 201305<br/>
              <strong>Email:</strong> contact@hotelzoff.com
            </div>
          </section>
        </div>
      </main>

      <Footer />
    </div>
  );
}
