"use client";

import { useState, useEffect } from "react";
import { Receipt, DashboardStats } from "@/types/receipts";
import DashboardHeader from "@/components/dashboard/DashboardHeader";
import KpiCards from "@/components/dashboard/KpiCards";
import UsageChart from "@/components/dashboard/UsageChart";
import FiltersBar from "@/components/dashboard/FiltersBar";
import ReceiptsTable from "@/components/dashboard/ReceiptsTable";
import ReceiptDrawer from "@/components/dashboard/ReceiptDrawer";

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
    console.log("Exporting CSV...");
    // TODO: Implement CSV export
  };

  return (
    <div className="min-h-screen bg-slate-50 dark:bg-slate-950 p-6 md:p-8 font-sans text-slate-900 dark:text-slate-50 transition-colors duration-300">
      <div className="max-w-7xl mx-auto">
        
        <DashboardHeader onExport={handleExport} />

        <KpiCards stats={stats} />

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-8">
          <div className="lg:col-span-2">
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
            />
          </div>
          <div className="lg:col-span-1">
            <UsageChart />
          </div>
        </div>

      </div>

      <ReceiptDrawer 
        isOpen={isDrawerOpen}
        onClose={() => setIsDrawerOpen(false)}
        receipt={selectedReceipt}
        onReprocess={handleReprocess}
      />
    </div>
  );
}
