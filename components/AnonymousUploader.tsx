"use client";

import { useState, useRef } from "react";
import { useAnonymousQuota } from "@/hooks/useAnonymousQuota";
import { Upload, Loader2, AlertCircle, CheckCircle, FileText } from "lucide-react";
import Link from "next/link";

export default function AnonymousUploader() {
  const { isAllowed, timeRemaining, recordScan } = useAnonymousQuota();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [result, setResult] = useState<any | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL;

  console.log("API Base URL:", API_BASE_URL);

  const handleFileSelect = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (!isAllowed) {
      setError(`You have reached the anonymous limit. Please try again in ${timeRemaining} or create a free account.`);
      return;
    }

    setLoading(true);
    setError(null);
    setResult(null);

    const formData = new FormData();
    formData.append("file", file);

    try {
      // Use direct backend URL to bypass Vercel proxy issues
      const res = await fetch(`${API_BASE_URL}/api/py/anonymous/scan`, {
        method: "POST",
        body: formData,
      });

      if (!res.ok) {
        const errData = await res.json().catch(() => ({}));
        throw new Error(errData.error || `Upload failed with status ${res.status}`);
      }

      const data = await res.json();
      if (data.error) {
        throw new Error(data.error);
      }

      setResult(data);
      recordScan(); // Update quota
    } catch (err: any) {
      console.error(err);
      setError(err.message || "An error occurred during scanning.");
    } finally {
      setLoading(false);
      // Reset file input
      if (fileInputRef.current) {
        fileInputRef.current.value = "";
      }
    }
  };

  const triggerFileInput = () => {
    if (!isAllowed) {
      setError(`You have reached the anonymous limit. Please try again in ${timeRemaining} or create a free account.`);
      return;
    }
    fileInputRef.current?.click();
  };

  return (
    <div className="w-full max-w-2xl mx-auto bg-white/50 backdrop-blur-sm border border-slate-200 rounded-xl p-6 md:p-8 shadow-sm">
      <div className="text-center space-y-4">
        <h2 className="text-2xl font-bold text-slate-900">Try NovaReceipt for Free</h2>
        <p className="text-slate-600">
          Scan one receipt instantly without signing up.
        </p>

        {!isAllowed && (
          <div className="bg-red-50 border border-red-200 text-red-600 p-4 rounded-lg flex items-start gap-3 text-left text-sm">
            <AlertCircle className="w-5 h-5 shrink-0 mt-0.5" />
            <div>
              <p className="font-medium">Daily Limit Reached</p>
              <p className="mt-1">
                You can scan another receipt in {timeRemaining}. 
                <Link href="/signup" className="text-blue-600 hover:underline ml-1">
                  Create a free account
                </Link> to unlock 20 scans/day.
              </p>
            </div>
          </div>
        )}

        {error && !loading && (
           <div className="bg-red-50 border border-red-200 text-red-600 p-4 rounded-lg flex items-center gap-3 text-left text-sm">
             <AlertCircle className="w-5 h-5 shrink-0" />
             {error}
           </div>
        )}

        <div className="flex justify-center pt-4">
          <input
            type="file"
            ref={fileInputRef}
            onChange={handleFileSelect}
            accept="image/*,.pdf"
            className="hidden"
          />
          
          <button
            onClick={triggerFileInput}
            disabled={loading}
            className={`
              flex items-center gap-2 px-8 py-4 rounded-full font-semibold text-lg transition-all shadow-lg
              ${loading 
                ? "bg-slate-100 text-slate-400 cursor-not-allowed" 
                : "bg-blue-600 hover:bg-blue-500 text-white shadow-blue-500/25 hover:shadow-blue-500/40 hover:-translate-y-0.5"
              }
            `}
          >
            {loading ? (
              <>
                <Loader2 className="w-5 h-5 animate-spin" />
                Processing...
              </>
            ) : (
              <>
                <Upload className="w-5 h-5" />
                Try Now - No Sign Up
              </>
            )}
          </button>
        </div>
        <p className="text-xs text-slate-500">
          Supports JPG, PNG, PDF. Max 5MB.
        </p>
      </div>

      {/* Result Display */}
      {result && (
        <div className="mt-8 animate-in fade-in slide-in-from-bottom-4 duration-500">
          <div className="bg-white border border-slate-200 rounded-lg overflow-hidden shadow-md">
            <div className="bg-slate-50 px-4 py-3 border-b border-slate-200 flex items-center justify-between">
              <h3 className="font-medium text-slate-900 flex items-center gap-2">
                <CheckCircle className="w-4 h-4 text-green-500" />
                Scan Results
              </h3>
              <span className="text-xs bg-blue-50 text-blue-600 px-2 py-1 rounded border border-blue-100">
                Confidence: {(result.confidence * 100).toFixed(0)}%
              </span>
            </div>
            <div className="p-4 grid gap-4 sm:grid-cols-2 text-sm">
              <div>
                <p className="text-slate-500 text-xs uppercase tracking-wider mb-1">Merchant</p>
                <p className="text-slate-900 font-medium text-lg">{result.merchant}</p>
              </div>
              <div>
                <p className="text-slate-500 text-xs uppercase tracking-wider mb-1">Total Amount</p>
                <p className="text-slate-900 font-medium text-lg font-mono">
                  {result.amount_total?.toFixed(2)} {result.currency}
                </p>
              </div>
              <div>
                <p className="text-slate-500 text-xs uppercase tracking-wider mb-1">Date</p>
                <p className="text-slate-700">{result.date}</p>
              </div>
              <div>
                <p className="text-slate-500 text-xs uppercase tracking-wider mb-1">Category</p>
                <span className="inline-block px-2 py-1 rounded bg-slate-100 text-slate-700 border border-slate-200 text-xs">
                  {result.category}
                </span>
              </div>
            </div>
            
            {/* Items */}
            {result.items && result.items.length > 0 && (
              <div className="border-t border-slate-200 p-4 bg-slate-50/50">
                <p className="text-slate-500 text-xs uppercase tracking-wider mb-3">Line Items</p>
                <div className="space-y-2">
                  {result.items.map((item: any, idx: number) => (
                    <div key={idx} className="flex justify-between text-slate-700 text-xs">
                      <span>{item.description}</span>
                      <span className="font-mono">{item.amount?.toFixed(2)}</span>
                    </div>
                  ))}
                </div>
              </div>
            )}

            <div className="bg-slate-50 p-4 text-center border-t border-slate-200">
              <p className="text-slate-600 text-sm mb-3">
                Want to save this receipt and export to Excel?
              </p>
              <Link 
                href="/signup"
                className="inline-flex items-center gap-2 text-blue-600 hover:text-blue-500 font-medium text-sm hover:underline"
              >
                Create Free Account <ArrowUpRight className="w-3 h-3" />
              </Link>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

function ArrowUpRight({ className }: { className?: string }) {
  return (
    <svg 
      xmlns="http://www.w3.org/2000/svg" 
      viewBox="0 0 24 24" 
      fill="none" 
      stroke="currentColor" 
      strokeWidth="2" 
      strokeLinecap="round" 
      strokeLinejoin="round" 
      className={className}
    >
      <path d="M7 7h10v10" />
      <path d="M7 17 17 7" />
    </svg>
  );
}
