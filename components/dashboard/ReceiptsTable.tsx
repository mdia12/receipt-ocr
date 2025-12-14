"use client";

import { useState } from "react";
import { Receipt } from "@/types/receipts";
import { Eye, RefreshCw, Trash2, FileText, Loader2, MoreHorizontal } from "lucide-react";

interface ReceiptsTableProps {
  receipts: Receipt[];
  loading: boolean;
  onViewDetails: (receipt: Receipt) => void;
  onReprocess: (receipt: Receipt) => void;
  onDelete?: (receipt: Receipt) => void;
  onCategoryClick?: (category: string) => void;
}

export default function ReceiptsTable({ 
  receipts, 
  loading, 
  onViewDetails,
  onReprocess,
  onDelete,
  onCategoryClick
}: ReceiptsTableProps) {
  const [loadingFileId, setLoadingFileId] = useState<string | null>(null);

  const totalAmount = receipts.reduce((sum, r) => sum + (r.amount || 0), 0);


  const handleOpenFile = async (e: React.MouseEvent, receiptId: string) => {
    e.stopPropagation();
    setLoadingFileId(receiptId);
    try {
      const res = await fetch(`/api/receipts/${receiptId}/file-url`);
      if (!res.ok) throw new Error("Failed to get file URL");
      const data = await res.json();
      if (data.url) {
        window.open(data.url, '_blank');
      } else {
        console.error("File URL not found");
      }
    } catch (err) {
      console.error("Error opening file:", err);
    } finally {
      setLoadingFileId(null);
    }
  };

  if (loading) {
    return (
      <div className="bg-white rounded-xl border border-slate-100 shadow-sm p-12 text-center">
        <div className="animate-spin w-8 h-8 border-4 border-violet-600 border-t-transparent rounded-full mx-auto mb-4"></div>
        <p className="text-slate-500">Chargement des reçus...</p>
      </div>
    );
  }

  if (receipts.length === 0) {
    return (
      <div className="bg-white rounded-xl border border-slate-100 shadow-sm p-12 text-center">
        <p className="text-slate-500">Aucun reçu trouvé correspondant à vos critères.</p>
      </div>
    );
  }

  return (
    <div className="bg-white rounded-xl border border-slate-100 shadow-sm overflow-hidden">
      <div className="overflow-x-auto">
        <table className="w-full text-left text-sm">
          <thead className="bg-slate-50 text-slate-500 border-b border-slate-100">
            <tr>
              <th className="px-6 py-4 font-medium">Date</th>
              <th className="px-6 py-4 font-medium">Marchand</th>
              <th className="px-6 py-4 font-medium">Catégorie</th>
              <th className="px-6 py-4 font-medium text-right">Montant</th>
              <th className="px-6 py-4 font-medium text-center">Statut</th>
              <th className="px-6 py-4 font-medium text-center">Fichiers</th>
              <th className="px-6 py-4 font-medium text-right">Actions</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100">
            {receipts.map((receipt) => (
              <tr key={receipt.id} className="hover:bg-slate-50/50 transition-colors group">
                <td className="px-6 py-4 text-slate-500 whitespace-nowrap">
                  {receipt.date ? new Date(receipt.date).toLocaleDateString('fr-FR', {
                    day: '2-digit', month: 'short', year: 'numeric'
                  }) : <span className="text-slate-300">N/A</span>}
                </td>
                <td className="px-6 py-4 font-medium text-slate-900">
                  {receipt.merchant}
                </td>
                <td className="px-6 py-4">
                  <button 
                    onClick={(e) => {
                      e.stopPropagation();
                      onCategoryClick?.(receipt.category || "Uncategorized");
                    }}
                    className="px-2.5 py-1 rounded-full text-xs font-medium bg-slate-100 text-slate-600 border border-slate-200 hover:bg-slate-200 hover:border-slate-300 transition-colors cursor-pointer"
                  >
                    {receipt.category || "Non catégorisé"}
                  </button>
                </td>
                <td className="px-6 py-4 text-right font-mono text-slate-700">
                  {receipt.amount !== null && receipt.amount !== undefined ? (
                    `${receipt.amount.toFixed(2)} ${receipt.currency}`
                  ) : (
                    <span className="text-slate-400 italic text-xs">En cours...</span>
                  )}
                </td>
                <td className="px-6 py-4 text-center">
                  <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium border ${
                    receipt.status === 'success' ? 'bg-green-50 text-green-700 border-green-100' :
                    receipt.status === 'partial' ? 'bg-yellow-50 text-yellow-700 border-yellow-100' :
                    receipt.status === 'failed' ? 'bg-red-50 text-red-700 border-red-100' :
                    'bg-slate-100 text-slate-600 border-slate-200'
                  }`}>
                    {receipt.status === 'success' && 'Succès'}
                    {receipt.status === 'partial' && 'Partiel'}
                    {receipt.status === 'failed' && 'Échec'}
                    {receipt.status === 'processing' && 'Traitement'}
                  </span>
                </td>
                <td className="px-6 py-4 text-center">
                  {(receipt.file_url || (receipt as any).file_path || (receipt as any).original_file_url) && (
                    <button 
                      onClick={(e) => handleOpenFile(e, receipt.id)}
                      disabled={loadingFileId === receipt.id}
                      className="p-1.5 text-slate-400 hover:text-violet-600 hover:bg-violet-50 rounded transition-colors disabled:opacity-50"
                      title="Voir le fichier"
                    >
                      {loadingFileId === receipt.id ? (
                        <Loader2 className="w-4 h-4 animate-spin" />
                      ) : (
                        <FileText className="w-4 h-4" />
                      )}
                    </button>
                  )}
                </td>
                <td className="px-6 py-4 text-right">
                  <div className="flex justify-end gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                    <button 
                      onClick={() => onViewDetails(receipt)}
                      className="p-1.5 text-slate-400 hover:text-blue-600 hover:bg-blue-50 rounded transition-colors"
                      title="Voir les détails"
                    >
                      <Eye className="w-4 h-4" />
                    </button>
                    <button 
                      onClick={() => onReprocess(receipt)}
                      className="p-1.5 text-slate-400 hover:text-amber-600 hover:bg-amber-50 rounded transition-colors"
                      title="Relancer l'OCR"
                    >
                      <RefreshCw className="w-4 h-4" />
                    </button>
                    {onDelete && (
                      <button 
                        onClick={() => onDelete(receipt)}
                        className="p-1.5 text-slate-400 hover:text-red-600 hover:bg-red-50 rounded transition-colors"
                        title="Supprimer"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    )}
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
          <tfoot className="bg-slate-50 border-t border-slate-200 font-medium text-slate-900">
            <tr>
              <td colSpan={3} className="px-6 py-4 text-right">Total</td>
              <td className="px-6 py-4 text-right font-mono font-bold">
                {totalAmount.toFixed(2)} EUR
              </td>
              <td colSpan={3}></td>
            </tr>
          </tfoot>
        </table>
      </div>
    </div>
  );
}
