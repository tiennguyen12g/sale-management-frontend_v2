import { create } from "zustand";
import { persist } from "zustand/middleware";
import { type StaffRole } from "./staffStore";
import { useBranchStore, type IBranch, type IBranchForStaff } from "./branchStore";
export interface UserInfoType {
  staffID: string;
  name: string;
  birthday: string;
  address: string;
  phone: string;
  relationshipStatus: string;
  religion: string;
  description: string;
  identityId: string;
  accountLogin: string;
}

export type LicensePackage = "free" | "paid" | "trial";

export interface IPurchaseHistory {
  purchased_time: string;
  value_package: number;
  duration: number;
  payment_method: "bank-card" | "crypto-currency";
}

export interface ILicense {
  current_plan: LicensePackage;
  expired_time: string;
  historys: IPurchaseHistory[];
}

export interface UserType {
  _id: string;
  email: string;
  password: string;
  username: string;
  isCreateProfile: boolean;
  registeredDate: string;
  administrator: string;
  blacklist: {
    banned: boolean;
    reason: string;
  };
  userInfo: UserInfoType;
  license: ILicense;
}

export interface ICompany {
  _id: string;
  owner_id: string;
  company_name: string;
  avatar_url?: string;
  socialAccounts: [];
}

interface AuthState {
  token: string | null;
  user: UserType | null;
  company: ICompany | null;
  company_id: string | null;
  yourStaffId: string | null;
  userInfo: UserInfoType | null;
  accessRole: StaffRole;
  hydrated: boolean; // ← required!
  login: (
    token: string,
    user: UserType,
    company: ICompany,
    branches: IBranch[],
    list_branch_management: IBranchForStaff[]
  ) => void;

  logout: () => void;
  getAuthHeader: () => { Authorization?: string };
  setYourStaffId: (staffID: string) => void;
  setUserInfo: (info: UserInfoType) => void;
  setUpdateAccessRole: (role: StaffRole) => void;
}

export const useAuthStore = create<AuthState>()(
  persist(
    (set, get) => ({
      token: null,
      user: null,
      company: null,
      company_id: null,
      yourStaffId: null,
      userInfo: null,
      accessRole: "Sale-Staff",
      hydrated: false,

      login: (token, user, company, branches, list_branch_management) => {
        // Backend returns user with 'id' field, but interface expects '_id'
        // Transform user to match interface
        const transformedUser: UserType = {
          ...user,
          _id: (user as any).id || user._id,
        } as UserType;

        // Determine accessRole: Director if user owns company, otherwise use role from first branch management
        let accessRole: StaffRole = "Sale-Staff";
        const userId = transformedUser._id || (user as any).id;
        if (company && userId === company.owner_id) {
          accessRole = "Director";
        } else if (list_branch_management && list_branch_management.length > 0) {
          accessRole = list_branch_management[0].role;
        }

        // Update branch store
        const { setUpdateBranches, setUpdateListBranchManagement } = useBranchStore.getState();
        setUpdateBranches(branches);
        setUpdateListBranchManagement(list_branch_management);

        set({
          token,
          user: transformedUser,
          company,
          company_id: company?._id || null,
          userInfo: transformedUser.userInfo,
          yourStaffId: transformedUser.userInfo?.staffID || null,
          accessRole,
        });
      },

      logout: () => {
        set({
          token: null,
          user: null,
          company: null,
          company_id: null,
          yourStaffId: null,
          userInfo: null,
          accessRole: "Sale-Staff",
        });
      },

      getAuthHeader: () => {
        const token = get().token;
        return token ? { Authorization: `Bearer ${token}` } : {};
      },

      setYourStaffId: (staffID) => set({ yourStaffId: staffID }),

      setUserInfo: (info) => set({ userInfo: info }),

      setUpdateAccessRole: (role) => set({ accessRole: role }),
    }),
    {
      name: "auth-storage",

      onRehydrateStorage: () => {
        return (state, error) => {
          if (error) {
            console.error("Error rehydrating auth store:", error);
            return;
          }
          // Set hydrated flag after rehydration
          if (state) {
            // Also set company_id if it's not set but company exists
            if (state.company && !state.company_id) {
              state.company_id = state.company._id;
            }
            // Note: hydrated flag is set by hydrationHook
          }
        };
      },

      partialize: (state) => ({
        token: state.token,
        user: state.user,
        userInfo: state.userInfo,
        yourStaffId: state.yourStaffId,
        company: state.company,
        company_id: state.company_id,
        accessRole: state.accessRole,
        // Don't persist hydrated flag
      }),
    }
  )
);
