"use client";

import { Search, Filter, Calendar } from "lucide-react";

interface FiltersBarProps {
  searchTerm: string;
  onSearchChange: (value: string) => void;
  categoryFilter: string;
  onCategoryChange: (value: string) => void;
  statusFilter: string;
  onStatusChange: (value: string) => void;
}

export default function FiltersBar({
  searchTerm,
  onSearchChange,
  categoryFilter,
  onCategoryChange,
  statusFilter,
  onStatusChange
}: FiltersBarProps) {
  return (
    <div className="flex flex-col md:flex-row gap-4 mb-6">
      {/* Search Input */}
      <div className="relative flex-1">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
        <input 
          type="text" 
          placeholder="Search by merchant, category..." 
          className="w-full bg-white border border-slate-200 rounded-lg pl-10 pr-4 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-violet-500/20 focus:border-violet-500 transition-all shadow-sm"
          value={searchTerm}
          onChange={(e) => onSearchChange(e.target.value)}
        />
      </div>

      {/* Category Select */}
      <div className="relative w-full md:w-48">
        <Filter className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
        <select 
          className="w-full bg-white border border-slate-200 rounded-lg pl-10 pr-8 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-violet-500/20 focus:border-violet-500 appearance-none shadow-sm cursor-pointer"
          value={categoryFilter}
          onChange={(e) => onCategoryChange(e.target.value)}
        >
          <option value="ALL">All Categories</option>
          <option value="RESTAURANT">Restaurant</option>
          <option value="COURSES">Groceries</option>
          <option value="TAXI">Taxi</option>
          <option value="HOTEL">Hotel</option>
          <option value="TRANSPORT">Transport</option>
          <option value="ESSENCE">Fuel</option>
          <option value="LOISIR">Leisure</option>
          <option value="ABONNEMENT">Subscription</option>
          <option value="AUTRE">Other</option>
        </select>
        <div className="absolute right-3 top-1/2 -translate-y-1/2 pointer-events-none">
          <svg className="w-4 h-4 text-slate-400" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 9l-7 7-7-7"></path></svg>
        </div>
      </div>

      {/* Status Select */}
      <div className="relative w-full md:w-40">
        <div className="absolute left-3 top-1/2 -translate-y-1/2 w-2 h-2 rounded-full bg-slate-300"></div>
        <select 
          className="w-full bg-white border border-slate-200 rounded-lg pl-8 pr-8 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-violet-500/20 focus:border-violet-500 appearance-none shadow-sm cursor-pointer"
          value={statusFilter}
          onChange={(e) => onStatusChange(e.target.value)}
        >
          <option value="ALL">All Status</option>
          <option value="success">Success</option>
          <option value="partial">Partial</option>
          <option value="failed">Failed</option>
        </select>
        <div className="absolute right-3 top-1/2 -translate-y-1/2 pointer-events-none">
          <svg className="w-4 h-4 text-slate-400" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 9l-7 7-7-7"></path></svg>
        </div>
      </div>

      {/* Date Range (Mock) */}
      <button className="flex items-center gap-2 px-4 py-2 bg-white border border-slate-200 rounded-lg text-sm text-slate-600 hover:bg-slate-50 shadow-sm transition-colors">
        <Calendar className="w-4 h-4 text-slate-400" />
        <span>This Month</span>
      </button>
    </div>
  );
}
