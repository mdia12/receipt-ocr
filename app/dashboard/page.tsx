import Link from "next/link";
import { FileText, Plus, Clock, CheckCircle, AlertCircle } from "lucide-react";

// Mock data
const receipts = [
  { id: "1", date: "2023-10-25", merchant: "Uber", amount: "$24.50", status: "completed" },
  { id: "2", date: "2023-10-26", merchant: "Starbucks", amount: "$12.90", status: "processing" },
  { id: "3", date: "2023-10-27", merchant: "Amazon AWS", amount: "$145.00", status: "failed" },
];

export default function DashboardPage() {
  return (
    <div className="space-y-8">
      <div className="flex items-center justify-between">
        <h1 className="text-3xl font-bold text-white">Dashboard</h1>
        <button className="flex items-center gap-2 px-4 py-2 bg-blue-600 hover:bg-blue-500 text-white rounded-lg transition-colors">
          <Plus className="w-4 h-4" />
          <span>Upload Receipt</span>
        </button>
      </div>

      <div className="bg-slate-900 rounded-xl border border-slate-800 overflow-hidden">
        <div className="p-6 border-b border-slate-800">
          <h2 className="text-lg font-semibold text-white">Recent Receipts</h2>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full text-left text-sm text-slate-400">
            <thead className="bg-slate-950 text-slate-200 uppercase font-medium">
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
                <tr key={receipt.id} className="hover:bg-slate-800/50 transition-colors">
                  <td className="px-6 py-4">{receipt.date}</td>
                  <td className="px-6 py-4 font-medium text-white">{receipt.merchant}</td>
                  <td className="px-6 py-4">{receipt.amount}</td>
                  <td className="px-6 py-4">
                    <div className="flex items-center gap-2">
                      {receipt.status === "completed" && (
                        <span className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-xs font-medium bg-green-500/10 text-green-400">
                          <CheckCircle className="w-3 h-3" /> Completed
                        </span>
                      )}
                      {receipt.status === "processing" && (
                        <span className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-xs font-medium bg-blue-500/10 text-blue-400">
                          <Clock className="w-3 h-3" /> Processing
                        </span>
                      )}
                      {receipt.status === "failed" && (
                        <span className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-xs font-medium bg-red-500/10 text-red-400">
                          <AlertCircle className="w-3 h-3" /> Failed
                        </span>
                      )}
                    </div>
                  </td>
                  <td className="px-6 py-4 text-right">
                    <Link
                      href={`/receipts/${receipt.id}`}
                      className="text-blue-400 hover:text-blue-300 font-medium"
                    >
                      View
                    </Link>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
        {receipts.length === 0 && (
          <div className="p-12 text-center text-slate-500">
            <FileText className="w-12 h-12 mx-auto mb-4 opacity-20" />
            <p>No receipts found. Upload one to get started.</p>
          </div>
        )}
      </div>
    </div>
  );
}
