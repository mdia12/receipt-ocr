"use client";

import { useState, useMemo } from "react";
import { BarChart3 } from "lucide-react";
import { Receipt } from "@/types/receipts";

type Period = "day" | "week" | "month" | "year";

interface UsageChartProps {
  receipts?: Receipt[];
}

export default function UsageChart({ receipts = [] }: UsageChartProps) {
  const [period, setPeriod] = useState<Period>("month");

  const chartData = useMemo(() => {
    const now = new Date();
    const data: { label: string; value: number; date: Date }[] = [];

    if (period === "day") {
      // Hours of Today (00:00 to 23:59)
      for (let i = 0; i < 24; i++) {
        data.push({ 
          label: `${i}h`, 
          value: 0, 
          date: new Date(now.getFullYear(), now.getMonth(), now.getDate(), i) 
        });
      }
      receipts.forEach(r => {
        if (!r.date) return;
        const d = new Date(r.date);
        if (d.getDate() === now.getDate() && d.getMonth() === now.getMonth() && d.getFullYear() === now.getFullYear()) {
          const hour = d.getHours();
          if (data[hour]) data[hour].value += (r.amount_total || 0);
        }
      });
    } else if (period === "week") {
      // Last 7 days
      for (let i = 6; i >= 0; i--) {
        const d = new Date(now);
        d.setDate(d.getDate() - i);
        data.push({ 
          label: d.toLocaleDateString('fr-FR', { weekday: 'short' }), 
          value: 0,
          date: d 
        });
      }
      receipts.forEach(r => {
        if (!r.date) return;
        const d = new Date(r.date);
        const dayIndex = data.findIndex(item => 
          item.date.getDate() === d.getDate() && 
          item.date.getMonth() === d.getMonth() &&
          item.date.getFullYear() === d.getFullYear()
        );
        if (dayIndex !== -1) data[dayIndex].value += (r.amount_total || 0);
      });
    } else if (period === "month") {
      // Last 30 days
      for (let i = 29; i >= 0; i--) {
        const d = new Date(now);
        d.setDate(d.getDate() - i);
        data.push({ 
          label: d.getDate().toString(), 
          value: 0,
          date: d 
        });
      }
      receipts.forEach(r => {
        if (!r.date) return;
        const d = new Date(r.date);
        const dayIndex = data.findIndex(item => 
          item.date.getDate() === d.getDate() && 
          item.date.getMonth() === d.getMonth() &&
          item.date.getFullYear() === d.getFullYear()
        );
        if (dayIndex !== -1) data[dayIndex].value += (r.amount_total || 0);
      });
    } else if (period === "year") {
      // Last 12 months
      for (let i = 11; i >= 0; i--) {
        const d = new Date(now.getFullYear(), now.getMonth() - i, 1);
        data.push({ 
          label: d.toLocaleDateString('fr-FR', { month: 'short' }), 
          value: 0,
          date: d 
        });
      }
      receipts.forEach(r => {
        if (!r.date) return;
        const d = new Date(r.date);
        const monthIndex = data.findIndex(item => 
          item.date.getMonth() === d.getMonth() && 
          item.date.getFullYear() === d.getFullYear()
        );
        if (monthIndex !== -1) data[monthIndex].value += (r.amount_total || 0);
      });
    }

    return data;
  }, [receipts, period]);

  const maxValue = Math.max(...chartData.map(d => d.value), 1);

  return (
    <div className="bg-white p-6 rounded-xl border border-slate-200 shadow-sm">
      <div className="flex flex-col sm:flex-row items-center justify-between mb-6 gap-4">
        <div className="flex items-center gap-3">
          <div className="p-2 bg-blue-50 rounded-lg">
            <BarChart3 className="w-5 h-5 text-blue-600" />
          </div>
          <div>
            <h3 className="font-semibold text-slate-900">Dépenses</h3>
            <p className="text-sm text-slate-500">Aperçu de vos dépenses cumulées</p>
          </div>
        </div>
        
        <div className="flex bg-slate-100 p-1 rounded-lg">
          {(["day", "week", "month", "year"] as Period[]).map((p) => (
            <button
              key={p}
              onClick={() => setPeriod(p)}
              className={`px-3 py-1.5 text-sm font-medium rounded-md transition-all ${
                period === p 
                  ? "bg-white text-slate-900 shadow-sm" 
                  : "text-slate-500 hover:text-slate-700"
              }`}
            >
              {p === "day" && "Jour"}
              {p === "week" && "Semaine"}
              {p === "month" && "Mois"}
              {p === "year" && "Année"}
            </button>
          ))}
        </div>
      </div>

      <div className="h-64 w-full flex items-end gap-2">
        {chartData.map((item, index) => (
          <div key={index} className="flex-1 flex flex-col items-center gap-2 group h-full justify-end">
            <div className="w-full relative flex items-end h-full bg-slate-50/50 rounded-t-sm overflow-hidden">
              <div 
                className="w-full bg-blue-500 hover:bg-blue-600 transition-all duration-500 rounded-t-sm relative group-hover:opacity-90"
                style={{ height: `${(item.value / maxValue) * 100}%` }}
              >
                <div className="opacity-0 group-hover:opacity-100 absolute bottom-full left-1/2 -translate-x-1/2 mb-2 px-2 py-1 bg-slate-900 text-white text-xs rounded whitespace-nowrap z-10 pointer-events-none transition-opacity shadow-lg">
                  {item.value.toFixed(2)} €
                </div>
              </div>
            </div>
            <span className="text-[10px] text-slate-400 font-medium truncate w-full text-center">
              {item.label}
            </span>
          </div>
        ))}
      </div>
    </div>
  );
}
