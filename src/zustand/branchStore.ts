import { create } from "zustand";
import { persist } from "zustand/middleware";
import axiosApiCall from "./axiosApiClient";
import { useAuthStore } from "./authStore";
import { backendAPI } from "../configs/api";
import { type StaffRole } from "./staffStore";

export const PLATFORM_LIST = ["facebook", "instagram", "zalo", "tiktok", "shopee"] as const;
export type PlatformName = (typeof PLATFORM_LIST)[number];
export type BranchType = "shop" | "group";
export interface IListShop {
  shop_id: string;
  platform: PlatformName;
  store_name: string;
  platform_id: string;
  avatar?: string;
}
export interface IListProductSelling {
  product_id: string;
  product_code: string;
  name: string;
}

export interface IBranch {
  _id: string;
  company_id: string;
  company_name?: string;
  type: BranchType;

  display_name: string;
  platform: PlatformName;

  created_by: string;

  archived?: boolean;
  meta?: Record<string, any>;

  // list_attach_shop stays embed because it's bounded small
  list_attach_shop: IListShop[];
  list_product_selling: IListProductSelling[]
}
export interface IBranchForStaff extends IBranch {
  role: StaffRole;
}
//-- Tags setting
export interface TagType {
  id: string;
  tagName: string;
  color: string;
  description?: string;
}
// -- Fast message config.
export interface FastMessageType {
  id: string;
  keySuggest: string;
  listMediaUrl: { id: string; url: string; type: "image" | "video" }[];
  messageContent: string;
}
export interface MediaLinkedType{
id: string;
url: string, 
type: "image" | "video"
}
// -- Favorit album

export interface FavoritAlbum {
  id: string;
  nameImage: string;
  url: string;
}
export interface IBranchSetting {
  _id: string;
  branch_id: string;
  company_id: string;
  shopTagList: TagType[];
  fastMessages: FastMessageType[];
  favoritAlbum: FavoritAlbum[];
}
interface BranchState {
  branches: IBranch[] | null;
  selectedBranch: IBranch | null;
  list_branch_management: IBranchForStaff[] | null;
  branchSettings: IBranchSetting | null;
  fetchBranches: () => Promise<{status: "success" | "failed", message? : string, data?: any}>;
  setUpdateBranches: (branches: IBranch[]) => void;
  setUpdateSelectedBranch: (selectedBranch: IBranch) => void;
  setUpdateListBranchManagement: (list_branch_management: IBranchForStaff[]) => void;
  setUpdateBranchSettings: (newSettings: IBranchSetting) => void;
  fetchBranchSettings: (branch_id: string, company_id: string) => Promise<{status: "success" | "failed", branchSettings? : IBranchSetting }>
  reset: () => void;


  // -- CRUD Updates
  addTag: (newArrayTag: TagType[]) => Promise<void>;
  updateTag: (tagId: string, updates: Partial<TagType>) => Promise<void>;
  deleteTag: (tagId: string) => Promise<void>;

  addFastMessage: (fastMsg: FastMessageType) => Promise<void>;
  updateFastMessage: (msgId: string, updates: Partial<FastMessageType>) => Promise<void>;
  deleteFastMessage: (msgId: string) => Promise<void>;

  uploadFavoriteMedia: (file: File) => Promise<void>;
  deleteFavoriteMedia: (id: string) => Promise<void>;
}

