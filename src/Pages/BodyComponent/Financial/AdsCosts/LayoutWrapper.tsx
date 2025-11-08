import React, { useState, useEffect } from "react";
import classNames from "classnames/bind";
import styles from "./LayoutWrapper.module.scss";
const cx = classNames.bind(styles);
import { FaCircle } from "react-icons/fa";
import { IoIosArrowDropleft } from "react-icons/io";
import { IoIosArrowDropright } from "react-icons/io";
import { MdInsertChart } from "react-icons/md";
import { CgDesktop } from "react-icons/cg";
import adsIcon from "../../../../assets/adsIcon.svg";
const iconSize = 20;
export default function LayoutWrapper() {
  const [activeTable, setActiveTable] = useState("personal-ads-acc");
  const [menuCollapsed, setMenuCollapsed] = useState(false);
  return (
    <div className={cx("main-ads-acc")}>
      {/* Sidebar */}
      <div className={cx("body-left")} style={{ width: menuCollapsed ? 60 : 180 }}>
        <div className={cx("collapsed-btn")} onClick={() => setMenuCollapsed(!menuCollapsed)}>
          {!menuCollapsed ? <IoIosArrowDropleft size={24} color="#ff3300" /> : <IoIosArrowDropright size={24} color="#ff3300" />}
        </div>
        <div className={cx("sidebar-header")}>
          <div className={cx("logo-section")}>
            <img src={adsIcon} alt="ads-icon" />
          </div>
          {!menuCollapsed && <span>Ads Manage</span>}
        </div>
        <div className={cx("sidebar-menu")}>
          <div className={cx("menu-item", `${activeTable === "ads-check-pro" ? "active" : ""}`)} onClick={() => setActiveTable("ads-check-pro")}>
            <div style={{ width: menuCollapsed ? "100%" : "" }}>
              {" "}
              <MdInsertChart size={iconSize + 2} />
            </div>
            {!menuCollapsed && <span>Ads Check Pro</span>}
          </div>
          <div className={cx("menu-item", `${activeTable === "management-table" ? "active" : ""}`)} onClick={() => setActiveTable("management-table")}>
            <div style={{ width: menuCollapsed ? "100%" : "" }}>
              <CgDesktop size={iconSize} />
            </div>
            {!menuCollapsed && <span>Trình quản lý</span>}
          </div>
          {/* <div className={cx("menu-item")}>Xóa QTV ẩn</div>
          <div className={cx("menu-item")}>Đổi thức TKQC</div>
          <div className={cx("menu-item")}>Share Pixel</div>
          <div className={cx("menu-item")}>Super Share</div>
          <div className={cx("menu-item")}>Super Target</div>
          <div className={cx("menu-item")}>Ads Save</div>
          <div className={cx("menu-item")}>Kháng TKQC</div> */}
        </div>
        <div className={cx("sidebar-footer")}>
          <div className={cx("footer-info")}>{/* Footer content */}</div>
        </div>
      </div>

      {/* Body Content */}
      <div className={cx("body-right")} style={{ width: menuCollapsed ? "calc(100% - 60px)" : "calc(100% - 180px)" }}>
        <div className={cx("header")}>
          <div className={cx("header-left")}>
            <div className={cx("header-tabs")}>
              <div className={cx("tab", `${activeTable === "personal-ads-acc" ? "active" : ""}`)} onClick={() => setActiveTable("personal-ads-acc")}>
                TK Cá nhân
              </div>
              <div className={cx("tab", `${activeTable === "bussiness-acc" ? "active" : ""}`)} onClick={() => setActiveTable("bussiness-acc")}>
                TK BM
              </div>
              <div className={cx("tab", `${activeTable === "fanpage-list" ? "active" : ""}`)} onClick={() => setActiveTable("fanpage-list")}>
                Page
              </div>
            </div>
          </div>
          <div className={cx("header-right")}>
            <div className={cx("header-actions")}>{/* Action buttons */}</div>
          </div>
        </div>
        <div className={cx("content")}>
          <div className={cx("table-scroll")}>
            <div className={cx("table-container")}>
              <div className={cx("table-header")}>
                <div className={cx("table-cell")}>Tài khoản</div>
                <div className={cx("table-cell")}>Trạng thái</div>
                <div className={cx("table-cell")}>ID gốc</div>
                <div className={cx("table-cell")}>Số dư</div>
                <div className={cx("table-cell")}>Ngưỡng</div>
                <div className={cx("table-cell")}>Ngưỡng còn lại</div>
                <div className={cx("table-cell")}>Limit</div>
                <div className={cx("table-cell")}>Tổng tiêu</div>
                <div className={cx("table-cell")}>GHI CHÚ</div>
                <div className={cx("table-cell")}>Tiền tệ</div>
                <div className={cx("table-cell")}>Quyền sở hữu</div>
                <div className={cx("table-cell")}>Giới hạn chi tiêu</div>
                <div className={cx("table-cell")}>Thẻ thanh toán</div>
                <div className={cx("table-cell")}>Ngày lập hóa đơn</div>
                <div className={cx("table-cell")}>Lí do khóa</div>
                <div className={cx("table-cell")}>Ngày tạo TK</div>
                <div className={cx("table-cell")}>Loại TK</div>
                <div className={cx("table-cell")}>Múi giờ TK</div>
                <div className={cx("table-cell")}>Được tạo từ BM</div>
                <div className={cx("table-cell")}>Quốc gia TK</div>
              </div>

              <div className={cx("table-body")}>
                {adsTest.map((adsInfo, i) => {
                  return (
                    <div className={cx("table-row")} key={i}>
                      <div className={cx("table-cell", "account-name")}>
                        <div style={{ fontWeight: 550, fontSize: 15 }}>{adsInfo.adsName}</div>
                        <div style={{ color: "#7e7e7e" }}>{adsInfo.adsId}</div>
                      </div>
                      <div className={cx("table-cell")} style={{ color: adsInfo.liveStatus === "active" ? "#1dad00" : "#eb0000", fontWeight: 550 }}>
                        <FaCircle color={adsInfo.liveStatus === "active" ? "#1dad00" : "#eb0000"} size={10} style={{ marginRight: 6 }} />{" "}
                        {adsInfo.liveStatus.toUpperCase()}
                      </div>
                      <div className={cx("table-cell")}>{adsInfo.adsRootId}</div>
                      <div className={cx("table-cell")}>{adsInfo.balance}</div>
                      <div className={cx("table-cell")}>0</div>
                      <div className={cx("table-cell")}>0</div>
                      <div className={cx("table-cell")}>{adsInfo.limitPerDay}</div>
                      <div className={cx("table-cell")}>{adsInfo.totalSpend}</div>
                      <div className={cx("table-cell")}>{adsInfo.note}</div>
                      <div className={cx("table-cell")}>{adsInfo.adsCurrency}</div>
                      <div className={cx("table-cell")}>{adsInfo.adsRole}</div>
                      <div className={cx("table-cell")}>{adsInfo.yourSetLimitedSpending}</div>
                      <div className={cx("table-cell")}>
                        {adsInfo.paymentMethod.card_type}-{adsInfo.paymentMethod.card_number}
                      </div>
                      <div className={cx("table-cell")}>{adsInfo.billCreateTime}</div>
                      <div className={cx("table-cell")}>{adsInfo.suspiciousReason}</div>
                      <div className={cx("table-cell")}>{adsInfo.adsCreatedTime}</div>
                      <div className={cx("table-cell")}>{adsInfo.adsType}</div>
                      <div className={cx("table-cell")}>
                        {adsInfo.timezone.country} - {adsInfo.timezone.gmt_zone}
                      </div>
                      <div className={cx("table-cell")}>{adsInfo.createdFrom.id_bm}</div>
                      <div className={cx("table-cell")}>{adsInfo.adsCountry}</div>
                    </div>
                  );
                })}
              </div>
            </div>
          </div>
        </div>

        <div className={cx("footer")}></div>
      </div>
    </div>
  );
}

