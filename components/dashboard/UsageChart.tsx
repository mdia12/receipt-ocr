import { BarChart3 } from "lucide-react";

export default function UsageChart() {
  return (
    <div className="bg-white p-6 rounded-xl border border-slate-100 shadow-sm h-full flex flex-col items-center justify-center text-center min-h-[200px]">
      <div className="p-3 bg-slate-50 rounded-full mb-3">
        <BarChart3 className="w-6 h-6 text-slate-400" />
      </div>
      <h3 className="text-slate-900 font-medium mb-1">Graphique des dépenses</h3>
      <p className="text-slate-500 text-sm">Bientôt disponible : visualisez vos dépenses mensuelles.</p>
    </div>
  );
}
