import React, { useState, useEffect, useMemo } from "react";
import classNames from "classnames/bind";
import styles from "./LayoutWithSubmenu.module.scss";
const cx = classNames.bind(styles);

import { useProductStore, type ProductType } from "../zustand/productStore";
import { useShopOrderStore } from "../zustand/shopOrderStore";
import { useStaffStore } from "../zustand/staffStore";
import { useAuthStore } from "../zustand/authStore";
import ShopOrders_v3 from "../ManagementOrders/ShopOrders_v3";
import CreateExcel_v2 from "../ManagementOrders/CreateExcel_v2";
import StaffNotification from "../StaffPage/utilities/StaffNotification";
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
  // const {user, token} = useAuthStore();
  const { products, fetchProducts } = useProductStore();
  const { orders, fetchOrders } = useShopOrderStore();
  const {yourStaffId} = useAuthStore();
  const [currentProduct, setCurrentProduct] = useState<ProductType | undefined>(undefined);

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
    if (selectedBranch?._id) {
      fetchOrders(selectedBranch._id);
    } else {
      fetchOrders(); // Fetch all orders if no branch selected
    }
  }, [fetchOrders, selectedBranch?._id]);

  // Filter orders by selected product
  const filteredOrders = useMemo(() => {
    if (!currentProduct) return orders;
    return orders.filter(order => order.product_code === currentProduct.product_code);
  }, [orders, currentProduct]);

  // Get current product (first product or selected)
  const product = currentProduct || products[0];


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
        {viewMode === "table" && product && (
          <ShopOrders_v3 
            productDetail={product} 
            dataOrders={filteredOrders} 
            setGetFinalData={setGetFinalData}
          />
        )}
        {viewMode === "excel" && <CreateExcel_v2 orders={getFinalData} />}
        {viewMode === "table" && !product && (
          <div style={{ padding: 20 }}>
            <p>Vui lòng chọn sản phẩm để xem đơn hàng</p>
          </div>
        )}
      </div>
    </div>
  );
}
