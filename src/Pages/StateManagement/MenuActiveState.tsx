import { create } from "zustand";
import { persist } from "zustand/middleware";
type MenuState = {
  openMenu: string; // which parent menu is expanded
  activeSubmenu: string; // which submenu is active
  setOpenMenu: (menu: string) => void;
  setActiveSubmenu: (submenu: string) => void;
};


export const useMenuStore = create<MenuState>()(
  persist(
    (set) => ({
      openMenu: "dashboard",
      setOpenMenu: (menu) =>
        set((state) => ({
          openMenu: state.openMenu === menu ? "" : menu, // toggle logic
        })),
      activeSubmenu: "dashboard",
      setActiveSubmenu: (submenu) => set({ activeSubmenu: submenu }),
    }),
    {
      name: "menu-storage", // 🔹 key name in localStorage
    }
  )
);