export const useBranchStore = create<BranchState>()(
  persist(
    (set, get) => ({
      branches: null,
      selectedBranch: null,
      list_branch_management: null,
      branchSettings: null,
      fetchBranches: async () => {
        try {
          const { getAuthHeader } = useAuthStore.getState();
          const res = await axiosApiCall.get(`${backendAPI}/branch`, {
            headers: { "Content-Type": "application/json", ...getAuthHeader() },
          });
          const responseData = res.data;
          console.log("fetchBranches response:", responseData);
          
          // Backend returns: { status: "success", data: { branches, listBranchManagement } }
          const branches = responseData.data?.branches || responseData.branches || [];
          const listBranchManagement = responseData.data?.listBranchManagement || responseData.listBranchManagement || [];
          
          set({
            branches: branches,
            list_branch_management: listBranchManagement,
          });
          
          return { status: "success", data: { branches, listBranchManagement } };
        } catch (err: any) {
          console.error("❌ Failed to fetch branch and workplace:", err);
          return { status: "failed", message: err.message };
        }
      },
      setUpdateBranches: (branches) => {
        set({ branches: branches });
      },
      setUpdateSelectedBranch: (selectedBranch) => {
        set({ selectedBranch: selectedBranch });
      },
      setUpdateListBranchManagement: (list_branch_management) => {
        set({ list_branch_management: list_branch_management });
      },
      setUpdateBranchSettings: (newSetting) => {
        set({ branchSettings: newSetting });
      },

      fetchBranchSettings: async (branch_id, company_id) => {
        try {
          const { getAuthHeader } = useAuthStore.getState();
          const res = await axiosApiCall.get(`${backendAPI}/branch-settings/${branch_id}/${company_id}`, {
            headers: { "Content-Type": "application/json", ...getAuthHeader() },
          });
          const data = res.data.data;
          console.log("fetchBranchSettings data", data);
          set({
            branchSettings: data.branchSettings,
          });
          return { status: "success", branchSettings: data.branchSettings, };
        } catch (err: any) {
          console.error("❌ Failed to fetch branch settings:", err);
          return { status: "failed", message: err.message };
        }
      },
      reset: () => set({ branches: [], list_branch_management: [] }),

  // -- BranchSetting CRUD
  // ======================
  // ✅ TAG CRUD
  // ======================
  // Add Tag
  addTag: async (newArrayTag) => {
    try {
      const { getAuthHeader } = useAuthStore.getState();
      const branchInfo = useBranchStore.getState().selectedBranch;
      if (!branchInfo) return;
      const { _id: branch_id, company_id } = branchInfo;
      const res = await axiosApiCall.post(`${backendAPI}/branch-settings/tags/${branch_id}/${company_id}`, { newArrayTag }, { headers: getAuthHeader() });
      // server returns updated tag list
      set((state) => ({
        branchSettings: state.branchSettings ? { ...state.branchSettings, shopTagList: res.data } : state.branchSettings,
      }));
    } catch (err) {
      console.error(err);
    }
  },

  // Update Tag
  updateTag: async (tagId, updates) => {
    try {
      const { getAuthHeader } = useAuthStore.getState();
      const branchInfo = useBranchStore.getState().selectedBranch;
      if (!branchInfo) return;
      const { _id: branch_id, company_id } = branchInfo;
      const res = await axiosApiCall.put(`${backendAPI}/branch-settings/tags/${tagId}/${branch_id}/${company_id}`, updates, { headers: getAuthHeader() });
      set((state) => ({
        branchSettings: state.branchSettings ? { ...state.branchSettings, shopTagList: res.data } : state.branchSettings,
      }));
    } catch (err) {
      console.error(err);
    }
  },

  // Delete Tag
  deleteTag: async (tagId) => {
    try {
      const { getAuthHeader } = useAuthStore.getState();
      const branchInfo = useBranchStore.getState().selectedBranch;
      if (!branchInfo) return;
      const { _id: branch_id, company_id } = branchInfo;
      const res = await axiosApiCall.delete(`${backendAPI}/branch-settings/tags/${tagId}/${branch_id}/${company_id}`, { headers: getAuthHeader() });
      set((state) => ({
        branchSettings: state.branchSettings ? { ...state.branchSettings, shopTagList: res.data } : state.branchSettings,
      }));
    } catch (err) {
      console.error(err);
    }
  },

  // ======================
  // ✅ FAST MESSAGE CRUD
  // ======================
  // Add Fast Message
  addFastMessage: async (fastMsg) => {
    try {
      const { getAuthHeader } = useAuthStore.getState();
      const branchInfo = useBranchStore.getState().selectedBranch;
      if (!branchInfo) return;
      const { _id: branch_id, company_id } = branchInfo;
      const res = await axiosApiCall.post(
        `${backendAPI}/branch-settings/fast-messages/${branch_id}/${company_id}`,
        { fastMessage: fastMsg },
        { headers: getAuthHeader() }
      );
      set((state) => ({
        branchSettings: state.branchSettings ? { ...state.branchSettings, fastMessages: res.data } : state.branchSettings,
      }));
    } catch (err) {
      console.error(err);
    }
  },

  // Update Fast Message
  updateFastMessage: async (msgId, updates) => {
    try {
      const { getAuthHeader } = useAuthStore.getState();
      const branchInfo = useBranchStore.getState().selectedBranch;
      if (!branchInfo) return;
      const { _id: branch_id, company_id } = branchInfo;
      const res = await axiosApiCall.put(`${backendAPI}/branch-settings/fast-messages/${msgId}/${branch_id}/${company_id}`, updates, {
        headers: getAuthHeader(),
      });
      set((state) => ({
        branchSettings: state.branchSettings ? { ...state.branchSettings, fastMessages: res.data } : state.branchSettings,
      }));
    } catch (err) {
      console.error(err);
    }
  },

  // Delete Fast Message
  deleteFastMessage: async (msgId) => {
    try {
      const { getAuthHeader } = useAuthStore.getState();
      const branchInfo = useBranchStore.getState().selectedBranch;
      if (!branchInfo) return;
      const { _id: branch_id, company_id } = branchInfo;
      const res = await axiosApiCall.delete(`${backendAPI}/branch-settings/fast-messages/${msgId}/${branch_id}/${company_id}`, { headers: getAuthHeader() });
      set((state) => ({
        branchSettings: state.branchSettings ? { ...state.branchSettings, fastMessages: res.data } : state.branchSettings,
      }));
    } catch (err) {
      console.error(err);
    }
  },

  // ======================
  // ✅ FAVORITE MEDIA CRUD
  // ======================
  uploadFavoriteMedia: async (file: File) => {
    const { branchSettings } = get();
    if (!branchSettings) return;

    const formData = new FormData();
    formData.append("file", file);

    const { getAuthHeader } = useAuthStore.getState();
    const branchInfo = useBranchStore.getState().selectedBranch;
    if (!branchInfo) return;
    const { _id: branch_id, company_id } = branchInfo;
    const res = await axiosApiCall.post(`${backendAPI}/branch-settings/favorite-album/${branch_id}`, formData, {
      headers: {
        "Content-Type": "multipart/form-data",
        ...getAuthHeader(),
      },
    });

    set({
      branchSettings: {
        ...branchSettings,
        favoritAlbum: res.data.favoritAlbum,
      },
    });
  },

  deleteFavoriteMedia: async (id) => {
    const { getAuthHeader } = useAuthStore.getState();
    const { branchSettings } = get();
    if (!branchSettings) return;
    const branchInfo = useBranchStore.getState().selectedBranch;
    if (!branchInfo) return;
    const { _id: branch_id, company_id } = branchInfo;
    const res = await axiosApiCall.delete(`${backendAPI}/branch-settings/favorite-album/${id}/${branch_id}`, {
      headers: getAuthHeader(),
    });

    set({
      branchSettings: {
        ...branchSettings,
        favoritAlbum: res.data.favoritAlbum,
      },
    });
  },
    }),
    {
      name: "branch-storage", // localStorage key
      storage: {
        getItem: (name) => {
          const str = localStorage.getItem(name);
          if (!str) return null;
          return JSON.parse(str);
        },
        setItem: (name, value) => {
          localStorage.setItem(name, JSON.stringify(value));
        },
        removeItem: (name) => {
          localStorage.removeItem(name);
        },
      },
    }
  )
);
