import { createFileRoute, Link } from "@tanstack/react-router";
import { Header, Footer } from "@/components/SharedLayout";

export const Route = createFileRoute("/privacy")({
  head: () => ({
    meta: [{ title: "Privacy Policy | HotelzOff" }],
  }),
  component: Privacy,
});

function Privacy() {
  const currentDate = new Intl.DateTimeFormat("en-US", {
    month: "long",
    day: "numeric",
    year: "numeric",
  }).format(new Date());

  return (
    <div className="min-h-screen bg-background text-foreground pt-20">
      <Header />
      
      <main className="mx-auto max-w-5xl px-4 py-12 sm:py-20">
        <h1 className="text-2xl font-extrabold sm:text-4xl">Privacy Policy</h1>
        <p className="mt-4 text-sm text-muted-foreground">
          Contact: <strong>contact@hotelzoff.com</strong> • Last updated: {currentDate}
        </p>

        <div className="mt-10 space-y-8 text-base text-foreground/90 leading-relaxed">
          <p>
            This Privacy Policy explains how Hotelzoff ("we", "us", "our", "Platform") collects, uses, shares, and protects information when you browse our website, interact with our tools, and click through to hotel booking partners and providers.
          </p>

          <section>
            <h2 className="text-xl font-bold text-foreground mb-4 sm:text-2xl">1. INTRODUCTION & SCOPE</h2>
            <p className="mb-4">
              Hotelzoff is designed to help you explore hotel pricing options and availability by allowing you to search destinations and date ranges and then click through to third-party providers to complete a booking or to view offers. We take privacy seriously and we aim to provide a clear explanation of how information is handled when you use our Platform.
            </p>
            <p className="mb-4">
              This Privacy Policy applies to the website located at <strong>https://hotelzoff.com</strong>, including any subpages, embedded tools, widgets, landing pages, and features that link to or reference this Privacy Policy (collectively, the "Platform"). It also applies to communications you send to us (for example, support emails).
            </p>
            <p className="mb-4">
              This Privacy Policy does not apply to third-party websites or services that we do not own or control. When you click out to a partner website (for example, a booking site), that partner's privacy policy and terms govern their data practices. We encourage you to review those third-party policies carefully.
            </p>
            <div className="rounded-lg bg-secondary/50 p-4 border border-border">
              <strong>Important:</strong> Hotelzoff is typically a <em>comparison + redirect</em> experience. Many bookings and payments happen on third-party partner sites. That means they may collect additional information not collected by us (for example, payment details).
            </div>
          </section>

          <section>
            <h2 className="text-xl font-bold text-foreground mb-4 sm:text-2xl">2. DEFINITIONS</h2>
            <p className="mb-4">To make this Privacy Policy easier to understand, we use the following definitions:</p>
            <ul className="list-disc pl-5 space-y-2 mb-4">
              <li><strong>"Personal Data"</strong> means information that identifies you or can reasonably be linked to you, directly or indirectly.</li>
              <li><strong>"Processing"</strong> means any operation performed on Personal Data, such as collecting, storing, using, sharing, analyzing, or deleting.</li>
              <li><strong>"Controller"</strong> (or "Business" under some U.S. laws) determines the purposes and means of processing Personal Data.</li>
              <li><strong>"Processor"</strong> (or "Service Provider" under some U.S. laws) processes Personal Data on behalf of a Controller.</li>
              <li><strong>"Partner"</strong> means third-party providers such as affiliate networks, booking marketplaces, travel search engines, analytics vendors, advertising partners, and infrastructure providers.</li>
              <li><strong>"Cookie"</strong> means a small text file stored by your browser, often used for remembering preferences or tracking usage.</li>
              <li><strong>"Pixel/Tag"</strong> means small scripts used to measure events, attribute conversions, and improve performance.</li>
            </ul>
            <p>We may use terms like "personal information" and "Personal Data" interchangeably, depending on the applicable law and region.</p>
          </section>

          <section>
            <h2 className="text-xl font-bold text-foreground mb-4 sm:text-2xl">3. WHO WE ARE & HOW TO CONTACT US</h2>
            <p className="mb-4">
              Hotelzoff is operated by <strong>U1 Technologies Private Limited</strong>. Hotelzoff is a part of U1 Technologies Private Limited and is responsible for operating and managing this Platform.
            </p>
            <p className="mb-4">
              We act as a data controller for the information we collect directly through the Platform (for example, log data and support emails). In some limited scenarios, we may act as a processor when processing data on behalf of another controller.
            </p>
            <div className="rounded-lg bg-secondary/50 p-4 border border-border mb-4">
              <strong>Company:</strong> U1 Technologies Private Limited<br/>
              <strong>Corporate Address:</strong> 3rd Floor, A-28, Block A, Sector 4, Sector-4, Noida, Uttar Pradesh 201305<br/>
              <strong>Email:</strong> contact@hotelzoff.com
            </div>
            <p>
              To help protect your privacy and prevent fraud, we may ask you to verify your identity before fulfilling certain requests (for example, requests to access or delete information). We will handle verification requests in a reasonable and proportionate way.
            </p>
          </section>

          <section>
            <h2 className="text-xl font-bold text-foreground mb-4 sm:text-2xl">4. WHAT WE DO (COMPARISON + REDIRECT MODEL)</h2>
            <p className="mb-4">
              The Platform provides a search-and-compare experience. You may enter a destination (for example, a city or hotel), choose check-in and check-out dates, and specify occupancy such as rooms and guests. The Platform may then generate a link or redirect that takes you to a third-party site to view availability and pricing.
            </p>
            <p className="mb-4">
              In many cases, we do not process payments, confirm bookings, or fulfill reservations directly. Instead, our Platform helps you discover options and then connects you to partners who provide booking and travel services. Because the final transaction may occur on a partner site, those partners may collect additional information such as your name, passport details, payment method, loyalty numbers, or other booking information.
            </p>
            <p>
              We design our Platform to collect the minimum amount of data reasonably needed to operate and improve the service. When possible, we use aggregated or pseudonymous data for analytics and reporting.
            </p>
          </section>

          <section>
            <h2 className="text-xl font-bold text-foreground mb-4 sm:text-2xl">5. AFFILIATE DISCLOSURE & MONETIZATION</h2>
            <p className="mb-4">
              Hotelzoff may earn revenue through affiliate relationships. This means that when you click certain links, buttons, or call-to-action elements on our Platform, you may be redirected to a partner or affiliate network. If you complete a qualifying action (for example, performing a search, requesting pricing, or completing a booking), the partner may provide us with a commission or referral fee.
            </p>
            <p className="mb-4">
              <strong>Your price is not increased</strong> because of affiliate relationships. Affiliate revenue helps us pay for hosting, development, customer support, fraud prevention, security, and ongoing improvements to the Platform.
            </p>
            <p className="mb-4">
              Affiliate attribution usually relies on referral parameters, cookies, or similar technologies. When you click out to a partner, those partners may set cookies or use identifiers to understand that the traffic originated from our Platform, which enables reporting and commission tracking. This does not necessarily include your name or contact details, but it may include a device identifier, click timestamp, or session data.
            </p>
            <div className="rounded-lg bg-secondary/50 p-4 border border-border">
              <strong>Affiliate note:</strong> After you leave Hotelzoff, the partner's privacy policy applies. We do not control partner sites and we are not responsible for their content, security, or data practices.
            </div>
          </section>

          <section>
            <h2 className="text-xl font-bold text-foreground mb-4 sm:text-2xl">6. INFORMATION WE COLLECT (OVERVIEW)</h2>
            <p className="mb-4">We collect information in three main ways:</p>
            <ul className="list-disc pl-5 space-y-2 mb-4">
              <li><strong>Information you provide</strong> (for example, when you type a destination, email us, or submit a support request).</li>
              <li><strong>Information collected automatically</strong> (for example, IP address, device/browser details, pages visited, and click events).</li>
              <li><strong>Information from partners</strong> (often aggregated or pseudonymous reports about referrals, conversions, and performance).</li>
            </ul>
            <p>
              The exact information collected can vary based on the page you visit, the device you use, the region you are in, and whether you consent to certain cookies or marketing technologies.
            </p>
          </section>

          <section>
            <h2 className="text-xl font-bold text-foreground mb-4 sm:text-2xl">7. DATA YOU PROVIDE (INPUTS, EMAILS, REQUESTS)</h2>
            <p className="mb-4">When you use the Platform, you may provide information directly. This can include:</p>
            <ul className="list-disc pl-5 space-y-2 mb-4">
              <li><strong>Search inputs</strong> such as destination, check-in/check-out dates, number of rooms, and number of guests.</li>
              <li><strong>Communications</strong> when you contact us for support or inquiries, including email address and the content of your message.</li>
              <li><strong>Preference information</strong> you share, such as a preference to receive a reply, language preference, or feedback about the Platform.</li>
            </ul>
            <p className="mb-4">
              Search inputs are generally used to generate a redirect link and improve the search experience. We do not require you to create an account to use most parts of the Platform, and we do not ask for payment details on the Platform for typical usage.
            </p>
            <p>
              If you email us, the information you provide may include additional details you voluntarily share (for example, screenshots, booking references, or device diagnostics). Please avoid sending sensitive personal information unless it is necessary for your request.
            </p>
          </section>

          <section>
            <h2 className="text-xl font-bold text-foreground mb-4 sm:text-2xl">8. DATA COLLECTED AUTOMATICALLY (LOGS, DEVICE, USAGE)</h2>
            <p className="mb-4">When you browse the Platform, we (and our service providers) may collect certain information automatically:</p>
            <ul className="list-disc pl-5 space-y-2 mb-4">
              <li><strong>Identifiers</strong> such as IP address and device/browser identifiers.</li>
              <li><strong>Approximate location</strong> derived from IP address (typically city/region level, not precise GPS).</li>
              <li><strong>Device information</strong> such as operating system, browser type, language, screen size, and device type.</li>
              <li><strong>Usage data</strong> such as pages viewed, time spent on pages, clicks, scroll depth, referrer URL, and exit links clicked.</li>
              <li><strong>Diagnostics</strong> such as error logs, load times, and performance metrics used to maintain reliability and improve speed.</li>
              <li><strong>Security signals</strong> such as suspected bot activity, unusual traffic patterns, or attempted abuse.</li>
            </ul>
            <p>
              This data is commonly collected by websites to operate correctly, prevent fraud, measure performance, and improve user experience. Where required by law, we ask for consent before enabling certain categories of tracking (for example, some marketing cookies).
            </p>
          </section>

          <section>
            <h2 className="text-xl font-bold text-foreground mb-4 sm:text-2xl">9. COOKIES, PIXELS & SIMILAR TECHNOLOGIES</h2>
            <p className="mb-4">
              Cookies and similar technologies help us provide, protect, and improve the Platform. Some cookies are strictly necessary to make the Platform work (for example, basic security or load balancing). Other cookies are used for analytics, attribution, personalization, or marketing.
            </p>
            <p className="mb-4">
              Cookies can be "session" cookies (deleted when you close your browser) or "persistent" cookies (stored for a longer period). Pixels and tags are usually scripts that record certain events (for example, that a page was viewed or a button was clicked).
            </p>
            <p className="mb-4">
              We use the following cookie categories (the categories may vary slightly by region and your consent settings):<br/>
              <code>Strictly Necessary</code> · <code>Performance/Analytics</code> · <code>Functional</code> · <code>Advertising/Marketing</code>
            </p>
            <p className="mb-4">
              You can manage cookies through your browser settings. In some regions, you may also see a cookie banner or preference center that allows you to choose which categories you accept.
            </p>
            <p>
              Blocking cookies may affect certain features, and it can reduce the accuracy of measurement and attribution. However, you can still use many features of the Platform without accepting all cookies.
            </p>
          </section>

          <section>
            <h2 className="text-xl font-bold text-foreground mb-4 sm:text-2xl">10. ANALYTICS, MEASUREMENT & ATTRIBUTION</h2>
            <p className="mb-4">
              We use analytics and measurement tools to understand how users interact with the Platform. This helps us learn which pages are useful, where users encounter errors, and how we can improve speed and usability. Examples of events that analytics tools may record include page views, button clicks, outbound link clicks, and form interactions.
            </p>
            <p className="mb-4">
              We may also use attribution tools (including affiliate tracking) to understand whether traffic from our Platform resulted in a conversion on a partner site. Attribution data may include timestamps, referral parameters, device identifiers, and approximate location derived from IP.
            </p>
            <p>
              We strive to use analytics responsibly. Where required by law, we will request consent before enabling certain analytics or marketing technologies, and we will honor opt-out signals where applicable.
            </p>
          </section>

          <section>
            <h2 className="text-xl font-bold text-foreground mb-4 sm:text-2xl">11. ADVERTISING & MARKETING TECHNOLOGIES</h2>
            <p className="mb-4">
              We may use advertising and marketing technologies to promote the Platform, measure campaign performance, and understand which ads are effective. These tools can include pixels, conversion APIs, tags, and similar technologies provided by advertising platforms.
            </p>
            <p className="mb-4">
              Depending on your location, marketing technologies may be activated only after you provide consent. Marketing technologies may collect or receive information such as your IP address, device identifiers, browser information, and events (for example, that you visited a page or clicked an outbound link).
            </p>
            <p>
              If you prefer not to receive interest-based advertising, you can adjust your cookie preferences (where available), use browser controls to block cookies, or use industry opt-out tools provided by advertising organizations. Note that you may still see non-targeted advertising.
            </p>
          </section>

          <section>
            <h2 className="text-xl font-bold text-foreground mb-4 sm:text-2xl">12. HOW WE USE INFORMATION (PURPOSES)</h2>
            <p className="mb-4">We use information for the following purposes:</p>
            <ul className="list-disc pl-5 space-y-2 mb-4">
              <li><strong>Provide the Platform:</strong> operate the site, generate redirect links based on your inputs, and display features requested by you.</li>
              <li><strong>Improve usability and performance:</strong> understand usage patterns, test features, and improve speed, reliability, and design.</li>
              <li><strong>Security and fraud prevention:</strong> detect bots, prevent abuse, protect users, and maintain the integrity of the Platform.</li>
              <li><strong>Attribution and reporting:</strong> understand which pages and campaigns drive engagement and partner conversions.</li>
              <li><strong>Communications:</strong> respond to emails, provide support, send operational messages, and handle requests.</li>
              <li><strong>Legal compliance:</strong> comply with law, respond to lawful requests, and enforce policies.</li>
              <li><strong>Business operations:</strong> maintain records, analyze trends, and plan improvements.</li>
            </ul>
            <p>
              We may also create aggregated or de-identified data for analytics and research purposes. Aggregated or de-identified data is information that does not reasonably identify you. We may use this data to understand overall trends (for example, which destinations are popular).
            </p>
          </section>

          <section>
            <h2 className="text-xl font-bold text-foreground mb-4 sm:text-2xl">13. LEGAL BASES (GDPR/UK GDPR)</h2>
            <p className="mb-4">If you are located in the EEA or the United Kingdom, we process Personal Data under one or more legal bases:</p>
            <ul className="list-disc pl-5 space-y-2 mb-4">
              <li><strong>Consent:</strong> where required for certain cookies, marketing, or specific features.</li>
              <li><strong>Legitimate Interests:</strong> to operate, secure, and improve the Platform, and to prevent fraud (balanced against your rights).</li>
              <li><strong>Contract:</strong> to provide services you request (for example, generating a redirect link based on your inputs).</li>
              <li><strong>Legal Obligations:</strong> to comply with applicable laws and regulatory requirements.</li>
            </ul>
            <p>
              Where we rely on legitimate interests, we consider the impact on your privacy and implement safeguards such as minimizing data collection, restricting access, and using reasonable security measures.
            </p>
          </section>

          <section>
            <h2 className="text-xl font-bold text-foreground mb-4 sm:text-2xl">14. INTERNATIONAL TRANSFERS</h2>
            <p className="mb-4">
              Our infrastructure and service providers may be located in different countries. This means your information may be transferred to and processed in a country outside your state, province, or country of residence, including jurisdictions that may have different data protection rules.
            </p>
            <p className="mb-4">
              Where required by law (for example, for transfers from the EEA/UK), we use recognized safeguards such as contractual protections and other mechanisms intended to protect Personal Data. We also take steps to limit access to data and to implement security measures appropriate to the risks.
            </p>
            <p>
              Because partner booking sites operate independently, when you click out to a partner, they may process your data in their own locations under their own privacy policies.
            </p>
          </section>

          <section>
            <h2 className="text-xl font-bold text-foreground mb-4 sm:text-2xl">15. DATA RETENTION & DELETION</h2>
            <p className="mb-4">
              We retain Personal Data only as long as reasonably necessary for the purposes described in this Privacy Policy, unless a longer retention period is required or permitted by law. Retention depends on the type of information and the purpose for which it is used.
            </p>
            <p className="mb-4">Typical examples:</p>
            <ul className="list-disc pl-5 space-y-2 mb-4">
              <li><strong>Analytics and operational logs:</strong> often retained for up to 18 months (or shorter where feasible), then deleted or aggregated.</li>
              <li><strong>Support emails:</strong> retained as long as necessary to respond and maintain records, then deleted or archived according to operational needs.</li>
              <li><strong>Fraud and security records:</strong> may be retained longer when necessary to investigate abuse or comply with legal obligations.</li>
            </ul>
            <p>
              If you request deletion, we will take reasonable steps to delete information we control, subject to legal obligations and legitimate business needs. In some cases, we may need to keep certain records (for example, to comply with law, resolve disputes, or enforce agreements).
            </p>
          </section>

          <section>
            <h2 className="text-2xl font-bold text-foreground mb-4">16. SECURITY MEASURES</h2>
            <p className="mb-4">
              We use reasonable administrative, technical, and organizational safeguards designed to protect Personal Data. Security measures may include access controls, least-privilege permissions, monitoring, encryption where appropriate, and vendor risk management practices.
            </p>
            <p>
              No system is guaranteed to be 100% secure. You understand that transmitting information over the internet involves risk. If you believe your interaction with the Platform is no longer secure, please contact us promptly.
            </p>
          </section>

          <section>
            <h2 className="text-2xl font-bold text-foreground mb-4">17. YOUR RIGHTS (GDPR/UK GDPR)</h2>
            <p className="mb-4">Depending on your location, you may have rights regarding your Personal Data, including:</p>
            <ul className="list-disc pl-5 space-y-2 mb-4">
              <li><strong>Access:</strong> request access to Personal Data we hold about you.</li>
              <li><strong>Correction:</strong> request correction of inaccurate or incomplete data.</li>
              <li><strong>Deletion:</strong> request deletion in certain circumstances.</li>
              <li><strong>Restriction:</strong> request restriction of processing in certain circumstances.</li>
              <li><strong>Objection:</strong> object to certain processing based on legitimate interests.</li>
              <li><strong>Portability:</strong> request a portable copy where applicable.</li>
              <li><strong>Withdraw consent:</strong> where processing is based on consent, you can withdraw at any time.</li>
            </ul>
            <p>
              To exercise rights, email <strong>contact@hotelzoff.com</strong>. We may request verification to protect your privacy. You may also have the right to lodge a complaint with a data protection authority.
            </p>
          </section>

          <section>
            <h2 className="text-2xl font-bold text-foreground mb-4">18. CALIFORNIA PRIVACY (CCPA/CPRA)</h2>
            <p className="mb-4">
              If you are a California resident, you may have rights to know, access, correct, delete, and opt out of the "sale" or "sharing" of personal information under the California Consumer Privacy Act (CCPA) as amended by the California Privacy Rights Act (CPRA).
            </p>
            <p className="mb-4">
              We do not sell personal information in the traditional sense (for money). However, some analytics and advertising activities may be considered "sharing" for cross-context behavioral advertising under CPRA. Where applicable, you can opt out by using cookie controls (if available), blocking cookies in your browser, or using recognized opt-out signals where supported.
            </p>
            <p className="mb-4">
              Categories of personal information that may be collected include identifiers (IP address), internet activity (pages visited), approximate location, and inferences drawn from usage patterns. We use this information for operating the Platform, analytics, security, and marketing measurement.
            </p>
            <p>
              To make a request (access, deletion, correction), email <strong>contact@hotelzoff.com</strong>. We will verify requests to protect your information. Authorized agents may submit requests on your behalf with appropriate documentation.
            </p>
          </section>

          <section>
            <h2 className="text-2xl font-bold text-foreground mb-4">19. OTHER U.S. STATE PRIVACY NOTICES</h2>
            <p className="mb-4">
              Depending on where you live, you may have rights under other state privacy laws (for example, Colorado, Virginia, Connecticut, and Utah). These rights may include access, deletion, correction, portability, and the right to opt out of targeted advertising or certain profiling.
            </p>
            <p>
              We aim to honor applicable opt-out signals and provide reasonable methods to exercise rights. If you want to exercise a state privacy right, email <strong>contact@hotelzoff.com</strong> with your request and the state you reside in.
            </p>
          </section>

          <section>
            <h2 className="text-2xl font-bold text-foreground mb-4">20. CHILDREN'S PRIVACY (COPPA)</h2>
            <p>
              The Platform is not intended for children under 13. We do not knowingly collect personal information from children under 13. If you believe a child has provided personal information to us, please contact us and we will take reasonable steps to delete the information.
            </p>
          </section>

          <section>
            <h2 className="text-2xl font-bold text-foreground mb-4">21. SENSITIVE PERSONAL INFORMATION</h2>
            <p>
              We do not intentionally collect sensitive personal information such as precise geolocation, health data, biometric identifiers, or information about children. Please do not send sensitive personal information through email or forms on the Platform. If you do choose to share sensitive information, you do so voluntarily and at your own discretion.
            </p>
          </section>

          <section>
            <h2 className="text-2xl font-bold text-foreground mb-4">22. AUTOMATED DECISIONS & PROFILING</h2>
            <p>
              We may use analytics to understand aggregated user behavior and improve performance. We do not make decisions that produce legal or similarly significant effects solely by automated means based on Personal Data. If this changes, we will update this Privacy Policy and provide required notices.
            </p>
          </section>

          <section>
            <h2 className="text-2xl font-bold text-foreground mb-4">23. THIRD-PARTY WEBSITES & PARTNER POLICIES</h2>
            <p className="mb-4">
              The Platform contains links to third-party websites, including booking and travel providers. Once you leave our Platform, the third party's privacy policy and terms apply. We are not responsible for third-party practices, content, or security.
            </p>
            <p>
              We recommend reviewing partner policies before providing information, especially information such as payment details, ID numbers, or loyalty accounts.
            </p>
          </section>

          <section>
            <h2 className="text-2xl font-bold text-foreground mb-4">24. MANAGING PREFERENCES & DO NOT TRACK</h2>
            <p className="mb-4">
              You can manage cookies through your browser settings. Some browsers support "Do Not Track" signals. Because there is not yet a common standard for how to interpret these signals, our response may vary. Where legally required, we aim to honor recognized opt-out signals and consent preferences.
            </p>
            <p>
              You can also reduce advertising personalization through settings provided by advertising platforms and through industry opt-out mechanisms. Note that opting out does not mean you will stop seeing ads; it may mean the ads are less personalized.
            </p>
          </section>

          <section>
            <h2 className="text-2xl font-bold text-foreground mb-4">25. CHANGES TO THIS PRIVACY POLICY</h2>
            <p>
              We may update this Privacy Policy from time to time to reflect changes in our practices, technology, or legal requirements. We encourage you to review this page periodically. The "Last updated" date indicates the most recent revision.
            </p>
          </section>

          <section>
            <h2 className="text-2xl font-bold text-foreground mb-4">26. CONTACT & REQUESTS</h2>
            <p className="mb-4">If you have questions, requests, or concerns about this Privacy Policy or how we handle information, contact:</p>
            <div className="rounded-lg bg-secondary/50 p-4 border border-border">
              <strong>Company:</strong> U1 Technologies Private Limited<br/>
              <strong>Address:</strong> 3rd Floor, A-28, Block A, Sector 4, Sector-4, Noida, Uttar Pradesh 201305<br/>
              <strong>Email:</strong> contact@hotelzoff.com
            </div>
            <p className="mt-4">
              Please include enough detail for us to understand and respond (for example, the page you visited, the approximate time, and the type of request). We will respond within a reasonable time based on the applicable law and the nature of the request.
            </p>
          </section>
        </div>
      </main>

      <Footer />
    </div>
  );
}
