import type { Metadata, Viewport } from "next";
import { Inter } from "next/font/google";
import "./globals.css";
import SidebarClientWrapper from "@/components/SidebarClientWrapper";
import IncomingCallBanner from "@/components/IncomingCallBanner";
import { HaloWidget } from "@/components/HaloWidget";

const inter = Inter({ subsets: ["latin"] });

export const viewport: Viewport = {
  width: "device-width",
  initialScale: 1,
  maximumScale: 1,
  userScalable: false,
};

export const metadata: Metadata = {
  title: "Hard Hat Solutions | Command Center",
  description: "AI automation suite for trade contractors.",
  manifest: "/manifest.json",
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
      </head>
      <body className={`${inter.className} bg-gray-50 text-gray-900`}>
        <div className="flex min-h-screen">
          <SidebarClientWrapper />
          
          
          <main className="flex-1 min-w-0 flex flex-col min-h-screen w-full">
            <div className="flex-1 mt-14 md:mt-0">
              {children}
            </div>
          </main>


          <IncomingCallBanner />
          <HaloWidget />
        </div>
      </body>
    </html>
  );
}
