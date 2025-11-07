// src/components/AllOrders.tsx
import React, { useEffect, useState, useMemo } from "react";
import classNames from "classnames/bind";
import styles from "./AllOrders.module.scss"; // reuse styles
const cx = classNames.bind(styles);

import { useShopOrderStore, type FinalOrder, type OrderDataFromServerType } from "../zustand/shopOrderStore";
import UpdateDataOrderForStaff from "./UpdateDataOrderForStaff";
// same status arrays as ShopOrders2.tsx
const STATUS_OPTIONS = [
  "Chưa gọi điện",
  "Không gọi được lần 1",
  "Không gọi được lần 2",
  "Không gọi được lần 3",
  "Khách không mua",
  "Sale hủy",
  "Sai số",
  "Chốt",
];

const DeliveryOptions = [
  "Chưa gửi hàng",
  "Đang đóng hàng",
  "Đã gửi hàng",
  "Đang giao hàng",
  "Giao thành công",
  "Giao thất bại",
  "Khách chưa chốt",
  "Đang hết hàng",
];

export type SortOrder = "latest" | "oldest";
// Utility to format date (YYYY-MM-DD)
const formatDate = (dateStr: string) => new Date(dateStr).toISOString().slice(0, 10);
export default function AllOrders() {
  const { orders: rawOrders } = useShopOrderStore();

  // convert OrderDataFromServerType[] → FinalOrder[]
  const finalOrders: FinalOrder[] = useMemo(() => rawOrders.map((o) => o.final), [rawOrders]);

  // filters
  const [sortBy, setSortBy] = useState<SortOrder>("latest");
  const [selectedStatuses, setSelectedStatuses] = useState<string[]>(["All"]);
  const [deliveryStatuses, setDeliveryStatuses] = useState<string>("All");
  const [searchText, setSearchText] = useState("");
  const [openUpdateDataForStaff, setOpenUpdateDataForStaff] = useState(false);

  const [filterOrderPrefix, setFilterOrderPrefix] = useState("All");
  const [filterDelivery, setFilterDelivery] = useState("All");
  const [filterStaff, setFilterStaff] = useState("All");
  const [filterDay, setFilterDay] = useState("All");
  const [filterMonth, setFilterMonth] = useState("All");
  const [filterYear, setFilterYear] = useState("All");
  const [selectedDay, setSelectedDay] = useState<string>(formatDate(new Date().toISOString()));
  const [selectedMonth, setSelectedMonth] = useState<number>(new Date().getMonth() + 1);
  const [selectedYear, setSelectedYear] = useState<number>(new Date().getFullYear());

  const [currentPage, setCurrentPage] = useState(1);
  const pageSize = 12;

  const uniqueDays = [...new Set(finalOrders.map((o) => o.time.split(" ")[0]))]; // YYYY-MM-DD
  const uniqueMonths = [...new Set(finalOrders.map((o) => o.time.substring(0, 7)))]; // YYYY-MM
  const uniqueYears = [...new Set(finalOrders.map((o) => o.time.substring(0, 4)))]; // YYYY

  const [openUpdateDeliveryBox, setOpenUpdateDeliveryBox] = useState<boolean>(false);
  // Sort
  const sortedOrders = useMemo(() => sortOrders(finalOrders, sortBy), [finalOrders, sortBy]);

  // Filter by status
  const filteredOrders = useMemo(() => {
    if (selectedStatuses.includes("All")) return sortedOrders;
    return sortedOrders.filter((o) => selectedStatuses.some((s) => s.trim().toLowerCase() === o.status.trim().toLowerCase()));
  }, [sortedOrders, selectedStatuses]);

  // Filter by delivery status (only when "Chốt" is selected)
  const filteredConfirmedOrders = useMemo(() => {
    if (deliveryStatuses === "All") return filteredOrders;
    return filteredOrders.filter((o) => o.deliveryStatus === deliveryStatuses);
  }, [filteredOrders, deliveryStatuses]);

  // --- replace existing finalDisplay useMemo with this ---
  const finalDisplay = useMemo(() => {
    let base = finalOrders;

    // 1) Status filter (selectedStatuses) — supports "All" or specific list
    if (!selectedStatuses.includes("All")) {
      base = base.filter((o) => selectedStatuses.some((s) => s.trim().toLowerCase() === o.status.trim().toLowerCase()));
    }

    // 2) Delivery filters:
    // - filterDelivery: the top-level "Vận chuyển" select
    // - deliveryStatuses: the dropdown that appears when Trạng thái === "Chốt"
    if (filterDelivery !== "All") {
      base = base.filter((o) => o.deliveryStatus === filterDelivery);
    }
    if (deliveryStatuses !== "All") {
      base = base.filter((o) => o.deliveryStatus === deliveryStatuses);
    }

    // 3) Order prefix
    if (filterOrderPrefix !== "All") {
      base = base.filter((o) => o.orderCode.startsWith(filterOrderPrefix));
    }

    // 4) Staff
    if (filterStaff !== "All") {
      base = base.filter((o) => o.staff === filterStaff);
    }

    // 5) Date filters (day / month / year). Multiple date filters won't be combined,
    // but you can change logic if you want intersection behaviour.
    if (filterDay !== "All") {
      base = base.filter((o) => o.time.startsWith(filterDay)); // YYYY-MM-DD
    } else {
      if (filterMonth !== "All" && filterYear !== "All") {
      }
      if (filterMonth !== "All") {
        base = base.filter((o) => o.time.startsWith(filterMonth)); // YYYY-MM
      }
      if (filterYear !== "All") {
        base = base.filter((o) => o.time.startsWith(filterYear)); // YYYY
      }
    }

    // 6) Search (applies last, case-insensitive). Search across orderCode, deliveryCode, customerName, phone
    if (searchText && searchText.trim() !== "") {
      const lower = searchText.trim().toLowerCase();
      base = base.filter((o) => {
        return (
          o.orderCode.toLowerCase().includes(lower) ||
          (o.deliveryCode && o.deliveryCode.toLowerCase().includes(lower)) ||
          (o.customerName && o.customerName.toLowerCase().includes(lower)) ||
          (o.phone && o.phone.toLowerCase().includes(lower))
        );
      });
    }

    // finally sort
    return sortOrders(base, sortBy);
  }, [finalOrders, sortBy, selectedStatuses, deliveryStatuses, filterOrderPrefix, filterDelivery, filterStaff, filterDay, filterMonth, filterYear, searchText]);

  // ---- Pagination ----
  const totalPages = Math.max(1, Math.ceil(finalDisplay.length / pageSize));
  const paginatedOrders = finalDisplay.slice((currentPage - 1) * pageSize, currentPage * pageSize);

  // Reset page when filters change
  React.useEffect(() => {
    setCurrentPage(1);
  }, [selectedDay, selectedMonth, selectedYear, searchText]);

  // Counts
  const statusCounts = useMemo(() => {
    const counts: Record<string, number> = {};
    filteredOrders.forEach((o) => {
      counts[o.status] = (counts[o.status] || 0) + 1;
    });
    return counts;
  }, [filteredOrders]);

  const toggleStatus = (status: string) => {
    if (status === "All") {
      setSelectedStatuses(["All"]);
    } else {
      setSelectedStatuses((prev) => {
        const newStatuses = prev.includes(status) ? prev.filter((s) => s !== status) : [...prev.filter((s) => s !== "All"), status];
        return newStatuses.length === 0 ? ["All"] : newStatuses;
      });
    }
  };

  return (
    <div className={cx("landing-orders-main")}>
      <h2>Tất cả đơn hàng</h2>
      {openUpdateDataForStaff && <UpdateDataOrderForStaff setOpenUpdateDataForStaff={setOpenUpdateDataForStaff} />}
      <div>
        <button onClick={() => setSortBy("latest")} className={cx("btn-decor")}>
          Đơn mới nhất
        </button>
        <button onClick={() => setSortBy("oldest")} className={cx("btn-decor")}>
          Đơn cũ nhất
        </button>
        <button className={cx("btn-decor")} onClick={() => setOpenUpdateDeliveryBox(true)}>
          Cập nhật vận chuyển hàng loạt
        </button>
        <button className={cx("btn-decor")} onClick={() => setOpenUpdateDataForStaff(true)}>
          Cập nhật dữ liệu cho nhân viên
        </button>
      </div>

      {/* Filters */}

      {/* Status filter as a select */}
      <div className={cx("filters")}>
        <div>
          <span>Tìm kiếm &nbsp;</span>
          <input type="text" placeholder="Nhập mã đơn hàng" className={cx("input-search")} value={searchText} onChange={(e) => setSearchText(e.target.value)} />
        </div>
        <div className={cx("filter-by-status")}>
          <label>Trạng thái: </label>
          <select
            value={selectedStatuses[0] || "All"}
            onChange={(e) => {
              const value = e.target.value;
              setSelectedStatuses([value]);
              if (value !== "Chốt") {
                setDeliveryStatuses("All"); // reset delivery filter when not Chốt
              }
            }}
          >
            <option value="All">Tất cả ({finalOrders.length})</option>
            {STATUS_OPTIONS.map((status) => (
              <option key={status} value={status}>
                {status} ({statusCounts[status] || 0})
              </option>
            ))}
          </select>

          {/* If Chốt → show delivery filter */}
          {selectedStatuses.includes("Chốt") && (
            <select value={deliveryStatuses} onChange={(e) => setDeliveryStatuses(e.target.value)} style={{ marginLeft: "10px" }}>
              <option value="All">Tất cả</option>
              {DeliveryOptions.map((s) => (
                <option key={s} value={s}>
                  {s}
                </option>
              ))}
            </select>
          )}
        </div>
        {/* 1. Order code prefix filter */}
        <label>
          Mã đơn (prefix):
          <select
            value={filterOrderPrefix}
            onChange={(e) => {
              setFilterOrderPrefix(e.target.value);
              setFilterDelivery("All");
              setFilterStaff("All");
            }}
          >
            <option value="All">Tất cả</option>
            {[...new Set(finalOrders.map((o) => o.orderCode.split("-")[0]))].map((prefix) => (
              <option key={prefix} value={prefix}>
                {prefix}
              </option>
            ))}
          </select>
        </label>

        {/* 2. Delivery status filter */}
        <label>
          Vận chuyển:
          <select
            value={filterDelivery}
            onChange={(e) => {
              setFilterOrderPrefix("All");
              setFilterDelivery(e.target.value);
              setFilterStaff("All");
            }}
          >
            <option value="All">Tất cả</option>
            {DeliveryOptions.map((s) => (
              <option key={s} value={s}>
                {s}
              </option>
            ))}
          </select>
        </label>

        {/* 3. Staff filter */}
        <label>
          Nhân viên:
          <select
            value={filterStaff}
            onChange={(e) => {
              setFilterOrderPrefix("All");
              setFilterDelivery("All");
              setFilterStaff(e.target.value);
            }}
          >
            <option value="All">Tất cả</option>
            {[...new Set(finalOrders.map((o) => o.staff))].map((s) => (
              <option key={s} value={s}>
                {s}
              </option>
            ))}
          </select>
        </label>

        {/* Day */}
        <label>
          Ngày:
          {/* <select
            value={filterDay}
            onChange={(e) => {
              setFilterDay(e.target.value);
              setFilterMonth("All");
              setFilterYear("All");
            }}
          >
            <option value="All">Tất cả</option>
            {[...new Set(finalOrders.map((o) => o.time.split(" ")[0]))].map((d) => (
              <option key={d} value={d}>
                {d}
              </option>
            ))}
          </select> */}
          <input
            type="date"
            value={filterDay}
            onChange={(e) => {
              setSelectedDay(e.target.value);
              console.log("e.target.value", e.target.value);
              setFilterDay(e.target.value);
              setFilterMonth("All");
              setFilterYear("All");
            }}
            className={cx("input-decor")}
            style={{ width: 130, outline: "none" }}
          />
        </label>

        {/* Month */}
        <label>
          Tháng:
          <select
            value={selectedMonth}
            onChange={(e) => {
              const month = Number(e.target.value);
              setSelectedMonth(month);
              setFilterDay("All");
              setFilterYear("All");

              // format filterMonth as YYYY-MM using selectedYear
              const formatted = `${selectedYear}-${month.toString().padStart(2, "0")}`;
              setFilterMonth(formatted);
            }}
          >
            {Array.from({ length: 12 }, (_, i) => i + 1).map((m) => (
              <option key={m} value={m}>
                {new Date(0, m - 1).toLocaleString("default", { month: "long" })}
              </option>
            ))}
          </select>
          <select
            value={selectedYear}
            onChange={(e) => {
              const year = Number(e.target.value);
              setSelectedYear(year);
              setFilterDay("All");
              setFilterMonth("All");
              setFilterYear(year.toString());
            }}
          >
            {Array.from({ length: 6 }, (_, i) => selectedYear - 3 + i).map((y) => (
              <option key={y} value={y}>
                {y}
              </option>
            ))}
          </select>
        </label>

        {/* Year */}
        <label>
          Năm:
          <select
            value={filterYear}
            onChange={(e) => {
              setFilterYear(e.target.value);
              setFilterDay("All");
              setFilterMonth("All");
            }}
          >
            <option value="All">Tất cả</option>
            {[...new Set(finalOrders.map((o) => o.time.substring(0, 4)))].map((y) => (
              <option key={y} value={y}>
                {y}
              </option>
            ))}
          </select>
        </label>

        {/* Clear filters */}
        <div style={{ display: "flex", alignItems: "center" }}>
          <button
            onClick={() => {
              setFilterOrderPrefix("All");
              setFilterDelivery("All");
              setFilterStaff("All");
              setFilterDay("All");
              setFilterMonth("All");
              setFilterYear("All");
              setSearchText("");
            }}
            style={{ backgroundColor: "#8cbbf8" }}
          >
            Xóa lọc
          </button>
        </div>
      </div>

      {/* Table */}
      <div className={cx("table-wrapper")}>
        <table className={cx("orders-table")}>
          <thead>
            <tr>
              <th>Tên khách hàng</th>
              <th>Thời gian tạo</th>
              <th>Mã đơn</th>
              <th>Carrier Code</th>
              <th>Ship Company</th>
              <th>Delivery Status</th>
              <th>Send Time</th>
              <th>Complete Time</th>
              <th>Trạng thái</th>
              <th>Ship Fee</th>
              <th>Tổng tiền</th>
              <th>Nhân viên</th>

              {/* <th>Số điện thoại</th> */}
              {/* <th>Địa chỉ</th> */}
              <th>Nguồn</th>
            </tr>
          </thead>
          <tbody>
            {paginatedOrders.map((o, i) => {
              const rootData = rawOrders[i];
              let carrierName = "";
              if (rootData && rootData.deliveryDetails) {
                carrierName = rootData.deliveryDetails?.shipCompany || "";
              }
              return (
                <tr key={i}>
                  <td className={cx("buyer-cell")}>
                    {" "}
                    <span className={cx("buyer-name")}>{o.customerName}</span>
                    <div className={cx("buyer-tooltip")}>
                      <p>
                        <b>Phone:</b>{" "}
                        <span onClick={() => navigator.clipboard.writeText(o.phone)} className={cx("copyable")}>
                          {formatPhone(o.phone)}
                        </span>
                      </p>
                      <p>
                        <b>Address:</b> {o.address}
                      </p>
                      {o.note && (
                        <p>
                          <b>Note:</b> {o.note}
                        </p>
                      )}
                    </div>
                  </td>
                  <td>{o.time}</td>
                  <td>{o.orderCode}</td>
                  <td>{rootData?.deliveryDetails?.carrierCode || ""}</td>
                  <td>{carrierName.toUpperCase()}</td>
                  <td>{o.deliveryStatus}</td>
                  <td>{rootData?.deliveryDetails?.shippedTime || ""}</td>
                  <td>{rootData?.deliveryDetails?.timeForChangeStatus || ""}</td>
                  <td>{o.status}</td>
                  <td>{(rootData?.deliveryDetails?.totalFeeAndVAT || 0).toLocaleString("vi-VN")}₫</td>
                  <td>{o.total.toLocaleString()}₫</td>
                  {/* <td>{o.note}</td> */}
                  {/* <td>{o.deliveryStatus}</td> */}
                  <td>{o.staff}</td>

                  {/* <td>{formatPhone(o.phone)}</td> */}
                  {/* <td>{o.address}</td> */}
                  <td>{o.website}</td>
                </tr>
              );
            })}
          </tbody>
        </table>

        {/* Pagination */}
        <div className={cx("pagination")}>
          <button onClick={() => setCurrentPage((p) => Math.max(1, p - 1))} disabled={currentPage === 1}>
            Prev
          </button>
          <span>
            Page {currentPage} / {totalPages}
          </span>
          <button onClick={() => setCurrentPage((p) => Math.min(totalPages, p + 1))} disabled={currentPage === totalPages}>
            Next
          </button>
        </div>
      </div>
    </div>
  );
}
export function sortOrders(data: FinalOrder[], sortBy: SortOrder): FinalOrder[] {
  return [...data].sort((a, b) => {
    const timeA = new Date(a.time).getTime();
    const timeB = new Date(b.time).getTime();

    if (sortBy === "latest") {
      return timeB - timeA; // newest first
    } else {
      return timeA - timeB; // oldest first
    }
  });
}
export function formatPhone(phone: string): string {
  // Remove all non-digit characters just in case
  const digits = phone.replace(/\D/g, "");

  // Format: 4 digits . 3 digits . 3 digits
  return digits.replace(/(\d{4})(\d{3})(\d{3})/, "$1.$2.$3");
}