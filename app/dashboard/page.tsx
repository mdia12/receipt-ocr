"use client";

import { useState, useEffect } from "react";
import { Receipt, DashboardStats } from "@/types/receipts";
import DashboardHeader from "@/components/dashboard/DashboardHeader";
import KpiCards from "@/components/dashboard/KpiCards";
import UsageChart from "@/components/dashboard/UsageChart";
import FiltersBar from "@/components/dashboard/FiltersBar";
import ReceiptsTable from "@/components/dashboard/ReceiptsTable";
import ReceiptDrawer from "@/components/dashboard/ReceiptDrawer";
import { HardDrive } from "lucide-react";

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
  const [isDriveConnected, setIsDriveConnected] = useState(false);

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
        const [receiptsRes, driveRes] = await Promise.all([
          fetch("/api/receipts"),
          fetch("/api/auth/google/status")
        ]);

        if (driveRes.ok) {
          const driveData = await driveRes.json();
          setIsDriveConnected(driveData.connected);
        }

        if (!receiptsRes.ok) throw new Error("Failed to fetch receipts");
        
        const data = await receiptsRes.json();
        
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

  const handleConnectDrive = () => {
    window.location.href = "/api/auth/google/init";
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
          
          <div className="lg:col-span-1 space-y-6">
            <UsageChart />
            
            {/* Google Drive Connect Widget */}
            <div className="bg-white p-6 rounded-xl border border-slate-200 shadow-sm">
              <div className="flex items-center gap-3 mb-4">
                <div className={`p-2 rounded-lg ${isDriveConnected ? "bg-green-50" : "bg-blue-50"}`}>
                  <HardDrive className={`w-6 h-6 ${isDriveConnected ? "text-green-600" : "text-blue-600"}`} />
                </div>
                <div>
                  <h3 className="font-semibold text-slate-900">Google Drive</h3>
                  <p className="text-sm text-slate-500">
                    {isDriveConnected ? "Sync active" : "Sync receipts automatically"}
                  </p>
                </div>
              </div>
              <p className="text-sm text-slate-600 mb-4">
                {isDriveConnected 
                  ? "Your receipts are automatically synced to the 'NovaReceipt' folder in your Google Drive."
                  : "Connect your Google Drive to automatically save all your scanned receipts in a dedicated folder."
                }
              </p>
              {isDriveConnected ? (
                <div className="w-full flex items-center justify-center gap-2 px-4 py-2.5 bg-green-50 border border-green-200 text-green-700 font-medium rounded-lg">
                  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                  </svg>
                  Connected
                </div>
              ) : (
                <button 
                  onClick={handleConnectDrive}
                  className="w-full flex items-center justify-center gap-2 px-4 py-2.5 bg-white border border-slate-300 hover:bg-slate-50 text-slate-700 font-medium rounded-lg transition-colors"
                >
                  <svg className="w-5 h-5" viewBox="0 0 24 24">
                    <path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" fill="#4285F4" />
                    <path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" fill="#34A853" />
                    <path d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" fill="#FBBC05" />
                    <path d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" fill="#EA4335" />
                  </svg>
                  Connect Google Drive
                </button>
              )}
            </div>
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
