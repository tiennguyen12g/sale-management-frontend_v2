import { useState } from "react";
import classNames from "classnames/bind";
import styles from "./Invitation.module.scss";
const cx = classNames.bind(styles);
import { useInvitationStore } from "../../zustand/invitationStore";
import { useBranchStore } from "../../zustand/branchStore";
import type { StaffRole } from "../../zustand/staffStore";
import { FaTimesCircle } from "react-icons/fa";

export default function Invitation() {
  const [showBoxSendInvitation, setShowBoxSendInvitation] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedBranch, setSelectedBranch] = useState<string>("");
  const [selectedRole, setSelectedRole] = useState<StaffRole>("Sale-Staff");
  const [note, setNote] = useState("");
  const [message, setMessage] = useState<string | null>(null);

  const { searchStaff, createInvitation, searchedStaff, loading, updateSearchedStaff } = useInvitationStore();
  const { branches } = useBranchStore();

  const handleSearch = async () => {
    if (!searchQuery.trim()) {
      alert("Please enter staff ID or email");
      return;
    }
    const result = await searchStaff(searchQuery.trim());
    if(result && result.status === "failed"){
      setMessage(result.message)
      }
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

    const result = await createInvitation(
      selectedBranch,
      selectedRole,
      searchedStaff.staffID,
      searchedStaff.email,
      searchedStaff.name,
      note
    );

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
    setMessage(null)
  }

  return (
    <div className={cx("main")}>
      <div>
        <button onClick={() => setShowBoxSendInvitation(true)}>Add Staff</button>
      </div>

      {/* Box send Invitation */}
      {showBoxSendInvitation && (
        <div className={cx("modal-overlay")} onClick={() => setShowBoxSendInvitation(false)}>
          <div className={cx("modal-content")} onClick={(e) => e.stopPropagation()}>
            <div className={cx("modal-header")}>
              <h3>Send Invitation</h3>
              <button className={cx("close-btn")} onClick={() => setShowBoxSendInvitation(false)}>
                <FaTimesCircle size={22} color="var(--orange-primary)"/>
              </button>
            </div>

            <div className={cx("modal-body")}>
              {/* Search Bar */}
              <div className={cx("search-section")}>
                <label>Search by Staff ID or Email:</label>
                <div className={cx("search-input-group")}>
                  <input
                    type="text"
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    onKeyPress={(e) => e.key === "Enter" && handleSearch()}
                    placeholder="Enter staff ID or email"
                  />
                  <button onClick={handleSearch} disabled={loading}>
                    {loading ? "Searching..." : "Search"}
                  </button>
                </div>
              </div>

              {/* Staff Info Display */}
              {!searchedStaff && message && <div style={{color: "red"}}>{message}</div>}
              {searchedStaff && (
                <div className={cx("staff-info")}>
                  <h4>Staff Information:</h4>
                  <p>
                    <strong>Name:</strong> {searchedStaff.name}
                  </p>
                  <p>
                    <strong>Staff ID:</strong> {searchedStaff.staffID}
                  </p>
                  <p>
                    <strong>Email:</strong> {searchedStaff.email}
                  </p>
                  {searchedStaff.birthday && (
                    <p>
                      <strong>Birthday:</strong> {searchedStaff.birthday}
                      {searchedStaff.age !== null && ` (Age: ${searchedStaff.age})`}
                    </p>
                  )}
                </div>
              )}

              {/* Branch Selection */}
              {searchedStaff && (
                <>
                  <div className={cx("form-group")}>
                    <label>Select Branch:</label>
                    <select value={selectedBranch} onChange={(e) => setSelectedBranch(e.target.value)}>
                      <option value="">-- Select Branch --</option>
                      {branches?.map((branch) => (
                        <option key={branch._id} value={branch._id}>
                          {branch.display_name}
                        </option>
                      ))}
                    </select>
                  </div>

                  <div className={cx("form-group")}>
                    <label>Role:</label>
                    <select value={selectedRole} onChange={(e) => setSelectedRole(e.target.value as StaffRole)}>
                      <option value="Sale-Staff">Sale-Staff</option>
                      <option value="Manager">Manager</option>
                      <option value="Security">Security</option>
                      <option value="Packer">Packer</option>
                    </select>
                  </div>

                  <div className={cx("form-group")}>
                    <label>Note (optional):</label>
                    <textarea
                      value={note}
                      onChange={(e) => setNote(e.target.value)}
                      placeholder="Add a note to the invitation..."
                      rows={3}
                    />
                  </div>

                  <div className={cx("modal-actions")}>
                    <button onClick={handleSendInvitation} className={cx("send-btn")}>
                      Send Invitation
                    </button>
                    <button onClick={handleCancelAddStaffBox} className={cx("cancel-btn")}>
                      Cancel
                    </button>
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
