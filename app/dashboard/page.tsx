"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { createClient } from "@/utils/supabase/client";
import { 
  FileText, 
  Download, 
  Search, 
  Filter, 
  ArrowUpRight,
  Loader2,
  LayoutDashboard,
  CreditCard,
  Settings,
  LogOut,
  PieChart,
  Wallet,
  Bell,
  Video,
  Sparkles,
  ChevronUp
} from "lucide-react";

interface Receipt {
  id: string;
  created_at: string;
  merchant: string;
  date: string;
  amount_total: number;
  currency: string;
  category: string;
  excel_url: string;
  pdf_url: string;
}

export default function DashboardPage() {
  const [receipts, setReceipts] = useState<Receipt[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");
  const [categoryFilter, setCategoryFilter] = useState("ALL");
  const [user, setUser] = useState<any>(null);
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const supabase = createClient();

  useEffect(() => {
    const getUser = async () => {
      const { data: { user } } = await supabase.auth.getUser();
      setUser(user);
    };
    getUser();
  }, []);

  const handleSignOut = async () => {
    await supabase.auth.signOut();
    window.location.href = "/login";
  };

  useEffect(() => {
    const fetchReceipts = async () => {
      try {
        const res = await fetch("/api/receipts");
        if (res.ok) {
          const data = await res.json();
          setReceipts(data);
        }
      } catch (error) {
        console.error("Failed to load receipts", error);
      } finally {
        setLoading(false);
      }
    };

    fetchReceipts();
  }, []);

  const filteredReceipts = receipts.filter((r) => {
    const matchesSearch = 
      r.merchant.toLowerCase().includes(searchTerm.toLowerCase()) ||
      (r.category && r.category.toLowerCase().includes(searchTerm.toLowerCase()));
    
    const matchesCategory = categoryFilter === "ALL" || r.category === categoryFilter;

    return matchesSearch && matchesCategory;
  });

  const totalAmount = filteredReceipts.reduce((sum, r) => sum + (r.amount_total || 0), 0);

  const exportCSV = () => {
    const headers = ["Date,Merchant,Category,Amount,Currency,Link"];
    const rows = filteredReceipts.map(r => 
      `${r.date || ""},"${r.merchant}","${r.category || ""}",${r.amount_total},${r.currency},${window.location.origin}/receipts/${r.id}`
    );
    
    const csvContent = "data:text/csv;charset=utf-8," + headers.concat(rows).join("\n");
    const encodedUri = encodeURI(csvContent);
    const link = document.createElement("a");
    link.setAttribute("href", encodedUri);
    link.setAttribute("download", "receipts_export.csv");
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  return (
    <div className="flex h-screen bg-white text-slate-900 font-sans">
      {/* Sidebar */}
      <aside className="w-64 border-r border-slate-200 bg-white flex flex-col hidden md:flex">
        <div className="p-6 border-b border-slate-200">
          <div className="flex items-center gap-2 text-slate-900 font-bold text-xl">
            <div className="w-8 h-8 bg-blue-600 rounded-lg flex items-center justify-center">
              <FileText className="w-5 h-5 text-white" />
            </div>
            NovaReceipt
          </div>
        </div>
        
        <nav className="flex-1 p-4 space-y-1">
          <div className="px-4 py-2 text-xs font-semibold text-slate-500 uppercase tracking-wider">
            Main
          </div>
          <a href="#" className="flex items-center gap-3 px-4 py-2.5 bg-blue-50 text-blue-600 rounded-lg font-medium">
            <LayoutDashboard className="w-5 h-5" />
            Dashboard
          </a>
          <a href="#" className="flex items-center gap-3 px-4 py-2.5 text-slate-600 hover:text-slate-900 hover:bg-slate-100 rounded-lg transition-colors">
            <Wallet className="w-5 h-5" />
            Transactions
          </a>
          <a href="#" className="flex items-center gap-3 px-4 py-2.5 text-slate-600 hover:text-slate-900 hover:bg-slate-100 rounded-lg transition-colors">
            <PieChart className="w-5 h-5" />
            Analytics
          </a>
          <a href="#" className="flex items-center gap-3 px-4 py-2.5 text-slate-600 hover:text-slate-900 hover:bg-slate-100 rounded-lg transition-colors">
            <CreditCard className="w-5 h-5" />
            Cards
          </a>

          <div className="mt-8 px-4 py-2 text-xs font-semibold text-slate-500 uppercase tracking-wider">
            Settings
          </div>
          <a href="#" className="flex items-center gap-3 px-4 py-2.5 text-slate-600 hover:text-slate-900 hover:bg-slate-100 rounded-lg transition-colors">
            <Settings className="w-5 h-5" />
            Preferences
          </a>
        </nav>

        <div 
          className="p-4 border-t border-slate-200 relative"
          onMouseLeave={() => setIsMenuOpen(false)}
        >
          {isMenuOpen && (
            <div className="absolute bottom-full left-4 right-4 mb-2 bg-white rounded-xl shadow-xl border border-slate-200 overflow-hidden z-50">
              <div className="p-4 border-b border-slate-100">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-full bg-purple-100 flex items-center justify-center text-purple-600 font-bold">
                    {user?.email?.[0].toUpperCase() || "U"}
                  </div>
                  <div className="overflow-hidden">
                    <p className="font-bold text-slate-900 truncate text-sm">{user?.user_metadata?.full_name || "Utilisateur"}</p>
                    <p className="text-xs text-slate-500 truncate">{user?.email}</p>
                  </div>
                </div>
              </div>
              <div className="py-2">
                <button className="w-full flex items-center gap-3 px-4 py-2 text-sm text-slate-600 hover:bg-slate-50 transition-colors">
                  <Video className="w-4 h-4" />
                  Tutoriels de démarrage
                </button>
                <button className="w-full flex items-center gap-3 px-4 py-2 text-sm text-slate-600 hover:bg-slate-50 transition-colors">
                  <Sparkles className="w-4 h-4 text-purple-500" />
                  Réglages IA
                  <span className="w-2 h-2 rounded-full bg-purple-500 ml-auto"></span>
                </button>
                <button className="w-full flex items-center gap-3 px-4 py-2 text-sm text-slate-600 hover:bg-slate-50 transition-colors bg-purple-50 text-purple-700">
                  <CreditCard className="w-4 h-4" />
                  Voir les plans
                </button>
                <button className="w-full flex items-center gap-3 px-4 py-2 text-sm text-slate-600 hover:bg-slate-50 transition-colors">
                  <Settings className="w-4 h-4" />
                  Paramètres du compte
                </button>
                <div className="h-px bg-slate-100 my-1"></div>
                <button onClick={handleSignOut} className="w-full flex items-center gap-3 px-4 py-2 text-sm text-red-600 hover:bg-red-50 transition-colors">
                  <LogOut className="w-4 h-4" />
                  Se déconnecter
                </button>
              </div>
            </div>
          )}

          <button 
            onClick={() => setIsMenuOpen(!isMenuOpen)}
            className="flex items-center gap-3 w-full p-2 hover:bg-slate-50 rounded-lg transition-colors text-left"
          >
            <div className="w-9 h-9 rounded-full bg-gradient-to-br from-purple-500 to-blue-600 flex items-center justify-center text-white font-bold text-sm">
              {user?.email?.[0].toUpperCase() || "M"}
            </div>
            <div className="flex-1 overflow-hidden">
              <p className="text-sm font-medium text-slate-900 truncate">
                {user?.user_metadata?.full_name || "MICHAEL DIA"}
              </p>
              <p className="text-xs text-slate-500">Plan gratuit</p>
            </div>
            <ChevronUp className="w-4 h-4 text-slate-400" />
          </button>
        </div>
      </aside>

      {/* Main Content */}
      <main className="flex-1 flex flex-col overflow-hidden">
        {/* Top Header */}
        <header className="h-16 border-b border-slate-200 bg-white flex items-center justify-between px-6 md:px-8">
          <div className="flex items-center gap-4 md:hidden">
            <div className="w-8 h-8 bg-blue-600 rounded-lg flex items-center justify-center">
              <FileText className="w-5 h-5 text-white" />
            </div>
            <span className="font-bold text-slate-900">NovaReceipt</span>
          </div>
          
          <div className="hidden md:flex items-center gap-2 text-sm text-slate-500">
            <span>Organization</span>
            <span className="text-slate-300">/</span>
            <span className="text-slate-900 font-medium">My Company</span>
          </div>

          <div className="flex items-center gap-4">
            <button className="p-2 text-slate-500 hover:text-slate-900 hover:bg-slate-100 rounded-full transition-colors relative">
              <Bell className="w-5 h-5" />
              <span className="absolute top-2 right-2 w-2 h-2 bg-red-500 rounded-full border-2 border-white"></span>
            </button>
            <div className="w-8 h-8 bg-gradient-to-br from-blue-500 to-purple-600 rounded-full border-2 border-slate-200"></div>
          </div>
        </header>

        {/* Scrollable Content */}
        <div className="flex-1 overflow-y-auto p-4 md:p-6 bg-slate-50">
          <div className="max-w-6xl mx-auto space-y-6">
            
            {/* Page Header */}
            <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
              <div>
                <h1 className="text-2xl font-bold text-slate-900">Overview</h1>
                <p className="text-slate-500 text-sm mt-1">Track your expenses and manage receipts.</p>
              </div>
              <div className="flex gap-3">
                <button 
                  onClick={exportCSV}
                  className="flex items-center gap-2 px-4 py-2 bg-white hover:bg-slate-50 border border-slate-200 text-slate-700 rounded-lg text-sm font-medium transition-colors shadow-sm"
                >
                  <Download className="w-4 h-4" />
                  Export CSV
                </button>
                <Link 
                  href="/scan"
                  className="flex items-center gap-2 px-4 py-2 bg-blue-600 hover:bg-blue-500 text-white rounded-lg text-sm font-medium transition-colors shadow-lg shadow-blue-500/20"
                >
                  <ArrowUpRight className="w-4 h-4" />
                  New Scan
                </Link>
              </div>
            </div>

            {/* Stats Cards - Qonto Style */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div className="bg-white border border-slate-200 p-6 rounded-xl hover:border-slate-300 transition-colors shadow-sm">
                <div className="flex justify-between items-start mb-4">
                  <div className="p-2 bg-blue-50 rounded-lg">
                    <Wallet className="w-5 h-5 text-blue-600" />
                  </div>
                  <span className="text-xs font-medium text-green-600 bg-green-50 px-2 py-1 rounded-full">+12%</span>
                </div>
                <p className="text-slate-500 text-sm font-medium">Total Expenses</p>
                <p className="text-3xl font-bold text-slate-900 mt-1">
                  {totalAmount.toFixed(2)} <span className="text-lg text-slate-400 font-normal">EUR</span>
                </p>
              </div>

              <div className="bg-white border border-slate-200 p-6 rounded-xl hover:border-slate-300 transition-colors shadow-sm">
                <div className="flex justify-between items-start mb-4">
                  <div className="p-2 bg-purple-50 rounded-lg">
                    <FileText className="w-5 h-5 text-purple-600" />
                  </div>
                </div>
                <p className="text-slate-500 text-sm font-medium">Receipts Processed</p>
                <p className="text-3xl font-bold text-slate-900 mt-1">{filteredReceipts.length}</p>
              </div>

              <div className="bg-white border border-slate-200 p-6 rounded-xl hover:border-slate-300 transition-colors shadow-sm">
                <div className="flex justify-between items-start mb-4">
                  <div className="p-2 bg-orange-50 rounded-lg">
                    <PieChart className="w-5 h-5 text-orange-600" />
                  </div>
                </div>
                <p className="text-slate-500 text-sm font-medium">Top Category</p>
                <p className="text-xl font-bold text-slate-900 mt-2 truncate">
                  {filteredReceipts.length > 0 
                    ? filteredReceipts.sort((a,b) => 
                        filteredReceipts.filter(v => v.category === a.category).length - 
                        filteredReceipts.filter(v => v.category === b.category).length
                      ).pop()?.category || "N/A"
                    : "N/A"
                  }
                </p>
              </div>
            </div>

            {/* Filters & Search */}
            <div className="flex flex-col md:flex-row gap-4">
              <div className="relative flex-1">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                <input 
                  type="text" 
                  placeholder="Search by merchant, category..." 
                  className="w-full bg-white border border-slate-200 rounded-lg pl-10 pr-4 py-2.5 text-sm text-slate-900 focus:outline-none focus:ring-2 focus:ring-blue-500/50 focus:border-transparent transition-all shadow-sm"
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                />
              </div>
              <div className="relative w-full md:w-48">
                <Filter className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                <select 
                  className="w-full bg-white border border-slate-200 rounded-lg pl-10 pr-4 py-2.5 text-sm text-slate-900 focus:outline-none focus:ring-2 focus:ring-blue-500/50 focus:border-transparent appearance-none cursor-pointer shadow-sm"
                  value={categoryFilter}
                  onChange={(e) => setCategoryFilter(e.target.value)}
                >
                  <option value="ALL">All Categories</option>
                  <option value="RESTAURANT">Restaurant</option>
                  <option value="COURSES">Courses</option>
                  <option value="TAXI">Taxi</option>
                  <option value="HOTEL">Hotel</option>
                  <option value="TRANSPORT">Transport</option>
                  <option value="ESSENCE">Essence</option>
                  <option value="LOISIR">Loisir</option>
                  <option value="ABONNEMENT">Abonnement</option>
                  <option value="AUTRE">Autre</option>
                </select>
              </div>
            </div>

            {/* Transactions Table */}
            <div className="bg-white border border-slate-200 rounded-xl overflow-hidden shadow-sm">
              <div className="overflow-x-auto">
                <table className="w-full text-left text-sm">
                  <thead className="bg-slate-50 text-slate-500 border-b border-slate-200">
                    <tr>
                      <th className="px-6 py-3 font-medium w-32">Date</th>
                      <th className="px-6 py-3 font-medium">Merchant</th>
                      <th className="px-6 py-3 font-medium">Category</th>
                      <th className="px-6 py-3 font-medium text-right">Amount</th>
                      <th className="px-6 py-3 font-medium text-center">Files</th>
                      <th className="px-6 py-3 font-medium text-right">Actions</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-200">
                    {loading ? (
                      <tr>
                        <td colSpan={6} className="px-6 py-12 text-center text-slate-500">
                          <div className="flex flex-col items-center gap-2">
                            <Loader2 className="w-6 h-6 animate-spin text-blue-500" />
                            <span>Loading transactions...</span>
                          </div>
                        </td>
                      </tr>
                    ) : filteredReceipts.length === 0 ? (
                      <tr>
                        <td colSpan={6} className="px-6 py-12 text-center text-slate-500">
                          No receipts found matching your filters.
                        </td>
                      </tr>
                    ) : (
                      filteredReceipts.map((receipt) => (
                        <tr key={receipt.id} className="hover:bg-slate-50 transition-colors group">
                          <td className="px-6 py-3 text-slate-500 whitespace-nowrap font-mono text-xs">
                            {receipt.date || "N/A"}
                          </td>
                          <td className="px-6 py-3">
                            <div className="font-medium text-slate-900">{receipt.merchant}</div>
                          </td>
                          <td className="px-6 py-3">
                            <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-slate-100 text-slate-700 border border-slate-200">
                              {receipt.category}
                            </span>
                          </td>
                          <td className="px-6 py-3 text-right font-mono font-medium text-slate-900">
                            -{receipt.amount_total?.toFixed(2)} {receipt.currency}
                          </td>
                          <td className="px-6 py-3">
                            <div className="flex justify-center gap-2 opacity-50 group-hover:opacity-100 transition-opacity">
                              {receipt.pdf_url && (
                                <a 
                                  href={receipt.pdf_url} 
                                  target="_blank" 
                                  rel="noopener noreferrer"
                                  className="p-1.5 text-slate-400 hover:text-red-600 hover:bg-red-50 rounded transition-colors"
                                  title="Download PDF"
                                >
                                  <FileText className="w-4 h-4" />
                                </a>
                              )}
                              {receipt.excel_url && (
                                <a 
                                  href={receipt.excel_url} 
                                  target="_blank" 
                                  rel="noopener noreferrer"
                                  className="p-1.5 text-slate-400 hover:text-green-600 hover:bg-green-50 rounded transition-colors"
                                  title="Download Excel"
                                >
                                  <FileText className="w-4 h-4" />
                                </a>
                              )}
                            </div>
                          </td>
                          <td className="px-6 py-3 text-right">
                            <Link 
                              href={`/receipts/${receipt.id}`}
                              className="text-blue-600 hover:text-blue-700 text-xs font-medium hover:underline"
                            >
                              Details
                            </Link>
                          </td>
                        </tr>
                      ))
                    )}
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}
