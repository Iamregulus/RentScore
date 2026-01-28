import { Bot, FileCheck2, Upload } from "lucide-react";

import { Card, CardContent } from "@/components/ui/card";

const features = [
  {
    icon: Upload,
    title: "1. Upload Statement",
    description:
      "Download your M-Pesa statement PDF from the app or USSD (*234#) and drop it securely into RentScore.",
  },
  {
    icon: Bot,
    title: "2. AI Analysis",
    description:
      "Our privacy-first AI scans for rent payments, utility bills, and consistent cash flow patterns without storing personal data.",
  },
  {
    icon: FileCheck2,
    title: "3. Get Certificate",
    description:
      "Receive a shareable, verified RentScore certificate that proves your reliability to any landlord in Kenya.",
  },
];

export default function Features() {
  return (
    <section
      id="how-it-works"
      className="-mt-16 border-t border-slate-200 bg-slate-50 pt-24 pb-24"
    >
      <div className="mx-auto max-w-6xl px-4 md:px-6">
        <div className="mx-auto mb-16 max-w-3xl text-center">
          <h2 className="text-3xl font-bold tracking-tight text-slate-900 sm:text-4xl">
            From PDF to Verified Tenant in Seconds
          </h2>
          <p className="mt-4 text-lg text-slate-600">
            We&apos;ve simplified the vetting process. No more intrusive bank
            statements or awkward interviews.
          </p>
        </div>

        <div className="grid gap-8 md:grid-cols-3">
          {features.map((feature) => {
            const Icon = feature.icon;
            return (
            <Card
              key={feature.title}
              className="group relative overflow-hidden border-none bg-white shadow-sm transition-shadow duration-300 hover:shadow-md"
            >
                <div className="absolute left-0 top-0 h-1 w-full bg-emerald-500 opacity-0 transition-opacity group-hover:opacity-100" />
                <CardContent className="flex flex-col items-center px-6 pb-8 pt-8 text-center">
                  <div className="mb-6 flex h-14 w-14 items-center justify-center rounded-2xl bg-emerald-50 text-emerald-600 transition-transform duration-300 group-hover:scale-110">
                    <Icon size={28} strokeWidth={1.5} />
                  </div>
                  <h3 className="mb-3 text-xl font-semibold text-slate-900">
                    {feature.title}
                  </h3>
                  <p className="leading-relaxed text-slate-600">
                    {feature.description}
                  </p>
                </CardContent>
              </Card>
            );
          })}
        </div>
      </div>
    </section>
  );
}
