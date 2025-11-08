import React from "react";
import classNames from "classnames/bind";
import styles from "./MainMenu_v2.module.scss";

import { useNavigate } from "react-router-dom";

import { MdDashboard, MdInventory, MdLocalShipping } from "react-icons/md";
import { FaMoneyBillWave, FaFileInvoiceDollar, FaUserTie, FaAd } from "react-icons/fa";
import { AiOutlineUnorderedList } from "react-icons/ai";
import { FaStore } from "react-icons/fa";
import { TiArrowSortedDown } from "react-icons/ti";
import { IoLogOutOutline } from "react-icons/io5";
import shoppingCart from "./icons/shopping-cart.gif";
import { IoMdCart } from "react-icons/io";
import { BiSolidCircle } from "react-icons/bi";
import { FaFacebookSquare } from "react-icons/fa";

import { useMenuStore } from "./MenuActiveState"; // ✅ import zustand store
import { useAuthStore } from "../../zustand/authStore";
const cx = classNames.bind(styles);

export default function MainMenu_v2() {
  const navigate = useNavigate();

  const { openMenu, activeSubmenu, setOpenMenu, setActiveSubmenu } = useMenuStore();
  const { logout } = useAuthStore();
  const handleLogout = () => {
    logout();
    window.location.href = "/login"; // redirect
  };

  return (
    <div className={cx("main-menu")}>
      {/* Dashboard */}
      <div className={cx("submenu")}>
        <div
          className={cx("submenu-item", { active: activeSubmenu === "dashboard" })}
          onClick={() => {
            setActiveSubmenu("dashboard"); // reset submenu
          }}
        >
          <MdDashboard className={cx("icon")} size={20} />
          <div>Dashboard</div>
        </div>
      </div>

      {/* Product Manage */}
      <div className={cx("menu-field")}>
        <BiSolidCircle />
        <div>Product</div>
      </div>
      <div className={cx("submenu")}>
        <div className={cx("submenu-item", { active: activeSubmenu === "import" })} onClick={() => setActiveSubmenu("import")}>
          <FaStore className={cx("icon")} size={20} /> IMP & EXP & IVT
        </div>
        <div className={cx("submenu-item", { active: activeSubmenu === "delivery" })} onClick={() => setActiveSubmenu("delivery")}>
          <MdLocalShipping className={cx("icon")} size={20} /> Delivery & Return
        </div>
        <div className={cx("submenu-item", { active: activeSubmenu === "product-detail" })} onClick={() => setActiveSubmenu("product-detail")}>
          <IoMdCart className={cx("icon")} size={22} />
          Product Details
        </div>
      </div>

      {/* Finance */}
      <div className={cx("menu-field")}>
        <BiSolidCircle />
        <div>Financial</div>
      </div>

      <div className={cx("submenu")}>
        <div
          className={cx("submenu-item", { active: activeSubmenu === "money" })}
          onClick={() => {
            setActiveSubmenu("money");
          }}
        >
          <FaFileInvoiceDollar className={cx("icon")} size={20} /> Money In & Out
        </div>
        <div className={cx("submenu-item", { active: activeSubmenu === "costs" })} onClick={() => setActiveSubmenu("costs")}>
          <AiOutlineUnorderedList className={cx("icon")} size={20} /> Operating Costs
        </div>
        <div className={cx("submenu-item", { active: activeSubmenu === "salary" })} onClick={() => setActiveSubmenu("salary")}>
          <FaUserTie className={cx("icon")} size={20} /> Staff Salary
        </div>
        <div className={cx("submenu-item", { active: activeSubmenu === "ads" })} onClick={() => setActiveSubmenu("ads")}>
          <FaAd className={cx("icon")} size={20} /> ADS Costs
        </div>
      </div>
      <div className={cx("menu-item")} onClick={() => handleLogout()}>
        <div className={cx("part1")}>
          <IoLogOutOutline className={cx("icon")} size={20} />
          <span>Logout</span>
        </div>
      </div>
    </div>
  );
}
