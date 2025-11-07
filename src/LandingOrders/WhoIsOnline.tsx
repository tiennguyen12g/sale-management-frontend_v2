import React, { useEffect, useState } from "react";
import classNames from "classnames/bind";
import styles from "./WhoIsOnline.module.scss";
const cx = classNames.bind(styles);

import { HeartBeat_Result_API } from "../configs/api";
// import StaffHeartbeat from "./StaffHeartbeat"; // usually used by staff clients, not manager UI

type StaffStatus = {
  staffID: string;
  name: string;
  isOnline: boolean;
  lastSeen: string | null;
};

export default function WhoIsOnline() {
  const [staffs, setStaffs] = useState<StaffStatus[]>([]);
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  const loadStatus = async () => {
    try {
      setError(null);
      setLoading(true);

      // Add Authorization header if your API is protected
      const token = localStorage.getItem("token");

      const res = await fetch(HeartBeat_Result_API, {
        method: "GET",
        headers: {
          "Content-Type": "application/json",
        },
      });

      if (!res.ok) {
        const text = await res.text();
        throw new Error(`HTTP ${res.status}: ${text}`);
      }

      const data = await res.json();

      if (!Array.isArray(data)) {
        // If server wraps response like { results: [...] } adapt here
        // e.g. setStaffs(data.results || []);
        throw new Error("Unexpected API response (expected array).");
      }

      setStaffs(data);
    } catch (err: any) {
      console.error("loadStatus error:", err);
      setError(err.message || String(err));
      setStaffs([]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadStatus();
    const id = setInterval(loadStatus, 30_000);
    return () => clearInterval(id);
  }, []);

  return (
    <div className={cx("manager-dashboard")}>
      {/* If you want to run a heartbeat from this page for testing, uncomment */}
      {/* <StaffHeartbeat /> */}

      <h2>Staff Online Status</h2>

      {error && <div className={cx("error")}>Error: {error}</div>}
      {loading && <div className={cx("loading")}>Loading…</div>}

      <table className={cx("staff-table")}>
        <thead>
          <tr>
            <th>Name</th>
            <th>Staff ID</th>
            <th>Status</th>
            <th>Last Seen</th>
          </tr>
        </thead>
        <tbody>
          {staffs.length === 0 ? (
            <tr>
              <td colSpan={4} style={{ textAlign: "center", padding: 20 }}>
                No staff found
              </td>
            </tr>
          ) : (
            staffs.map((s, m) => (
              <tr key={m}>
                <td>{s.name ?? "—"}</td>
                <td>{s.staffID}</td>
                <td>
                  <span
                    className={cx(
                      "staff-status",
                      s.isOnline ? "online" : "offline"
                    )}
                  >
                    {s.isOnline ? "🟢 Online" : "⚪ Offline"}
                  </span>
                </td>
                <td className={cx("staff-lastseen")}>
                  {s.lastSeen ? new Date(s.lastSeen).toLocaleString() : "Never"}
                </td>
              </tr>
            ))
          )}
        </tbody>
      </table>
    </div>
  );
}
