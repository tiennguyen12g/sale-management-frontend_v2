import { create } from "zustand";

import { 
  GetStaffList_API, 
  GetStaffProfile_API,
  EditStaffInfo_API,
  DeleteStaff_API,
  AddStaff_API, 
  UploadStaffSalary_API,
  UploadStaffAttendance_API,
  UploadStaffDailyRecord_API,
  UpdateSalary_API 
} from "../configs/api";
import { useAuthStore, type UserInfoType } from "./authStore";

export const SalaryByPosition: Record<StaffRole, number> = {
  Director: 30000000,
  Manager: 8000000,
  "Sale-Staff": 6000000,
  Security: 6000000,
  Packer: 6000000,
};

export type StaffRole = "Director" | "Manager" | "Sale-Staff" | "Security" | "Packer";

export type RelationshipStatus = "single" | "married" | "divorced" | "widowed" | "complicated";
export type Religion = "Catholic" | "Buddhist" | "Muslim" | "No Religion" | "Other";

export interface SalaryRecord {
  time: string; // YYYY-MM, easier to filter by month
  baseSalary: number; // salary before bonus/fine
  totalCloseOrder: number;
  totalDistributionOrder: number;
  totalRevenue: number; // total revenue handled by staff
  fine?: {
    note: string;
    value: number;
  };
  bonus?: {
    note: string;
    value: number;
  };
}
export interface IDailyRecord {
  staff_id: string;
  company_id: string;
  date: string;
  bonus: number;
  bonusNote: string;
  fine: number;
  fineNote: string;
  overtime: number;
  overtimeNote: string;
}
export interface IAttendance {
  staff_id: string;
  company_id: string;
  date: string;
  status: "onTime" | "late" | "absent";
  note?: string;
}

export interface SalarySummary {
  month: string; // YYYY-MM
  baseSalary: number;
  totalRevenue: number;
  totalBonus: number;
  totalFine: number;
  overtimeHours: number;
  paid: boolean;
  totalCloseOrder: number;
  totalDistributionOrder: number;
}
export interface IStaff {
  _id: string;
  company_id: string;
  staff_email: string;
  staffID: string;

  role: StaffRole;
  salary: number;
  joinedDate: string;
  quitDate?: string;

  list_branch_management: string[]; // → Branch._id[]

  staffInfo: UserInfoType;

  diligenceCount: number;
  isOnline: boolean;
  lastSeen: string;
  claimedAt: string;
  isMorningBatch: boolean;

  bankInfos: {
    bankAccountNumber: string;
    bankOwnerName: string;
    bankName: string;
    bankShortName: string;
    bankCode: string;
  };

  salaryHistory: SalarySummary[];
}
export interface IAttendanceCompany {
  staffID: string;
  attendance: IAttendance[]
}
export interface IDailyRecordCompany {
  staffID: string;
  dailyRecord: IDailyRecord[]
}
interface StaffState {
  loading: boolean;
  error: string | null;

  // -- For user who own company
  attendanceCompany: IAttendanceCompany[] | [];
  dailyRecordCompany: IDailyRecordCompany[] | [];
  addStaffToCompany: () => void;
  // -- For staff users - get and update their own profile
  yourStaffProfileInWorkplace: IStaff | null;
  attendance: IAttendance[] | [];
  dailyRecords: IDailyRecord[] | [];
  fetchYourStaffProfileInWorkplace: (staffID: string, company_id: string) => Promise<{ status: string; message: string } | undefined>;
  updateYourStaffProfile: (staffID: string, company_id: string, data: Partial<IStaff>) => Promise<{ status: string; message: string } | undefined>;

  // For company owners - manage all staff
  staffList: IStaff[] | null;
  fetchStaffList: (company_id: string) => Promise<void>;
  deleteStaff: (staffID: string, company_id: string) => Promise<{ status: string; message: string } | undefined>;

  // Upload functions for company owners
  uploadSalary: (company_id: string, file: File) => Promise<{ status: string; message: string; updates?: any[] } | undefined>;
  uploadAttendance: (company_id: string, file: File) => Promise<{ status: string; message: string; updates?: any[] } | undefined>;
  uploadDailyRecord: (company_id: string, file: File) => Promise<{ status: string; message: string; updates?: any[] } | undefined>;
  updateSalary: (company_id: string, time: string, workDays?: number, workHoursPerDay?: number, overTimeRate?: number) => Promise<{ status: string; message: string; updates?: any[] } | undefined>;
}

