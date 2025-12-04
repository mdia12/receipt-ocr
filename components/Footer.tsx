import React from 'react';
import Link from 'next/link';

export default function Footer() {
  return (
    <footer className="border-t border-slate-200 dark:border-slate-800 py-12 bg-slate-50 dark:bg-slate-950">
      <div className="max-w-6xl mx-auto px-4 flex flex-col md:flex-row justify-between items-center gap-6 text-sm text-slate-500 dark:text-slate-400">
        <div className="flex flex-col items-center md:items-start gap-2">
          <p className="font-semibold text-slate-700 dark:text-slate-200">NovaReceipt</p>
          <p>&copy; {new Date().getFullYear()} Tous droits réservés.</p>
        </div>
        
        <div className="flex gap-6 flex-wrap justify-center md:justify-end">
          <Link href="/legal/mentions" className="hover:text-blue-600 dark:hover:text-blue-400 hover:underline transition-colors">
            Mentions Légales
          </Link>
          <Link href="/docs/api" className="hover:text-blue-600 dark:hover:text-blue-400 hover:underline transition-colors">
            API Documentation
          </Link>
          <Link href="/legal/privacy" className="hover:text-blue-600 dark:hover:text-blue-400 hover:underline transition-colors">
            Politique de Confidentialité
          </Link>
          <Link href="/legal/terms" className="hover:text-blue-600 dark:hover:text-blue-400 hover:underline transition-colors">
            Conditions Générales
          </Link>
          <Link href="mailto:contact@novareceipt.com" className="hover:text-blue-600 dark:hover:text-blue-400 hover:underline transition-colors">
            Contact
          </Link>
        </div>
      </div>
    </footer>
  );
}
