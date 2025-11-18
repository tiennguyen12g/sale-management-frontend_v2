import { create } from "zustand";
import { useAuthStore } from "./authStore";
import { GetAdsCosts_API, AddAdsCosts_API, UploadAdsCosts_API } from "../config/api";
export type PlatformName = "TikTok" | "Facebook" | "Shopee";

export interface AdsCostType {
  _id: string;
  platform: PlatformName;
  date: string; // YYYY-MM-DD
  spendActual: number;
  ordersDelivered: number;
  ordersReturned: number;
  netRevenue: number;
  platformFee?: number;
  returnFee?: number;
  targetProduct: string;
  idProduct: string;
}

interface AdsCostState {
  adsCosts: AdsCostType[];
  loading: boolean;
  error: string | null;

  fetchAdsCosts: () => Promise<{ status: string; message: string } | undefined>;
  addAdsCost: (cost: Omit<AdsCostType, "_id">) => Promise<{ status: string; message: string } | undefined>;
  updateAdsCost: (id: string, cost: Partial<AdsCostType>) => Promise<{ status: string; message: string } | undefined>;
  deleteAdsCost: (id: string) => Promise<{ status: string; message: string } | undefined>;
  updateUploadExcel: (oldData: AdsCostType[], newData: Omit<AdsCostType[], "_id">) => Promise<void>;
}

export const useAdsCostStore = create<AdsCostState>((set, get) => ({
  adsCosts: [],
  loading: false,
  error: null,

  fetchAdsCosts: async () => {
    set({ loading: true, error: null });
    try {
      const { getAuthHeader, logout } = useAuthStore.getState();
      const res = await fetch(GetAdsCosts_API, {
        headers: {
          "Content-Type": "application/json",
          ...getAuthHeader(),
        },
      });
      const data = await res.json();
      if (res.status === 401) {
        logout();
        window.location.href = "/login";
        return { status: "No valid token", message: data.message };
      }
      set({ adsCosts: data, loading: false });
    } catch (err: any) {
      set({ error: err.message, loading: false });
    }
  },

  addAdsCost: async (cost) => {
    try {
      const { getAuthHeader, logout } = useAuthStore.getState();
      const res = await fetch(AddAdsCosts_API, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          ...getAuthHeader(),
        },
        body: JSON.stringify(cost),
      });
      const data = await res.json();
      if (res.ok) {
        set((state) => ({ adsCosts: [data, ...state.adsCosts] }));
        return { status: "success", message: "" };
      }
    } catch (err: any) {
      set({ error: err.message });
      return { status: "failed", message: "" };
    }
  },

  updateAdsCost: async (id, cost) => {
    try {
      const { getAuthHeader, logout } = useAuthStore.getState();
      const res = await fetch(`${GetAdsCosts_API}/${id}`, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
          ...getAuthHeader(),
        },
        body: JSON.stringify(cost),
      });
      const data = await res.json();
      if (res.ok) {
        set((state) => ({
          adsCosts: state.adsCosts.map((c) => (c._id === id ? { ...c, ...data } : c)),
        }));
        return { status: "success", message: "" };
      }
    } catch (err: any) {
      set({ error: err.message });
      return { status: "failed", message: err.message };
    }
  },

  deleteAdsCost: async (id) => {
    try {
      const { getAuthHeader, logout } = useAuthStore.getState();
      const res = await fetch(`${GetAdsCosts_API}/${id}`, {
        method: "DELETE",
        headers: {
          ...getAuthHeader(),
        },
      });
      const data = await res.json();
      if (res.ok) {
        set((state) => ({
          adsCosts: state.adsCosts.filter((c) => c._id !== id),
        }));
        return { status: "success", message: "" };
      }
    } catch (err: any) {
      set({ error: err.message });
      return { status: "failed", message: err.message };
    }
  },
  //update upload
  updateUploadExcel: async (oldData, newData) => {
    const combineData = [...oldData, ...newData];
    set({ adsCosts: combineData });
  },
}));
