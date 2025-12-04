import { DashboardStats } from "@/types/receipts";
import { Euro, FileText, PieChart, ScanLine } from "lucide-react";

interface KpiCardsProps {
  stats: DashboardStats;
}

export default function KpiCards({ stats }: KpiCardsProps) {
  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
      {/* Total Expenses */}
      <div className="bg-white dark:bg-slate-900 p-6 rounded-xl border border-slate-100 dark:border-slate-800 shadow-sm transition-colors">
        <div className="flex justify-between items-start mb-4">
          <div className="p-2 bg-violet-50 dark:bg-violet-900/20 rounded-lg">
            <Euro className="w-5 h-5 text-violet-600 dark:text-violet-400" />
          </div>
          <span className="text-xs font-medium text-green-600 dark:text-green-400 bg-green-50 dark:bg-green-900/20 px-2 py-1 rounded-full">
            +12%
          </span>
        </div>
        <p className="text-slate-500 dark:text-slate-400 text-sm font-medium">Dépenses Totales</p>
        <p className="text-2xl font-bold text-slate-900 dark:text-white mt-1">
          {stats.totalExpenses.toLocaleString('fr-FR', { style: 'currency', currency: 'EUR' })}
        </p>
      </div>

      {/* Receipts Processed */}
      <div className="bg-white dark:bg-slate-900 p-6 rounded-xl border border-slate-100 dark:border-slate-800 shadow-sm transition-colors">
        <div className="flex justify-between items-start mb-4">
          <div className="p-2 bg-blue-50 dark:bg-blue-900/20 rounded-lg">
            <FileText className="w-5 h-5 text-blue-600 dark:text-blue-400" />
          </div>
        </div>
        <p className="text-slate-500 dark:text-slate-400 text-sm font-medium">Reçus Traités</p>
        <p className="text-2xl font-bold text-slate-900 dark:text-white mt-1">
          {stats.totalReceipts}
        </p>
      </div>

      {/* Top Category */}
      <div className="bg-white dark:bg-slate-900 p-6 rounded-xl border border-slate-100 dark:border-slate-800 shadow-sm transition-colors">
        <div className="flex justify-between items-start mb-4">
          <div className="p-2 bg-orange-50 dark:bg-orange-900/20 rounded-lg">
            <PieChart className="w-5 h-5 text-orange-600 dark:text-orange-400" />
          </div>
        </div>
        <p className="text-slate-500 dark:text-slate-400 text-sm font-medium">Top Catégorie</p>
        <p className="text-2xl font-bold text-slate-900 dark:text-white mt-1 truncate">
          {stats.topCategory || "N/A"}
        </p>
      </div>

      {/* Scans This Month */}
      <div className="bg-white dark:bg-slate-900 p-6 rounded-xl border border-slate-100 dark:border-slate-800 shadow-sm transition-colors">
        <div className="flex justify-between items-start mb-4">
          <div className="p-2 bg-emerald-50 dark:bg-emerald-900/20 rounded-lg">
            <ScanLine className="w-5 h-5 text-emerald-600 dark:text-emerald-400" />
          </div>
          {stats.planLimit && (
            <span className="text-xs font-medium text-slate-500 dark:text-slate-400 bg-slate-50 dark:bg-slate-800 px-2 py-1 rounded-full">
              Limite: {stats.planLimit}
            </span>
          )}
        </div>
        <p className="text-slate-500 dark:text-slate-400 text-sm font-medium">Scans du mois</p>
        <p className="text-2xl font-bold text-slate-900 dark:text-white mt-1">
          {stats.scansThisMonth} <span className="text-sm text-slate-400 dark:text-slate-500 font-normal">/ {stats.planLimit || "∞"}</span>
        </p>
      </div>
    </div>
  );
}
