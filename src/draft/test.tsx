import { useEffect, useState } from "react";
import { useOrderWorker } from "@/hooks/useOrderWorker";
import bellNotification from "../../ManagementOrders/icons/bell.gif";
import { useShopOrderStore } from "@/zustand/shopOrderStore";

export default function StaffNotification({
  staffID,
  menuCollapsed,
}: {
  staffID: string;
  menuCollapsed: boolean;
}) {
  const { addOrderDataFromServer } = useShopOrderStore();

  const [status, setStatus] = useState("disconnected");
  const [notifications, setNotifications] = useState<any[]>([]);

  const workerRef = useOrderWorker(staffID);

  // Listen to worker events from hook
  useEffect(() => {
    if (!workerRef.current) return;

    const worker = workerRef.current;

    worker.onmessage = (e) => {
      switch (e.data.type) {
        case "connected":
          setStatus("connected");
          break;

        case "disconnected":
          setStatus("disconnected");
          break;

        case "new-order":
          setNotifications((prev) => [e.data.payload, ...prev]);
          break;
      }
    };
  }, [workerRef.current]);

  // State update when new order arrives
  useEffect(() => {
    if (notifications.length > 0) {
      const latestOrder = notifications[0].order;
      addOrderDataFromServer(latestOrder);
    }
  }, [notifications]);

  return (
    <div
      style={{
        padding: 0,
        fontFamily: "Arial",
        display: "flex",
        alignItems: "center",
        flexDirection: "column",
      }}
    >
      <div
        style={{
          display: "flex",
          alignItems: "center",
          gap: 10,
          height: 60,
        }}
      >
        <img src={bellNotification} width={40} height={40} />
        {!menuCollapsed && (
          <div
            style={{
              fontWeight: 600,
              fontSize: 18,
              color: "var(--orange-header-text-color)",
            }}
          >
            Đơn mới
          </div>
        )}
      </div>

      <div
        style={{
          color: "#0485fd",
          fontWeight: 550,
          fontSize: 16,
          height: 40,
          display: "flex",
          justifyContent: "center",
          alignItems: "center",
        }}
      >
        {notifications.length}
      </div>
    </div>
  );
}
