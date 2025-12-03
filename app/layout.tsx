import type { Metadata } from "next";
import { Inter } from "next/font/google";
import "./globals.css";
import Link from "next/link";

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
    <html lang="en">
      <body className={`${inter.className} bg-slate-950 text-slate-100 antialiased`}>
        <div className="min-h-screen flex flex-col">
          {/* Navbar */}
          <header className="border-b border-slate-800 bg-slate-900/50 backdrop-blur-sm sticky top-0 z-10">
            <div className="max-w-5xl mx-auto px-4 h-16 flex items-center justify-between">
              <Link href="/" className="font-bold text-xl tracking-tight text-white">
                Receipt OCR
              </Link>
              <nav className="flex gap-4 text-sm font-medium text-slate-300">
                <Link href="/dashboard" className="hover:text-white transition-colors">
                  Dashboard
                </Link>
                <Link href="/login" className="hover:text-white transition-colors">
                  Login
                </Link>
              </nav>
            </div>
          </header>

          {/* Main Content */}
          <main className="flex-1 w-full max-w-5xl mx-auto px-4 py-8">
            {children}
          </main>

          {/* Footer */}
          <footer className="border-t border-slate-800 py-6 text-center text-slate-500 text-sm">
            &copy; {new Date().getFullYear()} Receipt OCR. All rights reserved.
          </footer>
        </div>
      </body>
    </html>
  );
}
