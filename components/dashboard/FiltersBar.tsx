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
    <div className="flex flex-col md:flex-row gap-4 bg-white dark:bg-slate-900 p-4 rounded-xl border border-slate-100 dark:border-slate-800 shadow-sm mb-6 transition-colors">
      {/* Search */}
      <div className="relative flex-1">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400 dark:text-slate-500" />
        <input 
          type="text" 
          placeholder="Rechercher commerçant, catégorie..." 
          className="w-full bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg pl-10 pr-4 py-2 text-sm text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-violet-500/50 focus:border-violet-500 transition-all placeholder:text-slate-400 dark:placeholder:text-slate-500"
          value={searchTerm}
          onChange={(e) => onSearchChange(e.target.value)}
        />
      </div>

      {/* Category Filter */}
      <div className="relative w-full md:w-48">
        <Filter className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400 dark:text-slate-500" />
        <select 
          className="w-full bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg pl-10 pr-8 py-2 text-sm text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-violet-500/50 focus:border-violet-500 appearance-none cursor-pointer"
          value={categoryFilter}
          onChange={(e) => onCategoryChange(e.target.value)}
        >
          <option value="ALL">Toutes catégories</option>
          <option value="RESTAURANT">Restaurant</option>
          <option value="COURSES">Courses</option>
          <option value="TAXI">Taxi</option>
          <option value="HOTEL">Hôtel</option>
          <option value="TRANSPORT">Transport</option>
          <option value="ESSENCE">Essence</option>
          <option value="LOISIR">Loisir</option>
          <option value="ABONNEMENT">Abonnement</option>
          <option value="AUTRE">Autre</option>
        </select>
      </div>

      {/* Status Filter */}
      <div className="relative w-full md:w-40">
        <div className="absolute left-3 top-1/2 -translate-y-1/2 w-2 h-2 rounded-full bg-slate-400 dark:bg-slate-500"></div>
        <select 
          className="w-full bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg pl-8 pr-8 py-2 text-sm text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-violet-500/50 focus:border-violet-500 appearance-none cursor-pointer"
          value={statusFilter}
          onChange={(e) => onStatusChange(e.target.value)}
        >
          <option value="ALL">Tous statuts</option>
          <option value="success">Succès</option>
          <option value="partial">Partiel</option>
          <option value="failed">Échec</option>
          <option value="processing">En cours</option>
        </select>
      </div>
    </div>
  );
}
