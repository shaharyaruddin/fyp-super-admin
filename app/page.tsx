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
} from "lucide-react";

export default function SuperAdminDashboard() {
  const [companies, setCompanies] = useState<Company[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [searchQuery, setSearchQuery] = useState("");
  const [rechargingId, setRechargingId] = useState<string | null>(null);

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
    <div className="min-h-screen bg-gray-50">
      {/* NAVBAR */}
      <nav className="bg-white border-b px-6 py-4 flex justify-between items-center shadow-sm">
        <div className="flex items-center gap-3">
          <div className="p-2 bg-blue-600 rounded-lg">
            <Building2 className="w-5 h-5 text-white" />
          </div>
          <h1 className="font-bold text-xl text-gray-900">Super Admin Panel</h1>
        </div>
      </nav>

      <main className="max-w-7xl mx-auto p-6">
        {/* ERROR MESSAGE */}
        {error && (
          <div className="mb-6 p-4 bg-red-50 border border-red-200 text-red-700 rounded-xl">
            {error}
          </div>
        )}

        {/* STATS CARDS */}
        <div className="grid md:grid-cols-3 gap-6 mb-10">
          <Stat
            label="Total Companies"
            value={stats.total}
            icon={<Users className="w-6 h-6" />}
            color="bg-blue-100 text-blue-700"
          />
          <Stat
            label="Active"
            value={stats.active}
            icon={<CheckCircle className="w-6 h-6" />}
            color="bg-green-100 text-green-700"
          />
          <Stat
            label="Inactive"
            value={stats.inactive}
            icon={<XCircle className="w-6 h-6" />}
            color="bg-red-100 text-red-700"
          />
        </div>

        {/* COMPANIES TABLE */}
        <div className="bg-white rounded-xl border shadow-sm overflow-hidden">
          <div className="p-5 border-b flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
            <h2 className="text-lg font-bold text-gray-900">Companies</h2>

            <div className="flex items-center gap-3 w-full sm:w-auto">
              <div className="relative flex-1 sm:flex-none">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                <input
                  className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                  placeholder="Search by name, email or ID..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                />
              </div>
              <button
                onClick={fetchCompanies}
                disabled={loading}
                className="p-2 hover:bg-gray-100 rounded-lg transition"
                title="Refresh"
              >
                <RefreshCw className={`w-5 h-5 ${loading ? "animate-spin" : ""}`} />
              </button>
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
                <thead className="bg-gray-50 text-gray-700">
                  <tr>
                    <th className="px-6 py-4 font-medium">Company</th>
                    <th className="px-6 py-4 font-medium">Email</th>
                    <th className="px-6 py-4 font-medium">Plan</th>
                    <th className="px-6 py-4 font-medium text-center">Tokens</th>
                    <th className="px-6 py-4 font-medium text-center">Status</th>
                    <th className="px-6 py-4 font-medium text-center">Action</th>
                  </tr>
                </thead>
                <tbody>
                  {filteredCompanies.map((company) => (
                    <tr key={company._id} className="border-t hover:bg-gray-50 transition">
                      <td className="px-6 py-4 font-medium text-gray-900">{company.name}</td>
                      <td className="px-6 py-4 text-gray-600">{company.email}</td>
                      <td className="px-6 py-4 text-gray-600">{company.plan || "—"}</td>
                      <td className="px-6 py-4 text-center font-medium">
                        {company.tokens ?? 0} / {company.maxTokens ?? "∞"}
                      </td>
                      <td className="px-6 py-4 text-center">
                        <span
                          className={`inline-block px-3 py-1 rounded-full text-xs font-medium ${
                            isCompanyActive(company)
                              ? "bg-green-100 text-green-700"
                              : "bg-red-100 text-red-700"
                          }`}
                        >
                          {isCompanyActive(company) ? "Active" : "Inactive"}
                        </span>
                      </td>
                      <td className="px-6 py-4 text-center">
                        <button
                          disabled={rechargingId === company._id || loading}
                          onClick={() => handleRecharge(company._id, 1000)}
                          className={`inline-flex items-center gap-1.5 px-4 py-1.5 text-xs font-medium rounded-lg border transition ${
                            rechargingId === company._id
                              ? "bg-gray-100 text-gray-500 cursor-wait"
                              : "hover:bg-blue-50 text-blue-700 border-blue-200"
                          }`}
                        >
                          <CreditCard className="w-4 h-4" />
                          {rechargingId === company._id ? "Recharging..." : "Recharge"}
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
  color = "bg-gray-100 text-gray-700",
}: {
  label: string;
  value: number;
  icon: React.ReactNode;
  color?: string;
}) {
  return (
    <div className="bg-white p-6 rounded-xl border shadow-sm flex items-center gap-5">
      <div className={`p-4 rounded-lg ${color}`}>{icon}</div>
      <div>
        <p className="text-sm text-gray-500 font-medium">{label}</p>
        <p className="text-3xl font-bold text-gray-900 mt-1">{value}</p>
      </div>
    </div>
  );
}