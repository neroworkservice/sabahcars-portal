"use client";

import Link from "next/link";
import { useState } from "react";

const navLinks = [
  { href: "/", label: "Home" },
  { href: "#services", label: "Services" },
  { href: "#features", label: "Features" },
  { href: "#contact", label: "Contact" },
];

export default function Navbar() {
  const [open, setOpen] = useState(false);

  return (
    <nav className="fixed top-0 left-0 right-0 z-50 bg-white/95 backdrop-blur-sm border-b border-slate-100 shadow-sm">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          {/* Logo */}
          <Link href="/" className="flex items-center gap-2.5 group">
            <div className="w-9 h-9 bg-blue-600 rounded-xl flex items-center justify-center shadow-sm group-hover:bg-blue-700 transition-colors">
              <svg className="w-5 h-5 text-white" viewBox="0 0 24 24" fill="currentColor">
                <path d="M18.92 6.01C18.72 5.42 18.16 5 17.5 5h-11c-.66 0-1.21.42-1.42 1.01L3 12v8c0 .55.45 1 1 1h1c.55 0 1-.45 1-1v-1h12v1c0 .55.45 1 1 1h1c.55 0 1-.45 1-1v-8l-2.08-5.99zM6.5 16c-.83 0-1.5-.67-1.5-1.5S5.67 13 6.5 13s1.5.67 1.5 1.5S7.33 16 6.5 16zm11 0c-.83 0-1.5-.67-1.5-1.5s.67-1.5 1.5-1.5 1.5.67 1.5 1.5-.67 1.5-1.5 1.5zM5 11l1.5-4.5h11L19 11H5z" />
              </svg>
            </div>
            <span className="text-xl font-bold">
              <span className="text-blue-950">Sabah</span>
              <span className="text-blue-600">Car</span>
            </span>
          </Link>

          {/* Desktop Nav */}
          <div className="hidden md:flex items-center gap-1">
            {navLinks.map((link) => (
              <Link
                key={link.href}
                href={link.href}
                className="px-4 py-2 text-sm text-slate-600 hover:text-blue-600 hover:bg-blue-50 rounded-lg font-medium transition-all"
              >
                {link.label}
              </Link>
            ))}
          </div>

          {/* Login Button */}
          <div className="hidden md:flex">
            <Link
              href="/login"
              className="inline-flex items-center gap-2 px-5 py-2.5 bg-blue-600 text-white text-sm rounded-xl font-semibold hover:bg-blue-700 active:bg-blue-800 transition-all shadow-sm hover:shadow-md"
            >
              <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
              </svg>
              Portal Login
            </Link>
          </div>

          {/* Mobile hamburger */}
          <button
            onClick={() => setOpen(!open)}
            className="md:hidden p-2 rounded-lg text-slate-600 hover:bg-blue-50 transition-colors"
            aria-label="Toggle navigation"
          >
            <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
              {open ? (
                <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
              ) : (
                <path strokeLinecap="round" strokeLinejoin="round" d="M4 6h16M4 12h16M4 18h16" />
              )}
            </svg>
          </button>
        </div>

        {/* Mobile dropdown */}
        {open && (
          <div className="md:hidden border-t border-slate-100 py-3">
            <div className="flex flex-col gap-1">
              {navLinks.map((link) => (
                <Link
                  key={link.href}
                  href={link.href}
                  onClick={() => setOpen(false)}
                  className="px-3 py-2.5 text-sm text-slate-600 hover:text-blue-600 hover:bg-blue-50 rounded-lg font-medium transition-colors"
                >
                  {link.label}
                </Link>
              ))}
              <div className="pt-2 mt-1 border-t border-slate-100">
                <Link
                  href="/login"
                  onClick={() => setOpen(false)}
                  className="flex items-center justify-center gap-2 w-full px-5 py-2.5 bg-blue-600 text-white text-sm rounded-xl font-semibold hover:bg-blue-700 transition-colors"
                >
                  Portal Login
                </Link>
              </div>
            </div>
          </div>
        )}
      </div>
    </nav>
  );
}
