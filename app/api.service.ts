// app/api.service.ts

const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL;

// --- Types ---

export interface Company {
    _id: string;
    name: string;
    email: string;
    isActive?: boolean; // Mocked property until backend implements it
    createdAt: string;
}

export interface CompaniesResponse {
    success: boolean;
    message: string;
    data: Company[];
}

export const apiService = {
    async getAllCompanies(): Promise<CompaniesResponse> {
        const res = await fetch(`${API_BASE_URL}/api/all-companies`, {
            method: "GET",
            headers: { "Content-Type": "application/json" },
        });
        const data = await res.json();
        if (!res.ok) throw new Error(data.message || "Failed to fetch companies");
        return data;
    },

    async rechargeTokens(companyId: string, amount: number): Promise<any> {
        const res = await fetch(`${API_BASE_URL}/api/payment/recharge`, {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ companyId, amount }),
        });
        const data = await res.json();
        if (!res.ok) throw new Error(data.error || "Recharge failed");
        return data;
    },
};
