import { Check, Shield, Star } from "lucide-react";

import { Card } from "@/components/ui/card";

export default function CertificatePreview() {
  return (
    <section id="verify" className="bg-white py-24">
      <div className="mx-auto flex max-w-6xl flex-col items-center gap-16 px-4 md:px-6 lg:flex-row">
        <div className="flex-1 space-y-8">
          <h2 className="text-3xl font-bold tracking-tight text-slate-900 sm:text-4xl">
            The Gold Standard for Tenant Trust
          </h2>
          <p className="text-lg text-slate-600">
            Your RentScore Certificate is more than just a document—it&apos;s
            your rental passport. Accepted by leading property management firms
            in Nairobi.
          </p>

          <ul className="space-y-4">
            {[
              "Proves consistent rent payment history",
              "Verifies income stability via cash flow",
              "Showcases financial responsibility",
              "Secure QR code for landlord verification",
            ].map((item) => (
              <li key={item} className="flex items-center gap-3">
                <div className="flex h-6 w-6 items-center justify-center rounded-full bg-emerald-100 text-emerald-600">
                  <Check size={14} strokeWidth={3} />
                </div>
                <span className="font-medium text-slate-700">{item}</span>
              </li>
            ))}
          </ul>
        </div>

        <div className="flex w-full flex-1 justify-center [perspective:1000px]">
          <div className="relative w-full max-w-md [transform-style:preserve-3d] transition-transform duration-700 ease-out hover:rotate-x-0 hover:rotate-y-0 lg:rotate-x-6 lg:rotate-y-6">
            <div className="absolute inset-0 translate-x-4 translate-y-4 rounded-lg bg-emerald-500/20 blur-2xl" />

            <Card className="relative overflow-hidden border-4 border-slate-100 bg-white shadow-sm">
              <div className="flex items-center justify-between bg-slate-900 p-6 text-white">
                <div className="flex items-center gap-2">
                  <Shield className="text-emerald-400" size={24} />
                  <span className="font-bold tracking-wide">
                    RENTSCORE CERTIFIED
                  </span>
                </div>
                <div className="text-xs font-mono text-slate-400">
                  ID: RS-8829-XJ
                </div>
              </div>

              <div className="space-y-6 p-8">
                <div className="flex items-start justify-between border-b border-slate-100 pb-6">
                  <div>
                    <p className="mb-1 text-xs uppercase tracking-wider text-slate-500">
                      Tenant Name
                    </p>
                    <h3 className="text-xl font-bold text-slate-900">
                      John Kamau
                    </h3>
                  </div>
                  <div className="text-right">
                    <p className="mb-1 text-xs uppercase tracking-wider text-slate-500">
                      Score
                    </p>
                    <div className="flex items-center gap-1 text-emerald-600">
                      <Star size={20} fill="currentColor" />
                      <span className="text-2xl font-black">94/100</span>
                    </div>
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div className="rounded-lg bg-slate-50 p-3">
                    <p className="mb-1 text-[10px] uppercase text-slate-500">
                      Payment Consistency
                    </p>
                    <p className="font-semibold text-slate-900">
                      Excellent (12/12)
                    </p>
                  </div>
                  <div className="rounded-lg bg-slate-50 p-3">
                    <p className="mb-1 text-[10px] uppercase text-slate-500">
                      Avg. Transaction Vol
                    </p>
                    <p className="font-semibold text-slate-900">
                      Verified High
                    </p>
                  </div>
                </div>

                <div className="flex items-center gap-4 pt-2 text-xs text-slate-500">
                  <div className="flex h-16 w-16 items-center justify-center rounded-md bg-slate-100">
                    <div className="h-12 w-12 bg-slate-900 opacity-10" />
                  </div>
                  <div>
                    Scan this QR code to verify the authenticity of this
                    certificate directly on RentScore.
                  </div>
                </div>
              </div>

              <div className="pointer-events-none absolute bottom-4 right-4 opacity-10">
                <Shield size={120} />
              </div>
            </Card>
          </div>
        </div>
      </div>
    </section>
  );
}
