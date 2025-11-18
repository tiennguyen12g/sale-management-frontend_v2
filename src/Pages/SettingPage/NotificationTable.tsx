import { useEffect, useState } from "react";
import classNames from "classnames/bind";
import styles from "./NotificationTable.module.scss";
const cx = classNames.bind(styles);
import { useNotificationStore, type INotification } from "../../zustand/notificationStore";
import { useTranslation } from "react-i18next";

export default function NotificationTable() {
  const { t } = useTranslation();
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
    if (!sender) return t("setting.notificationTable.system", "System");
    if (typeof sender === "object" && sender.username) {
      return sender.username;
    }
    if (typeof sender === "object" && sender.email) {
      return sender.email;
    }
    return t("setting.notificationTable.unknown", "Unknown");
  };

  const getTypeTag = (type: string): string => {
    const typeMap: Record<string, string> = {
      info: t("setting.notificationTable.type.info", "Info"),
      warning: t("setting.notificationTable.type.warning", "Warning"),
      success: t("setting.notificationTable.type.success", "Success"),
      danger: t("setting.notificationTable.type.danger", "Danger"),
      order: t("setting.notificationTable.type.order", "Order"),
      task: t("setting.notificationTable.type.task", "Task"),
      salary: t("setting.notificationTable.type.salary", "Salary"),
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

    if (diffMins < 1) return t("setting.notificationTable.time.justNow", "Just now");
    if (diffMins < 60) return t("setting.notificationTable.time.minutesAgo", "{{count}} minute(s) ago", { count: diffMins });
    if (diffHours < 24) return t("setting.notificationTable.time.hoursAgo", "{{count}} hour(s) ago", { count: diffHours });
    if (diffDays < 7) return t("setting.notificationTable.time.daysAgo", "{{count}} day(s) ago", { count: diffDays });
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
        <h3>{t("setting.notificationTable.title", "System Notifications")}</h3>
        {pagination && (
          <div className={cx("pagination-info")}>
            {t("setting.notificationTable.showing", "Showing {{start}} - {{end}} of {{total}}", {
              start: ((currentPage - 1) * itemsPerPage) + 1,
              end: Math.min(currentPage * itemsPerPage, pagination.total),
              total: pagination.total
            })}
          </div>
        )}
      </div>

      {loading ? (
        <div className={cx("loading")}>{t("setting.notificationTable.loading", "Loading notifications...")}</div>
      ) : notifications.length > 0 ? (
        <>
          <table className={cx("notification-table")}>
            <thead>
              <tr>
                <th>{t("setting.notificationTable.table.title", "Title")}</th>
                <th>{t("setting.notificationTable.table.author", "Author")}</th>
                <th>{t("setting.notificationTable.table.time", "Time")}</th>
                <th>{t("setting.notificationTable.table.type", "Type")}</th>
                <th>{t("setting.notificationTable.table.status", "Status")}</th>
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
                      {notification.read ? t("setting.notificationTable.status.read", "Read") : t("setting.notificationTable.status.unread", "Unread")}
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
                {t("setting.notificationTable.pagination.previous", "Previous")}
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
                {t("setting.notificationTable.pagination.next", "Next")}
              </button>
            </div>
          )}
        </>
      ) : (
        <div className={cx("no-notifications")}>{t("setting.notificationTable.noNotifications", "No notifications found")}</div>
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
                <strong>{t("setting.notificationTable.detail.author", "Author")}:</strong> {getAuthorName(selectedNotification.sender_id)}
              </div>
              <div className={cx("detail-row")}>
                <strong>{t("setting.notificationTable.detail.time", "Time")}:</strong> {new Date(selectedNotification.createdAt).toLocaleString()}
              </div>
              <div className={cx("detail-row")}>
                <strong>{t("setting.notificationTable.detail.type", "Type")}:</strong>{" "}
                <span className={cx("type-tag", getTypeClass(selectedNotification.type))}>
                  {getTypeTag(selectedNotification.type)}
                </span>
              </div>
              <div className={cx("detail-row")}>
                <strong>{t("setting.notificationTable.detail.source", "Source")}:</strong> {selectedNotification.source}
              </div>
              <div className={cx("content-section")}>
                <strong>{t("setting.notificationTable.detail.content", "Content")}:</strong>
                <div className={cx("message-content")}>{selectedNotification.message}</div>
              </div>
              {selectedNotification.context && (
                <div className={cx("context-section")}>
                  <strong>{t("setting.notificationTable.detail.context", "Context")}:</strong>
                  <div>
                    {t("setting.notificationTable.detail.resource", "Resource")}: {selectedNotification.context.resource} ({t("setting.notificationTable.detail.id", "ID")}: {selectedNotification.context.resource_id})
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

