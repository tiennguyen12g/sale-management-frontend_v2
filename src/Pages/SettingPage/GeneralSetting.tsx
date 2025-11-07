import React, { useState } from "react";
import classNames from "classnames/bind";
import styles from "./GeneralSetting.module.scss";
const cx = classNames.bind(styles);

import { ChangePassword_API } from "../../configs/api";
import { useAuthStore } from "../../zustand/authStore";
export default function GeneralSetting() {
  const { user, getAuthHeader, yourStaffId } = useAuthStore();
  const [isOpenForm, setIsOpenForm] = useState(false);
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
      {/* <div className={cx("header-logout")}>
        <div>
          <h4 style={{ color: "#005fec" }}>Hồ sơ cá nhân</h4>
        </div>
      </div> */}

      {showAccountForm && user && (
        <div className={cx("wrap-change-pass")}>
          <div className={cx("form-container")}>
            <h5>Đổi mật khẩu</h5>
            <div style={{ color: "red" }}>{error}</div>
            <input type="password" placeholder="Mật khẩu cũ" value={oldPassword} onChange={(e) => setOldPassword(e.target.value)} />
            <input type="password" placeholder="Mật khẩu mới" value={newPassword} onChange={(e) => setNewPassword(e.target.value)} />
            <input type="password" placeholder="Nhập lại mật khẩu mới" value={repeatPass} onChange={(e) => setRepeatPass(e.target.value)} />
            <div className={cx("btn-actions")}>
              <button className={cx("save")} onClick={() => handleChangePass()}>
                Lưu
              </button>
              <button className={cx("cancel")} onClick={() => setShowAccountForm(false)}>
                Hủy
              </button>
            </div>
          </div>
        </div>
      )}
      {user && (
        <div className={cx("profile-card", "card1")}>
          <div className={cx("header")}>
            <div className={cx("title")}>Thông tin tài khoản</div>
          </div>
          <p>
            <strong>Email:</strong> {user.email}
          </p>
          <p>
            <strong>Ngày đăng kí:</strong> {user.registeredDate}
          </p>
          <p style={{display: "flex", alignItems: "center"}}>
            <strong>Mật khẩu:</strong> *******
            <button
              className={cx("btn-edit")}
              onClick={() => {
                // open small modal/form for changing password or role
                setShowAccountForm(true);
              }}
            >
              ✏️ Đổi mật khẩu
            </button>
          </p>
        </div>
      )}
    </div>
  );
}
