import React, { useState } from "react";
import classNames from "classnames/bind";
import styles from "./GeneralSetting.module.scss";
const cx = classNames.bind(styles);

import { ChangePassword_API } from "../../config/api";
import { useAuthStore } from "../../zustand/authStore";
import { EditButton, ButtonCommon } from "@tnbt/react-favorit-style";
import {useTranslation} from "react-i18next";
export default function GeneralSetting() {
  const { user, getAuthHeader, yourStaffId } = useAuthStore();
  const { t } = useTranslation();
  const [newPassword, setNewPassword] = useState("");
  const [oldPassword, setOldPassword] = useState("");
  const [repeatPass, setRepeatPass] = useState("");
  const [error, setError] = useState("");
  const [showAccountForm, setShowAccountForm] = useState(false);
  const handleChangePass = async () => {
    if (!user) {
      setError("Có lỗi, báo lại quản trị viên.");
      return;
    }
    const res = await fetch(ChangePassword_API, {
      method: "PUT",
      headers: { "Content-Type": "application/json", ...getAuthHeader() },
      body: JSON.stringify({ userId: user._id, oldPassword, newPassword }),
    });
    const data = await res.json();
    if (res.ok) {
      alert("Đổi mật khẩu thành công");
      setShowAccountForm(false);
    } else {
      alert("Error: " + data.message);
    }
  };
  return (
    <div className={cx("main")}>
      {showAccountForm && user && (
        <div className={cx("wrap-change-pass")}>
          <div className={cx("form-container")}>
            <h5>{t("setting.general.account_info.changePassword", "Đổi mật khẩu")}</h5>
            <div style={{ color: "red" }}>{error}</div>
            <input type="password" placeholder={t("setting.general.account_info.newPassword", "Mật khẩu cũ")}  value={oldPassword} onChange={(e) => setOldPassword(e.target.value)} />
            <input type="password" placeholder={t("setting.general.account_info.oldPassword", "Mật khẩu mới")}value={newPassword} onChange={(e) => setNewPassword(e.target.value)} />
            <input type="password" placeholder={t("setting.general.account_info.confirmNewPassword", "Nhập lại mật khẩu mới")} value={repeatPass} onChange={(e) => setRepeatPass(e.target.value)} />
            <div className={cx("btn-actions")}>
              <ButtonCommon variant="agree" onClick={() => handleChangePass()}>{t("button.save","Lưu")}</ButtonCommon>
              <ButtonCommon variant="cancel" onClick={() => setShowAccountForm(false)}>{t("button.cancel", "Hủy")}</ButtonCommon>
            </div>
          </div>
        </div>
      )}
      {user && (
        <div className={cx("profile-card", "card1")}>
          <div className={cx("header")}>
            <div className={cx("title")}>{t("setting.general.account_info.title", "Thông tin tài khoản")}</div>
          </div>
          <p>
            <strong>{t("setting.general.account_info.email", "Email")}:</strong> {user.email}
          </p>
          <p>
            <strong>{t("setting.general.account_info.memberSince", "Ngày đăng kí")}:</strong> {user.registeredDate}
          </p>
          <p className="flex gap-3 items-center">
            <strong>{t("setting.general.account_info.password", "Mật khẩu")}:</strong> *******
            <EditButton size="sm" onClick={() => setShowAccountForm(true)}>{t("setting.general.account_info.changePassword","Đổi mật khẩu")}</EditButton>
          </p>
        </div>
      )}
    </div>
  );
}
