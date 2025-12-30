import { Zap, Shield, FileSpreadsheet, Brain, Clock, Smartphone } from "lucide-react";

export default function SolutionPage() {
  return (
    <div className="space-y-20 py-12">
      {/* Hero */}
      <div className="text-center space-y-6 max-w-4xl mx-auto">
        <h1 className="text-4xl md:text-5xl font-bold text-slate-900 leading-tight">
          La fin de la saisie manuelle <br />
          <span className="text-blue-600">pour de bon.</span>
        </h1>
        <p className="text-xl text-slate-600 leading-relaxed">
          NovaReceipt utilise l'intelligence artificielle la plus avancée pour transformer vos tickets de caisse froissés en lignes comptables parfaites.
        </p>
      </div>

      {/* Features Grid */}
      <div className="grid md:grid-cols-2 gap-12 items-center">
        <div className="space-y-8">
          <div className="flex gap-4">
            <div className="w-12 h-12 bg-blue-100 rounded-xl flex items-center justify-center flex-shrink-0">
              <Brain className="w-6 h-6 text-blue-600" />
            </div>
            <div>
              <h3 className="text-xl font-bold text-slate-900 mb-2">IA de pointe</h3>
              <p className="text-slate-600">Notre modèle reconnaît automatiquement le commerçant, la date, le montant total, la TVA et la catégorie de dépense.</p>
            </div>
          </div>
          <div className="flex gap-4">
            <div className="w-12 h-12 bg-amber-100 rounded-xl flex items-center justify-center flex-shrink-0">
              <Clock className="w-6 h-6 text-amber-600" />
            </div>
            <div>
              <h3 className="text-xl font-bold text-slate-900 mb-2">Gain de temps</h3>
              <p className="text-slate-600">Ce qui prenait des heures chaque fin de mois ne prend plus que quelques secondes. Prenez une photo, c'est fini.</p>
            </div>
          </div>
          <div className="flex gap-4">
            <div className="w-12 h-12 bg-emerald-100 rounded-xl flex items-center justify-center flex-shrink-0">
              <Smartphone className="w-6 h-6 text-emerald-600" />
            </div>
            <div>
              <h3 className="text-xl font-bold text-slate-900 mb-2">Mobile First</h3>
              <p className="text-slate-600">Conçu pour être utilisé en déplacement. Votre comptabilité est à jour avant même que vous ne quittiez le restaurant.</p>
            </div>
          </div>
        </div>
        <div className="bg-slate-100 rounded-3xl p-8 aspect-square flex items-center justify-center">
           {/* Placeholder for an image or illustration */}
           <div className="text-center space-y-4">
             <div className="inline-block p-4 bg-white rounded-2xl shadow-xl mb-4">
               <div className="flex items-center gap-3 mb-2">
                 <div className="w-8 h-8 bg-red-100 rounded-full flex items-center justify-center">
                   <span className="text-red-600 font-bold">R</span>
                 </div>
                 <div className="text-left">
                   <div className="font-bold text-slate-900">Restaurant</div>
                   <div className="text-xs text-slate-500">Aujourd'hui, 12:30</div>
                 </div>
                 <div className="ml-auto font-mono font-bold text-slate-900">45.00 €</div>
               </div>
               <div className="h-2 bg-slate-100 rounded w-3/4"></div>
               <div className="h-2 bg-slate-100 rounded w-1/2 mt-2"></div>
             </div>
             <p className="text-slate-400 font-medium">Extraction en temps réel...</p>
           </div>
        </div>
      </div>
    </div>
  );
}
