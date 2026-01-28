import { ShieldCheck } from "lucide-react";

import { Button } from "@/components/ui/button";

export default function TrustStrip() {
  return (
    <section className="mx-auto w-full max-w-6xl px-6 pb-16">
      <div className="flex flex-col items-start justify-between gap-6 rounded-3xl border border-emerald-100 bg-white px-8 py-10 shadow-sm lg:flex-row lg:items-center">
        <div className="flex items-start gap-4">
          <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-emerald-100 text-emerald-700">
            <ShieldCheck className="h-6 w-6" />
          </div>
          <div>
            <h3 className="text-2xl font-semibold text-slate-900">
              Ready to unlock a rental passport?
            </h3>
            <p className="mt-2 text-sm text-zinc-600">
              Generate a Trust Score in minutes and share a certificate that
              landlords can verify.
            </p>
          </div>
        </div>
        <Button className="px-6 py-3">Start Verification</Button>
      </div>
    </section>
  );
}
