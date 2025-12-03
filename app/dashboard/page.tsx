"use client";

import { useState } from "react";
import { Plus, X } from "lucide-react";
import ReceiptTable from "@/components/ReceiptTable";
import UploadArea from "@/components/UploadArea";
import { Receipt } from "@/types/receipt";

// Mock data
const initialReceipts: Receipt[] = [
  { id: "1", date: "2023-10-25", merchant: "Uber", amount: 24.50, currency: "USD", status: "completed" },
  { id: "2", date: "2023-10-26", merchant: "Starbucks", amount: 12.90, currency: "USD", status: "processing" },
  { id: "3", date: "2023-10-27", merchant: "Amazon AWS", amount: 145.00, currency: "USD", status: "failed" },
];

export default function DashboardPage() {
  const [showUpload, setShowUpload] = useState(false);
  const [receipts, setReceipts] = useState<Receipt[]>(initialReceipts);

  const handleUploadSuccess = (jobId: string) => {
    // Add a new processing receipt to the list
    const newReceipt: Receipt = {
      id: jobId,
      date: new Date().toISOString().split('T')[0],
      merchant: "Processing...",
      amount: 0,
      currency: "USD",
      status: "processing"
    };
    
    setReceipts([newReceipt, ...receipts]);
    setShowUpload(false);
  };

  return (
    <div className="space-y-8">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-white">Dashboard</h1>
          <p className="text-slate-400 mt-1">Manage and track your receipt processing.</p>
        </div>
        <button 
          onClick={() => setShowUpload(!showUpload)}
          className={`
            flex items-center gap-2 px-4 py-2 rounded-lg transition-colors font-medium
            ${showUpload 
              ? "bg-slate-800 text-slate-300 hover:bg-slate-700" 
              : "bg-blue-600 text-white hover:bg-blue-500"
            }
          `}
        >
          {showUpload ? (
            <>
              <X className="w-4 h-4" /> Cancel
            </>
          ) : (
            <>
              <Plus className="w-4 h-4" /> Upload Receipt
            </>
          )}
        </button>
      </div>

      {/* Upload Section */}
      {showUpload && (
        <div className="bg-slate-900/50 border border-slate-800 rounded-xl p-8 animate-in fade-in slide-in-from-top-4 duration-200">
          <div className="max-w-xl mx-auto">
            <h2 className="text-xl font-semibold text-white text-center mb-6">Upload New Receipt</h2>
            <UploadArea onUploadSuccess={handleUploadSuccess} />
          </div>
        </div>
      )}

      {/* Receipts List */}
      <div>
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-lg font-semibold text-white">Recent Receipts</h2>
          <div className="text-sm text-slate-500">
            Showing {receipts.length} receipts
          </div>
        </div>
        <ReceiptTable receipts={receipts} />
      </div>
    </div>
  );
}
