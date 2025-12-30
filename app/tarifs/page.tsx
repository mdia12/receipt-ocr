import React from 'react';
import { Check } from 'lucide-react';
import Link from 'next/link';

export default function PricingPage() {
  return (
    <div className="space-y-16 pb-20">
      <section className="text-center space-y-6 max-w-4xl mx-auto pt-10 px-4">
        <h1 className="text-3xl md:text-5xl font-bold text-slate-900">
          Des tarifs simples et transparents
        </h1>
        <p className="text-xl text-slate-600">
          Choisissez le plan adapté à votre volume de documents.
        </p>
      </section>

      <section className="max-w-6xl mx-auto px-4">
        <div className="grid md:grid-cols-3 gap-8">
          
          {/* Plan Gratuit */}
          <div className="bg-white rounded-2xl p-8 border border-slate-200 shadow-sm hover:shadow-md transition-shadow flex flex-col">
            <div className="mb-6">
              <h3 className="text-xl font-bold text-slate-900">Gratuit</h3>
              <div className="mt-4 flex items-baseline text-slate-900">
                <span className="text-4xl font-bold tracking-tight">0€</span>
                <span className="ml-1 text-xl font-semibold text-slate-500">/mois</span>
              </div>
              <p className="mt-2 text-slate-500 text-sm">Pour tester et les petits besoins.</p>
            </div>
            <ul className="space-y-4 mb-8 flex-1">
              <li className="flex items-center gap-3 text-slate-600">
                <Check className="w-5 h-5 text-blue-500 flex-shrink-0" />
                <span>10 scans / mois</span>
              </li>
              <li className="flex items-center gap-3 text-slate-600">
                <Check className="w-5 h-5 text-blue-500 flex-shrink-0" />
                <span>Export Excel & PDF</span>
              </li>
              <li className="flex items-center gap-3 text-slate-600">
                <Check className="w-5 h-5 text-blue-500 flex-shrink-0" />
                <span>Traitement instantané</span>
              </li>
            </ul>
            <Link href="/" className="block w-full py-3 px-4 bg-slate-100 hover:bg-slate-200 text-slate-900 font-medium text-center rounded-lg transition-colors">
              Commencer gratuitement
            </Link>
          </div>

          {/* Plan Pro */}
          <div className="bg-white rounded-2xl p-8 border-2 border-blue-500 shadow-xl relative flex flex-col transform md:-translate-y-4">
            <div className="absolute top-0 right-0 -mt-4 mr-4 bg-blue-500 text-white text-xs font-bold px-3 py-1 rounded-full uppercase tracking-wide">
              Recommandé
            </div>
            <div className="mb-6">
              <h3 className="text-xl font-bold text-slate-900">Pro</h3>
              <div className="mt-4 flex items-baseline text-slate-900">
                <span className="text-4xl font-bold tracking-tight">15€</span>
                <span className="ml-1 text-xl font-semibold text-slate-500">/mois</span>
              </div>
              <p className="mt-2 text-slate-500 text-sm">Pour les freelances et indépendants.</p>
            </div>
            <ul className="space-y-4 mb-8 flex-1">
              <li className="flex items-center gap-3 text-slate-600">
                <Check className="w-5 h-5 text-blue-500 flex-shrink-0" />
                <span>200 scans / mois</span>
              </li>
              <li className="flex items-center gap-3 text-slate-600">
                <Check className="w-5 h-5 text-blue-500 flex-shrink-0" />
                <span>Historique & corrections</span>
              </li>
              <li className="flex items-center gap-3 text-slate-600">
                <Check className="w-5 h-5 text-blue-500 flex-shrink-0" />
                <span>Support prioritaire</span>
              </li>
              <li className="flex items-center gap-3 text-slate-600">
                <Check className="w-5 h-5 text-blue-500 flex-shrink-0" />
                <span>Automatisation Drive (bientôt)</span>
              </li>
            </ul>
            <button className="block w-full py-3 px-4 bg-blue-600 hover:bg-blue-700 text-white font-medium text-center rounded-lg transition-colors shadow-lg shadow-blue-500/20">
              Choisir Pro
            </button>
          </div>

          {/* Plan Cabinet */}
          <div className="bg-white rounded-2xl p-8 border border-slate-200 shadow-sm hover:shadow-md transition-shadow flex flex-col">
            <div className="mb-6">
              <h3 className="text-xl font-bold text-slate-900">Cabinet</h3>
              <div className="mt-4 flex items-baseline text-slate-900">
                <span className="text-4xl font-bold tracking-tight">150€</span>
                <span className="ml-1 text-xl font-semibold text-slate-500">/mois</span>
              </div>
              <p className="mt-2 text-slate-500 text-sm">Pour les cabinets comptables.</p>
            </div>
            <ul className="space-y-4 mb-8 flex-1">
              <li className="flex items-center gap-3 text-slate-600">
                <Check className="w-5 h-5 text-blue-500 flex-shrink-0" />
                <span>Scans illimités</span>
              </li>
              <li className="flex items-center gap-3 text-slate-600">
                <Check className="w-5 h-5 text-blue-500 flex-shrink-0" />
                <span>Multi-comptes</span>
              </li>
              <li className="flex items-center gap-3 text-slate-600">
                <Check className="w-5 h-5 text-blue-500 flex-shrink-0" />
                <span>API dédiée</span>
              </li>
              <li className="flex items-center gap-3 text-slate-600">
                <Check className="w-5 h-5 text-blue-500 flex-shrink-0" />
                <span>Assistance personnalisée</span>
              </li>
            </ul>
            <button className="block w-full py-3 px-4 bg-slate-900 hover:bg-slate-800 text-white font-medium text-center rounded-lg transition-colors">
              Contacter l'équipe
            </button>
          </div>

        </div>
      </section>
    </div>
  );
}
