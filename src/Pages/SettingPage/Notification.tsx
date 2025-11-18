import classNames from "classnames/bind";
import styles from "./Notification.module.scss";
const cx = classNames.bind(styles);
import TableInvitation from "./TableInvitation";
import NotificationTable from "./NotificationTable";
import { useTranslation } from "react-i18next";

export default function Notification() {
  const { t } = useTranslation();
  return (
    <div className={cx("main")}>
      <h2>{t("setting.notification.systemNotifications", "System Notifications")}</h2>
      <NotificationTable />
      
      <h2>{t("setting.notification.invitations", "Invitations")}</h2>
      <TableInvitation />
    </div>
  );
}
