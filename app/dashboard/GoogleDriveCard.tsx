"use client";

import { useEffect, useState } from "react";
import { HardDrive } from "lucide-react";

export function GoogleDriveCard() {
  const [connected, setConnected] = useState<boolean | null>(null);

  useEffect(() => {
    const checkStatus = async () => {
      try {
        const res = await fetch("/api/drive/status", { cache: "no-store" });
        const data = await res.json();
        console.log("Drive status response:", data);
        setConnected(data.connected === true);
      } catch (e) {
        console.error("Drive status UI error:", e);
        setConnected(false);
      }
    };

    // Initial check
    checkStatus();

    // Secondary check to handle race conditions after OAuth redirect
    const timer = setTimeout(() => {
      checkStatus();
    }, 1000);

    return () => clearTimeout(timer);
  }, []);

  const label =
    connected === null
      ? "Vérification..."
      : connected
      ? "Connecté"
      : "Non connecté - Connecter Google Drive";

  const handleConnectClick = () => {
    window.location.href = "/api/auth/google/init";
  };

  return (
    <div className="bg-white p-6 rounded-xl border border-slate-200 shadow-sm">
      <div className="flex items-center gap-3 mb-4">
        <div className={`p-2 rounded-lg ${connected ? "bg-green-50" : "bg-blue-50"}`}>
          <HardDrive className={`w-6 h-6 ${connected ? "text-green-600" : "text-blue-600"}`} />
        </div>
        <div>
          <h3 className="font-semibold text-slate-900">Google Drive</h3>
          <p className="text-sm text-slate-500">
            {connected ? "Synchro active" : "Synchronisation automatique"}
          </p>
        </div>
      </div>
      <p className="text-sm text-slate-600 mb-4">
        {connected 
          ? "Vos reçus sont automatiquement synchronisés dans le dossier 'NovaReceipt' de votre Google Drive."
          : "Connectez votre Google Drive pour sauvegarder automatiquement tous vos reçus scannés dans un dossier dédié."
        }
      </p>
      {connected ? (
        <div className="w-full flex items-center justify-center gap-2 px-4 py-2.5 bg-green-50 border border-green-200 text-green-700 font-medium rounded-lg">
          <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
          </svg>
          {label}
        </div>
      ) : (
        <button 
          onClick={handleConnectClick}
          disabled={connected === null}
          className="w-full flex items-center justify-center gap-2 px-4 py-2.5 bg-red-50 border border-red-200 hover:bg-red-100 text-red-700 font-medium rounded-lg transition-colors disabled:opacity-50"
        >
          <svg className="w-5 h-5" viewBox="0 0 24 24">
            <path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" fill="#4285F4" />
            <path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" fill="#34A853" />
            <path d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" fill="#FBBC05" />
            <path d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" fill="#EA4335" />
          </svg>
          {label}
        </button>
      )}
    </div>
  );
}
