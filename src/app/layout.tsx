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
          
          <main className="flex-1 min-w-0 flex flex-col min-h-screen">
            <div className="flex-1">
              {children}
            </div>
            <footer className="w-full text-center py-4 text-xs text-gray-500 mt-auto border-t border-gray-200">
              <a href="/privacy-policy" className="hover:underline mx-2">Privacy Policy</a> | 
              <a href="/terms" className="hover:underline mx-2">Terms & Conditions</a>
            </footer>
          </main>

          <IncomingCallBanner />
        </div>
      </body>
    </html>
  );
}
