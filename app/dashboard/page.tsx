"use client";

import { useState, useEffect } from "react";
import { Receipt, DashboardStats } from "@/types/receipts";
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
    topCategory: null,
    scansThisMonth: 0,
    planLimit: 50, // Mock limit
    averageExpense: 0,
    monthlyBudget: 2000,
    budgetUsage: 0
  });
  const [loading, setLoading] = useState(true);

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
    try {
      // Don't set loading to true on every poll to avoid flickering
      // setLoading(true); 
      console.log("Fetching receipts...");
      const receiptsRes = await fetch("/api/receipts");

      if (!receiptsRes.ok) throw new Error("Failed to fetch receipts");
      
      const json = await receiptsRes.json();
      const data = json.receipts || []; // Handle { receipts: [...] } format
      console.log("Receipts data received:", data);
      
      // Map backend data to frontend Receipt type
      const mappedReceipts: Receipt[] = data.map((item: any) => ({
        id: item.id,
        userId: item.user_id || "current_user",
        date: item.date || item.created_at,
        merchant: item.merchant || "Unknown Merchant",
        category: item.category || "Uncategorized",
        amount: item.amount, // Keep null if null
        currency: item.currency || "EUR",
        status: item.status || "processing", // Use actual status
        file_url: item.pdf_url || item.excel_url || item.file_path || null,
        created_at: item.created_at,
        // Keep original fields if needed
        excel_url: item.excel_url,
        pdf_url: item.pdf_url,
        raw_json: item.raw_json
      }));

      setReceipts(mappedReceipts);

      // Calculate Stats
      // Only count successful receipts with valid amount
      const validReceipts = mappedReceipts.filter(r => r.status === 'success' && r.amount !== null);
      const totalExpenses = validReceipts.reduce((sum, r) => sum + (r.amount || 0), 0);
      const totalReceipts = mappedReceipts.length;
      const averageExpense = validReceipts.length > 0 ? totalExpenses / validReceipts.length : 0;
      
      // Mock Budget Logic
      const monthlyBudget = stats.monthlyBudget; // Keep current budget
      const currentMonthExpenses = validReceipts
        .filter(r => {
          const d = new Date(r.date || r.created_at);
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
        topCategory,
        scansThisMonth,
        averageExpense,
        budgetUsage
      }));

    } catch (error) {
      console.error("Error loading dashboard data:", error);
    } finally {
      setLoading(false);
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

    // Polling logic: if any receipt is processing, poll every 5s
    const interval = setInterval(() => {
      setReceipts(currentReceipts => {
        const hasProcessing = currentReceipts.some(r => r.status === 'processing');
        if (hasProcessing) {
          console.log("Polling for updates...");
          fetchData();
        }
        return currentReceipts;
      });
    }, 5000);

    return () => clearInterval(interval);
  }, []);

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

  const handleReprocess = (receipt: Receipt) => {
    console.log("Reprocessing receipt:", receipt.id);
    // TODO: Implement reprocess logic
    alert("Fonctionnalité de retraitement bientôt disponible !");
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
