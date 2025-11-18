import React, { useState, useEffect } from "react";
import classNames from "classnames/bind";
import styles from "./AdsAccountManagement.module.scss";
const cx = classNames.bind(styles);
import { FaCircle } from "react-icons/fa";
import { IoIosArrowDropleft } from "react-icons/io";
import { IoIosArrowDropright } from "react-icons/io";
import { MdInsertChart } from "react-icons/md";
import { CgDesktop } from "react-icons/cg";
import adsIcon from "../../../../assets/adsIcon.svg";
import { FaCcMastercard } from "react-icons/fa6";
import { FaCcVisa } from "react-icons/fa";
import mastercardIcon from "../../../../assets/mastercardIcon.svg";
import { useAdsAccountStore, type AdsAccountType } from "../../../../zustand/adsAccountStore";
import { useAuthStore } from "../../../../zustand/authStore";
import axiosApiCall from "../../../../zustand/axiosApiClient";

const iconSize = 20;

interface UserSocialInfoType {
  _id: string;
  name: string;
  email?: string;
  platform_id: string;
  platform: string;
}

export default function AdsAccountManagement() {
  const { adsAccounts, loading, fetchAdsAccounts, fetchAndSaveAdsAccounts, updateAdsAccount, fetchFacebookUser, facebookUser } = useAdsAccountStore();
  const [activeTable, setActiveTable] = useState("personal-ads-acc");
  const [menuCollapsed, setMenuCollapsed] = useState(false);
  const [selectedUserSocialId, setSelectedUserSocialId] = useState<string | null>(null);
  const [facebookUsers, setFacebookUsers] = useState<UserSocialInfoType[]>([]);

  // Fetch Facebook users (UserSocialInfo) for the company
  useEffect(() => {
    const loadFacebookUsers = async () => {
      const result = await fetchFacebookUser();
      if (result.status === "success") {
        console.log("Facebook users loaded successfully:", result.message);
      } else {
        console.error("Failed to load Facebook users:", result.message);
      }
    };
    loadFacebookUsers();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []); // Only run once on mount

  // Update local state when facebookUser from store changes
  useEffect(() => {
    console.log('facebookUser updated in store:', facebookUser);
    if (facebookUser && facebookUser.length > 0) {
      setFacebookUsers(facebookUser);
      // Auto-select first user if none is selected
      if (!selectedUserSocialId) {
        setSelectedUserSocialId(facebookUser[0]._id);
      }
    } else {
      setFacebookUsers([]);
    }
  }, [facebookUser, selectedUserSocialId]);

  // Fetch ads accounts when user is selected
  useEffect(() => {
    if (selectedUserSocialId) {
      fetchAdsAccounts(selectedUserSocialId);
    }
  }, [selectedUserSocialId, fetchAdsAccounts]);

  // Handle refresh data from Facebook
  const handleRefreshData = async () => {
    if (!selectedUserSocialId) {
      alert("Vui lòng chọn Facebook user trước khi refresh dữ liệu.");
      return;
    }

    const result = await fetchAndSaveAdsAccounts(selectedUserSocialId);
    if (result.status === "success") {
      alert(`✅ Đã cập nhật ${result.data?.total || 0} tài khoản quảng cáo`);
    } else {
      alert(`❌ Lỗi: ${result.message || "Không thể cập nhật dữ liệu"}`);
    }
  };

  // Format account status
  const getAccountStatus = (status: number): { text: string; color: string; isActive: boolean } => {
    // Facebook account_status: 1 = ACTIVE, 2 = DISABLED, 3 = UNSETTLED, 7 = PENDING_RISK_REVIEW, etc.
    if (status === 1) {
      return { text: "ACTIVE", color: "#1dad00", isActive: true };
    } else if (status === 2) {
      return { text: "DISABLED", color: "#eb0000", isActive: false };
    } else if (status === 3) {
      return { text: "UNSETTLED", color: "#ffa500", isActive: false };
    } else if (status === 7) {
      return { text: "PENDING_REVIEW", color: "#ffa500", isActive: false };
    } else {
      return { text: "UNKNOWN", color: "#7e7e7e", isActive: false };
    }
  };

  // Format date
  const formatDate = (dateString?: string): string => {
    if (!dateString) return "N/A";
    try {
      const date = new Date(dateString);
      return date.toLocaleDateString("vi-VN", { year: "numeric", month: "2-digit", day: "2-digit" });
    } catch {
      return dateString;
    }
  };

  // Get payment card info from funding source
  const getPaymentInfo = (account: AdsAccountType): { card_type?: string; card_number?: string } => {
    // Try to extract card info from funding_source_details
    const fundingDetails = account.funding_source_details;
    if (fundingDetails?.display_string) {
      // Example: "Available Balance (₫0 VND)" or "Card ending in 1234"
      const display = fundingDetails.display_string;
      if (display.includes("Mastercard") || display.toLowerCase().includes("master")) {
        return { card_type: "Mastercard" };
      } else if (display.includes("Visa") || display.toLowerCase().includes("visa")) {
        return { card_type: "Visa" };
      }
    }
    return {};
  };

  // Filter ads accounts by type (personal vs business)
  const filteredAdsAccounts = adsAccounts.filter((account) => {
    if (activeTable === "personal-ads-acc") {
      // Personal accounts: no business or business.id equals owner (self-owned)
      return !account.business || account.business.id === account.owner;
    } else if (activeTable === "bussiness-acc") {
      // Business accounts: has business and business.id !== owner (BM-owned)
      return account.business && account.business.id !== account.owner;
    }
    return true;
  });

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
            <div style={{ display: "flex", gap: 10, alignItems: "center", marginLeft: 20 }}>
              {/* Facebook User Selection */}
              {facebookUsers.length > 0 && (
                <select
                  value={selectedUserSocialId || ""}
                  onChange={(e) => setSelectedUserSocialId(e.target.value)}
                  style={{
                    padding: "6px 12px",
                    borderRadius: 6,
                    border: "1px solid #ddd",
                    fontSize: 14,
                    cursor: "pointer",
                  }}
                >
                  <option value="">Chọn Facebook user</option>
                  {facebookUsers.map((user) => (
                    <option key={user._id} value={user._id}>
                      {user.name} ({user.email || user.platform_id})
                    </option>
                  ))}
                </select>
              )}
              <button>Update ads account</button>
              <button onClick={handleRefreshData} disabled={loading || !selectedUserSocialId}>
                {loading ? "Đang tải..." : "Refresh new data"}
              </button>
            </div>
          </div>
          <div className={cx("header-right")}>
            <div className={cx("header-actions")}>{/* Action buttons */}</div>
          </div>
        </div>
        <div className={cx("content")}>
          {loading && (
            <div style={{ padding: 40, textAlign: "center", color: "#999" }}>
              Đang tải dữ liệu...
            </div>
          )}
          {!loading && filteredAdsAccounts.length === 0 && (
            <div style={{ padding: 40, textAlign: "center", color: "#999" }}>
              {selectedUserSocialId
                ? "Không có tài khoản quảng cáo nào. Nhấn 'Refresh new data' để tải dữ liệu từ Facebook."
                : "Vui lòng chọn Facebook user để xem tài khoản quảng cáo."}
            </div>
          )}
          {!loading && filteredAdsAccounts.length > 0 && (
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
                  {filteredAdsAccounts.map((account, i) => {
                    const status = getAccountStatus(account.account_status);
                    const paymentInfo = getPaymentInfo(account);
                    const shortPaymentCardNumber = account.funding_source_details?.display_string
                      ?.match(/\d{4}/g)
                      ?.slice(-1)[0] || "****";

                    return (
                      <div className={cx("table-row")} key={account._id || i}>
                        <div className={cx("table-cell", "account-name")}>
                          <div style={{ fontWeight: 550, fontSize: 15 }}>{account.name}</div>
                          <div style={{ color: "#7e7e7e" }}>{account.account_id}</div>
                        </div>
                        <div className={cx("table-cell")} style={{ color: status.color, fontWeight: 550 }}>
                          <FaCircle color={status.color} size={10} style={{ marginRight: 6 }} /> {status.text}
                        </div>
                        <div className={cx("table-cell")}>{account.facebook_id}</div>
                        <div className={cx("table-cell")}>
                          {parseFloat(account.balance || "0").toLocaleString("vi-VN")} {account.currency}
                        </div>
                        <div className={cx("table-cell")}>
                          {parseFloat(account.spend_cap || "0").toLocaleString("vi-VN")} {account.currency}
                        </div>
                        <div className={cx("table-cell")}>
                          {(parseFloat(account.spend_cap || "0") - parseFloat(account.amount_spent || "0")).toLocaleString("vi-VN")} {account.currency}
                        </div>
                        <div className={cx("table-cell")}>
                          {account.min_daily_budget ? account.min_daily_budget.toLocaleString("vi-VN") : "N/A"} {account.currency}
                        </div>
                        <div className={cx("table-cell")}>
                          {parseFloat(account.amount_spent || "0").toLocaleString("vi-VN")} {account.currency}
                        </div>
                        <div className={cx("table-cell")}>{account.note || ""}</div>
                        <div className={cx("table-cell")}>{account.currency}</div>
                        <div className={cx("table-cell")}>{account.adsRole || "N/A"}</div>
                        <div className={cx("table-cell")}>
                          {account.yourSetLimitedSpending ? account.yourSetLimitedSpending.toLocaleString("vi-VN") : "N/A"} {account.currency}
                        </div>
                        <div className={cx("table-cell")}>
                          {paymentInfo.card_type === "Mastercard" && <img src={mastercardIcon} alt="mastercard" />}
                          {paymentInfo.card_type === "Visa" && <FaCcVisa size={24} />}
                          {paymentInfo.card_type && <span>-{shortPaymentCardNumber}</span>}
                          {!paymentInfo.card_type && account.funding_source_details?.display_string && (
                            <span style={{ fontSize: 12 }}>{account.funding_source_details.display_string}</span>
                          )}
                        </div>
                        <div className={cx("table-cell")}>
                          {account.last_synced ? formatDate(account.last_synced) : "N/A"}
                        </div>
                        <div className={cx("table-cell")}>
                          {account.disable_reason === 0 ? "None" : `Reason: ${account.disable_reason}`}
                        </div>
                        <div className={cx("table-cell")}>{formatDate(account.created_time)}</div>
                        <div className={cx("table-cell")}>
                          {account.business && account.business.id !== account.owner ? "Business" : "Personal"}
                        </div>
                        <div className={cx("table-cell")}>{account.timezone_name || "N/A"}</div>
                        <div className={cx("table-cell")}>{account.business?.id || account.owner || "N/A"}</div>
                        <div className={cx("table-cell")}>{account.business_country_code || "N/A"}</div>
                      </div>
                    );
                  })}
                </div>
              </div>
            </div>
          )}
        </div>

        <div className={cx("footer")}></div>
      </div>
    </div>
  );
}
