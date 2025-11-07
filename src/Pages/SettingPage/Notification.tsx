import classNames from "classnames/bind";
import styles from "./Notification.module.scss";
const cx = classNames.bind(styles);
import TableInvitation from "./TableInvitation";
import NotificationTable from "./NotificationTable";

export default function Notification() {
  return (
    <div className={cx("main")}>
      <h2>System Notifications</h2>
      <NotificationTable />
      
      <h2>Invitations</h2>
      <TableInvitation />
    </div>
  );
}
