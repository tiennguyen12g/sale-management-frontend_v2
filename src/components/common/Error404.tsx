// No Route (404) Component
import { useNavigate } from "react-router-dom";
import { useTranslation } from "react-i18next";
import { FaHome, FaArrowLeft, FaExclamationTriangle } from "react-icons/fa";
import styles from "./Error404.module.scss";

export default function Error404() {
  const { t } = useTranslation();
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
        <h1 className={styles.title}>{t("error404.title", "Trang không tìm thấy")}</h1>
        <p className={styles.description}>
          {t("error404.description", "Xin lỗi, trang bạn đang tìm kiếm không tồn tại hoặc đã bị di chuyển.")}
          <br />
          {t("error404.description2", "Vui lòng kiểm tra lại đường dẫn hoặc quay lại trang chủ.")}
        </p>

        {/* Action Buttons */}
        <div className={styles.actions}>
          <button className={styles.btnPrimary} onClick={handleGoHome}>
            <FaHome className={styles.btnIcon} />
            <span>{t("error404.goHome", "Về trang chủ")}</span>
          </button>
          <button className={styles.btnSecondary} onClick={handleGoBack}>
            <FaArrowLeft className={styles.btnIcon} />
            <span>{t("error404.goBack", "Quay lại")}</span>
          </button>
        </div>

        {/* Quick Links */}
        <div className={styles.quickLinks}>
          <p className={styles.quickLinksTitle}>{t("error404.popularPages", "Các trang phổ biến:")}</p>
          <div className={styles.links}>
            <button
              className={styles.link}
              onClick={() => navigate("/order-management")}
            >
              {t("error404.orders", "Đơn hàng")}
            </button>
            <button
              className={styles.link}
              onClick={() => navigate("/product-list")}
            >
              {t("error404.products", "Sản phẩm")}
            </button>
            <button
              className={styles.link}
              onClick={() => navigate("/messages")}
            >
              {t("error404.messages", "Tin nhắn")}
            </button>
            <button
              className={styles.link}
              onClick={() => navigate("/profile-in-company")}
            >
              {t("error404.profile", "Hồ sơ")}
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
