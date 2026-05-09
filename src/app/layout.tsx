import type { Metadata } from "next";
import { Inter } from "next/font/google";
import "./globals.css";
import SidebarClientWrapper from "@/components/SidebarClientWrapper";
import IncomingCallBanner from "@/components/IncomingCallBanner";

const inter = Inter({ subsets: ["latin"] });

export const metadata: Metadata = {
  title: "Office Angel | Command Center",
  description: "AI automation suite for trade contractors.",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body className={`${inter.className} bg-gray-50 text-gray-900`}>
        <div className="flex min-h-screen">
          <SidebarClientWrapper />
          <main className="flex-1 min-w-0">
            {children}
          </main>
          <IncomingCallBanner />
        </div>
      </body>
    </html>
  );
}
