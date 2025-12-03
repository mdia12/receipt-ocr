"use client";

import { useRouter } from "next/navigation";
import Link from "next/link";
import { ArrowRight, Check, Zap, Shield, FileSpreadsheet } from "lucide-react";
import UploadArea from "@/components/UploadArea";

export default function Home() {
  const router = useRouter();

  return (
    <div className="flex flex-col items-center space-y-20">
      {/* Hero Section */}
      <section className="text-center space-y-8 max-w-4xl mx-auto pt-10">
        <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-blue-500/10 text-blue-400 text-sm font-medium border border-blue-500/20">
          <span className="relative flex h-2 w-2">
            <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-blue-400 opacity-75"></span>
            <span className="relative inline-flex rounded-full h-2 w-2 bg-blue-500"></span>
          </span>
          Now with AI-powered extraction
        </div>
        
        <h1 className="text-5xl md:text-7xl font-extrabold tracking-tight text-white">
          Receipts to Excel <br />
          <span className="text-transparent bg-clip-text bg-gradient-to-r from-blue-400 to-cyan-300">
            in seconds.
          </span>
        </h1>
        
        <p className="text-xl text-slate-400 max-w-2xl mx-auto leading-relaxed">
          Stop manual data entry. Upload your receipts and let our AI extract merchant, date, totals, and line items automatically.
        </p>
        
        <div className="flex flex-col sm:flex-row items-center justify-center gap-4 pt-4">
          <Link
            href="/login"
            className="px-8 py-4 bg-blue-600 hover:bg-blue-500 text-white font-semibold rounded-xl transition-all shadow-lg shadow-blue-500/20 flex items-center gap-2"
          >
            Start for free <ArrowRight className="w-4 h-4" />
          </Link>
          <Link
            href="/dashboard"
            className="px-8 py-4 bg-slate-800 hover:bg-slate-700 text-slate-200 font-semibold rounded-xl transition-colors border border-slate-700"
          >
            View Demo
          </Link>
        </div>
      </section>

      {/* Interactive Demo Area */}
      <section className="w-full max-w-3xl mx-auto">
        <div className="relative group">
          <div className="absolute -inset-1 bg-gradient-to-r from-blue-600 to-cyan-600 rounded-2xl blur opacity-25 group-hover:opacity-50 transition duration-1000 group-hover:duration-200"></div>
          <div className="relative bg-slate-950 rounded-xl border border-slate-800 p-1 shadow-2xl">
            <div className="bg-slate-900/50 rounded-lg p-8">
              <div className="text-center mb-8">
                <h3 className="text-lg font-semibold text-white mb-2">Try it out right now</h3>
                <p className="text-slate-400 text-sm">No account required for this demo</p>
              </div>
              <UploadArea onUploadSuccess={(jobId) => router.push(`/receipts/${jobId}`)} />
            </div>
          </div>
        </div>
      </section>

      {/* Features Grid */}
      <section className="grid md:grid-cols-3 gap-8 w-full pt-10">
        {[
          {
            icon: Zap,
            title: "Instant Processing",
            desc: "Get structured data from your receipts in under 5 seconds."
          },
          {
            icon: FileSpreadsheet,
            title: "Excel & PDF Export",
            desc: "Download clean, formatted reports ready for your accountant."
          },
          {
            icon: Shield,
            title: "Bank-Grade Security",
            desc: "Your financial data is encrypted and processed securely."
          }
        ].map((feature, i) => (
          <div key={i} className="p-6 rounded-2xl bg-slate-900/50 border border-slate-800 hover:border-slate-700 transition-colors">
            <div className="w-12 h-12 bg-slate-800 rounded-lg flex items-center justify-center mb-4 text-blue-400">
              <feature.icon className="w-6 h-6" />
            </div>
            <h3 className="text-lg font-semibold text-white mb-2">{feature.title}</h3>
            <p className="text-slate-400 leading-relaxed">{feature.desc}</p>
          </div>
        ))}
      </section>
    </div>
  );
}
