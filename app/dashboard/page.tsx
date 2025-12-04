"use client";

import { useState, useEffect } from "react";
import { Receipt, DashboardStats } from "@/types/receipts";
import DashboardHeader from "@/components/dashboard/DashboardHeader";
import KpiCards from "@/components/dashboard/KpiCards";
import UsageChart from "@/components/dashboard/UsageChart";
import FiltersBar from "@/components/dashboard/FiltersBar";
import ReceiptsTable from "@/components/dashboard/ReceiptsTable";
import ReceiptDrawer from "@/components/dashboard/ReceiptDrawer";

// --- MOCK DATA ---
const MOCK_RECEIPTS: Receipt[] = [
  {
    id: "REC-001",
    userId: "user_123",
    date: "2025-12-04T10:30:00Z",
    merchant: "Uber",
    category: "TRANSPORT",
    amount: 24.50,
    currency: "EUR",
    status: "success",
    fileUrl: "https://placehold.co/400x600/png?text=Receipt+Uber",
    createdAt: "2025-12-04T10:35:00Z",
    items: [{ description: "Course UberX", amount: 24.50 }]
  },
  {
    id: "REC-002",
    userId: "user_123",
    date: "2025-12-03T19:15:00Z",
    merchant: "Restaurant Le Petit Zinc",
    category: "RESTAURANT",
    amount: 85.00,
    currency: "EUR",
    status: "success",
    fileUrl: "https://placehold.co/400x600/png?text=Receipt+Restaurant",
    createdAt: "2025-12-03T20:00:00Z",
    items: [{ description: "Menu Dîner", amount: 85.00 }]
  },
  {
    id: "REC-003",
    userId: "user_123",
    date: "2025-12-01T09:00:00Z",
    merchant: "Apple Store",
    category: "AUTRE",
    amount: 1299.00,
    currency: "EUR",
    status: "partial",
    fileUrl: "https://placehold.co/400x600/png?text=Receipt+Apple",
    createdAt: "2025-12-01T09:30:00Z",
    items: [{ description: "MacBook Air", amount: 1299.00 }]
  },
  {
    id: "REC-004",
    userId: "user_123",
    date: "2025-11-28T14:20:00Z",
    merchant: "Station Shell",
    category: "ESSENCE",
    amount: 65.40,
    currency: "EUR",
    status: "success",
    fileUrl: "https://placehold.co/400x600/png?text=Receipt+Shell",
    createdAt: "2025-11-28T14:25:00Z"
  },
  {
    id: "REC-005",
    userId: "user_123",
    date: "2025-11-25T08:45:00Z",
    merchant: "Starbucks",
    category: "RESTAURANT",
    amount: 12.50,
    currency: "EUR",
    status: "failed",
    fileUrl: "https://placehold.co/400x600/png?text=Receipt+Starbucks",
    createdAt: "2025-11-25T08:50:00Z"
  }
];

const MOCK_STATS: DashboardStats = {
  totalExpenses: 1486.40,
  totalReceipts: 142,
  topCategory: "RESTAURANT",
  scansThisMonth: 12,
  planLimit: 50
};

export default function DashboardPage() {
  // State
  const [receipts, setReceipts] = useState<Receipt[]>([]);
  const [stats, setStats] = useState<DashboardStats>(MOCK_STATS);
  const [loading, setLoading] = useState(true);
  
  // Filters State
  const [searchTerm, setSearchTerm] = useState("");
  const [categoryFilter, setCategoryFilter] = useState("ALL");
  const [statusFilter, setStatusFilter] = useState("ALL");

  // Drawer State
  const [selectedReceipt, setSelectedReceipt] = useState<Receipt | null>(null);
  const [isDrawerOpen, setIsDrawerOpen] = useState(false);

  // Fetch Data (Simulated)
  useEffect(() => {
    const fetchData = async () => {
      // Simulate API delay
      await new Promise(resolve => setTimeout(resolve, 800));
      setReceipts(MOCK_RECEIPTS);
      setLoading(false);
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
    <div className="min-h-screen bg-slate-50 p-6 md:p-8 font-sans text-slate-900">
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
