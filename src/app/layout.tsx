import type { Metadata, Viewport } from "next";
import { Inter } from "next/font/google";
import "./globals.css";
import SidebarClientWrapper from "@/components/SidebarClientWrapper";
import IncomingCallBanner from "@/components/IncomingCallBanner";
import { HaloWidget } from "@/components/HaloWidget";
import RoleGuard from "@/components/RoleGuard";
import { GeofenceToast } from "@/components/GeofenceToast";

const inter = Inter({ subsets: ["latin"] });

export const viewport: Viewport = {
  width: "device-width",
  initialScale: 1,
  maximumScale: 1,
  userScalable: false,
};

export const metadata: Metadata = {
  title: "Hard Hat Solutions | AI Software for Electrical & Trade Contractors",
  description: "The ultimate AI automation suite for trade contractors. Auto-schedule jobs, map door-to-door sales, track permits, and automate wholesale material orders.",
  keywords: ["electrical contractor software", "trade contractor CRM", "AI answering service for contractors", "roofing CRM", "door to door canvassing app", "contractor dispatch software", "Hard Hat Solutions"],
  authors: [{ name: "Hardhat Holdings LLC" }],
  openGraph: {
    title: "Hard Hat Solutions | AI for Trades",
    description: "Automate your trade business with AI dispatching, phone answering, and material tracking.",
    url: "https://hardhat-solutions.com",
    siteName: "Hard Hat Solutions",
    locale: "en_US",
    type: "website",
  },
  manifest: "/manifest.json",
  verification: {
    google: "eePqZT8sh9q40SpBzMN3Qfbb7u7XI7xTlyWRo38YaTY",
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <head>
        <meta name="theme-color" content="#000000" />
        <link rel="stylesheet" href="https://unpkg.com/leaflet@1.9.4/dist/leaflet.css" integrity="sha256-p4NxAoJBhIIN+hmNHrzRCf9tD/miZyoHS5obTRR9BMY=" crossOrigin="" />
      </head>
      <body className={`${inter.className} bg-gray-50 text-gray-900`}>
        <div className="flex h-[100dvh] overflow-hidden">
          <SidebarClientWrapper />
          
          
          <main className="flex-1 min-w-0 flex flex-col h-[100dvh] w-full overflow-y-auto">
            <div className="flex-1 mt-14 md:mt-0">
              <RoleGuard>{children}</RoleGuard>
            </div>
          </main>


          <IncomingCallBanner />
          <HaloWidget />
          <GeofenceToast />
        </div>
      </body>
    </html>
  );
}
