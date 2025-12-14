"use client";

import { useState, useMemo } from "react";
import { BarChart3, TrendingUp, TrendingDown, Info } from "lucide-react";
import { Receipt } from "@/types/receipts";

type Period = "day" | "week" | "month" | "year";

interface UsageChartProps {
  receipts?: Receipt[];
  monthlyBudget?: number;
}

export default function UsageChart({ receipts = [], monthlyBudget = 2000 }: UsageChartProps) {
  const [period, setPeriod] = useState<Period>("month");

  const { data: chartData, totalCurrent, totalPrevious, periodTotal } = useMemo(() => {
    const now = new Date();
    const data: { label: string; value: number; date: Date }[] = [];
    let currentTotal = 0;
    let previousTotal = 0;

    // Calculate Start Balance (expenses before the current period)
    let startDate: Date;
    if (period === "day") {
       startDate = new Date(now.getFullYear(), now.getMonth(), now.getDate(), 0, 0, 0);
    } else if (period === "week") {
       startDate = new Date(now);
       startDate.setDate(startDate.getDate() - 6);
       startDate.setHours(0,0,0,0);
    } else if (period === "month") {
       startDate = new Date(now);
       startDate.setDate(startDate.getDate() - 29);
       startDate.setHours(0,0,0,0);
    } else { // year
       startDate = new Date(now.getFullYear(), now.getMonth() - 11, 1);
       startDate.setHours(0,0,0,0);
    }

    const startBalance = receipts.reduce((sum, r) => {
        if (!r.date) return sum;
        const d = new Date(r.date);
        return d < startDate ? sum + (r.amount_total || 0) : sum;
    }, 0);

    if (period === "day") {
      // Hours of Today (00:00 to 23:59)
      for (let i = 0; i < 24; i++) {
        data.push({ 
          label: `${i}h`, 
          value: 0, 
          date: new Date(now.getFullYear(), now.getMonth(), now.getDate(), i) 
        });
      }
      
      // Previous day for comparison
      const yesterday = new Date(now);
      yesterday.setDate(yesterday.getDate() - 1);

      receipts.forEach(r => {
        if (!r.date) return;
        const d = new Date(r.date);
        const amount = r.amount_total || 0;

        // Current Day
        if (d.getDate() === now.getDate() && d.getMonth() === now.getMonth() && d.getFullYear() === now.getFullYear()) {
          const hour = d.getHours();
          if (data[hour]) data[hour].value += amount;
          currentTotal += amount;
        }
        
        // Previous Day
        if (d.getDate() === yesterday.getDate() && d.getMonth() === yesterday.getMonth() && d.getFullYear() === yesterday.getFullYear()) {
          previousTotal += amount;
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

      // Previous week range
      const prevWeekStart = new Date(now);
      prevWeekStart.setDate(prevWeekStart.getDate() - 13);
      const prevWeekEnd = new Date(now);
      prevWeekEnd.setDate(prevWeekEnd.getDate() - 7);

      receipts.forEach(r => {
        if (!r.date) return;
        const d = new Date(r.date);
        const amount = r.amount_total || 0;

        // Current Week
        const dayIndex = data.findIndex(item => 
          item.date.getDate() === d.getDate() && 
          item.date.getMonth() === d.getMonth() &&
          item.date.getFullYear() === d.getFullYear()
        );
        if (dayIndex !== -1) {
          data[dayIndex].value += amount;
          currentTotal += amount;
        }

        // Previous Week
        if (d >= prevWeekStart && d < prevWeekEnd) {
          previousTotal += amount;
        }
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

      // Previous month range
      const prevMonthStart = new Date(now);
      prevMonthStart.setDate(prevMonthStart.getDate() - 59);
      const prevMonthEnd = new Date(now);
      prevMonthEnd.setDate(prevMonthEnd.getDate() - 29);

      receipts.forEach(r => {
        if (!r.date) return;
        const d = new Date(r.date);
        const amount = r.amount_total || 0;

        // Current Month
        const dayIndex = data.findIndex(item => 
          item.date.getDate() === d.getDate() && 
          item.date.getMonth() === d.getMonth() &&
          item.date.getFullYear() === d.getFullYear()
        );
        if (dayIndex !== -1) {
          data[dayIndex].value += amount;
          currentTotal += amount;
        }

        // Previous Month
        if (d >= prevMonthStart && d < prevMonthEnd) {
          previousTotal += amount;
        }
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

      // Previous year range
      const prevYearStart = new Date(now.getFullYear() - 1, now.getMonth() - 11, 1);
      const prevYearEnd = new Date(now.getFullYear() - 1, now.getMonth() + 1, 0);

      receipts.forEach(r => {
        if (!r.date) return;
        const d = new Date(r.date);
        const amount = r.amount_total || 0;

        // Current Year
        const monthIndex = data.findIndex(item => 
          item.date.getMonth() === d.getMonth() && 
          item.date.getFullYear() === d.getFullYear()
        );
        if (monthIndex !== -1) {
          data[monthIndex].value += amount;
          currentTotal += amount;
        }

        // Previous Year
        if (d >= prevYearStart && d <= prevYearEnd) {
          previousTotal += amount;
        }
      });
    }

    // Transform to cumulative data
    let runningTotal = startBalance;
    const cumulativeData = data.map(item => {
      runningTotal += item.value;
      return { ...item, value: runningTotal };
    });

    return { 
      data: cumulativeData, 
      totalCurrent: runningTotal, // Final cumulative value
      periodTotal: currentTotal, // Spending in this period
      totalPrevious: previousTotal 
    };
  }, [receipts, period]);

  const maxValue = Math.max(...chartData.map(d => d.value), monthlyBudget, 1);
  const budgetY = 100 - (monthlyBudget / maxValue) * 100;
  
  // Calculate percentage change
  const percentageChange = totalPrevious > 0 
    ? ((periodTotal - totalPrevious) / totalPrevious) * 100 
    : 0;
  
  const isPositive = percentageChange > 0;

  // Generate Insight
  const insight = useMemo(() => {
    const periodLabels: Record<Period, string> = {
      day: "jour",
      week: "semaine",
      month: "mois",
      year: "année"
    };
    const periodLabel = periodLabels[period];

    if (periodTotal === 0) return "Aucune dépense enregistrée pour cette période.";
    
    const trendText = totalPrevious === 0 
      ? "Pas de données pour la période précédente." 
      : `Les dépenses sont en ${isPositive ? "hausse" : "baisse"} de ${Math.abs(percentageChange).toFixed(1)}% par rapport à la période précédente.`;
      
    return `Vous avez dépensé ${periodTotal.toFixed(2)}€ ce ${periodLabel}. ${trendText}`;
  }, [periodTotal, totalPrevious, percentageChange, period, isPositive]);

  return (
    <div className="bg-white p-6 rounded-xl border border-slate-200 shadow-sm">
      <div className="flex flex-col sm:flex-row items-center justify-between mb-6 gap-4">
        <div className="flex items-center gap-3">
          <div className="p-2 bg-blue-50 rounded-lg">
            <BarChart3 className="w-5 h-5 text-blue-600" />
          </div>
          <div>
            <h3 className="font-semibold text-slate-900">Dépenses cumulées</h3>
            <div className="flex items-center gap-2">
              <span className="text-2xl font-bold text-slate-900">
                {totalCurrent.toLocaleString('fr-FR', { style: 'currency', currency: 'EUR' })}
              </span>
              {totalPrevious > 0 && (
                <span className={`text-xs font-medium px-2 py-0.5 rounded-full flex items-center gap-1 ${
                  isPositive ? 'bg-red-50 text-red-600' : 'bg-green-50 text-green-600'
                }`}>
                  {isPositive ? <TrendingUp className="w-3 h-3" /> : <TrendingDown className="w-3 h-3" />}
                  {Math.abs(percentageChange).toFixed(1)}%
                </span>
              )}
            </div>
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

      <div className="flex h-64 w-full select-none">
        {/* Y-Axis Labels */}
        <div className="flex flex-col justify-between text-[10px] text-slate-400 font-medium pr-2 pb-6 h-full w-12 text-right shrink-0">
          <span>{maxValue.toLocaleString('fr-FR', { maximumFractionDigits: 0 })}€</span>
          <span>{(maxValue * 0.75).toLocaleString('fr-FR', { maximumFractionDigits: 0 })}€</span>
          <span>{(maxValue * 0.5).toLocaleString('fr-FR', { maximumFractionDigits: 0 })}€</span>
          <span>{(maxValue * 0.25).toLocaleString('fr-FR', { maximumFractionDigits: 0 })}€</span>
          <span>0€</span>
        </div>

        <div className="relative flex-1 h-full">
          {/* Chart Area (SVG) */}
          <div className="absolute top-0 left-0 right-0 bottom-6 z-0">
            <svg className="w-full h-full overflow-visible" preserveAspectRatio="none" viewBox="0 0 100 100">
              <defs>
                <linearGradient id="gradientArea" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="0%" stopColor="#7c3aed" stopOpacity="0.2" />
                  <stop offset="100%" stopColor="#7c3aed" stopOpacity="0" />
                </linearGradient>
              </defs>
              
              {/* Grid Lines */}
              {[0, 25, 50, 75, 100].map((y) => (
                <line 
                  key={y}
                  x1="0" 
                  y1={y} 
                  x2="100" 
                  y2={y} 
                  stroke="#e2e8f0" 
                  strokeWidth="1" 
                  vectorEffect="non-scaling-stroke" 
                />
              ))}

              <path 
                d={`M0,100 ${chartData.map((d, i) => `L${(i / (chartData.length - 1 || 1)) * 100},${100 - (d.value / maxValue) * 100}`).join(' ')} L100,100 Z`} 
                fill="url(#gradientArea)" 
              />
              {/* Budget Line */}
              <line 
                x1="0" 
                y1={budgetY} 
                x2="100" 
                y2={budgetY} 
                stroke="#94a3b8" 
                strokeWidth="1" 
                strokeDasharray="4 4" 
                vectorEffect="non-scaling-stroke" 
                opacity="0.5"
              />
              <text x="2" y={budgetY - 2} fontSize="3" fill="#94a3b8" className="select-none">Budget</text>

              <path 
                d={`M0,${100 - (chartData[0]?.value / maxValue) * 100} ${chartData.map((d, i) => `L${(i / (chartData.length - 1 || 1)) * 100},${100 - (d.value / maxValue) * 100}`).join(' ')}`} 
                fill="none" 
                stroke="#7c3aed" 
                strokeWidth="2" 
                vectorEffect="non-scaling-stroke" 
                strokeLinecap="round"
                strokeLinejoin="round"
              />
            </svg>
          </div>

          {/* Interaction Layer */}
          <div className="absolute inset-0 z-10 flex items-end pl-[1px]">
            {chartData.map((item, index) => (
              <div key={index} className="flex-1 h-full flex flex-col justify-end group relative">
                {/* Hover Line */}
                <div className="absolute top-0 bottom-6 left-1/2 w-px bg-violet-500/0 group-hover:bg-violet-500/50 transition-colors"></div>
                
                {/* Dot */}
                <div 
                  className="absolute left-1/2 -translate-x-1/2 w-2 h-2 bg-violet-600 rounded-full border border-white shadow-sm opacity-0 group-hover:opacity-100 transition-opacity"
                  style={{ 
                    bottom: `calc(1.5rem + ${(item.value / maxValue) * 100}% * (1 - 24px / 100%) - 4px)`
                  }}
                ></div>

                {/* Tooltip */}
                <div className="opacity-0 group-hover:opacity-100 absolute bottom-full left-1/2 -translate-x-1/2 mb-2 px-3 py-2 bg-slate-900 text-white text-xs rounded-lg whitespace-nowrap pointer-events-none transition-all transform translate-y-1 group-hover:translate-y-0 shadow-xl z-20">
                  <div className="font-bold text-sm">{item.value.toFixed(2)} €</div>
                  <div className="text-[10px] text-slate-300 font-medium">{item.label}</div>
                  {/* Arrow */}
                  <div className="absolute top-full left-1/2 -translate-x-1/2 border-4 border-transparent border-t-slate-900"></div>
                </div>

                {/* Label */}
                <div className={`h-6 w-full flex items-center justify-center text-[10px] text-slate-400 font-medium truncate ${
                   chartData.length > 20 && index % 2 !== 0 ? 'hidden sm:flex' : ''
                }`}>
                  {item.label}
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Insight Footer */}
      <div className="mt-6 pt-4 border-t border-slate-100 flex items-start gap-3">
        <Info className="w-5 h-5 text-slate-400 shrink-0 mt-0.5" />
        <p className="text-sm text-slate-600 leading-relaxed">
          {insight}
        </p>
      </div>
    </div>
  );
}
