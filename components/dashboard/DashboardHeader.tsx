"use client";

import Link from "next/link";
import { Download, Plus, LayoutDashboard, FileText } from "lucide-react";

interface DashboardHeaderProps {
  onExport: () => void;
  onExportAccounting?: () => void;
  onAddReceipt: () => void;
}

export default function DashboardHeader({ onExport, onExportAccounting, onAddReceipt }: DashboardHeaderProps) {
  return (
    <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 mb-8">
      <div>
        <div className="flex items-center gap-2 text-sm text-slate-500 mb-1">
          <span>Organisation</span>
          <span>/</span>
          <span className="font-medium text-slate-900">Ma Société</span>
        </div>
        <h1 className="text-2xl font-bold text-slate-900 flex items-center gap-2">
          <LayoutDashboard className="w-6 h-6 text-violet-600" />
          Vue d'ensemble
        </h1>
      </div>
      
      <div className="flex gap-3">
        <div className="flex rounded-lg shadow-sm">
          <button 
            onClick={onExport}
            className="flex items-center gap-2 px-4 py-2 bg-white hover:bg-slate-50 border border-slate-200 text-slate-700 rounded-l-lg text-sm font-medium transition-colors"
            title="Export Standard"
          >
            <Download className="w-4 h-4" />
            CSV
          </button>
          <button 
            onClick={onExportAccounting}
            className="flex items-center gap-2 px-4 py-2 bg-white hover:bg-slate-50 border-t border-b border-r border-slate-200 text-slate-700 rounded-r-lg text-sm font-medium transition-colors"
            title="Export Comptabilité"
          >
            <FileText className="w-4 h-4" />
            Compta
          </button>
        </div>

        <button 
          onClick={onAddReceipt}
          className="flex items-center gap-2 px-4 py-2 bg-violet-600 hover:bg-violet-700 text-white rounded-lg text-sm font-medium transition-colors shadow-lg shadow-violet-500/20"
        >
          <Plus className="w-4 h-4" />
          Nouveau Scan
        </button>
      </div>
    </div>
  );
}
