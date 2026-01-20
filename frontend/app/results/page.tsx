"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { Download, ShieldCheck } from "lucide-react";

type VerifiedPayment = {
  month: string;
  amount: number;
  narrative: string;
  confidence: number;
};

type AnalysisResult = {
  trust_score: number;
  verified_payments: VerifiedPayment[];
  transactions?: Record<string, string>[];
};

export default function ResultsPage() {
  const [analysis, setAnalysis] = useState<AnalysisResult | null>(null);
  const [isDownloading, setIsDownloading] = useState(false);
  const [downloadError, setDownloadError] = useState("");
  const apiBaseUrl = process.env.NEXT_PUBLIC_API_URL ?? "http://localhost:8000";

  useEffect(() => {
    const stored = sessionStorage.getItem("rentscore:analysis");
    if (stored) {
      try {
        setAnalysis(JSON.parse(stored));
      } catch {
        setAnalysis(null);
      }
    }
  }, []);

  if (!analysis) {
    return (
      <div className="min-h-screen bg-zinc-950 text-white">
        <main className="mx-auto flex w-full max-w-3xl flex-col gap-6 px-6 py-16">
          <h1 className="text-3xl font-semibold">No analysis found</h1>
          <p className="text-sm text-zinc-400">
            Upload a statement to generate a Trust Score.
          </p>
          <Link
            href="/"
            className="inline-flex w-fit items-center gap-2 rounded-full border border-zinc-700 px-5 py-2 text-sm font-semibold text-white transition hover:border-emerald-300 hover:text-emerald-200"
          >
            Back to upload
          </Link>
        </main>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-zinc-950 text-white">
      <main className="mx-auto flex w-full max-w-5xl flex-col gap-10 px-6 py-16">
        <header className="flex flex-col gap-4">
          <div className="flex items-center gap-2 text-sm font-semibold uppercase tracking-[0.2em] text-zinc-400">
            <ShieldCheck className="h-4 w-4 text-emerald-300" />
            RentScore Results
          </div>
          <h1 className="text-4xl font-semibold">
            Trust Score: {analysis.trust_score}
          </h1>
        </header>

        <section className="rounded-3xl border border-zinc-800 bg-zinc-900/50 p-8">
          <div className="flex flex-wrap items-center justify-between gap-4">
            <div>
              <h2 className="text-xl font-semibold">Verified payments</h2>
              <p className="text-sm text-zinc-400">
                Recurring outflows matched to rent behavior.
              </p>
            </div>
            <button
              type="button"
              className="inline-flex items-center gap-2 rounded-full bg-emerald-400 px-5 py-2 text-sm font-semibold text-zinc-950 transition hover:bg-emerald-300 disabled:cursor-not-allowed disabled:bg-emerald-300/50"
              onClick={async () => {
                if (isDownloading) return;
                setIsDownloading(true);
                setDownloadError("");
                try {
                  const response = await fetch(
                    `${apiBaseUrl}/certificate`,
                    {
                      method: "POST",
                      headers: { "Content-Type": "application/json" },
                      body: JSON.stringify(analysis),
                    }
                  );
                  if (!response.ok) {
                    const payload = await response.json().catch(() => null);
                    throw new Error(
                      payload?.detail ??
                        "Certificate generation failed. Please try again."
                    );
                  }
                  const blob = await response.blob();
                  const url = URL.createObjectURL(blob);
                  const anchor = document.createElement("a");
                  anchor.href = url;
                  anchor.download = "rentscore-certificate.pdf";
                  anchor.click();
                  URL.revokeObjectURL(url);
                } catch (err) {
                  const message =
                    err instanceof Error
                      ? err.message
                      : "Download failed.";
                  setDownloadError(message);
                } finally {
                  setIsDownloading(false);
                }
              }}
              disabled={isDownloading}
            >
              <Download className="h-4 w-4" />
              {isDownloading ? "Generating..." : "Download certificate"}
            </button>
          </div>
          {downloadError ? (
            <p className="mt-3 text-sm text-rose-300">{downloadError}</p>
          ) : null}

          <div className="mt-6 grid gap-3">
            {analysis.verified_payments.length === 0 ? (
              <p className="text-sm text-zinc-500">
                No verified rent payments found in this statement.
              </p>
            ) : (
              analysis.verified_payments.map((payment, index) => (
                <div
                  key={`${payment.month}-${index}`}
                  className="flex flex-col gap-2 rounded-2xl border border-zinc-800 bg-zinc-950/60 p-4 sm:flex-row sm:items-center sm:justify-between"
                >
                  <div>
                    <div className="text-sm font-semibold text-white">
                      {payment.month}
                    </div>
                    <div className="text-xs text-zinc-500">
                      {payment.narrative}
                    </div>
                  </div>
                  <div className="text-sm text-emerald-200">
                    KES {payment.amount.toLocaleString()}
                  </div>
                </div>
              ))
            )}
          </div>
        </section>

        {analysis.transactions?.length ? (
          <section className="rounded-3xl border border-zinc-800 bg-zinc-900/50 p-8">
            <div className="flex items-center justify-between">
              <div>
                <h2 className="text-xl font-semibold">Extracted transactions</h2>
                <p className="text-sm text-zinc-400">
                  Raw rows parsed from the statement (debug view).
                </p>
              </div>
            </div>
            <div className="mt-6 max-h-[420px] overflow-auto rounded-2xl border border-zinc-800 bg-zinc-950/60 p-4 text-xs text-zinc-200">
              <pre className="whitespace-pre-wrap">
                {JSON.stringify(analysis.transactions, null, 2)}
              </pre>
            </div>
          </section>
        ) : null}
      </main>
    </div>
  );
}
