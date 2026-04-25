"use client";

import { useState, useEffect, useCallback } from "react";

const BACKEND = process.env.NEXT_PUBLIC_BACKEND_URL ?? "http://localhost:4000";

const PROVIDERS = [
  { id: "openai",      label: "OpenAI",      color: "#10a37f" },
  { id: "anthropic",   label: "Anthropic",   color: "#d97706" },
  { id: "google",      label: "Google",      color: "#4285F4" },
  { id: "meta",        label: "Meta",        color: "#0866FF" },
  { id: "mistral",     label: "Mistral",     color: "#7C3AED" },
  { id: "xai",         label: "xAI",         color: "#111827" },
  { id: "deepseek",    label: "DeepSeek",    color: "#0EA5E9" },
  { id: "perplexity",  label: "Perplexity",  color: "#20B2AA" },
  { id: "replicate",   label: "Replicate",   color: "#EF4444" },
];

interface ApiKey {
  id: number;
  provider: string;
  label: string;
  is_active: boolean;
  masked_key: string;
  created_at: string;
  updated_at: string;
}

/* ── tiny helper ─────────────────────────────────────────── */
function authHeader(token: string) {
  return { "Content-Type": "application/json", Authorization: `Bearer ${token}` };
}

/* ══════════════════════════════════════════════════════════
   ADMIN PANEL PAGE
══════════════════════════════════════════════════════════ */
export default function AdminPage() {
  const [token, setToken]   = useState<string | null>(null);
  const [adminName, setAdminName] = useState("");

  // Load token from sessionStorage on mount
  useEffect(() => {
    const t = sessionStorage.getItem("admin_token");
    const n = sessionStorage.getItem("admin_name");
    if (t) { setToken(t); setAdminName(n ?? "Admin"); }
  }, []);

  const handleLogin = (t: string, name: string) => {
    sessionStorage.setItem("admin_token", t);
    sessionStorage.setItem("admin_name", name);
    setToken(t);
    setAdminName(name);
  };

  const handleLogout = () => {
    sessionStorage.removeItem("admin_token");
    sessionStorage.removeItem("admin_name");
    setToken(null);
    setAdminName("");
  };

  if (!token) return <LoginView onLogin={handleLogin} />;
  return <DashboardView token={token} adminName={adminName} onLogout={handleLogout} />;
}

/* ══════════════════════════════════════════════════════════
   LOGIN VIEW
══════════════════════════════════════════════════════════ */
function LoginView({ onLogin }: { onLogin: (token: string, name: string) => void }) {
  const [email, setEmail]       = useState("");
  const [password, setPassword] = useState("");
  const [error, setError]       = useState("");
  const [loading, setLoading]   = useState(false);

  const submit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    setLoading(true);
    try {
      const res = await fetch(`${BACKEND}/api/admin/login`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, password }),
      });
      const data = await res.json();
      if (!res.ok) { setError(data.error ?? "Login failed."); return; }
      onLogin(data.token, data.name ?? "Admin");
    } catch {
      setError("Cannot reach server. Make sure the backend is running.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-[#0a0a0a] flex items-center justify-center p-4">
      <div className="w-full max-w-sm">
        {/* Logo / title */}
        <div className="text-center mb-8">
          <div className="inline-flex items-center justify-center w-14 h-14 rounded-2xl bg-gradient-to-br from-violet-600 to-indigo-600 mb-4 shadow-lg">
            <svg className="w-7 h-7 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2}
                d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
            </svg>
          </div>
          <h1 className="text-2xl font-bold text-white">Admin Panel</h1>
          <p className="text-sm text-gray-400 mt-1">Softkey AI — Super Admin</p>
        </div>

        <form onSubmit={submit} className="bg-[#111] border border-white/10 rounded-2xl p-6 space-y-4 shadow-xl">
          {error && (
            <div className="flex items-center gap-2 bg-red-500/10 border border-red-500/30 text-red-400 rounded-lg px-4 py-3 text-sm">
              <svg className="w-4 h-4 shrink-0" fill="currentColor" viewBox="0 0 20 20">
                <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7 4a1 1 0 11-2 0 1 1 0 012 0zm-1-9a1 1 0 00-1 1v4a1 1 0 102 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
              </svg>
              {error}
            </div>
          )}
          <div>
            <label className="block text-sm font-medium text-gray-300 mb-1.5">Email</label>
            <input
              type="email" required value={email} onChange={e => setEmail(e.target.value)}
              placeholder="admin@softkey.ai"
              className="w-full bg-white/5 border border-white/10 rounded-lg px-4 py-2.5 text-white placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-violet-500/50 focus:border-violet-500/50 text-sm"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-300 mb-1.5">Password</label>
            <input
              type="password" required value={password} onChange={e => setPassword(e.target.value)}
              placeholder="••••••••"
              className="w-full bg-white/5 border border-white/10 rounded-lg px-4 py-2.5 text-white placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-violet-500/50 focus:border-violet-500/50 text-sm"
            />
          </div>
          <button
            type="submit" disabled={loading}
            className="w-full bg-gradient-to-r from-violet-600 to-indigo-600 hover:from-violet-500 hover:to-indigo-500 disabled:opacity-60 disabled:cursor-not-allowed text-white font-semibold rounded-lg py-2.5 transition-all text-sm mt-2"
          >
            {loading ? "Signing in…" : "Sign in"}
          </button>
        </form>
      </div>
    </div>
  );
}

