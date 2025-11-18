import { useState, useEffect, useRef, useCallback } from "react";
import classNames from "classnames/bind";
import styles from "./Invitation.module.scss";
const cx = classNames.bind(styles);
import { useInvitationStore } from "../../zustand/invitationStore";
import { useBranchStore } from "../../zustand/branchStore";
import type { StaffRole } from "../../zustand/staffStore";
import { FaTimesCircle } from "react-icons/fa";
import { AddButton, Search, ButtonCommon, SelectGray } from "@tnbt/react-favorit-style";
import { useTranslation } from "react-i18next";
export default function Invitation() {
  const [showBoxSendInvitation, setShowBoxSendInvitation] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedBranch, setSelectedBranch] = useState<string>("");
  const [selectedRole, setSelectedRole] = useState<StaffRole>("Sale-Staff");
  const [note, setNote] = useState("");
  const [message, setMessage] = useState<string | null>(null);
  const searchTimeoutRef = useRef<NodeJS.Timeout | null>(null);
  const isSearchingRef = useRef(false);
  const searchInputRef = useRef<HTMLInputElement | null>(null);
  const { t } = useTranslation();

  const { searchStaff, createInvitation, searchedStaff, loading, updateSearchedStaff } = useInvitationStore();
  const { branches } = useBranchStore();

  // Internal search function that accepts a value parameter
  const handleSearchWithValue = useCallback(
    async (queryValue?: string) => {
      // Prevent multiple simultaneous searches
      if (isSearchingRef.current || loading) {
        return;
      }

      // Use provided value or fall back to state
      const trimmedQuery = (queryValue || searchQuery).trim();

      // Check if query is empty
      if (!trimmedQuery) {
        alert("Please enter staff ID or email");
        return;
      }

      // Minimum length check to prevent too many queries
      if (trimmedQuery.length < 3) {
        setMessage("Please enter at least 3 characters");
        return;
      }

      isSearchingRef.current = true;
      setMessage(null);

      try {
        const result = await searchStaff(trimmedQuery);
        if (result && result.status === "failed") {
          setMessage(result.message);
        }
      } finally {
        isSearchingRef.current = false;
      }
    },
    [searchQuery, searchStaff, loading]
  );

  // Public search handler (uses state)
  const handleSearch = useCallback(() => {
    handleSearchWithValue();
  }, [handleSearchWithValue]);

  // Reset search when modal closes
  useEffect(() => {
    if (!showBoxSendInvitation) {
      setSearchQuery("");
      updateSearchedStaff(null);
      setMessage(null);
      // Clear any pending search
      if (searchTimeoutRef.current) {
        clearTimeout(searchTimeoutRef.current);
        searchTimeoutRef.current = null;
      }
      isSearchingRef.current = false;
    }
  }, [showBoxSendInvitation, updateSearchedStaff]);

  // Handle Enter key on search input
  useEffect(() => {
    if (!showBoxSendInvitation) return;

    const handleKeyDown = (e: KeyboardEvent) => {
      // Check if the active element is an input in the search section
      const activeElement = document.activeElement as HTMLInputElement;
      if (activeElement && activeElement.tagName === "INPUT" && e.key === "Enter") {
        // Check if it's within our search section
        const searchSection = document.querySelector(`.${cx("search-section")}`);
        if (searchSection && searchSection.contains(activeElement)) {
          e.preventDefault();
          // Read value directly from input element to avoid state timing issues
          const inputValue = activeElement.value?.trim() || "";
          // Update state for display, then search directly with the input value
          setSearchQuery(inputValue);
          handleSearchWithValue(inputValue);
        }
      }
    };

    window.addEventListener("keydown", handleKeyDown);
    return () => {
      window.removeEventListener("keydown", handleKeyDown);
    };
  }, [showBoxSendInvitation, handleSearchWithValue]);

  // Handle search input change with debounce (only for display, not API calls)
  const handleSearchChange = (value: string) => {
    setSearchQuery(value);
    setMessage(null);

    // Clear previous timeout
    if (searchTimeoutRef.current) {
      clearTimeout(searchTimeoutRef.current);
    }

    // Don't auto-search on change - only update the input value
    // User must click Search button or press Enter to trigger search
  };

  const handleSendInvitation = async () => {
    if (!searchedStaff) {
      alert("Please search for a staff first");
      return;
    }
    if (!selectedBranch) {
      alert("Please select a branch");
      return;
    }

    const result = await createInvitation(selectedBranch, selectedRole, searchedStaff.staffID, searchedStaff.email, searchedStaff.name, note);

    if (result?.status === "success") {
      alert(result.message);
      // Reset form
      setSearchQuery("");
      setSelectedBranch("");
      setSelectedRole("Sale-Staff");
      setNote("");
      setShowBoxSendInvitation(false);
    } else {
      alert(result?.message || "Failed to send invitation");
    }
  };

  const handleCancelAddStaffBox = () => {
    setShowBoxSendInvitation(false);
    updateSearchedStaff(null);
    setMessage(null);
    setSearchQuery("");
    // Clear any pending search
    if (searchTimeoutRef.current) {
      clearTimeout(searchTimeoutRef.current);
      searchTimeoutRef.current = null;
    }
    isSearchingRef.current = false;
  };

  const roleOptions: { label: string; key: StaffRole }[] = [
    { label: "Sale-Staff", key: "Sale-Staff" },
    { label: "Manager", key: "Manager" },
    { label: "Security", key: "Security" },
    { label: "Packer", key: "Packer" },
  ];
  const roleOptionsTranslated = roleOptions.map((option) => ({
    label: t(`staff.role.${option.key}`, option.label),
    key: option.key,
  }));
  const branchOptions = branches
    ? branches.map((branch) => ({
        label: branch.display_name,
        key: branch._id,
      }))
    : [];
  return (
    <div className={cx("main")}>
      <div>
        <AddButton size="sm" onClick={() => setShowBoxSendInvitation(true)}>
          {t("setting.decentralization.invitation.addStaff", "Add Staff")}
        </AddButton>
      </div>

      {/* Box send Invitation */}
      {showBoxSendInvitation && (
        <div className={cx("modal-overlay")}>
          <div className={cx("modal-content")}>
            <div className={cx("modal-header")}>
              <h3>{t("setting.decentralization.invitation.sendInvitation","Gửi lời mời")}</h3>
              <button className={cx("close-btn")} onClick={() => setShowBoxSendInvitation(false)}>
                <FaTimesCircle size={22} color="var(--orange-primary)" />
              </button>
            </div>

            <div className={cx("modal-body")}>
              {/* Search Bar */}
              <div className={cx("search-section")}>
                <label>{t("setting.decentralization.invitation.searchTitle", "Tìm kiếm theo email hoặc mã nhân viên")}:</label>
                <div className="w-full flex gap-3">
                  <Search value={searchQuery} size="md" debounceMs={500} onChange={handleSearchChange} onSearch={undefined} className="flex-1" />
                  <ButtonCommon variant="info" size="md" onClick={handleSearch} disabled={loading}>
                    {loading ? "Searching..." : "Search"}
                  </ButtonCommon>
                </div>
              </div>

              {/* Staff Info Display */}
              {!searchedStaff && message && <div style={{ color: "red" }}>{message}</div>}
              {searchedStaff && (
                <div className={cx("staff-info")}>
                  <h4>{t("setting.decentralization.invitation.staffInfoTitle","Thông Tin Nhân Viên")}:</h4>
                  <p>
                    <strong>{t("setting.decentralization.invitation.staffName","Tên Nhân Viên")}:</strong> {searchedStaff.name}
                  </p>
                  <p>
                    <strong>{t("setting.decentralization.invitation.staffID","Mã Nhân Viên")}:</strong> {searchedStaff.staffID}
                  </p>
                  <p>
                    <strong>{t("setting.decentralization.invitation.staffEmail","Email Nhân Viên")}:</strong> {searchedStaff.email}
                  </p>
                  {searchedStaff.birthday && (
                    <p>
                      <strong>{t("setting.decentralization.invitation.staffBirthday","")}:</strong> {searchedStaff.birthday}
                      {searchedStaff.age !== null && ` (Age: ${searchedStaff.age})`}
                    </p>
                  )}
                </div>
              )}

              {/* Branch Selection */}
              {searchedStaff && (
                <>
                  <div className={cx("form-group")}>
                    <label>{t("setting.decentralization.invitation.selectBranch","Chọn Chi Nhánh")}:</label>
                    <SelectGray
                      options={branchOptions}
                      value={selectedBranch}
                      onChange={(value) => setSelectedBranch(value as string)}
                      placeHolder={t("setting.decentralization.invitation.selectBranchPlaceholder","Chọn một tùy chọn")}
                      isUsePlaceHolder={true}
                    />
                  </div>

                  <div className={cx("form-group")}>
                    <label>{t("setting.decentralization.invitation.roleAssigned","Vai Trò Được Phân Công")}:</label>
                    <SelectGray options={roleOptions} value={selectedRole} onChange={(value) => setSelectedRole(value as StaffRole)} />
                  </div>

                  <div className={cx("form-group")}>
                    <label>{t("setting.decentralization.invitation.note","Ghi Chú")}:</label>
                    <textarea value={note} onChange={(e) => setNote(e.target.value)} placeholder="Add a note to the invitation..." rows={3} />
                  </div>

                  <div className={cx("modal-actions")}>
                    <ButtonCommon variant="agree" onClick={handleSendInvitation}>
                      {t("button.submit", "Send Invitation")}
                    </ButtonCommon>
                    <ButtonCommon variant="cancel" onClick={handleCancelAddStaffBox}>
                      {t("button.close", "Close")}
                    </ButtonCommon>
                  </div>
                </>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
