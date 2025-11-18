import { create } from "zustand";
import {
  SearchStaff_API,
  CreateInvitation_API,
  GetSentInvitations_API,
  GetReceivedInvitations_API,
  AcceptInvitation_API,
  RejectInvitation_API,
  DeleteInvitation_API,
} from "../config/api";
import { useAuthStore } from "./authStore";
import type { StaffRole } from "./staffStore";
import type { IBranch } from "./branchStore";
import { useBranchStore } from "./branchStore";

export interface IInvitation {
  _id: string;
  sender: string | { _id: string; company_name?: string };
  branch_id: string | { _id: string; display_name: string };
  role: StaffRole;
  staffID: string;
  staff_email: string;
  staff_name: string;
  date: string;
  note?: string;
  status: "pending" | "accepted";
  expired:string;
  createdAt?: string;
  updatedAt?: string;
}

export interface SearchedStaff {
  staffID: string;
  email: string;
  name: string;
  birthday: string;
  age: number | null;
}

interface InvitationState {
  loading: boolean;
  error: string | null;
  sentInvitations: IInvitation[] | null;
  receivedInvitations: IInvitation[] | null;
  searchedStaff: SearchedStaff | null;

  // Search staff
  searchStaff: (query: string) => Promise<{ status: string; message: string; staff?: SearchedStaff } | undefined>;

  // update searchedStaff
  updateSearchedStaff: (data: SearchedStaff | null) => void;

  // Create invitation
  createInvitation: (
    branch_id: string,
    role: StaffRole,
    staffID: string,
    staff_email: string,
    staff_name: string,
    note?: string
  ) => Promise<{ status: string; message: string; invitation?: IInvitation } | undefined>;

  // Get invitations
  fetchSentInvitations: () => Promise<void>;
  fetchReceivedInvitations: () => Promise<void>;

  // Accept/Reject invitation
  acceptInvitation: (invitationId: string) => Promise<{ status: string; message: string } | undefined>;
  rejectInvitation: (invitationId: string) => Promise<{ status: string; message: string } | undefined>;

  // Delete invitation (by sender)
  deleteInvitation: (invitationId: string) => Promise<{ status: string; message: string } | undefined>;
}

