"use client";

import Link from "next/link";
import { ArrowLeft, Download, FileText, Calendar, Store, DollarSign, Tag, Loader2 } from "lucide-react";
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
          if (res.status === 404) throw new Error("Receipt not found");
          throw new Error("Failed to fetch status");
        }
        const data = await res.json();
        setJob(data);

        if (data.status === "ready" || data.status === "error") {
          setLoading(false);
        }
      } catch (err) {
        console.error(err);
        setError(err instanceof Error ? err.message : "Unknown error");
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
      <div className="flex flex-col items-center justify-center min-h-[60vh] space-y-4">
        <Loader2 className="w-12 h-12 text-blue-500 animate-spin" />
        <h2 className="text-xl font-semibold text-white">Processing Receipt...</h2>
        <p className="text-slate-400">Our AI is extracting data. This usually takes 5-10 seconds.</p>
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[60vh] space-y-4">
        <div className="p-4 bg-red-500/10 border border-red-500/20 rounded-xl text-red-400">
          {error}
        </div>
        <Link href="/" className="text-blue-400 hover:underline">
          Try again
        </Link>
      </div>
    );
  }

  if (!job) return null;

  const isError = job.status === "error";

  return (
    <div className="space-y-6 animate-in fade-in duration-500">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div className="flex items-center gap-4">
          <Link
            href="/"
            className="p-2 text-slate-400 hover:text-white hover:bg-slate-800 rounded-lg transition-colors"
          >
            <ArrowLeft className="w-5 h-5" />
          </Link>
          <div>
            <h1 className="text-2xl font-bold text-white flex items-center gap-2">
              Receipt Processed
              <span className={`px-2.5 py-0.5 rounded-full text-xs font-medium border ${
                isError 
                  ? "bg-red-500/10 text-red-400 border-red-500/20" 
                  : "bg-green-500/10 text-green-400 border-green-500/20"
              }`}>
                {job.status}
              </span>
            </h1>
            <p className="text-slate-400 text-sm">ID: {job.job_id}</p>
          </div>
        </div>
        <div className="flex gap-2">
          {job.pdf_url && (
            <a 
              href={job.pdf_url} 
              target="_blank" 
              rel="noopener noreferrer"
              className="flex items-center gap-2 px-4 py-2 bg-slate-800 hover:bg-slate-700 text-slate-200 rounded-lg text-sm font-medium transition-colors border border-slate-700"
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
              className="flex items-center gap-2 px-4 py-2 bg-blue-600 hover:bg-blue-500 text-white rounded-lg text-sm font-medium transition-colors shadow-lg shadow-blue-500/20"
            >
              <FileText className="w-4 h-4" />
              Excel
            </a>
          )}
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        {/* Receipt Image Placeholder or Real Image if available */}
        <div className="bg-slate-900 rounded-xl border border-slate-800 p-4 flex items-center justify-center min-h-[500px] lg:sticky lg:top-24 h-fit">
          <div className="relative w-full h-full min-h-[400px] bg-slate-950 rounded-lg flex items-center justify-center text-slate-600 overflow-hidden group">
             {job.file_url ? (
               /* eslint-disable-next-line @next/next/no-img-element */
               <img 
                 src={job.file_url} 
                 alt="Receipt" 
                 className="max-w-full max-h-[600px] object-contain"
               />
             ) : (
               <p className="text-slate-500">Original Receipt Image</p>
             )}
          </div>
        </div>

        {/* Extracted Data Placeholder */}
        <div className="space-y-6">
          <div className="bg-slate-900 rounded-xl border border-slate-800 p-6 space-y-6">
            <h2 className="text-lg font-semibold text-white border-b border-slate-800 pb-4 flex items-center gap-2">
              <Tag className="w-5 h-5 text-blue-400" />
              Extracted Data
            </h2>
            
            {isError ? (
              <div className="p-4 bg-red-500/10 border border-red-500/20 rounded-lg text-red-300 text-sm break-words">
                <p className="font-bold mb-2">Processing Error:</p>
                {job.error || "An unknown error occurred during processing."}
              </div>
            ) : (
              <div className="p-4 bg-blue-500/10 border border-blue-500/20 rounded-lg text-blue-300 text-sm">
                Data extraction complete. Download the Excel file to view detailed line items and totals.
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
