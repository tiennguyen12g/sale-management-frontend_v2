import React, { useState, useEffect } from "react";
import classNames from "classnames/bind";
import styles from "./StaffSalary.module.scss";
const cx = classNames.bind(styles);
import type {IAttendance, IDailyRecord, IStaff, SalarySummary, IAttendanceCompany} from "../../../../zustand/staffStore";
import EditStaff from "./EditStaff";
import EditSalaryHistory from "./EditSalaryHistory";
import SaleStaffCharts from "../Charts/SaleStaffCharts";
//icons
import { MdModeEdit } from "react-icons/md";
import AttendanceCalendar from "./AttendanceCalendar";
import { useStaffStore } from "../../../../zustand/staffStore";
import { useAuthStore } from "../../../../zustand/authStore";
import UploadExcelBox from "../../../../ultilitis/UploadExcelBox";
import UpdateSalaryButton from "./UpdateSalary";
import WhoIsOnline from "../../../../StaffPage/utilities/WhoIsOnline";
import WhoIsOnlineSocket from "../../../../StaffPage/utilities/WhoIsOnlineSocket";
// Removed direct API imports - now using store functions
import { StaffRedistributeButton } from "./RedistributeOrder";
import ManagerNewOrderStats from "./ManageNewOrder";
import Invitation from "../../../SettingPage/Invitation";
export interface CalendarDataType {
  staffID: string;
  attendance: IAttendance[];
  dailyRecords: IDailyRecord[];
}
export default function StaffSalary() {
  const { staffList, fetchStaffList, uploadSalary, uploadAttendance, uploadDailyRecord, updateSalary, dailyRecordCompany, attendanceCompany } = useStaffStore();
  const { company_id } = useAuthStore();
  
  useEffect(() => {
    console.log('com', company_id);
    if(company_id){
      console.log('run');
      fetchStaffList(company_id);
    }
  }, [fetchStaffList, company_id]);
  
  let staffSalaryData: IStaff[] = staffList ? [...staffList] : [];
  const [expandedStaff, setExpandedStaff] = useState<string | null>(null);
  const [filterMode, setFilterMode] = useState<"all" | "month">("all");
  const [selectedMonth, setSelectedMonth] = useState(new Date().getMonth() + 1);
  const [selectedYear, setSelectedYear] = useState(new Date().getFullYear());

  // --- add state for filter ---
  const [summaryMode, setSummaryMode] = useState<"all" | "month">("all");
  const [summaryMonth, setSummaryMonth] = useState(new Date().getMonth() + 1);
  const [summaryYear, setSummaryYear] = useState(new Date().getFullYear());

  // --- add state for sorting ---
  const [sortField, setSortField] = useState<"closingRate" | "diligence" | null>(null);
  const [sortOrder, setSortOrder] = useState<"asc" | "desc">("asc");

  // --- add new staff ---
  const [isOpenAddForm, setIsOpenAddForm] = useState<boolean>(false);
  const [isOpenEditForm, setIsOpenEditForm] = useState<boolean>(false);
  const [currentStaff, setCurrentStaff] = useState<IStaff | undefined>();
  const [isOpenEditSalary, setIsOpenEditSalary] = useState(false);
  const [selectedSalary, setSelectedSalary] = useState<SalarySummary | undefined>(undefined);

  // --- upload excel
  const [isUploadAttendence, setIsUploadAttendence] = useState(false);
  const [isUploadSalary, setIsUploadSalary] = useState(false);
  const [isUploadDailyRecord, setIsUploadDailyRecord] = useState(false);
  const [isUpdateSalary, setIsUpdateSalary] = useState(false);

  // Calculate aggregates per staff
  const calculateStaffSummary = (staff: IStaff) => {
    let totalCloseOrder = 0;
    let totalDistributionOrder = 0;
    let totalRevenue = 0;
    let totalBonus = 0;
    let totalFine = 0;

    staff.salaryHistory.forEach((h) => {
      totalCloseOrder += h.totalCloseOrder;
      totalDistributionOrder += h.totalDistributionOrder;
      totalRevenue += h.totalRevenue;
      totalBonus += h.totalBonus || 0;
      totalFine += h.totalFine || 0;
    });

    const totalSalary = staff.salaryHistory.reduce((acc, h) => acc + h.baseSalary + (h.totalBonus || 0) - (h.totalFine || 0), 0);

    return {
      totalCloseOrder,
      totalDistributionOrder,
      totalRevenue,
      totalBonus,
      totalFine,
      totalSalary,
      rate: totalDistributionOrder > 0 ? ((totalCloseOrder / totalDistributionOrder) * 100).toFixed(2) + "%" : "0%",
    };
  };

  const getFilteredHistory = (staff: IStaff) => {
    if (filterMode === "all") return staff.salaryHistory;
    return staff.salaryHistory.filter((h) => {
      const [y, m] = h.month.split("-").map(Number);
      return y === selectedYear && m === selectedMonth;
    });
  };

  const calcSeniority = (joinedDate: string) => {
    const start = new Date(joinedDate);
    const now = new Date();
    const diff = Math.floor((now.getTime() - start.getTime()) / (1000 * 60 * 60 * 24 * 30));
    return `${diff} months`;
  };

  // --- function to calculate totals ---
  function calculateSummary() {
    let filtered: typeof staffSalaryData = [];

    if (summaryMode === "all") {
      filtered = staffSalaryData;
    } else {
      filtered = staffSalaryData.map((s) => ({
        ...s,
        salaryHistory: s.salaryHistory.filter((h) => {
          const [y, m] = h.month.split("-").map(Number);
          return y === summaryYear && m === summaryMonth;
        }),
      }));
    }

    let totalSalary = 0;
    let totalBonus = 0;

    filtered.forEach((staff) => {
      staff.salaryHistory.forEach((h) => {
        totalSalary += h.baseSalary + (h.totalBonus || 0) - (h.totalFine || 0);
        totalBonus += h.totalBonus || 0;
      });
    });

    return { totalSalary, totalBonus };
  }

  const { totalSalary, totalBonus } = calculateSummary();

  // --- helper to calculate stats ---
  function getSaleStaffData() {
    let saleStaff = staffSalaryData.filter((s) => s.role === "Sale-Staff");

    // map data with calculated performance
    let mapped = saleStaff.map((s) => {
      const totalClose = s.salaryHistory.reduce((acc, h) => acc + h.totalCloseOrder, 0);
      const totalDist = s.salaryHistory.reduce((acc, h) => acc + h.totalDistributionOrder, 0);
      const closingRate = totalDist > 0 ? totalClose / totalDist : 0;

      // Note: Attendance needs to be fetched separately from backend
      // For now, using diligenceCount as fallback
      const diligence = s.diligenceCount || 0;
      const countAttendanceData = { onTime: diligence, late: 0, absent: 0 };

      return {
        ...s,
        totalClose,
        totalDist,
        closingRate,
        diligence,
        workLate: countAttendanceData.late,
        workAbsent: countAttendanceData.absent,
      };
    });

    // apply sorting
    if (sortField) {
      mapped.sort((a, b) => {
        if (sortField === "closingRate") {
          return sortOrder === "asc" ? a.closingRate - b.closingRate : b.closingRate - a.closingRate;
        } else if (sortField === "diligence") {
          return sortOrder === "asc" ? a.diligence - b.diligence : b.diligence - a.diligence;
        }
        return 0;
      });
    }

    return mapped;
  }

  const saleStaffData = getSaleStaffData();

  const handleUploadSalary = async (file: File) => {
    if (!company_id) {
      alert("Error: Company ID is missing");
      return;
    }
    const result = await uploadSalary(company_id, file);
    if (result?.status === "success") {
      alert(result.message || "Salary history updated!");
    } else {
      alert(result?.message || "Failed to upload salary");
    }
  };

  const handleUploadAttendance = async (file: File) => {
    if (!company_id) {
      alert("Error: Company ID is missing");
      return;
    }
    const result = await uploadAttendance(company_id, file);
    if (result?.status === "success") {
      alert(result.message || "Attendance updated!");
    } else {
      alert(result?.message || "Failed to upload attendance");
    }
  };

  const handleUploadDailyRecord = async (file: File) => {
    if (!company_id) {
      alert("Error: Company ID is missing");
      return;
    }
    const result = await uploadDailyRecord(company_id, file);
    if (result?.status === "success") {
      alert(result.message || "Daily record updated!");
    } else {
      alert(result?.message || "Failed to upload daily record");
    }
  };

  // Note: Attendance and daily records are stored in separate collections
  // They need to be fetched separately. For now, we'll use empty arrays
  // The actual implementation should fetch these from the backend
  let CalendarDatas: CalendarDataType[] = [];
  const aggreegateData = () => {
    console.log('staffSalaryData', staffSalaryData);
    CalendarDatas = staffSalaryData.map((staffData: IStaff) => {
      const staffID = staffData.staffID;
      // Attendance and dailyRecords should be fetched from backend separately
      // For now, using empty arrays as placeholder
      const getAttendance = attendanceCompany.find((data)=> data.staffID === staffID);
      const getDailyRecord = dailyRecordCompany.find((data) => data.staffID === staffID);
      console.log('fsdfsf', getAttendance?.attendance);
      let attendance: IAttendance[] = getAttendance?.attendance || [];
      let dailyRecord: IDailyRecord[] = getDailyRecord?.dailyRecord || [];
      
      const obj: CalendarDataType = {
        staffID,
        attendance: attendance,
        dailyRecords: dailyRecord,
      };
      return obj;
    });
  };
  aggreegateData();
  return (
    <div className={cx("staff-salary-main")}>
      <div className={cx("summary-cards")}>
        <div className={cx("wrap-card")}>
          <div className={cx("summary-card")}>
            <span className={cx("label")}>Total Salary</span>
            <span className={cx("value")}>{totalSalary.toLocaleString()} VND</span>
          </div>
          <div className={cx("summary-card")}>
            <span className={cx("label")}>Total Bonus</span>
            <span className={cx("value")}>{totalBonus.toLocaleString()} VND</span>
          </div>
        </div>

        <div className={cx("filter-box")}>
          <button onClick={() => setSummaryMode("all")}>All Time</button>
          <button onClick={() => setSummaryMode("month")}>By Month</button>

          {summaryMode === "month" && (
            <>
              <select value={summaryMonth} onChange={(e) => setSummaryMonth(Number(e.target.value))}>
                {Array.from({ length: 12 }, (_, i) => i + 1).map((m) => (
                  <option key={m} value={m}>
                    {new Date(0, m - 1).toLocaleString("default", { month: "long" })}
                  </option>
                ))}
              </select>
              <select value={summaryYear} onChange={(e) => setSummaryYear(Number(e.target.value))}>
                {Array.from({ length: 6 }, (_, i) => summaryYear - 3 + i).map((y) => (
                  <option key={y} value={y}>
                    {y}
                  </option>
                ))}
              </select>
            </>
          )}
        </div>
      </div>

      {/* //--Table list staff */}
      <h4>👥 Staff Salary Management</h4>
      <div className={cx("group-btn")}>
        <button onClick={() => setIsUpdateSalary(true)}>Update Salary</button>
        <button onClick={() => setIsUploadAttendence(true)}>Upload Attendence</button>
        <button onClick={() => setIsUploadSalary(true)}>Upload Salary</button>
        <button onClick={() => setIsUploadDailyRecord(true)}>Upload Daily Record</button>
      </div>
      {isUploadAttendence && <UploadExcelBox onUpload={handleUploadAttendance} onClose={() => setIsUploadAttendence(false)} />}
      {isUploadSalary && <UploadExcelBox onUpload={handleUploadSalary} onClose={() => setIsUploadSalary(false)} />}
      {isUploadDailyRecord && <UploadExcelBox onUpload={handleUploadDailyRecord} onClose={() => setIsUploadDailyRecord(false)} />}
      {isUpdateSalary && <UpdateSalaryButton setIsUpdateSalary={setIsUpdateSalary} />}

      <div className={cx("staff-list-info")}>
        <div className={cx("table")}>
          <div className={cx("row", "header")}>
            <div>Role</div>
            {/* <div>Status</div> */}
            <div>Name</div>
            <div>Seniority</div>
            <div>T.Close-Order</div>
            <div>T.Distributed-Order</div>
            <div>Closing Rate</div>
            <div>Total Revenue</div>
            <div>Total Bonus</div>
            <div>Total Fine</div>
            <div>Total Salary</div>
            {/* <div>Edit</div> */}
          </div>

          {staffSalaryData.map((staff, k) => {
            const summary = calculateStaffSummary(staff);
            const data = CalendarDatas.find((data) => data.staffID === staff.staffID);
            const attendance = data?.attendance || [];
            const dailyRecords = data?.dailyRecords || [];
            return (
              <React.Fragment key={k}>
                <div className={cx("row")} onClick={() => setExpandedStaff(expandedStaff === staff.staffID ? null : staff.staffID)}>
                  <div className={cx("role", `${staff.role.toLocaleLowerCase()}`)}>{staff.role}</div>
                  {/* <div>{staff.isOnline ? "🟢 Online" : "⚪ Offline"} </div> */}
                  <div className={cx("name")}>{staff.staffInfo.name}</div>
                  <div>{calcSeniority(staff.joinedDate)}</div>
                  <div>{summary.totalCloseOrder}</div>
                  <div>{summary.totalDistributionOrder}</div>
                  <div>{summary.rate}</div>
                  <div>{summary.totalRevenue.toLocaleString()} ₫</div>
                  <div>{summary.totalBonus.toLocaleString()} ₫</div>
                  <div>{summary.totalFine.toLocaleString()} ₫</div>
                  <div>{summary.totalSalary.toLocaleString()} ₫</div>
                  {/* <div className={cx("edit-btn")}>
                    <MdModeEdit size={22} />
                  </div> */}
                </div>

                {expandedStaff === staff.staffID && (
                  <div className={cx("expand-box")}>
                    {/* Box 1: Staff Info */}
                    <div className={cx("staff-info-box")}>
                      <div
                        className={cx("edit-btn")}
                        onClick={() => {
                          setIsOpenEditForm(true);
                          setCurrentStaff(staff);
                        }}
                        style={{ cursor: "pointer" }}
                      >
                        <MdModeEdit size={22} /> &nbsp;Edit
                      </div>
                      <h5>📌 Staff Info</h5>
                      <p>
                        <b>Name:</b> {staff.staffInfo.name}
                      </p>
                      <p>
                        <b>Staff ID:</b> {staff.staffID || "None"}
                      </p>
                      <p>
                        <b>Birthday:</b> {staff.staffInfo.birthday}
                      </p>
                      <p>
                        <b>Address:</b> {staff.staffInfo.address}
                      </p>
                      <p>
                        <b>Phone:</b> {staff.staffInfo.phone}
                      </p>
                      <p>
                        <b>Status:</b> {staff.staffInfo.relationshipStatus}
                      </p>
                      <p>
                        <b>Joined Date:</b> {staff.joinedDate}
                      </p>
                      <p>
                        <b>Religion:</b> {staff.staffInfo.religion}
                      </p>
                      <p>
                        <b>Bank:</b> {staff.bankInfos.bankOwnerName} - {staff.bankInfos.bankAccountNumber}
                      </p>
                    </div>

                    {isOpenEditForm && currentStaff && <EditStaff staffData={currentStaff} setIsOpenEditForm={setIsOpenEditForm} />}

                    {/* //-- Calender box */}
                    <div className={cx("staff-attendance")}>
                      <AttendanceCalendar attendance={attendance} dailyRecords={dailyRecords} />
                    </div>

                    {/* //-- Box 2: Salary History */}
                    <div className={cx("salary-history-box")}>
                      <h5>💰 Salary History</h5>
                      <div className={cx("filter-mode")}>
                        <button onClick={() => setFilterMode("all")}>All Time</button>
                        <div>
                          <select value={selectedMonth} onChange={(e) => setSelectedMonth(Number(e.target.value))}>
                            {Array.from({ length: 12 }, (_, i) => i + 1).map((m) => (
                              <option key={m} value={m}>
                                {new Date(0, m - 1).toLocaleString("default", { month: "long" })}
                              </option>
                            ))}
                          </select>
                          <select value={selectedYear} onChange={(e) => setSelectedYear(Number(e.target.value))}>
                            {Array.from({ length: 6 }, (_, i) => selectedYear - 3 + i).map((y) => (
                              <option key={y} value={y}>
                                {y}
                              </option>
                            ))}
                          </select>
                          <button onClick={() => setFilterMode("month")}>Apply</button>
                        </div>
                      </div>
                      <div className={cx("history-list")}>
                        <div className={cx("history-row", "header")}>
                          <div>Time</div>
                          <div>Base Salary</div>
                          <div>Close Orders</div>
                          <div>Distribution Orders</div>
                          <div>Revenue</div>
                          <div>Bonus</div>
                          <div>Fine</div>
                          {/* <div>Edit</div> */}
                        </div>
                        {getFilteredHistory(staff).map((h: SalarySummary, idx) => (
                          <div key={idx} className={cx("history-row")}>
                            <div>{h.month}</div>
                            <div>{h.baseSalary.toLocaleString()} ₫</div>
                            <div>{h.totalCloseOrder}</div>
                            <div>{h.totalDistributionOrder}</div>
                            <div>{h.totalRevenue.toLocaleString()} ₫</div>
                            <div>{h.totalBonus ? h.totalBonus.toLocaleString() + " ₫" : "-"}</div>
                            <div>{h.totalFine ? h.totalFine.toLocaleString() + " ₫" : "-"}</div>
                            {/* <div>
                              <MdModeEdit
                                size={20}
                                onClick={() => {
                                  setSelectedSalary(h);
                                  setIsOpenEditSalary(true);
                                }}
                              />
                            </div> */}
                          </div>
                        ))}
                        {isOpenEditSalary && selectedSalary && (
                          <EditSalaryHistory staffId={staff._id} salary={selectedSalary as any} setIsOpenEditSalary={setIsOpenEditSalary} />
                        )}
                      </div>
                    </div>
                  </div>
                )}
              </React.Fragment>
            );
          })}
        </div>
      </div>


      {/* //--Table list invitation that give to other user but does not response yet */}

      {/* //--Table manage today staff working or staff absent */}
      <ManagerNewOrderStats />

      {/* //--Table manage currently staff online */}
      <div style={{ display: "flex", gap: 20 }}>
        <WhoIsOnlineSocket />
        <WhoIsOnline />
      </div>

      {/* //--Table maange staff performance */}
      <div className={cx("sale-staff-table")}>
        <h4>Sale Staff Performance</h4>

        <div className={cx("sort-controls")}>
          <label>Sort by:</label>
          <button
            onClick={() => {
              setSortField("closingRate");
              setSortOrder(sortOrder === "asc" ? "desc" : "asc");
            }}
          >
            Order Closing Rate ({sortOrder})
          </button>
          <button
            onClick={() => {
              setSortField("diligence");
              setSortOrder(sortOrder === "asc" ? "desc" : "asc");
            }}
          >
            Diligence ({sortOrder})
          </button>
        </div>

        <div className={cx("table")}>
          <div className={cx("row", "header")}>
            <div className={cx("col")}>Name</div>
            {/* <div className={cx("col")}>ID</div> */}
            <div className={cx("col")}>Total Close Order</div>
            <div className={cx("col")}>Total Distribution</div>
            <div className={cx("col")}>Closing Rate</div>
            <div className={cx("col")}>Diligence</div>
            <div className={cx("col")}>Late</div>
            <div className={cx("col")}>Absent</div>
          </div>

          {saleStaffData.map((s, i) => (
            <div key={i} className={cx("row")}>
              <div className={cx("col")}>{s.staffInfo.name}</div>
              {/* <div className={cx("col")}>{s.id}</div> */}
              <div className={cx("col")}>{s.totalClose}</div>
              <div className={cx("col")}>{s.totalDist}</div>
              <div className={cx("col")}>{(s.closingRate * 100).toFixed(1)}%</div>
              <div className={cx("col")}>{s.diligence} /26</div>
              <div className={cx("col")}>{s.workLate}</div>
              <div className={cx("col")}>{s.workAbsent}</div>
            </div>
          ))}
        </div>
      </div>
      {/* Define the required variables for SaleStaffCharts */}
      {/* <SaleStaffCharts staffList={staffSalaryData} /> */}
    </div>
  );
}

