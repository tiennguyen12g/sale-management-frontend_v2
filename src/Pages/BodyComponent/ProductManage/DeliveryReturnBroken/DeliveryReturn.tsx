// DeliveryReturn.tsx
import React, { useMemo, useState, useEffect } from "react";
import classNames from "classnames/bind";
import styles from "./DeliveryReturn.module.scss";
const cx = classNames.bind(styles);
import { MdEdit, MdDelete } from "react-icons/md";

import type { CarrierNameType, VoucherType, OrderStatusType, OrderType, ProductOrderType } from "./DeliveryReturnType";

import { CarrierFee, VoucherValue, ordersData } from "./DeliveryReturnType";
import EditOrder from "./EditOrder";
import { useShopOrderStore } from "../../../../zustand/shopOrderStore";
import { useProductStore } from "../../../../zustand/productStore";
import ProductSummaryTable from "./ProductSummaryTable";
import AllOrdersForOwner from "../../../../ManagementOrders/AllOrdersForOwner";
import ProductSummaryTable_v2 from "./ProductSummaryTable_v2";
import UploadExcelBox from "../../../../ultilitis/UploadExcelBox";
import UploadDeliveryStatus from "../../../../ultilitis/UploadDeliveryStatus";
// Utility to format date (YYYY-MM-DD)
const formatDate = (dateStr: string) => new Date(dateStr).toISOString().slice(0, 10);

