"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { FileText, ShieldCheck, Sparkles, UploadCloud } from "lucide-react";

export default function Home() {
  const [isDragging, setIsDragging] = useState(false);
  const [fileName, setFileName] = useState("");
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [isUploading, setIsUploading] = useState(false);
  const [error, setError] = useState("");
  const router = useRouter();
  const apiBaseUrl = process.env.NEXT_PUBLIC_API_URL ?? "http://localhost:8000";

  const handleFile = (file: File | null) => {
    if (!file) return;
    setFileName(file.name);
    setSelectedFile(file);
    setError("");
  };

  const handleDrop = (event: React.DragEvent<HTMLDivElement>) => {
    event.preventDefault();
    setIsDragging(false);
    handleFile(event.dataTransfer.files?.[0] ?? null);
  };

  return (
    <div className="min-h-screen bg-zinc-950 text-white">
      <main className="mx-auto flex w-full max-w-5xl flex-col gap-12 px-6 py-16">
        <header className="flex flex-col gap-6">
          <div className="flex items-center gap-2 text-sm font-semibold uppercase tracking-[0.2em] text-zinc-400">
            <Sparkles className="h-4 w-4" />
            RentScore
          </div>
          <h1 className="text-4xl font-semibold leading-tight sm:text-5xl">
            Verify rent history for gig workers in minutes.
          </h1>
          <p className="max-w-2xl text-lg text-zinc-300">
            Upload an M-Pesa statement PDF and let our AI identify consistent
            monthly rent outflows, even when labels vary.
          </p>
        </header>

        <section className="grid gap-8 lg:grid-cols-[1.2fr_0.8fr]">
          <div
            className={`rounded-3xl border border-dashed px-8 py-10 transition ${
              isDragging
                ? "border-emerald-400 bg-emerald-500/10"
                : "border-zinc-700 bg-zinc-900/60"
            }`}
            onDragEnter={(event) => {
              event.preventDefault();
              setIsDragging(true);
            }}
            onDragLeave={() => setIsDragging(false)}
            onDragOver={(event) => event.preventDefault()}
            onDrop={handleDrop}
          >
            <div className="flex flex-col items-center gap-6 text-center">
              <UploadCloud className="h-12 w-12 text-emerald-300" />
              <div className="space-y-2">
                <h2 className="text-2xl font-semibold">
                  Drag and drop your PDF
                </h2>
                <p className="text-sm text-zinc-400">
                  Files stay private and are used only to compute the Trust
                  Score.
                </p>
              </div>
              <label className="inline-flex cursor-pointer items-center gap-2 rounded-full bg-emerald-400 px-5 py-2 text-sm font-semibold text-zinc-950 transition hover:bg-emerald-300">
                <FileText className="h-4 w-4" />
                Choose statement
                <input
                  type="file"
                  accept="application/pdf"
                  className="hidden"
                  onChange={(event) =>
                    handleFile(event.target.files?.[0] ?? null)
                  }
                />
              </label>
              {fileName ? (
                <p className="text-sm text-emerald-200">
                  Selected: {fileName}
                </p>
              ) : (
                <p className="text-sm text-zinc-500">
                  PDF only · Max 15MB · 12 months recommended
                </p>
              )}
              <button
                type="button"
                className="inline-flex items-center justify-center rounded-full border border-zinc-700 px-6 py-2 text-sm font-semibold text-white transition hover:border-emerald-300 hover:text-emerald-200 disabled:cursor-not-allowed disabled:border-zinc-800 disabled:text-zinc-500"
                onClick={async () => {
                  if (!selectedFile || isUploading) return;
                  setIsUploading(true);
                  setError("");
                  try {
                    const formData = new FormData();
                    formData.append("file", selectedFile);
                    const response = await fetch(
                      `${apiBaseUrl}/analyze`,
                      {
                        method: "POST",
                        body: formData,
                      }
                    );

                    if (!response.ok) {
                      const payload = await response.json().catch(() => null);
                      throw new Error(
                        payload?.detail ?? "Analysis failed. Please try again."
                      );
                    }

                    const data = await response.json();
                    sessionStorage.setItem(
                      "rentscore:analysis",
                      JSON.stringify(data)
                    );
                    router.push("/results");
                  } catch (err) {
                    const message =
                      err instanceof Error ? err.message : "Upload failed.";
                    setError(message);
                  } finally {
                    setIsUploading(false);
                  }
                }}
                disabled={!selectedFile || isUploading}
              >
                {isUploading ? "Analyzing..." : "Generate Trust Score"}
              </button>
              {error ? (
                <p className="text-sm text-rose-300">{error}</p>
              ) : null}
            </div>
          </div>

          <div className="flex flex-col justify-between gap-6 rounded-3xl border border-zinc-800 bg-zinc-900/40 p-8">
            <div className="space-y-3">
              <div className="flex items-center gap-3 text-base font-semibold">
                <ShieldCheck className="h-5 w-5 text-emerald-300" />
                Trust Score highlights
              </div>
              <p className="text-sm text-zinc-400">
                We flag steady monthly rent payments, detect gaps, and summarize
                verified landlord transfers for underwriting teams.
              </p>
            </div>
            <div className="rounded-2xl border border-zinc-800 bg-zinc-950/70 p-5 text-sm text-zinc-300">
              <div className="text-3xl font-semibold text-white">82</div>
              <div className="text-xs uppercase tracking-[0.2em] text-zinc-500">
                Sample Trust Score
              </div>
              <div className="mt-4 text-xs text-zinc-500">
                Downloadable certificate generated after verification.
              </div>
            </div>
          </div>
        </section>
      </main>
    </div>
  );
}
