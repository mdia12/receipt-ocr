"use client";

import Link from "next/link";
import { ArrowLeft, Download, FileText, Calendar, Store, DollarSign, Tag, Loader2, CheckCircle2, AlertCircle } from "lucide-react";
import { useEffect, useState } from "react";
import { useParams } from "next/navigation";

interface JobStatus {
  job_id: string;
  status: string;
  file_url?: string;
  excel_url?: string;
  pdf_url?: string;
  error?: string;
  created_at?: string;
  receipt_data?: any; // Added to support displaying data directly
}

export default function ReceiptPage() {
  const params = useParams();
  const id = params.id as string;
  const [job, setJob] = useState<JobStatus | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!id) return;

    const checkStatus = async () => {
      try {
        const res = await fetch(`/api/status/${id}`);
        if (!res.ok) {
          if (res.status === 404) throw new Error("Facture introuvable");
          throw new Error("Erreur lors de la récupération du statut");
        }
        const data = await res.json();
        setJob(data);

        if (data.status === "ready" || data.status === "error") {
          setLoading(false);
        }
      } catch (err) {
        console.error(err);
        setError(err instanceof Error ? err.message : "Erreur inconnue");
        setLoading(false);
      }
    };

    // Poll every 2 seconds if loading
    const interval = setInterval(() => {
      if (loading) checkStatus();
    }, 2000);

    // Initial check
    checkStatus();

    return () => clearInterval(interval);
  }, [id, loading]);

  if (loading && (!job || (job.status !== "ready" && job.status !== "error"))) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[60vh] space-y-6">
        <div className="relative">
          <div className="absolute inset-0 bg-blue-500/20 blur-xl rounded-full"></div>
          <Loader2 className="w-16 h-16 text-blue-500 animate-spin relative z-10" />
        </div>
        <div className="text-center space-y-2">
          <h2 className="text-2xl font-bold text-white">Analyse en cours...</h2>
          <p className="text-slate-400 max-w-md">Notre IA extrait les données de votre document. Cela prend généralement 5 à 10 secondes.</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[60vh] space-y-6">
        <div className="p-6 bg-red-500/10 border border-red-500/20 rounded-2xl text-red-400 flex flex-col items-center text-center max-w-md">
          <AlertCircle className="w-12 h-12 mb-4" />
          <h3 className="text-lg font-bold mb-2">Une erreur est survenue</h3>
          <p>{error}</p>
        </div>
        <Link href="/" className="px-6 py-3 bg-slate-800 hover:bg-slate-700 text-white rounded-xl font-medium transition-colors">
          Retour à l'accueil
        </Link>
      </div>
    );
  }

  if (!job) return null;

  const isError = job.status === "error";
  const data = job.receipt_data || {};

  return (
    <div className="space-y-8 animate-in fade-in duration-500 pb-12">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-6 bg-slate-900/50 p-6 rounded-2xl border border-slate-800/50 backdrop-blur-sm">
        <div className="flex items-center gap-4">
          <Link
            href="/"
            className="p-3 text-slate-400 hover:text-white hover:bg-slate-800 rounded-xl transition-colors"
          >
            <ArrowLeft className="w-5 h-5" />
          </Link>
          <div>
            <div className="flex items-center gap-3 mb-1">
              <h1 className="text-2xl font-bold text-white">
                Détails du document
              </h1>
              <span className={`px-3 py-1 rounded-full text-xs font-bold border flex items-center gap-1.5 ${
                isError 
                  ? "bg-red-500/10 text-red-400 border-red-500/20" 
                  : "bg-green-500/10 text-green-400 border-green-500/20"
              }`}>
                {isError ? <AlertCircle className="w-3 h-3" /> : <CheckCircle2 className="w-3 h-3" />}
                {isError ? "Erreur" : "Terminé"}
              </span>
            </div>
            <p className="text-slate-400 text-sm font-mono">ID: {job.job_id}</p>
          </div>
        </div>
        <div className="flex gap-3">
          {job.pdf_url && (
            <a 
              href={job.pdf_url} 
              target="_blank" 
              rel="noopener noreferrer"
              className="flex items-center gap-2 px-5 py-2.5 bg-slate-800 hover:bg-slate-700 text-slate-200 rounded-xl text-sm font-medium transition-all hover:scale-105 border border-slate-700"
            >
              <Download className="w-4 h-4" />
              PDF
            </a>
          )}
          {job.excel_url && (
            <a 
              href={job.excel_url}
              target="_blank" 
              rel="noopener noreferrer"
              className="flex items-center gap-2 px-5 py-2.5 bg-blue-600 hover:bg-blue-500 text-white rounded-xl text-sm font-medium transition-all hover:scale-105 shadow-lg shadow-blue-500/20 hover:shadow-blue-500/30"
            >
              <FileText className="w-4 h-4" />
              Excel
            </a>
          )}
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        {/* Receipt Image */}
        <div className="bg-slate-900 rounded-2xl border border-slate-800 p-1 flex items-center justify-center min-h-[600px] lg:sticky lg:top-24 h-fit shadow-2xl shadow-black/50">
          <div className="relative w-full h-full min-h-[600px] bg-slate-950 rounded-xl flex items-center justify-center text-slate-600 overflow-hidden group">
             {job.file_url ? (
               /* eslint-disable-next-line @next/next/no-img-element */
               <img 
                 src={job.file_url} 
                 alt="Receipt" 
                 className="w-full h-full object-contain"
               />
             ) : (
               <div className="flex flex-col items-center gap-3">
                 <FileText className="w-12 h-12 opacity-20" />
                 <p className="text-slate-500">Image non disponible</p>
               </div>
             )}
          </div>
        </div>

        {/* Extracted Data */}
        <div className="space-y-6">
          <div className="bg-slate-900 rounded-2xl border border-slate-800 overflow-hidden shadow-xl">
            <div className="p-6 border-b border-slate-800 bg-slate-900/50">
              <h2 className="text-lg font-bold text-white flex items-center gap-2">
                <Tag className="w-5 h-5 text-blue-400" />
                Données Extraites
              </h2>
            </div>
            
            {isError ? (
              <div className="p-8">
                <div className="p-4 bg-red-500/10 border border-red-500/20 rounded-xl text-red-300 text-sm break-words flex gap-3 items-start">
                  <AlertCircle className="w-5 h-5 shrink-0 mt-0.5" />
                  <div>
                    <p className="font-bold mb-1">Erreur de traitement</p>
                    {job.error || "Une erreur inconnue est survenue."}
                  </div>
                </div>
              </div>
            ) : (
              <div className="p-6 space-y-6">
                {/* Key Metrics */}
                <div className="grid grid-cols-2 gap-4">
                  <div className="p-4 bg-slate-950 rounded-xl border border-slate-800">
                    <p className="text-slate-400 text-xs font-medium uppercase tracking-wider mb-1">Montant Total</p>
                    <p className="text-2xl font-bold text-white flex items-baseline gap-1">
                      {data.amount_total?.toFixed(2) || "0.00"} 
                      <span className="text-sm text-slate-500">{data.currency || "EUR"}</span>
                    </p>
                  </div>
                  <div className="p-4 bg-slate-950 rounded-xl border border-slate-800">
                    <p className="text-slate-400 text-xs font-medium uppercase tracking-wider mb-1">Date</p>
                    <p className="text-xl font-semibold text-white flex items-center gap-2 h-8">
                      <Calendar className="w-4 h-4 text-slate-500" />
                      {data.date || "N/A"}
                    </p>
                  </div>
                </div>

                <div className="space-y-4">
                  <div className="flex items-center justify-between p-4 bg-slate-950 rounded-xl border border-slate-800">
                    <div className="flex items-center gap-3">
                      <div className="p-2 bg-blue-500/10 rounded-lg">
                        <Store className="w-5 h-5 text-blue-400" />
                      </div>
                      <div>
                        <p className="text-slate-400 text-xs font-medium uppercase">Commerçant</p>
                        <p className="text-white font-medium">{data.merchant || "Non détecté"}</p>
                      </div>
                    </div>
                  </div>

                  <div className="flex items-center justify-between p-4 bg-slate-950 rounded-xl border border-slate-800">
                    <div className="flex items-center gap-3">
                      <div className="p-2 bg-purple-500/10 rounded-lg">
                        <Tag className="w-5 h-5 text-purple-400" />
                      </div>
                      <div>
                        <p className="text-slate-400 text-xs font-medium uppercase">Catégorie</p>
                        <p className="text-white font-medium">{data.category || "Non classifié"}</p>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Items Table */}
                {data.items && data.items.length > 0 && (
                  <div className="mt-6">
                    <h3 className="text-sm font-semibold text-slate-400 mb-3 uppercase tracking-wider">Articles</h3>
                    <div className="border border-slate-800 rounded-xl overflow-hidden">
                      <table className="w-full text-sm text-left">
                        <thead className="bg-slate-950 text-slate-400 font-medium">
                          <tr>
                            <th className="px-4 py-3">Description</th>
                            <th className="px-4 py-3 text-right">Prix</th>
                          </tr>
                        </thead>
                        <tbody className="divide-y divide-slate-800 bg-slate-900/50">
                          {data.items.map((item: any, idx: number) => (
                            <tr key={idx} className="hover:bg-slate-800/50 transition-colors">
                              <td className="px-4 py-3 text-slate-300">{item.description}</td>
                              <td className="px-4 py-3 text-right font-mono text-slate-200">
                                {item.amount?.toFixed(2)}
                              </td>
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    </div>
                  </div>
                )}

                <div className="pt-4 border-t border-slate-800">
                  <div className="flex items-center gap-2 text-xs text-slate-500 justify-center">
                    <CheckCircle2 className="w-3 h-3 text-green-500" />
                    Confiance IA: {Math.round((data.confidence || 0) * 100)}%
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
