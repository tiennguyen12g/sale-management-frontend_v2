// No Route (404) Component
import { useNavigate } from "react-router-dom";
import { FaHome, FaArrowLeft,FaExclamationTriangle } from "react-icons/fa";
import styles from "./Error404.module.scss";

export default function Error404() {
  const navigate = useNavigate();

  const handleGoHome = () => {
    navigate("/home");
  };

  const handleGoBack = () => {
    navigate(-1);
  };

  return (
    <div className={styles.container}>
      <div className={styles.content}>
        {/* Animated 404 */}
        <div className={styles.errorCode}>
          <span className={styles.number}>4</span>
          <span className={styles.number}>0</span>
          <span className={styles.number}>4</span>
        </div>

        {/* Icon */}
        <div className={styles.iconWrapper}>
          <FaExclamationTriangle className={styles.icon} />
        </div>

        {/* Message */}
        <h1 className={styles.title}>Trang không tìm thấy</h1>
        <p className={styles.description}>
          Xin lỗi, trang bạn đang tìm kiếm không tồn tại hoặc đã bị di chuyển.
          <br />
          Vui lòng kiểm tra lại đường dẫn hoặc quay lại trang chủ.
        </p>

        {/* Action Buttons */}
        <div className={styles.actions}>
          <button className={styles.btnPrimary} onClick={handleGoHome}>
            <FaHome className={styles.btnIcon} />
            <span>Về trang chủ</span>
          </button>
          <button className={styles.btnSecondary} onClick={handleGoBack}>
            <FaArrowLeft className={styles.btnIcon} />
            <span>Quay lại</span>
          </button>
        </div>

        {/* Quick Links */}
        <div className={styles.quickLinks}>
          <p className={styles.quickLinksTitle}>Các trang phổ biến:</p>
          <div className={styles.links}>
            <button
              className={styles.link}
              onClick={() => navigate("/quan-li-don-hang")}
            >
              Đơn hàng
            </button>
            <button
              className={styles.link}
              onClick={() => navigate("/danh-sach-san-pham")}
            >
              Sản phẩm
            </button>
            <button
              className={styles.link}
              onClick={() => navigate("/tin-nhan-page")}
            >
              Tin nhắn
            </button>
            <button
              className={styles.link}
              onClick={() => navigate("/ho-so-ca-nhan")}
            >
              Hồ sơ
            </button>
          </div>
        </div>
      </div>

      {/* Background decoration */}
      <div className={styles.background}>
        <div className={styles.circle}></div>
        <div className={styles.circle}></div>
        <div className={styles.circle}></div>
      </div>
    </div>
  );
}
