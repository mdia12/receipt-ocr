"use client";

import { useRouter } from "next/navigation";
import UploadArea from "@/components/UploadArea";
import { ArrowLeft } from "lucide-react";
import Link from "next/link";

export default function DashboardScanPage() {
  const router = useRouter();

  const handleUploadSuccess = (jobId: string) => {
    // Redirect to the receipt details page after successful upload
    router.push(`/receipts/${jobId}`);
  };

  return (
    <div className="min-h-screen bg-slate-950 text-slate-200 p-6 md:p-12">
      <div className="max-w-3xl mx-auto space-y-8">
        
        {/* Header */}
        <div className="flex items-center gap-4">
          <Link 
            href="/dashboard"
            className="p-2 bg-slate-900 hover:bg-slate-800 rounded-lg transition-colors text-slate-400 hover:text-white"
          >
            <ArrowLeft className="w-5 h-5" />
          </Link>
          <div>
            <h1 className="text-2xl font-bold text-white">Nouveau Scan</h1>
            <p className="text-slate-400 text-sm">Ajoutez un nouveau reçu à votre comptabilité</p>
          </div>
        </div>

        {/* Upload Area */}
        <div className="bg-slate-900/50 border border-slate-800 rounded-2xl p-8">
          <UploadArea onUploadSuccess={handleUploadSuccess} />
        </div>

      </div>
    </div>
  );
}
