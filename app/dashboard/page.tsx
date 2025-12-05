"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { 
  FileText, 
  Download, 
  Search, 
  Filter, 
  ArrowUpRight,
  Loader2,
  LayoutDashboard
} from "lucide-react";
import { Receipt, DashboardStats } from "@/types/receipts";

export default function DashboardPage() {
  // State
  const [receipts, setReceipts] = useState<Receipt[]>([]);
  const [stats, setStats] = useState<DashboardStats>({
    totalExpenses: 0,
    totalReceipts: 0,
    topCategory: "N/A",
    scansThisMonth: 0,
    planLimit: 50
  });
  const [loading, setLoading] = useState(true);
  
  // Filters State
  const [searchTerm, setSearchTerm] = useState("");
  const [categoryFilter, setCategoryFilter] = useState("ALL");
  const [statusFilter, setStatusFilter] = useState("ALL");

  // Drawer State
  const [selectedReceipt, setSelectedReceipt] = useState<Receipt | null>(null);
  const [isDrawerOpen, setIsDrawerOpen] = useState(false);

  // Fetch Data
  useEffect(() => {
    const fetchData = async () => {
      try {
        const res = await fetch("/api/receipts");
        if (!res.ok) throw new Error("Failed to fetch receipts");
        
        const data = await res.json();
        
        // Map backend data to frontend Receipt type
        const mappedReceipts: Receipt[] = data.map((item: any) => ({
          id: item.id,
          userId: "current_user",
          date: item.date || item.created_at,
          merchant: item.merchant || "Inconnu",
          category: item.category || "AUTRE",
          amount: item.amount_total || 0,
          currency: item.currency || "EUR",
          status: "success",
          fileUrl: item.pdf_url || item.excel_url || "",
          createdAt: item.created_at,
          items: []
        }));

        setReceipts(mappedReceipts);

        // Calculate Stats
        const totalExpenses = mappedReceipts.reduce((sum, r) => sum + r.amount, 0);
        const totalReceipts = mappedReceipts.length;
        
        // Calculate Top Category
        const categoryCounts: Record<string, number> = {};
        mappedReceipts.forEach(r => {
          const cat = r.category || "AUTRE";
          categoryCounts[cat] = (categoryCounts[cat] || 0) + 1;
        });
        const topCategory = Object.entries(categoryCounts).sort((a, b) => b[1] - a[1])[0]?.[0] || "N/A";

        // Calculate Scans This Month
        const now = new Date();
        const scansThisMonth = mappedReceipts.filter(r => {
          const d = new Date(r.createdAt);
          return d.getMonth() === now.getMonth() && d.getFullYear() === now.getFullYear();
        }).length;

        setStats({
          totalExpenses,
          totalReceipts,
          topCategory,
          scansThisMonth,
          planLimit: 50
        });

      } catch (error) {
        console.error("Error loading dashboard data:", error);
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, []);

  // Filter Logic
  const filteredReceipts = receipts.filter(r => {
    const matchesSearch = 
      r.merchant.toLowerCase().includes(searchTerm.toLowerCase()) ||
      r.category.toLowerCase().includes(searchTerm.toLowerCase());
    
    const matchesCategory = categoryFilter === "ALL" || r.category === categoryFilter;
    const matchesStatus = statusFilter === "ALL" || r.status === statusFilter;

    return matchesSearch && matchesCategory && matchesStatus;
  });

  // Handlers
  const handleViewDetails = (receipt: Receipt) => {
    setSelectedReceipt(receipt);
    setIsDrawerOpen(true);
  };

  const handleReprocess = (receipt: Receipt) => {
    console.log("Reprocessing receipt:", receipt.id);
    // TODO: Call API to reprocess
  };

  const handleDelete = (receipt: Receipt) => {
    if (confirm("Êtes-vous sûr de vouloir supprimer ce reçu ?")) {
      setReceipts(prev => prev.filter(r => r.id !== receipt.id));
    }
  };

  const handleExport = () => {
    const headers = ["Date,Merchant,Category,Amount,Currency,Link"];
    const rows = filteredReceipts.map(r => 
      `${r.date || ""},"${r.merchant}","${r.category || ""}",${r.amount},${r.currency},${window.location.origin}/receipts/${r.id}`
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
    <div className="min-h-screen bg-slate-950 text-slate-200 p-6 md:p-12">
      <div className="max-w-6xl mx-auto space-y-8">
        
        {/* Header */}
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
          <div>
            <h1 className="text-3xl font-bold text-white flex items-center gap-3">
              <LayoutDashboard className="w-8 h-8 text-blue-500" />
              Tableau de bord
            </h1>
            <p className="text-slate-400 mt-1">Gérez et suivez vos dépenses</p>
          </div>
          <div className="flex gap-3">
            <button 
              onClick={handleExport}
              className="flex items-center gap-2 px-4 py-2 bg-slate-800 hover:bg-slate-700 border border-slate-700 rounded-lg transition-colors"
            >
              <Download className="w-4 h-4" />
              Exporter CSV
            </button>
            <Link 
              href="/dashboard/scan"
              className="flex items-center gap-2 px-4 py-2 bg-blue-600 hover:bg-blue-500 text-white rounded-lg font-medium transition-colors shadow-lg shadow-blue-500/20"
            >
              <ArrowUpRight className="w-4 h-4" />
              Nouveau Scan
            </Link>
          </div>
        </div>

        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <div className="bg-slate-900/50 border border-slate-800 p-6 rounded-xl">
            <p className="text-slate-400 text-sm font-medium">Dépenses Totales</p>
            <p className="text-3xl font-bold text-white mt-2">
              {stats.totalExpenses.toFixed(2)} <span className="text-lg text-slate-500">EUR</span>
            </p>
          </div>
          <div className="bg-slate-900/50 border border-slate-800 p-6 rounded-xl">
            <p className="text-slate-400 text-sm font-medium">Reçus Scannés</p>
            <p className="text-3xl font-bold text-white mt-2">{filteredReceipts.length}</p>
          </div>
          <div className="bg-slate-900/50 border border-slate-800 p-6 rounded-xl">
            <p className="text-slate-400 text-sm font-medium">Top Catégorie</p>
            <p className="text-xl font-bold text-white mt-2 truncate">
              {stats.topCategory}
            </p>
          </div>
        </div>

        {/* Filters */}
        <div className="flex flex-col md:flex-row gap-4 bg-slate-900/30 p-4 rounded-xl border border-slate-800/50">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-500" />
            <input 
              type="text" 
              placeholder="Rechercher commerçant ou catégorie..." 
              className="w-full bg-slate-950 border border-slate-800 rounded-lg pl-10 pr-4 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500/50"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </div>
          <div className="relative w-full md:w-48">
            <Filter className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-500" />
            <select 
              className="w-full bg-slate-950 border border-slate-800 rounded-lg pl-10 pr-4 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500/50 appearance-none"
              value={categoryFilter}
              onChange={(e) => setCategoryFilter(e.target.value)}
            >
              <option value="ALL">Toutes Catégories</option>
              <option value="RESTAURANT">Restaurant</option>
              <option value="COURSES">Courses</option>
              <option value="TAXI">Taxi</option>
              <option value="HOTEL">Hôtel</option>
              <option value="TRANSPORT">Transport</option>
              <option value="ESSENCE">Essence</option>
              <option value="LOISIR">Loisir</option>
              <option value="ABONNEMENT">Abonnement</option>
              <option value="AUTRE">Autre</option>
            </select>
          </div>
        </div>

        {/* Table */}
        <div className="bg-slate-900 border border-slate-800 rounded-xl overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-left text-sm">
              <thead className="bg-slate-950 text-slate-400 border-b border-slate-800">
                <tr>
                  <th className="px-6 py-4 font-medium">Date</th>
                  <th className="px-6 py-4 font-medium">Commerçant</th>
                  <th className="px-6 py-4 font-medium">Catégorie</th>
                  <th className="px-6 py-4 font-medium text-right">Montant</th>
                  <th className="px-6 py-4 font-medium text-center">Fichiers</th>
                  <th className="px-6 py-4 font-medium text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-800">
                {loading ? (
                  <tr>
                    <td colSpan={6} className="px-6 py-12 text-center text-slate-500">
                      <Loader2 className="w-6 h-6 animate-spin mx-auto mb-2" />
                      Chargement des reçus...
                    </td>
                  </tr>
                ) : filteredReceipts.length === 0 ? (
                  <tr>
                    <td colSpan={6} className="px-6 py-12 text-center text-slate-500">
                      Aucun reçu trouvé.
                    </td>
                  </tr>
                ) : (
                  filteredReceipts.map((receipt) => (
                    <tr key={receipt.id} className="hover:bg-slate-800/50 transition-colors group">
                      <td className="px-6 py-4 text-slate-300 whitespace-nowrap">
                        {receipt.date || <span className="text-slate-600">N/A</span>}
                      </td>
                      <td className="px-6 py-4 font-medium text-white">
                        {receipt.merchant}
                      </td>
                      <td className="px-6 py-4">
                        <span className="px-2.5 py-1 rounded-full text-xs font-medium bg-slate-800 text-slate-300 border border-slate-700">
                          {receipt.category}
                        </span>
                      </td>
                      <td className="px-6 py-4 text-right font-mono text-slate-200">
                        {receipt.amount?.toFixed(2)} {receipt.currency}
                      </td>
                      <td className="px-6 py-4">
                        <div className="flex justify-center gap-2">
                          {receipt.fileUrl && (
                            <a 
                              href={receipt.fileUrl} 
                              target="_blank" 
                              rel="noopener noreferrer"
                              className="p-1.5 text-slate-400 hover:text-blue-400 hover:bg-blue-400/10 rounded transition-colors"
                              title="Voir le fichier"
                            >
                              <FileText className="w-4 h-4" />
                            </a>
                          )}
                        </div>
                      </td>
                      <td className="px-6 py-4 text-right">
                        <Link 
                          href={`/receipts/${receipt.id}`}
                          className="text-blue-400 hover:text-blue-300 text-xs font-medium hover:underline"
                        >
                          Voir Détails
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
  );
}
