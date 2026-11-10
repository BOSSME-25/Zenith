import type { Metadata } from "next";
import localFont from "next/font/local";
import { SITE_URL } from "@/lib/site";
import "./globals.css";

// Montserrat is served from this site, not fetched from Google at build time.
// A Google Fonts hiccup once failed a production build and left the old site up.
const montserrat = localFont({
  src: [
    { path: "./fonts/montserrat-300.woff2", weight: "300", style: "normal" },
    { path: "./fonts/montserrat-400.woff2", weight: "400", style: "normal" },
    { path: "./fonts/montserrat-500.woff2", weight: "500", style: "normal" },
    { path: "./fonts/montserrat-600.woff2", weight: "600", style: "normal" },
    { path: "./fonts/montserrat-700.woff2", weight: "700", style: "normal" },
  ],
  variable: "--font-montserrat",
  display: "swap",
});

export const metadata: Metadata = {
  metadataBase: new URL(SITE_URL),
  title: {
    default: "Zenith College and Career Prep — Elevating Every Future",
    template: "%s · Zenith College and Career Prep",
  },
  description:
    "Zenith College and Career Prep is an early college STEAM high school designed with the Maryvale community of Phoenix. Approved by the Arizona State Board for Charter Schools. Enrolling ninth graders for August 2027.",
  keywords: [
    "Zenith Prep",
    "Maryvale charter school",
    "Phoenix early college high school",
    "STEAM high school Arizona",
  ],
  alternates: {
    canonical: "./",
  },
  openGraph: {
    title: "Zenith College and Career Prep",
    description:
      "An early college STEAM high school designed with the Maryvale community. Elevating Every Future.",
    type: "website",
    siteName: "Zenith College and Career Prep",
    locale: "en_US",
    url: "./",
  },
  twitter: {
    card: "summary_large_image",
    title: "Zenith College and Career Prep",
    description:
      "An early college STEAM high school designed with the Maryvale community. Elevating Every Future.",
  },
  icons: {
    icon: "/brand/zenith-mark.png",
    apple: "/brand/zenith-mark.png",
  },
  robots: { index: true, follow: true },
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en" className={montserrat.variable}>
      <body className="min-h-screen font-sans">{children}</body>
    </html>
  );
}
