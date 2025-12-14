import { useState } from "react";
import { DashboardStats } from "@/types/receipts";
import { Euro, FileText, PieChart, ScanLine, TrendingUp, AlertCircle, Wallet, Pencil, Check, X } from "lucide-react";

interface KpiCardsProps {
  stats: DashboardStats;
  onUpdateBudget?: (newBudget: number) => void;
}

export default function KpiCards({ stats, onUpdateBudget }: KpiCardsProps) {
  const [isEditingBudget, setIsEditingBudget] = useState(false);
  const [tempBudget, setTempBudget] = useState(stats.monthlyBudget.toString());

  const handleSaveBudget = () => {
    const val = parseFloat(tempBudget);
    if (!isNaN(val) && val > 0) {
      onUpdateBudget?.(val);
      setIsEditingBudget(false);
    }
  };

  const handleCancelBudget = () => {
    setTempBudget(stats.monthlyBudget.toString());
    setIsEditingBudget(false);
  };

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
      {/* Total Expenses */}
      <div className="bg-white p-6 rounded-xl border border-slate-100 shadow-sm hover:shadow-md transition-shadow">
        <div className="flex justify-between items-start mb-4">
          <div className="p-2 bg-violet-50 rounded-lg">
            <Euro className="w-5 h-5 text-violet-600" />
          </div>
          <span className="text-xs font-medium text-green-600 bg-green-50 px-2 py-1 rounded-full flex items-center gap-1">
            <TrendingUp className="w-3 h-3" /> +12%
          </span>
        </div>
        <p className="text-slate-500 text-sm font-medium">Dépenses Totales</p>
        <p className="text-2xl font-bold text-slate-900 mt-1">
          {stats.totalExpenses.toLocaleString('fr-FR', { style: 'currency', currency: 'EUR' })}
        </p>
        <p className="text-xs text-slate-400 mt-2">
          +1,240.50€ par rapport au mois dernier
        </p>
      </div>

      {/* Average Expense */}
      <div className="bg-white p-6 rounded-xl border border-slate-100 shadow-sm hover:shadow-md transition-shadow">
        <div className="flex justify-between items-start mb-4">
          <div className="p-2 bg-blue-50 rounded-lg">
            <Wallet className="w-5 h-5 text-blue-600" />
          </div>
          <span className="text-xs font-medium text-slate-600 bg-slate-50 px-2 py-1 rounded-full flex items-center gap-1">
            Stable
          </span>
        </div>
        <p className="text-slate-500 text-sm font-medium">Moyenne / Reçu</p>
        <p className="text-2xl font-bold text-slate-900 mt-1">
          {stats.averageExpense.toLocaleString('fr-FR', { style: 'currency', currency: 'EUR' })}
        </p>
        <p className="text-xs text-slate-400 mt-2">
          Basé sur {stats.totalReceipts} reçus traités
        </p>
      </div>

      {/* Monthly Budget */}
      <div className="bg-white p-6 rounded-xl border border-slate-100 shadow-sm hover:shadow-md transition-shadow relative group">
        <div className="flex justify-between items-start mb-4">
          <div className={`p-2 rounded-lg ${stats.budgetUsage > 80 ? 'bg-red-50' : 'bg-emerald-50'}`}>
            <PieChart className={`w-5 h-5 ${stats.budgetUsage > 80 ? 'text-red-600' : 'text-emerald-600'}`} />
          </div>
          {stats.budgetUsage > 80 && (
            <span className="text-xs font-medium text-red-600 bg-red-50 px-2 py-1 rounded-full flex items-center gap-1">
              <AlertCircle className="w-3 h-3" /> Attention
            </span>
          )}
          {!isEditingBudget && onUpdateBudget && (
            <button 
              onClick={() => {
                setTempBudget(stats.monthlyBudget.toString());
                setIsEditingBudget(true);
              }}
              className="absolute top-6 right-6 p-1.5 text-slate-400 hover:text-violet-600 hover:bg-violet-50 rounded-lg transition-colors opacity-0 group-hover:opacity-100"
              title="Modifier le budget"
            >
              <Pencil className="w-4 h-4" />
            </button>
          )}
        </div>
        <p className="text-slate-500 text-sm font-medium">Budget Mensuel</p>
        <div className="mt-2">
          <div className="flex justify-between text-xs mb-1">
            <span className="font-bold text-slate-900">{stats.budgetUsage.toFixed(0)}% utilisé</span>
            <span className="text-slate-500 font-medium">
              Reste {(stats.monthlyBudget - (stats.totalExpenses || 0)).toLocaleString('fr-FR', { style: 'currency', currency: 'EUR', maximumFractionDigits: 0 })}
            </span>
          </div>
          <div className="w-full bg-slate-100 rounded-full h-2 overflow-hidden">
            <div 
              className={`h-full rounded-full transition-all duration-500 ${
                stats.budgetUsage > 90 ? 'bg-red-500' : 
                stats.budgetUsage > 75 ? 'bg-orange-500' : 'bg-emerald-500'
              }`}
              style={{ width: `${Math.min(stats.budgetUsage, 100)}%` }}
            ></div>
          </div>
          
          {isEditingBudget ? (
            <div className="mt-2 flex items-center gap-2">
              <input
                type="number"
                value={tempBudget}
                onChange={(e) => setTempBudget(e.target.value)}
                className="w-24 px-2 py-1 text-sm border border-slate-300 rounded focus:outline-none focus:border-violet-500"
                autoFocus
              />
              <button onClick={handleSaveBudget} className="p-1 text-green-600 hover:bg-green-50 rounded">
                <Check className="w-4 h-4" />
              </button>
              <button onClick={handleCancelBudget} className="p-1 text-red-600 hover:bg-red-50 rounded">
                <X className="w-4 h-4" />
              </button>
            </div>
          ) : (
            <p className="text-xs text-slate-400 mt-2">
              Sur un budget de {stats.monthlyBudget.toLocaleString('fr-FR', { style: 'currency', currency: 'EUR' })}
            </p>
          )}
        </div>
      </div>

      {/* Scans This Month */}
      <div className="bg-white p-6 rounded-xl border border-slate-100 shadow-sm hover:shadow-md transition-shadow">
        <div className="flex justify-between items-start mb-4">
          <div className="p-2 bg-indigo-50 rounded-lg">
            <ScanLine className="w-5 h-5 text-indigo-600" />
          </div>
          {stats.planLimit && (
            <span className="text-xs font-medium text-slate-500 bg-slate-50 px-2 py-1 rounded-full">
              Forfait Pro
            </span>
          )}
        </div>
        <p className="text-slate-500 text-sm font-medium">Scans ce mois</p>
        <p className="text-2xl font-bold text-slate-900 mt-1">
          {stats.scansThisMonth} <span className="text-sm text-slate-400 font-normal">/ {stats.planLimit || "∞"}</span>
        </p>
        <p className="text-xs text-slate-400 mt-2">
          Renouvellement dans 12 jours
        </p>
      </div>
    </div>
  );
}
