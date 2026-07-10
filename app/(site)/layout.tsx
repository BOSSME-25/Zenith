import { Header } from "@/components/Header";
import { Footer } from "@/components/Footer";
import { WelcomeVideoModal } from "@/components/WelcomeVideoModal";
import { JsonLd } from "@/components/JsonLd";
import { SITE_NAME, SITE_URL } from "@/lib/site";

const ORGANIZATION_SCHEMA = {
  "@context": "https://schema.org",
  "@type": "EducationalOrganization",
  name: SITE_NAME,
  alternateName: "Zenith Prep",
  url: SITE_URL,
  logo: `${SITE_URL}/brand/zenith-mark.png`,
  slogan: "Elevating Every Future",
  description:
    "Zenith College and Career Prep is an early college STEAM high school being designed with the Maryvale community of Phoenix, Arizona. Pending charter authorization. Target opening: Fall 2027.",
  address: {
    "@type": "PostalAddress",
    addressLocality: "Phoenix",
    addressRegion: "AZ",
    addressCountry: "US",
  },
  areaServed: "Maryvale, Phoenix, Arizona",
};

export default function SiteLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="min-h-screen flex flex-col">
      <JsonLd data={ORGANIZATION_SCHEMA} />
      <WelcomeVideoModal />
      <a
        href="#main"
        className="sr-only focus:not-sr-only focus:fixed focus:top-3 focus:left-3 focus:z-50 focus:bg-midnight focus:text-white focus:px-3 focus:py-2 focus:rounded"
      >
        Skip to content
      </a>
      <Header />
      <main id="main" className="flex-1">
        {children}
      </main>
      <Footer />
    </div>
  );
}
