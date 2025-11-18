import { create } from "zustand";
import { GetBank_API, AddBank_API } from "../config/api";
import { useAuthStore } from "./authStore";
export interface MoneyBankAccount {
  _id: string;
  owner: string;
  bankName: string;
  shortName: string;
  bankAccountNumber: number;
  type: "normal" | "visa";
  balance: number;
  revenueAdded: number;
  date?: string;
  note?: string;
}

interface MoneyBankState {
  accounts: MoneyBankAccount[];
  loading: boolean;
  error: string | null;

  fetchAccounts: (authHeader: Record<string, string>) => Promise<{ status: string; message: string } | undefined>;
  addAccount: (account: Omit<MoneyBankAccount, "_id">, authHeader: Record<string, string>) => Promise<void>;
  updateAccount: (id: string, data: Partial<MoneyBankAccount>, authHeader: Record<string, string>) => Promise<void>;
  deleteAccount: (id: string, authHeader: Record<string, string>) => Promise<void>;
}

export const useMoneyBankStore = create<MoneyBankState>((set, get) => ({
  accounts: [],
  loading: false,
  error: null,

  fetchAccounts: async (authHeader) => {
    set({ loading: true, error: null });
    try {
      const { logout } = useAuthStore.getState();
      const res = await fetch(GetBank_API, { headers: { ...authHeader } });
      const data = await res.json();
      if (res.status === 401) {
        logout();
        window.location.href = "/login";
        return { status: "No valid token", message: data.message };
      }
      if (!res.ok) throw new Error("Failed to fetch accounts");

      //   console.log('data account', data);
      set({ accounts: data, loading: false });
      return { status: "success", message: data.message };
    } catch (err: any) {
      set({ error: err.message, loading: false });
      return { status: "failed", message: err.message };
    }
  },

  addAccount: async (account, authHeader) => {
    try {
      const res = await fetch(AddBank_API, {
        method: "POST",
        headers: { "Content-Type": "application/json", ...authHeader },
        body: JSON.stringify(account),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.message || "Failed to add account");

      set({ accounts: [...get().accounts, data] });
    } catch (err: any) {
      set({ error: err.message });
    }
  },

  updateAccount: async (id, data, authHeader) => {
    try {
      const res = await fetch(`${GetBank_API}/${id}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json", ...authHeader },
        body: JSON.stringify(data),
      });
      const updated = await res.json();
      if (!res.ok) throw new Error(updated.message || "Failed to update account");

      set({
        accounts: get().accounts.map((acc) => (acc._id === id ? updated : acc)),
      });
    } catch (err: any) {
      set({ error: err.message });
    }
  },

  deleteAccount: async (id, authHeader) => {
    try {
      const res = await fetch(`${GetBank_API}/${id}`, {
        method: "DELETE",
        headers: { ...authHeader },
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.message || "Failed to delete account");

      set({ accounts: get().accounts.filter((acc) => acc._id !== id) });
    } catch (err: any) {
      set({ error: err.message });
    }
  },
}));
