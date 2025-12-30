"use client";

import { useState, useRef } from "react";
import { UploadCloud, File as FileIcon, X, Loader2 } from "lucide-react";

interface UploadAreaProps {
  onUploadSuccess?: (jobId: string) => void;
}

export default function UploadArea({ onUploadSuccess }: UploadAreaProps) {
  const [isDragging, setIsDragging] = useState(false);
  const [file, setFile] = useState<File | null>(null);
  const [isUploading, setIsUploading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

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
    
    if (e.dataTransfer.files && e.dataTransfer.files.length > 0) {
      const droppedFile = e.dataTransfer.files[0];
      validateAndSetFile(droppedFile);
    }
  };

  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files.length > 0) {
      validateAndSetFile(e.target.files[0]);
    }
  };

  const validateAndSetFile = (file: File) => {
    const validTypes = ['image/jpeg', 'image/png', 'application/pdf'];
    if (!validTypes.includes(file.type)) {
      setError("Veuillez télécharger un fichier JPG, PNG ou PDF.");
      return;
    }
    if (file.size > 5 * 1024 * 1024) { // 5MB limit
      setError("La taille du fichier doit être inférieure à 5 Mo.");
      return;
    }
    
    setError(null);
    setFile(file);
  };

  const handleUpload = async () => {
    if (!file) return;

    setIsUploading(true);
    setError(null);

    const formData = new FormData();
    formData.append("file", file);

    try {
      const response = await fetch("/api/upload", {
        method: "POST",
        body: formData,
      });

      if (!response.ok) {
        throw new Error("Upload failed");
      }

      const data = await response.json();
      if (data.success && onUploadSuccess) {
        onUploadSuccess(data.jobId);
        setFile(null); // Reset after success
      }
    } catch (err) {
      setError("Échec du téléchargement. Veuillez réessayer.");
      console.error(err);
    } finally {
      setIsUploading(false);
    }
  };

  return (
    <div className="w-full max-w-2xl mx-auto">
      {!file ? (
        <div
          onDragOver={handleDragOver}
          onDragLeave={handleDragLeave}
          onDrop={handleDrop}
          onClick={() => fileInputRef.current?.click()}
          className={`
            relative border-2 border-dashed rounded-xl p-6 md:p-8 transition-all cursor-pointer
            flex flex-col items-center justify-center text-center space-y-4
            ${isDragging 
              ? "border-blue-500 bg-blue-50" 
              : "border-slate-300 bg-slate-50 hover:border-slate-400 hover:bg-slate-100"
            }
          `}
        >
          <input
            type="file"
            ref={fileInputRef}
            onChange={handleFileSelect}
            className="hidden"
            accept=".jpg,.jpeg,.png,.pdf"
            capture="environment"
          />
          <div className={`p-4 rounded-full ${isDragging ? "bg-blue-100" : "bg-white shadow-sm border border-slate-200"}`}>
            <UploadCloud className={`w-8 h-8 ${isDragging ? "text-blue-600" : "text-slate-400"}`} />
          </div>
          <div>
            <p className="text-base md:text-lg font-medium text-slate-900">
              {isDragging ? "Déposez le fichier ici" : "Prenez une photo ou déposez votre reçu"}
            </p>
            <p className="text-sm text-slate-500 mt-1">
              ou cliquez pour parcourir (JPG, PNG, PDF max 5Mo)
            </p>
          </div>
        </div>
      ) : (
        <div className="bg-white border border-slate-200 rounded-xl p-4 md:p-6 shadow-sm">
          <div className="flex items-start justify-between mb-6">
            <div className="flex items-start gap-3 overflow-hidden">
              <div className="p-2 bg-blue-50 rounded-lg flex-shrink-0 mt-1">
                <FileIcon className="w-6 h-6 text-blue-600" />
              </div>
              <div className="min-w-0">
                <p className="font-medium text-slate-900 break-all">{file.name}</p>
                <p className="text-xs text-slate-500">{(file.size / 1024).toFixed(1)} KB</p>
              </div>
            </div>
            <button 
              onClick={() => setFile(null)}
              className="p-1 hover:bg-slate-100 rounded-full text-slate-400 hover:text-slate-600 flex-shrink-0 ml-2 mt-1"
              disabled={isUploading}
            >
              <X className="w-5 h-5" />
            </button>
          </div>

          {error && (
            <div className="mb-4 p-3 bg-red-50 border border-red-200 rounded-lg text-sm text-red-600">
              {error}
            </div>
          )}

          <button
            onClick={handleUpload}
            disabled={isUploading}
            className="w-full py-2.5 bg-blue-600 hover:bg-blue-700 text-white font-semibold rounded-lg transition-colors flex items-center justify-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed shadow-sm"
          >
            {isUploading ? (
              <>
                <Loader2 className="w-4 h-4 animate-spin" />
                Traitement en cours...
              </>
            ) : (
              "Traiter le reçu"
            )}
          </button>
        </div>
      )}
    </div>
  );
}
