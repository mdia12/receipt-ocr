"use client";

import { useState } from "react";
import Link from "next/link";
import { LayoutDashboard, LogIn, Menu, X } from "lucide-react";

export default function Navbar() {
  const [isOpen, setIsOpen] = useState(false);

  return (
    <header className="border-b border-slate-200 bg-white/80 backdrop-blur-md sticky top-0 z-50">
      <div className="max-w-5xl mx-auto px-4 h-16 flex items-center justify-between">
        
        {/* Left: Hamburger (Mobile) & Logo */}
        <div className="flex items-center gap-4">
          <button 
            className="md:hidden p-2 -ml-2 text-slate-600 hover:bg-slate-100 rounded-lg"
            onClick={() => setIsOpen(!isOpen)}
          >
            {isOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
          </button>
          
          <Link href="/" className="flex items-center gap-2 font-bold text-xl tracking-tight text-slate-900 hover:opacity-90 transition-opacity">
            <div className="w-8 h-8 bg-gradient-to-br from-blue-600 to-violet-600 rounded-lg flex items-center justify-center text-white font-bold text-lg shadow-lg shadow-blue-500/20">
              N
            </div>
            <span className="hidden sm:inline">NovaReceipt</span>
          </Link>
        </div>

        {/* Desktop Nav */}
        <nav className="hidden md:flex items-center gap-8 text-sm font-medium text-slate-600">
          <Link href="/solution" className="hover:text-blue-600 transition-colors">Notre Solution</Link>
          <Link href="/pricing" className="hover:text-blue-600 transition-colors">Tarifs</Link>
          <div className="h-4 w-px bg-slate-200"></div>
          <Link href="/dashboard" className="flex items-center gap-2 hover:text-blue-600 transition-colors">
            <LayoutDashboard className="w-4 h-4" />
            Dashboard
          </Link>
          <Link href="/login" className="flex items-center gap-2 hover:text-blue-600 transition-colors">
            <LogIn className="w-4 h-4" />
            Connexion
          </Link>
        </nav>

        {/* Mobile Nav Overlay */}
        {isOpen && (
          <div className="absolute top-16 left-0 w-64 h-[calc(100vh-4rem)] bg-white border-r border-slate-200 shadow-2xl md:hidden flex flex-col p-4 animate-in slide-in-from-left duration-200">
            <nav className="flex flex-col gap-2">
              <Link 
                href="/solution" 
                className="px-4 py-3 text-slate-600 hover:bg-slate-50 hover:text-blue-600 rounded-lg font-medium transition-colors"
                onClick={() => setIsOpen(false)}
              >
                Notre Solution
              </Link>
              <Link 
                href="/pricing" 
                className="px-4 py-3 text-slate-600 hover:bg-slate-50 hover:text-blue-600 rounded-lg font-medium transition-colors"
                onClick={() => setIsOpen(false)}
              >
                Tarifs
              </Link>
              <div className="h-px bg-slate-100 my-2"></div>
              <Link 
                href="/dashboard" 
                className="px-4 py-3 text-slate-600 hover:bg-slate-50 hover:text-blue-600 rounded-lg font-medium transition-colors flex items-center gap-3"
                onClick={() => setIsOpen(false)}
              >
                <LayoutDashboard className="w-5 h-5" />
                Dashboard
              </Link>
              <Link 
                href="/login" 
                className="px-4 py-3 text-slate-600 hover:bg-slate-50 hover:text-blue-600 rounded-lg font-medium transition-colors flex items-center gap-3"
                onClick={() => setIsOpen(false)}
              >
                <LogIn className="w-5 h-5" />
                Connexion
              </Link>
            </nav>
          </div>
        )}
      </div>
    </header>
  );
}
