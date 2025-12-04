import React from 'react';
import { Shield, Lock, Server, Eye } from 'lucide-react';

export default function PrivacyPage() {
  return (
    <div className="min-h-screen bg-slate-950 text-slate-200 py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-4xl mx-auto space-y-12">
        
        {/* Header */}
        <div className="text-center space-y-4">
          <h1 className="text-3xl md:text-4xl font-bold text-white">Politique de Confidentialité</h1>
          <p className="text-slate-400 max-w-2xl mx-auto">
            La protection de vos données est notre priorité absolue. Nous utilisons des technologies de pointe et souveraines pour garantir la sécurité de vos informations.
          </p>
        </div>

        {/* Main Assurance Block */}
        <div className="bg-blue-900/20 border border-blue-800/50 rounded-2xl p-8 md:p-10 relative overflow-hidden">
          <div className="absolute top-0 right-0 -mt-4 -mr-4 w-24 h-24 bg-blue-500/20 blur-3xl rounded-full"></div>
          
          <div className="flex flex-col md:flex-row gap-8 items-start">
            <div className="bg-blue-500/10 p-4 rounded-xl border border-blue-500/20">
              <Shield className="w-10 h-10 text-blue-400" />
            </div>
            <div className="space-y-4">
              <h2 className="text-2xl font-bold text-white">Intelligence Artificielle Souveraine & Sécurisée</h2>
              <div className="space-y-4 text-slate-300 leading-relaxed">
                <p>
                  Chez Receipt OCR, nous avons fait le choix de la souveraineté numérique. L'analyse de vos documents est effectuée exclusivement par des modèles d'intelligence artificielle français, développés par <strong>Mistral AI</strong>.
                </p>
                <p>
                  Contrairement à d'autres solutions qui envoient vos données vers des serveurs tiers non-européens, notre infrastructure garantit que vos documents sensibles restent sous la protection des réglementations européennes les plus strictes (RGPD).
                </p>
                <p>
                  Vos reçus et factures ne servent <strong>jamais</strong> à l'entraînement des modèles d'IA. Ils sont traités de manière éphémère uniquement pour l'extraction des données, puis sécurisés selon vos préférences.
                </p>
              </div>
            </div>
          </div>
        </div>

        {/* Detailed Sections */}
        <div className="grid md:grid-cols-2 gap-6">
          <div className="bg-slate-900/50 border border-slate-800 p-6 rounded-xl space-y-4">
            <div className="flex items-center gap-3">
              <Server className="w-6 h-6 text-emerald-400" />
              <h3 className="text-lg font-semibold text-white">Hébergement en Europe</h3>
            </div>
            <p className="text-slate-400 text-sm leading-relaxed">
              Toutes les données sont stockées sur des serveurs sécurisés situés au sein de l'Union Européenne. Nous appliquons des protocoles de chiffrement avancés (AES-256) pour le stockage et le transfert de vos fichiers.
            </p>
          </div>

          <div className="bg-slate-900/50 border border-slate-800 p-6 rounded-xl space-y-4">
            <div className="flex items-center gap-3">
              <Eye className="w-6 h-6 text-purple-400" />
              <h3 className="text-lg font-semibold text-white">Confidentialité Totale</h3>
            </div>
            <p className="text-slate-400 text-sm leading-relaxed">
              Personne chez Receipt OCR n'a accès au contenu de vos documents. L'extraction est entièrement automatisée. Vous gardez le contrôle total : suppression définitive de vos données possible à tout moment depuis votre espace.
            </p>
          </div>
        </div>

        {/* Legal Text */}
        <div className="prose prose-invert prose-slate max-w-none">
          <h3>1. Collecte des données</h3>
          <p>
            Nous collectons uniquement les données nécessaires au fonctionnement du service : adresse email pour votre compte, et les documents que vous téléchargez pour traitement.
          </p>

          <h3>2. Utilisation des données</h3>
          <p>
            Vos documents sont traités par l'API de Mistral AI (hébergée en Europe) uniquement dans le but d'extraire les informations structurées (date, montant, commerçant). Aucune autre utilisation n'est faite de vos documents.
          </p>

          <h3>3. Vos droits (RGPD)</h3>
          <p>
            Conformément au Règlement Général sur la Protection des Données, vous disposez d'un droit d'accès, de rectification, et de suppression de vos données. Pour exercer ces droits, contactez-nous à privacy@receipt-ocr.com.
          </p>
        </div>

      </div>
    </div>
  );
}
