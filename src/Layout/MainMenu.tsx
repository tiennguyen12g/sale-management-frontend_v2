import React, { useState, type Dispatch, type SetStateAction } from "react";
import classNames from "classnames/bind";
import styles from "./MainMenu.module.scss";
const cx = classNames.bind(styles);
import { useNavigate } from "react-router-dom";

import { PiPowerFill } from "react-icons/pi";
import { RiLogoutBoxFill } from "react-icons/ri";
import { RiLogoutBoxRFill } from "react-icons/ri";
import { IoSettingsSharp } from "react-icons/io5";
import { RiAdvertisementFill } from "react-icons/ri";
import { IoStorefrontSharp } from "react-icons/io5";
import { MdOutlineWarehouse } from "react-icons/md";
import { AiFillMessage } from "react-icons/ai";
import { FaCartPlus } from "react-icons/fa";
import { useAuthStore } from "../zustand/authStore";
import { FaUserCircle } from "react-icons/fa";
import StaffTracking_v2 from "../StaffPage/utilities/StaffTracking_v2";
import { useMainMenuStore } from "../zustand/mainMenuCollapsed";
import LanguageSwitcher from "@/i18n/LanguageSwitcherForMenu";
import { useTranslation } from "react-i18next";
interface Props {
  isCollapsed: boolean;
  setIsCollapsed: Dispatch<SetStateAction<boolean>>;
}

const iconSize = 22;
export default function MainMenu({}: Props) {
  const navigate = useNavigate();
  const { t } = useTranslation();
  const { openMenu, setOpenMenu, menuCollapsed, toggleMenuCollapse } = useMainMenuStore();
  const { company_id, accessRole, yourStaffId, logout } = useAuthStore();
  const handleLogout = () => {
    logout();
    window.location.href = "/login"; // redirect
  };

  return (
    <div className={cx("main-menu", { collapsed: menuCollapsed })}>
      <div className={cx("part-above")}>
                <div
          className={cx("menu-item", { active: openMenu === "list-shop" })}
          onClick={() => {
            setOpenMenu("");
            navigate("/initial");
          }}
        >
          <div className={cx("part1")}>
       <IoStorefrontSharp className={cx("icon")} size={iconSize} color="#ffffff" />
            {!menuCollapsed && <span>{t("menu.shop", "Cửa hàng")}</span>}
          </div>
        </div>
        <div
          className={cx("menu-item", { active: openMenu === "message" })}
          onClick={() => {
            setOpenMenu("message");
            navigate("/tin-nhan-page");
          }}
        >
          <div className={cx("part1")}>
            <AiFillMessage className={cx("icon")} size={iconSize} color="#ffffff" />
            {!menuCollapsed && <span>{t("menu.messages","Tin nhắn")}</span>}
          </div>
        </div>
        <div
          className={cx("menu-item", { active: openMenu === "orders" })}
          onClick={() => {
            setOpenMenu("orders");
            navigate("/quan-li-don-hang");
          }}
        >
          <div className={cx("part1")}>
            <FaCartPlus className={cx("icon")} size={iconSize} color="#ffffff" />
            {!menuCollapsed && <span>{t("menu.orders","Đơn hàng")}</span>}
          </div>
        </div>
        <div
          className={cx("menu-item", { active: openMenu === "inventory" })}
          onClick={() => {
            setOpenMenu("inventory");
            navigate("/danh-sach-san-pham");
          }}
        >
          <div className={cx("part1")}>
            <MdOutlineWarehouse className={cx("icon")} size={iconSize} color="#ffffff" />
            {!menuCollapsed && <span>{t("menu.warehouse","Kho hàng")}</span>}
          </div>
        </div>
        <div
          className={cx("menu-item", { active: openMenu === "user-page" })}
          onClick={() => {
            setOpenMenu("user-page");
            navigate("/ho-so-ca-nhan");
          }}
        >
          <div className={cx("part1")}>
            <FaUserCircle className={cx("icon")} size={iconSize} color="#ffffff" />
            {!menuCollapsed && <span>{t("menu.profile","Hồ sơ")}</span>}
          </div>
        </div>
        <div
          className={cx("menu-item", { active: openMenu === "ads-account" })}
          onClick={() => {
            setOpenMenu("ads-account");
            navigate("/tai-khoan-ads");
          }}
        >
          <div className={cx("part1")}>
            <RiAdvertisementFill className={cx("icon")} size={iconSize + 3} color="#ffffff" />
            {!menuCollapsed && <span>{t("menu.ads","Ads acc")}</span>}
          </div>
        </div>
        <div
          className={cx("menu-item", { active: openMenu === "cai-dat" })}
          onClick={() => {
            setOpenMenu("cai-dat");
            navigate("/cai-dat");
          }}
        >
          <div className={cx("part1")}>
            <IoSettingsSharp className={cx("icon")} size={iconSize + 3} color="#ffffff" />
            {!menuCollapsed && <span>{t("menu.settings","Cài đặt")}</span>}
          </div>
        </div>
      </div>

      <div className={cx("part-below")}>
        <div className={cx("menu-item")}>
          <div className="w-full">
            <LanguageSwitcher />
          </div>
        </div>
        <div className={cx("menu-item")}>
          <div className={cx("part1")}>
            <StaffTracking_v2 staffID={yourStaffId ? yourStaffId : ""} menuCollapsed={menuCollapsed} />
          </div>
        </div>
        <div className={cx("menu-item")} onClick={toggleMenuCollapse}>
          <div className={cx("part1")}>
            {!menuCollapsed ? (
              <RiLogoutBoxFill className={cx("icon")} size={iconSize + 3} color="#ffffff" style={{ marginLeft: -1 }} />
            ) : (
              <RiLogoutBoxRFill className={cx("icon")} size={iconSize + 3} color="#ffffff" style={{ marginLeft: -1 }} />
            )}
            {!menuCollapsed && <span>{t("menu.collapse","Thu nhỏ")}</span>}
          </div>
        </div>
        <div className={cx("menu-item")} onClick={handleLogout}>
          <div className={cx("part1")}>
            <PiPowerFill className={cx("icon")} size={iconSize + 3} color="#ffffff" fontWeight={600} />
            {!menuCollapsed && <span>{t("menu.logout","Đăng xuất")}</span>}
          </div>
        </div>
      </div>
    </div>
  );
}
