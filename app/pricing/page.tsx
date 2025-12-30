import { Check } from "lucide-react";

export default function PricingPage() {
  return (
    <div className="space-y-12 py-12">
      <div className="text-center space-y-4">
        <h1 className="text-4xl font-bold text-slate-900">Tarifs simples et transparents</h1>
        <p className="text-lg text-slate-600 max-w-2xl mx-auto">
          Commencez gratuitement, passez à la vitesse supérieure quand vous en avez besoin.
        </p>
      </div>

      <div className="grid md:grid-cols-3 gap-8 max-w-5xl mx-auto">
        {/* Free Plan */}
        <div className="bg-white border border-slate-200 rounded-2xl p-8 shadow-sm hover:shadow-md transition-shadow">
          <h3 className="text-xl font-bold text-slate-900">Gratuit</h3>
          <div className="mt-4 flex items-baseline text-slate-900">
            <span className="text-4xl font-bold tracking-tight">0€</span>
            <span className="ml-1 text-xl font-semibold">/mois</span>
          </div>
          <p className="mt-4 text-slate-500">Pour les indépendants qui débutent.</p>
          <ul className="mt-6 space-y-4">
            <li className="flex items-center gap-3 text-slate-600">
              <Check className="w-5 h-5 text-blue-600" />
              50 scans / mois
            </li>
            <li className="flex items-center gap-3 text-slate-600">
              <Check className="w-5 h-5 text-blue-600" />
              Export Excel
            </li>
            <li className="flex items-center gap-3 text-slate-600">
              <Check className="w-5 h-5 text-blue-600" />
              Support par email
            </li>
          </ul>
          <button className="mt-8 w-full py-3 px-4 bg-slate-100 hover:bg-slate-200 text-slate-900 font-medium rounded-lg transition-colors">
            Commencer
          </button>
        </div>

        {/* Pro Plan */}
        <div className="bg-slate-900 border border-slate-800 rounded-2xl p-8 shadow-xl relative overflow-hidden">
          <div className="absolute top-0 right-0 bg-blue-600 text-white text-xs font-bold px-3 py-1 rounded-bl-lg">
            POPULAIRE
          </div>
          <h3 className="text-xl font-bold text-white">Pro</h3>
          <div className="mt-4 flex items-baseline text-white">
            <span className="text-4xl font-bold tracking-tight">29€</span>
            <span className="ml-1 text-xl font-semibold">/mois</span>
          </div>
          <p className="mt-4 text-slate-400">Pour les entreprises en croissance.</p>
          <ul className="mt-6 space-y-4">
            <li className="flex items-center gap-3 text-slate-300">
              <Check className="w-5 h-5 text-blue-400" />
              500 scans / mois
            </li>
            <li className="flex items-center gap-3 text-slate-300">
              <Check className="w-5 h-5 text-blue-400" />
              Export Excel & PDF
            </li>
            <li className="flex items-center gap-3 text-slate-300">
              <Check className="w-5 h-5 text-blue-400" />
              Support prioritaire
            </li>
            <li className="flex items-center gap-3 text-slate-300">
              <Check className="w-5 h-5 text-blue-400" />
              API Access
            </li>
          </ul>
          <button className="mt-8 w-full py-3 px-4 bg-blue-600 hover:bg-blue-500 text-white font-medium rounded-lg transition-colors shadow-lg shadow-blue-500/20">
            Choisir Pro
          </button>
        </div>

        {/* Enterprise Plan */}
        <div className="bg-white border border-slate-200 rounded-2xl p-8 shadow-sm hover:shadow-md transition-shadow">
          <h3 className="text-xl font-bold text-slate-900">Entreprise</h3>
          <div className="mt-4 flex items-baseline text-slate-900">
            <span className="text-4xl font-bold tracking-tight">Sur devis</span>
          </div>
          <p className="mt-4 text-slate-500">Pour les grands volumes.</p>
          <ul className="mt-6 space-y-4">
            <li className="flex items-center gap-3 text-slate-600">
              <Check className="w-5 h-5 text-blue-600" />
              Scans illimités
            </li>
            <li className="flex items-center gap-3 text-slate-600">
              <Check className="w-5 h-5 text-blue-600" />
              Intégration sur mesure
            </li>
            <li className="flex items-center gap-3 text-slate-600">
              <Check className="w-5 h-5 text-blue-600" />
              Account Manager dédié
            </li>
          </ul>
          <button className="mt-8 w-full py-3 px-4 bg-slate-100 hover:bg-slate-200 text-slate-900 font-medium rounded-lg transition-colors">
            Contacter
          </button>
        </div>
      </div>
    </div>
  );
}
