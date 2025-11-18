import { create } from "zustand";
import { AddOperatingCost_API, UploadOperatingCost_API, GetOperatingCost_API } from "../config/api";
import type { OperatingCostsDataType } from "../pages/BodyComponent/Financial/DataTest/DataForOperatingCost";
import { useAuthStore } from "./authStore";
// export interface OperatingCost {
//   _id?: string;
//   action: "electric" | "water" | "internet" | "phone" | "software" | "othercost";
//   date: string;   // ISO date
//   value: number;
//   usedFor: string;
//   note: string;
// }

interface OperatingCostsState {
  costs: OperatingCostsDataType[];
  loading: boolean;
  error: string | null;

  fetchCosts: (authHeader: Record<string, string>) => Promise<{ status: string; message: string } | undefined>;
  addCost: (cost: Omit<OperatingCostsDataType, "_id">, authHeader: Record<string, string>) => Promise<void>;
  updateCost: (id: string, cost: Partial<OperatingCostsDataType>, authHeader: Record<string, string>) => Promise<void>;
  deleteCost: (id: string, authHeader: Record<string, string>) => Promise<void>;
  updateUploadExcel: (oldData: OperatingCostsDataType[], newData: Omit<OperatingCostsDataType[], "_id">) => Promise<void>;
}

export const useOperatingCostsStore = create<OperatingCostsState>((set, get) => ({
  costs: [],
  loading: false,
  error: null,

  // Fetch all costs
  fetchCosts: async (authHeader) => {
    set({ loading: true, error: null });
    try {
      const { logout } = useAuthStore.getState();
      const res = await fetch(GetOperatingCost_API, { headers: { ...authHeader } });
      if (!res.ok) throw new Error("Failed to fetch costs");
      const data = await res.json();
      if (res.status === 401) {
        logout();
        window.location.href = "/login";
        return { status: "No valid token", message: data.message };
      }
      set({ costs: data, loading: false });
      return { status: "success", message: data.message };
    } catch (err: any) {
      set({ error: err.message, loading: false });
      return { status: "failed", message: err.message };
    }
  },

  // Add cost
  addCost: async (cost, authHeader) => {
    try {
      const res = await fetch(AddOperatingCost_API, {
        method: "POST",
        headers: { "Content-Type": "application/json", ...authHeader },
        body: JSON.stringify(cost),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.message || "Failed to add cost");

      set({ costs: [...get().costs, data] });
    } catch (err: any) {
      set({ error: err.message });
    }
  },

  // Update cost
  updateCost: async (id, cost, authHeader) => {
    try {
      const res = await fetch(`${GetOperatingCost_API}/${id}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json", ...authHeader },
        body: JSON.stringify(cost),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.message || "Failed to update cost");

      set({
        costs: get().costs.map((c) => (c._id === id ? data : c)),
      });
    } catch (err: any) {
      set({ error: err.message });
    }
  },

  // Delete cost
  deleteCost: async (id, authHeader) => {
    try {
      const res = await fetch(`${GetOperatingCost_API}/${id}`, {
        method: "DELETE",
        headers: { ...authHeader },
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.message || "Failed to delete cost");

      set({ costs: get().costs.filter((c) => c._id !== id) });
    } catch (err: any) {
      set({ error: err.message });
    }
  },

  //update upload
  updateUploadExcel: async (oldData, newData) => {
    const combineData = [...oldData, ...newData];
    set({ costs: combineData });
  },
}));