const adsTest = [
  {
    adsName: "TKQC Quynh Ly",
    adsCurrency: "USD",
    liveStatus: "active", // inactive
    adsId: 4176574772593535,
    adsRootId: 61550542352732,
    balance: 0,
    limitPerDay: 50, // by USD
    totalSpend: 100,
    adsRole: "admin",
    paymentMethod: {
      card_number: 5594639130219054,
      card_type: "Mastercard",
    },
    billCreateTime: "23-10-2025",
    suspiciousReason: "None",
    adsCreatedTime: "01-10-2025",
    createdFrom: {
      id_bm: "2246401279158469",
    },
    adsType: "bussiness", // Personal
    timezone: {
      country: "America/New_York",
      gmt_zone: "-4",
    },
    adsCountry: "VN",
    note: "",
    yourSetLimitedSpending: 100,
  },
  {
    adsName: "TKQC Quynh Ly",
    adsCurrency: "USD",
    liveStatus: "active", // inactive
    adsId: 4176574772593535,
    adsRootId: 61550542352732,
    balance: 0,
    limitPerDay: 50, // by USD
    totalSpend: 100,
    adsRole: "admin",
    paymentMethod: {
      card_number: 5594639130219054,
      card_type: "Mastercard",
    },
    billCreateTime: "23-10-2025",
    suspiciousReason: "None",
    adsCreatedTime: "01-10-2025",
    createdFrom: {
      id_bm: "2246401279158469",
    },
    adsType: "bussiness", // Personal
    timezone: {
      country: "America/New_York",
      gmt_zone: "-4",
    },
    adsCountry: "VN",
    note: "",
    yourSetLimitedSpending: 100,
  },
];
