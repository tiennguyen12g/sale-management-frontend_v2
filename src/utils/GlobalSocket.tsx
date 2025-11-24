import { useEffect } from "react";
import { getSocket } from "../zustand/socketService";
import { useFacebookStore } from "../zustand/facebookStore";
import { useAuthStore } from "../zustand/authStore";
import { useMessagingStore } from "../zustand/messagingStore";
export default function GlobalSocket() {
  const { yourStaffId } = useAuthStore();

  useEffect(() => {
    if (!yourStaffId) {
      console.log("⚠️ staffID not found, skipping socket connection");
      return;
    }

    const socket = getSocket(yourStaffId);

    socket.on("connect", () => console.log("✅ Connected to socket"));
    socket.on("disconnect", () => console.log("❌ Disconnected"));

    socket.on("message:new", (data) => {
      console.log("📨 Real-time message:", data);
      // useFacebookStore.getState().addIncomingMessage(data);
      useMessagingStore.getState().addIncomingMessage(data)
    });
    socket.on("conversation-new", (conversation) => {
      console.log("📨 Real-time conversation:", conversation);
    })

    return () => {
      socket.off("message:new");
      socket.disconnect();
    };
  }, [yourStaffId]);

  return null;
}
