import { useEffect, useState } from "react";
import { getSocket } from "../../../zustand/socketService";
import { useAuthStore } from "@/zustand/authStore";

interface Props {
  staffID?: string;
  menuCollapsed: boolean;
}

export default function StaffTracking_v2({ staffID, menuCollapsed }: Props) {
  const [status, setStatus] = useState<"online" | "offline">("offline");
  const { yourStaffId } = useAuthStore();

  useEffect(() => {
    if (!yourStaffId) return;

    // ✅ Get the existing global socket (do NOT open a new one)
    const socket = getSocket(yourStaffId);

    // Listen for online/offline updates
    socket.on("status", (data) => {
      if (data.staffID === yourStaffId) {
        setStatus(data.status);
      }
    });

    // Optionally request current status from server
    socket.emit("status:check", { staffID: yourStaffId });

    return () => {
      socket.off("status");
    };
  }, [yourStaffId]);

  const onlineText = (
    <div>
      <span style={{ fontSize: 18 }}>🟢</span>
      <span style={{ marginLeft: 10, color: "#ffffff" }}>Online</span>
    </div>
  );

  const offlineText = (
    <div>
      <span style={{ fontSize: 18 }}>⚪</span>
      <span style={{ marginLeft: 10, color: "#ffffff" }}>Offline</span>
    </div>
  );

  const onlineText_Narrow = <div style={{ fontSize: 18 }}>🟢</div>;
  const offlineText_Narrow = <div style={{ fontSize: 18 }}>⚪</div>;

  return (
    <div>
      {!menuCollapsed && status === "online" && onlineText}
      {!menuCollapsed && status === "offline" && offlineText}
      {menuCollapsed && status === "online" && onlineText_Narrow}
      {menuCollapsed && status === "offline" && offlineText_Narrow}
    </div>
  );
}
