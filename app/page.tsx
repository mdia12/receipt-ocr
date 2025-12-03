"use client";

import { useRouter } from "next/navigation";
import Link from "next/link";
import { ArrowRight, Check, Zap, Shield, FileSpreadsheet, Sparkles } from "lucide-react";
import UploadArea from "@/components/UploadArea";

export default function Home() {
  const router = useRouter();

  return (
    <div className="flex flex-col items-center space-y-24 pb-20 relative overflow-hidden">
      
      {/* Background Elements */}
      <div className="absolute inset-0 -z-10 h-full w-full bg-white bg-[linear-gradient(to_right,#f0f0f0_1px,transparent_1px),linear-gradient(to_bottom,#f0f0f0_1px,transparent_1px)] bg-[size:6rem_4rem]">
        <div className="absolute bottom-0 left-0 right-0 top-0 bg-[radial-gradient(circle_800px_at_100%_200px,#d5c5ff,transparent)] opacity-40"></div>
      </div>

      {/* Hero Section */}
      <section className="text-center space-y-6 max-w-5xl mx-auto pt-6 px-4 relative">
        
        <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-white/80 backdrop-blur-sm text-blue-600 text-sm font-medium border border-blue-100 shadow-sm ring-1 ring-blue-500/10 animate-fade-in-up">
          <Sparkles className="w-4 h-4 fill-blue-600 text-blue-600" />
          <span>Nouvelle IA de reconnaissance v2.0</span>
        </div>
        
        <h1 className="text-2xl md:text-4xl font-bold tracking-tight text-slate-900 leading-tight">
          Automatisez votre comptabilité <br className="hidden md:block" />
          <span className="text-transparent bg-clip-text bg-gradient-to-r from-blue-600 to-violet-600">
            grâce à l'IA
          </span>
        </h1>
        
        <p className="text-lg text-slate-600 max-w-2xl mx-auto leading-relaxed">
          Fini la saisie manuelle. Notre IA extrait instantanément les données de vos reçus et les exporte vers Excel.
        </p>
        
        {/* Upload Area - Modernized */}
        <div className="w-full max-w-3xl mx-auto pt-8 relative z-10">
          <div className="absolute -inset-0.5 bg-gradient-to-r from-blue-500 to-violet-500 rounded-2xl blur opacity-20 animate-pulse"></div>
          <div className="relative bg-white/80 backdrop-blur-xl rounded-xl border border-white/20 shadow-2xl shadow-blue-500/10 p-2">
            <div className="bg-white/50 rounded-lg p-6 md:p-10 border border-slate-100">
              <UploadArea onUploadSuccess={(jobId) => router.push(`/receipts/${jobId}`)} />
            </div>
          </div>
          <p className="text-sm text-slate-400 mt-4 flex items-center justify-center gap-4">
            <span className="flex items-center gap-1"><Check className="w-3 h-3" /> Pas de carte requise</span>
            <span className="flex items-center gap-1"><Check className="w-3 h-3" /> 100% Sécurisé</span>
          </p>
        </div>
      </section>

      {/* Features Grid - Modernized */}
      <section className="w-full max-w-6xl mx-auto px-4">
        <div className="grid md:grid-cols-3 gap-8">
          {[
            {
              icon: Zap,
              title: "Traitement Instantané",
              desc: "Obtenez des données structurées en moins de 5 secondes grâce à notre moteur OCR ultra-rapide.",
              color: "text-amber-500",
              bg: "bg-amber-50"
            },
            {
              icon: FileSpreadsheet,
              title: "Export Excel & PDF",
              desc: "Téléchargez des rapports propres et formatés, prêts à être envoyés à votre comptable.",
              color: "text-emerald-500",
              bg: "bg-emerald-50"
            },
            {
              icon: Shield,
              title: "Sécurité Bancaire",
              desc: "Vos données financières sont chiffrées de bout en bout et traitées avec la plus grande confidentialité.",
              color: "text-blue-500",
              bg: "bg-blue-50"
            }
          ].map((feature, i) => (
            <div key={i} className="group p-8 rounded-3xl bg-white border border-slate-100 hover:border-blue-100 hover:shadow-xl hover:shadow-blue-500/5 transition-all duration-300">
              <div className={`w-14 h-14 ${feature.bg} rounded-2xl flex items-center justify-center mb-6 group-hover:scale-110 transition-transform duration-300`}>
                <feature.icon className={`w-7 h-7 ${feature.color}`} />
              </div>
              <h3 className="text-xl font-bold text-slate-900 mb-3">{feature.title}</h3>
              <p className="text-slate-600 leading-relaxed">{feature.desc}</p>
            </div>
          ))}
        </div>
      </section>
    </div>
  );
}
