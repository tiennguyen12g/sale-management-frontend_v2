import React, { useState, useEffect, useMemo } from "react";
import classNames from "classnames/bind";
import styles from "./LayoutWithSubmenu.module.scss";
const cx = classNames.bind(styles);

import { useProductStore, type ProductType } from "../zustand/productStore";
import { useShopOrderStore } from "../zustand/shopOrderStore";
import { useAuthStore } from "../zustand/authStore";
import ShopOrders_v3 from "../pages/ManagementOrders/ShopOrders_v3";
import CreateExcel_v2 from "../pages/ManagementOrders/CreateExcel_v2";
import StaffNotification from "../pages/StaffPage/utilities/StaffNotification";
// Icons
import { IoIosArrowDropleft } from "react-icons/io";
import { IoIosArrowDropright } from "react-icons/io";
import { MdInsertChart } from "react-icons/md";
import { CgDesktop } from "react-icons/cg";
import { useBranchStore } from "../zustand/branchStore";

const iconSize = 20;
import { LuSquareMenu } from "react-icons/lu";
export default function LayoutWithSubmenu() {
  const [menuCollapsed, setMenuCollapsed] = useState(true);
  const [viewMode, setViewMode] = useState<"table" | "excel">("table");
  const [getFinalData, setGetFinalData] = useState<any>([]);
  const { selectedBranch } = useBranchStore();
  const { products, fetchProducts } = useProductStore();
  const { orders, fetchOrders } = useShopOrderStore();
  const {yourStaffId} = useAuthStore();


  // Debug: Log when orders change
  // useEffect(() => {
  //   console.log('LayoutWithSubmenu: orders changed, length:', orders.length);
  // }, [orders]);
  // fetch products
  useEffect(() => {
    if (selectedBranch?._id) {
      fetchProducts(selectedBranch._id);
    } else {
      fetchProducts(null); // Fetch all products if no branch selected
    }
  }, [fetchProducts, selectedBranch?._id]);

  // fetch orders from the store (filtered by branch)
  useEffect(() => {
    if (selectedBranch && selectedBranch?._id) {
      fetchOrders( selectedBranch.company_id, selectedBranch._id,);
    }
  }, [fetchOrders, selectedBranch?._id]);

  return (
    <div className={cx("main-layout")}>
      {/* Sidebar */}
      <div className={cx("body-left")} style={{ width: menuCollapsed ? 60 : 180 }}>
        <div className={cx("collapsed-btn")} onClick={() => setMenuCollapsed(!menuCollapsed)}>
          {!menuCollapsed ? <IoIosArrowDropleft size={24} color="#ff3300" /> : <IoIosArrowDropright size={24} color="#ff3300" />}
        </div>
        <div className={cx("sidebar-header")}>
          <div className={cx("logo-section")}>
            <StaffNotification staffID={yourStaffId !== null ? yourStaffId : ""} menuCollapsed={menuCollapsed} />
          </div>
        </div>
        <div className={cx("sidebar-menu")}>
          <div className={cx("menu-title")}>
            <LuSquareMenu size={22} />
            {!menuCollapsed && <span> MENU ____________</span>}
          </div>
          <div className={cx("wrap-menu-item")}>
            <div className={cx("menu-item", `${viewMode === "table" ? "active" : ""}`)} onClick={() => setViewMode("table")}>
              <div style={{ width: menuCollapsed ? "100%" : "" }}>
                {" "}
                <MdInsertChart size={iconSize + 2} />
              </div>
              {!menuCollapsed && <span>Xem đơn hàng</span>}
            </div>
            <div className={cx("menu-item", `${viewMode === "excel" ? "active" : ""}`)} onClick={() => setViewMode("excel")}>
              <div style={{ width: menuCollapsed ? "100%" : "" }}>
                <CgDesktop size={iconSize} />
              </div>
              {!menuCollapsed && <span>Tạo Excel</span>}
            </div>
          </div>
        </div>
        <div className={cx("sidebar-footer")}>
          <div className={cx("footer-info")}>{/* Footer content */}</div>
        </div>
      </div>

      {/* Body Content */}
      <div className={cx("body-right")} style={{ width: menuCollapsed ? "calc(100% - 60px)" : "calc(100% - 180px)" }}>
        {viewMode === "table" && (
          <ShopOrders_v3 
            dataOrders={orders} 
            setGetFinalData={setGetFinalData}
            products={products}
          />
        )}
        {viewMode === "excel" && <CreateExcel_v2 orders={getFinalData} />}
      </div>
    </div>
  );
}
