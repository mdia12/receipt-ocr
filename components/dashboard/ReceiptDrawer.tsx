import { Receipt } from "@/types/receipts";
import { X, Download, RefreshCw, FileText } from "lucide-react";

interface ReceiptDrawerProps {
  receipt: Receipt | null;
  isOpen: boolean;
  onClose: () => void;
  onReprocess: (receipt: Receipt) => void;
}

export default function ReceiptDrawer({ 
  receipt, 
  isOpen, 
  onClose,
  onReprocess 
}: ReceiptDrawerProps) {
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
        <div className="flex items-center justify-between p-6 border-b border-slate-100">
          <h2 className="text-lg font-bold text-slate-900">Receipt Details</h2>
          <button 
            onClick={onClose}
            className="p-2 text-slate-400 hover:text-slate-600 hover:bg-slate-50 rounded-full transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Content */}
        <div className="flex-1 overflow-y-auto p-6 space-y-8">
          
          {/* Preview */}
          <div className="space-y-3">
            <h3 className="text-sm font-medium text-slate-500 uppercase tracking-wider">Document Preview</h3>
            <div className="bg-slate-50 border border-slate-200 rounded-lg p-4 flex items-center justify-center h-48">
              {receipt.file_url ? (
                <div className="text-center">
                  <FileText className="w-12 h-12 text-slate-300 mx-auto mb-2" />
                  <p className="text-sm text-slate-500 break-all px-4">{receipt.file_url.split('/').pop()}</p>
                  <a 
                    href={receipt.file_url} 
                    target="_blank" 
                    rel="noopener noreferrer"
                    className="inline-block mt-3 text-xs font-medium text-violet-600 hover:text-violet-700 hover:underline"
                  >
                    Open original file
                  </a>
                </div>
              ) : (
                <p className="text-slate-400 text-sm">No preview available</p>
              )}
            </div>
          </div>

          {/* Extracted Data */}
          <div className="space-y-4">
            <h3 className="text-sm font-medium text-slate-500 uppercase tracking-wider">Extracted Data</h3>
            
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-1">
                <p className="text-xs text-slate-400">Merchant</p>
                <p className="font-medium text-slate-900">{receipt.merchant}</p>
              </div>
              <div className="space-y-1">
                <p className="text-xs text-slate-400">Date</p>
                <p className="font-medium text-slate-900">
                  {receipt.date ? new Date(receipt.date).toLocaleDateString() : "N/A"}
                </p>
              </div>
              <div className="space-y-1">
                <p className="text-xs text-slate-400">Amount</p>
                <p className="font-medium text-slate-900 font-mono">
                  {receipt.amount_total?.toFixed(2)} {receipt.currency}
                </p>
              </div>
              <div className="space-y-1">
                <p className="text-xs text-slate-400">Category</p>
                <span className="inline-flex items-center px-2 py-1 rounded text-xs font-medium bg-slate-100 text-slate-700">
                  {receipt.category || "Uncategorized"}
                </span>
              </div>
              <div className="space-y-1">
                <p className="text-xs text-slate-400">Status</p>
                <span className={`inline-flex items-center px-2 py-1 rounded text-xs font-medium ${
                  receipt.status === 'success' ? 'bg-green-50 text-green-700' :
                  receipt.status === 'partial' ? 'bg-yellow-50 text-yellow-700' :
                  'bg-red-50 text-red-700'
                }`}>
                  {receipt.status}
                </span>
              </div>
            </div>
          </div>

          {/* JSON Data */}
          <div className="space-y-3">
            <h3 className="text-sm font-medium text-slate-500 uppercase tracking-wider">Raw Data</h3>
            <div className="bg-slate-900 rounded-lg p-4 overflow-x-auto">
              <pre className="text-xs text-slate-300 font-mono">
                {JSON.stringify({
                  merchant: receipt.merchant,
                  date: receipt.date,
                  amount: receipt.amount_total,
                  currency: receipt.currency,
                  items: [] // Placeholder
                }, null, 2)}
              </pre>
            </div>
          </div>

        </div>

        {/* Footer Actions */}
        <div className="p-6 border-t border-slate-100 bg-slate-50 space-y-3">
          <button 
            onClick={() => onReprocess(receipt)}
            className="w-full flex items-center justify-center gap-2 px-4 py-2 bg-white border border-slate-200 hover:bg-slate-50 text-slate-700 rounded-lg font-medium transition-colors shadow-sm"
          >
            <RefreshCw className="w-4 h-4" />
            Reprocess OCR
          </button>
          <button className="w-full flex items-center justify-center gap-2 px-4 py-2 bg-violet-600 hover:bg-violet-700 text-white rounded-lg font-medium transition-colors shadow-sm">
            <Download className="w-4 h-4" />
            Download CSV / JSON
          </button>
        </div>

      </div>
    </div>
  );
}
