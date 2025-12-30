import { Lightbulb, TrendingUp, AlertTriangle, CheckCircle } from "lucide-react";
import { DashboardStats } from "@/types/receipts";

interface InsightsCardProps {
  stats: DashboardStats;
  onViewFullAnalysis?: () => void;
}

export default function InsightsCard({ stats, onViewFullAnalysis }: InsightsCardProps) {
  // Generate dynamic insights
  const insights = [];

  // Budget Insight
  if (stats.budgetUsage > 90) {
    insights.push({
      icon: AlertTriangle,
      color: "text-red-500",
      bg: "bg-red-50",
      text: "Budget critique : Vous avez consommé plus de 90% de votre budget mensuel."
    });
  } else if (stats.budgetUsage < 50) {
    insights.push({
      icon: CheckCircle,
      color: "text-emerald-500",
      bg: "bg-emerald-50",
      text: "Budget sain : Vos dépenses sont bien maîtrisées ce mois-ci."
    });
  }

  // Category Insight
  if (stats.topCategory) {
    insights.push({
      icon: TrendingUp,
      color: "text-blue-500",
      bg: "bg-blue-50",
      text: `Tendance : La catégorie "${stats.topCategory}" représente la majorité de vos frais.`
    });
  }

  // Scan Insight
  if (stats.scansThisMonth < 5) {
    insights.push({
      icon: Lightbulb,
      color: "text-amber-500",
      bg: "bg-amber-50",
      text: "Conseil : Scannez vos reçus au fur et à mesure pour éviter l'accumulation en fin de mois."
    });
  } else {
    insights.push({
      icon: CheckCircle,
      color: "text-violet-500",
      bg: "bg-violet-50",
      text: "Productivité : Excellent rythme de numérisation des justificatifs."
    });
  }

  return (
    <div className="bg-white p-6 rounded-xl border border-slate-100 shadow-sm">
      <div className="flex items-center gap-2 mb-6">
        <div className="p-2 bg-amber-100 rounded-lg">
          <Lightbulb className="w-5 h-5 text-amber-600" />
        </div>
        <h3 className="font-semibold text-slate-900">Insights Automatiques</h3>
      </div>

      <div className="space-y-4">
        {insights.map((insight, index) => (
          <div key={index} className="flex gap-3 items-start">
            <div className={`mt-0.5 p-1 rounded-full ${insight.bg}`}>
              <insight.icon className={`w-4 h-4 ${insight.color}`} />
            </div>
            <p className="text-sm text-slate-600 leading-relaxed">
              {insight.text}
            </p>
          </div>
        ))}
      </div>
      
      <div className="mt-6 pt-4 border-t border-slate-50">
        <button 
          onClick={onViewFullAnalysis}
          className="text-sm text-violet-600 font-medium hover:text-violet-700 flex items-center gap-1 w-full text-left"
        >
          Voir l'analyse complète
        </button>
      </div>
    </div>
  );
}
