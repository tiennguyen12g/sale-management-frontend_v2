import React, { useState } from "react";
import classNames from "classnames/bind";
import styles from "./AttendanceCalendar.module.scss";
// import type { EmployeeAttendanceType, Da } from "../DataTest/DataForStaffSalary";
import { type IAttendance, type IDailyRecord } from "../../../../zustand/staffStore";
import { Tooltip } from "react-tooltip";
const cx = classNames.bind(styles);

import { FaCheck } from "react-icons/fa";
import { TiWarning } from "react-icons/ti";
import { FaTimes } from "react-icons/fa";


interface Props {
  attendance: IAttendance[];
  dailyRecords: IDailyRecord[];
}
export default function AttendanceCalendar({ attendance, dailyRecords }: Props) {
  const [currentMonth, setCurrentMonth] = useState(new Date());

  const year = currentMonth.getFullYear();
  const month = currentMonth.getMonth(); // 0-indexed

  // Filter attendance for current month
  const monthAttendance = attendance.filter((a) => {
    const d = new Date(a.date);
    return d.getFullYear() === year && d.getMonth() === month;
  });

  const attendanceMap: Record<string, IAttendance> = {};
  monthAttendance.forEach((a) => {
    const d = new Date(a.date);
    const key = formatDateLocal(d);
    attendanceMap[key] = a;
  });

  const dailyMap: Record<string, IDailyRecord> = {};
  dailyRecords.forEach((r) => {
    const d = new Date(r.date);
    const key = formatDateLocal(d);
    dailyMap[key] = r;
  });

  // Build days of current month
  const firstDay = new Date(year, month, 1);
  const lastDay = new Date(year, month + 1, 0);
  const daysInMonth = lastDay.getDate();

  const startDay = firstDay.getDay(); // 0 = Sunday
  const weeks: (Date | null)[][] = [];
  let week: (Date | null)[] = Array(startDay).fill(null);

  for (let day = 1; day <= daysInMonth; day++) {
    week.push(new Date(year, month, day));
    if (week.length === 7) {
      weeks.push(week);
      week = [];
    }
  }
  if (week.length > 0) {
    while (week.length < 7) week.push(null);
    weeks.push(week);
  }

  const prevMonth = () => {
    setCurrentMonth(new Date(year, month - 1, 1));
  };

  const nextMonth = () => {
    setCurrentMonth(new Date(year, month + 1, 1));
  };

  function formatDateLocal(d: Date) {
    const y = d.getFullYear();
    const m = String(d.getMonth() + 1).padStart(2, "0");
    const day = String(d.getDate()).padStart(2, "0");
    return `${y}-${m}-${day}`;
  }

  return (
    <div className={cx("calendar-container")}>
      <div className={cx("calendar-header")}>
        <button onClick={prevMonth}>◀</button>
        <h4>
          {currentMonth.toLocaleString("default", { month: "long" })} {year}
        </h4>
        <button onClick={nextMonth}>▶</button>
      </div>

      <div className={cx("calendar-grid")}>
        {["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"].map((d) => (
          <div key={d} className={cx("day-header")}>
            {d}
          </div>
        ))}

        {weeks.map((week, wi) =>
          week.map((day, di) => {
            if (!day) return <div key={`${wi}-${di}`} className={cx("day-cell", "empty")} />;
            const iso = formatDateLocal(day);
            const record = attendanceMap[iso];
            const daily = dailyMap[iso];
            let statusClass = "";
            let symbol = null;

            if (record) {
              if (record.status === "onTime") {
                statusClass = "onTime";
                // symbol = "✔";
                symbol = <FaCheck size={20} color="green" />;
              } else if (record.status === "late") {
                statusClass = "late";
                symbol = <TiWarning size={20} color="orange" />;
              } else if (record.status === "absent") {
                statusClass = "absent";
                // symbol = "✘";
                symbol = <FaTimes size={20} color="red" />;
              }
            }

            return (
              <React.Fragment key={`${wi}-${di}`}>
                <div
                  className={cx("day-cell", statusClass)}
                  // title={record?.note || ""} // ⬅ native tooltip
                  data-tooltip-id={`tip-${wi}-${di}`} // 👈 link target to tooltip
                >
                  <span className={cx("day-number")}>
                    {day.getDate()} {daily && daily.overtime > 0 ? "+" : ""}
                  </span>
                  {symbol && <span className={cx("status-symbol")}> {symbol}</span>}
                  {/* {record?.note && <span className={cx("note-tooltip")}>{record.note}</span>} */}
                </div>
                <Tooltip id={`tip-${wi}-${di}`} place="top">
                  <div>
                    {record?.note && <div>Attendance: {record.note}</div>}
                    {daily && (
                      <>
                        {daily.bonus > 0 && (
                          <div>
                            Thưởng: {daily.bonus.toLocaleString()} đ ({daily.bonusNote})
                          </div>
                        )}
                        {daily.fine > 0 && (
                          <div>
                            Giảm trừ: {daily.fine.toLocaleString()} đ ({daily.fineNote})
                          </div>
                        )}
                        {daily.overtime > 0 && (
                          <div>
                            Tăng ca: {daily.overtime}h ({daily.overtimeNote})
                          </div>
                        )}
                      </>
                    )}
                  </div>
                </Tooltip>
              </React.Fragment>
            );
          })
        )}
      </div>
    </div>
  );
}
