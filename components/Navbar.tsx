"use client";

import { useState } from "react";
import Link from "next/link";
import { Menu, X, ArrowRight } from "lucide-react";

export default function Navbar() {
  const [isOpen, setIsOpen] = useState(false);

  return (
    <header className="border-b border-slate-200 bg-white/80 backdrop-blur-md sticky top-0 z-50">
      <div className="max-w-6xl mx-auto px-4 h-16 flex items-center justify-between relative">
        
        {/* Logo */}
        <div className="flex items-center z-20">
          <Link href="/" className="flex items-center gap-2 font-bold text-xl tracking-tight text-slate-900 hover:opacity-90 transition-opacity">
            <div className="w-8 h-8 bg-gradient-to-br from-blue-600 to-violet-600 rounded-lg flex items-center justify-center text-white font-bold text-lg shadow-lg shadow-blue-500/20">
              N
            </div>
            <span>NovaReceipt</span>
          </Link>
        </div>

        {/* Desktop Nav */}
        <nav className="hidden md:flex items-center gap-8 text-sm font-medium text-slate-600">
          <Link href="/fonctionnalites" className="hover:text-blue-600 transition-colors">Fonctionnalités</Link>
          <Link href="/tarifs" className="hover:text-blue-600 transition-colors">Tarifs</Link>
          <Link href="/securite" className="hover:text-blue-600 transition-colors">Sécurité</Link>
          <Link href="/faq" className="hover:text-blue-600 transition-colors">FAQ</Link>
        </nav>

        {/* CTA Button (Desktop) */}
        <div className="hidden md:block">
          <Link 
            href="/login" 
            className="text-sm font-medium text-slate-600 hover:text-slate-900 transition-colors"
          >
            Connexion
          </Link>
        </div>

        {/* Mobile Menu Button */}
        <div className="flex items-center md:hidden z-20">
          <button 
            className="p-2 -mr-2 text-slate-600 hover:bg-slate-100 rounded-lg"
            onClick={() => setIsOpen(!isOpen)}
          >
            {isOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
          </button>
        </div>

        {/* Mobile Nav Overlay */}
        {isOpen && (
          <div className="absolute top-16 left-0 right-0 bg-white border-b border-slate-200 shadow-xl md:hidden flex flex-col p-4 animate-in slide-in-from-top duration-200">
            <nav className="flex flex-col gap-2">
              <Link 
                href="/fonctionnalites" 
                className="px-4 py-3 text-slate-600 hover:bg-slate-50 hover:text-blue-600 rounded-lg font-medium transition-colors"
                onClick={() => setIsOpen(false)}
              >
                Fonctionnalités
              </Link>
              <Link 
                href="/tarifs" 
                className="px-4 py-3 text-slate-600 hover:bg-slate-50 hover:text-blue-600 rounded-lg font-medium transition-colors"
                onClick={() => setIsOpen(false)}
              >
                Tarifs
              </Link>
              <Link 
                href="/securite" 
                className="px-4 py-3 text-slate-600 hover:bg-slate-50 hover:text-blue-600 rounded-lg font-medium transition-colors"
                onClick={() => setIsOpen(false)}
              >
                Sécurité
              </Link>
              <Link 
                href="/faq" 
                className="px-4 py-3 text-slate-600 hover:bg-slate-50 hover:text-blue-600 rounded-lg font-medium transition-colors"
                onClick={() => setIsOpen(false)}
              >
                FAQ
              </Link>
              <div className="h-px bg-slate-100 my-2"></div>
              <Link 
                href="/login" 
                className="px-4 py-3 bg-blue-600 text-white hover:bg-blue-700 rounded-lg font-medium transition-colors text-center"
                onClick={() => setIsOpen(false)}
              >
                Connexion
              </Link>
            </nav>
          </div>
        )}
      </div>
    </header>
  );
}
