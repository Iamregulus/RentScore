"use client";

import { useCallback, useRef, useState } from "react";
import { useRouter } from "next/navigation";
import { FileRejection, useDropzone } from "react-dropzone";
import {
  AlertCircle,
  ArrowRight,
  CheckCircle2,
  Loader2,
  Lock,
  UploadCloud,
} from "lucide-react";

import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { cn } from "@/lib/utils";

type UploadStatus = "idle" | "dragging" | "uploading" | "success" | "error";

export default function Hero() {
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [fileName, setFileName] = useState("");
  const [password, setPassword] = useState("");
  const [status, setStatus] = useState<UploadStatus>("idle");
  const [error, setError] = useState("");
  const [validationError, setValidationError] = useState("");
  const router = useRouter();
  const apiBaseUrl = process.env.NEXT_PUBLIC_API_URL ?? "http://localhost:8000";
  const fileInputRef = useRef<HTMLInputElement | null>(null);

  const handleFile = useCallback((file: File) => {
    setSelectedFile(file);
    setFileName(file.name);
    setStatus("idle");
    setError("");
    setValidationError("");
  }, []);

  const onDrop = useCallback(
    (acceptedFiles: File[]) => {
      const file = acceptedFiles[0];
      if (!file) return;
      handleFile(file);
    },
    [handleFile]
  );

  const onDropRejected = useCallback((rejections: FileRejection[]) => {
    const reason = rejections[0]?.errors[0]?.message;
    setValidationError(reason ?? "Invalid file. Please upload a PDF under 15MB.");
    setStatus("error");
  }, []);

  const { getRootProps, getInputProps, isDragActive, open } = useDropzone({
    onDrop,
    onDropRejected,
    accept: { "application/pdf": [".pdf"] },
    multiple: false,
    maxSize: 15 * 1024 * 1024,
    noClick: true,
  });

  const handleAnalyze = async () => {
    if (!selectedFile || status === "uploading") return;
    setStatus("uploading");
    setError("");
    try {
      const formData = new FormData();
      formData.append("file", selectedFile);
      if (password.trim()) {
        formData.append("password", password.trim());
      }
      const response = await fetch(`${apiBaseUrl}/analyze`, {
        method: "POST",
        body: formData,
      });
      if (!response.ok) {
        const payload = await response.json().catch(() => null);
        throw new Error(
          payload?.detail ?? "Analysis failed. Please try again."
        );
      }
      const data = await response.json();
      sessionStorage.setItem("rentscore:analysis", JSON.stringify(data));
      setStatus("success");
      router.push("/results");
    } catch (err) {
      const message = err instanceof Error ? err.message : "Upload failed.";
      setError(message);
      setStatus("error");
    }
  };

  const resetUpload = () => {
    setSelectedFile(null);
    setFileName("");
    setStatus("idle");
    setError("");
    setValidationError("");
    if (fileInputRef.current) fileInputRef.current.value = "";
  };

  return (
    <section className="relative overflow-hidden bg-slate-900 bg-gradient-to-b from-slate-900 to-slate-800 pb-12 pt-32 lg:pb-24 lg:pt-48">
      <div className="absolute inset-0 -z-10 opacity-70 [background:radial-gradient(circle_at_top,_rgba(16,185,129,0.2),_transparent_55%)]" />

      <div className="mx-auto flex max-w-6xl flex-col items-center gap-12 px-4 md:px-6 lg:flex-row lg:gap-20">
        <div className="flex-1 space-y-8 text-center text-white lg:text-left">
          <div className="space-y-4">
            <div className="inline-flex items-center rounded-full border border-emerald-400/30 bg-emerald-500/10 px-3 py-1 text-sm font-medium text-emerald-200">
              <span className="mr-2 h-2 w-2 rounded-full bg-emerald-400" />
              Now Live in Nairobi
            </div>
            <h1 className="text-4xl font-extrabold leading-[1.1] tracking-tight text-white md:text-6xl">
              Turn <span className="text-emerald-300">M-Pesa History</span> into
              a Rental Passport
            </h1>
            <p className="mx-auto max-w-lg text-lg text-slate-300 lg:mx-0">
              Stop printing statements. Generate a verified tenant score
              instantly using your M-Pesa transaction history. Secure, private,
              and accepted by top landlords.
            </p>
          </div>

          <div className="flex flex-col items-center justify-center gap-4 sm:flex-row lg:justify-start">
            <Button className="min-w-[160px] px-6 py-3">
              Start Verification
              <ArrowRight className="ml-2 h-4 w-4 transition-transform group-hover:translate-x-1" />
            </Button>
            <Button variant="outline" className="min-w-[160px] px-6 py-3">
              For Landlords
            </Button>
          </div>

          <div className="flex flex-wrap items-center justify-center gap-4 text-xs text-slate-300 lg:justify-start">
            <span className="font-semibold text-slate-200">
              Trusted by Landlords in:
            </span>
            <div className="flex items-center gap-2">
              {["Kilimani", "Westlands", "CBD"].map((label) => (
                <span
                  key={label}
                  className="rounded-full bg-white/10 px-3 py-1 text-xs font-semibold text-slate-200"
                >
                  {label}
                </span>
              ))}
            </div>
          </div>

          <div className="flex flex-wrap items-center justify-center gap-6 text-sm text-slate-300 lg:justify-start">
            <div className="flex items-center gap-2">
              <CheckCircle2 size={16} className="text-emerald-300" />
              <span>Bank-level AES-256</span>
            </div>
            <div className="flex items-center gap-2">
              <CheckCircle2 size={16} className="text-emerald-300" />
              <span>GDPR Compliant</span>
            </div>
          </div>
        </div>

        <div className="relative z-10 mb-8 w-full max-w-md flex-1 lg:-mb-24 lg:mb-0">
          <div className="absolute -right-12 -top-12 h-64 w-64 rounded-full bg-emerald-500/30 blur-3xl opacity-70" />
          <div className="absolute -bottom-12 -left-12 h-64 w-64 rounded-full bg-purple-500/20 blur-3xl opacity-70" />

          <Card className="overflow-hidden border-slate-200/60 bg-white shadow-2xl shadow-slate-900/10 transition-all duration-300 hover:border-emerald-200">
            <div className="h-2 w-full bg-gradient-to-r from-emerald-500 to-purple-500" />
            <CardContent className="p-8">
              <div
                {...getRootProps()}
                className={cn(
                  "relative flex min-h-[320px] cursor-pointer flex-col items-center justify-center gap-4 rounded-xl border-2 border-dashed border-emerald-100 p-8 text-center transition-all duration-200 ease-in-out",
                  isDragActive || status === "dragging"
                    ? "border-emerald-500 bg-emerald-50/50"
                    : "hover:border-emerald-400 hover:bg-slate-50",
                  status === "success" && "border-emerald-500 bg-emerald-50/20",
                  status === "error" && "border-rose-500 bg-rose-50/20"
                )}
                onClick={open}
              >
                <input {...getInputProps()} ref={fileInputRef} />

                {status === "uploading" ? (
                  <div className="flex flex-col items-center">
                    <Loader2
                      size={48}
                      className="mb-4 animate-spin text-emerald-500"
                    />
                    <h3 className="text-lg font-semibold text-slate-900">
                      Analyzing Statement...
                    </h3>
                    <p className="text-sm text-slate-500">
                      Calculating your RentScore
                    </p>
                  </div>
                ) : status === "success" ? (
                  <div className="flex w-full flex-col items-center">
                    <div className="mb-4 flex h-16 w-16 items-center justify-center rounded-full bg-emerald-100 text-emerald-600">
                      <CheckCircle2 size={32} />
                    </div>
                    <h3 className="text-lg font-semibold text-slate-900">
                      Analysis Complete!
                    </h3>
                    <p className="mb-6 text-sm text-slate-500">{fileName}</p>
                    <Button className="w-full" onClick={handleAnalyze}>
                      View Certificate
                    </Button>
                    <button
                      onClick={(event) => {
                        event.stopPropagation();
                        resetUpload();
                      }}
                      className="mt-4 text-xs text-slate-400 underline hover:text-slate-600"
                    >
                      Upload different file
                    </button>
                  </div>
                ) : status === "error" ? (
                  <div className="flex flex-col items-center">
                    <AlertCircle size={48} className="mb-4 text-rose-500" />
                    <h3 className="text-lg font-semibold text-slate-900">
                      Upload Failed
                    </h3>
                    <p className="mb-4 text-sm text-slate-500">
                      Please try again with a valid PDF.
                    </p>
                    <Button variant="outline" onClick={resetUpload}>
                      Retry
                    </Button>
                  </div>
                ) : (
                  <>
                    <div className="mb-2 flex h-16 w-16 items-center justify-center rounded-full bg-emerald-100 text-emerald-600 transition-transform duration-300">
                      <UploadCloud size={32} />
                    </div>
                    <div className="space-y-2">
                      <h3 className="text-lg font-semibold text-slate-900">
                        Upload M-Pesa Statement
                      </h3>
                      <p className="text-sm text-slate-500">
                        Drag &amp; drop your PDF statement here, or click to
                        browse
                      </p>
                    </div>
                    <div className="flex items-center gap-2 rounded-full border border-slate-100 bg-white px-3 py-1.5 text-xs font-medium text-slate-400 shadow-sm">
                      <Lock size={12} />
                      End-to-end Encrypted
                    </div>
                  </>
                )}
              </div>

              <div className="mt-4 flex flex-col gap-3">
                <label className="text-xs font-semibold uppercase tracking-[0.2em] text-slate-500">
                  PDF password (optional)
                </label>
                <input
                  type="password"
                  placeholder="ID number or DOB"
                  value={password}
                  onChange={(event) => setPassword(event.target.value)}
                  className="rounded-2xl border border-slate-200 bg-white px-4 py-2 text-sm text-slate-700 placeholder:text-slate-400 focus:border-emerald-400 focus:outline-none"
                />
              </div>

              <div className="mt-3 flex items-center justify-between text-xs text-slate-500">
                <span>{fileName ? `Selected: ${fileName}` : "No file selected"}</span>
                <span>Max 15MB</span>
              </div>

              <Button
                className="mt-5 w-full py-3"
                onClick={handleAnalyze}
                disabled={!selectedFile || status === "uploading"}
              >
                {status === "uploading" ? "Analyzing..." : "Generate Trust Score"}
              </Button>
              {validationError ? (
                <p className="mt-3 text-sm text-amber-600">
                  {validationError}
                </p>
              ) : null}
              {error ? <p className="mt-2 text-sm text-rose-600">{error}</p> : null}
            </CardContent>
          </Card>
        </div>
      </div>
    </section>
  );
}
