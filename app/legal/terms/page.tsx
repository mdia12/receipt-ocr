import React from 'react';

export default function TermsPage() {
  return (
    <div className="min-h-screen bg-slate-950 text-slate-200 py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-3xl mx-auto space-y-8">
        <h1 className="text-3xl font-bold text-white mb-8">Conditions Générales d'Utilisation</h1>
        
        <div className="prose prose-invert prose-slate max-w-none">
          <p className="lead">
            En utilisant le service Receipt OCR, vous acceptez sans réserve les présentes Conditions Générales d'Utilisation.
          </p>

          <h3>1. Description du service</h3>
          <p>
            Receipt OCR est un service SaaS permettant l'extraction automatique de données à partir de reçus et factures (images ou PDF) grâce à l'intelligence artificielle.
          </p>

          <h3>2. Accès au service</h3>
          <p>
            Le service est accessible 24h/24 et 7j/7, sauf cas de force majeure ou maintenance programmée. Nous nous réservons le droit de suspendre l'accès pour des raisons techniques ou de sécurité.
          </p>

          <h3>3. Responsabilité</h3>
          <p>
            Bien que nous utilisions des technologies avancées (IA), nous ne pouvons garantir une exactitude à 100% de l'extraction des données. Il appartient à l'utilisateur de vérifier les informations extraites avant de les utiliser à des fins comptables ou fiscales. Receipt OCR ne saurait être tenu responsable des erreurs d'extraction.
          </p>

          <h3>4. Données personnelles</h3>
          <p>
            Le traitement de vos données personnelles est régi par notre <a href="/legal/privacy" className="text-blue-400 hover:underline">Politique de Confidentialité</a>. Nous nous engageons à ne jamais vendre vos données à des tiers.
          </p>

          <h3>5. Tarifs et Paiement</h3>
          <p>
            L'accès à certaines fonctionnalités avancées nécessite un abonnement payant. Les tarifs sont indiqués sur la page d'accueil et peuvent être modifiés avec un préavis de 30 jours.
          </p>

          <h3>6. Loi applicable</h3>
          <p>
            Les présentes conditions sont régies par le droit français. Tout litige relatif à leur interprétation et/ou à leur exécution relève des tribunaux français.
          </p>
        </div>
      </div>
    </div>
  );
}
