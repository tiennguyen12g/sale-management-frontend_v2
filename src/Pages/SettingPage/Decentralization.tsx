import { useEffect } from "react";
import classNames from "classnames/bind";
import styles from "./Decentralization.module.scss";
const cx = classNames.bind(styles);
import Invitation from "./Invitation";
import { useInvitationStore } from "../../zustand/invitationStore";
import { AddButton, ButtonCommon } from "@tnbt/react-favorit-style";
import { useTranslation } from "react-i18next";
export default function Decentralization() {
  const { t } = useTranslation();
  const { sentInvitations, fetchSentInvitations, deleteInvitation, loading } = useInvitationStore();

  useEffect(() => {
    fetchSentInvitations();
  }, [fetchSentInvitations]);

  const handleDelete = async (invitationId: string) => {
    if (!confirm("Are you sure you want to remove this invitation?")) return;

    const result = await deleteInvitation(invitationId);
    if (result?.status === "success") {
      alert(result.message);
    } else {
      alert(result?.message || "Failed to delete invitation");
    }
  };

  const getBranchName = (branch: any): string => {
    if (typeof branch === "object" && branch?.display_name) {
      return branch.display_name;
    }
    return "Unknown Branch";
  };

  const isAccepted = (invitation: any): boolean => {
    return invitation.status === "accepted";
  };

  return (
    <div className={cx("main")}>
      <h2>{t("setting.decentralization.title","Phân quyền")}</h2>

      {/* Table list of sent invitations */}
      <div className={cx("sent-invitations-section")}>
        <div className={cx("header-table")}>
          <div className={cx("title")}>{t("setting.decentralization.invitation.title", "Quản lí thư mời")}</div>
          <Invitation />
        </div>
        {sentInvitations && sentInvitations.length > 0 ? (
          <div className={cx("table-container")}>
            <table className={cx("invitation-table")}>
              <thead>
                <tr>
                  <th>Staff Name</th>
                  <th>Staff ID</th>
                  <th>Email</th>
                  <th>Branch Name</th>
                  <th>Role</th>
                  <th>Date</th>
                  <th>Status</th>
                  <th>Actions</th>
                </tr>
              </thead>
              <tbody>
                {sentInvitations.map((invitation) => {
                  const accepted = isAccepted(invitation);
                  return (
                    <tr key={invitation._id}>
                      <td>{invitation.staff_name}</td>
                      <td>{invitation.staffID}</td>
                      <td>{invitation.staff_email}</td>
                      <td>{getBranchName(invitation.branch_id)}</td>
                      <td>{invitation.role}</td>
                      <td>{new Date(Number(invitation.date)).toLocaleDateString()}</td>
                      <td>
                        <span className={cx("status", accepted ? "accepted" : "pending")}>{accepted ? "Accepted" : "Pending"}</span>
                      </td>
                      <td>
                        {!accepted ? (
                          // <button className={cx("delete-btn")} onClick={() => handleDelete(invitation._id)}>
                          //   Remove
                          // </button>
                          <ButtonCommon variant="cancel" onClick={() => handleDelete(invitation._id)}>{t("button.revoke", "Xóa")}</ButtonCommon>
                        ) : (
                          <span className={cx("no-action")}>-</span>
                        )}
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        ) : (
          <div className={cx("no-invitations")}>{t("setting.decentralization.invitation.noInvitations", "Chưa có lời mời nào được gửi.")}</div>
        )}
      </div>
    </div>
  );
}
