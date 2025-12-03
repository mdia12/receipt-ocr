import type { Metadata } from "next";
import { Inter } from "next/font/google";
import "./globals.css";
import Link from "next/link";
import { LayoutDashboard, LogIn, LogOut } from "lucide-react";

const inter = Inter({ subsets: ["latin"] });

export const metadata: Metadata = {
  title: "Receipt OCR",
  description: "Turn your messy receipts into clean accounting data.",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body className={`${inter.className} bg-white text-slate-900 antialiased min-h-screen flex flex-col`} suppressHydrationWarning>
        {/* Navbar */}
        <header className="border-b border-slate-200 bg-white/80 backdrop-blur-md sticky top-0 z-50">
          <div className="max-w-5xl mx-auto px-4 h-16 flex items-center justify-between">
            <Link href="/" className="flex items-center gap-2 font-bold text-xl tracking-tight text-slate-900 hover:opacity-90 transition-opacity">
              <div className="w-8 h-8 bg-blue-600 rounded-lg flex items-center justify-center text-white font-mono text-sm">
                R
              </div>
              Receipt OCR
            </Link>
            
            <nav className="flex items-center gap-6 text-sm font-medium text-slate-600">
              <Link 
                href="/dashboard" 
                className="flex items-center gap-2 hover:text-blue-600 transition-colors"
              >
                <LayoutDashboard className="w-4 h-4" />
                Dashboard
              </Link>
              <div className="h-4 w-px bg-slate-200"></div>
              <Link 
                href="/login" 
                className="flex items-center gap-2 hover:text-blue-600 transition-colors"
              >
                <LogIn className="w-4 h-4" />
                Login
              </Link>
            </nav>
          </div>
        </header>

        {/* Main Content */}
        <main className="flex-1 w-full max-w-5xl mx-auto px-4 py-8 md:py-12">
          {children}
        </main>

        {/* Footer */}
        <footer className="border-t border-slate-200 py-8 mt-auto">
          <div className="max-w-5xl mx-auto px-4 text-center text-slate-500 text-sm">
            <p>&copy; {new Date().getFullYear()} Receipt OCR. All rights reserved.</p>
          </div>
        </footer>
      </body>
    </html>
  );
}
