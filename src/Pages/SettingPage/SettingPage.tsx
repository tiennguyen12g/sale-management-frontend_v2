import React, { useState, useEffect } from "react";
import classNames from "classnames/bind";
import styles from "./SettingPage.module.scss";
import FastMessage from "./FastMessage";
const cx = classNames.bind(styles);
import ManageTags from "./ManageTags";
import GeneralSetting from "./GeneralSetting";
import Notification from "./Notification";
import Decentralization from "./Decentralization";
import { useBranchStore } from "../../zustand/branchStore";
export default function SettingPage() {
  const [activePage, setAcctivePage] = useState<string>("general-setting");
  const { selectedBranch, fetchBranchSettings } = useBranchStore();
  //-- Fetch branch settings
  useEffect(() => {
    async function LoadBranchSetting() {
      if (selectedBranch) {
        const result = await fetchBranchSettings(selectedBranch._id, selectedBranch.company_id);
      }
    }
    LoadBranchSetting();
  }, []);
  return (
    <div className={cx("main-setting")}>
      {/* Left Sidebar Menu */}
      <div className={cx("sidebar")}>
        <h2 className={cx("sidebar-title")}>Cài đặt</h2>

        <div className={cx("menu-list")}>
          <div className={cx("menu-item", activePage === "general-setting" ? "active" : "")} onClick={() => setAcctivePage("general-setting")}>
            <span className={cx("icon")}>⚙️</span>
            <span className={cx("text")}>Cài đặt chung</span>
          </div>
          <div className={cx("menu-item", activePage === "decentralization" ? "active" : "")} onClick={() => setAcctivePage("decentralization")}>
            <span className={cx("icon")}>👥</span>
            <span className={cx("text")}>Phân quyền</span>
          </div>
          <div className={cx("menu-item", activePage === "notification" ? "active" : "")} onClick={() => setAcctivePage("notification")}>
            <span className={cx("icon")}>🔔</span>
            <span className={cx("text")}>Thông báo</span>
          </div>

          <div className={cx("menu-item", activePage === "tag-management" ? "active" : "")} onClick={() => setAcctivePage("tag-management")}>
            <span className={cx("icon")}>🏷️</span>
            <span className={cx("text")}>Thẻ hội thoại</span>
          </div>

          <div className={cx("menu-item")}>
            <span className={cx("icon")}>✨</span>
            <span className={cx("text")}>Trợ lý AI</span>
            <span className={cx("badge")}>Beta</span>
          </div>

          <div className={cx("menu-item", activePage === "fast-message" ? "active" : "")} onClick={() => setAcctivePage("fast-message")}>
            <span className={cx("icon")}>💬</span>
            <span className={cx("text")}>Hỗ trợ trả lời</span>
          </div>

          <div className={cx("menu-item")}>
            <span className={cx("icon")}>💻</span>
            <span className={cx("text")}>Giao diện</span>
          </div>

          <div className={cx("menu-item")}>
            <span className={cx("icon")}>📞</span>
            <span className={cx("text")}>Cuộc gọi</span>
          </div>

          <div className={cx("menu-item")}>
            <span className={cx("icon")}>🔄</span>
            <span className={cx("text")}>Chế độ xoay vòng</span>
          </div>

          <div className={cx("menu-item")}>
            <span className={cx("icon")}>☁️</span>
            <span className={cx("text")}>Đồng bộ</span>
          </div>

          <div className={cx("menu-item")}>
            <span className={cx("icon")}>🔧</span>
            <span className={cx("text")}>Công cụ</span>
          </div>

          <div className={cx("menu-item")}>
            <span className={cx("icon")}>🕐</span>
            <span className={cx("text")}>Lịch sử</span>
          </div>
        </div>
      </div>

      {/* Main Content Area */}
      <div className={cx("content")}>
        {activePage === "general-setting" && <GeneralSetting />}
        {activePage === "tag-management" && <ManageTags />}
        {activePage === "fast-message" && <FastMessage />}
        {activePage === "notification" && <Notification />}
        {activePage === "decentralization" && <Decentralization />}
      </div>
    </div>
  );
}
