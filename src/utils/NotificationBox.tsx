import React from "react";
import { IoIosCheckmarkCircle, IoIosCloseCircle, IoIosWarning } from "react-icons/io";

type NotificationType = "success" | "failed" | "warning";

interface NotificationBoxProps {
  type: NotificationType;
  message: string;
  onClose?: () => void;
}

const NotificationBox: React.FC<NotificationBoxProps> = ({ type, message, onClose }) => {
  const getStyles = () => {
    switch (type) {
      case "success":
        return {
          icon: <IoIosCheckmarkCircle size={24} />,
          bg: "#e7f9ed",
          color: "#2e7d32",
          border: "#a5d6a7",
        };
      case "failed":
        return {
          icon: <IoIosCloseCircle size={24} />,
          bg: "#fdecea",
          color: "#c62828",
          border: "#f5c6cb",
        };
      case "warning":
        return {
          icon: <IoIosWarning size={24} />,
          bg: "#fff8e1",
          color: "#e65100",
          border: "#ffe082",
        };
      default:
        return {};
    }
  };

  const styles = getStyles();

  return (
    <div
      style={{
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        flexDirection: "column",
        gap: "10px",
        background: styles.bg,
        color: styles.color,
        border: `1px solid ${styles.border}`,
        borderRadius: "6px",
        padding: "12px 16px",
        marginBottom: "12px",
        minHeight: 200,
        minWidth: 400,
        width: "fit-content",
        position: "fixed",
        top: "50%",
        left: "50%",
        transform: "translate(-50%, -50%)",
      }}
    >
      <div style={{ display: "flex", alignItems: "center", justifyContent: "center" }}>
        {styles.icon}
        <span style={{ flex: 1 }}>{message}</span>
      </div>
      {onClose && (
        <button
          onClick={onClose}
          style={{
            background: "transparent",
            border: "none",
            cursor: "pointer",
            color: styles.color,
            fontSize: "18px",
          }}
        >
          ✕ Đóng
        </button>
      )}
    </div>
  );
};

export default NotificationBox;
