import React, { useEffect, useState } from "react";
import classNames from "classnames/bind";
import styles from "./StaffPage.module.scss";
const cx = classNames.bind(styles);


// Configs and contants
import { deligenceBonus } from "@/config/DefaultData";
import { fullVietNamBanks } from "@/assets/fullVietNamBanks";

// Libraries
import { VietQR } from "vietqr";

// Components
import StaffUpdateInfoForm from "@/pages/StaffPage/StaffUpdateInfoForm";
import AttendanceCalendar from "@/pages/BodyComponent/Financial/Staff/AttendanceCalendar";
import StaffHeartbeat from "./utilities/StaffHeartBeat";

// Types
import type { IStaff, StaffRole, IAttendance } from "@/zustand/staffStore";
import type { UserInfoType } from "@/zustand/authStore";
import type { ListBankType } from "@/assets/fullVietNamBanks";

// Hooks
import { useStaffStore } from "@/zustand/staffStore";
import { useAuthStore } from "@/zustand/authStore";
import { useBranchStore } from "@/zustand/branchStore";

export interface FormGetUserInfo {
  name: string;
  birthday: string;
  address: string;
  phone: string;
  relationshipStatus: string;
  religion: string;
  role: StaffRole;
  salary: number;
  joinedDate: string;
  diligenceCount: number;
  bankAccountNumber: string;
  bankOwnerName: string;
  description: string;
  accountLogin: string;
  identityId: string;
}

