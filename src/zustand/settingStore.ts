import { create } from "zustand";
import { useAuthStore } from "./authStore";
import axiosApiCall from "./axiosApiClient";
import { backendAPI } from "../config/api";

//============================
// Types
//============================
export interface ISettings {
  language: "vn" | "en";
}

//============================
// Store
//============================
interface SettingsState {
  language: ISettings | null;

  // First fetch on login
  initSettings: (settings: ISettings) => void;
}

export const useSettingStore = create<SettingsState>((set, get) => ({
  language: localStorage.getItem("language") ? JSON.parse(localStorage.getItem("language") as string) : "vi",

  // ✅ On login: set settings returned from backend
  initSettings: (settings) => {},
}));
