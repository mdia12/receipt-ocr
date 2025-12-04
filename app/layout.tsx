import type { Metadata } from "next";
import { Inter } from "next/font/google";
import "./globals.css";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import { createClient } from "@/utils/supabase/server";

const inter = Inter({ subsets: ["latin"] });

export const metadata: Metadata = {
  title: "NovaReceipt - Comptabilité Automatisée par IA",
  description: "Transformez vos tickets de caisse en écritures comptables instantanément grâce à l'IA.",
};

export default async function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();

  return (
    <html lang="fr" suppressHydrationWarning>
      <body className={`${inter.className} bg-white text-slate-900 antialiased min-h-screen flex flex-col`} suppressHydrationWarning>
        <Navbar user={user} />

        {/* Main Content */}
        <main className="flex-1 w-full">
          {children}
        </main>

        <Footer />
      </body>
    </html>
  );
}
