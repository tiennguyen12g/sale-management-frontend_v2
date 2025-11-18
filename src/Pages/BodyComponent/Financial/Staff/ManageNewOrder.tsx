import { useEffect, useState } from "react";
import { ClaimOrderStats_API } from "../../../../config/api";

type StaffStat = { staffID: string; name: string; claimed: number; status: "Present" | "Absent" };

import { StaffRedistributeButton } from "./RedistributeOrder";
import { useStaffStore } from "../../../../zustand/staffStore";
import { useAuthStore } from "../../../../zustand/authStore";
export default function ManagerNewOrderStats() {
    const {yourStaffId: staffID, user} = useAuthStore();
   const [stats, setStats] = useState<{ unclaimed: number; staffStats: StaffStat[] }>({
    unclaimed: 0,
    staffStats: [],
  });

  const loadStats = async () => {
    const res = await fetch(ClaimOrderStats_API);
    const data = await res.json();
    setStats(data);
  };

  useEffect(() => {
    loadStats();
    const timer = setInterval(loadStats, 20000); // auto-refresh every 20s
    return () => clearInterval(timer);
  }, []);

  return (
    <div style={{fontFamily: "Arial" }}>
      <h2>📊 Manager Dashboard</h2>
      <div>
        <StaffRedistributeButton staffID={staffID || "admin"} userId={user?._id || "admin"}/>
        <div><b>Unclaimed Orders:</b> {stats.unclaimed}</div>
      </div>

      <table border={1} cellPadding={8} cellSpacing={0} style={{ marginTop: 10, minWidth: "600px" }}>
        <thead>
          <tr style={{ background: "#f0f0f0" }}>
            <th>Staff ID</th>
            <th>Name</th>
            <th>Status</th>
            <th>Orders Claimed</th>
          </tr>
        </thead>
        <tbody>
          {stats.staffStats.map((s, i) => (
            <tr key={i} style={{ background: s.status === "Absent" ? "#ffe0e0" : "#e0ffe0" }}>
              <td>{s.staffID}</td>
              <td>{s.name}</td>
              <td>{s.status === "Present" ? "✅ Present" : "❌ Absent"}</td>
              <td>{s.claimed}</td>
            </tr>
          ))}
        </tbody>
      </table>

    </div>
  );
}
