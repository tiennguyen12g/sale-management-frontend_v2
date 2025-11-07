import React, { useState, useEffect, useMemo } from "react";
import classNames from "classnames/bind";
import styles from "./CombineShop.module.scss";
import { FaShop, FaXmark, FaBuilding } from "react-icons/fa6";
import { FaSquareFacebook } from "react-icons/fa6";
import { SiShopee } from "react-icons/si";
import { AiFillTikTok } from "react-icons/ai";
import { type IBranch, type PlatformName } from "../../zustand/branchStore";

const cx = classNames.bind(styles);

interface CombineShopProps {
  isOpen: boolean;
  onClose: () => void;
  branches: IBranch[];
  editingGroupId?: string | null;
  editingGroupName?: string;
  onSave: (groupName: string, selectedBranchIds: string[], branchId?: string | null) => Promise<void>;
}

export default function CombineShop({
  isOpen,
  onClose,
  branches,
  editingGroupId = null,
  editingGroupName = "",
  onSave,
}: CombineShopProps) {
  const [groupName, setGroupName] = useState("");
  const [selectedBranchIds, setSelectedBranchIds] = useState<string[]>([]);
  const [loading, setLoading] = useState(false);

  // Get available branches to combine - only branches of type "shop" that are not archived
  const availableBranches = useMemo(() => {
    return branches.filter((branch) => branch.type === "shop" && !branch.archived);
  }, [branches]);

  useEffect(() => {
    if (isOpen) {
      if (editingGroupId && editingGroupName) {
        // Editing mode - TODO: Load branch details to get its shops
        setGroupName(editingGroupName);
        setSelectedBranchIds([]);
      } else {
        // Creating new group
        setGroupName("");
        setSelectedBranchIds([]);
      }
    }
  }, [isOpen, editingGroupId, editingGroupName]);

  const handleBranchToggle = (branchId: string) => {
    setSelectedBranchIds((prev) =>
      prev.includes(branchId) ? prev.filter((id) => id !== branchId) : [...prev, branchId]
    );
  };

  const handleSelectAll = () => {
    if (selectedBranchIds.length === availableBranches.length) {
      setSelectedBranchIds([]);
    } else {
      setSelectedBranchIds(availableBranches.map((branch) => branch._id));
    }
  };

  const handleSave = async () => {
    if (!groupName.trim()) {
      alert("Vui lòng nhập tên chi nhánh");
      return;
    }

    if (selectedBranchIds.length === 0) {
      alert("Vui lòng chọn ít nhất một chi nhánh");
      return;
    }

    setLoading(true);
    try {
      await onSave(groupName.trim(), selectedBranchIds, editingGroupId);
      onClose();
      setGroupName("");
      setSelectedBranchIds([]);
    } catch (error) {
      console.error("Error saving branch:", error);
      alert("Có lỗi xảy ra khi lưu chi nhánh");
    } finally {
      setLoading(false);
    }
  };

  const handleRemoveBranch = (branchId: string) => {
    setSelectedBranchIds((prev) => prev.filter((id) => id !== branchId));
  };

  const getPlatformIcon = (platform?: PlatformName) => {
    switch (platform) {
      case "facebook":
        return <FaSquareFacebook className={cx("platform-icon")} />;
      case "shopee":
        return <SiShopee className={cx("platform-icon")} />;
      case "tiktok":
        return <AiFillTikTok className={cx("platform-icon")} />;
      default:
        return <FaShop className={cx("platform-icon")} />;
    }
  };

  if (!isOpen) return null;

  return (
    <div className={cx("modal-overlay")} onClick={onClose}>
      <div className={cx("modal-content")} onClick={(e) => e.stopPropagation()}>
        <div className={cx("modal-header")}>
          <h2 className={cx("modal-title")}>
            {editingGroupId ? "Chỉnh sửa chi nhánh" : "Gộp chi nhánh"}
          </h2>
          <button className={cx("close-btn")} onClick={onClose}>
            <FaXmark />
          </button>
        </div>

        <div className={cx("modal-body")}>
          {/* Group Name Input */}
          <div className={cx("form-group")}>
            <label className={cx("form-label")}>Tên chi nhánh *</label>
            <input
              type="text"
              className={cx("form-input")}
              value={groupName}
              onChange={(e) => setGroupName(e.target.value)}
              placeholder="Nhập tên chi nhánh (ví dụ: Quần áo, Đồ điện tử...)"
            />
          </div>

          {/* Selected Branches Preview */}
          {selectedBranchIds.length > 0 && (
            <div className={cx("selected-shops-section")}>
              <label className={cx("form-label")}>
                Chi nhánh đã chọn ({selectedBranchIds.length})
              </label>
              <div className={cx("selected-shops-list")}>
                {selectedBranchIds.map((branchId) => {
                  const branch = availableBranches.find((b) => b._id === branchId);
                  if (!branch) return null;
                  return (
                    <div key={branchId} className={cx("selected-shop-item")}>
                      <div className={cx("selected-shop-info")}>
                        {getPlatformIcon(branch.platform)}
                        <span className={cx("selected-shop-name")}>{branch.display_name}</span>
                        <span className={cx("selected-shop-id")}>
                          ({branch.list_attach_shop.length} shops)
                        </span>
                      </div>
                      <button
                        className={cx("remove-btn")}
                        onClick={() => handleRemoveBranch(branchId)}
                        type="button"
                      >
                        <FaXmark />
                      </button>
                    </div>
                  );
                })}
              </div>
            </div>
          )}

          {/* Available Branches List */}
          <div className={cx("available-shops-section")}>
            <div className={cx("shops-header")}>
              <label className={cx("form-label")}>
                Chọn chi nhánh để gộp ({availableBranches.length} chi nhánh có sẵn)
              </label>
              <button className={cx("select-all-btn")} onClick={handleSelectAll} type="button">
                {selectedBranchIds.length === availableBranches.length ? "Bỏ chọn tất cả" : "Chọn tất cả"}
              </button>
            </div>

            {availableBranches.length === 0 ? (
              <div className={cx("empty-shops")}>
                Không còn chi nhánh nào để gộp. Tất cả chi nhánh đã được gộp vào nhóm.
              </div>
            ) : (
              <div className={cx("shops-list")}>
                {availableBranches.map((branch) => {
                  const isSelected = selectedBranchIds.includes(branch._id);
                  return (
                    <div
                      key={branch._id}
                      className={cx("shop-item", { selected: isSelected })}
                      onClick={() => handleBranchToggle(branch._id)}
                    >
                      <div className={cx("shop-checkbox")}>
                        <input
                          type="checkbox"
                          checked={isSelected}
                          onChange={() => handleBranchToggle(branch._id)}
                          onClick={(e) => e.stopPropagation()}
                        />
                      </div>
                      <div className={cx("shop-avatar-small")}>
                        {branch.list_attach_shop?.[0]?.avatar ? (
                          <img src={branch.list_attach_shop[0].avatar} alt={branch.display_name} />
                        ) : (
                          <FaShop className={cx("avatar-placeholder-small")} />
                        )}
                      </div>
                      <div className={cx("shop-details-item")}>
                        <div className={cx("shop-name-item")}>
                          {getPlatformIcon(branch.platform)}
                          <span>{branch.display_name}</span>
                        </div>
                        <div className={cx("shop-meta")}>
                          <span className={cx("shop-id-item")}>
                            {branch.list_attach_shop.length} {branch.list_attach_shop.length === 1 ? 'shop' : 'shops'}
                          </span>
                          <div className={cx("shop-company-item")}>
                            {getPlatformIcon(branch.platform)}
                            <span>{branch.platform}</span>
                          </div>
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </div>
        </div>

        <div className={cx("modal-footer")}>
          <button className={cx("cancel-btn")} onClick={onClose} disabled={loading}>
            Hủy
          </button>
          <button
            className={cx("save-btn")}
            onClick={handleSave}
            disabled={loading || !groupName.trim() || selectedBranchIds.length === 0}
          >
            {loading ? "Đang lưu..." : editingGroupId ? "Cập nhật" : "Tạo chi nhánh"}
          </button>
        </div>
      </div>
    </div>
  );
}
