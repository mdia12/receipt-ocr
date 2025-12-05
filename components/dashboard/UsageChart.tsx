import { BarChart3 } from "lucide-react";

export default function UsageChart() {
  return (
    <div className="bg-slate-900/50 p-6 rounded-xl border border-slate-800 shadow-sm mb-8 flex flex-col items-center justify-center h-64 text-center">
      <div className="p-4 bg-slate-800 rounded-full mb-4">
        <BarChart3 className="w-8 h-8 text-slate-400" />
      </div>
      <h3 className="text-lg font-medium text-white">Monthly Expenses Chart</h3>
      <p className="text-slate-400 text-sm mt-1">
        Coming soon: Visualize your spending trends over time.
      </p>
    </div>
  );
}
