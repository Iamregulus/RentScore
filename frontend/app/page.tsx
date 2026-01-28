import CertificatePreview from "@/components/landing/CertificatePreview";
import Features from "@/components/landing/Features";
import Footer from "@/components/landing/Footer";
import Hero from "@/components/landing/Hero";
import Navbar from "@/components/landing/Navbar";
import TrustStrip from "@/components/landing/TrustStrip";

export default function Home() {
  return (
    <div className="min-h-screen bg-slate-50">
      <Navbar />
      <main>
        <Hero />
        <Features />
        <TrustStrip />
        <CertificatePreview />
      </main>
      <Footer />
    </div>
  );
}
