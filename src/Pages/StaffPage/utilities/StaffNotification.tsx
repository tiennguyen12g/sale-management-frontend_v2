import { useEffect, useState } from "react";
import { socketAPI } from "../../../config/api";
import bellNotification from "@components/ui/icons/gifs/bell.gif"
import { useShopOrderStore } from "@/zustand/shopOrderStore";

export default function StaffNotification({ staffID, menuCollapsed }: { staffID: string; menuCollapsed: boolean }) {
  const [status, setStatus] = useState("disconnected");
  const [notifications, setNotifications] = useState<any[]>([]);
  const {addOrderDataFromServer } = useShopOrderStore();

  useEffect(() => {
    // Fix: Import worker properly for Vite - use inline worker or fix the path
    let worker: Worker;
    try {
      // Try the worker import - Vite should handle this
      worker = new Worker(new URL("../../../workers/orderWorker.js", import.meta.url), {
        type: "classic",
      });
    } catch (error) {
      console.error("Failed to create worker:", error);
      return; // Exit early if worker creation fails
    }

    // React main thread
    worker.postMessage({
      type: "connect",
      staffID,
      serverUrl: socketAPI, // Use socketAPI from config (automatically uses HTTPS through Nginx if page is HTTPS)
    });

    worker.onmessage = (e) => {
      if (e.data.type === "connected") {
        setStatus("connected");
      }
      if (e.data.type === "disconnected") {
        setStatus("disconnected");
      }
      if (e.data.type === "new-order") {
        setNotifications((prev) => [e.data.payload, ...prev]);
      }
    };

    return () => {
      worker.postMessage({ type: "disconnect" });
      worker.terminate();
    };
  }, [staffID]);

  useEffect(() => {
    if (notifications.length > 0) {
      // console.log('new ordr', notifications[notifications.length - 1].order);
      addOrderDataFromServer(notifications[notifications.length - 1].order);
    }
  }, [notifications]);
  return (
    <div style={{ padding: 0, fontFamily: "Arial", display: "flex", alignItems: "center", flexDirection: "column" }}>
      <div style={{ display: "flex", alignItems: "center", gap: 10, height: 60 }}>
        <div style={{ display: "flex", justifyContent: "center", alignItems: "center" }}>
          <img src={bellNotification} width={40} height={40} />{" "}
        </div>
        {!menuCollapsed && <div style={{ fontWeight: 600, fontSize: 18, color: "var(--orange-header-text-color)" }}>Đơn mới</div>}
      </div>
      {notifications && (
        <div style={{ color: "#0485fd", fontWeight: 550, fontSize: 16, height: 40, display: "flex", justifyContent: "center", alignItems: "center" }}>
          {notifications.length}
        </div>
      )}
    </div>
  );
}
