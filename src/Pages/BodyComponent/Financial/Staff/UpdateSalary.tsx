import React, { useState, type Dispatch, type SetStateAction } from "react";
import classNames from "classnames/bind";
import styles from "./UpdateSalary.module.scss";
const cx = classNames.bind(styles);
import { UpdateSalary_API } from "../../../../config/api";
import { useAuthStore } from "../../../../zustand/authStore";

interface Props {
    setIsUpdateSalary: Dispatch<SetStateAction<boolean>>
}
export default function UpdateSalaryButton({setIsUpdateSalary} : Props) {
  const { getAuthHeader } = useAuthStore();
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState("");
  const [month, setMonth] = useState(() => {
    const now = new Date();
    return `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, "0")}`;
  });
  const [overTimeRate, setOverTimeRate] = useState(100);


  const handleUpdateSalary = async () => {
    setLoading(true);
    setMessage("");

    try {

      const response = await fetch(UpdateSalary_API, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          ...getAuthHeader(),
        },
        body: JSON.stringify({
          time: month, // e.g. "2025-09"
          workDays: 26, // ⬅ you can make this configurable in UI
          workHoursPerDay: 8, // ⬅ configurable
          overTimeRate,
        }),
      });

      const data = await response.json();
      if (!response.ok) throw new Error(data.message || "Failed to update");

      setMessage(`✅ Updated salary for ${data.updates.length} staff`);
      console.log("Updated salary result:", data.updates);
    } catch (err: any) {
      console.error(err);
      setMessage(`❌ ${err.message}`);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className={cx("main")}>
      <div className={cx("container")}>
        {message && <p>{message}</p>}

        <div>
          <label>
            Choose month and year:{" "}
            <div>
                <input
                  type="month"
                  value={month}
                  onChange={(e) => setMonth(e.target.value)}
                  className={cx('input-decor')}
                />
                
            </div>
          </label>
        </div>
                <div>
          <label>
            Overtime Rate :{" "}
            <div>
                <input
                  type="number"
                  value={overTimeRate}
                  onChange={(e) => setOverTimeRate(Number(e.target.value))}
                  className={cx('input-decor')}
                />
                
            </div>
          </label>
        </div>

        <div>
            <button className={cx('btn-decor', "close")} onClick={() => setIsUpdateSalary(false)}>Close</button>
            <button onClick={handleUpdateSalary} disabled={loading} className={cx('btn-decor', "run")}>
              {loading ? "Updating..." : "Update Salary"}
            </button>
        </div>
      </div>
    </div>
  );
}
