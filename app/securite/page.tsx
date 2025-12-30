import React from 'react';
import { Shield, Lock, Server, Trash2, CheckCircle } from 'lucide-react';
import Link from 'next/link';

export default function SecurityPage() {
  return (
    <div className="space-y-16 pb-20">
      <section className="text-center space-y-6 max-w-4xl mx-auto pt-10 px-4">
        <h1 className="text-3xl md:text-5xl font-bold text-slate-900">
          Sécurité & Confidentialité
        </h1>
        <p className="text-xl text-slate-600 max-w-2xl mx-auto">
          La protection de vos données financières est au cœur de notre architecture. Nous ne faisons aucun compromis sur la sécurité.
        </p>
      </section>

      <section className="max-w-5xl mx-auto px-4">
        <div className="grid md:grid-cols-2 gap-8">
          <div className="bg-white p-8 rounded-2xl border border-slate-200 shadow-sm hover:shadow-md transition-all">
            <div className="w-12 h-12 bg-blue-100 rounded-xl flex items-center justify-center mb-6">
              <Server className="w-6 h-6 text-blue-600" />
            </div>
            <h3 className="text-xl font-bold text-slate-900 mb-3">Hébergement en Europe</h3>
            <p className="text-slate-600">
              Toutes vos données sont traitées et stockées sur des serveurs sécurisés situés au sein de l'Union Européenne, garantissant la conformité avec les normes les plus strictes.
            </p>
          </div>

          <div className="bg-white p-8 rounded-2xl border border-slate-200 shadow-sm hover:shadow-md transition-all">
            <div className="w-12 h-12 bg-red-100 rounded-xl flex items-center justify-center mb-6">
              <Trash2 className="w-6 h-6 text-red-600" />
            </div>
            <h3 className="text-xl font-bold text-slate-900 mb-3">Suppression Automatique</h3>
            <p className="text-slate-600">
              Vos reçus ne sont conservés que le temps du traitement. Une fois l'extraction terminée et validée, les fichiers sources peuvent être supprimés automatiquement.
            </p>
          </div>

          <div className="bg-white p-8 rounded-2xl border border-slate-200 shadow-sm hover:shadow-md transition-all">
            <div className="w-12 h-12 bg-emerald-100 rounded-xl flex items-center justify-center mb-6">
              <Lock className="w-6 h-6 text-emerald-600" />
            </div>
            <h3 className="text-xl font-bold text-slate-900 mb-3">Chiffrement de bout en bout</h3>
            <p className="text-slate-600">
              Les transferts de données sont sécurisés par le protocole TLS/SSL. Vos informations sensibles restent confidentielles à chaque étape.
            </p>
          </div>

          <div className="bg-white p-8 rounded-2xl border border-slate-200 shadow-sm hover:shadow-md transition-all">
            <div className="w-12 h-12 bg-purple-100 rounded-xl flex items-center justify-center mb-6">
              <Shield className="w-6 h-6 text-purple-600" />
            </div>
            <h3 className="text-xl font-bold text-slate-900 mb-3">IA Privée</h3>
            <p className="text-slate-600">
              Vos documents ne sont <strong>jamais</strong> utilisés pour entraîner nos modèles d'intelligence artificielle. Votre comptabilité reste la vôtre.
            </p>
          </div>
        </div>
      </section>

      <section className="max-w-3xl mx-auto px-4 py-12 bg-slate-50 rounded-3xl">
        <h2 className="text-2xl font-bold text-slate-900 mb-8 text-center">Questions fréquentes sur les données</h2>
        <div className="space-y-6">
          <div className="space-y-2">
            <h4 className="font-semibold text-slate-900 flex items-center gap-2">
              <CheckCircle className="w-4 h-4 text-blue-500" />
              Combien de temps vos reçus sont conservés ?
            </h4>
            <p className="text-slate-600 text-sm pl-6">
              Par défaut, nous conservons les données extraites pour votre historique. Vous pouvez demander la suppression totale de votre compte et de vos données à tout moment.
            </p>
          </div>
          <div className="space-y-2">
            <h4 className="font-semibold text-slate-900 flex items-center gap-2">
              <CheckCircle className="w-4 h-4 text-blue-500" />
              Qui peut accéder à vos données ?
            </h4>
            <p className="text-slate-600 text-sm pl-6">
              Personne. Le processus est entièrement automatisé. Nos équipes techniques n'ont accès aux données que sur demande explicite de support de votre part.
            </p>
          </div>
        </div>
        <div className="mt-8 text-center">
          <Link href="/legal/privacy" className="text-blue-600 font-medium hover:underline">
            Voir notre politique de confidentialité complète &rarr;
          </Link>
        </div>
      </section>
    </div>
  );
}
