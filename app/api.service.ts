// app/super-admin/api.service.ts

const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL;

// ================= TYPES =================

export interface Company {
  _id: string;
  name: string;
  email: string;
  subscription: "ACTIVE" | "INACTIVE";
  plan: string;
  tokens: number;
  maxTokens: number;
  createdAt: string;
}

export interface CompaniesResponse {
  success: boolean;
  message: string;
  data: Company[];
}

// ================= API SERVICE =================

export const apiService = {
  async getAllCompanies(): Promise<CompaniesResponse> {
    const res = await fetch(`${API_BASE_URL}/api/all-companies`, {
      method: "GET",
      headers: { "Content-Type": "application/json" },
      cache: "no-store",
    });

    const data = await res.json();
    if (!res.ok) throw new Error(data.message || "Failed to fetch companies");

    return data;
  },

  async rechargeTokens(companyId: string, tokens: number) {
    const res = await fetch(`${API_BASE_URL}/api/payment/recharge`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ companyId, tokens }),
    });

    const data = await res.json();
    if (!res.ok) throw new Error(data.error || "Recharge failed");

    return data;
  },
};