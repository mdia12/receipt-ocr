export type ReceiptStatus = "processing" | "success" | "failed";

export interface ReceiptItem {
  description: string;
  quantity: number;
  price: number;
}

export interface Receipt {
  id: string;
  date: string;
  merchant: string;
  amount: number;
  currency: string;
  status: ReceiptStatus;
  items?: ReceiptItem[];
  tax?: number;
  imageUrl?: string;
  fileName?: string;
}
