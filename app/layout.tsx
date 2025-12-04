import type { Metadata } from "next";
import { Inter } from "next/font/google";
import "./globals.css";
import Navbar from "@/components/Navbar";

const inter = Inter({ subsets: ["latin"] });

export const metadata: Metadata = {
  title: "NovaReceipt - Comptabilité Automatisée par IA",
  description: "Transformez vos tickets de caisse en écritures comptables instantanément grâce à l'IA.",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="fr" suppressHydrationWarning>
      <body className={`${inter.className} bg-white text-slate-900 antialiased min-h-screen flex flex-col`} suppressHydrationWarning>
        <Navbar />

        {/* Main Content */}
        <main className="flex-1 w-full max-w-5xl mx-auto px-4 py-8 md:py-12">
          {children}
        </main>

        {/* Footer */}
        <footer className="border-t border-slate-200 py-8 mt-auto">
          <div className="max-w-5xl mx-auto px-4 flex flex-col md:flex-row justify-between items-center gap-4 text-sm text-slate-500">
            <p>&copy; {new Date().getFullYear()} NovaReceipt. Tous droits réservés.</p>
            <a href="/api-docs" className="text-slate-400 hover:text-blue-600 hover:underline transition-colors">
              API Documentation
            </a>
          </div>
        </footer>
      </body>
    </html>
  );
}