export const useInvitationStore = create<InvitationState>((set) => ({
  loading: false,
  error: null,
  sentInvitations: null,
  receivedInvitations: null,
  searchedStaff: null,

  searchStaff: async (query: string) => {
    set({ loading: true, error: null });
    try {
      const { getAuthHeader, logout } = useAuthStore.getState();
      const res = await fetch(`${SearchStaff_API}?query=${encodeURIComponent(query)}`, {
        method: "GET",
        headers: { ...getAuthHeader() },
      });
      const data = await res.json();
      console.log('res', res);
      if (!res.ok) {
        // const errorData = await res.json();
        // throw new Error(errorData.message || `Failed to search staff: ${res.status}`);

        set({loading: false})
        return { status: "failed", message: data.message};
      }

      if (res.status === 401) {
        logout();
        window.location.href = "/login";
        return { status: "No valid token", message: "Unauthorized" };
      }



      set({ searchedStaff: data, loading: false });
      return { status: "success", message: "Staff found", staff: data };
    } catch (err: any) {
      set({ error: err.message, loading: false, searchedStaff: null });
      return { status: "failed", message: err.message };
    }
  },

  updateSearchedStaff: (data) => {
    set({searchedStaff: data})
  },

  createInvitation: async (branch_id, role, staffID, staff_email, staff_name, note) => {
    set({ loading: true, error: null });
    try {
      const { getAuthHeader, logout } = useAuthStore.getState();
      const res = await fetch(CreateInvitation_API, {
        method: "POST",
        headers: { ...getAuthHeader(), "Content-Type": "application/json" },
        body: JSON.stringify({
          branch_id,
          role,
          staffID,
          staff_email,
          staff_name,
          note: note || "",
        }),
      });

      if (!res.ok) {
        const errorData = await res.json();
        throw new Error(errorData.message || `Failed to create invitation: ${res.status}`);
      }

      if (res.status === 401) {
        logout();
        window.location.href = "/login";
        return { status: "No valid token", message: "Unauthorized" };
      }

      const data = await res.json();
      set({ loading: false });
      // Refresh sent invitations
      const { fetchSentInvitations } = useInvitationStore.getState();
      await fetchSentInvitations();
      return { status: "success", message: data.message || "Invitation sent successfully", invitation: data.invitation };
    } catch (err: any) {
      set({ error: err.message, loading: false });
      return { status: "failed", message: err.message };
    }
  },

  fetchSentInvitations: async () => {
    set({ loading: true, error: null });
    try {
      const { getAuthHeader, logout } = useAuthStore.getState();

      const res = await fetch(GetSentInvitations_API, {
        method: "GET",
        headers: { ...getAuthHeader() },
      });

      if (!res.ok) throw new Error(`Failed to fetch invitations: ${res.status}`);

      if (res.status === 401) {
        logout();
        window.location.href = "/login";
        return;
      }

      const data = await res.json();
      set({ sentInvitations: data, loading: false });
    } catch (err: any) {
      set({ error: err.message, loading: false });
    }
  },

  fetchReceivedInvitations: async () => {
    set({ loading: true, error: null });
    try {
      const { getAuthHeader, logout } = useAuthStore.getState();
      const res = await fetch(GetReceivedInvitations_API, {
        method: "GET",
        headers: { ...getAuthHeader() },
      });

      if (!res.ok) throw new Error(`Failed to fetch invitations: ${res.status}`);

      if (res.status === 401) {
        logout();
        window.location.href = "/login";
        return;
      }

      const data = await res.json();
      set({ receivedInvitations: data, loading: false });
    } catch (err: any) {
      set({ error: err.message, loading: false });
    }
  },

  acceptInvitation: async (invitationId: string) => {
    set({ loading: true, error: null });
    try {
      const { getAuthHeader, logout } = useAuthStore.getState();
      const res = await fetch(`${AcceptInvitation_API}/${invitationId}/accept`, {
        method: "POST",
        headers: { ...getAuthHeader() },
      });

      if (!res.ok) {
        const errorData = await res.json();
        throw new Error(errorData.message || `Failed to accept invitation: ${res.status}`);
      }

      if (res.status === 401) {
        logout();
        window.location.href = "/login";
        return { status: "No valid token", message: "Unauthorized" };
      }

      const data = await res.json();
      set({ loading: false });

      //Append to current branch
      const currentBranches = useBranchStore.getState().list_branch_management || [];
      const newBranch_Manage = data.branch_manage;
      if(newBranch_Manage && currentBranches){
      useBranchStore.getState().setUpdateListBranchManagement([...currentBranches, newBranch_Manage] )
      }

      // Refresh received invitations
      const { fetchReceivedInvitations } = useInvitationStore.getState();
      await fetchReceivedInvitations();
      return { status: "success", message: data.message || "Invitation accepted successfully" };
    } catch (err: any) {
      set({ error: err.message, loading: false });
      return { status: "failed", message: err.message };
    }
  },

  rejectInvitation: async (invitationId: string) => {
    set({ loading: true, error: null });
    try {
      const { getAuthHeader, logout } = useAuthStore.getState();
      const res = await fetch(`${RejectInvitation_API}/${invitationId}/reject`, {
        method: "POST",
        headers: { ...getAuthHeader() },
      });

      if (!res.ok) {
        const errorData = await res.json();
        throw new Error(errorData.message || `Failed to reject invitation: ${res.status}`);
      }

      if (res.status === 401) {
        logout();
        window.location.href = "/login";
        return { status: "No valid token", message: "Unauthorized" };
      }

      const data = await res.json();
      set({ loading: false });
      // Refresh received invitations
      const { fetchReceivedInvitations } = useInvitationStore.getState();
      await fetchReceivedInvitations();
      return { status: "success", message: data.message || "Invitation rejected" };
    } catch (err: any) {
      set({ error: err.message, loading: false });
      return { status: "failed", message: err.message };
    }
  },

  deleteInvitation: async (invitationId: string) => {
    set({ loading: true, error: null });
    try {
      const { getAuthHeader, logout } = useAuthStore.getState();
      const res = await fetch(`${DeleteInvitation_API}/${invitationId}`, {
        method: "DELETE",
        headers: { ...getAuthHeader() },
      });

      if (!res.ok) {
        const errorData = await res.json();
        throw new Error(errorData.message || `Failed to delete invitation: ${res.status}`);
      }

      if (res.status === 401) {
        logout();
        window.location.href = "/login";
        return { status: "No valid token", message: "Unauthorized" };
      }

      const data = await res.json();
      set({ loading: false });
      // Refresh sent invitations
      const { fetchSentInvitations } = useInvitationStore.getState();
      await fetchSentInvitations();
      return { status: "success", message: data.message || "Invitation deleted successfully" };
    } catch (err: any) {
      set({ error: err.message, loading: false });
      return { status: "failed", message: err.message };
    }
  },
}));

