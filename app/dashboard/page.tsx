"use client";

import { useState, useEffect, useRef } from "react";
import { Receipt, DashboardStats } from "@/types/receipts";
import { parseAmount, normalizeDate } from "@/lib/receipts/normalize";
import DashboardHeader from "@/components/dashboard/DashboardHeader";
import KpiCards from "@/components/dashboard/KpiCards";
import UsageChart from "@/components/dashboard/UsageChart";
import FiltersBar from "@/components/dashboard/FiltersBar";
import ReceiptsTable from "@/components/dashboard/ReceiptsTable";
import ReceiptDrawer from "@/components/dashboard/ReceiptDrawer";
import InsightsCard from "@/components/dashboard/InsightsCard";
import ActionCenter from "@/components/dashboard/ActionCenter";
import AnalysisModal from "@/components/dashboard/AnalysisModal";
import UploadModal from "@/components/dashboard/UploadModal";
import { GoogleDriveCard } from "./GoogleDriveCard";

export default function DashboardPage() {
  // Data State
  const [receipts, setReceipts] = useState<Receipt[]>([]);
  const [stats, setStats] = useState<DashboardStats>({
    totalExpenses: 0,
    totalReceipts: 0,
    totalVAT: 0,
    topCategory: null,
    scansThisMonth: 0,
    planLimit: 50, // Mock limit
    averageExpense: 0,
    monthlyBudget: 2000,
    budgetUsage: 0
  });
  const [loading, setLoading] = useState(true);
  const [authError, setAuthError] = useState(false);
  const isAuthErrorRef = useRef(false);
  const isFetchingRef = useRef(false);

  // Filters State
  const [searchTerm, setSearchTerm] = useState("");
  const [categoryFilter, setCategoryFilter] = useState("ALL");
  const [statusFilter, setStatusFilter] = useState("ALL");

  // UI State
  const [selectedReceipt, setSelectedReceipt] = useState<Receipt | null>(null);
  const [isDrawerOpen, setIsDrawerOpen] = useState(false);
  const [isAnalysisOpen, setIsAnalysisOpen] = useState(false);
  const [isUploadModalOpen, setIsUploadModalOpen] = useState(false);

  // Fetch Data
  const fetchData = async () => {
    if (isAuthErrorRef.current || isFetchingRef.current) return;
    isFetchingRef.current = true;

    try {
      // Don't set loading to true on every poll to avoid flickering
      // setLoading(true); 
      console.log("Fetching receipts...");
      const receiptsRes = await fetch("/api/receipts", {
        headers: {
          'Accept': 'application/json'
        }
      });

      if (receiptsRes.status === 401) {
        console.warn("Session expired or unauthorized.");
        isAuthErrorRef.current = true;
        setAuthError(true);
        setLoading(false);
        return;
      }

      if (!receiptsRes.ok) throw new Error("Failed to fetch receipts");
      
      const json = await receiptsRes.json();
      const data = json.receipts || []; // Handle { receipts: [...] } format
      
      // DEBUG: Log keys of first receipt to identify correct fields
      if (data.length > 0) {
        console.log("Sample receipt keys:", Object.keys(data[0]));
        console.log("Sample receipt raw:", data[0]);
      }

      // Map backend data to frontend Receipt type
      const mappedReceipts: Receipt[] = data.map((item: any) => {
        // Prioritize fields based on common DB column names
        const rawAmount = item.amount ?? item.total ?? item.total_amount ?? item.total_ttc ?? item.montant ?? item.price;
        const rawDate = item.date ?? item.receipt_date ?? item.issued_at ?? item.created_at;
        
        const parsedAmount = parseAmount(rawAmount);
        const dateObj = normalizeDate(rawDate);
        
        // Format date for display (YYYY-MM-DD)
        const displayDate = dateObj ? dateObj.toISOString().split('T')[0] : (item.created_at ? item.created_at.split('T')[0] : null);

        return {
          id: item.id,
          userId: item.user_id || "current_user",
          date: displayDate, 
          merchant: item.merchant || "Unknown Merchant",
          category: item.category || "Uncategorized",
          amount: parsedAmount, 
          currency: item.currency || "EUR",
          status: item.status || "processing",
          file_url: item.pdf_url || item.excel_url || item.file_path || null,
          created_at: item.created_at,
          excel_url: item.excel_url,
          pdf_url: item.pdf_url,
          raw_json: typeof item.raw_json === 'string' ? JSON.parse(item.raw_json) : item.raw_json,
          vat_amount: item.vat_amount,
          extracted_vat: item.extracted_vat, // Map the new column
          // Store parsed date object for internal calculations if needed, 
          // though we use the string 'date' field for most things currently.
          // We can add a temporary property if we want to be strict about types, 
          // but 'date' string is standard in the Receipt type.
          _dateObj: dateObj 
        };
      });

      setReceipts(mappedReceipts);

      // Calculate Stats
      // Only count successful receipts with valid amount
      const validReceipts = mappedReceipts.filter(r => 
        ['success', 'completed'].includes(r.status.toLowerCase()) && 
        r.amount !== null && 
        r.amount > 0
      );
      
      // Check for unparsable data warning
      const totalReceipts = mappedReceipts.length;
      const totalExpenses = validReceipts.reduce((sum, r) => sum + (r.amount || 0), 0);
      
      // Calculate Total VAT
      // We use extracted_vat if available, otherwise fallback to raw_json.extracted_vat
      const totalVAT = validReceipts.reduce((sum, r) => {
          const vat = r.extracted_vat ?? r.raw_json?.extracted_vat ?? 0;
          return sum + (typeof vat === 'number' ? vat : 0);
      }, 0);
      
      // Only warn if we have SUCCESSFUL receipts but 0 expenses
      const successfulReceiptsCount = mappedReceipts.filter(r => ['success', 'completed'].includes(r.status.toLowerCase())).length;
      
      if (successfulReceiptsCount > 0 && totalExpenses === 0) {
         console.warn("Warning: Receipts found but total expenses is 0. Check date/amount parsing.");
      }
      const averageExpense = validReceipts.length > 0 ? totalExpenses / validReceipts.length : 0;
      
      // Mock Budget Logic
      const monthlyBudget = stats.monthlyBudget; // Keep current budget
      const currentMonthExpenses = validReceipts
        .filter(r => {
          // Use the robustly parsed date object if available, otherwise fallback
          const d = (r as any)._dateObj || new Date(r.date || r.created_at);
          if (!d || isNaN(d.getTime())) return false;
          
          const now = new Date();
          return d.getMonth() === now.getMonth() && d.getFullYear() === now.getFullYear();
        })
        .reduce((sum, r) => sum + (r.amount || 0), 0);
      const budgetUsage = (currentMonthExpenses / monthlyBudget) * 100;
      
      // Calculate Top Category
      const categoryCounts: Record<string, number> = {};
      mappedReceipts.forEach(r => {
        const cat = r.category || "Uncategorized";
        categoryCounts[cat] = (categoryCounts[cat] || 0) + 1;
      });
      const topCategory = Object.entries(categoryCounts).sort((a, b) => b[1] - a[1])[0]?.[0] || null;

      // Calculate Scans This Month
      const now = new Date();
      const scansThisMonth = mappedReceipts.filter(r => {
        const d = new Date(r.created_at);
        return d.getMonth() === now.getMonth() && d.getFullYear() === now.getFullYear();
      }).length;

      setStats(prev => ({
        ...prev,
        totalExpenses,
        totalReceipts,
        totalVAT,
        topCategory,
        scansThisMonth,
        averageExpense,
        budgetUsage
      }));
      
      // UI Fallback for unparsable data
      if (totalReceipts > 0 && totalExpenses === 0) {
        // You might want to set a state here to show a warning banner in the UI
        // For now, we'll just log it as requested, but let's add a small toast or alert if needed
        // or just rely on the console warning added above.
      }

    } catch (error) {
      console.error("Error loading dashboard data:", error);
    } finally {
      setLoading(false);
      isFetchingRef.current = false;
    }
  };

      

  useEffect(() => {
    // Check for errors in URL
    const params = new URLSearchParams(window.location.search);
    const error = params.get("error");
    const details = params.get("details");
    if (error) {
      alert(`Échec de la connexion Google Drive: ${error}
Détails: ${details || "Vérifiez la console"}`);
    }

    fetchData();
  }, []);

  // Polling logic
  useEffect(() => {
    const hasProcessing = receipts.some(r => r.status === 'processing');
    
    if (!hasProcessing) return;

    const interval = setInterval(() => {
      console.log("Polling for updates...");
      fetchData();
    }, 5000);

    return () => clearInterval(interval);
  }, [receipts]);

  // Filter Logic
  const filteredReceipts = receipts.filter(r => {
    const matchesSearch = 
      r.merchant.toLowerCase().includes(searchTerm.toLowerCase()) ||
      (r.category && r.category.toLowerCase().includes(searchTerm.toLowerCase()));
    
    const matchesCategory = categoryFilter === "ALL" || r.category === categoryFilter;
    const matchesStatus = statusFilter === "ALL" || r.status === statusFilter;

    return matchesSearch && matchesCategory && matchesStatus;
  });

  // Handlers
  const handleViewDetails = (receipt: Receipt) => {
    setSelectedReceipt(receipt);
    setIsDrawerOpen(true);
  };

  const handleReprocess = async (receipt: Receipt) => {
    console.log("Reprocessing receipt:", receipt.id);
    try {
      const res = await fetch(`/api/receipts/${receipt.id}/reprocess`, {
        method: "POST"
      });
      const data = await res.json();
      
      if (!res.ok) {
        throw new Error(data.error || "Failed to trigger reprocess");
      }
      
      alert("Retraitement terminé avec succès !");
      fetchData(); // Refresh list
    } catch (error: any) {
      console.error("Reprocess error:", error);
      alert(`Erreur: ${error.message}`);
    }
  };

  const handleDelete = (receipt: Receipt) => {
    if (confirm("Êtes-vous sûr de vouloir supprimer ce reçu ?")) {
      setReceipts(prev => prev.filter(r => r.id !== receipt.id));
    }
  };

  const handleCategoryClick = (category: string) => {
    setCategoryFilter(category);
  };

  const handleUpdateBudget = (newBudget: number) => {
    setStats(prev => ({
      ...prev,
      monthlyBudget: newBudget,
      budgetUsage: prev.totalExpenses > 0 ? (prev.totalExpenses / newBudget) * 100 : 0
    }));
  };

  if (authError) {
    return (
      <div className="min-h-screen bg-slate-50 flex items-center justify-center p-4">
        <div className="bg-white p-8 rounded-xl shadow-sm border border-slate-200 max-w-md text-center">
          <h2 className="text-xl font-semibold text-slate-900 mb-2">Session expirée</h2>
          <p className="text-slate-600 mb-6">Votre session a expiré. Veuillez vous reconnecter pour accéder à vos reçus.</p>
          <a href="/login" className="inline-flex justify-center items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500">
            Se connecter
          </a>
        </div>
      </div>
    );
  }

  const handleExport = () => {
    const headers = ["Date,Merchant,Category,Amount,Currency,Link"];
    const rows = filteredReceipts.map(r => 
      `${r.date || ""},"${r.merchant || ""}", "${r.category || ""}",${r.amount ?? 0},${r.currency || ""},${window.location.origin}/receipts/${r.id}`
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
    <div className="min-h-screen bg-slate-50 text-slate-900 p-6 md:p-8 font-sans">
      <div className="max-w-7xl mx-auto space-y-8">
        
        <DashboardHeader 
          onExport={handleExport} 
          onAddReceipt={() => setIsUploadModalOpen(true)}
        />
        
        {/* DEBUG UI */}
        {receipts.some(r => ['success', 'completed'].includes(r.status.toLowerCase())) && stats.totalExpenses === 0 && (
          <div className="bg-amber-50 border border-amber-200 rounded-lg p-4 mb-6 text-sm text-amber-800">
            <p className="font-bold flex items-center gap-2">
              ⚠️ Attention: Reçus détectés mais montant total à 0€
            </p>
            <p className="mt-1">
              Cela indique probablement un problème de parsing des montants ou des dates.
            </p>
            <div className="mt-2 bg-white p-2 rounded border border-amber-100 font-mono text-xs overflow-auto">
              <p>Exemple de reçu brut (1er élément):</p>
              <pre>{JSON.stringify(receipts[0], null, 2)}</pre>
            </div>
          </div>
        )}
        
        <KpiCards stats={stats} onUpdateBudget={handleUpdateBudget} />
        
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 items-start">
          {/* Main Chart Section */}
          <div className="lg:col-span-2 bg-white p-6 rounded-xl border border-slate-100 shadow-sm">
            <div className="flex items-center justify-between mb-6">
              <h3 className="text-lg font-semibold text-slate-900">Dépenses cumulées</h3>
            </div>
            <UsageChart receipts={receipts} monthlyBudget={stats.monthlyBudget} />
          </div>
          
          {/* Sidebar: Insights & Actions */}
          <div className="lg:col-span-1 flex flex-col gap-6">
            <InsightsCard stats={stats} onViewFullAnalysis={() => setIsAnalysisOpen(true)} />
            <ActionCenter 
              onExport={handleExport} 
              onAddReceipt={() => setIsUploadModalOpen(true)} 
            />
            <GoogleDriveCard />
          </div>
        </div>

        {/* Table Section */}
        <div className="space-y-6">
          <div className="flex items-center justify-between">
            <h3 className="text-lg font-semibold text-slate-900">Détail des dépenses</h3>
          </div>
          
          <FiltersBar 
            searchTerm={searchTerm}
            onSearchChange={setSearchTerm}
            categoryFilter={categoryFilter}
            onCategoryChange={setCategoryFilter}
            statusFilter={statusFilter}
            onStatusChange={setStatusFilter}
          />
          
          <ReceiptsTable 
            receipts={filteredReceipts}
            loading={loading}
            onViewDetails={handleViewDetails}
            onReprocess={handleReprocess}
            onDelete={handleDelete}
            onCategoryClick={handleCategoryClick}
          />
        </div>

        <ReceiptDrawer 
          receipt={selectedReceipt}
          isOpen={isDrawerOpen}
          onClose={() => setIsDrawerOpen(false)}
          onReprocess={handleReprocess}
        />

        <AnalysisModal 
          isOpen={isAnalysisOpen}
          onClose={() => setIsAnalysisOpen(false)}
          stats={stats}
          receipts={receipts}
        />

        <UploadModal 
          isOpen={isUploadModalOpen}
          onClose={() => setIsUploadModalOpen(false)}
          onUploadSuccess={() => {
            console.log("Upload success, refreshing data...");
            fetchData();
          }}
        />

      </div>
    </div>
  );
}
