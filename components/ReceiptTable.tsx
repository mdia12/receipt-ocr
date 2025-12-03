import Link from "next/link";
import { CheckCircle, Clock, AlertCircle, FileText, ArrowRight } from "lucide-react";
import { Receipt } from "@/types/receipt";

interface ReceiptTableProps {
  receipts: Receipt[];
}

export default function ReceiptTable({ receipts }: ReceiptTableProps) {
  if (receipts.length === 0) {
    return (
      <div className="text-center py-12 bg-slate-900/50 rounded-xl border border-slate-800 border-dashed">
        <FileText className="w-12 h-12 mx-auto mb-4 text-slate-600" />
        <h3 className="text-lg font-medium text-slate-300">No receipts yet</h3>
        <p className="text-slate-500 mt-1">Upload your first receipt to get started.</p>
      </div>
    );
  }

  return (
    <div className="bg-slate-900 rounded-xl border border-slate-800 overflow-hidden shadow-sm">
      <div className="overflow-x-auto">
        <table className="w-full text-left text-sm text-slate-400">
          <thead className="bg-slate-950 text-slate-200 uppercase font-medium text-xs tracking-wider">
            <tr>
              <th className="px-6 py-4">Date</th>
              <th className="px-6 py-4">Merchant</th>
              <th className="px-6 py-4">Amount</th>
              <th className="px-6 py-4">Status</th>
              <th className="px-6 py-4 text-right">Actions</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-800">
            {receipts.map((receipt) => (
              <tr key={receipt.id} className="hover:bg-slate-800/50 transition-colors group">
                <td className="px-6 py-4 whitespace-nowrap">{receipt.date}</td>
                <td className="px-6 py-4 font-medium text-white">{receipt.merchant}</td>
                <td className="px-6 py-4 font-mono text-slate-300">
                  {new Intl.NumberFormat('en-US', { style: 'currency', currency: receipt.currency }).format(receipt.amount)}
                </td>
                <td className="px-6 py-4">
                  <div className="flex items-center gap-2">
                    {receipt.status === "completed" && (
                      <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-medium bg-green-500/10 text-green-400 border border-green-500/20">
                        <CheckCircle className="w-3 h-3" /> Completed
                      </span>
                    )}
                    {receipt.status === "processing" && (
                      <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-medium bg-blue-500/10 text-blue-400 border border-blue-500/20">
                        <Clock className="w-3 h-3 animate-pulse" /> Processing
                      </span>
                    )}
                    {receipt.status === "failed" && (
                      <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-medium bg-red-500/10 text-red-400 border border-red-500/20">
                        <AlertCircle className="w-3 h-3" /> Failed
                      </span>
                    )}
                  </div>
                </td>
                <td className="px-6 py-4 text-right">
                  <Link
                    href={`/receipts/${receipt.id}`}
                    className="inline-flex items-center gap-1 text-blue-400 hover:text-blue-300 font-medium text-xs uppercase tracking-wide opacity-0 group-hover:opacity-100 transition-opacity"
                  >
                    View Details <ArrowRight className="w-3 h-3" />
                  </Link>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
