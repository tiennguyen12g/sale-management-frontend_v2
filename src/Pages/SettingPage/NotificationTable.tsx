import { useEffect, useState } from "react";
import classNames from "classnames/bind";
import styles from "./NotificationTable.module.scss";
const cx = classNames.bind(styles);
import { useNotificationStore, type INotification } from "../../zustand/notificationStore";

export default function NotificationTable() {
  const { notifications, pagination, fetchNotifications, markAsRead, loading } = useNotificationStore();
  const [selectedNotification, setSelectedNotification] = useState<INotification | null>(null);
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 10;

  useEffect(() => {
    fetchNotifications(currentPage, itemsPerPage);
  }, [currentPage, fetchNotifications]);

  const handleRowClick = async (notification: INotification) => {
    // Mark as read if not already read
    if (!notification.read) {
      await markAsRead(notification._id);
    }
    setSelectedNotification(notification);
  };

  const handleCloseDetail = () => {
    setSelectedNotification(null);
  };

  const getAuthorName = (sender: any): string => {
    if (!sender) return "System";
    if (typeof sender === "object" && sender.username) {
      return sender.username;
    }
    if (typeof sender === "object" && sender.email) {
      return sender.email;
    }
    return "Unknown";
  };

  const getTypeTag = (type: string): string => {
    const typeMap: Record<string, string> = {
      info: "Info",
      warning: "Warning",
      success: "Success",
      danger: "Danger",
      order: "Order",
      task: "Task",
      salary: "Salary",
    };
    return typeMap[type] || type;
  };

  const getTypeClass = (type: string): string => {
    return `type-${type}`;
  };

  const formatTime = (dateString: string): string => {
    const date = new Date(dateString);
    const now = new Date();
    const diffMs = now.getTime() - date.getTime();
    const diffMins = Math.floor(diffMs / 60000);
    const diffHours = Math.floor(diffMs / 3600000);
    const diffDays = Math.floor(diffMs / 86400000);

    if (diffMins < 1) return "Just now";
    if (diffMins < 60) return `${diffMins} minute${diffMins > 1 ? "s" : ""} ago`;
    if (diffHours < 24) return `${diffHours} hour${diffHours > 1 ? "s" : ""} ago`;
    if (diffDays < 7) return `${diffDays} day${diffDays > 1 ? "s" : ""} ago`;
    return date.toLocaleDateString();
  };

  const handlePageChange = (newPage: number) => {
    if (newPage >= 1 && newPage <= (pagination?.totalPages || 1)) {
      setCurrentPage(newPage);
    }
  };

  return (
    <div className={cx("notification-table-container")}>
      <div className={cx("table-header")}>
        <h3>System Notifications</h3>
        {pagination && (
          <div className={cx("pagination-info")}>
            Showing {((currentPage - 1) * itemsPerPage) + 1} - {Math.min(currentPage * itemsPerPage, pagination.total)} of {pagination.total}
          </div>
        )}
      </div>

      {loading ? (
        <div className={cx("loading")}>Loading notifications...</div>
      ) : notifications.length > 0 ? (
        <>
          <table className={cx("notification-table")}>
            <thead>
              <tr>
                <th>Title</th>
                <th>Author</th>
                <th>Time</th>
                <th>Type</th>
                <th>Status</th>
              </tr>
            </thead>
            <tbody>
              {notifications.map((notification) => (
                <tr
                  key={notification._id}
                  className={cx("table-row", { unread: !notification.read, read: notification.read })}
                  onClick={() => handleRowClick(notification)}
                >
                  <td className={cx("title-cell")}>{notification.title}</td>
                  <td>{getAuthorName(notification.sender_id)}</td>
                  <td>{formatTime(notification.createdAt)}</td>
                  <td>
                    <span className={cx("type-tag", getTypeClass(notification.type))}>
                      {getTypeTag(notification.type)}
                    </span>
                  </td>
                  <td>
                    <span className={cx("read-status", { read: notification.read, unread: !notification.read })}>
                      {notification.read ? "Read" : "Unread"}
                    </span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>

          {/* Pagination */}
          {pagination && pagination.totalPages > 1 && (
            <div className={cx("pagination")}>
              <button
                onClick={() => handlePageChange(currentPage - 1)}
                disabled={currentPage === 1}
                className={cx("page-btn")}
              >
                Previous
              </button>
              <div className={cx("page-numbers")}>
                {Array.from({ length: pagination.totalPages }, (_, i) => i + 1).map((page) => (
                  <button
                    key={page}
                    onClick={() => handlePageChange(page)}
                    className={cx("page-btn", { active: page === currentPage })}
                  >
                    {page}
                  </button>
                ))}
              </div>
              <button
                onClick={() => handlePageChange(currentPage + 1)}
                disabled={currentPage === pagination.totalPages}
                className={cx("page-btn")}
              >
                Next
              </button>
            </div>
          )}
        </>
      ) : (
        <div className={cx("no-notifications")}>No notifications found</div>
      )}

      {/* Detail Modal */}
      {selectedNotification && (
        <div className={cx("modal-overlay")} onClick={handleCloseDetail}>
          <div className={cx("modal-content")} onClick={(e) => e.stopPropagation()}>
            <div className={cx("modal-header")}>
              <h3>{selectedNotification.title}</h3>
              <button className={cx("close-btn")} onClick={handleCloseDetail}>
                ×
              </button>
            </div>
            <div className={cx("modal-body")}>
              <div className={cx("detail-row")}>
                <strong>Author:</strong> {getAuthorName(selectedNotification.sender_id)}
              </div>
              <div className={cx("detail-row")}>
                <strong>Time:</strong> {new Date(selectedNotification.createdAt).toLocaleString()}
              </div>
              <div className={cx("detail-row")}>
                <strong>Type:</strong>{" "}
                <span className={cx("type-tag", getTypeClass(selectedNotification.type))}>
                  {getTypeTag(selectedNotification.type)}
                </span>
              </div>
              <div className={cx("detail-row")}>
                <strong>Source:</strong> {selectedNotification.source}
              </div>
              <div className={cx("content-section")}>
                <strong>Content:</strong>
                <div className={cx("message-content")}>{selectedNotification.message}</div>
              </div>
              {selectedNotification.context && (
                <div className={cx("context-section")}>
                  <strong>Context:</strong>
                  <div>
                    Resource: {selectedNotification.context.resource} (ID: {selectedNotification.context.resource_id})
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

