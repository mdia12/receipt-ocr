"use client";

import { useState, useRef } from "react";
import { useRouter } from "next/navigation";
import { X, Upload, FileText, Image as ImageIcon, AlertCircle, CheckCircle, Loader2 } from "lucide-react";

interface UploadModalProps {
  isOpen: boolean;
  onClose: () => void;
  onUploadSuccess: () => void;
}

export default function UploadModal({ isOpen, onClose, onUploadSuccess }: UploadModalProps) {
  const [file, setFile] = useState<File | null>(null);
  const [isDragging, setIsDragging] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const router = useRouter();

  if (!isOpen) return null;

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(true);
  };

  const handleDragLeave = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
    const droppedFile = e.dataTransfer.files[0];
    validateAndSetFile(droppedFile);
  };

  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      validateAndSetFile(e.target.files[0]);
    }
  };

  const validateAndSetFile = (file: File) => {
    setError(null);
    const validTypes = ['image/jpeg', 'image/png', 'application/pdf'];
    const maxSize = 15 * 1024 * 1024; // 15MB

    if (!validTypes.includes(file.type)) {
      setError("Format non supporté. Utilisez JPG, PNG ou PDF.");
      return;
    }

    if (file.size > maxSize) {
      setError("Fichier trop volumineux (max 15 Mo).");
      return;
    }

    setFile(file);
  };

  const handleUpload = async () => {
    if (!file) return;

    setUploading(true);
    setError(null);

    const formData = new FormData();
    formData.append("file", file);

    try {
      const res = await fetch("/api/upload", {
        method: "POST",
        body: formData,
      });

      if (!res.ok) {
        const data = await res.json();
        throw new Error(data.error || "Échec de l'upload");
      }

      onUploadSuccess();
      onClose();
      setFile(null);
      
      // Force refresh to show the new processing receipt
      router.refresh();
    } catch (err: any) {
      console.error(err);
      setError(err.message || "Une erreur est survenue.");
    } finally {
      setUploading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/50 backdrop-blur-sm animate-in fade-in duration-200">
      <div className="bg-white rounded-2xl shadow-2xl w-full max-w-md overflow-hidden">
        
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b border-slate-100">
          <h2 className="text-lg font-bold text-slate-900">Ajouter un reçu</h2>
          <button 
            onClick={onClose}
            className="p-2 text-slate-400 hover:text-slate-600 hover:bg-slate-100 rounded-full transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Content */}
        <div className="p-6 space-y-6">
          
          {/* Drop Zone */}
          <div 
            className={`border-2 border-dashed rounded-xl p-8 text-center transition-all cursor-pointer ${
              isDragging 
                ? "border-violet-500 bg-violet-50" 
                : file 
                  ? "border-green-500 bg-green-50"
                  : "border-slate-200 hover:border-violet-400 hover:bg-slate-50"
            }`}
            onDragOver={handleDragOver}
            onDragLeave={handleDragLeave}
            onDrop={handleDrop}
            onClick={() => fileInputRef.current?.click()}
          >
            <input 
              type="file" 
              ref={fileInputRef} 
              className="hidden" 
              accept=".jpg,.jpeg,.png,.pdf"
              onChange={handleFileSelect}
            />

            {file ? (
              <div className="flex flex-col items-center gap-3">
                {file.type === "application/pdf" ? (
                  <div className="p-4 bg-red-100 rounded-full text-red-600">
                    <FileText className="w-8 h-8" />
                  </div>
                ) : (
                  <div className="p-4 bg-blue-100 rounded-full text-blue-600">
                    <ImageIcon className="w-8 h-8" />
                  </div>
                )}
                <div>
                  <p className="font-medium text-slate-900">{file.name}</p>
                  <p className="text-xs text-slate-500">
                    {(file.size / 1024 / 1024).toFixed(2)} MB • {file.type === "application/pdf" ? "Document PDF" : "Image"}
                  </p>
                </div>
                <div className="flex items-center gap-1 text-xs font-medium text-green-600 bg-white px-2 py-1 rounded-full shadow-sm">
                  <CheckCircle className="w-3 h-3" /> Prêt à envoyer
                </div>
              </div>
            ) : (
              <div className="flex flex-col items-center gap-3">
                <div className="p-4 bg-slate-100 rounded-full text-slate-400">
                  <Upload className="w-8 h-8" />
                </div>
                <div>
                  <p className="font-medium text-slate-900">Cliquez ou glissez un fichier ici</p>
                  <p className="text-xs text-slate-500 mt-1">JPG, PNG ou PDF (max 15 Mo)</p>
                </div>
              </div>
            )}
          </div>

          {/* Error Message */}
          {error && (
            <div className="flex items-start gap-3 p-3 bg-red-50 text-red-700 rounded-lg text-sm">
              <AlertCircle className="w-5 h-5 shrink-0 mt-0.5" />
              <p>{error}</p>
            </div>
          )}

          {/* Actions */}
          <div className="flex gap-3">
            <button 
              onClick={onClose}
              className="flex-1 px-4 py-2 text-sm font-medium text-slate-700 bg-white border border-slate-300 rounded-lg hover:bg-slate-50 transition-colors"
            >
              Annuler
            </button>
            <button 
              onClick={handleUpload}
              disabled={!file || uploading}
              className="flex-1 px-4 py-2 text-sm font-medium text-white bg-violet-600 rounded-lg hover:bg-violet-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
            >
              {uploading ? (
                <>
                  <Loader2 className="w-4 h-4 animate-spin" />
                  Traitement...
                </>
              ) : (
                "Scanner le reçu"
              )}
            </button>
          </div>

        </div>
      </div>
    </div>
  );
}
