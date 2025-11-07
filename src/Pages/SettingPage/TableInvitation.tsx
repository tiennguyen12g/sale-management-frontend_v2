import { useEffect } from "react";
import classNames from "classnames/bind";
import styles from "./TableInvitation.module.scss";
const cx = classNames.bind(styles);
import { useInvitationStore } from "../../zustand/invitationStore";

export default function TableInvitation() {
  const { receivedInvitations, fetchReceivedInvitations, acceptInvitation, rejectInvitation, loading } =
    useInvitationStore();

  useEffect(() => {
    fetchReceivedInvitations();
  }, [fetchReceivedInvitations]);

  const handleAccept = async (invitationId: string) => {
    if (!confirm("Are you sure you want to accept this invitation?")) return;

    const result = await acceptInvitation(invitationId);
    if (result?.status === "success") {
      alert(result.message);
    } else {
      alert(result?.message || "Failed to accept invitation");
    }
  };

  const handleReject = async (invitationId: string) => {
    if (!confirm("Are you sure you want to reject this invitation?")) return;

    const result = await rejectInvitation(invitationId);
    if (result?.status === "success") {
      alert(result.message);
    } else {
      alert(result?.message || "Failed to reject invitation");
    }
  };

  const getBranchName = (branch: any): string => {
    if (typeof branch === "object" && branch?.display_name) {
      return branch.display_name;
    }
    return "Unknown Branch";
  };

  return (
    <div className={cx("main")}>
      {loading ? (
        <div>Loading...</div>
      ) : receivedInvitations && receivedInvitations.length > 0 ? (
        <div className={cx("table-container")}>
          <table className={cx("invitation-table")}>
            <thead>
              <tr>
                <th>No</th>
                <th>Branch Name</th>
                <th>Role</th>
                <th>Status</th>
                <th>Date</th>
                <th>Expiry Date</th>
                <th>Actions</th>
              </tr>
            </thead>
            <tbody>
              {receivedInvitations.map((invitation, i) => {
                const isAccepted = invitation.status === "accepted";
     
                const createDate  = (new Date(Number(invitation.date))).toLocaleString();
                const expiredDate = (new Date(Number(invitation.expired))).toLocaleString();
                return (
                  <tr key={invitation._id}>
                    <td>{i + 1}</td>
                    <td>{getBranchName(invitation.branch_id)}</td>
                    <td>{invitation.role}</td>
                    <td>
                      <span className={cx("status", isAccepted ? "accepted" : "pending")}>
                        {isAccepted ? "Accepted" : "Pending"}
                      </span>
                    </td>
                    <td>{createDate}</td>
                    <td>{expiredDate}</td>
                    <td>
                      {!isAccepted ? (
                        <div className={cx("action-buttons")}>
                          <button
                            className={cx("accept-btn")}
                            onClick={() => handleAccept(invitation._id)}
                          >
                            Accept
                          </button>
                          <button
                            className={cx("reject-btn")}
                            onClick={() => handleReject(invitation._id)}
                          >
                            Reject
                          </button>
                        </div>
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
        <div className={cx("no-invitations")}>No invitations received</div>
      )}
    </div>
  );
}
