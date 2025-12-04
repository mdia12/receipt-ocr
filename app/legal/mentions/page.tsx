import React from 'react';

export default function MentionsPage() {
  return (
    <div className="min-h-screen bg-slate-950 text-slate-200 py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-3xl mx-auto space-y-8">
        <h1 className="text-3xl font-bold text-white mb-8">Mentions Légales</h1>
        
        <div className="space-y-6 text-slate-300">
          <section className="space-y-2">
            <h2 className="text-xl font-semibold text-white">1. Éditeur du site</h2>
            <p>
              Le site Receipt OCR est édité par la société [Nom de votre société], SAS au capital de [Montant] €, immatriculée au Registre du Commerce et des Sociétés de [Ville] sous le numéro [Numéro SIREN].
            </p>
            <p>
              Siège social : [Adresse complète]<br />
              Numéro de TVA intracommunautaire : [Numéro TVA]<br />
              Directeur de la publication : [Nom du directeur]
            </p>
          </section>

          <section className="space-y-2">
            <h2 className="text-xl font-semibold text-white">2. Hébergement</h2>
            <p>
              Le site est hébergé par Vercel Inc.<br />
              Adresse : 340 S Lemon Ave #4133 Walnut, CA 91789, USA<br />
              Le traitement des données et le stockage backend sont assurés sur des serveurs situés en Europe.
            </p>
          </section>

          <section className="space-y-2">
            <h2 className="text-xl font-semibold text-white">3. Propriété intellectuelle</h2>
            <p>
              L'ensemble de ce site relève de la législation française et internationale sur le droit d'auteur et la propriété intellectuelle. Tous les droits de reproduction sont réservés, y compris pour les documents téléchargeables et les représentations iconographiques et photographiques.
            </p>
          </section>

          <section className="space-y-2">
            <h2 className="text-xl font-semibold text-white">4. Contact</h2>
            <p>
              Pour toute question, vous pouvez nous contacter à l'adresse suivante : contact@receipt-ocr.com
            </p>
          </section>
        </div>
      </div>
    </div>
  );
}
