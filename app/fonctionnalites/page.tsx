import React from 'react';
import { Upload, Zap, FileSpreadsheet, CheckCircle2 } from 'lucide-react';
import Link from 'next/link';

export default function FeaturesPage() {
  return (
    <div className="space-y-20 pb-20">
      {/* Hero / Intro */}
      <section className="text-center space-y-6 max-w-4xl mx-auto pt-10">
        <h1 className="text-3xl md:text-5xl font-bold text-slate-900">
          Fonctionnalités & Fonctionnement
        </h1>
        <p className="text-xl text-slate-600">
          Découvrez comment NovaReceipt transforme vos reçus papier en données exploitables.
        </p>
      </section>

      {/* Section A: What it does */}
      <section className="max-w-6xl mx-auto px-4">
        <div className="grid md:grid-cols-2 gap-12 items-center">
          <div className="bg-slate-100 rounded-2xl p-8 border border-slate-200 h-80 flex items-center justify-center relative overflow-hidden">
            <div className="absolute inset-0 bg-grid-slate-200/50 [mask-image:linear-gradient(0deg,white,rgba(255,255,255,0.6))]"></div>
            <div className="relative bg-white p-4 shadow-xl rounded-lg rotate-[-6deg] w-48 border border-slate-100">
              <div className="h-2 w-12 bg-slate-200 rounded mb-2"></div>
              <div className="h-2 w-24 bg-slate-200 rounded mb-4"></div>
              <div className="space-y-2">
                <div className="h-1.5 w-full bg-slate-100 rounded"></div>
                <div className="h-1.5 w-full bg-slate-100 rounded"></div>
                <div className="h-1.5 w-3/4 bg-slate-100 rounded"></div>
              </div>
              <div className="mt-4 flex justify-between">
                <div className="h-3 w-10 bg-slate-300 rounded"></div>
                <div className="h-3 w-10 bg-slate-300 rounded"></div>
              </div>
            </div>
            <p className="absolute bottom-4 text-slate-400 font-medium">Votre reçu (JPG, PNG, PDF)</p>
          </div>

          <div className="space-y-6">
            <h2 className="text-2xl font-bold text-slate-900">Ce que NovaReceipt fait pour vous</h2>
            <p className="text-slate-600 leading-relaxed">
              Notre technologie OCR analyse chaque pixel de vos documents pour en extraire les informations comptables essentielles. Plus besoin de recopier manuellement les montants et les dates.
            </p>
            
            <div className="bg-white border border-slate-200 rounded-xl shadow-sm overflow-hidden">
              <table className="w-full text-sm text-left">
                <thead className="bg-slate-50 text-slate-500">
                  <tr>
                    <th className="px-4 py-2 font-medium">Date</th>
                    <th className="px-4 py-2 font-medium">Fournisseur</th>
                    <th className="px-4 py-2 font-medium">Total TTC</th>
                    <th className="px-4 py-2 font-medium">Catégorie</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  <tr>
                    <td className="px-4 py-3 text-slate-700">24/10/2023</td>
                    <td className="px-4 py-3 font-medium text-slate-900">Restaurant Le Gourmet</td>
                    <td className="px-4 py-3 text-slate-700">45.50 €</td>
                    <td className="px-4 py-3"><span className="bg-blue-100 text-blue-700 px-2 py-0.5 rounded-full text-xs">Restaurant</span></td>
                  </tr>
                  <tr>
                    <td className="px-4 py-3 text-slate-700">25/10/2023</td>
                    <td className="px-4 py-3 font-medium text-slate-900">Uber Ride</td>
                    <td className="px-4 py-3 text-slate-700">12.20 €</td>
                    <td className="px-4 py-3"><span className="bg-purple-100 text-purple-700 px-2 py-0.5 rounded-full text-xs">Transport</span></td>
                  </tr>
                </tbody>
              </table>
            </div>
          </div>
        </div>
      </section>

      {/* Section B: How it works */}
      <section className="bg-slate-50 py-16">
        <div className="max-w-6xl mx-auto px-4">
          <h2 className="text-2xl font-bold text-center text-slate-900 mb-12">Comment ça marche ?</h2>
          <div className="grid md:grid-cols-3 gap-8">
            <div className="bg-white p-8 rounded-2xl shadow-sm border border-slate-100 text-center space-y-4">
              <div className="w-12 h-12 bg-blue-100 text-blue-600 rounded-xl flex items-center justify-center mx-auto">
                <Upload className="w-6 h-6" />
              </div>
              <h3 className="font-bold text-lg">1. Déposez votre reçu</h3>
              <p className="text-slate-600 text-sm">Glissez-déposez vos fichiers (images ou PDF) directement dans l'interface.</p>
            </div>
            <div className="bg-white p-8 rounded-2xl shadow-sm border border-slate-100 text-center space-y-4">
              <div className="w-12 h-12 bg-purple-100 text-purple-600 rounded-xl flex items-center justify-center mx-auto">
                <Zap className="w-6 h-6" />
              </div>
              <h3 className="font-bold text-lg">2. L’IA extrait les infos</h3>
              <p className="text-slate-600 text-sm">Notre algorithme identifie instantanément la date, le montant, la TVA et le marchand.</p>
            </div>
            <div className="bg-white p-8 rounded-2xl shadow-sm border border-slate-100 text-center space-y-4">
              <div className="w-12 h-12 bg-emerald-100 text-emerald-600 rounded-xl flex items-center justify-center mx-auto">
                <FileSpreadsheet className="w-6 h-6" />
              </div>
              <h3 className="font-bold text-lg">3. Exportez en 1 clic</h3>
              <p className="text-slate-600 text-sm">Récupérez un fichier Excel ou CSV propre, prêt pour votre comptabilité.</p>
            </div>
          </div>
        </div>
      </section>

      {/* Section C: Who is it for */}
      <section className="max-w-4xl mx-auto px-4 text-center space-y-8">
        <h2 className="text-2xl font-bold text-slate-900">Pour qui est fait NovaReceipt ?</h2>
        <div className="flex flex-wrap justify-center gap-4">
          {['Freelances', 'Micro-entrepreneurs', 'Boutiques & Restaurants', 'Experts-comptables', 'Professionnels en déplacement'].map((item, i) => (
            <div key={i} className="flex items-center gap-2 bg-white px-6 py-3 rounded-full border border-slate-200 shadow-sm text-slate-700 font-medium">
              <CheckCircle2 className="w-5 h-5 text-blue-500" />
              {item}
            </div>
          ))}
        </div>
        <div className="pt-8">
          <Link href="/" className="inline-flex items-center justify-center px-8 py-3 text-base font-medium text-white bg-blue-600 hover:bg-blue-700 rounded-lg transition-colors shadow-lg shadow-blue-500/20">
            Essayer gratuitement
          </Link>
        </div>
      </section>
    </div>
  );
}
