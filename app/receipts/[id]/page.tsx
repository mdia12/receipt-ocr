import Link from "next/link";
import { ArrowLeft, Download, FileText } from "lucide-react";

export default async function ReceiptPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  
  // Mock data - in real app, fetch based on id
  const receipt = {
    id: id,
    date: "2023-10-25",
    merchant: "Uber",
    amount: "$24.50",
    items: [
      { description: "Ride to Airport", quantity: 1, price: "$24.50" }
    ],
    tax: "$2.50",
    total: "$24.50",
    imageUrl: "https://via.placeholder.com/400x600?text=Receipt+Image"
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-4">
        <Link
          href="/dashboard"
          className="p-2 text-slate-400 hover:text-white hover:bg-slate-800 rounded-lg transition-colors"
        >
          <ArrowLeft className="w-5 h-5" />
        </Link>
        <h1 className="text-2xl font-bold text-white">Receipt Details</h1>
        <div className="ml-auto flex gap-2">
          <button className="flex items-center gap-2 px-3 py-2 bg-slate-800 hover:bg-slate-700 text-slate-200 rounded-lg text-sm font-medium transition-colors">
            <Download className="w-4 h-4" />
            Export PDF
          </button>
          <button className="flex items-center gap-2 px-3 py-2 bg-slate-800 hover:bg-slate-700 text-slate-200 rounded-lg text-sm font-medium transition-colors">
            <FileText className="w-4 h-4" />
            Export Excel
          </button>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        {/* Receipt Image */}
        <div className="bg-slate-900 rounded-xl border border-slate-800 p-4 flex items-center justify-center min-h-[500px]">
          {/* Replace with actual image component */}
          <div className="relative w-full h-full min-h-[400px] bg-slate-950 rounded-lg flex items-center justify-center text-slate-600">
             {/* eslint-disable-next-line @next/next/no-img-element */}
             <img src={receipt.imageUrl} alt="Receipt" className="max-w-full max-h-full object-contain opacity-80" />
          </div>
        </div>

        {/* Extracted Data */}
        <div className="space-y-6">
          <div className="bg-slate-900 rounded-xl border border-slate-800 p-6 space-y-6">
            <h2 className="text-lg font-semibold text-white border-b border-slate-800 pb-4">Extracted Data</h2>
            
            <div className="grid grid-cols-2 gap-6">
              <div>
                <label className="block text-xs font-medium text-slate-500 uppercase mb-1">Merchant</label>
                <div className="text-lg font-medium text-white">{receipt.merchant}</div>
              </div>
              <div>
                <label className="block text-xs font-medium text-slate-500 uppercase mb-1">Date</label>
                <div className="text-lg font-medium text-white">{receipt.date}</div>
              </div>
              <div>
                <label className="block text-xs font-medium text-slate-500 uppercase mb-1">Total Amount</label>
                <div className="text-2xl font-bold text-green-400">{receipt.total}</div>
              </div>
              <div>
                <label className="block text-xs font-medium text-slate-500 uppercase mb-1">Tax</label>
                <div className="text-lg font-medium text-slate-300">{receipt.tax}</div>
              </div>
            </div>

            <div>
              <label className="block text-xs font-medium text-slate-500 uppercase mb-3">Line Items</label>
              <div className="bg-slate-950 rounded-lg border border-slate-800 overflow-hidden">
                <table className="w-full text-sm text-left">
                  <thead className="bg-slate-900 text-slate-400 font-medium">
                    <tr>
                      <th className="px-4 py-2">Description</th>
                      <th className="px-4 py-2 text-right">Qty</th>
                      <th className="px-4 py-2 text-right">Price</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-800 text-slate-300">
                    {receipt.items.map((item, i) => (
                      <tr key={i}>
                        <td className="px-4 py-2">{item.description}</td>
                        <td className="px-4 py-2 text-right">{item.quantity}</td>
                        <td className="px-4 py-2 text-right">{item.price}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
