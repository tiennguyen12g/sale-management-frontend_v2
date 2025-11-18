import { create } from "zustand";
import axiosApiCall from "./axiosApiClient";
import { useAuthStore } from "./authStore";
import { GetAdsAccounts_API, FetchAndSaveAdsAccounts_API, backendAPI } from "../config/api";

// ---------- Types ----------
export interface BusinessInfo {
  id: string;
  name: string;
}

export interface FundingSourceDetails {
  id?: string;
  display_string?: string;
  type?: number;
}

export interface AccountControls {
  status?: string;
  audience_controls?: any;
}

export interface MaxBid {
  max_bid?: number;
}

export interface AdsAccountType {
  _id: string;
  userId: string;
  company_id: string;
  userSocialId: string;
  account_id: string;
  facebook_id: string;
  account_status: number;
  age: number;
  amount_spent: string;
  balance: string;
  currency: string;
  spend_cap: string;
  min_daily_budget?: number;
  max_bid?: MaxBid;
  business?: BusinessInfo;
  business_name?: string;
  business_city?: string;
  business_country_code?: string;
  owner?: string;
  name: string;
  timezone_name?: string;
  created_time?: string;
  disable_reason?: number;
  account_controls?: AccountControls;
  funding_source?: string;
  funding_source_details?: FundingSourceDetails;
  opportunity_score?: number;
  users?: any[];
  campaigns?: any[];
  ads?: any[];
  note?: string;
  yourSetLimitedSpending?: number;
  adsRole?: string;
  last_synced?: string;
  active: boolean;
  createdAt?: string;
  updatedAt?: string;
}
interface UserSocialInfoType {
  _id: string;
  name: string;
  email?: string;
  platform_id: string;
  platform: string;
}
interface AdsAccountState {
  adsAccounts: AdsAccountType[];
  facebookUser: UserSocialInfoType[];
  loading: boolean;
  error: string | null;
  fetchAdsAccounts: (userSocialId?: string) => Promise<{ status: string; message?: string }>;
  fetchAndSaveAdsAccounts: (userSocialId: string) => Promise<{ status: string; message?: string; data?: any }>;
  updateAdsAccount: (
    id: string,
    updates: { note?: string; yourSetLimitedSpending?: number; adsRole?: string }
  ) => Promise<{ status: string; message?: string }>;
  deleteAdsAccount: (id: string) => Promise<{ status: string; message?: string }>;
  fetchFacebookUser: () => Promise<{ status: string; message?: string }>;
}

export const useAdsAccountStore = create<AdsAccountState>((set, get) => ({
  adsAccounts: [],
  facebookUser: [],
  loading: false,
  error: null,

  // Fetch ads accounts from backend
  fetchAdsAccounts: async (userSocialId?: string) => {
    try {
      set({ loading: true, error: null });
      const { getAuthHeader } = useAuthStore.getState();

      const url = userSocialId ? `${GetAdsAccounts_API}?userSocialId=${userSocialId}` : GetAdsAccounts_API;

      const res = await axiosApiCall.get(url, {
        headers: { "Content-Type": "application/json", ...getAuthHeader() },
      });

      set({ adsAccounts: res.data, loading: false });
      return { status: "success" };
    } catch (err: any) {
      console.error("Failed to fetch ads accounts:", err);
      set({ error: err.message, loading: false });
      return { status: "failed", message: err.message };
    }
  },

  // Fetch ads accounts from Facebook and save to backend
  fetchAndSaveAdsAccounts: async (userSocialId: string) => {
    try {
      set({ loading: true, error: null });
      const { getAuthHeader } = useAuthStore.getState();

      const res = await axiosApiCall.post(
        FetchAndSaveAdsAccounts_API,
        { userSocialId },
        {
          headers: { "Content-Type": "application/json", ...getAuthHeader() },
        }
      );

      if (res.data.success) {
        // Refresh the list after saving
        await get().fetchAdsAccounts(userSocialId);
        set({ loading: false });
        return { status: "success", message: res.data.message, data: res.data.data };
      } else {
        set({ error: res.data.message, loading: false });
        return { status: "failed", message: res.data.message };
      }
    } catch (err: any) {
      console.error("Failed to fetch and save ads accounts:", err);
      set({ error: err.message, loading: false });
      return { status: "failed", message: err.message };
    }
  },

  // Update ads account (custom fields)
  updateAdsAccount: async (id: string, updates: { note?: string; yourSetLimitedSpending?: number; adsRole?: string }) => {
    try {
      set({ loading: true, error: null });
      const { getAuthHeader } = useAuthStore.getState();

      const res = await axiosApiCall.put(`${GetAdsAccounts_API}/${id}`, updates, {
        headers: { "Content-Type": "application/json", ...getAuthHeader() },
      });

      if (res.data.success) {
        // Update local state
        set((state) => ({
          adsAccounts: state.adsAccounts.map((account) => (account._id === id ? { ...account, ...updates } : account)),
          loading: false,
        }));
        return { status: "success", message: res.data.message };
      } else {
        set({ error: res.data.message, loading: false });
        return { status: "failed", message: res.data.message };
      }
    } catch (err: any) {
      console.error("Failed to update ads account:", err);
      set({ error: err.message, loading: false });
      return { status: "failed", message: err.message };
    }
  },

  // Delete ads account (soft delete)
  deleteAdsAccount: async (id: string) => {
    try {
      set({ loading: true, error: null });
      const { getAuthHeader } = useAuthStore.getState();

      const res = await axiosApiCall.delete(`${GetAdsAccounts_API}/${id}`, {
        headers: { "Content-Type": "application/json", ...getAuthHeader() },
      });

      if (res.data.success) {
        // Remove from local state
        set((state) => ({
          adsAccounts: state.adsAccounts.filter((account) => account._id !== id),
          loading: false,
        }));
        return { status: "success", message: res.data.message };
      } else {
        set({ error: res.data.message, loading: false });
        return { status: "failed", message: res.data.message };
      }
    } catch (err: any) {
      console.error("Failed to delete ads account:", err);
      set({ error: err.message, loading: false });
      return { status: "failed", message: err.message };
    }
  },
   fetchFacebookUser: async () => {
     try {
       set({ loading: true, error: null });
       const { getAuthHeader } = useAuthStore.getState();

       // Fetch Facebook users using the social platform API
       const res = await axiosApiCall.get(`${backendAPI}/social-platform/accounts?platform=facebook`, {
         headers: { "Content-Type": "application/json", ...getAuthHeader() },
       });
       
       console.log('fetchFacebookUser res.data:', res.data);
       const facebookUsers = res.data || [];
       set({ facebookUser: facebookUsers, loading: false });
       
       return { status: "success", message: `Found ${facebookUsers.length} Facebook user(s)` };
     } catch (err: any) {
       console.error("Failed to fetch Facebook users:", err);
       // If no Facebook users are connected, show empty state
       set({ facebookUser: [], error: err.message, loading: false });
       return { status: "failed", message: err.message };
     }
   },
}));
