import React from 'react';
import { HelpCircle } from 'lucide-react';

export default function FAQPage() {
  const faqs = [
    {
      q: "Dois-je créer un compte pour essayer ?",
      a: "Non, vous pouvez tester gratuitement l'outil directement depuis la page d'accueil sans inscription."
    },
    {
      q: "Quels types de documents sont supportés ?",
      a: "Nous supportons les tickets de caisse, factures et reçus aux formats JPG, PNG et PDF."
    },
    {
      q: "Puis-je exporter vers Excel ?",
      a: "Oui, l'export vers Excel (.xlsx) et CSV est disponible nativement pour faciliter l'intégration avec votre logiciel comptable."
    },
    {
      q: "NovaReceipt convient-il aux cabinets comptables ?",
      a: "Absolument. Nous proposons une offre 'Cabinet' dédiée permettant de gérer de gros volumes et plusieurs dossiers clients via une API."
    },
    {
      q: "Où sont stockées mes données ?",
      a: "Vos données sont traitées et hébergées exclusivement en Europe, en conformité avec le RGPD. Elles sont supprimées automatiquement après usage si vous n'avez pas de compte."
    }
  ];

  return (
    <div className="space-y-16 pb-20">
      <section className="text-center space-y-6 max-w-4xl mx-auto pt-10 px-4">
        <h1 className="text-3xl md:text-5xl font-bold text-slate-900">
          Questions Fréquentes
        </h1>
        <p className="text-xl text-slate-600">
          Tout ce que vous devez savoir sur NovaReceipt.
        </p>
      </section>

      <section className="max-w-3xl mx-auto px-4">
        <div className="space-y-6">
          {faqs.map((faq, i) => (
            <div key={i} className="bg-white border border-slate-200 rounded-xl p-6 shadow-sm hover:shadow-md transition-all">
              <h3 className="text-lg font-bold text-slate-900 flex items-start gap-3">
                <HelpCircle className="w-6 h-6 text-blue-500 flex-shrink-0 mt-0.5" />
                {faq.q}
              </h3>
              <p className="mt-3 text-slate-600 leading-relaxed pl-9">
                {faq.a}
              </p>
            </div>
          ))}
        </div>
      </section>
    </div>
  );
}
