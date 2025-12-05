"use client";

import { Receipt } from "@/types/receipts";
import { Eye, RefreshCw, MoreHorizontal, FileText } from "lucide-react";

interface ReceiptsTableProps {
  receipts: Receipt[];
  loading: boolean;
  onViewDetails: (receipt: Receipt) => void;
  onReprocess: (receipt: Receipt) => void;
}

export default function ReceiptsTable({ 
  receipts, 
  loading, 
  onViewDetails,
  onReprocess 
}: ReceiptsTableProps) {
  if (loading) {
    return (
      <div className="bg-white rounded-xl border border-slate-100 shadow-sm p-12 text-center">
        <div className="animate-spin w-8 h-8 border-4 border-violet-600 border-t-transparent rounded-full mx-auto mb-4"></div>
        <p className="text-slate-500">Loading receipts...</p>
      </div>
    );
  }

  if (receipts.length === 0) {
    return (
      <div className="bg-white rounded-xl border border-slate-100 shadow-sm p-12 text-center">
        <p className="text-slate-500">No receipts found matching your criteria.</p>
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
              <th className="px-6 py-4 font-medium">Merchant</th>
              <th className="px-6 py-4 font-medium">Category</th>
              <th className="px-6 py-4 font-medium text-right">Amount</th>
              <th className="px-6 py-4 font-medium text-center">Status</th>
              <th className="px-6 py-4 font-medium text-center">Files</th>
              <th className="px-6 py-4 font-medium text-right">Actions</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100">
            {receipts.map((receipt) => (
              <tr key={receipt.id} className="hover:bg-slate-50/50 transition-colors group">
                <td className="px-6 py-4 text-slate-500 whitespace-nowrap">
                  {receipt.date ? new Date(receipt.date).toLocaleDateString('en-GB', {
                    day: '2-digit', month: 'short', year: 'numeric'
                  }) : <span className="text-slate-300">N/A</span>}
                </td>
                <td className="px-6 py-4 font-medium text-slate-900">
                  {receipt.merchant}
                </td>
                <td className="px-6 py-4">
                  <span className="px-2.5 py-1 rounded-full text-xs font-medium bg-slate-100 text-slate-600 border border-slate-200">
                    {receipt.category || "Uncategorized"}
                  </span>
                </td>
                <td className="px-6 py-4 text-right font-mono text-slate-700">
                  {receipt.amount_total?.toFixed(2)} {receipt.currency}
                </td>
                <td className="px-6 py-4 text-center">
                  <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium border ${
                    receipt.status === 'success' ? 'bg-green-50 text-green-700 border-green-100' :
                    receipt.status === 'partial' ? 'bg-yellow-50 text-yellow-700 border-yellow-100' :
                    receipt.status === 'failed' ? 'bg-red-50 text-red-700 border-red-100' :
                    'bg-slate-100 text-slate-600 border-slate-200'
                  }`}>
                    {receipt.status === 'success' && 'Success'}
                    {receipt.status === 'partial' && 'Partial'}
                    {receipt.status === 'failed' && 'Failed'}
                    {receipt.status === 'processing' && 'Processing'}
                  </span>
                </td>
                <td className="px-6 py-4 text-center">
                  {receipt.file_url && (
                    <button 
                      onClick={() => onViewDetails(receipt)}
                      className="p-1.5 text-slate-400 hover:text-violet-600 hover:bg-violet-50 rounded transition-colors"
                      title="View File"
                    >
                      <FileText className="w-4 h-4" />
                    </button>
                  )}
                </td>
                <td className="px-6 py-4 text-right">
                  <div className="flex justify-end gap-2">
                    <button 
                      onClick={() => onViewDetails(receipt)}
                      className="p-1.5 text-slate-400 hover:text-violet-600 hover:bg-violet-50 rounded transition-colors"
                      title="View Details"
                    >
                      <Eye className="w-4 h-4" />
                    </button>
                    <button 
                      onClick={() => onReprocess(receipt)}
                      className="p-1.5 text-slate-400 hover:text-blue-600 hover:bg-blue-50 rounded transition-colors"
                      title="Reprocess OCR"
                    >
                      <RefreshCw className="w-4 h-4" />
                    </button>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