export const useStaffStore = create<StaffState>((set) => ({
  loading: false,
  error: null,

  // -- For user who own company
  attendanceCompany: [],
  dailyRecordCompany: [],
  addStaffToCompany: () => {

  },

  // -- For user who is staff
  yourStaffProfileInWorkplace: null,
  attendance: [],
  dailyRecords: [],
  fetchYourStaffProfileInWorkplace: async (staffID, company_id) => {
    set({ loading: true, error: null });
    try {
      const { getAuthHeader, logout } = useAuthStore.getState();
      const res = await fetch(`${GetStaffProfile_API}/${staffID}/${company_id}`, { headers: { ...getAuthHeader() }, method: "GET" });
      if (!res.ok) throw new Error(`Failed to fetch staff: ${res.status}`);
      const data = await res.json();
      console.log('data', data);
      if (res.status === 401) {
        logout();
        window.location.href = "/login";
        return { status: "No valid token", message: data.message };
      }
      // Backend returns { message: "Success", data: { staff, attendance, dailyRecords } }
      if (data.data) {
        set({ 
          yourStaffProfileInWorkplace: data.data.staff, 
          attendance: data.data.attendance || [], 
          dailyRecords: data.data.dailyRecords || [], 
          loading: false 
        });
      } else {
        // Fallback for old format
        set({ 
          yourStaffProfileInWorkplace: data.staff, 
          attendance: data.attendance || [], 
          dailyRecords: data.dailyRecords || [], 
          loading: false 
        });
      }
      return { status: "success", message: "" };
    } catch (err: any) {
      set({ error: err.message, loading: false });
      return { status: "failed", message: err.message };
    }
  },

  updateYourStaffProfile: async (staffID, company_id, data) => {
    set({ loading: true, error: null });
    try {
      const { getAuthHeader, logout } = useAuthStore.getState();
      const res = await fetch(`${EditStaffInfo_API}/${staffID}/${company_id}`, {
        method: "PUT",
        headers: { ...getAuthHeader(), "Content-Type": "application/json" },
        body: JSON.stringify(data),
      });
      if (!res.ok) {
        const errorData = await res.json();
        throw new Error(errorData.message || `Failed to update staff: ${res.status}`);
      }
      const updated = await res.json();
      if (res.status === 401) {
        logout();
        window.location.href = "/login";
        return { status: "No valid token", message: "Unauthorized" };
      }
      set({ yourStaffProfileInWorkplace: updated, loading: false });
      return { status: "success", message: "Staff profile updated successfully" };
    } catch (err: any) {
      set({ error: err.message, loading: false });
      return { status: "failed", message: err.message };
    }
  },

  //-- Feature for owner of the company update the attendance and daily record
  staffList: null,
  fetchStaffList: async (company_id) => {
    set({ loading: true, error: null });
    try {
      const { getAuthHeader, logout } = useAuthStore.getState();
      const res = await fetch(`${GetStaffList_API}/${company_id}`, { headers: { ...getAuthHeader() } });
      if (!res.ok) throw new Error(`Failed to fetch staff list: ${res.status}`);
      const data = await res.json();
      console.log('data.attendanceCompany', data.attendanceCompany);
      if (res.status === 401) {
        logout();
        window.location.href = "/login";
        return;
      }
      set({ staffList: data.staffCompany, attendanceCompany: data.attendanceCompany, dailyRecordCompany: data.dailyRecordCompany, loading: false });
    } catch (err: any) {
      set({ error: err.message, loading: false });
    }
  },

  deleteStaff: async (staffID, company_id) => {
    set({ loading: true, error: null });
    try {
      const { getAuthHeader, logout } = useAuthStore.getState();
      const res = await fetch(`${DeleteStaff_API}/${staffID}/${company_id}`, {
        method: "DELETE",
        headers: { ...getAuthHeader() },
      });
      if (!res.ok) {
        const errorData = await res.json();
        throw new Error(errorData.message || `Failed to delete staff: ${res.status}`);
      }
      const data = await res.json();
      if (res.status === 401) {
        logout();
        window.location.href = "/login";
        return { status: "No valid token", message: "Unauthorized" };
      }
      // Refresh staff list after deletion
      set({ loading: false });
      // Optionally refresh the list
      const { fetchStaffList } = useStaffStore.getState();
      await fetchStaffList(company_id);
      return { status: "success", message: data.message || "Staff deleted successfully" };
    } catch (err: any) {
      set({ error: err.message, loading: false });
      return { status: "failed", message: err.message };
    }
  },

  uploadSalary: async (company_id, file) => {
    set({ loading: true, error: null });
    try {
      const { getAuthHeader, logout } = useAuthStore.getState();
      const formData = new FormData();
      formData.append("file", file);

      const res = await fetch(`${UploadStaffSalary_API}/${company_id}`, {
        method: "POST",
        headers: { ...getAuthHeader() },
        body: formData,
      });
      if (!res.ok) {
        const errorData = await res.json();
        throw new Error(errorData.message || `Failed to upload salary: ${res.status}`);
      }
      const data = await res.json();
      if (res.status === 401) {
        logout();
        window.location.href = "/login";
        return { status: "No valid token", message: "Unauthorized" };
      }
      set({ loading: false });
      // Refresh staff list after upload
      const { fetchStaffList } = useStaffStore.getState();
      await fetchStaffList(company_id);
      return { status: "success", message: data.message || "Salary uploaded successfully", updates: data.updates };
    } catch (err: any) {
      set({ error: err.message, loading: false });
      return { status: "failed", message: err.message };
    }
  },

  uploadAttendance: async (company_id, file) => {
    set({ loading: true, error: null });
    try {
      const { getAuthHeader, logout } = useAuthStore.getState();
      const formData = new FormData();
      formData.append("file", file);

      const res = await fetch(`${UploadStaffAttendance_API}/${company_id}`, {
        method: "POST",
        headers: { ...getAuthHeader() },
        body: formData,
      });
      if (!res.ok) {
        const errorData = await res.json();
        throw new Error(errorData.message || `Failed to upload attendance: ${res.status}`);
      }
      const data = await res.json();
      console.log('data', data);
      if (res.status === 401) {
        logout();
        window.location.href = "/login";
        return { status: "No valid token", message: "Unauthorized" };
      }
      set({ loading: false });
      // Refresh staff list after upload
      const { fetchStaffList } = useStaffStore.getState();
      await fetchStaffList(company_id);
      return { status: "success", message: data.message || "Attendance uploaded successfully", updates: data.updates };
    } catch (err: any) {
      set({ error: err.message, loading: false });
      return { status: "failed", message: err.message };
    }
  },

  uploadDailyRecord: async (company_id, file) => {
    set({ loading: true, error: null });
    try {
      const { getAuthHeader, logout } = useAuthStore.getState();
      const formData = new FormData();
      formData.append("file", file);

      const res = await fetch(`${UploadStaffDailyRecord_API}/${company_id}`, {
        method: "POST",
        headers: { ...getAuthHeader() },
        body: formData,
      });
      if (!res.ok) {
        const errorData = await res.json();
        throw new Error(errorData.message || `Failed to upload daily records: ${res.status}`);
      }
      const data = await res.json();
      if (res.status === 401) {
        logout();
        window.location.href = "/login";
        return { status: "No valid token", message: "Unauthorized" };
      }
      set({ loading: false });
      // Refresh staff list after upload
      const { fetchStaffList } = useStaffStore.getState();
      await fetchStaffList(company_id);
      return { status: "success", message: data.message || "Daily records uploaded successfully", updates: data.updates };
    } catch (err: any) {
      set({ error: err.message, loading: false });
      return { status: "failed", message: err.message };
    }
  },

  updateSalary: async (company_id, time, workDays = 26, workHoursPerDay = 8, overTimeRate = 100) => {
    set({ loading: true, error: null });
    try {
      const { getAuthHeader, logout } = useAuthStore.getState();
      const res = await fetch(`${UpdateSalary_API}/${company_id}`, {
        method: "POST",
        headers: { ...getAuthHeader(), "Content-Type": "application/json" },
        body: JSON.stringify({ time, workDays, workHoursPerDay, overTimeRate }),
      });
      if (!res.ok) {
        const errorData = await res.json();
        throw new Error(errorData.message || `Failed to update salary: ${res.status}`);
      }
      const data = await res.json();
      if (res.status === 401) {
        logout();
        window.location.href = "/login";
        return { status: "No valid token", message: "Unauthorized" };
      }
      set({ loading: false });
      // Refresh staff list after update
      const { fetchStaffList } = useStaffStore.getState();
      await fetchStaffList(company_id);
      return { status: "success", message: data.message || "Salary updated successfully", updates: data.updates };
    } catch (err: any) {
      set({ error: err.message, loading: false });
      return { status: "failed", message: err.message };
    }
  },
}));

