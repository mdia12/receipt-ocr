"use client";

import { useRouter } from "next/navigation";
import { Check, Zap, FileSpreadsheet, Briefcase } from "lucide-react";
import UploadArea from "@/components/UploadArea";
import { useRef } from "react";

export default function Home() {
  const router = useRouter();
  const uploadSectionRef = useRef<HTMLDivElement>(null);

  const scrollToUpload = () => {
    uploadSectionRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  return (
    <div className="flex flex-col items-center pb-20 relative overflow-hidden">
      
      {/* Background Elements */}
      <div className="absolute inset-0 -z-10 h-full w-full bg-white bg-[linear-gradient(to_right,#f0f0f0_1px,transparent_1px),linear-gradient(to_bottom,#f0f0f0_1px,transparent_1px)] bg-[size:6rem_4rem]">
        <div className="absolute bottom-0 left-0 right-0 top-0 bg-[radial-gradient(circle_800px_at_100%_200px,#d5c5ff,transparent)] opacity-40"></div>
      </div>

      {/* Hero Section */}
      <section className="text-center space-y-8 max-w-4xl mx-auto pt-16 px-4 relative">
        
        <h1 className="text-4xl md:text-6xl font-bold tracking-tight text-slate-900 leading-tight">
          Automatisez vos reçus & factures <br className="hidden md:block" />
          <span className="text-transparent bg-clip-text bg-gradient-to-r from-blue-600 to-violet-600">
            en quelques secondes
          </span>
        </h1>
        
        <p className="text-xl text-slate-600 max-w-2xl mx-auto leading-relaxed">
          Fini la saisie manuelle. NovaReceipt extrait instantanément les montants, dates, TVA et lignes de dépenses à partir de vos reçus, puis génère un fichier Excel propre et prêt pour votre comptable.
        </p>

        <div className="flex flex-col items-center gap-4">
          <button 
            onClick={scrollToUpload}
            className="px-8 py-4 bg-blue-600 hover:bg-blue-700 text-white text-lg font-semibold rounded-full shadow-lg shadow-blue-500/30 transition-all hover:scale-105"
          >
            Analyser un reçu maintenant
          </button>
          <p className="text-sm text-slate-500 font-medium">
            Aucun compte requis · Données traitées en France · Supprimées automatiquement
          </p>
        </div>
        
        {/* Upload Area */}
        <div ref={uploadSectionRef} className="w-full max-w-3xl mx-auto pt-12 relative z-10 scroll-mt-24">
          <div className="absolute -inset-0.5 bg-gradient-to-r from-blue-500 to-violet-500 rounded-2xl blur opacity-20 animate-pulse"></div>
          <div className="relative bg-white/80 backdrop-blur-xl rounded-xl border border-white/20 shadow-2xl shadow-blue-500/10 p-2">
            <div className="bg-white/50 rounded-lg p-6 md:p-10 border border-slate-100 text-center">
              <h3 className="text-lg font-semibold text-slate-700 mb-4">Déposez un reçu (JPG, PNG, PDF) pour voir un exemple d’extraction.</h3>
              <UploadArea onUploadSuccess={(jobId) => router.push(`/receipts/${jobId}`)} />
            </div>
          </div>
        </div>
      </section>

      {/* 3 Key Benefits */}
      <section className="w-full max-w-5xl mx-auto px-4 mt-24">
        <div className="grid md:grid-cols-3 gap-8">
          <div className="flex flex-col items-center text-center space-y-4 p-6 rounded-2xl bg-white border border-slate-100 shadow-sm">
            <div className="w-12 h-12 bg-blue-50 text-blue-600 rounded-full flex items-center justify-center">
              <Zap className="w-6 h-6" />
            </div>
            <h3 className="text-lg font-bold text-slate-900">Gagnez du temps</h3>
            <p className="text-slate-600">Automatisez la saisie de vos notes de frais et concentrez-vous sur votre business.</p>
          </div>
          
          <div className="flex flex-col items-center text-center space-y-4 p-6 rounded-2xl bg-white border border-slate-100 shadow-sm">
            <div className="w-12 h-12 bg-emerald-50 text-emerald-600 rounded-full flex items-center justify-center">
              <FileSpreadsheet className="w-6 h-6" />
            </div>
            <h3 className="text-lg font-bold text-slate-900">Export Excel & CSV</h3>
            <p className="text-slate-600">Récupérez vos données formatées en un clic, compatibles avec tous les logiciels comptables.</p>
          </div>

          <div className="flex flex-col items-center text-center space-y-4 p-6 rounded-2xl bg-white border border-slate-100 shadow-sm">
            <div className="w-12 h-12 bg-purple-50 text-purple-600 rounded-full flex items-center justify-center">
              <Briefcase className="w-6 h-6" />
            </div>
            <h3 className="text-lg font-bold text-slate-900">Pour les Pros</h3>
            <p className="text-slate-600">Idéal pour freelances, TPE et cabinets comptables cherchant à digitaliser leurs processus.</p>
          </div>
        </div>
      </section>
    </div>
  );
}
