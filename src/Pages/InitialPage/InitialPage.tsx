import React, { useState, useEffect } from "react";
import classNames from "classnames/bind";
import styles from "./InitialPage.module.scss";
const cx = classNames.bind(styles);
// Hooks
import { useAuthStore } from "@/zustand/authStore";
import { useFacebookStore } from "@/zustand/facebookStore";
import { useStaffStore } from "@/zustand/staffStore";
import { useBranchStore } from "@/zustand/branchStore";
import { useMainMenuStore } from "@/zustand/mainMenuCollapsed";
// Types
import { type IBranch, type IBranchForStaff } from "@/zustand/branchStore";
// Components
import CombineShop from "./CombineShop";
import TableInvitation from "../SettingPage/TableInvitation";
// Libraries
import { useNavigate } from "react-router-dom";
// Icons
import { FaSquareFacebook, FaShop, FaBuilding } from "react-icons/fa6";
import { SiShopee } from "react-icons/si";
import { AiFillTikTok } from "react-icons/ai";
import { TbWorldPlus } from "react-icons/tb";
import { FaEdit } from "react-icons/fa";
// Utils


export default function InitialPage() {
  const { user, company, logout, yourStaffId, accessRole, setUpdateAccessRole } = useAuthStore();
  const { user: facebookUser, setUser, setPages, clearFacebookData, saveFacebookUser } = useFacebookStore();
  const { fetchYourStaffProfileInWorkplace } = useStaffStore();
  const { branches, list_branch_management, fetchBranchSettings, setUpdateSelectedBranch, fetchBranches } = useBranchStore();
  const { setOpenMenu } = useMainMenuStore();

  const [ownedShops, setOwnedShops] = useState<IBranch[]>([]);
  const [staffShops, setStaffShops] = useState<IBranchForStaff[]>([]);
  const [loading, setLoading] = useState(true);
  const [showCombineModal, setShowCombineModal] = useState(false);
  const [editingGroupId, setEditingGroupId] = useState<string | null>(null);
  const [editingGroupName, setEditingGroupName] = useState("");

  const navigate = useNavigate();

  useEffect(() => {
    // TODO: Replace with actual API calls
    // fetchOwnedShops().then(setOwnedShops)
    // fetchStaffShops().then(setStaffShops)
    if (branches) {
      setOwnedShops(branches);
    }
    if (list_branch_management) {
      setStaffShops(list_branch_management);
    }

    setLoading(false);
  }, [branches, list_branch_management]);

  useEffect(() => {
    const loadBranches = async () => {
      const result = await fetchBranches();
      if (result.status === "success") {
        console.log("✅ Branches loaded successfully");
      } else {
        console.error("❌ Failed to load branches:", result?.message);
      }
    };
    loadBranches();
  }, [fetchBranches]);
  const handleBranchSelect = (branch: IBranch | IBranchForStaff) => {
    console.log("company", company);
    if (branch.company_id === company?._id) {
      setUpdateAccessRole("Director");
    } else {
      if (yourStaffId) {
        fetchYourStaffProfileInWorkplace(yourStaffId, branch.company_id);
      }
      setUpdateAccessRole("Sale-Staff");
    }
    // Store selected branch (automatically persisted by Zustand)
    setUpdateSelectedBranch(branch);
    // TODO: Fetch branch settings and staff info for this branch

    fetchBranchSettings(branch._id, branch.company_id);
    // TODO: Navigate based on user role
    console.log("Selected branch:", branch);
    navigate("/profile-in-company");
    setOpenMenu("user-page");
  };

  const handleSocialConnect = (platform: "facebook" | "shopee" | "tiktok") => {
    switch (platform) {
      case "facebook":
        setLoading(true);
        // Use existing Facebook login
        if (!window.FB) {
          alert("Facebook SDK chưa sẵn sàng. Vui lòng thử lại sau.");
          return;
        }

        window.FB.login(
          function (response: any) {
            if (response.authResponse) {
              const userAccessToken = response.authResponse.accessToken;

              window.FB.api("/me", { fields: "id,name,email,picture" }, async function (profile: any) {
                const userData = { ...profile, userAccessToken: userAccessToken };
                setUser(userData);
                console.log("👤 User:", userData);

                //✅ Fetch pages and save user using store methods
                // const pageRes = await fetchFacebookPages(userAccessToken);
                // if (pageRes.status === "success" && pageRes.data) {
                //   setPages(pageRes.data);
                // }

                await saveFacebookUser(userData);

                setLoading(false);
              });
            } else {
              console.log("❌ User cancelled login or did not fully authorize.");
              setLoading(false);
            }
          },
          { scope: "public_profile,email,pages_show_list,pages_read_engagement,pages_manage_metadata,pages_messaging" }
        );
        break;
      case "shopee":
        // TODO: Implement Shopee OAuth
        alert("Tính năng kết nối Shopee đang được phát triển");
        break;
      case "tiktok":
        // TODO: Implement TikTok OAuth
        alert("Tính năng kết nối TikTok đang được phát triển");
        break;
    }
  };

  const getPlatformIcon = (platform?: string) => {
    switch (platform) {
      case "facebook":
        return <FaSquareFacebook className={cx("")} color="var(--facebook-icon-color)" />;
      case "shopee":
        return <SiShopee className={cx("platform-icon")} />;
      case "tiktok":
        return <AiFillTikTok className={cx("")} color="var(--tiktok-icon-color)" />;
      default:
        return <FaShop className={cx("platform-icon")} />;
    }
  };

  const handleLogout = (platform: string) => {
    switch (platform) {
      case "facebook":
        console.log("Logging out from Facebook...");
        clearFacebookData();
        break;
      case "tiktok":
        break;
      case "shopee":
        break;
      default:
        break;
    }
  };

  const handleOpenCombineModal = () => {
    setEditingGroupId(null);
    setEditingGroupName("");
    setShowCombineModal(true);
  };

  const handleEditBranch = (branch: IBranch, e: React.MouseEvent) => {
    e.stopPropagation(); // Prevent card click
    setEditingGroupId(branch._id);
    setEditingGroupName(branch.display_name || "");
    setShowCombineModal(true);
  };

  const handleSaveBranch = async (groupName: string, selectedBranchIds: string[], branchId?: string | null) => {
    // TODO: Replace with actual API call
    console.log("Saving branch:", { groupName, selectedBranchIds, branchId });

    // TODO: Call API to create/update branch
    // await axiosApiCall.post('/branches/combine', { displayName: groupName, branchIds: selectedBranchIds, branchId });

    // TODO: Refresh branches from API after successful save
    // const updatedBranches = await fetchBranches();
    // setOwnedShops(updatedBranches);
  };

  // Separate branches by type: individual shops vs groups
  const individualBranches = ownedShops.filter((branch) => branch.type === "shop");
  const groupBranches = ownedShops.filter((branch) => branch.type === "group");

  return (
    <div className={cx("main")}>
      <div className={cx("container")}>
        <header className={cx("header")}>
          <h1 className={cx("title")}>
            Chào mừng, {user?.username || "User"}!{" "}
            <button
              onClick={() => {
                logout();
                navigate("/login");
              }}
            >
              Logout
            </button>
          </h1>
          <p className={cx("subtitle")}>Chọn shop hoặc kết nối tài khoản để bắt đầu</p>
        </header>

        {/* Social Media Connections Section */}
        <section className={cx("section", "connect-section")}>
          <div className={cx("section-header")}>
            <h2 className={cx("section-title")}>
              <TbWorldPlus className={cx("section-icon")} />
              Kết nối tài khoản
            </h2>
            <p className={cx("section-description")}>Kết nối các nền tảng để quản lý shop và đơn hàng</p>
          </div>

          <div className={cx("connect-buttons")}>
            <div className={cx("connect-btn", { connected: !!facebookUser })} onClick={() => handleSocialConnect("facebook")}>
              <FaSquareFacebook className={cx("connect-icon")} color="var(--facebook-icon-color)" />
              <div className={cx("connect-info")}>
                <span className={cx("connect-label")}>Facebook</span>
                {facebookUser ? (
                  //   <span className={cx("connect-status", "connected")}>Đã kết nối {pages.length > 0 && `(${pages.length} trang)`}</span>
                  <div className={cx("socialConnectedBox")}>
                    <div className={cx("socialInfo")}>
                      <img src={facebookUser.picture?.data.url} alt={facebookUser.name} className={cx("avatar")} />
                      <div>
                        <strong>{facebookUser.name}</strong>
                        <div>{facebookUser.email || "No email"}</div>
                      </div>
                    </div>
                    <button onClick={() => handleLogout("facebook")} className={cx("logoutBtn")}>
                      Thoát
                    </button>
                  </div>
                ) : (
                  <span className={cx("connect-status")}>Chưa kết nối</span>
                )}
              </div>
            </div>

            <button className={cx("connect-btn")} onClick={() => handleSocialConnect("shopee")}>
              <SiShopee className={cx("connect-icon")} color="var(--shopee-icon-color)" />
              <div className={cx("connect-info")}>
                <span className={cx("connect-label")}>Shopee</span>
                <span className={cx("connect-status")}>Chưa kết nối</span>
              </div>
            </button>

            <button className={cx("connect-btn")} onClick={() => handleSocialConnect("tiktok")}>
              <AiFillTikTok className={cx("connect-icon")} color="var(--tiktok-icon-color)" />
              <div className={cx("connect-info")}>
                <span className={cx("connect-label")}>TikTok</span>
                <span className={cx("connect-status")}>Chưa kết nối</span>
              </div>
            </button>
          </div>
        </section>

        <section>
          <TableInvitation />
        </section>

        {/* Owned Shops Section */}
        {ownedShops.length > 0 && (
          <section className={cx("section", "shops-section")}>
            <div className={cx("section-header")}>
              <div>
                <h2 className={cx("section-title")}>
                  <FaShop className={cx("section-icon")} />
                  Shop của bạn
                </h2>
                <p className={cx("section-description")}>Các shop và nhóm shop mà bạn sở hữu</p>
              </div>
              <div>
                <button className={cx("normal-button")} onClick={handleOpenCombineModal}>
                  Gộp shop
                </button>
              </div>
            </div>

            <div className={cx("shops-grid")}>
              {loading ? (
                <div className={cx("loading")}>Đang tải...</div>
              ) : (
                <div className={cx("shops-lists")}>
                  {individualBranches.length > 0 && (
                    <div className={cx("shops-category")}>
                      <h4 className={cx("category-title")}>Chi nhánh đơn</h4>
                      <div className={cx("alone-shops-grid")}>
                        {individualBranches.map((branch) => (
                          <div key={branch._id} className={cx("shop-card")} onClick={() => handleBranchSelect(branch)}>
                            <div className={cx("shop-avatar")}>
                              {branch.list_attach_shop?.[0]?.avatar ? (
                                <img src={branch.list_attach_shop[0].avatar} alt={branch.display_name} />
                              ) : (
                                <FaShop className={cx("avatar-placeholder")} />
                              )}
                            </div>
                            <div className={cx("shop-info")}>
                              <h3 className={cx("shop-name")}>
                                {getPlatformIcon(branch.platform)} {branch.display_name}
                              </h3>
                              <div className={cx("shop-details")}>
                                <span className={cx("shop-id")}>
                                  {branch.list_attach_shop.length} {branch.list_attach_shop.length === 1 ? "shop" : "shops"}
                                </span>
                                {/* {company && (
                                  <div className={cx("shop-company")}>
                                    <FaBuilding className={cx("company-icon")} />
                                    <span>{company.company_name}</span>
                                  </div>
                                )} */}

                                {user && (
                                  <div className={cx("shop-company")}>
                                    <FaBuilding className={cx("company-icon")} />
                                    <span>{user.username} company</span>
                                  </div>
                                )}
                              </div>
                              <div className={cx("shop-badge", "owner")}>Chủ sở hữu</div>
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}

                  {groupBranches.length > 0 && (
                    <div className={cx("shops-category")}>
                      <h4 className={cx("category-title")}>Chi nhánh nhóm</h4>
                      {groupBranches.map((branch) => (
                        <div key={branch._id} className={cx("group-container")}>
                          <div className={cx("group-header")}>
                            <h5 className={cx("group-name-title")}>{branch.display_name}</h5>
                            <button className={cx("edit-group-btn")} onClick={(e) => handleEditBranch(branch, e)} title="Chỉnh sửa chi nhánh">
                              <FaEdit />
                              <span>Chỉnh sửa</span>
                            </button>
                          </div>
                          <div className={cx("group-shops-grid")}>
                            {branch.list_attach_shop.map((shop, index) => (
                              <div key={`${shop.shop_id}-${index}`} className={cx("group-shop-card")}>
                                <div className={cx("shop-avatar")}>
                                  {shop.avatar ? <img src={shop.avatar} alt={shop.store_name} /> : <FaShop className={cx("avatar-placeholder")} />}
                                </div>
                                <div className={cx("shop-info")}>
                                  <h3 className={cx("shop-name")}>
                                    {getPlatformIcon(shop.platform)} {shop.store_name}
                                  </h3>
                                  <div className={cx("shop-details")}>
                                    <span className={cx("shop-id")}>ID: {shop.platform_id}</span>
                                    <div className={cx("shop-company")}>
                                      {getPlatformIcon(shop.platform)}
                                      <span>{shop.platform}</span>
                                    </div>
                                  </div>
                                </div>
                              </div>
                            ))}
                          </div>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              )}
            </div>
          </section>
        )}

        {/* Staff/Manager Shops Section */}
        {staffShops.length > 0 && (
          <section className={cx("section", "shops-section", "staff-section")}>
            <div className={cx("section-header")}>
              <h2 className={cx("section-title")}>
                <FaBuilding className={cx("section-icon")} />
                Chi nhánh bạn làm việc
              </h2>
              <p className={cx("section-description")}>Các chi nhánh bạn có quyền truy cập</p>
            </div>

            <div className={cx("staff-shops-grid")}>
              {loading ? (
                <div className={cx("loading")}>Đang tải...</div>
              ) : (
                staffShops.map((branch) => (
                  <div key={branch._id} className={cx("shop-card", "staff-card")} onClick={() => handleBranchSelect(branch)}>
                    <div className={cx("shop-avatar")}>
                      {branch.list_attach_shop?.[0]?.avatar ? (
                        <img src={branch.list_attach_shop[0].avatar} alt={branch.display_name} />
                      ) : (
                        <FaShop className={cx("avatar-placeholder")} />
                      )}
                    </div>
                    <div className={cx("shop-info")}>
                      <h3 className={cx("shop-name")}>
                        {getPlatformIcon(branch.platform)} {branch.display_name}
                      </h3>
                      <div className={cx("shop-details")}>
                        <div>
                          <span className={cx("shop-id")}>
                            {branch.list_attach_shop.length} {branch.list_attach_shop.length === 1 ? "shop" : "shops"}
                          </span>
                        </div>

                        <div className={cx("shop-company")}>
                          <FaBuilding className={cx("company-icon")} />
                          <span>{branch.company_name || "Company"} </span>
                        </div>
                      </div>
                      <div className={cx("shop-badge", branch.role)}>{branch.role === "Manager" ? "Quản lý" : "Nhân viên"}</div>
                    </div>
                  </div>
                ))
              )}
            </div>
          </section>
        )}

        {/* Empty State */}
        {!loading && ownedShops.length === 0 && staffShops.length === 0 && (
          <div className={cx("empty-state")}>
            <FaShop className={cx("empty-icon")} />
            <h3 className={cx("empty-title")}>Chưa có shop nào</h3>
            <p className={cx("empty-description")}>Kết nối tài khoản hoặc tạo shop mới để bắt đầu</p>
          </div>
        )}

        {/* Combine Shop Modal */}
        <CombineShop
          isOpen={showCombineModal}
          onClose={() => setShowCombineModal(false)}
          branches={ownedShops}
          editingGroupId={editingGroupId}
          editingGroupName={editingGroupName}
          onSave={handleSaveBranch}
        />
      </div>
    </div>
  );
}

declare global {
  interface Window {
    FB: any;
  }
}