export function StaffSalaryCards() {
  const { staffList } = useStaffStore();
  let staffSalaryData: IStaff[] = staffList ? [...staffList] : [];

  const totals = staffSalaryData.reduce(
    (acc, item) => {
      // Sum all baseSalary + bonus - fine for salary, and all bonus for bonus
      const staffSalary = item.salaryHistory.reduce((sum: number, h) => sum + h.baseSalary + (h.totalBonus || 0) - (h.totalFine || 0), 0);
      const staffBonus = item.salaryHistory.reduce((sum: number, h) => sum + (h.totalBonus || 0), 0);
      acc.salary += staffSalary;
      acc.bonus += staffBonus;
      return acc;
    },
    { salary: 0, bonus: 0 }
  );

  return (
    <div className={cx("cards-grid")}>
      <div className={cx("card")}>
        <div>Total Salary</div>
        <div className={cx("value")}>{totals.salary.toLocaleString("vi-VN")} ₫</div>
      </div>
      <div className={cx("card")}>
        <div>Total Bonus</div>
        <div className={cx("value")}>{totals.bonus.toLocaleString("vi-VN")} ₫</div>
      </div>
    </div>
  );
}

function countAttendance(attendance: IAttendance[]) {
  const now = new Date();
  const currentMonth = now.toISOString().slice(0, 7); // "YYYY-MM"

  // Filter only current month
  const filtered = attendance.filter((item) => item.date.startsWith(currentMonth));

  // Count each status
  return filtered.reduce(
    (acc, item) => {
      const status = item.status;
      if (status === "onTime") acc.onTime += 1;
      else if (status === "late") acc.late += 1;
      else if (status === "absent") acc.absent += 1;
      return acc;
    },
    { onTime: 0, late: 0, absent: 0 }
  );
}
