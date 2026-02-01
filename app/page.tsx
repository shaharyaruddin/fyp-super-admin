"use client";

import { useEffect, useState } from "react";
import { apiService, Company } from "./api.service";

export default function SuperAdminDashboard() {
  const [companies, setCompanies] = useState<Company[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [rechargingId, setRechargingId] = useState<string | null>(null);

  useEffect(() => {
    fetchCompanies();
  }, []);

  const fetchCompanies = async () => {
    try {
      setLoading(true);
      setError("");
      const response = await apiService.getAllCompanies();
      setCompanies(response.data);
    } catch (err: any) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  // 🧠 Smart active logic
  const isCompanyActive = (company: Company) =>
    company.subscription === "ACTIVE" && company.tokens > 0;

  const handleRecharge = async (companyId: string) => {
    try {
      setRechargingId(companyId);

      // Add 50 tokens
      await apiService.rechargeTokens(companyId, 50);

      alert("Tokens added & company activated!");
      await fetchCompanies();
    } catch (err: any) {
      alert(err.message || "Recharge failed");
    } finally {
      setRechargingId(null);
    }
  };

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Navbar */}
      <nav className="bg-white border-b border-gray-200 px-8 py-4">
        <h1 className="text-xl font-bold text-gray-900">
          Super Admin Dashboard
        </h1>
      </nav>

      {/* Content */}
      <main className="max-w-7xl mx-auto p-8">
        <div className="flex items-center justify-between mb-8">
          <h2 className="text-2xl font-bold text-gray-900">
            Registered Companies
          </h2>

          <button
            onClick={fetchCompanies}
            className="px-4 py-2 bg-gray-100 hover:bg-gray-200 text-gray-700 rounded-md text-sm font-medium transition"
          >
            Refresh
          </button>
        </div>

        {error && (
          <div className="bg-red-50 text-red-600 p-4 rounded-lg mb-6">
            {error}
          </div>
        )}

        <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
          <div className="overflow-x-auto">
        <table className="w-full text-left text-sm text-gray-600">
  <thead className="bg-gray-50 text-gray-900 uppercase font-semibold">
    <tr>
      <th className="px-6 py-4">ID</th> {/* New column */}
      <th className="px-6 py-4">Company</th>
      <th className="px-6 py-4">Email</th>
      <th className="px-6 py-4">Plan</th>
      <th className="px-6 py-4 text-center">Tokens</th>
      <th className="px-6 py-4 text-center">Status</th>
      <th className="px-6 py-4 text-center">Action</th>
    </tr>
  </thead>

  <tbody className="divide-y divide-gray-100">
    {loading ? (
      <tr>
        <td colSpan={7} className="px-6 py-8 text-center">
          Loading companies...
        </td>
      </tr>
    ) : companies.length === 0 ? (
      <tr>
        <td colSpan={7} className="px-6 py-8 text-center">
          No companies found
        </td>
      </tr>
    ) : (
      companies.map((company) => (
        <tr key={company._id} className="hover:bg-gray-50">
          <td className="px-6 py-4 font-mono text-gray-700 text-xs">
            {company._id} {/* Showing _id */}
          </td>
          <td className="px-6 py-4 font-medium text-gray-900">
            {company.name}
          </td>
          <td className="px-6 py-4">{company.email}</td>
          <td className="px-6 py-4">
            <span className="px-2 py-1 rounded bg-blue-100 text-blue-700 text-xs font-semibold">
              {company.plan}
            </span>
          </td>
          <td className="px-6 py-4 text-center font-medium">
            {company.tokens} / {company.maxTokens}
          </td>
          <td className="px-6 py-4 text-center">
            <span
              className={`inline-flex px-2.5 py-1 rounded-full text-xs font-semibold ${
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
              onClick={() => handleRecharge(company._id)}
              disabled={rechargingId === company._id}
              className={`px-3 py-1.5 rounded-md text-xs font-medium border transition ${
                rechargingId === company._id
                  ? "bg-gray-100 text-gray-400 cursor-not-allowed"
                  : "border-green-300 text-green-700 hover:bg-green-50"
              }`}
            >
              {rechargingId === company._id ? "Recharging..." : "Recharge Tokens"}
            </button>
          </td>
        </tr>
      ))
    )}
  </tbody>
</table>

          </div>
        </div>
      </main>
    </div>
  );
}
