"use client";

import { Receipt } from "@/types/receipts";
import { X, Download, RefreshCw, FileText, Calendar, Tag, DollarSign } from "lucide-react";

interface ReceiptDrawerProps {
  isOpen: boolean;
  onClose: () => void;
  receipt: Receipt | null;
  onReprocess: (receipt: Receipt) => void;
}

export default function ReceiptDrawer({ isOpen, onClose, receipt, onReprocess }: ReceiptDrawerProps) {
  if (!isOpen || !receipt) return null;

  return (
    <div className="fixed inset-0 z-50 flex justify-end">
      {/* Backdrop */}
      <div 
        className="absolute inset-0 bg-slate-900/20 backdrop-blur-sm transition-opacity"
        onClick={onClose}
      ></div>

      {/* Drawer Panel */}
      <div className="relative w-full max-w-md bg-white h-full shadow-2xl flex flex-col animate-in slide-in-from-right duration-300">
        
        {/* Header */}
        <div className="p-6 border-b border-slate-100 flex items-center justify-between bg-slate-50/50">
          <div>
            <h2 className="text-lg font-bold text-slate-900">Détails du reçu</h2>
            <p className="text-sm text-slate-500 font-mono">{receipt.id}</p>
          </div>
          <button 
            onClick={onClose}
            className="p-2 text-slate-400 hover:text-slate-600 hover:bg-slate-100 rounded-full transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Content */}
        <div className="flex-1 overflow-y-auto p-6 space-y-8">
          
          {/* Preview Placeholder */}
          <div className="aspect-[3/4] bg-slate-100 rounded-xl border border-slate-200 flex items-center justify-center relative overflow-hidden group">
            {receipt.fileUrl ? (
              // eslint-disable-next-line @next/next/no-img-element
              <img 
                src={receipt.fileUrl} 
                alt="Receipt preview" 
                className="w-full h-full object-contain"
              />
            ) : (
              <div className="text-center text-slate-400">
                <FileText className="w-12 h-12 mx-auto mb-2 opacity-50" />
                <p className="text-sm">Aperçu non disponible</p>
              </div>
            )}
            <div className="absolute inset-0 bg-black/0 group-hover:bg-black/5 transition-colors flex items-center justify-center opacity-0 group-hover:opacity-100">
              <a 
                href={receipt.fileUrl} 
                target="_blank" 
                rel="noopener noreferrer"
                className="px-4 py-2 bg-white text-slate-900 rounded-lg shadow-lg text-sm font-medium transform translate-y-2 group-hover:translate-y-0 transition-all"
              >
                Ouvrir l'original
              </a>
            </div>
          </div>

          {/* Extracted Data */}
          <div className="space-y-4">
            <h3 className="text-sm font-bold text-slate-900 uppercase tracking-wider">Données extraites</h3>
            
            <div className="grid grid-cols-2 gap-4">
              <div className="p-4 bg-slate-50 rounded-xl border border-slate-100">
                <div className="flex items-center gap-2 text-slate-500 mb-1">
                  <Calendar className="w-4 h-4" />
                  <span className="text-xs font-medium">Date</span>
                </div>
                <p className="font-semibold text-slate-900">
                  {new Date(receipt.date).toLocaleDateString()}
                </p>
              </div>

              <div className="p-4 bg-slate-50 rounded-xl border border-slate-100">
                <div className="flex items-center gap-2 text-slate-500 mb-1">
                  <DollarSign className="w-4 h-4" />
                  <span className="text-xs font-medium">Montant</span>
                </div>
                <p className="font-semibold text-slate-900">
                  {receipt.amount.toFixed(2)} {receipt.currency}
                </p>
              </div>

              <div className="p-4 bg-slate-50 rounded-xl border border-slate-100 col-span-2">
                <div className="flex items-center gap-2 text-slate-500 mb-1">
                  <Tag className="w-4 h-4" />
                  <span className="text-xs font-medium">Catégorie</span>
                </div>
                <div className="flex justify-between items-center">
                  <p className="font-semibold text-slate-900">{receipt.category}</p>
                  <span className={`px-2 py-1 rounded text-xs font-medium ${
                    receipt.status === 'success' ? 'bg-green-100 text-green-700' : 
                    receipt.status === 'partial' ? 'bg-yellow-100 text-yellow-700' : 
                    'bg-red-100 text-red-700'
                  }`}>
                    {receipt.status}
                  </span>
                </div>
              </div>
            </div>
          </div>

          {/* Raw Data Preview */}
          <div className="space-y-2">
            <h3 className="text-sm font-bold text-slate-900 uppercase tracking-wider">Données brutes (JSON)</h3>
            <pre className="bg-slate-900 text-slate-300 p-4 rounded-xl text-xs overflow-x-auto font-mono">
              {JSON.stringify({
                merchant: receipt.merchant,
                date: receipt.date,
                total: receipt.amount,
                currency: receipt.currency,
                items: receipt.items || []
              }, null, 2)}
            </pre>
          </div>

        </div>

        {/* Footer Actions */}
        <div className="p-6 border-t border-slate-100 bg-slate-50/50 space-y-3">
          <button 
            onClick={() => onReprocess(receipt)}
            className="w-full flex items-center justify-center gap-2 px-4 py-3 bg-white border border-slate-200 hover:bg-slate-50 text-slate-700 rounded-xl font-medium transition-colors"
          >
            <RefreshCw className="w-4 h-4" />
            Relancer l'analyse OCR
          </button>
          <button className="w-full flex items-center justify-center gap-2 px-4 py-3 bg-violet-600 hover:bg-violet-700 text-white rounded-xl font-medium transition-colors shadow-lg shadow-violet-500/20">
            <Download className="w-4 h-4" />
            Télécharger JSON
          </button>
        </div>

      </div>
    </div>
  );
}
