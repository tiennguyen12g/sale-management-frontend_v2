import React, { useState } from "react";
import classNames from 'classnames/bind'
import styles from './ClaimMorningButton.module.scss'
const cx = classNames.bind(styles)
import { useShopOrderStore } from "../zustand/shopOrderStore";
import { ClaimOrderInMorning_API } from "../configs/api";
import { type OrderDataFromServerType } from "../zustand/shopOrderStore";
import NotificationBox_v2 from "../ultilitis/NotificationBox_v2";
export function ClaimMorningButton({ staffID, userId }: { staffID: string; userId: string }) {
  const [status, setStatus] = useState("");
  const [showNotification, setShowNotification] = useState(false);

  const { addArrayOrderDataFromServer } = useShopOrderStore();

  const handleClick = async () => {
    setStatus("⏳ Đang kiểm tra...");
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
        setStatus(`Đã nhận ${orders.length} đơn mới`);
      } else {
        setStatus( `${data.message}` || "Không có đơn mới nào trong ngày hôm qua");
      }
    } catch (err) {
      setStatus("Nhận đơn thất bại");
    }
  };

  return (
    <>
      <button className={cx('btn-decor')} onClick={handleClick}>Cập nhật đơn hôm qua</button>

      {showNotification && (
        <NotificationBox_v2
          message={status}
          onClose={() => setShowNotification(false)}
        />
      )}
    </>
  );
}