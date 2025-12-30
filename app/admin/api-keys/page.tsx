"use client";

import { useEffect, useState } from "react";
import { Loader2, Plus, Trash2, Copy, Check, Key } from "lucide-react";

interface ApiKey {
  id: string;
  name: string;
  masked_key: string;
  created_at: string;
  last_used_at: string | null;
  is_active: boolean;
}

interface User {
  id: string;
  email: string;
}

export default function ApiKeysPage() {
  const [keys, setKeys] = useState<ApiKey[]>([]);
  const [users, setUsers] = useState<User[]>([]);
  const [loading, setLoading] = useState(true);
  const [creating, setCreating] = useState(false);
  const [newKey, setNewKey] = useState<string | null>(null);
  
  // Form State
  const [selectedUser, setSelectedUser] = useState("");
  const [keyName, setKeyName] = useState("");

  useEffect(() => {
    const fetchData = async () => {
      try {
        const [keysRes, usersRes] = await Promise.all([
          fetch("/api/admin/api-keys"),
          fetch("/api/admin/users")
        ]);
        
        if (keysRes.ok) setKeys(await keysRes.json());
        if (usersRes.ok) setUsers(await usersRes.json());
      } catch (error) {
        console.error("Failed to load data", error);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, []);

  const handleCreateKey = async (e: React.FormEvent) => {
    e.preventDefault();
    setCreating(true);
    try {
      const res = await fetch("/api/admin/api-keys", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ userId: selectedUser, name: keyName })
      });
      
      if (res.ok) {
        const data = await res.json();
        setNewKey(data.rawKey);
        // Refresh list
        const keysRes = await fetch("/api/admin/api-keys");
        if (keysRes.ok) setKeys(await keysRes.json());
        // Reset form
        setKeyName("");
        setSelectedUser("");
      }
    } catch (error) {
      console.error("Failed to create key", error);
    } finally {
      setCreating(false);
    }
  };

  const handleRevoke = async (id: string) => {
    if (!confirm("Are you sure you want to revoke this key? This action cannot be undone.")) return;
    
    try {
      const res = await fetch(`/api/admin/api-keys?id=${id}`, { method: "DELETE" });
      if (res.ok) {
        setKeys(keys.filter(k => k.id !== id));
      }
    } catch (error) {
      console.error("Failed to revoke key", error);
    }
  };

  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-3xl font-bold text-white">API Keys</h1>
        <p className="text-slate-400 mt-1">Gérer les accès API pour les utilisateurs</p>
      </div>

      {/* Create Key Form */}
      <div className="bg-slate-900 border border-slate-800 rounded-xl p-6">
        <h2 className="text-lg font-semibold text-white mb-4 flex items-center gap-2">
          <Plus className="w-5 h-5 text-blue-500" />
          Générer une nouvelle clé
        </h2>
        <form onSubmit={handleCreateKey} className="flex flex-col md:flex-row gap-4 items-end">
          <div className="flex-1 w-full">
            <label className="block text-sm font-medium text-slate-400 mb-1">Utilisateur</label>
            <select 
              required
              className="w-full bg-slate-950 border border-slate-700 rounded-lg px-4 py-2.5 text-white focus:ring-2 focus:ring-blue-500 focus:outline-none"
              value={selectedUser}
              onChange={(e) => setSelectedUser(e.target.value)}
            >
              <option value="">Sélectionner un utilisateur...</option>
              {users.map(u => (
                <option key={u.id} value={u.id}>{u.email}</option>
              ))}
            </select>
          </div>
          <div className="flex-1 w-full">
            <label className="block text-sm font-medium text-slate-400 mb-1">Nom de la clé</label>
            <input 
              type="text" 
              required
              placeholder="ex: Production App"
              className="w-full bg-slate-950 border border-slate-700 rounded-lg px-4 py-2.5 text-white focus:ring-2 focus:ring-blue-500 focus:outline-none"
              value={keyName}
              onChange={(e) => setKeyName(e.target.value)}
            />
          </div>
          <button 
            type="submit" 
            disabled={creating || !selectedUser || !keyName}
            className="px-6 py-2.5 bg-blue-600 hover:bg-blue-500 text-white font-medium rounded-lg transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {creating ? <Loader2 className="w-5 h-5 animate-spin" /> : "Générer"}
          </button>
        </form>

        {/* New Key Display */}
        {newKey && (
          <div className="mt-6 p-4 bg-green-500/10 border border-green-500/20 rounded-lg animate-in fade-in slide-in-from-top-2">
            <div className="flex items-start gap-3">
              <div className="p-2 bg-green-500/20 rounded-lg text-green-400">
                <Key className="w-5 h-5" />
              </div>
              <div className="flex-1">
                <h3 className="text-green-400 font-medium mb-1">Clé générée avec succès !</h3>
                <p className="text-green-400/80 text-sm mb-3">Copiez cette clé maintenant. Elle ne sera plus jamais affichée.</p>
                <div className="flex items-center gap-2 bg-slate-950 border border-green-500/30 rounded px-3 py-2 font-mono text-green-300 text-sm break-all">
                  {newKey}
                  <button 
                    onClick={() => navigator.clipboard.writeText(newKey)}
                    className="ml-auto p-1.5 hover:bg-green-500/20 rounded text-green-400 transition-colors"
                    title="Copier"
                  >
                    <Copy className="w-4 h-4" />
                  </button>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Keys List */}
      <div className="bg-slate-900 border border-slate-800 rounded-xl overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-sm">
            <thead className="bg-slate-950 text-slate-400 border-b border-slate-800">
              <tr>
                <th className="px-6 py-4 font-medium">Nom</th>
                <th className="px-6 py-4 font-medium">Clé (Masquée)</th>
                <th className="px-6 py-4 font-medium">Créée le</th>
                <th className="px-6 py-4 font-medium">Dernière utilisation</th>
                <th className="px-6 py-4 font-medium text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-800">
              {loading ? (
                <tr>
                  <td colSpan={5} className="px-6 py-12 text-center text-slate-500">
                    <Loader2 className="w-6 h-6 animate-spin mx-auto mb-2" />
                    Chargement...
                  </td>
                </tr>
              ) : keys.length === 0 ? (
                <tr>
                  <td colSpan={5} className="px-6 py-12 text-center text-slate-500">
                    Aucune clé API active.
                  </td>
                </tr>
              ) : (
                keys.map((key) => (
                  <tr key={key.id} className="hover:bg-slate-800/50 transition-colors">
                    <td className="px-6 py-4 text-white font-medium">
                      {key.name}
                    </td>
                    <td className="px-6 py-4 font-mono text-slate-400">
                      {key.masked_key}
                    </td>
                    <td className="px-6 py-4 text-slate-400">
                      {new Date(key.created_at).toLocaleDateString()}
                    </td>
                    <td className="px-6 py-4 text-slate-400">
                      {key.last_used_at ? new Date(key.last_used_at).toLocaleDateString() : "Jamais"}
                    </td>
                    <td className="px-6 py-4 text-right">
                      <button 
                        onClick={() => handleRevoke(key.id)}
                        className="p-2 text-slate-400 hover:text-red-400 hover:bg-red-400/10 rounded-lg transition-colors"
                        title="Révoquer"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
