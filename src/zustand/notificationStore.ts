import { create } from "zustand";
import { GetNotifications_API, MarkNotificationRead_API, MarkAllNotificationsRead_API } from "../configs/api";
import { useAuthStore } from "./authStore";

export interface INotification {
  _id: string;
  sender_id?: string | { _id: string; username?: string; email?: string } | null;
  receiver_id: string;
  company_id?: string;
  source: "company" | "system";
  type: "info" | "warning" | "success" | "danger" | "order" | "task" | "salary";
  title: string;
  message: string;
  context?: {
    resource: string;
    resource_id: string;
  };
  read: boolean;
  seenAt?: string;
  createdAt: string;
  updatedAt: string;
}

interface NotificationPagination {
  page: number;
  limit: number;
  total: number;
  totalPages: number;
}

interface NotificationState {
  loading: boolean;
  error: string | null;
  notifications: INotification[];
  pagination: NotificationPagination | null;

  fetchNotifications: (page?: number, limit?: number) => Promise<void>;
  markAsRead: (notificationId: string) => Promise<{ status: string; message: string } | undefined>;
  markAllAsRead: () => Promise<{ status: string; message: string } | undefined>;
}

export const useNotificationStore = create<NotificationState>((set) => ({
  loading: false,
  error: null,
  notifications: [],
  pagination: null,

  fetchNotifications: async (page = 1, limit = 10) => {
    set({ loading: true, error: null });
    try {
      const { getAuthHeader, logout } = useAuthStore.getState();
      const res = await fetch(`${GetNotifications_API}?page=${page}&limit=${limit}`, {
        method: "GET",
        headers: { ...getAuthHeader() },
      });

      if (!res.ok) throw new Error(`Failed to fetch notifications: ${res.status}`);

      if (res.status === 401) {
        logout();
        window.location.href = "/login";
        return;
      }

      const data = await res.json();
      set({ notifications: data.notifications, pagination: data.pagination, loading: false });
    } catch (err: any) {
      set({ error: err.message, loading: false });
    }
  },

  markAsRead: async (notificationId: string) => {
    set({ loading: true, error: null });
    try {
      const { getAuthHeader, logout } = useAuthStore.getState();
      const res = await fetch(`${MarkNotificationRead_API}/${notificationId}/read`, {
        method: "PUT",
        headers: { ...getAuthHeader() },
      });

      if (!res.ok) {
        const errorData = await res.json();
        throw new Error(errorData.message || `Failed to mark notification as read: ${res.status}`);
      }

      if (res.status === 401) {
        logout();
        window.location.href = "/login";
        return { status: "No valid token", message: "Unauthorized" };
      }

      const data = await res.json();
      
      // Update local state
      set((state) => ({
        notifications: state.notifications.map((notif) =>
          notif._id === notificationId ? { ...notif, read: true, seenAt: data.notification.seenAt } : notif
        ),
        loading: false,
      }));

      return { status: "success", message: data.message || "Notification marked as read" };
    } catch (err: any) {
      set({ error: err.message, loading: false });
      return { status: "failed", message: err.message };
    }
  },

  markAllAsRead: async () => {
    set({ loading: true, error: null });
    try {
      const { getAuthHeader, logout } = useAuthStore.getState();
      const res = await fetch(MarkAllNotificationsRead_API, {
        method: "PUT",
        headers: { ...getAuthHeader() },
      });

      if (!res.ok) {
        const errorData = await res.json();
        throw new Error(errorData.message || `Failed to mark all notifications as read: ${res.status}`);
      }

      if (res.status === 401) {
        logout();
        window.location.href = "/login";
        return { status: "No valid token", message: "Unauthorized" };
      }

      const data = await res.json();
      
      // Update local state
      set((state) => ({
        notifications: state.notifications.map((notif) => ({ ...notif, read: true })),
        loading: false,
      }));

      return { status: "success", message: data.message || "All notifications marked as read" };
    } catch (err: any) {
      set({ error: err.message, loading: false });
      return { status: "failed", message: err.message };
    }
  },
}));

