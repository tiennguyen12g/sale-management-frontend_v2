/**
 * Frontend Staff Status Service
 * Manages staff online/offline status with hybrid approach:
 * 1. WebSocket for real-time updates
 * 2. HTTP heartbeat as fallback
 * 3. Automatic reconnection
 */

import { io, Socket } from "socket.io-client";
import { socketAPI, backendAPI } from "../config/api";
import axiosApiCall from "../zustand/axiosApiClient";
import { useAuthStore } from "../zustand/authStore";

class FrontendStaffStatusService {
  private socket: Socket | null = null;
  private heartbeatInterval: NodeJS.Timeout | null = null;
  private reconnectAttempts = 0;
  private maxReconnectAttempts = 10;
  private staffID: string | null = null;
  private isDestroyed = false;

  /**
   * Initialize connection
   */
  init(staffID: string) {
    if (this.isDestroyed) return;
    
    this.staffID = staffID;
    this.connectWebSocket();
    this.startHttpHeartbeat();
  }

  /**
   * Connect WebSocket with automatic reconnection
   */
  private connectWebSocket() {
    if (!this.staffID || this.isDestroyed) return;

    // Disconnect existing socket if any
    if (this.socket) {
      this.socket.disconnect();
    }

    // Determine if we should use /socket (Nginx) or /socket.io (direct)
    const isHTTPS = typeof window !== "undefined" && window.location.protocol === "https:";
    
    this.socket = io(socketAPI, {
      path: isHTTPS ? "/socket" : "/socket.io", // Nginx proxies /socket, direct uses /socket.io
      query: { staffID: this.staffID },
      autoConnect: true,
      reconnection: true,
      reconnectionAttempts: this.maxReconnectAttempts,
      reconnectionDelay: 1000,
      reconnectionDelayMax: 5000,
      timeout: 20000,
      transports: ["websocket", "polling"], // Fallback to polling if WebSocket fails
    });

    // Connection events
    this.socket.on("connect", () => {
      console.log("✅ WebSocket connected for staff status");
      this.reconnectAttempts = 0;
      this.sendHeartbeat();
    });

    this.socket.on("disconnect", (reason) => {
      console.log(`❌ WebSocket disconnected: ${reason}`);
      if (reason === "io server disconnect") {
        // Server disconnected, reconnect manually
        this.socket?.connect();
      }
    });

    this.socket.on("connect_error", (error) => {
      console.error("❌ WebSocket connection error:", error.message);
      this.reconnectAttempts++;
      if (this.reconnectAttempts >= this.maxReconnectAttempts) {
        console.warn("⚠️ Max reconnection attempts reached, using HTTP heartbeat only");
      }
    });

    // Listen for status changes
    this.socket.on("staff-status-changed", (data: { staffID: string; status: "online" | "offline"; timestamp: string }) => {
      console.log("📡 Staff status changed:", data);
      // You can emit a custom event here for your Zustand store
      window.dispatchEvent(
        new CustomEvent("staff-status-changed", { detail: data })
      );
    });

    // Send heartbeat via WebSocket every 15 seconds
    setInterval(() => {
      if (this.socket?.connected) {
        this.sendHeartbeat();
      }
    }, 15 * 1000);
  }

  /**
   * Send heartbeat via WebSocket
   */
  private sendHeartbeat() {
    if (this.socket?.connected) {
      this.socket.emit("heartbeat", { staffID: this.staffID, timestamp: Date.now() });
    }
  }

  /**
   * Start HTTP heartbeat as fallback
   */
  private startHttpHeartbeat() {
    // Send HTTP heartbeat every 30 seconds
    this.heartbeatInterval = setInterval(async () => {
      if (!this.staffID || this.isDestroyed) return;

      try {
        const { getAuthHeader } = useAuthStore.getState();
        await axiosApiCall.post(
          `${backendAPI}/heartbeat/ping`,
          {},
          {
            headers: { "Content-Type": "application/json", ...getAuthHeader() },
          }
        );
        // console.log("💓 HTTP heartbeat sent");
      } catch (error) {
        console.error("❌ HTTP heartbeat failed:", error);
      }
    }, 30 * 1000); // Every 30 seconds
  }

  /**
   * Get current staff status
   */
  async getStaffStatus(): Promise<{ isOnline: boolean; lastSeen: Date | null } | null> {
    if (!this.staffID) return null;

    try {
      const { getAuthHeader } = useAuthStore.getState();
      const res = await axiosApiCall.get(`${backendAPI}/heartbeat/staff-status`, {
        headers: { "Content-Type": "application/json", ...getAuthHeader() },
      });
      return res.data;
    } catch (error) {
      console.error("Failed to get staff status:", error);
      return null;
    }
  }

  /**
   * Cleanup
   */
  destroy() {
    this.isDestroyed = true;
    
    if (this.socket) {
      this.socket.disconnect();
      this.socket = null;
    }

    if (this.heartbeatInterval) {
      clearInterval(this.heartbeatInterval);
      this.heartbeatInterval = null;
    }

    this.staffID = null;
    this.reconnectAttempts = 0;
  }
}

export const frontendStaffStatusService = new FrontendStaffStatusService();

