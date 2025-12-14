export type ReceiptStatus = "success" | "partial" | "failed" | "processing";

export type Receipt = {
  id: string;
  userId: string;
  date: string | null;            // ISO string
  merchant: string;
  category: string | null;
  amount: number | null;
  currency: string | null;
  status: ReceiptStatus;   // success / partial / failed
  file_url: string | null;         // URL du PDF ou de l’image
  created_at: string;
  // Optional fields for compatibility if needed
  items?: any[];
  excel_url?: string | null;
  pdf_url?: string | null;
};

export type DashboardStats = {
  totalExpenses: number;
  totalReceipts: number;
  topCategory: string | null;
  scansThisMonth: number;
  planLimit: number | null;     // ex: 100 scans
  averageExpense: number;
  monthlyBudget: number;
  budgetUsage: number;
};
