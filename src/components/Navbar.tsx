"use client";

import { useState } from "react";
import Link from "next/link";
import { Bot, Menu, X } from "lucide-react";

interface NavbarProps {
  activePage?: "features" | "pricing" | "about" | "login";
}

export default function Navbar({ activePage }: NavbarProps) {
  const [open, setOpen] = useState(false);

  const linkClass = (page: string) =>
    `text-sm font-medium transition-colors ${
      activePage === page
        ? "text-gray-900 font-bold"
        : "text-gray-600 hover:text-gray-900"
    }`;

  return (
    <nav className="w-full bg-white border-b border-gray-200 z-50 relative">
      <div className="px-4 md:px-8 py-4 flex justify-between items-center">
        {/* Logo */}
        <Link href="/" className="flex items-center gap-2">
          <img src="/logo.jpg" alt="Hard Hat Solutions Logo" className="h-8 w-auto object-contain rounded" />
          <span className="text-xl font-bold tracking-tight">Hard Hat Solutions</span>
        </Link>

        {/* Desktop links */}
        <div className="hidden md:flex items-center gap-6">
          <Link href="/#features" className={linkClass("features")}>Features</Link>
          <Link href="/pricing" className={linkClass("pricing")}>Pricing</Link>
          <Link href="/about" className={linkClass("about")}>About</Link>
          <Link href="/login" className={linkClass("login")}>Login</Link>
          <Link
            href="/#demo"
            className="text-sm font-medium bg-gray-900 text-white px-4 py-2 rounded-lg hover:bg-black transition-colors"
          >
            Book Demo
          </Link>
        </div>

        {/* Mobile hamburger */}
        <button
          className="md:hidden p-2 rounded-lg text-gray-600 hover:bg-gray-100 transition-colors"
          onClick={() => setOpen(!open)}
          aria-label="Toggle menu"
        >
          {open ? <X size={24} /> : <Menu size={24} />}
        </button>
      </div>

      {/* Mobile menu */}
      {open && (
        <div className="md:hidden border-t border-gray-100 bg-white px-4 py-4 flex flex-col gap-1">
          <Link
            href="/#features"
            onClick={() => setOpen(false)}
            className="px-3 py-2.5 rounded-lg text-sm font-medium text-gray-700 hover:bg-gray-50 transition-colors"
          >
            Features
          </Link>
          <Link
            href="/pricing"
            onClick={() => setOpen(false)}
            className="px-3 py-2.5 rounded-lg text-sm font-medium text-gray-700 hover:bg-gray-50 transition-colors"
          >
            Pricing
          </Link>
          <Link
            href="/about"
            onClick={() => setOpen(false)}
            className="px-3 py-2.5 rounded-lg text-sm font-medium text-gray-700 hover:bg-gray-50 transition-colors"
          >
            About
          </Link>
          <Link
            href="/login"
            onClick={() => setOpen(false)}
            className="px-3 py-2.5 rounded-lg text-sm font-medium text-gray-700 hover:bg-gray-50 transition-colors"
          >
            Login
          </Link>
          <div className="pt-2 mt-1 border-t border-gray-100">
            <Link
              href="/#demo"
              onClick={() => setOpen(false)}
              className="block w-full text-center text-sm font-bold bg-gray-900 text-white px-4 py-3 rounded-lg hover:bg-black transition-colors"
            >
              Book a Demo
            </Link>
          </div>
        </div>
      )}
    </nav>
  );
}
