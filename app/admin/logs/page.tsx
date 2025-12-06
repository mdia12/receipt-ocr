"use client";

import { useEffect, useState } from "react";
import { Loader2 } from "lucide-react";

interface AdminLog {
  id: string;
  action: string;
  admin_email: string;
  metadata: any;
  created_at: string;
}

export default function AdminLogsPage() {
  const [logs, setLogs] = useState<AdminLog[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchLogs();
  }, []);

  const fetchLogs = async () => {
    try {
      const res = await fetch("/api/admin/logs");
      if (res.ok) {
        const data = await res.json();
        setLogs(data);
      }
    } catch (error) {
      console.error("Failed to fetch logs", error);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <h1 className="text-3xl font-bold tracking-tight text-white">Audit Logs</h1>

      <div className="bg-slate-900 border border-slate-800 rounded-xl overflow-hidden">
        <div className="p-6 border-b border-slate-800">
          <h2 className="text-xl font-semibold text-white">Recent Admin Actions</h2>
        </div>
        <div className="p-0">
          <div className="relative w-full overflow-auto">
            <table className="w-full caption-bottom text-sm text-left">
              <thead className="bg-slate-950 text-slate-400 border-b border-slate-800">
                <tr>
                  <th className="h-12 px-6 align-middle font-medium">
                    Timestamp
                  </th>
                  <th className="h-12 px-6 align-middle font-medium">
                    Admin
                  </th>
                  <th className="h-12 px-6 align-middle font-medium">
                    Action
                  </th>
                  <th className="h-12 px-6 align-middle font-medium">
                    Details
                  </th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-800">
                {logs.map((log) => (
                  <tr
                    key={log.id}
                    className="hover:bg-slate-800/50 transition-colors"
                  >
                    <td className="p-6 align-middle text-slate-300">
                      {new Date(log.created_at).toLocaleString()}
                    </td>
                    <td className="p-6 align-middle text-slate-300">{log.admin_email}</td>
                    <td className="p-6 align-middle font-medium">
                      <span className="inline-flex items-center rounded-full border px-2.5 py-0.5 text-xs font-semibold transition-colors border-transparent bg-slate-800 text-slate-300">
                        {log.action}
                      </span>
                    </td>
                    <td className="p-6 align-middle font-mono text-xs text-slate-500">
                      {JSON.stringify(log.metadata)}
                    </td>
                  </tr>
                ))}
                {logs.length === 0 && (
                  <tr>
                    <td colSpan={4} className="p-6 text-center text-slate-500">
                      No logs found.
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </div>
  );
}
