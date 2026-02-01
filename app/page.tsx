"use client";

import { useEffect, useMemo, useState } from "react";
import { apiService, Company } from "./api.service";
import {
  Search,
  RefreshCw,
  CheckCircle,
  XCircle,
  CreditCard,
  Users,
  Building2,
  Copy,
  Check,
} from "lucide-react";

export default function SuperAdminDashboard() {
  const [companies, setCompanies] = useState<Company[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [searchQuery, setSearchQuery] = useState("");
  const [rechargingId, setRechargingId] = useState<string | null>(null);
  const [copiedId, setCopiedId] = useState<string | null>(null);

  const handleCopy = (id: string) => {
    navigator.clipboard.writeText(id);
    setCopiedId(id);
    setTimeout(() => setCopiedId(null), 2000);
  };

  useEffect(() => {
    fetchCompanies();
  }, []);

  const fetchCompanies = async () => {
    try {
      setLoading(true);
      setError("");
      const res = await apiService.getAllCompanies();
      setCompanies(res.data || []);
    } catch (err: any) {
      setError(err.message || "Failed to load companies");
      console.error("Fetch companies error:", err);
    } finally {
      setLoading(false);
    }
  };

  // Fixed: Now checks subscription field (matches your Company type)
  const isCompanyActive = (company: Company) =>
    company.subscription === "ACTIVE" && (company.tokens ?? 0) > 0;

  const handleRecharge = async (companyId: string, amount: number = 1000) => {
    if (!confirm(`Add ${amount} tokens to this company?`)) return;

    try {
      setRechargingId(companyId);
      setError(""); // clear previous errors

      const response = await apiService.rechargeTokens(companyId, amount);

      if (!response.success) {
        throw new Error(response.error || "Recharge failed");
      }

      // Update local state with real returned values
      setCompanies((prev) =>
        prev.map((c) =>
          c._id === companyId
            ? {
              ...c,
              tokens: response.tokens ?? c.tokens,
              maxTokens: response.maxTokens ?? c.maxTokens,
              subscription: response.subscription ?? "ACTIVE", // Ensures active status
            }
            : c
        )
      );

      // Optional: uncomment to always fetch fresh data from server
      // await fetchCompanies();

    } catch (err: any) {
      console.error("Recharge error:", err);
      setError(err.message || "Failed to recharge tokens");
      alert(err.message || "Recharge failed – check console");
    } finally {
      setRechargingId(null);
    }
  };

  const stats = useMemo(() => {
    return {
      total: companies.length,
      active: companies.filter(isCompanyActive).length,
      inactive: companies.filter((c) => !isCompanyActive(c)).length,
    };
  }, [companies]);

  const filteredCompanies = companies.filter((c) =>
    [c.name, c.email, c._id]
      .some((v) => (v ?? "").toLowerCase().includes(searchQuery.toLowerCase()))
  );

  return (
    <div className="min-h-screen bg-slate-50 text-slate-900 font-sans selection:bg-blue-100 selection:text-blue-900">
      {/* BACKGROUND DECORATIONS */}
      <div className="fixed inset-0 overflow-hidden pointer-events-none">
        <div className="absolute top-[-10%] left-[-10%] w-[40%] h-[40%] bg-blue-500/5 rounded-full blur-[120px]"></div>
        <div className="absolute bottom-[-10%] right-[-10%] w-[50%] h-[50%] bg-indigo-500/5 rounded-full blur-[150px]"></div>
        <div className="absolute inset-0 bg-[url('https://grainy-gradients.vercel.app/noise.svg')] opacity-[0.02] pointer-events-none"></div>
      </div>

      {/* NAVBAR */}
      <nav className="sticky top-0 z-50 bg-white/80 backdrop-blur-md border-b border-slate-100 px-6 py-4 flex justify-between items-center shadow-sm">
        <div className="flex items-center gap-3">
          <div className="p-2 bg-blue-600 rounded-xl shadow-lg shadow-blue-500/20">
            <Building2 className="w-5 h-5 text-white" />
          </div>
          <div>
            <h1 className="font-bold text-xl text-slate-900 tracking-tight">Super Admin</h1>
            <p className="text-[10px] text-blue-600 font-bold uppercase tracking-widest mt-0.5">Control Center</p>
          </div>
        </div>
        <div className="flex items-center gap-4">
          <button
            onClick={fetchCompanies}
            disabled={loading}
            className="p-2.5 hover:bg-slate-100 rounded-xl transition-all text-slate-500 hover:text-blue-600 border border-transparent hover:border-slate-200"
            title="Refresh Data"
          >
            <RefreshCw className={`w-5 h-5 ${loading ? "animate-spin" : ""}`} />
          </button>
        </div>
      </nav>

      {/* HERO / HEADER SECTION */}
      <header className="relative bg-slate-900 pt-16 pb-32 px-6 overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-br from-slate-900 via-blue-900/20 to-slate-900 opacity-50"></div>
        <div className="max-w-7xl mx-auto relative z-10">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full border border-blue-400/20 bg-blue-500/10 backdrop-blur-md text-blue-400 text-[10px] font-bold tracking-widest uppercase mb-6">
            <span className="w-1.5 h-1.5 rounded-full bg-blue-400 animate-pulse"></span>
            System Overview
          </div>
          <h2 className="text-4xl md:text-5xl font-black text-white tracking-tight leading-tight mb-4">
            Managing <span className="text-blue-500">Infrastructure</span>
          </h2>
          <p className="text-slate-400 max-w-2xl text-lg font-light leading-relaxed">
            Corporate node management, token distribution, and real-time registry synchronization for all partner companies.
          </p>
        </div>
      </header>

      <main className="max-w-7xl mx-auto p-6 -mt-20 relative z-20 space-y-10">
        {/* ERROR MESSAGE */}
        {error && (
          <div className="mb-8 p-4 bg-red-50 backdrop-blur-md border border-red-100 text-red-600 rounded-2xl flex items-center gap-3 shadow-xl">
            <XCircle className="w-5 h-5" />
            <span className="font-bold uppercase text-xs tracking-wider">{error}</span>
          </div>
        )}

        {/* STATS CARDS */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          <Stat
            label="Total Companies"
            value={stats.total}
            icon={<Users className="w-6 h-6" />}
            gradient="from-blue-600 to-blue-700"
            desc="Registered corporate accounts"
          />
          <Stat
            label="Active Accounts"
            value={stats.active}
            icon={<CheckCircle className="w-6 h-6" />}
            gradient="from-emerald-500 to-teal-600"
            desc="Healthy subscription status"
          />
          <Stat
            label="Action Required"
            value={stats.inactive}
            icon={<XCircle className="w-6 h-6" />}
            gradient="from-rose-500 to-red-600"
            desc="Inactive or offline accounts"
            highlight={stats.inactive > 0}
          />
        </div>

        {/* COMPANIES TABLE SECTION */}
        <div className="bg-white rounded-[2rem] border border-slate-100 shadow-2xl relative overflow-hidden">
          <div className="p-8 border-b border-slate-50 flex flex-col md:flex-row justify-between items-start md:items-center gap-6">
            <div>
              <h3 className="text-2xl font-black text-slate-900 tracking-tight">Company Catalog</h3>
              <p className="text-xs text-slate-400 font-medium mt-1 uppercase tracking-widest">Found {filteredCompanies.length} registered entries</p>
            </div>

            <div className="flex items-center gap-4 w-full md:w-auto">
              <div className="relative flex-1 md:w-80 group">
                <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-300 group-focus-within:text-blue-500 transition-colors" />
                <input
                  className="w-full pl-12 pr-4 py-3 bg-slate-50 border border-slate-100 rounded-2xl text-sm focus:outline-none focus:ring-2 focus:ring-blue-500/10 focus:border-blue-500 transition-all font-medium"
                  placeholder="Search by name, email or ID..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                />
              </div>
            </div>
          </div>

          {loading ? (
            <div className="p-12 text-center text-gray-500">Loading companies...</div>
          ) : filteredCompanies.length === 0 ? (
            <div className="p-12 text-center text-gray-500">
              {searchQuery ? "No companies match your search" : "No companies found"}
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-sm text-left">
                <thead className="bg-slate-50/80 text-slate-500">
                  <tr>
                    <th className="px-6 py-5 font-bold uppercase tracking-wider text-[10px]">Company ID</th>
                    <th className="px-6 py-5 font-bold uppercase tracking-wider text-[10px]">Name</th>
                    <th className="px-6 py-5 font-bold uppercase tracking-wider text-[10px]">Email</th>
                    <th className="px-6 py-5 font-bold uppercase tracking-wider text-[10px]">Plan</th>
                    <th className="px-6 py-5 font-bold uppercase tracking-wider text-[10px] text-center">Tokens</th>
                    <th className="px-6 py-5 font-bold uppercase tracking-wider text-[10px] text-center">Status</th>
                    <th className="px-6 py-5 font-bold uppercase tracking-wider text-[10px] text-center">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {filteredCompanies.map((company) => (
                    <tr key={company._id} className="hover:bg-slate-50 transition-colors group">
                      <td className="px-6 py-5">
                        <div className="flex items-center gap-2">
                          <code className="text-[10px] bg-slate-100 px-2.5 py-1.5 rounded-lg text-slate-500 font-mono border border-slate-200 group-hover:bg-white group-hover:border-blue-200 transition-colors">
                            {company._id}
                          </code>
                          <button
                            onClick={() => handleCopy(company._id)}
                            className="p-1.5 hover:bg-white hover:shadow-sm rounded-md transition-all text-slate-300 hover:text-blue-600"
                            title="Copy ID"
                          >
                            {copiedId === company._id ? (
                              <Check className="w-3.5 h-3.5 text-emerald-500" />
                            ) : (
                              <Copy className="w-3.5 h-3.5" />
                            )}
                          </button>
                        </div>
                      </td>
                      <td className="px-6 py-5 font-bold text-slate-900 text-base tracking-tight whitespace-nowrap">
                        {company.name}
                      </td>
                      <td className="px-6 py-5 text-slate-500 font-medium whitespace-nowrap">{company.email}</td>
                      <td className="px-6 py-5">
                        <span className="px-3 py-1.5 rounded-xl bg-blue-50 text-blue-600 border border-blue-100 text-[10px] font-black uppercase tracking-wider shadow-sm shadow-blue-500/5">
                          {company.plan || "Starter"}
                        </span>
                      </td>
                      <td className="px-6 py-5 text-center">
                        <div className="flex flex-col items-center">
                          <span className="font-black text-slate-900 text-base">{(company.tokens ?? 0).toLocaleString()}</span>
                          <span className="text-[10px] text-slate-400 font-bold uppercase tracking-tighter">/ {(company.maxTokens ?? 0).toLocaleString()}</span>
                        </div>
                      </td>
                      <td className="px-6 py-5 text-center">
                        <span
                          className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-2xl text-[10px] font-black uppercase tracking-widest border ${isCompanyActive(company)
                            ? "bg-emerald-50 text-emerald-600 border-emerald-100 shadow-sm shadow-emerald-500/5"
                            : "bg-rose-50 text-rose-600 border-rose-100 shadow-sm shadow-rose-500/5"
                            }`}
                        >
                          <span className={`w-1.5 h-1.5 rounded-full ${isCompanyActive(company) ? "bg-emerald-500" : "bg-rose-500"}`}></span>
                          {isCompanyActive(company) ? "Active" : "Inactive"}
                        </span>
                      </td>
                      <td className="px-6 py-5 text-center">
                        <button
                          disabled={rechargingId === company._id || loading}
                          onClick={() => handleRecharge(company._id, 1000)}
                          className={`inline-flex items-center gap-2 px-5 py-2.5 text-[10px] font-black uppercase tracking-widest rounded-xl transition-all h-10 ${rechargingId === company._id
                            ? "bg-slate-100 text-slate-400 cursor-wait border border-slate-200"
                            : "bg-blue-600 text-white shadow-lg shadow-blue-500/20 hover:bg-blue-700 hover:-translate-y-0.5 hover:shadow-blue-500/30 active:scale-95"
                            }`}
                        >
                          <CreditCard className="w-3.5 h-3.5" />
                          {rechargingId === company._id ? "Processing..." : "Inject Tokens"}
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      </main>
    </div>
  );
}

function Stat({
  label,
  value,
  icon,
  gradient,
  desc,
  highlight,
}: {
  label: string;
  value: number;
  icon: React.ReactNode;
  gradient: string;
  desc?: string;
  highlight?: boolean;
}) {
  return (
    <div className={`p-8 rounded-[2rem] bg-white border border-slate-100 shadow-xl hover:shadow-2xl transition-all hover:-translate-y-1 group ${highlight ? 'ring-2 ring-rose-500/10 border-rose-100' : ''}`}>
      <div className="flex items-center gap-6">
        <div className={`w-14 h-14 rounded-2xl bg-gradient-to-br ${gradient} flex items-center justify-center text-white shadow-lg group-hover:scale-110 transition-transform`}>
          {icon}
        </div>
        <div>
          <p className="text-[10px] text-slate-400 font-black uppercase tracking-[0.2em] leading-none">{label}</p>
          <p className="text-3xl font-black text-slate-900 mt-2 tracking-tight">
            {value.toLocaleString()}
          </p>
          {desc && <p className="text-[10px] text-slate-400 font-bold uppercase mt-1 tracking-tight">{desc}</p>}
        </div>
      </div>
    </div>
  );
}