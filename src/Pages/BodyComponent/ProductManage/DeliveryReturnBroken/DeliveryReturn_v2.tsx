// DeliveryReturn.tsx
import React, { useMemo, useState, useEffect } from "react";
import classNames from "classnames/bind";
import styles from "./DeliveryReturn_v2.module.scss";
const cx = classNames.bind(styles);
import type { OrderStatusType, OrderType, } from "./DeliveryReturnType";

import { CarrierFee, VoucherValue, ordersData } from "./DeliveryReturnType";
import { useShopOrderStore } from "../../../../zustand/shopOrderStore";
import { useProductStore } from "../../../../zustand/productStore";
import AllOrdersForOwner from "../../../ManagementOrders/AllOrdersForOwner";
import ProductSummaryTable_v2 from "./ProductSummaryTable_v2";
import UploadDeliveryStatus from "../../../../utils/UploadDeliveryStatus";
import PlatformSummaryTable_v2 from "../ProductDetails/PlatformSummaryTable_v2";
// Utility to format date (YYYY-MM-DD)
const formatDate = (dateStr: string) => new Date(dateStr).toISOString().slice(0, 10);

export default function DeliveryReturn_v2() {
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



  // ---- Summary stats ----
  const summaryByPlatform = (platform: "All" | "Tiktok" | "Shopee" | "Facebook" | "Landing") => {
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

  const platforms: ("All" | "Tiktok" | "Shopee" | "Facebook" | "Landing")[] = ["All", "Tiktok", "Shopee", "Facebook", "Landing"];


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
      <PlatformSummaryTable_v2 ordersData={storeOrders} />
      <ProductSummaryTable_v2 ordersData={storeOrders} />

      <AllOrdersForOwner />
      {showUploadExcel && <UploadDeliveryStatus onClose={() => setShowUploadExcel(false)} onUpload={handleDeliveryUploadExcel} />}
    </div>
  );
}
