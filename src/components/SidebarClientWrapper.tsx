"use client";

import { usePathname } from "next/navigation";
import Sidebar from "./Sidebar";
import { useState, useEffect } from "react";
import { Menu, X } from "lucide-react";

export default function SidebarClientWrapper() {
  const pathname = usePathname();
  const [isOpen, setIsOpen] = useState(false);
  const publicRoutes = ["/", "/login", "/pricing", "/about", "/signup-secret", "/privacy-policy", "/terms"];
  const isPublicPage = publicRoutes.includes(pathname);

  // Close sidebar automatically on navigation in mobile view
  useEffect(() => {
    setIsOpen(false);
  }, [pathname]);

  if (isPublicPage) return null;

  return (
    <>
      {/* Mobile Header for Hamburger */}
      <div className="md:hidden fixed top-0 left-0 right-0 h-14 bg-gray-900 z-[100] flex items-center justify-between px-4 shadow-md">
        <span className="text-white font-bold tracking-tight flex items-center gap-2">
          Office Angel
        </span>
        <button 
          onClick={() => setIsOpen(!isOpen)} 
          className="text-gray-300 hover:text-white p-2"
        >
          {isOpen ? <X size={24} /> : <Menu size={24} />}
        </button>
      </div>

      {/* Sidebar - Overlay on mobile, static on desktop */}
      <div 
        className={`fixed inset-y-0 left-0 z-[90] transform transition-transform duration-300 ease-in-out md:relative md:translate-x-0 ${isOpen ? "translate-x-0" : "-translate-x-full"}`}
      >
        <Sidebar />
      </div>

      {/* Dark overlay when menu is open on mobile */}
      {isOpen && (
        <div 
          className="fixed inset-0 bg-black/50 z-[80] md:hidden"
          onClick={() => setIsOpen(false)}
        />
      )}
    </>
  );
}
