import React, { useState } from "react";
import { useTranslation } from "react-i18next";
import classNames from "classnames/bind";
import styles from "./RedistributeOrder.module.scss";
const cx = classNames.bind(styles);
import { RedistributionOrder_API } from "../../../../config/api";
import { useShopOrderStore } from "../../../../zustand/shopOrderStore";
import NotificationBox_v2 from "../../../../utils/NotificationBox_v2";
import { GradientButton } from "@tnbt/react-favorit-style";
export function StaffRedistributeButton({ staffID, userId }: { staffID: string; userId: string }) {
  const { t } = useTranslation();
  const [status, setStatus] = useState("");
  const [showNotification, setShowNotification] = useState(false);
  const { addArrayOrderDataFromServer } = useShopOrderStore();

  const handleClick = async () => {
    setStatus(t("redistributeOrder.checking", "⏳ Đang kiểm tra..."));
    setShowNotification(true);
    try {
      const res = await fetch(RedistributionOrder_API, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ staffID, userId }),
      });
      const data = await res.json();
      console.log("data", data);
      if (data.locked) {
        setStatus(t("redistributeOrder.alreadyRedistributed", "⚠️ Phân phối lại đã được thực hiện bởi {{staffName}}", { staffName: data.message }));
      } else if (data.message === "Redistribution completed" && data.updates.length > 0) {
        await addArrayOrderDataFromServer(data.updates);
        setStatus(t("redistributeOrder.redistributedSuccess", "✅ Đã phân phối lại: {{count}} đơn", { count: data.updates.length }));
      } else if (data.message === "Redistribution failed") {
        setStatus(t("redistributeOrder.redistributedFailed", "❌ Phân phối lại thất bại"));
      } else {
        console.log("data new", data.updates[0]);
        console.log("data", data);

        setStatus(`⚠️ ${data.message}`);
      }
    } catch (err) {
      console.log("err", err);
      setStatus(t("redistributeOrder.redistributedFailed", "❌ Phân phối lại thất bại"));
    }
  };

  return (
    <React.Fragment>
      {/* <button className={cx("btn-decor")} onClick={handleClick}>
        Phân phối các đơn chưa được nhận
      </button> */}
      <GradientButton variant="orange" onClick={handleClick}>
        {t("redistributeOrder.buttonTitle", "Phân phối các đơn chưa được nhận")}
      </GradientButton>
      {showNotification && <NotificationBox_v2 message={status} onClose={() => setShowNotification(false)} />}
    </React.Fragment>
  );
}
