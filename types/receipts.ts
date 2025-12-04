export type ReceiptStatus = "success" | "partial" | "failed" | "processing";

export type Receipt = {
  id: string;
  userId: string;
  date: string;            // ISO string
  merchant: string;
  category: string;
  amount: number;
  currency: string;
  status: ReceiptStatus;   // success / partial / failed
  fileUrl: string;         // URL du PDF ou de l’image
  createdAt: string;
  items?: Array<{ description: string; amount: number }>; // Optional items detail
};

export type DashboardStats = {
  totalExpenses: number;
  totalReceipts: number;
  topCategory: string | null;
  scansThisMonth: number;
  planLimit: number | null;     // ex: 100 scans
};
