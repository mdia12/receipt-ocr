"use client";

import { useRouter } from "next/navigation";
import Link from "next/link";
import { ArrowLeft } from "lucide-react";
import UploadArea from "@/components/UploadArea";

export default function ScanPage() {
  const router = useRouter();

  return (
    <div className="min-h-[calc(100vh-4rem)] bg-slate-50 p-4 md:p-8">
      <div className="max-w-3xl mx-auto space-y-8">
        
        {/* Header */}
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-4">
            <Link
              href="/dashboard"
              className="p-2 text-slate-400 hover:text-slate-600 hover:bg-slate-100 rounded-lg transition-colors"
            >
              <ArrowLeft className="w-6 h-6" />
            </Link>
            <div>
              <h1 className="text-2xl font-bold text-slate-900">
                Nouveau Scan
              </h1>
              <p className="text-slate-500 text-sm">
                Ajoutez un nouveau reçu ou une facture
              </p>
            </div>
          </div>
        </div>

        {/* Upload Section */}
        <div className="bg-white rounded-2xl border border-slate-200 shadow-sm p-6 md:p-10">
          <div className="text-center mb-8">
            <h2 className="text-lg font-semibold text-slate-900 mb-2">
              Importez votre document
            </h2>
            <p className="text-slate-500 max-w-md mx-auto">
              Nous acceptons les images (JPG, PNG) et les fichiers PDF. L'IA extraira automatiquement les données.
            </p>
          </div>
          
          <UploadArea onUploadSuccess={(jobId) => router.push(`/receipts/${jobId}`)} />
        </div>

        {/* Tips */}
        <div className="grid md:grid-cols-3 gap-4 text-center">
          <div className="p-4 rounded-xl bg-blue-50 border border-blue-100">
            <p className="font-medium text-blue-900 text-sm mb-1">Photo claire</p>
            <p className="text-xs text-blue-700">Assurez-vous que le texte est lisible et bien éclairé.</p>
          </div>
          <div className="p-4 rounded-xl bg-purple-50 border border-purple-100">
            <p className="font-medium text-purple-900 text-sm mb-1">Un seul reçu</p>
            <p className="text-xs text-purple-700">Un document par fichier pour une meilleure précision.</p>
          </div>
          <div className="p-4 rounded-xl bg-emerald-50 border border-emerald-100">
            <p className="font-medium text-emerald-900 text-sm mb-1">Format standard</p>
            <p className="text-xs text-emerald-700">Privilégiez les formats A4 ou tickets de caisse.</p>
          </div>
        </div>

      </div>
    </div>
  );
}
