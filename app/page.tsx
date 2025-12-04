"use client";

import { useRouter } from "next/navigation";
import { Zap, FileSpreadsheet, Briefcase, Star } from "lucide-react";
import UploadArea from "@/components/UploadArea";

export default function Home() {
  const router = useRouter();

  return (
    <div className="flex flex-col items-center pb-20 relative overflow-hidden bg-white dark:bg-slate-950 transition-colors duration-300">
      
      {/* Background Elements */}
      <div className="absolute inset-0 -z-10 h-full w-full bg-white dark:bg-slate-950 bg-[linear-gradient(to_right,#f0f0f0_1px,transparent_1px),linear-gradient(to_bottom,#f0f0f0_1px,transparent_1px)] dark:bg-[linear-gradient(to_right,#1e293b_1px,transparent_1px),linear-gradient(to_bottom,#1e293b_1px,transparent_1px)] bg-[size:6rem_4rem]">
        <div className="absolute bottom-0 left-0 right-0 top-0 bg-[radial-gradient(circle_800px_at_100%_200px,#d5c5ff,transparent)] dark:bg-[radial-gradient(circle_800px_at_100%_200px,#3b0764,transparent)] opacity-40"></div>
      </div>

      {/* Hero Section */}
      <section className="text-center space-y-6 max-w-5xl mx-auto pt-8 px-4 relative">
        
        <h1 className="text-2xl md:text-4xl font-bold tracking-tight text-slate-900 dark:text-white leading-tight">
          Automatisez vos reçus & factures <br />
          <span className="text-transparent bg-clip-text bg-gradient-to-r from-blue-600 to-violet-600 dark:from-blue-400 dark:to-violet-400">en quelques secondes</span>
        </h1>

        <div className="flex items-center justify-center gap-4 py-2">
          <div className="flex -space-x-3">
            {[1, 2, 3, 4, 5].map((i) => (
              <img
                key={i}
                className="inline-block h-10 w-10 rounded-full ring-2 ring-white dark:ring-slate-900 object-cover"
                src={`https://i.pravatar.cc/100?img=${i + 10}`}
                alt={`User ${i}`}
              />
            ))}
          </div>
          <div className="flex flex-col items-start">
            <div className="flex gap-0.5">
              {[1, 2, 3, 4, 5].map((i) => (
                <Star key={i} className="w-4 h-4 fill-yellow-400 text-yellow-400" />
              ))}
            </div>
            <p className="text-sm font-medium text-slate-700 dark:text-slate-300">
              Premiers clients satisfaits
            </p>
          </div>
        </div>
        
        <p className="text-lg text-slate-600 dark:text-slate-400 max-w-2xl mx-auto leading-relaxed">
          Fini la saisie manuelle. NovaReceipt extrait instantanément les données et génère un Excel pour votre comptable.
        </p>

        {/* Upload Area */}
        <div className="w-full max-w-3xl mx-auto pt-6 relative z-10">
          <div className="absolute -inset-0.5 bg-gradient-to-r from-blue-500 to-violet-500 rounded-2xl blur opacity-20 animate-pulse"></div>
          <div className="relative bg-white/80 dark:bg-slate-900/80 backdrop-blur-xl rounded-xl border border-white/20 dark:border-slate-700 shadow-2xl shadow-blue-500/10 p-2">
            <div className="bg-white/50 dark:bg-slate-800/50 rounded-lg p-6 md:p-8 border border-slate-100 dark:border-slate-700 text-center">
              <h3 className="text-base font-semibold text-slate-700 dark:text-slate-200 mb-4">Déposez un reçu (JPG, PNG, PDF) pour voir un exemple d’extraction.</h3>
              <UploadArea onUploadSuccess={(jobId) => router.push(`/receipts/${jobId}`)} />
            </div>
          </div>
        </div>

        <p className="text-sm text-slate-500 dark:text-slate-400 font-medium">
          Aucun compte requis · Données traitées en France · Supprimées automatiquement
        </p>
      </section>

      {/* 3 Key Benefits */}
      <section className="w-full max-w-5xl mx-auto px-4 mt-16">
        <div className="grid md:grid-cols-3 gap-6">
          <div className="flex flex-col items-center text-center space-y-3 p-5 rounded-2xl bg-white dark:bg-slate-900 border border-slate-100 dark:border-slate-800 shadow-sm">
            <div className="w-10 h-10 bg-blue-50 dark:bg-blue-900/30 text-blue-600 dark:text-blue-400 rounded-full flex items-center justify-center">
              <Zap className="w-5 h-5" />
            </div>
            <h3 className="text-base font-bold text-slate-900 dark:text-white">Gagnez du temps</h3>
            <p className="text-sm text-slate-600 dark:text-slate-400">Automatisez la saisie de vos notes de frais et concentrez-vous sur votre business.</p>
          </div>
          
          <div className="flex flex-col items-center text-center space-y-3 p-5 rounded-2xl bg-white dark:bg-slate-900 border border-slate-100 dark:border-slate-800 shadow-sm">
            <div className="w-10 h-10 bg-emerald-50 dark:bg-emerald-900/30 text-emerald-600 dark:text-emerald-400 rounded-full flex items-center justify-center">
              <FileSpreadsheet className="w-5 h-5" />
            </div>
            <h3 className="text-base font-bold text-slate-900 dark:text-white">Export Excel & CSV</h3>
            <p className="text-sm text-slate-600 dark:text-slate-400">Récupérez vos données formatées en un clic, compatibles avec tous les logiciels comptables.</p>
          </div>

          <div className="flex flex-col items-center text-center space-y-3 p-5 rounded-2xl bg-white dark:bg-slate-900 border border-slate-100 dark:border-slate-800 shadow-sm">
            <div className="w-10 h-10 bg-purple-50 dark:bg-purple-900/30 text-purple-600 dark:text-purple-400 rounded-full flex items-center justify-center">
              <Briefcase className="w-5 h-5" />
            </div>
            <h3 className="text-base font-bold text-slate-900 dark:text-white">Pour les Pros</h3>
            <p className="text-sm text-slate-600 dark:text-slate-400">Idéal pour freelances, TPE et cabinets comptables cherchant à digitaliser leurs processus.</p>
          </div>
        </div>
      </section>
    </div>
  );
}
