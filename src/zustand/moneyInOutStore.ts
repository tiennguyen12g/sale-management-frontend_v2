import { create } from "zustand";
import { GetMoneyInOut_API, AddMoneyInOut_API, UploadMoneyInOut_API } from "../config/api";
import type {
  MoneyInOutDataType,
  MoneyInOut_Action_Type,
  MoneyInOut_DestinationFund_Type,
  MoneyInOut_SourceFund_Type,
} from "../pages/BodyComponent/Financial/DataTest/DataForMoney";
import { useAuthStore } from "./authStore";
interface MoneyInOutState {
  moneyInOuts: MoneyInOutDataType[];
  loading: boolean;
  error: string | null;

  fetchMoneyInOuts: (authHeader: Record<string, string>) => Promise<{ status: string; message: string } | undefined>;
  addMoneyInOut: (moneyInOuts: Omit<MoneyInOutDataType, "_id">, authHeader: Record<string, string>) => Promise<void>;
  addBank: (moneyInOuts: Omit<MoneyInOutDataType, "_id">, authHeader: Record<string, string>) => Promise<void>;
  updateMoneyInOut: (id: string, moneyInOuts: Partial<MoneyInOutDataType>, authHeader: Record<string, string>) => Promise<void>;
  deleteMoneyInOut: (id: string, authHeader: Record<string, string>) => Promise<void>;
  updateUploadExcel: (oldData: MoneyInOutDataType[], newData: Omit<MoneyInOutDataType[], "_id">) => Promise<void>;
}

export const useMoneyInOutStore = create<MoneyInOutState>((set, get) => ({
  moneyInOuts: [],
  loading: false,
  error: null,

  // Fetch all costs
  fetchMoneyInOuts: async (authHeader) => {
    set({ loading: true, error: null });
    try {
      const { logout } = useAuthStore.getState();
      const res = await fetch(GetMoneyInOut_API, { headers: { ...authHeader } });
      const data = await res.json();
      if (res.status === 401) {
        logout();
        window.location.href = "/login";
        return { status: "No valid token", message: data.message };
      }
      if (!res.ok) throw new Error("Failed to fetch costs");

      set({ moneyInOuts: data, loading: false });
      return { status: "success", message: data.message };
    } catch (err: any) {
      set({ error: err.message, loading: false });
      return { status: "failed", message: err.message };
    }
  },

  // Add cost
  addMoneyInOut: async (cost, authHeader) => {
    try {
      const res = await fetch(AddMoneyInOut_API, {
        method: "POST",
        headers: { "Content-Type": "application/json", ...authHeader },
        body: JSON.stringify(cost),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.message || "Failed to add cost");

      set({ moneyInOuts: [...get().moneyInOuts, data] });
    } catch (err: any) {
      set({ error: err.message });
    }
  },

  // Add bank
  addBank: async (cost, authHeader) => {
    try {
      const res = await fetch(AddMoneyInOut_API, {
        method: "POST",
        headers: { "Content-Type": "application/json", ...authHeader },
        body: JSON.stringify(cost),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.message || "Failed to add cost");

      set({ moneyInOuts: [...get().moneyInOuts, data] });
    } catch (err: any) {
      set({ error: err.message });
    }
  },

  // Update cost
  updateMoneyInOut: async (id, cost, authHeader) => {
    try {
      const res = await fetch(`${GetMoneyInOut_API}/${id}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json", ...authHeader },
        body: JSON.stringify(cost),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.message || "Failed to update cost");

      set({
        moneyInOuts: get().moneyInOuts.map((c) => (c._id === id ? data : c)),
      });
    } catch (err: any) {
      set({ error: err.message });
    }
  },

  // Delete cost
  deleteMoneyInOut: async (id, authHeader) => {
    try {
      const res = await fetch(`${GetMoneyInOut_API}/${id}`, {
        method: "DELETE",
        headers: { ...authHeader },
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.message || "Failed to delete cost");

      set({ moneyInOuts: get().moneyInOuts.filter((c) => c._id !== id) });
    } catch (err: any) {
      set({ error: err.message });
    }
  },

  //update upload
  updateUploadExcel: async (oldData, newData) => {
    const combineData = [...oldData, ...newData];
    set({ moneyInOuts: combineData });
  },
}));
