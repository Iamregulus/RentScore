"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { Menu, ShieldCheck, X } from "lucide-react";

import { Button } from "@/components/ui/button";

export default function Navbar() {
  const [isScrolled, setIsScrolled] = useState(false);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

  useEffect(() => {
    const handleScroll = () => {
      setIsScrolled(window.scrollY > 20);
    };
    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  return (
    <nav className="fixed left-0 right-0 top-0 z-50 bg-transparent py-5">
      <div className="mx-auto flex max-w-6xl items-center justify-between px-4 md:px-6">
        <div className="flex items-center gap-2">
          <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-emerald-500 text-white">
            <ShieldCheck size={20} />
          </div>
          <span className="text-xl font-bold tracking-tight text-white">
            RentScore
          </span>
        </div>

        <div className="hidden items-center gap-8 md:flex">
          <Link
            href="#how-it-works"
            className="text-sm font-medium text-white/80 transition-colors hover:text-white"
          >
            How it Works
          </Link>
          <Link
            href="#landlords"
            className="text-sm font-medium text-white/80 transition-colors hover:text-white"
          >
            For Landlords
          </Link>
          <Link
            href="#verify"
            className="text-sm font-medium text-white/80 transition-colors hover:text-white"
          >
            Verify Certificate
          </Link>
          <Button className="px-4 py-2 text-sm">Get Started</Button>
        </div>

        <button
          className="text-white/80 md:hidden"
          onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
          aria-label="Toggle menu"
        >
          {isMobileMenuOpen ? <X /> : <Menu />}
        </button>
      </div>

      {isMobileMenuOpen ? (
        <div className="absolute left-0 right-0 top-full border-b border-slate-800 bg-slate-900 p-4 shadow-lg md:hidden">
          <div className="flex flex-col gap-4">
            <Link
              href="#how-it-works"
              className="text-sm font-medium text-white/80"
            >
              How it Works
            </Link>
            <Link
              href="#landlords"
              className="text-sm font-medium text-white/80"
            >
              For Landlords
            </Link>
            <Link
              href="#verify"
              className="text-sm font-medium text-white/80"
            >
              Verify Certificate
            </Link>
            <Button className="w-full">Get Started</Button>
          </div>
        </div>
      ) : null}
    </nav>
  );
}
