"use client";

import Link from "next/link";
import { ArrowLeft, Download, FileText, Calendar, Store, DollarSign, Tag, Loader2, CheckCircle2, AlertCircle, FileSpreadsheet, ChevronDown, ChevronUp } from "lucide-react";
import { useEffect, useState } from "react";
import { useParams } from "next/navigation";
import jsPDF from "jspdf";
import autoTable from "jspdf-autotable";

interface JobStatus {
  job_id: string;
  status: string;
  file_url?: string;
  excel_url?: string;
  pdf_url?: string;
  error?: string;
  created_at?: string;
  receipt_data?: any;
}

export default function ReceiptPage() {
  const params = useParams();
  const id = params.id as string;
  const [job, setJob] = useState<JobStatus | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [showPreview, setShowPreview] = useState(true);

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

    const interval = setInterval(() => {
      if (loading) checkStatus();
    }, 2000);

    checkStatus();

    return () => clearInterval(interval);
  }, [id, loading]);

  if (loading && (!job || (job.status !== "ready" && job.status !== "error"))) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[calc(100vh-4rem)] bg-slate-50">
        <div className="relative mb-8">
          <div className="absolute inset-0 bg-blue-500/20 blur-xl rounded-full"></div>
          <Loader2 className="w-16 h-16 text-blue-600 animate-spin relative z-10" />
        </div>
        <div className="text-center space-y-2 max-w-md px-4">
          <h2 className="text-2xl font-bold text-slate-900">Analyse en cours...</h2>
          <p className="text-slate-500">Notre IA extrait les données de votre document. Cela prend généralement quelques secondes.</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[calc(100vh-4rem)] bg-slate-50 p-4">
        <div className="bg-white p-8 rounded-2xl shadow-xl border border-slate-100 text-center max-w-md w-full">
          <div className="w-16 h-16 bg-red-50 rounded-full flex items-center justify-center mx-auto mb-6">
            <AlertCircle className="w-8 h-8 text-red-500" />
          </div>
          <h3 className="text-xl font-bold text-slate-900 mb-2">Une erreur est survenue</h3>
          <p className="text-slate-500 mb-8">{error}</p>
          <Link href="/dashboard" className="block w-full py-3 bg-slate-900 hover:bg-slate-800 text-white rounded-xl font-medium transition-colors">
            Retour au tableau de bord
          </Link>
        </div>
      </div>
    );
  }

  if (!job) return null;

  const isError = job.status === "error";
  const data = job.receipt_data || {};

  const downloadPDF = () => {
    if (!job || !job.receipt_data) return;
    const data = job.receipt_data;
    const doc = new jsPDF();

    // Header
    doc.setFontSize(20);
    doc.text("Détails du Reçu", 14, 22);
    
    doc.setFontSize(10);
    doc.setTextColor(100);
    doc.text(`ID: ${job.job_id}`, 14, 30);
    doc.text(`Date d'extraction: ${new Date().toLocaleDateString()}`, 14, 35);

    // Main Info
    doc.setFontSize(12);
    doc.setTextColor(0);
    
    let y = 50;
    doc.text(`Commerçant: ${data.merchant || "N/A"}`, 14, y);
    y += 10;
    doc.text(`Date: ${data.date || "N/A"}`, 14, y);
    y += 10;
    doc.text(`Catégorie: ${data.category || "N/A"}`, 14, y);
    y += 10;
    doc.text(`Montant Total: ${data.amount_total?.toFixed(2) || "0.00"} ${data.currency || "EUR"}`, 14, y);
    y += 20;

    // Items
    if (data.items && data.items.length > 0) {
      doc.text("Articles:", 14, y);
      y += 5;
      
      const tableColumn = ["Description", "Montant"];
      const tableRows = data.items.map((item: any) => [
        item.description,
        (item.amount?.toFixed(2) || "0.00")
      ]);

      autoTable(doc, {
        head: [tableColumn],
        body: tableRows,
        startY: y,
        theme: 'grid',
        headStyles: { fillColor: [37, 99, 235] },
      });
    }

    doc.save(`recu_${data.merchant || "inconnu"}_${data.date || "date"}.pdf`);
  };

  return (
    <div className="min-h-[calc(100vh-4rem)] bg-slate-50 p-4 md:p-8">
      <div className="max-w-7xl mx-auto space-y-6">
        
        {/* Header */}
        <div className="bg-white rounded-2xl border border-slate-200 p-6 shadow-sm flex flex-col md:flex-row md:items-center justify-between gap-6">
          <div className="flex items-center gap-4">
            <Link
              href="/dashboard"
              className="p-2 text-slate-400 hover:text-slate-600 hover:bg-slate-100 rounded-lg transition-colors"
            >
              <ArrowLeft className="w-6 h-6" />
            </Link>
            <div>
              <div className="flex items-center gap-3 mb-1">
                <h1 className="text-2xl font-bold text-slate-900">
                  Détails du document
                </h1>
                <span className={`px-2.5 py-0.5 rounded-full text-xs font-bold border flex items-center gap-1.5 ${
                  isError 
                    ? "bg-red-50 text-red-600 border-red-200" 
                    : "bg-green-50 text-green-600 border-green-200"
                }`}>
                  {isError ? <AlertCircle className="w-3 h-3" /> : <CheckCircle2 className="w-3 h-3" />}
                  {isError ? "Erreur" : "Terminé"}
                </span>
              </div>
              <p className="text-slate-500 text-sm font-mono">ID: {job.job_id}</p>
            </div>
          </div>
          
          <div className="flex gap-3">
            <button 
              onClick={downloadPDF}
              className="flex items-center gap-2 px-4 py-2 bg-white border border-slate-200 hover:bg-slate-50 text-slate-700 rounded-lg text-sm font-medium transition-colors"
            >
              <FileText className="w-4 h-4" />
              Télécharger PDF
            </button>
            {job.pdf_url && (
              <a 
                href={job.pdf_url} 
                target="_blank" 
                rel="noopener noreferrer"
                className="flex items-center gap-2 px-4 py-2 bg-white border border-slate-200 hover:bg-slate-50 text-slate-700 rounded-lg text-sm font-medium transition-colors"
              >
                <Download className="w-4 h-4" />
                PDF Original
              </a>
            )}
            {job.excel_url && (
              <a 
                href={job.excel_url}
                target="_blank" 
                rel="noopener noreferrer"
                className="flex items-center gap-2 px-4 py-2 bg-[#1D6F42] hover:bg-[#185c37] text-white rounded-lg text-sm font-medium transition-colors shadow-sm"
              >
                <FileSpreadsheet className="w-4 h-4" />
                Exporter Excel
              </a>
            )}
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          
          {/* Left Column: Receipt Preview */}
          <div className={`bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden flex flex-col transition-all duration-300 ${
            showPreview ? "h-[500px] lg:h-[calc(100vh-12rem)] lg:min-h-[600px]" : "h-auto"
          } lg:sticky lg:top-24`}>
            <div 
              className="p-4 border-b border-slate-100 bg-slate-50/50 flex justify-between items-center cursor-pointer hover:bg-slate-100/50 transition-colors"
              onClick={() => setShowPreview(!showPreview)}
            >
              <h2 className="font-semibold text-slate-700 flex items-center gap-2">
                <FileText className="w-4 h-4" />
                Aperçu du document
              </h2>
              <button 
                className="text-slate-400 hover:text-slate-600 p-1 rounded-lg hover:bg-slate-200/50 transition-colors"
              >
                {showPreview ? <ChevronUp className="w-5 h-5" /> : <ChevronDown className="w-5 h-5" />}
              </button>
            </div>
            
            {showPreview && (
              <div className="flex-1 bg-slate-100 flex items-center justify-center p-4 overflow-auto">
                 {job.file_url ? (
                   /* eslint-disable-next-line @next/next/no-img-element */
                   <img 
                     src={job.file_url} 
                     alt="Receipt" 
                     className="max-w-full max-h-full object-contain shadow-lg rounded-lg"
                   />
                 ) : (
                   <div className="flex flex-col items-center gap-3 text-slate-400">
                     <FileText className="w-12 h-12 opacity-50" />
                     <p>Aperçu non disponible</p>
                   </div>
                 )}
              </div>
            )}
          </div>

          {/* Right Column: Extracted Data */}
          <div className="space-y-6">
            
            {isError ? (
              <div className="bg-white rounded-2xl border border-red-100 shadow-sm p-6">
                <div className="flex gap-4 items-start">
                  <div className="p-3 bg-red-50 rounded-full shrink-0">
                    <AlertCircle className="w-6 h-6 text-red-500" />
                  </div>
                  <div>
                    <h3 className="text-lg font-bold text-slate-900 mb-2">Échec de l'analyse</h3>
                    <p className="text-slate-600">{job.error || "Une erreur inconnue est survenue lors du traitement de ce document."}</p>
                  </div>
                </div>
              </div>
            ) : (
              <>
                {/* Key Metrics Cards */}
                <div className="grid grid-cols-2 gap-4">
                  <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-sm">
                    <p className="text-slate-500 text-xs font-bold uppercase tracking-wider mb-2">Montant Total</p>
                    <p className="text-3xl font-bold text-slate-900 flex items-baseline gap-1">
                      {data.amount_total?.toFixed(2) || "0.00"} 
                      <span className="text-lg text-slate-500 font-medium">{data.currency || "EUR"}</span>
                    </p>
                  </div>
                  <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-sm">
                    <p className="text-slate-500 text-xs font-bold uppercase tracking-wider mb-2">Date</p>
                    <div className="flex items-center gap-2">
                      <div className="p-2 bg-blue-50 rounded-lg text-blue-600">
                        <Calendar className="w-5 h-5" />
                      </div>
                      <p className="text-xl font-bold text-slate-900">{data.date || "N/A"}</p>
                    </div>
                  </div>
                </div>

                {/* Details Card */}
                <div className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden">
                  <div className="p-4 border-b border-slate-100 bg-slate-50/50">
                    <h2 className="font-semibold text-slate-700 flex items-center gap-2">
                      <Tag className="w-4 h-4" />
                      Informations Générales
                    </h2>
                  </div>
                  <div className="divide-y divide-slate-100">
                    <div className="p-4 flex items-center justify-between hover:bg-slate-50 transition-colors">
                      <div className="flex items-center gap-3">
                        <div className="p-2 bg-purple-50 rounded-lg text-purple-600">
                          <Store className="w-5 h-5" />
                        </div>
                        <div>
                          <p className="text-xs text-slate-500 font-medium uppercase">Commerçant</p>
                          <p className="text-slate-900 font-medium">{data.merchant || "Non détecté"}</p>
                        </div>
                      </div>
                    </div>
                    
                    <div className="p-4 flex items-center justify-between hover:bg-slate-50 transition-colors">
                      <div className="flex items-center gap-3">
                        <div className="p-2 bg-orange-50 rounded-lg text-orange-600">
                          <Tag className="w-5 h-5" />
                        </div>
                        <div>
                          <p className="text-xs text-slate-500 font-medium uppercase">Catégorie</p>
                          <p className="text-slate-900 font-medium">{data.category || "Non classifié"}</p>
                        </div>
                      </div>
                      {data.category_confidence && (
                        <span className="text-xs bg-slate-100 text-slate-600 px-2 py-1 rounded-full">
                          {Math.round(data.category_confidence * 100)}% confiance
                        </span>
                      )}
                    </div>
                  </div>
                </div>

                {/* Items Table */}
                {data.items && data.items.length > 0 && (
                  <div className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden">
                    <div className="p-4 border-b border-slate-100 bg-slate-50/50">
                      <h2 className="font-semibold text-slate-700 flex items-center gap-2">
                        <DollarSign className="w-4 h-4" />
                        Détail des articles
                      </h2>
                    </div>
                    <div className="overflow-x-auto">
                      <table className="w-full text-sm text-left">
                        <thead className="bg-slate-50 text-slate-500 font-medium border-b border-slate-100">
                          <tr>
                            <th className="px-6 py-3">Description</th>
                            <th className="px-6 py-3 text-right">Prix</th>
                          </tr>
                        </thead>
                        <tbody className="divide-y divide-slate-100">
                          {data.items.map((item: any, idx: number) => (
                            <tr key={idx} className="hover:bg-slate-50 transition-colors">
                              <td className="px-6 py-4 text-slate-700 font-medium">{item.description}</td>
                              <td className="px-6 py-4 text-right font-mono text-slate-600">
                                {item.amount?.toFixed(2)}
                              </td>
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    </div>
                  </div>
                )}
              </>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