export default function StaffPage() {
  // fake initial user data (can be fetched from server later)

  // const { yourStaffProfile, fetchYourStaffProfile } = useStaffStore();
  const { company_id, accessRole, yourStaffId } = useAuthStore();
  const { yourStaffProfileInWorkplace, attendance, dailyRecords, fetchYourStaffProfileInWorkplace } = useStaffStore();
  const { selectedBranch } = useBranchStore();

  const initialForm: IStaff = {
    _id: "",
    company_id: company_id || "",
    staff_email: yourStaffProfileInWorkplace?.staff_email || "",
    staffID: yourStaffProfileInWorkplace?.staffID || "",

    role: (yourStaffProfileInWorkplace?.role as StaffRole) || "Sale-Staff",
    salary: yourStaffProfileInWorkplace?.salary || 0,
    joinedDate: new Date().toISOString().split("T")[0],

    list_branch_management: [],

    staffInfo: {
      staffID: yourStaffProfileInWorkplace?.staffID || "",
      name: "Default",
      birthday: "",
      address: "",
      phone: "",
      relationshipStatus: "single",
      religion: "No Religion",
      description: "",
      identityId: "",
      accountLogin: "",
    },

    diligenceCount: 0,
    isOnline: false,
    lastSeen: "",
    claimedAt: "",
    isMorningBatch: false,

    bankInfos: {
      bankAccountNumber: "",
      bankOwnerName: "",
      bankName: "",
      bankShortName: "",
      bankCode: "",
    },
    salaryHistory: [],
  };

  const [fullUserData, setFullUserData] = useState<IStaff>(yourStaffProfileInWorkplace || initialForm);
  const [userData, setUserData] = useState<UserInfoType>(fullUserData.staffInfo);

  const [filterMode, setFilterMode] = useState<"all" | "month">("all");
  const [selectedMonth, setSelectedMonth] = useState(new Date().getMonth() + 1);
  const [selectedYear, setSelectedYear] = useState(new Date().getFullYear());
  const [expandedStaff, setExpandedStaff] = useState<string | null>(null);
  const [listBanks, setListBanks] = useState<ListBankType>(fullVietNamBanks);

  useEffect(() => {
    if (yourStaffProfileInWorkplace) {
      setUserData(yourStaffProfileInWorkplace.staffInfo);
      setFullUserData(yourStaffProfileInWorkplace);
    }
  }, [yourStaffProfileInWorkplace]);
  useEffect(() => {
    if(yourStaffId && selectedBranch && accessRole !== "Director"){
      fetchYourStaffProfileInWorkplace(yourStaffId, selectedBranch.company_id)
    }
  },[yourStaffId, selectedBranch, accessRole])

  const [isOpenForm, setIsOpenForm] = useState(false);

  // --- add state for sorting ---
  const [sortField] = useState<"closingRate" | "diligence" | null>(null);
  const [sortOrder] = useState<"asc" | "desc">("asc");

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

  // Calculate aggregates per staff
  const calculateStaffSummary = (staff: IStaff) => {
    let totalCloseOrder = 0;
    let totalDistributionOrder = 0;
    let totalRevenue = 0;
    let totalBonus = 0;
    let totalFine = 0;
    let totalOvertimeHours = 0;

    staff.salaryHistory.forEach((h) => {
      totalCloseOrder += h.totalCloseOrder;
      totalDistributionOrder += h.totalDistributionOrder;
      totalRevenue += h.totalRevenue;
      totalOvertimeHours += h.overtimeHours;
      totalBonus += h.totalBonus;
      totalFine += h.totalFine;
    });

    const totalSalary = staff.salaryHistory.reduce((acc, h) => acc + h.baseSalary + h.totalBonus - h.totalFine, 0);
    return {
      totalCloseOrder,
      totalDistributionOrder,
      totalRevenue,
      totalBonus,
      totalFine,
      totalOvertimeHours,
      totalSalary,
      rate: totalDistributionOrder > 0 ? ((totalCloseOrder / totalDistributionOrder) * 100).toFixed(2) + "%" : "0%",
    };
  };

  // --- helper to calculate stats ---
  function getSaleStaffData() {
    if (!yourStaffProfileInWorkplace)
      return [] as Array<IStaff & { totalClose: number; totalDist: number; closingRate: number; diligence: number; workLate: number; workAbsent: number }>;
    const s = yourStaffProfileInWorkplace;
    if (s.role !== "Sale-Staff")
      return [] as Array<IStaff & { totalClose: number; totalDist: number; closingRate: number; diligence: number; workLate: number; workAbsent: number }>;

    const totalClose = s.salaryHistory.reduce((acc, h) => acc + h.totalCloseOrder, 0);
    const totalDist = s.salaryHistory.reduce((acc, h) => acc + h.totalDistributionOrder, 0);
    const closingRate = totalDist > 0 ? totalClose / totalDist : 0;

    const countAttendanceData = countAttendance(attendance);
    const diligence = countAttendanceData.onTime;

    const mapped = [
      {
        ...s,
        totalClose,
        totalDist,
        closingRate,
        diligence,
        workLate: countAttendanceData.late,
        workAbsent: countAttendanceData.absent,
      },
    ];

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

  const today = new Date();
  const currentMonthNumber = today.getMonth(); // Returns a number from 0 to 11
  const currentYearNumber = today.getFullYear();

  const timeFormat = `${currentYearNumber}-${String(currentMonthNumber + 1).padStart(2, "0")}`;
  // console.log('timeFormat', timeFormat);
  const currentMonthData = fullUserData.salaryHistory.find((data) => data.month === timeFormat);

  const bonus = currentMonthData ? currentMonthData.totalBonus : 0;
  const fine = currentMonthData ? currentMonthData.totalFine : 0;
  const overtimeHours = currentMonthData ? currentMonthData.overtimeHours : 0;
  const baseSalary = currentMonthData ? currentMonthData.baseSalary : 0;
  const diligenceReward = (saleStaffData[0]?.diligence || 0) > 24 ? deligenceBonus : 0;
  const estPaidSalary = baseSalary + bonus - fine + diligenceReward;

  // VietQR
  useEffect(() => {
    if (isOpenForm && listBanks.data.length === 999) {
      let vietQR = new VietQR({
        clientID: "e88851c9-5f75-4291-a2c5-bf63f30eff7e",
        apiKey: "de4eb053-6469-450f-9940-5c84ff1b8c62",
      });

      // list banks are supported create QR code by Vietqr
      vietQR
        .getBanks()
        .then((banks: ListBankType) => {
          console.log(banks);
          setListBanks(banks);
        })
        .catch(() => {
          console.log("vietqr get bank info error");
        });
    }
  }, [isOpenForm, listBanks]);
  return (
    <div className={cx("user-page-main")}>
      {accessRole === "Director" && <div className={cx('notify-header')}>Bạn là chủ sở hữu, không có hồ sơ nhân viên.</div>}
      {accessRole !== "Director" && (
        <React.Fragment>
          <StaffHeartbeat />
          <div className={cx("header-logout")}>
            <div>
              <h4 style={{ color: "#005fec" }}>Hồ sơ cá nhân</h4>
            </div>
          </div>

          <div className={cx("wrap-info-account")}>
            <div className={cx("profile-card", "card2")}>
              <div className={cx("header")}>
                <div className={cx("title")}>Thông tin cá nhân</div>
                <button className={cx("btn-edit")} onClick={() => setIsOpenForm(true)}>
                  ✏️ Sửa thông tin
                </button>
              </div>
              <div className={cx("row")}>
                <div className={cx("part")}>
                  <strong>Họ tên:</strong> <span>{userData.name}</span>
                </div>
                <div className={cx("part")}>
                  <strong>SĐT:</strong> {userData.phone}
                </div>
              </div>

              <div className={cx("row")}>
                <div>
                  <strong>CCCD:</strong> {userData.identityId}
                </div>
                <div>
                  <strong>Lương cơ bản:</strong> {fullUserData?.salary?.toLocaleString("vi-VN")} đ
                </div>
              </div>

              <div className={cx("row")}>
                <div className={cx("part")}>
                  <strong>Ngày sinh:</strong> <span>{userData.birthday}</span>
                </div>
                <div>
                  <strong>Ngày vào làm:</strong> {fullUserData.joinedDate}
                </div>
              </div>
              <div className={cx("row")}>
                <div>
                  <strong>Địa chỉ:</strong> {userData.address}
                </div>
                <div className={cx("description")}>
                  <strong>Mô tả:</strong> {userData.description}
                </div>
              </div>
              <div className={cx("row")}>
                <div>
                  <strong>TK ngân hàng:</strong> {fullUserData.bankInfos.bankAccountNumber} - {fullUserData.bankInfos.bankOwnerName}
                </div>
                <div>
                  <strong>Ngân hàng:</strong> {fullUserData.bankInfos.bankCode} - {fullUserData.bankInfos.bankShortName}
                </div>
              </div>
            </div>
            <div className={cx("performance-card")}>
              <div className={cx("header")}>
                <div className={cx("title")}>Hiệu suất tháng {currentMonthNumber + 1}</div>
              </div>
              <div className={cx("row")}>
                <div>
                  <strong>Đơn chốt:</strong> {saleStaffData[0]?.totalClose || 0}
                </div>
                <div>
                  <strong>Đơn nhận:</strong> {saleStaffData[0]?.totalDist || 0}
                </div>
                <div>
                  <strong>Tỷ lệ chốt:</strong> {(saleStaffData[0]?.closingRate * 100).toFixed(1) || 0}%
                </div>
              </div>

              <div className={cx("row")}>
                <div>
                  <strong>Đi muộn:</strong> {saleStaffData[0]?.workLate || 0}
                </div>
                <div>
                  <strong>Vắng:</strong> {saleStaffData[0]?.workAbsent || 0}
                </div>
                <div>
                  <strong>Đúng giờ:</strong> {saleStaffData[0]?.diligence || 0}/26
                </div>
              </div>

              <div className={cx("row")}>
                <div>
                  <strong>Chuyên cần:</strong> {saleStaffData && saleStaffData[0]?.diligence > 24 ? deligenceBonus.toLocaleString("vi-VN") : 0} ₫
                </div>
                <div>
                  <strong>Thưởng:</strong> {(bonus || 0).toLocaleString("vi-VN")} đ
                </div>
                <div>
                  <strong>Giảm trừ:</strong> {(fine || 0).toLocaleString("vi-VN")} đ
                </div>
              </div>
              <div className={cx("row")}>
                <div>
                  <strong>Tăng ca:</strong> {overtimeHours || 0} giờ
                </div>
                <div>
                  <strong>Tạm tính:</strong> -
                </div>
                <div>
                  <strong></strong> --
                </div>
              </div>
              <div className={cx("horizontal-line")}></div>
              <div>
                <strong>Lương tạm tính:</strong> {(Math.round(estPaidSalary / 1000) * 1000).toLocaleString("vi-VN")} đ
              </div>
            </div>
          </div>

          <div className={cx("staff-list-info")}>
            <div className={cx("table")}>
              <div className={cx("row", "header")}>
                <div>Vai trò</div>
                <div>Tên</div>
                {/* <div>ID</div> */}
                <div>Thâm niên</div>
                <div>Tổng đơn chốt</div>
                <div>Tổng đơn phân phối</div>
                <div>Tỷ lệ chốt</div>
                {/* <div>Total Revenue</div> */}
                <div>Tổng thưởng</div>
                <div>Tổng giảm trừ</div>
                <div>Tổng tăng ca</div>
                <div>Tổng lương nhận</div>
                {/* <div>Edit</div> */}
              </div>

              {yourStaffProfileInWorkplace &&
                [yourStaffProfileInWorkplace].map((staff, k) => {
                  const summary = calculateStaffSummary(staff);
                  return (
                    <React.Fragment key={k}>
                      <div className={cx("row")} onClick={() => setExpandedStaff(expandedStaff === staff.staffID ? null : staff.staffID)}>
                        <div className={cx("role", `${staff.role.toLocaleLowerCase()}`)}>{staff.role}</div>
                        <div className={cx("name")}>{staff.staffInfo.name}</div>
                        {/* <div>{staff.id}</div> */}
                        <div>{calcSeniority(staff.joinedDate)}</div>
                        <div>{summary.totalCloseOrder}</div>
                        <div>{summary.totalDistributionOrder}</div>
                        <div>{summary.rate}</div>
                        {/* <div>{summary.totalRevenue.toLocaleString()} ₫</div> */}
                        <div>{summary.totalBonus.toLocaleString()} ₫</div>
                        <div>{summary.totalFine.toLocaleString()} ₫</div>
                        <div>{summary.totalOvertimeHours} giờ</div>
                        <div>{summary.totalSalary.toLocaleString()} ₫</div>
                        {/* <div className={cx("edit-btn")}>
                      <MdModeEdit size={22} />
                    </div> */}
                      </div>

                      {
                        <div className={cx("expand-box")}>
                          {/* //-- Calender box */}
                          <div className={cx("staff-attendance")}>
                            <AttendanceCalendar attendance={attendance} dailyRecords={dailyRecords} />
                          </div>

                          {/* //-- Box 2: Salary History */}
                          <div className={cx("salary-history-box")}>
                            <h5>💰 Nhật kí lương</h5>
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
                                <div>Thời gian</div>

                                <div>Đơn chốt</div>
                                <div>Đơn phân phối</div>
                                <div>Tỷ lệ chốt</div>
                                {/* <div>Revenue</div> */}
                                <div>Thưởng</div>
                                <div>Giảm trừ</div>
                                <div>Lương CB</div>
                                <div>Tăng ca</div>
                                <div>Lương lĩnh</div>
                                {/* <div>Edit</div> */}
                              </div>
                              {getFilteredHistory(staff)
                                .slice()
                                .reverse()
                                .map((h, idx) => {
                                  const bonusVal = h.totalBonus || 0;
                                  const fineVal = h.totalFine || 0;
                                  const paidSalary = h.baseSalary + bonusVal - fineVal;
                                  const closeOrderRate = (h.totalCloseOrder / h.totalDistributionOrder) * 100 || 0;
                                  return (
                                    <div key={idx} className={cx("history-row")}>
                                      <div>{h.month}</div>

                                      <div>{h.totalCloseOrder}</div>
                                      <div>{h.totalDistributionOrder}</div>
                                      {/* <div>{h.totalRevenue.toLocaleString()} ₫</div> */}
                                      <div>{closeOrderRate.toFixed(2)}%</div>
                                      <div>{bonusVal ? bonusVal.toLocaleString() + " ₫" : "-"}</div>
                                      <div>{fineVal ? fineVal.toLocaleString() + " ₫" : "-"}</div>
                                      <div>{h.baseSalary.toLocaleString()} ₫</div>
                                      <div>{h.overtimeHours} giờ</div>
                                      <div>{paidSalary.toLocaleString("vi-VN")} ₫</div>
                                    </div>
                                  );
                                })}
                            </div>
                          </div>
                        </div>
                      }
                    </React.Fragment>
                  );
                })}
            </div>
          </div>

          {isOpenForm && (
            <div className={cx("wrap-add-form")}>
              <StaffUpdateInfoForm fullUserData={fullUserData} setFullUserData={setFullUserData} setIsOpenAddForm={setIsOpenForm} listBanks={listBanks} />
            </div>
          )}
        </React.Fragment>
      )}
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
      acc[item.status] = (acc[item.status] || 0) + 1;
      return acc;
    },
    { onTime: 0, late: 0, absent: 0 }
  );
}