/* ══════════════════════════════════════════════════════════
   DASHBOARD VIEW
══════════════════════════════════════════════════════════ */
function DashboardView({
  token, adminName, onLogout,
}: { token: string; adminName: string; onLogout: () => void }) {
  const [keys, setKeys]           = useState<ApiKey[]>([]);
  const [loading, setLoading]     = useState(true);
  const [activeTab, setActiveTab] = useState(PROVIDERS[0].id);
  const [showForm, setShowForm]   = useState(false);
  const [formState, setFormState] = useState({ label: "", key_value: "", is_active: true });
  const [editId, setEditId]       = useState<number | null>(null);
  const [saving, setSaving]       = useState(false);
  const [toast, setToast]         = useState<{ msg: string; ok: boolean } | null>(null);
  const [confirmDelete, setConfirmDelete] = useState<number | null>(null);

  const showToast = (msg: string, ok = true) => {
    setToast({ msg, ok });
    setTimeout(() => setToast(null), 3000);
  };

  const fetchKeys = useCallback(async () => {
    setLoading(true);
    try {
      const res = await fetch(`${BACKEND}/api/admin/api-keys`, { headers: authHeader(token) });
      if (res.status === 401) { onLogout(); return; }
      const data = await res.json();
      setKeys(Array.isArray(data) ? data : []);
    } catch {
      showToast("Failed to load keys.", false);
    } finally {
      setLoading(false);
    }
  }, [token, onLogout]);

  useEffect(() => { fetchKeys(); }, [fetchKeys]);

  const tabKeys = keys.filter(k => k.provider === activeTab);

  const resetForm = () => {
    setFormState({ label: "", key_value: "", is_active: true });
    setEditId(null);
    setShowForm(false);
  };

  const openEdit = (k: ApiKey) => {
    setFormState({ label: k.label, key_value: "", is_active: k.is_active });
    setEditId(k.id);
    setShowForm(true);
  };

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);
    try {
      let res: Response;
      if (editId !== null) {
        // PUT — update label / key
        const body: Record<string, unknown> = { label: formState.label };
        if (formState.key_value) body.key_value = formState.key_value;
        res = await fetch(`${BACKEND}/api/admin/api-keys/${editId}`, {
          method: "PUT",
          headers: authHeader(token),
          body: JSON.stringify(body),
        });
      } else {
        // POST — create
        res = await fetch(`${BACKEND}/api/admin/api-keys`, {
          method: "POST",
          headers: authHeader(token),
          body: JSON.stringify({ ...formState, provider: activeTab }),
        });
      }
      const data = await res.json();
      if (!res.ok) { showToast(data.error ?? "Save failed.", false); return; }
      showToast(editId ? "Key updated." : "Key added.");
      resetForm();
      await fetchKeys();
    } catch {
      showToast("Server error.", false);
    } finally {
      setSaving(false);
    }
  };

  const handleActivate = async (keyId: number) => {
    try {
      const res = await fetch(`${BACKEND}/api/admin/api-keys/${keyId}/activate`, {
        method: "PATCH",
        headers: authHeader(token),
      });
      if (!res.ok) { showToast("Failed to activate.", false); return; }
      showToast("Key activated.");
      await fetchKeys();
    } catch {
      showToast("Server error.", false);
    }
  };

  const handleDelete = async (keyId: number) => {
    try {
      const res = await fetch(`${BACKEND}/api/admin/api-keys/${keyId}`, {
        method: "DELETE",
        headers: authHeader(token),
      });
      if (!res.ok) { showToast("Failed to delete.", false); return; }
      showToast("Key deleted.");
      setConfirmDelete(null);
      await fetchKeys();
    } catch {
      showToast("Server error.", false);
    }
  };

  const activeProvider = PROVIDERS.find(p => p.id === activeTab)!;

  return (
    <div className="min-h-screen bg-[#0a0a0a] text-white flex flex-col">

      {/* ── Header ─────────────────────────────────────────── */}
      <header className="border-b border-white/10 px-6 py-4 flex items-center justify-between bg-[#111]">
        <div className="flex items-center gap-3">
          <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-violet-600 to-indigo-600 flex items-center justify-center">
            <svg className="w-4 h-4 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2}
                d="M15 7a2 2 0 012 2m4 0a6 6 0 01-7.743 5.743L11 17H9v2H7v2H4a1 1 0 01-1-1v-2.586a1 1 0 01.293-.707l5.964-5.964A6 6 0 1121 9z" />
            </svg>
          </div>
          <div>
            <h1 className="font-semibold text-white text-sm">Admin Panel</h1>
            <p className="text-xs text-gray-400">API Key Management</p>
          </div>
        </div>
        <div className="flex items-center gap-3">
          <span className="text-sm text-gray-400">
            Signed in as <span className="text-white font-medium">{adminName}</span>
          </span>
          <button
            onClick={onLogout}
            className="text-sm text-gray-400 hover:text-white border border-white/10 hover:border-white/20 rounded-lg px-3 py-1.5 transition-colors"
          >
            Logout
          </button>
        </div>
      </header>

      <div className="flex flex-1 overflow-hidden">

        {/* ── Provider sidebar ─────────────────────────────── */}
        <nav className="w-52 border-r border-white/10 bg-[#0d0d0d] py-4 shrink-0">
          <p className="px-4 text-[11px] font-semibold text-gray-500 uppercase tracking-wider mb-2">Providers</p>
          {PROVIDERS.map(p => {
            const count = keys.filter(k => k.provider === p.id).length;
            const hasActive = keys.some(k => k.provider === p.id && k.is_active);
            return (
              <button
                key={p.id}
                onClick={() => { setActiveTab(p.id); resetForm(); }}
                className={`w-full flex items-center justify-between px-4 py-2.5 text-sm transition-colors ${
                  activeTab === p.id
                    ? "bg-white/10 text-white font-medium"
                    : "text-gray-400 hover:text-white hover:bg-white/5"
                }`}
              >
                <span className="flex items-center gap-2">
                  <span className="w-2 h-2 rounded-full shrink-0" style={{ background: hasActive ? p.color : "#374151" }} />
                  {p.label}
                </span>
                {count > 0 && (
                  <span className="text-[11px] bg-white/10 px-1.5 py-0.5 rounded-full text-gray-300">{count}</span>
                )}
              </button>
            );
          })}
        </nav>

        {/* ── Main content ─────────────────────────────────── */}
        <main className="flex-1 p-6 overflow-y-auto">
          {/* Tab header */}
          <div className="flex items-center justify-between mb-6">
            <div>
              <h2 className="text-xl font-semibold">
                <span className="w-3 h-3 rounded-full inline-block mr-2 align-middle" style={{ background: activeProvider.color }} />
                {activeProvider.label}
              </h2>
              <p className="text-sm text-gray-400 mt-0.5">
                {tabKeys.length === 0 ? "No keys configured." : `${tabKeys.length} key${tabKeys.length > 1 ? "s" : ""} configured`}
              </p>
            </div>
            <button
              onClick={() => { resetForm(); setShowForm(true); }}
              className="flex items-center gap-2 bg-violet-600 hover:bg-violet-500 text-white text-sm font-medium rounded-lg px-4 py-2 transition-colors"
            >
              <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
              </svg>
              Add Key
            </button>
          </div>

          {/* Add / Edit form */}
          {showForm && (
            <div className="bg-[#111] border border-white/10 rounded-2xl p-5 mb-6 shadow-lg">
              <h3 className="font-semibold text-sm mb-4 text-gray-200">
                {editId ? "Edit Key" : `Add ${activeProvider.label} Key`}
              </h3>
              <form onSubmit={handleSave} className="space-y-4">
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-xs font-medium text-gray-400 mb-1.5">Label (optional)</label>
                    <input
                      type="text"
                      value={formState.label}
                      onChange={e => setFormState(s => ({ ...s, label: e.target.value }))}
                      placeholder="e.g. Production key"
                      className="w-full bg-white/5 border border-white/10 rounded-lg px-3 py-2 text-white placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-violet-500/50 text-sm"
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-medium text-gray-400 mb-1.5">
                      API Key {editId && <span className="text-gray-500">(leave blank to keep existing)</span>}
                    </label>
                    <input
                      type="password"
                      value={formState.key_value}
                      onChange={e => setFormState(s => ({ ...s, key_value: e.target.value }))}
                      placeholder={editId ? "••••••••  (no change)" : "sk-..."}
                      required={!editId}
                      className="w-full bg-white/5 border border-white/10 rounded-lg px-3 py-2 text-white placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-violet-500/50 text-sm font-mono"
                    />
                  </div>
                </div>
                {!editId && (
                  <label className="flex items-center gap-2 text-sm text-gray-300 cursor-pointer select-none">
                    <input
                      type="checkbox"
                      checked={formState.is_active}
                      onChange={e => setFormState(s => ({ ...s, is_active: e.target.checked }))}
                      className="w-4 h-4 accent-violet-500 rounded"
                    />
                    Set as active key
                  </label>
                )}
                <div className="flex gap-3">
                  <button
                    type="submit" disabled={saving}
                    className="bg-violet-600 hover:bg-violet-500 disabled:opacity-60 disabled:cursor-not-allowed text-white text-sm font-medium rounded-lg px-5 py-2 transition-colors"
                  >
                    {saving ? "Saving…" : (editId ? "Update" : "Add Key")}
                  </button>
                  <button
                    type="button" onClick={resetForm}
                    className="text-gray-400 hover:text-white text-sm border border-white/10 hover:border-white/20 rounded-lg px-4 py-2 transition-colors"
                  >
                    Cancel
                  </button>
                </div>
              </form>
            </div>
          )}

          {/* Keys list */}
          {loading ? (
            <div className="flex items-center justify-center py-16 text-gray-500 text-sm">Loading keys…</div>
          ) : tabKeys.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-20 text-center">
              <div className="w-12 h-12 rounded-2xl bg-white/5 flex items-center justify-center mb-3">
                <svg className="w-6 h-6 text-gray-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5}
                    d="M15 7a2 2 0 012 2m4 0a6 6 0 01-7.743 5.743L11 17H9v2H7v2H4a1 1 0 01-1-1v-2.586a1 1 0 01.293-.707l5.964-5.964A6 6 0 1121 9z" />
                </svg>
              </div>
              <p className="text-gray-400 text-sm">No API keys for {activeProvider.label} yet.</p>
              <p className="text-gray-600 text-xs mt-1">Click &quot;Add Key&quot; to configure one.</p>
            </div>
          ) : (
            <div className="space-y-3">
              {tabKeys.map(k => (
                <div key={k.id}
                  className={`flex items-center gap-4 bg-[#111] border rounded-xl px-5 py-4 transition-colors ${
                    k.is_active ? "border-white/20" : "border-white/8 opacity-70"
                  }`}
                >
                  {/* Status badge */}
                  <div className={`shrink-0 px-2.5 py-1 rounded-full text-[11px] font-semibold ${
                    k.is_active
                      ? "bg-emerald-500/15 text-emerald-400 border border-emerald-500/30"
                      : "bg-white/5 text-gray-500 border border-white/10"
                  }`}>
                    {k.is_active ? "Active" : "Inactive"}
                  </div>

                  {/* Key info */}
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-medium text-white truncate">
                      {k.label || <span className="text-gray-400 italic">Unlabeled</span>}
                    </p>
                    <p className="text-xs text-gray-500 font-mono mt-0.5">{k.masked_key}</p>
                  </div>

                  <p className="text-xs text-gray-600 shrink-0 hidden sm:block">
                    {new Date(k.updated_at).toLocaleDateString()}
                  </p>

                  {/* Actions */}
                  <div className="flex items-center gap-2 shrink-0">
                    {!k.is_active && (
                      <button
                        onClick={() => handleActivate(k.id)}
                        className="text-xs text-emerald-400 hover:text-emerald-300 border border-emerald-500/30 hover:border-emerald-400/40 rounded-lg px-3 py-1.5 transition-colors"
                      >
                        Activate
                      </button>
                    )}
                    <button
                      onClick={() => openEdit(k)}
                      className="text-xs text-gray-400 hover:text-white border border-white/10 hover:border-white/20 rounded-lg px-3 py-1.5 transition-colors"
                    >
                      Edit
                    </button>
                    {confirmDelete === k.id ? (
                      <div className="flex items-center gap-1.5">
                        <button
                          onClick={() => handleDelete(k.id)}
                          className="text-xs text-red-400 hover:text-red-300 border border-red-500/30 rounded-lg px-3 py-1.5 transition-colors"
                        >
                          Confirm
                        </button>
                        <button
                          onClick={() => setConfirmDelete(null)}
                          className="text-xs text-gray-400 hover:text-white border border-white/10 rounded-lg px-3 py-1.5 transition-colors"
                        >
                          Cancel
                        </button>
                      </div>
                    ) : (
                      <button
                        onClick={() => setConfirmDelete(k.id)}
                        className="text-xs text-gray-500 hover:text-red-400 border border-white/10 hover:border-red-500/30 rounded-lg px-3 py-1.5 transition-colors"
                      >
                        Delete
                      </button>
                    )}
                  </div>
                </div>
              ))}
            </div>
          )}
        </main>
      </div>

      {/* Toast notification */}
      {toast && (
        <div className={`fixed bottom-6 right-6 flex items-center gap-2 px-4 py-3 rounded-xl shadow-xl text-sm font-medium z-50 transition-all ${
          toast.ok
            ? "bg-emerald-500/20 border border-emerald-500/40 text-emerald-300"
            : "bg-red-500/20 border border-red-500/40 text-red-300"
        }`}>
          {toast.ok ? (
            <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
              <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
            </svg>
          ) : (
            <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
              <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7 4a1 1 0 11-2 0 1 1 0 012 0zm-1-9a1 1 0 00-1 1v4a1 1 0 102 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
            </svg>
          )}
          {toast.msg}
        </div>
      )}

      {/* Confirm delete backdrop */}
      {confirmDelete !== null && (
        <div
          className="fixed inset-0 bg-black/20 z-40"
          onClick={() => setConfirmDelete(null)}
        />
      )}
    </div>
  );
}
