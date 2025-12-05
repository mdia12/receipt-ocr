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
  // Data State
  const [receipts, setReceipts] = useState<Receipt[]>([]);
  const [stats, setStats] = useState<DashboardStats>({
    totalExpenses: 0,
    totalReceipts: 0,
    topCategory: null,
    scansThisMonth: 0,
    planLimit: 50 // Mock limit
  });
  const [loading, setLoading] = useState(true);

  // Filters State
  const [searchTerm, setSearchTerm] = useState("");
  const [categoryFilter, setCategoryFilter] = useState("ALL");
  const [statusFilter, setStatusFilter] = useState("ALL");

  // UI State
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
          userId: "current_user", // Placeholder
          date: item.date || item.created_at,
          merchant: item.merchant || "Unknown Merchant",
          category: item.category || "Uncategorized",
          amount_total: item.amount_total || 0,
          currency: item.currency || "EUR",
          status: "success", // Mock status as backend might not have it yet
          file_url: item.pdf_url || item.excel_url || null,
          created_at: item.created_at,
          // Keep original fields if needed
          excel_url: item.excel_url,
          pdf_url: item.pdf_url
        }));

        setReceipts(mappedReceipts);

        // Calculate Stats
        const totalExpenses = mappedReceipts.reduce((sum, r) => sum + (r.amount_total || 0), 0);
        const totalReceipts = mappedReceipts.length;
        
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
    alert("Reprocess feature coming soon!");
  };

  const handleExport = () => {
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
    <div className="min-h-screen bg-slate-50 text-slate-900 p-6 md:p-8 font-sans">
      <div className="max-w-7xl mx-auto">
        
        <DashboardHeader onExport={handleExport} />
        
        <KpiCards stats={stats} />
        
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          <div className="lg:col-span-2 space-y-6">
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
            />
          </div>
          
          <div className="lg:col-span-1">
            <UsageChart />
            {/* Additional widgets can go here */}
          </div>
        </div>

        <ReceiptDrawer 
          receipt={selectedReceipt}
          isOpen={isDrawerOpen}
          onClose={() => setIsDrawerOpen(false)}
          onReprocess={handleReprocess}
        />

      </div>
    </div>
  );
}
