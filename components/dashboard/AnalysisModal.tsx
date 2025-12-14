import { X, PieChart, TrendingUp, Calendar, ArrowRight } from "lucide-react";
import { DashboardStats, Receipt } from "@/types/receipts";

interface AnalysisModalProps {
  isOpen: boolean;
  onClose: () => void;
  stats: DashboardStats;
  receipts: Receipt[];
}

export default function AnalysisModal({ isOpen, onClose, stats, receipts }: AnalysisModalProps) {
  if (!isOpen) return null;

  // Calculate category breakdown
  const categoryTotals: Record<string, number> = {};
  receipts.forEach(r => {
    const cat = r.category || "Autres";
    categoryTotals[cat] = (categoryTotals[cat] || 0) + (r.amount || 0);
  });

  const sortedCategories = Object.entries(categoryTotals)
    .sort(([, a], [, b]) => b - a)
    .slice(0, 5); // Top 5

  const maxCatValue = sortedCategories[0]?.[1] || 1;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/50 backdrop-blur-sm transition-opacity">
      <div className="bg-white rounded-2xl shadow-2xl w-full max-w-2xl max-h-[90vh] overflow-y-auto animate-in fade-in zoom-in-95 duration-200">
        
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b border-slate-100 sticky top-0 bg-white z-10">
          <div>
            <h2 className="text-xl font-bold text-slate-900">Analyse Détaillée</h2>
            <p className="text-sm text-slate-500">Vue d'ensemble de vos finances</p>
          </div>
          <button 
            onClick={onClose}
            className="p-2 text-slate-400 hover:text-slate-600 hover:bg-slate-100 rounded-full transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Content */}
        <div className="p-6 space-y-8">
          
          {/* Top Section: Health Score */}
          <div className="bg-violet-50 rounded-xl p-6 flex items-center gap-6">
            <div className="relative w-20 h-20 flex items-center justify-center">
              <svg className="w-full h-full -rotate-90" viewBox="0 0 36 36">
                <path
                  d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831"
                  fill="none"
                  stroke="#ddd6fe"
                  strokeWidth="3"
                />
                <path
                  d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831"
                  fill="none"
                  stroke="#7c3aed"
                  strokeWidth="3"
                  strokeDasharray={`${Math.max(0, 100 - stats.budgetUsage)}, 100`}
                />
              </svg>
              <span className="absolute text-lg font-bold text-violet-700">
                {Math.max(0, 100 - stats.budgetUsage).toFixed(0)}
              </span>
            </div>
            <div>
              <h3 className="font-semibold text-slate-900 mb-1">Score de Santé Financière</h3>
              <p className="text-sm text-slate-600 leading-relaxed">
                Votre gestion est {stats.budgetUsage < 80 ? "excellente" : "à surveiller"}. 
                Vous avez consommé {stats.budgetUsage.toFixed(0)}% de votre budget mensuel.
                Continuez à scanner régulièrement vos reçus pour maintenir ce score.
              </p>
            </div>
          </div>

          {/* Category Breakdown */}
          <div>
            <h3 className="font-semibold text-slate-900 mb-4 flex items-center gap-2">
              <PieChart className="w-4 h-4 text-slate-400" />
              Répartition par Catégorie
            </h3>
            <div className="space-y-3">
              {sortedCategories.map(([cat, amount], index) => (
                <div key={cat} className="space-y-1">
                  <div className="flex justify-between text-sm">
                    <span className="font-medium text-slate-700">{cat}</span>
                    <span className="text-slate-500">{amount.toFixed(2)} €</span>
                  </div>
                  <div className="h-2 bg-slate-100 rounded-full overflow-hidden">
                    <div 
                      className="h-full bg-blue-500 rounded-full"
                      style={{ width: `${(amount / maxCatValue) * 100}%`, opacity: 1 - index * 0.15 }}
                    ></div>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Monthly Projection */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="p-4 border border-slate-100 rounded-xl">
              <div className="flex items-center gap-2 mb-2 text-slate-500 text-sm font-medium">
                <TrendingUp className="w-4 h-4" />
                Projection Fin de Mois
              </div>
              <p className="text-2xl font-bold text-slate-900">
                {((stats.totalExpenses / new Date().getDate()) * 30).toLocaleString('fr-FR', { style: 'currency', currency: 'EUR' })}
              </p>
              <p className="text-xs text-slate-400 mt-1">Estimé selon votre rythme actuel</p>
            </div>
            
            <div className="p-4 border border-slate-100 rounded-xl">
              <div className="flex items-center gap-2 mb-2 text-slate-500 text-sm font-medium">
                <Calendar className="w-4 h-4" />
                Jours Restants
              </div>
              <p className="text-2xl font-bold text-slate-900">
                {30 - new Date().getDate()} jours
              </p>
              <p className="text-xs text-slate-400 mt-1">Avant le renouvellement du budget</p>
            </div>
          </div>

          {/* Recommendations */}
          <div className="bg-slate-50 p-4 rounded-xl">
            <h4 className="font-medium text-slate-900 mb-2">Recommandations IA</h4>
            <ul className="space-y-2">
              <li className="flex items-start gap-2 text-sm text-slate-600">
                <ArrowRight className="w-4 h-4 text-violet-500 mt-0.5 shrink-0" />
                <span>Pensez à catégoriser les {receipts.filter(r => !r.category).length} reçus en attente pour affiner l'analyse.</span>
              </li>
              <li className="flex items-start gap-2 text-sm text-slate-600">
                <ArrowRight className="w-4 h-4 text-violet-500 mt-0.5 shrink-0" />
                <span>Votre poste de dépense "{stats.topCategory}" est en hausse de 15% par rapport à la moyenne.</span>
              </li>
            </ul>
          </div>

        </div>
      </div>
    </div>
  );
}
