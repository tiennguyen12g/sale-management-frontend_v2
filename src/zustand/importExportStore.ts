import { create } from "zustand";
import axios from "axios";
import { useAuthStore } from "./authStore";
import { GetImpExpIn_API, AddImpExpIn_API, UploadImpExpIn_API } from "../config/api";
// ---------- Types ----------
export interface ImportProductDetailsType {
  name: string;
  importQuantity: number;
  brokenQuantity: number;
  addStock: number;
  color: string;
  size: string;
  price: number;
  weight: number;
  breakEvenPrice: number;
}
export interface ImportRecord {
  _id: string;
  time: string;
  productId: string;
  productName: string;
  importQuantity: number;
  addedQuantity: number;
  brokenQuantity: number;
  pricePerUnit: number;
  breakEvenPrice: number;
  supplier?: string;
  batchCode: string;
  shippingFee: { externalChinaToVietnam: number; internalVietnamToWarehouse: number };
  otherFees: { value: number; usedFor: string; date: string; note?: string }[];
  totalCost: number;
  totalShipment: number;
  note?: string;
  shipmentStatus: string;
  revenue?: number;
  profit?: number;
  estimateSellingPrice?: number;
  importDetails: ImportProductDetailsType[];
  sizeAvailable: string[];
  colorAvailable: string[];
  warehouseName: string;
}
export interface OtherFeesType {
  value: number; // amount of the fee
  usedFor: string; // description (invoice, translate, customs, etc.)
  date: string; // when the fee was applied
  note?: string;
}
export interface BatchTrackingType {
  batchCode: string;
  breakEvenPrice: number;
}
export interface ExportRecord {
  _id: string;
  time: string;
  productId: string;
  productName: string;
  exportQuantity: number;
  receiver: string;
  breakEvenPrice?: number;
  note?: string;
  batchCode?: string;
}

export interface InventoryRecord {
  _id?: string;
  productId: string;
  productName: string;
  currentStock: number;
  averageCost: number;
  totalValue: number;
  warehouseLocation?: string;
  note?: string;
}

// ---------- Zustand State ----------
interface ImportExportState {
  imports: ImportRecord[];
  exports: ExportRecord[];
  inventory: InventoryRecord[];
  fetchAll: () => Promise<void>;
  uploadExcel: (file: File, target: "import" | "export" | "inventory") => Promise<any>;
  addRecord: (target: "import" | "export" | "inventory", data: any) => Promise<void>;
  updateRecord: (target: "import" | "export" | "inventory", id: string, data: any) => Promise<void>;
  deleteRecord: (target: "import" | "export" | "inventory", id: string) => Promise<void>;
}

export const useImportExportStore = create<ImportExportState>((set, get) => ({
  imports: [],
  exports: [],
  inventory: [],

  fetchAll: async () => {
    try {
      const { getAuthHeader } = useAuthStore.getState();
      const res = await axios.get(GetImpExpIn_API, {
        headers: { ...getAuthHeader() },
      });
      set({
        imports: res.data.imports,
        exports: res.data.exports,
        inventory: res.data.inventory,
      });
    } catch (err) {
      console.error("Fetch failed:", err);
    }
  },

  uploadExcel: async (file, target) => {
    try {
      const { getAuthHeader } = useAuthStore.getState();
      const formData = new FormData();
      formData.append("file", file);
      const res = await axios.post(`${UploadImpExpIn_API}/${target}`, formData, {
        headers: { "Content-Type": "multipart/form-data", ...getAuthHeader() },
      });
      await get().fetchAll();
      return res.data;
    } catch (err) {
      console.error("Upload failed:", err);
      return { message: "Failed" };
    }
  },

  addRecord: async (target, data) => {
    try {
      const { getAuthHeader } = useAuthStore.getState();
      const res = await axios.post(`${AddImpExpIn_API}/${target}`, data, {
        headers: { ...getAuthHeader(), "Content-Type": "application/json" },
      });
      await get().fetchAll();
      return res.data;
    } catch (err) {
      console.error("Add failed:", err);
    }
  },

  updateRecord: async (target, id, data) => {
    try {
      const { getAuthHeader } = useAuthStore.getState();
      const res = await axios.put(`${GetImpExpIn_API}/${target}/${id}`, data, {
        headers: { ...getAuthHeader(), "Content-Type": "application/json" },
      });
      await get().fetchAll();
      return res.data;
    } catch (err) {
      console.error("Update failed:", err);
    }
  },

  deleteRecord: async (target, id) => {
    try {
      const { getAuthHeader } = useAuthStore.getState();
      await axios.delete(`${GetImpExpIn_API}/${target}/${id}`, {
        headers: { ...getAuthHeader() },
      });
      await get().fetchAll();
    } catch (err) {
      console.error("Delete failed:", err);
    }
  },
}));
