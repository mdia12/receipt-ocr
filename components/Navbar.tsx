"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { Menu, X, ArrowRight, LayoutDashboard, LogOut } from "lucide-react";
import { createClient } from "@/utils/supabase/client";
import { useRouter } from "next/navigation";
import { User } from "@supabase/supabase-js";

export default function Navbar({ user: initialUser }: { user?: User | null }) {
  const [isOpen, setIsOpen] = useState(false);
  const [user, setUser] = useState<User | null>(initialUser || null);
  const router = useRouter();
  const supabase = createClient();

  useEffect(() => {
    setUser(initialUser || null);
  }, [initialUser]);

  useEffect(() => {
    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange((event, session) => {
      setUser(session?.user ?? null);
      if (event === "SIGNED_OUT") {
        router.refresh();
      }
    });

    return () => {
      subscription.unsubscribe();
    };
  }, [supabase, router]);

  const handleSignOut = async () => {
    await supabase.auth.signOut();
    router.refresh();
  };

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
        <div className="hidden md:flex items-center gap-4">
          {user ? (
            <>
              <Link 
                href="/dashboard" 
                className="flex items-center gap-2 text-sm font-medium text-slate-600 hover:text-blue-600 transition-colors"
              >
                <LayoutDashboard className="w-4 h-4" />
                Dashboard
              </Link>
              <button
                onClick={handleSignOut}
                className="flex items-center gap-2 px-4 py-2 bg-slate-100 hover:bg-slate-200 text-slate-700 text-sm font-medium rounded-lg transition-colors"
              >
                <LogOut className="w-4 h-4" />
                Déconnexion
              </button>
            </>
          ) : (
            <>
              <Link 
                href="/login?view=login" 
                className="text-sm font-medium text-slate-600 hover:text-slate-900 transition-colors"
              >
                Connexion
              </Link>
              <Link 
                href="/login?view=signup" 
                className="inline-flex items-center gap-2 px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white text-sm font-medium rounded-lg transition-colors shadow-lg shadow-blue-500/20"
              >
                Inscription
                <ArrowRight className="w-4 h-4" />
              </Link>
            </>
          )}
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
          <div className="absolute top-16 right-4 w-64 bg-white border border-slate-200 rounded-xl shadow-2xl md:hidden flex flex-col p-2 animate-in slide-in-from-top-2 duration-200 z-50">
            <nav className="flex flex-col gap-1">
              <Link 
                href="/fonctionnalites" 
                className="px-4 py-2.5 text-sm text-slate-600 hover:bg-slate-50 hover:text-blue-600 rounded-lg font-medium transition-colors flex items-center gap-3"
                onClick={() => setIsOpen(false)}
              >
                Fonctionnalités
              </Link>
              <Link 
                href="/tarifs" 
                className="px-4 py-2.5 text-sm text-slate-600 hover:bg-slate-50 hover:text-blue-600 rounded-lg font-medium transition-colors flex items-center gap-3"
                onClick={() => setIsOpen(false)}
              >
                Tarifs
              </Link>
              <Link 
                href="/securite" 
                className="px-4 py-2.5 text-sm text-slate-600 hover:bg-slate-50 hover:text-blue-600 rounded-lg font-medium transition-colors flex items-center gap-3"
                onClick={() => setIsOpen(false)}
              >
                Sécurité
              </Link>
              <Link 
                href="/faq" 
                className="px-4 py-2.5 text-sm text-slate-600 hover:bg-slate-50 hover:text-blue-600 rounded-lg font-medium transition-colors flex items-center gap-3"
                onClick={() => setIsOpen(false)}
              >
                FAQ
              </Link>
              <div className="h-px bg-slate-100 my-1 mx-2"></div>
              {user ? (
                <>
                  <Link 
                    href="/dashboard" 
                    className="px-4 py-2.5 text-sm text-slate-600 hover:bg-slate-50 hover:text-blue-600 rounded-lg font-medium transition-colors flex items-center gap-3"
                    onClick={() => setIsOpen(false)}
                  >
                    <LayoutDashboard className="w-4 h-4" />
                    Dashboard
                  </Link>
                  <div className="px-4 py-1.5 text-xs text-slate-400 font-medium truncate border-t border-slate-100 mt-1 pt-2">
                    {user.email}
                  </div>
                  <button 
                    onClick={() => {
                      handleSignOut();
                      setIsOpen(false);
                    }}
                    className="w-full px-4 py-2.5 text-sm text-red-600 hover:bg-red-50 rounded-lg font-medium transition-colors flex items-center gap-3 text-left"
                  >
                    <LogOut className="w-4 h-4" />
                    Déconnexion
                  </button>
                </>
              ) : (
                <>
                  <Link 
                    href="/login?view=login" 
                    className="px-4 py-2.5 text-sm text-slate-600 hover:bg-slate-50 hover:text-blue-600 rounded-lg font-medium transition-colors flex items-center gap-3"
                    onClick={() => setIsOpen(false)}
                  >
                    Connexion
                  </Link>
                  <Link 
                    href="/login?view=signup" 
                    className="px-4 py-2.5 text-sm bg-blue-600 text-white hover:bg-blue-700 rounded-lg font-medium transition-colors flex items-center justify-center gap-2 mt-1 shadow-sm"
                    onClick={() => setIsOpen(false)}
                  >
                    Inscription
                  </Link>
                </>
              )}
            </nav>
          </div>
        )}
      </div>
    </header>
  );
}
