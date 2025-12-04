"use client";

import { Receipt } from "@/types/receipts";
import { Eye, FileText, MoreHorizontal, RefreshCw, Trash2 } from "lucide-react";
import Link from "next/link";

interface ReceiptsTableProps {
  receipts: Receipt[];
  loading: boolean;
  onViewDetails: (receipt: Receipt) => void;
  onReprocess: (receipt: Receipt) => void;
  onDelete: (receipt: Receipt) => void;
}

export default function ReceiptsTable({ 
  receipts, 
  loading, 
  onViewDetails,
  onReprocess,
  onDelete
}: ReceiptsTableProps) {
  
  const getStatusBadge = (status: string) => {
    switch (status) {
      case "success":
        return <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-green-50 text-green-700 border border-green-100">Succès</span>;
      case "partial":
        return <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-yellow-50 text-yellow-700 border border-yellow-100">Partiel</span>;
      case "failed":
        return <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-red-50 text-red-700 border border-red-100">Échec</span>;
      case "processing":
        return <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-blue-50 text-blue-700 border border-blue-100">En cours</span>;
      default:
        return <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-slate-100 text-slate-700 border border-slate-200">{status}</span>;
    }
  };

  return (
    <div className="bg-white border border-slate-200 rounded-xl overflow-hidden shadow-sm">
      <div className="overflow-x-auto">
        <table className="w-full text-left text-sm">
          <thead className="bg-slate-50 text-slate-500 border-b border-slate-200">
            <tr>
              <th className="px-6 py-3 font-medium w-32">Date</th>
              <th className="px-6 py-3 font-medium">Commerçant</th>
              <th className="px-6 py-3 font-medium">Catégorie</th>
              <th className="px-6 py-3 font-medium text-right">Montant</th>
              <th className="px-6 py-3 font-medium text-center">Statut</th>
              <th className="px-6 py-3 font-medium text-center">Fichiers</th>
              <th className="px-6 py-3 font-medium text-right">Actions</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100">
            {loading ? (
              <tr>
                <td colSpan={7} className="px-6 py-12 text-center text-slate-500">
                  Chargement des reçus...
                </td>
              </tr>
            ) : receipts.length === 0 ? (
              <tr>
                <td colSpan={7} className="px-6 py-12 text-center text-slate-500">
                  Aucun reçu trouvé.
                </td>
              </tr>
            ) : (
              receipts.map((receipt) => (
                <tr key={receipt.id} className="hover:bg-slate-50 transition-colors group">
                  <td className="px-6 py-4 text-slate-500 whitespace-nowrap font-mono text-xs">
                    {new Date(receipt.date).toLocaleDateString('fr-FR', { day: '2-digit', month: 'short', year: 'numeric' })}
                  </td>
                  <td className="px-6 py-4">
                    <div className="font-medium text-slate-900">{receipt.merchant}</div>
                  </td>
                  <td className="px-6 py-4">
                    <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-slate-100 text-slate-700 border border-slate-200">
                      {receipt.category}
                    </span>
                  </td>
                  <td className="px-6 py-4 text-right font-mono font-medium text-slate-900">
                    {receipt.amount.toFixed(2)} {receipt.currency}
                  </td>
                  <td className="px-6 py-4 text-center">
                    {getStatusBadge(receipt.status)}
                  </td>
                  <td className="px-6 py-4 text-center">
                    <Link 
                      href={`/receipts/${receipt.id}`}
                      className="inline-flex items-center justify-center p-1.5 text-slate-400 hover:text-violet-600 hover:bg-violet-50 rounded transition-colors"
                      title="Voir le détail"
                    >
                      <FileText className="w-4 h-4" />
                    </Link>
                  </td>
                  <td className="px-6 py-4 text-right">
                    <div className="flex items-center justify-end gap-2">
                      <button 
                        onClick={() => onViewDetails(receipt)}
                        className="p-1.5 text-slate-400 hover:text-blue-600 hover:bg-blue-50 rounded transition-colors"
                        title="Détails rapides"
                      >
                        <Eye className="w-4 h-4" />
                      </button>
                      <button 
                        onClick={() => onReprocess(receipt)}
                        className="p-1.5 text-slate-400 hover:text-orange-600 hover:bg-orange-50 rounded transition-colors"
                        title="Relancer OCR"
                      >
                        <RefreshCw className="w-4 h-4" />
                      </button>
                      <button 
                        onClick={() => onDelete(receipt)}
                        className="p-1.5 text-slate-400 hover:text-red-600 hover:bg-red-50 rounded transition-colors"
                        title="Supprimer"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}
