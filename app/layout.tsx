import type { Metadata } from "next";
import { Montserrat } from "next/font/google";
import "./globals.css";

const montserrat = Montserrat({
  subsets: ["latin"],
  weight: ["300", "400", "500", "600", "700"],
  variable: "--font-montserrat",
  display: "swap",
});

export const metadata: Metadata = {
  metadataBase: new URL(process.env.NEXT_PUBLIC_SITE_URL || "https://zenithprep.org"),
  title: {
    default: "Zenith College and Career Prep — Elevating Every Future",
    template: "%s · Zenith College and Career Prep",
  },
  description:
    "Zenith College and Career Prep is an early college STEAM high school being designed with the Maryvale community of Phoenix. Pending charter authorization. Target opening: Fall 2027.",
  keywords: [
    "Zenith Prep",
    "Maryvale charter school",
    "Phoenix early college high school",
    "STEAM high school Arizona",
  ],
  openGraph: {
    title: "Zenith College and Career Prep",
    description:
      "An early college STEAM high school designed with the Maryvale community. Elevating Every Future.",
    type: "website",
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
