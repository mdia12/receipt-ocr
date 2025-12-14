import { Receipt } from "@/types/receipts";
import { X, Download, RefreshCw, FileText, Loader2 } from "lucide-react";
import { useState } from "react";

const getSafeFilename = (receipt: Receipt, ext: string) => {
  const dateStr = receipt.date ? receipt.date.replace(/\//g, "-") : "nodate";
  return `receipt_${receipt.id}_${dateStr}.${ext}`;
};

const downloadReceiptAsCSV = (receipt: Receipt) => {
  const headers = ["id", "merchant", "date", "amount", "currency", "category", "status"];
  const row = [
    receipt.id,
    receipt.merchant,
    receipt.date,
    receipt.amount,
    receipt.currency,
    receipt.category,
    receipt.status
  ].map(v => v === null || v === undefined ? "" : String(v));
  
  // Add BOM for Excel UTF-8 compatibility
  const csvContent = "\uFEFF" + [
    headers.join(";"),
    row.join(";")
  ].join("\n");

  const blob = new Blob([csvContent], { type: "text/csv;charset=utf-8;" });
  const url = URL.createObjectURL(blob);
  const link = document.createElement("a");
  link.setAttribute("href", url);
  link.setAttribute("download", getSafeFilename(receipt, "csv"));
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
  
  // Revoke URL to avoid memory leaks
  setTimeout(() => URL.revokeObjectURL(url), 100);
};

const downloadReceiptAsJSON = (receipt: Receipt) => {
  const jsonContent = JSON.stringify(receipt, null, 2);
  const blob = new Blob([jsonContent], { type: "application/json" });
  const url = URL.createObjectURL(blob);
  const link = document.createElement("a");
  link.setAttribute("href", url);
  link.setAttribute("download", getSafeFilename(receipt, "json"));
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
  
  // Revoke URL
  setTimeout(() => URL.revokeObjectURL(url), 100);
};

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
  const [isFileLoading, setIsFileLoading] = useState(false);
  const [fileError, setFileError] = useState(false);

  if (!isOpen || !receipt) return null;

  const hasFile = receipt.file_url || (receipt as any).file_path || (receipt as any).original_file_url;

  const handleOpenFile = async (e: React.MouseEvent) => {
    e.preventDefault();
    setIsFileLoading(true);
    setFileError(false);
    try {
      const res = await fetch(`/api/receipts/${receipt.id}/file-url`);
      if (!res.ok) throw new Error("Failed to get file URL");
      const data = await res.json();
      if (data.url) {
        window.open(data.url, '_blank');
      } else {
        console.error("File URL not found");
        setFileError(true);
      }
    } catch (err) {
      console.error(err);
      setFileError(true);
    } finally {
      setIsFileLoading(false);
    }
  };

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
          <h2 className="text-lg font-bold text-slate-900">Détails du reçu</h2>
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
            <h3 className="text-sm font-medium text-slate-500 uppercase tracking-wider">Aperçu du document</h3>
            <div className="bg-slate-50 border border-slate-200 rounded-lg p-4 flex items-center justify-center h-48">
              {hasFile ? (
                <div className="text-center">
                  <FileText className="w-12 h-12 text-slate-300 mx-auto mb-2" />
                  <p className="text-sm text-slate-500 break-all px-4">
                    {receipt.file_url ? receipt.file_url.split('/').pop() : "Document"}
                  </p>
                  
                  <button 
                    onClick={handleOpenFile}
                    disabled={isFileLoading}
                    className="inline-flex items-center gap-2 mt-3 text-xs font-medium text-violet-600 hover:text-violet-700 hover:underline disabled:opacity-50 disabled:no-underline"
                  >
                    {isFileLoading && <Loader2 className="w-3 h-3 animate-spin" />}
                    {isFileLoading ? "Ouverture..." : "Ouvrir le fichier original"}
                  </button>
                  {fileError && (
                    <p className="text-xs text-red-500 mt-1">Erreur lors de l'ouverture du fichier</p>
                  )}
                </div>
              ) : (
                <p className="text-slate-400 text-sm">Aucun aperçu disponible</p>
              )}
            </div>
          </div>

          {/* Extracted Data */}
          <div className="space-y-4">
            <h3 className="text-sm font-medium text-slate-500 uppercase tracking-wider">Données extraites</h3>
            
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-1">
                <p className="text-xs text-slate-400">Marchand</p>
                <p className="font-medium text-slate-900">{receipt.merchant}</p>
              </div>
              <div className="space-y-1">
                <p className="text-xs text-slate-400">Date</p>
                <p className="font-medium text-slate-900">
                  {receipt.date ? new Date(receipt.date).toLocaleDateString('fr-FR') : "N/A"}
                </p>
              </div>
              <div className="space-y-1">
                <p className="text-xs text-slate-400">Montant</p>
                <p className="font-medium text-slate-900 font-mono">
                  {receipt.amount !== null && receipt.amount !== undefined 
                    ? `${receipt.amount.toFixed(2)} ${receipt.currency}`
                    : "En cours..."}
                </p>
              </div>
              <div className="space-y-1">
                <p className="text-xs text-slate-400">Catégorie</p>
                <span className="inline-flex items-center px-2 py-1 rounded text-xs font-medium bg-slate-100 text-slate-700">
                  {receipt.category || "Non catégorisé"}
                </span>
              </div>
              <div className="space-y-1">
                <p className="text-xs text-slate-400">Statut</p>
                <span className={`inline-flex items-center px-2 py-1 rounded text-xs font-medium ${
                  receipt.status === 'success' ? 'bg-green-50 text-green-700' :
                  receipt.status === 'partial' ? 'bg-yellow-50 text-yellow-700' :
                  'bg-red-50 text-red-700'
                }`}>
                  {receipt.status === 'success' ? 'Succès' : 
                   receipt.status === 'partial' ? 'Partiel' : 
                   receipt.status === 'failed' ? 'Échec' : receipt.status}
                </span>
              </div>
            </div>
          </div>

          {/* JSON Data */}
          <div className="space-y-3">
            <h3 className="text-sm font-medium text-slate-500 uppercase tracking-wider">Données brutes</h3>
            <div className="bg-slate-900 rounded-lg p-4 overflow-x-auto">
                            <pre className="text-xs text-slate-300 font-mono">
                {JSON.stringify({
                  merchant: receipt.merchant,
                  amount: receipt.amount,
                  date: receipt.date,
                  category: receipt.category
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
            Relancer l'OCR
          </button>
          <div className="flex gap-2">
            <button 
              type="button"
              onClick={() => downloadReceiptAsCSV(receipt)}
              className="flex-1 flex items-center justify-center gap-2 px-4 py-2 bg-violet-600 hover:bg-violet-700 text-white rounded-lg font-medium transition-colors shadow-sm"
            >
              <Download className="w-4 h-4" />
              CSV
            </button>
            <button 
              type="button"
              onClick={() => downloadReceiptAsJSON(receipt)}
              className="flex-1 flex items-center justify-center gap-2 px-4 py-2 bg-violet-100 hover:bg-violet-200 text-violet-700 rounded-lg font-medium transition-colors shadow-sm"
            >
              <FileText className="w-4 h-4" />
              JSON
            </button>
          </div>
        </div>

      </div>
    </div>
  );
}