export default function DeliveryReturn() {
  const [filterMode, setFilterMode] = useState<"all" | "day" | "month" | "year">("all");
  const [selectedDay, setSelectedDay] = useState<string>(formatDate(new Date().toISOString()));
  const [selectedMonth, setSelectedMonth] = useState<number>(new Date().getMonth() + 1);
  const [selectedYear, setSelectedYear] = useState<number>(new Date().getFullYear());
  const [platformFilter, setPlatformFilter] = useState<"All" | "Tiktok" | "Shopee" | "Facebook">("All");
  const [productFilter, setProductFilter] = useState<string>("");
  const [deliveryStatusFilter, setDeliveryStatusFilter] = useState<OrderStatusType | "All">("All");
  const [showUploadExcel, setShowUploadExcel] = useState(false);

  const [orders, setOrders] = useState<OrderType[]>(ordersData);
  const [editingOrder, setEditingOrder] = useState<OrderType | null>(null);

  const { orders: storeOrders, uploadDeliveryExcel } = useShopOrderStore();
  const { products, fetchProducts } = useProductStore();
  // fetch products
  useEffect(() => {
    fetchProducts();
  }, [fetchProducts]);

  // fetch orders from the store (call directly on the store to avoid double deps)
  useEffect(() => {
    useShopOrderStore.getState().fetchOrders();
  }, []);

  const [currentPage, setCurrentPage] = useState(1);
  const pageSize = 12;

  // ---- Filter logic ----
  const filteredOrders = useMemo(() => {
    let data = [...ordersData];

    // Filter by time
    if (filterMode === "day") {
      data = data.filter((o) => formatDate(o.sendTime) === selectedDay);
    } else if (filterMode === "month") {
      data = data.filter((o) => {
        const d = new Date(o.sendTime);
        return d.getMonth() + 1 === selectedMonth && d.getFullYear() === selectedYear;
      });
    } else if (filterMode === "year") {
      data = data.filter((o) => new Date(o.sendTime).getFullYear() === selectedYear);
    }

    // Filter by platform
    if (platformFilter !== "All") {
      data = data.filter((o) => o.platform === platformFilter);
    }

    // Filter by productName
    if (productFilter.trim() !== "") {
      data = data.filter((o) => o.productInfos.some((p) => p.productName.toLowerCase().includes(productFilter.toLowerCase())));
    }

    // Filter by status delivery
    if (deliveryStatusFilter !== "All") {
      data = data.filter((o) => o.statusOrder === deliveryStatusFilter);
    }

    return data;
  }, [filterMode, selectedDay, selectedMonth, selectedYear, platformFilter, productFilter, deliveryStatusFilter]);

  // ---- Pagination ----
  const totalPages = Math.max(1, Math.ceil(filteredOrders.length / pageSize));
  const paginatedOrders = filteredOrders.slice((currentPage - 1) * pageSize, currentPage * pageSize);

  // Reset page when filters change
  React.useEffect(() => {
    setCurrentPage(1);
  }, [filterMode, selectedDay, selectedMonth, selectedYear, platformFilter, productFilter, deliveryStatusFilter]);

  // ---- Summary stats ----
  const summaryByPlatform = (platform: "All" | "Tiktok" | "Shopee" | "Facebook") => {
    const subset = platform === "All" ? ordersData : ordersData.filter((o) => o.platform === platform);

    return {
      total: subset.length,
      success: subset.filter((o) => o.statusOrder === "success").length,
      onDelivery: subset.filter((o) => o.statusOrder === "onDelivery").length,
      returned: subset.filter((o) => o.statusOrder === "return").length,
      lost: subset.filter((o) => o.statusOrder === "lost").length,
      totalCOD: subset.reduce((sum, o) => sum + o.codValue, 0),
    };
  };

  const platforms: ("All" | "Tiktok" | "Shopee" | "Facebook")[] = ["All", "Tiktok", "Shopee", "Facebook"];

  const handleClearFilter = () => {
    setFilterMode("all");
    setPlatformFilter("All");
    setDeliveryStatusFilter("All");
    setCurrentPage(1);
    setProductFilter("");
  };

  // --- Upload Excel handler
  const handleExcelUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    if (!e.target.files?.length) return;
    const file = e.target.files[0];
    const formData = new FormData();
    formData.append("file", file);

    await fetch("http://localhost:6000/api-v1/delivery-return?action=add&type=excel", {
      method: "POST",
      body: formData,
    });
    alert("Excel uploaded!");
  };

  // --- Delete order
  const handleDelete = async (orderId: string) => {
    if (!window.confirm("Delete this order?")) return;

    await fetch("http://localhost:6000/api-v1/delivery-return?action=delete", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ id: orderId }),
    });

    setOrders((prev) => prev.filter((o) => o.myOwnShippingID !== orderId));
  };

  // -- Handle show all orders

  // --- Upload Delivery Excel handler
  const handleDeliveryUploadExcel = async (file: File, shipCompany: string) => {
    const formData = new FormData();
    formData.append("file", file);
    const nameFile = file.name;

    const result = await uploadDeliveryExcel(file, shipCompany);
    if (result.status === "success") {
      alert(`✅ Cập nhật ${result.count} đơn thành công`);
    }
    setShowUploadExcel(false);
    // alert(`✅ Uploaded ${data.count} costs`);
  };

  return (
    <div className={cx("delivery-return-main")}>
      {/* Summary cards */}
      <div className={cx("cards-grid")}>
        {platforms.map((pf) => {
          const s = summaryByPlatform(pf);
          return (
            <div key={pf} className={cx("card")}>
              <h3>{pf} Orders</h3>
              <p>Total: {s.total}</p>
              <p>
                Success: {s.success} - {((s.success / s.total) * 100).toFixed(1)}%
              </p>
              <p>
                On Delivery: {s.onDelivery} - {((s.onDelivery / s.total) * 100).toFixed(1)}%
              </p>
              <p>
                Returned: {s.returned} - {((s.returned / s.total) * 100).toFixed(1)}%
              </p>
              <p>
                Lost: {s.lost} - {((s.lost / s.total) * 100).toFixed(1)}%
              </p>
              <p>Total COD: {s.totalCOD.toLocaleString()} đ</p>
            </div>
          );
        })}
      </div>

      {/* Upload Excel */}
      <div className={cx("top-actions")}>
        <label className={cx("upload-btn")}>
          Upload Excel
          <input type="file" accept=".xlsx,.xls,.csv" onChange={handleExcelUpload} hidden />
        </label>
        <button className={cx("btn-decor")} onClick={() => setShowUploadExcel(true)}>
          Upload Delivery Excel
        </button>
      </div>

      <ProductSummaryTable />
      <ProductSummaryTable_v2 ordersData={storeOrders} />

      {/* Filters */}
      <div className={cx("filters")}>
        <div>
          <label>Filter Mode: </label>
          <button onClick={() => setFilterMode("all")}>All</button>
          <button onClick={() => setFilterMode("day")}>Day</button>
          <button onClick={() => setFilterMode("month")}>Month</button>
          <button onClick={() => setFilterMode("year")}>Year</button>
        </div>

        {filterMode === "day" && <input type="date" value={selectedDay} onChange={(e) => setSelectedDay(e.target.value)} />}

        {filterMode === "month" && (
          <>
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
          </>
        )}

        {filterMode === "year" && (
          <select value={selectedYear} onChange={(e) => setSelectedYear(Number(e.target.value))}>
            {Array.from({ length: 6 }, (_, i) => selectedYear - 3 + i).map((y) => (
              <option key={y} value={y}>
                {y}
              </option>
            ))}
          </select>
        )}

        <div>
          <label>Platform: </label>
          <select value={platformFilter} onChange={(e) => setPlatformFilter(e.target.value as any)}>
            <option value="All">All</option>
            <option value="Tiktok">Tiktok</option>
            <option value="Shopee">Shopee</option>
            <option value="Facebook">Facebook</option>
          </select>
        </div>
        <div>
          <label>Delivery Status: </label>
          <select value={deliveryStatusFilter} onChange={(e) => setDeliveryStatusFilter(e.target.value as any)}>
            <option value="All">All</option>
            <option value="onDelivery">On Delivery</option>
            <option value="success">Success</option>
            <option value="return">Return</option>
            <option value="lost">Lost</option>
          </select>
        </div>

        <div className={cx("product-filter")}>
          <label>Product: </label>
          <input type="text" value={productFilter} onChange={(e) => setProductFilter(e.target.value)} placeholder="Search by product name..." />
        </div>
        <div onClick={handleClearFilter}>
          <label>Clear Filter</label>
        </div>
      </div>

      {/* Orders table */}
      <table className={cx("orders-table")}>
        <thead>
          <tr>
            <th>Buyer</th>
            <th>Products</th>
            <th>Platform</th>
            <th>COD</th>
            <th>Send Time</th>
            <th>Complete Time</th>
            <th>Carrier ID</th>
            <th>Carrier</th>
            <th>Status</th>
            <th>Edit</th>
            <th>Delete</th>
          </tr>
        </thead>
        <tbody>
          {paginatedOrders.map((o, idx) => (
            <tr key={idx} className={cx("status-" + o.statusOrder)}>
              <td className={cx("buyer-cell")}>
                <span className={cx("buyer-name")}>{o.buyerInfos.name}</span>
                <div className={cx("buyer-tooltip")}>
                  <p>
                    <b>Phone:</b>{" "}
                    <span onClick={() => navigator.clipboard.writeText(o.buyerInfos.phone)} className={cx("copyable")}>
                      {o.buyerInfos.phone}
                    </span>
                  </p>
                  <p>
                    <b>Address:</b> {o.buyerInfos.address}
                  </p>
                  {o.buyerInfos.note && (
                    <p>
                      <b>Note:</b> {o.buyerInfos.note}
                    </p>
                  )}
                  {o.buyerInfos.blackList && (
                    <p>
                      <b>Black list:</b> {o.buyerInfos.blackList}
                    </p>
                  )}
                </div>
              </td>
              <td>
                {o.productInfos.map((p, i) => (
                  <div key={i}>
                    {p.productName} x {p.quantity}
                  </div>
                ))}
              </td>
              <td>{o.platform}</td>
              <td>{o.codValue.toLocaleString()} đ</td>
              <td>{formatDate(o.sendTime)}</td>
              <td>{o.completeTime ? formatDate(o.completeTime) : "waiting"}</td>
              {/* CarrierShippingID with copy */}
              <td >
                <span className={cx("copyable")} onClick={() => navigator.clipboard.writeText(o.carrierShippingID)}>
                  {o.carrierShippingID}
                </span>
              </td>
              <td>{o.carrierName}</td>
              <td>{o.statusOrder}</td>
              {/* Edit button */}
              <td>
                <MdEdit className={cx("action-icon")} onClick={() => setEditingOrder(o)} size={22} />
              </td>

              {/* Delete button */}
              <td>
                <MdDelete className={cx("action-icon", "delete")} onClick={() => handleDelete(o.myOwnShippingID)} size={22} />
              </td>
            </tr>
          ))}
        </tbody>
      </table>
      {/* Edit modal */}
      {editingOrder && (
        <EditOrder
          order={editingOrder}
          onClose={() => setEditingOrder(null)}
          onSave={(updated) => {
            setOrders((prev) => prev.map((o) => (o.myOwnShippingID === updated.myOwnShippingID ? updated : o)));
            setEditingOrder(null);
          }}
        />
      )}

      {/* Pagination */}
      {/* <div className={cx("pagination")}>
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
      <div>** Estimate the profit of the order.</div> */}
      {/* <ShopOrders productDetail={products} dataOrders={storeOrders} /> */}
      <AllOrdersForOwner />
      {showUploadExcel && <UploadDeliveryStatus onClose={() => setShowUploadExcel(false)} onUpload={handleDeliveryUploadExcel} />}
    </div>
  );
}
