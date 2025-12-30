"use client";

import { useEffect, useState } from "react";
import StatsCard from "@/components/admin/StatsCard";
import { Users, FileText, Activity, Key } from "lucide-react";

export default function AdminDashboard() {
  const [stats, setStats] = useState({
    totalUsers: 0,
    totalScans: 0,
    activeUsers: 0,
    totalTokens: 0
  });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchStats = async () => {
      try {
        const res = await fetch("/api/admin/stats");
        if (res.ok) {
          const data = await res.json();
          setStats(data);
        }
      } catch (error) {
        console.error("Failed to fetch admin stats", error);
      } finally {
        setLoading(false);
      }
    };

    fetchStats();
  }, []);

  if (loading) {
    return <div className="text-slate-400">Chargement du dashboard...</div>;
  }

  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-3xl font-bold text-white">Dashboard Admin</h1>
        <p className="text-slate-400 mt-2">Vue d'ensemble de l'activité NovaReceipt</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <StatsCard 
          title="Utilisateurs Total" 
          value={stats.totalUsers} 
          icon={Users} 
          trend="+12% vs last month"
          trendUp={true}
        />
        <StatsCard 
          title="Scans Effectués" 
          value={stats.totalScans} 
          icon={FileText} 
          trend="+5% vs last month"
          trendUp={true}
        />
        <StatsCard 
          title="Utilisateurs Actifs (30j)" 
          value={stats.activeUsers} 
          icon={Activity} 
        />
        <StatsCard 
          title="Clés API Actives" 
          value={stats.totalTokens} 
          icon={Key} 
        />
      </div>

      {/* Recent Activity Placeholder */}
      <div className="bg-slate-900 border border-slate-800 rounded-xl p-6">
        <h2 className="text-xl font-bold text-white mb-4">Activité Récente</h2>
        <div className="text-slate-500 text-sm text-center py-8">
          Les logs d'activité apparaîtront ici prochainement.
        </div>
      </div>
    </div>
  );
}
