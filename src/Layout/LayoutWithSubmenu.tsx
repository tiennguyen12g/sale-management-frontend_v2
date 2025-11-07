import React, { useState, useEffect, useMemo } from "react";
import classNames from "classnames/bind";
import styles from "./LayoutWithSubmenu.module.scss";
const cx = classNames.bind(styles);

import { useProductStore } from "../zustand/productStore";
import { useShopOrderStore } from "../zustand/shopOrderStore";
import { useStaffStore } from "../zustand/staffStore";
import { useAuthStore } from "../zustand/authStore";
import ShopOrders_v3 from "../LandingOrders/ShopOrders_v3";
import CreateExcel_v2 from "../LandingOrders/CreateExcel_v2";
import StaffNotification from "../LandingOrders/StaffNotification";
// Icons
import { IoIosArrowDropleft } from "react-icons/io";
import { IoIosArrowDropright } from "react-icons/io";
import { MdInsertChart } from "react-icons/md";
import { CgDesktop } from "react-icons/cg";

const iconSize = 20;
import { LuSquareMenu } from "react-icons/lu";
export default function LayoutWithSubmenu() {
  const [menuCollapsed, setMenuCollapsed] = useState(true);
  const [viewMode, setViewMode] = useState<"table" | "excel">("table");
  const [getFinalData, setGetFinalData] = useState<any>([])
  // const {user, token} = useAuthStore();
  const { products, fetchProducts } = useProductStore();
  const { orders } = useShopOrderStore();
  const {yourStaffId} = useAuthStore();
  const [currentProduct, setCurrentProduct] = useState<string | undefined>(undefined);

  // fetch products
  useEffect(() => {
    fetchProducts();
  }, [fetchProducts]);

  // fetch orders from the store (call directly on the store to avoid double deps)
  useEffect(() => {
    useShopOrderStore.getState().fetchOrders();
  }, []);

  // build normalized products (memoized)
  const normalizedProducts = useMemo(() => {
    return (products || []).map((p, i) => {
      const productId = p.productId;
      const dataOrders = (orders || []).filter((item) => item.productId === productId);
      return {
        ...p,
        dataOrders,
      };
    });
  }, [products, orders]);

  useEffect(() => {
    if (products.length > 0 && orders.length > 0 && currentProduct === undefined) {
      setCurrentProduct(products[0].name);
    }
  }, [products, orders]);
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
        {viewMode === "table" && normalizedProducts.map((product, k) => {
          return (
            <React.Fragment key={k}>
              {currentProduct === product.name && (
                <ShopOrders_v3 productDetail={product} dataOrders={product.dataOrders} productName={currentProduct} setGetFinalData={setGetFinalData}/>
              )}
            </React.Fragment>
          );
        })}
        {viewMode === "excel" && <CreateExcel_v2 orders={getFinalData} />}
      </div>
    </div>
  );
}
