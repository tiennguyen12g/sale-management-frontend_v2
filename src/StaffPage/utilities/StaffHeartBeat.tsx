import { useEffect } from "react";
import { HeartBeat_API } from "../../configs/api";
import { useAuthStore } from "../../zustand/authStore";
export default function StaffHeartbeat() {
    const {getAuthHeader} = useAuthStore();
  useEffect(() => {
    const interval = setInterval(() => {
      fetch(HeartBeat_API, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          ...getAuthHeader()
        },
      });
    }, 30_000); // every 30s

    return () => clearInterval(interval);
  }, []);

  return null; // no UI, just background ping
}
