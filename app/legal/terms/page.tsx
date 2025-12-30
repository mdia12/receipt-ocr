import React from 'react';

export default function TermsPage() {
  return (
    <div className="min-h-screen bg-slate-950 text-slate-200 py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-3xl mx-auto space-y-8">
        <h1 className="text-3xl font-bold text-white mb-8">Conditions Générales d'Utilisation</h1>
        
        <div className="prose prose-invert prose-slate max-w-none">
          <p className="lead">
            En utilisant le service NovaReceipt, vous acceptez sans réserve les présentes Conditions Générales d'Utilisation.
          </p>

          <h3>1. Description du service</h3>
          <p>
            NovaReceipt est un service SaaS permettant l'extraction automatique de données à partir de reçus et factures (images ou PDF) grâce à l'intelligence artificielle.
          </p>

          <h3>2. Accès au service</h3>
          <p>
            Le service est accessible 24h/24 et 7j/7, sauf cas de force majeure ou maintenance programmée. Nous nous réservons le droit de suspendre l'accès pour des raisons techniques ou de sécurité.
          </p>

          <h3>3. Plans d’Utilisation et Limitations de Service</h3>
          
          <h4 className="text-lg font-semibold text-slate-200 mt-6 mb-3">3.1. Plan Anonyme (Utilisateur Non Inscrit)</h4>
          <ul className="list-disc pl-5 space-y-2 text-slate-300 mb-4">
            <li><strong>Quota :</strong> L’utilisateur peut scanner 1 reçu toutes les 24 heures.</li>
            <li><strong>Accès :</strong> Aucun compte ni authentification n’est nécessaire.</li>
            <li><strong>Absence de Stockage :</strong> Aucun fichier, document, donnée extraite ou métadonnée n’est stocké par NovaReceipt. Le traitement est effectué uniquement en mémoire (in-memory) et supprimé immédiatement après la génération du résultat. Aucune conservation ni sauvegarde n’est effectuée.</li>
            <li><strong>Continuité :</strong> Les utilisateurs anonymes ne bénéficient d&apos;aucune garantie de continuité de service.</li>
          </ul>

          <h4 className="text-lg font-semibold text-slate-200 mt-6 mb-3">3.2. Plan &quot;Registered&quot; (Compte Gratuit)</h4>
          <ul className="list-disc pl-5 space-y-2 text-slate-300 mb-4">
            <li><strong>Quota :</strong> L’utilisateur peut scanner jusqu’à 5 reçus par période mobile de 24 heures.</li>
            <li><strong>Stockage Temporaire :</strong> Les reçus et données associées sont stockés dans l&apos;espace NovaReceipt pour une durée maximale de 7 jours.</li>
            <li><strong>Suppression Automatique :</strong> Après 7 jours, les fichiers et données associées sont automatiquement supprimés de manière irréversible. L&apos;utilisateur accepte qu&apos;aucune récupération ne soit possible après ce délai.</li>
            <li><strong>Limitations :</strong> L’historique disponible est limité aux reçus non expirés. L’accès à Google Drive n’est pas disponible pour ce plan.</li>
          </ul>

          <h4 className="text-lg font-semibold text-slate-200 mt-6 mb-3">3.3. Plan Premium (Abonnement Payant)</h4>
          <ul className="list-disc pl-5 space-y-2 text-slate-300 mb-4">
            <li><strong>Quota :</strong> Scans illimités.</li>
            <li><strong>Traitement :</strong> Traitement des reçus via modèle souverain (Mistral – UE).</li>
            <li><strong>Stockage Personnel :</strong> Stockage illimité via le Google Drive personnel de l’utilisateur. NovaReceipt ne réalise aucun stockage permanent : seuls des métadonnées techniques sont enregistrées. L’utilisateur conserve la propriété et le contrôle de ses documents.</li>
            <li><strong>Fonctionnalités :</strong> Accès à l’historique complet et exportations avancées.</li>
            <li><strong>Renouvellement :</strong> L&apos;abonnement se renouvelle automatiquement sauf résiliation avant la date d&apos;échéance.</li>
          </ul>

          <h4 className="text-lg font-semibold text-slate-200 mt-6 mb-3">3.4. Dispositions Générales</h4>
          <p>
            NovaReceipt se réserve le droit de suspendre ou limiter l&apos;utilisation en cas d&apos;abus ou de requêtes automatisées. Les quotas mentionnés ci-dessus peuvent évoluer ; les utilisateurs seront informés de tout changement significatif.
          </p>

          <h3>4. Responsabilité</h3>
          <p>
            Bien que nous utilisions des technologies avancées (IA), nous ne pouvons garantir une exactitude à 100% de l&apos;extraction des données. Il appartient à l&apos;utilisateur de vérifier les informations extraites avant de les utiliser à des fins comptables ou fiscales. NovaReceipt ne saurait être tenu responsable des erreurs d&apos;extraction.
          </p>

          <h3>5. Données personnelles</h3>
          <p>
            Le traitement de vos données personnelles est régi par notre <a href="/legal/privacy" className="text-blue-400 hover:underline">Politique de Confidentialité</a>. Nous nous engageons à ne jamais vendre vos données à des tiers.
          </p>

          <h3>6. Tarifs et Paiement</h3>
          <p>
            L&apos;accès à certaines fonctionnalités avancées nécessite un abonnement payant. Les tarifs sont indiqués sur la page d&apos;accueil et peuvent être modifiés avec un préavis de 30 jours.
          </p>

          <h3>7. Loi applicable</h3>
          <p>
            Les présentes conditions sont régies par le droit français. Tout litige relatif à leur interprétation et/ou à leur exécution relève des tribunaux français.
          </p>
        </div>
      </div>
    </div>
  );
}
