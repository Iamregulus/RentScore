import Link from "next/link";
import { Instagram, Linkedin, ShieldCheck, Twitter } from "lucide-react";

export default function Footer() {
  return (
    <footer className="border-t border-slate-800 bg-slate-900 py-16 text-slate-300">
      <div className="mx-auto max-w-6xl px-4 md:px-6">
        <div className="mb-12 grid gap-12 md:grid-cols-4">
          <div className="space-y-4">
            <div className="mb-4 flex items-center gap-2 text-white">
              <ShieldCheck size={24} className="text-emerald-400" />
              <span className="text-xl font-bold tracking-tight">RentScore</span>
            </div>
            <p className="text-sm leading-relaxed text-slate-400">
              Empowering tenants and protecting landlords with data-driven
              trust. The standard for rental verification in East Africa.
            </p>
          </div>

          <div>
            <h4 className="mb-6 font-semibold text-white">Product</h4>
            <ul className="space-y-3 text-sm">
              <li>
                <Link href="#" className="transition-colors hover:text-emerald-400">
                  For Tenants
                </Link>
              </li>
              <li>
                <Link href="#" className="transition-colors hover:text-emerald-400">
                  For Landlords
                </Link>
              </li>
              <li>
                <Link href="#" className="transition-colors hover:text-emerald-400">
                  Pricing
                </Link>
              </li>
              <li>
                <Link href="#" className="transition-colors hover:text-emerald-400">
                  Security
                </Link>
              </li>
            </ul>
          </div>

          <div>
            <h4 className="mb-6 font-semibold text-white">Company</h4>
            <ul className="space-y-3 text-sm">
              <li>
                <Link href="#" className="transition-colors hover:text-emerald-400">
                  About Us
                </Link>
              </li>
              <li>
                <Link href="#" className="transition-colors hover:text-emerald-400">
                  Careers
                </Link>
              </li>
              <li>
                <Link href="#" className="transition-colors hover:text-emerald-400">
                  Blog
                </Link>
              </li>
              <li>
                <Link href="#" className="transition-colors hover:text-emerald-400">
                  Contact
                </Link>
              </li>
            </ul>
          </div>

          <div>
            <h4 className="mb-6 font-semibold text-white">Legal</h4>
            <ul className="space-y-3 text-sm">
              <li>
                <Link href="#" className="transition-colors hover:text-emerald-400">
                  Privacy Policy
                </Link>
              </li>
              <li>
                <Link href="#" className="transition-colors hover:text-emerald-400">
                  Terms of Service
                </Link>
              </li>
              <li>
                <Link href="#" className="transition-colors hover:text-emerald-400">
                  Data Processing
                </Link>
              </li>
            </ul>
          </div>
        </div>

        <div className="flex flex-col items-center justify-between gap-6 border-t border-slate-700/50 pt-8 md:flex-row">
          <p className="text-sm text-slate-500">
            © {new Date().getFullYear()} RentScore Technologies Ltd. All rights
            reserved.
          </p>
          <div className="flex items-center gap-6">
            <div className="flex items-center gap-4">
              <Link href="#" className="text-slate-400 hover:text-white">
                <Twitter size={18} />
              </Link>
              <Link href="#" className="text-slate-400 hover:text-white">
                <Linkedin size={18} />
              </Link>
              <Link href="#" className="text-slate-400 hover:text-white">
                <Instagram size={18} />
              </Link>
            </div>
            <div className="flex items-center gap-1.5 rounded-full border border-slate-700 bg-slate-800 px-3 py-1.5 text-xs font-medium text-slate-300">
              <span>Made in Kenya</span>
              <span className="text-base">🇰🇪</span>
            </div>
          </div>
        </div>
      </div>
    </footer>
  );
}
