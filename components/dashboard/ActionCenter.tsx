import { Download, Plus, Bell, Zap } from "lucide-react";

interface ActionCenterProps {
  onExport: () => void;
  onAddReceipt: () => void;
}

export default function ActionCenter({ onExport, onAddReceipt }: ActionCenterProps) {
  return (
    <div className="bg-white p-6 rounded-xl border border-slate-100 shadow-sm">
      <div className="flex items-center gap-2 mb-6">
        <div className="p-2 bg-slate-100 rounded-lg">
          <Zap className="w-5 h-5 text-slate-600" />
        </div>
        <h3 className="font-semibold text-slate-900">Actions Rapides</h3>
      </div>

      <div className="space-y-3">
        <button 
          onClick={onAddReceipt}
          className="w-full flex items-center justify-between p-3 rounded-lg border border-slate-200 hover:border-violet-500 hover:bg-violet-50 transition-all group"
        >
          <div className="flex items-center gap-3">
            <div className="p-2 bg-violet-100 text-violet-600 rounded-md group-hover:bg-violet-200 transition-colors">
              <Plus className="w-4 h-4" />
            </div>
            <div className="text-left">
              <p className="text-sm font-medium text-slate-900">Ajouter un reçu</p>
              <p className="text-xs text-slate-500">Scanner ou importer</p>
            </div>
          </div>
        </button>

        <button 
          onClick={onExport}
          className="w-full flex items-center justify-between p-3 rounded-lg border border-slate-200 hover:border-blue-500 hover:bg-blue-50 transition-all group"
        >
          <div className="flex items-center gap-3">
            <div className="p-2 bg-blue-100 text-blue-600 rounded-md group-hover:bg-blue-200 transition-colors">
              <Download className="w-4 h-4" />
            </div>
            <div className="text-left">
              <p className="text-sm font-medium text-slate-900">Exporter les données</p>
              <p className="text-xs text-slate-500">Format CSV ou Excel</p>
            </div>
          </div>
        </button>

        <button 
          className="w-full flex items-center justify-between p-3 rounded-lg border border-slate-200 hover:border-amber-500 hover:bg-amber-50 transition-all group"
        >
          <div className="flex items-center gap-3">
            <div className="p-2 bg-amber-100 text-amber-600 rounded-md group-hover:bg-amber-200 transition-colors">
              <Bell className="w-4 h-4" />
            </div>
            <div className="text-left">
              <p className="text-sm font-medium text-slate-900">Alertes Budget</p>
              <p className="text-xs text-slate-500">Configurer les notifications</p>
            </div>
          </div>
          <span className="text-[10px] font-bold bg-amber-100 text-amber-700 px-2 py-0.5 rounded-full uppercase tracking-wide">
            Premium
          </span>
        </button>
      </div>
    </div>
  );
}
