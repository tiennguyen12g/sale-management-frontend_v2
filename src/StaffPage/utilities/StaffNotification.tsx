import { useEffect, useState } from "react";
import { socketAPI } from "../../configs/api";
import { FaCartPlus } from "react-icons/fa";
import { IoNotifications } from "react-icons/io5";
import bellNotification from "../../ManagementOrders/icons/bell.gif"
import { useShopOrderStore } from "../../zustand/shopOrderStore";
export default function StaffNotification({ staffID, menuCollapsed }: { staffID: string, menuCollapsed: boolean }) {
  const [status, setStatus] = useState("disconnected");
  const [notifications, setNotifications] = useState<any[]>([]);
  const { addOrder, addOrderDataFromServer } = useShopOrderStore();

  useEffect(() => {
    const worker = new Worker(new URL("../workers/orderWorker.js", import.meta.url));

    worker.postMessage({
      type: "connect",
      staffID,
      serverUrl: socketAPI,
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
    <div style={{ padding: 0, fontFamily: "Arial", display: "flex", alignItems: "center", flexDirection: "column"}}>
      <div style={{ display: "flex", alignItems: "center", gap: 10 , height: 60}}>
        <div style={{display: "flex", justifyContent:"center", alignItems: "center"}}><img src={bellNotification} width={40} height={40}/> </div>
        {!menuCollapsed && <div style={{ fontWeight: 600, fontSize: 18, color: "var(--orange-header-text-color)" }}>Đơn mới</div>}
        
      </div>
      {notifications && <div style={{ color: "#0485fd", fontWeight: 550, fontSize: 16, height: 40, display: "flex", justifyContent:"center", alignItems: "center" }}>{notifications.length}</div>}
    </div>
  );
}
