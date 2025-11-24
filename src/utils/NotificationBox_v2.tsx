import React from "react";
import { IoIosCheckmarkCircle, IoIosCloseCircle, IoIosWarning } from "react-icons/io";
import classNames from 'classnames/bind'
import styles from './NotificationBox_v2.module.scss'
const cx = classNames.bind(styles)
type NotificationType = "success" | "failed" | "warning";

interface NotificationBoxProps {
  message: string;
  onClose: () => void;
}

const NotificationBox_v2: React.FC<NotificationBoxProps> = ({message, onClose }) => {


  return (
    <div  className={cx('main')}>
      <div
        style={{

          gap: "10px",
          border: `1px solid #f5f5f5`,
          borderRadius: "6px",
          padding: "12px 16px",
          marginBottom: "12px",
          minHeight: 200,
          minWidth: 400,
          width: "fit-content",
          position: "relative",

        }}
        className={cx('box')}
       
      >
        <div style={{ display: "flex", alignItems: "center", justifyContent: "center" }}>
          <span style={{ flex: 1, fontSize: 18, fontWeight: 550 }}>{message}</span>
        </div>
        {onClose && (
          <button
            onClick={onClose}
            style={{
              background: "transparent",
              border: "none",
              cursor: "pointer",
              fontSize: "18px",
              outline: "none"
            }}
          >
            ✕ Đóng
          </button>
        )}
      </div>
    </div>
  );
};

export default NotificationBox_v2;
