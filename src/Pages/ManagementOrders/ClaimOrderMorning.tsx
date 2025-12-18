import React, { useState } from "react";
import classNames from 'classnames/bind'
import styles from './ClaimMorningButton.module.scss'
const cx = classNames.bind(styles)

// Hooks
import { useShopOrderStore } from "../../zustand/shopOrderStore";
import { type OrderDataFromServerType } from "../../zustand/shopOrderStore";
import { useTranslation } from "react-i18next";
// Components
import NotificationBox_v2 from "../../utils/NotificationBox_v2";
import { GradientButton } from "@tnbt/react-favorit-style";
import { ClaimOrderInMorning_API } from "../../config/api";

export function ClaimMorningButton({ staffID, userId }: { staffID: string; userId: string }) {
  const {t} = useTranslation();
  const [status, setStatus] = useState("");
  const [showNotification, setShowNotification] = useState(false);

  const { addArrayOrderDataFromServer } = useShopOrderStore();

  const handleClick = async () => {
    setStatus(t("claimOrderMorning.checking", "⏳ Đang kiểm tra..."));
    setShowNotification(true);

    try {
      const res = await fetch(ClaimOrderInMorning_API, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ staffID, userId }),
      });

      const data = await res.json();
      const orders: OrderDataFromServerType[] = data.orders;

      if (orders) {
        addArrayOrderDataFromServer(orders);
        setStatus(t("claimOrderMorning.receivedOrders", "Đã nhận {{count}} đơn mới", { count: orders.length }));
      } else {
        setStatus(data.message || t("claimOrderMorning.noNewOrders", "Không có đơn mới nào trong ngày hôm qua"));
      }
    } catch (err) {
      setStatus(t("claimOrderMorning.claimFailed", "Nhận đơn thất bại"));
    }
  };

  return (
    <>
      {/* <button className={cx('btn-decor')} onClick={handleClick}>Cập nhật đơn hôm qua</button> */}
      <GradientButton variant="orange" onClick={handleClick}>{t("claimOrderMorning.buttonTitle","Update Yesterday Order")}</GradientButton>

      {showNotification && (
        <NotificationBox_v2
          message={status}
          onClose={() => setShowNotification(false)}
        />
      )}
    </>
  );
}